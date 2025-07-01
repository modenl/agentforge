# AgentForge 更新日志

## 2025-07-01 更新 (v3)

### 移除 experimental 配置依赖
- **移除了 experimental.embedding 配置依赖**：
  - 框架现在完全依赖 `get_embeddable_url` 工具的存在来检测 WebView 支持
  - 简化了 MCP 配置文件，不再需要 experimental 部分
  - 更新了所有相关文档和示例
  - 保持了向后兼容性，仅通过工具发现来启用功能

## 2025-07-01 更新 (v2)

### MCP WebView 支持简化
- **简化了 WebView 检测逻辑**：
  - 不再依赖服务器的 capabilities 声明
  - 直接检查是否存在 `get_embeddable_url` 工具
  - 如果工具存在，则认为服务器支持 WebView 嵌入
  
- **修复了 MCP 配置**：
  - 在 `apps/chess-game/mcp.json` 中添加了 experimental 配置
  - 确保配置文件包含正确的 embedding 设置
  
- **清理了调试日志**：
  - 移除了 INIT_DEBUG、CAPABILITY_DISCOVERY、WEBVIEW_DEBUG 等详细日志
  - 保留了必要的错误和警告日志

## 2025-07-01 更新

### UI 改进
- **优化了界面布局**：
  - 修复了右侧面板的背景色问题，现在空状态和卡片容器都使用透明背景，与面板背景色保持一致
  - 移除了空状态的白色边框和阴影，使界面更加简洁
  - 调整了空状态的图标和文字显示

### 代码重构
- **iframe → WebView 命名规范化**：
  - 将所有 `iframe` 相关的变量、方法和事件重命名为 `webview`，更准确地反映实际实现
  - 主要更改：
    - `supportsIframeEmbedding()` → `supportsWebviewEmbedding()`
    - `getIframeConfig()` → `getWebviewConfig()` 
    - `iframe_config` → `webview_config`
    - `server-iframe-available` → `server-webview-available`
  - 保持向后兼容，MCP 配置中仍支持 `features: ["iframe"]`

### Bug 修复
- **修复了 MCP UI 无法启动的问题**：
  - 修正了事件名称不匹配导致的 WebView 无法显示
  - 确保了事件流的一致性：MCP Manager → App Manager → Renderer

### 文档更新
- 更新了 MCP UI 扩展的描述，从"iframe嵌入模式"改为"WebView嵌入模式"
- 更新了相关示例代码和配置说明

### 技术细节
所有修改的文件：
- `framework/mcp/mcp-client.js`
- `framework/mcp/mcp-manager.js`
- `framework/core/app-manager.js`
- `framework/core/core-agent.js`
- `framework/renderer/preload.js`
- `framework/renderer/svelte/App.svelte`
- `framework/renderer/svelte/components/AdaptiveCardPanel.svelte`
- `framework/renderer/svelte/components/MCPView.svelte`
- `framework/mcp/builtin-tools/server-control.js`
- `apps/chess-game/chess-game-prompt.md`