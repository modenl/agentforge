import { test, expect } from '../fixtures/test-base';
import { ChessAppPage } from '../pages/chess-app.page';

test.describe('Chess Game Replay', () => {
  test('should be able to replay classic games', async ({ page }) => {
    const chessApp = new ChessAppPage(page);
    await chessApp.waitForAppReady();
    
    // Request to watch classic games
    await chessApp.clickAssistCardAction('🎬 看经典棋局');
    
    // Check if AI provides game options
    const response = await chessApp.getLastAssistantMessage();
    expect(response).toMatch(/经典|棋局|选择/);
    
    // Check if assist card shows game options
    const actions = await chessApp.getAssistCardActions();
    const hasGameOptions = actions.some(action => 
      action.includes('费舍尔') || 
      action.includes('卡斯帕罗夫') || 
      action.includes('世纪之局')
    );
    expect(hasGameOptions).toBeTruthy();
  });

  test('should load and display game replay', async ({ page }) => {
    const chessApp = new ChessAppPage(page);
    await chessApp.waitForAppReady();
    
    // Navigate to classic games
    await chessApp.clickAssistCardAction('🎬 看经典棋局');
    
    // Select a specific game (if available in assist card)
    const actions = await chessApp.getAssistCardActions();
    const gameOption = actions.find(action => action.includes('世纪之局'));
    
    if (gameOption) {
      await chessApp.clickAssistCardAction(gameOption);
    } else {
      // Fallback: request specific game via message
      await chessApp.sendMessage('播放费舍尔的世纪之局');
    }
    
    // Check if replay is initiated
    const replayResponse = await chessApp.getLastAssistantMessage();
    expect(replayResponse).toMatch(/开始|播放|回放|棋局/);
    
    // Wait for chess board to appear
    await chessApp.waitForWebView();
    
    // Verify chess board is visible
    const isBoardVisible = await chessApp.isChessBoardVisible();
    expect(isBoardVisible).toBeTruthy();
  });

  test('should provide game commentary during replay', async ({ page }) => {
    const chessApp = new ChessAppPage(page);
    await chessApp.waitForAppReady();
    
    // Start a replay
    await chessApp.requestGameReplay('卡斯帕罗夫对战深蓝');
    
    // Check if AI provides context about the game
    const commentary = await chessApp.getLastAssistantMessage();
    expect(commentary).toMatch(/卡斯帕罗夫|深蓝|1997/);
    
    // Check if assist card offers replay controls
    const actions = await chessApp.getAssistCardActions();
    const hasReplayControls = actions.some(action => 
      action.includes('暂停') || 
      action.includes('继续') || 
      action.includes('分析')
    );
    
    // Should have some form of interaction available
    expect(actions.length).toBeGreaterThan(0);
  });
});