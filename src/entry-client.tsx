// src/entry-client.ts
// 客户端 hydration 统一入口
import { hydrate } from 'preact';
import { islands } from './islands.generated';

function initHydration() {
  document.querySelectorAll('[data-island]').forEach(el => {
    const islandName = el.getAttribute('data-island');
    if (!islandName || !(islandName in islands)) {
      console.warn(`未找到 island 组件：${islandName}`);
      return;
    }

    try {
      const propsRaw = el.getAttribute('data-props') || '{}';
      const props = JSON.parse(propsRaw);
      const Component = islands[islandName as keyof typeof islands];

      // 使用 hydrate 接管已渲染的 DOM（推荐用于 MPA）
      hydrate(<Component {...props} />, el);
    } catch (err) {
      console.error(`Island ${islandName} hydration 失败:`, err);
    }
  });
}

// 更安全的时机（避免 FOUC）
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initHydration);
} else {
  initHydration();
}
