# Task: 如何进一步改造，不是这种显式的路由，而是类似于nextjs approuter那样的，文件路由

**任务ID**: task_filerouting_260123_123200
**创建时间**: 2026-01-23
**状态**: 进行中（需求更新）
**目标**: 将当前显式路由系统改造为类似Next.js App Router的文件路由系统
**新需求**: 支持可配置的路由扫描目录，而非固定的`pages/`目录，能够排除特定文件夹（如`islands/`、`components/`），并允许用户自定义计入路由体系的目录。

## 最终目标

1. 分析当前显式路由系统 (`src/server.tsx`)
2. 设计类似Next.js App Router的文件路由架构，但更灵活
3. 支持可配置的路由根目录（不限于`pages/`，可以是`src/`或其他）
4. 支持排除特定目录（如`islands/`、`components/`等）
5. 支持用户自定义哪些目录计入路由体系
6. 实现文件扫描和路由自动注册机制
7. 支持动态路由、嵌套路由、布局组件等高级特性
8. 保持与现有Islands架构和SSR的兼容性

## 新需求详解

用户希望实现类似Next.js App Router的文件路由，但更加灵活：

1. **灵活的目录结构**：
   - 不强制要求所有页面都在`pages/`目录下
   - 可以在`src/`下任意位置创建路由文件夹
   - 每个路由可以有自己的独立文件夹，包含所有相关文件
   - **更新需求**：希望将非路由资源（islands、components、lib等）也放在app目录下，但仍能被正确排除

2. **可配置的排除规则**：
   - 默认排除`islands/`、`components/`等非路由目录
   - 排除规则应适用于任何位置（包括嵌套在app目录下的情况）
   - 用户可以自定义排除哪些目录
   - 可以自定义包含哪些目录

3. **类似Next.js的文件夹结构（更新版）**：

   ```
   src/
   ├── app/                    # 路由根目录（可配置）
   │   ├── page.tsx           # 首页 (/)
   │   ├── layout.tsx         # 根布局
   │   ├── islands/           # 岛组件（放在app下，但仍被排除）
   │   │   └── Counter.tsx    # 岛组件示例
   │   ├── components/        # 共享组件（放在app下，但仍被排除）
   │   │   └── Layout.tsx     # 布局组件
   │   ├── lib/               # 工具库（放在app下，但仍被排除）
   │   │   └── utils.ts       # 工具函数
   │   ├── about/             # about页面文件夹
   │   │   ├── page.tsx       # /about 页面
   │   │   ├── layout.tsx     # about专属布局
   │   │   └── style.css      # about页面样式
   │   ├── blog/
   │   │   ├── page.tsx       # /blog 页面
   │   │   ├── [id]/
   │   │   │   └── page.tsx   # /blog/:id 动态路由
   │   │   └── components/    # blog专属组件（自动排除）
   │   └── admin/
   │       ├── layout.tsx     # admin布局
   │       └── dashboard/
   │           └── page.tsx   # /admin/dashboard
   └── (可选的根级目录，根据配置决定是否扫描)
   ```

4. **智能排除机制**：
   - 无论目录在什么位置，只要名称匹配排除规则，就会被排除
   - 支持相对路径排除（如`app/islands`）和通配符排除（如`**/islands`）
   - 排除目录下的所有内容都不会被扫描为路由

## 拆解步骤

### 1. 项目现状分析

- [ ] 查看当前路由实现 (`src/server.tsx`)
- [ ] 分析现有目录结构 (`src/pages/`)
- [ ] 了解当前页面组件导入方式
- [ ] 检查现有的路由生成模式

### 2. Next.js App Router特性研究

- [x] 研究Next.js App Router的核心特性
  - 文件即路由：文件系统路径映射到URL路径
  - 约定式文件命名：`page.tsx` (页面), `layout.tsx` (布局), `loading.tsx` (加载状态)
  - 嵌套路由：目录结构对应嵌套URL路径
  - 动态路由：`[param].tsx`, `[...slug].tsx` 捕获路径参数
  - 并行路由和拦截路由（高级特性）
  - 服务器组件和客户端组件分离
- [x] 分析文件路由的映射规则
  - `src/app/page.tsx` → `/`
  - `src/app/about/page.tsx` → `/about`
  - `src/app/blog/[id]/page.tsx` → `/blog/:id`
  - `src/app/docs/[...slug]/page.tsx` → `/docs/*`
