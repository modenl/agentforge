module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
    node: true,
    jest: true
  },
  extends: [
    'eslint:recommended'
  ],
  plugins: ['svelte'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: {
    'indent': ['warn', 2],
    // 'linebreak-style': ['error', 'unix'], // 移除以支持跨平台
    'quotes': ['error', 'single'],
    'semi': ['error', 'always'],
    'no-unused-vars': ['warn'],
    'no-console': ['warn'],
    'no-debugger': ['error'],
    'no-trailing-spaces': ['error'],
    'eol-last': ['error'],
    'comma-dangle': ['error', 'never'],
    'object-curly-spacing': ['error', 'always'],
    'array-bracket-spacing': ['error', 'never'],
    'space-before-function-paren': ['error', 'never'],
    'keyword-spacing': ['error'],
    'space-infix-ops': ['error'],
    'no-multiple-empty-lines': ['error', { max: 2 }],
    'max-len': ['warn', {
      code: 120,
      ignoreComments: true,
      ignoreUrls: true,
      ignoreStrings: true,
      ignoreTemplateLiterals: true,
      ignoreRegExpLiterals: true
    }]
  },
  globals: {
    'process': 'readonly',
    '__dirname': 'readonly',
    '__filename': 'readonly',
    'module': 'readonly',
    'require': 'readonly',
    'exports': 'readonly',
    'global': 'readonly'
  },
  overrides: [
    {
      files: ['framework/renderer/**/*.js'],
      env: {
        browser: true,
        node: false
      },
      globals: {
        'electronAPI': 'readonly'
      }
    },
    {
      files: ['framework/core/**/*.js', 'framework/launcher.js', 'apps/**/mcp-actions/*.js'],
      env: {
        node: true,
        browser: false
      }
    },
    {
      files: ['**/*.test.js', '**/*.spec.js'],
      env: {
        jest: true
      },
      rules: {
        'no-console': 'off'
      }
    },
    {
      files: ['**/*.svelte'],
      processor: 'svelte/svelte',
      parser: 'svelte-eslint-parser',
      parserOptions: {
        parser: '@typescript-eslint/parser'
      },
      rules: {
        // Svelte特定规则
        'svelte/no-at-debug-tags': 'warn',
        'svelte/no-unused-svelte-ignore': 'error',
        'svelte/no-dupe-else-if-blocks': 'error',
        'svelte/no-dupe-style-properties': 'error',
        'svelte/no-dynamic-slot-name': 'error',
        'svelte/no-export-load-in-svelte-module-in-kit-pages': 'error',
        'svelte/no-not-function-handler': 'error',
        'svelte/no-object-in-text-mustaches': 'error',
        'svelte/no-reactive-functions': 'error',
        'svelte/no-reactive-literals': 'error',
        'svelte/no-shorthand-style-property-overrides': 'error',
        'svelte/no-unknown-style-directive-property': 'error',
        'svelte/no-useless-mustaches': 'error',
        'svelte/require-store-reactive-access': 'error',

        // 样式规则
        'svelte/derived-has-same-inputs-outputs': 'error',
        'svelte/first-attribute-linebreak': ['error', {
          'multiline': 'below',
          'singleline': 'beside'
        }],
        'svelte/html-closing-bracket-spacing': 'error',
        'svelte/html-quotes': ['error', { 'prefer': 'double' }],
        'svelte/html-self-closing': 'error',
        'svelte/indent': ['warn', { 'indent': 2 }],
        'svelte/max-attributes-per-line': ['error', {
          'multiline': 1,
          'singleline': 3
        }],
        'svelte/mustache-spacing': 'error',
        'svelte/no-spaces-around-equal-signs-in-attribute': 'error',
        'svelte/prefer-class-directive': 'error',
        'svelte/prefer-style-directive': 'error',
        'svelte/shorthand-attribute': 'error',
        'svelte/shorthand-directive': 'error',
        'svelte/spaced-html-comment': 'error',

        // 禁用在Svelte文件中有问题的标准规则
        'no-undef': 'off', // Svelte编译器处理这个
        'no-unused-vars': 'off', // Svelte编译器处理这个
        'no-self-assign': 'off', // Svelte响应式语句需要这个
        'no-inner-declarations': 'off', // Svelte脚本块中允许函数声明
        'no-multiple-empty-lines': ['error', { 'max': 2, 'maxBOF': 1, 'maxEOF': 0 }],

        // 允许在开发中使用console
        'no-console': 'warn',

        // 调整一些过于严格的Svelte规则
        'svelte/valid-compile': 'warn', // 未使用的CSS选择器改为警告
        'svelte/sort-attributes': 'off', // 关闭属性排序要求
        'svelte/no-unused-class-name': 'off', // 关闭未使用class检查
        'svelte/no-dom-manipulating': 'warn', // DOM操作改为警告

        // 关闭通用indent规则，避免与svelte/indent重复
        'indent': 'off'
      }
    }
  ]
};
