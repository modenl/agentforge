#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { 
  ListToolsRequestSchema,
  CallToolRequestSchema 
} from '@modelcontextprotocol/sdk/types.js';
import { readFile, readdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';

const __dirname = dirname(fileURLToPath(import.meta.url));
const RESOURCES_DIR = join(__dirname, '..', '..', 'resources');

// 缓存图片的base64数据
const imageCache = new Map();

/**
 * 将图片转换为base64（支持本地路径和URL）
 */
async function convertImageToBase64(imagePath) {
  if (imageCache.has(imagePath)) {
    return imageCache.get(imagePath);
  }

  try {
    let imageData;
    
    // 判断是本地路径还是URL
    if (imagePath.startsWith('images/')) {
      // 本地路径
      const fullPath = join(RESOURCES_DIR, imagePath);
      imageData = await readFile(fullPath);
    } else if (imagePath.startsWith('http')) {
      // URL
      const response = await axios.get(imagePath, { 
        responseType: 'arraybuffer',
        timeout: 30000 // 30秒超时
      });
      imageData = Buffer.from(response.data);
    } else {
      // 未知格式，返回原路径
      return imagePath;
    }
    
    const base64 = imageData.toString('base64');
    const dataUri = `data:image/png;base64,${base64}`;
    imageCache.set(imagePath, dataUri);
    return dataUri;
  } catch (error) {
    console.error(`Failed to convert image: ${imagePath}`, error.message);
    return imagePath; // 返回原路径作为fallback
  }
}

/**
 * 处理Markdown内容，将图片链接转换为base64，并移除重复的LaTeX
 */
async function processMarkdown(content) {
  // 匹配所有图片链接，包括包含[asy]代码的复杂格式
  // 使用更宽松的匹配来处理 ![[asy]...[/asy]](url) 格式
  const imageRegex = /!\[([\s\S]*?)\]\(([^)]+)\)/g;
  const matches = Array.from(content.matchAll(imageRegex));
  
  if (matches.length === 0) {
    return content;
  }
  
  let processedContent = content;
  
  // 并行处理所有图片，但限制并发数
  const batchSize = 5;
  for (let i = 0; i < matches.length; i += batchSize) {
    const batch = matches.slice(i, i + batchSize);
    const replacements = await Promise.all(
      batch.map(async (match) => {
        const [fullMatch, altText, imagePath] = match;
        // 只处理本地图片和LaTeX URL
        if (imagePath.startsWith('images/') || imagePath.includes('latex.artofproblemsolving.com')) {
          const base64 = await convertImageToBase64(imagePath);
          // 如果alt text包含[asy]代码，简化为"图形"
          const simplifiedAltText = altText.includes('[asy]') ? '图形' : altText;
          
          // 对于几何图形（包含[asy]的），使用HTML img标签控制大小
          if (altText.includes('[asy]')) {
            // 使用HTML img标签，设置合适的宽度
            return {
              original: fullMatch,
              replacement: `<img src="${base64}" alt="${simplifiedAltText}" style="max-width: 300px; height: auto;">`
            };
          } else {
            return {
              original: fullMatch,
              replacement: `![${simplifiedAltText}](${base64})`
            };
          }
        }
        // 其他链接保持不变
        return null;
      })
    );
    
    // 替换这批图片链接
    replacements.forEach((replacement) => {
      if (replacement) {
        processedContent = processedContent.replace(replacement.original, replacement.replacement);
      }
    });
  }
  
  return processedContent;
}

/**
 * 解析题目文件，提取单个题目
 */
