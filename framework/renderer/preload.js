const { contextBridge, ipcRenderer } = require('electron');

// 将安全的API暴露给渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  // ==================== 核心Agent API ====================

  // 处理用户输入 - 通过CoreAgent处理
  processCoreInput: async(userInput, context) => {
    console.log('🌉 [PRELOAD] 发送请求 |', `输入: "${userInput.substring(0, 30)}..." | 上下文: ${Object.keys(context).join(',')}`);

    const startTime = Date.now();
    try {
      const result = await ipcRenderer.invoke('core:processInput', userInput, context);
      const duration = Date.now() - startTime;

      console.log('🌉 [PRELOAD] 收到响应 |', `耗时: ${duration}ms | 成功: ${result?.success} | 消息: ${result?.message?.length || 0}字 | 卡片: ${!!result?.adaptive_card}`);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error('🌉 [PRELOAD] ❌ 失败 |', `耗时: ${duration}ms | 错误: ${error.message}`);
      throw error;
    }
  },

  // 流式处理用户输入 - 支持实时响应显示
  processCoreInputStreaming: async(userInput, context, streamCallback) => {
    // console.log('🌊 [PRELOAD] 流式请求 |', `输入: "${userInput.substring(0, 30)}..." | 上下文: ${Object.keys(context).join(',')}`);

    const startTime = Date.now();
    try {
      // 设置流式回调监听器
      const listenerId = `stream-${Date.now()}-${Math.random()}`;

      if (streamCallback) {
        ipcRenderer.on(`stream-chunk-${listenerId}`, (event, chunkData) => {
          streamCallback(chunkData);
        });
      }

      // 发送流式请求
      const result = await ipcRenderer.invoke('core:processInputStreaming', userInput, context, listenerId);
      const duration = Date.now() - startTime;

      // 清理监听器
      if (streamCallback) {
        ipcRenderer.removeAllListeners(`stream-chunk-${listenerId}`);
      }

      // console.log('🌊 [PRELOAD] 流式完成 |', `耗时: ${duration}ms | 成功: ${result?.success} | 消息: ${result?.message?.length || 0}字`);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      // console.error('🌊 [PRELOAD] ❌ 流式失败 |', `耗时: ${duration}ms | 错误: ${error.message}`);
      throw error;
    }
  },

  // 获取当前状态
  getCoreState: () => ipcRenderer.invoke('core:getState'),

  // 获取可见聊天历史
  getVisibleHistory: () => ipcRenderer.invoke('core:getVisibleHistory'),

  // 系统事件通知
  notifySystemEvent: (eventType, eventData) => ipcRenderer.invoke('system:notify', eventType, eventData),

  // ==================== 事件监听器 ====================

  // 监听系统初始化完成
  onSystemInitialized: (callback) => {
    ipcRenderer.on('system:initialized', (event, data) => callback(data));
  },

  // 移除事件监听器
  removeAllListeners: (channel) => {
    ipcRenderer.removeAllListeners(channel);
  },

  // ==================== 兼容性API (逐步移除) ====================

  // MCP相关API
  mcpGetData: (query) => ipcRenderer.invoke('mcp:getData', query),
  mcpExecute: (action) => ipcRenderer.invoke('mcp:execute', action),
  
  // MCP WebView相关API
  getServerIframeConfig: (serverName) => ipcRenderer.invoke('mcp:getServerIframeConfig', serverName),
  getIframeCapableServers: () => ipcRenderer.invoke('mcp:getIframeCapableServers'),
  
  // MCP服务器控制API
  startMCPServer: (serverName) => ipcRenderer.invoke('mcp:startServer', serverName),
  stopMCPServer: (serverName) => ipcRenderer.invoke('mcp:stopServer', serverName),
  
  // MCP服务器事件监听
  onMCPServerIframeReady: (callback) => {
    ipcRenderer.on('mcp:server-iframe-ready', (event, data) => callback(data));
  },
  onMCPServerStopped: (callback) => {
    ipcRenderer.on('mcp:server-stopped', (event, data) => callback(data));
  },

  // ==================== 调试和开发API ====================

  // 前端日志发送到主进程
  log: {
    info: (...args) => ipcRenderer.send('frontend-log', { level: 'info', args }),
    warn: (...args) => ipcRenderer.send('frontend-log', { level: 'warn', args }),
    error: (...args) => ipcRenderer.send('frontend-log', { level: 'error', args }),
    debug: (...args) => ipcRenderer.send('frontend-log', { level: 'debug', args })
  },

  // ==================== 安全API ====================

  // 获取应用版本和基本信息
  getAppInfo: () => ({
    version: process.env.npm_package_version || '1.0.0',
    platform: process.platform,
    arch: process.arch,
    node: process.version
  }),

  // 开发模式检测
  isDev: process.env.NODE_ENV === 'development' || process.env.DEV_MODE === 'true',
  
  // 设置窗口标题
  setWindowTitle: (title) => ipcRenderer.invoke('window:setTitle', title),

  // ==================== 实用工具 ====================

  // 安全的HTML转义
  escapeHtml: (text) => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  // 时间格式化
  formatTime: (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}小时${mins}分钟`;
    }
    return `${mins}分钟`;
  }
});

// 确认preload脚本已加载
console.log('✅ Preload script loaded successfully for CoreAgent architecture');

// 发送加载确认到主进程
ipcRenderer.send('preload-script-loaded', {
  timestamp: new Date().toISOString(),
  architecture: 'CoreAgent',
  apis: [
    'processCoreInput',
    'processCoreInputStreaming',
    'getCoreState',
    'getVisibleHistory',
    'notifySystemEvent',
    'onSystemInitialized'
  ]
});

// 在窗口加载后进行一些初始化
window.addEventListener('DOMContentLoaded', () => {
  // 添加全局错误处理
  window.addEventListener('error', (event) => {
    ipcRenderer.send('frontend-log', {
      level: 'error',
      args: [`前端错误: ${event.error?.message || event.message}`, event.error?.stack]
    });
  });

  // 添加未处理的Promise拒绝处理
  window.addEventListener('unhandledrejection', (event) => {
    ipcRenderer.send('frontend-log', {
      level: 'error',
      args: [`未处理的Promise拒绝: ${event.reason}`]
    });
  });

  console.log('🎯 CoreAgent前端环境已准备就绪');
}); 