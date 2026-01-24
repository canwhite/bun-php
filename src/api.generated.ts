// ==============================================
// AUTO-GENERATED - DO NOT EDIT MANUALLY!
// API路由配置
// Generated at: 2026-01-24T08:19:21.748Z
// ==============================================

import type { ApiRouteConfig } from './lib/router/types';

export const routes: ApiRouteConfig[] = [
  {
    path: "/api/users",
    filePath: "src/app/api/users/route.ts",
    relativePath: "users/route.ts",
    supportedMethods: ["GET","POST"],
    importPath: "./app/api/users/route.ts",
    isDynamic: false,
    isCatchAll: false,
    isOptionalCatchAll: false,
    params: [],
    routeDir: "users"
  },
  {
    path: "/api/users/:id",
    filePath: "src/app/api/users/[id]/route.ts",
    relativePath: "users/[id]/route.ts",
    supportedMethods: ["GET","PUT","DELETE"],
    importPath: "./app/api/users/[id]/route.ts",
    isDynamic: true,
    isCatchAll: false,
    isOptionalCatchAll: false,
    params: ["id"],
    routeDir: "users/[id]"
  },
  {
    path: "/api/hello",
    filePath: "src/app/api/hello/route.ts",
    relativePath: "hello/route.ts",
    supportedMethods: ["GET","POST"],
    importPath: "./app/api/hello/route.ts",
    isDynamic: false,
    isCatchAll: false,
    isOptionalCatchAll: false,
    params: [],
    routeDir: "hello"
  }
];

export const routesByPath: Record<string, ApiRouteConfig> = {
"/api/users": {
    path: "/api/users",
    filePath: "src/app/api/users/route.ts",
    relativePath: "users/route.ts",
    supportedMethods: ["GET","POST"],
    importPath: "./app/api/users/route.ts",
    isDynamic: false,
    isCatchAll: false,
    isOptionalCatchAll: false,
    params: [],
    routeDir: "users"
  },
"/api/users/:id": {
    path: "/api/users/:id",
    filePath: "src/app/api/users/[id]/route.ts",
    relativePath: "users/[id]/route.ts",
    supportedMethods: ["GET","PUT","DELETE"],
    importPath: "./app/api/users/[id]/route.ts",
    isDynamic: true,
    isCatchAll: false,
    isOptionalCatchAll: false,
    params: ["id"],
    routeDir: "users/[id]"
  },
"/api/hello": {
    path: "/api/hello",
    filePath: "src/app/api/hello/route.ts",
    relativePath: "hello/route.ts",
    supportedMethods: ["GET","POST"],
    importPath: "./app/api/hello/route.ts",
    isDynamic: false,
    isCatchAll: false,
    isOptionalCatchAll: false,
    params: [],
    routeDir: "hello"
  }
};

export const routesByFilePath: Record<string, ApiRouteConfig> = {
"src/app/api/users/route.ts": {
    path: "/api/users",
    filePath: "src/app/api/users/route.ts",
    relativePath: "users/route.ts",
    supportedMethods: ["GET","POST"],
    importPath: "./app/api/users/route.ts",
    isDynamic: false,
    isCatchAll: false,
    isOptionalCatchAll: false,
    params: [],
    routeDir: "users"
  },
"src/app/api/users/[id]/route.ts": {
    path: "/api/users/:id",
    filePath: "src/app/api/users/[id]/route.ts",
    relativePath: "users/[id]/route.ts",
    supportedMethods: ["GET","PUT","DELETE"],
    importPath: "./app/api/users/[id]/route.ts",
    isDynamic: true,
    isCatchAll: false,
    isOptionalCatchAll: false,
    params: ["id"],
    routeDir: "users/[id]"
  },
"src/app/api/hello/route.ts": {
    path: "/api/hello",
    filePath: "src/app/api/hello/route.ts",
    relativePath: "hello/route.ts",
    supportedMethods: ["GET","POST"],
    importPath: "./app/api/hello/route.ts",
    isDynamic: false,
    isCatchAll: false,
    isOptionalCatchAll: false,
    params: [],
    routeDir: "hello"
  }
};

export const config = {
  rootDir: "src/app/api",
  generatedAt: "2026-01-24T08:19:21.748Z",
  version: "1.0.0",
};

// 类型导出
export type { ApiRouteConfig };
