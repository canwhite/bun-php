// src/app/components/Island.tsx
// Islands架构的包装组件，提供类型安全的挂载方式

import type { JSX } from 'preact';
import type { IslandName } from '../../islands.generated';

interface IslandProps {
  /** Island组件的名称，对应 data-island 属性 */
  name: IslandName;
  /** 传递给Island组件的props，会自动序列化为JSON */
  props?: Record<string, unknown>;
  /** 服务端渲染时的占位符内容（可选） */
  children?: JSX.Element;
  /** 额外的CSS类名 */
  className?: string;
}

/**
 * Island包装组件
 *
 * 在服务端渲染为带 data-island 属性的占位符元素
 * 客户端会自动hydrate对应的交互式组件
 *
 * @example
 * <Island name="counter" props={{ initial: 100 }} />
 * <Island name="forms-button" props={{ label: "提交", variant: "primary" }}>
 *   <div class="animate-pulse">加载中...</div>
 * </Island>
 */
export default function Island({ name, props = {}, children, className = '' }: IslandProps) {
  // 序列化props为JSON字符串
  const propsJson = JSON.stringify(props);

  return (
    <div data-island={name} data-props={propsJson} class={className}>
      {children}
    </div>
  );
}
