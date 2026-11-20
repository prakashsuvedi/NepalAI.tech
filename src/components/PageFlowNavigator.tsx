import React from 'react';
import { ArrowLeft, ArrowRight, Grid, Wrench, Sparkles, Briefcase, ShieldCheck, Home, LayoutDashboard, ShoppingBag, TrendingUp } from 'lucide-react';
import { AppPage, ThemeMode, Language } from '../types';

interface PageFlowNavigatorProps {
  currentPage: AppPage;
  onSelectPage: (page: AppPage) => void;
  theme: ThemeMode;
  language: Language;
}

interface PageMeta {
  id: AppPage;
  order: number;
  labelEn: string;
  labelNe: string;
  descEn: string;
  descNe: string;
  icon: React.ElementType;
}

export const PAGES_META: PageMeta[] = [
  {
    id: 'home',
    order: 1,
    labelEn: 'Home',
    labelNe: 'गृहपृष्ठ',
    descEn: 'Platform overview, sovereign pillars & Studio workbench',
    descNe: 'प्लेटफर्म परिचय र स्टुडियो वर्कबेन्च',
    icon: Home,
  },
  {
    id: 'command-center',
    order: 2,
    labelEn: 'Command Center',
    labelNe: 'कमान्ड सेन्टर',
    descEn: 'Real-time NRB telemetry, global search & personal workspace',
    descNe: 'प्रत्यक्ष वित्तीय विजेट, खोज तथा व्यक्तिगत कार्यस्थल',
    icon: LayoutDashboard,
  },
  {
    id: 'trends',
    order: 3,
    labelEn: 'Nepal AI + Trends',
    labelNe: 'नेपाल एआई + ट्रेन्ड्स',
    descEn: 'Live Nepal searches, AI explainers, diaspora & tri-script keywords',
    descNe: 'नेपालका ताजा ट्रेन्ड, एआई व्याख्या, प्रवास र किबोर्ड खोज',
    icon: TrendingUp,
  },
  {
    id: 'directory',
    order: 4,
    labelEn: 'Tools Directory',
    labelNe: 'टुल्स डाइरेक्टरी',
    descEn: '40+ verified AI tools with NPR pricing & Dollar Card guide',
    descNe: '४०+ प्रमाणित एआई टुल्स र भुक्तानी जानकारी',
    icon: Grid,
  },
  {
    id: 'daily',
    order: 5,
    labelEn: 'Daily AI Tools',
    labelNe: 'दैनिक एआई',
    descEn: 'Devanagari OCR, Nepali Voice, Letter Writer & Salary Tax',
    descNe: 'नेपाली ओसीआर, आवाज, पत्र लेखन र कर क्याल्कुलेटर',
    icon: Wrench,
  },
  {
    id: 'free',
    order: 6,
    labelEn: 'Free AI & News',
    labelNe: 'निःशुल्क एआई र समाचार',
    descEn: 'Free APIs without cards, document scanner & live intelligence',
    descNe: 'कार्ड बिनाका निःशुल्क एपीआई र एआई समाचार',
    icon: Sparkles,
  },
  {
    id: 'consulting',
    order: 7,
    labelEn: 'Consulting',
    labelNe: 'परामर्श सेवा',
    descEn: 'Enterprise AI pipelines, architecture & dual NPR/USD billing',
    descNe: 'संस्थागत एआई इन्जिनियरिङ र परामर्श',
    icon: Briefcase,
  },
  {
    id: 'commerce',
    order: 8,
    labelEn: 'NepalAI Commerce',
    labelNe: 'नेपालएआई कमर्स',
    descEn: 'Multi-tenant e-commerce with eSewa, Khalti, Nepal QR & WhatsApp alerts',
    descNe: 'ईसेवा, खल्ती, नेपाल क्युआर र ह्वाट्सएप अर्डर इन्जिन',
    icon: ShoppingBag,
  },
  {
    id: 'compliance',
    order: 9,
    labelEn: 'Compliance & FAQ',
    labelNe: 'नियम तथा मद्दत',
    descEn: 'NRB $500 Dollar Card rules, CIB cyber safety & booking',
    descNe: 'राष्ट्र बैंकका नियम, साइबर सुरक्षा र सम्पर्क',
    icon: ShieldCheck,
  },
];

