// Test Chess Game Application
const ChessGameApp = require('./apps/chess-game/main');

async function testChessApp() {
  console.log('🧪 Testing Chess Game Application...');

  try {
    const app = new ChessGameApp();

    console.log('📝 Initializing chess app...');
    await app.initialize();

    console.log('✅ Chess app initialized successfully!');
    console.log('🏁 Framework is ready for chess gameplay');

    // Test AI interaction
    if (app.framework && app.framework.appManager && app.framework.appManager.coreAgent) {
      console.log('🤖 Testing AI core agent...');
      const testResponse = await app.framework.appManager.coreAgent.processInput('开始新游戏', {});
      console.log('📋 AI Response received:', !!testResponse);

      if (testResponse && testResponse.content) {
        console.log('🎯 Response preview:', testResponse.content.substring(0, 100) + '...');
      }
    }

    // Cleanup
    await app.cleanup();
    console.log('🧹 Cleanup completed');
    console.log('🎉 All tests passed!');

  } catch (error) {
    console.error('❌ Chess app test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run test
testChessApp();
