// Framework Core: Application Manager
// Manages Electron app lifecycle, plugin loading, and IPC communication

const { app, BrowserWindow, ipcMain, Menu, Tray, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs').promises;
const Store = require('electron-store');
const AutoLaunch = require('auto-launch');
const { createClient } = require('@supabase/supabase-js');

const CoreAgent = require('./core-agent');
const { MCPManager } = require('../mcp');
const logger = require('./logger');

/**
 * Framework Application Manager
 * Handles Electron app lifecycle, plugin loading, and system integration
 */
class AppManager {
  constructor(config = {}) {
    console.log('[AppManager] Constructor received config:', JSON.stringify(config, null, 2));
    
    // First preserve the original config values
    const originalAppName = config.appName;
    
    this.config = {
      ...config,  // Spread config first to get all properties
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
      supabase: config.supabase || {}
    };
    
    // Ensure appName is preserved
    if (originalAppName) {
      this.config.appName = originalAppName;
    } else if (!this.config.appName) {
      this.config.appName = 'Framework App';
    }
    
    console.log('[AppManager] Final config.appName:', this.config.appName);

    this.mainWindow = null;
    this.tray = null;
    this.store = new Store();
    this.coreAgent = null;
    this.mcpManager = null;
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
   * Clear WebView cache
   * Clears both default session and MCP partition caches
   */
  async clearWebViewCache() {
    try {
      const { session } = require('electron');
      // Clear default session cache
      await session.defaultSession.clearCache();
      // Clear MCP partition cache
      const mcpSession = session.fromPartition('persist:mcp');
      await mcpSession.clearCache();
      logger.info('WebView cache cleared');
      return { success: true };
    } catch (error) {
      logger.error('Failed to clear WebView cache:', error);
      return { success: false, error: error.message };
    }
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

    // Initialize MCP Manager first (before loading plugins)
    await this.initializeMCPManager();

    // Load and initialize plugins
    await this.loadPlugins();

    // Register MCP server configurations (but don't connect yet)
    await this.registerMCPServerConfigs();

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

        // Register plugin MCP tools
        const mcpTools = plugin.registerMCPTools();
        if (mcpTools && typeof mcpTools === 'object') {
          this.registerPluginMCPTools(pluginId, mcpTools);
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
   * Register MCP tools from a plugin
   */
  registerPluginMCPTools(pluginId, tools) {
    if (!this.mcpManager || !this.mcpManager.isReady()) {
      logger.warn(`Cannot register MCP tools for ${pluginId}: MCP Manager not ready`);
      return;
    }

    logger.info(`Registering MCP tools for plugin ${pluginId}: ${Object.keys(tools)}`);

    for (const [toolName, handler] of Object.entries(tools)) {
      logger.info(`Registering MCP tool: ${toolName} for plugin ${pluginId}`);
      this.mcpManager.registerMCPTool(toolName, handler, pluginId);
    }
    
    logger.info(`Completed registering ${Object.keys(tools).length} MCP tools for plugin ${pluginId}`);
  }

  /**
   * Initialize MCP Manager
   * This must be done before loading plugins so that MCP tools can be registered
   */
  async initializeMCPManager() {
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

    // Initialize MCP Manager
    this.mcpManager = new MCPManager(logger);
    await this.mcpManager.initialize(this.supabaseClient);
    logger.info('MCP Manager initialized');
    
    // Listen for MCP Manager events and forward to renderer
    this.mcpManager.on('server-iframe-available', (data) => {
      logger.info('MCP server UI available:', data);
      // Forward to all renderer windows
      if (this.mainWindow && !this.mainWindow.isDestroyed()) {
        this.mainWindow.webContents.send('mcp:server-iframe-ready', {
          serverName: data.serverName,
          iframeConfig: data.config
        });
      }
    });
    
    this.mcpManager.on('server-stopped', (data) => {
      logger.info('MCP server stopped:', data);
      // Forward to all renderer windows
      if (this.mainWindow && !this.mainWindow.isDestroyed()) {
        this.mainWindow.webContents.send('mcp:server-stopped', data);
      }
    });
  }

  /**
   * Register MCP server configurations without connecting
   */
  async registerMCPServerConfigs() {
    logger.info('Registering MCP server configurations...');
    
    if (!this.mcpManager || !this.mcpManager.isReady()) {
      logger.warn('MCP Manager not ready, skipping MCP server registration');
      return;
    }
    
    // Register MCP server configurations from framework config
    if (this.config.mcpServers && typeof this.config.mcpServers === 'object') {
      this.mcpManager.registerServerConfigs('framework', this.config.mcpServers);
    }
    
    // Register MCP server configurations from plugin configs
    for (const plugin of this.plugins.values()) {
      const pluginId = plugin.id || plugin.constructor.name;
      if (plugin.config && plugin.config.mcpServers && typeof plugin.config.mcpServers === 'object') {
        this.mcpManager.registerServerConfigs(pluginId, plugin.config.mcpServers);
      }
    }
    
    logger.info(`Registered ${this.mcpManager.serverConfigs.size} MCP server configurations`);
  }

  /**
   * Connect to external MCP servers from application configurations
   * @deprecated Use lazy loading instead - servers connect on first use
   */
  async connectExternalMCPServers() {
    logger.info('Registering and connecting to external MCP servers...');
    
    if (!this.mcpManager || !this.mcpManager.isReady()) {
      logger.warn('MCP Manager not ready, skipping MCP server connections');
      return;
    }
    
    // Register MCP server configurations from framework config
    if (this.config.mcpServers && typeof this.config.mcpServers === 'object') {
      this.mcpManager.registerServerConfigs('framework', this.config.mcpServers);
    }
    
    // Register MCP server configurations from plugin configs
    for (const plugin of this.plugins.values()) {
      const pluginId = plugin.id || plugin.constructor.name;
      if (plugin.config && plugin.config.mcpServers && typeof plugin.config.mcpServers === 'object') {
        this.mcpManager.registerServerConfigs(pluginId, plugin.config.mcpServers);
      }
    }
    
    // Connect to all registered servers
    const connectionResult = await this.mcpManager.connectAllServers();
    
    if (connectionResult) {
      const { successCount, failureCount } = connectionResult;
      logger.info(`MCP server connections completed: ${successCount} successful, ${failureCount} failed`);
      
      // Log summary of connected servers
      const connectedServers = this.mcpManager.getConnectedServersSummary();
      if (connectedServers.length > 0) {
        logger.info('Connected MCP servers summary:');
        for (const server of connectedServers) {
          logger.info(`  - ${server.name} (${server.appId}): ${server.tools} tools, ${server.resources} resources, ${server.prompts} prompts`);
        }
      }
    }
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

    // Initialize core agent with combined prompts and MCP manager
    const initSuccess = await this.coreAgent.initialize(businessPrompts, this.mcpManager);
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

        // Execute MCP tools if any
        if (response.mcp_tools && response.mcp_tools.length > 0) {
          const mcpResults = await this.executeMCPTools(response.mcp_tools);
          response.mcp_results = mcpResults;
          response.new_variables = this.coreAgent.getCurrentVariables();
          
          // 特殊处理：如果MCP结果包含SVG，直接插入到消息中
          this.injectMCPResultsIntoAIResponse(response, mcpResults);
          
          // 检查MCP结果中是否有iframe_config
          for (const mcpResult of mcpResults) {
            if (mcpResult.success && mcpResult.result && mcpResult.result.iframe_config) {
              logger.info('Found iframe_config in MCP result:', mcpResult.result.iframe_config);
              // 如果AI没有提供iframe_config，使用MCP工具返回的
              if (!response.iframe_config) {
                response.iframe_config = mcpResult.result.iframe_config;
              }
              break; // 只使用第一个iframe_config
            }
          }
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

        // Execute MCP tools if any
        if (response.mcp_tools && response.mcp_tools.length > 0) {
          const mcpResults = await this.executeMCPTools(response.mcp_tools);
          response.mcp_results = mcpResults;
          response.new_variables = this.coreAgent.getCurrentVariables();
          
          // 特殊处理：如果MCP结果包含SVG，直接插入到消息中
          this.injectMCPResultsIntoAIResponse(response, mcpResults);
          
          // 检查MCP结果中是否有iframe_config
          for (const mcpResult of mcpResults) {
            if (mcpResult.success && mcpResult.result && mcpResult.result.iframe_config) {
              logger.info('Found iframe_config in MCP result:', mcpResult.result.iframe_config);
              // 如果AI没有提供iframe_config，使用MCP工具返回的
              if (!response.iframe_config) {
                response.iframe_config = mcpResult.result.iframe_config;
              }
              break; // 只使用第一个iframe_config
            }
          }
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
    
    // Get iframe configuration for a server
    ipcMain.handle('mcp:getServerIframeConfig', async(event, serverName) => {
      try {
        if (!this.mcpManager || !this.mcpManager.isReady()) {
          return null;
        }
        return this.mcpManager.getServerIframeConfig(serverName);
      } catch (error) {
        logger.error('Failed to get server iframe config:', error);
        return null;
      }
    });
    
    // Get all iframe-capable servers
    ipcMain.handle('mcp:getIframeCapableServers', async() => {
      try {
        if (!this.mcpManager || !this.mcpManager.isReady()) {
          return [];
        }
        return this.mcpManager.getIframeCapableServers();
      } catch (error) {
        logger.error('Failed to get iframe capable servers:', error);
        return [];
      }
    });
    
    // Start a specific MCP server
    ipcMain.handle('mcp:startServer', async(event, serverName) => {
      try {
        if (!this.mcpManager || !this.mcpManager.isReady()) {
          return { success: false, error: 'MCP Manager not ready' };
        }
        const result = await this.mcpManager.startServer(serverName);
        
        // If server has iframe capability, notify renderer
        if (result.success && result.iframeConfig) {
          event.sender.send('mcp:server-iframe-ready', {
            serverName,
            iframeConfig: result.iframeConfig
          });
        }
        
        return result;
      } catch (error) {
        logger.error('Failed to start MCP server:', error);
        return { success: false, error: error.message };
      }
    });
    
    // Stop a specific MCP server
    ipcMain.handle('mcp:stopServer', async(event, serverName) => {
      try {
        if (!this.mcpManager || !this.mcpManager.isReady()) {
          return { success: false, error: 'MCP Manager not ready' };
        }
        const result = await this.mcpManager.stopServer(serverName);
        
        // Notify renderer to close iframe if exists
        if (result.success) {
          event.sender.send('mcp:server-stopped', { serverName });
        }
        
        return result;
      } catch (error) {
        logger.error('Failed to stop MCP server:', error);
        return { success: false, error: error.message };
      }
    });

    // Clear WebView cache handler
    ipcMain.handle('webview:clearCache', async(event) => {
      return await this.clearWebViewCache();
    });
    
    // Set window title handler
    ipcMain.handle('window:setTitle', async(event, title) => {
      if (this.mainWindow && !this.mainWindow.isDestroyed()) {
        this.mainWindow.setTitle(title);
        logger.info(`Window title set to: ${title}`);
        return true;
      }
      return false;
    });

    logger.info('IPC handlers set up');
  }

  /**
   * Execute MCP tools
   */
  async executeMCPTools(tools) {
    const results = [];
    
    if (!this.mcpManager || !this.mcpManager.isReady()) {
      logger.warn('MCP Manager not ready, skipping MCP tools');
      return results;
    }

    // Debug: List all registered tools
    const registeredTools = this.mcpManager.mcpExecutor.getRegisteredActions();
    logger.info(`All registered MCP tools (${registeredTools.length}): ${registeredTools.join(', ')}`);
    
    // Filter out invalid tools and log details
    const validTools = [];
    const invalidTools = [];
    
    for (let i = 0; i < tools.length; i++) {
      const tool = tools[i];
      if (!tool || typeof tool !== 'object') {
        invalidTools.push({ index: i, reason: 'not an object', tool });
        continue;
      }
      if (!tool.action || typeof tool.action !== 'string') {
        invalidTools.push({ index: i, reason: 'invalid action field', tool });
        continue;
      }
      validTools.push(tool);
    }
    
    if (invalidTools.length > 0) {
      logger.warn(`Found ${invalidTools.length} invalid tools:`);
      invalidTools.forEach(({ index, reason, tool }) => {
        logger.warn(`  Tool ${index}: ${reason} - ${JSON.stringify(tool)}`);
      });
    }
    
    logger.info(`Processing ${validTools.length} valid tools out of ${tools.length} total tools`);
    
    for (const tool of validTools) {
      try {
        logger.info(`Attempting to execute MCP tool: ${tool.action}`);
        const result = await this.mcpManager.executeMCPTool(tool.action, tool.parameters || tool.params, tool.role || 'Agent');
        results.push({
          action: tool.action,
          success: true,
          result: result
        });
        
        // Log the result for debugging
        logger.info(`MCP tool ${tool.action} completed successfully`);
        
      } catch (error) {
        logger.error(`MCP tool failed: ${tool.action}`, error);
        results.push({
          action: tool.action,
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

    // Determine if we're in development mode
    const isDev = process.env.NODE_ENV === 'development' || process.env.DEV_MODE === 'true';
    
    logger.info('Starting to create main window...');
    logger.info('Creating window with title:', this.config.appName);

    this.mainWindow = new BrowserWindow({
      title: this.config.appName || 'Framework App',
      width: this.config.window.defaultWidth,
      height: this.config.window.defaultHeight,
      minWidth: this.config.window.minWidth,
      minHeight: this.config.window.minHeight,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, '../renderer/preload.js'),
        webviewTag: true, // Enable webview tag for MCP View
        // Enable dev tools in dev mode
        devTools: isDev || this.config.window.enableDevTools !== false
      },
      show: true,
      icon: this.config.window.icon
    });

    logger.info('BrowserWindow created, preparing to load UI...');

    // Load the application UI
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
      logger.info(`About to set window title. this.config.appName = "${this.config.appName}"`);
      const titleToSet = this.config.appName || 'Framework App';
      this.mainWindow.setTitle(titleToSet);
      logger.info(`Window title set to: ${titleToSet}`);
      
      // Open DevTools if explicitly enabled
      if (this.config.window.enableDevTools) {
        this.mainWindow.webContents.openDevTools();
        logger.info('DevTools opened (explicitly enabled)');
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

    // 立即最大化窗口
    this.mainWindow.maximize();
    logger.info('Window maximized');
    
    this.mainWindow.once('ready-to-show', () => {
      logger.info('Window is ready to show');
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
