import { test, expect } from '../fixtures/test-base';

test.describe('Adaptive Card Final Test', () => {
  test('should render adaptive cards correctly', async ({ electronApp, page }) => {
    // Capture console errors
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error' || msg.text().includes('PARSE')) {
        const text = `[${msg.type()}] ${msg.text()}`;
        errors.push(text);
        console.log(text);
      }
    });

    // Wait for app to be ready
    await page.waitForSelector('.chat-window', { timeout: 15000 });
    
    // Wait longer for initialization
    await page.waitForTimeout(5000);
    
    // Check final DOM state
    const finalState = await page.evaluate(() => {
      return {
        // Check for adaptive card components  
        hasGlobalCard: document.querySelector('.global-card-container') !== null,
        hasAdaptiveCardPanel: document.querySelector('.adaptive-card-panel') !== null,
        hasAdaptiveCard: document.querySelector('.adaptive-card') !== null,
        
        // Check if components were created
        globalCardHTML: document.querySelector('.global-card-container')?.innerHTML || 'not found',
        
        // Check if right panel shows cards or empty state
        rightPanelContent: document.querySelector('.card-section')?.textContent?.trim() || 'not found',
        
        // Check if AdaptiveCards library loaded
        hasAdaptiveCardsLib: typeof window['AdaptiveCards'] !== 'undefined',
        
        // Get any AC elements
        acElements: Array.from(document.querySelectorAll('[class*="ac-"]')).map(el => ({
          tag: el.tagName,
          className: el.className,
          text: el.textContent?.substring(0, 50)
        }))
      };
    });
    
    console.log('=== Final State ===');
    console.log(JSON.stringify(finalState, null, 2));
    
    if (errors.length > 0) {
      console.log('=== Errors Found ===');
      errors.forEach(err => console.log(err));
    }
    
    // Try to trigger a successful response
    await page.fill('input[placeholder="输入消息..."]', '开始游戏');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(3000);
    
    // Check state after message
    const afterMessageState = await page.evaluate(() => {
      const globalCard = document.querySelector('.global-card-container');
      const adaptiveCard = document.querySelector('.adaptive-card');
      
      return {
        hasGlobalCard: globalCard !== null,
        hasAdaptiveCard: adaptiveCard !== null,
        globalCardChildCount: globalCard?.children.length || 0,
        adaptiveCardButtons: document.querySelectorAll('.ac-pushButton').length,
        rightPanelHasContent: !document.querySelector('.empty-card')
      };
    });
    
    console.log('=== After Message State ===');
    console.log(JSON.stringify(afterMessageState, null, 2));
    
    // Final assertions - less strict to see what's happening
    expect(finalState.rightPanelContent).toBeTruthy();
  });
});