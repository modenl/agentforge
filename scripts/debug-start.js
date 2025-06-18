#!/usr/bin/env node

/**
 * 调试启动脚本
 * 快速启动不同模式的应用进行调试
 */

const { spawn } = require('child_process');
const path = require('path');

const modes = {
  'child': {
    env: {
      DEFAULT_ROLE: 'Child',
      FULLSCREEN_LOCK: 'true',
      NODE_ENV: 'development',
      ELECTRON_ENABLE_LOGGING: '1'
    },
    description: '🔒 儿童模式 - 全屏锁定'
  },
  'parent': {
    env: {
      DEFAULT_ROLE: 'Parent',
      NODE_ENV: 'development',
      ELECTRON_ENABLE_LOGGING: '1'
    },
    description: '👨‍👩‍👧‍👦 家长模式 - 管理界面'
  },
  'agent': {
    env: {
      DEFAULT_ROLE: 'Agent',
      NODE_ENV: 'development',
      ELECTRON_ENABLE_LOGGING: '1'
    },
    description: '🤖 代理模式 - 系统管理'
  },
  'debug': {
    env: {
      NODE_ENV: 'development',
      ELECTRON_ENABLE_LOGGING: '1',
      ELECTRON_ENABLE_STACK_DUMPING: '1'
    },
    args: ['--inspect=9222', '--remote-debugging-port=9223'],
    description: '🔧 调试模式 - 开发者工具'
  }
};

function showHelp() {
  console.log('🚀 全屏锁定应用调试启动器\n');
  console.log('用法: node scripts/debug-start.js [模式]\n');
  console.log('可用模式:');
  Object.entries(modes).forEach(([key, config]) => {
    console.log(`  ${key.padEnd(8)} - ${config.description}`);
  });
  console.log('\n示例:');
  console.log('  node scripts/debug-start.js child   # 启动儿童模式');
  console.log('  node scripts/debug-start.js parent  # 启动家长模式');
  console.log('  node scripts/debug-start.js debug   # 启动调试模式');
  console.log('');
}

function startApp(mode = 'debug') {
  const config = modes[mode];

  if (!config) {
    console.error(`❌ 未知模式: ${mode}`);
    showHelp();
    process.exit(1);
  }

  console.log(`🚀 启动模式: ${config.description}`);
  console.log('📍 项目路径:', path.resolve('.'));

  const env = {
    ...process.env,
    ...config.env
  };

  const args = ['.', ...(config.args || [])];

  console.log('🔧 环境变量:', JSON.stringify(config.env, null, 2));
  console.log('📋 启动参数:', args);
  console.log('');

  const electronProcess = spawn('npx', ['electron', ...args], {
    stdio: 'inherit',
    shell: true,
    env,
    cwd: path.resolve('.')
  });

  electronProcess.on('error', (error) => {
    console.error('❌ 启动失败:', error);
    process.exit(1);
  });

  electronProcess.on('exit', (code) => {
    console.log(`\n📊 应用退出，退出码: ${code}`);
    process.exit(code);
  });

  // 优雅关闭处理
  process.on('SIGINT', () => {
    console.log('\n🛑 收到中断信号，正在关闭应用...');
    electronProcess.kill('SIGTERM');
  });

  process.on('SIGTERM', () => {
    console.log('\n🛑 收到终止信号，正在关闭应用...');
    electronProcess.kill('SIGTERM');
  });
}

// 主程序
const mode = process.argv[2];

if (!mode || mode === '--help' || mode === '-h') {
  showHelp();
  process.exit(0);
}

startApp(mode); 