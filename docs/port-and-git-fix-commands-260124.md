# 端口改进与 Git 跟踪清理命令总结

**日期**: 2026-01-24
**任务**: 修复硬编码端口问题，清理生成文件 Git 跟踪

## 概述

本文档总结了在 `bun-php` 项目中执行的两个主要任务的所有命令：

1. **端口配置改进**: 消除 `scripts/clean-port.js` 和 `scripts/dev-reload.js` 中的硬编码端口依赖
2. **Git 跟踪清理**: 解决 `src/islands.generated.ts` 和 `src/routes.generated.ts` 在 nodemon ignore 列表中但仍被监听的问题

## 任务 1: 端口配置改进

### 1.1 分析现有配置

```bash
# 检查硬编码端口的位置
grep -n "5000" scripts/clean-port.js scripts/dev-reload.js src/server.tsx
```

**发现**:
- `scripts/clean-port.js:10`: `const PORT = 5000;`
- `scripts/dev-reload.js:15`: `window.location.port === '5000'`
- `src/server.tsx:78`: `port: 5000`
- `scripts/smart-restart.js:16`: `port: 5000`

### 1.2 创建共享配置模块

创建 `scripts/shared-config.js`:

```javascript
#!/usr/bin/env node

/**
 * 共享配置模块
 * 提供项目中统一的配置获取函数
 */

/**
 * 获取端口配置
 * 支持环境变量 PORT，默认 5000
 */
export function getPort() {
  if (process.env.PORT) {
    const port = parseInt(process.env.PORT);
    if (!isNaN(port) && port > 0 && port < 65536) {
      return port;
    }
  }
  return 5000;
}

// 其他配置函数...
```

### 1.3 修改相关文件

#### 修改 `src/server.tsx`:
```bash
# 读取原文件
cat src/server.tsx | grep -A5 -B5 "port: 5000"

# 修改为使用共享配置
# 原代码: function getPort() { ... }
# 改为: import { getPort } from '../scripts/shared-config.js';
```

#### 修改 `scripts/clean-port.js`:
```bash
# 读取原文件
cat scripts/clean-port.js | head -20

# 修改为使用共享配置
# 原代码: function getPort() { ... }
# 改为: import { getPort } from './shared-config.js';
```

#### 修改 `scripts/dev-reload.js`:
```bash
# 移除硬编码端口检查
# 原代码第15行: window.location.port === '5000',
# 改为: // 移除硬编码端口检查，允许在任何本地端口启用
```

#### 修改 `scripts/smart-restart.js`:
```bash
# 读取配置部分
cat scripts/smart-restart.js | grep -A3 -B3 "port: 5000"

# 修改为使用共享配置
# 添加: import { getPort } from './shared-config.js';
# 修改: port: getPort(),
```

### 1.4 测试配置改进

```bash
# 测试默认端口 (5000)
bun scripts/clean-port.js

# 测试环境变量 PORT=3000
PORT=3000 bun scripts/clean-port.js

# 测试共享配置模块
bun -e "import { getPort } from './scripts/shared-config.js'; console.log('默认端口:', getPort())"

PORT=3000 bun -e "import { getPort } from './scripts/shared-config.js'; console.log('PORT=3000时:', getPort())"

# 测试 smart-restart.js 导入
bun -e "import { getPort } from './scripts/shared-config.js'; import { smartRestart } from './scripts/smart-restart.js'; console.log('导入成功')"
```

## 任务 2: Git 跟踪清理

### 2.1 检查当前状态

```bash
# 检查 nodemon 配置
cat nodemon.json

# 检查 .gitignore 配置
cat .gitignore | grep -A5 -B5 "generated"

# 检查 git 状态
git status

# 查看哪些生成文件被 git 跟踪
git ls-files src/*.generated.ts

# 检查文件是否存在
ls -la src/*.generated.ts
```

**发现**:
- `nodemon.json`: 正确配置了 `"src/**/*.generated.ts"`
- `.gitignore`: 包含 `src/islands.generated.ts`, `src/routes.generated.ts`, `src/api.generated.ts`
- `git status`: `src/api.generated.ts` 和 `src/routes.generated.ts` 被跟踪并已修改
- `git ls-files`: 显示 `src/api.generated.ts` 和 `src/routes.generated.ts` 被跟踪
- `src/islands.generated.ts` 未被 git 跟踪

### 2.2 执行 Git 清理

```bash
# 1. 取消暂存（如果需要）
git restore --staged src/api.generated.ts src/routes.generated.ts

# 2. 从 git 跟踪中移除（保留本地文件）
git rm --cached src/api.generated.ts src/routes.generated.ts

# 注意：src/islands.generated.ts 未被跟踪，无需操作
```

### 2.3 验证修复

