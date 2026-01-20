# Islands MPA - Bun + Hono + Preact

[![Bun](https://img.shields.io/badge/Bun-1.3.1-FFE135?logo=bun)](https://bun.sh)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Preact](https://img.shields.io/badge/Preact-10.28.2-purple?logo=react)](https://preactjs.com/)
[![Hono](https://img.shields.io/badge/Hono-4.11.4-orange)](https://hono.dev/)

一个基于 **Islands 架构** 的现代多页面应用（MPA），使用 Bun 运行时、Hono Web 框架和 Preact 前端库。项目结合了服务端渲染（SSR）的高性能和客户端部分 hydration 的交互性。

## ✨ 特性

- **🏝️ Islands 架构** - 仅交互式组件在客户端 hydrate，静态内容保持为 HTML
- **🚀 服务端渲染** - 页面在服务端渲染为完整 HTML，SEO 友好
- **⚡ 快速开发** - Bun 运行时 + 热重载 + TypeScript 类型安全
- **📦 零配置** - 基于 Bun 的内置工具链，开箱即用
- **🔧 自动生成** - 脚本自动扫描和注册岛组件

## 🛠️ 技术栈

- **运行时**: [Bun](https://bun.sh) v1.3.1
- **语言**: [TypeScript](https://www.typescriptlang.org/) (ESNext)
- **前端**: [Preact](https://preactjs.com/) v10.28.2 (轻量级 React)
- **后端**: [Hono](https://hono.dev/) v4.11.4 (Web 框架)
- **SSR**: [preact-render-to-string](https://github.com/preactjs/preact-render-to-string) v6.6.5
- **架构**: Islands 架构 (部分 hydration)

## 🚀 快速开始

### 安装依赖

```bash
bun install
```

### 开发模式 (带热重载)

```bash
bun run dev
```

开发服务器将在 [http://localhost:3000](http://localhost:3000) 启动。

### 构建和运行

```bash
# 构建客户端代码
bun run build:client

# 启动生产服务器
bun run start
```

## 📁 项目结构

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
│   ├── entry-client.tsx  # 客户端 hydration 入口
│   └── server.tsx        # 服务端入口 (Hono 服务器)
├── scripts/
│   └── generate-islands.ts  # 岛组件自动生成脚本
├── public/               # 静态文件和构建产物
│   └── entry-client.js   # 客户端构建产物
├── package.json          # 项目配置和依赖
└── tsconfig.json         # TypeScript 配置
```

## 🎯 开发工作流

### 1. 创建岛组件

在 `src/islands/` 目录下创建 `.tsx` 文件，使用 PascalCase 命名：

```tsx
// src/islands/MyComponent.tsx
import { useState } from 'preact/hooks';

export default function MyComponent() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>Count: {count}</button>;
}
```

### 2. 在页面中使用

在页面组件中标记岛组件：

```tsx
// 在页面组件中
<div
  data-island="my-component" // kebab-case 版本
  data-props={JSON.stringify({ initial: 0 })}
>
  {/* 服务端占位符 */}
  <div class="animate-pulse bg-gray-200 h-10 w-full" />
</div>
```

### 3. 自动注册

开发服务器会自动运行生成脚本，或手动执行：

```bash
bun run generate:islands
```

## 📖 可用命令

| 命令                       | 描述                    |
| -------------------------- | ----------------------- |
| `bun run dev`              | 启动开发服务器 (热重载) |
| `bun run generate:islands` | 生成岛组件注册表        |
| `bun run build:client`     | 构建客户端代码          |
| `bun run build`            | 构建整个项目            |
| `bun run start`            | 启动生产服务器          |

## 🏝️ Islands 架构原理

1. **服务端渲染** - 页面在服务端使用 Preact 渲染为完整 HTML
2. **组件标记** - 交互式组件被标记为 `data-island` 属性
3. **部分 hydration** - 客户端仅加载和 hydrate 这些岛组件
4. **静态内容** - 非交互部分保持为纯 HTML，无需 JavaScript 开销

## 🔧 配置

### TypeScript 配置

项目使用现代 TypeScript 配置，支持：

- Preact JSX (`jsxImportSource: "preact"`)
- ESNext 模块
- 严格类型检查
- 自动类型导入

### Bun 配置

- 内置打包器和压缩
- 热重载支持
- 快速的 TypeScript 编译

## 🤝 贡献

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 打开 Pull Request

## 📄 许可证

本项目基于 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- [Bun](https://bun.sh) - 快速的 JavaScript 运行时，引擎
- [Hono](https://hono.dev) - 轻量级 Web 框架，骨架
- [Preact](https://preactjs.com) - 快速的 React 替代品, 当然也可以尝试fre,solidJS等
- [Islands Architecture](https://jasonformat.com/islands-architecture/) - 架构灵感

---

**提示**: 查看 [production.md](production.md) 获取项目完整文档。
