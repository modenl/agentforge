const CDP = require('chrome-remote-interface');
const { spawn } = require('child_process');
const logger = require('./logger');

/**
 * 跨平台Chrome控制器
 * 使用Chrome DevTools Protocol (CDP)进行通信
 */
class ChromeController {
  constructor() {
    this.chromeProcess = null;
    this.client = null;
    this.gameTab = null;
    this.debuggingPort = null;
  }

  /**
   * 启动Chrome并启用远程调试
   * @param {string} url - 要打开的URL
   * @param {Object} options - 启动选项
   * @returns {Promise<Object>} 游戏信息
   */
  async launchGame(url, options = {}) {
    try {
      // 首先设置调试端口
      this.debuggingPort = options.debugPort || 9222;

      // 始终启动新的Chrome实例以确保完全的CDP控制
      logger.info('Launching new Chrome instance with debugging for reliable control');

      // 启动新的Chrome实例
      await this._launchChromeWithDebugging(this.debuggingPort);

      // 等待Chrome启动并重新获取targets
      await new Promise(resolve => setTimeout(resolve, 2000));
      const targets = await CDP.List({ port: this.debuggingPort });

      if (targets.length === 0) {
        throw new Error('Failed to establish debug session with new Chrome instance');
      }

      // 如果执行到这里，说明需要使用CDP连接（新实例或现有调试会话）
      const tab = await CDP.New({ url, port: this.debuggingPort });
      this.gameTab = tab;

      // 连接到标签页
      this.client = await CDP({ target: tab, port: this.debuggingPort });

      const { Page, Runtime } = this.client;

      // 启用必要的域
      await Page.enable();
      await Runtime.enable();

      // 等待页面加载完成
      await Page.navigate({ url });
      await Page.loadEventFired();

      logger.info(`Game launched successfully: ${url}`);
      logger.info(`Tab ID: ${tab.id}`);

      return {
        tabId: tab.id,
        url: url,
        debugPort: this.debuggingPort,
        processId: this.chromeProcess ? this.chromeProcess.pid : null,
        method: 'new_chrome_cdp',
        usesCDP: true
      };

    } catch (error) {
      logger.error(`Failed to launch game: ${error.message}`);
      throw error;
    }
  }

  /**
   * 关闭游戏标签页
   * @param {string} tabId - 标签页ID
   * @returns {Promise<Object>} 关闭结果
   */
  async closeGame(tabId) {
    try {
      logger.info(`ChromeController.closeGame called with tabId: ${tabId}, debuggingPort: ${this.debuggingPort}`);
      let closed = false;
      let method = 'none';

      // 简化的关闭逻辑：直接使用CDP关闭
      if (tabId && this.debuggingPort) {
        try {
          await CDP.Close({ id: tabId, port: this.debuggingPort });
          closed = true;
          method = 'cdp_close_by_id';
          logger.info(`Closed tab by ID: ${tabId}`);
        } catch (error) {
          logger.warn(`Failed to close tab by ID ${tabId}: ${error.message}`);
        }
      }

      // 如果有活跃的client连接，尝试关闭当前标签页
      if (!closed && this.client) {
        try {
          const { Page } = this.client;
          await Page.close();
          closed = true;
          method = 'cdp_page_close';
          logger.info('Closed tab using Page.close()');
        } catch (error) {
          logger.warn(`Failed to close tab using Page.close(): ${error.message}`);
        }
      }

      // 查找并关闭游戏相关的标签页
      if (!closed && this.debuggingPort) {
        try {
          const targets = await CDP.List({ port: this.debuggingPort });
          const gameTargets = targets.filter(target =>
            target.type === 'page' &&
              (target.url.includes('bloxd.io') ||
               target.url.includes('minecraft') ||
               target.title.toLowerCase().includes('game'))
          );

          for (const target of gameTargets) {
            try {
              await CDP.Close({ id: target.id, port: this.debuggingPort });
              closed = true;
              method = 'cdp_close_game_targets';
              logger.info(`Closed game tab: ${target.url}`);
              break; // 关闭一个就够了
            } catch (closeError) {
              logger.warn(`Failed to close target ${target.id}: ${closeError.message}`);
            }
          }
        } catch (error) {
          logger.warn(`Failed to list and close game targets: ${error.message}`);
        }
      }

      // 清理连接
      if (this.client) {
        try {
          await this.client.close();
        } catch (error) {
          logger.warn(`Failed to close CDP client: ${error.message}`);
        }
        this.client = null;
      }

      this.gameTab = null;

      return {
        closed,
        method,
        tabId,
        closedAt: new Date().toISOString()
      };

    } catch (error) {
      logger.error(`Failed to close game: ${error.message}`);
      throw error;
    }
  }

  /**
   * 获取所有Chrome标签页
   * @returns {Promise<Array>} 标签页列表
   */
  async listTabs() {
    try {
      const targets = await CDP.List({ port: this.debuggingPort || 9222 });
      return targets.filter(target => target.type === 'page');
    } catch (error) {
      logger.error(`Failed to list tabs: ${error.message}`);
      return [];
    }
  }

  /**
   * 激活指定标签页
   * @param {string} tabId - 标签页ID
   * @returns {Promise<boolean>} 是否成功激活
   */
  async activateTab(tabId) {
    try {
      await CDP.Activate({ id: tabId, port: this.debuggingPort || 9222 });
      logger.info(`Activated tab: ${tabId}`);
      return true;
    } catch (error) {
      logger.error(`Failed to activate tab ${tabId}: ${error.message}`);
      return false;
    }
  }

