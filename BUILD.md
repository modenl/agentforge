# AgentForge 构建说明

## 当前状态

目前 framework 的 Svelte 组件已经预编译在 `framework/renderer/bundle/` 目录中：

- `bundle.js` - 编译后的 JavaScript 代码
- `bundle.css` - 编译后的 CSS 样式
- `bundle.js.map` - Source map 文件（用于调试）

## 构建命令

### 快速开始
```bash
npm run build  # 使用 Rollup 构建 Svelte 组件
```

### 完整构建（需要安装 rollup 依赖）
```bash
# 安装构建依赖
npm install --save-dev rollup rollup-plugin-svelte @rollup/plugin-commonjs @rollup/plugin-node-resolve @rollup/plugin-json rollup-plugin-css-only @rollup/plugin-terser svelte

# 生产构建
npm run build:rollup

# 开发构建（包含 source maps）
npm run build:dev
```

## 开发模式

### 智能构建（推荐）
```bash
npm run dev:smart
```
这会监听文件变化并自动重新构建。

### 手动构建
如果你修改了 Svelte 组件，需要重新构建：
```bash
npm run build:rollup
```

## 文件结构

```
framework/
├── renderer/
│   ├── svelte/          # Svelte 源代码
│   │   ├── App.svelte   # 主应用组件
│   │   ├── components/  # 子组件
│   │   └── main.js      # 入口文件
│   └── bundle/          # 编译输出
│       ├── bundle.js    # 编译后的 JS
│       ├── bundle.css   # 编译后的 CSS
│       └── bundle.js.map # Source map
└── rollup.config.js     # Rollup 配置文件
```

## 故障排除

### npm install 问题
如果遇到 npm 安装依赖的问题：

1. 清理 npm 缓存：
   ```bash
   npm cache clean --force
   ```

2. 删除 node_modules 并重新安装：
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. 使用预构建的 bundle 文件：
   当前仓库已包含预构建的文件，可以直接使用。

### 构建工具缺失
如果 rollup 相关依赖安装失败，可以：

1. 使用现有的预构建文件（推荐用于测试）
2. 手动安装特定版本的依赖
3. 使用 yarn 或 pnpm 替代 npm

## 注意事项

- 预构建的 bundle 文件是 2025年6月30日生成的
- 如果修改了 Svelte 组件，需要重新构建
- E2E 测试可以直接使用预构建的文件