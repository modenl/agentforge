<script>
  import { createEventDispatcher, afterUpdate, onMount } from 'svelte';
  import SvelteMarkdown from 'svelte-markdown';
  import AdaptiveCardPanel from './AdaptiveCardPanel.svelte';

  const dispatch = createEventDispatcher();

  // 输入辅助卡片
  export let inputAssistCard = null;

  // 监听inputAssistCard变化
  $: {
    console.log('🎯 ChatWindow收到inputAssistCard更新:', inputAssistCard);
    console.log('🔍 ChatWindow inputAssistCard是否为null:', inputAssistCard === null);
  }

  // 聊天状态（ChatWindow自己管理）
  let messages = [];
  let isProcessing = false;
  let chatInput = '';
  let chatContainer;
  let chatInputElement; // 添加输入框引用
  let electronAPI = null;

  // 初始化ChatWindow
  onMount(async() => {
    electronAPI = window.electronAPI;

    if (!electronAPI) {
      console.error('ElectronAPI not available in ChatWindow');
      return;
    }

    try {
      // 加载聊天历史
      await loadChatHistory();

      // 发送系统初始化消息
      await sendSystemInitialization();

      console.log('💬 ChatWindow initialized successfully');
      
      // 初始化完成后聚焦输入框
      focusInput();
    } catch (error) {
      console.error('💥 ChatWindow initialization failed:', error);
    }
  });

  // Auto-scroll to bottom when new messages arrive
  afterUpdate(() => {
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  });

  // 强制滚动到底部的函数
  function scrollToBottom() {
    if (chatContainer) {
      // 使用 requestAnimationFrame 确保 DOM 更新后再滚动
      requestAnimationFrame(() => {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      });
    }
  }

  // 加载聊天历史
  async function loadChatHistory() {
    try {
      const history = await electronAPI.getVisibleHistory();
      if (history && Array.isArray(history)) {
        messages = history.map(msg => ({
          id: Date.now() + Math.random(),
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp || new Date().toISOString()
        }));
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  }

  // 发送系统初始化消息
  async function sendSystemInitialization() {
    try {
      console.log('🔧 ChatWindow发送系统初始化消息...');

      const response = await electronAPI.processCoreInput('系统初始化', {
        timestamp: new Date().toISOString(),
        isSystemEvent: true
      });

      if (response && response.success) {
        console.log('✅ 系统初始化成功');
        handleCoreAgentResponse(response);
      } else {
        console.error('❌ 系统初始化失败:', response?.error);
        addMessage('系统初始化失败', 'system');
      }
    } catch (error) {
      console.error('❌ 系统初始化异常:', error);
      addMessage('系统初始化异常', 'system');
    }
  }


  // 处理CoreAgent响应
  function handleCoreAgentResponse(response) {
    console.log('🔧 ChatWindow处理CoreAgent响应:', response);

    // 添加AI消息到聊天
    if (response.message) {
      addMessage(response.message, 'assistant');
    }

    // 通知App更新状态和Adaptive Card
    dispatch('stateUpdate', {
      newState: response.new_variables,
      adaptiveCard: response.adaptive_card
    });
  }

  // 添加消息到聊天历史
  function addMessage(content, role) {
    const message = {
      id: Date.now() + Math.random(),
      role: role,
      content: typeof content === 'string' ? content : String(content || ''),
      timestamp: new Date().toISOString()
    };
    messages = [...messages, message];
    // 添加消息后滚动到底部
    scrollToBottom();
  }

  // 处理用户输入提交
  async function handleSubmit() {
    if (!chatInput.trim() || isProcessing) {
      return;
    }

    const inputText = chatInput.trim();
    chatInput = '';

    await sendMessageToCoreAgent(inputText);
  }

  // 发送消息到CoreAgent
  async function sendMessageToCoreAgent(messageText) {
    if (isProcessing) return;

    isProcessing = true;
    let streamingMessage = null;

    try {
      // 添加用户消息
      addMessage(messageText, 'user');

      // 创建流式消息占位符
      streamingMessage = {
        id: Date.now() + Math.random(),
        role: 'assistant',
        content: '',
        timestamp: new Date().toISOString(),
        isStreaming: true
      };
      messages = [...messages, streamingMessage];

      // 流式显示的缓冲区管理
      let contentBuffer = '';
      let displayedContent = '';
      const BUFFER_SIZE = 18; // 18字符缓冲区

      // 使用流式API
      const response = await electronAPI.processCoreInputStreaming(messageText, {
        timestamp: new Date().toISOString()
      }, (chunkData) => {
        // 处理流式数据块
        if (chunkData.type === 'content' && chunkData.content) {
          // 累积到缓冲区
          contentBuffer += chunkData.content;

          // 检查是否遇到SYSTEMOUTPUT分割符
          if (contentBuffer.includes('<<<SYSTEMOUTPUT>>>')) {
            // 停止流式显示，提取分割符前的内容并添加到已显示内容
            const systemOutputIndex = contentBuffer.indexOf('<<<SYSTEMOUTPUT>>>');
            const remainingContent = contentBuffer.substring(0, systemOutputIndex).trim();
            displayedContent += remainingContent;
            streamingMessage.content = displayedContent;
            messages = [...messages];
            // 流式完成时强制滚动到底部
            scrollToBottom();
            return; // 停止处理后续chunks
          }

          // 实现18字符缓冲延迟显示
          if (contentBuffer.length >= BUFFER_SIZE) {
            const toDisplay = contentBuffer.substring(0, contentBuffer.length - BUFFER_SIZE);
            displayedContent += toDisplay;
            contentBuffer = contentBuffer.substring(contentBuffer.length - BUFFER_SIZE);

            streamingMessage.content = displayedContent;
            messages = [...messages];
            // 流式完成时强制滚动到底部
            scrollToBottom();
          }
        }
      });

      if (response && response.success) {

        // 处理缓冲区中的剩余内容
        if (contentBuffer.length > 0 && !contentBuffer.includes('<<<SYSTEMOUTPUT>>>')) {
          displayedContent += contentBuffer;
        }

        // 移除流式标志并设置最终内容
        streamingMessage.isStreaming = false;
        
        // 🔥 强制使用完整的response.message（包含MCP注入的SVG内容）
        // 即使流式显示被截断，最终消息必须是完整的
        if (response.message) {
          streamingMessage.content = response.message;
        } else {
          if (displayedContent) {
            streamingMessage.content = displayedContent;
          }
        }
        messages = [...messages];
        // 流式完成时强制滚动到底部
        scrollToBottom();
        
        // 处理其他响应数据（如Adaptive Cards），但不添加消息
        dispatch('stateUpdate', {
          newState: response.new_variables,
          adaptiveCard: response.adaptive_card
        });
      } else {
        // 移除流式消息并添加错误消息
        messages = messages.filter(msg => msg.id !== streamingMessage.id);
        addMessage(`错误: ${response?.error || '处理失败'}`, 'system');
      }
    } catch (error) {
      console.error('Error processing input:', error);

      // 移除流式消息并添加错误消息
      if (streamingMessage) {
        messages = messages.filter(msg => msg.id !== streamingMessage.id);
      }
      addMessage('抱歉，处理您的请求时出现了问题。', 'system');
    } finally {
      isProcessing = false;
      // 消息处理完成后重新聚焦输入框
      focusInput();
    }
  }

  // 处理外部消息（来自Adaptive Card点击）
  function handleExternalMessage(messageText) {
    sendMessageToCoreAgent(messageText);
  }

  // 处理输入辅助卡片按钮点击
  function handleInputAssistCardAction(event) {

    const actionData = event.detail?.action;

    // 检查当前的inputAssistCard是否包含password类型的input
    const hasPasswordInput = inputAssistCard &&
      inputAssistCard.body &&
      inputAssistCard.body.some(element =>
        element.type === 'Input.Text' &&
          element.style === 'password'
      );

    // 立即隐藏 assist card
    inputAssistCard = null;

    // 如果有password input且action包含数据，则处理密码提交
    if (hasPasswordInput && actionData && actionData.data) {
      // 从action.data中获取password字段的值
      const passwordValue = actionData.data.password;

      if (passwordValue) {
        // 标记这是密码输入，这样可以被正确遮罩
        handleExternalMessage(passwordValue);
        return;
      }
    }

    // 转发事件给父组件(App.svelte)
    dispatch('inputAssistAction', event.detail);
    
    // 处理完成后重新聚焦输入框
    focusInput();
  }

  // 暴露给父组件的方法
  export { handleExternalMessage };

  // 处理键盘事件
  function handleKeydown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      // 检查是否正在使用输入法（IME）
      if (event.isComposing || event.keyCode === 229) {
        // 正在使用输入法，不处理回车键
        return;
      }
      event.preventDefault();
      handleSubmit();
    }
  }

  // 格式化时间戳
  function formatTimestamp(timestamp) {
    return new Date(timestamp).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // 获取角色图标
  function getRoleIcon(role) {
    switch (role) {
      case 'user':
        return '👤';
      case 'assistant':
        return '🤖';
      case 'system':
        return '⚙️';
      default:
        return '💬';
    }
  }

  // 获取角色标签
  function getRoleLabel(role) {
    switch (role) {
      case 'user':
        return '用户';
      case 'assistant':
        return 'AI助手';
      case 'system':
        return '系统';
      default:
        return '未知';
    }
  }

  // 重新聚焦输入框的函数
  function focusInput() {
    if (chatInputElement && !isProcessing) {
      // 使用 requestAnimationFrame 确保 DOM 更新后再聚焦
      requestAnimationFrame(() => {
        chatInputElement.focus();
      });
    }
  }
</script>

<div class="chat-window">
  <!-- 主聊天区域 -->
  <div class="chat-main">
    <!-- 聊天消息区域 -->
    <div class="chat-messages" bind:this={chatContainer}>
    {#if messages.length === 0}
      <div class="empty-chat">
        <div class="empty-icon">💬</div>
        <div class="empty-text">开始与AI助手对话吧！</div>
      </div>
    {:else}
      {#each messages as message (message.id)}
        <div class="message {message.role}">
          <div class="message-header">
            <span class="role-icon">{getRoleIcon(message.role)}</span>
            <span class="role-label">{getRoleLabel(message.role)}</span>
            <span class="timestamp">{formatTimestamp(message.timestamp)}</span>
          </div>
          <div class="message-content">
            {#if message.role === 'system'}
              <div class="system-message">{message.content}</div>
            {:else if message.content && message.content.includes('<svg')}
              <!-- 直接渲染包含SVG的HTML内容 -->
              <div class="html-content">{@html message.content}</div>
            {:else}
              <SvelteMarkdown
                source={typeof message.content === 'string' ? message.content : String(message.content || '')}
                options={{
                  html: true,
                  breaks: true,
                  linkify: true
                }}
              />

            {/if}
          </div>
        </div>
      {/each}
    {/if}

    <!-- 处理中指示器 - 只在没有流式消息时显示 -->
    {#if isProcessing && !messages.some(msg => msg.isStreaming)}
      <div class="message assistant processing">
        <div class="message-header">
          <span class="role-icon">🤖</span>
          <span class="role-label">AI助手</span>
          <span class="timestamp">正在思考...</span>
        </div>
        <div class="message-content">
          <div class="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    {/if}
  </div>

  <!-- 输入区域 -->
  <!-- 输入辅助卡片 -->
  {#if inputAssistCard}
    <div class="input-assist-section">
      <AdaptiveCardPanel
        cards={[inputAssistCard]}
        compact={true}
        on:cardAction={handleInputAssistCardAction}
      />
    </div>
  {/if}

    <!-- 输入区域 -->
    <div class="chat-input-section">
      <div class="input-wrapper">
        <input
          type="text"
          bind:value={chatInput}
          on:keydown={handleKeydown}
          placeholder="输入消息..."
          disabled={isProcessing}
          class="chat-input"
          bind:this={chatInputElement}
        />
        <button
          on:click={handleSubmit}
          disabled={isProcessing || !chatInput.trim()}
          class="send-btn"
        >
          {isProcessing ? '⏳' : '📤'}
        </button>
      </div>
    </div>
  </div>
</div>

<style>
  .chat-window {
    display: flex;
    height: 100%;
    background: white;
  }
  
  .chat-main {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 0;
  }

  .chat-messages {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
    scroll-behavior: smooth;
  }

  .empty-chat {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: #666;
  }

  .empty-icon {
    font-size: 48px;
    margin-bottom: 15px;
    opacity: 0.5;
  }

  .empty-text {
    font-size: 16px;
  }

  .message {
    margin-bottom: 20px;
    max-width: 90%;
    display: flex;
    flex-direction: column;
  }

  .message.user {
    margin-left: auto;
    align-items: flex-end;
  }

  .message.assistant,
  .message.system {
    margin-right: auto;
    align-items: flex-start;
  }

  .message-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
    font-size: 12px;
    color: #666;
  }

  .message.user .message-header {
    justify-content: flex-end;
    flex-direction: row-reverse;
  }

  .role-icon {
    font-size: 16px;
  }

  .role-label {
    font-weight: 600;
  }

  .timestamp {
    margin-left: auto;
    opacity: 0.7;
  }

  .message.user .timestamp {
    margin-left: 0;
    margin-right: auto;
  }

  .message-content {
    background: #f5f5f5;
    padding: 12px 16px;
    border-radius: 18px;
    line-height: 1.5;
    word-wrap: break-word;
    color: #212121;
    display: inline-block;
    max-width: 100%;
    width: fit-content;
    box-shadow: 0 1px 2px rgba(0,0,0,0.08);
    overflow: visible;
  }

  .message.user .message-content {
    background: #1976d2;
    color: white;
    text-align: right;
  }

  .message.system .message-content {
    background: #fff3cd;
    border: 1px solid #ffeaa7;
  }

  .system-message {
    font-style: italic;
    color: #856404;
  }

  .processing .message-content {
    background: #e3f2fd;
  }

  .typing-indicator {
    display: flex;
    gap: 4px;
    align-items: center;
  }

  .typing-indicator span {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #4CAF50;
    animation: typing 1.4s infinite ease-in-out;
  }

  .typing-indicator span:nth-child(1) {
    animation-delay: -0.32s;
  }

  .typing-indicator span:nth-child(2) {
    animation-delay: -0.16s;
  }

  @keyframes typing {
    0%, 80%, 100% {
      transform: scale(0);
      opacity: 0.5;
    }
    40% {
      transform: scale(1);
      opacity: 1;
    }
  }

  .input-assist-section {
    padding: 8px 16px 0;
    background: #fafafa;
    border-top: 1px solid #e0e0e0;
  }

  .chat-input-section {
    padding: 16px;
    border-top: 1px solid #e0e0e0;
    background: #ffffff;
  }

  .input-wrapper {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  .chat-input {
    flex: 1;
    padding: 16px;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    outline: none;
    font-size: 16px;
    font-family: 'Roboto', 'Microsoft YaHei', 'PingFang SC', sans-serif;
    transition: all 0.2s ease;
    background: #ffffff;
  }

  .chat-input:focus {
    border-color: #1976d2;
    box-shadow: 0 0 0 2px rgba(25,118,210,0.2);
  }

  .chat-input:disabled {
    background: #f5f5f5;
    cursor: not-allowed;
    color: #9e9e9e;
  }

  .send-btn {
    width: 48px;
    height: 48px;
    border: none;
    border-radius: 24px;
    background: #1976d2;
    color: white;
    cursor: pointer;
    font-size: 16px;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 4px rgba(0,0,0,0.12);
    elevation: 2;
  }

  .send-btn:hover:not(:disabled) {
    background: #1565c0;
    box-shadow: 0 4px 8px rgba(0,0,0,0.16);
    elevation: 4;
  }

  .send-btn:disabled {
    background: #e0e0e0;
    color: #9e9e9e;
    cursor: not-allowed;
    box-shadow: none;
  }

  /* Markdown样式 */
  :global(.chat-window .message-content h1),
  :global(.chat-window .message-content h2),
  :global(.chat-window .message-content h3) {
    margin: 0 0 10px 0;
    color: inherit;
  }

  :global(.chat-window .message-content p) {
    margin: 0 0 10px 0;
  }

  :global(.chat-window .message-content ul),
  :global(.chat-window .message-content ol) {
    margin: 0 0 10px 20px;
  }

  :global(.chat-window .message-content code) {
    background: rgba(0,0,0,0.1);
    padding: 2px 4px;
    border-radius: 4px;
    font-family: 'Courier New', monospace;
  }

  :global(.chat-window .message.user .message-content code) {
    background: rgba(255,255,255,0.2);
  }

  :global(.chat-window .message-content pre) {
    background: rgba(0,0,0,0.1);
    padding: 10px;
    border-radius: 8px;
    overflow-x: auto;
    margin: 10px 0;
  }

  :global(.chat-window .message.user .message-content pre) {
    background: rgba(255,255,255,0.2);
  }

  /* SVG样式 */
  :global(.chat-window .message-content svg) {
    max-width: 100%;
    height: auto;
    margin: 10px 0;
    display: block;
    border: none;
    border-radius: 0;
    background: transparent;
    padding: 0;
    overflow: visible;
    box-sizing: content-box;
  }

  :global(.chat-window .message.user .message-content svg) {
    /* 用户消息中的SVG保持透明背景 */
  }

  /* HTML内容样式 */
  .html-content {
    line-height: 1.6;
    word-wrap: break-word;
  }

  .html-content p {
    margin: 0 0 10px 0;
  }

  .html-content strong {
    font-weight: bold;
  }


</style>
