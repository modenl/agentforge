import { test, expect } from '../fixtures/test-base';

test.describe('Simple AI Interaction', () => {
  test('should send message and receive response', async ({ page }) => {
    // Wait for app to initialize
    await page.waitForTimeout(5000);
    
    // Find input and send a simple message
    const input = await page.$('.chat-input');
    expect(input).toBeTruthy();
    
    await input.type('Hello');
    await input.press('Enter');
    
    // Wait for AI response (with longer timeout for test environment)
    await page.waitForTimeout(8000);
    
    // Check if any message appeared
    const messages = await page.$$('.message');
    expect(messages.length).toBeGreaterThan(0);
  });
});