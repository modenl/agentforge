# AgentForge

一个基于LLM+Prompt+MCP的智能代理应用开发框架，提供统一的AI代理架构、自适应UI和系统集成能力，让开发者可以快速构建各种智能桌面应用。

## 🏗️ 框架架构

### 框架概述

AgentForge 是一个模块化的智能代理应用开发框架，分为**框架层**和**应用层**：

- **框架层 (Framework)**: 提供核心功能和基础设施
- **应用层 (Apps)**: 基于框架构建的具体应用

```
agentforge/
├── framework/              # 🔧 框架层 - 核心功能
│   ├── config/            # 框架配置
│   ├── core/              # 核心组件
│   ├── renderer/          # UI渲染层
│   ├── launcher.js        # 框架启动器
│   └── package.json       # 框架依赖
├── apps/                  # 🚀 应用层 - 具体应用
│   ├── chess-game/        # 示例应用：国际象棋
│   └── game-time-manager/ # 示例应用：游戏时间管理
├── app.config.js          # 全局应用配置
└── scripts/               # 构建和启动脚本
```

## 🔧 框架核心功能

### 1. 统一AI代理系统

**核心代理 (`framework/core/core-agent.js`)**
- 🤖 **多模型支持**: OpenAI GPT、Google Gemini、Anthropic Claude
- 🔄 **流式响应**: 实时AI响应生成
- 📝 **上下文管理**: 智能对话状态跟踪
- 🎯 **提示词注入**: 动态系统提示词加载

**AI客户端工厂 (`framework/core/ai-client-factory.js`)**
- 🏭 **统一接口**: 多AI提供商的统一调用接口
- ⚙️ **配置管理**: 模型参数和API密钥管理
- 🔧 **错误处理**: 自动重试和降级机制

### 2. 应用管理系统

**应用管理器 (`framework/core/app-manager.js`)**
- 📦 **动态加载**: 运行时加载应用配置和资源
- 🔄 **生命周期**: 应用启动、运行、关闭管理
- 📋 **配置注入**: 自动加载应用特定配置
- 🔗 **依赖管理**: MCP动作和提示词自动注册

### 3. MCP协议执行器

**MCP执行器 (`framework/core/mcp-executor.js`)**
- 🎮 **系统控制**: 30+系统功能（文件、进程、网络等）
- 🌐 **Chrome集成**: 浏览器控制和监控
- 🔒 **权限管理**: 基于角色的功能访问控制
- 📊 **调用跟踪**: 完整的MCP调用日志和监控

### 4. 自适应UI系统

**渲染引擎 (`framework/renderer/`)**
- 🎨 **Svelte组件**: 响应式UI框架
- 📱 **自适应卡片**: Microsoft Adaptive Cards支持
- 💬 **对话界面**: 流式对话窗口
- 🎯 **动态界面**: AI生成的上下文相关UI

**核心UI组件**
- `App.svelte`: 主应用容器
- `components/AdaptiveCardPanel.svelte`: 自适应卡片渲染
- `components/ChatWindow.svelte`: 对话交互界面

### 5. 日志和监控系统

**日志系统 (`framework/core/logger.js`)**
- 📝 **多级别日志**: DEBUG、INFO、WARN、ERROR
- 📁 **文件轮转**: 自动日志文件管理
- 🔍 **结构化日志**: JSON格式的结构化输出
- 📊 **性能监控**: 应用性能指标收集

## 🚀 使用框架创建新应用

### 步骤1: 创建应用目录结构

```bash
# 在apps目录下创建新应用
mkdir apps/my-new-app
cd apps/my-new-app

# 创建必要的目录
mkdir mcp-actions
mkdir logs
```

### 步骤2: 创建应用配置文件

创建 `apps/my-new-app/config.js`:

```javascript
const path = require('path');

module.exports = {
  // 应用元数据
  appName: '我的新应用',
  version: '1.0.0',
     description: '基于AgentForge框架的新应用',

  // 窗口配置
  window: {
    defaultWidth: 1200,
    defaultHeight: 800,
    minimizeToTray: false,
    resizable: true,
    enableDevTools: true,
    uiPath: path.join(__dirname, '../../framework/renderer/index.html')
  },

  // AI代理配置
  agent: {
    model: 'gpt-4o-mini',           // 使用的AI模型
    temperature: 0.7,               // 创造性参数
    maxTokens: 8192,               // 最大令牌数
    maxHistoryMessages: 50,         // 历史消息数量
    promptFile: 'my-new-app-prompt.md',  // 提示词文件
    
    // 应用初始变量
    initialVariables: {
      state: 'idle',                // 应用状态
      user_name: '',               // 用户名
      // 添加应用特定的变量...
    }
  },

  // 应用特定设置
  appSettings: {
    // 添加应用特定配置...
  }
};
```

