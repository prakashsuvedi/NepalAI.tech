import React, { useState, useMemo } from 'react';
import { 
  HelpCircle, 
  ChevronDown, 
  Search, 
  CreditCard, 
  Briefcase, 
  ShieldCheck, 
  Sparkles, 
  ArrowUpRight, 
  X, 
  Wallet
} from 'lucide-react';
import { ThemeMode, Language, FAQCategory } from '../types';
import { FAQ_ITEMS } from '../data/faqData';
import { TRANSLATIONS } from '../data/translations';

interface FAQSectionProps {
  theme: ThemeMode;
  language: Language;
  onOpenConsultation: (serviceTitle?: string) => void;
  onScrollToContact?: () => void;
}

export const FAQSection: React.FC<FAQSectionProps> = ({
  theme,
  language,
  onOpenConsultation,
  onScrollToContact,
}) => {
  const isDark = theme === 'dark';
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const isNepali = language === 'ne';

  const [selectedCategory, setSelectedCategory] = useState<FAQCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [openIds, setOpenIds] = useState<string[]>(['faq-esewa-khalti-support', 'faq-consulting-process']);

  const categories: { id: FAQCategory; labelEn: string; labelNe: string; icon: any }[] = [
    { id: 'All', labelEn: 'All Questions', labelNe: 'सबै प्रश्नहरू', icon: HelpCircle },
    { id: 'Payments & Wallets', labelEn: 'eSewa, Khalti & Dollar Card', labelNe: 'ईसेवा, खल्ती र डलर कार्ड', icon: Wallet },
    { id: 'AI Consulting', labelEn: 'Enterprise Consulting & Sprints', labelNe: 'इन्टरप्राइज परामर्श र स्प्रिन्ट', icon: Briefcase },
    { id: 'Sovereign AI & Studio', labelEn: 'NepalAI Studio & Devanagari', labelNe: 'नेपाल एआई स्टुडियो र देवनागरी', icon: Sparkles },
    { id: 'Privacy & Compliance', labelEn: 'NRB Compliance & Privacy', labelNe: 'राष्ट्र बैंक निर्देशिका र गोपनीयता', icon: ShieldCheck },
  ];

  const toggleAccordion = (id: string) => {
    setOpenIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const filteredFaqs = useMemo(() => {
    return FAQ_ITEMS.filter((item) => {
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      
      const q = isNepali ? item.questionNe : item.questionEn;
      const a = isNepali ? item.answerNe : item.answerEn;
      const query = searchQuery.toLowerCase().trim();

      const matchesSearch =
        !query ||
        q.toLowerCase().includes(query) ||
        a.toLowerCase().includes(query) ||
        item.tags?.some((tag) => tag.toLowerCase().includes(query)) ||
        item.category.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery, isNepali]);

  return (
    <section
      id="faq"
      className={`relative border-t py-20 transition-colors duration-300 ${
        isDark ? 'border-white/[0.08] bg-[#06080e]' : 'border-slate-200 bg-white'
      }`}
      aria-labelledby="faq-section-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center space-y-3 mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold shadow-xs">
            <HelpCircle className="h-3.5 w-3.5 text-emerald-500" aria-hidden="true" />
            <span
              className={`${
                isDark ? 'text-emerald-400' : 'text-emerald-700'
              } ${isNepali ? "font-['Noto_Sans_Devanagari']" : ''}`}
            >
              {t.faq.badge}
            </span>
          </div>

          <h2
            id="faq-section-heading"
            className={`text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight font-display ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
          >
            {t.faq.title}
          </h2>

          <p
            className={`text-sm sm:text-base leading-relaxed ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            }`}
          >
            {t.faq.subtitle}
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="max-w-4xl mx-auto mb-10 space-y-4">
          
          {/* Search Box */}
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
              <Search className="h-4 w-4 text-slate-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              id="faq-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.faq.searchPlaceholder}
              aria-label={t.faq.searchPlaceholder}
              className={`w-full rounded-xl border py-3 pl-10 pr-10 text-xs sm:text-sm transition-all focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                isDark
                  ? 'border-white/10 bg-[#0d101d] text-white placeholder-slate-500 focus:border-emerald-500/50'
                  : 'border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:bg-white shadow-2xs'
              } ${isNepali ? "font-['Noto_Sans_Devanagari']" : ''}`}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-white"
                aria-label="Clear search input"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div 
            className="flex flex-wrap items-center gap-2" 
            role="tablist" 
            aria-label="FAQ Categories"
          >
            {categories.map((cat) => {
              const IconComp = cat.icon;
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  role="tab"
                  aria-selected={isSelected}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                    isSelected
                      ? isDark
                        ? 'border-emerald-500/60 bg-emerald-500/20 text-emerald-300 shadow-xs'
                        : 'border-emerald-500 bg-emerald-50 text-emerald-800 shadow-xs'
                      : isDark
                        ? 'border-white/[0.08] bg-white/[0.02] text-slate-400 hover:border-white/20 hover:text-white'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900'
                  } ${isNepali ? "font-['Noto_Sans_Devanagari']" : ''}`}
                >
                  <IconComp className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span>{isNepali ? cat.labelNe : cat.labelEn}</span>
                </button>
              );
            })}
          </div>

        </div>

        {/* Two Educational Callout Cards for Fast Context */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto mb-10">
          
          {/* Card 1: Payment Workaround */}
          <div
            className={`rounded-xl border p-4.5 flex items-start gap-3.5 transition-all ${
              isDark
                ? 'border-indigo-500/20 bg-indigo-950/20 text-slate-200'
                : 'border-indigo-200 bg-indigo-50/70 text-slate-800'
            }`}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400 shrink-0">
              <CreditCard className="h-4 w-4" aria-hidden="true" />
            </div>
            <div className="space-y-1 text-xs">
              <div className="font-bold flex items-center gap-1.5 text-indigo-300">
                <span className={isNepali ? "font-['Noto_Sans_Devanagari']" : ''}>
                  {t.faq.paymentGuideCardTitle}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-200">
                  Quick Guide
                </span>
              </div>
              <p className={`text-slate-400 leading-relaxed ${isNepali ? "font-['Noto_Sans_Devanagari']" : ''}`}>
                {t.faq.paymentGuideCardDesc}
              </p>
              <a
                href="#tools-directory"
                className="inline-flex items-center gap-1 text-indigo-400 hover:underline pt-1 font-semibold"
              >
                <span>{isNepali ? 'भुक्तानी फिल्टर हेर्नुहोस्' : 'Browse payment filters in directory'}</span>
                <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* Card 2: Consulting Scopes */}
          <div
            className={`rounded-xl border p-4.5 flex items-start gap-3.5 transition-all ${
              isDark
                ? 'border-emerald-500/20 bg-emerald-950/20 text-slate-200'
                : 'border-emerald-200 bg-emerald-50/70 text-slate-800'
            }`}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0">
              <Briefcase className="h-4 w-4" aria-hidden="true" />
            </div>
            <div className="space-y-1 text-xs">
              <div className="font-bold flex items-center gap-1.5 text-emerald-400">
                <span className={isNepali ? "font-['Noto_Sans_Devanagari']" : ''}>
                  {t.faq.consultingGuideCardTitle}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300">
                  Enterprise
                </span>
              </div>
              <p className={`text-slate-400 leading-relaxed ${isNepali ? "font-['Noto_Sans_Devanagari']" : ''}`}>
                {t.faq.consultingGuideCardDesc}
              </p>
              <button
                type="button"
                onClick={() => onOpenConsultation('Enterprise AI Advisory Scoping')}
                className="inline-flex items-center gap-1 text-emerald-400 hover:underline pt-1 font-semibold"
              >
                <span>{isNepali ? 'परामर्श स्प्रिन्ट तालिका मिलाउनुहोस्' : 'Book a 30-min scoping call'}</span>
                <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
              </button>
            </div>
          </div>

        </div>

        {/* Accordion FAQ List */}
        <div className="max-w-4xl mx-auto space-y-3">
          {filteredFaqs.length === 0 ? (
            <div
              className={`text-center py-12 rounded-2xl border ${
                isDark ? 'border-white/10 bg-[#0c0e18]' : 'border-slate-200 bg-slate-50'
              }`}
            >
              <HelpCircle className="h-8 w-8 text-slate-500 mx-auto mb-2" aria-hidden="true" />
              <p className={`text-sm text-slate-400 ${isNepali ? "font-['Noto_Sans_Devanagari']" : ''}`}>
                {t.faq.noResults}
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
                className="mt-3 text-xs text-emerald-500 hover:underline font-semibold"
              >
                {t.faq.clearSearch}
              </button>
            </div>
          ) : (
            filteredFaqs.map((item, index) => {
              const isOpen = openIds.includes(item.id);
              const q = isNepali ? item.questionNe : item.questionEn;
              const a = isNepali ? item.answerNe : item.answerEn;
              const questionId = `faq-q-${item.id}`;
              const answerId = `faq-a-${item.id}`;

              return (
                <div
                  key={item.id}
                  className={`rounded-2xl border transition-all overflow-hidden ${
                    isOpen
                      ? isDark
                        ? 'border-emerald-500/40 bg-[#0d101e] shadow-md shadow-emerald-950/20'
                        : 'border-emerald-400/80 bg-white shadow-xs'
                      : isDark
                        ? 'border-white/[0.08] bg-[#0c0e18] hover:border-white/20'
                        : 'border-slate-200 bg-white hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  <button
                    type="button"
                    id={questionId}
                    aria-expanded={isOpen}
                    aria-controls={answerId}
                    onClick={() => toggleAccordion(item.id)}
                    className="w-full text-left p-4 sm:p-5 flex items-start justify-between gap-4 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 transition-colors"
                  >
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-mono font-semibold text-emerald-500">
                          0{index + 1}
                        </span>
                        {item.badge && (
                          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold">
                            {item.badge}
                          </span>
                        )}
                        <span className="text-[10px] font-mono text-slate-500">
                          {item.category}
                        </span>
                      </div>

                      <h3
                        className={`text-sm sm:text-base font-bold transition-colors ${
                          isOpen
                            ? isDark
                              ? 'text-white'
                              : 'text-slate-950'
                            : isDark
                              ? 'text-slate-200'
                              : 'text-slate-800'
                        } ${isNepali ? "font-['Noto_Sans_Devanagari']" : ''}`}
                      >
                        {q}
                      </h3>
                    </div>

                    <div
                      className={`flex h-7 w-7 items-center justify-center rounded-lg border shrink-0 transition-transform duration-200 ${
                        isOpen
                          ? 'rotate-180 bg-emerald-500 text-slate-950 border-emerald-400'
                          : isDark
                            ? 'border-white/10 bg-white/[0.04] text-slate-400'
                            : 'border-slate-200 bg-slate-100 text-slate-600'
                      }`}
                      aria-hidden="true"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </div>
                  </button>

                  {isOpen && (
                    <div
                      id={answerId}
                      role="region"
                      aria-labelledby={questionId}
                      className={`px-4 pb-5 sm:px-5 sm:pb-6 pt-1 border-t transition-colors ${
                        isDark ? 'border-white/[0.06] text-slate-300' : 'border-slate-100 text-slate-600'
                      }`}
                    >
                      <p
                        className={`text-xs sm:text-sm leading-relaxed ${
                          isNepali ? "font-['Noto_Sans_Devanagari']" : ''
                        }`}
                      >
                        {a}
                      </p>

                      {item.tags && item.tags.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-3 border-t border-slate-500/10">
                          {item.tags.map((tag, tIdx) => (
                            <span
                              key={tIdx}
                              className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                                isDark
                                  ? 'bg-white/[0.04] text-slate-400 border border-white/5'
                                  : 'bg-slate-100 text-slate-600 border border-slate-200'
                              }`}
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Still Have Questions Footer CTA */}
        <div
          className={`mt-14 max-w-3xl mx-auto rounded-2xl border p-6 sm:p-8 text-center space-y-4 backdrop-blur-md ${
            isDark
              ? 'border-white/10 bg-[#0c0f1c]/90 text-slate-100'
              : 'border-slate-200 bg-slate-50 text-slate-800'
          }`}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mx-auto">
            <Sparkles className="h-5 w-5" aria-hidden="true" />
          </div>

          <div className="space-y-1">
            <h3
              className={`text-base sm:text-lg font-bold font-display ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              {t.faq.stillQuestions}
            </h3>
            <p
              className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed"
            >
              {t.faq.stillQuestionsSub}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                if (onScrollToContact) {
                  onScrollToContact();
                } else {
                  onOpenConsultation('Custom Inquiry from FAQ');
                }
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 px-4.5 py-2.5 text-xs font-bold text-slate-950 transition-all shadow-sm focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500"
              aria-label="Direct consultation contact"
            >
              <span className={isNepali ? "font-['Noto_Sans_Devanagari']" : ''}>
                {t.faq.contactSupport}
              </span>
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </button>

            <a
              href="mailto:contact@nepalai.tech"
              className={`inline-flex items-center gap-2 rounded-xl border px-4.5 py-2.5 text-xs font-semibold transition-all focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                isDark
                  ? 'border-white/10 bg-white/[0.04] text-slate-300 hover:text-white'
                  : 'border-slate-200 bg-white text-slate-700 hover:text-slate-950 shadow-2xs'
              }`}
              aria-label="Send email to contact@nepalai.tech"
            >
              <span>contact@nepalai.tech</span>
            </a>
          </div>
        </div>

      </div>
    </section>
  );
};
