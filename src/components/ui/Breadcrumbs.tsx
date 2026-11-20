import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
  href?: string;
  isCurrent?: boolean;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  onHomeClick?: () => void;
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  onHomeClick,
  className = '',
}) => {
  return (
    <nav aria-label="Breadcrumb" className={`flex items-center text-xs text-slate-600 dark:text-slate-300 ${className}`}>
      <ol className="flex items-center gap-1.5 flex-wrap">
        {onHomeClick && (
          <li className="flex items-center">
            <button
              type="button"
              onClick={onHomeClick}
              className="flex items-center gap-1 hover:text-slate-950 dark:hover:text-white transition-colors cursor-pointer"
              aria-label="Home"
            >
              <Home className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
            <ChevronRight className="h-3.5 w-3.5 mx-1 text-slate-400 dark:text-slate-500 shrink-0" aria-hidden="true" />
          </li>
        )}

        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <li key={idx} className="flex items-center">
              {item.isCurrent || isLast ? (
                <span
                  aria-current="page"
                  className="font-semibold text-slate-900 dark:text-white"
                >
                  {item.label}
                </span>
              ) : item.onClick ? (
                <button
                  type="button"
                  onClick={item.onClick}
                  className="hover:text-slate-950 dark:hover:text-white transition-colors cursor-pointer"
                >
                  {item.label}
                </button>
              ) : item.href ? (
                <a
                  href={item.href}
                  className="hover:text-slate-950 dark:hover:text-white transition-colors"
                >
                  {item.label}
                </a>
              ) : (
                <span>{item.label}</span>
              )}

              {!isLast && (
                <ChevronRight className="h-3.5 w-3.5 mx-1 text-slate-400 dark:text-slate-500 shrink-0" aria-hidden="true" />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
