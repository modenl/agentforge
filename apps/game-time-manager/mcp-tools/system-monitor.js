// System Monitor MCP Tools
// Handles system monitoring, data management, and other system-level operations

const fs = require('fs').promises;
const path = require('path');
const { spawn, exec } = require('child_process');
const os = require('os');
const crypto = require('crypto');
const si = require('systeminformation');
const { machineId } = require('node-machine-id');
const util = require('util');
const execAsync = util.promisify(exec);

// Optional dependencies for advanced features
let psList = null;

// Async function to load ps-list (ES module)
async function loadPsList() {
  if (!psList) {
    try {
      const psListModule = await import('ps-list');
      psList = psListModule.default;
    } catch (e) {
      console.warn('ps-list not available - process monitoring limited');
    }
  }
  return psList;
}

class SystemMonitor {
  constructor() {
    this.supabase = null; // Will be set from framework
  }

  async initialize() {
    // Initialize if needed
  }

  // Basic permission validation
  hasPermission(role, action) {
    const systemPermissions = {
      'monitor_game_process': ['Agent'],
      'update_time_quota': ['Parent', 'Agent'],
      'track_time_usage': ['Agent'],
      'monitor_system_integrity': ['Agent'],
      'sync_with_supabase': ['Agent'],
      'read_local_data': ['Agent', 'Parent'],
      'write_local_data': ['Agent'],
      'execute_system_command': ['Agent'],
      'manage_windows_service': ['Agent'],
      'check_network_connectivity': ['Agent'],
      'send_telemetry': ['Agent']
    };

    return systemPermissions[action]?.includes(role) || false;
  }

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
      console.error(`Failed to monitor game process: ${error.message}`);
      throw error;
    }
  }

  async monitor_system_integrity(params, role) {
    if (!this.hasPermission(role, 'monitor_system_integrity')) {
      throw new Error(`Role ${role} does not have permission for action: monitor_system_integrity`);
    }

    try {
      const [memUsage, cpuUsage] = await Promise.all([
        this.checkMemoryUsage(),
        this.checkCpuUsage()
      ]);

      const systemInfo = {
        memory: memUsage,
        cpu: cpuUsage,
        timestamp: new Date().toISOString(),
        status: 'healthy'
      };

      // Determine system health
      if (memUsage.usage_percent > 90 || cpuUsage.usage_percent > 95) {
        systemInfo.status = 'critical';
      } else if (memUsage.usage_percent > 75 || cpuUsage.usage_percent > 80) {
        systemInfo.status = 'warning';
      }

      return systemInfo;
    } catch (error) {
      console.error(`Failed to monitor system integrity: ${error.message}`);
      throw error;
    }
  }

  async sync_with_supabase(params, role) {
    if (!this.hasPermission(role, 'sync_with_supabase')) {
      throw new Error(`Role ${role} does not have permission for action: sync_with_supabase`);
    }

    if (!this.supabase) {
      return { status: 'disabled', message: 'Supabase not configured' };
    }

    try {
      const syncData = {
        machine_id: await machineId(),
        timestamp: new Date().toISOString(),
        data: params.data || {},
        sync_type: params.sync_type || 'general'
      };

      const { data, error } = await this.supabase
        .from('sync_logs')
        .insert([syncData])
        .select();

      if (error) throw error;

      return {
        status: 'success',
        sync_id: data[0]?.id,
        timestamp: syncData.timestamp
      };
    } catch (error) {
      console.error(`Failed to sync with Supabase: ${error.message}`);
      throw error;
    }
  }

  async checkMemoryUsage() {
    try {
      const mem = await si.mem();
      return {
        total: mem.total,
        used: mem.used,
        free: mem.free,
        usage_percent: Math.round((mem.used / mem.total) * 100)
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  async checkCpuUsage() {
    try {
      const cpu = await si.currentLoad();
      return {
        usage_percent: Math.round(cpu.currentLoad),
        cores: cpu.cpus?.length || 0
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  async track_time_usage(params, role) {
    if (!this.hasPermission(role, 'track_time_usage')) {
      throw new Error(`Role ${role} does not have permission for action: track_time_usage`);
    }

    // Implementation for time tracking
    const timeData = {
      session_start: params.session_start || new Date().toISOString(),
      session_end: params.session_end || new Date().toISOString(),
      activity_type: params.activity_type || 'game',
      duration_minutes: params.duration_minutes || 0
    };

    return {
      status: 'tracked',
      time_data: timeData
    };
  }

  async check_network_connectivity(params, role) {
    if (!this.hasPermission(role, 'check_network_connectivity')) {
      throw new Error(`Role ${role} does not have permission for action: check_network_connectivity`);
    }

    try {
      const { stdout, stderr } = await execAsync('ping -n 1 8.8.8.8');
      const isConnected = !stderr && stdout.includes('TTL=');

      return {
        connected: isConnected,
        timestamp: new Date().toISOString(),
        test_host: '8.8.8.8'
      };
    } catch (error) {
      return {
        connected: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  async read_local_data(params, role) {
    if (!this.hasPermission(role, 'read_local_data')) {
      throw new Error(`Role ${role} does not have permission for action: read_local_data`);
    }

    try {
      const dataPath = params.data_path || 'user_data.json';
      const data = await fs.readFile(dataPath, 'utf8');
      return {
        status: 'success',
        data: JSON.parse(data)
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message
      };
    }
  }

  async write_local_data(params, role) {
    if (!this.hasPermission(role, 'write_local_data')) {
      throw new Error(`Role ${role} does not have permission for action: write_local_data`);
    }

    try {
      const dataPath = params.data_path || 'user_data.json';
      await fs.writeFile(dataPath, JSON.stringify(params.data, null, 2));
      return {
        status: 'success',
        path: dataPath
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message
      };
    }
  }

  async execute_system_command(params, role) {
    if (!this.hasPermission(role, 'execute_system_command')) {
      throw new Error(`Role ${role} does not have permission for action: execute_system_command`);
    }

    try {
      const { stdout, stderr } = await execAsync(params.command);
      return {
        status: 'success',
        stdout,
        stderr
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message
      };
    }
  }

  async manage_windows_service(params, role) {
    if (!this.hasPermission(role, 'manage_windows_service')) {
      throw new Error(`Role ${role} does not have permission for action: manage_windows_service`);
    }

    // Implementation for Windows service management
    return {
      status: 'not_implemented',
      message: 'Windows service management not implemented'
    };
  }

  async send_telemetry(params, role) {
    if (!this.hasPermission(role, 'send_telemetry')) {
      throw new Error(`Role ${role} does not have permission for action: send_telemetry`);
    }

    // Implementation for telemetry
    return {
      status: 'sent',
      timestamp: new Date().toISOString()
    };
  }

  async update_time_quota(params, role) {
    if (!this.hasPermission(role, 'update_time_quota')) {
      throw new Error(`Role ${role} does not have permission for action: update_time_quota`);
    }

    // Implementation for time quota updates
    return {
      status: 'updated',
      new_quota: params.quota_minutes || 0,
      timestamp: new Date().toISOString()
    };
  }

  async cleanup() {
    // Cleanup resources if needed
  }
}

module.exports = SystemMonitor;
