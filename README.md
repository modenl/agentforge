# Screen Control Agents

A comprehensive AI-driven children's game time management system with Adaptive
Card UI and LLM-based state management, designed to help parents manage their
children's gaming time through intelligent conversation interfaces.

## Features

### 🤖 AI-Powered State Management

- **CoreAgent Architecture**: Single unified agent handling all user
  interactions
- **Multi-Model Support**: Configurable AI models (GPT-4, Gemini, Claude, etc.)
- **Context-Aware Responses**: Intelligent state tracking without persistent app
  data
- **Streaming Interface**: Real-time response generation with smooth user
  experience

### 🎮 Game Time Management

- **Chrome Integration**: Direct browser control and monitoring
- **Real-time Tracking**: Automatic session monitoring and time enforcement
- **Flexible Rules**: Configurable time limits and access controls
- **Session Management**: Intelligent session handling with idle detection

### 👥 Multi-Role System

- **Child Mode**: Simplified, safe interface with large buttons and clear
  messaging
- **Parent Mode**: Administrative controls and detailed system management
- **Dynamic Role Switching**: Secure authentication-based role transitions

### 🎯 Adaptive Card UI

- **Dynamic Interface**: AI-generated UI components based on current context
- **Dual-Panel System**: Global cards and input assist cards for optimal UX
- **Custom Components**: Specialized elements like timers, progress bars, and
  game icons
- **Responsive Design**: Automatic adaptation to different screen sizes and user
  roles

### 🔧 MCP Integration

- **30+ System Functions**: Comprehensive system control capabilities
- **Permission-Based Access**: Role-specific function availability
- **Chrome DevTools Protocol**: Direct browser interaction and control
- **System Monitoring**: Process detection and system integrity checks

### 📊 Advanced Logging & Monitoring

- **Comprehensive Logging**: Multi-level logging with file rotation
- **Performance Monitoring**: System performance tracking and optimization
- **Security Auditing**: Complete activity logging for security analysis
- **Debug Support**: Development-friendly debugging and troubleshooting

## Architecture

### Core Components

#### 1. CoreAgent (`src/main/core-agent.js`)

The heart of the system - a unified AI agent that:

- **State Management**: Tracks current role, child state, and parent state
  without persistent data
- **Multi-Model Support**: Configurable AI model integration through factory
  pattern
- **Streaming Support**: Real-time response generation with callback support
- **Context Injection**: Dynamic prompt enhancement with current system state
- **Response Parsing**: Intelligent parsing of AI responses into structured data

#### 2. MCP Server (`src/main/mcp-server.js`)

Model Control Protocol implementation providing:

- **System Functions**: 30+ operations including Chrome control, time
  management, security
- **Permission System**: Role-based access control for all operations
- **Chrome Integration**: Direct browser control via Chrome DevTools Protocol
- **Security Functions**: Process monitoring, system integrity checks
- **Data Management**: Session tracking and system state persistence

#### 3. Adaptive Card Components (`src/renderer/svelte/components/`)

- **AdaptiveCardPanel.svelte**: Renders Microsoft Adaptive Cards with custom
  elements
- **ChatWindow.svelte**: Main conversation interface with streaming support
- **Custom Elements**: Timer, ProgressBar, GameIcon, and other specialized
  components
- **Event Handling**: Seamless integration between UI interactions and system
  logic

#### 4. Chrome Controller (`src/main/chrome-controller.js`)

Direct browser integration featuring:

- **DevTools Protocol**: Low-level Chrome control and monitoring
- **Tab Management**: Create, close, and monitor browser tabs
- **URL Control**: Navigate to specific websites and enforce restrictions
- **Session Monitoring**: Track active gaming sessions and enforce time limits

#### 5. AI Client Factory (`src/main/ai-client-factory.js`)

Flexible AI model integration:

