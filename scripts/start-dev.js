#!/usr/bin/env node

/**
 * 开发服务器启动脚本
 * 包含端口清理和启动逻辑
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = resolve(__dirname, '..');

async function runCommand(cmd, args, options = {}) {
  return new Promise((resolve, reject) => {
    console.log(`执行: ${cmd} ${args.join(' ')}`);
    const child = spawn(cmd, args, {
      stdio: 'inherit',
      shell: true,
      cwd: PROJECT_ROOT,
      ...options,
    });

    child.on('close', code => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`命令执行失败，退出码: ${code}`));
      }
    });

    child.on('error', err => {
      reject(err);
    });
  });
}

async function cleanPort(port = 5000) {
  console.log('清理端口占用...');
  try {
    const { execSync } = await import('child_process');

    try {
      const pids = execSync(`lsof -ti:${port}`, { encoding: 'utf8' }).trim();
      if (pids) {
        console.log(`找到占用端口 ${port} 的进程: ${pids}`);
        // 优雅关闭
        execSync(`kill ${pids} 2>/dev/null || true`);
        // 等待关闭
        await new Promise(resolve => setTimeout(resolve, 500));
        // 强制关闭残留进程
        execSync(`kill -9 ${pids} 2>/dev/null || true`);
        console.log(`端口 ${port} 已清理`);
      } else {
        console.log(`端口 ${port} 未被占用`);
      }
    } catch (err) {
      // lsof命令返回非零表示端口未被占用
      console.log(`端口 ${port} 未被占用`);
    }
  } catch (err) {
    console.warn(`清理端口时警告: ${err.message}`);
  }
}

async function main() {
  try {
    // 1. 清理端口
    await cleanPort(5000);

    // 2. 生成岛组件
    console.log('\n=== 生成岛组件 ===');
    await runCommand('bun', ['run', 'generate:islands']);

    // 3. 生成路由
    console.log('\n=== 生成路由 ===');
    await runCommand('bun', ['run', 'generate:routes']);

    // 4. 生成API路由
    console.log('\n=== 生成API路由 ===');
    await runCommand('bun', ['run', 'generate:api-routes']);

    // 5. 构建CSS
    console.log('\n=== 构建CSS ===');
    await runCommand('bun', ['run', 'build:css']);

    // 6. 启动服务器
    console.log('\n=== 启动服务器 ===');
    const server = spawn('bun', ['src/server.tsx'], {
      stdio: 'inherit',
      shell: true,
      cwd: PROJECT_ROOT,
      env: {
        ...process.env,
        NODE_ENV: 'development',
      },
    });

    // 处理退出信号
    const gracefulShutdown = () => {
      console.log('收到关闭信号，正在关闭服务器...');
      server.kill('SIGTERM');
      process.exit(0);
    };

    process.on('SIGINT', gracefulShutdown);
    process.on('SIGTERM', gracefulShutdown);

    server.on('close', code => {
      console.log(`服务器已关闭，退出码: ${code}`);
      process.exit(code || 0);
    });
  } catch (error) {
    console.error('启动失败:', error);
    process.exit(1);
  }
}

// 执行主函数
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(err => {
    console.error('未处理的错误:', err);
    process.exit(1);
  });
}
