# AgentForge

一个基于LLM+Prompt+MCP的智能代理应用开发框架，提供统一的AI代理架构、自适应UI和系统集成能力，让开发者可以快速构建各种智能桌面应用。

![AI Chess Game 示例界面](docs/Screenshot%202025-06-30%20at%204.50.05%E2%80%AFPM.png)

> 上图为基于AgentForge开发的国际象棋AI教学系统实际界面，支持自然语言对弈、AI提示与动态UI。

---

## 📚 目录

- [核心思想：未来软件架构](#-核心思想未来软件架构)
- [架构优势](#-架构优势)
- [GUI革新：重新定义用户界面](#-gui革新重新定义用户界面)  
- [未来展望](#-未来展望)
- [框架架构](#-框架架构)
- [框架核心功能](#-框架核心功能)
- [使用框架创建新应用](#-使用框架创建新应用)
- [框架配置说明](#-框架配置说明)
- [示例应用](#-示例应用)
- [开发工具和脚本](#-开发工具和脚本)
- [开发最佳实践](#开发最佳实践)
- [快速开始](#-快速开始)
- [安全特性](#-安全特性)
- [故障排除](#-故障排除)
- [贡献指南](#-贡献指南)
- [许可证](#-许可证)
- [支持](#-支持)
- [最新更新](#-最新更新)
- [致谢](#-致谢)

---

## 💡 核心思想：未来软件架构

AgentForge 基于一个革命性的软件架构理念：

### **未来软件架构 = LLM（OS）+ Prompt（Pure Logic）+ MCP（Side Effect）**

这个架构模式重新定义了软件的组成和运行方式：

#### 🧠 LLM 作为操作系统 (LLM as OS)
- **智能内核**: LLM充当软件的"大脑"，处理理解、推理和决策
- **统一接口**: 通过自然语言提供统一的人机交互界面
- **上下文管理**: 自动维护对话状态和应用上下文
- **动态适应**: 根据用户需求和环境变化自适应调整行为

```
传统架构: 用户 → UI → 业务逻辑 → 数据层
AgentForge: 用户 → LLM → Prompt逻辑 → MCP执行
```

#### 📝 Prompt 作为纯逻辑 (Prompt as Pure Logic)
- **声明式编程**: 用自然语言描述"做什么"而不是"怎么做"
- **业务逻辑分离**: 将复杂的业务规则和流程用Prompt表达
- **可读性极强**: 非技术人员也能理解和修改业务逻辑
- **版本控制友好**: Prompt文件可以像代码一样进行版本管理

```markdown
# 传统代码
if (user.role === 'admin' && time > workHours) {
  return showAdminPanel();
} else if (user.hasPermission('read')) {
  return showReadOnlyView();
}

# Prompt逻辑
当用户是管理员且在工作时间外时，显示管理面板
当用户有读取权限时，显示只读视图
根据用户权限和时间自动调整界面
```

#### ⚡ MCP 作为副作用 (MCP as Side Effect)
- **Model Context Protocol**: 基于Anthropic的MCP标准，实现工具调用和UI扩展
- **副作用隔离**: 所有系统交互（文件操作、网络请求、UI生成）通过MCP工具执行
- **动态加载**: MCP服务器按需启动，支持延迟加载和状态机管理
- **工具命名空间**: 工具自动添加服务器前缀 `mcp_servername_toolname`
- **UI扩展能力**: MCP服务器可以提供独立的WebView UI，无缝集成到主界面

```javascript
// MCP工具配置示例 (mcp.json)
{
  "servers": {
    "chess-trainer-mcp": {
      "command": "node",
      "args": ["../apps/chess-game/mcp-server.js"],
      "experimental": {
        "embedding": {
          "enabled": true,
          "features": ["webview"],
          "port": 3456
        }
      }
    }
  }
}

// AI调用MCP工具的响应格式
{
  "message": "我已经设置好棋盘，您执白棋先行。",
  "mcp_tools": [
    {
      "action": "mcp_chess-trainer-mcp_setup_game",
      "parameters": {
        "mode": "human_vs_ai",
        "player_color": "white"
      }
    }
  ],
  "webview_config": {
    "url": "http://localhost:3456/game",
    "title": "Chess Game"
  }
}
```

### 🎯 架构优势

#### 1. **开发效率革命**
- **自然语言编程**: 用Prompt描述业务逻辑，大幅降低编程门槛
- **快速原型**: 几分钟内就能创建功能完整的应用原型
- **迭代速度**: 修改Prompt即可调整应用行为，无需重新编译

#### 2. **维护性提升**
- **逻辑清晰**: Prompt文件直观表达业务需求
- **模块化**: LLM、Prompt、MCP各司其职，职责分离
- **可扩展**: 新功能只需添加新的Prompt和MCP函数

#### 3. **用户体验革新**
- **智能交互**: 用户可以用自然语言与应用交互
- **个性化**: LLM能够理解用户意图并提供个性化响应
- **自适应UI**: 界面根据对话上下文动态生成
- **即时GUI**: Just-in-Time GUI生成，按需创建，用后即销毁
- **MCP UI扩展**: MCP服务器可以拥有独立UI，无缝集成到主对话界面

#### 4. **技术栈简化**
```
传统架构层次:
前端框架 → 路由 → 状态管理 → API层 → 业务逻辑 → 数据访问 → 数据库

AgentForge架构:
LLM → Prompt → MCP → 系统资源
```

### 🎨 GUI革新：重新定义用户界面

AgentForge 引入了两个突破性的GUI概念，彻底改变了传统的用户界面设计：

#### 1. **Just-in-Time GUI (即时GUI)**

**核心理念**: GUI的本质是自然语言的快捷方式

```
传统GUI: 预设计 → 静态界面 → 固定交互
即时GUI: 需求驱动 → 动态生成 → 用后即销毁
```

**特性**:
- **按需生成**: 只有在需要时才创建GUI组件
- **上下文相关**: 根据当前对话状态生成最适合的界面
- **即用即销**: 完成任务后自动销毁，不占用系统资源
- **自然语言等价**: 每个GUI操作都有对应的自然语言表达

**实际示例**:
```
用户: "我想看看当前的象棋局面"
系统: 动态生成棋盘UI → 用户查看/操作 → 对话继续 → UI自动销毁

用户: "帮我设置一个30分钟的游戏时间"
系统: 生成时间设置界面 → 用户确认 → 界面消失 → 返回对话
```

#### 2. **MCP UI扩展：WebView界面集成**

**核心理念**: MCP服务器可以提供独立的Web界面，通过WebView无缝集成到主应用界面

**两种UI模式**:
1. **Adaptive Card模式**: 通过返回AdaptiveCard JSON生成轻量级UI组件
2. **WebView嵌入模式**: MCP服务器运行独立Web服务，在WebView中展示完整界面

```javascript
// MCP服务器配置WebView支持
{
  "experimental": {
    "embedding": {
      "enabled": true,
      "features": ["webview"],  // 保持向后兼容
      "port": 3456  // UI服务端口
    }
  }
}

// MCP工具返回WebView配置
handler: async (params) => {
  // 启动或配置UI服务
  const gameUrl = await startGameUI(params);
  
  return {
    webview_config: {
      url: gameUrl,
      title: "Chess Game",
      preferredMode: "normal"  // normal, compact, mini, fullscreen
    }
  };
}

// 或返回Adaptive Card
handler: async (params) => {
  return {
    adaptive_card: {
      global: {  // 右侧面板显示的卡片
        type: "AdaptiveCard",
        body: [/* 游戏状态信息 */]
      },
      assist: {  // 输入框上方的快捷操作
        type: "AdaptiveCard",
        body: [/* 快捷按钮 */]
      }
    }
  };
}
```

**架构优势**:
- **模块化UI**: 每个MCP服务器管理自己的UI组件
- **插件式扩展**: 新的MCP服务器可以带来新的UI功能
- **统一集成**: 所有UI都集成在主对话窗口中
- **独立开发**: UI组件可以独立开发和测试

#### 3. **GUI设计新范式**

**传统GUI设计**:
```
设计师设计 → 开发者实现 → 用户适应 → 反馈迭代
```

**AgentForge GUI设计**:
```
用户表达需求 → LLM理解意图 → 动态生成UI → 即时反馈
```

**关键差异**:
- **需求驱动**: 界面由实际需求驱动，而不是预设计
- **智能适应**: AI理解用户意图，生成最适合的界面
- **零学习成本**: 用户无需学习复杂的界面操作
- **无限可能**: 理论上可以生成任何形式的界面

#### 4. **实现技术栈**

```
用户自然语言输入
       ↓
LLM理解和决策
       ↓
Prompt逻辑处理
       ↓
MCP函数调用 (包含UI生成)
       ↓
AdaptiveCard渲染
       ↓
即时GUI显示
       ↓
用户交互/完成任务
       ↓
GUI自动销毁
```

### 🔮 未来展望

这种架构模式代表了软件开发的未来趋势：

- **AI-First**: 以AI为核心的应用设计理念
- **No-Code/Low-Code**: 通过Prompt实现业务逻辑，降低技术门槛
- **人机协作**: 人类负责定义需求，AI负责实现和优化
- **自适应系统**: 应用能够根据使用情况自我学习和改进

## 🏗️ 框架架构

### 框架概述

AgentForge 是一个模块化的智能代理应用开发框架，分为**框架层**和**应用层**：

- **框架层 (Framework)**: 提供核心功能和基础设施
- **应用层 (Apps)**: 基于框架构建的具体应用

```
agentforge/
├── framework/              # 🔧 框架层 - 核心功能
│   ├── core/              # 核心组件
│   │   ├── app-manager.js # 应用生命周期管理
│   │   ├── core-agent.js  # AI代理核心
│   │   └── logger.js      # 日志系统
│   ├── mcp/               # MCP协议实现
│   │   ├── mcp-manager.js # MCP服务器管理
│   │   ├── mcp-client.js  # MCP客户端
│   │   ├── mcp-executor.js# MCP工具执行器
│   │   └── builtin-tools/ # 内置MCP工具
│   ├── renderer/          # UI渲染层
│   │   ├── svelte/        # Svelte组件
│   │   └── index.html     # 主界面模板
│   ├── launcher.js        # 框架启动器
│   └── package.json       # 框架依赖
├── apps/                  # 🚀 应用层 - 具体应用
│   ├── chess-game/        # 示例：AI国际象棋
│   │   ├── mcp.json       # MCP服务器配置
│   │   ├── prompt.md      # AI提示词
│   │   └── config.js      # 应用配置
│   └── game-time-manager/ # 示例：游戏时间管理
└── docs/                  # 📚 文档资源
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
- 🔗 **依赖管理**: MCP工具和提示词自动注册

### 3. MCP (Model Context Protocol) 系统

**MCP管理器 (`framework/mcp/mcp-manager.js`)**
- 🔌 **服务器管理**: 动态启动/停止MCP服务器
- 🔧 **工具发现**: 自动发现和注册MCP工具
- 🎯 **延迟加载**: 按需连接MCP服务器
- 🖼️ **UI集成**: 支持WebView嵌入式界面

**MCP执行器 (`framework/mcp/mcp-executor.js`)**
- ⚡ **工具执行**: 统一的MCP工具调用接口
- 🔒 **权限控制**: 基于配置的工具访问控制
- 📊 **结果处理**: 特殊格式（SVG、WebView）处理
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

# 基本文件结构
touch config.js         # 应用配置
touch prompt.md         # AI提示词
touch mcp.json          # MCP服务器配置（可选）
mkdir logs              # 日志目录
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

创建 `apps/my-new-app/prompt.md`:

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

### 步骤4: 配置MCP服务器（可选）

创建 `apps/my-new-app/mcp.json`:

```json
{
  "servers": {
    "my-app-mcp": {
      "command": "node",
      "args": ["./mcp-server.js"],
      "description": "我的应用MCP服务器",
      "experimental": {
        "embedding": {
          "enabled": true,
          "features": ["webview"],
          "port": 3457
        }
      }
    }
  }
}
```

然后创建 `apps/my-new-app/mcp-server.js`:

```javascript
const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');

/**
 * MCP服务器示例
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
- `mcp-tools/chess-renderer.js`: 棋盘渲染MCP工具

### 2. 游戏时间管理应用 (`apps/game-time-manager/`)

**应用特点**:
- ⏰ 儿童游戏时间监控
- 🌐 Chrome浏览器控制
- 👨‍👩‍👧‍👦 家长/儿童模式切换
- 📊 使用统计和报告

**核心文件**:
- `config.js`: 时间管理应用配置
- `game-time-manager-prompt.md`: 时间管理AI助手提示词
- `mcp-tools/`: 多个MCP工具
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

1. **模块化设计**: 将功能拆分为独立的MCP工具
2. **配置驱动**: 使用配置文件而不是硬编码
3. **错误处理**: 在MCP工具中添加完善的错误处理
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
- **权限管理**: MCP工具的基于角色访问控制
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

**MCP工具执行失败**
- 检查MCP工具的参数定义
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

## 📝 最新更新

查看 [CHANGELOG.md](./CHANGELOG.md) 了解最新的功能更新和修复。

**最近更新 (2025-07-01)**:
- 优化了 UI 布局，修复了右侧面板的显示问题
- 将所有 iframe 相关命名规范化为 webview
- 修复了 MCP UI 无法启动的问题
- 更新了相关文档

## 🙏 致谢

- OpenAI、Google、Anthropic提供AI模型支持
- Microsoft提供Adaptive Cards框架
- Electron团队提供跨平台桌面应用框架
- Svelte团队提供响应式UI框架
