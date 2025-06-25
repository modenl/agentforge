#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

/**
 * 智能构建检测器
 * 检查源文件是否比bundle更新，决定是否需要重新构建
 */
class SmartBuilder {
  constructor() {
    this.bundlePath = 'framework/renderer/bundle/bundle.js';
    this.sourcePatterns = [
      'framework/renderer/svelte/**/*.svelte',
      'framework/renderer/svelte/**/*.js',
      'rollup.config.js',
      'package.json',
      'package-lock.json'
    ];
  }

  /**
   * 获取文件的修改时间
   */
  getFileTime(filePath) {
    try {
      return fs.statSync(filePath).mtime.getTime();
    } catch (error) {
      return 0; // 文件不存在返回0
    }
  }

  /**
   * 递归获取目录下所有匹配文件
   */
  getFilesRecursive(dir, pattern) {
    const files = [];

    try {
      const items = fs.readdirSync(dir);

      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          files.push(...this.getFilesRecursive(fullPath, pattern));
        } else if (this.matchesPattern(fullPath, pattern)) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // 目录不存在或无法访问
    }

    return files;
  }

  /**
   * 简单的glob模式匹配
   */
  matchesPattern(filePath, pattern) {
    const regex = pattern
      .replace(/\*\*/g, '.*')
      .replace(/\*/g, '[^/]*')
      .replace(/\?/g, '[^/]');

    return new RegExp(regex).test(filePath);
  }

  /**
   * 获取所有源文件
   */
  getAllSourceFiles() {
    const files = [];

    for (const pattern of this.sourcePatterns) {
      if (pattern.includes('**')) {
        const basePath = pattern.split('**')[0];
        console.log(`🔍 搜索模式: ${pattern}, 基础路径: ${basePath}`);

        if (fs.existsSync(basePath)) {
          const foundFiles = this.getFilesRecursive(basePath, pattern);
          console.log(`📁 找到 ${foundFiles.length} 个文件: ${foundFiles.join(', ')}`);
          files.push(...foundFiles);
        } else {
          console.log(`⚠️ 基础路径不存在: ${basePath}`);
        }
      } else {
        // 直接文件路径
        if (fs.existsSync(pattern)) {
          console.log(`📄 找到直接文件: ${pattern}`);
          files.push(pattern);
        } else {
          console.log(`⚠️ 文件不存在: ${pattern}`);
        }
      }
    }

    console.log(`📊 总共找到 ${files.length} 个源文件`);
    return files;
  }

  /**
   * 检查是否需要重新构建
   */
  needsRebuild() {
    console.log('🔍 检查是否需要重新构建...');

    // 检查bundle是否存在
    if (!fs.existsSync(this.bundlePath)) {
      console.log('📦 Bundle文件不存在，需要构建');
      return true;
    }

    const bundleTime = this.getFileTime(this.bundlePath);
    const sourceFiles = this.getAllSourceFiles();

    console.log(`📊 检查 ${sourceFiles.length} 个源文件...`);
    console.log(`📦 Bundle时间: ${new Date(bundleTime).toLocaleString()}`);

    let needsRebuild = false;
    for (const file of sourceFiles) {
      const fileTime = this.getFileTime(file);
      console.log(`📄 ${file}: ${new Date(fileTime).toLocaleString()}`);

      if (fileTime > bundleTime) {
        console.log(`📝 源文件更新: ${file}`);
        console.log(`⏰ 源文件时间: ${new Date(fileTime).toLocaleString()}`);
        console.log(`⏰ Bundle时间: ${new Date(bundleTime).toLocaleString()}`);
        needsRebuild = true;
        break; // 找到一个就够了
      }
    }

    if (!needsRebuild) {
      console.log('✅ Bundle是最新的，无需重新构建');
    }

    return needsRebuild;
  }

  /**
   * 执行构建
   */
  async build() {
    console.log('🔨 开始构建...');

    try {
      const { stdout, stderr } = await execAsync('npm run build');

      // 检查是否有真正的错误（不是警告）
      const hasError = stderr && (
        stderr.includes('Error:') ||
        stderr.includes('Failed') ||
        stderr.includes('[!] Error:')
      );

      // 过滤掉CSS警告，这些是正常的
      const hasWarningOnly = stderr && (
        stderr.includes('Plugin svelte: Unused CSS selector') ||
        stderr.includes('(!) Plugin svelte:') ||
        stderr.includes('warning')
      ) && !hasError;

      if (hasError) {
        console.error('❌ 构建失败:', stderr);
        return false;
      }

      if (hasWarningOnly) {
        console.log('⚠️ 构建完成(有警告)');
      } else {
        console.log('✅ 构建完成');
      }

      if (stdout) {
        // 只显示重要输出，过滤冗长的警告
        const filteredOutput = stdout
          .split('\n')
          .filter(line =>
            !line.includes('Plugin svelte: Unused CSS selector') &&
            !line.includes('(!) Plugin svelte:') &&
            line.trim().length > 0
          )
          .join('\n');

        if (filteredOutput.trim()) {
          console.log(filteredOutput);
        }
      }

      return true;
    } catch (error) {
      // 检查是否只是警告导致的"错误"
      if (error.stderr && error.stderr.includes('Plugin svelte: Unused CSS selector')) {
        console.log('⚠️ 构建完成(有CSS警告，可忽略)');
        return true;
      }

      console.error('❌ 构建失败:', error.message);
      return false;
    }
  }

  /**
   * 智能构建主流程
   */
  async smartBuild() {
    const startTime = Date.now();

    console.log('🚀 智能构建检测启动');
    console.log('='.repeat(50));

    if (this.needsRebuild()) {
      const success = await this.build();
      if (!success) {
        process.exit(1);
      }
    }

    const endTime = Date.now();
    console.log('='.repeat(50));
    console.log(`⚡ 智能构建完成 (耗时: ${endTime - startTime}ms)`);
  }
}

// 主函数
async function main() {
  const builder = new SmartBuilder();
  await builder.smartBuild();
}

// 如果直接运行此脚本
if (require.main === module) {
  main().catch(error => {
    console.error('💥 智能构建失败:', error);
    process.exit(1);
  });
}

module.exports = SmartBuilder; 