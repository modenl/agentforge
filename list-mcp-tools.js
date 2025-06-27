#!/usr/bin/env node

const path = require('path');
const fs = require('fs');

// Load the framework
const frameworkPath = path.join(__dirname, '../../framework');
const AppManager = require(path.join(frameworkPath, 'core/app-manager'));
const Logger = require(path.join(frameworkPath, 'core/logger'));

async function listMCPTools() {
  const logger = new Logger('MCP-Tools-Lister');

  try {
    // Load app config
    const configPath = path.join(__dirname, 'config.js');
    const mcpConfigPath = path.join(__dirname, 'mcp.json');

    if (!fs.existsSync(configPath)) {
      throw new Error(`Config file not found: ${configPath}`);
    }

    if (!fs.existsSync(mcpConfigPath)) {
      throw new Error(`MCP config file not found: ${mcpConfigPath}`);
    }

    // Load configurations
    delete require.cache[require.resolve(configPath)];
    const config = require(configPath);

    const mcpConfig = JSON.parse(fs.readFileSync(mcpConfigPath, 'utf8'));

    // Merge MCP config into main config
    config.mcpServers = mcpConfig.mcpServers || {};

    console.log('🔍 Initializing MCP connection...');

    // Initialize app manager
    const appManager = new AppManager(config, logger);
    await appManager.initialize();

    // Connect to MCP servers
    await appManager.mcpManager.connectAllServers();

    // Wait a moment for connections to stabilize
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Get MCP tools
    const tools = appManager.mcpManager.getMCPToolsForPrompt();
    const serverInfo = appManager.mcpManager.getConnectedServersInfo();

    console.log('\n📋 Chess Trainer MCP Tools:');
    console.log('=' .repeat(50));

    if (tools.length === 0) {
      console.log('❌ No MCP tools found');
      console.log('\nServer connection status:');
      console.log(JSON.stringify(serverInfo, null, 2));
    } else {
      tools.forEach((tool, index) => {
        console.log(`\n${index + 1}. ${tool.name}`);
        console.log(`   📝 Description: ${tool.description}`);
        console.log(`   🖥️  Server: ${tool.server}`);
        console.log(`   🔧 Original Name: ${tool.originalName}`);

        if (tool.inputSchema && tool.inputSchema.properties) {
          console.log('   📥 Parameters:');
          Object.entries(tool.inputSchema.properties).forEach(([param, def]) => {
            console.log(`      - ${param}: ${def.description || def.type || 'parameter'}`);
          });
        }
      });
    }

    // Show server statistics
    const stats = appManager.mcpManager.getStatistics();
    console.log('\n📊 MCP Statistics:');
    console.log(`   Connected Servers: ${stats.connectedServers}`);
    console.log(`   Total Tools: ${stats.totalTools}`);

    // Cleanup
    await appManager.cleanup();

  } catch (error) {
    logger.error('Failed to list MCP tools:', error);
    process.exit(1);
  }
}

// Run the script
listMCPTools().catch(console.error);