async function extractProblem(filePath, problemNumber) {
  const content = await readFile(filePath, 'utf-8');
  const problems = content.split(/^## Problem \d+$/m);
  
  if (problemNumber < 1 || problemNumber >= problems.length) {
    throw new Error(`Problem ${problemNumber} not found in file`);
  }
  
  // 获取题目内容（包括标题）
  const problemContent = `## Problem ${problemNumber}${problems[problemNumber]}`;
  
  // 去除结尾的分隔线
  const cleanContent = problemContent.replace(/\n---\s*$/, '').trim();
  
  // 处理图片
  return await processMarkdown(cleanContent);
}

/**
 * 获取所有可用的年份
 */
async function getAvailableYears() {
  const files = await readdir(RESOURCES_DIR);
  const years = files
    .filter(f => f.match(/^AMC_8_(\d{4})_Problems\.md$/))
    .map(f => parseInt(f.match(/(\d{4})/)[1]))
    .sort((a, b) => b - a);
  return years;
}

/**
 * 随机选择年份和题目
 */
async function randomProblem() {
  const years = await getAvailableYears();
  const year = years[Math.floor(Math.random() * years.length)];
  const problemNumber = Math.floor(Math.random() * 25) + 1;
  
  const filePath = join(RESOURCES_DIR, `AMC_8_${year}_Problems.md`);
  const content = await extractProblem(filePath, problemNumber);
  
  return {
    year,
    problemNumber,
    content
  };
}

// 创建MCP服务器
const server = new Server({
  name: 'amc8-quiz-mcp',
  version: '1.0.0',
}, {
  capabilities: {
    tools: {},
  },
});

// 注册工具列表处理器
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'get_problem',
      description: '获取指定年份和题号的AMC8题目',
      inputSchema: {
        type: 'object',
        properties: {
          year: {
            type: 'integer',
            description: '年份（1999-2025）',
            minimum: 1999,
            maximum: 2025
          },
          problemNumber: {
            type: 'integer',
            description: '题号（1-25）',
            minimum: 1,
            maximum: 25
          }
        },
        required: ['year', 'problemNumber']
      }
    },
    {
      name: 'random_problem',
      description: '随机选择一道AMC8题目',
      inputSchema: {
        type: 'object',
        properties: {}
      }
    },
    {
      name: 'get_problem_set',
      description: '获取某年的完整题目集（25道题）',
      inputSchema: {
        type: 'object',
        properties: {
          year: {
            type: 'integer',
            description: '年份（1999-2025）',
            minimum: 1999,
            maximum: 2025
          }
        },
        required: ['year']
      }
    },
    {
      name: 'random_problem_set',
      description: '随机选择一年的完整题目集',
      inputSchema: {
        type: 'object',
        properties: {}
      }
    },
    {
      name: 'list_years',
      description: '列出所有可用的AMC8年份',
      inputSchema: {
        type: 'object',
        properties: {}
      }
    }
  ]
}));

// 注册工具调用处理器
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'get_problem': {
        const { year, problemNumber } = args;
        
        if (!year || !problemNumber) {
          throw new Error(`Missing required arguments. Expected: {year, problemNumber}, Got: ${JSON.stringify(args)}`);
        }
        
        const filePath = join(RESOURCES_DIR, `AMC_8_${year}_Problems.md`);
        const content = await extractProblem(filePath, problemNumber);
        
        // 解析选项（查找 (A), (B), (C), (D), (E) 格式）
        const optionRegex = /\(([A-E])\)\s*([^\(]+?)(?=\s*\([A-E]\)|$)/g;
        const options = [];
        let match;
        while ((match = optionRegex.exec(content)) !== null) {
          options.push({
            letter: match[1],
            value: match[2].trim()
          });
        }
        
        return {
          content: [{
            type: 'text',
            text: content
          }],
          // 返回结构化数据，前端可以直接使用
          metadata: {
            year,
            problemNumber,
            options: options.length === 5 ? options : null,
            requiresAssistCard: true
          }
        };
      }

      case 'random_problem': {
        const { year, problemNumber, content } = await randomProblem();
        
        return {
          content: [{
            type: 'text',
            text: `# AMC8 ${year} - Problem ${problemNumber}\n\n${content}`
          }]
        };
      }

      case 'get_problem_set': {
        const { year } = args;
        const filePath = join(RESOURCES_DIR, `AMC_8_${year}_Problems.md`);
        const fullContent = await readFile(filePath, 'utf-8');
        const processedContent = await processMarkdown(fullContent);
        
        return {
          content: [{
            type: 'text',
            text: processedContent
          }]
        };
      }

      case 'random_problem_set': {
        const years = await getAvailableYears();
        const year = years[Math.floor(Math.random() * years.length)];
        const filePath = join(RESOURCES_DIR, `AMC_8_${year}_Problems.md`);
        const fullContent = await readFile(filePath, 'utf-8');
        const processedContent = await processMarkdown(fullContent);
        
        return {
          content: [{
            type: 'text',
            text: processedContent
          }]
        };
      }

      case 'list_years': {
        const years = await getAvailableYears();
        
        return {
          content: [{
            type: 'text',
            text: `可用的AMC8年份：\n${years.join(', ')}`
          }]
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: `Error: ${error.message}`
      }],
      isError: true
    };
  }
});

// 启动服务器
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('AMC8 Quiz MCP Server running...');
}

main().catch(console.error);