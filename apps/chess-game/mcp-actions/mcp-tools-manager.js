// Chess Game - MCP Tools Manager
// Manages and provides access to external MCP server tools

/**
 * List all available MCP tools from connected servers
 */
async function listMCPTools(params, role) {
  const appManager = this.appManager || global.appManager;
  if (!appManager || !appManager.mcpExecutor) {
    throw new Error('MCP Executor not available');
  }

  try {
    // Get connected MCP servers
    const connectedServers = appManager.mcpExecutor.getConnectedMCPServers();
    
    if (connectedServers.length === 0) {
      return {
        success: true,
        message: 'No external MCP servers connected',
        servers: [],
        totalTools: 0
      };
    }

    const result = {
      success: true,
      message: `Found ${connectedServers.length} connected MCP server(s)`,
      servers: connectedServers.map(server => ({
        name: server.name,
        connected: server.connected,
        capabilities: server.capabilities,
        tools: server.tools.map(tool => ({
          name: tool.name,
          description: tool.description,
          actionName: `mcp_${server.name}_${tool.name}` // How to call it
        })),
        resources: server.resources.length,
        prompts: server.prompts.length
      })),
      totalTools: connectedServers.reduce((total, server) => total + server.tools.length, 0)
    };

    return result;

  } catch (error) {
    throw new Error(`Failed to list MCP tools: ${error.message}`);
  }
}

/**
 * Call a specific MCP tool
 */
async function callMCPTool(params, role) {
  const { serverName, toolName, toolParams = {} } = params;
  
  if (!serverName || !toolName) {
    throw new Error('serverName and toolName are required');
  }

  const appManager = this.appManager || global.appManager;
  if (!appManager || !appManager.mcpExecutor) {
    throw new Error('MCP Executor not available');
  }

  try {
    // Call the tool on the specific MCP server
    const result = await appManager.mcpExecutor.callMCPTool(serverName, toolName, toolParams);
    
    return {
      success: true,
      serverName,
      toolName,
      result
    };

  } catch (error) {
    throw new Error(`Failed to call MCP tool ${toolName} on server ${serverName}: ${error.message}`);
  }
}

/**
 * Get information about a specific MCP server
 */
async function getMCPServerInfo(params, role) {
  const { serverName } = params;
  
  if (!serverName) {
    throw new Error('serverName is required');
  }

  const appManager = this.appManager || global.appManager;
  if (!appManager || !appManager.mcpExecutor) {
    throw new Error('MCP Executor not available');
  }

  try {
    const connectedServers = appManager.mcpExecutor.getConnectedMCPServers();
    const server = connectedServers.find(s => s.name === serverName);
    
    if (!server) {
      throw new Error(`MCP server not found: ${serverName}`);
    }

    return {
      success: true,
      server: {
        name: server.name,
        connected: server.connected,
        capabilities: server.capabilities,
        tools: server.tools,
        resources: server.resources,
        prompts: server.prompts
      }
    };

  } catch (error) {
    throw new Error(`Failed to get MCP server info: ${error.message}`);
  }
}

/**
 * Test connection to all MCP servers
 */
async function testMCPConnections(params, role) {
  const appManager = this.appManager || global.appManager;
  if (!appManager || !appManager.mcpExecutor) {
    throw new Error('MCP Executor not available');
  }

  try {
    const connectedServers = appManager.mcpExecutor.getConnectedMCPServers();
    
    const testResults = [];
    
    for (const server of connectedServers) {
      const testResult = {
        serverName: server.name,
        connected: server.connected,
        toolsCount: server.tools.length,
        resourcesCount: server.resources.length,
        promptsCount: server.prompts.length,
        status: server.connected ? 'healthy' : 'disconnected'
      };
      
      // Try to call a simple tool if available
      if (server.tools.length > 0) {
        try {
          const firstTool = server.tools[0];
          // Try to call the tool with empty params (some tools might work)
          await appManager.mcpExecutor.callMCPTool(server.name, firstTool.name, {});
          testResult.toolTestStatus = 'success';
        } catch (error) {
          testResult.toolTestStatus = 'failed';
          testResult.toolTestError = error.message;
        }
      }
      
      testResults.push(testResult);
    }

    return {
      success: true,
      message: `Tested ${connectedServers.length} MCP server(s)`,
      results: testResults,
      summary: {
        total: connectedServers.length,
        healthy: testResults.filter(r => r.status === 'healthy').length,
        disconnected: testResults.filter(r => r.status === 'disconnected').length
      }
    };

  } catch (error) {
    throw new Error(`Failed to test MCP connections: ${error.message}`);
  }
}

module.exports = {
  listMCPTools,
  callMCPTool,
  getMCPServerInfo,
  testMCPConnections
}; 