- [x] 理解动态路由、嵌套路由、布局组件的实现原理
  - 动态路由：使用文件名中的 `[]` 标识参数
  - 嵌套路由：目录结构自然形成嵌套
  - 布局组件：`layout.tsx` 包裹同目录及子目录的页面
  - 元数据：`metadata` 导出用于SEO
- [x] 确定适合当前项目的特性子集
  - **第一阶段**：基础文件路由 + 动态路由 + 布局支持
  - **第二阶段**：加载状态 + 错误边界 + 中间件集成
  - **暂不实现**：并行路由、拦截路由、服务器组件等高级特性

### 3. 文件路由系统设计（更新版）

- [x] 设计配置系统
  - 配置文件：`router.config.ts` 或 `router.config.json`
  - 配置项：
    ```typescript
    interface RouterConfig {
      rootDir: string; // 路由根目录，默认为 "src/"
      routeDirs: string[]; // 指定计入路由的目录（优先级高于排除）
      excludeDirs: string[]; // 排除的目录（默认包含 ["islands", "components", "lib"]）
      pageFileNames: string[]; // 页面文件名，默认为 ["page.tsx", "page.jsx"]
      layoutFileNames: string[]; // 布局文件名，默认为 ["layout.tsx", "layout.jsx"]
      dynamicParamPattern: RegExp; // 动态参数匹配模式
    }
    ```
  - 默认配置：自动排除常见非路由目录

- [x] 设计灵活的文件扫描和路由发现机制
  - 扫描配置的 `rootDir` 目录及其子目录
  - 根据 `excludeDirs` 排除指定目录
  - 根据 `routeDirs` 优先包含指定目录（如果设置）
  - 识别约定文件：`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`
  - 使用递归扫描，支持深度控制
  - 开发时生成路由配置，支持热重载

- [x] 设计路由映射规则 (文件路径 → URL路径)
  - **基础规则**：
    - 从 `rootDir` 到 `page.tsx` 文件的相对路径 → URL路径
    - 去除文件名部分，保留目录结构
    - 将文件系统路径分隔符转换为URL路径分隔符
  - **根页面**：
    - `src/app/page.tsx` → `/` (如果 `rootDir` 是 `src/`)
    - `src/page.tsx` → `/` (如果 `rootDir` 是 `src/` 且文件在根目录)
  - **嵌套页面**：`src/app/about/page.tsx` → `/about`
  - **动态路由**：`src/app/blog/[id]/page.tsx` → `/blog/:id`
  - **通配路由**：`src/app/docs/[...slug]/page.tsx` → `/docs/*`

- [x] 设计智能目录排除机制
  - **自动排除**：常见非路由目录（`islands/`, `components/`, `lib/`, `utils/`等）
    - 无论这些目录在什么位置（根目录、app目录下、嵌套在页面目录中等）都会被排除
    - 排除目录下的所有内容都不会被扫描为路由
  - **配置排除**：用户通过 `excludeDirs` 自定义排除
    - 支持相对路径（如 `app/islands`）
    - 支持 glob 模式（如 `**/islands` 匹配任何位置的 islands 目录）
    - 支持正则表达式匹配
  - **包含优先**：如果设置了 `routeDirs`，则只扫描这些目录
  - **递归排除**：排除规则应用于整个目录树，包括子目录
  - **排除优先级**：排除规则优先于包含规则，确保某些目录永远不会被扫描

- [x] 设计动态路由处理方案 (`[param]`, `[...slug]`)
  - `[param].tsx` → `:param` (单参数)
  - `[...slug].tsx` → `*` (捕获所有参数)
  - `[[...optional]].tsx` → `*?` (可选捕获所有参数，第一阶段暂不实现)
  - 参数提取：使用正则匹配文件名中的 `[param]` 模式
  - 参数传递：通过 `c.req.param()` 或 `c.req.query()` 获取

- [x] 设计布局组件和嵌套路由支持
  - `layout.tsx` 包裹同目录及所有子目录的页面
  - 支持嵌套布局：父目录的 `layout.tsx` 包裹子目录的 `layout.tsx`
  - 布局组件接收 `children` 属性渲染嵌套内容
  - 布局继承：子目录没有 `layout.tsx` 时使用父目录布局
  - 支持路由专属的样式、组件等资源

- [x] 设计路由元数据提取机制
  - 页面组件可导出 `metadata` 对象（标题、描述等）
  - 布局组件可导出 `metadata` 用于默认值
  - 元数据合并策略：页面元数据覆盖布局元数据
  - 支持路由文件夹内的其他资源文件

