// src/app/api/hello/route.ts
// 示例API路由：/api/hello

import type { Context } from 'hono';

export const GET = async (c: Context) => {
  return c.json({
    message: 'Hello from API!',
    timestamp: new Date().toISOString(),
    path: c.req.path,
  });
};

// 可选：支持其他HTTP方法
export const POST = async (c: Context) => {
  const body = await c.req.json().catch(() => ({}));
  return c.json(
    {
      message: 'Hello from POST!',
      received: body,
      timestamp: new Date().toISOString(),
    },
    201
  );
};
