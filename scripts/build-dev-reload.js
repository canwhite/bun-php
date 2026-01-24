#!/usr/bin/env node

/**
 * 构建开发环境自动刷新脚本
 */

import { readFile, writeFile, mkdir } from 'fs/promises';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = resolve(__dirname, '..');

async function buildDevReload() {
  try {
    console.log('Building dev-reload.js...');

    // 读取源文件
    const sourcePath = resolve(PROJECT_ROOT, 'scripts/dev-reload.js');
    const sourceCode = await readFile(sourcePath, 'utf-8');

    // 确保dist目录存在
    const distDir = resolve(PROJECT_ROOT, 'dist');
    try {
      await mkdir(distDir, { recursive: true });
    } catch (err) {
      // 目录可能已存在
    }

    // 写入dist目录
    const outputPath = resolve(distDir, 'dev-reload.js');
    await writeFile(outputPath, sourceCode, 'utf-8');

    console.log(`dev-reload.js built to ${outputPath}`);
    console.log(`File size: ${sourceCode.length} bytes`);
  } catch (error) {
    console.error('Error building dev-reload.js:', error);
    process.exit(1);
  }
}

// 执行构建
if (import.meta.url === `file://${process.argv[1]}`) {
  buildDevReload().catch(err => {
    console.error('Unhandled error:', err);
    process.exit(1);
  });
}