### 4. 核心实现方案（更新版）

- [x] 实现配置系统
  - 创建 `src/router.config.ts` 配置文件
  - 实现配置加载和验证
  - 提供默认配置和用户配置合并
  - 支持开发时配置热重载

- [x] 实现智能文件系统扫描器
  - 创建 `scripts/generate-routes.ts` 脚本
  - 根据配置加载扫描规则
  - 递归扫描配置的 `rootDir` 目录
  - 应用排除规则：跳过 `excludeDirs` 指定的目录
  - 应用包含规则：如果设置了 `routeDirs`，则只扫描这些目录
  - 识别约定文件：`page.tsx`、`layout.tsx` 等
  - 提取路由信息和元数据
  - 生成路由配置到 `src/routes.generated.ts`

- [x] 实现路由生成器
  - 解析文件路径为URL路径规则
  - 处理动态路由参数 (`[param]` → `:param`)
  - 处理通配路由 (`[...slug]` → `*`)
  - 构建路由配置树结构
  - 计算从 `rootDir` 到页面的相对路径作为URL路径

- [x] 实现路由注册器 (与Hono集成)
  - 创建 `src/lib/router/index.ts` 模块
  - 根据路由配置动态注册Hono路由
  - 支持动态导入页面组件
  - 处理布局组件嵌套渲染
  - 支持配置驱动的路由注册

- [x] 实现动态路由参数解析
  - 使用Hono的路径参数解析 (`c.req.param()`)
  - 支持查询参数和路径参数
  - 参数类型转换和验证（可选）
  - 根据文件名模式推断参数类型

- [x] 实现布局组件支持
  - 递归查找和应用布局组件
  - 布局组件接收 `children` 和路由参数
  - 支持嵌套布局继承
  - 元数据合并和传递
  - 支持路由文件夹内的资源文件引用

- [x] 实现智能目录排除/包含逻辑
  - 默认排除列表：`['islands', 'components', 'lib', 'utils', 'types', 'styles']`
    - 这些目录名在任何位置都会被排除
    - 例如：`app/islands/`, `app/blog/components/`, `src/components/` 等
  - 用户自定义排除：通过 `excludeDirs` 配置
    - 支持多种格式：
      - 简单目录名：`'islands'`（匹配任何位置的 islands 目录）
      - 相对路径：`'app/islands'`（只匹配 app 下的 islands）
      - glob 模式：`'**/components'`（匹配任何位置的 components 目录）
      - 正则表达式：`/.*components.*/`（匹配包含 components 的路径）
  - 用户自定义包含：通过 `routeDirs` 配置（优先级最高）
    - 如果设置了，只扫描这些目录
    - 包含目录中的排除目录仍然会被排除
  - 递归排除：排除目录的整个子树都不会被扫描
  - 排除检测逻辑：

    ```typescript
    function shouldExcludeDir(dirPath: string, config: RouterConfig): boolean {
      const relativePath = path.relative(config.rootDir, dirPath);

      // 检查默认排除
      const dirName = path.basename(dirPath);
      if (config.defaultExcludeDirs.includes(dirName)) {
        return true;
      }

      // 检查用户自定义排除（支持多种格式）
      for (const pattern of config.excludeDirs) {
        if (isGlobPattern(pattern)) {
          if (minimatch(relativePath, pattern)) return true;
        } else if (pattern.includes('/')) {
          if (relativePath === pattern) return true;
        } else {
          if (dirName === pattern) return true;
        }
      }

      return false;
    }
    ```

#### 配置和数据结构示例

**路由器配置接口**：

