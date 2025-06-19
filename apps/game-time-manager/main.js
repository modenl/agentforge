// Game Time Manager Application
// Main entry point for the game time management application

// Load environment variables
require('dotenv').config();

const { app } = require('electron');
const path = require('path');

// Import framework and plugin
const AppManager = require('../../framework/core/app-manager');
const GameTimeManagerPlugin = require('../../plugins/game-time-manager/plugin');
const { mergeConfig, validateConfig } = require('../../framework/config/framework-config');

/**
 * Application configuration
 * Merges framework defaults with app-specific settings
 */
const appConfig = mergeConfig({
  // Application metadata
  appName: 'Game Time Manager',
  version: '1.0.0',

  // Window configuration
  window: {
    defaultWidth: 1200,
    defaultHeight: 800,
    minimizeToTray: true,
    icon: path.join(__dirname, 'assets/icon.png'),
    trayIcon: path.join(__dirname, 'assets/tray-icon.png'),
    uiPath: path.join(__dirname, 'renderer/index.html')
  },

  // AI Agent configuration
  agent: {
    model: 'gpt-4.1', // Can be overridden via environment variable
    temperature: 0.7,
    maxTokens: 8192,
    maxHistoryMessages: 50
  },

  // Plugin configuration
  plugins: [GameTimeManagerPlugin],

  // External services
  services: {
    supabase: {
      enabled: !!(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY),
      url: process.env.SUPABASE_URL,
      anonKey: process.env.SUPABASE_ANON_KEY
    }
  },

  // Auto-launch configuration
  enableAutoLaunch: true,

  // Development settings
  development: {
    enableDevTools: process.env.NODE_ENV === 'development'
  }
});

/**
 * Application class
 * Manages the Game Time Manager application lifecycle
 */
class GameTimeManagerApp {
  constructor() {
    this.appManager = null;
    this.isInitialized = false;
  }

  /**
   * Initialize the application
   */
  async initialize() {
    try {
      // Validate configuration
      validateConfig(appConfig);

      // Create and initialize the application manager
      this.appManager = new AppManager(appConfig);
      await this.appManager.initialize();

      // Create the main window
      await this.appManager.createMainWindow();

      this.isInitialized = true;
      console.log('Game Time Manager Application initialized successfully');

      return true;
    } catch (error) {
      console.error('Failed to initialize Game Time Manager Application:', error);

      // Show error dialog to user
      const { dialog } = require('electron');
      dialog.showErrorBox(
        'Initialization Error',
        `Failed to start Game Time Manager:\n\n${error.message}\n\nPlease check your configuration and try again.`
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
      console.log('Game Time Manager Application shutdown completed');
    } catch (error) {
      console.error('Error during application shutdown:', error);
    }
  }
}

// Create application instance
const gameTimeManagerApp = new GameTimeManagerApp();

// Electron app event handlers
app.whenReady().then(async() => {
  await gameTimeManagerApp.initialize();
});

app.on('window-all-closed', () => {
  // On macOS, keep the app running even when all windows are closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', async() => {
  // On macOS, re-create window when dock icon is clicked
  if (gameTimeManagerApp.isInitialized && gameTimeManagerApp.appManager) {
    const windows = gameTimeManagerApp.appManager.mainWindow;
    if (!windows || windows.isDestroyed()) {
      await gameTimeManagerApp.appManager.createMainWindow();
    }
  }
});

app.on('before-quit', async(event) => {
  // Prevent quit until cleanup is complete
  if (gameTimeManagerApp.isInitialized) {
    event.preventDefault();
    await gameTimeManagerApp.shutdown();
    app.quit();
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);

  const { dialog } = require('electron');
  dialog.showErrorBox(
    'Unexpected Error',
    `An unexpected error occurred:\n\n${error.message}\n\nThe application will now exit.`
  );

  app.quit();
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Export for testing
module.exports = { GameTimeManagerApp, appConfig };
