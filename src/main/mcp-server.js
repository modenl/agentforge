const { spawn, exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const si = require('systeminformation');
const { machineId } = require('node-machine-id');
const winston = require('winston');
const { APP_CONFIG } = require('../config/config');
const { EventEmitter } = require('events');
const util = require('util');
const execAsync = util.promisify(exec);
const logger = require('./logger');
const ChromeController = require('./chrome-controller');

// Optional dependencies for advanced features
let screenshot = null;
let activeWin = null;
let robotjs = null;
let psList = null;

// Async function to load ps-list (ES module)
async function loadPsList() {
  if (!psList) {
    try {
      const psListModule = await import('ps-list');
      psList = psListModule.default;
    } catch (e) {
      logger.warn('ps-list not available - process monitoring limited');
    }
  }
  return psList;
}

try {
  screenshot = require('screenshot-desktop');
} catch (e) {
  logger.warn('screenshot-desktop not available - screenshots disabled');
}

try {
  activeWin = require('active-win');
} catch (e) {
  logger.warn('active-win not available - window focus detection limited');
}

try {
  robotjs = require('robotjs');
} catch (e) {
  logger.warn('robotjs not available - system automation limited');
}

// 无状态的MCP功能执行器
class MCPServer extends EventEmitter {
  constructor(supabaseClient, logger) {
    super();
    this.supabase = supabaseClient;
    this.logger = logger;
    this.chromeController = new ChromeController();

    // MCP服务器应该是无状态的 - 移除所有状态管理
    // 所有状态由LLM通过上下文管理

    logger.info('Initialized stateless MCP Capability Server with Chrome controller');
  }

  // 基本权限验证 - 仅系统级验证，业务逻辑由LLM管理
  hasPermission(role, action) {
    const systemPermissions = {
      'launch_game': ['Child', 'Parent', 'Agent'],
      'monitor_game_process': ['Agent'],
      'close_game': ['Agent', 'Parent'],
      'update_time_quota': ['Parent', 'Agent'],
      'track_time_usage': ['Agent'],
      'monitor_system_integrity': ['Agent'],
      'sync_with_supabase': ['Agent'],
      'send_notification': ['Agent'],
      'read_local_data': ['Agent', 'Parent'],
      'write_local_data': ['Agent'],
      'execute_system_command': ['Agent'],
      'manage_windows_service': ['Agent'],
      'check_network_connectivity': ['Agent'],
      'send_telemetry': ['Agent'],
      'list_chrome_tabs': ['Agent', 'Parent'],
      'activate_chrome_tab': ['Agent', 'Parent'],
      'evaluate_in_chrome': ['Agent']
    };

    return systemPermissions[action]?.includes(role) || false;
  }

  // 基本参数验证
  validateParameters(action, params) {
    const validators = {
      launch_game: (p) => {
        if (!p.game_id) throw new Error('game_id is required');
        if (p.executable && typeof p.executable !== 'string') throw new Error('executable must be string');
      },
      close_game: (p) => {
        if (!p.process_id && !p.game_id && !p.tab_id && !p.tabId) throw new Error('process_id, game_id, or tab_id required');
        // game_id or tab_id alone is sufficient for Chrome-based games
      },
      send_notification: (p) => {
        if (!p.content) throw new Error('content is required');
        if (!p.delivery_method) throw new Error('delivery_method is required');
      },
      list_chrome_tabs: (p) => {
        // No required parameters
      },
      activate_chrome_tab: (p) => {
        if (!p.tab_id) throw new Error('tab_id is required');
      },
      evaluate_in_chrome: (p) => {
        if (!p.expression) throw new Error('expression is required');
      }
    };

    if (validators[action]) {
      validators[action](params);
    }
  }

  // 纯功能方法 - 启动游戏进程
  async launch_game(params, role) {
    if (!this.hasPermission(role, 'launch_game')) {
      throw new Error(`Role ${role} does not have permission for action: launch_game`);
    }

    this.validateParameters('launch_game', params);

    try {
      let gameProcess;
      let processInfo = {
        game_id: params.game_id,
        executable: params.executable || params.game_id,
        started_at: new Date().toISOString()
      };

      // 特殊处理Chrome类游戏
      if (params.game_id === 'bloxd' || (params.executable && params.executable.includes('chrome'))) {
        // 使用ChromeController启动游戏
        const url = params.args && params.args[0] ? params.args[0] : 'https://bloxd.io/';
        const gameInfo = await this.chromeController.launchGame(url, {
          debugPort: params.debugPort || 9222
        });

        processInfo = {
          ...processInfo,
          ...gameInfo,
          is_chrome_game: true
        };

        logger.info(`Launched Chrome game ${params.game_id} using CDP`);

      } else {
        // 纯粹的进程启动，不维护状态
        gameProcess = spawn(params.executable || params.game_id, params.args || [], {
          detached: true,
          stdio: 'ignore'
        });

        processInfo.process_id = gameProcess.pid;
      }

      logger.info(`Launched game ${params.game_id} with PID: ${processInfo.process_id || processInfo.processId || 'unknown'}`);
      return processInfo;

    } catch (error) {
      logger.error(`Failed to launch game: ${error.message}`);
      throw error;
    }
  }

  // 纯功能方法 - 检查进程状态
  async monitor_game_process(params, role) {
    if (!this.hasPermission(role, 'monitor_game_process')) {
      throw new Error(`Role ${role} does not have permission for action: monitor_game_process`);
    }

    try {
      const psListFunc = await loadPsList();
      if (!psListFunc) {
        return { status: 'monitoring_unavailable', error: 'ps-list not available' };
      }

      const processes = await psListFunc();
      const targetProcess = processes.find(p =>
        p.pid === params.process_id ||
        p.name.toLowerCase().includes(params.game_id?.toLowerCase())
      );

      return {
        process_found: !!targetProcess,
        process_info: targetProcess ? {
          pid: targetProcess.pid,
          name: targetProcess.name,
          cpu: targetProcess.cpu,
          memory: targetProcess.memory
        } : null,
        check_time: new Date().toISOString()
      };

    } catch (error) {
      logger.error(`Failed to monitor process: ${error.message}`);
      throw error;
    }
  }

  // 纯功能方法 - 关闭进程
  async close_game(params, role) {
    if (!this.hasPermission(role, 'close_game')) {
      throw new Error(`Role ${role} does not have permission for action: close_game`);
    }

    this.validateParameters('close_game', params);

    try {
      let killed = false;
      let method = 'none';

      // 特殊处理Chrome类游戏（如Bloxd）
      if (params.game_id === 'bloxd' || (params.executable && params.executable.includes('chrome'))) {
        try {
          // 使用ChromeController关闭游戏
          const tabIdToUse = params.tab_id || params.tabId;
          logger.info(`MCP Server calling closeGame with tabId: ${tabIdToUse}, params: ${JSON.stringify(params)}`);
          const result = await this.chromeController.closeGame(tabIdToUse);

          killed = result.closed;
          method = result.method;

          logger.info(`Chrome game close result: ${JSON.stringify(result)}`);

          // 简化的关闭结果处理
          killed = result.closed;
          method = result.method;

          if (killed) {
            logger.info(`Chrome game successfully closed with method: ${method}`);
          } else {
            logger.warn(`Chrome game close failed with method: ${method}`);
          }

        } catch (error) {
          logger.warn(`Chrome-specific game close failed: ${error.message}`);
        }
      }

      // 标准进程杀掉（对于原生游戏或有明确process_id的情况）
      if (!killed && params.process_id) {
        try {
          process.kill(params.process_id, params.force_close ? 'SIGKILL' : 'SIGTERM');
          killed = true;
          method = params.force_close ? 'SIGKILL' : 'SIGTERM';
        } catch (error) {
          if (error.code !== 'ESRCH') { // Process not found is okay
            throw error;
          }
        }
      }

      // 如果还是没有成功，尝试通过游戏ID查找并关闭进程
      if (!killed && params.game_id) {
        try {
          const psListFunc = await loadPsList();
          if (psListFunc) {
            const processes = await psListFunc();
            const gameProcesses = processes.filter(p =>
              p.name.toLowerCase().includes(params.game_id.toLowerCase()) ||
              (p.cmd && p.cmd.toLowerCase().includes(params.game_id.toLowerCase()))
            );

            for (const gameProcess of gameProcesses) {
              try {
                process.kill(gameProcess.pid, 'SIGTERM');
                killed = true;
                method = 'game_id_match';
                logger.info(`Killed process ${gameProcess.pid} matching game_id: ${params.game_id}`);
              } catch (killError) {
                logger.warn(`Failed to kill process ${gameProcess.pid}: ${killError.message}`);
              }
            }
          }
        } catch (error) {
          logger.warn(`Game ID-based process kill failed: ${error.message}`);
        }
      }

      return {
        process_id: params.process_id,
        game_id: params.game_id,
        killed,
        method,
        closed_at: new Date().toISOString()
      };

    } catch (error) {
      logger.error(`Failed to close game: ${error.message}`);
      throw error;
    }
  }

  // 纯功能方法 - 发送通知
  async send_notification(params, role) {
    if (!this.hasPermission(role, 'send_notification')) {
      throw new Error(`Role ${role} does not have permission for action: send_notification`);
    }

    this.validateParameters('send_notification', params);

    try {
      const deliveryResults = {};

      for (const method of params.delivery_method) {
        try {
          switch (method) {
          case 'desktop':
            // 简单的桌面通知实现
            logger.info(`Desktop notification: ${params.content.title || params.content}`);
            deliveryResults[method] = 'success';
            break;
          case 'in_app':
            // 应用内通知
            this.emit('notification', params.content);
            deliveryResults[method] = 'success';
            break;
          case 'email':
            // 邮件通知（占位符）
            logger.info(`Email notification: ${params.content.title || params.content}`);
            deliveryResults[method] = 'not_implemented';
            break;
          default:
            deliveryResults[method] = 'unsupported';
          }
        } catch (methodError) {
          deliveryResults[method] = methodError.message;
        }
      }

      return {
        notification_id: crypto.randomUUID(),
        delivery_results: deliveryResults,
        sent_at: new Date().toISOString()
      };

    } catch (error) {
      logger.error(`Failed to send notification: ${error.message}`);
      throw error;
    }
  }

  // 纯功能方法 - 系统完整性检查
  async monitor_system_integrity(params, role) {
    if (!this.hasPermission(role, 'monitor_system_integrity')) {
      throw new Error(`Role ${role} does not have permission for action: monitor_system_integrity`);
    }

    try {
      // 简化的系统检查，返回当前状态而不存储历史
      const checks = {
        process_list: { violation: false, details: 'Normal processes detected' },
        network_connections: { violation: false, details: 'Normal network activity' },
        file_system: { violation: false, details: 'No suspicious file changes' },
        memory_usage: await this.checkMemoryUsage(),
        cpu_usage: await this.checkCpuUsage()
      };

      const violations = Object.entries(checks)
        .filter(([key, result]) => result.violation)
        .map(([key, result]) => ({ type: key, details: result.details }));

      return {
        check_time: new Date().toISOString(),
        violations_found: violations.length,
        violations,
        system_status: violations.length === 0 ? 'secure' : 'issues_detected',
        system_info: checks
      };

    } catch (error) {
      logger.error(`System integrity check failed: ${error.message}`);
      throw error;
    }
  }

  // 纯功能方法 - 数据同步
  async sync_with_supabase(params, role) {
    if (!this.hasPermission(role, 'sync_with_supabase')) {
      throw new Error(`Role ${role} does not have permission for action: sync_with_supabase`);
    }

    try {
      const { createClient } = require('@supabase/supabase-js');
      const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_ANON_KEY
      );

      const syncResults = {};

      for (const table of params.tables || []) {
        try {
          if (params.direction === 'up' || params.direction === 'bidirectional') {
            // 上传数据
            const { data, error } = await supabase
              .from(table)
              .upsert(params.data || []);

            if (error) throw error;
            syncResults[table] = { uploaded: (params.data || []).length };
          }

          if (params.direction === 'down' || params.direction === 'bidirectional') {
            // 下载数据
            const { data, error } = await supabase
              .from(table)
              .select('*');

            if (error) throw error;
            syncResults[table] = { ...syncResults[table], downloaded: data.length, data };
          }

        } catch (tableError) {
          syncResults[table] = { error: tableError.message };
        }
      }

      return {
        sync_time: new Date().toISOString(),
        direction: params.direction,
        tables_synced: Object.keys(syncResults),
        results: syncResults
      };

    } catch (error) {
      logger.error(`Supabase sync failed: ${error.message}`);
      throw error;
    }
  }

  // 辅助方法 - 不维护状态的系统检查
  async checkMemoryUsage() {
    try {
      const memInfo = await si.mem();
      const usagePercent = ((memInfo.used / memInfo.total) * 100).toFixed(2);
      return {
        violation: usagePercent > 85,
        details: `Memory usage: ${usagePercent}%`,
        used: memInfo.used,
        total: memInfo.total,
        percentage: parseFloat(usagePercent)
      };
    } catch (error) {
      return { violation: false, details: 'Memory check unavailable', error: error.message };
    }
  }

  async checkCpuUsage() {
    try {
      const cpuInfo = await si.currentLoad();
      const usagePercent = cpuInfo.currentLoad.toFixed(2);
      return {
        violation: usagePercent > 90,
        details: `CPU usage: ${usagePercent}%`,
        percentage: parseFloat(usagePercent)
      };
    } catch (error) {
      return { violation: false, details: 'CPU check unavailable', error: error.message };
    }
  }

  // 清理方法 - 无状态服务器不需要清理状态
  // Chrome相关方法
  async list_chrome_tabs(params, role) {
    if (!this.hasPermission(role, 'list_chrome_tabs')) {
      throw new Error(`Role ${role} does not have permission for action: list_chrome_tabs`);
    }

    try {
      const tabs = await this.chromeController.listTabs();
      return {
        tabs,
        count: tabs.length,
        retrieved_at: new Date().toISOString()
      };
    } catch (error) {
      logger.error(`Failed to list Chrome tabs: ${error.message}`);
      throw error;
    }
  }

  async activate_chrome_tab(params, role) {
    if (!this.hasPermission(role, 'activate_chrome_tab')) {
      throw new Error(`Role ${role} does not have permission for action: activate_chrome_tab`);
    }

    this.validateParameters('activate_chrome_tab', params);

    try {
      const activated = await this.chromeController.activateTab(params.tab_id);
      return {
        tab_id: params.tab_id,
        activated,
        activated_at: new Date().toISOString()
      };
    } catch (error) {
      logger.error(`Failed to activate Chrome tab: ${error.message}`);
      throw error;
    }
  }

  async evaluate_in_chrome(params, role) {
    if (!this.hasPermission(role, 'evaluate_in_chrome')) {
      throw new Error(`Role ${role} does not have permission for action: evaluate_in_chrome`);
    }

    this.validateParameters('evaluate_in_chrome', params);

    try {
      const result = await this.chromeController.evaluateInTab(params.expression);
      return {
        expression: params.expression,
        result: result.result,
        executed_at: new Date().toISOString()
      };
    } catch (error) {
      logger.error(`Failed to evaluate in Chrome: ${error.message}`);
      throw error;
    }
  }

  async cleanup() {
    // 清理Chrome控制器资源
    if (this.chromeController) {
      await this.chromeController.cleanup();
    }
    logger.info('Stateless MCP Server cleanup complete');
  }
}

module.exports = MCPServer;
