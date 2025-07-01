/**
 * MCP View Controller
 * 提供程序化控制 MCP View 的能力
 */

export class MCPViewController {
  constructor(app) {
    this.app = app;
  }

  /**
   * 设置视图模式
   * @param {string} mode - 'normal', 'compact', 'fullscreen', 'mini'
   */
  setViewMode(mode) {
    if (this.app.setMCPViewMode) {
      this.app.setMCPViewMode(mode);
    }
  }

  /**
   * 根据场景自动调整视图
   * @param {string} context - 场景上下文
   */
  adjustForContext(context) {
    if (this.app.adjustMCPViewForContext) {
      this.app.adjustMCPViewForContext(context);
    }
  }

  /**
   * 调整视图大小
   * @param {string|number} width 
   * @param {string|number} height 
   */
  resize(width, height) {
    if (this.app.resizeMCPView) {
      this.app.resizeMCPView(width, height);
    }
  }

  /**
   * 显示/隐藏 MCP View
   * @param {boolean} show 
   */
  toggle(show) {
    if (this.app.showMCPView !== undefined) {
      this.app.showMCPView = show;
    }
  }

  /**
   * 获取当前状态
   */
  getState() {
    return {
      visible: this.app.showMCPView || false,
      mode: this.app.mcpViewMode || 'normal',
      url: this.app.mcpUrl || '',
      serverName: this.app.mcpServerName || ''
    };
  }
}

/**
 * 使用示例：
 * 
 * 1. 在 ChatWindow 中根据用户意图调整视图：
 * 
 * if (userMessage.includes('全屏显示')) {
 *   mcpViewController.setViewMode('fullscreen');
 * } else if (userMessage.includes('最小化')) {
 *   mcpViewController.setViewMode('mini');
 * }
 * 
 * 2. 根据任务类型自动调整：
 * 
 * if (taskType === 'chess_game') {
 *   mcpViewController.adjustForContext('gaming');
 * } else if (taskType === 'system_monitor') {
 *   mcpViewController.adjustForContext('monitoring');
 * }
 * 
 * 3. 响应式布局调整：
 * 
 * if (windowWidth < 1200) {
 *   mcpViewController.setViewMode('compact');
 * } else {
 *   mcpViewController.setViewMode('normal');
 * }
 */