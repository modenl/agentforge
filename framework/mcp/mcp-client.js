// Framework Core: MCP Client
// Standard MCP client implementation following MCP specification 2025-03-26

const { EventEmitter } = require('events');
const { spawn } = require('child_process');

/**
 * MCP Client implementing Model Context Protocol specification 2025-03-26
 * Manages connection to external MCP servers and capability discovery
 */
class MCPClient extends EventEmitter {
  constructor(serverConfig, logger) {
    super();
    this.serverConfig = serverConfig;
    this.logger = logger;
    this.serverProcess = null;
    this.connected = false;
    this.initialized = false;
    
    // Server capabilities discovered during initialization
    this.serverCapabilities = null;
    this.serverInfo = null;
    
    // Discovered features
    this.tools = new Map();
    this.resources = new Map();
    this.prompts = new Map();
    
    // JSON-RPC communication
    this.messageId = 0;
    this.pendingRequests = new Map();
    
    // Protocol version
    this.protocolVersion = '2025-03-26';
  }

  /**
   * Connect to MCP server and perform full initialization sequence
   */
  async connect() {
    try {
      this.logger.info(`Connecting to MCP server: ${this.serverConfig.name}`);
      
      // 1. Start the MCP server process
      await this.startServerProcess();
      
      // 2. Perform MCP initialization handshake
      await this.performInitialization();
      
      // 3. Send initialized notification
      await this.sendInitializedNotification();
      
      // 4. Discover server capabilities
      await this.discoverCapabilities();
      
      this.connected = true;
      this.initialized = true;
      
      this.logger.info(`Successfully connected to MCP server: ${this.serverConfig.name}`);
      this.logger.info(`Discovered: ${this.tools.size} tools, ${this.resources.size} resources, ${this.prompts.size} prompts`);
      
      this.emit('connected', {
        serverName: this.serverConfig.name,
        capabilities: this.serverCapabilities,
        tools: Array.from(this.tools.keys()),
        resources: Array.from(this.resources.keys()),
        prompts: Array.from(this.prompts.keys())
      });
      
    } catch (error) {
      this.logger.error(`Failed to connect to MCP server ${this.serverConfig.name}:`, error);
      throw error;
    }
  }

  /**
   * Start the MCP server process
   */
  async startServerProcess() {
    return new Promise((resolve, reject) => {
      const { command, args = [], env = {} } = this.serverConfig;
      
      this.logger.debug(`Starting MCP server: ${command} ${args.join(' ')}`);
      
      this.serverProcess = spawn(command, args, {
        stdio: ['pipe', 'pipe', 'pipe'],
        env: { ...process.env, ...env }
      });

      this.serverProcess.on('error', (error) => {
        this.logger.error(`MCP server process error:`, error);
        reject(error);
      });

      this.serverProcess.on('exit', (code, signal) => {
        this.logger.warn(`MCP server process exited with code ${code}, signal ${signal}`);
        this.connected = false;
        this.initialized = false;
        this.emit('disconnected', { code, signal });
      });

      // Set up JSON-RPC communication
      this.setupJSONRPCCommunication();
      
      // Wait for process to start
      setTimeout(() => {
        if (this.serverProcess && !this.serverProcess.killed) {
          resolve();
        } else {
          reject(new Error('Failed to start MCP server process'));
        }
      }, 1000);
    });
  }

  /**
   * Set up JSON-RPC communication over stdio
   */
  setupJSONRPCCommunication() {
    let buffer = '';
    
    this.serverProcess.stdout.on('data', (data) => {
      buffer += data.toString();
      
      // Process complete JSON-RPC messages
      let lines = buffer.split('\n');
      buffer = lines.pop(); // Keep incomplete line in buffer
      
      for (const line of lines) {
        if (line.trim()) {
          try {
            const trimmedLine = line.trim();
            // Skip non-JSON lines (like status messages)
            if (!trimmedLine.startsWith('{') && !trimmedLine.startsWith('[')) {
              this.logger.debug(`MCP server stdout (non-JSON): ${trimmedLine}`);
              continue;
            }
            const message = JSON.parse(trimmedLine);
            this.handleMessage(message);
          } catch (error) {
            this.logger.error('Failed to parse JSON-RPC message:', error.message);
            this.logger.debug('Invalid line:', line.substring(0, 100) + (line.length > 100 ? '...' : ''));
          }
        }
      }
    });

    this.serverProcess.stderr.on('data', (data) => {
      this.logger.debug(`MCP server stderr: ${data.toString().trim()}`);
    });
  }

