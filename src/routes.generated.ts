// ==============================================
// AUTO-GENERATED - DO NOT EDIT MANUALLY!
// 文件路由配置
// Generated at: 2026-01-24T07:56:07.320Z
// ==============================================



import type { RouteConfig } from './lib/router/types';
import type { GeneratedRoutes } from './lib/router/types';

export const routes: RouteConfig[] = [
  {
    path: "/about",
    filePath: "src/app/about/page.tsx",
    relativePath: "about/page.tsx",
    pageComponent: () => import("./app/about/page.tsx"),
    layoutComponents: [],
    hasLoading: false,
    hasError: false,
    loadingComponent: undefined,
    errorComponent: undefined,
    isDynamic: false,
    isCatchAll: false,
    isOptionalCatchAll: false,
    params: [],
    metadata: {},
    routeDir: "about",
    excluded: undefined,
    exclusionReason: undefined,
  },
  {
    path: "/api-test",
    filePath: "src/app/api-test/page.tsx",
    relativePath: "api-test/page.tsx",
    pageComponent: () => import("./app/api-test/page.tsx"),
    layoutComponents: [],
    hasLoading: false,
    hasError: false,
    loadingComponent: undefined,
    errorComponent: undefined,
    isDynamic: false,
    isCatchAll: false,
    isOptionalCatchAll: false,
    params: [],
    metadata: {},
    routeDir: "api-test",
    excluded: undefined,
    exclusionReason: undefined,
  },
  {
    path: "/users/:id",
    filePath: "src/app/users/[id]/page.tsx",
    relativePath: "users/[id]/page.tsx",
    pageComponent: () => import("./app/users/[id]/page.tsx"),
    layoutComponents: [],
    hasLoading: false,
    hasError: false,
    loadingComponent: undefined,
    errorComponent: undefined,
    isDynamic: true,
    isCatchAll: false,
    isOptionalCatchAll: false,
    params: ["id"],
    metadata: {},
    routeDir: "users/[id]",
    excluded: undefined,
    exclusionReason: undefined,
  },
  {
    path: "/",
    filePath: "src/app/page.tsx",
    relativePath: "page.tsx",
    pageComponent: () => import("./app/page.tsx"),
    layoutComponents: [],
    hasLoading: false,
    hasError: false,
    loadingComponent: undefined,
    errorComponent: undefined,
    isDynamic: false,
    isCatchAll: false,
    isOptionalCatchAll: false,
    params: [],
    metadata: {},
    routeDir: ".",
    excluded: undefined,
    exclusionReason: undefined,
  }
];

export const routeTree = {
  "about": {
    "page": {
      "path": "/about",
      "filePath": "src/app/about/page.tsx",
      "relativePath": "about/page.tsx",
      "pageComponent": "./app/about/page.tsx",
      "layoutComponents": [],
      "hasLoading": false,
      "hasError": false,
      "isDynamic": false,
      "isCatchAll": false,
      "isOptionalCatchAll": false,
      "params": [],
      "routeDir": "about"
    }
  },
  "api-test": {
    "page": {
      "path": "/api-test",
      "filePath": "src/app/api-test/page.tsx",
      "relativePath": "api-test/page.tsx",
      "pageComponent": "./app/api-test/page.tsx",
      "layoutComponents": [],
      "hasLoading": false,
      "hasError": false,
      "isDynamic": false,
      "isCatchAll": false,
      "isOptionalCatchAll": false,
      "params": [],
      "routeDir": "api-test"
    }
  },
  "users": {
    ":id": {
      "page": {
        "path": "/users/:id",
        "filePath": "src/app/users/[id]/page.tsx",
        "relativePath": "users/[id]/page.tsx",
        "pageComponent": "./app/users/[id]/page.tsx",
        "layoutComponents": [],
        "hasLoading": false,
        "hasError": false,
        "isDynamic": true,
        "isCatchAll": false,
        "isOptionalCatchAll": false,
        "params": [
          "id"
        ],
        "routeDir": "users/[id]"
      }
    }
  }
};

