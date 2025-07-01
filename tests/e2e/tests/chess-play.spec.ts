import { test, expect } from '../fixtures/test-base';
import { ChessAppPage } from '../pages/chess-app.page';

test.describe('Chess Playing Features', () => {
  test('should start a new chess game', async ({ page }) => {
    const chessApp = new ChessAppPage(page);
    await chessApp.waitForAppReady();
    
    // Start new game
    await chessApp.startNewGame();
    
    // Check if game setup is initiated
    const response = await chessApp.getLastAssistantMessage();
    expect(response).toMatch(/开始|游戏|对局|白棋|执白/);
    
    // Verify chess board is loaded
    const isBoardVisible = await chessApp.isChessBoardVisible();
    expect(isBoardVisible).toBeTruthy();
  });

  test('should allow ELO rating configuration', async ({ page }) => {
    const chessApp = new ChessAppPage(page);
    await chessApp.waitForAppReady();
    
    // Request to play with specific ELO
    await chessApp.sendMessage('我要下棋，设置AI棋力为1200');
    
    // Check if AI acknowledges the ELO setting
    const response = await chessApp.getLastAssistantMessage();
    expect(response).toMatch(/1200|棋力|设置/);
    
    // Verify game starts with configured settings
    await chessApp.waitForWebView();
    const isBoardVisible = await chessApp.isChessBoardVisible();
    expect(isBoardVisible).toBeTruthy();
  });

  test('should provide different difficulty levels', async ({ page }) => {
    const chessApp = new ChessAppPage(page);
    await chessApp.waitForAppReady();
    
    // Ask about difficulty levels
    await chessApp.sendMessage('有哪些难度可以选择？');
    
    // Check if AI explains difficulty options
    const response = await chessApp.getLastAssistantMessage();
    expect(response).toMatch(/初级|中级|高级|大师|ELO|棋力/);
    
    // Check if assist card shows difficulty options
    const actions = await chessApp.getAssistCardActions();
    const hasDifficultyOptions = actions.some(action => 
      action.includes('初级') || 
      action.includes('中级') || 
      action.includes('高级') || 
      action.includes('设置')
    );
    
    // Should provide some way to select difficulty
    expect(hasDifficultyOptions || response.includes('ELO')).toBeTruthy();
  });

  test('should handle game moves and provide assistance', async ({ page }) => {
    const chessApp = new ChessAppPage(page);
    await chessApp.waitForAppReady();
    
    // Start a game
    await chessApp.startNewGame();
    
    // Ask for move suggestion
    await chessApp.sendMessage('推荐一个开局走法');
    
    // Check if AI provides chess advice
    const response = await chessApp.getLastAssistantMessage();
    expect(response).toMatch(/e4|d4|Nf3|开局|王兵|后兵/);
    
    // Check if assist card provides move options
    const actions = await chessApp.getAssistCardActions();
    const hasMoveOptions = actions.some(action => 
      action.includes('走') || 
      action.includes('移动') || 
      action.includes('e4') ||
      action.includes('提示')
    );
    
    // Should provide some form of game assistance
    expect(response.length).toBeGreaterThan(20);
  });

  test('should allow switching between player colors', async ({ page }) => {
    const chessApp = new ChessAppPage(page);
    await chessApp.waitForAppReady();
    
    // Request to play as black
    await chessApp.sendMessage('我想执黑棋');
    
    // Check if AI acknowledges color choice
    const response = await chessApp.getLastAssistantMessage();
    expect(response).toMatch(/黑棋|执黑|AI.*白/);
    
    // Start the game
    if (await chessApp.isChessBoardVisible() === false) {
      const actions = await chessApp.getAssistCardActions();
      const startAction = actions.find(a => a.includes('开始') || a.includes('确认'));
      if (startAction) {
        await chessApp.clickAssistCardAction(startAction);
      }
    }
    
    // Verify game starts with player as black
    await page.waitForTimeout(2000); // Give time for setup
    const messages = await chessApp.getAllMessages();
    const setupMessage = messages.find(m => 
      m.role === 'assistant' && 
      (m.content.includes('黑棋') || m.content.includes('白棋先走'))
    );
    expect(setupMessage).toBeTruthy();
  });
});