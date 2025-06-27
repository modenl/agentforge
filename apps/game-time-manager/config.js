// Game Time Manager - Application Configuration
const path = require('path');

module.exports = {
  // Application metadata
  appName: 'Game Time Manager',
  version: '1.0.0',
  description: 'AI-powered children\'s game time management system',

  // Window configuration
  window: {
    defaultWidth: 1200,
    defaultHeight: 800,
    minimizeToTray: true,
    icon: path.join(__dirname, 'assets/icon.png'),
    trayIcon: path.join(__dirname, 'assets/tray-icon.png'),
    uiPath: path.join(__dirname, '../../framework/renderer/index.html')
  },

  // AI Agent configuration
  agent: {
    model: 'gpt-4.1',
    temperature: 0.7,
    maxTokens: 8192,
    maxHistoryMessages: 50,
    promptFile: 'game-time-manager-prompt.md',
    // 游戏时间管理的初始变量
    initialVariables: {
      // 状态机
      state: 'child_idle',

      // 游戏相关（可选字段，初始为空）
      game_id: null,
      game_process_id: null,

      // 答题相关（可选字段，初始为空）
      quiz_question_index: null,
      quiz_correct_count: 0,

      // 时间管理
      time_available_game: 120,
      time_weekly_limit: 120,
      time_used_this_week: 0,
      time_pending_reward: 0,

      // 统计数据
      stats_total_questions_answered: 0,
      stats_total_correct_answers: 0,
      stats_total_game_time_earned: 0,
      stats_last_quiz_date: '',

      // 系统配置
      config_parent_password: 'parent123'
    }
  },

  // External services
  services: {
    supabase: {
      enabled: !!(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY),
      url: process.env.SUPABASE_URL,
      anonKey: process.env.SUPABASE_ANON_KEY
    }
  },

  // App-specific settings
  enableAutoLaunch: true,
  development: {
    enableDevTools: process.env.NODE_ENV === 'development'
  }
};
