import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'emerald' | 'gold' | 'info' | 'error' | 'outline' | 'unboxed';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  ...props
}) => {
  if (variant === 'unboxed') {
    return (
      <span
        className={`inline-flex items-center text-xs text-slate-500 dark:text-slate-400 font-medium ${className}`}
        {...props}
      >
        {children}
      </span>
    );
  }

  const sizeClasses = {
    sm: 'text-[11px] px-1.5 py-0.5 rounded-sm',
    md: 'text-xs px-2 py-0.5 rounded-md font-medium',
  }[size];

  const variantClasses = {
    default:
      'bg-slate-100 text-slate-700 dark:bg-white/[0.08] dark:text-slate-300 border border-slate-200 dark:border-white/10',
    emerald:
      'bg-cyan-50 text-cyan-900 dark:bg-cyan-950/50 dark:text-cyan-200 border border-cyan-200 dark:border-cyan-700/50',
    gold:
      'bg-amber-50 text-amber-900 dark:bg-amber-950/50 dark:text-amber-200 border border-amber-200 dark:border-amber-700/50',
    info:
      'bg-sky-50 text-sky-900 dark:bg-sky-950/50 dark:text-sky-200 border border-sky-200 dark:border-sky-700/50',
    error:
      'bg-red-50 text-red-900 dark:bg-red-950/50 dark:text-red-200 border border-red-200 dark:border-red-700/50',
    outline:
      'bg-transparent text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-white/20',
  }[variant];

  return (
    <span
      className={`inline-flex items-center gap-1 select-none whitespace-nowrap ${sizeClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};
