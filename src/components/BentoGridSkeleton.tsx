import React from 'react';
import { motion } from 'motion/react';
import { ThemeMode } from '../types';

interface BentoGridSkeletonProps {
  theme?: ThemeMode;
  count?: number;
  type?: 'tools' | 'free' | 'daily' | 'consulting';
  className?: string;
}

/**
 * Shimmer Bar Component - Reusable animated bar matching content proportions
 */
const ShimmerBlock: React.FC<{
  className?: string;
  isDark?: boolean;
}> = ({ className = '', isDark = true }) => (
  <div
    className={`relative overflow-hidden rounded ${
      isDark ? 'bg-white/[0.07]' : 'bg-slate-200/80'
    } ${className}`}
  >
    <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/10 dark:via-white/[0.08] to-transparent pointer-events-none" />
  </div>
);

/**
 * ToolCardSkeleton: Content-aware skeleton mirroring Nepal AI Directory cards
 */
export const ToolCardSkeleton: React.FC<{ theme?: ThemeMode }> = ({ theme = 'dark' }) => {
  const isDark = theme === 'dark';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3 }}
      className={`relative p-5 rounded-2xl border transition-all overflow-hidden flex flex-col justify-between h-[280px] sm:h-[300px] ${
        isDark
          ? 'bg-[#090d16]/70 border-white/[0.08] shadow-[0_4px_20px_rgba(0,0,0,0.4)]'
          : 'bg-white border-slate-200/90 shadow-sm'
      }`}
    >
      {/* Top Row: Icon + Category Badge + Dollar Badge */}
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Tool Icon Squircle */}
            <ShimmerBlock isDark={isDark} className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl shrink-0" />
            <div className="space-y-1.5">
              {/* Tool Name */}
              <ShimmerBlock isDark={isDark} className="h-4.5 w-28 sm:w-32 rounded-md" />
              {/* Category Pill */}
              <ShimmerBlock isDark={isDark} className="h-3.5 w-20 rounded-full" />
            </div>
          </div>
          {/* Status Badge */}
          <ShimmerBlock isDark={isDark} className="h-5 w-16 sm:w-20 rounded-full shrink-0" />
        </div>

        {/* Middle: Description Lines (Content-aware 2-line layout) */}
        <div className="mt-4 space-y-2">
          <ShimmerBlock isDark={isDark} className="h-3 w-full rounded" />
          <ShimmerBlock isDark={isDark} className="h-3 w-4/5 rounded" />
        </div>

        {/* Feature Tags Shimmer */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          <ShimmerBlock isDark={isDark} className="h-5 w-16 rounded-md" />
          <ShimmerBlock isDark={isDark} className="h-5 w-20 rounded-md" />
          <ShimmerBlock isDark={isDark} className="h-5 w-14 rounded-md" />
        </div>
      </div>

      {/* Bottom Section: Dual Currency Pricing + Action Buttons */}
      <div className="pt-4 mt-auto border-t border-slate-500/15 flex items-center justify-between gap-3">
        <div className="space-y-1">
          {/* Monthly USD Price */}
          <ShimmerBlock isDark={isDark} className="h-4 w-16 rounded" />
          {/* NPR Converted Price */}
          <ShimmerBlock isDark={isDark} className="h-3 w-20 rounded" />
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2">
          <ShimmerBlock isDark={isDark} className="h-8 w-24 sm:w-28 rounded-lg" />
        </div>
      </div>

      {/* Subtle Shimmer Overlay on entire card container */}
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/[0.03] dark:via-white/[0.02] to-transparent pointer-events-none" />
    </motion.div>
  );
};

/**
 * FreeToolCardSkeleton: Content-aware skeleton for Free AI Providers & APIs
 */
export const FreeToolCardSkeleton: React.FC<{ theme?: ThemeMode }> = ({ theme = 'dark' }) => {
  const isDark = theme === 'dark';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3 }}
      className={`relative p-5 rounded-2xl border transition-all overflow-hidden flex flex-col justify-between h-[320px] ${
        isDark
          ? 'bg-[#090d16]/70 border-white/[0.08] shadow-[0_4px_20px_rgba(0,0,0,0.4)]'
          : 'bg-white border-slate-200/90 shadow-sm'
      }`}
    >
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShimmerBlock isDark={isDark} className="h-8 w-8 rounded-lg" />
            <ShimmerBlock isDark={isDark} className="h-4.5 w-36 rounded-md" />
          </div>
          <ShimmerBlock isDark={isDark} className="h-5 w-20 rounded-full" />
        </div>

        <div className="space-y-2">
          <ShimmerBlock isDark={isDark} className="h-3 w-full rounded" />
          <ShimmerBlock isDark={isDark} className="h-3 w-5/6 rounded" />
        </div>

        {/* Terminal / Code snippet skeleton preview */}
        <div
          className={`p-3 rounded-xl border ${
            isDark ? 'bg-black/40 border-white/5' : 'bg-slate-100 border-slate-200'
          }`}
        >
          <div className="space-y-1.5">
            <ShimmerBlock isDark={isDark} className="h-2.5 w-2/3 rounded" />
            <ShimmerBlock isDark={isDark} className="h-2.5 w-1/2 rounded" />
          </div>
        </div>
      </div>

      <div className="pt-3.5 border-t border-slate-500/15 flex items-center justify-between">
        <ShimmerBlock isDark={isDark} className="h-4 w-28 rounded" />
        <ShimmerBlock isDark={isDark} className="h-7 w-20 rounded-lg" />
      </div>

      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/[0.03] dark:via-white/[0.02] to-transparent pointer-events-none" />
    </motion.div>
  );
};

