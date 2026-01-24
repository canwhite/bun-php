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

      // 分级终止：先尝试正常终止，再强制终止
      for (const pid of pidList) {
        try {
          console.log(`尝试正常终止进程 ${pid}...`);
          // 先发送SIGTERM（正常终止）
          execSync(`kill -15 ${pid} 2>/dev/null || true`);

          // 等待500ms让进程正常退出
          execSync('sleep 0.5');

          // 检查进程是否还存在
          try {
            const checkCmd = `ps -p ${pid} > /dev/null 2>&1 && echo "running" || echo "stopped"`;
            const status = execSync(checkCmd, { encoding: 'utf8' }).trim();

            if (status === 'running') {
              console.log(`进程 ${pid} 仍在运行，发送强制终止信号...`);
              // 发送SIGKILL（强制终止）
              execSync(`kill -9 ${pid} 2>/dev/null || true`);
              console.log(`进程 ${pid} 已强制终止`);
            } else {
              console.log(`进程 ${pid} 已正常终止`);
            }
          } catch (checkErr) {
            // 检查失败，假定进程已终止
            console.log(`进程 ${pid} 检查失败，假定已终止`);
          }
        } catch (err) {
          console.warn(`终止进程 ${pid} 时出错: ${err.message}`);
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
