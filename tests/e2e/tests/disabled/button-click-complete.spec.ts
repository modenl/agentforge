import { test, expect } from '../fixtures/test-base';

test.describe('Complete Button Click Test', () => {
  test('should process button clicks end-to-end', async ({ electronApp, page }) => {
    // 捕获所有控制台日志
    const logs: string[] = [];
    page.on('console', msg => {
      const text = `[${msg.type()}] ${msg.text()}`;
      logs.push(text);
    });

    // 等待应用准备就绪
    await page.waitForSelector('.chat-window', { timeout: 15000 });
    
    // 等待初始化消息
    await page.waitForSelector('.message.assistant', { timeout: 30000 });
    
    // 等待adaptive card加载
    await page.waitForFunction(
      () => {
        const panels = document.querySelectorAll('.adaptive-card-panel');
        const buttons = document.querySelectorAll('.ac-pushButton');
        console.log(`Found ${panels.length} panels and ${buttons.length} buttons`);
        return buttons.length > 0;
      },
      { timeout: 10000 }
    );
    
    // 获取初始消息数量
    const initialMessages = await page.evaluate(() => {
      return document.querySelectorAll('.message').length;
    });
    
    console.log('Initial messages count:', initialMessages);
    
    // 查找并点击按钮
    const button = await page.waitForSelector('.ac-pushButton', { timeout: 5000 });
    const buttonText = await button.textContent();
    console.log('Found button with text:', buttonText);
    
    // 点击按钮
    await button.click();
    console.log('Button clicked');
    
    // 等待新消息出现（表示按钮点击被处理）
    await page.waitForFunction(
      (initCount) => document.querySelectorAll('.message').length > initCount,
      initialMessages,
      { timeout: 5000 }
    );
    
    // 获取新消息数量
    const newMessages = await page.evaluate(() => {
      return document.querySelectorAll('.message').length;
    });
    
    console.log('New messages count:', newMessages);
    
    // 获取最新消息内容
    const latestMessage = await page.evaluate(() => {
      const messages = document.querySelectorAll('.message');
      const lastMessage = messages[messages.length - 1];
      return lastMessage?.textContent?.trim() || '';
    });
    
    console.log('Latest message:', latestMessage);
    
    // 检查相关日志
    const relevantLogs = logs.filter(log => 
      log.includes('handleCardAction') || 
      log.includes('handleAdaptiveCardAction') ||
      log.includes('oncardAction') ||
      log.includes('handleExternalMessage') ||
      log.includes('sendMessageToCoreAgent')
    );
    
    console.log('=== Relevant Event Logs ===');
    relevantLogs.forEach(log => console.log(log));
    
    // 验证
    expect(newMessages).toBeGreaterThan(initialMessages);
    expect(relevantLogs.length).toBeGreaterThan(0);
  });
});