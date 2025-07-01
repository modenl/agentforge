// Game Launcher MCP Tool
// Handles game launching functionality

const { spawn } = require('child_process');
const ChromeController = require('./chrome-controller');

class GameLauncher {
  constructor() {
    this.chromeController = new ChromeController();
  }

  async initialize() {
    // Initialize if needed
  }

  async launch_game(params, role) {
    // Basic permission check
    const allowedRoles = ['Child', 'Parent', 'Agent'];
    if (!allowedRoles.includes(role)) {
      throw new Error(`Role ${role} does not have permission for action: launch_game`);
    }

    // Parameter validation
    if (!params.game_id) {
      throw new Error('game_id is required');
    }

    try {
      let gameProcess;
      let processInfo = {
        game_id: params.game_id,
        executable: params.executable || params.game_id,
        started_at: new Date().toISOString()
      };

      // Special handling for Chrome-based games
      if (params.game_id === 'bloxd' || (params.executable && params.executable.includes('chrome'))) {
        // Use ChromeController to launch the game
        const url = params.args && params.args[0] ? params.args[0] : 'https://bloxd.io/';
        const gameInfo = await this.chromeController.launchGame(url, {
          debugPort: params.debugPort || 9222
        });

        processInfo = {
          ...processInfo,
          ...gameInfo,
          is_chrome_game: true
        };

        console.log(`Launched Chrome game ${params.game_id} using CDP`);
      } else {
        // Pure process launch without state maintenance
        gameProcess = spawn(params.executable || params.game_id, params.args || [], {
          detached: true,
          stdio: 'ignore'
        });

        processInfo.process_id = gameProcess.pid;
      }

      console.log(`Launched game ${params.game_id} with PID: ${processInfo.process_id || processInfo.processId || 'unknown'}`);
      return processInfo;

    } catch (error) {
      console.error(`Failed to launch game: ${error.message}`);
      throw error;
    }
  }

  async cleanup() {
    if (this.chromeController) {
      await this.chromeController.cleanup();
    }
  }
}

module.exports = GameLauncher;
