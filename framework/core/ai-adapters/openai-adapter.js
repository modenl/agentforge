const BaseAIAdapter = require('./base-adapter');

/**
 * OpenAI adapter
 * Handles OpenAI API and compatible endpoints (like Gemini's OpenAI-compatible endpoint)
 */
class OpenAIAdapter extends BaseAIAdapter {
  async createCompletion(params) {
    const requestParams = {
      ...params,
      model: this.model
    };

    const response = await this.client.chat.completions.create(requestParams);
    return response;
  }

  async createStreamingCompletion(params, streamCallback) {
    const requestParams = {
      ...params,
      model: this.model,
      stream: true
    };

    const stream = await this.client.chat.completions.create(requestParams);
    
    let fullContent = '';
    let chunkCount = 0;
    let firstTokenLatency = null;
    const startTs = Date.now();
    
    // Tool call accumulation
    let toolCalls = [];
    let currentToolCall = null;

    for await (const chunk of stream) {
      // Process for both content and tool calls in the same chunk
      const delta = chunk.choices[0]?.delta;
      
      if (delta) {
        chunkCount++;
        if (firstTokenLatency === null) {
          firstTokenLatency = Date.now() - startTs;
        }
        
        // Handle content (may exist alongside tool calls)
        if (delta.content) {
          fullContent += delta.content;
          
          if (streamCallback) {
            streamCallback({
              content: delta.content,
              fullContent: fullContent,
              isComplete: false,
              type: 'content'
            });
          }
        }
        
        // Handle tool calls (may exist alongside content)
        if (delta.tool_calls && delta.tool_calls.length > 0) {
          for (const toolCallChunk of delta.tool_calls) {
            if (toolCallChunk.index !== undefined) {
              const index = toolCallChunk.index;
              
              // Initialize tool call if needed
              if (!toolCalls[index]) {
                toolCalls[index] = {
                  id: toolCallChunk.id || '',
                  type: 'function',
                  function: {
                    name: '',
                    arguments: ''
                  }
                };
              }
              
              // Update tool call data
              if (toolCallChunk.id) {
                toolCalls[index].id = toolCallChunk.id;
              }
              if (toolCallChunk.function?.name) {
                toolCalls[index].function.name = toolCallChunk.function.name;
              }
              if (toolCallChunk.function?.arguments) {
                toolCalls[index].function.arguments += toolCallChunk.function.arguments;
              }
            }
          }
          
          // Notify about tool call progress
          if (streamCallback) {
            streamCallback({
              content: '',
              fullContent: fullContent,
              isComplete: false,
              type: 'tool_call_progress',
              toolCalls: toolCalls.filter(tc => tc !== null)
            });
          }
        }
      }
    }

    // Filter out any null entries in toolCalls
    const finalToolCalls = toolCalls.filter(tc => tc !== null);

    // Send completion signal with tool calls if any
    if (streamCallback) {
      streamCallback({
        content: '',
        fullContent: fullContent,
        isComplete: true,
        type: 'complete',
        toolCalls: finalToolCalls.length > 0 ? finalToolCalls : undefined
      });
    }

    const result = {
      content: fullContent,
      role: 'assistant',
      finish_reason: 'stop',
      metrics: { 
        totalLatency: Date.now() - startTs, 
        firstTokenLatency, 
        chunkCount 
      }
    };
    
    // Add tool calls to result if any
    if (finalToolCalls.length > 0) {
      result.tool_calls = finalToolCalls;
    }

    return result;
  }

  processStreamingChunk(chunk) {
    const delta = chunk.choices[0]?.delta;
    
    if (!delta) return null;
    
    // Note: OpenAI can send both content and tool_calls in the same delta
    // We need to handle both, but we can only return one at a time
    // Priority: content first, then tool calls
    
    // Handle content chunks
    if (delta.content) {
      return { 
        type: 'content',
        content: delta.content 
      };
    }
    
    // Handle tool call chunks
    if (delta.tool_calls && delta.tool_calls.length > 0) {
      // OpenAI sends tool calls in chunks with an index
      const toolCallChunk = delta.tool_calls[0];
      return {
        type: 'tool_call',
        toolCallChunk: toolCallChunk
      };
    }
    
    return null;
  }
}

module.exports = OpenAIAdapter;