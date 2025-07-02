# E2E 测试故障排除

## 常见问题

### 1. 测试卡住 (Stuck)

**症状**：运行 `npm run test:e2e` 后卡在 WebServer 启动

**解决方案**：
- 已经在 `playwright.config.ts` 中移除了 webServer 配置
- Electron 应用会在每个测试中直接启动

### 2. Electron 应用无法启动

**症状**：超时错误 "Timeout 30000ms exceeded while waiting for event 'window'"

**可能原因**：
1. **缺少 API Key**：确保在 `.env.test` 中设置了有效的 OPENAI_API_KEY
2. **依赖未安装**：确保主项目依赖已安装 (`npm install` 在根目录)
3. **Electron 二进制未安装**：运行 `npx electron --version` 检查

### 3. 临时解决方案

如果 Playwright + Electron 集成有问题，可以使用以下替代方案：

#### 方案 A：手动启动应用测试
```bash
# 1. 在一个终端启动应用
NODE_ENV=test OPENAI_MODEL=gpt-4o-mini npm start chess-game

# 2. 在另一个终端运行 Web 测试
# (需要修改测试以连接到运行中的应用)
```

#### 方案 B：使用 Puppeteer 测试
由于项目已经包含 Puppeteer，可以创建基于 Puppeteer 的测试

#### 方案 C：简化测试范围
专注于测试核心逻辑而不是完整的 E2E 流程

## 调试步骤

1. **检查 Electron 是否能启动**：
   ```bash
   npx electron framework/index.js apps/chess-game
   ```

2. **检查环境变量**：
   ```bash
   echo $OPENAI_API_KEY
   ```

3. **查看日志**：
   检查 `tests/e2e/test-logs/` 目录中的日志文件

4. **运行调试脚本**：
   ```bash
   cd tests/e2e
   node debug-electron.js
   ```

## 配置说明

### 必需的环境变量
- `OPENAI_API_KEY`: 有效的 OpenAI API 密钥
- `NODE_ENV`: 设置为 'test'
- `OPENAI_MODEL`: 使用 'gpt-4o-mini' 或 'gpt-4.1-nano'

### 目录结构
```
tests/e2e/
├── test-data/      # 测试数据（自动创建）
├── test-logs/      # 测试日志（自动创建）
├── test-results/   # 测试结果和截图
└── .env.test       # 环境配置（需要手动创建）
```

## 已知限制

1. **Playwright + Electron 集成**：在某些环境下可能不稳定
2. **API 调用延迟**：即使使用较小的模型，AI 响应仍需要时间
3. **WebView 测试**：Electron WebView 的自动化测试有一定限制

## 建议

对于稳定的 CI/CD，考虑：
1. 将 UI 测试和逻辑测试分离
2. 使用模拟的 AI 响应进行大部分测试
3. 只在关键路径上使用真实的 AI API