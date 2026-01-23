#!/usr/bin/env bun
// scripts/generate-routes.ts
// 用途：扫描配置的目录，自动生成文件路由配置

import { readdir, stat, readFile, writeFile } from 'fs/promises';
import { join, relative, dirname, basename, extname, sep } from 'path';
import { existsSync } from 'fs';
import { minimatch } from 'minimatch';
import config from '../src/router.config.ts';
import type {
  RouterConfig,
  RouteConfig,
  GeneratedRoutes,
  SimplifiedRouteConfig,
} from '../src/lib/router/types';

// ============ 常量定义 ============

const ROUTES_OUTPUT = './src/routes.generated.ts';
const CONFIG_PATH = '../src/router.config.ts';

// ============ 工具函数 ============

/**
 * 加载路由器配置
 */
async function loadConfig(): Promise<RouterConfig> {
  try {
    // 动态导入配置文件
    const configModule = await import(CONFIG_PATH);
    return configModule.default;
  } catch (error) {
    console.error('加载路由器配置失败:', error);
    throw error;
  }
}

/**
 * 判断目录是否应该被排除
 */
function shouldExcludeDir(dirPath: string, config: RouterConfig): boolean {
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
    'api',
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
function shouldIgnoreFile(filePath: string, config: RouterConfig): boolean {
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
 * 判断是否为页面文件
 */
function isPageFile(fileName: string, config: RouterConfig): boolean {
  return config.pageFileNames.includes(fileName);
}

/**
 * 判断是否为布局文件
 */
function isLayoutFile(fileName: string, config: RouterConfig): boolean {
  return config.layoutFileNames.includes(fileName);
}

/**
 * 判断是否为加载状态文件
 */
function isLoadingFile(fileName: string, config: RouterConfig): boolean {
  return config.loadingFileNames.includes(fileName);
}

/**
 * 判断是否为错误边界文件
 */
function isErrorFile(fileName: string, config: RouterConfig): boolean {
  return config.errorFileNames.includes(fileName);
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
    return {
      urlSegment: segment,
      isDynamic: false,
      isCatchAll: false,
      isOptionalCatchAll: false,
    };
  }

  const param = match[1];
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
 * 查找布局组件链
 * 从页面文件所在目录向上查找 layout 文件
 */
async function findLayoutComponents(pagePath: string, config: RouterConfig): Promise<string[]> {
  const layouts: string[] = [];
  let currentDir = dirname(pagePath);

  // 从页面所在目录向上查找 layout 文件
  while (currentDir.startsWith(config.rootDir)) {
    // 检查当前目录是否被排除
    if (shouldExcludeDir(currentDir, config)) {
      break;
    }

    // 查找 layout 文件
    for (const layoutFileName of config.layoutFileNames) {
      const layoutPath = join(currentDir, layoutFileName);
      if (existsSync(layoutPath)) {
        const relativeLayoutPath = './' + relative('src', layoutPath).replace(/\\/g, '/');
        layouts.push(relativeLayoutPath);
        break; // 每个目录最多一个 layout 文件
      }
    }

    // 向上移动一级
    const parentDir = dirname(currentDir);

    // 如果到达根目录或超出 rootDir，停止查找
    if (parentDir === currentDir || !parentDir.startsWith(config.rootDir)) {
      break;
    }

    currentDir = parentDir;
  }

  // 反转顺序，使根布局在前
  return layouts.reverse();
}

/**
 * 递归扫描目录
 */
async function scanDirectory(
  dirPath: string,
  config: RouterConfig,
  currentDepth = 0
): Promise<RouteConfig[]> {
  const routes: RouteConfig[] = [];

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

        // 检查是否为页面文件
        if (isPageFile(entry, config)) {
          try {
            const route = await parsePageRoute(fullPath, config);
            routes.push(route);
          } catch (error) {
            console.error(`解析页面路由失败: ${fullPath}`, error);
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
 * 解析页面路由
 */
async function parsePageRoute(filePath: string, config: RouterConfig): Promise<RouteConfig> {
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

  // 根页面特殊处理
  if (urlPath === '/' && segments.length === 0) {
    urlPath = '/';
  }

  // 查找布局组件链
  const layoutComponents = await findLayoutComponents(filePath, config);

  // 检查是否有 loading 和 error 组件
  const routeDirPath = dirname(filePath);
  let hasLoading = false;
  let hasError = false;
  let loadingComponent: string | undefined;
  let errorComponent: string | undefined;

  for (const loadingFileName of config.loadingFileNames) {
    const loadingPath = join(routeDirPath, loadingFileName);
    if (existsSync(loadingPath)) {
      hasLoading = true;
      loadingComponent = './' + relative('src', loadingPath).replace(/\\/g, '/');
      break;
    }
  }

  for (const errorFileName of config.errorFileNames) {
    const errorPath = join(routeDirPath, errorFileName);
    if (existsSync(errorPath)) {
      hasError = true;
      errorComponent = './' + relative('src', errorPath).replace(/\\/g, '/');
      break;
    }
  }

  // 尝试提取元数据
  let metadata: Record<string, any> | undefined;
  try {
    const content = await readFile(filePath, 'utf-8');
    // 简单提取 export const metadata = { ... } 或 export const metadata: Metadata = { ... }
    const metadataMatch = content.match(
      /export\s+(?:const|let|var)\s+metadata\s*(?::\s*\w+\s*)?=\s*({[\s\S]*?})(?:\s*;|\s*$)/
    );
    if (metadataMatch) {
      try {
        // 注意：这里只是简单提取，实际应该使用TypeScript解析器
        // 这里使用 eval 仅用于演示，生产环境应该使用更安全的方法
        const metadataStr = metadataMatch[1]
          .replace(/(\w+)\s*:/g, '"$1":') // 将键转换为字符串
          .replace(/'([^']*)'/g, '"$1"') // 将单引号替换为双引号
          .replace(/,(\s*[}\]])/g, '$1'); // 移除尾随逗号

        metadata = JSON.parse(metadataStr);
      } catch (error) {
        // 解析失败，忽略元数据
        console.debug(`解析元数据失败: ${filePath}`, error);
      }
    }
  } catch (error) {
    // 读取文件失败，忽略元数据
    console.debug(`读取文件失败，无法提取元数据: ${filePath}`, error);
  }

  return {
    path: urlPath,
    filePath,
    relativePath,
    pageComponent: './' + relative('src', filePath).replace(/\\/g, '/'),
    layoutComponents,
    hasLoading,
    hasError,
    loadingComponent,
    errorComponent,
    isDynamic,
    isCatchAll,
    isOptionalCatchAll,
    params,
    metadata,
    routeDir: routeDir.replace(/\\/g, '/'),
  };
}

/**
 * 简化路由配置（用于 routeTree，不需要函数）
 */
function simplifyRoute(route: RouteConfig): SimplifiedRouteConfig {
  return {
    path: route.path,
    filePath: route.filePath,
    relativePath: route.relativePath,
    pageComponent: route.pageComponent, // 字符串路径，不是函数
    layoutComponents: route.layoutComponents,
    hasLoading: route.hasLoading,
    hasError: route.hasError,
    loadingComponent: route.loadingComponent,
    errorComponent: route.errorComponent,
    isDynamic: route.isDynamic,
    isCatchAll: route.isCatchAll,
    isOptionalCatchAll: route.isOptionalCatchAll,
    params: route.params,
    metadata: route.metadata,
    routeDir: route.routeDir,
    excluded: route.excluded,
    exclusionReason: route.exclusionReason,
  };
}

/**
 * 构建路由树
 */
function buildRouteTree(routes: RouteConfig[]): Record<string, any> {
  const routeTree: Record<string, any> = {};

  for (const route of routes) {
    const segments = route.path.split('/').filter(segment => segment !== '');
    let currentNode = routeTree;

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      if (!currentNode[segment]) {
        currentNode[segment] = {};
      }

      if (i === segments.length - 1) {
        // 到达叶子节点，设置页面配置
        currentNode[segment].page = simplifyRoute(route);
      }

      currentNode = currentNode[segment];
    }
  }

  return routeTree;
}

/**
 * 生成路由配置内容
 */
function generateRoutesContent(routes: RouteConfig[], config: RouterConfig): string {
  const now = new Date().toISOString();
  const routeTree = buildRouteTree(routes);

  // 构建 routesByPath 索引
  const routesByPath: Record<string, RouteConfig> = {};
  const routesByFilePath: Record<string, RouteConfig> = {};

  for (const route of routes) {
    // 创建转换后的路由对象，pageComponent 转换为函数
    const transformedRoute = {
      ...route,
      pageComponent: () => import(route.pageComponent),
    };
    routesByPath[route.path] = transformedRoute;
    routesByFilePath[route.filePath] = transformedRoute;
  }

  // 生成导入语句（布局组件）
  const layoutImports = new Set<string>();
  for (const route of routes) {
    for (const layout of route.layoutComponents) {
      layoutImports.add(layout);
    }
  }

  const imports = Array.from(layoutImports)
    .map(
      layout =>
        `import type * as ${generateComponentName(layout)} from '${layout.replace('./', '')}';`
    )
    .join('\n');

  // 生成路由配置
  const routesConfig = routes
    .map(route => {
      return `  {
    path: ${JSON.stringify(route.path)},
    filePath: ${JSON.stringify(route.filePath)},
    relativePath: ${JSON.stringify(route.relativePath)},
    pageComponent: () => import(${JSON.stringify(route.pageComponent)}),
    layoutComponents: ${JSON.stringify(route.layoutComponents)},
    hasLoading: ${route.hasLoading},
    hasError: ${route.hasError},
    loadingComponent: ${route.loadingComponent ? JSON.stringify(route.loadingComponent) : 'undefined'},
    errorComponent: ${route.errorComponent ? JSON.stringify(route.errorComponent) : 'undefined'},
    isDynamic: ${route.isDynamic},
    isCatchAll: ${route.isCatchAll},
    isOptionalCatchAll: ${route.isOptionalCatchAll},
    params: ${JSON.stringify(route.params)},
    metadata: ${JSON.stringify(route.metadata || {})},
    routeDir: ${JSON.stringify(route.routeDir)},
    excluded: ${route.excluded ? 'true' : 'undefined'},
    exclusionReason: ${route.exclusionReason ? JSON.stringify(route.exclusionReason) : 'undefined'},
  }`;
    })
    .join(',\n');

  // 生成组件名称（用于类型）
  function generateComponentName(path: string): string {
    const name = basename(path, extname(path))
      .replace(/[^a-zA-Z0-9]/g, '_')
      .replace(/^_+|_+$/g, '');

    // 确保以字母开头
    if (/^[0-9]/.test(name)) {
      return 'Component_' + name;
    }
    return name;
  }

  // 生成单个路由对象的字符串表示（包含 pageComponent 函数）
  function routeToString(route: RouteConfig): string {
    return `{
    path: ${JSON.stringify(route.path)},
    filePath: ${JSON.stringify(route.filePath)},
    relativePath: ${JSON.stringify(route.relativePath)},
    pageComponent: () => import(${JSON.stringify(route.pageComponent)}),
    layoutComponents: ${JSON.stringify(route.layoutComponents)},
    hasLoading: ${route.hasLoading},
    hasError: ${route.hasError},
    loadingComponent: ${route.loadingComponent ? JSON.stringify(route.loadingComponent) : 'undefined'},
    errorComponent: ${route.errorComponent ? JSON.stringify(route.errorComponent) : 'undefined'},
    isDynamic: ${route.isDynamic},
    isCatchAll: ${route.isCatchAll},
    isOptionalCatchAll: ${route.isOptionalCatchAll},
    params: ${JSON.stringify(route.params)},
    metadata: ${JSON.stringify(route.metadata || {})},
    routeDir: ${JSON.stringify(route.routeDir)},
    excluded: ${route.excluded ? 'true' : 'undefined'},
    exclusionReason: ${route.exclusionReason ? JSON.stringify(route.exclusionReason) : 'undefined'}
  }`;
  }

  // 手动生成 routesByPath 字符串（使用原始路由对象）
  const routesByPathStr = routes
    .map(route => `${JSON.stringify(route.path)}: ${routeToString(route)}`)
    .join(',\n');

  // 手动生成 routesByFilePath 字符串（使用原始路由对象）
  const routesByFilePathStr = routes
    .map(route => `${JSON.stringify(route.filePath)}: ${routeToString(route)}`)
    .join(',\n');

  return `// ==============================================
// AUTO-GENERATED - DO NOT EDIT MANUALLY!
// 文件路由配置
// Generated at: ${now}
// ==============================================

${imports}

import type { RouteConfig } from './lib/router/types';
import type { GeneratedRoutes } from './lib/router/types';

export const routes: RouteConfig[] = [
${routesConfig}
];

export const routeTree = ${JSON.stringify(routeTree, null, 2)};

export const routesByPath: Record<string, RouteConfig> = {
${routesByPathStr}
};

export const routesByFilePath: Record<string, RouteConfig> = {
${routesByFilePathStr}
};

export const config = {
  rootDir: ${JSON.stringify(config.rootDir)},
  generatedAt: ${JSON.stringify(now)},
  version: "1.0.0",
};

// 类型导出
export type { RouteConfig };
export type { GeneratedRoutes } from './lib/router/types';
`;
}

/**
 * 主函数
 */
async function main() {
  console.log('开始生成文件路由配置...');

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
    let allRoutes: RouteConfig[] = [];
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
      console.warn('发现路由冲突:');
      for (const [path, count] of conflicts) {
        console.warn(`  ${path}: ${count} 个路由`);
        const conflictingRoutes = allRoutes.filter(route => route.path === path);
        for (const route of conflictingRoutes) {
          console.warn(`    - ${route.filePath}`);
        }
      }
    }

    // 生成路由配置内容
    const content = generateRoutesContent(allRoutes, config);

    // 写入文件
    await writeFile(ROUTES_OUTPUT, content, 'utf-8');

    console.log(`成功生成 ${allRoutes.length} 个路由配置到 ${ROUTES_OUTPUT}`);

    // 如果有冲突，提示用户
    if (conflicts.length > 0) {
      console.warn(`警告: 发现 ${conflicts.length} 个路由冲突，请检查上述文件`);
    }
  } catch (error) {
    console.error('生成路由配置失败:', error);
    process.exit(1);
  }
}

// 执行主函数
if (import.meta.main) {
  main();
}

export default main;