- **Multi-Provider Support**: OpenAI, Google, Anthropic, and other providers
- **Streaming Support**: Real-time response generation across all models
- **Configuration Management**: Model-specific settings and optimization
- **Error Handling**: Robust error handling and fallback mechanisms

### Configuration System (`src/config/config.js`)

Centralized configuration covering:

- **Application Settings**: Basic app configuration and paths
- **UI Configuration**: Window settings and Adaptive Card parameters
- **Logging Configuration**: Multi-level logging with file rotation
- **AI Agent Settings**: Model selection, temperature, token limits
- **Development Options**: Debug mode, mock data, and development tools

### Prompt System (`src/prompts/`)

Sophisticated prompt engineering:

- **base-prompt.md**: Core system instructions and response format
  specifications
- **business-prompt.md**: Detailed business logic and state transition rules
- **core-agent-prompt.md**: Complete agent behavior and decision-making
  framework
- **Dynamic Injection**: Runtime context injection for state-aware responses

## Installation

### Prerequisites

- Node.js 18+
- npm or yarn
- OpenAI API key (or other AI provider credentials)
- Chrome browser (for game control features)

### Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/modenl/screencontrolagents.git
   cd screencontrolagents
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Configuration** Create a `.env` file in the root directory:

   ```env
   # OpenAI Configuration
   OPENAI_API_KEY=your_openai_api_key_here

   # Google AI Configuration (optional)
   GOOGLE_API_KEY=your_google_api_key_here

   # Application Configuration
   NODE_ENV=development
   LOG_LEVEL=info

   # Security Configuration
   ENCRYPTION_KEY=your_32_character_encryption_key_here
   SESSION_SECRET=your_session_secret_here
   ```

4. **Configure Application** Edit `src/config/config.js` to customize:

   - AI model selection and parameters
   - UI window settings
   - Logging preferences
   - Development options

5. **Run the Application**

   ```bash
   # Development mode with hot reload
   npm run dev:smart

   # Simple development mode
   npm start

   # Build Svelte components
   npm run build

   # Debug mode with Chrome DevTools
   npm run debug
   ```

## Usage

### Initial Setup

1. **First Launch**: Application starts in Child mode with default settings
2. **Parent Access**: Use password authentication to switch to Parent mode
3. **System Configuration**: Configure time limits, game access, and security
   settings
4. **Chrome Integration**: Ensure Chrome browser is available for game control

### Daily Operation

1. **Child Interaction**: Natural language conversation for game requests and
   time queries
2. **Automatic Monitoring**: System tracks gaming sessions and enforces time
   limits
3. **Dynamic UI**: Adaptive Cards provide context-appropriate interfaces
4. **Parent Oversight**: Switch to Parent mode for detailed control and
   monitoring

### Role Management

- **Child → Parent**: Requires password authentication
- **Parent → Child**: Simple role switch without authentication
- **State Persistence**: System remembers role and context across sessions

## API Integration

### AI Model Usage

```javascript
// Example CoreAgent interaction
const agent = new CoreAgent();
await agent.initialize();

const response = await agent.processInput(
  'I want to play Minecraft for 30 minutes',
  { currentTime: new Date().toISOString() }
);
```

### MCP Function Calls

```javascript
// Example MCP server interaction
const mcpServer = new MCPServer();
const result = await mcpServer.handleRequest({
  method: 'chrome_create_tab',
  params: { url: 'https://minecraft.net' }
});
```

### Streaming Responses

```javascript
// Example streaming interaction
const response = await agent.processInputStreaming(
  'How much time do I have left?',
  {},
  chunk => {
    // Handle streaming response chunks
    console.log('Received chunk:', chunk);
  }
);
```

## Development

### Project Structure

