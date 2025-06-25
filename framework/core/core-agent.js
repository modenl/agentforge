// Framework Core: Core Agent
// AI-powered agent that handles user interactions and state management

const { createAIClient } = require('./ai-client-factory');
const path = require('path');
const fs = require('fs').promises;

class CoreAgent {
  constructor(config = {}) {
    this.config = {
      model: 'gpt-4.1',
      temperature: 0.7,
      maxTokens: 8192,
      maxHistoryMessages: 50,
      ...config
    };

    this.aiClient = null;
    this.systemPrompt = '';
    this.rawChatHistory = [];
    this.visibleChatHistory = [];
    // 使用配置中的初始变量，或默认变量
    this.currentVariables = config.initialVariables || {
      role: 'child',
      child_state: 'idle',
      parent_state: null
    };
    this.currentAdaptiveCard = null; // 当前卡片状态
  }

  async initialize(businessPrompts = []) {
    try {
      // 初始化AI客户端 - 使用配置文件中的模型
      this.aiClient = createAIClient(this.config.model);

      // 加载系统提示词
      await this.loadSystemPrompt(businessPrompts);

      console.log('CoreAgent initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize CoreAgent:', error);
      return false;
    }
  }

  async loadSystemPrompt(businessPrompts = []) {
    const basePromptPath = path.join(__dirname, '../config/base-prompt.md');

    try {
      const basePrompt = await fs.readFile(basePromptPath, 'utf8');

      // 按顺序拼接，确保通用规范在前，业务逻辑在后
      let combinedPrompt = basePrompt.trim();

      for (const businessPrompt of businessPrompts) {
        if (businessPrompt && businessPrompt.trim()) {
          combinedPrompt += '\n\n' + businessPrompt.trim();
        }
      }

      this.systemPrompt = combinedPrompt;
    } catch (error) {
      console.error('Failed to load system prompt:', error);
      throw new Error(
        'Failed to load system prompt. The application cannot start without a valid prompt file.'
      );
    }
  }

  async processInput(userInput, context = {}) {
    try {
      // 构建包含变量的完整系统提示词
      const contextInfo = {
        current_variables: this.currentVariables,
        current_adaptive_card: this.currentAdaptiveCard,
        timestamp: new Date().toISOString(),
        ...context
      };

      // 将状态信息注入到 prompt 模板中
      const fullSystemPrompt = this.systemPrompt.replace(
        /```json\s*\{\s*"current_variables":\s*"动态注入"[\s\S]*?\}\s*```/,
        `\`\`\`json\n${JSON.stringify(contextInfo, null, 2)}\n\`\`\``
      );

      const requestParams = {
        messages: [
          { role: 'system', content: fullSystemPrompt },
          ...this.getCleanChatHistory(),
          { role: 'user', content: userInput }
        ],
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens
      };

      // 📝 记录完整的LLM上下文及请求参数
      console.log('\n🤖 [LLM_FULL_CONTEXT] 完整请求上下文:');
      console.log('🤖 [LLM_REQUEST_PARAMS]:', {
        model: this.config.model,
        temperature: requestParams.temperature,
        max_tokens: requestParams.max_tokens,
        messages_count: requestParams.messages.length
      });
      console.log('🤖 [LLM_INPUT_MESSAGES]:');
      console.log('=' .repeat(80));
      requestParams.messages.forEach((msg, index) => {
        console.log(`📋 Message ${index + 1} [${msg.role}]:`);
        console.log('-'.repeat(40));
        console.log(msg.content);
        console.log('-'.repeat(40));
        console.log('');
      });
      console.log('=' .repeat(80));

      // 调用LLM获取响应
      const response = await this.aiClient.chat.completions.create(requestParams);
      const aiResponse = response.choices[0].message.content;

      // 📝 记录LLM响应
      console.log('\n🤖 [LLM_RESPONSE]:');
      console.log('=' .repeat(80));
      console.log(aiResponse);
      console.log('=' .repeat(80));
      console.log(''); // 空行分隔

      // 解析响应并更新状态
      const result = this.parseResponse(aiResponse, userInput);

      // 更新聊天历史
      this.updateChatHistory(userInput, aiResponse);

      return result;
    } catch (error) {
      console.error('❌ [LLM_ERROR]:', error.message);
      return this.getErrorResponse(error);
    }
  }

