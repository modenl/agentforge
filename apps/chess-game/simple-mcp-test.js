#!/usr/bin/env node

const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

async function testMCPConnection() {
  try {
    console.log('🔍 Testing chess-trainer-mcp connection...');

    // Read MCP config
    const mcpConfigPath = path.join(__dirname, 'mcp.json');
    const mcpConfig = JSON.parse(fs.readFileSync(mcpConfigPath, 'utf8'));

    const serverConfig = mcpConfig.mcpServers['chess-trainer-mcp'];
    console.log('📋 Server config:', JSON.stringify(serverConfig, null, 2));

    // Try to spawn the MCP server process
    console.log('🚀 Starting MCP server process...');
    const serverProcess = spawn(serverConfig.command, serverConfig.args, {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let initMessage = {
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {
          tools: {}
        },
        clientInfo: {
          name: 'test-client',
          version: '1.0.0'
        }
      }
    };

    let responseData = '';

    serverProcess.stdout.on('data', (data) => {
      responseData += data.toString();
      console.log('📥 Server response:', data.toString());
    });

    serverProcess.stderr.on('data', (data) => {
      console.log('❌ Server error:', data.toString());
    });

    serverProcess.on('close', (code) => {
      console.log(`🏁 Server process exited with code ${code}`);
    });

    // Send initialize message
    console.log('📤 Sending initialize message...');
    serverProcess.stdin.write(JSON.stringify(initMessage) + '\n');

    // Wait for response
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Send tools/list request
    let toolsMessage = {
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/list',
      params: {}
    };

    console.log('📤 Sending tools/list request...');
    serverProcess.stdin.write(JSON.stringify(toolsMessage) + '\n');

    // Wait for response
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Cleanup
    serverProcess.kill();

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testMCPConnection();
