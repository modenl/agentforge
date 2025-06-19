// Framework Core: Application Manager
// Manages Electron app lifecycle, plugin loading, and IPC communication

const { app, BrowserWindow, ipcMain, Menu, Tray, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs').promises;
const Store = require('electron-store');
const AutoLaunch = require('auto-launch');
const { createClient } = require('@supabase/supabase-js');

const CoreAgent = require('./core-agent');
const MCPExecutor = require('./mcp-executor');
const logger = require('./logger');

/**
 * Framework Application Manager
 * Handles Electron app lifecycle, plugin loading, and system integration
 */
class AppManager {
  constructor(config = {}) {
    this.config = {
      window: {
        defaultWidth: 1200,
        defaultHeight: 800,
        minWidth: 800,
        minHeight: 600,
        minimizeToTray: true,
        ...config.window
      },
      plugins: config.plugins || [],
      enableAutoLaunch: config.enableAutoLaunch !== false,
      supabase: config.supabase || {},
      ...config
    };

    this.mainWindow = null;
    this.tray = null;
    this.store = new Store();
    this.coreAgent = null;
    this.mcpExecutor = null;
    this.supabaseClient = null;
    this.autoLauncher = null;
    this.plugins = new Map();

    // Framework system state
    this.systemState = {
      systemReady: false,
      pluginsLoaded: false
    };
  }

  /**
   * Initialize the application
   */
  async initialize() {
    try {
      // Set up auto-launch if enabled
      if (this.config.enableAutoLaunch) {
        this.setupAutoLaunch();
      }

      // Initialize data storage
      await this.initializeStorage();

      // Load and initialize plugins
      await this.loadPlugins();

      // Initialize external services
      await this.initializeServices();

      // Set up IPC handlers
      this.setupIPC();

      this.systemState.systemReady = true;
      logger.info('Framework Application Manager initialized successfully');

      return true;
    } catch (error) {
      logger.error('Failed to initialize Framework Application Manager:', error);
      throw error;
    }
  }

  /**
   * Set up auto-launch functionality
   */
  setupAutoLaunch() {
    this.autoLauncher = new AutoLaunch({
      name: this.config.appName || 'Framework App',
      path: app.getPath('exe')
    });

    if (!app.isPackaged) {
      this.autoLauncher.enable().catch(err => {
        logger.warn('Failed to enable auto-launch:', err);
      });
    }
  }

  /**
   * Initialize storage directories
   */
  async initializeStorage() {
    const userDataPath = app.getPath('userData');
    const dataPath = path.join(userDataPath, 'data');
    const logsPath = path.join(dataPath, 'logs');
    const configPath = path.join(dataPath, 'config');
    const cachePath = path.join(dataPath, 'cache');
    const pluginsPath = path.join(dataPath, 'plugins');

    await fs.mkdir(dataPath, { recursive: true });
    await fs.mkdir(logsPath, { recursive: true });
    await fs.mkdir(configPath, { recursive: true });
    await fs.mkdir(cachePath, { recursive: true });
    await fs.mkdir(pluginsPath, { recursive: true });

    logger.info('Storage directories initialized');
  }

  /**
   * Load and initialize plugins
   */
  async loadPlugins() {
    logger.info(`Loading ${this.config.plugins.length} plugins...`);

    for (const PluginClass of this.config.plugins) {
      try {
        const plugin = new PluginClass(this);
        const pluginId = plugin.constructor.name;

        // Initialize the plugin
        await plugin.initialize();

        // Register plugin MCP actions
        const mcpActions = plugin.registerMCPActions();
        if (mcpActions && typeof mcpActions === 'object') {
          this.registerPluginMCPActions(pluginId, mcpActions);
        }

        this.plugins.set(pluginId, plugin);
        logger.info(`Plugin loaded: ${pluginId}`);
      } catch (error) {
        logger.error(`Failed to load plugin ${PluginClass.name}:`, error);
      }
    }

    this.systemState.pluginsLoaded = true;
    logger.info('All plugins loaded successfully');
  }

  /**
   * Register MCP actions from a plugin
   */
  registerPluginMCPActions(pluginId, actions) {
    if (!this.mcpExecutor) {
      logger.warn(`Cannot register MCP actions for ${pluginId}: MCPExecutor not initialized`);
      return;
    }

    for (const [actionName, handler] of Object.entries(actions)) {
      this.mcpExecutor.registerAction(actionName, handler, pluginId);
    }
  }

  /**
   * Initialize external services
   */
  async initializeServices() {
    // Initialize Supabase client if configured
    if (this.config.supabase.url && this.config.supabase.anonKey) {
      try {
        this.supabaseClient = createClient(
          this.config.supabase.url,
          this.config.supabase.anonKey
        );
        logger.info('Supabase client initialized');
      } catch (error) {
        logger.warn('Supabase initialization failed:', error.message);
      }
    }

    // Initialize MCP Executor
    this.mcpExecutor = new MCPExecutor(this.supabaseClient, logger);

    // Initialize Core Agent
    this.coreAgent = new CoreAgent(this.config.agent || {});

    // Collect business prompts from all plugins
    const businessPrompts = [];
    for (const plugin of this.plugins.values()) {
      if (typeof plugin.getBusinessPrompt === 'function') {
        businessPrompts.push(plugin.getBusinessPrompt());
      }
    }

    // Initialize core agent with combined prompts
    const initSuccess = await this.coreAgent.initialize(businessPrompts);
    if (!initSuccess) {
      throw new Error('Failed to initialize Core Agent');
    }

    logger.info('Framework services initialized');
  }

  /**
   * Set up IPC communication handlers
   */
  setupIPC() {
    // Main communication interface - process all user input through CoreAgent
    ipcMain.handle('core:processInput', async(event, userInput, context) => {
      logger.info(`Processing input: "${userInput.substring(0, 30)}..."`);

      try {
        const startTime = Date.now();
        const response = await this.coreAgent.processInput(userInput, context);
        const duration = Date.now() - startTime;

        logger.info(`Processing completed in ${duration}ms`);

        // Execute MCP actions if any
        if (response.mcp_actions && response.mcp_actions.length > 0) {
          await this.executeMCPActions(response.mcp_actions);
          response.new_state = this.coreAgent.getCurrentState();
        }

        return response;
      } catch (error) {
        logger.error('Core agent processing error:', error);
        return { success: false, error: error.message };
      }
    });

    // Streaming input processing
    ipcMain.handle('core:processInputStreaming', async(event, userInput, context, listenerId) => {
      try {
        const streamCallback = (chunkData) => {
          event.sender.send(`stream-chunk-${listenerId}`, chunkData);
        };

        const response = await this.coreAgent.processInputStreaming(userInput, context, streamCallback);

        // Execute MCP actions if any
        if (response.mcp_actions && response.mcp_actions.length > 0) {
          await this.executeMCPActions(response.mcp_actions);
          response.new_state = this.coreAgent.getCurrentState();
        }

        return response;
      } catch (error) {
        logger.error('Streaming processing error:', error);
        return { success: false, error: error.message };
      }
    });

    // Get chat history
    ipcMain.handle('core:getVisibleHistory', async() => {
      return this.coreAgent.getVisibleChatHistory();
    });

    logger.info('IPC handlers set up');
  }

  /**
   * Execute MCP actions
   */
  async executeMCPActions(actions) {
    for (const action of actions) {
      try {
        await this.mcpExecutor.execute(action.action, action.params, action.role || 'Agent');
      } catch (error) {
        logger.error(`MCP action failed: ${action.action}`, error);
      }
    }
  }

  /**
   * Create the main application window
   */
  async createMainWindow() {
    this.mainWindow = new BrowserWindow({
      width: this.config.window.defaultWidth,
      height: this.config.window.defaultHeight,
      minWidth: this.config.window.minWidth,
      minHeight: this.config.window.minHeight,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, '../renderer/preload.js')
      },
      show: false,
      icon: this.config.window.icon
    });

    // Load the application UI
    const isDev = process.env.NODE_ENV === 'development';
    const uiPath = this.config.window.uiPath ||
      (isDev ? 'http://localhost:3000' : path.join(__dirname, '../renderer/index.html'));

    await this.mainWindow.loadURL(uiPath);

    this.mainWindow.once('ready-to-show', () => {
      this.mainWindow.show();
    });

    // Create tray if enabled
    if (this.config.window.minimizeToTray) {
      this.createTray();
    }

    // Handle window events
    this.mainWindow.on('minimize', () => {
      if (this.config.window.minimizeToTray && this.tray) {
        this.mainWindow.hide();
      }
    });

    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });

    logger.info('Main window created');
    return this.mainWindow;
  }

  /**
   * Create system tray
   */
  createTray() {
    const iconPath = this.config.window.trayIcon ||
      path.join(__dirname, '../assets/tray-icon.png');

    try {
      this.tray = new Tray(iconPath);

      const contextMenu = Menu.buildFromTemplate([
        {
          label: 'Show App',
          click: () => {
            this.mainWindow.show();
          }
        },
        {
          label: 'Quit',
          click: () => {
            app.quit();
          }
        }
      ]);

      this.tray.setContextMenu(contextMenu);
      this.tray.setToolTip(this.config.appName || 'Framework App');

      this.tray.on('click', () => {
        this.mainWindow.show();
      });

      logger.info('System tray created');
    } catch (error) {
      logger.warn('Failed to create system tray:', error);
    }
  }

  /**
   * Get plugin by ID
   */
  getPlugin(pluginId) {
    return this.plugins.get(pluginId);
  }

  /**
   * Get all loaded plugins
   */
  getPlugins() {
    return Array.from(this.plugins.values());
  }

  /**
   * Cleanup resources
   */
  async cleanup() {
    try {
      // Cleanup plugins
      for (const plugin of this.plugins.values()) {
        if (typeof plugin.cleanup === 'function') {
          await plugin.cleanup();
        }
      }

      // Cleanup core services
      if (this.coreAgent && typeof this.coreAgent.cleanup === 'function') {
        await this.coreAgent.cleanup();
      }

      if (this.mcpExecutor && typeof this.mcpExecutor.cleanup === 'function') {
        await this.mcpExecutor.cleanup();
      }

      logger.info('Framework cleanup completed');
    } catch (error) {
      logger.error('Framework cleanup error:', error);
    }
  }
}

module.exports = AppManager;
