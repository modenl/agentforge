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
    // 使用配置中的初始变量，或空对象
    // 让每个应用定义自己的初始变量
    this.currentVariables = config.initialVariables || {};
    this.currentAdaptiveCard = null; // 当前卡片状态
  }

  async initialize(businessPrompts = [], mcpManager = null) {
    try {
      // 初始化AI客户端 - 使用配置文件中的模型
      this.aiClient = createAIClient(this.config.model);

      // 加载系统提示词 (包含MCP工具注入)
              await this.loadSystemPrompt(businessPrompts, mcpManager);

      console.log('CoreAgent initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize CoreAgent:', error);
      return false;
    }
  }

  generateMCPInfoSection(mcpManager) {
    const connectedServers = mcpManager.getConnectedServersSummary();
    if (connectedServers.length === 0) {
      return '';
    }

    let section = '## 🔧 当前可用的MCP服务器\n\n';
    section += '以下是已连接的MCP服务器，你可以直接使用它们的工具：\n\n';
    
    for (const server of connectedServers) {
      section += `### 服务器: ${server.name}\n`;
      section += `- 应用: ${server.appId}\n`;
      section += `- 工具数量: ${server.tools}\n`;
      section += `- 支持WebView: ${server.webviewSupported ? '是' : '否'}\n`;
      
      // 获取该服务器的具体工具列表
      const tools = mcpManager.getMCPToolsForPrompt().filter(tool => tool.server === server.name);
      if (tools.length > 0) {
        section += `- 可用工具:\n`;
        for (const tool of tools) {
          section += `  - \`${tool.name}\`: ${tool.description}\n`;
        }
      }
      section += '\n';
    }
    
    section += '**重要**：以上服务器已经连接并可以直接使用，无需再调用 get_mcp_servers_status 查询。\n';
    section += '**使用方式**：直接在 mcp_tools 中使用工具名称，如 `mcp_服务器名_工具名`。\n\n';
    
    return section;
  }

  async loadSystemPrompt(businessPrompts = [], mcpManager = null) {
    const basePromptPath = path.join(__dirname, '../config/base-prompt.md');

    try {
      const basePrompt = await fs.readFile(basePromptPath, 'utf8');

      // 构建prompt顺序：
      // 1. 基础prompt
      let combinedPrompt = basePrompt.trim();

      // 2. 注入当前可用的MCP服务器和工具信息（在业务prompt之前，让业务prompt可以引用）
      if (mcpManager && mcpManager.isReady()) {
        const mcpInfoSection = this.generateMCPInfoSection(mcpManager);
        if (mcpInfoSection) {
          combinedPrompt += '\n\n' + mcpInfoSection;
          console.log('🔧 [MCP_INFO_INJECTED] MCP server info injected before business prompt');
        }
      }

      // 3. 业务prompt（现在可以引用上面的MCP服务器信息）
      for (const businessPrompt of businessPrompts) {
        if (businessPrompt && businessPrompt.trim()) {
          combinedPrompt += '\n\n' + businessPrompt.trim();
        }
      }

      // 4. MCP工具详细信息（可选，作为参考）
      if (mcpManager && mcpManager.isReady()) {
        const mcpToolsSection = mcpManager.generateMCPToolsPromptSection();
        if (mcpToolsSection) {
          combinedPrompt += '\n\n' + mcpToolsSection;
          console.log('🔧 [MCP_TOOLS_INJECTED] MCP tools details injected into system prompt');
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
      // 首先尝试直接解析
      const trimmed = jsonString.trim();
      JSON.parse(trimmed);
      return trimmed;
    } catch (error) {
      // 如果失败，进行更激进的清理
      // 1. 移除所有换行、回车、制表符
      let cleaned = jsonString.replace(/[\r\n\t]/g, ' ');
      
      // 2. 移除所有不可见字符和控制字符（保留中文和全角符号）
      cleaned = cleaned.replace(/[^\x20-\x7E\u4e00-\u9fff\uff00-\uffef]/g, '');
      
      // 3. 移除多余的空格
      cleaned = cleaned.replace(/\s+/g, ' ');
      
      // 4. 去除首尾空白
      cleaned = cleaned.trim();
      
      // 5. 尝试找到JSON的开始和结束
      const firstBrace = cleaned.indexOf('{');
      const lastBrace = cleaned.lastIndexOf('}');
      
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        cleaned = cleaned.substring(firstBrace, lastBrace + 1);
      }
      
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
          mcp_tools: [],
          webview_config: null
        };
      }

      const rawJson = systemOutputMatch[1].trim(); // Trim whitespace before and after
      const cleanJson = this.cleanJsonString(rawJson);

      let systemOutput;
      try {
        systemOutput = JSON.parse(cleanJson);
      } catch (parseError) {
        console.error('❌ [PARSE] JSON解析失败:', parseError);
        console.error('原始JSON长度:', rawJson.length);
        console.error('原始JSON:', rawJson);
        console.error('清理后JSON长度:', cleanJson.length);
        console.error('清理后JSON:', cleanJson);
        // 显示JSON末尾的字符
        if (cleanJson.length > 400) {
          console.error('JSON末尾100字符:', cleanJson.slice(-100));
        }
        // 显示位置442附近的字符
        if (cleanJson.length > 442) {
          console.error('位置442附近的字符:', cleanJson.slice(437, 447));
        }
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

      // Validate and log mcp_tools if present
      let mcpTools = systemOutput.mcp_tools || [];
      if (mcpTools.length > 0) {
        console.log('🔧 [MCP] Raw mcp_tools from LLM:', JSON.stringify(mcpTools, null, 2));
        
        // Validate each tool
        const validTools = [];
        const invalidTools = [];
        
        mcpTools.forEach((tool, index) => {
          if (!tool || typeof tool !== 'object') {
            invalidTools.push({ index, reason: 'not an object', tool });
          } else if (!tool.action || typeof tool.action !== 'string') {
            invalidTools.push({ index, reason: 'missing or invalid action field', tool });
          } else {
            validTools.push(tool);
          }
        });
        
        if (invalidTools.length > 0) {
          console.warn('⚠️ [MCP] Found invalid tools in LLM response:');
          invalidTools.forEach(({ index, reason, tool }) => {
            console.warn(`  Tool ${index}: ${reason} - ${JSON.stringify(tool)}`);
          });
        }
        
        console.log(`✅ [MCP] ${validTools.length} valid tools, ${invalidTools.length} invalid tools`);
        mcpTools = validTools;
      }

      return {
        success: true,
        message: visibleMessage,
        new_variables: this.currentVariables,
        adaptive_card: processedCard,
        mcp_tools: mcpTools,
        webview_config: systemOutput.webview_config || null
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
      mcp_tools: [],
      webview_config: null
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
