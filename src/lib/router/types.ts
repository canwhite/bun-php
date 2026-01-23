// src/lib/router/types.ts
// File routing system type definitions

import type { Hono, Context } from 'hono';
import type { FunctionComponent } from 'preact';

// Response is available globally in Bun runtime
type Response = globalThis.Response;

// Configuration Types

export interface RouterConfig {
  rootDir: string;
  routeDirs?: string[];
  excludeDirs: string[];
  pageFileNames: string[];
  layoutFileNames: string[];
  loadingFileNames: string[];
  errorFileNames: string[];
  dynamicParamPattern: RegExp;
  defaultLayout?: string;
  notFoundPage?: string;
  watchMode: boolean;
  generateTypes: boolean;
  logLevel?: 'debug' | 'info' | 'warn' | 'error' | 'silent';
  maxDepth?: number;
  ignoreFiles?: string[];
}

// Route Configuration Types

export interface RouteConfig {
  // Route Information
  path: string;
  filePath: string;
  relativePath: string;

  // Component Information
  pageComponent: () => Promise<{ default: FunctionComponent<any> }>; // eslint-disable-line @typescript-eslint/no-explicit-any
  layoutComponents: string[];
  hasLoading: boolean;
  hasError: boolean;
  loadingComponent?: string;
  errorComponent?: string;

  // Route Features
  isDynamic: boolean;
  isCatchAll: boolean;
  isOptionalCatchAll: boolean;
  params: string[];

  // Metadata
  metadata?: Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  routeDir: string;

  // Exclusion Status
  excluded?: boolean;
  exclusionReason?: string;
}

// Simplified route configuration for route tree
export interface SimplifiedRouteConfig {
  // Route Information
  path: string;
  filePath: string;
  relativePath: string;

  // Component Information (strings instead of functions)
  pageComponent: string; // String path instead of function
  layoutComponents: string[];
  hasLoading: boolean;
  hasError: boolean;
  loadingComponent?: string;
  errorComponent?: string;

  // Route Features
  isDynamic: boolean;
  isCatchAll: boolean;
  isOptionalCatchAll: boolean;
  params: string[];

  // Metadata
  metadata?: Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  routeDir: string;

  // Exclusion Status
  excluded?: boolean;
  exclusionReason?: string;
}

// Route tree node
export interface RouteNode {
  page?: SimplifiedRouteConfig;
  layout?: string;
  children?: Record<string, RouteNode>;
}

// Route tree
export type RouteTree = Record<string, RouteNode>;

// Generated route configuration collection
export interface GeneratedRoutes {
  config: {
    rootDir: string;
    generatedAt: string;
    version: string;
  };
  routes: RouteConfig[];
  routeTree: RouteTree;
  routesByPath: Record<string, RouteConfig>;
  routesByFilePath: Record<string, RouteConfig>;
}

// Utility Function Types

export interface RouterOptions {
  app: Hono;
  config?: Partial<RouterConfig>;
  dev?: boolean;
}

// API Routing Types

export type ApiHandler = (c: Context) => Response | Promise<Response>;

export interface ApiRouteConfig {
  // Route Information
  path: string;
  filePath: string;
  relativePath: string;

  // HTTP Methods
  supportedMethods: string[]; // 例如: ['GET', 'POST']
  importPath: string; // 相对于src目录的导入路径，如 "./app/api/users/route.ts"

  // Route Features
  isDynamic: boolean;
  isCatchAll: boolean;
  isOptionalCatchAll: boolean;
  params: string[];

  // Metadata
  routeDir: string;
}

export interface ApiRouterConfig {
  rootDir: string;
  routeDirs?: string[];
  excludeDirs: string[];
  apiFileNames: string[];
  dynamicParamPattern: RegExp;
  watchMode: boolean;
  generateTypes: boolean;
  logLevel?: 'debug' | 'info' | 'warn' | 'error' | 'silent';
  maxDepth?: number;
  ignoreFiles?: string[];
}

export interface GeneratedApiRoutes {
  config: {
    rootDir: string;
    generatedAt: string;
    version: string;
  };
  routes: ApiRouteConfig[];
  routesByPath: Record<string, ApiRouteConfig>;
  routesByFilePath: Record<string, ApiRouteConfig>;
}

export interface ApiRouterOptions {
  app: Hono;
  config?: Partial<ApiRouterConfig>;
  dev?: boolean;
}

export interface ApiFileRouter {
  init(): Promise<void>;
  scanRoutes(): Promise<GeneratedApiRoutes>;
  registerRoutes(): Promise<void>;
  getRoutes(): GeneratedApiRoutes | null;
  reloadConfig(): Promise<void>;
}

export interface FileRouter {
  init(): Promise<void>;
  scanRoutes(): Promise<GeneratedRoutes>;
  registerRoutes(): Promise<void>;
  getRoutes(): GeneratedRoutes | null;
  reloadConfig(): Promise<void>;
}

// Default Configuration
export const defaultConfig: RouterConfig = {
  rootDir: 'src/',
  excludeDirs: [
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
  ],
  pageFileNames: ['page.tsx', 'page.jsx', 'page.ts', 'page.js'],
  layoutFileNames: ['layout.tsx', 'layout.jsx', 'layout.ts', 'layout.js'],
  loadingFileNames: ['loading.tsx', 'loading.jsx', 'loading.ts', 'loading.js'],
  errorFileNames: ['error.tsx', 'error.jsx', 'error.ts', 'error.js'],
  dynamicParamPattern: /^\[(\[?\w+(?:\.\.\.)?\]?)\]$/,
  watchMode: process.env.NODE_ENV === 'development',
  generateTypes: true,
  logLevel: process.env.NODE_ENV === 'development' ? 'info' : 'warn',
  maxDepth: 10,
  ignoreFiles: ['**/*.d.ts', '**/*.test.*', '**/*.spec.*', '**/.*', '**/node_modules/**'],
};

// Default API Configuration
export const defaultApiConfig: ApiRouterConfig = {
  rootDir: 'src/app/api',
  excludeDirs: [
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
  ],
  apiFileNames: ['route.ts', 'route.js', 'route.tsx', 'route.jsx'],
  dynamicParamPattern: /^\[(\[?\w+(?:\.\.\.)?\]?)\]$/,
  watchMode: process.env.NODE_ENV === 'development',
  generateTypes: true,
  logLevel: process.env.NODE_ENV === 'development' ? 'info' : 'warn',
  maxDepth: 10,
  ignoreFiles: ['**/*.d.ts', '**/*.test.*', '**/*.spec.*', '**/.*', '**/node_modules/**'],
};
