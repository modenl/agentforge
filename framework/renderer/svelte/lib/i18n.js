export const translations = {
  en: {
    // Chat interface
    chatPlaceholder: 'Type your message...',
    send: 'Send',
    thinking: 'Thinking',
    error: 'Error',
    retry: 'Retry',
    copy: 'Copy',
    copied: 'Copied!',
    
    // Settings
    settings: 'Settings',
    theme: 'Theme',
    language: 'Language',
    dark: 'Dark',
    light: 'Light',
    
    // Common
    loading: 'Loading...',
    close: 'Close',
    minimize: 'Minimize',
    maximize: 'Maximize',
    restore: 'Restore',
    
    // Status
    connected: 'Connected',
    disconnected: 'Disconnected',
    connecting: 'Connecting...',
    
    // Actions
    clear: 'Clear',
    cancel: 'Cancel',
    confirm: 'Confirm',
    save: 'Save',
    delete: 'Delete',
    
    // Errors
    errorOccurred: 'An error occurred',
    tryAgain: 'Try again',
    connectionError: 'Connection error',
    
    // Chat specific
    startChatting: 'Start chatting with AI Assistant!',
    user: 'User',
    assistant: 'AI Assistant',
    system: 'System',
    unknown: 'Unknown',
    waitingForMCP: 'Waiting for MCP Server',
    mcpInterfaceHere: 'MCP server interface will appear here',
    
    // Chess specific
    listenStory: 'Listen to Stories',
    startLearning: 'Start Learning',
    playGame: 'Play Game',
    viewReplay: 'View Classic Games',
    viewProfile: 'View Profile'
  },
  
  zh: {
    // Chat interface
    chatPlaceholder: '输入您的消息...',
    send: '发送',
    thinking: '思考中',
    error: '错误',
    retry: '重试',
    copy: '复制',
    copied: '已复制！',
    
    // Settings
    settings: '设置',
    theme: '主题',
    language: '语言',
    dark: '深色',
    light: '浅色',
    
    // Common
    loading: '加载中...',
    close: '关闭',
    minimize: '最小化',
    maximize: '最大化',
    restore: '还原',
    
    // Status
    connected: '已连接',
    disconnected: '已断开',
    connecting: '连接中...',
    
    // Actions
    clear: '清除',
    cancel: '取消',
    confirm: '确认',
    save: '保存',
    delete: '删除',
    
    // Errors
    errorOccurred: '发生错误',
    tryAgain: '重试',
    connectionError: '连接错误',
    
    // Chat specific
    startChatting: '开始与AI助手对话吧！',
    user: '用户',
    assistant: 'AI助手',
    system: '系统',
    unknown: '未知',
    waitingForMCP: '等待 MCP 服务器',
    mcpInterfaceHere: 'MCP 服务器将在此显示其界面',
    
    // Chess specific
    listenStory: '听故事',
    startLearning: '开始学习',
    playGame: '我要下棋',
    viewReplay: '看经典棋局',
    viewProfile: '查看档案'
  }
};

let currentLang = localStorage.getItem('language') || 'en';

export function t(key) {
  return translations[currentLang]?.[key] || translations.en[key] || key;
}

export function setLanguage(lang) {
  if (translations[lang]) {
    currentLang = lang;
    localStorage.setItem('language', lang);
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: lang }));
  }
}

export function getCurrentLanguage() {
  return currentLang;
}

export function getAvailableLanguages() {
  return Object.keys(translations);
}