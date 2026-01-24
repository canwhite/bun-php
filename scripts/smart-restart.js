#!/usr/bin/env node

/**
 * 智能重启脚本
 * 根据更改的文件类型执行不同的重启策略
 *
 * 使用方式:
 * 1. Nodemon配置: "exec": "bun scripts/smart-restart.js $FILENAME"
 * 2. 或者通过环境变量传递文件列表
 */

import { execSync } from 'child_process';

// 配置
const CONFIG = {
  port: 5000,
  checkInterval: 2000,
  maxRetries: 3
};

// 文件类型分类
const FILE_TYPES = {
  CSS: ['.css'],
  TSX: ['.tsx'],
  CONFIG: ['.json', '.js', '.ts', '.config.js', '.config.ts'],
  SCRIPT: ['.js', '.ts'],
  OTHER: [] // 其他文件类型
};

// 分类函数
function classifyFiles(filePaths) {
  const result = {
    hasCSS: false,
    hasTSX: false,
    hasConfig: false,
    hasScript: false,
    hasOther: false,
    files: filePaths
  };

  for (const filePath of filePaths) {
    const ext = filePath.toLowerCase().substring(filePath.lastIndexOf('.'));

    if (FILE_TYPES.CSS.includes(ext)) {
      result.hasCSS = true;
    } else if (FILE_TYPES.TSX.includes(ext)) {
      result.hasTSX = true;
    } else if (FILE_TYPES.CONFIG.includes(ext)) {
      result.hasConfig = true;
    } else if (FILE_TYPES.SCRIPT.includes(ext)) {
      result.hasScript = true;
    } else {
      result.hasOther = true;
    }
  }

  return result;
}

// 执行命令并记录
function runCommand(cmd, description) {
  console.log(`🚀 ${description}...`);
  try {
    execSync(cmd, { stdio: 'inherit' });
    console.log(`✅ ${description} 完成`);
    return true;
  } catch (error) {
    console.error(`❌ ${description} 失败:`, error.message);
    return false;
  }
}

// 智能重启决策
async function smartRestart(filePaths) {
  console.log('🔄 智能重启启动');
  console.log(`📁 更改的文件: ${filePaths.join(', ')}`);

  const classification = classifyFiles(filePaths);

  // 决策逻辑
  let needsFullRestart = false;
  let actions = [];

  // 规则1: 纯CSS文件更改 → 只构建CSS (dev-reload.js会检测CSS更新)
  if (classification.hasCSS && !classification.hasTSX && !classification.hasConfig && !classification.hasScript) {
    console.log('🎨 检测到纯CSS文件更改，执行CSS构建');
    console.log('💡 提示: dev-reload.js将自动检测CSS更新并刷新页面');
    actions.push(['bun run build:css', '构建CSS']);
  }

  // 规则2: TSX文件更改 → 需要生成和重启
  else if (classification.hasTSX) {
    console.log('⚛️ 检测到TSX文件更改，执行完整重启');
    needsFullRestart = true;
  }

  // 规则3: 配置文件更改 → 完整重启
  else if (classification.hasConfig) {
    console.log('⚙️ 检测到配置文件更改，执行完整重启');
    needsFullRestart = true;
  }

  // 规则4: 脚本文件更改 → 根据位置决定
  else if (classification.hasScript) {
    // 检查是否是scripts/目录下的脚本
    const isScriptFile = filePaths.some(path => path.includes('scripts/'));
    if (isScriptFile) {
      console.log('📜 检测到脚本文件更改，执行完整重启');
      needsFullRestart = true;
    } else {
      console.log('📜 检测到非脚本目录的JS/TS文件，执行完整重启');
      needsFullRestart = true;
    }
  }

  // 规则5: CSS混合其他类型文件 → 完整重启
  else if (classification.hasCSS) {
    console.log('🎨📄 检测到CSS混合其他文件类型更改，执行完整重启');
    needsFullRestart = true;
  }

  // 规则6: 其他文件 → 完整重启
  else {
    console.log('📄 检测到其他类型文件更改，执行完整重启');
    needsFullRestart = true;
  }

  // 执行动作
  if (needsFullRestart) {
    console.log('🔧 执行完整重启流程');

    // 完整重启步骤
    const steps = [
      ['bun scripts/clean-port.js', '清理端口'],
      ['bun scripts/clear-cache.js', '清理缓存'],
      ['bun run generate:islands', '生成岛组件'],
      ['bun run generate:routes', '生成路由'],
      ['bun run generate:api-routes', '生成API路由'],
      ['bun run build:css', '构建CSS'],
      ['bun run build:dev-reload', '构建自动刷新脚本'],
      ['bun src/server.tsx', '启动服务器']
    ];

    for (const [cmd, desc] of steps) {
      if (!runCommand(cmd, desc)) {
        console.error('❌ 重启流程失败');
        process.exit(1);
      }
    }
  } else {
    // 只执行CSS构建
    console.log('🎯 执行最小化更新');
    for (const [cmd, desc] of actions) {
      if (!runCommand(cmd, desc)) {
        console.error('❌ 更新流程失败');
        process.exit(1);
      }
    }
    console.log('✅ 最小化更新完成，服务器无需重启');
  }
}

// 主函数
async function main() {
  try {
    // 获取文件参数 - Nodemon可能传递$FILENAME环境变量或命令行参数
    const args = process.argv.slice(2);
    let filePaths = args.filter(arg => !arg.startsWith('--'));

    // 如果参数为空，检查环境变量
    if (filePaths.length === 0 && process.env.FILENAME) {
      filePaths = [process.env.FILENAME];
    }

    // 如果仍然为空，可能是Nodemon重启（非文件更改）
    if (filePaths.length === 0) {
      console.log('📝 未检测到文件更改，执行完整重启');
      // 执行完整重启流程
      await smartRestart(['full-restart']);
    } else {
      console.log(`📁 检测到文件更改: ${filePaths.join(', ')}`);
      await smartRestart(filePaths);
    }
  } catch (error) {
    console.error('💥 智能重启脚本错误:', error);
    process.exit(1);
  }
}

// 执行
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(err => {
    console.error('未处理的错误:', err);
    process.exit(1);
  });
}

export { smartRestart, classifyFiles };