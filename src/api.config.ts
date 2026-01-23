// src/api.config.ts
// API路由系统配置文件

import type { ApiRouterConfig } from './lib/router/types';
import { defaultApiConfig } from './lib/router/types';

/**
 * API路由器配置
 *
 * 默认配置：
 * - rootDir: "src/app/api" - API路由根目录
 * - 自动排除 islands/, components/, lib/, utils/, types/, styles/ 等非API目录
 * - 支持 route.ts, route.js, route.tsx, route.jsx 等约定文件
 * - 开发时监听文件变化，生产时生成类型定义
 */
const config: ApiRouterConfig = {
  // ============ 基础配置 ============

  /**
   * API路由根目录
   * 默认: "src/app/api" - 扫描 src/app/api 目录下的文件
   * 可以设置为其他目录，如 "src/api/"
   */
  rootDir: defaultApiConfig.rootDir,

  /**
   * 指定计入路由的目录（优先级高于排除规则）
   * 如果设置了这个数组，则只扫描这些目录，忽略其他目录
   * 示例: ["."] - 扫描 rootDir 下的所有目录
   * 如果为空数组，则扫描整个 rootDir
   */
  routeDirs: [],

  // 排除的目录（支持多种格式）
  excludeDirs: [
    // 默认排除的常见非API目录
    'islands', // 岛组件目录（任何位置）
    'components', // 组件目录（任何位置）
    'lib', // 工具库目录（任何位置）
    'utils', // 工具目录（任何位置）
    'types', // 类型定义目录（任何位置）
    'styles', // 样式目录（任何位置）
    'hooks', // 自定义hooks目录（任何位置）
    'contexts', // 上下文目录（任何位置）
    'stores', // 状态存储目录（任何位置）
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
   * API文件名列表
   * 扫描时识别这些文件作为API路由文件
   */
  apiFileNames: ['route.ts', 'route.js', 'route.tsx', 'route.jsx'],

  // ============ 路由处理配置 ============

  /**
   * 动态参数匹配模式
   * 用于识别文件名中的动态参数
   * - [param] → 单参数
   * - [...slug] → 通配参数
   * - [[...optional]] → 可选通配参数
   */
  dynamicParamPattern: defaultApiConfig.dynamicParamPattern,

  // ============ 开发选项 ============

  /**
   * 开发时监听文件变化
   * 开发模式下启用，生产模式下禁用
   */
  watchMode: process.env.NODE_ENV === 'development',

  /**
   * 生成TypeScript类型定义
   * 生成 api.generated.ts 文件，包含完整的类型定义
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
   * API路由扫描深度限制
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
export type { ApiRouterConfig };
