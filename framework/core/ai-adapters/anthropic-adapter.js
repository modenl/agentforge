const BaseAIAdapter = require('./base-adapter');

/**
 * Anthropic Claude adapter
 */
class AnthropicAdapter extends BaseAIAdapter {
  async createCompletion(params) {
    const { systemMessage, otherMessages } = this.extractSystemMessage(params.messages);
    
    const claudeParams = {
      model: this.model,
      messages: this.convertMessages(otherMessages),
      max_tokens: params.max_tokens || 4096,
      temperature: params.temperature,
      ...(systemMessage && { system: systemMessage.content })
    };

    if (params.tools) {
      claudeParams.tools = this.convertTools(params.tools);
      
      if (params.tool_choice === 'auto') {
        claudeParams.tool_choice = { type: 'auto' };
      } else if (params.tool_choice === 'none') {
        claudeParams.tool_choice = { type: 'none' };
      }
    }

    const response = await this.client.messages.create(claudeParams);
    return this.convertResponse(response);
  }

  async createStreamingCompletion(params, streamCallback) {
    const { systemMessage, otherMessages } = this.extractSystemMessage(params.messages);
    
    const claudeParams = {
      model: this.model,
      messages: this.convertMessages(otherMessages),
      max_tokens: params.max_tokens || 4096,
      temperature: params.temperature,
      stream: true,
      ...(systemMessage && { system: systemMessage.content })
    };

    if (params.tools) {
      claudeParams.tools = this.convertTools(params.tools);
      
      if (params.tool_choice === 'auto') {
        claudeParams.tool_choice = { type: 'auto' };
      }
    }

    const stream = await this.client.messages.create(claudeParams);
    
    let fullContent = '';
    let chunkCount = 0;
    let firstTokenLatency = null;
    const startTs = Date.now();
    
    // Tool use accumulation
    let toolCalls = [];
    let currentToolUse = null;
    let currentToolIndex = 0;

    for await (const chunk of stream) {
      const processedChunk = this.processStreamingChunk(chunk);
      if (processedChunk) {
        chunkCount++;
        if (firstTokenLatency === null) {
          firstTokenLatency = Date.now() - startTs;
        }
        
        // Handle different types of chunks
        if (processedChunk.type === 'content') {
          fullContent += processedChunk.content;
          
          if (streamCallback) {
            streamCallback({
              content: processedChunk.content,
              fullContent: fullContent,
              isComplete: false,
              type: 'content'
            });
          }
        } else if (processedChunk.type === 'tool_use_start') {
          // Start a new tool use
          currentToolUse = {
            id: processedChunk.id,
            type: 'function',
            function: {
              name: processedChunk.name,
              arguments: ''
            }
          };
          toolCalls.push(currentToolUse);
          
          if (streamCallback) {
            streamCallback({
              content: '',
              fullContent: fullContent,
              isComplete: false,
              type: 'tool_call_progress',
              toolCalls: toolCalls
            });
          }
        } else if (processedChunk.type === 'tool_use_delta' && currentToolUse) {
          // Accumulate tool arguments
          currentToolUse.function.arguments += processedChunk.arguments;
          
          if (streamCallback) {
            streamCallback({
              content: '',
              fullContent: fullContent,
              isComplete: false,
              type: 'tool_call_progress',
              toolCalls: toolCalls
            });
          }
        } else if (processedChunk.type === 'tool_use_end') {
          // Tool use completed
          currentToolUse = null;
          currentToolIndex++;
        }
      }
    }

    if (streamCallback) {
      streamCallback({
        content: '',
        fullContent: fullContent,
        isComplete: true,
        type: 'complete',
        toolCalls: toolCalls.length > 0 ? toolCalls : undefined
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
    if (toolCalls.length > 0) {
      result.tool_calls = toolCalls;
    }

    return result;
  }

  convertMessages(messages) {
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

  convertTools(tools) {
    return tools.map(tool => ({
      name: tool.function.name,
      description: tool.function.description,
      input_schema: tool.function.parameters
    }));
  }

  convertResponse(claudeResponse) {
    const message = {
      role: 'assistant',
      content: ''
    };

    // Process content blocks
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

    const usage = this.createUsage(
      claudeResponse.usage?.input_tokens || 0,
      claudeResponse.usage?.output_tokens || 0
    );

    return this.createStandardResponse(
      claudeResponse.id,
      claudeResponse.model,
      message,
      usage,
      claudeResponse.stop_reason || 'stop'
    );
  }

  processStreamingChunk(chunk) {
    // Handle text content
    if (chunk.type === 'content_block_delta' && chunk.delta?.text) {
      return { 
        type: 'content',
        content: chunk.delta.text 
      };
    }
    
    // Handle tool use start
    if (chunk.type === 'content_block_start' && chunk.content_block?.type === 'tool_use') {
      return {
        type: 'tool_use_start',
        id: chunk.content_block.id,
        name: chunk.content_block.name
      };
    }
    
    // Handle tool use input chunks
    if (chunk.type === 'content_block_delta' && chunk.delta?.type === 'input_json_delta') {
      return {
        type: 'tool_use_delta',
        arguments: chunk.delta.partial_json || ''
      };
    }
    
    // Handle tool use end
    if (chunk.type === 'content_block_stop' && chunk.index !== undefined) {
      return {
        type: 'tool_use_end',
        index: chunk.index
      };
    }
    
    return null;
  }
}

module.exports = AnthropicAdapter;