# Children Game Time Manager

A comprehensive GPT-4.1 driven children's game time management system with Adaptive Card UI, designed to help parents manage their children's gaming time while providing educational incentives.

## Features

### 🎮 Game Time Management
- **Weekly Time Quotas**: Configurable base weekly gaming time with reward system
- **Real-time Monitoring**: Automatic time tracking with idle detection
- **Game Whitelist**: Controlled list of approved games with category management
- **Session Control**: Minimum and maximum session length enforcement

### 🧠 AI-Powered Interface
- **GPT-4.1 Integration**: Intelligent responses with autonomous thinking framework
- **Adaptive Cards**: Dynamic, role-based UI generation
- **Natural Language**: Conversational interface for all interactions
- **Context Awareness**: System understands current state and user needs

### 👥 Multi-Role System
- **Child Mode**: Simplified, large-button interface with safety restrictions
- **Parent Mode**: Detailed controls, statistics, and configuration options
- **Agent Mode**: System monitoring, diagnostics, and advanced settings

### 📚 Educational Features
- **Math Quiz System**: Earn extra gaming time by solving math problems
- **Difficulty Scaling**: Age-appropriate questions with progressive difficulty
- **Reward Calculation**: Time bonuses based on accuracy and speed
- **Learning Analytics**: Track educational progress and performance

### 🔒 Security & Safety
- **Screen Locking**: Automatic and manual screen lock functionality
- **System Integrity**: Monitor for debugging tools and time manipulation
- **Process Control**: Prevent unauthorized software and system changes
- **Violation Detection**: Automatic response to security breaches

### 📊 Analytics & Reporting
- **Usage Statistics**: Detailed time tracking and usage patterns
- **Performance Metrics**: System performance and health monitoring
- **Educational Progress**: Quiz completion rates and learning outcomes
- **Parental Reports**: Weekly summaries and trend analysis

### 🌐 Data Synchronization
- **Cloud Backup**: Supabase integration for data persistence
- **Offline Mode**: Full functionality without internet connection
- **Conflict Resolution**: Smart merging of offline and online data
- **Multi-Device**: Sync across multiple family devices

## Architecture

### Core Components

#### 1. GPT-4.1 Agent (`src/main/gpt-agent.js`)
- **Autonomous Thinking**: 4-step decision framework (Situation → Goal → Reasoning → Decision)
- **Role Adaptation**: Dynamic behavior based on current user role
- **Conversation Management**: Context-aware dialogue with history tracking
- **Response Validation**: Ensures all outputs conform to Adaptive Card standards

#### 2. MCP Capability Sandbox (`src/main/mcp-server.js`)
- **30+ System Functions**: Game management, time tracking, quiz generation, security controls
- **Permission System**: Role-based access control for all operations
- **Rate Limiting**: Prevents abuse and ensures system stability
- **Audit Logging**: Complete activity tracking for security and debugging

#### 3. Adaptive Card Renderer (`src/renderer/adaptive-card-renderer.js`)
- **Custom Elements**: Timer, ProgressBar, GameIcon components
- **Role-based Theming**: Automatic UI adaptation for different user roles
- **Event Handling**: Seamless integration with application logic
- **Animation Support**: Smooth transitions and visual feedback

#### 4. Main Application (`src/main/main.js`)
- **Electron Integration**: Cross-platform desktop application
- **Scheduled Tasks**: Automated weekly resets, data sync, system monitoring
- **IPC Communication**: Secure renderer-main process communication
- **Lifecycle Management**: Proper startup, shutdown, and error handling

### Configuration System (`src/config/config.js`)
Comprehensive configuration covering:
- Time management rules and quotas
- Game whitelist and categories
- Reward system parameters
- Security settings and thresholds
- UI themes and role permissions
- API endpoints and credentials

### Super Prompt (`src/prompts/super-prompt.txt`)
Detailed GPT-4.1 system prompt including:
- Role definitions and responsibilities
- Thinking framework methodology
- Business rule enforcement
- Output format specifications
- Safety and security guidelines

## Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- OpenAI API key
- Supabase account (optional, for cloud sync)

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd screencontrolagents
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   SUPABASE_URL=your_supabase_url_here
   SUPABASE_ANON_KEY=your_supabase_anon_key_here
   NODE_ENV=development
   ```

4. **Configure Application**
   Edit `src/config/config.js` to customize:
   - Time management rules
   - Game whitelist
   - Reward parameters
   - Security settings

5. **Run the Application**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   
   # Build for distribution
   npm run build
   ```

## Usage

### Initial Setup
1. **First Launch**: Application starts in Child mode with default settings
2. **Parent Setup**: Switch to Parent mode to configure time quotas and game list
3. **Game Configuration**: Add approved games to the whitelist
4. **Time Allocation**: Set weekly base time and reward parameters

### Daily Operation
1. **Child Login**: Child starts application and sees remaining time
2. **Game Selection**: Choose from approved games list
3. **Time Tracking**: Automatic monitoring with real-time updates
4. **Quiz Opportunities**: Earn extra time through educational activities
5. **Parent Oversight**: Parents can monitor usage and adjust settings

### Role Switching
- **Child → Parent**: Requires password authentication
- **Parent → Agent**: Additional security verification
- **Emergency Access**: Agent mode for system recovery

## API Integration

### OpenAI GPT-4.1
```javascript
// Example GPT interaction
const response = await gptAgent.processUserInput(
  "I want to play Minecraft",
  "Child",
  { timeRemaining: 45, gameRequested: "minecraft" }
);
```

### Supabase Data Sync
```javascript
// Example data synchronization
const syncResult = await mcpServer.sync_with_supabase({
  sync_type: 'incremental',
  tables: ['usage_logs', 'quiz_results'],
  direction: 'bidirectional'
});
```

## Security Features

### System Integrity Monitoring
- **Process Detection**: Identifies debugging tools and unauthorized software
- **Time Manipulation**: Prevents system clock changes during gaming sessions
- **File System**: Monitors critical application files for tampering
- **Network Activity**: Tracks suspicious network connections

### Access Control
- **Role-based Permissions**: Each role has specific allowed actions
- **Authentication**: Password protection for role switching
- **Session Management**: Automatic logout and session timeouts
- **Audit Trail**: Complete logging of all user actions

## Development

### Project Structure
```
screencontrolagents/
├── src/
│   ├── config/           # Configuration files
│   ├── main/            # Main process (Electron)
│   ├── renderer/        # Renderer process (UI)
│   └── prompts/         # GPT system prompts
├── assets/              # Images and icons
├── package.json         # Dependencies and scripts
└── README.md           # This file
```

### Key Technologies
- **Electron**: Cross-platform desktop framework
- **OpenAI GPT-4.1**: AI-powered conversation and decision making
- **Adaptive Cards**: Dynamic UI generation
- **Supabase**: Cloud database and real-time sync
- **Node.js**: Server-side JavaScript runtime

### Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Troubleshooting

### Common Issues

**Application won't start**
- Check Node.js version (18+ required)
- Verify all dependencies are installed
- Ensure OpenAI API key is valid

**GPT responses not working**
- Verify OpenAI API key in environment variables
- Check internet connection
- Review API usage limits

**Time tracking issues**
- Ensure system clock is accurate
- Check for conflicting time management software
- Verify game process detection

**Sync problems**
- Confirm Supabase credentials
- Check network connectivity
- Review sync logs in application data folder

### Logs and Debugging
- Application logs: `%USERDATA%/logs/`
- Debug mode: Set `NODE_ENV=development`
- Verbose logging: Enable in configuration

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue on GitHub
- Check the troubleshooting section
- Review the configuration documentation

## Acknowledgments

- OpenAI for GPT-4.1 API
- Microsoft for Adaptive Cards framework
- Supabase for cloud infrastructure
- Electron team for cross-platform framework 