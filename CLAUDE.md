# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Building and Running
```bash
# Install dependencies
npm install

# Build the framework (required before first run)
npm run build

# Start default app (configured in app.config.js)
npm start

# Start specific app
npm start chess-game
npm start game-time-manager

# Start with options
npm start --smart     # Smart build before starting
npm start --debug     # Enable debugging
npm start chess-game --build  # Build then start

# Development mode with hot reload
npm run dev:smart
```

### Testing
```bash
# Run end-to-end tests
npm run test:e2e

# Run with visible browser
npm run test:e2e:headed

# Debug tests
npm run test:e2e:debug
```

## Architecture Overview

AgentForge implements: **LLM (OS) + Prompt (Pure Logic) + MCP (Side Effects)**

### Core Components

1. **CoreAgent** (`framework/core/core-agent.js`): AI conversation engine
   - Manages AI model interactions (GPT/Claude/Gemini)
   - Handles Variables (LLM's self-evolving memory)
   - Parses responses for UI cards and MCP tool calls

2. **AppManager** (`framework/core/app-manager.js`): Application lifecycle
   - Manages Electron windows and IPC
   - Loads plugins and MCP tools
   - Initializes core services

3. **MCPManager** (`framework/mcp/mcp-manager.js`): MCP protocol handler
   - Manages MCP server connections
   - Executes tools with namespace: `mcp_servername_toolname`
   - Supports WebView embedding

4. **Launcher** (`framework/launcher.js`): Universal app loader
   - Dynamically loads apps from `apps/` directory
   - No hardcoded application logic

### Application Structure

Each app in `apps/` requires:
- `config.js`: Window settings, AI parameters, initial variables
- `prompt.md`: Business logic in natural language
- `mcp.json`: MCP server configurations (optional)
- `mcp-tools/`: Custom MCP implementations (optional)

### Key Conventions

1. **Variables**: LLM manages its own memory through Variables object
2. **Response Format**: AI outputs structured data using `<<<SYSTEMOUTPUT>>>` markers
3. **MCP Tools**: All side effects go through MCP protocol
4. **UI Generation**: Dynamic UI via Adaptive Cards or WebView

### Important Files

- `app.config.js`: Default app selection
- `framework/renderer/svelte/`: UI components
- `scripts/start-app.js`: Application launcher with build options
- `tests/e2e/`: Playwright test files

### Development Tips

1. Business logic lives in `prompt.md` files, not code
2. Use Variables for persistent state across conversations
3. MCP tools handle all system interactions
4. UI is ephemeral - generated on-demand, destroyed after use
5. Check `npm run build` output for Rollup build errors
6. Use `npm start --smart` for faster development cycles