// src/server.tsx
// 文件路由系统服务器入口

import { Hono } from 'hono';
import { serveStatic } from 'hono/bun';
import { registerFileRoutes } from './lib/router';

const app = new Hono();

// ============ 全局中间件 ============

// 请求日志中间件
app.use('*', async (c, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  console.log(
    `[${new Date().toISOString()}] ${c.req.method} ${c.req.path} ${c.res.status} (${ms}ms)`
  );
});

// ============ 静态文件服务 ============

app.get('/entry-client.js', serveStatic({ path: './dist/entry-client.js' }));
app.get('/styles.css', serveStatic({ path: './dist/styles.css' }));

// ============ 文件路由注册 ============

// 注册所有文件路由
// 注意：这是一个异步操作，但Hono的注册是同步的
// 我们使用立即执行的异步函数来注册路由
(async () => {
  try {
    await registerFileRoutes(app);
    console.log('文件路由注册完成');
  } catch (error) {
    console.error('文件路由注册失败:', error);
    process.exit(1);
  }
})();

// ============ 错误处理 ============

// 404处理
app.notFound(async c => {
  // 可以在这里使用自定义404页面
  // 如果配置了 notFoundPage，可以尝试渲染它
  return c.text('页面不存在', 404);
});

// 全局错误处理
app.onError(async (err, c) => {
  console.error('服务器错误:', err);

  // 可以在这里使用自定义错误页面
  // 如果配置了 error 组件，可以尝试渲染它

  return c.json(
    {
      error: 'Internal Server Error',
      message: process.env.NODE_ENV === 'development' ? err.message : undefined,
    },
    500
  );
});

// ============ 导出配置 ============

export default {
  port: 5000,
  fetch: app.fetch,
};
