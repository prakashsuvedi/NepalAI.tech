import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ThemeMode, Language } from '../types';
import { ShieldCheck, Zap, ArrowUpRight, CheckCircle2 } from 'lucide-react';

export interface AppleTooltipProps {
  isVisible: boolean;
  theme?: ThemeMode;
  language?: Language;
  toolName: string;
  category: string;
  descriptionEn: string;
  descriptionNe?: string;
  supportsQuickPay?: boolean;
  quickPayProvider?: string;
  worksInNepal?: 'direct' | 'needs-vpn' | 'restricted';
  priceLabel?: string;
  className?: string;
  onClose?: () => void;
  isPinned?: boolean;
}

/**
 * Apple-Style Minimalist Floating Tooltip Component
 * Follows Cupertino design principles: translucent glassmorphism, refined micro-typography,
 * concise bilingual English + Nepali one-sentence insights, and non-obtrusive floating placement.
 */
export const AppleTooltip: React.FC<AppleTooltipProps> = ({
  isVisible,
  theme = 'dark',
  language = 'en',
  toolName,
  category,
  descriptionEn,
  descriptionNe,
  supportsQuickPay = false,
  quickPayProvider = 'eSewa & Khalti',
  worksInNepal = 'direct',
  priceLabel,
  className = '',
  onClose,
  isPinned = false,
}) => {
  const isDark = theme === 'dark';

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          role="tooltip"
          aria-label={`${toolName} specs and bilingual summary`}
          initial={{ opacity: 0, y: 8, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 6, scale: 0.97 }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          className={`absolute left-3 right-3 sm:left-4 sm:right-4 top-3 z-30 rounded-2xl border p-3.5 sm:p-4 backdrop-blur-xl transition-colors ${
            isDark
              ? 'bg-[#0b101c]/95 border-cyan-500/40 text-white shadow-[0_16px_40px_rgba(0,0,0,0.75)] ring-1 ring-white/10'
              : 'bg-white/98 border-cyan-500/50 text-slate-950 shadow-[0_16px_40px_rgba(15,23,42,0.16)] ring-1 ring-slate-900/5'
          } ${isPinned ? 'pointer-events-auto' : 'pointer-events-none'} ${className}`}
        >
          {/* Top Micro-Header */}
          <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-500/20">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold ${
                isDark ? 'bg-white/[0.10] text-slate-200' : 'bg-slate-100 text-slate-800'
              }`}>
                {category}
              </span>

              {worksInNepal === 'direct' && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-700 dark:text-cyan-300">
                  <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                  <span>Nepal Direct</span>
                </span>
              )}

              {supportsQuickPay && (
                <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  isDark ? 'bg-cyan-500/20 text-cyan-200' : 'bg-cyan-100 text-cyan-900'
                }`}>
                  <Zap className="h-2.5 w-2.5 fill-current" aria-hidden="true" />
                  <span>Quick Pay</span>
                </span>
              )}
            </div>

            {isPinned && onClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Dismiss tooltip"
                className={`pointer-events-auto min-w-[40px] min-h-[40px] -mr-2 -my-2 flex items-center justify-center rounded-xl transition-colors cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-cyan-500 ${
                  isDark ? 'text-slate-200 hover:text-white' : 'text-slate-700 hover:text-slate-950'
                }`}
              >
                <span className="text-sm font-semibold">✕</span>
              </button>
            )}
          </div>

          {/* Tool Title */}
          <div className="mt-2 flex items-center justify-between gap-2">
            <h4 className={`text-sm font-bold tracking-tight ${
              isDark ? 'text-white' : 'text-slate-950'
            }`}>
              {toolName}
            </h4>
            {priceLabel && (
              <span className={`text-xs font-mono font-bold shrink-0 ${
                isDark ? 'text-cyan-300' : 'text-cyan-800'
              }`}>
                {priceLabel}
              </span>
            )}
          </div>

          {/* Bilingual Concise Descriptions */}
          <div className="mt-2 space-y-2">
            {/* English One-Sentence Description */}
            <div className="flex items-start gap-1.5">
              <span className={`text-[10px] font-mono uppercase px-1.5 py-0.2 rounded font-bold bg-slate-500/20 shrink-0 mt-0.5 ${
                isDark ? 'text-slate-200' : 'text-slate-800'
              }`}>
                EN
              </span>
              <p className={`text-xs leading-relaxed font-sans ${
                isDark ? 'text-slate-100' : 'text-slate-800'
              }`}>
                {descriptionEn}
              </p>
            </div>

            {/* Nepali One-Sentence Devanagari Description */}
            {descriptionNe && (
              <div className="flex items-start gap-1.5 pt-1.5 border-t border-slate-500/15">
                <span className={`text-[10px] font-mono uppercase px-1.5 py-0.2 rounded font-bold shrink-0 mt-0.5 ${
                  isDark ? 'bg-cyan-500/20 text-cyan-200' : 'bg-cyan-100 text-cyan-900'
                }`}>
                  NE
                </span>
                <p className={`text-xs leading-relaxed font-['Noto_Sans_Devanagari'] font-normal ${
                  isDark ? 'text-cyan-200' : 'text-cyan-950'
                }`}>
                  {descriptionNe}
                </p>
              </div>
            )}
          </div>

          {/* Quick Pay Footer Note when supported */}
          {supportsQuickPay && (
            <div className={`mt-2.5 pt-2 border-t flex items-center justify-between text-[11px] font-semibold ${
              isDark ? 'border-white/10 text-cyan-300' : 'border-slate-200 text-cyan-800'
            }`}>
              <span className="flex items-center gap-1.5">
                <span className="inline-flex rounded-full h-1.5 w-1.5 bg-cyan-500" />
                <span>Direct eSewa & Khalti Checkout</span>
              </span>
              <span className="font-mono text-[10px]">
                {quickPayProvider}
              </span>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
