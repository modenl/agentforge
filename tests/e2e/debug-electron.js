const { _electron: electron } = require('playwright');
const path = require('path');

async function debugElectron() {
  console.log('Starting Electron debug test...');
  
  try {
    // Try to launch Electron
    console.log('Launching Electron app...');
    const electronApp = await electron.launch({
      args: [
        path.join(__dirname, '../../framework/launcher.js'),
        path.join(__dirname, '../../apps/chess-game')
      ],
      env: {
        ...process.env,
        NODE_ENV: 'test',
        OPENAI_MODEL: 'gpt-4o-mini'
      }
    });
    
    console.log('✅ Electron launched successfully!');
    
    // Get the first window
    const window = await electronApp.firstWindow();
    console.log('✅ Got window!');
    
    // Take a screenshot
    await window.screenshot({ path: 'test-screenshot.png' });
    console.log('✅ Screenshot saved!');
    
    // Close the app
    await electronApp.close();
    console.log('✅ App closed!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

debugElectron();