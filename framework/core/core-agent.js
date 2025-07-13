// Framework Core: Core Agent
// AI-powered agent that handles user interactions and state management

const { createAIClient } = require('./ai-client-factory');
const path = require('path');
const fs = require('fs').promises;
const JsonRepairUtil = require('../utils/json-repair');

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
    this.messageIdCounter = 0; // 消息ID计数器
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

  setMCPManager(mcpManager) {
    this.mcpManager = mcpManager;
  }

  convertMCPToolsToOpenAIFormat() {
    console.log('🛠️ [convertMCPToolsToOpenAIFormat] Starting conversion...');
    
    if (!this.mcpManager || !this.mcpManager.isReady()) {
      console.log('🛠️ [convertMCPToolsToOpenAIFormat] MCP Manager not ready');
      return [];
    }

    const mcpTools = this.mcpManager.getMCPToolsForPrompt();
    console.log(`🛠️ [convertMCPToolsToOpenAIFormat] Got ${mcpTools.length} MCP tools`);
    
    const openAITools = [];

    for (const tool of mcpTools) {
      const openAITool = {
        type: 'function',
        function: {
          name: tool.name,
          description: tool.description || 'MCP tool',
          parameters: tool.inputSchema || {
            type: 'object',
            properties: {},
            required: []
          }
        }
      };
      openAITools.push(openAITool);
      console.log(`🛠️ [convertMCPToolsToOpenAIFormat] Converted tool: ${tool.name}`);
    }

    console.log(`🛠️ [convertMCPToolsToOpenAIFormat] Total OpenAI tools: ${openAITools.length}`);
    console.log('🛠️ [convertMCPToolsToOpenAIFormat] Tool names:', openAITools.map(t => t.function.name));
    
    return openAITools;
  }

  async handleToolCalls(message, userInput) {
    try {
      const toolResults = [];
      
      // Execute each tool call
      for (const toolCall of message.tool_calls) {
        const toolName = toolCall.function.name;
        const toolArgs = JSON.parse(toolCall.function.arguments || '{}');
        
        console.log(`🔧 [TOOL_CALL] Executing ${toolName} with args:`, toolArgs);
        
        try {
          const result = await this.mcpManager.executeMCPTool(toolName, toolArgs, 'assistant');
          
          toolResults.push({
            tool_call_id: toolCall.id,
            role: 'tool',
            name: toolName,
            content: JSON.stringify(result)
          });
        } catch (error) {
          console.error(`❌ [TOOL_ERROR] Failed to execute ${toolName}:`, error);
          toolResults.push({
            tool_call_id: toolCall.id,
            role: 'tool',
            name: toolName,
            content: JSON.stringify({ error: error.message })
          });
        }
      }

      // Add tool results to chat history
      this.updateChatHistoryWithToolCalls(userInput, message, toolResults);
      
      // Convert tool results to MCP format and add to history
      const mcpResults = toolResults.map(tr => ({
        action: tr.name,
        success: !tr.content.includes('error'),
        result: JSON.parse(tr.content)
      }));
      this.addMCPResultsToHistory(mcpResults);
      
      // Check if any tools need follow-up response
      // All builtin MCP tools don't need follow-up
      const needsFollowUp = message.tool_calls.some(tc => {
        // If it's an external MCP tool (starts with mcp_), it might need follow-up
        if (tc.function.name.startsWith('mcp_')) {
          return true;
        }
        // All other tools (builtin) don't need follow-up
        return false;
      });
      
      if (!needsFollowUp) {
        // All tools are UI-only, no need for follow-up LLM call
        console.log('🎯 [TOOL_HANDLER] All tools are UI-only, skipping follow-up LLM call');
        
        return {
          success: true,
          message: message.content || '',
          mcp_results: mcpResults,
          new_variables: this.getCurrentVariables(),
          adaptive_card: this.currentAdaptiveCard,
          mcp_tools: []
        };
      }

      // Get follow-up response from LLM with tool results
      const messages = [
        { role: 'system', content: this.systemPrompt },
        ...this.getCleanChatHistory()
      ];

      const followUpParams = {
        messages: messages,
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens
      };

      // Include tools again in case more calls are needed
      const tools = this.convertMCPToolsToOpenAIFormat();
      if (tools.length > 0) {
        followUpParams.tools = tools;
        followUpParams.tool_choice = 'auto';
      }

      const followUpResponse = await this.aiClient.chat.completions.create(followUpParams);
      const followUpMessage = followUpResponse.choices[0].message;

      // Check if more tool calls are needed
      if (followUpMessage.tool_calls && followUpMessage.tool_calls.length > 0) {
        return await this.handleToolCalls(followUpMessage, '');
      }

      // Parse the final response
      const result = this.parseResponse(followUpMessage.content || '', '');
      
      // Update final message in history
      this.updateChatHistory('', followUpMessage.content || '');

      // Include the MCP results that were executed
      result.mcp_results = mcpResults;

      return result;
    } catch (error) {
      console.error('❌ [TOOL_HANDLER_ERROR]:', error);
      return this.getErrorResponse(error);
    }
  }

  updateChatHistoryWithToolCalls(userInput, assistantMessage, toolResults) {
    // Add user message if provided
    if (userInput && userInput.trim()) {
      this.messageIdCounter++;
      this.rawChatHistory.push({
        id: this.messageIdCounter,
        role: 'user',
        content: userInput,
        timestamp: new Date().toISOString()
      });
      this.visibleChatHistory.push({
        id: this.messageIdCounter,
        role: 'user',
        content: userInput,
        timestamp: new Date().toISOString()
      });
    }

    // Add assistant message with tool calls
    this.messageIdCounter++;
    const assistantEntry = {
      id: this.messageIdCounter,
      role: 'assistant',
      content: assistantMessage.content || '',
      tool_calls: assistantMessage.tool_calls,
      timestamp: new Date().toISOString()
    };
    this.rawChatHistory.push(assistantEntry);

    // For visible history, show a simplified version
    this.visibleChatHistory.push({
      id: this.messageIdCounter,
      role: 'assistant',
      content: assistantMessage.content || '[执行工具调用中...]',
      timestamp: new Date().toISOString()
    });

    // Add tool results to raw history
    for (const toolResult of toolResults) {
      this.messageIdCounter++;
      this.rawChatHistory.push({
        id: this.messageIdCounter,
        ...toolResult,
        timestamp: new Date().toISOString()
      });
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
    const basePromptPath = path.join(__dirname, '../config/base-prompt-tools.md');

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
          console.log('📋 [BUSINESS_PROMPT_INJECTED] Business prompt added to system prompt');
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
        last_mcp_result_id: this.lastMCPResultId || null,
        ...context
      };
      

      // 将状态信息注入到 prompt 模板中
      const fullSystemPrompt = this.systemPrompt.replace(
        /```json\s*\{\s*"current_variables":\s*"动态注入"[\s\S]*?\}\s*```/,
        `\`\`\`json\n${JSON.stringify(contextInfo, null, 2)}\n\`\`\``
      );

      // Build messages array
      const chatHistory = this.getCleanChatHistory();
      
      const messages = [
        { role: 'system', content: fullSystemPrompt },
        ...chatHistory
      ];
      
      // Only add the current user input if it's not empty
      if (userInput && userInput.trim()) {
        messages.push({ role: 'user', content: userInput });
      } else {
      }
      
      const requestParams = {
        messages: messages,
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens
      };

      // 添加 MCP 工具作为 OpenAI functions
      if (this.mcpManager && this.mcpManager.isReady()) {
        const tools = this.convertMCPToolsToOpenAIFormat();
        if (tools.length > 0) {
          requestParams.tools = tools;
          requestParams.tool_choice = 'auto'; // Let the model decide when to use tools
          
          // Log when we expect the LLM to call a specific tool
          if (userInput && (userInput.includes('答题赚时间') || userInput.includes('start_quiz'))) {
            console.log('🎯 [EXPECTED_TOOL_CALL] User wants to start quiz, expecting mcp_amc8-quiz-mcp_random_problem to be called');
            console.log('🎯 [EXPECTED_TOOL_CALL] Available quiz tools:', tools.filter(t => t.function.name.includes('quiz')).map(t => t.function.name));
          }
        }
      }

      // 调用LLM获取响应
      const response = await this.aiClient.chat.completions.create(requestParams);
      const message = response.choices[0].message;

      // 处理工具调用
      if (message.tool_calls && message.tool_calls.length > 0) {
        console.log('🎯 [LLM_DECISION] LLM decided to call tools:', message.tool_calls.map(tc => tc.function.name));
        return await this.handleToolCalls(message, userInput);
      } else {
        // Log when LLM didn't call tools despite having them available
        if (requestParams.tools && requestParams.tools.length > 0) {
          console.log('⚠️ [LLM_DECISION] LLM chose NOT to call any tools despite having', requestParams.tools.length, 'tools available');
          console.log('⚠️ [LLM_DECISION] Available tools were:', requestParams.tools.map(t => t.function.name));
          console.log('⚠️ [LLM_DECISION] User input was:', userInput);
          console.log('⚠️ [LLM_DECISION] LLM response preview:', message.content ? message.content.substring(0, 200) + '...' : 'NO CONTENT');
        }
      }

      // 解析普通响应
      const result = this.parseResponse(message.content, userInput);

      // 更新聊天历史
      this.updateChatHistory(userInput, message.content);

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
        last_mcp_result_id: this.lastMCPResultId || null,
        ...context
      };

      // 将状态信息注入到 prompt 模板中
      const fullSystemPrompt = this.systemPrompt.replace(
        /```json\s*\{\s*"current_variables":\s*"动态注入"[\s\S]*?\}\s*```/,
        `\`\`\`json\n${JSON.stringify(contextInfo, null, 2)}\n\`\`\``
      );

      // Build messages array
      const chatHistory = this.getCleanChatHistory();
      
      const messages = [
        { role: 'system', content: fullSystemPrompt },
        ...chatHistory
      ];
      
      // Only add the current user input if it's not empty
      if (userInput && userInput.trim()) {
        messages.push({ role: 'user', content: userInput });
      } else {
      }
      
      const requestParams = {
        messages: messages,
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens
      };

      // 添加 MCP 工具作为 OpenAI functions
      if (this.mcpManager && this.mcpManager.isReady()) {
        const tools = this.convertMCPToolsToOpenAIFormat();
        if (tools.length > 0) {
          requestParams.tools = tools;
          requestParams.tool_choice = 'auto';
          
          // Log when we expect the LLM to call a specific tool
          if (userInput && (userInput.includes('答题赚时间') || userInput.includes('start_quiz'))) {
            console.log('🎯 [EXPECTED_TOOL_CALL_STREAM] User wants to start quiz, expecting mcp_amc8-quiz-mcp_random_problem to be called');
            console.log('🎯 [EXPECTED_TOOL_CALL_STREAM] Available quiz tools:', tools.filter(t => t.function.name.includes('quiz')).map(t => t.function.name));
          }
        }
      }

      // 收集流式响应数据
      let accumulatedContent = '';
      let toolCalls = null;
      
      // 增强的流式回调，处理工具调用
      const enhancedStreamCallback = (chunkData) => {
        // 累积内容
        if (chunkData.type === 'content' && chunkData.content) {
          accumulatedContent += chunkData.content;
        }
        
        // 更新工具调用
        if (chunkData.type === 'tool_call_progress' && chunkData.toolCalls) {
          toolCalls = chunkData.toolCalls;
        }
        
        // 完成时检查工具调用
        if (chunkData.type === 'complete' && chunkData.toolCalls) {
          toolCalls = chunkData.toolCalls;
        }
        
        // 转发给原始回调
        if (streamCallback) {
          streamCallback(chunkData);
        }
      };

      // 使用流式完成
      const response = await this.aiClient.streamComplete(requestParams, enhancedStreamCallback);

      // 处理工具调用
      if (response.tool_calls && response.tool_calls.length > 0) {
        console.log('🎯 [LLM_DECISION_STREAM] LLM decided to call tools:', response.tool_calls.map(tc => tc.function.name));
        
        // 构造消息对象用于工具调用处理
        const message = {
          content: response.content || '',
          tool_calls: response.tool_calls
        };
        
        // 通知前端流式结束，准备处理工具调用
        if (streamCallback) {
          streamCallback({
            type: 'tool_calls_start',
            content: '',
            fullContent: accumulatedContent,
            isComplete: false,
            toolCalls: response.tool_calls
          });
        }
        
        // 处理工具调用并获取最终结果
        const result = await this.handleToolCalls(message, userInput);
        
        // 通知前端工具调用完成
        if (streamCallback) {
          streamCallback({
            type: 'tool_calls_complete',
            isComplete: true
          });
        }
        
        return result;
      } else {
        // Log when LLM didn't call tools despite having them available
        if (requestParams.tools && requestParams.tools.length > 0) {
          console.log('⚠️ [LLM_DECISION_STREAM] LLM chose NOT to call any tools despite having', requestParams.tools.length, 'tools available');
          console.log('⚠️ [LLM_DECISION_STREAM] Available tools were:', requestParams.tools.map(t => t.function.name));
          console.log('⚠️ [LLM_DECISION_STREAM] User input was:', userInput);
          console.log('⚠️ [LLM_DECISION_STREAM] LLM response preview:', response.content ? response.content.substring(0, 200) + '...' : 'NO CONTENT');
        }
      }

      // 没有工具调用，解析普通响应
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
      // Use JsonRepairUtil for robust JSON parsing
      const result = JsonRepairUtil.tryRepairAndValidate(jsonString);
      if (result.success) {
        return result.repaired;
      }
      
      // Fallback to basic cleaning if repair fails
      let cleaned = jsonString.replace(/[\r\n\t]/g, ' ');
      cleaned = cleaned.replace(/[^\x20-\x7E\u4e00-\u9fff\uff00-\uffef]/g, '');
      cleaned = cleaned.replace(/\s+/g, ' ').trim();
      
      const firstBrace = cleaned.indexOf('{');
      const lastBrace = cleaned.lastIndexOf('}');
      
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        cleaned = cleaned.substring(firstBrace, lastBrace + 1);
      }
      
      return cleaned;
    } catch (error) {
      console.error('❌ [JSON_CLEAN] Failed to clean JSON:', error.message);
      return jsonString;
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
      // 检查是否使用了错误的格式 <<>>
      if (aiResponse.includes('<<>>') && !aiResponse.includes('<<<SYSTEMOUTPUT>>>')) {
        // 尝试修复格式
        
        // 先尝试匹配 <<>>\nJSON\n<<>> 格式
        const newlineMatch = aiResponse.match(/<<>>\s*([\s\S]*?)\s*<<>>/);
        if (newlineMatch) {
          const jsonContent = newlineMatch[1].trim();
          // 获取<<>>之前的内容作为可见消息
          const beforeDelimiter = aiResponse.substring(0, aiResponse.indexOf('<<>>'));
          // 重构为正确格式
          aiResponse = beforeDelimiter.trim() + '\n<<<SYSTEMOUTPUT>>>\n' + jsonContent + '\n<<<SYSTEMOUTPUT>>>';
        } else {
          // 旧的分割方式作为后备
          const parts = aiResponse.split('<<>>');
          if (parts.length >= 3) {
            // 假设格式是: 消息<<>>JSON<<>>
            const jsonContent = parts[1].trim();
            // 重构为正确格式
            aiResponse = parts[0] + '\n<<<SYSTEMOUTPUT>>>\n' + jsonContent + '\n<<<SYSTEMOUTPUT>>>';
            }
        }
      }
      
      // 提取用户可见的消息部分
      let visibleMessage = this.extractVisibleMessage(aiResponse);

      // 查找SYSTEMOUTPUT标记 - 先尝试标准格式，然后尝试从消息中提取
      let systemOutputMatch = aiResponse.match(/<<<SYSTEMOUTPUT>>>([\s\S]*?)<<<SYSTEMOUTPUT>>>/);
      
      // 如果标准格式没找到，尝试从消息内部提取（处理AI错误格式化的情况）
      if (!systemOutputMatch) {
        // 检查是否在消息中包含了SYSTEMOUTPUT
        const messageMatch = aiResponse.match(/<<<SYSTEMOUTPUT>>>([\s\S]*?)(?:<<<SYSTEMOUTPUT>>>|$)/);
        if (messageMatch) {
          systemOutputMatch = messageMatch;
          // 重新提取可见消息，确保移除嵌入的SYSTEMOUTPUT
          visibleMessage = this.extractVisibleMessage(aiResponse);
        }
      }

      if (!systemOutputMatch) {
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
        systemOutput = JsonRepairUtil.parse(cleanJson, {
          fallbackValue: null,
          description: 'System output from LLM'
        });
      } catch (parseError) {
        console.error('❌ JSON parsing failed:', parseError.message);
        
        return this.getErrorResponse(new Error('Invalid JSON in SYSTEMOUTPUT: ' + parseError.message));
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
    // 只有非空的用户输入才添加到历史
    if (userInput && userInput.trim()) {
      this.messageIdCounter++;
      const userMessage = {
        id: this.messageIdCounter,
        role: 'user',
        content: userInput,
        timestamp: new Date().toISOString()
      };
      this.rawChatHistory.push(userMessage);
    } else {
    }

    this.messageIdCounter++;
    const aiMessage = {
      id: this.messageIdCounter,
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date().toISOString()
    };

    // 添加AI消息到原始历史（包含SYSTEMOUTPUT）
    this.rawChatHistory.push(aiMessage);

    // 添加到可见历史（不包含SYSTEMOUTPUT）
    const visibleAiMessage = {
      ...aiMessage,
      content: this.extractVisibleMessage(aiResponse)
    };
    
    // 只有非空的用户输入才添加到可见历史
    if (userInput && userInput.trim()) {
      // 查找对应的用户消息以保持ID一致
      const userMsg = this.rawChatHistory.find(msg => 
        msg.role === 'user' && msg.content === userInput && msg.id
      );
      if (userMsg) {
        this.visibleChatHistory.push(userMsg);
      }
    }
    
    this.visibleChatHistory.push(visibleAiMessage);

    // 限制历史记录长度
    const maxMessages = this.config.maxHistoryMessages;
    if (this.rawChatHistory.length > maxMessages) {
      this.rawChatHistory = this.rawChatHistory.slice(-maxMessages);
    }
    if (this.visibleChatHistory.length > maxMessages) {
      this.visibleChatHistory = this.visibleChatHistory.slice(-maxMessages);
    }
  }

  // 添加MCP工具执行结果到聊天历史
  addMCPResultsToHistory(mcpResults) {
    if (!mcpResults || mcpResults.length === 0) return;

    // 构建MCP结果的消息内容
    let mcpContent = '';
    
    for (const result of mcpResults) {
      // 跳过标记为 skipHistory 的结果
      if (result.result && result.result.metadata && result.result.metadata.skipHistory) {
        continue;
      }
      
      if (result.success && result.result) {
        // 处理文本内容
        if (result.result.content && Array.isArray(result.result.content)) {
          for (const contentItem of result.result.content) {
            if (contentItem.type === 'text' && contentItem.text) {
              mcpContent += contentItem.text + '\n\n';
            }
          }
        }
        // 处理SVG内容
        else if (result.result.svg) {
          mcpContent += result.result.svg + '\n\n';
        }
      }
    }

    if (mcpContent.trim()) {
      // Use sequential ID for MCP message
      this.messageIdCounter++;
      const messageId = this.messageIdCounter;
      
      // 创建一个系统消息来保存MCP结果
      const mcpMessage = {
        id: messageId,
        role: 'system',
        content: `[MCP Tool Results]\n${mcpContent.trim()}`,
        timestamp: new Date().toISOString(),
        isMCPResult: true
      };

      // 只添加到原始历史记录中（不可见）
      this.rawChatHistory.push(mcpMessage);

      // Store the message ID in a way that LLM can reference it
      this.lastMCPResultId = messageId;
      
      // 添加一个 user 消息，但标识为 MCP 子角色
      const mcpInfoMessage = {
        role: 'user',
        content: `[MCP Context]\n${JSON.stringify({ last_mcp_result_id: messageId })}`,
        timestamp: new Date().toISOString(),
        isMCPContext: true
      };
      this.rawChatHistory.push(mcpInfoMessage);
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
    // 支持多种格式：
    // 1. 标准格式：<<<SYSTEMOUTPUT>>>...<<<SYSTEMOUTPUT>>>
    // 2. 简化格式：<<<SYSTEMOUTPUT>>>...（到字符串结尾）
    // 3. 错误格式：<<>>...<<>>
    
    let visibleContent = aiResponse;
    
    // 先检查是否使用了错误的<<>>格式
    if (aiResponse.includes('<<>>') && !aiResponse.includes('<<<SYSTEMOUTPUT>>>')) {
      // 处理<<>>格式
      const delimiterMatch = aiResponse.match(/^([\s\S]*?)<<>>[\s\S]*?<<>>[\s\S]*$/);
      if (delimiterMatch) {
        visibleContent = delimiterMatch[1].trim();
      } else if (aiResponse.trim().startsWith('<<>>')) {
        // 如果以<<>>开始，说明没有可见内容
        return '';
      }
    } else {
      // 处理标准<<<SYSTEMOUTPUT>>>格式
      const standardMatch = aiResponse.match(/^([\s\S]*?)<<<SYSTEMOUTPUT>>>[\s\S]*?<<<SYSTEMOUTPUT>>>[\s\S]*$/);
      if (standardMatch) {
        visibleContent = standardMatch[1].trim();
      } else {
        // 尝试简化格式（只有开始标记）
        const simplifiedMatch = aiResponse.match(/^([\s\S]*?)<<<SYSTEMOUTPUT>>>[\s\S]*$/);
        if (simplifiedMatch) {
          visibleContent = simplifiedMatch[1].trim();
        }
      }
      
      // 如果完全没有用户可见内容（整个响应都是SYSTEMOUTPUT），返回空字符串
      if (aiResponse.trim().startsWith('<<<SYSTEMOUTPUT>>>')) {
        return '';
      }
    }
    
    // 如果提取后的内容仍然包含SYSTEMOUTPUT或<<>>，说明格式有问题
    if (visibleContent.includes('<<<SYSTEMOUTPUT>>>') || visibleContent.includes('<<>>')) {
      // 再次尝试清理
      visibleContent = visibleContent.split('<<<SYSTEMOUTPUT>>>')[0].split('<<>>')[0].trim();
    }

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
    return this.rawChatHistory.map(msg => {
      const cleanMsg = {
        role: msg.role,
        content: msg.role === 'user' ? this.maskSensitiveInfo(msg.content) : msg.content
      };
      
      // Include tool calls if present
      if (msg.tool_calls) {
        cleanMsg.tool_calls = msg.tool_calls;
      }
      
      // Include tool call ID for tool responses
      if (msg.tool_call_id) {
        cleanMsg.tool_call_id = msg.tool_call_id;
        cleanMsg.name = msg.name;
        
        // For tool responses, only include error messages in content
        // This prevents raw JSON results like {"success":true} from appearing
        try {
          const parsed = JSON.parse(msg.content);
          if (parsed.error) {
            cleanMsg.content = `Tool error: ${parsed.error}`;
          } else {
            // For successful tool calls, provide a simple confirmation
            cleanMsg.content = 'Tool executed successfully';
          }
        } catch (e) {
          // If not JSON, keep original content
          cleanMsg.content = msg.content;
        }
      }
      
      return cleanMsg;
    });
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
