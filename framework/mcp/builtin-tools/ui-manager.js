/**
 * Built-in MCP tools for UI management
 * These tools provide a unified interface for managing UI elements
 */

module.exports = {
  /**
   * Display or update the global card
   */
  'ui_set_global_card': {
    name: 'ui_set_global_card',
    description: 'Set or update the global navigation card',
    inputSchema: {
      type: 'object',
      properties: {
        card: {
          type: 'object',
          description: 'The Adaptive Card definition with body and/or actions',
          properties: {
            body: {
              type: 'array',
              description: 'Card body elements',
              items: { type: 'object' }
            },
            actions: {
              type: 'array',
              description: 'Card action elements',
              items: { type: 'object' }
            }
          }
        }
      },
      required: ['card']
    },
    handler: async (params, context) => {
      const { card } = params;
      
      const appManager = context.appManager;
      if (!appManager || !appManager.mainWindow || appManager.mainWindow.isDestroyed()) {
        return {
          content: [{
            type: 'text',
            text: 'Error: Main window not available'
          }],
          isError: true
        };
      }
      
      // Update the current adaptive card global section
      if (appManager.coreAgent) {
        appManager.coreAgent.currentAdaptiveCard = appManager.coreAgent.currentAdaptiveCard || {};
        appManager.coreAgent.currentAdaptiveCard.global = card;
      }
      
      // Send to renderer
      appManager.mainWindow.webContents.send('ui:update-global-card', { card });
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({ success: true, type: 'global_card' })
        }],
        metadata: { skipHistory: true }
      };
    }
  },

  /**
   * Display or update the assist card
   */
  'ui_set_assist_card': {
    name: 'ui_set_assist_card',
    description: 'Set or update the assist card for current interaction',
    inputSchema: {
      type: 'object',
      properties: {
        card: {
          type: 'object',
          description: 'The Adaptive Card definition with body and/or actions',
          properties: {
            body: {
              type: 'array',
              description: 'Card body elements',
              items: { type: 'object' }
            },
            actions: {
              type: 'array',
              description: 'Card action elements',
              items: { type: 'object' }
            }
          }
        }
      },
      required: ['card']
    },
    handler: async (params, context) => {
      const { card } = params;
      
      const appManager = context.appManager;
      if (!appManager || !appManager.mainWindow || appManager.mainWindow.isDestroyed()) {
        return {
          content: [{
            type: 'text',
            text: 'Error: Main window not available'
          }],
          isError: true
        };
      }
      
      // Update the current adaptive card assist section
      if (appManager.coreAgent) {
        appManager.coreAgent.currentAdaptiveCard = appManager.coreAgent.currentAdaptiveCard || {};
        appManager.coreAgent.currentAdaptiveCard.assist = card;
      }
      
      // Send to renderer (reuse existing display:assist-card channel)
      appManager.mainWindow.webContents.send('display:assist-card', { card });
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({ success: true, type: 'assist_card' })
        }],
        metadata: { skipHistory: true }
      };
    }
  },

  /**
   * Clear global card
   */
  'ui_clear_global_card': {
    name: 'ui_clear_global_card',
    description: 'Clear the global navigation card',
    inputSchema: {
      type: 'object',
      properties: {}
    },
    handler: async (params, context) => {
      const appManager = context.appManager;
      if (!appManager || !appManager.mainWindow || appManager.mainWindow.isDestroyed()) {
        return {
          content: [{
            type: 'text',
            text: 'Error: Main window not available'
          }],
          isError: true
        };
      }
      
      // Clear the global card
      if (appManager.coreAgent && appManager.coreAgent.currentAdaptiveCard) {
        appManager.coreAgent.currentAdaptiveCard.global = {};
      }
      
      // Send empty card to renderer
      appManager.mainWindow.webContents.send('ui:update-global-card', { card: {} });
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({ success: true, cleared: 'global_card' })
        }],
        metadata: { skipHistory: true }
      };
    }
  },

  /**
   * Clear assist card
   */
  'ui_clear_assist_card': {
    name: 'ui_clear_assist_card',
    description: 'Clear the assist card',
    inputSchema: {
      type: 'object',
      properties: {}
    },
    handler: async (params, context) => {
      const appManager = context.appManager;
      if (!appManager || !appManager.mainWindow || appManager.mainWindow.isDestroyed()) {
        return {
          content: [{
            type: 'text',
            text: 'Error: Main window not available'
          }],
          isError: true
        };
      }
      
      // Clear the assist card
      if (appManager.coreAgent && appManager.coreAgent.currentAdaptiveCard) {
        appManager.coreAgent.currentAdaptiveCard.assist = {};
      }
      
      // Send empty card to renderer
      appManager.mainWindow.webContents.send('display:assist-card', { card: {} });
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({ success: true, cleared: 'assist_card' })
        }],
        metadata: { skipHistory: true }
      };
    }
  },

  /**
   * Display a message from chat history by its ID
   * Used to show MCP tool results that were added to invisible history
   */
  'display_message': {
    name: 'display_message',
    description: 'Display a message from chat history by its ID',
    inputSchema: {
      type: 'object',
      properties: {
        message_id: {
          type: 'string',
          description: 'The ID of the message to display'
        }
      },
      required: ['message_id']
    },
    handler: async (params, context) => {
      const { message_id } = params;
      
      if (!message_id) {
        return {
          content: [{
            type: 'text',
            text: 'Error: Missing required parameter: message_id'
          }],
          isError: true
        };
      }
      
      // Get reference to the main window and core agent
      const appManager = context.appManager;
      if (!appManager || !appManager.mainWindow || appManager.mainWindow.isDestroyed()) {
        return {
          content: [{
            type: 'text',
            text: 'Error: Main window not available'
          }],
          isError: true
        };
      }
      
      // Get the message from raw chat history
      const coreAgent = appManager.coreAgent;
      if (!coreAgent) {
        return {
          content: [{
            type: 'text',
            text: 'Error: Core agent not available'
          }],
          isError: true
        };
      }
      
      // Find the message in raw history
      const rawHistory = coreAgent.getRawChatHistory();
      
      // Convert message_id to number if it's a string
      const msgId = typeof message_id === 'string' ? parseInt(message_id) : message_id;
      
      // Find the message by ID
      const message = rawHistory.find(msg => msg.id === msgId);
      
      if (!message) {
        return {
          content: [{
            type: 'text',
            text: `Error: Message ${message_id} not found in history`
          }],
          isError: true
        };
      }
      
      // Check if message is already visible
      const visibleHistory = coreAgent.getVisibleChatHistory();
      const isAlreadyVisible = visibleHistory.some(msg => msg.id === msgId);
      
      if (isAlreadyVisible) {
        // Message is already visible, don't display it again
        return {
          content: [],
          metadata: {
            action: 'display_message',
            message_id: message_id,
            skipHistory: true,
            alreadyVisible: true
          }
        };
      }
      
      // Send the full message to renderer to add to visible history
      appManager.mainWindow.webContents.send('display:message', {
        messageId: message_id,
        message: message
      });
      
      return {
        content: [],
        metadata: {
          action: 'display_message',
          message_id: message_id,
          skipHistory: true
        }
      };
    }
  }
};