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
    
    // Chat elements
    this.chatInput = page.locator('.chat-input');
    this.sendButton = page.locator('.send-btn');
    this.chatMessages = page.locator('.message');
    
    // Card elements
    this.assistCard = page.locator('.input-assist-section .adaptive-card');
    this.assistCardActions = page.locator('.input-assist-section .ac-pushButton');
    this.globalCard = page.locator('.global-card-container .adaptive-card');
    
    // WebView for chess board
    this.webView = page.locator('.mcp-webview');
  }

  // Navigation and basic actions
  async waitForAppReady() {
    // Wait for the app to initialize
    await this.page.waitForSelector('#app', { state: 'visible' });
    
    // Wait for initial AI response
    await this.page.waitForSelector('.message.assistant', { 
      state: 'visible',
      timeout: 30000 
    });
  }

  async sendMessage(message: string) {
    await this.chatInput.fill(message);
    await this.sendButton.click();
    
    // Wait for AI response
    await this.waitForAssistantResponse();
  }

  async waitForAssistantResponse() {
    // Get current message count
    const messageCount = await this.chatMessages.count();
    
    // Wait for new assistant message
    await this.page.waitForFunction(
      (count) => {
        const messages = document.querySelectorAll('.message.assistant');
        return messages.length > count;
      },
      messageCount,
      { timeout: 30000 }
    );
    
    // Wait for typing indicator to disappear
    await this.page.waitForSelector('.typing-indicator', { 
      state: 'hidden',
      timeout: 30000 
    });
  }

  // Assist card interactions
  async clickAssistCardAction(actionText: string) {
    const button = this.assistCardActions.filter({ hasText: actionText });
    await button.click();
    await this.waitForAssistantResponse();
  }

  async getAssistCardActions(): Promise<string[]> {
    await this.assistCard.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
    
    const actions = await this.assistCardActions.allTextContents();
    return actions.filter(text => text.trim().length > 0);
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