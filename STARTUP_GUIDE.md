# 🚀 统一启动配置指南

## 快速开始

### 1. 修改默认应用 (只需要改一个参数!)

编辑 `app.config.js` 文件：

```javascript
module.exports = {
  // 只需修改这一行!
  defaultApp: 'chess-game',  // 或 'game-time-manager'
  
  // 其他选项一般不需要修改
  options: {
    autoBuild: false,
    debug: false,
    nodeEnv: 'development'
  }
};
```

### 2. 启动应用

```bash
# 启动默认应用
npm start

# 启动指定应用  
npm start chess-game
npm start game-time-manager

# 启动时先构建
npm start chess-game --build

# 调试模式启动
npm start --debug
npm start chess-game --debug
```

## 可用应用

- 🎮 **game-time-manager** - AI智能儿童游戏时间管理系统
- ♟️ **chess-game** - 象棋游戏，与AI对弈

## 启动选项

- `--build, -b` - 启动前先构建
- `--debug, -d` - 启用调试模式
- `--help, -h` - 显示帮助信息

## 配置优先级

1. 命令行参数 (最高优先级)
2. 环境变量 (`.env` 文件)
3. 用户配置 (`app.config.js`)
4. 默认值 (最低优先级)

## 示例

```bash
# 使用默认应用
npm start

# 指定应用
npm start chess-game

# 构建 + 启动
npm start game-time-manager --build

# 调试模式
npm start --debug

# 查看帮助
npm start --help
```

## 添加新应用

要添加新应用，编辑 `framework/config/startup-config.js`：

```javascript
availableApps: {
  'my-new-app': {
    name: 'My New App',
    description: 'Description of my new app',
    path: 'apps/my-new-app',
    icon: '🆕'
  }
}
```

---

*现在只需要修改一个参数就能切换默认应用了！* 