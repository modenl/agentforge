const CDP = require('chrome-remote-interface');
const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);
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
    this.chromePath = null; // 缓存 Chrome 路径
  }

  /**
   * 查找可用的Chrome可执行文件路径
   * @returns {Promise<string>} Chrome路径
   * @private
   */
  async _findChromePath() {
    if (this.chromePath) {
      return this.chromePath; // 使用缓存的路径
    }

    let possiblePaths = [];

    if (process.platform === 'win32') {
      possiblePaths = [
        'chrome.exe',
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
        path.join(process.env.LOCALAPPDATA || '', 'Google\\Chrome\\Application\\chrome.exe')
      ];
    } else if (process.platform === 'darwin') {
      possiblePaths = [
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary',
        '/Applications/Chromium.app/Contents/MacOS/Chromium',
        path.join(process.env.HOME || '', 'Applications/Google Chrome.app/Contents/MacOS/Google Chrome'),
        '/usr/bin/google-chrome',
        '/usr/local/bin/google-chrome'
      ];
    } else {
      // Linux
      possiblePaths = [
        'google-chrome',
        'google-chrome-stable',
        'chromium',
        'chromium-browser',
        '/usr/bin/google-chrome',
        '/usr/bin/google-chrome-stable',
        '/usr/bin/chromium',
        '/usr/bin/chromium-browser',
        '/snap/bin/chromium'
      ];
    }

    for (const chromePath of possiblePaths) {
      try {
        // 检查文件是否存在
        if (path.isAbsolute(chromePath)) {
          await fs.access(chromePath, fs.constants.F_OK);
          // 检查是否有执行权限
          const stats = await fs.stat(chromePath);
          if (stats.mode & parseInt('111', 8)) {
            logger.info(`Found Chrome at: ${chromePath}`);
            this.chromePath = chromePath;
            return chromePath;
          }
        } else {
          // 对于相对路径，尝试在 PATH 中查找
          try {
            const { stdout } = await execAsync(`which ${chromePath}`, { timeout: 3000 });
            const foundPath = stdout.trim();
            if (foundPath) {
              logger.info(`Found Chrome in PATH: ${foundPath}`);
              this.chromePath = foundPath;
              return foundPath;
            }
          } catch (error) {
            // which 命令失败，继续尝试下一个
            continue;
          }
        }
      } catch (error) {
        // 文件不存在或无权限，继续尝试下一个
        continue;
      }
    }

    throw new Error(`Chrome not found. Please install Google Chrome or Chromium. Tried paths: ${possiblePaths.join(', ')}`);
  }

  /**
   * 检查Chrome可执行文件权限
   * @param {string} chromePath - Chrome路径
   * @returns {Promise<boolean>} 是否有权限
   * @private
   */
  async _checkChromePermissions(chromePath) {
    try {
      const stats = await fs.stat(chromePath);
      
      // 检查是否有执行权限
      if (!(stats.mode & parseInt('111', 8))) {
        logger.error(`Chrome executable at ${chromePath} is not executable`);
        return false;
      }

      // 在 macOS 上额外检查代码签名状态
      if (process.platform === 'darwin') {
        try {
          const { stdout } = await execAsync(`codesign --verify --deep --strict "${chromePath}"`, { timeout: 5000 });
          logger.debug(`Chrome code signature verified: ${chromePath}`);
        } catch (signError) {
          logger.warn(`Chrome code signature check failed (may still work): ${signError.message}`);
        }
      }

      return true;
    } catch (error) {
      logger.error(`Chrome permission check failed: ${error.message}`);
      return false;
    }
  }

  /**
   * 检查端口是否可用
   * @param {number} port - 端口号
   * @returns {Promise<boolean>} 端口是否可用
   * @private
   */
  async _isPortAvailable(port) {
    return new Promise((resolve) => {
      const net = require('net');
      const server = net.createServer();
      
      server.listen(port, () => {
        server.once('close', () => resolve(true));
        server.close();
      });
      
      server.on('error', () => resolve(false));
    });
  }

  /**
   * 启动Chrome并打开游戏URL
   * 在 macOS 上优先使用现有的 Chrome 实例而不是强制启动新的调试实例
   * @param {string} url - 要打开的URL
   * @param {Object} options - 启动选项
   * @returns {Promise<Object>} 游戏信息
   */
  async launchGame(url, options = {}) {
    try {
      // 首先设置调试端口
      this.debuggingPort = options.debugPort || 9222;

      // 策略1: 检查是否有现有的调试实例可用
      logger.info('Checking for existing Chrome debug instances...');
      try {
        const targets = await CDP.List({ port: this.debuggingPort });
        if (targets.length > 0) {
          logger.info(`Found existing Chrome debug instance on port ${this.debuggingPort}`);
          const tab = await CDP.New({ url, port: this.debuggingPort });
          this.gameTab = tab;
          this.client = await CDP({ target: tab, port: this.debuggingPort });
          
          const { Page, Runtime } = this.client;
          await Page.enable();
          await Runtime.enable();
          await Page.navigate({ url });
          await Page.loadEventFired();

          return {
            tabId: tab.id,
            url: url,
            debugPort: this.debuggingPort,
            processId: null,
            method: 'existing_chrome_cdp',
            usesCDP: true
          };
        }
      } catch (existingError) {
        logger.debug(`No existing debug instance found: ${existingError.message}`);
      }

      // 策略2: 在 macOS 上，如果调试实例启动困难，使用系统默认 Chrome
      if (process.platform === 'darwin') {
        logger.info('macOS detected: attempting to use system Chrome for game launch');
        try {
          const chromePath = await this._findChromePath();
          
          // 使用系统 Chrome 打开新窗口（不启用调试）
          logger.info(`Opening game URL in system Chrome: ${url}`);
          const chromeProcess = spawn(chromePath, ['--new-window', url], {
            detached: true,
            stdio: 'ignore'
          });

          // 等待一点时间让 Chrome 启动
          await new Promise(resolve => setTimeout(resolve, 2000));

          return {
            tabId: `system-chrome-${Date.now()}`,
            url: url,
            debugPort: null,
            processId: chromeProcess.pid,
            method: 'system_chrome_macos',
            usesCDP: false,
            note: 'Using system Chrome without CDP due to macOS security restrictions'
          };

        } catch (systemError) {
          logger.warn(`System Chrome launch failed: ${systemError.message}`);
        }
      }

      // 策略3: 尝试启动新的调试实例（其他平台或者作为最后手段）
      logger.info('Attempting to launch new Chrome instance with debugging...');
      
      // 检查端口是否可用
      const portAvailable = await this._isPortAvailable(this.debuggingPort);
      if (!portAvailable) {
        this.debuggingPort = this.debuggingPort + 1;
        logger.info(`Port conflict, using alternative port: ${this.debuggingPort}`);
      }

      await this._launchChromeWithDebugging(this.debuggingPort);

      // 等待Chrome启动，使用指数退避
      let attempts = 0;
      const maxAttempts = 5; // 减少尝试次数
      let waitTime = 1000;

      while (attempts < maxAttempts) {
        try {
          await new Promise(resolve => setTimeout(resolve, waitTime));
          const targets = await CDP.List({ port: this.debuggingPort });
          
          if (targets.length > 0) {
            logger.info(`Chrome debug instance started after ${attempts + 1} attempts`);
            break;
          }
        } catch (error) {
          attempts++;
          if (attempts >= maxAttempts) {
            // 最后一次尝试失败，在 macOS 上回退到系统 Chrome
            if (process.platform === 'darwin') {
              logger.warn('Chrome debug launch failed, falling back to system Chrome');
              return this._fallbackToSystemChrome(url);
            }
            throw new Error(`Failed to establish debug session with Chrome after ${maxAttempts} attempts: ${error.message}`);
          }
          waitTime = Math.min(waitTime * 1.5, 3000);
          logger.info(`Attempt ${attempts} failed, retrying in ${waitTime}ms...`);
        }
      }

      // 创建新标签页并导航
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

      logger.info(`Game launched successfully with CDP: ${url}`);
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
      
      // 在 macOS 上的最终回退策略
      if (process.platform === 'darwin') {
        logger.info('Attempting final fallback to system Chrome...');
        try {
          return await this._fallbackToSystemChrome(url);
        } catch (fallbackError) {
          logger.error(`All launch methods failed: ${fallbackError.message}`);
        }
      }
      
      // 清理失败的启动
      await this.cleanup();
      throw error;
    }
  }

  /**
   * macOS 系统 Chrome 回退方法
   * @param {string} url - 要打开的URL
   * @returns {Promise<Object>} 游戏信息
   * @private
   */
  async _fallbackToSystemChrome(url) {
    try {
      const chromePath = await this._findChromePath();
      
      logger.info(`Fallback: opening ${url} in system Chrome`);
      const chromeProcess = spawn(chromePath, ['--new-window', url], {
        detached: true,
        stdio: 'ignore'
      });

      // 等待 Chrome 启动
      await new Promise(resolve => setTimeout(resolve, 1500));

      return {
        tabId: `fallback-chrome-${Date.now()}`,
        url: url,
        debugPort: null,
        processId: chromeProcess.pid,
        method: 'fallback_system_chrome',
        usesCDP: false,
        note: 'Fallback to system Chrome without debugging capabilities'
      };

    } catch (error) {
      throw new Error(`System Chrome fallback failed: ${error.message}`);
    }
  }

  /**
   * 关闭游戏标签页
   * 支持 CDP 和非 CDP 方式
   * @param {string} tabId - 标签页ID
   * @returns {Promise<Object>} 关闭结果
   */
  async closeGame(tabId) {
    try {
      logger.info(`ChromeController.closeGame called with tabId: ${tabId}, debuggingPort: ${this.debuggingPort}`);
      let closed = false;
      let method = 'none';

      // 检查是否是系统 Chrome 或回退模式（无 CDP）
      if (tabId && (tabId.startsWith('system-chrome-') || tabId.startsWith('fallback-chrome-'))) {
        logger.info('Detected non-CDP Chrome instance, attempting system-level close');
        
        // 对于系统 Chrome（非 CDP 模式），只记录关闭请求
        // 用户需要手动关闭游戏标签页
        logger.info('System Chrome close request logged (user should manually close the game tab)');
        closed = true;
        method = 'system_chrome_close_request';
        
        // 如果所有方法都失败，至少记录请求
        if (!closed) {
          closed = true; // 标记为"已处理"，即使可能未完全成功
          method = 'system_chrome_close_request';
          logger.info('System Chrome close request logged (automatic close may have failed)');
        }
        
        return {
          closed,
          method,
          tabId,
          note: this._getCloseNote(method),
          closedAt: new Date().toISOString()
        };
      }

      // CDP 方式关闭（原有逻辑）
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
   * 检查是否有现有的Chrome进程运行，并检测调试端口
   * @param {number} [port] - 可选的调试端口检查
   * @returns {Promise<Object>} Chrome进程信息
   * @private
   */
  async _checkExistingChrome(port) {
    try {
      let chromeProcesses = [];

      // 方法1: 使用ps-list检查进程
      try {
        const psList = await import('ps-list');
        const processes = await psList.default();
        chromeProcesses = processes.filter(p =>
          p.name.toLowerCase().includes('chrome') &&
          !p.name.toLowerCase().includes('chromedriver') &&
          !p.name.toLowerCase().includes('crashpad')
        );
      } catch (error) {
        logger.debug('ps-list not available, trying alternative methods');
      }

      // 方法2: 使用系统命令检查进程
      if (chromeProcesses.length === 0) {
        try {
          let cmd;
          if (process.platform === 'win32') {
            cmd = 'tasklist /FI "IMAGENAME eq chrome.exe" /FO CSV';
          } else if (process.platform === 'darwin') {
            cmd = 'ps aux | grep -i "Google Chrome" | grep -v grep';
          } else {
            cmd = 'ps aux | grep -i chrome | grep -v grep | grep -v crashpad';
          }

          const { stdout } = await execAsync(cmd, { timeout: 3000 });
          
          if (process.platform === 'win32') {
            const lines = stdout.split('\n').filter(line => line.includes('chrome.exe'));
            chromeProcesses = lines.slice(1).map(line => {
              const parts = line.split(',');
              return {
                name: 'chrome.exe',
                pid: parseInt(parts[1].replace(/"/g, '')),
                cmd: line
              };
            });
          } else {
            const lines = stdout.trim().split('\n').filter(line => line.length > 0);
            chromeProcesses = lines.map(line => {
              const parts = line.trim().split(/\s+/);
              return {
                name: 'chrome',
                pid: parseInt(parts[1]),
                cmd: parts.slice(10).join(' ')
              };
            });
          }
        } catch (error) {
          logger.debug(`System command failed: ${error.message}`);
        }
      }

      // 方法3: 如果指定了端口，检查该端口上是否有 CDP 服务
      if (port) {
        try {
          const targets = await CDP.List({ port });
          if (targets.length > 0) {
            return {
              hasChrome: true,
              hasDebugger: true,
              port: port,
              targets: targets.length,
              method: 'cdp_connection'
            };
          }
        } catch (error) {
          logger.debug(`No CDP service on port ${port}: ${error.message}`);
        }
      }

      // 分析找到的进程
      if (chromeProcesses.length > 0) {
        // 查找具有调试端口的 Chrome 进程
        const debugChrome = chromeProcesses.find(p => 
          p.cmd && p.cmd.includes('--remote-debugging-port')
        );

        if (debugChrome) {
          // 尝试提取调试端口
          const portMatch = debugChrome.cmd.match(/--remote-debugging-port=(\d+)/);
          const debugPort = portMatch ? parseInt(portMatch[1]) : null;
          
          return {
            hasChrome: true,
            hasDebugger: true,
            pid: debugChrome.pid,
            name: debugChrome.name,
            port: debugPort,
            method: 'process_with_debug'
          };
        }

        // 返回第一个找到的 Chrome 进程
        const firstChrome = chromeProcesses[0];
        return {
          hasChrome: true,
          hasDebugger: false,
          pid: firstChrome.pid,
          name: firstChrome.name,
          count: chromeProcesses.length,
          method: 'process_found'
        };
      }

      return {
        hasChrome: false,
        hasDebugger: false,
        pid: null,
        name: null,
        method: 'none'
      };

    } catch (error) {
      logger.warn(`Error checking existing Chrome: ${error.message}`);
      return {
        hasChrome: false,
        hasDebugger: false,
        pid: null,
        name: null,
        method: 'error',
        error: error.message
      };
    }
  }

  /**
   * 启动Chrome并启用远程调试
   * @param {number} port - 调试端口
   * @private
   */
  async _launchChromeWithDebugging(port) {
    // 查找Chrome可执行文件
    const chromePath = await this._findChromePath();
    
    // 检查权限
    const hasPermission = await this._checkChromePermissions(chromePath);
    if (!hasPermission) {
      throw new Error(`Chrome at ${chromePath} is not accessible or executable`);
    }

    // 使用最简化的启动参数，特别针对 macOS 优化
    const chromeArgs = [
      `--remote-debugging-port=${port}`,
      `--user-data-dir=${require('os').tmpdir()}/chrome-debug-${port}`
    ];

    // 根据平台添加最必要的参数
    if (process.platform === 'linux') {
      chromeArgs.push('--no-sandbox');
    } else if (process.platform === 'darwin') {
      // macOS 特殊处理：添加最少的必要参数
      chromeArgs.push(
        '--no-first-run',
        '--disable-default-apps'
      );
    } else if (process.platform === 'win32') {
      chromeArgs.push(
        '--no-first-run',
        '--no-default-browser-check',
        '--disable-default-apps'
      );
    }

    logger.info(`Attempting to launch Chrome: ${chromePath}`);
    logger.info(`Chrome arguments: ${chromeArgs.join(' ')}`);

    try {
      this.chromeProcess = spawn(chromePath, chromeArgs, {
        detached: false,
        stdio: ['ignore', 'pipe', 'pipe'],
        env: {
          ...process.env,
          // 确保Chrome能正常启动的环境变量
          DISPLAY: process.env.DISPLAY || ':0'
        }
      });

      // 添加错误处理
      this.chromeProcess.on('error', (error) => {
        logger.error(`Chrome process error: ${error.message}`);
      });

      this.chromeProcess.on('exit', (code, signal) => {
        logger.info(`Chrome process exited with code ${code}, signal ${signal}`);
        if (signal === 'SIGKILL') {
          logger.warn('Chrome was killed by SIGKILL - this may indicate permission or resource issues');
        }
      });

      // 捕获stdout和stderr用于调试
      if (this.chromeProcess.stdout) {
        this.chromeProcess.stdout.on('data', (data) => {
          const output = data.toString().trim();
          if (output) {
            logger.debug(`Chrome stdout: ${output}`);
          }
        });
      }

      if (this.chromeProcess.stderr) {
        this.chromeProcess.stderr.on('data', (data) => {
          const output = data.toString().trim();
          if (output) {
            // 过滤掉一些常见的无害警告
            if (!output.includes('DevTools listening') && 
                !output.includes('GPU process') && 
                !output.includes('sandbox')) {
              logger.debug(`Chrome stderr: ${output}`);
            }
          }
        });
      }

      logger.info(`Launched Chrome with debugging on port ${port}, PID: ${this.chromeProcess.pid}`);

      // 等待一段时间确保进程启动
      await new Promise(resolve => setTimeout(resolve, 500));

      // 检查进程是否立即退出
      if (this.chromeProcess && this.chromeProcess.killed) {
        throw new Error('Chrome process was killed immediately after launch');
      }

    } catch (error) {
      logger.error(`Failed to spawn Chrome process: ${error.message}`);
      throw error;
    }
  }

  /**
   * 获取关闭操作的说明信息
   * @param {string} method - 关闭方法
   * @returns {string} 说明信息
   */
  _getCloseNote(method) {
    switch (method) {
      case 'system_chrome_close_request':
        return 'Close request logged - please manually close the game tab in Chrome';
      case 'cdp_close_by_id':
        return 'Game tab closed automatically using Chrome DevTools Protocol';
      case 'cdp_page_close':
        return 'Game tab closed using CDP Page.close()';
      case 'cdp_close_game_targets':
        return 'Game tabs closed using CDP target management';
      default:
        return 'Game close request processed';
    }
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
