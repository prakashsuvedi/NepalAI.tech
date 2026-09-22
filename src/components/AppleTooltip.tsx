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
          className={`absolute left-3 right-3 sm:left-4 sm:right-4 top-3 z-30 rounded-2xl border p-3.5 sm:p-4 backdrop-blur-xl transition-all ${
            isDark
              ? 'bg-[#0b101c]/95 border-emerald-500/30 text-white shadow-[0_16px_40px_rgba(0,0,0,0.7)] ring-1 ring-white/10'
              : 'bg-white/95 border-emerald-500/40 text-slate-900 shadow-[0_16px_40px_rgba(15,23,42,0.14)] ring-1 ring-slate-900/5'
          } ${isPinned ? 'pointer-events-auto' : 'pointer-events-none'} ${className}`}
        >
          {/* Top Micro-Header */}
          <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-500/15">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-medium ${
                isDark ? 'bg-white/[0.08] text-slate-300' : 'bg-slate-100 text-slate-700'
              }`}>
                {category}
              </span>

              {worksInNepal === 'direct' && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-500">
                  <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                  <span>Nepal Direct</span>
                </span>
              )}

              {supportsQuickPay && (
                <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                  isDark ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-100 text-emerald-800'
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
                className="pointer-events-auto min-w-[44px] min-h-[44px] -mr-2.5 -my-2 flex items-center justify-center rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500"
              >
                <span className="text-sm font-semibold">✕</span>
              </button>
            )}
          </div>

          {/* Tool Title */}
          <div className="mt-2 flex items-center justify-between gap-2">
            <h4 className={`text-xs sm:text-sm font-bold tracking-tight ${
              isDark ? 'text-white' : 'text-slate-950'
            }`}>
              {toolName}
            </h4>
            {priceLabel && (
              <span className="text-[11px] font-mono font-bold text-emerald-400 shrink-0">
                {priceLabel}
              </span>
            )}
          </div>

          {/* Bilingual Concise Descriptions */}
          <div className="mt-2 space-y-2">
            {/* English One-Sentence Description */}
            <div className="flex items-start gap-1.5">
              <span className="text-[9px] font-mono uppercase px-1 py-0.2 rounded font-bold bg-slate-500/20 text-slate-400 shrink-0 mt-0.5">
                EN
              </span>
              <p className={`text-xs leading-relaxed font-sans ${
                isDark ? 'text-slate-200' : 'text-slate-700'
              }`}>
                {descriptionEn}
              </p>
            </div>

            {/* Nepali One-Sentence Devanagari Description */}
            {descriptionNe && (
              <div className="flex items-start gap-1.5 pt-1.5 border-t border-slate-500/10">
                <span className="text-[9px] font-mono uppercase px-1 py-0.2 rounded font-bold bg-emerald-500/20 text-emerald-400 shrink-0 mt-0.5">
                  NE
                </span>
                <p className={`text-xs leading-relaxed font-['Noto_Sans_Devanagari'] font-normal ${
                  isDark ? 'text-emerald-300/90' : 'text-emerald-900'
                }`}>
                  {descriptionNe}
                </p>
              </div>
            )}
          </div>

          {/* Quick Pay Footer Note when supported */}
          {supportsQuickPay && (
            <div className={`mt-2.5 pt-2 border-t flex items-center justify-between text-[10px] font-medium ${
              isDark ? 'border-white/10 text-emerald-400' : 'border-slate-200 text-emerald-700'
            }`}>
              <span className="flex items-center gap-1">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                </span>
                <span>Direct eSewa & Khalti NPR Checkout</span>
              </span>
              <span className="font-mono text-[9px] opacity-80">
                {quickPayProvider}
              </span>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
