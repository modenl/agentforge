# AgentForge E2E Tests

使用 Playwright 实现的端到端测试套件，用于测试 AgentForge 应用的核心功能。

## 🚀 快速开始

### 安装依赖

```bash
# 从项目根目录运行
npm run test:e2e:install
```

### 运行测试

```bash
# 运行所有测试（无头模式）
npm run test:e2e

# 运行测试（有头模式，可以看到浏览器）
npm run test:e2e:headed

# 调试模式运行
npm run test:e2e:debug

# 使用 Playwright UI 运行
cd tests/e2e && npm run test:ui
```

## 📋 测试覆盖

### 1. 应用启动测试 (`app-startup.spec.ts`)
- ✅ 应用成功启动
- ✅ 显示欢迎消息
- ✅ 显示正确的 Assist Card 选项
- ✅ 响应用户消息
- ✅ 使用测试环境配置（gpt-4o-mini）

### 2. 棋局回放测试 (`chess-replay.spec.ts`)
- ✅ 能够选择经典棋局
- ✅ 加载并显示棋局回放
- ✅ 提供棋局解说

### 3. 下棋功能测试 (`chess-play.spec.ts`)
- ✅ 开始新游戏
- ✅ ELO 等级设置
- ✅ 难度级别选择
- ✅ 走棋建议和帮助
- ✅ 切换黑白棋

### 4. Assist Card 交互测试 (`assist-card.spec.ts`)
- ✅ 根据上下文显示合适的选项
- ✅ 用户操作后更新卡片
- ✅ 按钮点击处理
- ✅ 选项数量合理（不超过8个）
- ✅ 提供上下文相关的帮助
- ✅ 导航功能

## 🔧 测试环境配置

测试使用独立的环境配置，与生产环境隔离：

- **AI 模型**: `gpt-4o-mini`（更便宜的测试模型）
- **数据存储**: `tests/e2e/test-data/`（独立的测试数据目录）
- **日志**: `tests/e2e/test-logs/`（独立的测试日志目录）

### 环境变量

在 `tests/e2e/.env.test` 中配置：

```env
NODE_ENV=test
OPENAI_MODEL=gpt-4o-mini
OPENAI_API_KEY=your_test_api_key_here
TEST_DATA_DIR=./test-data
TEST_LOGS_DIR=./test-logs
DISABLE_AUTO_UPDATE=true
DISABLE_ANALYTICS=true
```

## 🏗️ 测试架构

### Page Object 模式

使用 Page Object 模式封装页面交互逻辑：

```typescript
// pages/chess-app.page.ts
export class ChessAppPage {
  // 定位器
  readonly chatInput: Locator;
  readonly assistCard: Locator;
  
  // 交互方法
  async sendMessage(message: string) { }
  async clickAssistCardAction(actionText: string) { }
  async waitForAssistantResponse() { }
}
```

### 测试基础设施

```typescript
// fixtures/test-base.ts
export const test = base.extend<{
  electronApp: ElectronApplication;
  page: Page;
}>({
  // Electron 应用启动配置
  // 测试环境设置
});
```

## 📊 测试报告

测试完成后，可以查看详细的测试报告：

```bash
# 查看 HTML 报告
cd tests/e2e && npm run test:report
```

测试结果保存在：
- `tests/e2e/test-results/` - 测试结果和截图
- `tests/e2e/playwright-report/` - HTML 测试报告

## 🔍 调试技巧

1. **使用调试模式**：
   ```bash
   npm run test:e2e:debug
   ```

2. **单独运行某个测试**：
   ```bash
   cd tests/e2e
   npx playwright test tests/app-startup.spec.ts
   ```

3. **查看测试录像**：
   测试失败时会自动录制视频，保存在 `test-results/` 目录

4. **使用 Playwright Inspector**：
   调试模式会启动 Playwright Inspector，可以逐步执行测试

## 🚧 已知限制

1. **WebView 测试**: Electron 中的 WebView 测试有一定限制，某些交互可能需要特殊处理
2. **AI 响应时间**: 即使使用 gpt-4o-mini，AI 响应仍需要一定时间，测试中设置了合理的超时
3. **并发测试**: 由于应用的单例特性，建议串行运行测试

## 🤝 贡献指南

添加新测试时，请遵循以下原则：

1. 使用 Page Object 模式封装页面交互
2. 测试应该独立，不依赖其他测试的执行顺序
3. 使用描述性的测试名称
4. 添加适当的等待和重试机制
5. 在测试失败时提供有用的错误信息

## 📝 维护说明

- 定期更新 Playwright 版本以获得最新功能和修复
- 根据应用功能变化更新测试用例
- 监控测试执行时间，优化慢速测试
- 定期清理测试数据目录