  /**
   * Handle incoming JSON-RPC messages
   */
  handleMessage(message) {
    this.logger.debug('Received MCP message:', message);

    if (message.id && this.pendingRequests.has(message.id)) {
      // Response to our request
      const { resolve, reject } = this.pendingRequests.get(message.id);
      this.pendingRequests.delete(message.id);

      if (message.error) {
        reject(new Error(message.error.message || 'MCP request failed'));
      } else {
        resolve(message.result);
      }
    } else if (message.method) {
      // Server-initiated message
      this.handleServerMessage(message);
    }
  }

  /**
   * Handle server-initiated messages
   */
  handleServerMessage(message) {
    switch (message.method) {
      case 'notifications/message':
        this.logger.info(`Server message: ${message.params?.text || 'No message'}`);
        break;
      case 'notifications/resources/list_changed':
        this.logger.debug('Server resources list changed');
        // Could trigger re-discovery
        break;
      case 'notifications/tools/list_changed':
        this.logger.debug('Server tools list changed');
        // Could trigger re-discovery
        break;
      case 'notifications/prompts/list_changed':
        this.logger.debug('Server prompts list changed');
        // Could trigger re-discovery
        break;
      default:
        this.logger.debug(`Unhandled server message: ${message.method}`);
    }
  }

  /**
   * Send JSON-RPC request to server
   */
  async sendRequest(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = ++this.messageId;
      const request = {
        jsonrpc: '2.0',
        id,
        method,
        params
      };

      this.pendingRequests.set(id, { resolve, reject });
      
      // Set timeout for request
      setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id);
          reject(new Error(`MCP request timeout: ${method}`));
        }
      }, 30000);

      const requestStr = JSON.stringify(request) + '\n';
      this.logger.debug('Sending MCP request:', request);
      
      if (this.serverProcess && this.serverProcess.stdin.writable) {
        this.serverProcess.stdin.write(requestStr);
      } else {
        reject(new Error('MCP server process not available'));
      }
    });
  }

  /**
   * Send JSON-RPC notification to server
   */
  sendNotification(method, params = {}) {
    const notification = {
      jsonrpc: '2.0',
      method,
      params
    };

    const notificationStr = JSON.stringify(notification) + '\n';
    this.logger.debug('Sending MCP notification:', notification);
    
    if (this.serverProcess && this.serverProcess.stdin.writable) {
      this.serverProcess.stdin.write(notificationStr);
    }
  }

  /**
   * Perform MCP initialization handshake according to protocol
   */
  async performInitialization() {
    this.logger.debug('Performing MCP initialization...');
    
    // Send initialize request with client capabilities
    const initResult = await this.sendRequest('initialize', {
      protocolVersion: this.protocolVersion,
      capabilities: {
        // Client capabilities (what we support)
        sampling: {} // We support LLM sampling if needed
      },
      clientInfo: {
        name: 'AgentForge Framework',
        version: '1.0.0'
      }
    });

    // CRITICAL DEBUG: Log the complete initialization result
    this.logger.info(`[INIT_DEBUG] ========== MCP SERVER ${this.serverConfig.name} INITIALIZE RESPONSE ==========`);
    this.logger.info(`[INIT_DEBUG] Full initResult:`, JSON.stringify(initResult, null, 2));
    this.logger.info(`[INIT_DEBUG] initResult type: ${typeof initResult}`);
    this.logger.info(`[INIT_DEBUG] initResult keys: ${Object.keys(initResult || {}).join(', ')}`);
    
    // Log each top-level field
    if (initResult) {
      for (const [key, value] of Object.entries(initResult)) {
        this.logger.info(`[INIT_DEBUG] initResult.${key}:`, JSON.stringify(value, null, 2));
      }
    }
    
    // Store server capabilities and info
    this.serverCapabilities = initResult.capabilities || {};
    this.serverInfo = initResult.serverInfo || {};
    
    // CRITICAL DEBUG: Log the stored capabilities
    this.logger.info(`[INIT_DEBUG] ========== STORED CAPABILITIES ==========`);
    this.logger.info(`[INIT_DEBUG] Stored serverCapabilities:`, JSON.stringify(this.serverCapabilities, null, 2));
    this.logger.info(`[INIT_DEBUG] serverCapabilities type: ${typeof this.serverCapabilities}`);
    this.logger.info(`[INIT_DEBUG] serverCapabilities keys: ${Object.keys(this.serverCapabilities).join(', ')}`);
    
    // Check if capabilities might be at wrong level
    if (initResult.experimental) {
      this.logger.warn(`[INIT_DEBUG] WARNING: Found 'experimental' at root level of initResult!`);
      this.logger.info(`[INIT_DEBUG] Root level experimental:`, JSON.stringify(initResult.experimental, null, 2));
    }
    
    // Log iframe capabilities if present
    if (this.serverCapabilities?.experimental?.embedding) {
      this.logger.info(`[IFRAME_DEBUG] MCP server ${this.serverConfig.name} has embedding capabilities:`, 
        JSON.stringify(this.serverCapabilities.experimental.embedding, null, 2));
    } else {
      this.logger.info(`[IFRAME_DEBUG] MCP server ${this.serverConfig.name} does NOT have embedding capabilities`);
      this.logger.info(`[IFRAME_DEBUG] serverCapabilities.experimental = ${JSON.stringify(this.serverCapabilities.experimental)}`);
    }
    
    // Validate protocol version
    if (initResult.protocolVersion !== this.protocolVersion) {
      this.logger.warn(`Protocol version mismatch: client=${this.protocolVersion}, server=${initResult.protocolVersion}`);
    }
    
    this.logger.debug('MCP initialization completed');
    return initResult;
  }

  /**
   * Send initialized notification
   */
  async sendInitializedNotification() {
    this.logger.debug('Sending initialized notification...');
    this.sendNotification('notifications/initialized');
  }

  /**
   * Discover server capabilities (tools, resources, prompts)
   */
  async discoverCapabilities() {
    this.logger.debug('Discovering MCP server capabilities...');
    
    try {
      // Discover tools if server supports them
      if (this.serverCapabilities.tools) {
        await this.discoverTools();
      }

      // Discover resources if server supports them
      if (this.serverCapabilities.resources) {
        await this.discoverResources();
      }

      // Discover prompts if server supports them
      if (this.serverCapabilities.prompts) {
        await this.discoverPrompts();
      }

      // Check for experimental capabilities
      this.logger.info(`[CAPABILITY_DISCOVERY] ========== CHECKING EXPERIMENTAL CAPABILITIES ==========`);
      this.logger.info(`[CAPABILITY_DISCOVERY] Full serverCapabilities:`, JSON.stringify(this.serverCapabilities, null, 2));
      
      if (this.serverCapabilities.experimental) {
        this.logger.info('[CAPABILITY_DISCOVERY] Server has experimental capabilities:', JSON.stringify(this.serverCapabilities.experimental, null, 2));
        
        // Check for iframe support
        if (this.serverCapabilities.experimental.embedding) {
          this.logger.info('[CAPABILITY_DISCOVERY] Server supports embedding:', JSON.stringify(this.serverCapabilities.experimental.embedding, null, 2));
          
          // Check if iframe feature is supported
          if (this.serverCapabilities.experimental.embedding.features?.includes('iframe')) {
            this.logger.info('[CAPABILITY_DISCOVERY] ✓ Server supports iframe embedding');
          } else {
            this.logger.info('[CAPABILITY_DISCOVERY] ✗ Server does NOT support iframe embedding');
            this.logger.info('[CAPABILITY_DISCOVERY] Available features:', JSON.stringify(this.serverCapabilities.experimental.embedding.features || []));
          }
        } else {
          this.logger.info('[CAPABILITY_DISCOVERY] ✗ No embedding capability found in experimental');
        }
      } else {
        this.logger.info('[CAPABILITY_DISCOVERY] ✗ No experimental capabilities found');
        this.logger.info('[CAPABILITY_DISCOVERY] Available capability keys:', Object.keys(this.serverCapabilities).join(', '));
      }

      this.logger.info(`Capability discovery completed: ${this.tools.size} tools, ${this.resources.size} resources, ${this.prompts.size} prompts`);
      
    } catch (error) {
      this.logger.error('Failed to discover capabilities:', error);
      throw error;
    }
  }

  /**
   * Discover available tools
   */
  async discoverTools() {
    try {
      const toolsResult = await this.sendRequest('tools/list');
      if (toolsResult && toolsResult.tools) {
        for (const tool of toolsResult.tools) {
          this.tools.set(tool.name, tool);
          this.logger.debug(`Discovered MCP tool: ${tool.name}`);
        }
      }
    } catch (error) {
      this.logger.warn('Failed to discover tools:', error.message);
    }
  }

  /**
   * Discover available resources
   */
  async discoverResources() {
    try {
      const resourcesResult = await this.sendRequest('resources/list');
      if (resourcesResult && resourcesResult.resources) {
        for (const resource of resourcesResult.resources) {
          this.resources.set(resource.uri, resource);
          this.logger.debug(`Discovered MCP resource: ${resource.uri}`);
        }
      }
    } catch (error) {
      this.logger.warn('Failed to discover resources:', error.message);
    }
  }

  /**
   * Discover available prompts
   */
  async discoverPrompts() {
    try {
      const promptsResult = await this.sendRequest('prompts/list');
      if (promptsResult && promptsResult.prompts) {
        for (const prompt of promptsResult.prompts) {
          this.prompts.set(prompt.name, prompt);
          this.logger.debug(`Discovered MCP prompt: ${prompt.name}`);
        }
      }
    } catch (error) {
      this.logger.warn('Failed to discover prompts:', error.message);
    }
  }

  /**
   * Call a tool on the MCP server
   */
  async callTool(toolName, toolArguments = {}) {
    if (!this.tools.has(toolName)) {
      throw new Error(`Tool not found: ${toolName}`);
    }

    this.logger.debug(`Calling MCP tool: ${toolName}`, toolArguments);
    
    try {
      const result = await this.sendRequest('tools/call', {
        name: toolName,
        arguments: toolArguments
      });
      
      this.logger.debug(`MCP tool ${toolName} result:`, result);
      return result;
      
    } catch (error) {
      this.logger.error(`MCP tool call failed: ${toolName}`, error);
      throw error;
    }
  }

  /**
   * Read a resource from the MCP server
   */
  async readResource(resourceUri) {
    if (!this.resources.has(resourceUri)) {
      throw new Error(`Resource not found: ${resourceUri}`);
    }

    this.logger.debug(`Reading MCP resource: ${resourceUri}`);
    
    try {
      const result = await this.sendRequest('resources/read', {
        uri: resourceUri
      });
      
      this.logger.debug(`MCP resource ${resourceUri} result:`, result);
      return result;
      
    } catch (error) {
      this.logger.error(`MCP resource read failed: ${resourceUri}`, error);
      throw error;
    }
  }

  /**
   * Get a prompt from the MCP server
   */
  async getPrompt(promptName, promptArguments = {}) {
    if (!this.prompts.has(promptName)) {
      throw new Error(`Prompt not found: ${promptName}`);
    }

    this.logger.debug(`Getting MCP prompt: ${promptName}`, promptArguments);
    
    try {
      const result = await this.sendRequest('prompts/get', {
        name: promptName,
        arguments: promptArguments
      });
      
      this.logger.debug(`MCP prompt ${promptName} result:`, result);
      return result;
      
    } catch (error) {
      this.logger.error(`MCP prompt get failed: ${promptName}`, error);
      throw error;
    }
  }

  /**
   * Get tools formatted for LLM function calling
   * Returns tools in a format suitable for injection into prompts
   */
  getToolsForLLM() {
    const toolsArray = [];
    
    for (const [toolName, toolDef] of this.tools) {
      toolsArray.push({
        name: toolName,
        description: toolDef.description || `MCP tool: ${toolName}`,
        inputSchema: toolDef.inputSchema || {
          type: 'object',
          properties: {},
          additionalProperties: true
        }
      });
    }
    
    return toolsArray;
  }

  /**
   * Check if server supports iframe embedding
   */
  supportsIframeEmbedding() {
    // DEBUG: Log the check process
    this.logger.debug(`[IFRAME_CHECK] Checking iframe support for ${this.serverConfig.name}`);
    this.logger.debug(`[IFRAME_CHECK] serverCapabilities:`, JSON.stringify(this.serverCapabilities, null, 2));
    
    const hasExperimental = !!this.serverCapabilities?.experimental;
    const hasEmbedding = !!this.serverCapabilities?.experimental?.embedding;
    const hasFeatures = !!this.serverCapabilities?.experimental?.embedding?.features;
    const features = this.serverCapabilities?.experimental?.embedding?.features || [];
    const hasIframe = features.includes('iframe');
    
    this.logger.info(`[IFRAME_CHECK] ${this.serverConfig.name} - hasExperimental: ${hasExperimental}, hasEmbedding: ${hasEmbedding}, hasFeatures: ${hasFeatures}, features: ${JSON.stringify(features)}, hasIframe: ${hasIframe}`);
    
    return hasIframe;
  }

  /**
   * Get iframe configuration if supported
   */
  getIframeConfig() {
    if (!this.supportsIframeEmbedding()) {
      return null;
    }
    
    return {
      supported: true,
      features: this.serverCapabilities.experimental.embedding.features,
      version: this.serverCapabilities.experimental.embedding.version || '1.0.0',
      postMessageSupported: this.serverCapabilities.experimental.embedding.features?.includes('postMessage') || false,
      // Note: actual URL must be obtained by calling get_embeddable_url tool
      requiresUrlCall: true
    };
  }

  /**
   * Get embeddable URL from the server
   * This calls the get_embeddable_url tool on the MCP server
   */
  async getEmbeddableUrl(params = {}) {
    if (!this.supportsIframeEmbedding()) {
      throw new Error('Server does not support iframe embedding');
    }
    
    // Check if server has get_embeddable_url tool
    if (!this.tools.has('get_embeddable_url')) {
      throw new Error('Server does not have get_embeddable_url tool');
    }
    
    try {
      const result = await this.callTool('get_embeddable_url', params);
      
      // Extract URL and other data from MCP response format
      let extractedData = {};
      
      if (result && result.content && Array.isArray(result.content)) {
        // MCP returns content as an array of {type, text} objects
        const textContent = result.content.find(item => item.type === 'text');
        if (textContent && textContent.text) {
          // Extract URL from the text content
          const urlMatch = textContent.text.match(/Embed URL:\s*\n(.+?)(?:\n|$)/);
          if (urlMatch) {
            extractedData.url = urlMatch[1].trim();
          }
          
          // Extract title if present
          const titleMatch = textContent.text.match(/Game ID:\s*(.+?)(?:\n|$)/);
          if (titleMatch) {
            extractedData.title = `Chess Game: ${titleMatch[1].trim()}`;
          }
        }
        
        // Check if there's structured data in the response
        if (result.data) {
          extractedData = { ...extractedData, ...result.data };
        }
      } else if (result) {
        // Fallback: if result already has url/title at top level
        if (result.url) extractedData.url = result.url;
        if (result.title) extractedData.title = result.title;
      }
      
      if (!extractedData.url) {
        this.logger.warn('Failed to extract URL from get_embeddable_url response');
      }
      
      this.logger.info('getEmbeddableUrl result:', JSON.stringify(extractedData, null, 2));
      return extractedData;
    } catch (error) {
      this.logger.error('Failed to get embeddable URL:', error.message);
      throw error;
    }
  }

  /**
   * Get server information
   */
  getServerInfo() {
    // DEBUG: Log full capabilities when getting server info
    this.logger.debug(`[SERVER_INFO_DEBUG] Getting server info for ${this.serverConfig.name}`);
    this.logger.debug(`[SERVER_INFO_DEBUG] Full capabilities:`, JSON.stringify(this.serverCapabilities, null, 2));
    
    return {
      name: this.serverConfig.name,
      connected: this.connected,
      initialized: this.initialized,
      serverInfo: this.serverInfo,
      capabilities: this.serverCapabilities,
      iframeSupported: this.supportsIframeEmbedding(),
      tools: Array.from(this.tools.entries()).map(([name, def]) => ({
        name,
        description: def.description,
        inputSchema: def.inputSchema
      })),
      resources: Array.from(this.resources.entries()).map(([uri, def]) => ({
        uri,
        name: def.name,
        description: def.description
      })),
      prompts: Array.from(this.prompts.entries()).map(([name, def]) => ({
        name,
        description: def.description,
        arguments: def.arguments
      }))
    };
  }

  /**
   * Disconnect from MCP server
   */
  async disconnect() {
    this.logger.info(`Disconnecting from MCP server: ${this.serverConfig.name}`);
    
    this.connected = false;
    this.initialized = false;
    
    // Clear pending requests
    for (const [id, { reject }] of this.pendingRequests) {
      reject(new Error('Connection closed'));
    }
    this.pendingRequests.clear();
    
    // Kill server process
    if (this.serverProcess) {
      this.serverProcess.kill();
      this.serverProcess = null;
    }
    
    this.emit('disconnected');
    this.logger.info(`Disconnected from MCP server: ${this.serverConfig.name}`);
  }

  /**
   * Cleanup resources
   */
  async cleanup() {
    await this.disconnect();
    this.removeAllListeners();
  }
}

module.exports = MCPClient; 