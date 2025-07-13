const OpenAI = require('openai');
const Anthropic = require('@anthropic-ai/sdk');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const logger = require('./logger');

const OpenAIAdapter = require('./ai-adapters/openai-adapter');
const AnthropicAdapter = require('./ai-adapters/anthropic-adapter');
const GeminiAdapter = require('./ai-adapters/gemini-adapter');

/**
 * AI客户端包装类
 * 提供统一的接口用于不同LLM服务
 */
class AIClientWrapper {
  constructor(adapter) {
    this.adapter = adapter;
    this.model = adapter.model;

    // 提供标准的 OpenAI 接口兼容性
    this.chat = {
      completions: {
        create: async(params) => {
          console.log('🤖 [CLIENT] 开始调用 |', `模型: ${this.model} | 消息数: ${params.messages?.length} | 温度: ${params.temperature}`);

          const startTime = Date.now();

          try {
            const response = await this.adapter.createCompletion(params);
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
   * 流式聊天完成
   */
  async streamComplete(requestConfig, streamCallback) {
    try {
      const startTs = Date.now();

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

      const result = await this.adapter.createStreamingCompletion(requestConfig, streamCallback);

      const totalLatency = Date.now() - startTs;
      logger.info('[PERF] streamComplete', {
        model: this.model,
        totalLatency,
        firstTokenLatency: result.metrics?.firstTokenLatency,
        chunkCount: result.metrics?.chunkCount,
        contentLength: result.content.length
      });

      console.log(''); // 空行分隔

      return result;

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

      const response = await this.adapter.createCompletion(requestConfig);

      const duration = Date.now() - startTs;
      
      console.log('🤖 [CLIENT_COMPLETE] 调用成功 |', `耗时: ${duration}ms | 内容: ${response.choices?.[0]?.message?.content?.length}字`);
      console.log('\n🤖 [CLIENT_COMPLETE_RAW_RESPONSE]:');
      console.log('=' .repeat(80));
      console.log(response.choices?.[0]?.message?.content);
      console.log('=' .repeat(80));
      console.log(''); // 空行分隔

      return response;

    } catch (error) {
      logger.error(`Non-stream completion failed for model ${this.model}:`, error);
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

    let adapter;

    // 根据模型类型创建不同的适配器
    if (model.startsWith('gpt-') || model.startsWith('o1-')) {
      // OpenAI模型
      const client = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });
      adapter = new OpenAIAdapter(client, model);
    } else if (model.startsWith('gemini-')) {
      // 检查是否使用 OpenAI 兼容模式
      if (process.env.GEMINI_USE_OPENAI_COMPATIBLE === 'true') {
        // Google Gemini模型 - 使用OpenAI兼容接口
        const client = new OpenAI({
          apiKey: process.env.GOOGLE_API_KEY,
          baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/'
        });
        adapter = new OpenAIAdapter(client, model);
      } else {
        // 使用原生 Gemini API
        const client = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
        adapter = new GeminiAdapter(client, model);
      }
    } else if (model.startsWith('claude-')) {
      // Anthropic Claude模型
      const client = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY
      });
      adapter = new AnthropicAdapter(client, model);
    } else {
      // 默认使用OpenAI客户端
      logger.warn(`Unknown model type: ${model}, using OpenAI client as fallback`);
      const client = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });
      adapter = new OpenAIAdapter(client, model);
    }

    logger.info(`Created ${adapter.constructor.name} for model: ${model}`);
    return new AIClientWrapper(adapter);
  }

  /**
   * 获取支持的模型列表
   * @returns {Array<{name: string, description: string}>}
   */
  static getSupportedModels() {
    return [
      // OpenAI
      { name: 'gpt-4-1106-preview', description: 'GPT-4 Turbo with 128K context' },
      { name: 'gpt-4', description: 'GPT-4 with 8K context' },
      { name: 'gpt-3.5-turbo', description: 'GPT-3.5 Turbo' },
      { name: 'o1-preview', description: 'OpenAI o1 Preview' },
      { name: 'o1-mini', description: 'OpenAI o1 Mini' },
      
      // Gemini
      { name: 'gemini-1.5-pro', description: 'Google Gemini 1.5 Pro' },
      { name: 'gemini-1.5-flash', description: 'Google Gemini 1.5 Flash' },
      { name: 'gemini-1.0-pro', description: 'Google Gemini 1.0 Pro' },
      
      // Claude
      { name: 'claude-3-opus-20240229', description: 'Claude 3 Opus' },
      { name: 'claude-3-sonnet-20240229', description: 'Claude 3 Sonnet' },
      { name: 'claude-3-haiku-20240307', description: 'Claude 3 Haiku' },
      { name: 'claude-2.1', description: 'Claude 2.1' },
      { name: 'claude-2.0', description: 'Claude 2.0' }
    ];
  }

  /**
   * 检查模型所需的环境变量是否配置
   * @param {string} model - 模型名称
   * @returns {boolean}
   */
  static isModelConfigured(model) {
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
   * 获取模型的简短名称（用于日志等）
   * @param {string} model - 模型名称
   * @returns {string}
   */
  static getModelShortName(model) {
    const modelMap = {
      'gpt-4-1106-preview': 'GPT4-Turbo',
      'gpt-4': 'GPT4',
      'gpt-3.5-turbo': 'GPT3.5',
      'o1-preview': 'O1-Preview',
      'o1-mini': 'O1-Mini',
      'gemini-1.5-pro': 'Gemini-Pro',
      'gemini-1.5-flash': 'Gemini-Flash',
      'gemini-1.0-pro': 'Gemini-1.0',
      'claude-3-opus-20240229': 'Claude-Opus',
      'claude-3-sonnet-20240229': 'Claude-Sonnet',
      'claude-3-haiku-20240307': 'Claude-Haiku',
      'claude-2.1': 'Claude-2.1',
      'claude-2.0': 'Claude-2.0'
    };
    return modelMap[model] || model;
  }
}

// Export the createAIClient function
module.exports = {
  createAIClient: AIClientFactory.createClient.bind(AIClientFactory)
};