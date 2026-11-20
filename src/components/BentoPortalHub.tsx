import React from 'react';
import {
  Grid,
  Wrench,
  Sparkles,
  Briefcase,
  ShieldCheck,
  ArrowRight,
  LayoutDashboard,
  ShoppingBag,
  TrendingUp,
  CalendarRange,
} from 'lucide-react';
import { AppPage, ThemeMode, Language } from '../types';

interface BentoPortalHubProps {
  onSelectPage: (page: AppPage) => void;
  onOpenTrendsRoute?: (path: string) => void;
  theme: ThemeMode;
  language: Language;
}

export const BentoPortalHub: React.FC<BentoPortalHubProps> = ({
  onSelectPage,
  onOpenTrendsRoute,
  theme,
  language,
}) => {
  const isDark = theme === 'dark';
  const isNe = language === 'ne';

  const handleNavigate = (page: AppPage) => {
    onSelectPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const secondaryPortals: Array<{
    num: string;
    id: AppPage;
    titleEn: string;
    titleNe: string;
    descEn: string;
    descNe: string;
    metaEn: string;
    metaNe: string;
    icon: React.ElementType;
  }> = [
    {
      num: '03',
      id: 'daily',
      titleEn: 'Daily AI Utilities',
      titleNe: 'दैनिक एआई सेवाहरू',
      descEn: '14 sovereign utilities: EV road tax, NEPSE CGT, Section 95Ka IT export, bullion tax, ward letters & Devanagari OCR.',
      descNe: '१४ दैनिक सेवा: EV कर, NEPSE CGT, दफा ९५क IT निर्यात, सुनचाँदी, वडा निवेदन र कागजात OCR।',
      metaEn: '14 Tools · Free A4 PDF',
      metaNe: '१४ टुल्स · निःशुल्क PDF',
      icon: Wrench,
    },
    {
      num: '04',
      id: 'commerce',
      titleEn: 'NepalAI Commerce',
      titleNe: 'नेपालएआई कमर्स',
      descEn: 'Multi-tenant Nepali online storefronts wired with eSewa, Khalti, FonePay QR & instant WhatsApp order checkout.',
      descNe: 'ईसेवा, खल्ती, फोनपे QR र सिधै ह्वाट्सएप अर्डर सुविधासहितको अनलाइन पसल प्लेटफर्म।',
      metaEn: 'eSewa · Khalti · WhatsApp',
      metaNe: 'ईसेवा · खल्ती · ह्वाट्सएप',
      icon: ShoppingBag,
    },
    {
      num: '05',
      id: 'directory',
      titleEn: 'Tools Directory',
      titleNe: 'टुल्स डाइरेक्टरी',
      descEn: '40+ global AI tools benchmarked for Nepal with exact NPR conversion, NRB spread, 2% DST & cardless workarounds.',
      descNe: '४०+ वैश्विक एआई टुल्सको नेपाल मूल्य, राष्ट्र बैंक दर र स्थानीय भुक्तानी विकल्प तुलना।',
      metaEn: '40+ Audited · Stack ROI',
      metaNe: '४०+ प्रमाणित · ROI हिसाब',
      icon: Grid,
    },
    {
      num: '06',
      id: 'free',
      titleEn: 'Free AI & News',
      titleNe: 'निःशुल्क एआई र समाचार',
      descEn: 'Zero-dollar-card AI models, developer API tiers, and curated Nepal sovereign AI engineering dispatches.',
      descNe: 'डलर कार्ड बिना चल्ने निःशुल्क एआई मोडलहरू, API र नेपाल प्रविधि बुलेटिन।',
      metaEn: 'Card-Free Tier · Bulletins',
      metaNe: 'बिना कार्ड · ताजा बुलेटिन',
      icon: Sparkles,
    },
    {
      num: '07',
      id: 'consulting',
      titleEn: 'Enterprise Advisory',
      titleNe: 'संस्थागत परामर्श',
      descEn: 'Custom Nepali RAG agents, Devanagari OCR pipelines, and VAT-compliant executive team sprints.',
      descNe: 'संस्थाका लागि सुरक्षित नेपाली RAG एजेन्ट, OCR पाइपलाइन र कार्यशाला तालिम।',
      metaEn: 'NPR & USD · Full IP',
      metaNe: 'रुपैयाँ र डलर · पूर्ण स्वामित्व',
      icon: Briefcase,
    },
    {
      num: '08',
      id: 'compliance',
      titleEn: 'Compliance & Help',
      titleNe: 'नियम तथा मद्दत',
      descEn: 'NRB $500 prepaid dollar card rules, Section 95Ka legal guidelines, FAQs & Kathmandu scoping support.',
      descNe: 'राष्ट्र बैंक $५०० कार्ड नियम, दफा ९५क कर मार्गदर्शन र प्रत्यक्ष सहायता।',
      metaEn: 'NRB · IRD · Support',
      metaNe: 'राष्ट्र बैंक · IRD · सहायता',
      icon: ShieldCheck,
    },
  ];

  return (
    <section
      className={`py-12 sm:py-16 md:py-20 border-t transition-colors relative overflow-hidden ${
        isDark ? 'border-slate-800/80 bg-[#070B14]' : 'border-slate-200/90 bg-white'
      }`}
      aria-label="Platform Workspaces Bento Hub"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Left-Aligned Editorial Masthead */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-8 mb-8 border-b border-slate-200 dark:border-slate-800">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-[11px] font-mono font-bold tracking-[0.16em] uppercase mb-2">
              <span className="text-rose-700 dark:text-rose-400">03</span>
              <span aria-hidden="true" className="text-slate-400 dark:text-slate-600">/</span>
              <span className="text-cyan-700 dark:text-cyan-400">
                {isNe ? 'कार्यस्थान र मोड्युलहरू' : 'PLATFORM WORKSPACES'}
              </span>
            </div>
            <h2
              className={`text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight font-display ${
                isDark ? 'text-white' : 'text-slate-950'
              }`}
            >
              {isNe ? (
                <>
                  सबै <span className="text-cyan-700 dark:text-cyan-400">सार्वभौम</span> सेवाहरू
                </>
              ) : (
                <>
                  Explore the{' '}
                  <span className="font-serif-editorial italic font-normal text-rose-700 dark:text-rose-400">
                    Ecosystem
                  </span>
                </>
              )}
            </h2>
          </div>

          <p
            className={`text-sm sm:text-base max-w-md ${
              isDark ? 'text-slate-300' : 'text-slate-600'
            }`}
          >
            {isNe
              ? 'नेपालको कर, विनिमय, ट्रेन्ड र व्यापारका लागि तयार ८ एकीकृत कार्यस्थान।'
              : 'Eight unified workspaces built around Nepal’s financial, linguistic, and civic workflows.'}
          </p>
        </div>

        {/* Asymmetric 12-Column Editorial Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* Marquee Card 01: Command Center (col-span-6) */}
          <article
            className={`lg:col-span-6 rounded-2xl border p-6 sm:p-7 flex flex-col justify-between transition-colors ${
              isDark
                ? 'bg-[#0B1220] border-slate-800 hover:border-cyan-500/60'
                : 'bg-[#FAF9F6] border-slate-200/90 hover:border-cyan-600/70'
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2.5 rounded-xl border shrink-0 ${
                      isDark
                        ? 'border-cyan-500/35 bg-cyan-500/10 text-cyan-300'
                        : 'border-cyan-200 bg-white text-cyan-800'
                    }`}
                  >
                    <LayoutDashboard className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <div className="text-[11px] font-mono font-bold text-rose-700 dark:text-rose-400">
                      01 · {isNe ? 'मुख्य कमान्ड' : 'UNIFIED TERMINAL'}
                    </div>
                    <h3 className={`text-xl font-extrabold font-display ${isDark ? 'text-white' : 'text-slate-950'}`}>
                      {isNe ? 'कमान्ड सेन्टर' : 'Command Center'}
                    </h3>
                  </div>
                </div>
                <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                  {isNe ? 'प्रत्यक्ष डेस्क' : 'Live Ops'}
                </span>
              </div>

              <p className={`mt-4 text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                {isNe
                  ? 'राष्ट्र बैंक विनिमय दर, आ.व. २०८१/८२ कर हिसाब, जग्गा क्षेत्रफल र हाम्रो एआई खोजी एउटै कार्यपानामा।'
                  : 'Live NRB forex rates, FY 2081/82 salary & TDS checks, Ropani/Bigha land unit conversion, and HamroAI voice/chat telemetry.'}
              </p>

              {/* Bespoke Architectural SVG Topographic & Telemetry Graphic */}
              <div
                className={`mt-5 rounded-xl border p-3.5 overflow-hidden ${
                  isDark ? 'bg-[#070B14] border-slate-800' : 'bg-white border-slate-200/90'
                }`}
                aria-hidden="true"
              >
                <svg viewBox="0 0 420 96" className="w-full h-20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="cmdContourFill" x1="0" y1="0" x2="420" y2="96" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#0891B2" stopOpacity="0.22" />
                      <stop offset="65%" stopColor="#BE123C" stopOpacity="0.10" />
                      <stop offset="100%" stopColor="#0891B2" stopOpacity="0.02" />
                    </linearGradient>
                  </defs>
                  {/* Subtle baseline grid */}
                  <line x1="0" y1="24" x2="420" y2="24" stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeDasharray="3 4" />
                  <line x1="0" y1="54" x2="420" y2="54" stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeDasharray="3 4" />
                  <line x1="0" y1="84" x2="420" y2="84" stroke="currentColor" className="text-slate-200 dark:text-slate-800" />
                  {/* Himalayan ridgeline */}
                  <path
                    d="M0 84 L48 64 L96 70 L146 38 L194 52 L248 18 L296 42 L352 26 L420 62 L420 84 Z"
                    fill="url(#cmdContourFill)"
                  />
                  <path
                    d="M0 84 L48 64 L96 70 L146 38 L194 52 L248 18 L296 42 L352 26 L420 62"
                    stroke="#0891B2"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Peak markers */}
                  <circle cx="146" cy="38" r="3" fill="#0891B2" />
                  <circle cx="248" cy="18" r="3.5" fill="#BE123C" />
                  <circle cx="352" cy="26" r="3" fill="#0891B2" />
                  {/* Monospace labels */}
                  <text x="12" y="16" className="fill-slate-500 dark:fill-slate-400" fontSize="9" fontFamily="JetBrains Mono, monospace">
                    NRB FOREX · IRD 81/82 · LAND · HAMRO AI
                  </text>
                </svg>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
              <span className="text-xs font-mono text-slate-600 dark:text-slate-400">
                {isNe ? 'विनिमय · कर · जग्गा · एआई' : 'Forex · Tax · Land · HamroAI'}
              </span>
              <button
                type="button"
                onClick={() => handleNavigate('command-center')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-700 dark:text-cyan-300 hover:underline cursor-pointer whitespace-nowrap"
              >
                <span>{isNe ? 'कमान्ड सेन्टर खोल्नुहोस्' : 'Open Command Center'}</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          </article>

          {/* Marquee Card 02: Nepal AI + Trends & Seasonal Map (col-span-6) */}
          <article
            className={`lg:col-span-6 rounded-2xl border p-6 sm:p-7 flex flex-col justify-between transition-colors ${
              isDark
                ? 'bg-[#0B1220] border-slate-800 hover:border-rose-500/60'
                : 'bg-[#FAF9F6] border-slate-200/90 hover:border-rose-600/70'
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2.5 rounded-xl border shrink-0 ${
                      isDark
                        ? 'border-rose-500/35 bg-rose-500/10 text-rose-300'
                        : 'border-rose-200 bg-white text-rose-700'
                    }`}
                  >
                    <TrendingUp className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <div className="text-[11px] font-mono font-bold text-rose-700 dark:text-rose-400">
                      02 · {isNe ? 'खोज र मौसमी नक्सा' : 'SEARCH INTELLIGENCE'}
                    </div>
                    <h3 className={`text-xl font-extrabold font-display ${isDark ? 'text-white' : 'text-slate-950'}`}>
                      {isNe ? 'नेपाल एआई + ट्रेन्ड्स' : 'Nepal AI + Trends'}
                    </h3>
                  </div>
                </div>
                <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                  {isNe ? 'D3.js + WhatsApp अलर्ट' : 'D3.js · WhatsApp'}
                </span>
              </div>

              <p className={`mt-4 text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                {isNe
                  ? 'प्रत्यक्ष खोज वेग चार्ट, दशैं/तिहार तथा SEE मौसमी नक्सा, प्रवास ट्रेन्ड र ह्वाट्सएप/इमेल अलर्ट।'
                  : 'D3.js velocity charts, Seasonal Festival & SEE Exam Map, diaspora analytics, PDF reports, and instant SMTP + WhatsApp velocity alerts.'}
              </p>

              {/* Bespoke Architectural SVG Seasonal & Velocity Curve Graphic */}
              <div
                className={`mt-5 rounded-xl border p-3.5 overflow-hidden ${
                  isDark ? 'bg-[#070B14] border-slate-800' : 'bg-white border-slate-200/90'
                }`}
                aria-hidden="true"
              >
                <svg viewBox="0 0 420 96" className="w-full h-20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="seasonalCurveFill" x1="0" y1="0" x2="0" y2="96" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#BE123C" stopOpacity="0.24" />
                      <stop offset="100%" stopColor="#BE123C" stopOpacity="0.01" />
                    </linearGradient>
                  </defs>
                  {/* Seasonal cycle markers */}
                  <line x1="90" y1="12" x2="90" y2="84" stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeDasharray="2 3" />
                  <line x1="210" y1="12" x2="210" y2="84" stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeDasharray="2 3" />
                  <line x1="330" y1="12" x2="330" y2="84" stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeDasharray="2 3" />
                  <path
                    d="M0 74 C38 70, 56 30, 90 32 C125 34, 158 66, 210 22 C258 48, 290 60, 330 20 C364 38, 392 56, 420 48 L420 84 L0 84 Z"
                    fill="url(#seasonalCurveFill)"
                  />
                  <path
                    d="M0 74 C38 70, 56 30, 90 32 C125 34, 158 66, 210 22 C258 48, 290 60, 330 20 C364 38, 392 56, 420 48"
                    stroke="#BE123C"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <circle cx="90" cy="32" r="3" fill="#0891B2" />
                  <circle cx="210" cy="22" r="3.5" fill="#BE123C" />
                  <circle cx="330" cy="20" r="3.5" fill="#BE123C" />
                  <text x="72" y="93" className="fill-slate-500 dark:fill-slate-400" fontSize="8.5" fontFamily="JetBrains Mono, monospace">
                    SEE EXAMS
                  </text>
                  <text x="182" y="93" className="fill-slate-500 dark:fill-slate-400" fontSize="8.5" fontFamily="JetBrains Mono, monospace">
                    DASHAIN / TIHAR
                  </text>
                  <text x="304" y="93" className="fill-slate-500 dark:fill-slate-400" fontSize="8.5" fontFamily="JetBrains Mono, monospace">
                    TREK SEASON
                  </text>
                </svg>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => (onOpenTrendsRoute ? onOpenTrendsRoute('/trending/seasonal') : handleNavigate('trends'))}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-700 dark:text-rose-400 hover:underline cursor-pointer whitespace-nowrap"
              >
                <CalendarRange className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{isNe ? 'मौसमी ट्रेन्ड्स नक्सा' : 'Seasonal Trends Map'}</span>
              </button>
              <button
                type="button"
                onClick={() => handleNavigate('trends')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-700 dark:text-cyan-300 hover:underline cursor-pointer whitespace-nowrap"
              >
                <span>{isNe ? 'ट्रेन्ड्स हब खोल्नुहोस्' : 'Open Trends Hub'}</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          </article>

          {/* Remaining 6 Structured Editorial Cards (col-span-4 on lg) */}
          {secondaryPortals.map((portal) => {
            const Icon = portal.icon;
            return (
              <article
                key={portal.id}
                className={`lg:col-span-4 rounded-2xl border p-5 sm:p-6 flex flex-col justify-between transition-colors ${
                  isDark
                    ? 'bg-[#0B1220] border-slate-800 hover:border-cyan-500/60'
                    : 'bg-white border-slate-200/90 hover:border-cyan-600/70'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-3.5">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`p-2 rounded-xl border shrink-0 ${
                          isDark
                            ? 'border-slate-700 bg-white/[0.04] text-cyan-300'
                            : 'border-slate-200 bg-[#FAF9F6] text-cyan-800'
                        }`}
                      >
                        <Icon className="h-4 w-4" aria-hidden="true" />
                      </div>
                      <h3
                        className={`text-base sm:text-lg font-bold font-display truncate ${
                          isDark ? 'text-white' : 'text-slate-950'
                        }`}
                      >
                        {isNe ? portal.titleNe : portal.titleEn}
                      </h3>
                    </div>
                    <span className="font-mono text-xs font-bold text-rose-700 dark:text-rose-400 shrink-0 tabular-nums">
                      {portal.num}
                    </span>
                  </div>

                  <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    {isNe ? portal.descNe : portal.descEn}
                  </p>
                </div>

                <div className="mt-5 pt-3.5 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-2 text-xs">
                  <span className="font-mono text-slate-500 dark:text-slate-400 truncate">
                    {isNe ? portal.metaNe : portal.metaEn}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleNavigate(portal.id)}
                    className="font-bold text-cyan-700 dark:text-cyan-300 hover:underline inline-flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0"
                    aria-label={`Open ${portal.titleEn}`}
                  >
                    <span>{isNe ? 'खोल्नुहोस्' : 'Open'}</span>
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
              </article>
            );
          })}

        </div>
      </div>
    </section>
  );
};
