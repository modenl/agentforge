import { test, expect } from '../fixtures/test-base';

test.describe('Adaptive Card Button Click', () => {
  test('should handle button clicks in adaptive cards', async ({ electronApp, page }) => {
    // 捕获控制台日志
    const logs: string[] = [];
    page.on('console', msg => {
      const text = `[${msg.type()}] ${msg.text()}`;
      logs.push(text);
      if (msg.text().includes('handleCardAction') || msg.text().includes('oncardAction') || msg.text().includes('handleAdaptiveCardAction')) {
        console.log('🎯 Event log:', text);
      }
    });

    // 等待应用准备就绪
    await page.waitForSelector('.chat-window', { timeout: 15000 });
    
    // 等待初始化完成和卡片渲染
    await page.waitForTimeout(5000);
    
    // 检查是否有按钮
    const buttonsBefore = await page.evaluate(() => {
      const buttons = document.querySelectorAll('.ac-pushButton');
      return {
        count: buttons.length,
        texts: Array.from(buttons).map(btn => btn.textContent?.trim())
      };
    });
    
    console.log('Buttons found:', buttonsBefore);
    
    if (buttonsBefore.count > 0) {
      // 点击第一个按钮
      console.log('Clicking first button:', buttonsBefore.texts[0]);
      
      // 清空之前的日志
      logs.length = 0;
      
      // 点击按钮
      await page.click('.ac-pushButton');
      
      // 等待处理
      await page.waitForTimeout(2000);
      
      // 检查相关日志
      const clickLogs = logs.filter(log => 
        log.includes('handleCardAction') || 
        log.includes('oncardAction') ||
        log.includes('handleAdaptiveCardAction') ||
        log.includes('handleStateUpdate') ||
        log.includes('updateGlobalCard')
      );
      
      console.log('=== Click Event Logs ===');
      clickLogs.forEach(log => console.log(log));
      
      // 检查是否有新消息出现（表示按钮点击被处理了）
      const messagesAfter = await page.evaluate(() => {
        const messages = document.querySelectorAll('.message');
        return messages.length;
      });
      
      console.log('Messages count after click:', messagesAfter);
      
      // 验证点击事件被处理
      expect(clickLogs.length).toBeGreaterThan(0);
    } else {
      console.log('No buttons found to test');
    }
    
    // 输出所有相关日志供调试
    console.log('=== All Relevant Logs ===');
    const relevantLogs = logs.filter(log => 
      log.includes('AdaptiveCard') || 
      log.includes('cardAction') ||
      log.includes('handleCard') ||
      log.includes('dispatch') ||
      log.includes('callback')
    );
    relevantLogs.forEach(log => console.log(log));
  });
});