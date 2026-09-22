import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ThemeMode } from '../types';

interface NepalAILogoProps {
  theme?: ThemeMode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showDevanagariTag?: boolean;
  animateOnLoad?: boolean;
  className?: string;
}

export const NepalAILogo: React.FC<NepalAILogoProps> = ({
  theme = 'dark',
  size = 'md',
  showDevanagariTag = true,
  animateOnLoad = false,
  className = '',
}) => {
  const isDark = theme === 'dark';

  // State to track when page finishes loading to trigger the draw-in stroke animation
  const [hasFinishedLoading, setHasFinishedLoading] = useState<boolean>(!animateOnLoad);

  useEffect(() => {
    if (!animateOnLoad) {
      setHasFinishedLoading(true);
      return;
    }

    if (typeof window === 'undefined') return;

    // Trigger stroke draw-in animation with smooth architectural timing
    let timer: NodeJS.Timeout;
    if (document.readyState === 'complete') {
      timer = setTimeout(() => setHasFinishedLoading(true), 120);
    } else {
      const handleWindowLoad = () => {
        timer = setTimeout(() => setHasFinishedLoading(true), 120);
      };
      window.addEventListener('load', handleWindowLoad);
      // Safety fallback
      const fallbackTimer = setTimeout(() => setHasFinishedLoading(true), 350);
      return () => {
        window.removeEventListener('load', handleWindowLoad);
        clearTimeout(timer);
        clearTimeout(fallbackTimer);
      };
    }

    return () => clearTimeout(timer);
  }, [animateOnLoad]);

  // Dimension scaling
  const iconSizes = {
    sm: 'h-8 w-8',
    md: 'h-9 w-9 sm:h-10 sm:w-10',
    lg: 'h-11 w-11 sm:h-12 sm:w-12',
    xl: 'h-14 w-14',
  };

  const textSizes = {
    sm: 'text-base sm:text-lg',
    md: 'text-lg sm:text-xl',
    lg: 'text-2xl sm:text-3xl',
    xl: 'text-3xl sm:text-4xl',
  };

  const badgeSizes = {
    sm: 'text-[9px] px-1.5 py-0.5',
    md: 'text-[10px] px-2 py-0.5',
    lg: 'text-xs px-2.5 py-1',
    xl: 'text-xs px-3 py-1',
  };

  // SVG Geometry Paths for the Architectural 'N'
  const leftStemPath =
    'M8.5 9.5 C8.5 8.1 9.6 7 11 7 H13 C14.4 7 15.5 8.1 15.5 9.5 V34.5 C15.5 35.9 14.4 37 13 37 H11 C9.6 37 8.5 35.9 8.5 34.5 Z';
  const rightStemPath =
    'M28.5 9.5 C28.5 8.1 29.6 7 31 7 H33 C34.4 7 35.5 8.1 35.5 9.5 V34.5 C35.5 35.9 34.4 37 33 37 H31 C29.6 37 28.5 35.9 28.5 34.5 Z';
  const diagonalRibbonPath =
    'M8.5 7 L35.5 35 C36 35.7 35.6 37 34.5 37 H28.5 L8.5 9.8 C8.5 8.3 9.4 7 10.8 7 H15.5 Z';
  const specularBevelPath = 'M10.8 7 L30.5 36.5';

  return (
    <div
      className={`inline-flex items-center gap-1 sm:gap-1.5 group select-none ${className}`}
      title="NepalAI.tech"
    >
      {/* 
        Architectural Geometric 'N' Emblem
        Single 'N' serving as both the hero brand icon and the initial letter of 'Nepal'
      */}
      <div
        className={`relative flex items-center justify-center shrink-0 rounded-xl transition-all duration-500 ease-out ${
          iconSizes[size]
        } ${
          isDark
            ? 'bg-gradient-to-b from-[#0e1424] via-[#090d16] to-[#04060a] border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.6)] group-hover:border-emerald-500/80 group-hover:shadow-[0_0_24px_rgba(16,185,129,0.4),inset_0_0_12px_rgba(16,185,129,0.18)]'
            : 'bg-white border border-slate-200/90 shadow-sm group-hover:border-emerald-500/80 group-hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]'
        }`}
      >
        {/* Soft Glowing Emerald Outline Aura on Hover */}
        <div
          className="absolute inset-0 rounded-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 ring-1 ring-emerald-400/60 shadow-[0_0_20px_rgba(16,185,129,0.35)]"
          aria-hidden="true"
        />

        <svg
          viewBox="5 4 34 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full p-1 transition-transform duration-300 group-hover:scale-[1.04]"
          aria-label="NepalAI Architectural N Emblem"
        >
          <defs>
            {/* Left Column Stem Gradient */}
            <linearGradient id="nLeftStem" x1="12" y1="7" x2="12" y2="37" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor={isDark ? '#334155' : '#CBD5E1'} />
              <stop offset="60%" stopColor={isDark ? '#1E293B' : '#94A3B8'} />
              <stop offset="100%" stopColor={isDark ? '#0F172A' : '#64748B'} />
            </linearGradient>

            {/* Right Column Stem Gradient */}
            <linearGradient id="nRightStem" x1="32" y1="7" x2="32" y2="37" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor={isDark ? '#1E293B' : '#94A3B8'} />
              <stop offset="70%" stopColor={isDark ? '#0F172A' : '#64748B'} />
              <stop offset="100%" stopColor={isDark ? '#020617' : '#475569'} />
            </linearGradient>

            {/* Signature Sovereign Emerald Diagonal Ribbon (Netflix/Apple style depth) */}
            <linearGradient id="nDiagonalRibbon" x1="9" y1="7" x2="35" y2="37" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#34D399" />
              <stop offset="45%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#047857" />
            </linearGradient>

            {/* Subtle Specular Highlight Edge */}
            <linearGradient id="nSpecularEdge" x1="8.5" y1="7" x2="28.5" y2="37" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
              <stop offset="40%" stopColor="#FFFFFF" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </linearGradient>

            {/* Soft Drop Shadow beneath the diagonal ribbon */}
            <filter id="nRibbonShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="-0.8" dy="1.2" stdDeviation="1" floodColor="#000000" floodOpacity={isDark ? '0.6' : '0.25'} />
            </filter>

            {/* Soft Emerald Glow Filter on Hover */}
            <filter id="nEmeraldGlowFilter" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="1.5" result="glow" />
              <feComposite in="SourceGraphic" in2="glow" operator="over" />
            </filter>
          </defs>

          {/* 
            Architectural Geometry: Solid & Gradient Fills 
            Fades in smoothly as the stroke draw-in completes
          */}
          <motion.path
            d={leftStemPath}
            fill="url(#nLeftStem)"
            initial={animateOnLoad ? { opacity: 0 } : false}
            animate={{ opacity: hasFinishedLoading ? 1 : 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          />

          <motion.path
            d={rightStemPath}
            fill="url(#nRightStem)"
            initial={animateOnLoad ? { opacity: 0 } : false}
            animate={{ opacity: hasFinishedLoading ? 1 : 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          />

          <motion.path
            d={diagonalRibbonPath}
            fill="url(#nDiagonalRibbon)"
            filter="url(#nRibbonShadow)"
            initial={animateOnLoad ? { opacity: 0 } : false}
            animate={{ opacity: hasFinishedLoading ? 1 : 0 }}
            transition={{ duration: 0.6, delay: 0.65 }}
          />

          <motion.path
            d={specularBevelPath}
            stroke="url(#nSpecularEdge)"
            strokeWidth="0.9"
            strokeLinecap="round"
            initial={animateOnLoad ? { opacity: 0 } : false}
            animate={{ opacity: hasFinishedLoading ? 1 : 0 }}
            transition={{ duration: 0.5, delay: 0.9 }}
          />

          {/* 
            Framer Motion Stroke Draw-In Layer:
            Draws in line-by-line upon page load, highlighting the architectural geometry of 'N'
          */}
          {animateOnLoad && (
            <>
              {/* Left Column Stroke Draw-In */}
              <motion.path
                d={leftStemPath}
                fill="none"
                stroke={isDark ? '#38BDF8' : '#2563EB'}
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={
                  hasFinishedLoading
                    ? { pathLength: 1, opacity: [0, 1, 1, 0.35] }
                    : { pathLength: 0, opacity: 0 }
                }
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
              />

              {/* Diagonal Himalayan Ridge Ribbon Stroke Draw-In */}
              <motion.path
                d={diagonalRibbonPath}
                fill="none"
                stroke="#10B981"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={
                  hasFinishedLoading
                    ? { pathLength: 1, opacity: [0, 1, 1, 0.7] }
                    : { pathLength: 0, opacity: 0 }
                }
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.35 }}
              />

              {/* Right Column Stroke Draw-In */}
              <motion.path
                d={rightStemPath}
                fill="none"
                stroke="#34D399"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={
                  hasFinishedLoading
                    ? { pathLength: 1, opacity: [0, 1, 1, 0.35] }
                    : { pathLength: 0, opacity: 0 }
                }
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.65 }}
              />

              {/* Specular Bevel Line Draw-In */}
              <motion.path
                d={specularBevelPath}
                stroke="#FFFFFF"
                strokeWidth="1.2"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={
                  hasFinishedLoading
                    ? { pathLength: 1, opacity: [0, 1, 0.85] }
                    : { pathLength: 0, opacity: 0 }
                }
                transition={{ duration: 0.5, ease: 'easeOut', delay: 0.95 }}
              />
            </>
          )}

          {/* Interactive Glowing Emerald Outline Contour (Glows softly on hover) */}
          <path
            d="M8.5 9.5 C8.5 8.1 9.6 7 11 7 H15.5 L35.5 35 C36 35.7 35.6 37 34.5 37 H31 C29.6 37 28.5 35.9 28.5 34.5 V14 L12 7 H11 C9.6 7 8.5 8.1 8.5 9.5 Z"
            stroke="#10B981"
            strokeWidth="0.8"
            fill="none"
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            filter="url(#nEmeraldGlowFilter)"
          />

          {/* Subtle Apex Telemetry Node */}
          <motion.circle
            cx="32"
            cy="10.5"
            r="1.4"
            fill="#34D399"
            initial={animateOnLoad ? { scale: 0, opacity: 0 } : false}
            animate={
              hasFinishedLoading
                ? { scale: [0, 1.4, 1], opacity: 1 }
                : { scale: 0, opacity: 0 }
            }
            transition={{ duration: 0.4, delay: 1.15 }}
            className="transition-transform duration-300 group-hover:scale-125"
          />
        </svg>

        {/* Ambient Subtle Emerald Pulse */}
        <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_6px_#10B981]"></span>
        </span>
      </div>

      {/* 
        Single 'N' Brand Lockup:
        The emblem [N] defines the letter 'N' for Nepal and the icon both.
        Directly followed by 'epal' + 'AI' + '.tech' to seamlessly read 'NepalAI.tech' without any duplicate 'N'.
      */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <div className="flex items-baseline tracking-tight font-display -ml-0.5 sm:-ml-1">
          {/* 'epal' completing 'Nepal' from the 'N' emblem */}
          <span
            className={`font-black ${textSizes[size]} transition-colors tracking-tight ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
          >
            epal
          </span>

          {/* 'AI' in signature Sovereign Emerald */}
          <span className={`font-black ${textSizes[size]} text-emerald-500 tracking-tight ml-0.5`}>
            AI
          </span>

          {/* Refined .TECH Capsule Badge */}
          <span className="ml-1.5 sm:ml-2 inline-flex items-center">
            <span
              className={`font-mono font-bold uppercase tracking-widest ${badgeSizes[size]} rounded-md border transition-all ${
                isDark
                  ? 'border-emerald-500/30 bg-emerald-950/50 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.15)] group-hover:border-emerald-400/60 group-hover:bg-emerald-900/40'
                  : 'border-emerald-300 bg-emerald-50 text-emerald-800 shadow-2xs group-hover:border-emerald-500 group-hover:bg-emerald-100'
              }`}
            >
              .tech
            </span>
          </span>
        </div>

        {/* Heritage Devanagari Pill */}
        {showDevanagariTag && (
          <span
            className={`hidden sm:inline-flex items-center text-[10px] font-semibold font-['Noto_Sans_Devanagari'] rounded-md px-2 py-0.5 border transition-colors ${
              isDark
                ? 'text-slate-400 bg-white/[0.03] border-white/[0.08]'
                : 'text-slate-600 bg-slate-100 border-slate-200'
            }`}
          >
            नेपाल एआई
          </span>
        )}
      </div>
    </div>
  );
};
