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

    // Initialize MCP Executor first (before loading plugins)
    await this.initializeMCPExecutor();

    // Load and initialize plugins
    await this.loadPlugins();

    // Initialize remaining services (Core Agent, etc.)
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
    // Skip auto-launch setup in non-Electron environment
    if (!this.isElectronEnvironment()) {
      logger.info('Skipping auto-launch setup (non-Electron environment)');
      return;
    }

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
    let dataPath;

    if (this.isElectronEnvironment()) {
      const userDataPath = app.getPath('userData');
      dataPath = path.join(userDataPath, 'data');
    } else {
      // Use local directory for non-Electron environment
      dataPath = path.join(process.cwd(), 'data');
    }

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

    // Collect business prompts from all plugins
    const businessPrompts = [];
    console.log(`📄 Collecting business prompts from ${this.plugins.size} plugins...`);
    
    for (const plugin of this.plugins.values()) {
      if (typeof plugin.getBusinessPrompt === 'function') {
        try {
          const prompt = await plugin.getBusinessPrompt();
          console.log(`✅ Got business prompt from ${plugin.id || 'unnamed'}: ${prompt ? prompt.length : 0} chars`);
          
          if (prompt) {
            businessPrompts.push(prompt);
          }
        } catch (error) {
          logger.warn(`Failed to get business prompt from ${plugin.constructor.name}:`, error);
        }
      } else {
        console.log(`⚠️ Plugin ${plugin.id || 'unnamed'} has no getBusinessPrompt method`);
      }
    }

    console.log(`📋 Total business prompts collected: ${businessPrompts.length}`);
    if (businessPrompts.length > 0) {
      console.log(`📝 Combined prompt length: ${businessPrompts.join('\n\n').length} chars`);
    }
  }

  /**
   * Register MCP actions from a plugin
   */
  registerPluginMCPActions(pluginId, actions) {
    if (!this.mcpExecutor) {
      logger.warn(`Cannot register MCP actions for ${pluginId}: MCPExecutor not initialized`);
      return;
    }

    logger.info(`Registering MCP actions for plugin ${pluginId}: ${Object.keys(actions)}`);

    for (const [actionName, handler] of Object.entries(actions)) {
      logger.info(`Registering MCP action: ${actionName} for plugin ${pluginId}`);
      this.mcpExecutor.registerAction(actionName, handler, pluginId);
    }
    
    logger.info(`Completed registering ${Object.keys(actions).length} MCP actions for plugin ${pluginId}`);
  }

  /**
   * Initialize MCP Executor
   * This must be done before loading plugins so that MCP actions can be registered
   */
  async initializeMCPExecutor() {
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
    logger.info('MCP Executor initialized');
  }

  /**
   * Initialize remaining services
   */
  async initializeServices() {
    // Initialize Core Agent
    this.coreAgent = new CoreAgent(this.config.agent || {});

    // Collect business prompts from all plugins
    const businessPrompts = [];
    console.log(`📄 Collecting business prompts from ${this.plugins.size} plugins...`);
    
    for (const plugin of this.plugins.values()) {
      if (typeof plugin.getBusinessPrompt === 'function') {
        try {
          const prompt = await plugin.getBusinessPrompt();
          console.log(`✅ Got business prompt from ${plugin.id || 'unnamed'}: ${prompt ? prompt.length : 0} chars`);
          
          if (prompt) {
            businessPrompts.push(prompt);
          }
        } catch (error) {
          logger.warn(`Failed to get business prompt from ${plugin.constructor.name}:`, error);
        }
      } else {
        console.log(`⚠️ Plugin ${plugin.id || 'unnamed'} has no getBusinessPrompt method`);
      }
    }

    console.log(`📋 Total business prompts collected: ${businessPrompts.length}`);
    if (businessPrompts.length > 0) {
      console.log(`📝 Combined prompt length: ${businessPrompts.join('\n\n').length} chars`);
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
    // Skip IPC setup in non-Electron environment
    if (!this.isElectronEnvironment()) {
      logger.info('Skipping IPC setup (non-Electron environment)');
      return;
    }

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
          const mcpResults = await this.executeMCPActions(response.mcp_actions);
          response.mcp_results = mcpResults;
          response.new_variables = this.coreAgent.getCurrentVariables();
          
          // 特殊处理：如果MCP结果包含SVG，直接插入到消息中
          this.injectMCPResultsIntoAIResponse(response, mcpResults);
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
          const mcpResults = await this.executeMCPActions(response.mcp_actions);
          response.mcp_results = mcpResults;
          response.new_variables = this.coreAgent.getCurrentVariables();
          
          // 特殊处理：如果MCP结果包含SVG，直接插入到消息中
          this.injectMCPResultsIntoAIResponse(response, mcpResults);
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

    // Get current state/variables
    ipcMain.handle('core:getState', async() => {
      try {
        return {
          agent_state: this.coreAgent.getCurrentVariables(),
          timestamp: new Date().toISOString()
        };
      } catch (error) {
        logger.error('Failed to get core state:', error);
        return { agent_state: null, timestamp: new Date().toISOString() };
      }
    });

    logger.info('IPC handlers set up');
  }

  /**
   * Execute MCP actions
   */
  async executeMCPActions(actions) {
    const results = [];
    
    // Debug: List all registered actions
    const registeredActions = this.mcpExecutor.getRegisteredActions();
    logger.info(`All registered MCP actions (${registeredActions.length}): ${registeredActions.join(', ')}`);
    
    // Filter out invalid actions and log details
    const validActions = [];
    const invalidActions = [];
    
    for (let i = 0; i < actions.length; i++) {
      const action = actions[i];
      if (!action || typeof action !== 'object') {
        invalidActions.push({ index: i, reason: 'not an object', action });
        continue;
      }
      if (!action.action || typeof action.action !== 'string') {
        invalidActions.push({ index: i, reason: 'invalid action field', action });
        continue;
      }
      validActions.push(action);
    }
    
    if (invalidActions.length > 0) {
      logger.warn(`Found ${invalidActions.length} invalid actions:`);
      invalidActions.forEach(({ index, reason, action }) => {
        logger.warn(`  Action ${index}: ${reason} - ${JSON.stringify(action)}`);
      });
    }
    
    logger.info(`Processing ${validActions.length} valid actions out of ${actions.length} total actions`);
    
    for (const action of validActions) {
      try {
        logger.info(`Attempting to execute MCP action: ${action.action}`);
        const result = await this.mcpExecutor.execute(action.action, action.parameters || action.params, action.role || 'Agent');
        results.push({
          action: action.action,
          success: true,
          result: result
        });
        
        // Log the result for debugging
        logger.info(`MCP action ${action.action} completed successfully`);
        
      } catch (error) {
        logger.error(`MCP action failed: ${action.action}`, error);
        results.push({
          action: action.action,
          success: false,
          error: error.message
        });
      }
    }
    
    return results;
  }

  /**
   * Inject MCP results into AI response
   * This works by re-extracting the visible message from the original AI response after SVG injection
   */
  injectMCPResultsIntoAIResponse(response, mcpResults) {
    if (!mcpResults || mcpResults.length === 0) {
      logger.info('No MCP results to inject');
      return;
    }

    logger.info(`Processing ${mcpResults.length} MCP results for injection`);
    
    // We need to get the original AI response with SYSTEMOUTPUT included
    // Since we don't have direct access to it here, we'll enhance the existing message
    for (const mcpResult of mcpResults) {
      logger.info(`MCP result: action=${mcpResult.action}, success=${mcpResult.success}, hasSVG=${!!(mcpResult.result && mcpResult.result.svg)}`);
      
      if (mcpResult.success && mcpResult.result && mcpResult.result.svg) {
        const svgContent = mcpResult.result.svg;
        logger.info(`SVG content length: ${svgContent.length} characters`);
        
        // Check current message content
        const messageSnippet = response.message ? response.message.substring(0, 200) : 'NO MESSAGE';
        logger.info(`Message snippet: ${messageSnippet}...`);
        
        // Since the message has already been processed, we need to append SVG
        // The placeholder replacement approach won't work here because extractVisibleMessage has already run
        logger.info('Appending SVG to processed message');
        response.message = (response.message || '') + '\n\n**当前棋盘状态：**\n\n' + svgContent;
        logger.info(`SVG appended to message, final length: ${response.message.length} characters`);
      }
    }
  }

  /**
   * Check if running in Electron environment
   */
  isElectronEnvironment() {
    // Check if we have access to Electron APIs
    try {
      return !!(process.versions && process.versions.electron && require('electron'));
    } catch (error) {
      return false;
    }
  }

  /**
   * Create the main application window
   */
  async createMainWindow() {
    // Skip window creation in non-Electron environment
    if (!this.isElectronEnvironment()) {
      logger.info('Skipping window creation (non-Electron environment)');
      logger.info('Framework is ready for programmatic use');
      return null;
    }

    logger.info('Starting to create main window...');

    this.mainWindow = new BrowserWindow({
      title: this.config.appName || 'Framework App',
      width: this.config.window.defaultWidth,
      height: this.config.window.defaultHeight,
      minWidth: this.config.window.minWidth,
      minHeight: this.config.window.minHeight,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, '../renderer/preload.js')
      },
      show: true,
      icon: this.config.window.icon
    });

    logger.info('BrowserWindow created, preparing to load UI...');

    // Load the application UI
    const isDev = process.env.NODE_ENV === 'development';
    let uiPath = this.config.window.uiPath ||
      (isDev ? 'http://localhost:3000' : path.join(__dirname, '../renderer/index.html'));

    // Convert file path to file:// URL if needed
    if (uiPath && !uiPath.startsWith('http') && !uiPath.startsWith('file://')) {
      uiPath = `file://${path.resolve(uiPath)}`;
    }

    logger.info(`UI path resolved to: ${uiPath}`);
    
    // Check if UI file exists (for file:// URLs)
    if (uiPath.startsWith('file://')) {
      const filePath = uiPath.replace('file://', '');
      const fs = require('fs');
      if (!fs.existsSync(filePath)) {
        logger.error(`UI file not found: ${filePath}`);
        throw new Error(`UI file not found: ${filePath}`);
      }
      logger.info(`UI file exists: ${filePath}`);
    }

    try {
      await this.mainWindow.loadURL(uiPath);
      logger.info('UI loaded successfully');
      
      // Set the correct window title after UI loads
      this.mainWindow.setTitle(this.config.appName || 'Framework App');
      logger.info(`Window title set to: ${this.config.appName || 'Framework App'}`);
      
      // Open DevTools if enabled
      if (this.config.window.enableDevTools) {
        this.mainWindow.webContents.openDevTools();
        logger.info('DevTools opened');
      }
      
      // Set app name in the renderer process
      await this.mainWindow.webContents.executeJavaScript(`
        window.appName = '${this.config.appName || 'Framework App'}';
        document.title = '${this.config.appName || 'Framework App'}';
        console.log('App name set to:', window.appName);
      `);
      logger.info('App name injected into renderer process');
    } catch (error) {
      logger.error('Failed to load UI:', error);
      throw error;
    }

    this.mainWindow.once('ready-to-show', () => {
      logger.info('Window is ready to show');
      this.mainWindow.show();
    });

    // Add error event listeners
    this.mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
      logger.error(`Failed to load URL: ${validatedURL}, Error: ${errorCode} - ${errorDescription}`);
    });

    this.mainWindow.webContents.on('crashed', (event, killed) => {
      logger.error('Renderer process crashed, killed:', killed);
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

    logger.info('Main window created and configured');
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
            // Let the launcher handle the quit process
            if (this.mainWindow && !this.mainWindow.isDestroyed()) {
              this.mainWindow.close();
            } else {
              app.quit();
            }
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
      logger.info('Starting framework cleanup...');
      
      // Set a timeout for the entire cleanup process
      const cleanupPromise = this.performCleanup();
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Cleanup timeout')), 2000);
      });
      
      await Promise.race([cleanupPromise, timeoutPromise]);
      logger.info('Framework cleanup completed');
    } catch (error) {
      logger.error('Framework cleanup error:', error);
      // Don't throw, just log the error to prevent hanging
    }
  }
  
  async performCleanup() {
    // Cleanup plugins
    for (const plugin of this.plugins.values()) {
      if (typeof plugin.cleanup === 'function') {
        try {
          await plugin.cleanup();
        } catch (error) {
          logger.error(`Plugin cleanup error for ${plugin.name}:`, error);
        }
      }
    }

    // Cleanup core services
    if (this.coreAgent && typeof this.coreAgent.cleanup === 'function') {
      try {
        await this.coreAgent.cleanup();
      } catch (error) {
        logger.error('Core agent cleanup error:', error);
      }
    }

    if (this.mcpExecutor && typeof this.mcpExecutor.cleanup === 'function') {
      try {
        await this.mcpExecutor.cleanup();
      } catch (error) {
        logger.error('MCP executor cleanup error:', error);
      }
    }
  }
}

module.exports = AppManager;