  async processInputStreaming(userInput, context = {}, streamCallback) {
    try {
      // 构建包含变量的完整系统提示词
      const contextInfo = {
        current_variables: this.currentVariables,
        current_adaptive_card: this.currentAdaptiveCard,
        timestamp: new Date().toISOString(),
        ...context
      };

      // 将状态信息注入到 prompt 模板中
      const fullSystemPrompt = this.systemPrompt.replace(
        /```json\s*\{\s*"current_variables":\s*"动态注入"[\s\S]*?\}\s*```/,
        `\`\`\`json\n${JSON.stringify(contextInfo, null, 2)}\n\`\`\``
      );

      const requestParams = {
        messages: [
          { role: 'system', content: fullSystemPrompt },
          ...this.getCleanChatHistory(),
          { role: 'user', content: userInput }
        ],
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens
      };

      // 📝 记录完整的LLM上下文及请求参数
      console.log('\n🌊 [STREAM_FULL_CONTEXT] 完整请求上下文:');
      console.log('🌊 [STREAM_REQUEST_PARAMS]:', {
        model: this.config.model,
        temperature: requestParams.temperature,
        max_tokens: requestParams.max_tokens,
        messages_count: requestParams.messages.length
      });
      console.log('🌊 [STREAM_INPUT_MESSAGES]:');
      console.log('=' .repeat(80));
      requestParams.messages.forEach((msg, index) => {
        console.log(`📋 Message ${index + 1} [${msg.role}]:`);
        console.log('-'.repeat(40));
        console.log(msg.content);
        console.log('-'.repeat(40));
        console.log('');
      });
      console.log('=' .repeat(80));

      // 使用流式完成
      const response = await this.aiClient.streamComplete(requestParams, streamCallback);

      // 📝 记录完整的LLM响应
      console.log('\n🌊 [STREAM_RESPONSE]:');
      console.log('=' .repeat(80));
      console.log(response.content);
      console.log('=' .repeat(80));
      console.log(''); // 空行分隔

      // 解析最终响应并更新状态
      const result = this.parseResponse(response.content, userInput);

      // 更新聊天历史
      this.updateChatHistory(userInput, response.content);

      return result;
    } catch (error) {
      console.error('❌ [STREAM_ERROR]:', error.message);
      return this.getErrorResponse(error);
    }
  }

  cleanJsonString(jsonString) {
    try {
      const trimmed = jsonString.trim();
      JSON.parse(trimmed);
      return trimmed;
    } catch (error) {
      // 只做最基本的清理：移除控制字符
      const cleaned = jsonString
        .replace(/[\r\n\t]/g, ' ')
        .replace(/[^\x20-\x7E\u4e00-\u9fff]/g, '')
        .trim();
      return cleaned;
    }
  }

  adaptCompactCard(cardData) {
    if (!cardData) {
      return null;
    }

    // 如果已经是完整的 Adaptive Card 格式，直接返回
    if (cardData.type === 'AdaptiveCard') {
      return cardData;
    }

    // 支持双卡片架构 - 使用新的字段名
    if (cardData.global || cardData.assist || cardData.globalCard || cardData.inputAssistCard) {
      const result = {};

      // 新字段名支持 - 保持新格式
      if (cardData.global) {
        result.global = cardData.global;
      }
      if (cardData.assist) {
        result.assist = cardData.assist;
      }

      // 旧字段名兼容 - 转换为新格式
      if (cardData.globalCard) {
        result.global = cardData.globalCard;
      }
      if (cardData.inputAssistCard) {
        result.assist = cardData.inputAssistCard;
      }

      return result;
    }

    // 单卡片兼容处理
    return {
      global: cardData
    };
  }

