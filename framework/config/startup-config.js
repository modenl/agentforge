// Startup Configuration
// Centralized configuration for app selection and startup behavior

const path = require('path');
const fs = require('fs');

// Load user app configuration if available
let userConfig = {};
const userConfigPath = path.resolve(__dirname, '../../app.config.js');
if (fs.existsSync(userConfigPath)) {
  userConfig = require(userConfigPath);
}

// Load environment variables if available
require('dotenv').config();

module.exports = {
  // Default app to launch (priority: env > user config > default)
  defaultApp: process.env.DEFAULT_APP || userConfig.defaultApp || 'game-time-manager',
  
  // Available apps configuration
  availableApps: {
    'game-time-manager': {
      name: 'Game Time Manager',
      description: 'AI-powered children\'s game time management system',
      path: 'apps/game-time-manager',
      icon: '🎮'
    },
    'chess-game': {
      name: 'Chess Game',
      description: 'Play chess against an intelligent AI opponent',
      path: 'apps/chess-game',
      icon: '♟️'
    }
  },
  
  // Startup options
  options: {
    // Auto-build before starting (for development)
    autoBuild: process.env.AUTO_BUILD === 'true' || userConfig.options?.autoBuild || false,
    
    // Use smart build when auto-building
    smartBuild: process.env.SMART_BUILD === 'true' || userConfig.options?.smartBuild || false,
    
    // Node environment
    nodeEnv: process.env.NODE_ENV || userConfig.options?.nodeEnv || 'development',
    
    // Enable debug logging
    debug: process.env.DEBUG === 'true' || userConfig.options?.debug || false,
    
    // Enable dev tools
    devTools: (process.env.NODE_ENV || userConfig.options?.nodeEnv || 'development') === 'development'
  }
}; 