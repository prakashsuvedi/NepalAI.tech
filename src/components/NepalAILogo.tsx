import React from 'react';
import { ThemeMode } from '../types';

interface NepalAILogoProps {
  theme?: ThemeMode;
  size?: 'sm' | 'md' | 'lg';
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
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
  };

  return (
    <div className={`flex items-center gap-2.5 group select-none ${className}`}>
      {/* Visual Logo Emblem: Nepal Pennant Peak + Neural Circuit + AI Spark */}
      <div
        className={`relative flex items-center justify-center rounded-xl p-1 transition-all duration-300 ${
          iconSizes[size]
        } ${
          isDark
            ? 'bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/10 shadow-[0_0_15px_rgba(16,185,129,0.15)] group-hover:border-emerald-500/50 group-hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]'
            : 'bg-gradient-to-br from-white to-slate-100 border border-slate-200/90 shadow-sm group-hover:border-emerald-400 group-hover:shadow-md'
        }`}
      >
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-sm"
        >
          <defs>
            {/* National Crimson to Cyber Indigo & Emerald */}
            <linearGradient id="nepalPennantGrad" x1="10" y1="6" x2="38" y2="40" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#DC2626" />
              <stop offset="45%" stopColor="#4F46E5" />
              <stop offset="100%" stopColor="#10B981" />
            </linearGradient>

            <linearGradient id="circuitLineGrad" x1="8" y1="8" x2="40" y2="40" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#60A5FA" />
              <stop offset="100%" stopColor="#34D399" />
            </linearGradient>

            <filter id="logoSparkGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Neural Flag Staff / Tech Backbone */}
          <line
            x1="11"
            y1="6"
            x2="11"
            y2="42"
            stroke="#10B981"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Upper Triangular Pennant (Mountain Summit & Flag Peak) */}
          <path
            d="M11 8 L34 19 L19 19 Z"
            fill="url(#nepalPennantGrad)"
            stroke="#4F46E5"
            strokeWidth="0.8"
            strokeLinejoin="round"
          />

          {/* Lower Triangular Pennant (Tech Base & Valley Foundation) */}
          <path
            d="M11 19 L39 36 L11 36 Z"
            fill="url(#nepalPennantGrad)"
            stroke="#10B981"
            strokeWidth="0.8"
            strokeLinejoin="round"
          />

          {/* Celestial AI Sun Spark (Upper Pennant Intelligence Core) */}
          <circle cx="18" cy="14" r="3.5" fill="#FFFFFF" fillOpacity="0.3" />
          <circle cx="18" cy="14" r="1.8" fill="#FFFFFF" filter="url(#logoSparkGlow)" />
          {/* 4 Cardinal Spark Rays */}
          <line x1="18" y1="10.5" x2="18" y2="17.5" stroke="#FFFFFF" strokeWidth="0.8" strokeLinecap="round" />
          <line x1="14.5" y1="14" x2="21.5" y2="14" stroke="#FFFFFF" strokeWidth="0.8" strokeLinecap="round" />

          {/* Celestial Moon Neural Arc (Lower Pennant Synaptic Node) */}
          <path
            d="M16 25 C20 25 22.5 28 22.5 31.5 C19 31.5 16 29 16 25 Z"
            fill="#38BDF8"
            fillOpacity="0.85"
          />
          <circle cx="19.5" cy="28.5" r="1.2" fill="#FFFFFF" />

          {/* Circuit Traces & Peak Telemetry Nodes */}
          <line
            x1="22.5"
            y1="31.5"
            x2="30"
            y2="33"
            stroke="url(#circuitLineGrad)"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          <circle cx="30" cy="33" r="1.6" fill="#10B981" />

          {/* Summit Peak Node (Machapuchare / Everest Apex Node) */}
          <circle cx="34" cy="19" r="1.8" fill="#60A5FA" />
          <circle cx="39" cy="36" r="2" fill="#10B981" filter="url(#logoSparkGlow)" />

          {/* Subtle Cyber Beacon Spark (Top Right) */}
          <circle cx="41" cy="9" r="1.5" fill="#10B981" />
          <circle cx="41" cy="9" r="3.2" stroke="#10B981" strokeWidth="0.6" strokeOpacity="0.4" />
        </svg>

        {/* Ambient subtle ping indicator */}
        <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
      </div>

      {/* Brand Name Typography + Prominent "tech" Tag */}
      <div className="flex items-center gap-2">
        <div className="flex items-baseline font-['Space_Grotesk'] tracking-tight">
          <span
            className={`font-extrabold ${textSizes[size]} transition-colors ${
              isDark ? 'text-white' : 'text-slate-950'
            }`}
          >
            nepal
          </span>
          <span className={`font-extrabold ${textSizes[size]} text-emerald-500`}>
            ai
          </span>
          
          {/* Prominent .TECH tag badge */}
          <span className="ml-1 inline-flex items-center">
            <span
              className={`font-mono text-[11px] font-bold px-1.5 py-0.5 rounded-md border transition-all ${
                isDark
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-400 group-hover:border-emerald-400 group-hover:bg-emerald-900/50 shadow-[0_0_10px_rgba(16,185,129,0.15)]'
                  : 'bg-emerald-50 border-emerald-300 text-emerald-700 group-hover:border-emerald-500 group-hover:bg-emerald-100 shadow-xs'
              }`}
            >
              .tech
            </span>
          </span>
        </div>

        {/* Optional Devanagari Heritage Pill */}
        {showDevanagariTag && (
          <span
            className={`hidden sm:inline-block text-[10px] font-medium rounded px-1.5 py-0.5 font-['Noto_Sans_Devanagari'] border transition-colors ${
              isDark
                ? 'text-slate-400 bg-white/[0.04] border-white/[0.08]'
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
