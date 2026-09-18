import React from 'react';
import { 
  Cpu, 
  Globe2, 
  Building2, 
  Sparkles, 
  CheckCircle2, 
  Server, 
  Lock, 
  CreditCard,
  ArrowUpRight
} from 'lucide-react';
import { ThemeMode, Language } from '../types';
import { TRANSLATIONS } from '../data/translations';

interface AboutSectionProps {
  theme: ThemeMode;
  language: Language;
  onOpenConsultation: (serviceTitle?: string) => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({
  theme,
  language,
  onOpenConsultation,
}) => {
  const isDark = theme === 'dark';
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const isNepali = language === 'ne';

  const pillars = [
    {
      icon: Cpu,
      title: t.about.pillar1Title,
      description: t.about.pillar1Desc,
      tag: isNepali ? 'देवनागरी मोडल' : 'Indigenous LLMs',
    },
    {
      icon: CreditCard,
      title: t.about.pillar2Title,
      description: t.about.pillar2Desc,
      tag: isNepali ? 'eSewa / Khalti' : 'Local Billing',
    },
    {
      icon: Lock,
      title: t.about.pillar3Title,
      description: t.about.pillar3Desc,
      tag: isNepali ? 'NRB IT निर्देशिका' : 'Data Residency',
    },
    {
      icon: Server,
      title: t.about.pillar4Title,
      description: t.about.pillar4Desc,
      tag: isNepali ? 'इन्टरप्राइज डेलिभरी' : 'Sprint Delivery',
    },
  ];

  const techBadges = [
    { label: 'Devanagari OCR v3.2', sub: '>98.4% Acc' },
    { label: 'Nepali Dialect Neural TTS', sub: 'Low Latency' },
    { label: 'Air-Gapped LLM Deployments', sub: 'H100/L40S' },
    { label: 'NRB IT Audit Compliance', sub: 'Tier-3 Local DC' },
    { label: 'Bilingual Legal & KYC RAG', sub: 'Zero Retention' },
    { label: 'FonePay / eSewa API Bridge', sub: 'NPR Invoicing' },
  ];

  return (
    <section
      id="about"
      className={`relative border-t py-20 transition-colors duration-300 ${
        isDark ? 'border-white/[0.08] bg-[#070910]' : 'border-slate-200 bg-slate-50/60'
      }`}
      aria-labelledby="about-heading"
    >
      {/* Background subtle atmospheric light */}
      <div 
        className="pointer-events-none absolute inset-0 overflow-hidden opacity-30" 
        aria-hidden="true"
      >
        <div className="absolute top-1/3 left-1/4 -translate-y-1/2 -translate-x-1/2 w-[550px] h-[350px] bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-1/4 w-[450px] h-[300px] bg-indigo-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center space-y-3 mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold shadow-xs">
            <Globe2 className="h-3.5 w-3.5 text-emerald-500" aria-hidden="true" />
            <span
              className={`${
                isDark ? 'text-emerald-400' : 'text-emerald-700'
              } ${isNepali ? "font-['Noto_Sans_Devanagari']" : ''}`}
            >
              {t.about.badge}
            </span>
          </div>

          <h2
            id="about-heading"
            className={`text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight ${
              isDark ? 'text-white' : 'text-slate-900'
            } ${isNepali ? "font-['Noto_Sans_Devanagari']" : "font-['Space_Grotesk']"}`}
          >
            {t.about.title}
          </h2>

          <p
            className={`text-sm sm:text-base leading-relaxed ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            } ${isNepali ? "font-['Noto_Sans_Devanagari']" : ''}`}
          >
            {t.about.subtitle}
          </p>
        </div>

        {/* Mission & Vision Bento Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          
          {/* Mission Card */}
          <div
            className={`rounded-2xl border p-6 sm:p-8 transition-all relative overflow-hidden group ${
              isDark
                ? 'border-white/[0.08] bg-[#0c0f1d]/80 text-slate-100 hover:border-emerald-500/40'
                : 'border-slate-200 bg-white text-slate-800 hover:border-emerald-500/50 shadow-xs'
            }`}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <Sparkles className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h3
                  className={`text-lg font-bold ${
                    isDark ? 'text-white' : 'text-slate-900'
                  } ${isNepali ? "font-['Noto_Sans_Devanagari']" : "font-['Space_Grotesk']"}`}
                >
                  {t.about.missionHeading}
                </h3>
                <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-500 font-semibold">
                  {isNepali ? 'स्वायत्त प्राविधिक आत्मनिर्भरता' : 'Indigenous Sovereignty'}
                </span>
              </div>
            </div>

            <p
              className={`text-xs sm:text-sm leading-relaxed mb-4 ${
                isDark ? 'text-slate-300' : 'text-slate-600'
              } ${isNepali ? "font-['Noto_Sans_Devanagari']" : ''}`}
            >
              {t.about.missionBody}
            </p>

            <ul className="space-y-2 text-xs border-t border-slate-500/15 pt-4">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" aria-hidden="true" />
                <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>
                  {isNepali
                    ? 'नेपाली, नेवारी र मैथिली भाषाहरूका लागि विशेष टोकनाइजेसन'
                    : 'Dialect-aware tokenizers for Devanagari scripts'}
                </span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" aria-hidden="true" />
                <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>
                  {isNepali
                    ? 'स्थानीय नेपाली डेटा सेन्टरहरूमा शून्य-डेटा-लिकेज होस्टिङ'
                    : 'Zero-data-leakage hosting on sovereign Nepali data centers'}
                </span>
              </li>
            </ul>
          </div>

          {/* Vision / Transformation Card */}
          <div
            className={`rounded-2xl border p-6 sm:p-8 transition-all relative overflow-hidden group ${
              isDark
                ? 'border-white/[0.08] bg-[#0c0f1d]/80 text-slate-100 hover:border-indigo-500/40'
                : 'border-slate-200 bg-white text-slate-800 hover:border-indigo-500/50 shadow-xs'
            }`}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                <Building2 className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h3
                  className={`text-lg font-bold ${
                    isDark ? 'text-white' : 'text-slate-900'
                  } ${isNepali ? "font-['Noto_Sans_Devanagari']" : "font-['Space_Grotesk']"}`}
                >
                  {t.about.visionHeading}
                </h3>
                <span className="text-[11px] font-mono uppercase tracking-wider text-indigo-400 font-semibold">
                  {isNepali ? 'इन्टरप्राइज एआई रूपान्तरण' : 'Enterprise Scale Execution'}
                </span>
              </div>
            </div>

            <p
              className={`text-xs sm:text-sm leading-relaxed mb-4 ${
                isDark ? 'text-slate-300' : 'text-slate-600'
              } ${isNepali ? "font-['Noto_Sans_Devanagari']" : ''}`}
            >
              {t.about.visionBody}
            </p>

            <ul className="space-y-2 text-xs border-t border-slate-500/15 pt-4">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-indigo-400 shrink-0" aria-hidden="true" />
                <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>
                  {isNepali
                    ? 'वाणिज्य बैंक र वित्तीय संस्थाहरूका लागि NRB मापदण्ड अनुकूल'
                    : 'NRB IT guideline aligned architectures for commercial banks'}
                </span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-indigo-400 shrink-0" aria-hidden="true" />
                <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>
                  {isNepali
                    ? 'हप्तौंभित्र कार्यशील प्रोटोटाइप र भौतिक इन्जिनियरिङ सहयोग'
                    : 'Rapid 2-week MVP sprints with on-site deployment in Nepal'}
                </span>
              </li>
            </ul>
          </div>

        </div>

        {/* Four Core Engineering Pillars */}
        <div className="mb-14">
          <div className="text-center mb-8">
            <h3
              className={`text-lg sm:text-xl font-bold ${
                isDark ? 'text-white' : 'text-slate-900'
              } ${isNepali ? "font-['Noto_Sans_Devanagari']" : "font-['Space_Grotesk']"}`}
            >
              {t.about.pillarsTitle}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {pillars.map((pillar, idx) => {
              const IconComp = pillar.icon;
              return (
                <div
                  key={idx}
                  className={`rounded-xl border p-5 transition-all flex flex-col justify-between group ${
                    isDark
                      ? 'border-white/[0.08] bg-[#0c0e18] hover:border-white/20 hover:bg-[#101322]'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80 shadow-xs'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:scale-105 transition-transform">
                        <IconComp className="h-4.5 w-4.5" aria-hidden="true" />
                      </div>
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/10 text-slate-400">
                        {pillar.tag}
                      </span>
                    </div>

                    <h4
                      className={`text-sm font-bold leading-snug ${
                        isDark ? 'text-white' : 'text-slate-900'
                      } ${isNepali ? "font-['Noto_Sans_Devanagari']" : ''}`}
                    >
                      {pillar.title}
                    </h4>

                    <p
                      className={`text-xs leading-relaxed ${
                        isDark ? 'text-slate-400' : 'text-slate-600'
                      } ${isNepali ? "font-['Noto_Sans_Devanagari']" : ''}`}
                    >
                      {pillar.description}
                    </p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-500/10 flex items-center justify-between text-[11px] text-emerald-500 font-medium">
                    <span>{isNepali ? 'विस्तृत विवरण' : 'Explore Pillar'}</span>
                    <ArrowUpRight className="h-3 w-3 opacity-70 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" aria-hidden="true" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Impact Statistics Banner */}
        <div
          className={`rounded-2xl border p-6 sm:p-8 mb-12 backdrop-blur-md ${
            isDark
              ? 'border-emerald-500/20 bg-emerald-950/20 text-slate-100'
              : 'border-emerald-200 bg-emerald-50/70 text-slate-800'
          }`}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            
            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">
                {t.about.stats.stat1Val}
              </div>
              <div className={`text-xs text-slate-400 ${isNepali ? "font-['Noto_Sans_Devanagari']" : ''}`}>
                {t.about.stats.stat1Label}
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-extrabold text-indigo-400 font-mono">
                {t.about.stats.stat2Val}
              </div>
              <div className={`text-xs text-slate-400 ${isNepali ? "font-['Noto_Sans_Devanagari']" : ''}`}>
                {t.about.stats.stat2Label}
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-mono">
                {t.about.stats.stat3Val}
              </div>
              <div className={`text-xs text-slate-400 ${isNepali ? "font-['Noto_Sans_Devanagari']" : ''}`}>
                {t.about.stats.stat3Label}
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-extrabold text-cyan-400 font-mono">
                {t.about.stats.stat4Val}
              </div>
              <div className={`text-xs text-slate-400 ${isNepali ? "font-['Noto_Sans_Devanagari']" : ''}`}>
                {t.about.stats.stat4Label}
              </div>
            </div>

          </div>
        </div>

        {/* Technical Capabilities Badges */}
        <div className="text-center space-y-4">
          <h4 className="text-xs font-mono uppercase tracking-widest text-slate-400">
            {t.about.techStackHeading}
          </h4>

          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 max-w-4xl mx-auto">
            {techBadges.map((badge, idx) => (
              <div
                key={idx}
                className={`inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-medium ${
                  isDark
                    ? 'border-white/10 bg-white/[0.03] text-slate-300'
                    : 'border-slate-200 bg-white text-slate-700 shadow-2xs'
                }`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
                <span>{badge.label}</span>
                <span className="font-mono text-[10px] opacity-60">({badge.sub})</span>
              </div>
            ))}
          </div>

          <div className="pt-4">
            <button
              type="button"
              onClick={() => onOpenConsultation('Enterprise Sovereign AI Strategy')}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 px-5 py-2.5 text-xs font-bold text-slate-950 transition-all shadow-md focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500"
              aria-label="Schedule a sovereign AI scoping session"
            >
              <span className={isNepali ? "font-['Noto_Sans_Devanagari']" : ''}>
                {isNepali ? 'हाम्रा एआई वास्तुकारसँग छलफल गर्नुहोस्' : 'Discuss Sovereign AI Architecture with Us'}
              </span>
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};
