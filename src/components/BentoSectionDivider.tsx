import React from 'react';
import { ThemeMode } from '../types';

interface BentoSectionDividerProps {
  theme?: ThemeMode;
  variant?: 'emerald' | 'indigo' | 'slate';
  showDiamond?: boolean;
}

export const BentoSectionDivider: React.FC<BentoSectionDividerProps> = ({
  theme = 'dark',
  variant = 'emerald',
  showDiamond = true,
}) => {
  const isDark = theme === 'dark';

  const gradientClasses = {
    emerald: isDark
      ? 'from-transparent via-cyan-500/40 to-transparent'
      : 'from-transparent via-cyan-600/35 to-transparent',
    indigo: isDark
      ? 'from-transparent via-sky-500/40 to-transparent'
      : 'from-transparent via-sky-600/35 to-transparent',
    slate: isDark
      ? 'from-transparent via-white/15 to-transparent'
      : 'from-transparent via-slate-400/35 to-transparent',
  }[variant];

  return (
    <div
      className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 my-2 flex items-center justify-center overflow-hidden pointer-events-none select-none"
      aria-hidden="true"
    >
      {/* Soft Gradient Center Glow */}
      <div
        className={`absolute inset-x-1/4 h-6 blur-md opacity-25 ${
          variant === 'indigo'
            ? 'bg-sky-500/20'
            : variant === 'slate'
            ? isDark
              ? 'bg-white/10'
              : 'bg-slate-300/30'
            : 'bg-cyan-500/20'
        }`}
      />

      {/* Main Crisp High-Contrast Gradient Line */}
      <div className={`w-full h-px bg-gradient-to-r ${gradientClasses}`} />

      {/* Center Subtle Diamond / Accent Pin */}
      {showDiamond && (
        <div className="absolute flex items-center justify-center">
          <div
            className={`w-2 h-2 rotate-45 border shadow-sm ${
              variant === 'indigo'
                ? isDark
                  ? 'border-sky-400/80 bg-sky-950'
                  : 'border-sky-600 bg-white shadow-xs'
                : variant === 'slate'
                ? isDark
                  ? 'border-slate-400/60 bg-slate-900'
                  : 'border-slate-400 bg-white shadow-xs'
                : isDark
                ? 'border-cyan-400/80 bg-[#060a14]'
                : 'border-cyan-600 bg-white shadow-xs'
            }`}
          />
        </div>
      )}
    </div>
  );
};
