import { test, expect } from '../fixtures/test-base';

test.describe('Basic Electron App Test', () => {
  test('should launch Electron app', async ({ electronApp, page }) => {
    // Check if app launched
    expect(electronApp).toBeTruthy();
    
    // Check if page is available
    expect(page).toBeTruthy();
    
    // Check if main window is visible
    const isVisible = await page.isVisible('#svelte-app');
    expect(isVisible).toBeTruthy();
    
  });
  
  test('should have basic UI structure', async ({ page }) => {
    // Check essential UI components exist
    const chatInput = await page.$('.chat-input');
    expect(chatInput).toBeTruthy();
    
    // Check if messages area exists
    const messagesArea = await page.$('.chat-messages');
    expect(messagesArea).toBeTruthy();
  });
});