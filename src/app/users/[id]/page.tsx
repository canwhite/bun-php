// src/app/users/[id]/page.tsx
// 用户详情页面 - 动态路由

import Layout from '../../components/Layout.tsx';

interface UserDetailPageProps {
  params: {
    id: string;
  };
}

export default function UserDetailPage({ params }: UserDetailPageProps) {
  const userId = params.id;

  // 模拟用户数据（实际项目中应该从API获取）
  const userData = {
    '1': {
      id: 1,
      name: 'Alice',
      email: 'alice@example.com',
      role: '管理员',
      joinDate: '2024-01-15',
    },
    '2': { id: 2, name: 'Bob', email: 'bob@example.com', role: '编辑', joinDate: '2024-02-20' },
    '3': {
      id: 3,
      name: 'Charlie',
      email: 'charlie@example.com',
      role: '查看者',
      joinDate: '2024-03-10',
    },
  };

  const user = userData[userId as keyof typeof userData] || {
    id: parseInt(userId),
    name: '未知用户',
    email: '未知邮箱',
    role: '未知角色',
    joinDate: '未知日期',
  };

  return (
    <Layout title={`用户详情 - ${user.name}`}>
      <div class="max-w-4xl mx-auto px-4">
        <div class="mb-6">
          <a
            href="/users"
            class="text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clip-rule="evenodd"
              />
            </svg>
            返回用户列表
          </a>
        </div>

        <h1 class="text-4xl font-bold text-gray-900 mb-6">用户详情</h1>

        <div class="bg-white rounded-xl shadow-sm p-8 border border-gray-200 mb-8">
          <div class="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8">
            <div class="w-24 h-24 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
              <span class="text-blue-800 font-bold text-3xl">{user.name.charAt(0)}</span>
            </div>
            <div>
              <h2 class="text-3xl font-bold text-gray-900 mb-2">{user.name}</h2>
              <div class="flex items-center gap-4 text-gray-600">
                <span class="flex items-center gap-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  {user.email}
                </span>
                <span class="flex items-center gap-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  {user.role}
                </span>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="bg-gray-50 p-4 rounded-lg">
              <h3 class="text-lg font-semibold text-gray-800 mb-2">基本信息</h3>
              <dl class="space-y-2">
                <div class="flex justify-between">
                  <dt class="text-gray-600">用户ID</dt>
                  <dd class="font-mono text-gray-900">{user.id}</dd>
                </div>
                <div class="flex justify-between">
                  <dt class="text-gray-600">加入日期</dt>
                  <dd class="text-gray-900">{user.joinDate}</dd>
                </div>
                <div class="flex justify-between">
                  <dt class="text-gray-600">状态</dt>
                  <dd class="text-green-600 font-medium">活跃</dd>
                </div>
              </dl>
            </div>

            <div class="bg-gray-50 p-4 rounded-lg">
              <h3 class="text-lg font-semibold text-gray-800 mb-2">路径参数信息</h3>
              <dl class="space-y-2">
                <div class="flex justify-between">
                  <dt class="text-gray-600">当前路径</dt>
                  <dd class="font-mono text-sm text-gray-900">/users/{userId}</dd>
                </div>
                <div class="flex justify-between">
                  <dt class="text-gray-600">参数类型</dt>
                  <dd class="text-gray-900">动态路由参数</dd>
                </div>
                <div class="flex justify-between">
                  <dt class="text-gray-600">参数值</dt>
                  <dd class="font-mono text-gray-900">{userId}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        <div class="bg-blue-50 p-6 rounded-xl border border-blue-200">
          <h3 class="text-xl font-semibold text-blue-800 mb-2">动态路由测试</h3>
          <p class="text-blue-700 mb-4">
            这是一个动态路由页面，路径参数{' '}
            <code class="bg-blue-100 text-blue-800 px-2 py-1 rounded font-mono">[id]</code> 的值是{' '}
            <code class="bg-blue-100 text-blue-800 px-2 py-1 rounded font-mono">{userId}</code>。
          </p>
          <div class="space-y-3">
            <div class="font-mono text-sm bg-white p-3 rounded border border-blue-100">
              <div class="text-blue-600">文件路径: src/app/users/[id]/page.tsx</div>
              <div class="text-gray-600">动态路由文件命名约定</div>
            </div>
            <div class="font-mono text-sm bg-white p-3 rounded border border-blue-100">
              <div class="text-blue-600">访问路径: /users/{userId}</div>
              <div class="text-gray-600">实际访问URL</div>
            </div>
            <div class="font-mono text-sm bg-white p-3 rounded border border-blue-100">
              <div class="text-blue-600">API 对应: /api/users/{userId}</div>
              <div class="text-gray-600">对应的API端点</div>
            </div>
          </div>
        </div>

        <div class="mt-8 p-6 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl border border-blue-200">
          <h3 class="text-xl font-semibold text-gray-800 mb-4">测试其他用户</h3>
          <div class="flex flex-wrap gap-3">
            <a
              href="/users/1"
              class="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors"
            >
              用户 1 (Alice)
            </a>
            <a
              href="/users/2"
              class="px-4 py-2 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors"
            >
              用户 2 (Bob)
            </a>
            <a
              href="/users/3"
              class="px-4 py-2 bg-purple-100 text-purple-800 rounded-lg hover:bg-purple-200 transition-colors"
            >
              用户 3 (Charlie)
            </a>
            <a
              href="/users/999"
              class="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors"
            >
              用户 999 (测试错误)
            </a>
          </div>
        </div>
      </div>
    </Layout>
  );
}