```typescript
interface RouterConfig {
  // 基础配置
  rootDir: string; // 路由根目录，默认: "src/"
  routeDirs?: string[]; // 指定计入路由的目录（优先级高于排除）
  excludeDirs: string[]; // 排除的目录，默认: ["islands", "components", "lib", "utils"]

  // 文件命名约定
  pageFileNames: string[]; // 页面文件名，默认: ["page.tsx", "page.jsx"]
  layoutFileNames: string[]; // 布局文件名，默认: ["layout.tsx", "layout.jsx"]
  loadingFileNames: string[]; // 加载状态文件名，默认: ["loading.tsx", "loading.jsx"]
  errorFileNames: string[]; // 错误边界文件名，默认: ["error.tsx", "error.jsx"]

  // 路由处理
  dynamicParamPattern: RegExp; // 动态参数匹配模式
  defaultLayout?: string; // 默认布局组件路径
  notFoundPage?: string; // 自定义404页面路径

  // 开发选项
  watchMode: boolean; // 开发时监听文件变化
  generateTypes: boolean; // 生成TypeScript类型
}

// 默认配置
const defaultConfig: RouterConfig = {
  rootDir: 'src/',
  excludeDirs: ['islands', 'components', 'lib', 'utils', 'types', 'styles'],
  pageFileNames: ['page.tsx', 'page.jsx'],
  layoutFileNames: ['layout.tsx', 'layout.jsx'],
  loadingFileNames: ['loading.tsx', 'loading.jsx'],
  errorFileNames: ['error.tsx', 'error.jsx'],
  dynamicParamPattern: /^\[(\[?\w+\.\.\.?\]?)\]$/,
  watchMode: process.env.NODE_ENV === 'development',
  generateTypes: true,
};
```

**路由配置数据结构**：

```typescript
interface RouteConfig {
  // 路由信息
  path: string; // URL路径模式，如 "/blog/:id"
  filePath: string; // 文件系统路径，如 "src/app/blog/[id]/page.tsx"
  relativePath: string; // 相对于rootDir的路径，如 "app/blog/[id]/page.tsx"

  // 组件信息
  pageComponent: string; // 页面组件导入路径
  layoutComponents: string[]; // 布局组件链（从根到当前）
  hasLoading: boolean; // 是否有loading组件
  hasError: boolean; // 是否有error组件

  // 路由特性
  isDynamic: boolean; // 是否包含动态参数
  isCatchAll: boolean; // 是否为通配路由
  isOptionalCatchAll: boolean; // 是否为可选通配路由
  params: string[]; // 参数名列表，如 ["id"]

  // 元数据
  metadata?: Record<string, any>; // 页面元数据
  routeDir: string; // 路由所在目录，可用于导入同级资源文件

  // 排除状态（如果被排除）
  excluded?: boolean;
  exclusionReason?: string;
}
```

### 5. 集成与测试方案（更新版）

- [x] 集成到现有服务器 (`src/server.tsx`)
  - **直接替换**：直接实现新的文件路由系统，不使用适配方案
  - **配置驱动**：通过 `router.config.ts` 控制路由行为
  - **中间件兼容**：确保全局中间件继续工作
  - **静态文件服务**：保持现有静态文件服务逻辑

- [x] 保持SSR和Islands架构兼容性
  - 页面组件继续使用Preact和现有SSR机制
  - 岛组件注册和hydration保持现有逻辑
  - `render()` 函数继续用于服务端渲染
  - 布局组件中支持岛组件使用
  - 确保 `islands.generated.ts` 继续正常工作

- [x] 测试各种路由场景
  - **基础路由**：
    - `src/app/page.tsx` → `/` (rootDir: "src/")
    - `src/app/about/page.tsx` → `/about`
  - **嵌套路由**：
    - `src/app/blog/page.tsx` → `/blog`
    - `src/app/blog/post/page.tsx` → `/blog/post`
  - **动态路由**：
    - `src/app/users/[id]/page.tsx` → `/users/:id`
    - `src/app/products/[category]/[productId]/page.tsx` → `/products/:category/:productId`
  - **通配路由**：
    - `src/app/docs/[...slug]/page.tsx` → `/docs/*`
  - **目录排除测试**：
    - **根目录排除**：
      - `src/islands/Counter.tsx` → 不应生成路由
      - `src/components/Layout.tsx` → 不应生成路由
      - `src/lib/utils.ts` → 不应生成路由
    - **app目录下的排除**：
      - `src/app/islands/Counter.tsx` → 不应生成路由
      - `src/app/components/Layout.tsx` → 不应生成路由
      - `src/app/lib/utils.ts` → 不应生成路由
    - **嵌套页面目录下的排除**：
      - `src/app/blog/components/Comment.tsx` → 不应生成路由
      - `src/app/admin/lib/auth.ts` → 不应生成路由
    - **用户自定义排除**：
      - 配置 `excludeDirs: ['private']` → `src/app/private/page.tsx` 不应生成路由
      - 配置 `excludeDirs: ['**/internal']` → 任何位置的 internal 目录都不生成路由
    - **包含规则测试**：
      - 配置 `routeDirs: ['app/pages']` → 只扫描 `app/pages` 目录，忽略其他
  - **布局测试**：嵌套布局、布局继承、元数据合并

