// src/app/api/users/[id]/route.ts
// 示例API路由：/api/users/:id

import type { Context } from 'hono';

// 模拟用户数据（与users/route.ts共享）
const users = [
  { id: 1, name: 'Alice', email: 'alice@example.com' },
  { id: 2, name: 'Bob', email: 'bob@example.com' },
  { id: 3, name: 'Charlie', email: 'charlie@example.com' },
];

export const GET = async (c: Context) => {
  const id = c.req.param('id');
  const userId = parseInt(id);

  if (isNaN(userId)) {
    return c.json({ error: 'Invalid user ID' }, 400);
  }

  const user = users.find(u => u.id === userId);

  if (!user) {
    return c.json({ error: 'User not found' }, 404);
  }

  return c.json({ user });
};

export const PUT = async (c: Context) => {
  const id = c.req.param('id');
  const userId = parseInt(id);

  if (isNaN(userId)) {
    return c.json({ error: 'Invalid user ID' }, 400);
  }

  try {
    const body = await c.req.json();
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
      return c.json({ error: 'User not found' }, 404);
    }

    // 更新用户
    users[userIndex] = {
      ...users[userIndex],
      ...body,
      id: userId, // 确保ID不变
    };

    return c.json({
      message: 'User updated successfully',
      user: users[userIndex],
    });
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }
};

export const DELETE = async (c: Context) => {
  const id = c.req.param('id');
  const userId = parseInt(id);

  if (isNaN(userId)) {
    return c.json({ error: 'Invalid user ID' }, 400);
  }

  const userIndex = users.findIndex(u => u.id === userId);

  if (userIndex === -1) {
    return c.json({ error: 'User not found' }, 404);
  }

  const deletedUser = users.splice(userIndex, 1)[0];

  return c.json({
    message: 'User deleted successfully',
    user: deletedUser,
  });
};
