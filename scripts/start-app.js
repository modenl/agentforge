#!/usr/bin/env node

// Unified App Starter
// Single script to start any app with configurable options

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const startupConfig = require('../framework/config/startup-config.js');

function showHelp() {
  console.log(`
🚀 统一应用启动器

用法:
  npm start [app-name] [options]
  npm run start [app-name] [options]

可用应用:
${Object.entries(startupConfig.availableApps).map(([key, app]) => 
  `  ${app.icon} ${key.padEnd(20)} - ${app.description}`
).join('\n')}

选项:
  --build, -b     启动前先构建
  --smart, -s     启动前智能构建（只在源文件有更新时构建）
  --debug, -d     启用调试模式
  --help, -h      显示此帮助信息

示例:
  npm start                     # 启动默认应用 (${startupConfig.defaultApp})
  npm start chess-game          # 启动象棋游戏
  npm start game-time-manager   # 启动游戏时间管理器
  npm start chess-game --build  # 启动象棋游戏并先构建
  npm start chess-game --smart  # 启动象棋游戏并智能构建
  npm start --debug             # 启动默认应用并启用调试
  npm start chess-game --smart --debug # 智能构建后启动调试模式
`);
}

function parseArgs() {
  const args = process.argv.slice(2);
  
  let appName = null;
  let shouldBuild = false;
  let debug = false;
  let smartBuild = false;
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--help' || arg === '-h') {
      showHelp();
      process.exit(0);
    } else if (arg === '--build' || arg === '-b') {
      shouldBuild = true;
    } else if (arg === '--smart' || arg === '-s') {
      shouldBuild = true;
      smartBuild = true;
    } else if (arg === '--debug' || arg === '-d') {
      debug = true;
    } else if (!arg.startsWith('-') && !appName) {
      appName = arg;
    }
  }
  
  return { appName, shouldBuild, debug, smartBuild };
}

function validateApp(appName) {
  if (!startupConfig.availableApps[appName]) {
    console.error(`❌ 未知应用: ${appName}`);
    console.error(`可用应用: ${Object.keys(startupConfig.availableApps).join(', ')}`);
    process.exit(1);
  }
  
  const appPath = path.resolve(startupConfig.availableApps[appName].path);
  if (!fs.existsSync(appPath)) {
    console.error(`❌ 应用目录不存在: ${appPath}`);
    process.exit(1);
  }
  
  return appPath;
}

async function buildIfNeeded(shouldBuild, isSmartBuild = false) {
  if (!shouldBuild && !startupConfig.options.autoBuild) {
    return;
  }
  
  // 如果配置中启用了智能构建，则使用智能构建
  if (!isSmartBuild && startupConfig.options.smartBuild) {
    isSmartBuild = true;
  }
  
  if (isSmartBuild) {
    console.log('🔧 正在执行智能构建...');
    
    return new Promise((resolve, reject) => {
      const buildProcess = spawn('node', ['scripts/smart-build.js'], {
        stdio: 'inherit',
        shell: true,
        cwd: path.resolve('.')
      });
      
      buildProcess.on('exit', (code) => {
        if (code === 0) {
          console.log('✅ 智能构建完成');
          resolve();
        } else {
          console.error('❌ 智能构建失败');
          reject(new Error(`Smart build failed with exit code ${code}`));
        }
      });
    });
  } else {
    console.log('🔧 正在构建应用...');
    
    return new Promise((resolve, reject) => {
      const buildProcess = spawn('npm', ['run', 'build'], {
        stdio: 'inherit',
        shell: true,
        cwd: path.resolve('.')
      });
      
      buildProcess.on('exit', (code) => {
        if (code === 0) {
          console.log('✅ 构建完成');
          resolve();
        } else {
          console.error('❌ 构建失败');
          reject(new Error(`Build failed with exit code ${code}`));
        }
      });
    });
  }
}

async function startApp(appName, options = {}) {
  const { shouldBuild, debug, smartBuild } = options;
  
  // 使用默认应用如果没有指定
  if (!appName) {
    appName = startupConfig.defaultApp;
    console.log(`📋 使用默认应用: ${appName}`);
  }
  
  // 验证应用存在
  const appPath = validateApp(appName);
  const appInfo = startupConfig.availableApps[appName];
  
  console.log(`🚀 启动应用: ${appInfo.icon} ${appInfo.name}`);
  console.log(`📂 应用路径: ${appPath}`);
  
  try {
    // 构建（如果需要）
    await buildIfNeeded(shouldBuild, smartBuild);
    
    // 准备环境变量
    const env = {
      ...process.env,
      NODE_ENV: startupConfig.options.nodeEnv,
      DEBUG: debug ? 'true' : process.env.DEBUG,
      APP_NAME: appName
    };
    
    // 准备启动参数
    const electronArgs = ['.', appPath];
    
    if (debug) {
      console.log('🐛 调试模式启用');
      electronArgs.push('--inspect=9222', '--remote-debugging-port=9223');
    }
    
    console.log('🔧 环境变量:', {
      NODE_ENV: env.NODE_ENV,
      DEBUG: env.DEBUG,
      APP_NAME: env.APP_NAME
    });
    console.log('📋 启动参数:', electronArgs);
    console.log('');
    
    // 启动Electron应用
    const electronProcess = spawn('npx', ['electron', ...electronArgs], {
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
    let isShuttingDown = false;
    
    const gracefulShutdown = (signal) => {
      if (isShuttingDown) {
        console.log(`\n⚠️ 已在关闭中，强制退出...`);
        electronProcess.kill('SIGKILL');
        process.exit(1);
        return;
      }
      
      isShuttingDown = true;
      console.log(`\n🛑 收到${signal}信号，正在关闭应用...`);
      
      // 设置5秒超时，如果应用没有正常关闭就强制终止
      const forceExitTimer = setTimeout(() => {
        console.log('\n⏰ 关闭超时，强制终止应用...');
        electronProcess.kill('SIGKILL');
        process.exit(1);
      }, 5000);
      
      electronProcess.kill('SIGTERM');
      
      // 清理超时定时器
      electronProcess.on('exit', () => {
        clearTimeout(forceExitTimer);
      });
    };
    
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    
  } catch (error) {
    console.error('❌ 启动过程中发生错误:', error);
    process.exit(1);
  }
}

// 主程序
const { appName, shouldBuild, debug, smartBuild } = parseArgs();
startApp(appName, { shouldBuild, debug, smartBuild }); 