import React from 'react';
import {
  Cpu,
  CreditCard,
  Lock,
  Server,
  ArrowUpRight,
  CalendarCheck,
} from 'lucide-react';
import { ThemeMode, Language } from '../types';

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
  const isNepali = language === 'ne';

  const pillars = [
    {
      num: '01',
      icon: Lock,
      title: isNepali ? 'आ.व. २०८१/८२ कर र IRD इन्जिन' : 'IRD FY 2081/82 Tax Engine',
      desc: isNepali
        ? 'एकल/दम्पती स्ल्याब, १% SSF छुट, र सफ्टवेयर निर्यात दफा ९५क (५% / १% अन्तिम TDS) गणना।'
        : 'Single/married slabs, 1% SSF exemptions, NEPSE CGT, and Section 95Ka (5% / 1% IT export TDS) slips.',
      metric: 'Finance Act 81/82',
    },
    {
      num: '02',
      icon: Server,
      title: isNepali ? 'राष्ट्र बैंक विनिमय र $५०० अडिट' : 'NRB Forex & $500 Card Audit',
      desc: isNepali
        ? 'आधिकारिक राष्ट्र बैंक विनिमय दर, ३% बैंक स्प्रेड, २% DST र वार्षिक $५०० डलर कार्ड कोटा हिसाब।'
        : 'Live NRB exchange feeds paired with 3% bank spread, 2% DST, and $500 prepaid dollar card tracking.',
      metric: 'NRB Dir. 12/2080',
    },
    {
      num: '03',
      icon: CreditCard,
      title: isNepali ? 'ईसेवा, खल्ती र ह्वाट्सएप ब्रिज' : 'eSewa, Khalti & WhatsApp Bridge',
      desc: isNepali
        ? 'नेपाली रुपैयाँमा सिधै बिलिङ, अनलाइन पसल अर्डर र ह्वाट्सएप बिजनेस वेबहुक अलर्ट रिले।'
        : 'Direct NPR settlement via eSewa, Khalti & FonePay QR plus real-time WhatsApp Business webhook alerts.',
      metric: 'EMVCo QR · NPR',
    },
    {
      num: '04',
      icon: Cpu,
      title: isNepali ? 'देवनागरी र रोमन नेपाली एआई' : 'Devanagari & Romanized AI',
      desc: isNepali
        ? 'नागरिकता, लालपुर्जा, हस्तलिखित बिल स्क्यान (OCR), प्रीति कन्भर्टर र ४ क्षेत्रीय नेपाली स्वर।'
        : 'Nagarikta, Lalpurja & handwritten Khata OCR, Preeti converter, and 4 regional Nepali voice cadences.',
      metric: 'NLP · OCR · TTS',
    },
  ];

  return (
    <section
      id="about"
      className={`py-12 sm:py-16 md:py-20 border-t transition-colors duration-300 ${
        isDark ? 'border-slate-800/80 bg-[#060911]' : 'border-slate-200/90 bg-[#FAF9F6]'
      }`}
      aria-labelledby="about-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Left-Aligned Editorial Header + Single Enterprise Action */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 mb-8 border-b border-slate-200 dark:border-slate-800">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-[11px] font-mono font-bold tracking-[0.16em] uppercase mb-2">
              <span className="text-rose-700 dark:text-rose-400">04</span>
              <span aria-hidden="true" className="text-slate-400 dark:text-slate-600">/</span>
              <span className="text-cyan-700 dark:text-cyan-400">
                {isNepali ? 'सार्वभौम इन्जिनियरिङ प्रमाण' : 'SOVEREIGN ARCHITECTURE'}
              </span>
            </div>

            <h2
              id="about-heading"
              className={`text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight font-display ${
                isDark ? 'text-white' : 'text-slate-950'
              }`}
            >
              {isNepali ? (
                <>नेपालको नियम र भाषाका लागि निर्मित</>
              ) : (
                <>
                  Built for Nepal’s{' '}
                  <span className="font-serif-editorial italic font-normal text-rose-700 dark:text-rose-400">
                    Regulatory
                  </span>{' '}
                  &amp; Linguistic Reality
                </>
              )}
            </h2>

            <p
              className={`mt-2.5 text-sm sm:text-base leading-relaxed max-w-xl ${
                isDark ? 'text-slate-300' : 'text-slate-600'
              }`}
            >
              {isNepali
                ? 'सामान्य टेम्प्लेट होइन — आन्तरिक राजस्व विभाग, नेपाल राष्ट्र बैंक र स्थानीय भुक्तानी मापदण्ड अनुसार प्रमाणित प्रविधि।'
                : 'Zero generic wrappers — grounded in Nepal statutory tax slabs, official central bank telemetry, and local payment infrastructure.'}
            </p>
          </div>

          <div className="shrink-0">
            <button
              type="button"
              onClick={() =>
                onOpenConsultation(
                  isNepali
                    ? 'सार्वभौम संस्थागत एआई परामर्श'
                    : 'Sovereign Enterprise AI Architecture Sprint'
                )
              }
              className="inline-flex items-center gap-2 rounded-lg bg-slate-950 hover:bg-slate-800 dark:bg-cyan-500 dark:hover:bg-cyan-400 text-white dark:text-slate-950 px-5 py-3 text-xs sm:text-sm font-bold transition-colors cursor-pointer min-h-[44px] whitespace-nowrap"
            >
              <CalendarCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{isNepali ? 'संस्थागत परामर्श बुक गर्नुहोस्' : 'Schedule Discovery Sprint'}</span>
            </button>
          </div>
        </div>

        {/* 4 Concrete Sovereign Proof Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-8">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.num}
                className={`p-5 sm:p-6 rounded-2xl border flex flex-col justify-between transition-colors ${
                  isDark
                    ? 'border-slate-800 bg-[#0B1220] hover:border-cyan-500/50'
                    : 'border-slate-200/90 bg-white hover:border-cyan-600/60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`p-2 rounded-xl border ${
                        isDark
                          ? 'border-slate-700 bg-white/[0.04] text-cyan-300'
                          : 'border-slate-200 bg-[#FAF9F6] text-cyan-800'
                      }`}
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </div>
                    <span className="text-xs font-mono font-bold text-rose-700 dark:text-rose-400 tabular-nums">
                      {pillar.num}
                    </span>
                  </div>

                  <h3
                    className={`text-base font-bold font-display mb-2 ${
                      isDark ? 'text-white' : 'text-slate-950'
                    }`}
                  >
                    {pillar.title}
                  </h3>

                  <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    {pillar.desc}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-200/80 dark:border-slate-800 text-[11px] font-mono font-semibold text-cyan-700 dark:text-cyan-400">
                  {pillar.metric}
                </div>
              </div>
            );
          })}
        </div>

        {/* Crisp Editorial Provenance Band */}
        <div
          className={`rounded-2xl border p-5 sm:p-6 transition-colors ${
            isDark
              ? 'border-slate-800 bg-[#0B1220]'
              : 'border-slate-200/90 bg-white'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-[11px] font-mono font-bold uppercase tracking-[0.14em] text-cyan-700 dark:text-cyan-400">
                {isNepali ? 'इन्जिनियरिङ र नेतृत्व' : 'Engineering & Leadership'}
              </div>
              <div className={`text-sm sm:text-base font-bold font-display ${isDark ? 'text-white' : 'text-slate-950'}`}>
                {isNepali
                  ? 'स्क्यामस्पाइक सोलुसन्स प्रा. लि. · प्रकाश सुवेदी'
                  : 'Scamspike Solutions Pvt. Ltd. · Prakash Suvedi'}
              </div>
              <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                {isNepali
                  ? 'काठमाडौं, नेपाल · साइबर सुरक्षा र स्थानीय एआई इन्जिनियरिङ'
                  : 'Kathmandu, Nepal · Cybersecurity & Sovereign AI Engineering'}
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
              <a
                href="https://prakashsuvedi.com.np"
                target="_blank"
                rel="noopener noreferrer"
                className={`px-3.5 py-2 rounded-lg border text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer min-h-[38px] whitespace-nowrap ${
                  isDark
                    ? 'border-slate-700 bg-white/[0.04] text-slate-100 hover:text-white hover:border-cyan-400'
                    : 'border-slate-200 bg-[#FAF9F6] text-slate-900 hover:bg-white hover:border-cyan-600'
                }`}
              >
                <span>prakashsuvedi.com.np</span>
                <ArrowUpRight className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" aria-hidden="true" />
              </a>

              <a
                href="https://scamspike.com"
                target="_blank"
                rel="noopener noreferrer"
                className={`px-3.5 py-2 rounded-lg border text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer min-h-[38px] whitespace-nowrap ${
                  isDark
                    ? 'border-slate-700 bg-white/[0.04] text-slate-100 hover:text-white hover:border-cyan-400'
                    : 'border-slate-200 bg-[#FAF9F6] text-slate-900 hover:bg-white hover:border-cyan-600'
                }`}
              >
                <span>scamspike.com</span>
                <ArrowUpRight className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
