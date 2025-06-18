const path = require('path');
const os = require('os');

// 环境配置
const isDev = process.env.NODE_ENV === 'development';

// 应用配置
const APP_CONFIG = {
  // 基础配置
  app: {
    name: '儿童游戏时间管理',
    version: '1.0.0',
    isDev,
    dataPath: isDev ? path.join(__dirname, '../data') : path.join(os.homedir(), '.game-time-manager')
  },

  // UI配置
  ui: {
    window: {
      defaultWidth: 1200,
      defaultHeight: 800,
      minWidth: 800,
      minHeight: 600,
      minimizeToTray: true
    },
    adaptiveCardSettings: {
      version: '1.4',
      fallbackText: 'This card requires a newer version to display properly.',
      speak: false,
      lang: 'en'
    }
  },

  // 日志配置
  logging: {
    level: 'info',
    maxFileSize: '10MB',
    maxFiles: 5,
    logToFile: true,
    logToConsole: true,
    categories: {
      system: true,
      security: true,
      usage: true,
      errors: true,
      performance: true,
      audit: true
    }
  },

  // AI Agent配置 - 单一CoreAgent
  agents: {
    defaults: {
      model: 'gpt-4.1',
      temperature: 0.7,
      maxTokens: 16384,
      maxHistoryMessages: 50,
      enableStream: true,
      timeout: 30000,
      retryAttempts: 3
    }
  },

  // 开发配置
  development: {
    debugMode: false,
    mockData: false,
    skipAuthentication: false,
    logLevel: 'debug',
    hotReload: false,
    clearStatesOnStartup: true
  }
};

module.exports = {
  APP_CONFIG
};
