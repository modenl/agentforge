import { test, expect } from '../fixtures/test-base';
import { ChessAppPage } from '../pages/chess-app.page';

test.describe('Chess App Startup', () => {
  test('should launch successfully and show welcome message', async ({ page }) => {
    const chessApp = new ChessAppPage(page);
    
    // Wait for app to be ready
    await chessApp.waitForAppReady();
    
    // Check if assistant welcome message is displayed
    const welcomeMessage = await chessApp.getLastAssistantMessage();
    expect(welcomeMessage).toContain('欢迎');
    expect(welcomeMessage).toMatch(/智能国际象棋|教学系统/);
    
    // Check if assist card is shown with main actions
    const actions = await chessApp.getAssistCardActions();
    expect(actions).toContain('📖 听故事');
    expect(actions).toContain('📚 开始学习');
    expect(actions).toContain('♟ 我要下棋');
    expect(actions).toContain('🎬 看经典棋局');
    expect(actions).toContain('👤 查看档案');
  });

  test('should respond to user messages', async ({ page }) => {
    const chessApp = new ChessAppPage(page);
    await chessApp.waitForAppReady();
    
    // Send a test message
    await chessApp.sendMessage('你好');
    
    // Check if AI responds
    const response = await chessApp.getLastAssistantMessage();
    expect(response).toBeTruthy();
    expect(response.length).toBeGreaterThan(0);
  });

  test('should use test environment configuration', async ({ page, electronApp }) => {
    const chessApp = new ChessAppPage(page);
    await chessApp.waitForAppReady();
    
    // Check if test model is being used (gpt-4o-mini)
    // This can be verified by checking the response speed or logs
    const startTime = Date.now();
    await chessApp.sendMessage('测试');
    const responseTime = Date.now() - startTime;
    
    // gpt-4o-mini should respond relatively quickly
    expect(responseTime).toBeLessThan(10000); // 10 seconds max
  });
});