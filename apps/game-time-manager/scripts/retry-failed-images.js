#!/usr/bin/env node

import { readFile, writeFile, readdir } from 'fs/promises';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';
import { existsSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const RESOURCES_DIR = join(__dirname, '..', 'resources');
const IMAGES_DIR = join(__dirname, '..', 'resources', 'images');

// 统计信息
let downloadedCount = 0;
let failedCount = 0;
let alreadyLocalCount = 0;

/**
 * 从URL生成文件名
 */
function getFileNameFromUrl(url) {
  return url.split('/').pop();
}

/**
 * 下载图片（带重试）
 */
async function downloadImageWithRetry(url, savePath, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`  Attempt ${attempt}/${maxRetries}: ${basename(savePath)}`);
      const response = await axios.get(url, { 
        responseType: 'arraybuffer',
        timeout: 60000, // 60秒超时
        httpsAgent: new (await import('https')).Agent({
          rejectUnauthorized: false
        }),
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      await writeFile(savePath, response.data);
      console.log(`  ✓ Success: ${basename(savePath)}`);
      downloadedCount++;
      return true;
    } catch (error) {
      console.error(`  ✗ Attempt ${attempt} failed: ${error.message}`);
      if (attempt === maxRetries) {
        console.error(`  ✗ Failed after ${maxRetries} attempts: ${basename(savePath)}`);
        failedCount++;
        return false;
      }
      // 等待一下再重试
      await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
    }
  }
}

/**
 * 处理单个markdown文件，找出并下载失败的图片
 */
async function processMarkdownFile(fileName) {
  const filePath = join(RESOURCES_DIR, fileName);
  const content = await readFile(filePath, 'utf-8');
  
  // 提取年份
  const yearMatch = fileName.match(/AMC_8_(\d{4})_Problems\.md/);
  if (!yearMatch) {
    return;
  }
  
  const year = yearMatch[1];
  const yearDir = join(IMAGES_DIR, year);
  
  console.log(`\nProcessing ${fileName}...`);
  
  // 匹配所有在线图片链接
  // 先找到所有 artofproblemsolving.com 的 URL
  const urlRegex = /https:\/\/latex\.artofproblemsolving\.com[^)\s]+\.png/g;
  const urlMatches = Array.from(content.matchAll(urlRegex));
  
  if (urlMatches.length === 0) {
    console.log(`  No online images found`);
    return;
  }
  
  console.log(`  Found ${urlMatches.length} online image URLs`);
  
  let updatedContent = content;
  let processedCount = 0;
  
  // 处理每个图片URL
  for (const match of urlMatches) {
    const imageUrl = match[0];
    const fileName = getFileNameFromUrl(imageUrl);
    const localPath = join(yearDir, fileName);
    const relativePath = `images/${year}/${fileName}`;
    
    // 如果本地文件不存在，尝试下载
    if (!existsSync(localPath)) {
      console.log(`\nDownloading missing image: ${fileName}`);
      const success = await downloadImageWithRetry(imageUrl, localPath);
      
      if (success) {
        // 替换URL为本地路径
        updatedContent = updatedContent.replace(imageUrl, relativePath);
        processedCount++;
      }
    } else {
      // 文件已存在但还在使用URL，直接替换
      updatedContent = updatedContent.replace(imageUrl, relativePath);
      processedCount++;
      alreadyLocalCount++;
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
  console.log('AMC8 失败图片重试工具');
  console.log('====================\n');
  
  // 获取所有markdown文件
  const files = await readdir(RESOURCES_DIR);
  const problemFiles = files
    .filter(f => f.match(/^AMC_8_\d{4}_Problems\.md$/))
    .sort();
  
  console.log(`Found ${problemFiles.length} problem files\n`);
  
  // 首先检查哪些文件还有在线URL
  const filesWithOnlineUrls = [];
  for (const file of problemFiles) {
    const content = await readFile(join(RESOURCES_DIR, file), 'utf-8');
    if (content.includes('https://latex.artofproblemsolving.com')) {
      filesWithOnlineUrls.push(file);
    }
  }
  
  console.log(`Files still containing online URLs: ${filesWithOnlineUrls.length}`);
  if (filesWithOnlineUrls.length > 0) {
    console.log(filesWithOnlineUrls.join(', '));
  }
  
  // 处理每个有在线URL的文件
  for (const file of filesWithOnlineUrls) {
    await processMarkdownFile(file);
  }
  
  // 统计信息
  console.log('\n====================');
  console.log('处理完成！');
  console.log(`新下载: ${downloadedCount} 张图片`);
  console.log(`已存在但更新链接: ${alreadyLocalCount} 张图片`);
  console.log(`失败: ${failedCount} 张图片`);
  
  if (failedCount > 0) {
    console.log('\n仍有部分图片下载失败，可能需要手动处理或使用其他方法。');
  }
}

// 运行主函数
main().catch(console.error);