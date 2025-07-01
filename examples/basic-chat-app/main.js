// Basic Chat App Example
// Demonstrates how to use the Screen Control Agents Framework for a simple chat application

const { Framework, BasePlugin } = require('../../framework');

/**
 * Simple Chat Plugin
 * Provides basic conversational AI functionality
 */
class SimpleChatPlugin extends BasePlugin {
  constructor(framework) {
    super(framework);
    this.conversationHistory = [];
  }

  async initialize() {
    await super.initialize();
    console.log('Simple Chat Plugin initialized');
    return true;
  }

  registerMCPTools() {
    return {
      'save_conversation': this.saveConversation.bind(this),
      'load_conversation': this.loadConversation.bind(this),
      'clear_history': this.clearHistory.bind(this)
    };
  }

  getBusinessPrompt() {
    return `
# Simple Chat Assistant

You are a helpful AI assistant designed to have natural conversations with users. Your role is to:

1. **Respond naturally**: Engage in friendly, helpful conversations
2. **Be informative**: Provide accurate information when asked
3. **Stay focused**: Keep conversations relevant and productive
4. **Be respectful**: Always maintain a polite and professional tone

## Core Behaviors

- Answer questions to the best of your ability
- Ask clarifying questions when needed
- Offer suggestions and advice when appropriate
- Maintain conversation context across messages

## Available Actions

You can use the following MCP tools:
- \`save_conversation\`: Save the current conversation
- \`load_conversation\`: Load a previous conversation
- \`clear_history\`: Clear conversation history

## Response Format

Always follow the base framework's SYSTEMOUTPUT format. Every response must include:
- Natural conversation in the message area
- Appropriate adaptive cards for user interaction
- MCP tools when needed

Remember: You are a general-purpose conversational AI assistant.
    `;
  }

  // MCP Tool Handlers
  async saveConversation(params, role) {
    try {
      const conversation = {
        id: params.conversation_id || Date.now().toString(),
        timestamp: new Date().toISOString(),
        messages: this.conversationHistory
      };

      // In a real app, you'd save to a database or file
      console.log('Saving conversation:', conversation.id);

      return {
        status: 'saved',
        conversation_id: conversation.id,
        message_count: conversation.messages.length
      };
    } catch (error) {
      throw new Error(`Failed to save conversation: ${error.message}`);
    }
  }

  async loadConversation(params, role) {
    try {
      const conversationId = params.conversation_id;

      // In a real app, you'd load from a database or file
      console.log('Loading conversation:', conversationId);

      return {
        status: 'loaded',
        conversation_id: conversationId,
        messages: [] // Would contain actual messages
      };
    } catch (error) {
      throw new Error(`Failed to load conversation: ${error.message}`);
    }
  }

  async clearHistory(params, role) {
    try {
      this.conversationHistory = [];

      return {
        status: 'cleared',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`Failed to clear history: ${error.message}`);
    }
  }
}

// Application configuration
const appConfig = {
  appName: 'Basic Chat App',
  version: '1.0.0',

  window: {
    defaultWidth: 800,
    defaultHeight: 600,
    minimizeToTray: false
  },

  agent: {
    model: 'gpt-4.1',
    temperature: 0.7,
    maxTokens: 4096
  },

  plugins: [SimpleChatPlugin],

  enableAutoLaunch: false
};

// Create and start the application
async function startApp() {
  try {
    const app = new Framework(appConfig);

    await app.initialize();
    await app.createMainWindow();

    console.log('Basic Chat App started successfully!');
  } catch (error) {
    console.error('Failed to start Basic Chat App:', error);
    process.exit(1);
  }
}

// Electron app events
const { app } = require('electron');

app.whenReady().then(startApp);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', async() => {
  // Re-create window on macOS when dock icon is clicked
  if (Framework.getAllWindows().length === 0) {
    await startApp();
  }
});

module.exports = { SimpleChatPlugin, appConfig };
