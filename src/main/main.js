// Load environment variables
require('dotenv').config();

const { app, BrowserWindow, ipcMain, dialog, Menu, Tray, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs').promises;
const cron = require('node-cron');
const Store = require('electron-store');
const AutoLaunch = require('auto-launch');
const { createClient } = require('@supabase/supabase-js');

// Import our modules
const { APP_CONFIG } = require('../config/config');
const MCPServer = require('./mcp-server');
const CoreAgent = require('./core-agent'); // 新的核心Agent
const logger = require('./logger');

// Import plugins
const GameTimeManagerPlugin = require('../../plugins/game-time-manager/plugin');
const ChessGamePlugin = require('../../plugins/chess-game/plugin');

class GameTimeManagerApp {
  constructor() {
    this.mainWindow = null;
    this.tray = null;
    this.store = new Store();
    this.mcpServer = null;
    this.coreAgent = null; // 替换原来的agentManager
    this.supabaseClient = null;
    this.autoLauncher = null;

    // 插件系统
    this.plugins = new Map();
    this.currentPlugin = null;

    // 最小化系统状态 - 主要状态由 LLM 管理
    this.systemState = {
      systemReady: false,
      pluginsLoaded: false
    };
  }

  async initializeApp() {
    try {
      // Set up auto-launch
      this.setupAutoLaunch();

      // Initialize data storage
      await this.initializeStorage();

      // Initialize plugins
      await this.initializePlugins();

      // Initialize external services
      await this.initializeServices();

      // Set up scheduled tasks
      this.setupScheduledTasks();

      // Set up IPC handlers
      this.setupIPC();

      this.systemState.systemReady = true;
      logger.info('Game Time Manager App initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize app:', error);
      throw error;
    }
  }

  setupAutoLaunch() {
    this.autoLauncher = new AutoLaunch({
      name: 'Children Game Time Manager',
      path: app.getPath('exe')
    });

    // Enable auto-launch in production
    if (!app.isPackaged) {
      this.autoLauncher.enable().catch(err => {
        logger.warn('Failed to enable auto-launch:', err);
      });
    }
  }

  async initializeStorage() {
    // Ensure data directories exist
    const dataPath = path.join(app.getPath('userData'), 'data');
    const logsPath = path.join(dataPath, 'logs');
    const configPath = path.join(dataPath, 'config');
    const cachePath = path.join(dataPath, 'cache');

    await fs.mkdir(dataPath, { recursive: true });
    await fs.mkdir(logsPath, { recursive: true });
    await fs.mkdir(configPath, { recursive: true });
    await fs.mkdir(cachePath, { recursive: true });

    logger.info('Storage directories initialized');
  }

  async initializePlugins() {
    try {
      logger.info('Loading plugins...');

      // Load configured plugins
      const enabledPlugins = APP_CONFIG.plugins?.enabled || [];
      const pluginClasses = {
        'GameTimeManagerPlugin': GameTimeManagerPlugin,
        'ChessGamePlugin': ChessGamePlugin
      };

      for (const pluginName of enabledPlugins) {
        const PluginClass = pluginClasses[pluginName];
        if (PluginClass) {
          const plugin = new PluginClass();
          await plugin.initialize();

          this.plugins.set(pluginName, plugin);
          logger.info(`Plugin loaded: ${pluginName}`);
        } else {
          logger.warn(`Plugin not found: ${pluginName}`);
        }
      }

      // Set default plugin
      const defaultPlugin = APP_CONFIG.plugins?.defaultPlugin || 'GameTimeManagerPlugin';
      this.currentPlugin = this.plugins.get(defaultPlugin);

      this.systemState.pluginsLoaded = true;
      logger.info(`Plugins loaded successfully. Default plugin: ${defaultPlugin}`);
    } catch (error) {
      logger.error('Failed to initialize plugins:', error);
      throw error;
    }
  }

  async initializeServices() {
    // Initialize Supabase client (optional)
    if (process.env.SUPABASE_URL &&
      process.env.SUPABASE_ANON_KEY &&
      process.env.SUPABASE_URL !== 'your_supabase_project_url_here' &&
      process.env.SUPABASE_ANON_KEY !== 'your_supabase_anon_key_here') {
      try {
        this.supabaseClient = createClient(
          process.env.SUPABASE_URL,
          process.env.SUPABASE_ANON_KEY
        );
        logger.info('Supabase client initialized');
      } catch (error) {
        logger.warn('Supabase initialization failed, running in offline mode:', error.message);
      }
    } else {
      logger.info('Supabase not configured, running in offline mode');
    }

    // Initialize MCP server
    this.mcpServer = new MCPServer(this.supabaseClient, logger);

    // Initialize Core Agent (single LLM)
    this.coreAgent = new CoreAgent();

    // Load business prompt from current plugin
    let businessPrompt = '';
    if (this.currentPlugin && typeof this.currentPlugin.getBusinessPrompt === 'function') {
      businessPrompt = await this.currentPlugin.getBusinessPrompt();
      logger.info('Using business prompt from current plugin');
    } else {
      // Fallback to default business prompt
      const businessPromptPath = path.join(__dirname, '../prompts/business-prompt.md');
      businessPrompt = await fs.readFile(businessPromptPath, 'utf8');
      logger.info('Using default business prompt');
    }

    const initSuccess = await this.coreAgent.initialize([businessPrompt]);
    if (!initSuccess) {
      throw new Error('Failed to initialize Core Agent');
    }

    // Set up event listeners
    this.setupEventListeners();

    logger.info('Services initialized');
  }

  setupEventListeners() {
    // MCP server events
    this.mcpServer.on('performance_warning', (data) => {
      this.handlePerformanceWarning(data);
    });

    this.mcpServer.on('security_violation', (data) => {
      this.handleSecurityViolation(data);
    });
  }

  setupScheduledTasks() {
    // Weekly reset task (Sunday at midnight)
    cron.schedule('0 0 * * 0', () => {
      this.performWeeklyReset();
    });

    // Hourly sync task
    cron.schedule('0 * * * *', () => {
      this.performDataSync();
    });

    // Time tracking task (every minute)
    cron.schedule('* * * * *', () => {
      this.updateTimeTracking();
    });

    // System monitoring task (every 5 minutes)
    cron.schedule('*/5 * * * *', () => {
      this.performSystemCheck();
    });

    logger.info('Scheduled tasks set up');
  }

  setupIPC() {
    // 主要通信接口 - 通过CoreAgent处理所有用户输入
    ipcMain.handle('core:processInput', async(event, userInput, context) => {
      console.log('📡 [IPC] 收到请求 |', `输入: "${userInput.substring(0, 30)}..." | 上下文: ${Object.keys(context).join(',')}`);
      console.log('🔍 [DEBUG_IPC] 开始处理 IPC 请求');
      console.log('🔍 [DEBUG_IPC] 用户输入:', userInput);
      console.log('🔍 [DEBUG_IPC] 上下文:', JSON.stringify(context, null, 2));

      try {
        const startTime = Date.now();
        console.log('🔍 [DEBUG_IPC] 调用 coreAgent.processInput...');

        const response = await this.coreAgent.processInput(userInput, context);
        const duration = Date.now() - startTime;

        console.log('🔍 [DEBUG_IPC] coreAgent.processInput 完成，耗时:', duration + 'ms');
        console.log('🔍 [DEBUG_IPC] 响应:', JSON.stringify(response, null, 2));

        // 📝 记录原始响应内容
        if (response.raw_response) {
          console.log('📡 [IPC] raw_response:', response.raw_response);
        }

        console.log('📡 [IPC] 处理完成 |', `耗时: ${duration}ms | 成功: ${response.success} | 消息: ${response.message?.length || 0}字 | 操作: ${response.mcp_actions?.length || 0}个`);

        // 如果有MCP操作，执行它们
        if (response.mcp_actions && response.mcp_actions.length > 0) {
          console.log('🔍 [DEBUG_IPC] 执行 MCP 操作:', response.mcp_actions.length, '个');
          await this.executeMCPActions(response.mcp_actions);
          console.log('🔍 [DEBUG_IPC] MCP 操作执行完成');

          // MCP 操作执行完成后，更新响应中的状态为当前实际状态
          response.new_state = this.coreAgent.getCurrentVariables();
          console.log('🔍 [DEBUG_IPC] 同步状态完成:', response.new_state);
        }

        console.log('🔍 [DEBUG_IPC] 返回响应给前端');
        return response;
      } catch (error) {
        console.error('📡 [IPC] ❌ 错误 |', error.message);
        console.error('🔍 [DEBUG_IPC] 错误详情:', error.stack);
        logger.error('Core agent processing error:', error);
        return { success: false, error: error.message };
      }
    });

    // 流式处理用户输入 - 支持实时响应显示
    ipcMain.handle('core:processInputStreaming', async(event, userInput, context, listenerId) => {
      console.log('🌊 [IPC] 流式请求 |', `输入: "${userInput.substring(0, 30)}..." | 监听器: ${listenerId}`);

      try {
        const startTime = Date.now();

        // 创建流式回调函数
        const streamCallback = (chunkData) => {
          // 发送流式数据块到前端
          event.sender.send(`stream-chunk-${listenerId}`, chunkData);
        };

        // 调用流式处理
        const response = await this.coreAgent.processInputStreaming(userInput, context, streamCallback);
        const duration = Date.now() - startTime;

        console.log('🌊 [IPC] 流式完成 |', `耗时: ${duration}ms | 成功: ${response.success}`);

        // 输出完整的流式响应（包括 raw_response）
        console.log('🔍 [STREAM_DEBUG] 流式响应详情:', JSON.stringify(response, null, 2));

        // 📝 记录流式原始响应内容
        if (response.raw_response) {
          console.log('🌊 [IPC] streaming raw_response:', response.raw_response);
        }

        // 如果有MCP操作，执行它们
        if (response.mcp_actions && response.mcp_actions.length > 0) {
          await this.executeMCPActions(response.mcp_actions);

          // MCP 操作执行完成后，更新响应中的状态为当前实际状态
          response.new_state = this.coreAgent.getCurrentVariables();
        }

        return response;
      } catch (error) {
        console.error('🌊 [IPC] ❌ 流式错误 |', error.message);
        logger.error('Core agent streaming processing error:', error);
        return { success: false, error: error.message };
      }
    });

    // 获取当前状态
    ipcMain.handle('core:getState', () => {
      return {
        agent_state: this.coreAgent.getCurrentVariables()
        // app_data 已废弃，system_state 已简化，主要状态由 agent_state 承载
      };
    });

    // 获取可见聊天历史
    ipcMain.handle('core:getVisibleHistory', () => {
      return this.coreAgent.getVisibleChatHistory();
    });

    // 获取可用插件列表
    ipcMain.handle('core:getPlugins', async(event) => {
      try {
        const pluginList = Array.from(this.plugins.entries()).map(([name, plugin]) => {
          const config = plugin.getConfig ? plugin.getConfig() : {};
          return {
            id: name,
            name: config.pluginName || name,
            description: config.description || '',
            version: config.version || '1.0.0',
            isActive: this.currentPlugin === plugin
          };
        });
        return pluginList;
      } catch (error) {
        logger.error('Failed to get plugins:', error);
        return [];
      }
    });

    // 切换插件
    ipcMain.handle('core:switchPlugin', async(event, pluginId) => {
      try {
        const plugin = this.plugins.get(pluginId);
        if (plugin) {
          this.currentPlugin = plugin;

          // 重新加载业务提示
          let businessPrompt = '';
          if (typeof plugin.getBusinessPrompt === 'function') {
            businessPrompt = await plugin.getBusinessPrompt();
          }

          // 重新初始化CoreAgent
          await this.coreAgent.initialize([businessPrompt]);

          logger.info(`Switched to plugin: ${pluginId}`);
          return { success: true, pluginId };
        } else {
          return { success: false, error: 'Plugin not found' };
        }
      } catch (error) {
        logger.error('Failed to switch plugin:', error);
        return { success: false, error: error.message };
      }
    });

    // 系统事件通知
    ipcMain.handle('system:notify', async(event, eventType, eventData) => {
      try {
        // 将系统事件发送给CoreAgent处理
        const systemMessage = `系统事件: ${eventType} - ${JSON.stringify(eventData)}`;
        return await this.coreAgent.processInput(systemMessage, {
          isSystemEvent: true,
          eventType,
          eventData
        });
      } catch (error) {
        logger.error('System event processing error:', error);
        return { success: false, error: error.message };
      }
    });

    // MCP相关IPC
    ipcMain.handle('mcp:getData', async(event, query) => {
      try {
        return await this.mcpServer.handleDataQuery(query);
      } catch (error) {
        logger.error('MCP data query error:', error);
        return { success: false, error: error.message };
      }
    });

    ipcMain.handle('mcp:execute', async(event, action) => {
      try {
        return await this.mcpServer.executeAction(action);
      } catch (error) {
        logger.error('MCP action execution error:', error);
        return { success: false, error: error.message };
      }
    });

    logger.info('IPC handlers set up');
  }

  // 执行MCP操作
  async executeMCPActions(actions) {
    for (const action of actions) {
      try {
        logger.info('Executing MCP action:', action);

        switch (action.action || action.type) {
        // 新的MCP action支持
        case 'launch_game': {
          const launchResult = await this.mcpServer.launch_game(action.params, 'Agent');
          logger.info('Game launched:', launchResult);

          // Update Core Agent state to reflect game is running
          const gameVariablesUpdate = {
            state: 'game_running',
            game_id: action.params.game_id,
            game_start_time: new Date().toISOString(),
            game_process_id: launchResult.process_id || launchResult.processId,
            game_url: action.params.args && action.params.args[0] ? action.params.args[0] : undefined,
            chrome_tab_method: launchResult.method || 'unknown'
          };

          // Add Chrome-specific fields if applicable
          if (launchResult.tabId) {
            gameVariablesUpdate.tab_id = launchResult.tabId;
          }
          if (launchResult.debugPort) {
            gameVariablesUpdate.debug_port = launchResult.debugPort;
          }

          this.coreAgent.setVariables(gameVariablesUpdate);
          logger.info('Core Agent state updated: game launched');
          break;
        }

        case 'monitor_game_process': {
          const monitorResult = await this.mcpServer.monitor_game_process(action.params, 'Agent');
          logger.info('Game process status:', monitorResult);
          break;
        }

        case 'close_game': {
          // 确保 close_game action 包含当前状态的所有必要信息
          const currentVariables = this.coreAgent.getCurrentVariables();
          const enhancedParams = {
            ...action.params,
            // 从当前状态补充缺失的信息
            game_id: action.params.game_id || currentVariables.game_id,
            tab_id: action.params.tab_id || currentVariables.tab_id,
            process_id: action.params.process_id || currentVariables.game_process_id,
            game_url: action.params.game_url || currentVariables.game_url,
            chrome_tab_method: action.params.chrome_tab_method || currentVariables.chrome_tab_method
          };
          
          logger.info(`Executing close_game with enhanced params: ${JSON.stringify(enhancedParams)}`);
          const closeResult = await this.mcpServer.close_game(enhancedParams, 'Agent');
          logger.info('Game closed:', closeResult);

          // Update Core Agent state to reflect game is no longer running
          if (currentVariables.state === 'game_running') {
            // Reset state to idle and remove game-specific fields
            this.coreAgent.setVariables({
              state: 'child_idle',
              // Remove game-specific fields
              game_id: undefined,
              game_start_time: undefined,
              game_process_id: undefined,
              game_url: undefined,
              chrome_tab_method: undefined,
              tab_id: undefined
            });

            logger.info('Core Agent state updated: game ended, back to idle');
          }
          break;
        }

        case 'send_notification': {
          const notifyResult = await this.mcpServer.send_notification(action.params, 'Agent');
          logger.info('Notification sent:', notifyResult);
          break;
        }

        case 'stop_game': {
          // stop_game action需要从当前状态获取游戏信息并关闭
          const currentVariables = this.coreAgent.getCurrentVariables();
          if (currentVariables.state === 'game_running' && currentVariables.game_id) {
            const closeParams = {
              game_id: currentVariables.game_id,
              process_id: currentVariables.game_process_id, // 可选，如果有的话
              game_url: currentVariables.game_url, // 游戏URL，用于Chrome标签页识别
              chrome_tab_method: currentVariables.chrome_tab_method, // 启动方式，决定关闭策略
              tab_id: currentVariables.tab_id // 重要：传递 tab_id 用于 Chrome 标签页关闭
            };
            
            logger.info(`Attempting to close game with params: ${JSON.stringify(closeParams)}`);
            const closeResult = await this.mcpServer.close_game(closeParams, 'Agent');
            logger.info('Game stopped:', closeResult);
            
            // 更新状态：移除 tab_id 字段
            this.coreAgent.setVariables({
              state: 'child_idle',
              // Remove game-specific fields
              game_id: undefined,
              game_start_time: undefined,
              game_process_id: undefined,
              game_url: undefined,
              chrome_tab_method: undefined,
              tab_id: undefined
            });
            
            logger.info('Core Agent state updated: game ended, back to idle');
          } else {
            logger.warn('stop_game called but no game is currently running');
          }
          break;
        }

        // 兼容旧的中文action类型
        case '启动游戏':
          await this.mcpServer.startGameMonitoring(action.params);
          break;

        case '关闭游戏':
          await this.mcpServer.stopGameMonitoring(action.params);
          break;

        case '查询数据':
          // 查询操作通常不需要执行，数据已在状态中
          break;

        default:
          logger.warn('Unknown MCP action type:', action.action || action.type);
        }
      } catch (error) {
        logger.error('Error executing MCP action:', action, error);
      }
    }
  }

  async createMainWindow() {
    this.mainWindow = new BrowserWindow({
      width: APP_CONFIG.ui.window.defaultWidth,
      height: APP_CONFIG.ui.window.defaultHeight,
      minWidth: APP_CONFIG.ui.window.minWidth,
      minHeight: APP_CONFIG.ui.window.minHeight,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        enableRemoteModule: false,
        preload: path.join(__dirname, '../renderer/preload.js')
      },
      icon: path.join(__dirname, '../../assets/icon.png'),
      show: true,
      titleBarStyle: 'default',
      autoHideMenuBar: !APP_CONFIG.app.isDev
    });

    // Load the Svelte frontend
    const htmlPath = path.join(__dirname, '../renderer/index-svelte.html');
    logger.info(`Loading HTML file: ${htmlPath}`);

    await this.mainWindow.loadFile(htmlPath);
    logger.info('HTML file loaded successfully');

    // 监听渲染进程的控制台消息
    this.mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
      const levelMap = { 0: 'INFO', 1: 'WARN', 2: 'ERROR' };
      const logLevel = levelMap[level] || level;
      logger.info(`[RENDERER-${logLevel}] ${message} (${sourceId}:${line})`);
    });

    // 监听渲染进程的错误
    this.mainWindow.webContents.on('crashed', () => {
      logger.error('Renderer process crashed');
    });

    // 窗口准备就绪后显示
    this.mainWindow.once('ready-to-show', () => {
      logger.info('Window ready-to-show event fired');
      this.mainWindow.show();

      // 发送初始化完成事件
      this.mainWindow.webContents.send('system:initialized', {
        state: this.coreAgent.getCurrentVariables()
      });
    });

    // 添加错误处理
    this.mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
      logger.error(`Window failed to load: ${errorCode} - ${errorDescription}`);
    });

    this.mainWindow.webContents.on('crashed', () => {
      logger.error('Window renderer process crashed');
    });

    // 窗口关闭处理
    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });

    logger.info('Main window created');
  }

  createTray() {
    if (this.tray) return;

    const iconPath = path.join(__dirname, '../../assets/tray-icon.png');
    const trayIcon = nativeImage.createFromPath(iconPath);

    this.tray = new Tray(trayIcon.resize({ width: 16, height: 16 }));

    const contextMenu = Menu.buildFromTemplate([
      {
        label: '显示主窗口',
        click: () => {
          if (this.mainWindow) {
            this.mainWindow.show();
          } else {
            this.createMainWindow();
          }
        }
      },
      {
        label: '退出',
        click: () => {
          app.quit();
        }
      }
    ]);

    this.tray.setToolTip('儿童游戏时间管理');
    this.tray.setContextMenu(contextMenu);

    this.tray.on('click', () => {
      if (this.mainWindow) {
        this.mainWindow.show();
      } else {
        this.createMainWindow();
      }
    });

    logger.info('System tray created');
  }

  async performWeeklyReset() {
    try {
      logger.info('Performing weekly reset...');

      // 通知CoreAgent系统重置 - 让LLM处理重置逻辑
      await this.coreAgent.processInput('系统执行周重置', {
        isSystemEvent: true,
        eventType: 'weekly_reset'
      });

      logger.info('Weekly reset completed');
    } catch (error) {
      logger.error('Weekly reset failed:', error);
    }
  }

  async performDataSync() {
    try {
      if (!this.supabaseClient) return;

      logger.info('Performing data sync...');
      await this.coreAgent.processInput('系统执行数据同步', {
        isSystemEvent: true,
        eventType: 'data_sync'
      });

      logger.info('Data sync completed');
    } catch (error) {
      logger.error('Data sync failed:', error);
    }
  }

  async updateTimeTracking() {
    try {
      const currentVariables = this.coreAgent.getCurrentVariables();

      // 只有在游戏运行时才进行时间跟踪
      if (currentVariables.state === 'game_running') {
        // 让LLM处理时间跟踪逻辑，包括超时检查
        await this.coreAgent.processInput('系统执行时间跟踪检查', {
          isSystemEvent: true,
          eventType: 'time_tracking_check'
        });
      }
    } catch (error) {
      logger.error('Time tracking update failed:', error);
    }
  }

  async performSystemCheck() {
    try {
      // 执行系统检查
      const systemInfo = await this.mcpServer.getSystemInfo();

      // 如果有异常，通知CoreAgent
      if (systemInfo.anomalies && systemInfo.anomalies.length > 0) {
        await this.coreAgent.processInput('系统检测到异常', {
          isSystemEvent: true,
          eventType: 'system_anomaly',
          eventData: systemInfo.anomalies
        });
      }
    } catch (error) {
      logger.error('System check failed:', error);
    }
  }

  async handlePerformanceWarning(data) {
    logger.warn('Performance warning:', data);
    // 可以通知CoreAgent处理性能警告
  }

  async handleSecurityViolation(data) {
    logger.error('Security violation detected:', data);
    // 通知CoreAgent处理安全违规
    await this.coreAgent.processInput('检测到安全违规', {
      isSystemEvent: true,
      eventType: 'security_violation',
      eventData: data
    });
  }

  async cleanup() {
    try {
      logger.info('Cleaning up application...');

      if (this.mcpServer) {
        await this.mcpServer.cleanup();
      }

      if (this.tray) {
        this.tray.destroy();
      }

      logger.info('Application cleanup completed');
    } catch (error) {
      logger.error('Cleanup failed:', error);
    }
  }
}

// 应用程序实例
let gameApp = null;

// 应用程序事件处理
app.whenReady().then(async() => {
  try {
    gameApp = new GameTimeManagerApp();
    await gameApp.initializeApp();
    await gameApp.createMainWindow();
    gameApp.createTray();

    logger.info('Application started successfully');
  } catch (error) {
    logger.error('Application startup failed:', error);
    dialog.showErrorBox('启动失败', `应用程序启动失败: ${error.message}`);
    app.quit();
  }
});

app.on('window-all-closed', () => {
  // 在macOS上，保持应用运行
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', async() => {
  if (BrowserWindow.getAllWindows().length === 0) {
    await gameApp.createMainWindow();
  }
});

app.on('before-quit', async() => {
  if (gameApp) {
    await gameApp.cleanup();
  }
});

// 处理未捕获的异常
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled rejection at:', promise, 'reason:', reason);
});

module.exports = GameTimeManagerApp;
