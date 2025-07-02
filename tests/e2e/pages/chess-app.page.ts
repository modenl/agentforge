import { Page, Locator } from '@playwright/test';

export class ChessAppPage {
  readonly page: Page;
  
  // Main UI elements
  readonly chatInput: Locator;
  readonly sendButton: Locator;
  readonly chatMessages: Locator;
  readonly assistCard: Locator;
  readonly assistCardActions: Locator;
  readonly globalCard: Locator;
  readonly webView: Locator;
  
  constructor(page: Page) {
    this.page = page;
    
    // Chat elements - try multiple selectors
    this.chatInput = page.locator('input[type="text"], .chat-input');
    this.sendButton = page.locator('button:has-text("📤"), .send-btn');
    this.chatMessages = page.locator('.message');
    
    // Card elements
    this.assistCard = page.locator('.input-assist-section .adaptive-card-panel');
    this.assistCardActions = page.locator('.input-assist-section .ac-pushButton');
    this.globalCard = page.locator('.global-card-container .adaptive-card-panel');
    
    // WebView for chess board
    this.webView = page.locator('.mcp-webview');
  }

  // Navigation and basic actions
  async waitForAppReady() {
    // Wait for the app to initialize
    await this.page.waitForSelector('#svelte-app', { state: 'visible' });
    
    // Wait for initial AI response
    await this.page.waitForSelector('.message.assistant', { 
      state: 'visible',
      timeout: 30000 
    });
    
    // Wait for AdaptiveCards library to load
    await this.page.waitForFunction(
      () => {
        // Check if we see the log message or if adaptive card elements exist
        const logs = Array.from(document.querySelectorAll('*')).some(el => 
          el.textContent?.includes('AdaptiveCards library loaded')
        );
        const hasAdaptiveCard = document.querySelector('.ac-adaptiveCard') !== null;
        const hasCardPanel = document.querySelector('.adaptive-card-panel') !== null;
        const hasACElements = document.querySelectorAll('[class*="ac-"]').length > 0;
        console.log('Checking for AdaptiveCards:', { logs, hasAdaptiveCard, hasCardPanel, hasACElements });
        return hasAdaptiveCard || hasCardPanel || hasACElements;
      },
      { timeout: 10000 }
    ).catch(() => {
      console.log('AdaptiveCards did not load in time');
    });
  }

  async sendMessage(message: string) {
    await this.chatInput.fill(message);
    
    // Wait for button to be enabled
    await this.page.waitForFunction(() => {
      const buttons = document.querySelectorAll('button');
      const sendButton = Array.from(buttons).find(b => 
        b.textContent?.includes('📤') || b.classList.contains('send-btn')
      );
      return sendButton && !sendButton.disabled;
    }, { timeout: 5000 });
    
    await this.sendButton.click();
    
    // Wait for AI response
    await this.waitForAssistantResponse();
  }

  async waitForAssistantResponse() {
    // Get current assistant message count
    const currentAssistantCount = await this.chatMessages.filter({ hasClass: 'assistant' }).count();
    
    // Wait for new assistant message
    await this.page.waitForFunction(
      (count) => {
        const assistantMessages = document.querySelectorAll('.message.assistant');
        return assistantMessages.length > count;
      },
      currentAssistantCount,
      { timeout: 30000 }
    );
    
    // Wait a bit for the message to complete
    await this.page.waitForTimeout(500);
    
    // Wait for any streaming to complete
    try {
      // Check if there's a streaming indicator
      const hasStreaming = await this.page.$('.streaming-indicator, .typing-indicator');
      if (hasStreaming) {
        await this.page.waitForSelector('.streaming-indicator, .typing-indicator', { 
          state: 'hidden',
          timeout: 30000 
        });
      }
    } catch (e) {
      // Ignore if no streaming indicator
    }
  }

  // Assist card interactions
  async clickAssistCardAction(actionText: string) {
    // Try to find button with exact text or containing text
    let button = this.page.locator(`button:has-text("${actionText}")`);
    const count = await button.count();
    
    if (count === 0) {
      // Try partial match
      const buttons = await this.page.$$('button');
      for (const btn of buttons) {
        const text = await btn.textContent();
        if (text && text.includes(actionText)) {
          await btn.click();
          await this.waitForAssistantResponse();
          return;
        }
      }
      throw new Error(`Button with text "${actionText}" not found`);
    }
    
    await button.first().click();
    await this.waitForAssistantResponse();
  }

