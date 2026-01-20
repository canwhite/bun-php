// src/islands/Counter.tsx
// 示例岛组件 - 计数器

import { useState } from "preact/hooks";

interface CounterProps {
  initial?: number;
}

export default function Counter({ initial = 0 }: CounterProps) {
  const [count, setCount] = useState(initial);

  return (
    <div class="border border-gray-300 rounded-lg p-6 bg-white shadow-sm">
      <div class="text-center">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">计数器组件</h3>
        <div class="text-4xl font-bold text-blue-600 mb-6">{count}</div>
        <div class="flex gap-3 justify-center">
          <button
            onClick={() => setCount(count - 1)}
            class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors"
          >
            -1
          </button>
          <button
            onClick={() => setCount(initial)}
            class="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg transition-colors"
          >
            重置
          </button>
          <button
            onClick={() => setCount(count + 1)}
            class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors"
          >
            +1
          </button>
        </div>
        <p class="text-sm text-gray-500 mt-4">
          这是一个交互式岛组件，在客户端hydrate
        </p>
      </div>
    </div>
  );
}