  parseResponse(aiResponse, originalInput) {
    try {
      // 提取用户可见的消息部分
      const visibleMessage = this.extractVisibleMessage(aiResponse);

      // 查找SYSTEMOUTPUT标记
      const systemOutputMatch = aiResponse.match(/<<<SYSTEMOUTPUT>>>([\s\S]*?)<<<SYSTEMOUTPUT>>>/);

      if (!systemOutputMatch) {
        console.warn('⚠️ [PARSE] 未找到SYSTEMOUTPUT标记，返回基础响应');
        return {
          success: true,
          message: visibleMessage,
          new_variables: this.currentVariables,
          adaptive_card: this.currentAdaptiveCard,
          mcp_actions: []
        };
      }

      const rawJson = systemOutputMatch[1];
      const cleanJson = this.cleanJsonString(rawJson);

      let systemOutput;
      try {
        systemOutput = JSON.parse(cleanJson);
      } catch (parseError) {
        console.error('❌ [PARSE] JSON解析失败:', parseError);
        console.error('原始JSON:', rawJson);
        return this.getErrorResponse(new Error('Invalid JSON in SYSTEMOUTPUT'));
      }

      // 更新当前变量
      if (systemOutput.new_variables && typeof systemOutput.new_variables === 'object') {
        this.mergeCurrentVariables(systemOutput.new_variables);
      }

      // 更新Adaptive Card状态
      if (systemOutput.adaptive_card !== undefined) {
        this.updateAdaptiveCardState(systemOutput.adaptive_card);
      }

      const processedCard = this.adaptCompactCard(systemOutput.adaptive_card);

      // Validate and log mcp_actions if present
      let mcpActions = systemOutput.mcp_actions || [];
      if (mcpActions.length > 0) {
        console.log('🔧 [MCP] Raw mcp_actions from LLM:', JSON.stringify(mcpActions, null, 2));
        
        // Validate each action
        const validActions = [];
        const invalidActions = [];
        
        mcpActions.forEach((action, index) => {
          if (!action || typeof action !== 'object') {
            invalidActions.push({ index, reason: 'not an object', action });
          } else if (!action.action || typeof action.action !== 'string') {
            invalidActions.push({ index, reason: 'missing or invalid action field', action });
          } else {
            validActions.push(action);
          }
        });
        
        if (invalidActions.length > 0) {
          console.warn('⚠️ [MCP] Found invalid actions in LLM response:');
          invalidActions.forEach(({ index, reason, action }) => {
            console.warn(`  Action ${index}: ${reason} - ${JSON.stringify(action)}`);
          });
        }
        
        console.log(`✅ [MCP] ${validActions.length} valid actions, ${invalidActions.length} invalid actions`);
        mcpActions = validActions;
      }

      return {
        success: true,
        message: visibleMessage,
        new_variables: this.currentVariables,
        adaptive_card: processedCard,
        mcp_actions: mcpActions
      };

    } catch (error) {
      console.error('❌ [PARSE] 响应解析异常:', error);
      return this.getErrorResponse(error);
    }
  }

  updateChatHistory(userInput, aiResponse) {
    const userMessage = {
      role: 'user',
      content: userInput,
      timestamp: new Date().toISOString()
    };

    const aiMessage = {
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date().toISOString()
    };

    // 添加到原始历史（包含SYSTEMOUTPUT）
    this.rawChatHistory.push(userMessage, aiMessage);

    // 添加到可见历史（不包含SYSTEMOUTPUT）
    const visibleAiMessage = {
      ...aiMessage,
      content: this.extractVisibleMessage(aiResponse)
    };
    this.visibleChatHistory.push(userMessage, visibleAiMessage);

    // 限制历史记录长度
    const maxMessages = this.config.maxHistoryMessages;
    if (this.rawChatHistory.length > maxMessages) {
      this.rawChatHistory = this.rawChatHistory.slice(-maxMessages);
    }
    if (this.visibleChatHistory.length > maxMessages) {
      this.visibleChatHistory = this.visibleChatHistory.slice(-maxMessages);
    }
  }

