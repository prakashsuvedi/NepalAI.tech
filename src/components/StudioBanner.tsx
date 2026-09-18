import React from 'react';
import { Sparkles, ArrowUpRight, Video, Mic, MessageSquare, Film, QrCode } from 'lucide-react';
import { ThemeMode, Language } from '../types';
import { TRANSLATIONS } from '../data/translations';

interface StudioBannerProps {
  theme?: ThemeMode;
  language?: Language;
}

export const StudioBanner: React.FC<StudioBannerProps> = ({ theme = 'dark', language = 'en' }) => {
  const isDark = theme === 'dark';
  const t = TRANSLATIONS[language];

  return (
    <section
      className="py-14 md:py-18 relative transition-colors duration-300"
      id="studio-bento"
      aria-label="NepalAI Studio Platform Showcase"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Whole Showcase Container as a pristine, interactive background link */}
        <div
          className={`relative rounded-3xl border p-6 sm:p-10 backdrop-blur-2xl shadow-2xl overflow-hidden group transition-all duration-300 ${
            isDark
              ? 'border-white/[0.1] bg-gradient-to-b from-white/[0.04] to-[#080a10]'
              : 'border-slate-200/90 bg-gradient-to-b from-white to-slate-50/90 shadow-lg'
          }`}
        >
          {/* Subtle ambient light glow */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />

          {/* Top Bar */}
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-slate-500/20">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
                <span className="text-[11px] font-mono font-bold tracking-widest text-emerald-500 uppercase">
                  {t.studioBanner.badge}
                </span>
                <span className={isDark ? 'text-slate-600' : 'text-slate-300'} aria-hidden="true">•</span>
                <span className={`text-xs font-['Noto_Sans_Devanagari'] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {language === 'ne' ? 'नेपालको आफ्नै एआई वर्कबेन्च' : "Nepal's Native AI Workbench"}
                </span>
              </div>

              <h2 className={`text-2xl sm:text-4xl font-bold tracking-tight font-['Space_Grotesk'] ${
                isDark ? 'text-white' : 'text-slate-950'
              }`}>
                {t.studioBanner.title}
              </h2>

              <p className={`mt-2 text-xs sm:text-sm max-w-2xl font-['Noto_Sans_Devanagari'] leading-relaxed ${
                isDark ? 'text-slate-300' : 'text-slate-600'
              }`}>
                {t.studioBanner.subtitle}
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-3 shrink-0">
              <a
                href="https://studio.nepalai.tech"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Open NepalAI Studio Workbench (opens in a new tab)"
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs sm:text-sm font-bold text-white transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/30 hover:scale-[1.02] active:scale-95 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-400"
              >
                <Sparkles className="h-4 w-4 text-amber-300" aria-hidden="true" />
                <span className={language === 'ne' ? "font-['Noto_Sans_Devanagari']" : ''}>
                  {t.studioBanner.openStudio} ↗
                </span>
              </a>
            </div>
          </div>

          {/* 4 Clean Pillars (Clickable into studio) */}
          <div className="relative z-10 mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* 1. Sora-2 Video Studio */}
            <a
              href="https://studio.nepalai.tech"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open Sora-2 Video Studio tool (opens in new tab)"
              className={`rounded-2xl border p-5 transition-all group/item block focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                isDark
                  ? 'border-white/[0.08] bg-black/40 hover:border-indigo-500/50 hover:bg-black/60'
                  : 'border-slate-200 bg-white hover:border-indigo-400 hover:shadow-md'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500">
                  <Video className="h-4 w-4" aria-hidden="true" />
                </div>
                <ArrowUpRight className="h-3.5 w-3.5 text-slate-400 group-hover/item:text-indigo-500 transition-colors" aria-hidden="true" />
              </div>
              <h3 className={`text-sm font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-950'} ${language === 'ne' ? "font-['Noto_Sans_Devanagari']" : ''}`}>
                {t.studioBanner.features.videoTitle}
              </h3>
              <p className={`text-xs font-['Noto_Sans_Devanagari'] leading-relaxed ${
                isDark ? 'text-slate-400' : 'text-slate-600'
              }`}>
                {t.studioBanner.features.videoDesc}
              </p>
              <div className="mt-4 pt-3 border-t border-slate-500/15 flex items-center justify-between text-[11px] font-mono">
                <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Continuity Motion</span>
                <span className="text-indigo-500 font-bold">1080p HD</span>
              </div>
            </a>

            {/* 2. HamroAI Assistant */}
            <a
              href="https://studio.nepalai.tech"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open HamroAI Assistant tool (opens in new tab)"
              className={`rounded-2xl border p-5 transition-all group/item block focus:outline-hidden focus-visible:ring-2 focus-visible:ring-teal-500 ${
                isDark
                  ? 'border-white/[0.08] bg-black/40 hover:border-teal-500/50 hover:bg-black/60'
                  : 'border-slate-200 bg-white hover:border-teal-400 hover:shadow-md'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-500">
                  <MessageSquare className="h-4 w-4" aria-hidden="true" />
                </div>
                <ArrowUpRight className="h-3.5 w-3.5 text-slate-400 group-hover/item:text-teal-500 transition-colors" aria-hidden="true" />
              </div>
              <h3 className={`text-sm font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-950'} ${language === 'ne' ? "font-['Noto_Sans_Devanagari']" : ''}`}>
                {t.studioBanner.features.chatTitle}
              </h3>
              <p className={`text-xs font-['Noto_Sans_Devanagari'] leading-relaxed ${
                isDark ? 'text-slate-400' : 'text-slate-600'
              }`}>
                {t.studioBanner.features.chatDesc}
              </p>
              <div className="mt-4 pt-3 border-t border-slate-500/15 flex items-center justify-between text-[11px] font-mono">
                <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Nepali Vernacular</span>
                <span className="text-teal-500 font-bold">Instant Export</span>
              </div>
            </a>

            {/* 3. Devanagari Voice Studio */}
            <a
              href="https://studio.nepalai.tech"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open Neural Voice Studio (opens in new tab)"
              className={`rounded-2xl border p-5 transition-all group/item block focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                isDark
                  ? 'border-white/[0.08] bg-black/40 hover:border-emerald-500/50 hover:bg-black/60'
                  : 'border-slate-200 bg-white hover:border-emerald-400 hover:shadow-md'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
                  <Mic className="h-4 w-4" aria-hidden="true" />
                </div>
                <ArrowUpRight className="h-3.5 w-3.5 text-slate-400 group-hover/item:text-emerald-500 transition-colors" aria-hidden="true" />
              </div>
              <h3 className={`text-sm font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-950'} ${language === 'ne' ? "font-['Noto_Sans_Devanagari']" : ''}`}>
                {t.studioBanner.features.voiceTitle}
              </h3>
              <p className={`text-xs font-['Noto_Sans_Devanagari'] leading-relaxed ${
                isDark ? 'text-slate-400' : 'text-slate-600'
              }`}>
                {t.studioBanner.features.voiceDesc}
              </p>
              <div className="mt-4 pt-3 border-t border-slate-500/15 flex items-center justify-between text-[11px] font-mono">
                <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Devanagari TTS</span>
                <span className="text-emerald-500 font-bold">24kHz Audio</span>
              </div>
            </a>

            {/* 4. Timeline Video Editor */}
            <a
              href="https://studio.nepalai.tech"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open Timeline Video Editor (opens in new tab)"
              className={`rounded-2xl border p-5 transition-all group/item block focus:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500 ${
                isDark
                  ? 'border-white/[0.08] bg-black/40 hover:border-amber-500/50 hover:bg-black/60'
                  : 'border-slate-200 bg-white hover:border-amber-400 hover:shadow-md'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
                  <Film className="h-4 w-4" aria-hidden="true" />
                </div>
                <ArrowUpRight className="h-3.5 w-3.5 text-slate-400 group-hover/item:text-amber-500 transition-colors" aria-hidden="true" />
              </div>
              <h3 className={`text-sm font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-950'} ${language === 'ne' ? "font-['Noto_Sans_Devanagari']" : ''}`}>
                {language === 'ne' ? 'टाइमलाइन भिडियो सम्पादक' : 'Timeline Video Editor'}
              </h3>
              <p className={`text-xs font-['Noto_Sans_Devanagari'] leading-relaxed ${
                isDark ? 'text-slate-400' : 'text-slate-600'
              }`}>
                {language === 'ne'
                  ? 'भिडियो क्लिप्स, अडियो भ्वाइसओभर र देवनागरी क्याप्सन जोडेर ब्राउजरमै FFmpeg मार्फत रेन्डर।'
                  : 'Assemble video clips, neural voiceovers, and Devanagari subtitles directly in-browser via FFmpeg.'}
              </p>
              <div className="mt-4 pt-3 border-t border-slate-500/15 flex items-center justify-between text-[11px] font-mono">
                <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>FFmpeg Cloud</span>
                <span className="text-amber-500 font-bold">Auto Subtitles</span>
              </div>
            </a>

          </div>

          {/* Bottom Billing Ribbon */}
          <div className="relative z-10 mt-6 pt-5 border-t border-slate-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className={`flex items-center gap-2 font-['Noto_Sans_Devanagari'] ${
              isDark ? 'text-slate-300' : 'text-slate-700'
            }`}>
              <QrCode className="h-4 w-4 text-emerald-500" aria-hidden="true" />
              <span>
                {language === 'ne'
                  ? 'नेपालका सबै बैंक (FonePay) र eSewa/Khalti वालेटबाट सीधै टप-अप उपलब्ध।'
                  : 'Direct top-up available via all Nepali bank apps (FonePay QR), eSewa, and Khalti.'}
              </span>
            </div>

            <a
              href="https://studio.nepalai.tech"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Explore All NepalAI Studio features (opens in new tab)"
              className="text-xs font-bold text-indigo-500 hover:text-indigo-600 flex items-center gap-1 group-hover:underline focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-400 rounded px-1 py-0.5"
            >
              <span className={language === 'ne' ? "font-['Noto_Sans_Devanagari']" : ''}>
                {t.studioBanner.exploreAll}
              </span>
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </div>

        </div>

      </div>
    </section>
  );
};
