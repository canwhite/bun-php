// src/pages/about.tsx
// 关于页面

import Layout from "../components/Layout.tsx";

export default function About() {
  return (
    <Layout title="关于">
      <div class="max-w-3xl mx-auto">
        <h1 class="text-4xl font-bold text-gray-900 mb-6">关于此项目</h1>

        <div class="prose prose-lg">
          <p class="text-gray-700">
            这是一个演示 <strong>Islands 架构</strong> 的现代 MPA（多页面应用）项目。
          </p>

          <h2 class="text-2xl font-semibold text-gray-800 mt-8 mb-4">
            技术栈
          </h2>
          <ul>
            <li>
              <strong>Bun</strong> - 全功能 JavaScript 运行时和包管理器
            </li>
            <li>
              <strong>Hono</strong> - 轻量级 Web 框架
            </li>
            <li>
              <strong>Preact</strong> - 轻量级 React 替代方案
            </li>
            <li>
              <strong>TypeScript</strong> - 类型安全的开发体验
            </li>
          </ul>

          <h2 class="text-2xl font-semibold text-gray-800 mt-8 mb-4">
            Islands 架构优势
          </h2>
          <p>
            Islands 架构结合了 MPA 的简单性和 SPA 的交互性：
          </p>
          <ul>
            <li><strong>更快的初始加载</strong> - 服务端渲染完整的 HTML</li>
            <li><strong>更少的 JavaScript</strong> - 仅 hydrate 交互式组件</li>
            <li><strong>更好的 SEO</strong> - 完整的 HTML 内容</li>
            <li><strong>渐进增强</strong> - 即使 JavaScript 失败，基础功能仍可用</li>
          </ul>

          <h2 class="text-2xl font-semibold text-gray-800 mt-8 mb-4">
            工作原理
          </h2>
          <ol>
            <li>页面在服务端使用 Preact 渲染为完整 HTML</li>
            <li>交互式组件被标记为 <code>data-island</code></li>
            <li>客户端仅加载和 hydrate 这些岛组件</li>
            <li>静态内容保持为纯 HTML，无需 JavaScript 开销</li>
          </ol>

          <div class="mt-8 p-6 bg-gray-50 rounded-xl">
            <h3 class="text-xl font-semibold text-gray-800 mb-3">
              项目结构
            </h3>
            <pre class="text-sm bg-white p-4 rounded overflow-x-auto">
<code>{`bun-php/
├── src/
│   ├── islands/          # 岛组件（交互式组件）
│   ├── pages/           # 页面组件
│   ├── components/      # 共享组件
│   ├── server.ts        # 服务端入口
│   └── entry-client.ts  # 客户端 hydration 入口
├── scripts/
│   └── generate-islands.ts  # 自动生成脚本
└── public/              # 构建产物`}</code>
            </pre>
          </div>

          <div class="mt-8 p-6 bg-green-50 rounded-xl">
            <h3 class="text-xl font-semibold text-green-800 mb-3">
              开发体验
            </h3>
            <ul class="space-y-2">
              <li class="flex items-center gap-2">
                <div class="w-2 h-2 bg-green-500 rounded-full" />
                <span>热重载（修改代码后自动刷新）</span>
              </li>
              <li class="flex items-center gap-2">
                <div class="w-2 h-2 bg-green-500 rounded-full" />
                <span>TypeScript 类型检查</span>
              </li>
              <li class="flex items-center gap-2">
                <div class="w-2 h-2 bg-green-500 rounded-full" />
                <span>自动岛组件注册</span>
              </li>
              <li class="flex items-center gap-2">
                <div class="w-2 h-2 bg-green-500 rounded-full" />
                <span>零配置构建</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  );
}