  maskSensitiveInfo(input) {
    if (typeof input !== 'string') return input;

    // 隐藏可能的密码信息
    return input
      .replace(/password[=:]\s*\S+/gi, 'password=***')
      .replace(/密码[=:]\s*\S+/gi, '密码=***')
      .replace(/pwd[=:]\s*\S+/gi, 'pwd=***');
  }

  extractVisibleMessage(aiResponse) {
    // 移除SYSTEMOUTPUT部分，只保留用户可见内容
    const visibleContent = aiResponse.replace(/<<<SYSTEMOUTPUT>>>[\s\S]*?<<<SYSTEMOUTPUT>>>/g, '').trim();

    // 修复可能的SVG转义问题
    const fixedContent = this.fixSvgEscaping(visibleContent);

    return fixedContent;
  }

  fixSvgEscaping(content) {
    // 修复SVG中的转义字符
    return content
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#x27;/g, '\'')
      .replace(/&amp;/g, '&');
  }

  getErrorResponse(error) {
    return {
      success: false,
      error: error.message,
      message: '系统处理时出现错误，请稍后再试。',
      new_variables: this.currentVariables,
      adaptive_card: this.currentAdaptiveCard,
      mcp_actions: []
    };
  }

  getCurrentVariables() {
    return { ...this.currentVariables };
  }

  getRawChatHistory() {
    return [...this.rawChatHistory];
  }

  getVisibleChatHistory() {
    return [...this.visibleChatHistory];
  }

  setVariables(newVariables) {
    this.currentVariables = { ...newVariables };
  }

  mergeCurrentVariables(deltaVariables) {
    // 深度合并变量对象
    for (const [key, value] of Object.entries(deltaVariables)) {
      if (value === null) {
        // 显式 null 表示删除字段
        delete this.currentVariables[key];
      } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        // 嵌套对象递归合并
        if (typeof this.currentVariables[key] === 'object' && this.currentVariables[key] !== null) {
          this.currentVariables[key] = { ...this.currentVariables[key], ...value };
        } else {
          this.currentVariables[key] = { ...value };
        }
      } else {
        // 直接赋值
        this.currentVariables[key] = value;
      }
    }
  }

  updateAdaptiveCardState(deltaCard) {
    if (deltaCard === null) {
      this.currentAdaptiveCard = null;
      return;
    }

    if (typeof deltaCard === 'object' && Object.keys(deltaCard).length === 0) {
      // 空对象表示清空
      this.currentAdaptiveCard = null;
      return;
    }

    if (typeof deltaCard === 'object') {
      // 更新卡片状态
      if (this.currentAdaptiveCard === null) {
        this.currentAdaptiveCard = {};
      }

      for (const [key, value] of Object.entries(deltaCard)) {
        if (value === null || (typeof value === 'object' && Object.keys(value).length === 0)) {
          // 清空该卡片
          delete this.currentAdaptiveCard[key];
        } else {
          this.currentAdaptiveCard[key] = value;
        }
      }

      // 如果所有卡片都被清空，设置为null
      if (Object.keys(this.currentAdaptiveCard).length === 0) {
        this.currentAdaptiveCard = null;
      }
    }
  }

  getCleanChatHistory() {
    // 返回用于LLM的干净历史记录
    return this.rawChatHistory.map(msg => ({
      role: msg.role,
      content: msg.role === 'user' ? this.maskSensitiveInfo(msg.content) : msg.content
    }));
  }

  async cleanup() {
    // 清理资源
    this.rawChatHistory = [];
    this.visibleChatHistory = [];
    this.currentVariables = {};
    this.currentAdaptiveCard = null;
  }
}

module.exports = CoreAgent;