  async getAssistCardActions(): Promise<string[]> {
    // Wait a bit for any cards to render
    await this.page.waitForTimeout(1000);
    
    // Check for buttons in the page - they might be rendered as regular buttons
    const buttons = await this.page.$$('button');
    const buttonTexts: string[] = [];
    
    for (const button of buttons) {
      const text = await button.textContent();
      if (text && text.trim() && 
          !text.includes('📤') && // Exclude send button
          text.trim().length > 0) {
        buttonTexts.push(text.trim());
      }
    }
    
    // If we found buttons, return them
    if (buttonTexts.length > 0) {
      console.log('Found action buttons:', buttonTexts);
      return buttonTexts;
    }
    
    // Otherwise try the adaptive card selectors
    return this.getGlobalCardActions();
  }
  
  async getGlobalCardActions(): Promise<string[]> {
    try {
      // Wait for any adaptive card to be visible
      await this.page.waitForSelector('.adaptive-card-panel', { timeout: 5000 });
      
      // Try multiple possible selectors
      const selectors = [
        '.global-card-container .ac-pushButton',
        '.adaptive-card-panel .ac-pushButton',
        '.ac-pushButton',
        'button[class*="ac-pushButton"]',
        '.ac-adaptiveCard .ac-pushButton'
      ];
      
      for (const selector of selectors) {
        const buttons = await this.page.$$(selector);
        if (buttons.length > 0) {
          console.log(`Found ${buttons.length} buttons with selector: ${selector}`);
          const actions = await this.page.locator(selector).allTextContents();
          return actions.filter(text => text.trim().length > 0);
        }
      }
      
      console.log('No action buttons found with any selector');
      return [];
    } catch (e) {
      console.log('Error finding actions:', e.message);
      return [];
    }
  }

  // Chess game specific actions
  async startNewGame() {
    // Click "我要下棋" button if available
    const playButton = this.assistCardActions.filter({ hasText: '我要下棋' });
    if (await playButton.count() > 0) {
      await playButton.click();
      await this.waitForAssistantResponse();
    } else {
      await this.sendMessage('我要下棋');
    }
    
    // Wait for game setup
    await this.waitForWebView();
  }

  async waitForWebView() {
    await this.webView.waitFor({ state: 'visible', timeout: 30000 });
    
    // Wait for chess board to load
    await this.page.waitForFunction(
      () => {
        const webview = document.querySelector('.mcp-webview') as any;
        return webview && webview.src && webview.src.includes('localhost:3456');
      },
      { timeout: 30000 }
    );
  }

  async setGameSettings(elo: number) {
    // Send message to set ELO
    await this.sendMessage(`设置AI棋力为${elo}`);
    await this.waitForAssistantResponse();
  }

  async requestGameReplay(gameName: string) {
    await this.sendMessage(`播放${gameName}`);
    await this.waitForAssistantResponse();
    
    // Check if replay started
    const replayMessage = this.chatMessages.last();
    return await replayMessage.textContent();
  }

  // Get current chat messages
  async getLastAssistantMessage(): Promise<string> {
    const lastMessage = this.chatMessages.filter({ hasClass: 'assistant' }).last();
    return await lastMessage.textContent() || '';
  }

  async getAllMessages(): Promise<{ role: string; content: string }[]> {
    const messages = await this.chatMessages.all();
    const result = [];
    
    for (const message of messages) {
      const isUser = await message.getAttribute('class').then(c => c?.includes('user'));
      const isAssistant = await message.getAttribute('class').then(c => c?.includes('assistant'));
      const content = await message.locator('.message-content').textContent();
      
      if (isUser) {
        result.push({ role: 'user', content: content || '' });
      } else if (isAssistant) {
        result.push({ role: 'assistant', content: content || '' });
      }
    }
    
    return result;
  }

  // Check if WebView is visible
  async isChessBoardVisible(): Promise<boolean> {
    return await this.webView.isVisible();
  }
}