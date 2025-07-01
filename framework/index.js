// Screen Control Agents Framework
// Main entry point for the framework

// Core components
const AppManager = require('./core/app-manager');
const CoreAgent = require('./core/core-agent');
const { createAIClient } = require('./core/ai-client-factory');
const logger = require('./core/logger');

// MCP module
const MCP = require('./mcp');

// Configuration
const {
  FRAMEWORK_CONFIG,
  mergeConfig,
  validateConfig,
  getEnvironmentConfig
} = require('./config/framework-config');

// Framework version
const packageInfo = require('../package.json');

/**
 * Screen Control Agents Framework
 * A powerful framework for building AI-driven applications with Electron
 */
class Framework {
  constructor(userConfig = {}) {
    // Merge user configuration with framework defaults
    this.config = mergeConfig(userConfig);

    // Validate configuration
    validateConfig(this.config);

    // Initialize core components
    this.appManager = new AppManager(this.config);
    this.initialized = false;
  }

  /**
   * Initialize the framework
   */
  async initialize() {
    if (this.initialized) {
      logger.warn('Framework already initialized');
      return true;
    }

    try {
      // Initialize the application manager
      await this.appManager.initialize();

      this.initialized = true;
      logger.info(`Framework v${packageInfo.version} initialized successfully`);

      return true;
    } catch (error) {
      logger.error('Framework initialization failed:', error);
      throw error;
    }
  }

  /**
   * Create the main application window
   */
  async createMainWindow() {
    if (!this.initialized) {
      throw new Error('Framework must be initialized before creating windows');
    }

    return await this.appManager.createMainWindow();
  }

  /**
   * Get a loaded plugin by ID
   */
  getPlugin(pluginId) {
    return this.appManager.getPlugin(pluginId);
  }

  /**
   * Get all loaded plugins
   */
  getPlugins() {
    return this.appManager.getPlugins();
  }

  /**
   * Get framework configuration
   */
  getConfig() {
    return { ...this.config };
  }

  /**
   * Cleanup framework resources
   */
  async cleanup() {
    if (this.appManager) {
      await this.appManager.cleanup();
    }
    this.initialized = false;
  }
}

/**
 * Base Plugin class
 * All plugins should extend this class
 */
class BasePlugin {
  constructor(framework) {
    this.framework = framework;
    this.initialized = false;
  }

  /**
   * Initialize the plugin
   * Override this method in your plugin
   */
  async initialize() {
    this.initialized = true;
    return true;
  }

  /**
   * Register MCP tools
   * Override this method to register your plugin's tools
   * @returns {Object} Map of tool names to handler functions
   */
  registerMCPTools() {
    return {};
  }

  /**
   * Get business prompt
   * Override this method to provide your plugin's business prompt
   * @returns {string} Business prompt text
   */
  getBusinessPrompt() {
    return '';
  }

  /**
   * Get plugin configuration
   * Override this method to provide your plugin's configuration
   * @returns {Object} Plugin configuration
   */
  getConfig() {
    return {};
  }

  /**
   * Cleanup plugin resources
   * Override this method to clean up your plugin
   */
  async cleanup() {
    this.initialized = false;
  }
}

/**
 * Utility function to create a basic application
 * @param {Object} config - Application configuration
 * @param {Array} plugins - Array of plugin classes
 * @returns {Framework} Configured framework instance
 */
function createApp(config = {}, plugins = []) {
  const appConfig = {
    ...config,
    plugins: plugins
  };

  return new Framework(appConfig);
}

// Export framework components
module.exports = {
  // Main framework class
  Framework,

  // Core components
  AppManager,
  CoreAgent,
  createAIClient,
  logger,

  // MCP components
  MCP,

  // Base classes
  BasePlugin,

  // Configuration utilities
  FRAMEWORK_CONFIG,
  mergeConfig,
  validateConfig,
  getEnvironmentConfig,

  // Utility functions
  createApp,

  // Framework metadata
  version: packageInfo.version,
  name: 'Screen Control Agents Framework'
};
