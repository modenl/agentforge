// Game Time Manager Plugin
// Business plugin for managing children's game time with AI assistance

const fs = require('fs').promises;
const path = require('path');

// Import MCP action handlers
const ChromeController = require('./mcp-actions/chrome-controller');
const GameLauncher = require('./mcp-actions/game-launcher');
const SystemMonitor = require('./mcp-actions/system-monitor');
const NotificationSystem = require('./mcp-actions/notification');

/**
 * Game Time Manager Plugin
 * Provides AI-driven game time management with parental controls
 */
class GameTimeManagerPlugin {
  constructor(framework) {
    this.framework = framework;
    this.chromeController = new ChromeController();
    this.gameLauncher = new GameLauncher();
    this.systemMonitor = new SystemMonitor();
    this.notificationSystem = new NotificationSystem();

    this.pluginConfig = null;
    this.businessPrompt = null;
  }

  /**
   * Initialize the plugin
   */
  async initialize() {
    try {
      // Load plugin configuration
      await this.loadPluginConfig();

      // Load business prompt
      await this.loadBusinessPrompt();

      // Initialize sub-systems
      await this.chromeController.initialize();
      await this.gameLauncher.initialize();
      await this.systemMonitor.initialize();
      await this.notificationSystem.initialize();

      this.framework.logger.info('Game Time Manager Plugin initialized successfully');
      return true;
    } catch (error) {
      this.framework.logger.error('Failed to initialize Game Time Manager Plugin:', error);
      throw error;
    }
  }

  /**
   * Load plugin configuration
   */
  async loadPluginConfig() {
    const configPath = path.join(__dirname, 'config/plugin-config.js');
    try {
      delete require.cache[require.resolve(configPath)]; // Clear cache for hot reload
      this.pluginConfig = require(configPath);
    } catch (error) {
      this.framework.logger.warn('Failed to load plugin config, using defaults');
      this.pluginConfig = this.getDefaultConfig();
    }
  }

  /**
   * Load business prompt
   */
  async loadBusinessPrompt() {
    const promptPath = path.join(__dirname, 'prompts/business-prompt.md');
    try {
      this.businessPrompt = await fs.readFile(promptPath, 'utf8');
    } catch (error) {
      this.framework.logger.error('Failed to load business prompt:', error);
      throw error;
    }
  }

  /**
   * Register MCP actions for this plugin
   */
  registerMCPActions() {
    return {
      // Game management actions
      'launch_game': this.handleLaunchGame.bind(this),
      'close_game': this.handleCloseGame.bind(this),
      'monitor_game_process': this.handleMonitorGameProcess.bind(this),

      // Chrome control actions
      'list_chrome_tabs': this.handleListChromeTabs.bind(this),
      'activate_chrome_tab': this.handleActivateChromeTab.bind(this),
      'evaluate_in_chrome': this.handleEvaluateInChrome.bind(this),

      // System monitoring actions
      'monitor_system_integrity': this.handleMonitorSystemIntegrity.bind(this),
      'track_time_usage': this.handleTrackTimeUsage.bind(this),
      'check_network_connectivity': this.handleCheckNetworkConnectivity.bind(this),

      // Notification actions
      'send_notification': this.handleSendNotification.bind(this),

      // Data management actions
      'sync_with_supabase': this.handleSyncWithSupabase.bind(this),
      'read_local_data': this.handleReadLocalData.bind(this),
      'write_local_data': this.handleWriteLocalData.bind(this),

      // System control actions
      'execute_system_command': this.handleExecuteSystemCommand.bind(this),
      'manage_windows_service': this.handleManageWindowsService.bind(this),
      'send_telemetry': this.handleSendTelemetry.bind(this),
      'update_time_quota': this.handleUpdateTimeQuota.bind(this)
    };
  }

  /**
   * Get business prompt for this plugin
   */
  getBusinessPrompt() {
    return this.businessPrompt;
  }

  /**
   * Get plugin configuration
   */
  getConfig() {
    return this.pluginConfig;
  }

  /**
   * Get default configuration
   */
  getDefaultConfig() {
    return {
      gameTimeQuota: {
        dailyMinutes: 120,
        weeklyMinutes: 600,
        extendedBreakMinutes: 15,
        shortBreakMinutes: 5
      },
      parentalControls: {
        requirePassword: true,
        defaultPassword: 'parent123',
        lockdownMode: false
      },
      quizSystem: {
        enabled: true,
        difficulty: 'medium',
        timeRewardPerCorrectAnswer: 10,
        maxTimeRewardPerSession: 30
      },
      games: {
        allowedGames: ['minecraft', 'bloxd'],
        gameExecutables: {
          minecraft: 'minecraft.exe',
          bloxd: 'chrome.exe'
        },
        gameUrls: {
          bloxd: 'https://bloxd.io/'
        }
      },
      monitoring: {
        checkIntervalSeconds: 60,
        enableProcessMonitoring: true,
        enableNetworkMonitoring: false
      }
    };
  }

  // MCP Action Handlers

  async handleLaunchGame(params, role) {
    return await this.gameLauncher.launch_game(params, role);
  }

  async handleCloseGame(params, role) {
    return await this.chromeController.close_game(params, role);
  }

  async handleMonitorGameProcess(params, role) {
    return await this.systemMonitor.monitor_game_process(params, role);
  }

  async handleListChromeTabs(params, role) {
    return await this.chromeController.list_chrome_tabs(params, role);
  }

  async handleActivateChromeTab(params, role) {
    return await this.chromeController.activate_chrome_tab(params, role);
  }

  async handleEvaluateInChrome(params, role) {
    return await this.chromeController.evaluate_in_chrome(params, role);
  }

  async handleMonitorSystemIntegrity(params, role) {
    return await this.systemMonitor.monitor_system_integrity(params, role);
  }

  async handleTrackTimeUsage(params, role) {
    return await this.systemMonitor.track_time_usage(params, role);
  }

  async handleCheckNetworkConnectivity(params, role) {
    return await this.systemMonitor.check_network_connectivity(params, role);
  }

  async handleSendNotification(params, role) {
    return await this.notificationSystem.send_notification(params, role);
  }

  async handleSyncWithSupabase(params, role) {
    return await this.systemMonitor.sync_with_supabase(params, role);
  }

  async handleReadLocalData(params, role) {
    return await this.systemMonitor.read_local_data(params, role);
  }

  async handleWriteLocalData(params, role) {
    return await this.systemMonitor.write_local_data(params, role);
  }

  async handleExecuteSystemCommand(params, role) {
    return await this.systemMonitor.execute_system_command(params, role);
  }

  async handleManageWindowsService(params, role) {
    return await this.systemMonitor.manage_windows_service(params, role);
  }

  async handleSendTelemetry(params, role) {
    return await this.systemMonitor.send_telemetry(params, role);
  }

  async handleUpdateTimeQuota(params, role) {
    return await this.systemMonitor.update_time_quota(params, role);
  }

  /**
   * Plugin cleanup
   */
  async cleanup() {
    try {
      await this.chromeController.cleanup();
      await this.gameLauncher.cleanup();
      await this.systemMonitor.cleanup();
      await this.notificationSystem.cleanup();

      this.framework.logger.info('Game Time Manager Plugin cleanup completed');
    } catch (error) {
      this.framework.logger.error('Game Time Manager Plugin cleanup error:', error);
    }
  }
}

module.exports = GameTimeManagerPlugin;
