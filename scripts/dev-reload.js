/**
 * 开发环境自动刷新脚本
 * 在浏览器中运行，定期检查服务器状态，实现自动刷新
 */

class DevReload {
  constructor(options = {}) {
    this.options = {
      checkInterval: 1500, // 检查间隔（毫秒）
      serverUrl: window.location.origin, // 服务器地址
      enabled:
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.hostname.includes('.local'),
      // 移除硬编码端口检查，允许在任何本地端口启用
      ...options,
    };

    this.lastCheck = Date.now();
    this.isChecking = false;
    this.retryCount = 0;
    this.maxRetries = 3;
    this.serverWasDown = false;
    this.lastCssCheck = null;
    this.lastCssId = null;

    // 开发模式才启用
    if (this.options.enabled) {
      this.init();
    }
  }

  init() {
    console.log('🚀 开发自动刷新已启用');
    console.log(`📡 检查间隔: ${this.options.checkInterval}ms`);
    console.log(`🌐 服务器地址: ${this.options.serverUrl}`);
    console.log(
      `✅ 启用状态: ${this.options.enabled} (hostname: ${window.location.hostname}, port: ${window.location.port})`
    );

    // 开始定时检查
    this.startChecking();

    // 添加手动刷新按钮（可选）
    this.addManualRefreshButton();
  }

  startChecking() {
    this.checkInterval = setInterval(() => {
      this.checkServerStatus();
    }, this.options.checkInterval);
  }

  async checkServerStatus() {
    if (this.isChecking) return;

    this.isChecking = true;

    try {
      // 尝试获取服务器状态
      const response = await fetch(`${this.options.serverUrl}/health`, {
        method: 'HEAD',
        cache: 'no-cache',
      });

      // 服务器响应正常
      if (response.ok) {
        // 如果之前服务器宕机，现在恢复了，刷新页面
        if (this.serverWasDown) {
          console.log('✅ 服务器已恢复，刷新页面...');
          this.serverWasDown = false;
          window.location.reload();
          return;
        }

        // 检查CSS文件是否更新（用于CSS热重载）
        await this.checkCssUpdate();

        this.retryCount = 0;
        this.lastCheck = Date.now();
      }
    } catch (error) {
      // 服务器可能正在重启
      this.retryCount++;
      this.serverWasDown = true;

      console.log(`🔄 服务器连接失败 (${this.retryCount}/${this.maxRetries}):`, error.message);

      // 达到重试次数限制，等待服务器重启
      if (this.retryCount >= this.maxRetries) {
        console.log('⏳ 等待服务器重启...');

        // 延迟后重试
        setTimeout(() => {
          this.retryCount = 0;
          this.isChecking = false;
        }, 3000);

        return;
      }
    } finally {
      this.isChecking = false;
    }
  }

  // 检查CSS文件是否更新
  async checkCssUpdate() {
    // 只在有上次检查时间时才进行检查
    if (!this.lastCssCheck) {
      this.lastCssCheck = Date.now();
      return;
    }

    // 每5秒检查一次CSS，避免频繁请求
    const now = Date.now();
    if (now - this.lastCssCheck < 5000) {
      return;
    }

    try {
      const response = await fetch(`${this.options.serverUrl}/styles.css`, {
        method: 'HEAD',
        cache: 'no-cache',
      });

      if (response.ok) {
        const lastModified = response.headers.get('last-modified');
        const contentLength = response.headers.get('content-length');

        // 创建当前CSS的标识
        const cssId = `${lastModified || ''}-${contentLength || ''}`;

        // 如果CSS标识变化了，刷新页面
        if (this.lastCssId && this.lastCssId !== cssId) {
          console.log('🎨 CSS文件已更新，刷新页面...');
          window.location.reload();
          return;
        }

        // 更新CSS标识
        this.lastCssId = cssId;
        this.lastCssCheck = now;
      }
    } catch (error) {
      // 忽略CSS检查错误
      console.log('⚠️ CSS检查失败:', error.message);
    }
  }

  addManualRefreshButton() {
    // 创建刷新按钮
    const button = document.createElement('button');
    button.innerHTML = '🔄';
    button.title = '手动刷新页面';
    button.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: #4F46E5;
      color: white;
      border: none;
      font-size: 24px;
      cursor: pointer;
      z-index: 9999;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      transition: all 0.2s;
    `;

    button.addEventListener('mouseenter', () => {
      button.style.transform = 'scale(1.1)';
      button.style.background = '#4338CA';
    });

    button.addEventListener('mouseleave', () => {
      button.style.transform = 'scale(1)';
      button.style.background = '#4F46E5';
    });

    button.addEventListener('click', () => {
      button.innerHTML = '⏳';
      button.disabled = true;
      setTimeout(() => {
        window.location.reload();
      }, 300);
    });

    document.body.appendChild(button);
  }

  destroy() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
    console.log('🔴 开发自动刷新已禁用');
  }
}

// 自动初始化
if (typeof window !== 'undefined') {
  window.devReload = new DevReload();

  // 开发工具辅助函数
  window.__DEV_TOOLS__ = {
    forceReload: () => window.location.reload(),
    disableAutoReload: () => window.devReload?.destroy(),
    enableAutoReload: () => window.devReload?.init(),
  };
}
