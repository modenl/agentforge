const OpenAI = require('openai');
const Anthropic = require('@anthropic-ai/sdk');
const logger = require('./logger');

/**
 * AI客户端包装类
 * 提供统一的接口用于不同LLM服务
 */
class AIClientWrapper {
  constructor(client, model, clientType = 'openai') {
    this.client = client;
    this.model = model;
    this.clientType = clientType;

    // 提供标准的 OpenAI 接口兼容性
    this.chat = {
      completions: {
        create: async(params) => {
          console.log('🤖 [CLIENT] 开始调用 |', `模型: ${this.model} | 消息数: ${params.messages?.length} | 温度: ${params.temperature}`);

          const startTime = Date.now();

          try {
            let response;
            
            if (this.clientType === 'anthropic') {
              // Claude API 格式转换
              response = await this.createClaudeCompletion(params);
            } else {
              // OpenAI 格式
              const requestParams = {
                ...params,
                model: this.model
              };
              response = await this.client.chat.completions.create(requestParams);
            }
            
            const duration = Date.now() - startTime;

            console.log('🤖 [CLIENT] 调用成功 |', `耗时: ${duration}ms | 完成: ${response.choices?.[0]?.finish_reason} | 内容: ${response.choices?.[0]?.message?.content?.length}字`);

            // 📝 记录原始响应内容及元数据
            console.log('\n🤖 [CLIENT_RAW_RESPONSE]:');
            console.log('=' .repeat(80));
            console.log(response.choices?.[0]?.message?.content);
            console.log('=' .repeat(80));
            console.log('🤖 [CLIENT_METADATA]:', {
              model: this.model,
              finish_reason: response.choices?.[0]?.finish_reason,
              usage: response.usage,
              created: response.created,
              id: response.id
            });
            console.log(''); // 空行分隔

            return response;
          } catch (error) {
            const duration = Date.now() - startTime;
            console.error('🤖 [CLIENT] ❌ 失败 |', `耗时: ${duration}ms | 错误: ${error.message}`);
            throw error;
          }
        }
      }
    };
  }

  /**
   * 创建 Claude 完成请求
   */
  async createClaudeCompletion(params) {
    // 转换消息格式
    const messages = params.messages.filter(msg => msg.role !== 'system');
    const systemMessage = params.messages.find(msg => msg.role === 'system');
    
    // 构建 Claude 请求
    const claudeParams = {
      model: this.model,
      messages: this.convertMessagesToClaudeFormat(messages),
      max_tokens: params.max_tokens || 4096,
      temperature: params.temperature,
      ...(systemMessage && { system: systemMessage.content })
    };

    // 处理工具调用
    if (params.tools) {
      claudeParams.tools = params.tools.map(tool => ({
        name: tool.function.name,
        description: tool.function.description,
        input_schema: tool.function.parameters
      }));
      
      if (params.tool_choice === 'auto') {
        claudeParams.tool_choice = { type: 'auto' };
      } else if (params.tool_choice === 'none') {
        claudeParams.tool_choice = { type: 'none' };
      }
    }

    const response = await this.client.messages.create(claudeParams);
    
    // 转换为 OpenAI 格式
    return this.convertClaudeToOpenAIFormat(response);
  }

  /**
   * 转换消息为 Claude 格式
   */
  convertMessagesToClaudeFormat(messages) {
    const claudeMessages = [];
    let pendingToolResults = [];
    
    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      
      if (msg.role === 'tool') {
        // Collect tool results
        pendingToolResults.push({
          type: 'tool_result',
          tool_use_id: msg.tool_call_id,
          content: msg.content
        });
        
        // Check if this is the last tool result before next message
        if (i === messages.length - 1 || messages[i + 1].role !== 'tool') {
          // Add all pending tool results as a user message
          claudeMessages.push({
            role: 'user',
            content: pendingToolResults
          });
          pendingToolResults = [];
        }
      } else if (msg.role === 'assistant' && msg.tool_calls) {
        // Convert tool calls to Claude format
        const content = [];
        if (msg.content) {
          content.push({ type: 'text', text: msg.content });
        }
        for (const toolCall of msg.tool_calls) {
          content.push({
            type: 'tool_use',
            id: toolCall.id,
            name: toolCall.function.name,
            input: JSON.parse(toolCall.function.arguments || '{}')
          });
        }
        claudeMessages.push({
          role: 'assistant',
          content: content
        });
      } else {
        // Regular message
        claudeMessages.push({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content
        });
      }
    }
    
