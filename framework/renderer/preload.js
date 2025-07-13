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
      console.log('🌉 [PRELOAD] 完整响应:', JSON.stringify(result, null, 2));
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error('🌉 [PRELOAD] ❌ 失败 |', `耗时: ${duration}ms | 错误: ${error.message}`);
      console.error('🌉 [PRELOAD] 错误详情:', error);
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

      console.log('🌊 [PRELOAD] 流式完成，收到结果:', {
        success: result?.success,
        hasMessage: !!result?.message,
        messageLength: result?.message?.length || 0,
        messagePreview: result?.message ? result.message.substring(0, 50) + '...' : 'NO MESSAGE',
        hasAdaptiveCard: !!result?.adaptive_card
      });
      
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
  getServerWebviewConfig: (serverName) => ipcRenderer.invoke('mcp:getServerWebviewConfig', serverName),
  getWebviewCapableServers: () => ipcRenderer.invoke('mcp:getWebviewCapableServers'),
  
  // MCP服务器控制API
  startMCPServer: (serverName) => ipcRenderer.invoke('mcp:startServer', serverName),
  stopMCPServer: (serverName) => ipcRenderer.invoke('mcp:stopServer', serverName),
  
  // MCP服务器事件监听
  onMCPServerWebviewReady: (callback) => {
    ipcRenderer.on('mcp:server-webview-ready', (event, data) => callback(data));
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
  },

  // ==================== 通用事件监听器 ====================
  
  // Event listeners
  on: (channel, callback) => {
    const validChannels = [
      'stream-chunk-',
      'message-update',
      'plugin-ui-response',
      'mcp:server-webview-ready',
      'mcp:server-stopped',
      'webview:clearCache',
      'display:message',
      'display:assist-card',
      'ui:update-global-card'
    ];
    
    // Check if channel starts with any valid prefix
    const isValid = validChannels.some(valid => 
      channel === valid || channel.startsWith(valid + '-') || channel.startsWith(valid.replace('-', ''))
    );
    
    if (isValid) {
      // Add debug logging for display events
      if (channel === 'display:message' || channel === 'display:assist-card') {
        console.log(`🎯 [preload] Setting up listener for channel: ${channel}`);
      }
      
      ipcRenderer.on(channel, (event, data) => {
        // Debug log for display events
        if (channel === 'display:message' || channel === 'display:assist-card') {
          console.log(`🎯 [preload] Received ${channel} event:`, data);
        }
        callback(event, data);
      });
    }
  },
  
  // Remove specific listener
  off: (channel, callback) => {
    ipcRenderer.removeListener(channel, callback);
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