```
screencontrolagents/
├── src/
│   ├── config/           # Configuration files
│   │   ├── config.js     # Main application configuration
│   │   └── agent-config.js # AI agent configuration
│   ├── main/            # Main process (Electron)
│   │   ├── main.js      # Application entry point
│   │   ├── core-agent.js # Unified AI agent
│   │   ├── mcp-server.js # MCP function implementation
│   │   ├── chrome-controller.js # Browser control
│   │   ├── ai-client-factory.js # AI model integration
│   │   └── logger.js    # Logging system
│   ├── renderer/        # Renderer process (UI)
│   │   ├── svelte/      # Svelte components
│   │   │   ├── App.svelte
│   │   │   └── components/
│   │   │       ├── ChatWindow.svelte
│   │   │       └── AdaptiveCardPanel.svelte
│   │   ├── bundle/      # Built assets
│   │   └── preload.js   # Electron preload script
│   └── prompts/         # AI system prompts
│       ├── base-prompt.md # Core system instructions
│       ├── business-prompt.md # Business logic
│       └── core-agent-prompt.md # Agent behavior
├── scripts/             # Build and utility scripts
├── package.json         # Dependencies and scripts
└── README.md           # This file
```

### Key Technologies

- **Electron**: Cross-platform desktop framework
- **Svelte**: Reactive UI framework
- **Multiple AI Providers**: OpenAI, Google, Anthropic support
- **Microsoft Adaptive Cards**: Dynamic UI generation
- **Chrome DevTools Protocol**: Direct browser control
- **Node.js**: Server-side JavaScript runtime

### Available Scripts

- `npm start` - Start application in development mode
- `npm run dev` - Build Svelte components with watch mode
- `npm run dev:smart` - Concurrent build and app start
- `npm run debug` - Start with Chrome DevTools enabled
- `npm run build` - Build production assets
- `npm run lint` - Run ESLint on source code
- `npm run test:core` - Test core agent functionality

### Development Features

- **Hot Reload**: Automatic component rebuilding during development
- **Debug Mode**: Chrome DevTools integration for debugging
- **Comprehensive Logging**: Multi-level logging with file output
- **State Inspection**: Real-time state monitoring and debugging
- **Mock Data**: Development-friendly mock data options

## Security Features

### System Integrity

- **Process Monitoring**: Detection of unauthorized software and debugging tools
- **Chrome Integration**: Secure browser control with permission management
- **Session Management**: Secure role switching and authentication
- **Audit Logging**: Complete activity tracking for security analysis

### Access Control

- **Role-Based Permissions**: Each role has specific allowed functions
- **Password Protection**: Secure parent mode access
- **Function Restrictions**: MCP functions restricted by user role
- **State Validation**: Comprehensive state transition validation

## Troubleshooting

### Common Issues

**Application won't start**

- Check Node.js version (18+ required)
- Verify all dependencies are installed: `npm install`
- Ensure AI API keys are valid in `.env` file

**AI responses not working**

- Verify API keys in environment variables
- Check internet connection
- Review API usage limits and billing

**Chrome control issues**

- Ensure Chrome browser is installed and accessible
- Check Chrome DevTools Protocol port availability
- Verify system permissions for browser control

**Streaming responses not displaying**

- Check console for JavaScript errors
- Verify Svelte components are built: `npm run build`
- Test with `npm run dev:smart` for development mode

### Logs and Debugging

- Application logs: Check console output and log files
- Debug mode: Use `npm run debug` for Chrome DevTools
- Verbose logging: Set `LOG_LEVEL=debug` in environment
- State inspection: Use development tools in debug mode

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes with proper testing
4. Run linting: `npm run lint`
5. Submit a pull request with detailed description

## License

This project is licensed under the MIT License - see the LICENSE file for
details.

## Support

For support and questions:

- Create an issue on
  [GitHub](https://github.com/modenl/screencontrolagents/issues)
- Check the troubleshooting section above
- Review the configuration documentation

## Acknowledgments

- OpenAI for GPT API integration
- Google for Gemini API support
- Microsoft for Adaptive Cards framework
- Electron team for cross-platform framework
- Svelte team for reactive UI framework
