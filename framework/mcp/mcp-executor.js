// Framework Core: MCP Executor
// Base class for executing MCP (Model Control Protocol) actions

const { EventEmitter } = require('events');
const MCPClient = require('./mcp-client');

/**
 * Base MCP Executor class
 * Provides framework for executing MCP actions with permission control and validation
 */
class MCPExecutor extends EventEmitter {
  constructor(supabaseClient, logger) {
    super();
    this.supabase = supabaseClient;
    this.logger = logger;
    this.registeredActions = new Map();
    this.pluginActions = new Map(); // Map of plugin -> actions
    this.mcpClients = new Map(); // Map of external MCP clients
  }

  /**
   * Register an MCP action handler
   * @param {string} actionName - Name of the action
   * @param {Function} handler - Handler function
   * @param {string} pluginId - ID of the plugin registering this action
   */
  registerAction(actionName, handler, pluginId = 'framework') {
    if (this.registeredActions.has(actionName)) {
      this.logger.warn(`Action ${actionName} is already registered, overriding`);
    }

    this.registeredActions.set(actionName, {
      handler,
      pluginId,
      registeredAt: new Date()
    });

    // Track plugin actions
    if (!this.pluginActions.has(pluginId)) {
      this.pluginActions.set(pluginId, new Set());
    }
    this.pluginActions.get(pluginId).add(actionName);

    this.logger.info(`MCP action registered: ${actionName} (plugin: ${pluginId})`);
  }

  /**
   * Unregister an MCP action
   * @param {string} actionName - Name of the action to unregister
   */
  unregisterAction(actionName) {
    const actionInfo = this.registeredActions.get(actionName);
    if (actionInfo) {
      this.registeredActions.delete(actionName);

      // Remove from plugin tracking
      const pluginActions = this.pluginActions.get(actionInfo.pluginId);
      if (pluginActions) {
        pluginActions.delete(actionName);
        if (pluginActions.size === 0) {
          this.pluginActions.delete(actionInfo.pluginId);
        }
      }

      this.logger.info(`MCP action unregistered: ${actionName}`);
    }
  }

  /**
   * Unregister all actions from a plugin
   * @param {string} pluginId - ID of the plugin
   */
  unregisterPluginActions(pluginId) {
    const pluginActions = this.pluginActions.get(pluginId);
    if (pluginActions) {
      for (const actionName of pluginActions) {
        this.registeredActions.delete(actionName);
      }
      this.pluginActions.delete(pluginId);
      this.logger.info(`All MCP actions unregistered for plugin: ${pluginId}`);
    }
  }

  /**
   * Execute an MCP action
   * @param {string} actionName - Name of the action to execute
   * @param {Object} params - Parameters for the action
   * @param {string} role - Role of the requester (for permission checking)
   * @returns {Promise<any>} Result of the action
   */
  async execute(actionName, params = {}, role = 'Agent') {
    const startTime = Date.now();

    try {
      // Check if action is registered
      const actionInfo = this.registeredActions.get(actionName);
      if (!actionInfo) {
        throw new Error(`Unknown MCP action: ${actionName}`);
      }

      // Basic permission check (can be overridden by plugins)
      if (!this.hasPermission(role, actionName)) {
        throw new Error(`Role ${role} does not have permission for action: ${actionName}`);
      }

      // Validate parameters (can be overridden by plugins)
      this.validateParameters(actionName, params);

      this.logger.info(`Executing MCP action: ${actionName} (role: ${role})`);

      // Execute the action
      const result = await actionInfo.handler(params, role);

      const duration = Date.now() - startTime;
      this.logger.info(`MCP action completed: ${actionName} (${duration}ms)`);

      // Emit success event
      this.emit('action:success', {
        actionName,
        params,
        role,
        result,
        duration,
        pluginId: actionInfo.pluginId
      });

      return result;

    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(`MCP action failed: ${actionName} (${duration}ms)`, error);

      // Emit error event
      this.emit('action:error', {
        actionName,
        params,
        role,
        error: error.message,
        duration
      });

      throw error;
    }
  }

  /**
   * Basic permission check
   * Override this method in subclasses for custom permission logic
   * @param {string} role - Role of the requester
   * @param {string} actionName - Name of the action
   * @returns {boolean} Whether the role has permission
   */
  hasPermission(role, actionName) {
    // Default: all roles have permission for all actions
    // Override in subclasses for more restrictive permissions
    return true;
  }

  /**
   * Basic parameter validation
   * Override this method in subclasses for custom validation logic
   * @param {string} actionName - Name of the action
   * @param {Object} params - Parameters to validate
   * @throws {Error} If validation fails
   */
  validateParameters(actionName, params) {
    // Default: no validation
    // Override in subclasses for specific validation rules
  }

  /**
   * Get list of registered actions
   * @returns {Array} Array of action names
   */
  getRegisteredActions() {
    return Array.from(this.registeredActions.keys());
  }

  /**
   * Get actions registered by a specific plugin
   * @param {string} pluginId - ID of the plugin
   * @returns {Array} Array of action names
   */
  getPluginActions(pluginId) {
    const pluginActions = this.pluginActions.get(pluginId);
    return pluginActions ? Array.from(pluginActions) : [];
  }

  /**
   * Get detailed information about a registered action
   * @param {string} actionName - Name of the action
   * @returns {Object|null} Action information or null if not found
   */
  getActionInfo(actionName) {
    const actionInfo = this.registeredActions.get(actionName);
    if (!actionInfo) return null;

    return {
      actionName,
      pluginId: actionInfo.pluginId,
      registeredAt: actionInfo.registeredAt
    };
  }

