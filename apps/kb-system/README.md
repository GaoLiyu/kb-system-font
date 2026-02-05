# 房地产估价知识库 - Web前端

Vue3 + TypeScript + Element Plus

## 快速开始

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建
npm run build
```

## 页面

1. **知识库管理** `/kb`
   - 查看统计信息
   - 上传报告
   - 删除报告
   - 重建向量索引

2. **案例搜索** `/search`
   - 混合搜索（向量+规则）
   - 语义搜索
   - 字段搜索
   - 查看案例详情

## 配置

### API代理

开发模式下，Vite会将 `/api` 请求代理到 `http://localhost:8000`。

修改 `vite.config.ts`：

```ts
proxy: {
  '/api': {
    target: 'http://localhost:8000',
    changeOrigin: true,
  },
}
```

### Token

在左侧边栏底部输入API Token进行认证。

## 技术栈

- Vue 3.4
- TypeScript 5
- Vue Router 4
- Element Plus 2.4
- Axios
- Vite 5

## 快速启动（扩展）

前提

- 本机需安装 Node.js 20.x 及 pnpm 10.x 以上版本
- 需要后端服务在本地运行，端口 5568，前端通过 /api 代理访问

快速步骤

1. 安装依赖（工作区）

```bash
pnpm install
```

2. 启动前端开发服务器（在工作区针对 kb-system）

```bash
pnpm --filter @kb/system dev
```

- 或进入子项目并独立启动：

```bash
cd apps/kb-system
pnpm install
pnpm dev
```

3. 访问

- 前端： http://localhost:3000
- API 代理：前端请求 /api 将代理到 http://localhost:5568

4. 构建/预览

```bash
pnpm --filter @kb/system build
pnpm --filter @kb/system preview
```

高级

- 在根工作区使用筛选器：`pnpm -F @kb/system dev`
- 如后端地址变更，请修改 `vite.config.ts` 中的 proxy 配置

## 架构简述

- 前端：Vue 3 + Vite + TypeScript
- 路由：vue-router 模块化
- 状态管理：Pinia
- 组件库：Element Plus
- 权限/路由守卫、指令等在 `src` 目录中初始化

## 常见问题与故障排查

- pnpm: command not found
  - 解决：安装 pnpm，例如 `npm i -g pnpm`
- 5568 端口不可用
  - 启动后端服务，或在 `apps/kb-system/vite.config.ts` 里修改 proxy 指向正确地址
- 依赖安装失败（网络等原因）
  - 检查网络、切换镜像源后重试 `pnpm install`
