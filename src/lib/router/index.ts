// src/lib/router/index.ts
// 文件路由系统 - 路由注册器

import { Hono } from 'hono';
import { render } from 'preact-render-to-string';
import { join } from 'path';
import type { RouteConfig } from './types';

// 动态导入生成的路由配置
let routesCache: RouteConfig[] | null = null;

/**
 * 加载生成的路由配置
 */
async function loadGeneratedRoutes(): Promise<RouteConfig[]> {
  if (routesCache) {
    return routesCache;
  }

  try {
    // 动态导入生成的路由配置
    const routesModule = await import('../../routes.generated.ts');
    routesCache = routesModule.routes;
    return routesCache;
  } catch (error) {
    console.error('加载生成的路由配置失败:', error);
    throw error;
  }
}

/**
 * 解析导入路径为绝对路径
 * 将相对于src的路径转换为相对于当前文件的路径
 */
function resolveImportPath(importPath: string): string {
  // 如果路径已经是相对路径（以 ./ 或 ../ 开头），直接返回
  if (importPath.startsWith('./') || importPath.startsWith('../')) {
    return importPath;
  }

  // 否则，假设路径是相对于src目录的
  // 从 src/lib/router 到 src/ 的路径是 ../..
  // 所以需要加上 ../../ 前缀
  return join('../..', importPath);
}

/**
 * 动态导入组件
 */
async function importComponent(importPath: string): Promise<any> {
  try {
    const resolvedPath = resolveImportPath(importPath);
    const module = await import(resolvedPath);
    return module.default;
  } catch (error) {
    console.error(
      `导入组件失败: ${importPath} (resolved: ${resolveImportPath(importPath)})`,
      error
    );
    throw error;
  }
}

/**
 * 渲染页面组件（包含布局嵌套）
 */
async function renderPage(route: RouteConfig): Promise<string> {
  try {
    // 动态导入页面组件
    // route.pageComponent 是一个函数：() => import("app/page.tsx")
    const pageModule = await route.pageComponent();
    const pageComponent = pageModule.default;

    // 动态导入布局组件链
    const layoutComponents = await Promise.all(
      route.layoutComponents.map(async layoutPath => {
        const Layout = await importComponent(layoutPath);
        return Layout;
      })
    );

    // 嵌套渲染：布局包裹页面
    let content = pageComponent({});

    // 从最内层到最外层应用布局
    for (const Layout of layoutComponents.reverse()) {
      content = Layout({ children: content });
    }

    // 服务端渲染
    return `<!DOCTYPE html>${render(content)}`;
  } catch (error) {
    console.error(`渲染页面失败: ${route.path}`, error);
    throw error;
  }
}

/**
 * 注册文件路由到Hono应用
 */
export async function registerFileRoutes(app: Hono): Promise<void> {
  console.log('开始注册文件路由...');

  try {
    // 加载路由配置
    const routes = await loadGeneratedRoutes();
    console.log(`加载了 ${routes.length} 个路由配置`);

    // 注册每个路由
    for (const route of routes) {
      const { path, isDynamic, isCatchAll, params } = route;

      // 根据路由类型注册不同的处理器
      if (isCatchAll) {
        // 通配路由
        app.get(`${path}/*`, async c => {
          const html = await renderPage(route);
          return c.html(html);
        });
      } else if (isDynamic) {
        // 动态路由
        app.get(path, async c => {
          // 这里可以处理动态参数，如果需要传递给组件
          const html = await renderPage(route);
          return c.html(html);
        });
      } else {
        // 静态路由
        app.get(path, async c => {
          const html = await renderPage(route);
          return c.html(html);
        });
      }

      if (process.env.NODE_ENV === 'development') {
        console.log(`注册路由: ${path} (${route.filePath})`);
      }
    }

    console.log('文件路由注册完成');
  } catch (error) {
    console.error('注册文件路由失败:', error);
    throw error;
  }
}

/**
 * 开发时重新加载路由（热重载）
 */
export async function reloadRoutes(app: Hono): Promise<void> {
  if (process.env.NODE_ENV !== 'development') {
    console.warn('重新加载路由仅在开发模式下可用');
    return;
  }

  console.log('重新加载文件路由...');

  // 清除路由缓存
  routesCache = null;

  // 重新加载路由配置
  await loadGeneratedRoutes();

  // 清除现有路由（除了中间件和静态文件路由）
  // 注意：这是一个简化实现，实际应该更精细地管理路由
  console.log('路由已重新加载，需要重启服务器使更改生效');
}

/**
 * 获取路由配置（用于调试）
 */
export async function getRoutes(): Promise<RouteConfig[]> {
  return await loadGeneratedRoutes();
}

/**
 * 根据路径查找路由配置
 */
export async function findRouteByPath(path: string): Promise<RouteConfig | undefined> {
  const routes = await loadGeneratedRoutes();
  return routes.find(route => route.path === path);
}

/**
 * 根据文件路径查找路由配置
 */
export async function findRouteByFilePath(filePath: string): Promise<RouteConfig | undefined> {
  const routes = await loadGeneratedRoutes();
  return routes.find(route => route.filePath === filePath);
}
