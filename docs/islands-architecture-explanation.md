# Islands 架构核心文件解析：entry-client.tsx 和 generate-islands.ts

## 概述

本文档解释 **Islands 架构** 中两个关键文件的作用和工作原理：
- `src/entry-client.tsx` - 客户端 hydration（复活）入口
- `scripts/generate-islands.ts` - 自动组件注册脚本

这两个文件共同实现了 **部分 hydration**（部分复活）架构，是现代 MPA（多页面应用）中 Islands 架构的核心实现。

---

## 1. `src/entry-client.tsx` - 客户端 "复活" 入口

### 1.1 核心功能
这个文件负责让页面上的交互式组件"活起来"，实现从静态 HTML 到动态组件的转换。

### 1.2 工作流程
```javascript
// 简化的工作流程：
// 1. 页面加载完成后执行
// 2. 找到所有交互组件：<div data-island="counter"></div>
// 3. 从自动生成的注册表中找到对应的组件
// 4. 把组件"安装"到 DOM 元素上
// 5. 组件就开始有交互能力了（点击、输入等）
```

### 1.3 代码解析
```typescript
// src/entry-client.tsx 的核心逻辑：

// 导入必要的依赖
import { hydrate } from "preact";
import { islands } from "./islands.generated";

function initHydration() {
  // 1. 扫描所有带有 data-island 属性的元素
  document.querySelectorAll("[data-island]").forEach(el => {
    // 2. 获取组件名称（如 "counter"）
    const islandName = el.getAttribute("data-island");

    // 3. 从注册表中查找对应组件
    if (!islandName || !(islandName in islands)) {
      console.warn(`未找到 island 组件：${islandName}`);
      return;
    }

    try {
      // 4. 解析组件的初始数据（props）
      const propsRaw = el.getAttribute("data-props") || "{}";
      const props = JSON.parse(propsRaw);
      const Component = islands[islandName as keyof typeof islands];

      // 5. 使用 hydrate 接管已渲染的 DOM
      hydrate(<Component {...props} />, el);
    } catch (err) {
      console.error(`Island ${islandName} hydration 失败:`, err);
    }
  });
}

// 6. 在合适的时机执行（避免页面闪烁）
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initHydration);
} else {
  initHydration();
}
```

### 1.4 关键概念解释

#### **hydration（复活/水合）**
- **作用**：将服务端渲染的静态 HTML 转换为可交互的 React/Preact 组件
- **优势**：避免重新渲染整个页面，只"复活"需要交互的部分
- **性能**：比传统的客户端渲染（CSR）更快，因为用户看到的是完整的 HTML

#### **data-island 属性**
```html
<!-- 在服务端渲染的 HTML 中 -->
<div data-island="counter" data-props='{"initial": 5}'>
  <!-- 静态内容 -->
</div>
```
- **标识符**：告诉客户端哪个元素需要变成交互式组件
- **命名规则**：使用 kebab-case（如 "counter"、"my-component"）

#### **data-props 属性**
- **数据传递**：将服务端的数据传递给客户端组件
- **格式**：必须是有效的 JSON 字符串
- **示例**：`data-props='{"initial": 5, "name": "用户"}'`

### 1.5 为什么重要？
1. **性能优化**：只加载必要的 JavaScript，减少初始包大小
2. **SEO 友好**：服务端渲染完整的 HTML，搜索引擎可以正确索引
3. **用户体验**：避免页面闪烁（FOUC），内容立即显示
4. **渐进增强**：即使 JavaScript 加载失败，页面仍可正常显示

---

## 2. `scripts/generate-islands.ts` - 自动注册脚本

### 2.1 核心功能
这个脚本自动收集所有交互式组件，创建一个"组件电话簿"（注册表）。

### 2.2 工作流程
```javascript
// 简化的工作流程：
// 1. 读取 islands/ 目录下的所有 .tsx 文件
// 2. 过滤出组件文件（排除测试文件和以下划线开头的文件）
// 3. 生成导入语句和注册表
// 4. 保存到 islands.generated.ts
```

