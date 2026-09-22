import React from 'react';
import { ThemeMode } from '../types';

interface NepalAILogoProps {
  theme?: ThemeMode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showDevanagariTag?: boolean;
  className?: string;
}

export const NepalAILogo: React.FC<NepalAILogoProps> = ({
  theme = 'dark',
  size = 'md',
  showDevanagariTag = true,
  className = '',
}) => {
  const isDark = theme === 'dark';

  // Dimension scaling
  const iconSizes = {
    sm: 'h-7 w-7',
    md: 'h-9 w-9',
    lg: 'h-11 w-11',
    xl: 'h-14 w-14',
  };

  const textSizes = {
    sm: 'text-sm font-bold',
    md: 'text-base font-extrabold sm:text-lg',
    lg: 'text-xl font-black sm:text-2xl',
    xl: 'text-2xl font-black sm:text-3xl',
  };

  const badgeSizes = {
    sm: 'text-[9px] px-1 py-0.2',
    md: 'text-[10px] px-1.5 py-0.5',
    lg: 'text-xs px-2 py-0.5',
    xl: 'text-xs px-2.5 py-1',
  };

  return (
    <div className={`inline-flex items-center gap-2.5 sm:gap-3 group select-none ${className}`}>
      {/* Monolithic Luxury Geometric Emblem */}
      <div
        className={`relative flex items-center justify-center shrink-0 rounded-xl transition-all duration-300 ${
          iconSizes[size]
        } ${
          isDark
            ? 'bg-gradient-to-b from-[#111827] to-[#0a0d14] border border-white/10 shadow-[0_4px_16px_rgba(0,0,0,0.6)] group-hover:border-emerald-500/50 group-hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]'
            : 'bg-white border border-slate-200/90 shadow-sm group-hover:border-emerald-400 group-hover:shadow-md'
        }`}
      >
        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full p-1.5 transition-transform duration-300 group-hover:scale-105"
        >
          <defs>
            {/* Signature Sovereign Emerald Gradient */}
            <linearGradient id="apexEmeraldGrad" x1="8" y1="6" x2="32" y2="34" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#34D399" />
              <stop offset="45%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#047857" />
            </linearGradient>

            {/* Deep Obsidian / Indigo Accent Gradient */}
            <linearGradient id="apexIndigoGrad" x1="10" y1="20" x2="32" y2="36" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#6366F1" />
              <stop offset="60%" stopColor="#4338CA" />
              <stop offset="100%" stopColor="#1E1B4B" />
            </linearGradient>

            {/* Subtle Specular Top Reflection */}
            <linearGradient id="apexSpecular" x1="12" y1="6" x2="28" y2="22" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Left Vertical Spine Facet (Stem of N / Flag Pillar) */}
          <path
            d="M8 8 C8 6.89543 8.89543 6 10 6 H12.5 C13.6046 6 14.5 6.89543 14.5 8 V32 C14.5 33.1046 13.6046 34 12.5 34 H10 C8.89543 34 8 33.1046 8 32 V8 Z"
            fill="url(#apexEmeraldGrad)"
          />

          {/* Upper Mountain Apex / Top Pennant Triangle (Forming the N diagonal & upper Himalayan peak) */}
          <path
            d="M15.5 8.5 L31.5 18 C32.4 18.5 32.4 19.8 31.5 20.3 L21 26.5 L15.5 22 V8.5 Z"
            fill="url(#apexEmeraldGrad)"
          />
          {/* Upper Apex Specular Highlight */}
          <path
            d="M15.5 8.5 L27 15.5 L15.5 22 V8.5 Z"
            fill="url(#apexSpecular)"
          />

          {/* Lower Valley Apex / Bottom Pennant Triangle (Interlocking & completing N-A apex) */}
          <path
            d="M15.5 23 L22 27.5 L31.5 33 C32.4 33.5 32.1 34 31 34 H15.5 V23 Z"
            fill="url(#apexIndigoGrad)"
          />

          {/* Precision AI Diamond Core in Apex Negative Space */}
          <circle cx="21" cy="16.5" r="1.8" fill="#FFFFFF" />
          <circle cx="29" cy="30" r="1.5" fill="#34D399" />
        </svg>
      </div>

      {/* Brand Identity Wordmark */}
      <div className="flex items-center gap-2">
        <div className="flex items-baseline tracking-tight font-display">
          <span
            className={`transition-colors ${textSizes[size]} ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
          >
            nepal
          </span>
          <span className={`${textSizes[size]} text-emerald-500 ml-0.5`}>
            ai
          </span>
          
          {/* Refined Minimalist .TECH Pill */}
          <span className="ml-1.5 inline-flex items-center">
            <span
              className={`font-mono font-bold uppercase tracking-wider ${badgeSizes[size]} rounded-md border transition-all ${
                isDark
                  ? 'border-emerald-500/30 bg-emerald-950/40 text-emerald-400 group-hover:border-emerald-400/60'
                  : 'border-emerald-200 bg-emerald-50 text-emerald-700 group-hover:border-emerald-400'
              }`}
            >
              .tech
            </span>
          </span>
        </div>

        {/* Minimalist Devanagari Sub-Label */}
        {showDevanagariTag && (
          <span
            className={`hidden sm:inline-block text-[10px] font-medium font-['Noto_Sans_Devanagari'] rounded px-1.5 py-0.5 border transition-colors ${
              isDark
                ? 'text-slate-400 bg-white/[0.03] border-white/[0.06]'
                : 'text-slate-600 bg-slate-100 border-slate-200'
            }`}
          >
            नेपाल
          </span>
        )}
      </div>
    </div>
  );
};
