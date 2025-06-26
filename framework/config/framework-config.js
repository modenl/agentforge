// Framework Configuration
// Default configuration settings for the Screen Control Agents framework

const path = require('path');
const os = require('os');

// Environment configuration
const isDev = process.env.NODE_ENV === 'development';

// Framework configuration
const FRAMEWORK_CONFIG = {
  // Framework metadata
  framework: {
    name: 'Screen Control Agents Framework',
    version: '1.0.0',
    isDev
  },

  // Window configuration
  window: {
    defaultWidth: 1200,
    defaultHeight: 800,
    minWidth: 800,
    minHeight: 600,
    minimizeToTray: true,
    icon: null,
    trayIcon: null,
    uiPath: null // Will be set based on environment
  },

  // Adaptive Card configuration
  adaptiveCard: {
    version: '1.6',
    fallbackText: 'This card requires a newer version to display properly.',
    speak: false,
    lang: 'en',
    enableCustomElements: true
  },

  // Logging configuration
  logging: {
    level: isDev ? 'debug' : 'info',
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

  // App system configuration
  apps: {
    autoLoadFromDirectory: false, // Set to true to auto-load apps from a directory
    appsDirectory: path.join(__dirname, '../../apps'),
    enableHotReload: isDev,
    sandboxApps: false // Set to true for app sandboxing (future feature)
  },

  // Storage configuration
  storage: {
    dataPath: isDev ?
      path.join(__dirname, '../../data') :
      path.join(os.homedir(), '.screen-control-agents'),

    // Data directories
    directories: {
      logs: 'logs',
      config: 'config',
      cache: 'cache',
      apps: 'apps',
      userdata: 'userdata'
    }
  },

  // IPC configuration
  ipc: {
    enableDebugLogging: isDev,
    timeout: 30000,
    retryAttempts: 3
  },

  // External services configuration
  services: {
    supabase: {
      enabled: false,
      url: null,
      anonKey: null
    }
  },

  // Development configuration
  development: {
    debugMode: isDev,
    mockData: false,
    skipAuthentication: false,
    logLevel: 'debug',
    hotReload: isDev,
    clearStatesOnStartup: true,
    enableDevTools: isDev
  },

  // Security configuration
  security: {
    enableCSP: true, // Content Security Policy
    allowEval: false,
    allowUnsafeInline: false,
    trustedDomains: [],
    maxRequestSize: '10MB'
  }
};

/**
 * Merge user configuration with framework defaults
 * @param {Object} userConfig - User-provided configuration
 * @returns {Object} Merged configuration
 */
function mergeConfig(userConfig = {}) {
  return deepMerge(FRAMEWORK_CONFIG, userConfig);
}

/**
 * Deep merge two objects
 * @param {Object} target - Target object
 * @param {Object} source - Source object
 * @returns {Object} Merged object
 */
function deepMerge(target, source) {
  const result = { ...target };

  for (const [key, value] of Object.entries(source)) {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      result[key] = deepMerge(target[key] || {}, value);
    } else {
      result[key] = value;
    }
  }

  return result;
}

/**
 * Validate configuration
 * @param {Object} config - Configuration to validate
 * @throws {Error} If configuration is invalid
 */
function validateConfig(config) {
  // Basic validation
  if (!config.window || !config.window.defaultWidth || !config.window.defaultHeight) {
    throw new Error('Window dimensions must be specified');
  }

  // Apps directory validation
  if (config.apps && config.apps.autoLoadFromDirectory) {
    const appsDir = config.apps.appsDirectory;
    if (!appsDir || typeof appsDir !== 'string') {
      throw new Error('Apps directory must be specified when auto-loading is enabled');
    }
  }
}

/**
 * Get environment-specific configuration
 * @param {string} env - Environment ('development', 'production', 'test')
 * @returns {Object} Environment-specific configuration overrides
 */
function getEnvironmentConfig(env = process.env.NODE_ENV || 'development') {
  const envConfigs = {
    development: {
      logging: { level: 'debug', logToConsole: true },
      development: { debugMode: true, enableDevTools: true },
      security: { enableCSP: false }
    },
    production: {
      logging: { level: 'info', logToConsole: false },
      development: { debugMode: false, enableDevTools: false },
      security: { enableCSP: true }
    },
    test: {
      logging: { level: 'warn', logToFile: false },
      development: { mockData: true, skipAuthentication: true },
      window: { defaultWidth: 800, defaultHeight: 600 }
    }
  };

  return envConfigs[env] || {};
}

module.exports = {
  FRAMEWORK_CONFIG,
  mergeConfig,
  validateConfig,
  getEnvironmentConfig,
  deepMerge
};
