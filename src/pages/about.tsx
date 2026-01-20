// src/pages/about.tsx
// 关于页面

import Layout from '../components/Layout.tsx';

export default function About() {
  return (
    <Layout title="关于">
      <div class="max-w-3xl mx-auto px-4">
        <h1 class="text-4xl font-bold text-gray-900 mb-6">关于此项目</h1>

        <div class="space-y-8">
          <div class="bg-white rounded-xl shadow-sm p-6">
            <p class="text-gray-700 text-lg leading-relaxed">
              这是一个演示 <strong class="text-blue-600">Islands 架构</strong> 的现代
              MPA（多页面应用）项目，结合了服务端渲染的性能优势和客户端交互的灵活性。
            </p>
          </div>

          <div class="bg-white rounded-xl shadow-sm p-6">
            <h2 class="text-2xl font-semibold text-gray-800 mb-4 pb-3 border-b border-gray-100">
              技术栈
            </h2>
            <ul class="space-y-3">
              <li class="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div>
                  <strong class="text-gray-900">Bun</strong> - 全功能 JavaScript 运行时和包管理器
                </div>
              </li>
              <li class="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                <div>
                  <strong class="text-gray-900">Hono</strong> - 轻量级 Web 框架
                </div>
              </li>
              <li class="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div class="w-2 h-2 bg-purple-500 rounded-full"></div>
                <div>
                  <strong class="text-gray-900">Preact</strong> - 轻量级 React 替代方案
                </div>
              </li>
              <li class="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div class="w-2 h-2 bg-amber-500 rounded-full"></div>
                <div>
                  <strong class="text-gray-900">TypeScript</strong> - 类型安全的开发体验
                </div>
              </li>
            </ul>
          </div>

          <div class="bg-white rounded-xl shadow-sm p-6">
            <h2 class="text-2xl font-semibold text-gray-800 mb-4 pb-3 border-b border-gray-100">
              Islands 架构优势
            </h2>
            <p class="text-gray-700 mb-4">
              Islands 架构结合了 MPA 的简单性和 SPA 的交互性，提供最佳用户体验：
            </p>
            <ul class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <li class="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <strong class="text-blue-800 block mb-1">更快的初始加载</strong>
                <span class="text-blue-700 text-sm">服务端渲染完整的 HTML</span>
              </li>
              <li class="bg-green-50 p-4 rounded-lg border border-green-100">
                <strong class="text-green-800 block mb-1">更少的 JavaScript</strong>
                <span class="text-green-700 text-sm">仅 hydrate 交互式组件</span>
              </li>
              <li class="bg-purple-50 p-4 rounded-lg border border-purple-100">
                <strong class="text-purple-800 block mb-1">更好的 SEO</strong>
                <span class="text-purple-700 text-sm">完整的 HTML 内容</span>
              </li>
              <li class="bg-amber-50 p-4 rounded-lg border border-amber-100">
                <strong class="text-amber-800 block mb-1">渐进增强</strong>
                <span class="text-amber-700 text-sm">即使 JavaScript 失败，基础功能仍可用</span>
              </li>
            </ul>
          </div>

          <div class="bg-white rounded-xl shadow-sm p-6">
            <h2 class="text-2xl font-semibold text-gray-800 mb-4 pb-3 border-b border-gray-100">
              工作原理
            </h2>
            <ol class="space-y-4">
              <li class="flex items-start gap-3">
                <span class="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-semibold">
                  1
                </span>
                <div class="text-gray-700">页面在服务端使用 Preact 渲染为完整 HTML</div>
              </li>
              <li class="flex items-start gap-3">
                <span class="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-semibold">
                  2
                </span>
                <div class="text-gray-700">
                  交互式组件被标记为{' '}
                  <code class="bg-gray-100 text-gray-800 px-1 py-0.5 rounded text-sm font-mono">
                    data-island
                  </code>
                </div>
              </li>
              <li class="flex items-start gap-3">
                <span class="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-semibold">
                  3
                </span>
                <div class="text-gray-700">客户端仅加载和 hydrate 这些岛组件</div>
              </li>
              <li class="flex items-start gap-3">
                <span class="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-semibold">
                  4
                </span>
                <div class="text-gray-700">静态内容保持为纯 HTML，无需 JavaScript 开销</div>
              </li>
            </ol>
          </div>

          <div class="bg-white rounded-xl shadow-sm p-6">
            <h3 class="text-xl font-semibold text-gray-800 mb-4 pb-3 border-b border-gray-100">
              项目结构
            </h3>
            <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <pre class="text-sm font-mono text-gray-800 overflow-x-auto">
                bun-php/ ├── src/ │ ├── islands/ # 岛组件（交互式组件） │ ├── pages/ # 页面组件 │
                ├── components/ # 共享组件 │ ├── server.ts # 服务端入口 │ └── entry-client.ts #
                客户端 hydration 入口 ├── scripts/ │ └── generate-islands.ts # 自动生成脚本 └──
                public/ # 构建产物
              </pre>
            </div>
          </div>

          <div class="bg-white rounded-xl shadow-sm p-6">
            <h3 class="text-xl font-semibold text-gray-800 mb-4 pb-3 border-b border-gray-100">
              开发体验
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="bg-green-50 p-4 rounded-lg border border-green-200">
                <div class="flex items-center gap-3 mb-2">
                  <div class="w-3 h-3 bg-green-500 rounded-full"></div>
                  <strong class="text-green-800">热重载</strong>
                </div>
                <p class="text-green-700 text-sm">修改代码后自动刷新，无需手动重启</p>
              </div>
              <div class="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div class="flex items-center gap-3 mb-2">
                  <div class="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <strong class="text-blue-800">TypeScript 类型检查</strong>
                </div>
                <p class="text-blue-700 text-sm">实时类型检查，避免运行时错误</p>
              </div>
              <div class="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <div class="flex items-center gap-3 mb-2">
                  <div class="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <strong class="text-purple-800">自动岛组件注册</strong>
                </div>
                <p class="text-purple-700 text-sm">自动扫描和注册交互式组件</p>
              </div>
              <div class="bg-amber-50 p-4 rounded-lg border border-amber-200">
                <div class="flex items-center gap-3 mb-2">
                  <div class="w-3 h-3 bg-amber-500 rounded-full"></div>
                  <strong class="text-amber-800">零配置构建</strong>
                </div>
                <p class="text-amber-700 text-sm">Bun 内置构建工具，无需复杂配置</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
