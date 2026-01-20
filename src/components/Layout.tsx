// src/components/Layout.tsx
// 共享布局组件

import type { VNode } from "preact";

interface LayoutProps {
  title?: string;
  children: VNode;
}

export default function Layout({ title = "Islands MPA", children }: LayoutProps) {
  return (
    <html lang="zh-CN">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title} - Islands MPA</title>
        <script src="/entry-client.js" type="module" defer></script>
        <style>{`
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: system-ui, -apple-system, sans-serif; }
        `}</style>
      </head>
      <body class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900">
        <header class="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-gray-200">
          <div class="max-w-6xl mx-auto px-4 py-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-8">
                <a href="/" class="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
                  Islands MPA
                </a>
                <nav class="flex gap-6">
                  <a href="/" class="text-gray-700 hover:text-blue-600 transition-colors">
                    首页
                  </a>
                  <a href="/about" class="text-gray-700 hover:text-blue-600 transition-colors">
                    关于
                  </a>
                  <a
                    href="https://github.com/your-username/bun-php"
                    target="_blank"
                    class="text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    GitHub
                  </a>
                </nav>
              </div>
              <div class="text-sm text-gray-500">
                基于 Bun + Hono + Preact
              </div>
            </div>
          </div>
        </header>

        <main class="max-w-6xl mx-auto px-4 py-8">
          {children}
        </main>

        <footer class="mt-12 border-t border-gray-200 bg-white/50">
          <div class="max-w-6xl mx-auto px-4 py-6">
            <div class="flex flex-col md:flex-row items-center justify-between gap-4">
              <div class="text-gray-600">
                © 2026 Islands MPA 示例项目
              </div>
              <div class="flex gap-4 text-sm">
                <span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
                  Bun {Bun.version || "1.x"}
                </span>
                <span class="px-3 py-1 bg-green-100 text-green-800 rounded-full">
                  TypeScript
                </span>
                <span class="px-3 py-1 bg-purple-100 text-purple-800 rounded-full">
                  Islands 架构
                </span>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}