### 2.3 代码解析
```typescript
// scripts/generate-islands.ts 的核心逻辑：

import { readdir, writeFile } from "fs/promises";
import { basename } from "path";

const ISLANDS_DIR = "./src/islands";
const OUTPUT = "./src/islands.generated.ts";

async function generate() {
  try {
    // 1. 读取 islands 目录
    const files = await readdir(ISLANDS_DIR);

    // 2. 过滤出组件文件
    const components = files.filter(
      f => f.endsWith(".tsx") && !f.startsWith("_") && !f.includes(".test.")
    );

    // 3. 生成导入语句
    const imports = components
      .map(name => {
        const componentName = basename(name, ".tsx");
        return `import ${componentName} from "./islands/${componentName}";`;
      })
      .join("\n");

    // 4. 生成注册表（PascalCase → kebab-case）
    const registrations = components
      .map(name => {
        const componentName = basename(name, ".tsx");
        // 转换规则：Counter → counter, MyComponent → my-component
        const kebabName = componentName
          .replace(/([A-Z])/g, "-$1")
          .toLowerCase()
          .replace(/^-/, "");

        return `  "${kebabName}": ${componentName},`;
      })
      .join("\n");

    // 5. 生成完整的注册表文件
    const content = `// ==============================================
// AUTO-GENERATED - DO NOT EDIT MANUALLY!
// Generated at: ${new Date().toISOString()}
// ==============================================

${imports}

export const islands = {
${registrations}
} as const;

export type IslandName = keyof typeof islands;
`;

    // 6. 写入文件
    await writeFile(OUTPUT, content, "utf-8");
    console.log(`成功生成 ${components.length} 个 islands 注册`);
  } catch (err) {
    console.error("生成 islands 索引失败:", err);
    process.exit(1);
  }
}

generate();
```

### 2.4 命名转换规则
| 文件名（PascalCase） | 组件名 | 注册键名（kebab-case） | 使用方式 |
|---------------------|--------|------------------------|----------|
| `Counter.tsx` | `Counter` | `"counter"` | `data-island="counter"` |
| `MyComponent.tsx` | `MyComponent` | `"my-component"` | `data-island="my-component"` |
| `UserProfile.tsx` | `UserProfile` | `"user-profile"` | `data-island="user-profile"` |

**转换算法**：
```javascript
function pascalToKebab(pascalName) {
  return pascalName
    .replace(/([A-Z])/g, "-$1")  // 在大写字母前加连字符
    .toLowerCase()               // 全部转小写
    .replace(/^-/, "");          // 移除开头的连字符
}
```

### 2.5 生成的文件示例
```typescript
// src/islands.generated.ts
// ==============================================
// AUTO-GENERATED - DO NOT EDIT MANUALLY!
// Generated at: 2026-01-20T09:30:00.000Z
// ==============================================

import Counter from "./islands/Counter";
import MyComponent from "./islands/MyComponent";

export const islands = {
  "counter": Counter,
  "my-component": MyComponent,
} as const;

export type IslandName = keyof typeof islands;
```

### 2.6 为什么重要？
1. **自动化**：添加新组件后自动注册，无需手动维护
2. **一致性**：确保命名规范统一，避免拼写错误
3. **类型安全**：TypeScript 知道有哪些可用的组件
4. **开发效率**：减少重复工作，专注业务逻辑

---

## 3. 两个文件如何配合工作

### 3.1 完整的开发流程

#### 步骤 1：创建组件
```bash
# 在 src/islands/ 目录下创建新组件
touch src/islands/MyCounter.tsx
```

```typescript
// src/islands/MyCounter.tsx
export default function MyCounter({ initial = 0 }) {
  const [count, setCount] = useState(initial);
  return (
    <div>
      <p>计数: {count}</p>
      <button onClick={() => setCount(count + 1)}>增加</button>
    </div>
  );
}
```

#### 步骤 2：自动注册
```bash
# 运行生成脚本
bun run generate:islands
```

**生成结果**：
- 组件名：`MyCounter`
- 注册键名：`"my-counter"`
- 自动添加到 `islands.generated.ts`

#### 步骤 3：服务端渲染
```typescript
// 在页面组件中使用
export default function HomePage() {
  return `
    <div>
      <h1>首页</h1>
      <div data-island="my-counter" data-props='{"initial": 10}'></div>
    </div>
  `;
}
```

#### 步骤 4：客户端 "复活"
1. 浏览器加载页面（看到静态 HTML）
2. `entry-client.tsx` 执行，扫描页面
3. 找到 `data-island="my-counter"` 元素
4. 从注册表找到 `MyCounter` 组件
5. 解析 `data-props`（`{initial: 10}`）
6. 调用 `hydrate(<MyCounter initial={10} />, element)`
7. 组件变为可交互状态

### 3.2 实际工作示例