  /**
   * 在现有标签页中执行JavaScript
   * @param {string} expression - JavaScript表达式
   * @returns {Promise<Object>} 执行结果
   */
  async evaluateInTab(expression) {
    if (!this.client) {
      throw new Error('No active Chrome client connection');
    }

    try {
      const { Runtime } = this.client;
      const result = await Runtime.evaluate({ expression });
      return result;
    } catch (error) {
      logger.error(`Failed to evaluate expression: ${error.message}`);
      throw error;
    }
  }

  /**
   * 检查是否有现有的Chrome进程运行
   * @returns {Promise<Object>} Chrome进程信息
   * @private
   */
  async _checkExistingChrome() {
    try {
      // 方法1: 使用ps-list检查进程
      try {
        const psList = await import('ps-list');
        const processes = await psList.default();
        const chromeProcess = processes.find(p =>
          p.name.toLowerCase().includes('chrome') &&
          !p.name.toLowerCase().includes('chromedriver')
        );

        if (chromeProcess) {
          return {
            hasChrome: true,
            pid: chromeProcess.pid,
            name: chromeProcess.name,
            method: 'ps-list'
          };
        }
      } catch (error) {
        // ps-list可能不可用，继续尝试其他方法
      }

      // 方法2: Windows特定 - 使用tasklist
      if (process.platform === 'win32') {
        try {
          const { exec } = require('child_process');
          const { promisify } = require('util');
          const execAsync = promisify(exec);

          const { stdout } = await execAsync('tasklist /FI "IMAGENAME eq chrome.exe" /FO CSV');
          const lines = stdout.split('\n').filter(line => line.includes('chrome.exe'));

          if (lines.length > 1) { // 第一行是标题
            const firstChrome = lines[1].split(',');
            const pid = parseInt(firstChrome[1].replace(/"/g, ''));

            return {
              hasChrome: true,
              pid: pid,
              name: 'chrome.exe',
              method: 'tasklist'
            };
          }
        } catch (error) {
          // tasklist失败，继续
        }
      }

      // 方法3: macOS/Linux - 使用ps命令
      if (process.platform !== 'win32') {
        try {
          const { exec } = require('child_process');
          const { promisify } = require('util');
          const execAsync = promisify(exec);

          const { stdout } = await execAsync('ps aux | grep -i chrome | grep -v grep');
          const lines = stdout.trim().split('\n').filter(line => line.length > 0);

          if (lines.length > 0) {
            const parts = lines[0].trim().split(/\s+/);
            const pid = parseInt(parts[1]);

            return {
              hasChrome: true,
              pid: pid,
              name: 'chrome',
              method: 'ps'
            };
          }
        } catch (error) {
          // ps命令失败
        }
      }

      return {
        hasChrome: false,
        pid: null,
        name: null,
        method: 'none'
      };

    } catch (error) {
      logger.warn(`Error checking existing Chrome: ${error.message}`);
      return {
        hasChrome: false,
        pid: null,
        name: null,
        method: 'error'
      };
    }
  }

  /**
   * 启动Chrome并启用远程调试
   * @param {number} port - 调试端口
   * @private
   */
  async _launchChromeWithDebugging(port) {
    const chromeArgs = [
      `--remote-debugging-port=${port}`,
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding',
      '--disable-background-mode',
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-default-apps',
      '--user-data-dir=' + require('os').tmpdir() + '/chrome-debug-' + port // 使用临时目录
    ];

    // 平台特定的Chrome路径 - 尝试多个常见位置
    let chromePath;
    if (process.platform === 'win32') {
      const possiblePaths = [
        'chrome.exe',
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
        process.env.LOCALAPPDATA + '\\Google\\Chrome\\Application\\chrome.exe'
      ];

      // 使用第一个可用的路径
      chromePath = possiblePaths[0]; // 先尝试PATH中的chrome
    } else if (process.platform === 'darwin') {
      chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
    } else {
      chromePath = 'google-chrome';
    }

    logger.info(`Attempting to launch Chrome: ${chromePath} with args: ${chromeArgs.join(' ')}`);

    this.chromeProcess = spawn(chromePath, chromeArgs, {
      detached: false, // 改为false以便调试
      stdio: ['ignore', 'pipe', 'pipe'] // 捕获输出用于调试
    });

    // 添加错误处理
    this.chromeProcess.on('error', (error) => {
      logger.error(`Chrome process error: ${error.message}`);
    });

    this.chromeProcess.on('exit', (code, signal) => {
      logger.info(`Chrome process exited with code ${code}, signal ${signal}`);
    });

    // 捕获stdout和stderr用于调试
    if (this.chromeProcess.stdout) {
      this.chromeProcess.stdout.on('data', (data) => {
        logger.debug(`Chrome stdout: ${data}`);
      });
    }

    if (this.chromeProcess.stderr) {
      this.chromeProcess.stderr.on('data', (data) => {
        logger.debug(`Chrome stderr: ${data}`);
      });
    }

    logger.info(`Launched Chrome with debugging on port ${port}, PID: ${this.chromeProcess.pid}`);
  }

  /**
   * 清理资源
   */
  async cleanup() {
    if (this.client) {
      try {
        await this.client.close();
      } catch (error) {
        logger.warn(`Error closing CDP client: ${error.message}`);
      }
    }

    if (this.chromeProcess) {
      try {
        this.chromeProcess.kill();
        logger.info('Chrome process terminated');
      } catch (error) {
        logger.warn(`Error terminating Chrome process: ${error.message}`);
      }
    }

    this.client = null;
    this.gameTab = null;
    this.chromeProcess = null;
  }
}

module.exports = ChromeController;
