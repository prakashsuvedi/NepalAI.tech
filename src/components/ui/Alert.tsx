import React from 'react';
import { Info, CheckCircle2, AlertTriangle, XCircle, X } from 'lucide-react';

export interface AlertProps {
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  children: React.ReactNode;
  onDismiss?: () => void;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  children,
  onDismiss,
  className = '',
}) => {
  const config = {
    info: {
      container: 'bg-sky-50 dark:bg-sky-950/30 border-sky-200 dark:border-sky-800/40 text-sky-900 dark:text-sky-200',
      icon: <Info className="h-4 w-4 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" aria-hidden="true" />,
      titleColor: 'text-sky-950 dark:text-sky-100',
    },
    success: {
      container: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/40 text-emerald-900 dark:text-emerald-200',
      icon: <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" />,
      titleColor: 'text-emerald-950 dark:text-emerald-100',
    },
    warning: {
      container: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/40 text-amber-900 dark:text-amber-200',
      icon: <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />,
      titleColor: 'text-amber-950 dark:text-amber-100',
    },
    error: {
      container: 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800/40 text-red-900 dark:text-red-200',
      icon: <XCircle className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" aria-hidden="true" />,
      titleColor: 'text-red-950 dark:text-red-100',
    },
  }[variant];

  return (
    <div
      role="alert"
      className={`flex items-start gap-3 p-4 rounded-xl border text-sm ${config.container} ${className}`}
    >
      {config.icon}
      <div className="flex-1 min-w-0">
        {title && <h4 className={`font-semibold text-sm mb-0.5 ${config.titleColor}`}>{title}</h4>}
        <div className="text-xs leading-relaxed opacity-95">{children}</div>
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="p-1 rounded-md opacity-60 hover:opacity-100 transition-opacity cursor-pointer shrink-0"
          aria-label="Dismiss alert"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      )}
    </div>
  );
};
