import React from 'react';
import { ArrowUpRight, Video, Mic, MessageSquare, Film, QrCode } from 'lucide-react';
import { ThemeMode, Language } from '../types';
import { TRANSLATIONS } from '../data/translations';

interface StudioBannerProps {
  theme?: ThemeMode;
  language?: Language;
}

export const StudioBanner: React.FC<StudioBannerProps> = ({ theme = 'dark', language = 'en' }) => {
  const isDark = theme === 'dark';
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const isNepali = language === 'ne';

  const bentoTools = [
    {
      titleEn: 'Sora-2 Video Studio',
      titleNe: 'सोरा-२ भिडियो स्टुडियो',
      descEn: 'Cinematic video generation with prompt-guided motion and camera control.',
      descNe: 'प्रम्प्ट मार्फत सिनेमाटिक भिडियो उत्पादन र क्यामेरा नियन्त्रण।',
      icon: Video,
      pricing: isNepali ? 'नि:शुल्क परीक्षण + टप-अप' : 'Free Trial + Top-up',
    },
    {
      titleEn: 'HamroAI Assistant',
      titleNe: 'हाम्रो एआई सहायक',
      descEn: 'Bilingual Devanagari and English LLM grounded in Nepal financial directives.',
      descNe: 'नेपालको कानुनी र वित्तीय नियम बुझ्ने द्विभाषिक भाषा मोडल।',
      icon: MessageSquare,
      pricing: isNepali ? 'नि:शुल्क र प्रो टियर' : 'Free & Pro Tiers',
    },
    {
      titleEn: 'Devanagari Neural Voice',
      titleNe: 'देवनागरी न्युरल आवाज',
      descEn: 'Natural 24kHz Nepali speech synthesis and voice generation.',
      descNe: 'प्राकृतिक नेपाली लवज र शुद्ध उच्चारणसहितको टेक्स्ट-टु-स्पीच।',
      icon: Mic,
      pricing: isNepali ? 'रू ०.१५ / शब्द' : 'NPR 0.15 / word',
    },
    {
      titleEn: 'Timeline Video Editor',
      titleNe: 'टाइमलाइन भिडियो सम्पादक',
      descEn: 'Assemble clips, neural voiceovers, and Devanagari subtitles directly in-browser.',
      descNe: 'भिडियो, अडियो र देवनागरी क्याप्सन जोडेर ब्राउजरमै छिटो रेन्डर।',
      icon: Film,
      pricing: isNepali ? 'नि:शुल्क ब्राउजर टुल' : 'Free Browser Tool',
    },
  ];

  return (
    <section
      className={`py-16 md:py-20 border-t transition-colors duration-300 ${
        isDark ? 'border-white/10 bg-[#06080e]' : 'border-slate-200 bg-[#f8fafc]'
      }`}
      id="studio-bento"
      aria-label="NepalAI Studio Platform Showcase"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-200 dark:border-white/10 mb-8">
          <div>
            <div className="text-xs font-mono font-semibold tracking-wider text-emerald-600 dark:text-emerald-400 mb-2 uppercase">
              {isNepali ? 'मल्टिमोडल स्टुडियो' : 'Multimodal Studio'}
            </div>
            <h2 className={`text-2xl sm:text-3xl font-extrabold tracking-tight font-display ${
              isDark ? 'text-white' : 'text-slate-950'
            }`}>
              {t.studioBanner.title}
            </h2>
            <p className={`mt-2 text-sm max-w-xl ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            }`}>
              {t.studioBanner.subtitle}
            </p>
          </div>

          <div className="shrink-0">
            <a
              href="https://studio.nepalai.tech"
              target="_blank"
              rel="noopener noreferrer"
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-2 cursor-pointer ${
                isDark ? 'bg-white text-slate-950 hover:bg-slate-200' : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs'
              }`}
            >
              <span>{t.studioBanner.openStudio}</span>
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* 4 Clean Bento Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {bentoTools.map((tool, idx) => {
            const IconComp = tool.icon;
            return (
              <a
                key={idx}
                href="https://studio.nepalai.tech"
                target="_blank"
                rel="noopener noreferrer"
                className={`rounded-2xl border p-5 transition-all block cursor-pointer ${
                  isDark
                    ? 'border-white/10 bg-white/[0.02] hover:border-emerald-500/40 hover:bg-white/[0.04]'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2.5 rounded-xl ${
                    isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-700'
                  }`}>
                    <IconComp className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-medium">
                    {tool.pricing}
                  </span>
                </div>

                <h3 className={`text-sm font-bold font-display ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {isNepali ? tool.titleNe : tool.titleEn}
                </h3>

                <p className={`mt-1.5 text-xs leading-relaxed ${
                  isDark ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  {isNepali ? tool.descNe : tool.descEn}
                </p>
              </a>
            );
          })}
        </div>

        {/* Bottom Payment Support Notice */}
        <div className="mt-8 pt-4 border-t border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <QrCode className="h-4 w-4 text-emerald-500 shrink-0" aria-hidden="true" />
            <span>
              {isNepali
                ? 'FonePay QR, eSewa, Khalti र डलर कार्डबाट सीधै भुक्तानी उपलब्ध (रू / $ दुवै)।'
                : 'Direct billing available via FonePay QR, eSewa, Khalti, and Dollar Cards (NPR & USD).'}
            </span>
          </div>
          <span className="font-mono text-[11px]">studio.nepalai.tech</span>
        </div>

      </div>
    </section>
  );
};