export const routesByPath: Record<string, RouteConfig> = {
"/about": {
    path: "/about",
    filePath: "src/app/about/page.tsx",
    relativePath: "about/page.tsx",
    pageComponent: () => import("./app/about/page.tsx"),
    layoutComponents: [],
    hasLoading: false,
    hasError: false,
    loadingComponent: undefined,
    errorComponent: undefined,
    isDynamic: false,
    isCatchAll: false,
    isOptionalCatchAll: false,
    params: [],
    metadata: {},
    routeDir: "about",
    excluded: undefined,
    exclusionReason: undefined
  },
"/api-test": {
    path: "/api-test",
    filePath: "src/app/api-test/page.tsx",
    relativePath: "api-test/page.tsx",
    pageComponent: () => import("./app/api-test/page.tsx"),
    layoutComponents: [],
    hasLoading: false,
    hasError: false,
    loadingComponent: undefined,
    errorComponent: undefined,
    isDynamic: false,
    isCatchAll: false,
    isOptionalCatchAll: false,
    params: [],
    metadata: {},
    routeDir: "api-test",
    excluded: undefined,
    exclusionReason: undefined
  },
"/users/:id": {
    path: "/users/:id",
    filePath: "src/app/users/[id]/page.tsx",
    relativePath: "users/[id]/page.tsx",
    pageComponent: () => import("./app/users/[id]/page.tsx"),
    layoutComponents: [],
    hasLoading: false,
    hasError: false,
    loadingComponent: undefined,
    errorComponent: undefined,
    isDynamic: true,
    isCatchAll: false,
    isOptionalCatchAll: false,
    params: ["id"],
    metadata: {},
    routeDir: "users/[id]",
    excluded: undefined,
    exclusionReason: undefined
  },
"/": {
    path: "/",
    filePath: "src/app/page.tsx",
    relativePath: "page.tsx",
    pageComponent: () => import("./app/page.tsx"),
    layoutComponents: [],
    hasLoading: false,
    hasError: false,
    loadingComponent: undefined,
    errorComponent: undefined,
    isDynamic: false,
    isCatchAll: false,
    isOptionalCatchAll: false,
    params: [],
    metadata: {},
    routeDir: ".",
    excluded: undefined,
    exclusionReason: undefined
  }
};

export const routesByFilePath: Record<string, RouteConfig> = {
"src/app/about/page.tsx": {
    path: "/about",
    filePath: "src/app/about/page.tsx",
    relativePath: "about/page.tsx",
    pageComponent: () => import("./app/about/page.tsx"),
    layoutComponents: [],
    hasLoading: false,
    hasError: false,
    loadingComponent: undefined,
    errorComponent: undefined,
    isDynamic: false,
    isCatchAll: false,
    isOptionalCatchAll: false,
    params: [],
    metadata: {},
    routeDir: "about",
    excluded: undefined,
    exclusionReason: undefined
  },
"src/app/api-test/page.tsx": {
    path: "/api-test",
    filePath: "src/app/api-test/page.tsx",
    relativePath: "api-test/page.tsx",
    pageComponent: () => import("./app/api-test/page.tsx"),
    layoutComponents: [],
    hasLoading: false,
    hasError: false,
    loadingComponent: undefined,
    errorComponent: undefined,
    isDynamic: false,
    isCatchAll: false,
    isOptionalCatchAll: false,
    params: [],
    metadata: {},
    routeDir: "api-test",
    excluded: undefined,
    exclusionReason: undefined
  },
"src/app/users/[id]/page.tsx": {
    path: "/users/:id",
    filePath: "src/app/users/[id]/page.tsx",
    relativePath: "users/[id]/page.tsx",
    pageComponent: () => import("./app/users/[id]/page.tsx"),
    layoutComponents: [],
    hasLoading: false,
    hasError: false,
    loadingComponent: undefined,
    errorComponent: undefined,
    isDynamic: true,
    isCatchAll: false,
    isOptionalCatchAll: false,
    params: ["id"],
    metadata: {},
    routeDir: "users/[id]",
    excluded: undefined,
    exclusionReason: undefined
  },
"src/app/page.tsx": {
    path: "/",
    filePath: "src/app/page.tsx",
    relativePath: "page.tsx",
    pageComponent: () => import("./app/page.tsx"),
    layoutComponents: [],
    hasLoading: false,
    hasError: false,
    loadingComponent: undefined,
    errorComponent: undefined,
    isDynamic: false,
    isCatchAll: false,
    isOptionalCatchAll: false,
    params: [],
    metadata: {},
    routeDir: ".",
    excluded: undefined,
    exclusionReason: undefined
  }
};

export const config = {
  rootDir: "src/app/",
  generatedAt: "2026-01-24T07:56:07.320Z",
  version: "1.0.0",
};

// 类型导出
export type { RouteConfig };
export type { GeneratedRoutes } from './lib/router/types';
