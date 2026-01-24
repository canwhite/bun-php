# Islands MPA - Bun + Hono + Preact

[![Bun](https://img.shields.io/badge/Bun-1.3.1-FFE135?logo=bun)](https://bun.sh)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Preact](https://img.shields.io/badge/Preact-10.28.2-purple?logo=react)](https://preactjs.com/)
[![Hono](https://img.shields.io/badge/Hono-4.11.4-orange)](https://hono.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1.18-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)

一个基于 **Islands 架构** 的现代多页面应用（MPA），使用 Bun 运行时、Hono Web 框架和 Preact 前端库。项目结合了服务端渲染（SSR）的高性能和客户端部分 hydration 的交互性，提供类似 Next.js App Router 的开发体验。

## ✨ 特性

- **🏝️ Islands 架构** - 仅交互式组件在客户端 hydrate，静态内容保持为 HTML
- **🚀 服务端渲染** - 页面在服务端渲染为完整 HTML，SEO 友好
- **📁 文件系统路由** - 类似 Next.js App Router 的自动路由生成
- **🔌 API 路由支持** - 基于文件系统的 API 端点自动生成
- **🎨 Tailwind CSS v4** - 现代化的原子化 CSS 框架，支持 PostCSS 处理
- **⚡ 快速开发** - Bun 运行时 + 热重载 + TypeScript 类型安全
- **🔧 自动生成** - 脚本自动扫描和注册岛组件、路由、API 端点
- **🌐 端口灵活配置** - 支持环境变量 PORT 配置，默认端口 5000

## 🛠️ 技术栈

- **运行时**: [Bun](https://bun.sh) v1.3.1
- **语言**: [TypeScript](https://www.typescriptlang.org/) (ESNext)
- **前端**: [Preact](https://preactjs.com/) v10.28.2 (轻量级 React)
- **后端**: [Hono](https://hono.dev/) v4.11.4 (Web 框架)
- **SSR**: [preact-render-to-string](https://github.com/preactjs/preact-render-to-string) v6.6.5
- **CSS 框架**: [Tailwind CSS](https://tailwindcss.com/) v4.1.18 + [PostCSS](https://postcss.org/)
- **架构**: Islands 架构 (部分 hydration) + 文件系统路由

## 🚀 快速开始

### 安装依赖

```bash
bun install
```

### 开发模式 (带热重载)

```bash
bun run dev
```

开发服务器默认在 [http://localhost:5000](http://localhost:5000) 启动。可以通过环境变量 `PORT` 指定端口：

```bash
PORT=3000 bun run dev     # 使用端口 3000
```

### 构建和运行

```bash
# 构建客户端代码（包括 CSS、岛组件、路由生成）
bun run build:client

# 启动生产服务器
bun run start
```

生产服务器默认使用端口 5000，同样支持 `PORT` 环境变量：

```bash
PORT=8080 bun run start   # 使用端口 8080
```

## 📁 项目结构

```
bun-php/
├── src/
│   ├── app/                    # App Router 风格应用目录
│   │   ├── page.tsx           # 首页 (路径: /)
│   │   ├── about/             # 关于页面目录
│   │   │   └── page.tsx       # 关于页面 (路径: /about)
│   │   ├── users/[id]/        # 动态路由目录
│   │   │   └── page.tsx       # 用户详情页 (路径: /users/:id)
│   │   ├── api-test/          # API 测试页面
│   │   │   └── page.tsx       # API 测试页面
│   │   ├── api/               # API 路由目录
│   │   │   ├── hello/         # Hello API
│   │   │   │   └── route.ts   # GET /api/hello
│   │   │   └── users/         # 用户 API
│   │   │       ├── route.ts   # GET /api/users
│   │   │       └── [id]/      # 动态 API 路由
│   │   │           └── route.ts # GET /api/users/:id
│   │   ├── components/        # 共享组件
│   │   │   ├── Layout.tsx     # 布局组件
│   │   │   └── Island.tsx     # 岛组件包装器
│   │   └── islands/           # 岛组件 (交互式组件)
│   │       ├── Counter.tsx    # 示例计数器组件
│   │       ├── forms/         # 表单组件目录
│   │       │   └── Button.tsx # 表单按钮组件
│   │       └── ui/            # UI 组件目录
│   │           └── Button.tsx # UI 按钮组件
│   ├── styles.css             # Tailwind CSS 入口文件 (@tailwind 指令)
│   ├── islands.generated.ts   # 自动生成的岛组件注册表
│   ├── api.generated.ts       # 自动生成的 API 路由注册表
│   ├── routes.generated.ts    # 自动生成的文件路由配置
│   ├── router.config.ts       # 路由系统配置文件
│   ├── entry-client.tsx       # 客户端 hydration 入口
│   └── server.tsx            # 服务端入口 (Hono 服务器)
├── scripts/                  # 构建和生成脚本
│   ├── generate-islands.ts   # 岛组件自动生成脚本
│   ├── generate-routes.ts    # 文件路由自动生成脚本
│   ├── generate-api-routes.ts # API 路由自动生成脚本
│   ├── build-css.js          # Tailwind CSS 构建脚本
│   ├── build-dev-reload.js   # 开发环境自动刷新脚本
│   ├── clean-port.js         # 端口清理脚本
│   ├── smart-restart.js      # 智能重启脚本
│   └── shared-config.js      # 共享配置模块 (端口配置)
├── dist/                     # 构建输出目录
│   ├── entry-client.js       # 客户端构建产物
│   └── styles.css            # 构建后的 Tailwind CSS 文件
├── docs/                     # 项目文档
│   ├── islands-architecture-explanation.md   # Islands 架构说明
│   ├── tailwind-css-integration.md           # Tailwind CSS 集成
│   ├── hot-reload-implementation.md          # 热重载实现
│   ├── port-and-git-fix-commands-260124.md   # 端口配置与 Git 清理命令
│   └── third-party-integration-guide.md      # 第三方工具集成指南
├── package.json              # 项目配置和依赖
├── tsconfig.json             # TypeScript 配置 (支持 Preact JSX)
├── tailwind.config.js        # Tailwind CSS 配置
├── postcss.config.js         # PostCSS 配置 (包含 @tailwindcss/postcss 插件)
├── production.md             # 项目完整文档 (技术规格、架构说明)
└── README.md                 # 项目说明 (本文件)
```

## 🎯 开发工作流

### 1. 创建页面

在 `src/app/` 目录下创建目录和 `page.tsx` 文件：

```tsx
// src/app/products/page.tsx
export default function ProductsPage() {
  return <h1>产品列表</h1>;
}

// 支持动态路由: src/app/products/[id]/page.tsx
export default function ProductDetailPage({ params }) {
  return <h1>产品详情: {params.id}</h1>;
}
```

### 2. 创建岛组件

在 `src/app/islands/` 目录下创建 `.tsx` 文件，使用 PascalCase 命名：

```tsx
// src/app/islands/ProductCard.tsx
import { useState } from 'preact/hooks';

export default function ProductCard({ productId }) {
  const [liked, setLiked] = useState(false);

  return (
    <div>
      <h3>产品 {productId}</h3>
      <button onClick={() => setLiked(!liked)}>
        {liked ? '已喜欢' : '喜欢'}
      </button>
    </div>
  );
}
```

### 3. 在页面中使用岛组件

```tsx
// 在页面组件中
import Island from '../components/Island';

export default function ProductsPage() {
  return (
    <div>
      <h1>产品列表</h1>
      {/* 使用 Island 包装器 */}
      <Island
        name="product-card"  // kebab-case 版本
        component="ProductCard"
        props={{ productId: 123 }}
      />
    </div>
  );
}
```

### 4. 创建 API 路由

在 `src/app/api/` 目录下创建 `route.ts` 文件：

```tsx
// src/app/api/products/route.ts
import { Hono } from 'hono';

const app = new Hono();

app.get('/', (c) => {
  return c.json({ products: [{ id: 1, name: '产品A' }] });
});

app.post('/', async (c) => {
  const body = await c.req.json();
  return c.json({ message: '产品已创建', data: body });
});

export default app;
```

### 5. 使用 Tailwind CSS

在组件中使用 Tailwind 类名：

```tsx
export default function HomePage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-blue-600">欢迎</h1>
      <p className="text-gray-600 mt-2">这是一个使用 Tailwind CSS 的页面</p>
    </div>
  );
}
```

## 📖 可用命令

| 命令                       | 描述                                    |
| -------------------------- | --------------------------------------- |
| `bun run dev`              | 启动开发服务器 (热重载 + 自动生成)      |
| `bun run generate:islands` | 生成岛组件注册表                        |
| `bun run generate:routes`  | 生成文件路由配置                        |
| `bun run generate:api-routes` | 生成 API 路由配置                      |
| `bun run build:css`        | 构建 Tailwind CSS 文件                  |
| `bun run build:client`     | 构建客户端代码 (包括所有生成步骤)       |
| `bun run build`            | 构建整个项目 (build:client 的别名)      |
| `bun run start`            | 启动生产服务器                          |
| `bun run lint`             | 运行 ESLint 代码检查                    |
| `bun run lint:fix`         | 运行 ESLint 自动修复                    |
| `bun run format`           | 运行 Prettier 代码格式化                |
| `bun run format:check`     | 检查代码格式化                          |
| `bun run check`            | 运行完整代码检查 (lint + format:check)  |

## 🏝️ 架构原理

### 1. Islands 架构

1. **服务端渲染** - 页面在服务端使用 Preact 渲染为完整 HTML
2. **组件标记** - 交互式组件被标记为 `data-island` 属性
3. **部分 hydration** - 客户端仅加载和 hydrate 这些岛组件
4. **静态内容** - 非交互部分保持为纯 HTML，无需 JavaScript 开销

### 2. 文件系统路由

项目实现了类似 Next.js App Router 的路由系统：

- **自动路由生成** - 扫描 `src/app/` 目录，自动生成路由配置
- **动态路由支持** - 使用 `[param]` 目录命名约定，自动转换为 `:param` 路由参数
- **布局系统** - 支持 `layout.tsx` 文件，自动嵌套布局组件
- **API 路由** - `src/app/api/` 目录下的 `route.ts` 文件自动注册为 API 端点

### 3. 自动生成系统

- **岛组件注册** - 自动扫描 `src/app/islands/` 目录，生成组件注册表
- **路由配置** - 自动扫描 `src/app/` 目录，生成路由配置和类型定义
- **API 路由注册** - 自动扫描 `src/app/api/` 目录，生成 API 路由配置

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

### Tailwind CSS 配置

- Tailwind CSS v4.1.18 支持
- PostCSS 处理，包含 `@tailwindcss/postcss` 插件
- 自定义配置文件: `tailwind.config.js`
- CSS 入口文件: `src/styles.css`

### 端口配置

项目使用统一的端口配置系统：

```bash
# 开发环境
PORT=3000 bun run dev

# 生产环境
PORT=8080 bun run start

# 默认端口: 5000 (未设置 PORT 环境变量时)
```

配置通过 `scripts/shared-config.js` 统一管理，所有相关脚本自动使用相同端口。

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
- [Preact](https://preactjs.com) - 快速的 React 替代品
- [Tailwind CSS](https://tailwindcss.com) - 现代化的 CSS 框架
- [Islands Architecture](https://jasonformat.com/islands-architecture/) - 架构灵感

---

**提示**: 查看 [production.md](production.md) 获取项目完整技术文档和架构说明。