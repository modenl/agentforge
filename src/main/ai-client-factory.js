const OpenAI = require('openai');
const logger = require('./logger');

/**
 * AI客户端包装类
 * 提供统一的接口用于不同LLM服务
 */
class AIClientWrapper {
  constructor(client, model) {
    this.client = client;
    this.model = model;

    // 提供标准的 OpenAI 接口兼容性
    this.chat = {
      completions: {
        create: async(params) => {
          console.log('🤖 [CLIENT] 开始调用 |', `模型: ${this.model} | 消息数: ${params.messages?.length} | 温度: ${params.temperature}`);

          // 使用传入的参数，但确保使用包装器的模型
          const requestParams = {
            ...params,
            model: this.model
          };

          const startTime = Date.now();

          try {
            const response = await this.client.chat.completions.create(requestParams);
            const duration = Date.now() - startTime;

            console.log('🤖 [CLIENT] 调用成功 |', `耗时: ${duration}ms | 完成: ${response.choices?.[0]?.finish_reason} | 内容: ${response.choices?.[0]?.message?.content?.length}字`);

            // 📝 记录原始响应内容
            console.log('🤖 [CLIENT] raw_response:', response.choices?.[0]?.message?.content);

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

      // 🔧 支持response_format参数
      if (requestConfig.response_format) {
        params.response_format = requestConfig.response_format;
      }

      const stream = await this.client.chat.completions.create(params);

      let fullContent = '';
      let chunkCount = 0;
      let firstTokenLatency = null;

      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content || '';
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

      // 📝 记录流式完成的原始响应内容
      console.log('🌊 [STREAM_CLIENT] raw_response:', fullContent);

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

      // 📝 记录非流式完成的原始响应内容
      console.log('🤖 [COMPLETE_CLIENT] raw_response:', response.choices[0]?.message?.content);

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
      // Anthropic Claude模型 - 使用OpenAI兼容接口
      baseClient = new OpenAI({
        apiKey: process.env.ANTHROPIC_API_KEY,
        baseURL: 'https://api.anthropic.com/v1/openai/'
      });
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
