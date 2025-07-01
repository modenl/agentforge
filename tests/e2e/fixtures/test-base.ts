import { test as base, expect } from '@playwright/test';
import { ElectronApplication, Page, _electron as electron } from 'playwright';
import * as path from 'path';
import * as fs from 'fs';

// Extend basic test with our fixtures
export const test = base.extend<{
  electronApp: ElectronApplication;
  page: Page;
}>({
  // Fixture to launch Electron app
  electronApp: async ({}, use) => {
    // Ensure test directories exist
    const testDataDir = path.join(__dirname, '../test-data');
    const testLogsDir = path.join(__dirname, '../test-logs');
    
    if (!fs.existsSync(testDataDir)) {
      fs.mkdirSync(testDataDir, { recursive: true });
    }
    if (!fs.existsSync(testLogsDir)) {
      fs.mkdirSync(testLogsDir, { recursive: true });
    }

    // Launch Electron app with test configuration
    const electronApp = await electron.launch({
      args: [
        path.join(__dirname, '../../../framework/index.js'),
        path.join(__dirname, '../../../apps/chess-game'),
        '--no-sandbox',
        '--disable-setuid-sandbox'
      ],
      env: {
        ...process.env,
        NODE_ENV: 'test',
        APP_NAME: 'chess-game',
        // Use test-specific model
        OPENAI_MODEL: 'gpt-4o-mini',
        // Use test-specific storage
        USER_DATA_PATH: testDataDir,
        LOGS_PATH: testLogsDir,
        // Disable auto-update for tests
        DISABLE_AUTO_UPDATE: 'true',
        // Speed up tests
        AI_RESPONSE_DELAY: '0'
      }
    });

    // Wait for the main window
    const page = await electronApp.firstWindow();
    
    // Use the app for tests
    await use(electronApp);

    // Cleanup
    await electronApp.close();
  },

  // Fixture to get the page
  page: async ({ electronApp }, use) => {
    const page = await electronApp.firstWindow();
    
    // Set viewport
    await page.setViewportSize({ width: 1200, height: 800 });
    
    // Wait for app to be ready
    await page.waitForSelector('#app', { timeout: 30000 });
    
    await use(page);
  }
});

export { expect };