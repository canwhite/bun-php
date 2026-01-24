// src/app/api-test/page.tsx
// 测试服务端页面调用自身API - 类型安全版本

/* global fetch */
import { useState } from 'preact/hooks';
import Layout from '../components/Layout.tsx';

// ==================== 类型定义 ====================

/** /api/hello 接口返回的数据结构 */
interface HelloApiResponse {
  message: string;
  timestamp: string;
  path: string;
}

/** API 调用测试结果 */
interface ApiTestResult {
  success: boolean;
  data?: HelloApiResponse;
  durationMs?: number;
  serverSide: boolean;
  error?: string;
  timestamp?: string;
}

/** 客户端测试状态 */
interface ClientTestState {
  isLoading: boolean;
  lastResult: ApiTestResult | null;
}

// ==================== API 调用函数 ====================

/**
 * 服务端调用 API 的函数
 * 注意：在服务端渲染时，这会向同一服务器发起 HTTP 请求
 */
async function callApiFromServer(): Promise<ApiTestResult> {
  try {
    console.log('[Server] 开始调用 /api/hello...');
    const startTime = Date.now();

    // 使用绝对地址调用自身 API
    const response = await fetch('http://localhost:5000/api/hello');

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data: HelloApiResponse = await response.json();
    const durationMs = Date.now() - startTime;

    console.log(`[Server] API 调用完成，耗时 ${durationMs}ms`, data);

    return {
      success: true,
      data,
      durationMs,
      serverSide: true,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('[Server] API 调用失败:', error);
    return {
      success: false,
      serverSide: true,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * 客户端调用 API 的函数
 */
async function callApiFromClient(): Promise<ApiTestResult> {
  try {
    console.log('[Client] 开始调用 /api/hello...');
    const startTime = Date.now();

    // 使用相对路径，浏览器会自动加上当前域名
    const response = await fetch('/api/hello');

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data: HelloApiResponse = await response.json();
    const durationMs = Date.now() - startTime;

    console.log(`[Client] API 调用完成，耗时 ${durationMs}ms`, data);

    return {
      success: true,
      data,
      durationMs,
      serverSide: false,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('[Client] API 调用失败:', error);
    return {
      success: false,
      serverSide: false,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    };
  }
}

// ==================== 服务端数据获取 ====================

/**
 * 服务端数据获取函数
 * 这个函数会在服务端渲染时被调用
 */
export async function getServerData(): Promise<{ serverApiResult: ApiTestResult }> {
  // 在生产环境中，应该考虑缓存或避免重复调用
  const serverApiResult = await callApiFromServer();
  return { serverApiResult };
}

// ==================== 页面组件 ====================

export default function ApiTestPage() {
  // 客户端测试状态
  const [clientTestState, setClientTestState] = useState<ClientTestState>({
    isLoading: false,
    lastResult: null,
  });

  // 服务端调用结果（通过 props 传递）
  // 注意：在实际项目中，这里应该通过数据获取机制传递服务端结果
  // 由于当前架构限制，我们只在控制台显示服务端调用日志

  // 客户端测试函数
  const testClientApi = async () => {
    setClientTestState(prev => ({ ...prev, isLoading: true }));

    try {
      const result = await callApiFromClient();
      setClientTestState({
        isLoading: false,
        lastResult: result,
      });
    } catch (error) {
      setClientTestState({
        isLoading: false,
        lastResult: {
          success: false,
          serverSide: false,
          error: error instanceof Error ? error.message : String(error),
          timestamp: new Date().toISOString(),
        },
      });
    }
  };

  // 渲染结果卡片
  const renderResultCard = (result: ApiTestResult | null, title: string, isServerSide: boolean) => {
    if (!result) {
      return (
        <div class="bg-gray-50 p-4 rounded-lg">
          <p class="text-gray-600 text-sm">
            {isServerSide ? '服务端调用结果需要在服务器控制台查看' : '尚未进行客户端测试'}
          </p>
        </div>
      );
    }

    const bgColor = result.success ? 'bg-green-50' : 'bg-red-50';
    const borderColor = result.success ? 'border-green-200' : 'border-red-200';
    const textColor = result.success ? 'text-green-800' : 'text-red-800';

    return (
      <div class={`${bgColor} p-4 rounded-lg border ${borderColor}`}>
        <div class="flex justify-between items-start mb-2">
          <h3 class={`font-medium ${textColor}`}>{result.success ? '✓ 调用成功' : '✗ 调用失败'}</h3>
          <span class="text-xs text-gray-500">
            {result.timestamp ? new Date(result.timestamp).toLocaleTimeString() : ''}
          </span>
        </div>

        {result.durationMs && (
          <p class="text-sm text-gray-700 mb-2">
            耗时: <span class="font-mono">{result.durationMs}ms</span>
          </p>
        )}

        {result.data && (
          <div class="mt-2 p-2 bg-white rounded border">
            <pre class="text-xs overflow-auto">{JSON.stringify(result.data, null, 2)}</pre>
          </div>
        )}

        {result.error && <p class="mt-2 text-sm text-red-600">错误: {result.error}</p>}
      </div>
    );
  };

  return (
    <Layout title="API调用测试">
      <div class="max-w-4xl mx-auto px-4 py-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-6">服务端页面调用自身API测试</h1>

        <div class="space-y-8">
          {/* 测试说明 */}
          <div class="bg-white rounded-xl shadow-sm p-6">
            <h2 class="text-2xl font-semibold text-gray-800 mb-4">测试说明</h2>
            <p class="text-gray-700 mb-4">
              这个页面测试服务端渲染的页面调用自身API接口的行为。当页面在服务端渲染时，如果调用{' '}
              <code class="bg-gray-100 text-gray-800 px-1 py-0.5 rounded text-sm font-mono">
                /api/hello
              </code>{' '}
              接口，会发生什么？
            </p>
            <div class="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <h3 class="text-lg font-medium text-blue-800 mb-2">预期行为</h3>
              <ul class="space-y-2 text-blue-700">
                <li class="flex items-start gap-2">
                  <span class="mt-1 w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></span>
                  <span>服务端渲染时调用API，会向同一服务器发起HTTP请求</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="mt-1 w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></span>
                  <span>这可能导致额外的网络开销（虽然是localhost）</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="mt-1 w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></span>
                  <span>需要注意避免循环调用或死锁</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="mt-1 w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></span>
                  <span>客户端 hydration 后，可以手动测试客户端API调用</span>
                </li>
              </ul>
            </div>
          </div>

          {/* 测试结果区域 */}
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 服务端结果 */}
            <div class="bg-green-50 rounded-xl shadow-sm p-6 border border-green-200">
              <div class="flex items-center gap-3 mb-4">
                <div class="w-8 h-8 bg-green-100 text-green-800 rounded-full flex items-center justify-center">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M9 16h.01"
                    />
                  </svg>
                </div>
                <h2 class="text-xl font-semibold text-green-800">服务端渲染调用</h2>
              </div>

              <div class="space-y-4">
                <div>
                  <h3 class="font-medium text-gray-800 mb-2">API调用状态</h3>
                  {renderResultCard(null, '服务端调用', true)}
                </div>

                <div class="bg-white p-4 rounded-lg">
                  <h3 class="font-medium text-gray-800 mb-2">技术细节</h3>
                  <ul class="space-y-2 text-sm text-gray-600">
                    <li>
                      • 服务端使用{' '}
                      <code class="bg-gray-100 text-gray-800 px-1 py-0.5 rounded font-mono">
                        fetch(&apos;http://localhost:5000/api/hello&apos;)
                      </code>
                    </li>
                    <li>• 完整的 HTTP 请求（包括网络层）</li>
                    <li>• 可能受到中间件影响</li>
                    <li>• 查看服务器控制台获取详细日志</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 客户端结果 */}
            <div class="bg-purple-50 rounded-xl shadow-sm p-6 border border-purple-200">
              <div class="flex items-center gap-3 mb-4">
                <div class="w-8 h-8 bg-purple-100 text-purple-800 rounded-full flex items-center justify-center">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h2 class="text-xl font-semibold text-purple-800">客户端测试</h2>
              </div>

              <div class="space-y-4">
                <div>
                  <h3 class="font-medium text-gray-800 mb-2">API调用状态</h3>
                  {renderResultCard(clientTestState.lastResult, '客户端调用', false)}
                </div>

                <div class="space-y-3">
                  <button
                    onClick={testClientApi}
                    disabled={clientTestState.isLoading}
                    class={`w-full px-4 py-3 rounded-lg font-medium transition-colors ${
                      clientTestState.isLoading
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-purple-600 text-white hover:bg-purple-700'
                    }`}
                  >
                    {clientTestState.isLoading ? (
                      <span class="flex items-center justify-center gap-2">
                        <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle
                            class="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            stroke-width="4"
                          />
                          <path
                            class="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        测试中...
                      </span>
                    ) : (
                      '测试客户端 API 调用'
                    )}
                  </button>

                  <div class="bg-white p-4 rounded-lg">
                    <h3 class="font-medium text-gray-800 mb-2">技术细节</h3>
                    <ul class="space-y-2 text-sm text-gray-600">
                      <li>
                        • 客户端使用{' '}
                        <code class="bg-gray-100 text-gray-800 px-1 py-0.5 rounded font-mono">
                          fetch(&apos;/api/hello&apos;)
                        </code>
                      </li>
                      <li>• 相对路径，自动使用当前域名</li>
                      <li>• 正常的客户端 HTTP 请求</li>
                      <li>• 查看浏览器控制台获取详细日志</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 测试注意事项 */}
          <div class="bg-amber-50 rounded-xl shadow-sm p-6 border border-amber-200">
            <h2 class="text-xl font-semibold text-amber-800 mb-4">测试注意事项</h2>
            <div class="space-y-3">
              <div class="flex items-start gap-3">
                <div class="w-6 h-6 bg-amber-100 text-amber-800 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
                  1
                </div>
                <div>
                  <h3 class="font-medium text-amber-800">避免循环调用</h3>
                  <p class="text-amber-700 text-sm">
                    如果 API 接口又调用了页面，可能导致无限循环。确保 API 路由是独立的。
                  </p>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <div class="w-6 h-6 bg-amber-100 text-amber-800 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
                  2
                </div>
                <div>
                  <h3 class="font-medium text-amber-800">性能影响</h3>
                  <p class="text-amber-700 text-sm">
                    服务端调用自身 API 会有额外的 HTTP 开销，即使在同一进程。
                    在生产环境中应考虑直接调用业务逻辑。
                  </p>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <div class="w-6 h-6 bg-amber-100 text-amber-800 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
                  3
                </div>
                <div>
                  <h3 class="font-medium text-amber-800">数据一致性</h3>
                  <p class="text-amber-700 text-sm">
                    服务端和客户端获取的数据应该保持一致。 注意时间戳等动态数据可能不同。
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 操作区域 */}
          <div class="bg-white rounded-xl shadow-sm p-6">
            <h2 class="text-2xl font-semibold text-gray-800 mb-4">其他操作</h2>
            <div class="flex flex-wrap gap-4">
              <a
                href="/api/hello"
                target="_blank"
                rel="noopener noreferrer"
                class="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                直接访问 API 接口
              </a>
              <a
                href="/api-test"
                class="px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                重新加载页面（测试服务端调用）
              </a>
              <button
                onClick={() => window.location.reload()}
                class="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                刷新页面
              </button>
            </div>
            <p class="mt-4 text-gray-600 text-sm">
              注意：服务端 API 调用会在服务器控制台显示日志。 重新加载页面可以测试服务端渲染时的 API
              调用行为。
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
