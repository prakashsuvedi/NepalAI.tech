import React from 'react';
import { Sparkles, ArrowUpRight, Video, Mic, MessageSquare, Film, QrCode } from 'lucide-react';
import { ThemeMode, Language } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { motion } from 'motion/react';

interface StudioBannerProps {
  theme?: ThemeMode;
  language?: Language;
}

export const StudioBanner: React.FC<StudioBannerProps> = ({ theme = 'dark', language = 'en' }) => {
  const isDark = theme === 'dark';
  const t = TRANSLATIONS[language];
  const isNepali = language === 'ne';

  const bentoTools = [
    {
      titleEn: 'Sora-2 Video Studio',
      titleNe: 'सोरा-२ भिडियो स्टुडियो',
      descEn: 'Ultra high-fidelity cinematic video generation with prompt-guided motion, 4K upscaling, and camera panning.',
      descNe: 'आधुनिक प्रम्प्ट मार्फत सिनेमाटिक भिडियो उत्पादन, क्यामेरा नियन्त्रण र ४K अपस्केलिङ।',
      icon: Video,
      color: 'indigo',
      badge: '4K HDR',
      sub: 'Motion Continuity',
      pricing: isNepali ? 'नि:शुल्क क्रेडिट + रू ५०० टप-अप' : 'Free Trial + NPR 500 / $4 Top-up',
      cursor: 'Sora-2',
    },
    {
      titleEn: 'HamroAI Vernacular Chat',
      titleNe: 'हाम्रो एआई (नेपाली च्याट)',
      descEn: 'Nepal Rastra Bank guideline-grounded LLM conversing seamlessly in Nepali, Devanagari, and English.',
      descNe: 'नेपालको कानुनी र वित्तीय नियम बुझ्ने द्विभाषिक नेपाली र अंग्रेजी बृहत् भाषा मोडल (LLM)।',
      icon: MessageSquare,
      color: 'teal',
      badge: 'NRB Grounded',
      sub: 'Devanagari Native',
      pricing: isNepali ? 'नि:शुल्क / Free Tier' : 'Free + Pro NPR 1,200 / $9',
      cursor: 'HamroAI',
    },
    {
      titleEn: 'Devanagari Neural Voice',
      titleNe: 'देवनागरी न्युरल भ्वाइस स्टुडियो',
      descEn: 'Zero-shot voice cloning and text-to-speech engine capturing authentic Nepali, Newari, and Maithili cadence.',
      descNe: 'नेपाली लवज र उच्चारणसहितको अत्याधुनिक टेक्स्ट-टु-स्पीच र भ्वाइस क्लोनिङ इन्जिन।',
      icon: Mic,
      color: 'emerald',
      badge: '24kHz Studio',
      sub: 'Natural Prosody',
      pricing: isNepali ? 'रू ०.१५ प्रति शब्द / $0.001/wd' : 'NPR 0.15/word ($0.001/wd)',
      cursor: 'Voice',
    },
    {
      titleEn: 'Timeline Video Editor',
      titleNe: 'टाइमलाइन भिडियो सम्पादक',
      descEn: 'Assemble video clips, neural voiceovers, and Devanagari subtitles directly in-browser with WebAssembly FFmpeg.',
      descNe: 'भिडियो क्लिप्स, अडियो र देवनागरी क्याप्सन जोडेर ब्राउजरमै FFmpeg मार्फत हाई-स्पीड रेन्डर।',
      icon: Film,
      color: 'amber',
      badge: 'FFmpeg Cloud',
      sub: 'Auto Subtitles',
      pricing: isNepali ? 'नि:शुल्क ब्राउजर टुल' : 'Free In-Browser Tool',
      cursor: 'Editor',
    },
  ];

  return (
    <section
      className="py-14 md:py-20 relative transition-colors duration-500"
      id="studio-bento"
      aria-label="NepalAI Studio Platform Showcase"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Whole Showcase Container as a pristine, Apple-style Bento master card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
          className={`relative rounded-3xl border p-6 sm:p-10 backdrop-blur-3xl shadow-2xl overflow-hidden transition-all duration-300 ${
            isDark
              ? 'border-white/10 bg-gradient-to-b from-white/[0.04] via-black/60 to-[#06080d]'
              : 'border-slate-300/90 bg-gradient-to-b from-white to-slate-50 shadow-lg'
          }`}
        >
          {/* Ambient Lighting */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none" aria-hidden="true" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-600/15 rounded-full blur-[120px] pointer-events-none" aria-hidden="true" />

          {/* Top Bar Header */}
          <div className={`relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b ${
            isDark ? 'border-white/10' : 'border-slate-200'
          }`}>
            <div>
              <div className="flex items-center gap-2 mb-2.5">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
                <span className="text-[11px] font-mono font-bold tracking-widest text-emerald-600 dark:text-emerald-400 uppercase">
                  {t.studioBanner.badge}
                </span>
                <span className={isDark ? 'text-slate-600' : 'text-slate-300'} aria-hidden="true">•</span>
                <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {isNepali ? 'नेपालको आफ्नै एआई वर्कबेन्च • Nepal AI Workbench' : "Nepal's Native AI Workbench (studio.nepalai.tech)"}
                </span>
              </div>

              <h2 className={`text-2xl sm:text-4xl font-extrabold tracking-tight font-display ${
                isDark ? 'text-white' : 'text-slate-950'
              }`}>
                {t.studioBanner.title}
              </h2>

              <p className={`mt-2 text-xs sm:text-sm max-w-2xl leading-relaxed ${
                isDark ? 'text-slate-300' : 'text-slate-600'
              }`}>
                {t.studioBanner.subtitle}
              </p>

              {/* Dual Language & Pricing Highlights */}
              <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs font-mono">
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                  🇳🇵 eSewa, Khalti & FonePay (रू NPR)
                </span>
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-700 dark:text-indigo-300">
                  🌐 Dollar Card & Stripe ($ USD)
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-3 shrink-0">
              <a
                href="https://studio.nepalai.tech"
                target="_blank"
                rel="noopener noreferrer"
                data-cursor="Studio"
                aria-label="Open NepalAI Studio Workbench (opens in a new tab)"
                className={`px-6 py-3 rounded-full text-xs sm:text-sm font-bold transition-all flex items-center gap-2 shadow-md hover:scale-105 cursor-pointer ${
                  isDark ? 'bg-white text-slate-950 hover:bg-slate-200' : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/20'
                }`}
              >
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                <span className={isNepali ? "font-['Noto_Sans_Devanagari']" : ''}>
                  {t.studioBanner.openStudio}
                </span>
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* 4 Clean Bento Pillars with Staggered Framer Motion Animation */}
          <div className="relative z-10 mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {bentoTools.map((tool, idx) => {
              const IconComp = tool.icon;
              return (
                <motion.a
                  key={idx}
                  href="https://studio.nepalai.tech"
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.5, delay: 0.08 * idx }}
                  whileHover={{ y: -3 }}
                  data-cursor={tool.cursor}
                  aria-label={`Open ${tool.titleEn} tool in NepalAI Studio`}
                  className={`rounded-2xl border p-5 transition-all group/item block cursor-pointer ${
                    isDark
                      ? 'border-white/10 bg-white/[0.02] hover:border-emerald-500/50 hover:bg-white/[0.05]'
                      : 'border-slate-200 bg-white hover:border-emerald-500 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl group-hover/item:scale-110 transition-transform ${
                      tool.color === 'indigo'
                        ? 'bg-indigo-500/10 border border-indigo-500/30 text-indigo-500'
                        : tool.color === 'teal'
                        ? 'bg-teal-500/10 border border-teal-500/30 text-teal-600'
                        : tool.color === 'emerald'
                        ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-600'
                        : 'bg-amber-500/10 border border-amber-500/30 text-amber-600'
                    }`}>
                      <IconComp className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold">
                      {tool.badge}
                    </span>
                  </div>

                  <h3 className={`text-sm font-bold font-display ${isDark ? 'text-white' : 'text-slate-950'}`}>
                    {isNepali ? tool.titleNe : tool.titleEn}
                  </h3>
                  <div className={`text-[11px] font-mono mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {isNepali ? tool.titleEn : tool.titleNe}
                  </div>

                  <p className={`text-xs leading-relaxed ${
                    isDark ? 'text-slate-300' : 'text-slate-600'
                  }`}>
                    {isNepali ? tool.descNe : tool.descEn}
                  </p>

                  <div className={`mt-4 pt-3 border-t flex items-center justify-between text-[11px] font-mono ${
                    isDark ? 'border-white/10' : 'border-slate-200'
                  }`}>
                    <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>{tool.sub}</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">{tool.pricing}</span>
                  </div>
                </motion.a>
              );
            })}
          </div>

          {/* Bottom Billing Ribbon */}
          <div className={`relative z-10 mt-8 pt-5 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
            isDark ? 'border-white/10' : 'border-slate-200'
          }`}>
            <div className={`flex items-center gap-2 font-['Mukta'] ${
              isDark ? 'text-slate-300' : 'text-slate-700'
            }`}>
              <QrCode className="h-4 w-4 text-emerald-500 shrink-0" aria-hidden="true" />
              <span>
                {isNepali
                  ? 'नेपालका सबै बैंक (FonePay QR), eSewa, Khalti र डलर कार्डबाट सीधै टप-अप उपलब्ध (रू / $ दुवै)।'
                  : 'Direct top-up available via all Nepali bank apps (FonePay QR), eSewa, Khalti, and Dollar Cards (NPR रू & USD $).'}
              </span>
            </div>

            <a
              href="https://studio.nepalai.tech"
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="Open"
              aria-label="Explore All NepalAI Studio features (opens in new tab)"
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer shrink-0"
            >
              <span className={isNepali ? "font-['Noto_Sans_Devanagari']" : ''}>
                {t.studioBanner.exploreAll} (रू & $)
              </span>
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </div>

        </motion.div>

      </div>
    </section>
  );
};