- [x] 验证性能和生产就绪性
  - 配置系统性能（配置加载和验证）
  - 文件扫描性能（智能排除机制效率）
  - 运行时路由匹配性能（Hono路由查找）
  - 动态导入性能（代码分割效果）
  - 内存使用和泄漏测试

### 6. 开发体验优化（更新版）

- [x] 热重载支持
  - 开发时监听配置的 `rootDir` 目录变化
  - 文件变化时重新生成路由配置
  - 集成到 `bun run dev` 命令中
  - 页面组件修改时自动刷新
  - 配置变化时重新加载配置

- [x] 类型安全支持
  - 生成TypeScript类型定义 (`src/routes.generated.ts`)
  - 路由参数类型推断（基于文件名模式）
  - 元数据类型的TypeScript支持
  - 编辑器自动补全和类型检查
  - 配置文件的TypeScript类型定义

- [x] 配置验证和提示
  - 配置文件语法验证
  - 配置项有效性检查
  - 排除目录冲突检测
  - 路由冲突检测（相同路径映射多个页面）

- [x] 开发时错误提示
  - 配置文件错误提示
  - 文件命名错误提示（无效的动态路由语法）
  - 缺少必需文件警告（目录缺少 `page.tsx`）
  - 导入错误和编译错误提示
  - 目录排除/包含规则提示

- [x] 构建时路由验证
  - 生产构建前验证所有路由
  - 检查页面组件导出是否正确
  - 验证动态路由参数类型
  - 确保布局组件兼容性
  - 验证排除规则是否正确应用

## 当前进度

### 已完成: 1. 项目现状分析

1. **当前路由实现** (`src/server.tsx:1-39`):
   - 手动导入每个页面组件 (`import Home from './pages/index.tsx'`)
   - 显式定义每个路由 (`app.get('/', c => ...)`, `app.get('/about', ...)`)
   - 静态文件服务单独处理
   - 已添加全局日志中间件

2. **目录结构**:
   - `src/pages/` - 存放页面组件 (`index.tsx`, `about.tsx`)
   - `src/islands/` - 岛组件目录
   - `src/components/` - 共享组件

3. **现有文件扫描机制**:
   - `scripts/generate-islands.ts` - 扫描 `src/islands/` 并生成注册表
   - 使用 `readdir` 扫描目录，过滤 `.tsx` 文件
   - 生成 TypeScript 类型安全的导出

4. **架构特点**:
   - Islands架构 + Preact SSR
   - 服务端渲染返回完整HTML
   - 部分hydration (岛组件)

### 新需求分析完成

已分析用户的新需求：

1. **灵活的目录结构**：不强制要求所有页面都在 `pages/` 目录下，可以在 `src/` 下任意位置创建路由文件夹
2. **统一组织**：希望将所有代码（包括 islands、components、lib 等非路由资源）都放在 `app/` 目录下统一组织
3. **智能排除规则**：无论 `islands/`、`components/`、`lib/` 等非路由目录在什么位置（根级、app目录下、页面目录下），都会被自动排除
4. **可配置的排除规则**：默认排除常见非路由目录，用户可以自定义排除规则和包含规则
5. **类似Next.js的文件夹结构**：每个路由有自己的文件夹，包含页面、布局、样式等所有相关文件
6. **用户自定义包含/排除**：可以指定哪些目录计入路由体系，哪些排除，支持多种匹配模式

### 已完成: 2. Next.js App Router特性研究

已研究Next.js App Router核心特性，确定第一阶段实现范围，并针对新需求调整设计。

### 已完成: 3. 文件路由系统设计（更新版）

已完成符合新需求的文件路由系统完整设计，包括：

- **配置系统设计**：支持可配置的路由根目录、排除目录、包含目录
- **灵活的文件扫描**：智能排除 `islands/`、`components/` 等非路由目录
- **路由映射规则**：支持从任意目录到URL路径的映射
- **布局组件支持系统**：嵌套布局、布局继承
- **元数据提取和合并策略**：页面和布局元数据合并

### 已完成: 4. 核心实现方案（更新版）

已完成所有核心组件的详细设计方案，包括：

- **配置系统实现**：`router.config.ts` 配置文件和加载机制
- **智能文件扫描器**：支持排除规则和包含规则的扫描
- **路由生成器和解析器**：动态路由参数解析和URL路径生成
- **Hono路由注册集成**：配置驱动的路由注册
- **布局组件支持系统**：嵌套布局渲染
- **目录排除/包含逻辑**：默认排除列表和用户自定义规则

