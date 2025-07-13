const BaseAIAdapter = require('./base-adapter');

/**
 * Google Gemini adapter
 * Handles direct Gemini API calls (not the OpenAI-compatible endpoint)
 */
class GeminiAdapter extends BaseAIAdapter {
  constructor(client, model) {
    super(client, model);
    // Extract model name without gemini- prefix for API
    this.apiModel = model.replace('gemini-', '');
  }

  async createCompletion(params) {
    const { systemMessage, otherMessages } = this.extractSystemMessage(params.messages);
    
    // Gemini uses generateContent API
    const geminiParams = {
      contents: this.convertMessages(otherMessages),
      generationConfig: {
        temperature: params.temperature,
        maxOutputTokens: params.max_tokens || 4096,
      }
    };

    // Add system instruction if present
    if (systemMessage) {
      geminiParams.systemInstruction = systemMessage.content;
    }

    // Handle tools
    if (params.tools) {
      geminiParams.tools = [{
        functionDeclarations: this.convertTools(params.tools)
      }];
    }

    // Get the generative model
    const genModel = this.client.getGenerativeModel({ 
      model: this.apiModel,
      ...geminiParams
    });

    const result = await genModel.generateContent({
      contents: geminiParams.contents
    });

    return this.convertResponse(result.response);
  }

  async createStreamingCompletion(params, streamCallback) {
    const { systemMessage, otherMessages } = this.extractSystemMessage(params.messages);
    
    const geminiParams = {
      contents: this.convertMessages(otherMessages),
      generationConfig: {
        temperature: params.temperature,
        maxOutputTokens: params.max_tokens || 4096,
      }
    };

    if (systemMessage) {
      geminiParams.systemInstruction = systemMessage.content;
    }

    if (params.tools) {
      geminiParams.tools = [{
        functionDeclarations: this.convertTools(params.tools)
      }];
    }

    const genModel = this.client.getGenerativeModel({ 
      model: this.apiModel,
      ...geminiParams
    });

    const result = await genModel.generateContentStream({
      contents: geminiParams.contents
    });

    let fullContent = '';
    let chunkCount = 0;
    let firstTokenLatency = null;
    const startTs = Date.now();
    let toolCalls = [];

    for await (const chunk of result.stream) {
      const processedChunk = this.processStreamingChunk(chunk);
      if (processedChunk) {
        chunkCount++;
        if (firstTokenLatency === null) {
          firstTokenLatency = Date.now() - startTs;
        }
        
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
        } else if (processedChunk.type === 'function_call') {
          // Handle function calls
          toolCalls.push(processedChunk.functionCall);
          
          if (streamCallback) {
            streamCallback({
              content: '',
              fullContent: fullContent,
              isComplete: false,
              type: 'tool_call_progress',
              toolCalls: toolCalls
            });
          }
        }
      }
    }

    // Get the final response to check for any accumulated function calls
    const finalResponse = await result.response;
    const candidate = finalResponse.candidates?.[0];
    
    if (candidate?.content?.parts) {
      for (const part of candidate.content.parts) {
        if (part.functionCall && !toolCalls.find(tc => tc.name === part.functionCall.name)) {
          toolCalls.push({
            id: `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: 'function',
            function: {
              name: part.functionCall.name,
              arguments: JSON.stringify(part.functionCall.args)
            }
          });
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

    const result_data = {
      content: fullContent,
      role: 'assistant',
      finish_reason: candidate?.finishReason || 'stop',
      metrics: { 
        totalLatency: Date.now() - startTs, 
        firstTokenLatency, 
        chunkCount 
      }
    };
    
    if (toolCalls.length > 0) {
      result_data.tool_calls = toolCalls;
    }

    return result_data;
  }

  convertMessages(messages) {
    const contents = [];
    
    for (const msg of messages) {
      if (msg.role === 'tool') {
        // Tool responses in Gemini
        contents.push({
          role: 'function',
          parts: [{
            functionResponse: {
              name: msg.name,
              response: JSON.parse(msg.content)
            }
          }]
        });
      } else if (msg.role === 'assistant' && msg.tool_calls) {
        // Assistant with tool calls
        const parts = [];
        if (msg.content) {
          parts.push({ text: msg.content });
        }
        for (const toolCall of msg.tool_calls) {
          parts.push({
            functionCall: {
              name: toolCall.function.name,
              args: JSON.parse(toolCall.function.arguments || '{}')
            }
          });
        }
        contents.push({
          role: 'model',
          parts: parts
        });
      } else {
        // Regular message
        contents.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        });
      }
    }
    
    return contents;
  }

  convertTools(tools) {
    return tools.map(tool => ({
      name: tool.function.name,
      description: tool.function.description,
      parameters: tool.function.parameters
    }));
  }

  convertResponse(geminiResponse) {
    const candidate = geminiResponse.candidates?.[0];
    if (!candidate) {
      throw new Error('No response candidate from Gemini');
    }

    const message = {
      role: 'assistant',
      content: ''
    };

    // Process parts
    const tool_calls = [];
    
    for (const part of candidate.content.parts || []) {
      if (part.text) {
        message.content += part.text;
      } else if (part.functionCall) {
        tool_calls.push({
          id: `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: 'function',
          function: {
            name: part.functionCall.name,
            arguments: JSON.stringify(part.functionCall.args)
          }
        });
      }
    }

    if (tool_calls.length > 0) {
      message.tool_calls = tool_calls;
    }

    // Gemini doesn't provide token counts in the same way
    const usage = this.createUsage(
      geminiResponse.usageMetadata?.promptTokenCount || 0,
      geminiResponse.usageMetadata?.candidatesTokenCount || 0
    );

    return this.createStandardResponse(
      `gemini_${Date.now()}`,
      this.model,
      message,
      usage,
      candidate.finishReason || 'stop'
    );
  }

  processStreamingChunk(chunk) {
    const candidate = chunk.candidates?.[0];
    if (!candidate?.content?.parts) return null;
    
    // Process all parts in the chunk
    for (const part of candidate.content.parts) {
      if (part.text) {
        return { 
          type: 'content',
          content: part.text 
        };
      } else if (part.functionCall) {
        return {
          type: 'function_call',
          functionCall: {
            id: `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: 'function',
            function: {
              name: part.functionCall.name,
              arguments: JSON.stringify(part.functionCall.args)
            }
          }
        };
      }
    }
    
    return null;
  }
}

module.exports = GeminiAdapter;