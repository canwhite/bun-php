// src/app/api/users/route.ts
// 示例API路由：/api/users

import type { Context } from 'hono';

// 模拟用户数据
const users = [
  { id: 1, name: 'Alice', email: 'alice@example.com' },
  { id: 2, name: 'Bob', email: 'bob@example.com' },
  { id: 3, name: 'Charlie', email: 'charlie@example.com' },
];

export const GET = async (c: Context) => {
  // 支持查询参数
  const query = c.req.query();
  const limit = query.limit ? parseInt(query.limit) : users.length;

  return c.json({
    users: users.slice(0, limit),
    count: users.length,
    limit,
  });
};

export const POST = async (c: Context) => {
  try {
    const body = await c.req.json();

    // 简单的验证
    if (!body.name || !body.email) {
      return c.json({ error: 'Name and email are required' }, 400);
    }

    const newUser = {
      id: users.length + 1,
      name: body.name,
      email: body.email,
    };

    users.push(newUser);

    return c.json(
      {
        message: 'User created successfully',
        user: newUser,
      },
      201
    );
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }
};
