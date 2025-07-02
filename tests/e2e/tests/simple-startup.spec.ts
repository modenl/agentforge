import { test, expect } from '../fixtures/test-base';

test.describe('Simple App Startup', () => {
  test('should initialize without critical errors', async ({ page }) => {
    // Wait for app to load
    await page.waitForTimeout(3000);
    
    // Check if app container exists
    const appExists = await page.isVisible('#svelte-app');
    expect(appExists).toBeTruthy();
    
    // Check no critical JavaScript errors
    let hasErrors = false;
    page.on('pageerror', error => {
      console.error('Page error:', error.message);
      hasErrors = true;
    });
    
    await page.waitForTimeout(1000);
    expect(hasErrors).toBeFalsy();
  });
  
  test('should accept user input', async ({ page }) => {
    await page.waitForTimeout(2000);
    
    // Find and interact with input
    const input = await page.$('.chat-input');
    expect(input).toBeTruthy();
    
    // Type test message
    await input.type('Hello test');
    const value = await input.inputValue();
    expect(value).toBe('Hello test');
  });
});