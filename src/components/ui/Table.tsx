import React from 'react';

export const Table = React.forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement>>(
  ({ children, className = '', ...props }, ref) => (
    <div className="w-full overflow-x-auto rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0a0e19]">
      <table ref={ref} className={`w-full text-left text-xs sm:text-sm ${className}`} {...props}>
        {children}
      </table>
    </div>
  )
);
Table.displayName = 'Table';

export const TableHeader = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ children, className = '', ...props }, ref) => (
    <thead
      ref={ref}
      className={`border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.03] text-slate-700 dark:text-slate-300 ${className}`}
      {...props}
    >
      {children}
    </thead>
  )
);
TableHeader.displayName = 'TableHeader';

export const TableBody = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ children, className = '', ...props }, ref) => (
    <tbody ref={ref} className={`divide-y divide-slate-100 dark:divide-white/5 ${className}`} {...props}>
      {children}
    </tbody>
  )
);
TableBody.displayName = 'TableBody';

export const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
  ({ children, className = '', ...props }, ref) => (
    <tr
      ref={ref}
      className={`transition-colors hover:bg-slate-50/70 dark:hover:bg-white/[0.03] ${className}`}
      {...props}
    >
      {children}
    </tr>
  )
);
TableRow.displayName = 'TableRow';

export const TableHead = React.forwardRef<HTMLTableCellElement, React.ThHTMLAttributes<HTMLTableCellElement>>(
  ({ children, className = '', ...props }, ref) => (
    <th
      ref={ref}
      className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 ${className}`}
      {...props}
    >
      {children}
    </th>
  )
);
TableHead.displayName = 'TableHead';

export const TableCell = React.forwardRef<HTMLTableCellElement, React.TdHTMLAttributes<HTMLTableCellElement>>(
  ({ children, className = '', ...props }, ref) => (
    <td
      ref={ref}
      className={`px-4 py-3 text-slate-700 dark:text-slate-300 align-middle ${className}`}
      {...props}
    >
      {children}
    </td>
  )
);
TableCell.displayName = 'TableCell';

export const TableCaption = React.forwardRef<HTMLTableCaptionElement, React.HTMLAttributes<HTMLTableCaptionElement>>(
  ({ children, className = '', ...props }, ref) => (
    <caption
      ref={ref}
      className={`p-3 text-xs text-slate-500 dark:text-slate-400 italic text-left ${className}`}
      {...props}
    >
      {children}
    </caption>
  )
);
TableCaption.displayName = 'TableCaption';
