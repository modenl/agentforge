// Framework MCP: Module Entry Point
// Exports all MCP-related functionality

const MCPManager = require('./mcp-manager');
const MCPClient = require('./mcp-client');
const MCPExecutor = require('./mcp-executor');

module.exports = {
  // Main MCP components
  MCPManager,
  MCPClient,
  MCPExecutor,

  // Convenience factory function
  createMCPManager: (logger) => new MCPManager(logger),

  // Module information
  version: '1.0.0',
  protocolVersion: '2025-03-26'
}; 