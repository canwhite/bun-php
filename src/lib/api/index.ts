// src/lib/api/index.ts
// API路由系统 - 路由注册器

import { Hono } from 'hono';
import { join } from 'path';
import type { ApiRouteConfig, ApiHandler } from '../router/types';

// 动态导入生成的API路由配置
let apiRoutesCache: ApiRouteConfig[] | null = null;

/**
 * 加载生成的API路由配置
 */
async function loadGeneratedApiRoutes(): Promise<ApiRouteConfig[]> {
  if (apiRoutesCache) {
    return apiRoutesCache;
  }

  try {
    // 动态导入生成的API路由配置
    const apiRoutesModule = await import('../../api.generated.ts');
    apiRoutesCache = apiRoutesModule.routes;
    return apiRoutesCache;
  } catch (error) {
    console.error('加载生成的API路由配置失败:', error);
    throw error;
  }
}

/**
 * 解析导入路径为绝对路径
 * 将相对于src的路径转换为相对于当前文件的路径
 */
function resolveImportPath(importPath: string): string {
  // importPath 是相对于 src 目录的路径，如 "./app/api/users/route.ts"
  // 当前文件在 src/lib/api/index.ts，需要回到 src 目录（../..），然后加上相对路径

  let normalizedPath = importPath;

  // 如果以 ./ 开头，移除 ./ 前缀，然后加上 ../.. 回到 src 目录
  if (normalizedPath.startsWith('./')) {
    normalizedPath = normalizedPath.slice(2); // 移除 "./"
    return join('../..', normalizedPath);
  }

  // 如果以 ../ 开头，直接返回（已经是相对路径）
  if (normalizedPath.startsWith('../')) {
    return normalizedPath;
  }

  // 否则，假设路径是相对于src目录的
  // 从 src/lib/api 到 src/ 的路径是 ../..
  return join('../..', normalizedPath);
}

/**
 * 动态导入API模块并获取处理函数
 */
async function importApiHandlers(importPath: string): Promise<Record<string, ApiHandler>> {
  try {
    const resolvedPath = resolveImportPath(importPath);
    const module = await import(resolvedPath);
    return module;
  } catch (error) {
    console.error(
      `导入API模块失败: ${importPath} (resolved: ${resolveImportPath(importPath)})`,
      error
    );
    throw error;
  }
}

/**
 * 注册API路由到Hono应用
 */
export async function registerApiRoutes(app: Hono): Promise<void> {
  console.log('开始注册API路由...');

  try {
    // 加载API路由配置
    const routes = await loadGeneratedApiRoutes();
    console.log(`加载了 ${routes.length} 个API路由配置`);

    // 注册每个路由
    for (const route of routes) {
      const { path, supportedMethods, importPath, isDynamic, isCatchAll } = route;

      // 动态导入API模块
      const apiModule = await importApiHandlers(importPath);

      // 为每个支持的HTTP方法注册处理器
      for (const method of supportedMethods) {
        const handler = apiModule[method];
        if (!handler || typeof handler !== 'function') {
          console.warn(`API路由 ${path} 未导出 ${method} 处理函数`);
          continue;
        }

        // 根据路由类型注册不同的路由
        const methodLower = method.toLowerCase() as keyof Hono;
        if (isCatchAll) {
          // 通配路由
          (app as any)[methodLower](`${path}/*`, handler); // eslint-disable-line @typescript-eslint/no-explicit-any
        } else if (isDynamic) {
          // 动态路由
          (app as any)[methodLower](path, handler); // eslint-disable-line @typescript-eslint/no-explicit-any
        } else {
          // 静态路由
          (app as any)[methodLower](path, handler); // eslint-disable-line @typescript-eslint/no-explicit-any
        }

        if (process.env.NODE_ENV === 'development') {
          console.log(`注册API路由: ${method} ${path} (${route.filePath})`);
        }
      }
    }

    console.log('API路由注册完成');
  } catch (error) {
    console.error('注册API路由失败:', error);
    throw error;
  }
}

/**
 * 开发时重新加载API路由（热重载）
 */
export async function reloadApiRoutes(_app: Hono): Promise<void> {
  if (process.env.NODE_ENV !== 'development') {
    console.warn('重新加载API路由仅在开发模式下可用');
    return;
  }

  console.log('重新加载API路由...');

  // 清除API路由缓存
  apiRoutesCache = null;

  // 重新加载API路由配置
  const routes = await loadGeneratedApiRoutes(); // eslint-disable-line @typescript-eslint/no-unused-vars

  // 清除现有API路由（除了中间件和静态文件路由）
  // 注意：这是一个简化实现，实际应该更精细地管理路由
  console.log('API路由已重新加载，需要重启服务器使更改生效');
}

/**
 * 获取API路由配置（用于调试）
 */
export async function getApiRoutes(): Promise<ApiRouteConfig[]> {
  return await loadGeneratedApiRoutes();
}

/**
 * 根据路径查找API路由配置
 */
export async function findApiRouteByPath(path: string): Promise<ApiRouteConfig | undefined> {
  const routes = await loadGeneratedApiRoutes();
  return routes.find(route => route.path === path);
}

/**
 * 根据文件路径查找API路由配置
 */
export async function findApiRouteByFilePath(
  filePath: string
): Promise<ApiRouteConfig | undefined> {
  const routes = await loadGeneratedApiRoutes();
  return routes.find(route => route.filePath === filePath);
}
