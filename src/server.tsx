// src/server.ts
import { Hono } from 'hono';
import { render } from 'preact-render-to-string';
import { serveStatic } from 'hono/bun';

// 页面组件（直接导入 default export）
import Home from './pages/index.tsx';
import About from './pages/about.tsx';

const app = new Hono();

// 静态文件 - 精确路径映射
app.get('/entry-client.js', serveStatic({ path: './dist/entry-client.js' }));
app.get('/styles.css', serveStatic({ path: './dist/styles.css' }));

app.get('/', c => {
  return c.html(`<!DOCTYPE html>${render(<Home />)}`);
});

app.get('/about', c => {
  return c.html(`<!DOCTYPE html>${render(<About />)}`);
});

app.notFound(c => c.text('页面不存在', 404));

export default {
  port: 5000,
  fetch: app.fetch,
};
