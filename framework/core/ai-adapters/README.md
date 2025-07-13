# AI Provider Adapters

This directory contains adapters for different AI providers, allowing the framework to support multiple LLM APIs through a unified interface.

## Supported Providers

### OpenAI
- Models: `gpt-4`, `gpt-3.5-turbo`, `o1-preview`, `o1-mini`
- Environment variable: `OPENAI_API_KEY`
- Native function calling support

### Anthropic Claude
- Models: `claude-3-opus`, `claude-3-sonnet`, `claude-3-haiku`, `claude-2.1`, `claude-2.0`
- Environment variable: `ANTHROPIC_API_KEY`
- Tool use support with automatic format conversion

### Google Gemini
- Models: `gemini-1.5-pro`, `gemini-1.5-flash`, `gemini-1.0-pro`
- Environment variable: `GOOGLE_API_KEY`
- Two modes:
  - Native Gemini API (default)
  - OpenAI-compatible endpoint (set `GEMINI_USE_OPENAI_COMPATIBLE=true`)

## Architecture

```
BaseAIAdapter (abstract)
├── OpenAIAdapter
├── AnthropicAdapter
└── GeminiAdapter
```

Each adapter implements:
- `createCompletion()` - Non-streaming completion
- `createStreamingCompletion()` - Streaming completion
- `convertMessages()` - Convert messages to provider format
- `convertTools()` - Convert tools to provider format
- `convertResponse()` - Convert response to standard format
- `processStreamingChunk()` - Process streaming chunks

## Usage

```javascript
const { createAIClient } = require('./ai-client-factory');

// Automatically selects the right adapter based on model name
const client = createAIClient('gpt-4');
const client = createAIClient('claude-3-opus-20240229');
const client = createAIClient('gemini-1.5-pro');

// All clients have the same interface
const response = await client.chat.completions.create({
  messages: [...],
  temperature: 0.7,
  max_tokens: 1000,
  tools: [...] // Optional
});
```

## Adding a New Provider

1. Create a new adapter extending `BaseAIAdapter`
2. Implement all required methods
3. Add provider detection in `ai-client-factory.js`
4. Add the provider's SDK to `package.json`

## Key Differences Between Providers

### Message Format
- **OpenAI**: Standard format with roles: system, user, assistant, tool
- **Claude**: System message separate, tool results in user messages
- **Gemini**: Uses "model" instead of "assistant", "function" for tool results

### Tool Calling
- **OpenAI**: `tools` array with `function` type
- **Claude**: `tools` array with `input_schema`
- **Gemini**: `functionDeclarations` in tools

### Streaming
- **OpenAI**: `choices[0].delta.content`
- **Claude**: `content_block_delta` events
- **Gemini**: Custom streaming format

## Environment Variables

```bash
# OpenAI
OPENAI_API_KEY=sk-...

# Anthropic
ANTHROPIC_API_KEY=sk-ant-...

# Google
GOOGLE_API_KEY=AIza...
GEMINI_USE_OPENAI_COMPATIBLE=false  # Set to true for OpenAI-compatible endpoint
```