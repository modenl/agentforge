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
    const isHeaded = process.env.HEADED === '1' || process.env.PWDEBUG === '1';
    
    // For Electron, we need to pass headless flag differently
    const electronApp = await electron.launch({
      args: [
        path.join(__dirname, '../../../framework/launcher.js'),
        path.join(__dirname, '../../../apps/chess-game'),
        '--no-sandbox',
        '--disable-setuid-sandbox',
        // Hide dock icon in test mode on macOS
        ...(process.platform === 'darwin' && !isHeaded ? [
          '--enable-features=HideDockIcon'
        ] : [])
      ],
      // Open devtools for debugging
      executablePath: undefined,
      timeout: 30000,
      env: {
        ...process.env,
        NODE_ENV: 'test',
        APP_NAME: 'chess-game',
        // Use test-specific model
        OPENAI_MODEL: 'gpt-4.1-nano',
        // Use test-specific storage
        USER_DATA_PATH: testDataDir,
        LOGS_PATH: testLogsDir,
        // Disable auto-update for tests
        DISABLE_AUTO_UPDATE: 'true',
        // Speed up tests
        AI_RESPONSE_DELAY: '0',
        // Enable dev tools in tests
        ELECTRON_ENABLE_LOGGING: '1',
        ELECTRON_DEV_TOOLS: 'true',
        // Disable MCP for tests to avoid path issues
        DISABLE_MCP: 'true',
        // Force background mode on macOS (only in headless mode)
        ...(isHeaded ? {} : { LSUIElement: '1' })
      }
    });

    // Wait a bit for the app to initialize
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Wait for the main window
    const page = await electronApp.firstWindow();
    
    // Ensure window is visible in headed mode
    if (isHeaded) {
      await electronApp.evaluate(async ({ BrowserWindow }) => {
        const windows = BrowserWindow.getAllWindows();
        if (windows.length > 0) {
          windows[0].show();
          windows[0].focus();
        }
      });
    }
    
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
    
    // Open devtools only in headed mode for debugging
    const isHeaded = process.env.HEADED === '1' || process.env.PWDEBUG === '1';
    if (isHeaded) {
      await electronApp.evaluate(async ({ BrowserWindow }) => {
        const windows = BrowserWindow.getAllWindows();
        if (windows.length > 0) {
          windows[0].webContents.openDevTools();
        }
      });
    }
    
    // Wait for app to be ready
    await page.waitForSelector('#svelte-app', { timeout: 30000 });
    
    await use(page);
  }
});

export { expect };