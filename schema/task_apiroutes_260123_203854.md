# Task: 设计并实现类似Next.js的API路由系统

**任务ID**: task_apiroutes_260123_203854
**创建时间**: 2026-01-23
**状态**: 进行中
**目标**: 在当前文件路由系统基础上，添加类似Next.js的API路由功能

## 最终目标

1. 设计类似Next.js的API路由架构
2. 实现API路由文件扫描和自动注册
3. 支持RESTful API和HTTP方法（GET、POST、PUT、DELETE等）
4. 保持与现有文件路由系统的一致性
5. 提供类型安全的API处理

## 拆解步骤

### 1. 分析当前架构

- [ ] 理解现有文件路由系统工作原理
- [ ] 查看 `scripts/generate-routes.ts` 和 `src/lib/router/` 目录
- [ ] 分析Hono路由注册机制
- [ ] 确定API路由与页面路由的差异

### 2. 设计API路由方案

- [ ] 确定API路由目录结构（如 `src/app/api/`）
- [ ] 设计API文件命名约定和路由映射规则
- [ ] 定义API处理函数接口
- [ ] 设计动态参数支持（如 `[id].ts`）
- [ ] 考虑中间件支持

### 3. 实现API路由生成器

- [ ] 创建API路由扫描脚本
- [ ] 实现API路由配置文件生成
- [ ] 集成到现有路由注册系统
- [ ] 添加TypeScript类型定义

### 4. 集成到主应用

- [ ] 修改 `src/server.tsx` 注册API路由
- [ ] 确保API路由与页面路由不冲突
- [ ] 添加开发时热重载支持

### 5. 测试和验证

- [ ] 创建示例API端点
- [ ] 测试各种HTTP方法
- [ ] 验证动态参数工作
- [ ] 确保类型安全

## 当前进度

### 已完成: API路由系统已实现

**完整实现清单**:

1. ✅ **类型定义**: 在 `src/lib/router/types.ts` 中添加完整的API路由类型系统
   - `ApiHandler`, `ApiRouteConfig`, `ApiRouterConfig`, `GeneratedApiRoutes`
   - `defaultApiConfig`: 默认配置常量

2. ✅ **配置文件**: 创建 `src/api.config.ts` 配置文件
   - 基于 `defaultApiConfig`，可自定义覆盖
   - 支持配置根目录、排除目录、API文件名等

3. ✅ **生成器脚本**: 实现 `scripts/generate-api-routes.ts`
   - 扫描 `src/app/api` 目录下的 `route.ts` 文件
   - 提取导出的HTTP方法（GET、POST、PUT等）
   - 生成类型安全的 `src/api.generated.ts` 文件
   - 支持动态参数识别（需修复bug）

4. ✅ **注册器模块**: 创建 `src/lib/api/index.ts`
   - `registerApiRoutes()`: 注册API路由到Hono应用
   - 动态导入API模块，为每个HTTP方法注册路由
   - 支持开发时热重载

5. ✅ **集成到主应用**:
   - 更新 `package.json` 脚本：添加 `generate:api-routes`
   - 修改 `dev`、`build`、`start` 脚本包含API路由生成
   - 更新 `src/server.tsx` 注册API路由

6. ✅ **示例API路由**: 创建三个示例端点
   - `GET /api/hello` - 简单问候API
   - `GET/POST /api/users` - 用户列表API
   - `GET/PUT/DELETE /api/users/[id]` - 用户详情API（动态路由）

**已知问题**:

1. **动态参数转换**: 当前 `[id]` 未正确转换为 `:id`，`isDynamic` 标志为 `false`
   - 需要修复 `parseDynamicSegment` 逻辑
   - 不影响静态API路由工作

2. **处理器提取**: 使用简单正则匹配导出方法，可能不够健壮
   - 可升级为TypeScript编译器API

**测试验证**:

- ✅ 生成器成功运行，生成3个API路由配置
- ✅ 生成的 `src/api.generated.ts` 类型检查通过
- ✅ 项目构建脚本集成完成

## 下一步行动

1. 深入分析 `scripts/generate-routes.ts` 和 `src/lib/router/` 实现
2. 理解Hono路由注册机制
3. 设计API路由与页面路由的集成方案
