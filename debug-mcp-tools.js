#!/usr/bin/env node

const path = require('path');
const MCPManager = require('./framework/mcp/mcp-manager');
const logger = require('./framework/core/logger');

async function debugMCPTools() {
  console.log('=== Debugging MCP Tools ===\n');
  
  const mcpManager = new MCPManager();
  
  try {
    // Initialize MCP Manager
    const configPath = path.join(__dirname, 'apps/game-time-manager/mcp.json');
    await mcpManager.initialize('game-time-manager', configPath);
    
    // Get statistics
    const stats = mcpManager.getStatistics();
    console.log('MCP Statistics:', JSON.stringify(stats, null, 2));
    
    // Get available tools
    const tools = mcpManager.getMCPToolsForPrompt();
    console.log('\nAvailable MCP Tools:');
    tools.forEach(tool => {
      console.log(`- ${tool.name}: ${tool.description}`);
      console.log(`  Server: ${tool.server}`);
    });
    
    // Check for amc8-quiz-mcp tools
    const amc8Tools = tools.filter(tool => tool.server === 'amc8-quiz-mcp');
    console.log('\nAMC8 Quiz Tools:', amc8Tools.length);
    
    if (amc8Tools.length === 0) {
      console.error('\n❌ No AMC8 quiz tools found! The MCP server might not be connected.');
    } else {
      console.log('✅ AMC8 quiz tools are available');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mcpManager.cleanup();
  }
}

debugMCPTools().catch(console.error);