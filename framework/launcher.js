// Framework Universal App Launcher
// Dynamically loads and launches any app based on configuration

const { app, BrowserWindow, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

// Load environment variables
require('dotenv').config();

// Hide dock icon in test mode on macOS (must be set very early)
if (process.env.NODE_ENV === 'test' && process.platform === 'darwin') {
  if (process.env.HEADED !== '1' && process.env.SHOW_TEST_WINDOW !== 'true') {
    // This makes the app behave like a background agent
    app.setActivationPolicy('accessory');
  }
}


// Import framework components
const AppManager = require('./core/app-manager');
const { mergeConfig, validateConfig } = require('./config/framework-config');
const logger = require('./core/logger');


/**
 * Universal App Launcher
 * Loads app configuration and business logic dynamically
 */
class UniversalLauncher {
  constructor(appPath) {

    this.appPath = appPath;
    this.appName = path.basename(appPath);
    this.appManager = null;
    this.isInitialized = false;
    this.isShuttingDown = false;

  }

  /**
   * Load app configuration
   */
  loadConfig() {

    const configPath = path.join(this.appPath, 'config.js');
    if (!fs.existsSync(configPath)) {
      throw new Error(`Config file not found: ${configPath}`);
    }

    // Clear require cache to ensure fresh config loading
    delete require.cache[require.resolve(configPath)];
    const config = require(configPath);

    // Load MCP configuration from separate mcp.json file if it exists
    const mcpConfig = this.loadMCPConfig();
    if (mcpConfig && mcpConfig.mcpServers) {
      config.mcpServers = mcpConfig.mcpServers;
    }

    return config;
  }

  /**
   * Load MCP configuration from separate mcp.json file
   */
  loadMCPConfig() {
    const mcpConfigPath = path.join(this.appPath, 'mcp.json');

    if (!fs.existsSync(mcpConfigPath)) {
      return null;
    }

    try {
      const mcpConfigContent = fs.readFileSync(mcpConfigPath, 'utf8');
      const mcpConfig = JSON.parse(mcpConfigContent);
      return mcpConfig;
    } catch (error) {
      console.error(`❌ Failed to load MCP config from ${mcpConfigPath}:`, error);
      return null;
    }
  }

  /**
   * Load business prompt
   */
  loadBusinessPrompt() {

    // Load config to get the prompt file name
    const config = this.loadConfig();
    const configuredPromptFile = config.agent?.promptFile;

    // Create list of prompt files to try, prioritizing config setting
    const promptFiles = [];
    if (configuredPromptFile) {
      promptFiles.push(configuredPromptFile);
    }

    for (const fileName of promptFiles) {
      const promptPath = path.join(this.appPath, fileName);
      if (fs.existsSync(promptPath)) {
        const content = fs.readFileSync(promptPath, 'utf8');
        if (configuredPromptFile && fileName === configuredPromptFile) {
        }
        return content;
      }
    }

    console.warn('⚠️ No prompt file found, using default');
    return 'You are a helpful AI assistant.';
  }

  /**
   * Dynamically load MCP tools
   */
  loadMCPTools() {
    const mcpToolsPath = path.join(this.appPath, 'mcp-tools');
    const tools = {};

    if (!fs.existsSync(mcpToolsPath)) {
      logger.info(`No MCP tools directory found: ${mcpToolsPath}`);
      return tools;
    }

    // Scan for .js files in mcp-tools directory
    const files = fs.readdirSync(mcpToolsPath).filter(file => file.endsWith('.js'));

    for (const file of files) {
      try {
        const toolPath = path.join(mcpToolsPath, file);

        // Clear require cache for hot reloading
        delete require.cache[require.resolve(toolPath)];
        const toolModule = require(toolPath);

        // Get the base name without extension
        const toolName = path.basename(file, '.js');

        // If module exports multiple functions, add them with prefixes
        if (typeof toolModule === 'object' && toolModule !== null) {
          for (const [key, value] of Object.entries(toolModule)) {
            if (typeof value === 'function') {
              const fullToolName = `${toolName}.${key}`;
              tools[fullToolName] = value;
              logger.debug(`Loaded MCP tool: ${fullToolName}`);
            }
          }
        }
        // If module exports a single function, use the file name
        else if (typeof toolModule === 'function') {
          tools[toolName] = toolModule;
          logger.debug(`Loaded MCP tool: ${toolName}`);
        }
      } catch (error) {
        logger.error(`Failed to load MCP tool ${file}:`, error);
      }
    }

          logger.info(`Loaded ${Object.keys(tools).length} MCP tools from ${this.appName}`);
    return tools;
  }

  /**
   * Create a dynamic app plugin
   */
  createAppPlugin() {
    const config = this.loadConfig();
    const businessPrompt = this.loadBusinessPrompt();
    const mcpTools = this.loadMCPTools();

    // Create a class that AppManager can instantiate
    class AppPlugin {
      constructor(appManager) {
        this.name = config.appName;
        this.id = this.name;
        this.appManager = appManager;
        this.config = config;
        this.businessPrompt = businessPrompt;
        this.mcpTools = mcpTools;
      }

      getConfig() {
        return this.config;
      }

      async getBusinessPrompt() {
        return this.businessPrompt;
      }

      registerMCPTools() {
        return this.mcpTools;
      }

      async initialize() {
        logger.info(`${this.name} initialized`);
        return true;
      }

      async cleanup() {
        logger.info(`${this.name} cleanup completed`);
      }
    }

    return AppPlugin;
  }

  /**
   * Initialize and launch the app
   */
  async initialize() {
    try {


      // Create dynamic plugin
      const AppPluginClass = this.createAppPlugin();
      const appPlugin = new AppPluginClass(null); // Will be properly initialized by AppManager
      const finalConfig = appPlugin.getConfig();


      // Add the plugin to config
      finalConfig.plugins = [AppPluginClass];

      // Validate configuration
      validateConfig(finalConfig);
      // Create and initialize the application manager
      this.appManager = new AppManager(finalConfig);

      await this.appManager.initialize();

      // Create the main window
      const window = await this.appManager.createMainWindow();
      
      this.isInitialized = true;


      return true;
    } catch (error) {
      console.error(`❌ Failed to launch ${this.appName}:`, error);
      logger.error(`Failed to launch ${this.appName}:`, error);

      // Show error dialog to user
      dialog.showErrorBox(
        'Launch Error',
        `Failed to start ${this.appName}:\n\n${error.message}\n\nPlease check your configuration and try again.`
      );

      app.quit();
      return false;
    }
  }

  /**
   * Handle application shutdown
   */
  async shutdown() {
    try {
      if (this.appManager) {
        await this.appManager.cleanup();
      }
      logger.info(`${this.appName} shutdown completed`);
    } catch (error) {
      logger.error('Error during application shutdown:', error);
    }
  }
}

/**
 * Launch an application from a given directory
 * @param {string} appPath - Path to the app directory
 * @returns {UniversalLauncher} Launcher instance
 */
function launchApp(appPath) {

  // Get app path from command line arguments if not provided
  if (!appPath) {
    const args = process.argv.slice(2);

    if (args.length === 0) {
      throw new Error('No app path specified. Usage: electron . <app-path>');
    }
    appPath = args[0];
  }

  // Resolve relative paths
  if (!path.isAbsolute(appPath)) {
    appPath = path.resolve(appPath);
  }

  // Check if app directory exists
  if (!fs.existsSync(appPath)) {
    console.error(`❌ App directory not found: ${appPath}`);
    throw new Error(`App directory not found: ${appPath}`);
  }

  // Create launcher instance
  const launcher = new UniversalLauncher(appPath);

  // Set up Electron app event handlers

  // Hide from dock BEFORE app is ready in test mode on macOS
  if (process.env.NODE_ENV === 'test' && process.platform === 'darwin') {
    if (process.env.HEADED !== '1' && process.env.SHOW_TEST_WINDOW !== 'true') {
      // Immediately hide dock if available
      if (app.dock) {
        app.dock.hide();
      }
    }
  }
  
  // Also handle the 'will-finish-launching' event
  app.on('will-finish-launching', () => {
    if (process.env.NODE_ENV === 'test' && process.platform === 'darwin') {
      if (process.env.HEADED !== '1' && process.env.SHOW_TEST_WINDOW !== 'true') {
        app.dock?.hide();
      }
    }
  });

  app.whenReady().then(async() => {
    
    await launcher.initialize();
  });

  app.on('window-all-closed', () => {
    // On macOS, keep the app running even when all windows are closed
    if (process.platform !== 'darwin') {
      // Set a timeout to prevent hanging on quit
      setTimeout(() => {
        if (!launcher.isShuttingDown) {
          process.exit(0);
        }
      }, 1000);
      app.quit();
    }
  });

  app.on('activate', async() => {
    // On macOS, re-create window when dock icon is clicked
    if (launcher.isInitialized && launcher.appManager) {
      const windows = launcher.appManager.mainWindow;
      if (!windows || windows.isDestroyed()) {
        await launcher.appManager.createMainWindow();
      }
    }
  });

  app.on('before-quit', async(event) => {
    // Prevent quit until cleanup is complete
    if (launcher.isInitialized && !launcher.isShuttingDown) {
      event.preventDefault();
      launcher.isShuttingDown = true;

      // Set a timeout to prevent hanging
      const cleanupTimeout = setTimeout(() => {
        process.exit(0);
      }, 3000);

      try {
        await launcher.shutdown();
        clearTimeout(cleanupTimeout);
        // Don't call app.quit() again, just exit the process
        process.exit(0);
      } catch (error) {
        console.error('❌ Error during shutdown:', error);
        clearTimeout(cleanupTimeout);
        process.exit(1);
      }
    }
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    console.error('💥 Uncaught Exception:', error);
    logger.error('Uncaught Exception:', error);

    dialog.showErrorBox(
      'Unexpected Error',
      `An unexpected error occurred:\n\n${error.message}\n\nThe application will now exit.`
    );

    app.quit();
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('💥 Unhandled Rejection:', reason);
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  });

  return launcher;
}

module.exports = {
  UniversalLauncher,
  launchApp
};

// Auto-launch if this file is run directly

// Since Electron loads files differently, we'll launch regardless
launchApp();
