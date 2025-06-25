// Framework Universal App Launcher
// Dynamically loads and launches any app based on configuration

const { app, BrowserWindow, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

// Load environment variables
require('dotenv').config();

console.log('�� Launcher.js loaded');

// Import framework components
const AppManager = require('./core/app-manager');
const { mergeConfig, validateConfig } = require('./config/framework-config');
const logger = require('./core/logger');

console.log('📦 Required modules loaded');

/**
 * Universal App Launcher
 * Loads app configuration and business logic dynamically
 */
class UniversalLauncher {
  constructor(appPath) {
    console.log(`🏗️ UniversalLauncher constructor called with appPath: ${appPath}`);
    
    this.appPath = appPath;
    this.appName = path.basename(appPath);
    this.appManager = null;
    this.isInitialized = false;
    this.isShuttingDown = false;
    
    console.log(`📝 App name: ${this.appName}`);
  }

  /**
   * Load app configuration
   */
  loadConfig() {
    console.log('⚙️ Loading config...');
    
    const configPath = path.join(this.appPath, 'config.js');
    if (!fs.existsSync(configPath)) {
      throw new Error(`Config file not found: ${configPath}`);
    }

    // Clear require cache to ensure fresh config loading
    delete require.cache[require.resolve(configPath)];
    const config = require(configPath);
    
    console.log(`✅ Config loaded from: ${configPath}`);
    return config;
  }

  /**
   * Load business prompt
   */
  loadBusinessPrompt() {
    console.log('📄 Loading business prompt...');
    
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
        console.log(`✅ Prompt loaded from: ${promptPath} (${content.length} chars)`);
        if (configuredPromptFile && fileName === configuredPromptFile) {
          console.log(`📋 Using configured prompt file: ${configuredPromptFile}`);
        }
        return content;
      }
    }

    console.warn('⚠️ No prompt file found, using default');
    return 'You are a helpful AI assistant.';
  }

  /**
   * Dynamically load MCP actions
   */
  loadMCPActions() {
    const mcpActionsPath = path.join(this.appPath, 'mcp-actions');
    const actions = {};

    if (!fs.existsSync(mcpActionsPath)) {
      logger.info(`No MCP actions directory found: ${mcpActionsPath}`);
      return actions;
    }

    // Scan for .js files in mcp-actions directory
    const files = fs.readdirSync(mcpActionsPath).filter(file => file.endsWith('.js'));

    for (const file of files) {
      try {
        const actionPath = path.join(mcpActionsPath, file);
        
        // Clear require cache for hot reloading
        delete require.cache[require.resolve(actionPath)];
        const actionModule = require(actionPath);

        // Get the base name without extension
        const actionName = path.basename(file, '.js');

        // If module exports multiple functions, add them with prefixes
        if (typeof actionModule === 'object' && actionModule !== null) {
          for (const [key, value] of Object.entries(actionModule)) {
            if (typeof value === 'function') {
              const fullActionName = `${actionName}.${key}`;
              actions[fullActionName] = value;
              logger.debug(`Loaded MCP action: ${fullActionName}`);
            }
          }
        }
        // If module exports a single function, use the file name
        else if (typeof actionModule === 'function') {
          actions[actionName] = actionModule;
          logger.debug(`Loaded MCP action: ${actionName}`);
        }
      } catch (error) {
        logger.error(`Failed to load MCP action ${file}:`, error);
      }
    }

    logger.info(`Loaded ${Object.keys(actions).length} MCP actions from ${this.appName}`);
    return actions;
  }

  /**
   * Create a dynamic app plugin
   */
  createAppPlugin() {
    const config = this.loadConfig();
    const businessPrompt = this.loadBusinessPrompt();
    const mcpActions = this.loadMCPActions();

    // Create a class that AppManager can instantiate
    class AppPlugin {
      constructor(appManager) {
        this.name = config.appName;
        this.id = this.name;
        this.appManager = appManager;
        this.config = config;
        this.businessPrompt = businessPrompt;
        this.mcpActions = mcpActions;
      }

      getConfig() {
        return this.config;
      }

      async getBusinessPrompt() {
        return this.businessPrompt;
      }

      registerMCPActions() {
        return this.mcpActions;
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
      console.log('🚀 Starting app initialization...');
      
      // Create dynamic plugin
      const AppPluginClass = this.createAppPlugin();
      const appPlugin = new AppPluginClass(null); // Will be properly initialized by AppManager
      const finalConfig = appPlugin.getConfig();

      console.log(`📋 App config: ${JSON.stringify({
        appName: finalConfig.appName,
        windowSize: `${finalConfig.window.defaultWidth}x${finalConfig.window.defaultHeight}`,
        uiPath: finalConfig.window.uiPath
      }, null, 2)}`);

      // Add the plugin to config
      finalConfig.plugins = [AppPluginClass];

      // Validate configuration
      validateConfig(finalConfig);
      console.log('✅ Config validation passed');

      // Create and initialize the application manager
      console.log('🏗️ Creating AppManager...');
      this.appManager = new AppManager(finalConfig);
      
      console.log('⚡ Initializing AppManager...');
      await this.appManager.initialize();

      // Create the main window
      console.log('🪟 Creating main window...');
      const window = await this.appManager.createMainWindow();
      
      if (window) {
        console.log('✅ Main window created successfully');
      } else {
        console.log('⚠️ Window creation returned null (possibly non-Electron environment)');
      }

      this.isInitialized = true;
      console.log(`🎉 ${appPlugin.name} launched successfully`);

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
  console.log('🚀 launchApp function called');
  console.log(`📥 Received appPath: ${appPath}`);
  
  // Get app path from command line arguments if not provided
  if (!appPath) {
    const args = process.argv.slice(2);
    console.log(`📋 Command line args: ${JSON.stringify(args)}`);
    
    if (args.length === 0) {
      throw new Error('No app path specified. Usage: electron . <app-path>');
    }
    appPath = args[0];
    console.log(`📂 Using appPath from args: ${appPath}`);
  }

  // Resolve relative paths
  if (!path.isAbsolute(appPath)) {
    appPath = path.resolve(appPath);
    console.log(`🔗 Resolved absolute path: ${appPath}`);
  }

  // Check if app directory exists
  if (!fs.existsSync(appPath)) {
    console.error(`❌ App directory not found: ${appPath}`);
    throw new Error(`App directory not found: ${appPath}`);
  }
  console.log(`✅ App directory exists: ${appPath}`);

  // Create launcher instance
  console.log('🏗️ Creating launcher instance...');
  const launcher = new UniversalLauncher(appPath);

  // Set up Electron app event handlers
  console.log('⚡ Setting up Electron event handlers...');
  
  app.whenReady().then(async () => {
    console.log('🚀 Electron app is ready, starting initialization...');
    await launcher.initialize();
  });

  app.on('window-all-closed', () => {
    console.log('🪟 All windows closed');
    // On macOS, keep the app running even when all windows are closed
    if (process.platform !== 'darwin') {
      // Set a timeout to prevent hanging on quit
      setTimeout(() => {
        if (!launcher.isShuttingDown) {
          console.log('⏰ Force quitting after window close');
          process.exit(0);
        }
      }, 1000);
      app.quit();
    }
  });

  app.on('activate', async () => {
    console.log('🔄 App activated');
    // On macOS, re-create window when dock icon is clicked
    if (launcher.isInitialized && launcher.appManager) {
      const windows = launcher.appManager.mainWindow;
      if (!windows || windows.isDestroyed()) {
        await launcher.appManager.createMainWindow();
      }
    }
  });

  app.on('before-quit', async (event) => {
    console.log('🛑 App about to quit');
    // Prevent quit until cleanup is complete
    if (launcher.isInitialized && !launcher.isShuttingDown) {
      event.preventDefault();
      launcher.isShuttingDown = true;
      
      // Set a timeout to prevent hanging
      const cleanupTimeout = setTimeout(() => {
        console.log('⏰ Cleanup timeout, forcing quit');
        process.exit(0);
      }, 3000);
      
      try {
        await launcher.shutdown();
        console.log('✅ Cleanup completed');
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

  console.log('✅ Event handlers set up, returning launcher');
  return launcher;
}

module.exports = {
  UniversalLauncher,
  launchApp
};

// Auto-launch if this file is run directly
console.log('🔍 Checking if this is the main module...');
console.log(`require.main === module: ${require.main === module}`);
console.log(`require.main.filename: ${require.main ? require.main.filename : 'undefined'}`);
console.log(`module.filename: ${module.filename}`);

// Since Electron loads files differently, we'll launch regardless
console.log('🚀 Launching app regardless of main module check...');
launchApp(); 