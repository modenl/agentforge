/**
 * Built-in MCP tools for monitoring MCP servers
 * This file only contains monitoring tools, not lifecycle management
 */

module.exports = {
  /**
   * Get status of all MCP servers
   */
  'get_mcp_servers_status': {
    name: 'get_mcp_servers_status',
    description: 'Get connection status of all registered MCP servers',
    inputSchema: {
      type: 'object',
      properties: {},
      additionalProperties: false
    },
    handler: async (params, context) => {
      const mcpManager = context.mcpManager;
      
      if (!mcpManager) {
        return {
          success: false,
          error: 'MCP Manager not available'
        };
      }
      
      try {
        const summary = mcpManager.getConnectedServersSummary();
        const allServers = Array.from(mcpManager.serverConfigs.keys());
        
        const status = allServers.map(serverName => {
          const connected = summary.find(s => s.name === serverName);
          return {
            name: serverName,
            connected: !!connected,
            connectedAt: connected?.connectedAt,
            webviewSupported: connected?.webviewSupported || false
          };
        });
        
        return {
          success: true,
          servers: status
        };
      } catch (error) {
        return {
          success: false,
          error: error.message
        };
      }
    }
  }
};