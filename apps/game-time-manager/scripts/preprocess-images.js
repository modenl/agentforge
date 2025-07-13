#!/usr/bin/env node

import { readFile, writeFile, readdir, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';
import { existsSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const RESOURCES_DIR = join(__dirname, '..', 'resources');
const PROCESSED_DIR = join(__dirname, '..', 'resources-processed');

// 图片缓存
const imageCache = new Map();
let processedCount = 0;
let failedCount = 0;

/**
 * 将LaTeX图片URL转换为base64
 */
async function convertImageToBase64(imageUrl) {
  if (imageCache.has(imageUrl)) {
    return imageCache.get(imageUrl);
  }

  try {
    console.log(`Fetching: ${imageUrl}`);
    const response = await axios.get(imageUrl, { 
      responseType: 'arraybuffer',
      timeout: 30000 // 30秒超时
    });
    const base64 = Buffer.from(response.data).toString('base64');
    const dataUri = `data:image/png;base64,${base64}`;
    imageCache.set(imageUrl, dataUri);
    processedCount++;
    return dataUri;
  } catch (error) {
    console.error(`Failed to fetch image: ${imageUrl}`, error.message);
    failedCount++;
    return imageUrl; // 返回原URL作为fallback
  }
}

/**
 * 处理Markdown内容，将LaTeX图片链接转换为base64
 */
async function processMarkdown(content, fileName) {
  console.log(`\nProcessing ${fileName}...`);
  
  // 匹配所有图片链接
  const imageRegex = /!\[([^\]]*)\]\((https:\/\/latex\.artofproblemsolving\.com[^)]+)\)/g;
  const matches = Array.from(content.matchAll(imageRegex));
  
  console.log(`Found ${matches.length} images in ${fileName}`);
  
  let processedContent = content;
  
  // 并行处理所有图片，但限制并发数
  const batchSize = 5;
  for (let i = 0; i < matches.length; i += batchSize) {
    const batch = matches.slice(i, i + batchSize);
    const replacements = await Promise.all(
      batch.map(async (match) => {
        const [fullMatch, altText, imageUrl] = match;
        const base64 = await convertImageToBase64(imageUrl);
        return {
          original: fullMatch,
          replacement: `![${altText}](${base64})`
        };
      })
    );
    
    // 替换这批图片链接
    replacements.forEach(({ original, replacement }) => {
      processedContent = processedContent.replace(original, replacement);
    });
    
    // 显示进度
    console.log(`  Processed ${Math.min(i + batchSize, matches.length)}/${matches.length} images`);
  }
  
  return processedContent;
}

/**
 * 处理单个文件
 */
async function processFile(fileName) {
  const inputPath = join(RESOURCES_DIR, fileName);
  const outputPath = join(PROCESSED_DIR, fileName);
  
  try {
    const content = await readFile(inputPath, 'utf-8');
    const processedContent = await processMarkdown(content, fileName);
    await writeFile(outputPath, processedContent, 'utf-8');
    console.log(`✓ Saved ${fileName}`);
  } catch (error) {
    console.error(`✗ Error processing ${fileName}:`, error.message);
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('AMC8 图片预处理工具');
  console.log('==================\n');
  
  // 创建输出目录
  if (!existsSync(PROCESSED_DIR)) {
    await mkdir(PROCESSED_DIR, { recursive: true });
    console.log(`Created output directory: ${PROCESSED_DIR}\n`);
  }
  
  // 获取所有题目文件
  const files = await readdir(RESOURCES_DIR);
  const problemFiles = files.filter(f => f.match(/^AMC_8_\d{4}_Problems\.md$/));
  
  console.log(`Found ${problemFiles.length} problem files to process\n`);
  
  // 处理每个文件
  for (const file of problemFiles) {
    await processFile(file);
  }
  
  // 统计信息
  console.log('\n==================');
  console.log('处理完成！');
  console.log(`成功转换: ${processedCount} 张图片`);
  console.log(`失败: ${failedCount} 张图片`);
  console.log(`缓存命中: ${imageCache.size} 个不同的图片URL`);
  console.log(`\n处理后的文件保存在: ${PROCESSED_DIR}`);
}

// 运行主函数
main().catch(console.error);