**服务端渲染的 HTML**：
```html
<div data-island="counter" data-props='{"initial": 5}'>
  <div>
    <p>计数: 5</p>
    <button>增加</button>
  </div>
</div>
```

**客户端处理过程**：
```javascript
// entry-client.tsx 执行流程
1. document.querySelectorAll('[data-island]') → 找到元素
2. getAttribute('data-island') → "counter"
3. islands["counter"] → Counter 组件
4. getAttribute('data-props') → '{"initial": 5}'
5. JSON.parse(...) → {initial: 5}
6. hydrate(<Counter initial={5} />, element)
```

---

## 4. 总结

### 4.1 角色比喻

| 文件/模块 | 角色 | 职责 |
|-----------|------|------|
| `generate-islands.ts` | **HR 部门** | 收集所有员工（组件）信息，创建通讯录 |
| `islands.generated.ts` | **员工通讯录** | 记录员工姓名和联系方式的对应关系 |
| `entry-client.tsx` | **项目经理** | 根据通讯录安排员工到具体岗位工作 |
| `src/islands/` 目录 | **员工办公室** | 所有员工（组件）工作的地方 |

### 4.2 核心优势

| 优势 | 说明 |
|------|------|
| **性能优化** | 只"复活"需要交互的部分，减少 JavaScript 加载量 |
| **SEO 友好** | 服务端渲染完整 HTML，搜索引擎可索引 |
| **开发体验** | 自动化注册，热重载，类型安全 |
| **渐进增强** | 即使 JavaScript 失败，页面仍可访问 |
| **维护简单** | 添加新组件只需创建文件，无需修改注册逻辑 |

### 4.3 关键特性

1. **部分 Hydration**：不是整个页面重新渲染，只针对交互部分
2. **自动注册**：组件自动发现和注册，无需手动配置
3. **类型安全**：TypeScript 全程类型检查
4. **命名约定**：强制统一的命名规范（PascalCase → kebab-case）
5. **错误处理**：组件加载失败时优雅降级

### 4.4 适用场景

✅ **适合使用 Islands 架构的场景**：
- 内容为主的网站（博客、新闻、文档）
- 需要良好 SEO 的营销页面
- 有大量静态内容但有部分交互的页面
- 对性能要求较高的应用

❌ **可能不适合的场景**：
- 高度交互的单页面应用（SPA）
- 需要复杂客户端状态管理的应用
- 实时协作或游戏类应用

---

## 5. 常见问题解答

### Q1：为什么要用 kebab-case 而不是直接使用组件名？
**A**：HTML 属性通常使用 kebab-case（如 `data-island`），而 JavaScript 组件名使用 PascalCase。这种转换保持了各自领域的命名规范。

### Q2：如果我想手动注册组件怎么办？
**A**：不建议手动注册。自动注册确保了一致性和可维护性。如果确实需要特殊处理，可以修改生成脚本的逻辑。

### Q3：组件可以嵌套吗？
**A**：可以，但需要确保父组件和子组件都正确注册。子组件也会被自动扫描和注册。

### Q4：如何调试组件 hydration 问题？
**A**：
1. 检查浏览器控制台的警告和错误
2. 确认 `data-island` 属性值正确
3. 确认 `data-props` 是有效的 JSON
4. 检查 `islands.generated.ts` 是否包含该组件
5. 使用开发者工具检查元素是否正确渲染

### Q5：这个架构可以用于生产环境吗？
**A**：是的，Islands 架构已经被许多生产网站使用，包括 Astro、Fresh 等框架都采用了类似的设计。

---

## 6. 扩展学习

### 6.1 相关概念
- **SSR（服务端渲染）**：在服务器生成 HTML
- **CSR（客户端渲染）**：在浏览器生成 HTML
- **SSG（静态站点生成）**：构建时生成 HTML
- **Islands 架构**：混合 SSR 和 CSR，只对交互部分进行 hydration

### 6.2 类似框架
- **Astro**：流行的 Islands 架构框架
- **Fresh**：Deno 的 Islands 框架
- **Marko**：eBay 的 Islands 框架
- **Qwik**：极致性能的 Islands 框架

### 6.3 下一步学习
1. 阅读 `INIT.md` 了解项目初始化过程
2. 查看 `production.md` 了解项目整体架构
3. 实践添加新的 island 组件
4. 学习如何添加状态管理（Signals/Context）
5. 探索如何集成 API 和数据库

---

*文档最后更新：2026年1月20日*
*适用于 bun-php 项目，基于 Islands 架构的 MPA 实现*