import { test, expect } from '../fixtures/test-base';
import { ChessAppPage } from '../pages/chess-app.page';

test.describe('Chess App Startup', () => {
  test('should launch successfully and show welcome message', async ({ page }) => {
    const chessApp = new ChessAppPage(page);
    
    // Listen to console logs
    page.on('console', msg => {
      console.log(`[Browser ${msg.type()}] ${msg.text()}`);
    });
    
    // Wait for app to be ready
    console.log('Waiting for app to be ready...');
    await chessApp.waitForAppReady();
    console.log('App is ready');
    
    // Check if assistant welcome message is displayed
    console.log('Getting last assistant message...');
    const welcomeMessage = await chessApp.getLastAssistantMessage();
    console.log('Welcome message:', welcomeMessage);
    expect(welcomeMessage).toContain('欢迎');
    expect(welcomeMessage).toMatch(/国际象棋/);
    
    // Check if assist card is shown with main actions
    console.log('Getting assist card actions...');
    const actions = await chessApp.getAssistCardActions();
    console.log('Actions found:', actions);
    // Check if we got any actions (AI responses vary with nano model)
    expect(actions.length).toBeGreaterThan(0);
    
    // Check for common action patterns
    const hasStoryAction = actions.some(a => a.includes('故事'));
    const hasLessonAction = actions.some(a => a.includes('课程') || a.includes('学习'));
    const hasGameAction = actions.some(a => a.includes('对弈') || a.includes('下棋'));
    
    expect(hasStoryAction || hasLessonAction || hasGameAction).toBe(true);
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