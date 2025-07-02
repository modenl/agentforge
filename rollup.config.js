import svelte from 'rollup-plugin-svelte';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
import terser from '@rollup/plugin-terser';
import css from 'rollup-plugin-css-only';

const production = !process.env.ROLLUP_WATCH;

export default {
  input: 'framework/renderer/svelte/main.js',
  output: {
    // 生成外部source map以支持VS Code调试器
    sourcemap: !production,
    sourcemapExcludeSources: false,
    // 优化VS Code调试器的源文件路径映射
    sourcemapPathTransform: (relativeSourcePath, sourcemapPath) => {
      // 确保VS Code能够正确映射到源文件
      const normalizedPath = relativeSourcePath.replace(/^\.\.\//, '').replace(/\\/g, '/');
      // 特别处理Svelte文件路径
      if (normalizedPath.includes('svelte/')) {
        console.log(`Svelte source map: ${relativeSourcePath} -> ${normalizedPath}`);
      }
      return normalizedPath;
    },
    format: 'iife',
    name: 'app',
    file: 'framework/renderer/bundle/bundle.js',
    // 开发模式下保持可读性
    compact: production,
    // 开发模式下保留更多调试信息
    indent: !production,
    // 禁用代码分割以支持IIFE格式
    inlineDynamicImports: true
  },
  plugins: [
    // JSON plugin for handling JSON imports
    json(),

    svelte({
      compilerOptions: {
        // enable run-time checks when not in production
        dev: !production,
        // 开发模式下保留源文件信息以支持调试
        css: true,
        // 为VS Code调试器生成更详细的源信息
        generate: 'dom',
        hydratable: false
      },
      // 开发模式下包含源文件信息
      emitCss: true
    }),
    // we'll extract any component CSS out into
    // a separate file - better for performance
    css({ output: 'bundle.css' }),

    // If you have external dependencies installed from
    // npm, you'll most likely need these plugins. In
    // some cases you'll need additional configuration -
    // consult the documentation for details:
    // https://github.com/rollup/plugins/tree/master/packages/commonjs
    resolve({
      browser: true,
      dedupe: ['svelte'],
      preferBuiltins: false
    }),
    commonjs({
      sourceMap: !production
    }),

    // In dev mode, call `npm run start` once the bundle has been generated
    // 但是如果已经有concurrently管理进程，就不要重复启动
    !production && !process.env.CONCURRENTLY_MANAGED && serve(),

    // 启用智能重载 - 文件变化时自动重新构建
    !production && livereload('framework/renderer/bundle'),

    // If we're building for production (npm run build
    // instead of npm run dev), minify
    production && terser()
  ],
  watch: {
    clearScreen: false,
    // 减少构建延迟以提高响应速度
    buildDelay: 50,
    // 包含所有源文件目录
    include: ['framework/**/*'],
    exclude: ['node_modules/**', 'dist/**', 'framework/renderer/bundle/**'],
    // 对Svelte文件变化更敏感
    chokidar: {
      usePolling: false,
      ignoreInitial: true
    }
  },
  // 开发模式下保留更多信息便于调试
  treeshake: production ? true : false,
  // 禁用代码分割以支持IIFE格式
  preserveEntrySignatures: false,
  // 开发模式启用source maps
  external: [],
  onwarn: (warning, warn) => {
    // 忽略某些警告，但保留调试信息
    if (warning.code === 'THIS_IS_UNDEFINED') return;
    // 忽略Svelte CSS相关警告
    if (warning.code === 'css-unused-selector') return;
    if (warning.message && warning.message.includes('Unused CSS selector')) return;
    warn(warning);
  }
};

function serve() {
  let server;

  function toExit() {
    if (server) server.kill(0);
  }

  return {
    writeBundle() {
      // 如果已经有concurrently管理，就不要启动新的进程
      if (process.env.CONCURRENTLY_MANAGED) {
        console.log('Bundle updated - ready for manual refresh (Ctrl+R)');
        return;
      }

      if (server) return;
      server = require('child_process').spawn('npm', ['run', 'start', '--', '--dev'], {
        stdio: ['ignore', 'inherit', 'inherit'],
        shell: true
      });

      process.on('SIGTERM', toExit);
      process.on('exit', toExit);
    }
  };
}

function livereload(watch) {
  return {
    name: 'livereload',
    writeBundle() {
      if (process.env.ROLLUP_WATCH !== 'false') {
        console.log('🔄 Bundle updated - Smart build complete');

        // 通知Electron进程刷新渲染器
        if (process.env.CONCURRENTLY_MANAGED) {
          console.log('💡 Hot reload: Electron should auto-refresh the renderer');
          // 发送刷新信号给主进程
          if (typeof process.send === 'function') {
            process.send({ type: 'RENDERER_RELOAD' });
          }
        }
      }
    }
  };
} 