### 步骤3: 创建应用提示词

创建 `apps/my-new-app/my-new-app-prompt.md`:

```markdown
# 我的新应用 - AI助手

你是一个专业的应用助手，帮助用户使用"我的新应用"。

## 应用功能
- 功能1: 描述应用的主要功能
- 功能2: 描述应用的次要功能
- 功能3: 其他功能

## 状态管理
当前状态: {{state}}

可用状态:
- idle: 空闲状态
- working: 工作状态
- error: 错误状态

## 用户交互
- 始终使用友好、专业的语气
- 提供清晰的操作指导
- 在需要时生成适当的自适应卡片UI

## 自适应卡片
根据用户需求生成相应的UI卡片，包括：
- 操作按钮
- 信息展示
- 输入表单
- 状态指示器

## MCP功能调用
可以调用以下MCP功能：
- my_custom_action: 执行自定义操作
- 其他应用特定的MCP功能...
```

### 步骤4: 创建MCP动作

创建 `apps/my-new-app/mcp-actions/my-custom-action.js`:

```javascript
const { logger } = require('../../../framework/core/logger');

/**
 * 自定义MCP动作示例
 */
module.exports = {
  name: 'my_custom_action',
  description: '执行自定义操作',
  
  // 参数定义
  inputSchema: {
    type: 'object',
    properties: {
      action_type: {
        type: 'string',
        description: '操作类型'
      },
      parameters: {
        type: 'object',
        description: '操作参数'
      }
    },
    required: ['action_type']
  },

  // 动作处理函数
  handler: async (params, context) => {
    try {
      logger.info('执行自定义动作', { params });
      
      const { action_type, parameters = {} } = params;
      
      // 根据action_type执行不同的操作
      switch (action_type) {
        case 'hello':
          return {
            success: true,
            message: `你好，${parameters.name || '用户'}！`,
            data: { timestamp: new Date().toISOString() }
          };
          
        case 'process_data':
          // 处理数据的逻辑
          const result = await processData(parameters);
          return {
            success: true,
            message: '数据处理完成',
            data: result
          };
          
        default:
          return {
            success: false,
            error: `未知的操作类型: ${action_type}`
          };
      }
    } catch (error) {
      logger.error('自定义动作执行失败', { error: error.message, params });
      return {
        success: false,
        error: error.message
      };
    }
  }
};

// 辅助函数
async function processData(parameters) {
  // 实现数据处理逻辑
  return {
    processed: true,
    input: parameters,
    timestamp: new Date().toISOString()
  };
}
```

### 步骤5: 启动应用

```bash
# 启动特定应用
node scripts/start-app.js my-new-app

# 或者修改app.config.js中的defaultApp
# 然后使用: npm start
```

## 📋 框架配置说明

### 全局配置 (`app.config.js`)

```javascript
module.exports = {
  // 默认启动的应用
  defaultApp: "my-new-app",
  
  // AI模型配置 (框架级别)
  ai: {
    orchestrator: "gemini-2.0-flash-exp",  // 主要AI模型
    education: "gpt-4o-mini",              // 教育相关模型
    ui: "gpt-4o-mini"                      // UI生成模型
  },
  
  // 窗口默认配置
  window: {
    width: 1200,
    height: 800,
    webSecurity: false
  },
  
  // 开发配置
  development: {
    enableDevTools: true,
    hotReload: true
  }
};
```

### 框架配置 (`framework/config/framework-config.js`)

```javascript
module.exports = {
  // 日志配置
  logging: {
    level: 'info',
    file: 'logs/framework.log',
    maxSize: '10MB',
    maxFiles: 5
  },
  
  // MCP服务器配置
  mcp: {
    port: 3000,
    timeout: 30000,
    maxConcurrent: 10
  },
  
  // UI配置
  ui: {
    theme: 'default',
    animations: true,
    adaptiveCards: {
      version: '1.5'
    }
  }
};
```

## 🎯 示例应用

框架提供了两个完整的示例应用，展示了如何使用框架构建实际应用：

### 1. 国际象棋应用 (`apps/chess-game/`)

**应用特点**:
- 🎮 完整的国际象棋游戏逻辑
- 🤖 AI对手对弈
- 🎨 自定义棋盘渲染
- 📊 棋局分析和提示

