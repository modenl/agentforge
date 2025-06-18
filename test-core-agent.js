// 测试CoreAgent架构的简单脚本
require('dotenv').config();

const CoreAgent = require('./src/main/core-agent');

async function testCoreAgent() {
  console.log('🎯 开始测试CoreAgent架构...');

  try {
    // 创建CoreAgent实例
    const coreAgent = new CoreAgent();

    // 初始化
    const initSuccess = await coreAgent.initialize();
    if (!initSuccess) {
      throw new Error('CoreAgent初始化失败');
    }

    console.log('✅ CoreAgent初始化成功');

    // 测试基本用户输入
    console.log('\n📝 测试用户输入处理...');

    const testInputs = [
      '系统初始化',
      '我要玩游戏',
      '我要答题',
      '进入家长模式'
    ];

    for (const input of testInputs) {
      console.log(`\n🔍 测试输入: "${input}"`);

      const response = await coreAgent.processInput(input);

      if (response.success) {
        console.log('✅ 处理成功');
        console.log('状态:', response.new_state);
        console.log('消息:', response.message);

        if (response.adaptive_card) {
          console.log('🎴 生成了Adaptive Card');
        }

        if (response.mcp_actions && response.mcp_actions.length > 0) {
          console.log('🔧 MCP操作:', response.mcp_actions.map(a => a.type));
        }
      } else {
        console.log('❌ 处理失败:', response.error);
      }
    }

    // 测试状态获取
    console.log('\n📊 当前状态:');
    console.log(JSON.stringify(coreAgent.getCurrentState(), null, 2));

    console.log('\n📋 应用数据:');
    console.log(JSON.stringify(coreAgent.getAppData(), null, 2));

    console.log('\n💬 可见聊天历史:');
    const visibleHistory = coreAgent.getVisibleChatHistory();
    console.log(`共 ${visibleHistory.length} 条消息`);

    console.log('\n🎉 CoreAgent架构测试完成!');

  } catch (error) {
    console.error('❌ 测试失败:', error);
    process.exit(1);
  }
}

// 运行测试
if (require.main === module) {
  testCoreAgent().catch(console.error);
}

module.exports = { testCoreAgent };
