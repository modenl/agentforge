/** @type {import('svelte/types/compiler/interfaces').CompileOptions} */
const config = {
  // 编译器选项
  dev: true,
  generate: 'dom',
  css: true,
  legacy: false,

  // 警告处理
  onwarn: (warning, handler) => {
    // 忽略某些类型的警告
    if (warning.code === 'css-unused-selector') {
      return;
    }
    if (warning.code === 'a11y-click-events-have-key-events') {
      return;
    }
    if (warning.code === 'a11y-no-static-element-interactions') {
      return;
    }
    if (warning.code === 'a11y-no-noninteractive-element-interactions') {
      return;
    }

    // 对于其他警告，使用默认处理
    handler(warning);
  }
};

export default config;
