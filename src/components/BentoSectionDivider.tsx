import React from 'react';
import { motion } from 'motion/react';
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
      ? 'from-transparent via-emerald-500/35 to-transparent'
      : 'from-transparent via-emerald-600/30 to-transparent',
    indigo: isDark
      ? 'from-transparent via-indigo-500/35 to-transparent'
      : 'from-transparent via-indigo-600/30 to-transparent',
    slate: isDark
      ? 'from-transparent via-white/15 to-transparent'
      : 'from-transparent via-slate-400/30 to-transparent',
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
            ? 'bg-indigo-500/20'
            : variant === 'slate'
            ? isDark
              ? 'bg-white/10'
              : 'bg-slate-300/30'
            : 'bg-emerald-500/20'
        }`}
      />

      {/* Main Crisp High-Contrast Gradient Line */}
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        whileInView={{ scaleX: 1, opacity: 1 }}
        viewport={{ once: true, margin: '-20px' }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className={`w-full h-px bg-gradient-to-r ${gradientClasses}`}
      />

      {/* Center Subtle Diamond / Accent Pin */}
      {showDiamond && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true, margin: '-20px' }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="absolute flex items-center justify-center"
        >
          <div
            className={`w-2 h-2 rotate-45 border shadow-sm ${
              variant === 'indigo'
                ? isDark
                  ? 'border-indigo-400/80 bg-indigo-950 shadow-[0_0_8px_rgba(99,102,241,0.5)]'
                  : 'border-indigo-600 bg-white shadow-xs'
                : variant === 'slate'
                ? isDark
                  ? 'border-slate-400/60 bg-slate-900'
                  : 'border-slate-400 bg-white shadow-xs'
                : isDark
                ? 'border-emerald-400/80 bg-[#060a0f] shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                : 'border-emerald-600 bg-white shadow-xs'
            }`}
          />
        </motion.div>
      )}
    </div>
  );
};