    return claudeMessages;
  }

  /**
   * 转换 Claude 响应为 OpenAI 格式
   */
  convertClaudeToOpenAIFormat(claudeResponse) {
    const message = {
      role: 'assistant',
      content: ''
    };

    // 处理 content blocks
    const tool_calls = [];
    
    for (const block of claudeResponse.content) {
      if (block.type === 'text') {
        message.content += block.text;
      } else if (block.type === 'tool_use') {
        tool_calls.push({
          id: block.id,
          type: 'function',
          function: {
            name: block.name,
            arguments: JSON.stringify(block.input)
          }
        });
      }
    }

    if (tool_calls.length > 0) {
      message.tool_calls = tool_calls;
    }

    return {
      id: claudeResponse.id,
      object: 'chat.completion',
      created: Date.now() / 1000,
      model: claudeResponse.model,
      choices: [{
        index: 0,
        message: message,
        finish_reason: claudeResponse.stop_reason || 'stop'
      }],
      usage: {
        prompt_tokens: claudeResponse.usage?.input_tokens || 0,
        completion_tokens: claudeResponse.usage?.output_tokens || 0,
        total_tokens: (claudeResponse.usage?.input_tokens || 0) + (claudeResponse.usage?.output_tokens || 0)
      }
    };
  }

  /**
   * 流式聊天完成
   */
  async streamComplete(requestConfig, streamCallback) {
    try {
      const startTs = Date.now();

      const params = {
        model: this.model,
        messages: requestConfig.messages,
        max_tokens: requestConfig.max_tokens,
        temperature: requestConfig.temperature,
        stream: true
      };

      // 记录完整的 LLM 输入
      const formattedMessages = requestConfig.messages.map((msg, index) => {
        let content = msg.content;
        // 截断 system 消息到200字符
        if (msg.role === 'system' && content.length > 200) {
          content = content.substring(0, 200) + '...[truncated]';
        }
        return `\n[${index}] ${msg.role.toUpperCase()}:\n${content}`;
      }).join('\n---');

      logger.info('[LLM_INPUT] Full request to AI model\n' +
        `Model: ${this.model}\n` +
        `Temperature: ${requestConfig.temperature}\n` +
        `Max Tokens: ${requestConfig.max_tokens}\n` +
        `Messages (${requestConfig.messages.length}):\n` +
        `---${formattedMessages}\n` +
        `--- END OF MESSAGES ---`
      );

      // 🔧 支持response_format参数
      if (requestConfig.response_format) {
        params.response_format = requestConfig.response_format;
      }

      // 🔧 支持tools参数
      if (requestConfig.tools) {
        params.tools = requestConfig.tools;
        if (requestConfig.tool_choice) {
          params.tool_choice = requestConfig.tool_choice;
        }
      }

      let stream;
      if (this.clientType === 'anthropic') {
        // Claude streaming
        const messages = requestConfig.messages.filter(msg => msg.role !== 'system');
        const systemMessage = requestConfig.messages.find(msg => msg.role === 'system');
        
        const claudeParams = {
          model: this.model,
          messages: this.convertMessagesToClaudeFormat(messages),
          max_tokens: requestConfig.max_tokens || 4096,
          temperature: requestConfig.temperature,
          stream: true,
          ...(systemMessage && { system: systemMessage.content })
        };

        // 处理工具
        if (requestConfig.tools) {
          claudeParams.tools = requestConfig.tools.map(tool => ({
            name: tool.function.name,
            description: tool.function.description,
            input_schema: tool.function.parameters
          }));
          
          if (requestConfig.tool_choice === 'auto') {
            claudeParams.tool_choice = { type: 'auto' };
          }
        }

        stream = await this.client.messages.create(claudeParams);
      } else {
        // OpenAI streaming
        stream = await this.client.chat.completions.create(params);
      }

      let fullContent = '';
      let chunkCount = 0;
      let firstTokenLatency = null;

      for await (const chunk of stream) {
        let delta = '';
        
        if (this.clientType === 'anthropic') {
          // Claude stream format
          if (chunk.type === 'content_block_delta' && chunk.delta?.text) {
            delta = chunk.delta.text;
          }
        } else {
          // OpenAI stream format
          delta = chunk.choices[0]?.delta?.content || '';
        }
        
        if (delta) {
          chunkCount++;
          if (firstTokenLatency === null) {
            firstTokenLatency = Date.now() - startTs;
          }
          fullContent += delta;
          if (streamCallback) {
            // 🔧 修复：传递包含content字段的对象，而不是原始字符串
            streamCallback({
              content: delta,
              fullContent: fullContent,
              isComplete: false,
              type: 'content'
            });
          }
        }
      }

      // 🔧 发送最终完成信号
      if (streamCallback) {
        streamCallback({
          content: '',
          fullContent: fullContent,
          isComplete: true,
          type: 'complete'
        });
      }

      const totalLatency = Date.now() - startTs;
      logger.info('[PERF] streamComplete', {
        model: this.model,
        totalLatency,
        firstTokenLatency,
        chunkCount,
        contentLength: fullContent.length
      });

      console.log(''); // 空行分隔

      return {
        content: fullContent,
        role: 'assistant',
        finish_reason: 'stop',
        metrics: { totalLatency, firstTokenLatency, chunkCount }
      };

    } catch (error) {
      logger.error(`Stream completion failed for model ${this.model}:`, error);
      throw error;
    }
  }

  /**
   * 非流式聊天完成
   */
  async complete(requestConfig) {
    try {
      const startTs = Date.now();

      const params = {
        model: this.model,
        messages: requestConfig.messages,
        max_tokens: requestConfig.max_tokens,
        temperature: requestConfig.temperature,
        stream: false
      };

      // 记录完整的 LLM 输入（非流式）
      const formattedMessages = requestConfig.messages.map((msg, index) => {
        let content = msg.content;
        // 截断 system 消息到200字符
        if (msg.role === 'system' && content.length > 200) {
          content = content.substring(0, 200) + '...[truncated]';
        }
        return `\n[${index}] ${msg.role.toUpperCase()}:\n${content}`;
      }).join('\n---');

      logger.info('[LLM_INPUT_COMPLETE] Full request to AI model\n' +
        `Model: ${this.model}\n` +
        `Temperature: ${requestConfig.temperature}\n` +
        `Max Tokens: ${requestConfig.max_tokens}\n` +
        `Messages (${requestConfig.messages.length}):\n` +
        `---${formattedMessages}\n` +
        `--- END OF MESSAGES ---`
      );

      // 🔧 支持response_format参数
      if (requestConfig.response_format) {
        params.response_format = requestConfig.response_format;
      }

      const response = await this.client.chat.completions.create(params);

      const totalLatency = Date.now() - startTs;
      logger.info('[PERF] complete', {
        model: this.model,
        totalLatency,
        contentLength: response.choices[0]?.message?.content?.length || 0
      });

      // 📝 记录非流式完成的原始响应内容及元数据
      console.log('\n🤖 [COMPLETE_CLIENT_RAW_RESPONSE]:');
      console.log('=' .repeat(80));
      console.log(response.choices[0]?.message?.content);
      console.log('=' .repeat(80));
      console.log('🤖 [COMPLETE_CLIENT_METADATA]:', {
        model: this.model,
        finish_reason: response.choices[0]?.finish_reason,
        usage: response.usage,
        created: response.created,
        id: response.id,
        totalLatency
      });
      console.log(''); // 空行分隔

      return {
        content: response.choices[0]?.message?.content || '',
        role: 'assistant',
        finish_reason: response.choices[0]?.finish_reason || 'stop',
        metrics: { totalLatency }
      };

    } catch (error) {
      logger.error(`Completion failed for model ${this.model}:`, error);
      throw error;
    }
  }
}

