# KB Workspace

Web 前端与共用工具的单体/多包工作区，包含若干前端应用，采用 TypeScript、Vue3、Vite 构建。核心运行通过 Turbo 管理多包任务。

## 目录结构

- apps/kb-system: KB 系统前端单体应用
- 其他子包（如有）按同样结构组织，均在 apps 目录下
- package.json: 顶层工作区配置，定义了 dev/build/lint 等跨包命令
- turbo 配置与各包的独立依赖

## 运行前提

- Node.js 版本: >= 20
- pnpm 版本: >= 10
- 后端 API 服务（对接点）: 代理到 http://127.0.0.1:5568（如前端应用使用 /api）

## 快速开始

1. 安装依赖

```bash
pnpm install
```

2. 启动开发服务器（全工作区）

```bash
pnpm dev
```

或者只启动某个包，例如 kb-system

```bash
pnpm --filter @kb/system dev
```

3. 构建与预览

```bash
pnpm build
pnpm preview
```

4. 常见地址

- 前端: http://localhost:3000
- API 代理: /api 将请求转发到后端 http://localhost:5568

## 启动单独应用（示例：kb-system）

cd apps/kb-system
pnpm install
pnpm dev

## 进阶用法

- 使用筛选器执行指定包的命令，例如：
  - pnpm --filter @kb/system dev
  - pnpm --filter @kb/system build
- 根工作区脚本依赖 Turbo，运行时请确保网络通畅以下载依赖。
- 如后端地址或代理配置变更，请修改 apps/kb-system/vite.config.ts 的 proxy 设置或后端地址。

## 架构与依赖简述

- 前端：Vue 3 + TypeScript + Vite
- 路由：vue-router
- 状态：Pinia
- UI：Element Plus
- 自动导入：unplugin-auto-import
- 全局配置、路由守卫、权限指令等均在源码中实现

## 常见故障排查

- 未安装 pnpm/Node 版本不符：请按前提条件升级
- 端口冲突或代理无法访问后端：确认后端服务已启动且代理配置正确
- 构建/类型检查错误：运行 `pnpm --filter @kb/system type-check` 查看类型问题

## 贡献与约定

- 本仓库使用 commitlint、lint-staged、prettier 保持提交风格与代码格式
- 提交前请确保本地通过 ESLint/TS 检查，必要时在 CI 通过后再推送

如需要，我可以继续扩展更多文档，例如 API 接口定义、组件/tutorial 级别的开发指南等。
