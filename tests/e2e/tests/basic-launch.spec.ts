import { test, expect } from '../fixtures/test-base';

test.describe('Basic App Launch', () => {
  test('should launch and show UI elements', async ({ page }) => {
    // Check if svelte app mounted
    const svelteApp = await page.$('#svelte-app');
    expect(svelteApp).toBeTruthy();
    
    // Check if chat input exists (most essential element)
    const chatInput = await page.$('.chat-input');
    expect(chatInput).toBeTruthy();
    
    // Take screenshot for visual verification
    await page.screenshot({ path: 'test-results/basic-launch.png', fullPage: true });
  });
});