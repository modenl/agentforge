# Chrome DevTools Protocol (CDP) 集成

## 概述

本项目现在使用 Chrome DevTools Protocol (CDP)来实现跨平台的 Chrome 浏览器控制，
这是一个统一的、可靠的与 Chrome 通信的方案。

## 特性

### ✅ 跨平台支持

- Windows
- macOS
- Linux

### ✅ 核心功能

- **游戏启动**: 启动 Chrome 并打开指定 URL（游戏网站）
- **标签页管理**: 列出、激活、关闭特定标签页
- **JavaScript 执行**: 在标签页中执行任意 JavaScript 代码
- **状态跟踪**: 跟踪标签页 ID、进程 ID 等状态信息

### ✅ 智能 Chrome 管理

- 检测现有 Chrome 实例
- 复用现有 Chrome 或启动新实例
- 使用独立的用户数据目录避免冲突
- 支持调试端口配置

## 架构

```
CoreAgent → MCPServer → ChromeController → Chrome DevTools Protocol → Chrome Browser
```

### 组件说明

1. **ChromeController** (`src/main/chrome-controller.js`)

   - 核心 Chrome 控制逻辑
   - 使用`chrome-remote-interface`库
   - 处理 Chrome 进程生命周期

2. **MCPServer** (`src/main/mcp-server.js`)
   - 集成 ChromeController
   - 提供 MCP 动作接口
   - 权限验证和参数校验

## API 方法

### 启动游戏

```javascript
await mcpServer.launch_game(
  {
    game_id: 'bloxd',
    args: ['https://bloxd.io/']
  },
  'Agent'
);
```

### 关闭游戏

```javascript
await mcpServer.close_game(
  {
    game_id: 'bloxd',
    tab_id: 'TAB_ID_HERE'
  },
  'Agent'
);
```

### 列出 Chrome 标签页

```javascript
await mcpServer.list_chrome_tabs({}, 'Agent');
```

### 激活标签页

```javascript
await mcpServer.activate_chrome_tab(
  {
    tab_id: 'TAB_ID_HERE'
  },
  'Agent'
);
```

### 在 Chrome 中执行 JavaScript

```javascript
await mcpServer.evaluate_in_chrome(
  {
    expression: 'window.location.href'
  },
  'Agent'
);
```

## 配置

### Chrome 启动参数

```javascript
const chromeArgs = [
  '--remote-debugging-port=PORT',
  '--disable-web-security',
  '--disable-gpu',
  '--no-sandbox',
  '--disable-dev-shm-usage'
  // ... 其他优化参数
];
```

### 调试端口

- 默认: 9222
- 可通过`debugPort`选项自定义
- 每个实例使用独立端口避免冲突

## 优势

### 🎯 相比之前的方案

1. **统一接口**: 不需要特殊处理不同平台
2. **精确控制**: 可以控制特定标签页而非整个 Chrome 进程
3. **实时交互**: 可以执行 JavaScript 获取页面状态
4. **稳定性高**: 基于 Chrome 官方调试协议

### 🔧 技术优势

1. **协议标准化**: Chrome DevTools Protocol 是 Chrome 官方协议
2. **跨版本兼容**: 协议向后兼容性好
3. **功能丰富**: 支持页面控制、网络监控、性能分析等
4. **生态完善**: 有 Puppeteer 等高级库支持

## 使用示例

### 基本游戏控制流程

```javascript
// 1. 启动游戏
const gameInfo = await chromeController.launchGame('https://bloxd.io/');

// 2. 等待游戏加载
await new Promise(resolve => setTimeout(resolve, 3000));

// 3. 检查游戏状态
const result = await chromeController.evaluateInTab('document.title');

// 4. 关闭游戏
await chromeController.closeGame(gameInfo.tabId);
```

### 多标签页管理

```javascript
// 列出所有标签页
const tabs = await chromeController.listTabs();

// 查找游戏标签页
const gameTab = tabs.find(
  tab => tab.url.includes('bloxd.io') || tab.title.includes('Bloxd')
);

// 激活游戏标签页
if (gameTab) {
  await chromeController.activateTab(gameTab.id);
}
```

## 测试

### 运行测试

```bash
# 基础Chrome功能测试
node test-chrome-simple.js

# 完整Chrome控制器测试
node test-chrome-controller.js
```

### 测试覆盖

- ✅ Chrome 进程启动/终止
- ✅ CDP 连接建立
- ✅ 标签页创建/关闭
- ✅ JavaScript 执行
- ✅ 错误处理

## 依赖

### NPM 包

```json
{
  "chrome-remote-interface": "^0.33.3"
}
```

### 系统要求

- Chrome/Chromium 浏览器
- Node.js 14+
- 网络连接（用于访问游戏网站）

## 故障排除

### 常见问题

1. **连接被拒绝**

   - 确保 Chrome 已启动且调试端口可用
   - 检查防火墙设置
   - 验证端口未被占用

2. **Chrome 启动失败**

   - 确保 Chrome 已正确安装
   - 检查 Chrome 路径配置
   - 查看错误日志

3. **标签页操作失败**
   - 验证标签页 ID 有效性
   - 确保标签页未被用户手动关闭
   - 检查 CDP 连接状态

### 调试选项

```javascript
// 启用详细日志
const logger = require('./src/main/logger');
logger.level = 'debug';

// 使用非headless模式查看Chrome
// 移除 '--headless' 参数
```

## 未来扩展

### 可能的增强

1. **页面性能监控**: 监控游戏页面的 CPU/内存使用
2. **网络流量分析**: 分析游戏的网络请求
3. **自动化交互**: 基于页面元素的自动化操作
4. **多实例管理**: 同时管理多个游戏会话
5. **浏览器扩展集成**: 开发专用 Chrome 扩展

### 集成其他浏览器

- Firefox (通过 Marionette 协议)
- Edge (通过 DevTools Protocol)
- Safari (通过 WebKit Remote Debugging)

---

> 💡 **提示**: Chrome DevTools Protocol 是功能强大的底层协议，建议在复杂场景中考
> 虑使用 Puppeteer 等高级库来简化开发。
