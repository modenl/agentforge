// Framework Core: MCP Executor
// Base class for executing MCP (Model Control Protocol) actions

const { EventEmitter } = require('events');

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
   * Cleanup resources
   */
  async cleanup() {
    this.registeredActions.clear();
    this.pluginActions.clear();
    this.removeAllListeners();
    this.logger.info('MCP Executor cleanup completed');
  }
}

module.exports = MCPExecutor;
