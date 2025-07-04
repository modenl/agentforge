// Framework MCP: MCP Manager
// Centralized manager for all MCP functionality

const MCPClient = require('./mcp-client');
const MCPExecutor = require('./mcp-executor');
const { EventEmitter } = require('events');

/**
 * MCP Manager - Central coordinator for all MCP functionality
 * Manages MCP servers, clients, and integrates with the framework
 */
class MCPManager extends EventEmitter {
  constructor(logger) {
    super();
    this.logger = logger;
    this.mcpExecutor = null;
    this.connectedServers = new Map();
    this.serverConfigs = new Map();
    this.initialized = false;
  }

  /**
   * Initialize the MCP Manager
   */
  async initialize(supabaseClient = null) {
    try {
      this.logger.info('Initializing MCP Manager...');
      
      // Initialize MCP Executor
      this.mcpExecutor = new MCPExecutor(supabaseClient, this.logger);
      
      // Set circular reference for lazy loading
      this.mcpExecutor.setMCPManager(this);
      
      // Register built-in MCP tools
      this.registerBuiltinTools();
      
      this.initialized = true;
      this.logger.info('MCP Manager initialized successfully');
      
      this.emit('initialized');
      return true;
      
    } catch (error) {
      this.logger.error('Failed to initialize MCP Manager:', error);
      throw error;
    }
  }

  /**
   * Register built-in MCP tools
   */
  registerBuiltinTools() {
    try {
      const serverControlTools = require('./builtin-tools/server-control');
      
      for (const [toolName, toolDef] of Object.entries(serverControlTools)) {
        if (toolDef && toolDef.handler) {
          // Create a handler that passes the MCP Manager context
          const contextualHandler = async (params, role) => {
            const context = {
              mcpManager: this,
              logger: this.logger
            };
            return await toolDef.handler(params, context);
          };
          
          // Register the tool with MCPExecutor
          this.mcpExecutor.registerAction(toolName, contextualHandler, 'builtin');
          this.logger.info(`Registered built-in MCP tool: ${toolName}`);
        }
      }
      
      this.logger.info('Built-in MCP tools registered successfully');
    } catch (error) {
      this.logger.warn('Failed to register built-in MCP tools:', error);
    }
  }

  /**
   * Register MCP server configurations from apps
   * @param {string} appId - Application identifier
   * @param {Array} serverConfigs - Array of MCP server configurations
   */
  registerServerConfigs(appId, serverConfigs) {
    if (typeof serverConfigs !== 'object' || serverConfigs === null) {
      this.logger.warn(`Invalid MCP server configs for app ${appId}: not an object`);
      return;
    }

    const configs = Array.isArray(serverConfigs) ? serverConfigs : Object.entries(serverConfigs).map(([name, config]) => ({ name, ...config }));

    this.logger.info(`Registering ${configs.length} MCP server configs for app: ${appId}`);
    
    for (const config of configs) {
      if (!config.name) {
        this.logger.warn(`Skipping MCP server config without name for app ${appId}`);
        continue;
      }

      // Add app context to server config
      const enhancedConfig = {
        ...config,
        appId,
        registeredAt: new Date().toISOString()
      };

      this.serverConfigs.set(config.name, enhancedConfig);
      this.logger.debug(`Registered MCP server config: ${config.name} (app: ${appId})`);
    }
  }

