# 开发者指南 (Development Guide)

## 🌐 跨平台开发设置

本项目支持 Windows、macOS 和 Linux 平台的开发。为了确保代码一致性，请按照以下步
骤设置开发环境。

### 📝 换行符处理

项目使用以下配置来处理不同操作系统的换行符差异：

#### Git 配置

- **Windows 用户**：`git config core.autocrlf true`
- **macOS/Linux 用户**：`git config core.autocrlf input`

#### 自动配置

项目包含以下配置文件：

- `.gitattributes` - 确保仓库中的文件使用 LF 换行符
- `.editorconfig` - 统一编辑器行为
- `.eslintrc.js` - 代码风格检查（已移除严格的换行符检查）

### 🛠️ 设置开发环境

#### 1. 克隆项目后执行

```bash
# Windows
git config core.autocrlf true

# macOS/Linux
git config core.autocrlf input
```

#### 2. 如果遇到换行符问题

```bash
# 重新标准化仓库中的换行符
git add --renormalize .
git commit -m "Normalize line endings"
```

#### 3. 编辑器设置

推荐安装 EditorConfig 插件以支持`.editorconfig`配置：

- **VSCode/Cursor**: EditorConfig for VS Code
- **WebStorm**: 内置支持
- **Sublime Text**: EditorConfig package

### 🔧 故障排除

#### ESLint 换行符错误

如果仍然看到`Expected linebreaks to be 'LF' but found 'CRLF'`错误：

1. **清除 ESLint 缓存**：

   ```bash
   npx eslint --cache-location .eslintcache --cache .
   ```

2. **转换单个文件**：

   - 在 VSCode/Cursor 中：点击状态栏的"CRLF"选择"LF"
   - 使用命令：`dos2unix filename.js`（需要安装 dos2unix）

3. **批量转换**：

   ```bash
   # Windows (PowerShell)
   Get-ChildItem -Recurse -File *.js | ForEach-Object {
     (Get-Content $_.FullName -Raw) -replace "`r`n", "`n" | Set-Content $_.FullName -NoNewline
   }

   # macOS/Linux
   find . -name "*.js" -type f -exec dos2unix {} \;
   ```

### 🚀 最佳实践

1. **提交前检查**：

   ```bash
   npm run lint
   ```

2. **自动修复**：

   ```bash
   npm run lint:fix
   ```

3. **编辑器配置**：
   - 启用"在保存时格式化"
   - 安装 Prettier 和 ESLint 插件
   - 使用项目的`.editorconfig`设置

### 🤝 贡献指南

为确保代码质量和一致性：

1. 遵循项目的 ESLint 配置
2. 使用项目的 EditorConfig 设置
3. 提交前运行`npm run lint`检查
4. 所有文本文件应使用 LF 换行符（Git 会自动处理）

### ❓ 常见问题

**Q: 为什么我的文件显示整个文件都被修改了？** A: 这通常是换行符差异导致的。使
用`git config core.autocrlf true`（Windows）
或`git config core.autocrlf input`（macOS/Linux）。

**Q: ESLint 一直报换行符错误怎么办？** A: 确保你的编辑器使用 LF 换行符，或者在项
目根目录运行换行符转换命令。

**Q: 我可以在 Windows 上开发吗？** A: 完全可以！项目已经配置为跨平台兼容，只需要
正确设置 Git 的 autocrlf 即可。
