#!/usr/bin/env node

import { readFile, writeFile, readdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const RESOURCES_DIR = join(__dirname, '..', 'resources');
const IMAGES_DIR = join(__dirname, '..', 'resources', 'images');

// 从命令行参数获取年份
const year = process.argv[2];
if (!year) {
  console.error('Usage: node update-markdown-local-images.js <year>');
  process.exit(1);
}

/**
 * 从URL生成文件名
 */
function getFileNameFromUrl(url) {
  return url.split('/').pop();
}

/**
 * 更新markdown文件使用本地图片
 */
async function updateMarkdownFile(fileName) {
  const filePath = join(RESOURCES_DIR, fileName);
  const content = await readFile(filePath, 'utf-8');
  
  // 检查是否已经使用本地图片
  if (content.includes('images/')) {
    console.log(`${fileName}: Already using local images`);
    return;
  }
  
  console.log(`\nUpdating ${fileName}...`);
  
  // 匹配所有图片链接
  const imageRegex = /!\[([^\]]*)\]\((https:\/\/latex\.artofproblemsolving\.com[^)]+)\)/g;
  const matches = Array.from(content.matchAll(imageRegex));
  
  if (matches.length === 0) {
    console.log(`  No online images found`);
    return;
  }
  
  console.log(`  Found ${matches.length} image references`);
  
  let updatedContent = content;
  let updatedCount = 0;
  let missingCount = 0;
  
  // 检查每个图片是否存在本地版本
  for (const match of matches) {
    const [fullMatch, altText, imageUrl] = match;
    const fileName = getFileNameFromUrl(imageUrl);
    const localPath = join(IMAGES_DIR, year, fileName);
    const relativePath = `images/${year}/${fileName}`;
    
    // 只有当本地文件存在时才替换
    if (existsSync(localPath)) {
      updatedContent = updatedContent.replace(fullMatch, `![${altText}](${relativePath})`);
      updatedCount++;
    } else {
      console.log(`  Missing local image: ${fileName}`);
      missingCount++;
    }
  }
  
  // 保存更新后的文件
  if (updatedCount > 0) {
    await writeFile(filePath, updatedContent, 'utf-8');
    console.log(`  Updated ${updatedCount} image references`);
    if (missingCount > 0) {
      console.log(`  Warning: ${missingCount} images not found locally`);
    }
  } else {
    console.log(`  No images were updated (all missing locally)`);
  }
}

/**
 * 主函数
 */
async function main() {
  console.log(`更新 AMC8 ${year}年 Markdown 文件`);
  console.log('=========================\n');
  
  const fileName = `AMC_8_${year}_Problems.md`;
  const filePath = join(RESOURCES_DIR, fileName);
  
  // 检查文件是否存在
  if (!existsSync(filePath)) {
    console.error(`File ${fileName} not found`);
    process.exit(1);
  }
  
  // 检查图片目录是否存在
  const yearImageDir = join(IMAGES_DIR, year);
  if (!existsSync(yearImageDir)) {
    console.error(`Image directory ${yearImageDir} not found`);
    console.log('Please download images first using download-single-year.js');
    process.exit(1);
  }
  
  // 列出图片目录中的文件数
  const imageFiles = await readdir(yearImageDir);
  console.log(`Found ${imageFiles.length} images in images/${year}/`);
  
  // 更新markdown文件
  await updateMarkdownFile(fileName);
  
  console.log('\n完成！');
}

// 运行主函数
main().catch(console.error);