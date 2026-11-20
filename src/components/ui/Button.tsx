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
        'bg-gradient-to-r from-cyan-600 via-sky-600 to-blue-600 hover:from-cyan-500 hover:via-sky-500 hover:to-blue-500 text-white font-semibold shadow-md shadow-cyan-500/20 hover:shadow-lg hover:shadow-cyan-500/30 focus-visible:ring-2 focus-visible:ring-cyan-400',
      secondary:
        'bg-slate-100 hover:bg-slate-200 text-slate-950 dark:bg-white/[0.10] dark:hover:bg-white/[0.18] dark:text-white font-semibold border border-slate-300 dark:border-white/20 focus-visible:ring-2 focus-visible:ring-cyan-400/50',
      outline:
        'border border-slate-300 hover:border-cyan-600 hover:bg-cyan-50 text-slate-900 dark:border-white/25 dark:hover:border-cyan-400 dark:hover:bg-cyan-500/15 dark:text-white font-semibold focus-visible:ring-2 focus-visible:ring-cyan-500/50',
      ghost:
        'text-slate-800 hover:text-slate-950 hover:bg-slate-100 dark:text-slate-200 dark:hover:text-white dark:hover:bg-white/[0.10] focus-visible:ring-2 focus-visible:ring-cyan-400/40',
      gold:
        'bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-bold shadow-md shadow-amber-500/20 hover:shadow-lg hover:shadow-amber-500/30 focus-visible:ring-2 focus-visible:ring-amber-500/40',
      destructive:
        'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-semibold shadow-md shadow-red-500/20 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-red-500/40',
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
