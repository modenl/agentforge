<script>
  // 核心导入
  import { onMount } from 'svelte';
  import AdaptiveCardPanel from './components/AdaptiveCardPanel.svelte';
  import ChatWindow from './components/ChatWindow.svelte';

  // 全局应用状态（非聊天状态）
  let electronAPI = null;
  let currentState = null;

  // 双卡片架构
  let globalCard = null;
  let inputAssistCard = null;

  // 初始化应用
  onMount(async() => {
    electronAPI = window.electronAPI;

    if (!electronAPI || !electronAPI.log) {
      console.error('ElectronAPI or log not available in onMount');
      return;
    }

    // 设置日志转发
    setupLogging();

    try {
      // 加载初始变量
      await loadInitialVariables();

      console.log('🚀 CoreAgent Svelte App initialized successfully');
    } catch (error) {
      console.error('🔥 App initialization failed:', error);
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

  // 获取状态显示文本
  function getStatusText() {
    // 尝试从全局变量或window获取应用名称
    const appName = window.appName || document.title || 'Framework App';
    
    if (!currentState) return appName;

    const role = currentState.role === 'child' ? '儿童模式' : '家长模式';
    const state = currentState.child_state || currentState.parent_state || 'idle';
    return `${appName} - ${role} - ${state}`;
  }
</script>

<main class="app-container">
  <!-- 状态栏 -->
  <div class="status-bar">
    <div class="status-text">{getStatusText()}</div>
  </div>

  <!-- 主要内容区域 -->
  <div class="main-content">
    <!-- 聊天区域 -->
    <div class="chat-section">
      <ChatWindow
        bind:this={chatWindowComponent}
        on:stateUpdate={handleStateUpdate}
        {inputAssistCard}
        on:inputAssistAction={handleInputAssistAction}
      />
    </div>

    <!-- Adaptive Card区域 -->
    <div class="card-section">
      {#if globalCard}
        <AdaptiveCardPanel
          cards={[globalCard]}
          on:cardAction={handleAdaptiveCardAction}
        />
      {:else}
        <!-- 空白，不显示任何加载提示 -->
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
    flex: 2;
    background: #ffffff;
    border-right: 1px solid #e0e0e0;
    overflow: hidden;
  }

  .card-section {
    flex: 1;
    background: #fafafa;
    max-width: 450px;
    overflow-y: auto;
    overflow-x: visible;
    padding: 12px;
  }

  .empty-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 200px;
    background: #ffffff;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08);
    border: 1px solid #e0e0e0;
    elevation: 1;
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