  /**
   * Connect to all registered MCP servers
   */
  async connectAllServers() {
    if (!this.initialized) {
      throw new Error('MCP Manager not initialized');
    }

    if (this.serverConfigs.size === 0) {
      this.logger.info('No MCP servers configured');
      return;
    }

    this.logger.info(`Connecting to ${this.serverConfigs.size} registered MCP servers...`);
    
    const connectionPromises = Array.from(this.serverConfigs.values()).map(
      serverConfig => this.connectServer(serverConfig)
    );

    const results = await Promise.allSettled(connectionPromises);
    
    let successCount = 0;
    let failureCount = 0;

    for (const result of results) {
      if (result.status === 'fulfilled' && result.value.success) {
        successCount++;
      } else {
        failureCount++;
        if (result.status === 'rejected') {
          this.logger.error('MCP server connection promise rejected:', result.reason);
        }
      }
    }

    this.logger.info(`MCP server connections completed: ${successCount} successful, ${failureCount} failed`);
    
    // Emit connection summary
    this.emit('servers-connected', {
      total: this.serverConfigs.size,
      successful: successCount,
      failed: failureCount,
      connectedServers: this.getConnectedServersSummary()
    });

    return { successCount, failureCount };
  }

  /**
   * Connect to a single MCP server
   */
  async connectServer(serverConfig) {
    try {
      this.logger.info(`Connecting to MCP server: ${serverConfig.name} (app: ${serverConfig.appId})`);
      console.log('🔌 [MCPManager.connectServer] Starting connection to:', serverConfig.name);
      
      const client = await this.mcpExecutor.connectMCPServer(serverConfig);
      console.log('✅ [MCPManager.connectServer] Client connected, storing in connectedServers');
      
      this.connectedServers.set(serverConfig.name, {
        client,
        config: serverConfig,
        connectedAt: new Date().toISOString()
      });

      this.logger.info(`Successfully connected to MCP server: ${serverConfig.name}`);
      
      this.emit('server-connected', {
        serverName: serverConfig.name,
        appId: serverConfig.appId,
        serverInfo: client.getServerInfo()
      });

      // Check if server supports webview after connection
      console.log('🔍 [MCPManager.connectServer] Checking webview support for:', serverConfig.name);
      if (client.supportsWebviewEmbedding()) {
        console.log('✅ [MCPManager.connectServer] Server supports webview!');
        const webviewConfig = client.getWebviewConfig();
        
        // Try to get embeddable URL
        if (webviewConfig && webviewConfig.requiresUrlCall) {
          try {
            console.log('📞 [MCPManager.connectServer] Getting embeddable URL...');
            const urlResult = await client.getEmbeddableUrl({
              mode: 'full',
              allow_moves: true,
              show_controls: true,
              preferredMode: 'compact' // Request compact mode by default
            });
            
            if (urlResult && urlResult.url) {
              webviewConfig.url = urlResult.url;
              webviewConfig.title = urlResult.title || serverConfig.name;
              console.log('🎯 [MCPManager.connectServer] Got embeddable URL:', urlResult.url);
              
              // Emit webview available event
              this.emit('server-webview-available', {
                serverName: serverConfig.name,
                config: webviewConfig
              });
            }
          } catch (error) {
            console.error('❌ [MCPManager.connectServer] Failed to get embeddable URL:', error.message);
          }
        }
      }

      return { success: true, serverName: serverConfig.name };
      
    } catch (error) {
      this.logger.error(`Failed to connect to MCP server ${serverConfig.name}:`, error);
      
      this.emit('server-connection-failed', {
        serverName: serverConfig.name,
        appId: serverConfig.appId,
        error: error.message
      });

      return { success: false, serverName: serverConfig.name, error: error.message };
    }
  }

