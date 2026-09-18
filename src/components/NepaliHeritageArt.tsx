import React from 'react';

interface NepaliHeritageArtProps {
  theme: 'dark' | 'light';
  showHimalaya?: boolean;
  showMandir?: boolean;
}

export const NepaliHeritageArt: React.FC<NepaliHeritageArtProps> = ({
  theme,
  showHimalaya = true,
  showMandir = true,
}) => {
  const isDark = theme === 'dark';

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10 select-none">
      
      {/* Subtle Sky Ambient Radiance */}
      <div
        className={`absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[420px] rounded-full blur-[110px] transition-colors duration-500 ${
          isDark
            ? 'bg-gradient-to-b from-indigo-900/20 via-emerald-950/15 to-transparent'
            : 'bg-gradient-to-b from-amber-200/25 via-emerald-100/30 to-transparent'
        }`}
      />

      {/* Subtle Prayer Flags (लुङ्दार) Accent along the top */}
      <div className="absolute top-0 left-0 right-0 h-4 flex items-center justify-around opacity-35">
        <div className="w-full flex items-center justify-around border-t border-dashed border-slate-500/25 pt-0.5">
          {['bg-blue-500', 'bg-white', 'bg-red-500', 'bg-emerald-500', 'bg-amber-400'].map((color, idx) => (
            <div
              key={idx}
              className={`w-3.5 h-2.5 ${color} opacity-40 transform -skew-x-12 shadow-sm rounded-b-[1px]`}
            />
          ))}
          {['bg-blue-500', 'bg-white', 'bg-red-500', 'bg-emerald-500', 'bg-amber-400'].map((color, idx) => (
            <div
              key={`repeat-${idx}`}
              className={`w-3.5 h-2.5 ${color} opacity-40 transform -skew-x-12 shadow-sm rounded-b-[1px] hidden sm:block`}
            />
          ))}
        </div>
      </div>

      {/* SVG Layer: Himalayas & Mandir Silhouette */}
      <svg
        className="absolute bottom-0 left-0 w-full h-[220px] sm:h-[280px] md:h-[340px] transition-opacity duration-500"
        viewBox="0 0 1440 380"
        fill="none"
        preserveAspectRatio="none"
      >
        <defs>
          {/* Gradients for Mountain Ridge 1 (Far peaks - Everest / Lhotse) */}
          <linearGradient id="farMountainGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={isDark ? '#312e81' : '#cbd5e1'} stopOpacity={isDark ? '0.35' : '0.45'} />
            <stop offset="100%" stopColor={isDark ? '#07090e' : '#f8fafc'} stopOpacity="0.0" />
          </linearGradient>

          {/* Gradients for Mountain Ridge 2 (Mid peaks - Machapuchare / Fishtail & Annapurna) */}
          <linearGradient id="midMountainGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={isDark ? '#065f46' : '#94a3b8'} stopOpacity={isDark ? '0.3' : '0.55'} />
            <stop offset="60%" stopColor={isDark ? '#042f2e' : '#cbd5e1'} stopOpacity={isDark ? '0.2' : '0.35'} />
            <stop offset="100%" stopColor={isDark ? '#07090e' : '#f8fafc'} stopOpacity="0.0" />
          </linearGradient>

          {/* Snow Cap Highlights */}
          <linearGradient id="snowGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={isDark ? '#e0e7ff' : '#ffffff'} stopOpacity={isDark ? '0.55' : '0.9'} />
            <stop offset="100%" stopColor={isDark ? '#38bdf8' : '#e2e8f0'} stopOpacity="0.1" />
          </linearGradient>

          {/* Mandir Pagoda Roof Fill */}
          <linearGradient id="mandirGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={isDark ? '#f59e0b' : '#b45309'} stopOpacity={isDark ? '0.4' : '0.5'} />
            <stop offset="100%" stopColor={isDark ? '#07090e' : '#f8fafc'} stopOpacity="0.0" />
          </linearGradient>

          <filter id="mistBlur" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="8" />
          </filter>
        </defs>

        {showHimalaya && (
          <g className="transition-all duration-700">
            {/* Far Background Himalayan Peaks (Everest Range) */}
            <path
              d="M0,230 L110,140 L220,195 L340,110 L480,180 L620,80 L760,165 L890,95 L1040,175 L1190,115 L1320,185 L1440,130 L1440,380 L0,380 Z"
              fill="url(#farMountainGrad)"
            />

            {/* Snow Caps for Far Peaks */}
            <polygon points="620,80 580,120 660,120" fill="url(#snowGlow)" opacity={isDark ? '0.45' : '0.7'} />
            <polygon points="340,110 305,145 375,145" fill="url(#snowGlow)" opacity={isDark ? '0.4' : '0.6'} />
            <polygon points="890,95 850,135 930,135" fill="url(#snowGlow)" opacity={isDark ? '0.45' : '0.65'} />
            <polygon points="1190,115 1155,148 1225,148" fill="url(#snowGlow)" opacity={isDark ? '0.35' : '0.55'} />

            {/* Midground Mountain Ridge featuring Iconic Fishtail / Machapuchare twin peak */}
            <path
              d="M0,260 L90,200 L180,240 L290,170 L380,230 L490,140 L530,110 L545,130 L570,100 L640,190 L750,230 L850,160 L970,225 L1100,150 L1230,220 L1360,170 L1440,220 L1440,380 L0,380 Z"
              fill="url(#midMountainGrad)"
            />

            {/* Machapuchare (Fishtail Peak) distinctive twin snow crest at ~530-570 */}
            <polygon points="530,110 510,138 545,130" fill="url(#snowGlow)" opacity={isDark ? '0.6' : '0.85'} />
            <polygon points="570,100 545,130 595,140" fill="url(#snowGlow)" opacity={isDark ? '0.65' : '0.9'} />

            {/* Subtle atmospheric mist drift across the base */}
            <rect
              x="0"
              y="270"
              width="1440"
              height="80"
              fill={isDark ? '#07090e' : '#f8fafc'}
              opacity={isDark ? '0.6' : '0.7'}
              filter="url(#mistBlur)"
            />
          </g>
        )}

        {showMandir && (
          <g className="transition-all duration-700">
            {/* Traditional Nepali Pagoda Mandir (Nyatapola/Pashupati inspired silhouette) on the Right Flank */}
            <g transform="translate(1240, 160) scale(0.75)" opacity={isDark ? '0.45' : '0.6'}>
              {/* Gajur (Golden Pinnacle spire) */}
              <circle cx="100" cy="18" r="4" fill={isDark ? '#fbbf24' : '#d97706'} />
              <line x1="100" y1="22" x2="100" y2="40" stroke={isDark ? '#fbbf24' : '#d97706'} strokeWidth="2.5" />
              <polygon points="100,32 94,42 106,42" fill={isDark ? '#f59e0b' : '#b45309'} />

              {/* Tier 1 (Top Pagoda Roof) with traditional curved upward eaves */}
              <path
                d="M100,42 Q85,58 60,65 L140,65 Q115,58 100,42 Z"
                fill="url(#mandirGrad)"
                stroke={isDark ? '#f59e0b' : '#b45309'}
                strokeWidth="1.2"
              />
              <rect x="85" y="65" width="30" height="15" fill={isDark ? '#1e293b' : '#94a3b8'} opacity="0.6" />

              {/* Tier 2 (Middle Pagoda Roof) */}
              <path
                d="M100,75 Q75,94 40,105 L160,105 Q125,94 100,75 Z"
                fill="url(#mandirGrad)"
                stroke={isDark ? '#f59e0b' : '#b45309'}
                strokeWidth="1.2"
              />
              <rect x="75" y="105" width="50" height="20" fill={isDark ? '#1e293b' : '#94a3b8'} opacity="0.6" />

              {/* Tier 3 (Base Pagoda Roof) with sweeping Nepalese eaves */}
              <path
                d="M100,118 Q65,142 20,155 L180,155 Q135,142 100,118 Z"
                fill="url(#mandirGrad)"
                stroke={isDark ? '#f59e0b' : '#b45309'}
                strokeWidth="1.5"
              />

              {/* Temple Sanctum Base Pillars */}
              <rect x="55" y="155" width="90" height="50" fill={isDark ? '#0f172a' : '#64748b'} opacity="0.5" />
              <rect x="85" y="165" width="30" height="40" fill={isDark ? '#07090e' : '#334155'} rx="2" />
            </g>

            {/* Subtle Stupa / Chaitya Silhouette on the Far Left Flank */}
            <g transform="translate(60, 200) scale(0.65)" opacity={isDark ? '0.35' : '0.5'}>
              {/* Spire 13 steps of enlightenment */}
              <polygon points="50,15 45,60 55,60" fill={isDark ? '#fbbf24' : '#b45309'} />
              {/* Harmika (Cube) with Wisdom Eyes subtle accent */}
              <rect x="38" y="60" width="24" height="14" fill={isDark ? '#1e293b' : '#94a3b8'} />
              <circle cx="45" cy="67" r="1.5" fill={isDark ? '#38bdf8' : '#0284c7'} />
              <circle cx="55" cy="67" r="1.5" fill={isDark ? '#38bdf8' : '#0284c7'} />
              {/* Dome (Garbha) */}
              <path d="M20,110 C20,75 80,75 80,110 Z" fill="url(#mandirGrad)" />
              {/* Plinth */}
              <rect x="15" y="110" width="70" height="15" fill={isDark ? '#0f172a' : '#64748b'} opacity="0.5" />
            </g>
          </g>
        )}
      </svg>
    </div>
  );
};
