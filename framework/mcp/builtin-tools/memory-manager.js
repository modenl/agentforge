/**
 * Built-in MCP tools for memory/variable management
 * These tools provide a unified interface for managing LLM state
 */

module.exports = {
  /**
   * Get current value of a variable
   */
  'memory_get': {
    name: 'memory_get',
    description: 'Get the current value of a variable from memory',
    inputSchema: {
      type: 'object',
      properties: {
        key: {
          type: 'string',
          description: 'The variable key to retrieve'
        }
      },
      required: ['key']
    },
    handler: async (params, context) => {
      const { key } = params;
      
      const appManager = context.appManager;
      if (!appManager || !appManager.coreAgent) {
        return {
          content: [{
            type: 'text',
            text: 'Error: Core agent not available'
          }],
          isError: true
        };
      }
      
      const value = appManager.coreAgent.currentVariables[key];
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({ key, value })
        }],
        metadata: { skipHistory: true }
      };
    }
  },

  /**
   * Set a variable value
   */
  'memory_set': {
    name: 'memory_set',
    description: 'Set a variable value in memory',
    inputSchema: {
      type: 'object',
      properties: {
        key: {
          type: 'string',
          description: 'The variable key to set'
        },
        value: {
          description: 'The value to set (any type)'
        }
      },
      required: ['key', 'value']
    },
    handler: async (params, context) => {
      const { key, value } = params;
      
      const appManager = context.appManager;
      if (!appManager || !appManager.coreAgent) {
        return {
          content: [{
            type: 'text',
            text: 'Error: Core agent not available'
          }],
          isError: true
        };
      }
      
      // Update the variable
      appManager.coreAgent.currentVariables[key] = value;
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({ success: true, key, value })
        }],
        metadata: { skipHistory: true }
      };
    }
  },

  /**
   * Update multiple variables at once
   */
  'memory_update': {
    name: 'memory_update',
    description: 'Update multiple variables in memory',
    inputSchema: {
      type: 'object',
      properties: {
        updates: {
          type: 'object',
          description: 'Object containing key-value pairs to update'
        }
      },
      required: ['updates']
    },
    handler: async (params, context) => {
      const { updates } = params;
      
      const appManager = context.appManager;
      if (!appManager || !appManager.coreAgent) {
        return {
          content: [{
            type: 'text',
            text: 'Error: Core agent not available'
          }],
          isError: true
        };
      }
      
      // Update all variables
      Object.assign(appManager.coreAgent.currentVariables, updates);
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({ success: true, updated: Object.keys(updates) })
        }],
        metadata: { skipHistory: true }
      };
    }
  },

  /**
   * Delete a variable
   */
  'memory_delete': {
    name: 'memory_delete',
    description: 'Delete a variable from memory',
    inputSchema: {
      type: 'object',
      properties: {
        key: {
          type: 'string',
          description: 'The variable key to delete'
        }
      },
      required: ['key']
    },
    handler: async (params, context) => {
      const { key } = params;
      
      const appManager = context.appManager;
      if (!appManager || !appManager.coreAgent) {
        return {
          content: [{
            type: 'text',
            text: 'Error: Core agent not available'
          }],
          isError: true
        };
      }
      
      delete appManager.coreAgent.currentVariables[key];
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({ success: true, deleted: key })
        }],
        metadata: { skipHistory: true }
      };
    }
  },

  /**
   * Get all variables
   */
  'memory_list': {
    name: 'memory_list',
    description: 'List all variables in memory',
    inputSchema: {
      type: 'object',
      properties: {}
    },
    handler: async (params, context) => {
      const appManager = context.appManager;
      if (!appManager || !appManager.coreAgent) {
        return {
          content: [{
            type: 'text',
            text: 'Error: Core agent not available'
          }],
          isError: true
        };
      }
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(appManager.coreAgent.currentVariables, null, 2)
        }],
        metadata: { skipHistory: true }
      };
    }
  }
};