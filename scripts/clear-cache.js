#!/usr/bin/env node

/**
 * 清除Bun模块缓存脚本
 * 在开发服务器重启前清理模块缓存，确保新代码被正确加载
 */

console.log('🔄 清理模块缓存...');

// Bun的模块缓存清理方法
// 注意：Bun没有公开的API来清除模块缓存，但我们可以尝试多种方法

let totalCleared = 0;

try {
  // 方法1: 清理Node.js模块缓存（如果适用）
  if (typeof require !== 'undefined' && require.cache) {
    const cacheKeys = Object.keys(require.cache);
    let clearedCount = 0;

    // 清理项目相关的模块
    for (const key of cacheKeys) {
      if (key.includes('/bun-php/') && !key.includes('node_modules')) {
        delete require.cache[key];
        clearedCount++;
      }
    }

    console.log(`📦 清理了 ${clearedCount} 个Node.js模块缓存`);
    totalCleared += clearedCount;
  }

  // 方法2: 尝试清理Bun特定的缓存文件
  try {
    const { unlinkSync, existsSync } = await import('fs');
    const { join } = await import('path');

    const bunCacheFiles = [
      join(process.cwd(), '.bun.lockb'),
      join(process.cwd(), 'bun.lockb'),
      join(process.cwd(), 'node_modules/.bun.lockb')
    ];

    let bunFilesCleared = 0;
    for (const file of bunCacheFiles) {
      if (existsSync(file)) {
        try {
          console.log(`尝试清理Bun缓存文件: ${file}`);
          unlinkSync(file);
          bunFilesCleared++;
        } catch (err) {
          console.log(`无法删除 ${file}: ${err.message}`);
        }
      }
    }

    if (bunFilesCleared > 0) {
      console.log(`🧹 清理了 ${bunFilesCleared} 个Bun缓存文件`);
      totalCleared += bunFilesCleared;
    }
  } catch (bunError) {
    // 忽略Bun缓存清理错误
  }

  // 方法3: 使用Bun API（如果可用）
  if (typeof Bun !== 'undefined') {
    console.log('🐰 Bun运行时检测到');
    console.log('提示：Bun的动态导入缓存会自动管理');
    console.log('建议：重启服务器是清理Bun缓存的最可靠方法');
  }

  console.log('💡 建议：开发时使用 --watch 或 --hot 标志以获得最佳热重载体验');
} catch (error) {
  console.warn('清理缓存时警告:', error.message);
}

// 清理生成的临时文件缓存
console.log('清理生成文件缓存...');
try {
  const { unlinkSync, existsSync } = await import('fs');
  const { join } = await import('path');

  const filesToClear = [
    join(process.cwd(), 'src/islands.generated.ts'),
    join(process.cwd(), 'src/routes.generated.ts'),
    join(process.cwd(), 'src/api.generated.ts'),
  ];

  let clearedFiles = 0;
  for (const file of filesToClear) {
    if (existsSync(file)) {
      try {
        unlinkSync(file);
        clearedFiles++;
      } catch (err) {
        // 忽略删除错误，文件可能被占用
      }
    }
  }

  console.log(`清理了 ${clearedFiles} 个生成文件缓存`);
} catch (error) {
  console.warn('清理文件缓存时警告:', error.message);
}

console.log('模块缓存清理完成');
