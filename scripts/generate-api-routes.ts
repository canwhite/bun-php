#!/usr/bin/env bun
// scripts/generate-api-routes.ts
// 用途：扫描配置的目录，自动生成API路由配置

import { readdir, stat, readFile, writeFile } from 'fs/promises';
import { join, relative, dirname, basename, sep } from 'path';
import { existsSync } from 'fs';
import { minimatch } from 'minimatch';
import config from '../src/api.config.ts';
import type { ApiRouterConfig, ApiRouteConfig } from '../src/lib/router/types';

// ============ 常量定义 ============

const API_ROUTES_OUTPUT = './src/api.generated.ts';
const CONFIG_PATH = '../src/api.config.ts';

// ============ 工具函数 ============

/**
 * 加载API路由器配置
 */
async function loadConfig(): Promise<ApiRouterConfig> {
  try {
    // 动态导入配置文件
    const configModule = await import(CONFIG_PATH);
    return configModule.default;
  } catch (error) {
    console.error('加载API路由器配置失败:', error);
    throw error;
  }
}

/**
 * 判断目录是否应该被排除
 */
function shouldExcludeDir(dirPath: string, config: ApiRouterConfig): boolean {
  const relativePath = relative(config.rootDir, dirPath);
  const dirName = basename(dirPath);

  // 检查默认排除目录（基于目录名）
  const defaultExcludeDirs = [
    'islands',
    'components',
    'lib',
    'utils',
    'types',
    'styles',
    'hooks',
    'contexts',
    'stores',
    'public',
    'assets',
    'images',
    'dist',
    'build',
    'node_modules',
  ];

  if (defaultExcludeDirs.includes(dirName)) {
    return true;
  }

  // 检查用户自定义排除规则
  for (const pattern of config.excludeDirs) {
    // 检查是否为glob模式
    if (pattern.includes('*') || pattern.includes('?')) {
      if (minimatch(relativePath, pattern) || minimatch(dirName, pattern)) {
        return true;
      }
    }
    // 检查是否为相对路径
    else if (pattern.includes('/')) {
      if (relativePath === pattern) {
        return true;
      }
    }
    // 简单目录名匹配
    else {
      if (dirName === pattern) {
        return true;
      }
    }
  }

  // 检查忽略文件模式
  if (config.ignoreFiles) {
    for (const pattern of config.ignoreFiles) {
      if (minimatch(relativePath, pattern)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * 判断文件是否应该被忽略
 */
function shouldIgnoreFile(filePath: string, config: ApiRouterConfig): boolean {
  const relativePath = relative(config.rootDir, filePath);

  // 检查忽略文件模式
  if (config.ignoreFiles) {
    for (const pattern of config.ignoreFiles) {
      if (minimatch(relativePath, pattern)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * 判断是否为API路由文件
 */
function isApiFile(fileName: string, config: ApiRouterConfig): boolean {
  return config.apiFileNames.includes(fileName);
}

/**
 * 解析动态参数
 * 将文件名中的 [param] 转换为 :param
 */
function parseDynamicSegment(segment: string): {
  urlSegment: string;
  isDynamic: boolean;
  isCatchAll: boolean;
  isOptionalCatchAll: boolean;
  paramName?: string;
} {
  const match = segment.match(config.dynamicParamPattern);
  if (!match) {
    // 如果segment包含方括号但没有匹配，输出警告
    if (segment.includes('[') || segment.includes(']')) {
      console.warn(
        `[parseDynamicSegment] Pattern did not match segment: "${segment}", pattern: ${config.dynamicParamPattern}`
      );
    }
    return {
      urlSegment: segment,
      isDynamic: false,
      isCatchAll: false,
      isOptionalCatchAll: false,
    };
  }

  const param = match[1]!;
  const isCatchAll = param.startsWith('...');
  const isOptionalCatchAll = param.startsWith('[...') && param.endsWith(']');

  let paramName = param;
  if (isCatchAll) {
    paramName = param.slice(3); // 移除 "..."
  }
  if (isOptionalCatchAll) {
    paramName = param.slice(4, -1); // 移除 "[..." 和 "]"
  }

  let urlSegment: string;
  if (isCatchAll) {
    urlSegment = '*';
  } else {
    urlSegment = ':' + paramName;
  }

  return {
    urlSegment,
    isDynamic: true,
    isCatchAll,
    isOptionalCatchAll,
    paramName,
  };
}

/**
 * 递归扫描目录
 */
async function scanDirectory(
  dirPath: string,
  config: ApiRouterConfig,
  currentDepth = 0
): Promise<ApiRouteConfig[]> {
  const routes: ApiRouteConfig[] = [];

  // 检查深度限制
  if (currentDepth >= (config.maxDepth || 10)) {
    console.warn(`达到最大扫描深度 ${config.maxDepth}，停止扫描: ${dirPath}`);
    return routes;
  }

  // 检查目录是否应该被排除
  if (shouldExcludeDir(dirPath, config)) {
    if (config.logLevel === 'debug') {
      console.debug(`跳过排除目录: ${dirPath}`);
    }
    return routes;
  }

  try {
    const entries = await readdir(dirPath);

    for (const entry of entries) {
      const fullPath = join(dirPath, entry);
      let stats;

      try {
        stats = await stat(fullPath);
      } catch (error) {
        console.warn(`无法访问文件: ${fullPath}`, error);
        continue;
      }

      if (stats.isDirectory()) {
        // 递归扫描子目录
        const childRoutes = await scanDirectory(fullPath, config, currentDepth + 1);
        routes.push(...childRoutes);
      } else if (stats.isFile()) {
        // 检查文件是否应该被忽略
        if (shouldIgnoreFile(fullPath, config)) {
          continue;
        }

        // 检查是否为API路由文件
        if (isApiFile(entry, config)) {
          try {
            const route = await parseApiRoute(fullPath, config);
            routes.push(route);
          } catch (error) {
            console.error(`解析API路由失败: ${fullPath}`, error);
          }
        }
      }
    }
  } catch (error) {
    console.error(`扫描目录失败: ${dirPath}`, error);
  }

  return routes;
}

/**
 * 从API文件内容提取支持的HTTP方法
 */
async function extractSupportedMethods(filePath: string): Promise<string[]> {
  const supportedMethods: string[] = [];
  const httpMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];

  try {
    const content = await readFile(filePath, 'utf-8');

    // 检查导出的HTTP方法
    for (const method of httpMethods) {
      // 匹配 export const GET = ... 或 export function GET(...) 或 export async function GET(...)
      const regex = new RegExp(
        `export\\s+(?:const|let|var|async\\s+function|function)\\s+${method}\\s*[=:(]`,
        'i'
      );
      if (regex.test(content)) {
        supportedMethods.push(method);
      }
    }

    // 也检查默认导出，如果存在默认导出，假设支持所有方法？
    // 为了简化，暂时不处理默认导出

    if (supportedMethods.length === 0) {
      console.warn(`API文件未导出任何HTTP方法处理函数: ${filePath}`);
    }
  } catch (error) {
    console.error(`读取API文件失败: ${filePath}`, error);
  }

  return supportedMethods;
}

/**
 * 解析API路由
 */
async function parseApiRoute(filePath: string, config: ApiRouterConfig): Promise<ApiRouteConfig> {
  const relativePath = relative(config.rootDir, filePath);
  const routeDir = dirname(relativePath);
  const segments = routeDir.split(sep).filter(segment => segment !== '.');

  // 解析URL路径和参数
  let urlPath = '';
  const params: string[] = [];
  let isDynamic = false;
  let isCatchAll = false;
  let isOptionalCatchAll = false;

  for (const segment of segments) {
    const parsed = parseDynamicSegment(segment);

    if (parsed.urlSegment) {
      if (urlPath) {
        urlPath += '/';
      }
      urlPath += parsed.urlSegment;
    }

    if (parsed.isDynamic) {
      isDynamic = true;
      if (parsed.paramName) {
        params.push(parsed.paramName);
      }
    }
    if (parsed.isCatchAll) {
      isCatchAll = true;
    }
    if (parsed.isOptionalCatchAll) {
      isOptionalCatchAll = true;
    }
  }

  // 确保URL路径以 / 开头
  if (!urlPath.startsWith('/')) {
    urlPath = '/' + urlPath;
  }

  // 根API路由特殊处理
  if (urlPath === '/' && segments.length === 0) {
    urlPath = '/';
  }

  // 添加 /api 前缀到所有API路由
  if (urlPath === '/') {
    urlPath = '/api';
  } else {
    urlPath = '/api' + urlPath;
  }

  // 提取支持的HTTP方法
  const supportedMethods = await extractSupportedMethods(filePath);

  // 计算相对于src目录的导入路径
  const importPath = './' + relative('src', filePath).replace(/\\/g, '/');

  return {
    path: urlPath,
    filePath,
    relativePath,
    supportedMethods,
    importPath,
    isDynamic,
    isCatchAll,
    isOptionalCatchAll,
    params,
    routeDir: routeDir.replace(/\\/g, '/'),
  };
}

/**
 * 生成API路由配置内容
 */
function generateApiRoutesContent(routes: ApiRouteConfig[], config: ApiRouterConfig): string {
  const now = new Date().toISOString();

  // 生成单个API路由对象的字符串表示
  function routeToString(route: ApiRouteConfig): string {
    return `{
    path: ${JSON.stringify(route.path)},
    filePath: ${JSON.stringify(route.filePath)},
    relativePath: ${JSON.stringify(route.relativePath)},
    supportedMethods: ${JSON.stringify(route.supportedMethods)},
    importPath: ${JSON.stringify(route.importPath)},
    isDynamic: ${route.isDynamic},
    isCatchAll: ${route.isCatchAll},
    isOptionalCatchAll: ${route.isOptionalCatchAll},
    params: ${JSON.stringify(route.params)},
    routeDir: ${JSON.stringify(route.routeDir)}
  }`;
  }

  // 生成路由配置
  const routesConfig = routes.map(route => `  ${routeToString(route)}`).join(',\n');

  // 构建 routesByPath 索引
  const routesByPathStr = routes
    .map(route => `${JSON.stringify(route.path)}: ${routeToString(route)}`)
    .join(',\n');

  // 构建 routesByFilePath 索引
  const routesByFilePathStr = routes
    .map(route => `${JSON.stringify(route.filePath)}: ${routeToString(route)}`)
    .join(',\n');

  return `// ==============================================
// AUTO-GENERATED - DO NOT EDIT MANUALLY!
// API路由配置
// Generated at: ${now}
// ==============================================

import type { ApiRouteConfig } from './lib/router/types';

export const routes: ApiRouteConfig[] = [
${routesConfig}
];

export const routesByPath: Record<string, ApiRouteConfig> = {
${routesByPathStr}
};

export const routesByFilePath: Record<string, ApiRouteConfig> = {
${routesByFilePathStr}
};

export const config = {
  rootDir: ${JSON.stringify(config.rootDir)},
  generatedAt: ${JSON.stringify(now)},
  version: "1.0.0",
};

// 类型导出
export type { ApiRouteConfig };
`;
}

/**
 * 主函数
 */
async function main() {
  console.log('开始生成API路由配置...');

  try {
    // 加载配置
    const config = await loadConfig();

    // 根据配置确定扫描的目录
    let scanDirs: string[];
    if (config.routeDirs && config.routeDirs.length > 0) {
      // 如果指定了 routeDirs，只扫描这些目录
      scanDirs = config.routeDirs.map(dir => join(config.rootDir, dir));
    } else {
      // 否则扫描整个 rootDir
      scanDirs = [config.rootDir];
    }

    // 扫描所有目录
    let allRoutes: ApiRouteConfig[] = [];
    for (const scanDir of scanDirs) {
      if (!existsSync(scanDir)) {
        console.warn(`扫描目录不存在: ${scanDir}`);
        continue;
      }

      console.log(`扫描目录: ${scanDir}`);
      const routes = await scanDirectory(scanDir, config);
      allRoutes.push(...routes);
    }

    // 检查路由冲突
    const pathCounts: Record<string, number> = {};
    for (const route of allRoutes) {
      pathCounts[route.path] = (pathCounts[route.path] || 0) + 1;
    }

    const conflicts = Object.entries(pathCounts).filter(([_, count]) => count > 1);
    if (conflicts.length > 0) {
      console.warn('发现API路由冲突:');
      for (const [path, count] of conflicts) {
        console.warn(`  ${path}: ${count} 个路由`);
        const conflictingRoutes = allRoutes.filter(route => route.path === path);
        for (const route of conflictingRoutes) {
          console.warn(`    - ${route.filePath}`);
        }
      }
    }

    // 生成API路由配置内容
    const content = generateApiRoutesContent(allRoutes, config);

    // 写入文件
    await writeFile(API_ROUTES_OUTPUT, content, 'utf-8');

    console.log(`成功生成 ${allRoutes.length} 个API路由配置到 ${API_ROUTES_OUTPUT}`);

    // 如果有冲突，提示用户
    if (conflicts.length > 0) {
      console.warn(`警告: 发现 ${conflicts.length} 个API路由冲突，请检查上述文件`);
    }
  } catch (error) {
    console.error('生成API路由配置失败:', error);
    process.exit(1);
  }
}

// 执行主函数
if (import.meta.main) {
  main();
}

export default main;
