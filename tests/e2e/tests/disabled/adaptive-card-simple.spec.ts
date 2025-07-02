import { test, expect } from '../fixtures/test-base';

test.describe('Simple Adaptive Card Test', () => {
  test('should check adaptive card initialization', async ({ electronApp, page }) => {
    // Capture all console logs
    page.on('console', msg => {
      console.log(`[Browser ${msg.type()}] ${msg.text()}`);
    });

    // Wait for chat window
    await page.waitForSelector('.chat-window', { timeout: 10000 });
    
    // Check AdaptiveCards library loading
    const checkResult = await page.evaluate(() => {
      // Check for AdaptiveCardPanel logs
      const logs = [];
      const originalLog = console.log;
      console.log = (...args) => {
        logs.push(args.join(' '));
        originalLog(...args);
      };
      
      // Wait a bit and collect info
      return new Promise((resolve) => {
        setTimeout(() => {
          const result = {
            hasAdaptiveCards: typeof window['AdaptiveCards'] !== 'undefined',
            panels: document.querySelectorAll('.adaptive-card-panel').length,
            globalCards: document.querySelectorAll('.global-card-container').length,
            logs: logs.filter(log => log.includes('AdaptiveCard') || log.includes('adaptive'))
          };
          resolve(result);
        }, 2000);
      });
    });
    
    console.log('Check Result:', checkResult);
    
    // Send a message and wait
    await page.fill('input[placeholder="输入消息..."]', 'test');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(2000);
    
    // Check again after sending message
    const afterMessageResult = await page.evaluate(() => {
      return {
        panels: document.querySelectorAll('.adaptive-card-panel').length,
        cards: document.querySelectorAll('.adaptive-card').length,
        globalContainers: document.querySelectorAll('.global-card-container').length,
        rightPanelHTML: document.querySelector('.right-panel')?.innerHTML?.substring(0, 200)
      };
    });
    
    console.log('After Message Result:', afterMessageResult);
  });
});