**核心文件**:
- `config.js`: 象棋应用配置
- `chess-game-prompt.md`: 象棋AI助手提示词
- `mcp-actions/chess-renderer.js`: 棋盘渲染MCP动作

### 2. 游戏时间管理应用 (`apps/game-time-manager/`)

**应用特点**:
- ⏰ 儿童游戏时间监控
- 🌐 Chrome浏览器控制
- 👨‍👩‍👧‍👦 家长/儿童模式切换
- 📊 使用统计和报告

**核心文件**:
- `config.js`: 时间管理应用配置
- `game-time-manager-prompt.md`: 时间管理AI助手提示词
- `mcp-actions/`: 多个MCP动作
  - `chrome-controller.js`: 浏览器控制
  - `game-launcher.js`: 游戏启动器
  - `notification.js`: 系统通知
  - `system-monitor.js`: 系统监控

## 🛠️ 开发工具和脚本

### 可用脚本

```bash
# 开发相关
npm start                    # 启动默认应用
npm run dev                  # 构建Svelte组件(监听模式)
npm run dev:smart           # 智能开发模式(并发构建和启动)
npm run build               # 构建生产资源
npm run setup               # 项目初始化设置

# 应用管理
node scripts/start-app.js <app-name>  # 启动特定应用
node scripts/smart-build.js           # 智能构建

# 调试和测试
npm run debug               # 调试模式(启用Chrome DevTools)
```

### 开发最佳实践

1. **模块化设计**: 将功能拆分为独立的MCP动作
2. **配置驱动**: 使用配置文件而不是硬编码
3. **错误处理**: 在MCP动作中添加完善的错误处理
4. **日志记录**: 使用框架提供的日志系统
5. **状态管理**: 在提示词中明确定义状态机
6. **UI一致性**: 使用自适应卡片保持UI一致性

## 🚀 快速开始

### 环境要求

- Node.js 18+
- npm 或 yarn
- OpenAI API密钥（或其他AI提供商凭证）
- Chrome浏览器（用于浏览器控制功能）

### 安装步骤

1. **克隆仓库**
   ```bash
   git clone https://github.com/modenl/agentforge.git
   cd agentforge
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **环境配置**
   创建 `.env` 文件：
   ```env
   # OpenAI配置
   OPENAI_API_KEY=your_openai_api_key_here
   
   # Google AI配置（可选）
   GOOGLE_API_KEY=your_google_api_key_here
   
   # 应用配置
   NODE_ENV=development
   LOG_LEVEL=info
   ```

4. **运行示例应用**
   ```bash
   # 启动国际象棋应用
   node scripts/start-app.js chess-game
   
   # 启动游戏时间管理应用
   node scripts/start-app.js game-time-manager
   ```

## 🔒 安全特性

### 框架级安全
- **权限管理**: MCP动作的基于角色访问控制
- **API安全**: AI API密钥的安全管理
- **进程隔离**: 应用间的进程隔离
- **审计日志**: 完整的操作审计跟踪

### 应用级安全
- **状态验证**: 应用状态转换的验证
- **输入验证**: 用户输入的安全验证
- **资源限制**: 系统资源使用限制

## 🐛 故障排除

### 常见问题

**框架无法启动**
- 检查Node.js版本（需要18+）
- 确保所有依赖已安装：`npm install`
- 检查AI API密钥配置

**应用加载失败**
- 验证应用配置文件格式
- 检查提示词文件是否存在
- 查看应用日志文件

**MCP动作执行失败**
- 检查MCP动作的参数定义
- 验证权限配置
- 查看框架日志

### 调试工具

- **开发模式**: `npm run dev:smart`
- **调试模式**: `npm run debug`
- **日志查看**: 检查`logs/`目录下的日志文件
- **Chrome DevTools**: 在调试模式下可用

## 🤝 贡献指南

1. Fork 仓库
2. 创建功能分支：`git checkout -b feature/new-feature`
3. 开发新功能或修复bug
4. 添加适当的测试
5. 提交代码：`git commit -m "Add new feature"`
6. 推送到分支：`git push origin feature/new-feature`
7. 创建Pull Request

## 📄 许可证

本项目采用MIT许可证 - 详见LICENSE文件。

## 🆘 支持

如需支持和问题咨询：

- 在[GitHub](https://github.com/modenl/agentforge/issues)创建issue
- 查看故障排除部分
- 查阅框架文档和示例应用

## 🙏 致谢

- OpenAI、Google、Anthropic提供AI模型支持
- Microsoft提供Adaptive Cards框架
- Electron团队提供跨平台桌面应用框架
- Svelte团队提供响应式UI框架
