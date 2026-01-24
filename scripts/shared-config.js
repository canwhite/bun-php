#!/usr/bin/env node

/**
 * 共享配置模块
 * 提供项目中统一的配置获取函数
 */

/**
 * 获取端口配置
 * 支持环境变量 PORT，默认 5000
 *
 * @returns {number} 端口号
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

/**
 * 获取服务器URL（用于开发环境）
 *
 * @param {number} [port] - 端口号，如果不提供则使用getPort()获取
 * @returns {string} 服务器URL
 */
export function getServerUrl(port) {
  const actualPort = port || getPort();
  return `http://localhost:${actualPort}`;
}

/**
 * 检查是否为开发环境
 *
 * @returns {boolean} 是否为开发环境
 */
export function isDevelopment() {
  return process.env.NODE_ENV === 'development';
}

// 导出默认配置
export default {
  port: getPort(),
  serverUrl: getServerUrl(),
  isDevelopment: isDevelopment(),
};