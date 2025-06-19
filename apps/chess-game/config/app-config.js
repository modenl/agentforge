module.exports = {
  appName: 'AI Chess Game',
  appVersion: '1.0.0',
  description: 'Play chess against an intelligent AI opponent',

  // AI配置
  ai: {
    model: 'gpt-4o',
    temperature: 0.3,
    maxTokens: 4000,
    systemRole: 'chess_master'
  },

  // 窗口配置
  window: {
    title: 'AI Chess Game - Human vs AI',
    width: 1000,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    resizable: true,
    center: true
  },

  // 游戏配置
  game: {
    playerColor: 'white',
    aiColor: 'black',
    timeControl: null, // 无时间限制
    difficulty: 'master',
    autoSave: true,
    showAnalysis: true
  },

  // UI配置
  ui: {
    theme: 'classic',
    showCoordinates: true,
    highlightLastMove: true,
    animateMovement: true,
    soundEffects: false
  }
};
