# Project Documentation: bun-php

## 项目定位
基于INIT.md教程创建的Islands架构MPA项目，使用Bun运行时、Hono框架和Preact，实现服务端渲染与客户端部分hydration的现代Web应用。

## 核心架构
```
客户端 (前端)
├── Preact岛组件 (Islands)
├── 部分hydration (Partial Hydration)
├── JSX语法支持
└── TypeScript类型安全

服务端 (后端)
├── Hono Web框架 (路由和静态文件)
├── Preact服务端渲染 (SSR)
├── Bun运行时
└── TypeScript

构建与开发
├── 自动岛组件注册 (generate-islands脚本)
├── Bun内置打包器
├── TypeScript编译器
└── 热重载开发服务器
```

## 技术栈
- **运行时**: Bun v1.3.1
- **语言**: TypeScript (ESNext)
- **前端框架**: Preact v10.28.2 (React兼容)
- **后端框架**: Hono v4.11.4
- **SSR渲染**: preact-render-to-string v6.6.5
- **架构模式**: Islands架构 (部分hydration)
- **构建工具**: Bun内置打包器
- **包管理器**: Bun
- **JSX引擎**: Preact JSX (配置于tsconfig.json)

## 目录结构说明
```
bun-php/
├── src/
│   ├── islands/           # 岛组件 (交互式组件)
│   │   └── Counter.tsx    # 示例计数器组件
│   ├── pages/            # 页面组件
│   │   ├── index.tsx     # 首页
│   │   └── about.tsx     # 关于页面
│   ├── components/       # 共享组件
│   │   └── Layout.tsx    # 布局组件
│   ├── islands.generated.ts  # 自动生成的岛组件注册表
│   ├── entry-client.tsx  # 客户端hydration入口
│   └── server.tsx        # 服务端入口 (Hono服务器)
├── scripts/
│   └── generate-islands.ts  # 岛组件自动生成脚本
├── public/               # 静态文件和构建产物
│   └── entry-client.js   # 客户端构建产物
├── package.json          # 项目配置和依赖
├── tsconfig.json         # TypeScript配置 (支持Preact JSX)
├── README.md             # 项目说明
├── INIT.md               # 项目初始化教程 (Islands架构实现)
├── CLAUDE.md             # Claude Code执行协议
├── .gitignore            # Git忽略配置
├── .claudecode.json      # Claude Code配置
├── schema/               # 任务文档目录
│   ├── archive/          # 已归档任务
│   │   ├── task_init_260120_083616.md      # 初始探索任务 (已完成)
│   │   ├── task_islands_260120_085954.md   # Islands架构实现任务 (已完成)
│   │   └── task_readme_260120_092348.md    # README更新任务 (已完成)
│   └── (新的任务文档将创建于此)
└── node_modules/         # 依赖包目录
```

## 部署流程

### 开发环境
1. **安装依赖**
   ```bash
   bun install
   ```

2. **启动开发服务器 (带热重载)**
   ```bash
   bun run dev
   ```

3. **开发命令**
   - 生成岛组件注册表: `bun run generate:islands`
   - 开发模式 (热重载): `bun run dev`
   - 构建客户端代码: `bun run build:client`
   - 启动生产服务器: `bun run start`

### 生产构建
1. **构建客户端代码**
   ```bash
   bun run build
   ```

2. **启动生产服务器**
   ```bash
   bun run start
   ```

### 项目初始化步骤
1. 确保Bun已安装 (`curl -fsSL https://bun.sh/install | bash`)
2. 克隆项目仓库
3. 运行 `bun install` 安装依赖
4. 运行 `bun run build:client` 构建客户端代码
5. 运行 `bun run start` 启动项目

## 项目状态
- **创建时间**: 基于INIT.md教程创建于 2026-01-20
- **当前版本**: Islands架构实现版本
- **代码状态**: 完整的Islands架构MPA，包含计数器示例
- **依赖状态**: 已安装Hono、Preact、preact-render-to-string等依赖
- **运行状态**: 项目可正常运行，支持开发模式 (bun run dev) 和生产模式 (bun run start)
- **任务归档**: 三个核心任务已完成并归档至 schema/archive/
  - ✅ `task_init_260120_083616.md` - 项目探索和production.md创建
  - ✅ `task_islands_260120_085954.md` - Islands架构实现
  - ✅ `task_readme_260120_092348.md` - README.md更新

## Islands架构特性
1. **服务端渲染**: 页面在服务端渲染为完整HTML
2. **部分hydration**: 仅交互式组件在客户端hydrate
3. **自动注册**: 脚本自动扫描和注册岛组件
4. **类型安全**: TypeScript全程类型支持
5. **开发体验**: 热重载、类型检查、自动生成

## 下一步开发方向
1. 添加更多岛组件 (表单、图表、交互模块)
2. 扩展API路由和数据获取
3. 添加状态管理 (Signals或Context)
4. 集成数据库或外部API
5. 添加测试 (单元测试和端到端测试)
6. 部署到生产环境 (Docker、云平台)

## 注意事项
- 岛组件必须放在 `src/islands/` 目录下，使用 `.tsx` 扩展名
- 组件文件名使用PascalCase，使用时转为kebab-case (如 `Counter` → `data-island="counter"`)
- `islands.generated.ts` 是自动生成文件，不要手动编辑
- 开发时运行 `bun run dev` 会自动生成岛组件注册表
- TypeScript配置已支持Preact JSX和严格类型检查