  /**
   * Start a specific MCP server by name
   * Used by state machine to dynamically control servers
   */
  async startServer(serverName) {
    console.log('🚀 [MCPManager.startServer] Called with:', serverName);
    try {
      let result = { success: true, serverName };
      
      // Check if server is already connected
      if (this.connectedServers.has(serverName)) {
        this.logger.info(`MCP server ${serverName} is already connected`);
        console.log('⚠️ [MCPManager.startServer] Server already connected');
        result.alreadyConnected = true;
      } else {
        // Get server config
        const serverConfig = this.serverConfigs.get(serverName);
        if (!serverConfig) {
          throw new Error(`No configuration found for server: ${serverName}`);
        }

        console.log('📋 [MCPManager.startServer] Connecting to server with config:', serverConfig);
        // Connect to the server
        result = await this.connectServer(serverConfig);
      }
      
      // Always check webview capability for start_mcp_server calls
      // This ensures we get the webview URL even if server was already connected
      if (result.success) {
        const serverData = this.connectedServers.get(serverName);
        if (serverData) {
          const supportsWebview = serverData.client.supportsWebviewEmbedding();
          
          if (supportsWebview) {
            const webviewConfig = serverData.client.getWebviewConfig();
            
            // Check if we need to get the embeddable URL
            if (webviewConfig && webviewConfig.requiresUrlCall) {
              try {
                // Call get_embeddable_url to get the actual URL
                const urlResult = await serverData.client.getEmbeddableUrl({
                  mode: 'full',
                  allow_moves: true,
                  show_controls: true
                });
                
                if (urlResult && urlResult.url) {
                  // Add the URL to the webview config
                  webviewConfig.url = urlResult.url;
                  webviewConfig.title = urlResult.title || serverName;
                  
                  this.logger.info(`Successfully got embeddable URL for ${serverName}: ${urlResult.url}`);
                } else {
                  this.logger.warn(`get_embeddable_url returned no URL for ${serverName}`);
                }
              } catch (error) {
                this.logger.error(`Failed to get embeddable URL for ${serverName}:`, error.message);
                // Continue without URL - let the handler decide what to do
              }
            }
            
            result.webviewConfig = webviewConfig;
            
            console.log('🎯 [MCPManager] Emitting server-webview-available event');
            console.log('   serverName:', serverName);
            console.log('   webviewConfig:', JSON.stringify(webviewConfig, null, 2));
            
            this.emit('server-webview-available', {
              serverName,
              config: webviewConfig
            });
          }
        } else {
          this.logger.warn(`Server data not found for ${serverName} when checking webview support`);
        }
      } else {
        this.logger.error(`Failed to start server ${serverName}: ${result.error}`);
      }
      
      return result;
    } catch (error) {
      this.logger.error(`Failed to start MCP server ${serverName}:`, error);
      return { success: false, serverName, error: error.message };
    }
  }

  /**
   * Stop a specific MCP server by name
   * Used by state machine to dynamically control servers
   */
  async stopServer(serverName) {
    try {
      const result = await this.disconnectServer(serverName);
      
      this.emit('server-stopped', {
        serverName,
        stoppedAt: new Date().toISOString()
      });
      
      return result;
    } catch (error) {
      this.logger.error(`Failed to stop MCP server ${serverName}:`, error);
      return { success: false, serverName, error: error.message };
    }
  }

  /**
   * Disconnect from a specific MCP server
   */
  async disconnectServer(serverName) {
    const serverData = this.connectedServers.get(serverName);
    if (!serverData) {
      this.logger.warn(`MCP server not connected: ${serverName}`);
      return false;
    }

    try {
      await this.mcpExecutor.disconnectMCPServer(serverName);
      this.connectedServers.delete(serverName);
      
      this.logger.info(`Disconnected from MCP server: ${serverName}`);
      this.emit('server-disconnected', { serverName });
      
      return true;
    } catch (error) {
      this.logger.error(`Failed to disconnect from MCP server ${serverName}:`, error);
      return false;
    }
  }

  /**
   * Disconnect from all MCP servers
   */
  async disconnectAllServers() {
    const serverNames = Array.from(this.connectedServers.keys());
    
    if (serverNames.length === 0) {
      this.logger.info('No MCP servers to disconnect');
      return;
    }

    this.logger.info(`Disconnecting from ${serverNames.length} MCP servers...`);
    
    const disconnectionPromises = serverNames.map(name => this.disconnectServer(name));
    await Promise.allSettled(disconnectionPromises);
    
    this.logger.info('All MCP servers disconnected');
  }

