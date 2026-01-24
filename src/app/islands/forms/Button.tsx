// src/app/islands/forms/Button.tsx
// 表单按钮组件

interface ButtonProps {
  label: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'danger';
}

export default function Button({
  label,
  onClick,
  type = 'button',
  variant = 'primary',
}: ButtonProps) {
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      class={`px-4 py-2 rounded-lg font-medium transition-colors ${variantClasses[variant]}`}
    >
      {label}
    </button>
  );
}
