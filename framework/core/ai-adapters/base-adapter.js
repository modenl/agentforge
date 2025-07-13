/**
 * Base adapter class for AI providers
 * Defines the common interface that all AI adapters must implement
 */
class BaseAIAdapter {
  constructor(client, model) {
    this.client = client;
    this.model = model;
  }

  /**
   * Create a completion request
   * @param {Object} params - Standard parameters (messages, tools, etc.)
   * @returns {Promise<Object>} - Standard response format
   */
  async createCompletion(params) {
    throw new Error('createCompletion must be implemented by subclass');
  }

  /**
   * Create a streaming completion request
   * @param {Object} params - Standard parameters
   * @param {Function} streamCallback - Callback for streaming chunks
   * @returns {Promise<Object>} - Final response
   */
  async createStreamingCompletion(params, streamCallback) {
    throw new Error('createStreamingCompletion must be implemented by subclass');
  }

  /**
   * Convert standard message format to provider-specific format
   * @param {Array} messages - Standard message array
   * @returns {Array} - Provider-specific message format
   */
  convertMessages(messages) {
    return messages;
  }

  /**
   * Convert standard tools format to provider-specific format
   * @param {Array} tools - Standard tools array
   * @returns {Array} - Provider-specific tools format
   */
  convertTools(tools) {
    return tools;
  }

  /**
   * Convert provider response to standard format
   * @param {Object} response - Provider-specific response
   * @returns {Object} - Standard response format
   */
  convertResponse(response) {
    return response;
  }

  /**
   * Process a streaming chunk
   * @param {Object} chunk - Provider-specific chunk
   * @returns {Object|null} - Standard chunk format or null if no content
   */
  processStreamingChunk(chunk) {
    return null;
  }

  /**
   * Extract system message from messages array
   * @param {Array} messages - Message array
   * @returns {Object} - { systemMessage, otherMessages }
   */
  extractSystemMessage(messages) {
    const systemMessage = messages.find(msg => msg.role === 'system');
    const otherMessages = messages.filter(msg => msg.role !== 'system');
    return { systemMessage, otherMessages };
  }

  /**
   * Standard response format
   */
  createStandardResponse(id, model, message, usage, finishReason = 'stop') {
    return {
      id: id,
      object: 'chat.completion',
      created: Date.now() / 1000,
      model: model,
      choices: [{
        index: 0,
        message: message,
        finish_reason: finishReason
      }],
      usage: usage
    };
  }

  /**
   * Standard usage format
   */
  createUsage(promptTokens, completionTokens) {
    return {
      prompt_tokens: promptTokens,
      completion_tokens: completionTokens,
      total_tokens: promptTokens + completionTokens
    };
  }
}

module.exports = BaseAIAdapter;