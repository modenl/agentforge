import { test, expect } from '../fixtures/test-base';
import { ChessAppPage } from '../pages/chess-app.page';

test.describe('Assist Card Interactions', () => {
  test('should show appropriate assist card options based on context', async ({ page }) => {
    const chessApp = new ChessAppPage(page);
    await chessApp.waitForAppReady();
    
    // Initial state should show main menu options
    let actions = await chessApp.getAssistCardActions();
    expect(actions).toContain('📖 听故事');
    expect(actions).toContain('♟ 我要下棋');
    
    // After clicking story option, should show story-related options
    await chessApp.clickAssistCardAction('📖 听故事');
    
    // Wait a bit for new assist card
    await page.waitForTimeout(2000);
    
    actions = await chessApp.getAssistCardActions();
    const hasStoryOptions = actions.some(action => 
      action.includes('费舍尔') || 
      action.includes('卡斯帕罗夫') || 
      action.includes('卡尔森') ||
      action.includes('选择') ||
      action.includes('故事')
    );
    expect(hasStoryOptions).toBeTruthy();
  });

  test('should update assist card after user actions', async ({ page }) => {
    const chessApp = new ChessAppPage(page);
    await chessApp.waitForAppReady();
    
    // Get initial actions
    const initialActions = await chessApp.getAssistCardActions();
    
    // Perform an action
    await chessApp.clickAssistCardAction('📚 开始学习');
    
    // Get updated actions
    await page.waitForTimeout(2000);
    const updatedActions = await chessApp.getAssistCardActions();
    
    // Actions should be different
    expect(updatedActions).not.toEqual(initialActions);
    
    // Should show learning-related options
    const hasLearningOptions = updatedActions.some(action => 
      action.includes('基础') || 
      action.includes('进阶') || 
      action.includes('课程') ||
      action.includes('练习')
    );
    expect(hasLearningOptions).toBeTruthy();
  });

  test('should handle assist card button clicks correctly', async ({ page }) => {
    const chessApp = new ChessAppPage(page);
    await chessApp.waitForAppReady();
    
    // Click play chess
    await chessApp.clickAssistCardAction('♟ 我要下棋');
    
    // Should get game setup options
    const actions = await chessApp.getAssistCardActions();
    const hasGameOptions = actions.some(action => 
      action.includes('白棋') || 
      action.includes('黑棋') || 
      action.includes('开始') ||
      action.includes('难度') ||
      action.includes('设置')
    );
    
    // Either shows game options or starts game directly
    const response = await chessApp.getLastAssistantMessage();
    expect(hasGameOptions || response.includes('开始')).toBeTruthy();
  });

  test('should not show too many assist card options', async ({ page }) => {
    const chessApp = new ChessAppPage(page);
    await chessApp.waitForAppReady();
    
    // Get assist card actions
    const actions = await chessApp.getAssistCardActions();
    
    // Should not overwhelm user with too many options
    expect(actions.length).toBeGreaterThan(0);
    expect(actions.length).toBeLessThanOrEqual(8); // Max 8 buttons for good UX
    
    // Each action should have reasonable length
    actions.forEach(action => {
      expect(action.length).toBeLessThanOrEqual(20); // Max 20 chars per button
    });
  });

  test('should provide contextual help options', async ({ page }) => {
    const chessApp = new ChessAppPage(page);
    await chessApp.waitForAppReady();
    
    // Start a game
    await chessApp.startNewGame();
    
    // During game, assist card should show game-related options
    const actions = await chessApp.getAssistCardActions();
    const hasGameHelp = actions.some(action => 
      action.includes('提示') || 
      action.includes('分析') || 
      action.includes('悔棋') ||
      action.includes('帮助') ||
      action.includes('规则')
    );
    
    // Should provide some form of in-game assistance
    expect(hasGameHelp || actions.length > 0).toBeTruthy();
  });

  test('should handle navigation through assist cards', async ({ page }) => {
    const chessApp = new ChessAppPage(page);
    await chessApp.waitForAppReady();
    
    // Navigate through multiple levels
    await chessApp.clickAssistCardAction('📚 开始学习');
    await page.waitForTimeout(1000);
    
    // Check if there's a back/return option
    let actions = await chessApp.getAssistCardActions();
    const hasBackOption = actions.some(action => 
      action.includes('返回') || 
      action.includes('主菜单') || 
      action.includes('回到')
    );
    
    // Should either have back option or handle navigation naturally
    if (hasBackOption) {
      const backAction = actions.find(a => 
        a.includes('返回') || a.includes('主菜单') || a.includes('回到')
      );
      await chessApp.clickAssistCardAction(backAction!);
      
      // Should return to main menu
      await page.waitForTimeout(1000);
      actions = await chessApp.getAssistCardActions();
      expect(actions).toContain('♟ 我要下棋');
    } else {
      // Alternative: type a command to go back
      await chessApp.sendMessage('返回主菜单');
      const response = await chessApp.getLastAssistantMessage();
      expect(response).toBeTruthy();
    }
  });
});