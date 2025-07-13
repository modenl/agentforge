/**
 * Marked配置 - 包含KaTeX扩展
 */

import { marked } from 'marked';
import markedKatex from 'marked-katex-extension';
import { markedKatexImage } from './marked-katex-image.js';

// 配置marked-katex选项
const katexOptions = {
  throwOnError: false,  // 不抛出错误，而是显示错误信息
  displayMode: false,   // 默认使用行内模式
  trust: false,         // 不信任输入（安全）
  strict: false,        // 宽松模式
  output: 'html',       // 输出HTML
  macros: {
    "\\RR": "\\mathbb{R}",
    "\\NN": "\\mathbb{N}",
    "\\ZZ": "\\mathbb{Z}",
    "\\QQ": "\\mathbb{Q}",
    "\\CC": "\\mathbb{C}",
  }
};

// 配置marked使用自定义扩展和katex扩展
// 注意：顺序很重要，katex-image必须在katex之前，以便优先处理带LaTeX的图片
marked.use(markedKatexImage());
marked.use(markedKatex(katexOptions));

// 配置marked的其他选项
marked.setOptions({
  breaks: true,        // 支持换行符
  gfm: true,          // 支持GitHub Flavored Markdown
  headerIds: false,    // 不自动生成header ID
  mangle: false,      // 不转换邮箱地址
  sanitize: false,    // 不清理HTML（我们信任AI的输出）
});

// 导出配置好的marked
export { marked as markedWithKatex };