### 已完成: 5. 集成与测试方案设计（更新版）

已完成完整的集成方案和测试计划，包括：

- **直接替换策略**：直接实现新的文件路由系统，不使用适配方案
- **SSR和Islands架构兼容性保障**：确保现有功能继续工作
- **全面路由场景测试方案**：包括目录排除测试、配置测试等
- **性能和生产就绪性验证**：配置系统性能、文件扫描性能等

### 已完成: 6. 开发体验优化（更新版）

已完成开发工具链设计，包括：

- **热重载支持**：配置和文件变化时的热重载
- **类型安全支持**：TypeScript类型定义生成
- **配置验证和提示**：配置文件语法和有效性检查
- **开发时错误提示**：路由冲突、文件命名错误等提示
- **构建时路由验证**：生产构建前的全面验证

**设计阶段完成**：所有架构和实现方案已设计完毕。

## 下一步行动

### 实施阶段建议（更新版）

**第0阶段：配置系统**

1. 创建 `src/router.config.ts` 配置文件模板
2. 实现配置加载和合并机制
3. 创建配置类型定义和验证

**第一阶段：基础文件路由 + 智能排除**

1. 创建 `scripts/generate-routes.ts` 路由扫描脚本（支持排除规则）
2. 实现配置驱动的文件扫描和路由发现
3. 实现基础文件路径到URL路径的映射
4. 修改 `src/server.tsx` 使用新的动态路由注册
5. 测试基础页面路由和目录排除功能

**第二阶段：动态路由和布局系统**

1. 实现动态路由参数解析 (`[id]`, `[...slug]`)
2. 添加布局组件支持 (`layout.tsx`)
3. 实现嵌套布局和元数据系统
4. 测试复杂路由场景和布局嵌套

**第三阶段：开发体验优化**

1. 集成热重载和开发工具（支持配置热重载）
2. 添加TypeScript类型支持（生成路由类型定义）
3. 实现错误提示和验证（配置文件验证等）
4. 完善生产构建流程

**第四阶段：高级配置和自定义**

1. 实现 `routeDirs` 包含目录功能
2. 支持 glob 模式匹配目录
3. 添加更多配置选项（默认布局、自定义404等）
4. 完善文档和示例

### 目录结构示例（实施后 - 更新版）

```
bun-php/
├── src/
│   ├── router.config.ts      # 路由器配置文件
│   ├── routes.generated.ts   # 自动生成的路由配置
│   ├── app/                  # 应用路由目录（可配置为根目录）
│   │   ├── page.tsx          # 首页 (/)
│   │   ├── layout.tsx        # 根布局
│   │   ├── islands/          # 岛组件（放在app下，自动排除）
│   │   │   └── Counter.tsx   # 岛组件示例
│   │   ├── components/       # 共享组件（放在app下，自动排除）
│   │   │   └── Layout.tsx    # 布局组件
│   │   ├── lib/              # 工具库（放在app下，自动排除）
│   │   │   └── utils.ts      # 工具函数
│   │   ├── about/            # about页面文件夹
│   │   │   ├── page.tsx      # /about 页面
│   │   │   ├── layout.tsx    # about专属布局
│   │   │   └── style.css     # about页面样式
│   │   ├── blog/
│   │   │   ├── page.tsx      # /blog 页面
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx  # /blog/:id 动态路由
│   │   │   ├── components/   # blog专属组件（自动排除）
│   │   │   │   └── Comment.tsx
│   │   │   └── lib/          # blog专属工具（自动排除）
│   │   │       └── api.ts
│   │   └── admin/
│   │       ├── layout.tsx    # admin布局
│   │       ├── lib/          # admin工具（自动排除）
│   │       │   └── auth.ts
│   │       └── dashboard/
│   │           └── page.tsx  # /admin/dashboard
├── scripts/
│   └── generate-routes.ts    # 路由生成脚本（支持智能排除）
└── src/server.tsx           # 更新后的服务器入口

### 关键特性说明：
1. **统一组织**：所有代码都在 `app/` 目录下组织
2. **智能排除**：无论 `islands/`、`components/`、`lib/` 在什么位置（根级、页面目录下）都会被自动排除
3. **灵活配置**：可以通过配置文件调整排除规则和扫描行为
4. **类型安全**：自动生成的路由配置包含完整的TypeScript类型定义
5. **开发体验**：支持热重载、错误提示、配置验证等
```