  /**
   * Check if an action is registered
   * @param {string} actionName - Name of the action
   * @returns {boolean} Whether the action is registered
   */
  isActionRegistered(actionName) {
    return this.registeredActions.has(actionName);
  }

  /**
   * Connect to external MCP server and register tools as MCP actions
   * @param {Object} serverConfig - MCP server configuration
   * @returns {Promise<MCPClient>} Connected MCP client
   */
  async connectMCPServer(serverConfig) {
    try {
      this.logger.info(`Connecting to external MCP server: ${serverConfig.name}`);
      
      const client = new MCPClient(serverConfig, this.logger);
      
      // Connect and discover capabilities
      await client.connect();
      
      // Register MCP tool proxy actions
      const tools = client.getToolsForLLM();
      for (const tool of tools) {
        const actionName = `mcp_${serverConfig.name}_${tool.name}`;
        const handler = async (params, role) => {
          return await client.callTool(tool.name, params);
        };
        this.registerAction(actionName, handler, `mcp-server-${serverConfig.name}`);
      }
      
      // Store client for management
      this.mcpClients.set(serverConfig.name, client);
      
      this.logger.info(`Successfully connected and registered ${tools.length} tools from MCP server: ${serverConfig.name}`);
      
      return client;
      
    } catch (error) {
      this.logger.error(`Failed to connect to MCP server ${serverConfig.name}:`, error);
      throw error;
    }
  }

  /**
   * Disconnect from an external MCP server
   * @param {string} serverName - Name of the server to disconnect
   */
  async disconnectMCPServer(serverName) {
    const client = this.mcpClients.get(serverName);
    if (client) {
      // Unregister all actions from this server
      this.unregisterPluginActions(`mcp-server-${serverName}`);
      
      // Disconnect client
      await client.disconnect();
      
      // Remove from map
      this.mcpClients.delete(serverName);
      
      this.logger.info(`Disconnected from MCP server: ${serverName}`);
    }
  }

  /**
   * Get information about connected MCP servers
   * @returns {Array} Array of server information
   */
  getConnectedMCPServers() {
    const servers = [];
    for (const [name, client] of this.mcpClients) {
      servers.push(client.getServerInfo());
    }
    return servers;
  }

  /**
   * Call a tool on a specific MCP server
   * @param {string} serverName - Name of the MCP server
   * @param {string} toolName - Name of the tool
   * @param {Object} parameters - Tool parameters
   * @returns {Promise<any>} Tool result
   */
  async callMCPTool(serverName, toolName, parameters = {}) {
    const client = this.mcpClients.get(serverName);
    if (!client) {
      throw new Error(`MCP server not connected: ${serverName}`);
    }
    
    return await client.callTool(toolName, parameters);
  }

  /**
   * Get all MCP tools formatted for LLM prompt injection
   * This method returns tools in a format that can be injected into prompts
   * so the LLM knows about available MCP tools and can call them
   */
  getMCPToolsForPrompt() {
    const allTools = [];
    
    for (const [serverName, client] of this.mcpClients) {
      if (!client.connected || !client.initialized) continue;
      
      const tools = client.getToolsForLLM();
      for (const tool of tools) {
        allTools.push({
          name: `mcp_${serverName}_${tool.name}`,
          description: tool.description,
          inputSchema: tool.inputSchema,
          server: serverName,
          originalName: tool.name
        });
      }
    }
    
    return allTools;
  }

  /**
   * Generate MCP tools section for prompt injection
   * Returns a formatted string that can be injected into prompts
   */
  generateMCPToolsPromptSection() {
    const tools = this.getMCPToolsForPrompt();
    
    if (tools.length === 0) {
      return '';
    }
    
    let section = '\n## 🔧 Available MCP Tools\n\n';
    section += 'The following external tools are available through the Model Context Protocol:\n\n';
    
    for (const tool of tools) {
      section += `### ${tool.name}\n`;
      section += `**Description**: ${tool.description}\n`;
      section += `**Server**: ${tool.server}\n`;
      section += `**Usage**: Call this tool using the MCP action format\n`;
      
      if (tool.inputSchema && tool.inputSchema.properties) {
        section += `**Parameters**:\n`;
        for (const [paramName, paramDef] of Object.entries(tool.inputSchema.properties)) {
          section += `- \`${paramName}\`: ${paramDef.description || paramDef.type || 'parameter'}\n`;
        }
      }
      section += '\n';
    }
    
    section += '**How to use MCP tools**:\n';
    section += '```json\n';
    section += '"mcp_actions": [\n';
    section += '  {\n';
    section += '    "action": "mcp_servername_toolname",\n';
    section += '    "parameters": {\n';
    section += '      "param1": "value1",\n';
    section += '      "param2": "value2"\n';
    section += '    }\n';
    section += '  }\n';
    section += ']\n';
    section += '```\n\n';
    
    return section;
  }

  /**
   * Cleanup resources
   */
  async cleanup() {
    // Disconnect all MCP clients
    for (const [serverName, client] of this.mcpClients) {
      try {
        await client.cleanup();
      } catch (error) {
        this.logger.error(`Error cleaning up MCP client ${serverName}:`, error);
      }
    }
    this.mcpClients.clear();
    
    this.registeredActions.clear();
    this.pluginActions.clear();
    this.removeAllListeners();
    this.logger.info('MCP Executor cleanup completed');
  }
}

module.exports = MCPExecutor;
