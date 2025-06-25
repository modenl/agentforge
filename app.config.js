// 🚀 Screen Control Agents - 应用配置
// 只需要修改下面这一行就可以改变默认启动的应用!

module.exports = {
  // 默认启动应用 (只需修改这个参数!)
  // 可选值: 'game-time-manager', 'chess-game'
  defaultApp: 'chess-game',
  
  // 其他启动选项 (一般不需要修改)
  options: {
    autoBuild: false,    // 是否自动构建
    smartBuild: false,   // 是否使用智能构建
    debug: false,        // 是否启用调试模式
    nodeEnv: 'development'
  }
}; 