  /**
   * Get MCP tools formatted for prompt injection
   */
  getMCPToolsForPrompt() {
    if (!this.mcpExecutor) {
      return [];
    }
    return this.mcpExecutor.getMCPToolsForPrompt();
  }

  /**
   * Generate MCP tools section for prompt injection
   */
  generateMCPToolsPromptSection() {
    if (!this.mcpExecutor) {
      return '';
    }
    return this.mcpExecutor.generateMCPToolsPromptSection();
  }

  /**
   * Execute an MCP tool
   */
  async executeMCPTool(toolName, params = {}, role = 'Agent') {
    if (!this.mcpExecutor) {
      throw new Error('MCP Manager not initialized');
    }
    return await this.mcpExecutor.execute(toolName, params, role);
  }

  /**
   * Register a custom MCP tool
   */
  registerMCPTool(toolName, handler, pluginId = 'framework') {
    if (!this.mcpExecutor) {
      throw new Error('MCP Manager not initialized');
    }
    return this.mcpExecutor.register(toolName, handler, pluginId);
  }

  /**
   * Get servers that support iframe embedding
   */
  getIframeCapableServers() {
    const iframeServers = [];
    
    for (const [serverName, serverData] of this.connectedServers) {
      const client = serverData.client;
      if (client.supportsIframeEmbedding()) {
        const iframeConfig = client.getIframeConfig();
        iframeServers.push({
          name: serverName,
          appId: serverData.config.appId,
          config: iframeConfig,
          serverInfo: client.getServerInfo()
        });
      }
    }
    
    return webviewServers;
  }

  /**
   * Get webview configuration for a specific server
   */
  getServerWebviewConfig(serverName) {
    const serverData = this.connectedServers.get(serverName);
    if (!serverData) {
      return null;
    }
    
    return serverData.client.getWebviewConfig();
  }

  /**
   * Get summary of connected servers
   */
  getConnectedServersSummary() {
    const summary = [];
    
    for (const [serverName, serverData] of this.connectedServers) {
      const serverInfo = serverData.client.getServerInfo();
      summary.push({
        name: serverName,
        appId: serverData.config.appId,
        connectedAt: serverData.connectedAt,
        tools: serverInfo.tools.length,
        resources: serverInfo.resources.length,
        prompts: serverInfo.prompts.length,
        webviewSupported: serverInfo.webviewSupported,
        serverInfo: {
          name: serverInfo.serverInfo?.name,
          version: serverInfo.serverInfo?.version
        }
      });
    }
    
    return summary;
  }

  /**
   * Get detailed information about all connected servers
   */
  getConnectedServersInfo() {
    if (!this.mcpExecutor) {
      return [];
    }
    return this.mcpExecutor.getConnectedMCPServers();
  }

  /**
   * Get registered server configurations
   */
  getRegisteredServerConfigs() {
    return Array.from(this.serverConfigs.values());
  }

  /**
   * Check if MCP Manager is ready
   */
  isReady() {
    return this.initialized && this.mcpExecutor !== null;
  }

  /**
   * Get statistics
   */
  getStatistics() {
    return {
      initialized: this.initialized,
      registeredServers: this.serverConfigs.size,
      connectedServers: this.connectedServers.size,
      totalTools: this.getMCPToolsForPrompt().length,
      serverDetails: this.getConnectedServersSummary()
    };
  }

  /**
   * Cleanup resources
   */
  async cleanup() {
    this.logger.info('Cleaning up MCP Manager...');
    
    // Disconnect all servers
    await this.disconnectAllServers();
    
    // Cleanup executor
    if (this.mcpExecutor) {
      await this.mcpExecutor.cleanup();
      this.mcpExecutor = null;
    }
    
    // Clear state
    this.connectedServers.clear();
    this.serverConfigs.clear();
    this.initialized = false;
    
    // Remove all listeners
    this.removeAllListeners();
    
    this.logger.info('MCP Manager cleanup completed');
  }
}

module.exports = MCPManager; 