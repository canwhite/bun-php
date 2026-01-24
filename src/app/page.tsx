// src/app/page.tsx
// 主页组件
// Nodemon热重载测试

import Layout from './components/Layout.tsx';
import Island from './components/Island.tsx';

export default function Home() {
  return (
    <Layout title="首页">
      <div class="max-w-4xl mx-auto px-4">
        <h1 class="text-4xl font-bold text-gray-900 mb-6">
          欢迎使用 Islands MPA - 自动刷新测试 06:53思考对方健康 [测试热更新 07:03]
        </h1>

        <div class="prose prose-lg mb-8">
          <p class="text-gray-700">
            这是一个基于 Bun + Hono + Preact 的 Islands 架构 MPA 示例。¥¥¥¥
            页面在服务端渲染，交互式组件在客户端 hydrate。
          </p>
          <ul class="text-gray-700">
            <li>✅ 服务端渲染 (SSR)</li>
            <li>✅ Islands 架构 (部分 hydration)</li>
            <li>✅ 零配置 TypeScript</li>
            <li>✅ 热重载开发体验</li>
          </ul>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Counter 岛组件 */}
          <div class="bg-gray-50 p-6 rounded-xl">
            <h2 class="text-2xl font-semibold text-gray-800 mb-4">计数器示例</h2>
            <p class="text-gray-600 mb-4">
              下面的计数器是一个岛组件，在服务端渲染占位符，在客户端 hydrate。
            </p>
            <div
              data-island="counter"
              data-props={JSON.stringify({ initial: 100 })}
              class="min-h-[220px]"
            >
              {/* 服务端占位/骨架屏 */}
              <div class="animate-pulse bg-gray-200 h-40 w-full rounded-xl" />
            </div>
          </div>

          <div class="bg-gray-50 p-6 rounded-xl">
            <h2 class="text-2xl font-semibold text-gray-800 mb-4">工作原理</h2>
            <div class="space-y-3 text-gray-700">
              <div class="flex items-start gap-2">
                <div class="mt-1 w-2 h-2 bg-blue-500 rounded-full" />
                <span>页面在服务端使用 Preact 渲染为 HTML</span>
              </div>
              <div class="flex items-start gap-2">
                <div class="mt-1 w-2 h-2 bg-blue-500 rounded-full" />
                <span>
                  标记为 <code>data-island</code> 的组件会被客户端脚本识别
                </span>
              </div>
              <div class="flex items-start gap-2">
                <div class="mt-1 w-2 h-2 bg-blue-500 rounded-full" />
                <span>客户端 hydrate 这些组件，使其具有交互性</span>
              </div>
              <div class="flex items-start gap-2">
                <div class="mt-1 w-2 h-2 bg-blue-500 rounded-full" />
                <span>其他静态内容保持为纯 HTML，性能更优</span>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div class="bg-gray-50 p-6 rounded-xl">
            <h2 class="text-2xl font-semibold text-gray-800 mb-4">表单按钮示例</h2>
            <p class="text-gray-600 mb-4">
              使用新的 Island 组件包装器，类型安全地挂载 forms-button。
            </p>
            <Island
              name="forms-button"
              props={{
                label: '提交表单',
                variant: 'primary',
                onClick: () => console.log('按钮点击'),
              }}
              className="min-h-[120px]"
            />
            <p class="text-sm text-gray-500 mt-4">
              Island名称: forms-button (来自 forms/Button.tsx)
            </p>
          </div>

          <div class="bg-gray-50 p-6 rounded-xl">
            <h2 class="text-2xl font-semibold text-gray-800 mb-4">UI按钮示例</h2>
            <p class="text-gray-600 mb-4">使用新的 Island 组件包装器，类型安全地挂载 ui-button。</p>
            <Island
              name="ui-button"
              props={{
                children: '带图标的按钮',
                icon: '🎨',
                size: 'lg',
                rounded: true,
              }}
              className="min-h-[120px] flex items-center"
            />
            <p class="text-sm text-gray-500 mt-4">Island名称: ui-button (来自 ui/Button.tsx)</p>
          </div>
        </div>

        <div class="mt-8 p-6 bg-blue-50 rounded-xl">
          <h3 class="text-xl font-semibold text-blue-800 mb-2">开发命令</h3>
          <div class="font-mono text-sm space-y-1">
            <div class="bg-white p-2 rounded">bun run generate:islands</div>
            <div class="bg-white p-2 rounded">bun run dev</div>
            <div class="bg-white p-2 rounded">bun run build:client</div>
            <div class="bg-white p-2 rounded">bun run start</div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
