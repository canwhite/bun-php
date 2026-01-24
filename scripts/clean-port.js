#!/usr/bin/env node

/**
 * 清理端口占用脚本
 * 在重启服务器前强制释放指定端口
 */

import { execSync } from 'child_process';

const PORT = 5000;

function cleanupPort(port) {
  console.log(`清理端口 ${port}...`);

  try {
    // 查找使用该端口的进程
    const findCmd = `lsof -ti:${port}`;
    const pids = execSync(findCmd, { encoding: 'utf8' }).trim();

    if (pids) {
      const pidList = pids.split('\n').filter(pid => pid.trim());
      console.log(`找到占用端口 ${port} 的进程: ${pidList.join(', ')}`);

      // 杀死所有相关进程
      for (const pid of pidList) {
        try {
          console.log(`杀死进程 ${pid}...`);
          execSync(`kill -9 ${pid} 2>/dev/null || true`);
        } catch (err) {
          console.warn(`无法杀死进程 ${pid}: ${err.message}`);
        }
      }

      // 等待一小段时间确保进程完全退出
      execSync('sleep 0.5');

      // 再次检查端口是否已释放
      try {
        const checkCmd = `lsof -ti:${port} 2>/dev/null | wc -l`;
        const stillUsed = parseInt(execSync(checkCmd, { encoding: 'utf8' }).trim());
        if (stillUsed > 0) {
          console.warn(`警告: 端口 ${port} 仍被占用`);
          return false;
        }
      } catch (checkErr) {
        // 命令失败说明端口已释放
      }

      console.log(`端口 ${port} 已成功清理`);
      return true;
    } else {
      console.log(`端口 ${port} 未被占用`);
      return true;
    }
  } catch (err) {
    // 如果lsof命令失败，说明端口未被占用
    if (err.message.includes('command failed') || err.status === 1) {
      console.log(`端口 ${port} 未被占用`);
      return true;
    }
    console.error(`清理端口时出错: ${err.message}`);
    return false;
  }
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  const success = cleanupPort(PORT);
  process.exit(success ? 0 : 1);
}

export { cleanupPort };
