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
   * Register MCP server configurations from apps
   * @param {string} appId - Application identifier
   * @param {Array} serverConfigs - Array of MCP server configurations
   */
  registerServerConfigs(appId, serverConfigs) {
    if (!Array.isArray(serverConfigs)) {
      this.logger.warn(`Invalid MCP server configs for app ${appId}: not an array`);
      return;
    }

    this.logger.info(`Registering ${serverConfigs.length} MCP server configs for app: ${appId}`);
    
    for (const config of serverConfigs) {
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
      
      const client = await this.mcpExecutor.connectMCPServer(serverConfig);
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
   * Execute an MCP action
   */
  async executeMCPAction(actionName, params = {}, role = 'Agent') {
    if (!this.mcpExecutor) {
      throw new Error('MCP Manager not initialized');
    }
    return await this.mcpExecutor.execute(actionName, params, role);
  }

  /**
   * Register a custom MCP action
   */
  registerMCPAction(actionName, handler, pluginId = 'framework') {
    if (!this.mcpExecutor) {
      throw new Error('MCP Manager not initialized');
    }
    return this.mcpExecutor.registerAction(actionName, handler, pluginId);
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