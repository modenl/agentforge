<script>
  // 核心导入
  import { onMount, onDestroy } from 'svelte';
  import AdaptiveCardPanel from './components/AdaptiveCardPanel.svelte';
  import ChatWindow from './components/ChatWindow.svelte';
  import MCPView from './components/MCPView.svelte';

  // 全局应用状态（非聊天状态）
  let electronAPI = null;
  let currentState = null;
  let appName = '';
  
  
  // Create an interval to check for window.appName
  let appNameCheckInterval;
  
  function startAppNameCheck() {
    appNameCheckInterval = setInterval(() => {
      if (window.appName && window.appName !== appName) {
        console.log('[AppName Check] Updating appName from', appName, 'to', window.appName);
        appName = window.appName;
      }
    }, 100);
    
    // Stop checking after 10 seconds
    setTimeout(() => {
      if (appNameCheckInterval) {
        clearInterval(appNameCheckInterval);
      }
    }, 10000);
  }

  // 双卡片架构
  let globalCard = null;
  let inputAssistCard = null;
  
  // MCP View 相关状态
  let showMCPView = false;
  let mcpUrl = '';
  let mcpTitle = '';
  let mcpServerName = '';
  let hasReceivedMCPUrl = false; // Track if we've received a URL from MCP server
  let mcpViewMode = 'compact'; // 'normal', 'compact', 'fullscreen', 'mini' - default to compact
  let mcpViewComponent = null;
  
  // 分隔器拖动相关
  let splitPosition = 65; // 默认聊天区域占65%
  let isDragging = false;
  let containerWidth = 0;
  const MIN_CHAT_WIDTH = 400; // 聊天窗口最小宽度
  const MIN_CARD_WIDTH = 350; // 卡片区域最小宽度
  const MIN_MCP_VIEW_WIDTH = 600; // MCP View最小宽度

  // 初始化应用
  onMount(async() => {
    electronAPI = window.electronAPI;
    
    
    // Start checking for app name
    startAppNameCheck();
    
    // 立即尝试设置标题（如果 appName 已经存在）
    console.log('[Title Debug] Initial check - window.appName:', window.appName, 'document.title:', document.title);
    
    if (window.appName && window.appName !== 'Loading...') {
      console.log('[Title Debug] Setting document title to:', window.appName);
      document.title = window.appName;
      appName = window.appName; // Update reactive variable
      
      // Also update Electron window title
      if (electronAPI && electronAPI.setWindowTitle) {
        electronAPI.setWindowTitle(window.appName).then(success => {
          console.log('[Title Debug] Electron window title set:', success);
        });
      }
    }

    if (!electronAPI || !electronAPI.log) {
      console.error('ElectronAPI or log not available in onMount');
      // 即使 electronAPI 不可用，也要隐藏加载屏幕
      if (window.hideLoadingScreen && typeof window.hideLoadingScreen === 'function') {
        window.hideLoadingScreen();
      }
      return;
    }

    // 设置日志转发
    setupLogging();
    
    // 设置MCP服务器事件监听
    setupMCPEventListeners();
    
    // 设置分隔器拖动事件
    setupSplitDragging();
    
    // 监听窗口大小变化
    window.addEventListener('resize', handleResize);
    handleResize();

    try {
      // 加载初始变量
      await loadInitialVariables();

      console.log('🚀 CoreAgent Svelte App initialized successfully');
      
      // 通知父页面应用已加载完成
      if (window.hideLoadingScreen && typeof window.hideLoadingScreen === 'function') {
        window.hideLoadingScreen();
      }
    } catch (error) {
      console.error('🔥 App initialization failed:', error);
      // 通知父页面加载失败
      if (window.showErrorScreen && typeof window.showErrorScreen === 'function') {
        window.showErrorScreen('应用初始化失败：' + error.message);
      }
    }
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (appNameCheckInterval) {
        clearInterval(appNameCheckInterval);
      }
    };
  });
  
  onDestroy(() => {
    if (appNameCheckInterval) {
      clearInterval(appNameCheckInterval);
    }
  });

  // 设置日志转发到主进程
  function setupLogging() {
    ['log', 'warn', 'error'].forEach(level => {
      const orig = console[level];
      console[level] = function(...args) {
        try {
          if (electronAPI.log[level === 'log' ? 'info' : level]) {
            electronAPI.log[level === 'log' ? 'info' : level](...args);
          }
        } catch (e) {
        // Ignore logging errors
        }
        orig.apply(console, args);
      };
    });
  }
  
  
  // 设置MCP服务器事件监听
  function setupMCPEventListeners() {
    if (!electronAPI) return;
    
    // 监听MCP服务器准备就绪事件
    electronAPI.onMCPServerIframeReady((data) => {
      console.log('🎯 [MCP VIEW EVENT] MCP server ready!');
      console.log('📦 Full event data:', JSON.stringify(data, null, 2));
      console.log('🔧 Config:', JSON.stringify(data.iframeConfig, null, 2));
      
      if (data.iframeConfig) {
        if (data.iframeConfig.url) {
          const newUrl = data.iframeConfig.url;
          
          // Only accept URLs from MCP servers (not fallback URLs)
          if (newUrl.startsWith('http://localhost:3000')) {
            console.warn('⚠️ [MCP VIEW] Ignoring fallback URL from MCP event:', newUrl);
            return;
          }
          
          console.log('✅ [MCP VIEW] Setting MCP view state:');
          console.log('   URL:', newUrl);
          console.log('   Title:', data.iframeConfig.title || data.serverName);
          console.log('   Server:', data.serverName);
          
          showMCPView = true;
          mcpUrl = newUrl;
          mcpTitle = data.iframeConfig.title || data.serverName;
          mcpServerName = data.serverName;
          hasReceivedMCPUrl = true;
          
          // 右侧面板现在总是显示
          
          // 根据不同场景设置视图模式
          if (data.iframeConfig.preferredMode) {
            mcpViewMode = data.iframeConfig.preferredMode;
          } else {
            // 默认使用 compact mode
            mcpViewMode = 'compact';
          }
          
          console.log('📊 [MCP VIEW] State after update:');
          console.log('   showMCPView:', showMCPView);
          console.log('   mcpUrl:', mcpUrl);
          console.log('   mcpTitle:', mcpTitle);
          console.log('   hasReceivedMCPUrl:', hasReceivedMCPUrl);
          console.log('   viewMode:', mcpViewMode);
          
          // 调整分隔位置以满足最小宽度要求
          setTimeout(() => {
            console.log('📐 [MCP VIEW] Adjusting split position...');
            adjustSplitPosition();
          }, 100);
        } else {
          console.error('❌ [MCP VIEW] No URL in config!');
          console.error('   Config:', data.iframeConfig);
        }
      } else {
        console.error('❌ [MCP VIEW] No config in event data!');
        console.error('   Data:', data);
      }
    });
    
    // 监听MCP服务器停止事件
    electronAPI.onMCPServerStopped((data) => {
      console.log('MCP server stopped:', data);
      if (data.serverName === mcpServerName) {
        closeMCPView();
      }
    });
  }
  
  // WebView相关方法
  function setupWebViewMessaging() {
    // WebView的消息通过IPC处理，不需要postMessage
    // 消息会通过 MCPView 组件的事件转发
  }
  
  function handleWebViewMessage(event) {
    // 处理来自WebView的消息
    console.log('Received message from WebView:', event.detail);
    
    // 可以将WebView的消息转发给ChatWindow
    if (event.detail.channel === 'user_action' && chatWindowComponent) {
      chatWindowComponent.handleExternalMessage(`来自 ${mcpTitle} 的操作: ${event.detail.args[0]}`);
    }
  }
  
  function closeMCPView() {
    showMCPView = false;
    mcpUrl = '';
    mcpTitle = '';
    mcpServerName = '';
    hasReceivedMCPUrl = false;
  }
  
  // 程序化控制MCP View的方法
  function setMCPViewMode(mode) {
    if (mcpViewComponent) {
      mcpViewComponent.setViewMode(mode);
      mcpViewMode = mode;
    }
  }
  
  // 根据不同状态调整MCP View
  function adjustMCPViewForContext(context) {
    switch (context) {
      case 'gaming':
        setMCPViewMode('normal');
        break;
      case 'monitoring':
        setMCPViewMode('compact');
        break;
      case 'focus':
        setMCPViewMode('fullscreen');
        break;
      case 'background':
        setMCPViewMode('mini');
        break;
    }
  }

  // 加载初始变量
  async function loadInitialVariables() {
    try {
      const stateData = await electronAPI.getCoreState();
      if (stateData) {
        currentState = stateData.agent_state;
      }
    } catch (error) {
      console.error('Failed to load initial variables:', error);
    }
  }

  // 处理来自ChatWindow的状态更新事件
  function handleStateUpdate(event) {
    const { newState, adaptiveCard } = event.detail;

    if (newState) {
      currentState = newState;
    }

    if (adaptiveCard) {
      updateGlobalCard(adaptiveCard);
    }
  }

  // 处理InputAssistCard按钮点击
  function handleInputAssistAction(event) {
    const eventData = event.detail;
    console.log('🎯 InputAssist Card Event:', eventData);

    // 从事件中提取action数据
    const actionData = eventData.action;

    // 快速回复，直接发送到ChatWindow
    let messageText = '';
    if (actionData && actionData.data && actionData.data.text) {
      messageText = actionData.data.text;
    } else if (actionData && actionData.title) {
      messageText = actionData.title;
    }

    console.log('📤 InputAssist发送消息文本:', messageText);

    // 通知ChatWindow处理这个消息
    if (chatWindowComponent && chatWindowComponent.handleExternalMessage) {
      chatWindowComponent.handleExternalMessage(messageText);
    }
  }

  // 更新全局Adaptive Card
  function updateGlobalCard(cardData) {
    console.log('🎯 更新全局Adaptive Card:', cardData);

    if (!cardData) {
      globalCard = null;
      inputAssistCard = null;
      return;
    }

    // 简化逻辑：只接受标准格式 {global: {...}, assist: {...}}
    if (cardData.global || cardData.assist) {
      // 处理 global card
      if (cardData.global) {
        globalCard = {
          type: 'AdaptiveCard',
          version: '1.6',
          ...cardData.global,
          actionsOrientation: 'Vertical'
        };
      } else {
        globalCard = null;
      }

      // 处理 assist card
      if (cardData.assist) {
        inputAssistCard = {
          type: 'AdaptiveCard',
          version: '1.6',
          ...cardData.assist,
          actionsOrientation: 'Horizontal'
        };
      } else {
        inputAssistCard = null;
      }
    } else {
      // 兜底：其他格式作为 global card 处理
      globalCard = {
        type: 'AdaptiveCard',
        version: '1.6',
        ...cardData,
        actionsOrientation: 'Vertical'
      };
      inputAssistCard = null;
    }

    console.log('🎮 更新后的globalCard:', globalCard);
    console.log('🎯 更新后的inputAssistCard:', inputAssistCard);
  }

  // ChatWindow组件引用
  let chatWindowComponent;

  // 处理Adaptive Card按钮点击
  function handleAdaptiveCardAction(event) {
    const eventData = event.detail;
    console.log('🎯 Adaptive Card Event:', eventData);

    // 从事件中提取action数据
    const actionData = eventData.action;
    console.log('🎯 Action Data:', actionData);

    // 将按钮点击转换为文本消息，发送给ChatWindow处理
    let messageText = '';

    if (actionData && actionData.data && actionData.data.text) {
      messageText = actionData.data.text;
    } else if (actionData && actionData.title) {
      messageText = actionData.title;
    } else {
      console.warn('⚠️ 无法提取按钮文本，使用备用方案');
      messageText = actionData?.title || '未知操作';
    }

    console.log('📤 发送消息文本:', messageText);

    // 通知ChatWindow处理这个消息
    if (chatWindowComponent && chatWindowComponent.handleExternalMessage) {
      chatWindowComponent.handleExternalMessage(messageText);
    }
  }

  // Make status text reactive
  $: statusText = (() => {
    const currentAppName = appName || window.appName || '';
    console.log('[statusText reactive] appName=', appName, 'window.appName=', window.appName, 'using:', currentAppName);
    
    // Don't show anything if app name not loaded yet
    if (!currentAppName) return '';
    
    // Just return the app name - let each app decide what additional info to show
    return currentAppName;
  })();
  
  // 处理窗口大小变化
  function handleResize() {
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
      containerWidth = mainContent.offsetWidth;
      adjustSplitPosition();
    }
  }
  
  // 调整分隔位置以满足最小宽度要求
  function adjustSplitPosition() {
    if (!containerWidth) return;
    
    const chatWidth = (containerWidth * splitPosition) / 100;
    const cardWidth = containerWidth - chatWidth;
    
    // 检查最小宽度约束
    if (showMCPView) {
      // 当有MCP View时，确保右侧有足够宽度
      const minRightWidth = Math.max(MIN_CARD_WIDTH, MIN_MCP_VIEW_WIDTH);
      if (cardWidth < minRightWidth) {
        splitPosition = ((containerWidth - minRightWidth) / containerWidth) * 100;
      }
    } else {
      // 没有MCP View时，只需要满足卡片最小宽度
      if (cardWidth < MIN_CARD_WIDTH) {
        splitPosition = ((containerWidth - MIN_CARD_WIDTH) / containerWidth) * 100;
      }
    }
    
    // 确保聊天窗口也满足最小宽度
    if (chatWidth < MIN_CHAT_WIDTH) {
      splitPosition = (MIN_CHAT_WIDTH / containerWidth) * 100;
    }
  }
  
  // 设置分隔器拖动
  function setupSplitDragging() {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }
  
  function handleSplitterMouseDown(e) {
    isDragging = true;
    e.preventDefault();
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    
    // Create an overlay to capture all mouse events during drag
    const overlay = document.createElement('div');
    overlay.className = 'drag-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 10000;
      cursor: col-resize;
    `;
    document.body.appendChild(overlay);
    
    // Store overlay reference for cleanup
    window._dragOverlay = overlay;
  }
  
  function handleMouseMove(e) {
    if (!isDragging || !containerWidth) return;
    
    const mainContent = document.querySelector('.main-content');
    if (!mainContent) return;
    
    const rect = mainContent.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const newSplitPosition = (x / containerWidth) * 100;
    
    // 计算实际宽度
    const chatWidth = (containerWidth * newSplitPosition) / 100;
    const cardWidth = containerWidth - chatWidth;
    
    // 检查最小宽度约束
    const minRightWidth = showMCPView ? Math.max(MIN_CARD_WIDTH, MIN_MCP_VIEW_WIDTH) : MIN_CARD_WIDTH;
    
    if (chatWidth >= MIN_CHAT_WIDTH && cardWidth >= minRightWidth) {
      splitPosition = newSplitPosition;
    }
  }
  
  function handleMouseUp() {
    if (isDragging) {
      isDragging = false;
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
      
      // Remove drag overlay
      if (window._dragOverlay) {
        window._dragOverlay.remove();
        window._dragOverlay = null;
      }
    }
  }
</script>

<main class="app-container">
  <!-- 状态栏 -->
  <div class="status-bar">
    <div class="status-text">{statusText}</div>
  </div>

  <!-- 主要内容区域 -->
  <div class="main-content">
    <!-- 聊天区域 -->
    <div class="chat-section" style="flex: 0 0 {splitPosition}%">
      <ChatWindow
        bind:this={chatWindowComponent}
        on:stateUpdate={handleStateUpdate}
        {inputAssistCard}
        on:inputAssistAction={handleInputAssistAction}
      />
    </div>
    
    <!-- 分隔器 -->
    <div 
      class="splitter {isDragging ? 'dragging' : ''}"
      on:mousedown|preventDefault={handleSplitterMouseDown}
      role="separator"
      aria-orientation="vertical"
    >
      <div class="splitter-handle"></div>
    </div>

    <!-- Adaptive Card区域 -->
    <div class="card-section" style="flex: 0 0 calc({100 - splitPosition}% - 6px)">
        {#if globalCard}
          <div class="global-card-container">
            <AdaptiveCardPanel
              cards={[globalCard]}
              on:cardAction={handleAdaptiveCardAction}
            />
          </div>
        {/if}
        
        {#if showMCPView}
          <MCPView
            bind:this={mcpViewComponent}
            url={mcpUrl}
            serverName={mcpServerName}
            title={mcpTitle}
            viewMode={mcpViewMode}
            on:ready={() => console.log('✅ MCP View ready')}
            on:navigate={(e) => console.log('🧭 Navigate:', e.detail)}
            on:state-update={(e) => console.log('📊 State update:', e.detail)}
            on:resize-request={(e) => {
              console.log('📐 Resize request:', e.detail);
              // Handle resize request if needed
            }}
          />
        {:else if !globalCard}
          <div class="empty-card">
            <div class="empty-icon">📡</div>
            <div class="empty-text">等待 MCP 服务器</div>
          </div>
        {/if}
    </div>
  </div>
</main>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: 'Roboto', 'Microsoft YaHei', 'PingFang SC', sans-serif;
    background: #f5f5f5;
    height: 100vh;
    overflow: hidden;
  }

  .app-container {
    display: flex;
    flex-direction: column;
    height: calc(100vh - 16px);
    background: #ffffff;
    margin: 8px;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0,0,0,0.12), 0 2px 4px rgba(0,0,0,0.08);
    overflow: hidden;
    elevation: 4;
  }

  .status-bar {
    background: #1976d2;
    color: white;
    padding: 16px 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 2px 4px rgba(0,0,0,0.12);
    flex-shrink: 0;
    elevation: 2;
  }
  
  /* Settings button removed - keep interface clean */
  

  .status-text {
    font-weight: bold;
    font-size: 18px;
  }

  .status-info {
    font-size: 14px;
    opacity: 0.9;
  }

  .main-content {
    flex: 1;
    display: flex;
    overflow: hidden;
    min-height: 0;
  }

  .chat-section {
    background: #ffffff;
    overflow: hidden;
    min-width: 0;
  }
  
  .splitter {
    width: 6px;
    background: #e0e0e0;
    cursor: col-resize;
    position: relative;
    flex-shrink: 0;
    transition: background-color 0.2s;
  }
  
  .splitter:hover {
    background: #bdbdbd;
  }
  
  .splitter.dragging {
    background: #1976d2;
  }
  
  .splitter-handle {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 2px;
    height: 30px;
    background: #9e9e9e;
    border-radius: 1px;
  }

  .card-section {
    background: #fafafa;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    min-width: 0;
  }
  
  .global-card-container {
    flex-shrink: 0;
    padding: 12px;
    overflow-y: auto;
    overflow-x: visible;
    max-height: 40%; /* Limit card height to leave room for MCP View */
    background: transparent; /* Same as parent background */
  }
  

  .empty-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 200px;
    background: transparent;
    margin: 12px;
  }

  .empty-icon {
    font-size: 48px;
    margin-bottom: 15px;
    opacity: 0.5;
  }

  .empty-text {
    color: #666;
    font-size: 16px;
  }
</style> 