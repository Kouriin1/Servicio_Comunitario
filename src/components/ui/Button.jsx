import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export default function Button({ className, children, variant = 'primary', ...props }) {
  const variants = {
    primary: 'bg-gradient-to-r from-amber-400 to-amber-500 text-white hover:from-amber-500 hover:to-amber-600 shadow-md shadow-amber-400/20',
    secondary: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-md shadow-blue-500/20',
    outline: 'border-2 border-amber-400 text-amber-500 hover:bg-amber-400 hover:text-white',
    ghost: 'text-blue-500 dark:text-blue-400 hover:bg-slate-100/80 dark:hover:bg-slate-700/50',
  };

  return (
    <button
      className={twMerge(
        'px-6 py-3 rounded-2xl font-bold transition-all duration-300 active:scale-95 disabled:opacity-50',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