/**
 * DailyToolCardSkeleton: Content-aware skeleton for Daily Essential Tools
 */
export const DailyToolCardSkeleton: React.FC<{ theme?: ThemeMode }> = ({ theme = 'dark' }) => {
  const isDark = theme === 'dark';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3 }}
      className={`relative p-5 rounded-2xl border transition-all overflow-hidden flex flex-col justify-between h-[290px] ${
        isDark
          ? 'bg-[#090d16]/70 border-white/[0.08] shadow-[0_4px_20px_rgba(0,0,0,0.4)]'
          : 'bg-white border-slate-200/90 shadow-sm'
      }`}
    >
      <div className="space-y-3.5">
        <div className="flex items-start justify-between">
          <ShimmerBlock isDark={isDark} className="h-10 w-10 rounded-xl" />
          <ShimmerBlock isDark={isDark} className="h-5 w-16 rounded-full" />
        </div>

        <div className="space-y-2">
          <ShimmerBlock isDark={isDark} className="h-4.5 w-32 rounded-md" />
          <ShimmerBlock isDark={isDark} className="h-3 w-full rounded" />
          <ShimmerBlock isDark={isDark} className="h-3 w-4/5 rounded" />
        </div>

        {/* Live metric / interactive control skeleton */}
        <div
          className={`p-3 rounded-xl border ${
            isDark ? 'bg-white/[0.02] border-white/5' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <ShimmerBlock isDark={isDark} className="h-4 w-3/4 rounded" />
        </div>
      </div>

      <div className="pt-3 border-t border-slate-500/15 flex items-center justify-between">
        <ShimmerBlock isDark={isDark} className="h-3.5 w-24 rounded" />
        <ShimmerBlock isDark={isDark} className="h-7 w-20 rounded-lg" />
      </div>

      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/[0.03] dark:via-white/[0.02] to-transparent pointer-events-none" />
    </motion.div>
  );
};

/**
 * ConsultingCardSkeleton: Content-aware skeleton for Enterprise Consulting Offerings
 */
export const ConsultingCardSkeleton: React.FC<{ theme?: ThemeMode }> = ({ theme = 'dark' }) => {
  const isDark = theme === 'dark';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3 }}
      className={`relative p-6 sm:p-7 rounded-3xl border transition-all overflow-hidden flex flex-col justify-between h-[420px] ${
        isDark
          ? 'bg-[#090d16]/70 border-white/[0.08] shadow-[0_4px_24px_rgba(0,0,0,0.5)]'
          : 'bg-white border-slate-200/90 shadow-sm'
      }`}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <ShimmerBlock isDark={isDark} className="h-5 w-24 rounded-full" />
          <ShimmerBlock isDark={isDark} className="h-4 w-16 rounded" />
        </div>

        <ShimmerBlock isDark={isDark} className="h-6 w-44 rounded-md" />
        <ShimmerBlock isDark={isDark} className="h-3.5 w-full rounded" />

        {/* Large Pricing Skeleton Block */}
        <div
          className={`p-4 rounded-2xl border ${
            isDark ? 'bg-white/[0.02] border-white/5' : 'bg-slate-50 border-slate-200'
          } space-y-2`}
        >
          <ShimmerBlock isDark={isDark} className="h-7 w-32 rounded" />
          <ShimmerBlock isDark={isDark} className="h-3.5 w-24 rounded" />
        </div>

        {/* Deliverables bullet list */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center gap-2">
            <ShimmerBlock isDark={isDark} className="h-3.5 w-3.5 rounded-full shrink-0" />
            <ShimmerBlock isDark={isDark} className="h-3 w-4/5 rounded" />
          </div>
          <div className="flex items-center gap-2">
            <ShimmerBlock isDark={isDark} className="h-3.5 w-3.5 rounded-full shrink-0" />
            <ShimmerBlock isDark={isDark} className="h-3 w-2/3 rounded" />
          </div>
          <div className="flex items-center gap-2">
            <ShimmerBlock isDark={isDark} className="h-3.5 w-3.5 rounded-full shrink-0" />
            <ShimmerBlock isDark={isDark} className="h-3 w-3/4 rounded" />
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-500/15">
        <ShimmerBlock isDark={isDark} className="h-10 w-full rounded-xl" />
      </div>

      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/[0.03] dark:via-white/[0.02] to-transparent pointer-events-none" />
    </motion.div>
  );
};

/**
 * BentoGridSkeleton: Main grid wrapper that renders the required number of content-aware cards
 */
export const BentoGridSkeleton: React.FC<BentoGridSkeletonProps> = ({
  theme = 'dark',
  count = 6,
  type = 'tools',
  className = '',
}) => {
  const items = Array.from({ length: count }, (_, i) => i);

  const renderSkeletonCard = (index: number) => {
    switch (type) {
      case 'free':
        return <FreeToolCardSkeleton key={index} theme={theme} />;
      case 'daily':
        return <DailyToolCardSkeleton key={index} theme={theme} />;
      case 'consulting':
        return <ConsultingCardSkeleton key={index} theme={theme} />;
      case 'tools':
      default:
        return <ToolCardSkeleton key={index} theme={theme} />;
    }
  };

  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 ${className}`}
      aria-busy="true"
      aria-label="Loading content..."
    >
      {items.map(renderSkeletonCard)}
    </div>
  );
};
