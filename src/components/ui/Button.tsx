import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gold' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    // Touch targets: min 40px on desktop, min 44px on mobile via responsive sizing
    const sizeClasses = {
      sm: 'text-xs px-3 py-1.5 min-h-[36px] gap-1.5 rounded-md font-medium',
      md: 'text-sm px-4 py-2 min-h-[42px] gap-2 rounded-lg font-semibold',
      lg: 'text-base px-5 py-2.5 min-h-[48px] gap-2.5 rounded-lg font-semibold',
    }[size];

    const variantClasses = {
      primary:
        'bg-cyan-600 hover:bg-cyan-500 text-white shadow-xs focus-visible:ring-2 focus-visible:ring-cyan-500/40 active:translate-y-[1px]',
      secondary:
        'bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-white/[0.08] dark:hover:bg-white/[0.14] dark:text-slate-200 focus-visible:ring-2 focus-visible:ring-slate-400/40',
      outline:
        'border border-slate-300 hover:bg-slate-50 text-slate-800 dark:border-white/15 dark:hover:bg-white/[0.06] dark:text-slate-200 focus-visible:ring-2 focus-visible:ring-cyan-500/40',
      ghost:
        'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-white/[0.06] focus-visible:ring-2 focus-visible:ring-slate-400/40',
      gold:
        'bg-amber-600 hover:bg-amber-700 text-white shadow-xs focus-visible:ring-2 focus-visible:ring-amber-500/40 active:translate-y-[1px]',
      destructive:
        'bg-red-600 hover:bg-red-700 text-white shadow-xs focus-visible:ring-2 focus-visible:ring-red-500/40 active:translate-y-[1px]',
    }[variant];

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`inline-flex items-center justify-center transition-all duration-200 select-none cursor-pointer focus:outline-hidden disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none ${sizeClasses} ${variantClasses} ${
          fullWidth ? 'w-full' : ''
        } ${className}`}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin text-current shrink-0" aria-hidden="true" />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
