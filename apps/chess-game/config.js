// Chess Game - Application Configuration
const path = require('path');

module.exports = {
  // Application metadata
  appName: 'AI Chess Game',
  version: '1.0.0',
  description: 'Play chess against an intelligent AI opponent',

  // Window configuration
  window: {
    defaultWidth: 1000,
    defaultHeight: 800,
    minimizeToTray: false,
    resizable: true,
    enableDevTools: true,  // 启用开发者工具
    uiPath: path.join(__dirname, '../../framework/renderer/index.html')
  },

  // AI Agent configuration
  agent: {
    model: 'gpt-4.1-mini',
    temperature: 0.7,
    maxTokens: 32768,
    maxHistoryMessages: 100,
    promptFile: 'chess-game-prompt.md',
    // 象棋应用的初始变量
    initialVariables: {
      // 状态机
      state: 'game_menu',
      
      // 棋局核心
      boardState: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR',  // 使用标准FEN格式
      current_player: 'white',  // 白方先走（标准国际象棋规则）
      
      // 游戏状态
      game_status: 'active',
      game_result: null,
      
      // 走法记录
      move_history: [],
      last_move: null,
      
      // 用户配置
      player_color: 'white',   // 用户执白棋
      ai_difficulty: 'medium'
    }
  },

  // App-specific settings
  gameSettings: {
    playerColor: 'white',
    aiColor: 'black',
    difficulty: 'master',
    showAnalysis: true
  }
}; 