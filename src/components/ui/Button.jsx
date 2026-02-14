import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export default function Button({ className, children, variant = 'primary', ...props }) {
  const variants = {
    primary: 'bg-usm-yellow text-usm-blue hover:bg-yellow-500',
    secondary: 'bg-usm-blue text-white hover:bg-blue-900',
    outline: 'border-2 border-usm-yellow text-usm-yellow hover:bg-usm-yellow hover:text-usm-blue',
    ghost: 'text-usm-blue dark:text-blue-300 hover:bg-gray-100 dark:hover:bg-slate-700',
  };

  return (
    <button
      className={twMerge(
        'px-6 py-3 rounded-lg font-bold transition-all duration-300 active:scale-95 disabled:opacity-50',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
