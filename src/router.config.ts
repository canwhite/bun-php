// src/router.config.ts
// 文件路由系统配置文件

import type { RouterConfig } from './lib/router/types';

/**
 * 路由器配置
 *
 * 默认配置：
 * - rootDir: "src/" - 路由根目录
 * - 自动排除 islands/, components/, lib/, utils/, t
 * ypes/, styles/ 等非路由目录
 * - 支持 page.tsx, layout.tsx, loading.tsx, error.tsx 等约定文件
 * - 开发时监听文件变化，生产时生成类型定义
 */
const config: RouterConfig = {
  // ============ 基础配置 ============

  /**
   * 路由根目录
   * 默认: "src/" - 扫描 src 目录下的文件
   * 可以设置为 "src/app/" 如果只想扫描 app 目录
   */
  rootDir: 'src/app/',

  /**
   * 指定计入路由的目录（优先级高于排除规则）
   * 如果设置了这个数组，则只扫描这些目录，忽略其他目录
   * 示例: ["."] - 扫描 rootDir 下的所有目录
   * 如果为空数组，则扫描整个 rootDir
   */
  routeDirs: [],

  // 排除的目录（支持多种格式）
  excludeDirs: [
    // 默认排除的常见非路由目录
    'islands', // 岛组件目录（任何位置）
    'components', // 组件目录（任何位置）
    'lib', // 工具库目录（任何位置）
    'utils', // 工具目录（任何位置）
    'types', // 类型定义目录（任何位置）
    'styles', // 样式目录（任何位置）
    'hooks', // 自定义hooks目录（任何位置）
    'contexts', // 上下文目录（任何位置）
    'stores', // 状态存储目录（任何位置）
    'api', // API路由目录（任何位置）
    'public', // 静态资源目录（任何位置）
    'assets', // 资源目录（任何位置）
    'images', // 图片目录（任何位置）

    // 开发相关目录
    '**/*.test.*', // 测试文件
    '**/*.spec.*', // 测试文件
    '**/__tests__', // 测试目录
    '**/__mocks__', // mock目录

    // 构建相关目录
    'dist', // 构建输出目录
    'build', // 构建目录
    'node_modules', // 依赖目录
  ],

  // ============ 文件命名约定 ============

  /**
   * 页面文件名列表
   * 扫描时识别这些文件作为页面组件
   */
  pageFileNames: ['page.tsx', 'page.jsx', 'page.ts', 'page.js'],

  /**
   * 布局文件名列表
   * 扫描时识别这些文件作为布局组件
   */
  layoutFileNames: ['layout.tsx', 'layout.jsx', 'layout.ts', 'layout.js'],

  /**
   * 加载状态文件名列表
   * 扫描时识别这些文件作为加载状态组件
   */
  loadingFileNames: ['loading.tsx', 'loading.jsx', 'loading.ts', 'loading.js'],

  /**
   * 错误边界文件名列表
   * 扫描时识别这些文件作为错误边界组件
   */
  errorFileNames: ['error.tsx', 'error.jsx', 'error.ts', 'error.js'],

  // ============ 路由处理配置 ============

  /**
   * 动态参数匹配模式
   * 用于识别文件名中的动态参数
   * - [param] → 单参数
   * - [...slug] → 通配参数
   * - [[...optional]] → 可选通配参数
   */
  dynamicParamPattern: /^\[(\[?\w+\.\.\.?\]?)\]$/,

  /**
   * 默认布局组件路径
   * 如果页面没有找到布局组件，使用这个默认布局
   * 相对于 rootDir 的路径
   */
  defaultLayout: undefined, // 例如: "app/layout.tsx"

  /**
   * 自定义404页面路径
   * 相对于 rootDir 的路径
   */
  notFoundPage: undefined, // 例如: "app/not-found.tsx"

  // ============ 开发选项 ============

  /**
   * 开发时监听文件变化
   * 开发模式下启用，生产模式下禁用
   */
  watchMode: process.env.NODE_ENV === 'development',

  /**
   * 生成TypeScript类型定义
   * 生成 routes.generated.ts 文件，包含完整的类型定义
   */
  generateTypes: true,

  /**
   * 开发时控制台日志级别
   * - "debug": 显示所有调试信息
   * - "info": 显示基本信息（默认）
   * - "warn": 只显示警告和错误
   * - "error": 只显示错误
   * - "silent": 不显示日志
   */
  logLevel: process.env.NODE_ENV === 'development' ? 'info' : 'warn',

  /**
   * 路由扫描深度限制
   * 防止无限递归扫描，默认扫描10层深度
   */
  maxDepth: 10,

  /**
   * 忽略的文件模式
   * 使用 glob 模式匹配忽略的文件
   */
  ignoreFiles: [
    '**/*.d.ts', // TypeScript声明文件
    '**/*.test.*', // 测试文件
    '**/*.spec.*', // 测试文件
    '**/.*', // 隐藏文件
    '**/node_modules/**', // node_modules目录
  ],
};

export default config;

// 导出配置类型，供其他地方使用
export type { RouterConfig };
