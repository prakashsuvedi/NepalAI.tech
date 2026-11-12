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
      'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/40',
    gold:
      'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/40',
    info:
      'bg-sky-50 text-sky-800 dark:bg-sky-950/40 dark:text-sky-300 border border-sky-200/80 dark:border-sky-800/40',
    error:
      'bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-300 border border-red-200/80 dark:border-red-800/40',
    outline:
      'bg-transparent text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-white/15',
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