export const PageFlowNavigator: React.FC<PageFlowNavigatorProps> = ({
  currentPage,
  onSelectPage,
  theme,
  language,
}) => {
  const isDark = theme === 'dark';
  const isNe = language === 'ne';

  const currentIndex = PAGES_META.findIndex((p) => p.id === currentPage);
  const prevPage = currentIndex > 0 ? PAGES_META[currentIndex - 1] : null;
  const nextPage = currentIndex < PAGES_META.length - 1 ? PAGES_META[currentIndex + 1] : null;
  const currentMeta = PAGES_META[currentIndex] || PAGES_META[0];

  const handlePageChange = (pageId: AppPage) => {
    onSelectPage(pageId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav
      className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 transition-colors ${
        isDark ? 'border-white/[0.08]' : 'border-slate-200'
      }`}
      aria-label="Page flow navigation"
    >
      <div
        className={`p-5 sm:p-7 rounded-3xl border shadow-lg ${
          isDark
            ? 'bg-gradient-to-b from-[#090d18] to-[#06080e] border-white/10 shadow-black/40'
            : 'bg-white border-slate-200/90 shadow-slate-100'
        }`}
      >
        {/* Page status header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-500/15">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl border ${
                isDark
                  ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400'
                  : 'border-cyan-300 bg-cyan-50 text-cyan-800'
              }`}
            >
              <currentMeta.icon className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-600 dark:text-cyan-400 font-bold">
                  {isNe
                    ? `खण्ड ${currentMeta.order} / ${PAGES_META.length}`
                    : `Page ${currentMeta.order} of ${PAGES_META.length}`}
                </span>
                <span className="text-slate-400 text-xs">•</span>
                <span
                  className={`text-xs font-semibold ${
                    isDark ? 'text-slate-200' : 'text-slate-800'
                  }`}
                >
                  {isNe ? currentMeta.labelNe : currentMeta.labelEn}
                </span>
              </div>
              <p
                className={`text-sm mt-0.5 ${
                  isDark ? 'text-slate-200' : 'text-slate-700'
                }`}
              >
                {isNe ? currentMeta.descNe : currentMeta.descEn}
              </p>
            </div>
          </div>

          {/* Quick Page Indicator Pills */}
          <div className="flex items-center gap-1.5 overflow-x-hidden flex-wrap">
            {PAGES_META.map((p) => {
              const isActive = p.id === currentPage;
              const Icon = p.icon;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handlePageChange(p.id)}
                  title={isNe ? p.labelNe : p.labelEn}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                    isActive
                      ? isDark
                        ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/50 shadow-xs'
                        : 'bg-cyan-600 text-white shadow-xs'
                      : isDark
                        ? 'text-slate-200 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/10'
                        : 'text-slate-700 hover:text-slate-950 bg-slate-100 hover:bg-slate-200 border border-slate-200/80'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  <span className="hidden md:inline">
                    {isNe ? p.labelNe : p.labelEn}
                  </span>
                  <span className="md:hidden font-mono">{p.order}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Previous & Next Page Navigation Buttons */}
        <div className="flex items-center justify-between gap-4 pt-5">
          {prevPage ? (
            <button
              type="button"
              onClick={() => handlePageChange(prevPage.id)}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                isDark
                  ? 'border-white/15 bg-white/[0.04] text-slate-100 hover:text-white hover:bg-white/[0.08]'
                  : 'border-slate-300 bg-slate-50 text-slate-800 hover:text-slate-950 hover:bg-slate-100'
              }`}
              aria-label={`Go to previous page: ${isNe ? prevPage.labelNe : prevPage.labelEn}`}
            >
              <ArrowLeft className="h-4 w-4 text-cyan-500 dark:text-cyan-300" aria-hidden="true" />
              <div className="text-left">
                <span className={`text-xs block font-mono uppercase ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  {isNe ? 'अघिल्लो खण्ड' : 'Previous Page'}
                </span>
                <span>{isNe ? prevPage.labelNe : prevPage.labelEn}</span>
              </div>
            </button>
          ) : (
            <div />
          )}

          {nextPage ? (
            <button
              type="button"
              onClick={() => handlePageChange(nextPage.id)}
              className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-md ${
                isDark
                  ? 'bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-cyan-500/25'
                  : 'bg-gradient-to-r from-cyan-600 via-sky-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-cyan-600/20'
              }`}
              aria-label={`Go to next page: ${isNe ? nextPage.labelNe : nextPage.labelEn}`}
            >
              <div className="text-right">
                <span className="text-xs block font-mono text-cyan-100 uppercase">
                  {isNe ? 'अर्को खण्ड' : 'Next Page'}
                </span>
                <span>{isNe ? nextPage.labelNe : nextPage.labelEn}</span>
              </div>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handlePageChange('home')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                isDark
                  ? 'border-cyan-500/40 bg-cyan-500/15 text-cyan-200 hover:bg-cyan-500/25'
                  : 'border-cyan-300 bg-cyan-50 text-cyan-800 hover:bg-cyan-100'
              }`}
            >
              <Home className="h-4 w-4" />
              <span>{isNe ? 'गृहपृष्ठमा फर्कनुहोस्' : 'Return to Home'}</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};
