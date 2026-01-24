// src/app/islands/ui/Button.tsx
// UI按钮组件

import type { JSX } from 'preact';

interface ButtonProps {
  children: JSX.Element | string;
  icon?: string;
  size?: 'sm' | 'md' | 'lg';
  rounded?: boolean;
}

export default function Button({ children, icon, size = 'md', rounded = false }: ButtonProps) {
  const sizeClasses = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      class={`inline-flex items-center gap-2 font-semibold ${
        sizeClasses[size]
      } bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90 transition-opacity ${
        rounded ? 'rounded-full' : 'rounded-lg'
      }`}
    >
      {icon && <span class="text-xl">{icon}</span>}
      {children}
    </button>
  );
}
