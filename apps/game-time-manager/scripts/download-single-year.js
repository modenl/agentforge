#!/usr/bin/env node

import { readFile, writeFile, readdir, mkdir } from 'fs/promises';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';
import { existsSync } from 'fs';
import crypto from 'crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const RESOURCES_DIR = join(__dirname, '..', 'resources');
const IMAGES_DIR = join(__dirname, '..', 'resources', 'images');

// 从命令行参数获取年份
const year = process.argv[2];
if (!year) {
  console.error('Usage: node download-single-year.js <year>');
  process.exit(1);
}

// 统计信息
let downloadedCount = 0;
let skippedCount = 0;
let failedCount = 0;

/**
 * 从URL生成文件名
 */
function getFileNameFromUrl(url) {
  const urlHash = url.split('/').pop();
  return urlHash;
}

/**
 * 下载图片
 */
async function downloadImage(url, savePath) {
  if (existsSync(savePath)) {
    console.log(`  Skip (exists): ${basename(savePath)}`);
    skippedCount++;
    return true;
  }

  try {
    console.log(`  Downloading: ${basename(savePath)}`);
    const response = await axios.get(url, { 
      responseType: 'arraybuffer',
      timeout: 30000,
      httpsAgent: new (await import('https')).Agent({
        rejectUnauthorized: false
      })
    });
    await writeFile(savePath, response.data);
    downloadedCount++;
    return true;
  } catch (error) {
    console.error(`  Failed: ${basename(savePath)} - ${error.message}`);
    failedCount++;
    return false;
  }
}

/**
 * 处理单个markdown文件
 */
async function processMarkdownFile(fileName) {
  const filePath = join(RESOURCES_DIR, fileName);
  const content = await readFile(filePath, 'utf-8');
  
  // 检查是否已经使用本地图片
  if (content.includes('images/')) {
    console.log(`${fileName}: Already using local images, skipping...`);
    return;
  }
  
  const yearDir = join(IMAGES_DIR, year);
  
  // 创建年份目录
  if (!existsSync(yearDir)) {
    await mkdir(yearDir, { recursive: true });
    console.log(`Created directory: images/${year}/`);
  }
  
  console.log(`\nProcessing ${fileName}...`);
  
  // 匹配所有图片链接
  const imageRegex = /!\[([^\]]*)\]\((https:\/\/latex\.artofproblemsolving\.com[^)]+)\)/g;
  const matches = Array.from(content.matchAll(imageRegex));
  
  if (matches.length === 0) {
    console.log(`  No online images found`);
    return;
  }
  
  console.log(`  Found ${matches.length} images to process`);
  
  let updatedContent = content;
  let processedCount = 0;
  
  // 处理每个图片
  for (const match of matches) {
    const [fullMatch, altText, imageUrl] = match;
    const fileName = getFileNameFromUrl(imageUrl);
    const localPath = join(yearDir, fileName);
    const relativePath = `images/${year}/${fileName}`;
    
    // 下载图片
    const success = await downloadImage(imageUrl, localPath);
    
    if (success) {
      // 替换URL为本地路径
      updatedContent = updatedContent.replace(fullMatch, `![${altText}](${relativePath})`);
      processedCount++;
    }
  }
  
  // 保存更新后的文件
  if (processedCount > 0) {
    await writeFile(filePath, updatedContent, 'utf-8');
    console.log(`  Updated ${fileName} with ${processedCount} local image paths`);
  }
}

/**
 * 主函数
 */
async function main() {
  console.log(`AMC8 图片下载工具 - ${year}年`);
  console.log('==================\n');
  
  const fileName = `AMC_8_${year}_Problems.md`;
  const filePath = join(RESOURCES_DIR, fileName);
  
  // 检查文件是否存在
  if (!existsSync(filePath)) {
    console.error(`File ${fileName} not found`);
    process.exit(1);
  }
  
  // 处理文件
  await processMarkdownFile(fileName);
  
  // 统计信息
  console.log('\n==================');
  console.log(`${year}年处理完成！`);
  console.log(`下载: ${downloadedCount} 张图片`);
  console.log(`跳过: ${skippedCount} 张图片（已存在）`);
  console.log(`失败: ${failedCount} 张图片`);
}

// 运行主函数
main().catch(console.error);