```bash
# 检查 git 状态
git status

# 验证 nodemon 配置
npx nodemon --dump-config 2>&1 | head -10
```

**预期输出**:
```
ignoring: src/**/*.generated.ts src/**/*.test.ts src/**/*.test.tsx ./dist/**/* ./node_modules/**/*
```

## 完整命令执行流程

### 端口改进任务完整流程

```bash
# 1. 分析现有硬编码
grep -n "5000" scripts/clean-port.js scripts/dev-reload.js src/server.tsx scripts/smart-restart.js

# 2. 创建共享配置模块
# 创建 scripts/shared-config.js (内容见上文)

# 3. 修改 server.tsx
# 编辑 src/server.tsx: 替换本地 getPort() 为导入共享配置

# 4. 修改 clean-port.js
# 编辑 scripts/clean-port.js: 替换本地 getPort() 为导入共享配置

# 5. 修改 dev-reload.js
# 编辑 scripts/dev-reload.js: 移除硬编码端口检查

# 6. 修改 smart-restart.js
# 编辑 scripts/smart-restart.js: 添加导入并使用 getPort()

# 7. 测试
bun scripts/clean-port.js
PORT=3000 bun scripts/clean-port.js
PORT=8080 bun -e "import { getPort } from './scripts/shared-config.js'; console.log(getPort())"
```

### Git 跟踪清理完整流程

```bash
# 1. 检查配置
cat nodemon.json
cat .gitignore | grep "generated"

# 2. 检查 git 状态
git status
git ls-files src/*.generated.ts

# 3. 清理 git 跟踪
git restore --staged src/api.generated.ts src/routes.generated.ts  # 可选，如果文件已暂存
git rm --cached src/api.generated.ts src/routes.generated.ts

# 4. 验证
git status
npx nodemon --dump-config 2>&1 | grep "ignoring:"
```

## 关键发现与解决方案

### 1. 端口硬编码问题

**问题**: 多个文件硬编码端口 `5000`，缺乏灵活性。

**解决方案**:
- 创建 `scripts/shared-config.js` 统一配置管理
- 支持环境变量 `PORT` 覆盖默认值
- 所有相关文件导入共享配置
- `dev-reload.js` 移除端口检查，支持任何本地端口

**命令总结**:
```bash
# 创建共享配置
echo '创建 scripts/shared-config.js'

# 修改文件
sed -i '' 's/const PORT = 5000;/import { getPort } from "\\.\\/shared-config\\.js";\\nconst PORT = getPort();/g' scripts/clean-port.js
# 类似编辑其他文件...
```

### 2. Git 跟踪问题

**问题**: 生成文件在 `.gitignore` 中，但之前已被提交到 git，导致仍被跟踪。

**解决方案**:
- `git rm --cached` 从 git 跟踪中移除，保留本地文件
- 文件完全由 `.gitignore` 管理
- nodemon ignore 规则生效

**命令总结**:
```bash
# 检查
git ls-files src/*.generated.ts

# 清理
git rm --cached src/api.generated.ts src/routes.generated.ts

# 验证
git status
npx nodemon --dump-config
```

## 后续步骤

### 1. 提交 Git 更改
```bash
git commit -m "chore: remove generated files from git tracking

- Remove src/api.generated.ts and src/routes.generated.ts from git tracking
- Files remain locally, managed by .gitignore
- Fixes nodemon unnecessary restarts"
```

### 2. 更新项目文档
- 在 `production.md` 中添加端口配置说明
- 确保团队成员了解新的端口配置方式

### 3. 测试完整开发流程
```bash
# 使用默认端口
bun run dev

# 使用自定义端口
PORT=3000 bun run dev

# 验证热重载
# 修改文件，确认 nodemon 正确重启，生成文件不被监听
```

## 注意事项

1. **共享配置模块**: 仅适用于 Node.js/Bun 环境脚本，浏览器端代码需单独处理
2. **Git 忽略规则**: `.gitignore` 只对新文件生效，已有文件需使用 `git rm --cached`
3. **nodemon 配置**: `"src/**/*.generated.ts"` 使用 glob 模式匹配所有生成文件
4. **向后兼容性**: 未设置 `PORT` 环境变量时，默认使用 `5000` 端口

## 相关文件

- `scripts/shared-config.js` - 共享配置模块
- `nodemon.json` - 开发服务器配置
- `.gitignore` - Git 忽略配置
- `src/server.tsx` - 服务器入口
- `scripts/clean-port.js` - 端口清理脚本
- `scripts/dev-reload.js` - 开发自动刷新
- `scripts/smart-restart.js` - 智能重启脚本

---

*文档生成时间: 2026-01-24*
*生成方式: Claude Code 任务执行记录*