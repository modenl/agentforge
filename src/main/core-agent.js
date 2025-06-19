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
    this.currentVariables = null; // 初始为 null，表示没有变量数据
    this.currentAdaptiveCard = null; // 当前卡片状态
    this.isInitialized = false; // 标记是否已初始化
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
    const basePromptPath = path.join(__dirname, '../prompts/base-prompt.md');

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
      let fullSystemPrompt;
      
      // 🚨 首次启动检测：如果没有变量数据，不注入任何信息
      if (this.currentVariables === null) {
        // 第一次启动，保持 "动态注入" 不替换，让 LLM 使用 prompt 定义的初始值
        fullSystemPrompt = this.systemPrompt.replace(
          /```json\s*\{\s*"current_variables":\s*"动态注入"[\s\S]*?\}\s*```/,
          `\`\`\`json\n{\n  "current_variables": "动态注入",\n  "current_adaptive_card": "动态注入",\n  "timestamp": "${new Date().toISOString()}"\n}\n\`\`\``
        );
        console.log('🆕 [FIRST_STARTUP] 系统首次启动，未注入任何变量数据，LLM将使用prompt定义的初始值');
      } else {
        // 后续运行，注入真实的变量数据
        const contextInfo = {
          current_variables: this.currentVariables,
          current_adaptive_card: this.currentAdaptiveCard,
          timestamp: new Date().toISOString(),
          ...context
        };

        // 将变量信息注入到 prompt 模板中
        fullSystemPrompt = this.systemPrompt.replace(
          /```json\s*\{\s*"current_variables":\s*"动态注入"[\s\S]*?\}\s*```/,
          `\`\`\`json\n${JSON.stringify(contextInfo, null, 2)}\n\`\`\``
        );
      }

      const requestParams = {
        messages: [
          { role: 'system', content: fullSystemPrompt },
          ...this.getCleanChatHistory(),
          { role: 'user', content: userInput }
        ],
        temperature: 0.7,
        max_tokens: 8192
      };

      // 📝 只记录完整的LLM上下文
      console.log('\n🤖 [LLM_FULL_CONTEXT] 完整请求上下文:');
      console.log(JSON.stringify(requestParams.messages, null, 2));

      // 调用LLM获取响应
      const response = await this.aiClient.chat.completions.create(requestParams);
      const aiResponse = response.choices[0].message.content;

      // 📝 记录完整的LLM响应
      console.log('\n🤖 [LLM_RESPONSE] 完整响应:');
      console.log(aiResponse);
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
      let fullSystemPrompt;
      
      // 🚨 首次启动检测：如果没有变量数据，不注入任何信息
      if (this.currentVariables === null) {
        // 第一次启动，保持 "动态注入" 不替换，让 LLM 使用 prompt 定义的初始值
        fullSystemPrompt = this.systemPrompt.replace(
          /```json\s*\{\s*"current_variables":\s*"动态注入"[\s\S]*?\}\s*```/,
          `\`\`\`json\n{\n  "current_variables": "动态注入",\n  "current_adaptive_card": "动态注入",\n  "timestamp": "${new Date().toISOString()}"\n}\n\`\`\``
        );
        console.log('🆕 [STREAM_FIRST_STARTUP] 系统首次启动，未注入任何变量数据，LLM将使用prompt定义的初始值');
      } else {
        // 后续运行，注入真实的变量数据
        const contextInfo = {
          current_variables: this.currentVariables,
          current_adaptive_card: this.currentAdaptiveCard,
          timestamp: new Date().toISOString(),
          ...context
        };

        // 将变量信息注入到 prompt 模板中
        fullSystemPrompt = this.systemPrompt.replace(
          /```json\s*\{\s*"current_variables":\s*"动态注入"[\s\S]*?\}\s*```/,
          `\`\`\`json\n${JSON.stringify(contextInfo, null, 2)}\n\`\`\``
        );
      }

      const requestParams = {
        messages: [
          { role: 'system', content: fullSystemPrompt },
          ...this.getCleanChatHistory(),
          { role: 'user', content: userInput }
        ],
        temperature: 0.7,
        max_tokens: 8192
      };

      // 📝 只记录完整的LLM上下文
      console.log('\n🌊 [STREAM_FULL_CONTEXT] 完整请求上下文:');
      console.log(JSON.stringify(requestParams.messages, null, 2));

      // 使用流式完成
      const response = await this.aiClient.streamComplete(requestParams, streamCallback);

      // 📝 只记录完整的LLM响应
      console.log('\n🌊 [STREAM_RESPONSE] 完整响应:');
      console.log(response.content);
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

    return null;
  }


  parseResponse(aiResponse, originalInput) {
    try {
      // 提取SYSTEMOUTPUT
      const systemOutputMatch = aiResponse.match(/<<<SYSTEMOUTPUT>>>([\s\S]*?)<<<SYSTEMOUTPUT>>>/);

      if (systemOutputMatch) {
        // 分离message部分和系统输出部分
        const systemOutputStart = aiResponse.indexOf('<<<SYSTEMOUTPUT>>>');
        const messageContent = aiResponse.substring(0, systemOutputStart).trim();

        const rawJsonString = systemOutputMatch[1];
        const cleanJsonString = this.cleanJsonString(rawJsonString);
        const systemOutput = JSON.parse(cleanJsonString);

        // 更新变量
        if (systemOutput.new_variables) {
          // 🚨 如果是首次启动，直接设置完整的初始变量
          if (this.currentVariables === null) {
            this.currentVariables = { ...systemOutput.new_variables };
            console.log('🆕 [FIRST_VARIABLES_SET] 首次设置变量:', this.currentVariables);
          } else {
            this.mergeCurrentVariables(systemOutput.new_variables);
          }
        } else if (systemOutput.new_state) {
          // 兼容旧的 new_state 字段名
          if (this.currentVariables === null) {
            this.currentVariables = { ...systemOutput.new_state };
            console.log('🆕 [FIRST_VARIABLES_SET] 首次设置变量:', this.currentVariables);
          } else {
            this.mergeCurrentVariables(systemOutput.new_state);
          }
        }

        // 处理 Adaptive Card 增量更新
        if (systemOutput.adaptive_card !== undefined) {
          this.updateAdaptiveCardState(systemOutput.adaptive_card);
        }
        const adaptiveCard = this.currentAdaptiveCard;

        const result = {
          success: true,
          adaptive_card: adaptiveCard,
          mcp_actions: systemOutput.mcp_actions || [],
          message: this.fixSvgEscaping(messageContent),
          new_state: this.currentVariables,
          raw_response: aiResponse
        };

        return result;
      } else {
        // ⚠️ LLM没有输出SYSTEMOUTPUT，这违反了prompt规则
        console.warn('⚠️ [SYSTEMOUTPUT_MISSING] LLM违反prompt规则，没有输出SYSTEMOUTPUT');
        console.warn('📝 [RESPONSE_CONTENT]:', aiResponse.substring(0, 200) + '...');
        console.warn('🔧 [SUGGESTION] 这会导致状态无法更新和界面无法刷新');

        const result = {
          success: true,
          message: this.fixSvgEscaping(aiResponse),
          new_state: this.currentVariables,
          warning: 'LLM没有输出SYSTEMOUTPUT，变量未更新',
          raw_response: aiResponse
        };

        return result;
      }
    } catch (error) {
      console.error('❌ [PARSE_ERROR]:', error.message);
      return this.getErrorResponse(error);
    }
  }

  updateChatHistory(userInput, aiResponse) {
    // 更新raw chat history (完整记录)
    this.rawChatHistory.push(
      { role: 'user', content: userInput },
      { role: 'assistant', content: aiResponse }
    );

    // 更新visible chat history (用户可见的部分)
    const visibleInput = this.maskSensitiveInfo(userInput);
    const visibleResponse = this.extractVisibleMessage(aiResponse);

    this.visibleChatHistory.push(
      { role: 'user', content: visibleInput },
      { role: 'assistant', content: visibleResponse }
    );

    // 限制历史长度
    if (this.rawChatHistory.length > 100) {
      this.rawChatHistory = this.rawChatHistory.slice(-80);
    }
    if (this.visibleChatHistory.length > 100) {
      this.visibleChatHistory = this.visibleChatHistory.slice(-80);
    }
  }

  maskSensitiveInfo(input) {
    // 如果当前状态是等待密码输入，则遮罩输入
    const isPendingPassword = this.currentVariables && this.currentVariables.state === 'pending_action';

    if (isPendingPassword) {
      // 在pending_action状态下，任何看起来像密码的输入都遮罩
      // 简单的密码格式检测：4-20字符，不包含空格
      if (input.trim().length >= 4 && !input.includes(' ')) {
        return '••••••';
      }
    }

    return input;
  }

  extractVisibleMessage(aiResponse) {
    // 从AI响应中提取用户可见的消息部分
    const systemOutputMatch = aiResponse.match(/<<<SYSTEMOUTPUT>>>\s*([\s\S]*?)\s*<<<SYSTEMOUTPUT>>>/);

    let message = aiResponse;
    if (systemOutputMatch) {
      try {
        const systemOutput = JSON.parse(systemOutputMatch[1]);
        message = systemOutput.message || '系统已处理您的请求';
      } catch (error) {
        message = '系统已处理您的请求';
      }
    }

    // 修复SVG属性的过度转义问题
    message = this.fixSvgEscaping(message);

    return message;
  }

  fixSvgEscaping(content) {
    if (!content || typeof content !== 'string') {
      return content;
    }

    // 修复SVG属性中的双重转义：\\"value\\" -> "value"
    return content
      .replace(/\\"/g, '"')
      .replace(/\\\\"/g, '\\"')
      .replace(/\\\\\\\\/g, '\\\\');
  }

  getErrorResponse(error) {
    return {
      success: false,
      error: error.message,
      message: '抱歉，处理您的请求时出现了问题。请稍后再试。',
      new_state: this.currentVariables
    };
  }

  // 获取变量和历史记录的方法
  getCurrentVariables() {
    return this.currentVariables;
  }

  getRawChatHistory() {
    return this.rawChatHistory;
  }

  getVisibleChatHistory() {
    return this.visibleChatHistory;
  }

  // 手动设置变量（用于系统事件）
  setVariables(newVariables) {
    if (this.currentVariables === null) {
      this.currentVariables = { ...newVariables };
    } else {
      this.currentVariables = { ...this.currentVariables, ...newVariables };
    }
  }

  mergeCurrentVariables(deltaVariables) {
    // Step 1: apply or delete keys based on delta
    Object.entries(deltaVariables).forEach(([key, value]) => {
      if (value === null || value === undefined) {
        delete this.currentVariables[key];
      } else {
        this.currentVariables[key] = value;
      }
    });

    // Step 2: 根据业务规则清理多余字段
    if (this.currentVariables.state !== 'game_running') {
      delete this.currentVariables.game_id;
      delete this.currentVariables.game_start_time;
      delete this.currentVariables.game_process_id;
    }
  }

  updateAdaptiveCardState(deltaCard) {
    if (!this.currentAdaptiveCard) {
      this.currentAdaptiveCard = {};
    }

    // 处理增量更新
    Object.entries(deltaCard).forEach(([key, value]) => {
      if (value === null || value === undefined) {
        // 删除卡片
        delete this.currentAdaptiveCard[key];
      } else if (typeof value === 'object' && Object.keys(value).length === 0) {
        // 清空卡片（设为空对象表示清除内容但保留占位）
        delete this.currentAdaptiveCard[key];
      } else {
        // 更新卡片内容
        this.currentAdaptiveCard[key] = this.adaptCompactCard({ [key]: value })[key];
      }
    });

    // 如果所有卡片都被清除，设为 null
    if (Object.keys(this.currentAdaptiveCard).length === 0) {
      this.currentAdaptiveCard = null;
    }
  }

  getCleanChatHistory() {
    return this.rawChatHistory.map(message => {
      if (message.role === 'assistant') {
        // 移除 assistant 消息中的 SYSTEMOUTPUT 部分
        const content = message.content;
        const systemOutputMatch = content.match(/<<<SYSTEMOUTPUT>>>([\s\S]*?)<<<SYSTEMOUTPUT>>>/);

        if (systemOutputMatch) {
          // 提取 message 部分（SYSTEMOUTPUT 之前的内容）
          const systemOutputStart = content.indexOf('<<<SYSTEMOUTPUT>>>');
          const cleanContent = content.substring(0, systemOutputStart).trim();
          return { ...message, content: cleanContent || '系统已处理您的请求' };
        }

        return message;
      }

      // user 消息保持不变
      return message;
    });
  }
}

module.exports = CoreAgent;

