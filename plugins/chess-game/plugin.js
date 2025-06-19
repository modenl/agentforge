const path = require('path');
const fs = require('fs').promises;
const { BasePlugin } = require('../../framework');
const pluginConfig = require('./config/plugin-config');

class ChessGamePlugin extends BasePlugin {
  constructor() {
    super();
    this.config = pluginConfig;
  }

  async initialize() {
    console.log('Chess Game Plugin initialized');
    return true;
  }

  // 不需要MCP actions，LLM直接处理象棋逻辑
  registerMCPActions() {
    return {};
  }

  // 提供象棋业务提示词
  async getBusinessPrompt() {
    try {
      const promptPath = path.join(__dirname, 'prompts/chess-prompt.md');
      const businessPrompt = await fs.readFile(promptPath, 'utf8');
      return businessPrompt;
    } catch (error) {
      console.error('Failed to load chess business prompt:', error);
      return '';
    }
  }

  // 返回插件配置
  getConfig() {
    return this.config;
  }

  // 获取初始象棋状态
  getInitialState() {
    return {
      role: 'player',
      game_state: 'menu',
      chess_board: this.config.gameConfig.initialBoard,
      current_player: 'white', // 玩家先手
      ai_color: 'black',
      player_color: 'white',
      game_history: [],
      last_move: null,
      game_status: 'active', // active, check, checkmate, stalemate, draw
      captured_pieces: {
        white: [],
        black: []
      }
    };
  }
}

module.exports = ChessGamePlugin;
