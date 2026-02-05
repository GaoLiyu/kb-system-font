import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import pluginVue from 'eslint-plugin-vue'
import vueParser from 'vue-eslint-parser'

/** @type {import('eslint').Linter.FlatConfig[]} */
export const baseConfig = [
  // 忽略文件
  {
    ignores: ['**/dist/**', '**/node_modules/**', '**/.git/**', '**/coverage/**', '**/*.min.js'],
  },

  // JavaScript 基础规则
  js.configs.recommended,

  // TypeScript 规则
  ...tseslint.configs.recommended,

  // 通用规则覆盖
  {
    rules: {
      // TypeScript 相关
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',

      // 通用
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'warn',
      'prefer-const': 'warn',
    },
  },
]

/** @type {import('eslint').Linter.FlatConfig[]} */
export const vueConfig = [
  ...baseConfig,

  // Vue 文件配置
  ...pluginVue.configs['flat/recommended'],

  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tseslint.parser,
        ecmaVersion: 'latest',
        sourceType: 'module',
        extraFileExtensions: ['.vue'],
      },
    },
    rules: {
      // Vue 特定规则
      'vue/multi-word-component-names': 'off',
      'vue/no-v-html': 'off',
      'vue/require-default-prop': 'off',
      'vue/html-self-closing': [
        'warn',
        {
          html: { void: 'always', normal: 'never', component: 'always' },
          svg: 'always',
          math: 'always',
        },
      ],
      'vue/max-attributes-per-line': [
        'warn',
        {
          singleline: 3,
          multiline: 1,
        },
      ],
      'vue/singleline-html-element-content-newline': 'off',
      'vue/max-lines-per-block': ['warn', {
        script: 300,
        template: 200,
        style: 100,
      }],
    },
  },
]

export default vueConfig