/**
 * AI客户端工厂类
 * 根据模型名称创建对应的LLM客户端
 */
class AIClientFactory {
  /**
   * 创建AI客户端包装器
   * @param {string} model - 模型名称
   * @returns {AIClientWrapper} AI客户端包装器实例
   */
  static createClient(model) {
    // Support test environment model override
    if (process.env.NODE_ENV === 'test' && process.env.OPENAI_MODEL) {
      logger.info(`Test environment: overriding model ${model} with ${process.env.OPENAI_MODEL}`);
      model = process.env.OPENAI_MODEL;
    }
    
    logger.info(`Creating AI client for model: ${model}`);

    let baseClient;

    // 根据模型类型创建不同的客户端
    if (model.startsWith('gpt-') || model.startsWith('o1-')) {
      // OpenAI模型
      baseClient = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });
    } else if (model.startsWith('gemini-')) {
      // Google Gemini模型 - 使用OpenAI兼容接口
      baseClient = new OpenAI({
        apiKey: process.env.GOOGLE_API_KEY,
        baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/'
      });
    } else if (model.startsWith('claude-')) {
      // Anthropic Claude模型
      baseClient = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY
      });
      return new AIClientWrapper(baseClient, model, 'anthropic');
    } else {
      // 默认使用OpenAI客户端
      logger.warn(`Unknown model type: ${model}, using OpenAI client as fallback`);
      baseClient = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });
    }

    // 返回包装器实例
    return new AIClientWrapper(baseClient, model);
  }

  /**
   * 批量创建多个AI客户端
   * @param {Object} modelConfig - 模型配置对象 {agentName: modelName}
   * @returns {Object} 客户端映射对象 {agentName: client}
   */
  static createMultipleClients(modelConfig) {
    const clients = {};

    for (const [agentName, modelName] of Object.entries(modelConfig)) {
      try {
        clients[agentName] = this.createClient(modelName);
        logger.info(`Created client for ${agentName} agent with model ${modelName}`);
      } catch (error) {
        logger.error(`Failed to create client for ${agentName}:`, error);
        // 创建fallback客户端
        clients[agentName] = this.createClient('gpt-4.1-mini');
      }
    }

    return clients;
  }

  /**
   * 检查所需的API密钥是否配置
   * @param {string} model - 模型名称
   * @returns {boolean} 是否配置了相应的API密钥
   */
  static hasRequiredApiKey(model) {
    if (model.startsWith('gpt-') || model.startsWith('o1-')) {
      return !!process.env.OPENAI_API_KEY;
    } else if (model.startsWith('gemini-')) {
      return !!process.env.GOOGLE_API_KEY;
    } else if (model.startsWith('claude-')) {
      return !!process.env.ANTHROPIC_API_KEY;
    }
    return !!process.env.OPENAI_API_KEY;
  }

  /**
   * 验证所有配置的模型是否有对应的API密钥
   * @param {Object} modelConfig - 模型配置
   * @returns {Object} 验证结果
   */
  static validateConfiguration(modelConfig) {
    const results = {
      valid: true,
      missing: [],
      configured: []
    };

    for (const [agentName, modelName] of Object.entries(modelConfig)) {
      if (this.hasRequiredApiKey(modelName)) {
        results.configured.push({ agent: agentName, model: modelName });
      } else {
        results.valid = false;
        results.missing.push({ agent: agentName, model: modelName });
      }
    }

    return results;
  }
}

// Export the createAIClient function
module.exports = {
  createAIClient: AIClientFactory.createClient.bind(AIClientFactory)
};
