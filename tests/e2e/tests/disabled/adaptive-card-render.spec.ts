import { test, expect } from '../fixtures/test-base';

test.describe('Adaptive Card Rendering', () => {
  test('should render adaptive cards after initialization', async ({ electronApp, page }) => {
    // Capture all console logs
    const logs: string[] = [];
    page.on('console', msg => {
      const text = `[${msg.type()}] ${msg.text()}`;
      logs.push(text);
      console.log(text);
    });

    // Wait for app
    await page.waitForSelector('.chat-window', { timeout: 15000 });
    
    // Wait for initialization to complete
    await page.waitForTimeout(3000);
    
    // Check what's in the DOM
    const domState = await page.evaluate(() => {
      const result: any = {};
      
      // Check for adaptive card components
      result.globalCardContainers = document.querySelectorAll('.global-card-container').length;
      result.adaptiveCardPanels = document.querySelectorAll('.adaptive-card-panel').length;
      result.adaptiveCards = document.querySelectorAll('.adaptive-card').length;
      
      // Check right panel content
      const rightPanel = document.querySelector('.card-section');
      if (rightPanel) {
        result.rightPanelHTML = rightPanel.innerHTML;
        result.rightPanelClasses = rightPanel.className;
        
        // Check if global card container exists but is empty
        const globalCardContainer = rightPanel.querySelector('.global-card-container');
        if (globalCardContainer) {
          result.globalCardContainerHTML = globalCardContainer.innerHTML;
          result.hasAdaptiveCardPanel = globalCardContainer.querySelector('.adaptive-card-panel') !== null;
        }
      }
      
      // Check if window.AdaptiveCards exists
      result.hasAdaptiveCardsLib = typeof window['AdaptiveCards'] !== 'undefined';
      
      // Check for any logs in console
      if (window.console && window.console.log) {
        const originalLog = console.log;
        const capturedLogs: string[] = [];
        console.log = (...args) => {
          capturedLogs.push(args.join(' '));
          originalLog(...args);
        };
        result.recentLogs = capturedLogs;
      }
      
      return result;
    });
    
    console.log('=== DOM State ===');
    console.log(JSON.stringify(domState, null, 2));
    
    // Filter relevant logs
    const relevantLogs = logs.filter(log => 
      log.includes('AdaptiveCard') || 
      log.includes('adaptive') || 
      log.includes('globalCard') ||
      log.includes('App.svelte') ||
      log.includes('render')
    );
    
    console.log('=== Relevant Logs ===');
    relevantLogs.forEach(log => console.log(log));
    
    // Try to trigger card rendering by sending a message
    await page.fill('input[placeholder="输入消息..."]', '开始游戏');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(3000);
    
    // Check DOM state again
    const afterMessageState = await page.evaluate(() => {
      return {
        globalCardContainers: document.querySelectorAll('.global-card-container').length,
        adaptiveCardPanels: document.querySelectorAll('.adaptive-card-panel').length,
        adaptiveCards: document.querySelectorAll('.adaptive-card').length,
        rightPanelContent: document.querySelector('.card-section')?.textContent?.trim()
      };
    });
    
    console.log('=== After Message State ===');
    console.log(JSON.stringify(afterMessageState, null, 2));
  });
});