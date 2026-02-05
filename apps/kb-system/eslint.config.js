import { vueConfig } from '@kb/eslint-config'
import autoImportGlobals from './.eslintrc-auto-import.json' with { type: 'json' }

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  ...vueConfig,

  // 自动导入的全局变量
  {
    languageOptions: {
      globals: autoImportGlobals.globals,
    },
  },
]
