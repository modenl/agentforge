// Test script to debug display_message functionality
// This will help us understand why messages appear blank

async function testDisplayMessage() {
  console.log('=== Testing Display Message Functionality ===\n');
  
  // Simulate what happens when display_message is called
  const testScenarios = [
    {
      name: 'MCP Result Message ID',
      messageId: 'mcp_result_1234567890_abc123',
      description: 'Testing with MCP result format ID'
    },
    {
      name: 'Sequential Number ID',
      messageId: '5',
      description: 'Testing with sequential number ID'
    },
    {
      name: 'Missing Message',
      messageId: 'non_existent_message',
      description: 'Testing with non-existent message ID'
    }
  ];
  
  // Simulate messages array from ChatWindow
  const simulatedMessages = [
    { id: 1, originalId: 'user_msg_1', role: 'user', content: 'Hello' },
    { id: 2, originalId: 'assistant_msg_1', role: 'assistant', content: 'Hi there!' },
    { id: 3, originalId: 'mcp_result_1234567890_abc123', role: 'system', content: '[MCP Tool Results]\nTest result content', metadata: 'mcp_result_1234567890_abc123' },
    { id: 4, originalId: 'user_msg_2', role: 'user', content: 'Show me the result' },
    { id: 5, originalId: 'assistant_msg_2', role: 'assistant', content: 'Here is the result:' }
  ];
  
  console.log('Simulated Messages:');
  simulatedMessages.forEach(msg => {
    console.log(`- ID: ${msg.id}, OriginalID: ${msg.originalId}, Role: ${msg.role}, Content: ${msg.content.substring(0, 30)}...`);
  });
  console.log('\n');
  
  // Test message lookup logic from ChatWindow
  testScenarios.forEach(scenario => {
    console.log(`Test: ${scenario.name}`);
    console.log(`Looking for messageId: "${scenario.messageId}"`);
    
    const messageIndex = simulatedMessages.findIndex(msg => 
      msg.id === scenario.messageId || 
      msg.originalId === scenario.messageId || 
      (msg.metadata && msg.metadata === scenario.messageId)
    );
    
    if (messageIndex !== -1) {
      const foundMessage = simulatedMessages[messageIndex];
      console.log(`✅ Found at index ${messageIndex}:`);
      console.log(`   - ID: ${foundMessage.id}`);
      console.log(`   - OriginalID: ${foundMessage.originalId}`);
      console.log(`   - Content: ${foundMessage.content}`);
      console.log(`   - Would scroll to this message`);
    } else {
      console.log(`❌ Message not found`);
    }
    console.log('\n');
  });
  
  // Check for potential issues
  console.log('=== Potential Issues ===');
  console.log('1. ID mismatch: MCP generates IDs like "mcp_result_XXX" but ChatWindow reassigns sequential IDs');
  console.log('2. The lookup checks id, originalId, and metadata fields');
  console.log('3. If content is empty or undefined, the message would appear blank');
  console.log('4. CSS might hide messages with certain classes or states');
  console.log('\n');
  
  // Recommendations
  console.log('=== Recommendations ===');
  console.log('1. Ensure MCP result content is not empty when added to history');
  console.log('2. Check if the message content includes proper formatting');
  console.log('3. Verify CSS is not hiding system messages');
  console.log('4. Add debug logging to trace the actual message content');
}

testDisplayMessage();