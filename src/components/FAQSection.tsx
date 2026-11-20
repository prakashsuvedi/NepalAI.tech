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
import { Breadcrumbs } from './ui/Breadcrumbs';

interface FAQSectionProps {
  theme: ThemeMode;
  language: Language;
  onOpenConsultation: (serviceTitle?: string) => void;
  onScrollToContact?: () => void;
  onNavigateHome?: () => void;
}

export const FAQSection: React.FC<FAQSectionProps> = ({
  theme,
  language,
  onOpenConsultation,
  onScrollToContact,
  onNavigateHome,
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
        
        {/* Breadcrumb Navigation */}
        <div className="mb-6">
          <Breadcrumbs
            items={[
              { label: isNepali ? 'गृहपृष्ठ' : 'Home', onClick: onNavigateHome },
              { label: isNepali ? 'नियम तथा सोधपुछ' : 'Compliance & FAQ', isCurrent: true },
            ]}
          />
        </div>

        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center space-y-3 mb-12">
          <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold shadow-xs ${
            isDark ? 'border-cyan-500/35 bg-cyan-500/10' : 'border-cyan-300 bg-cyan-50'
          }`}>
            <HelpCircle className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" aria-hidden="true" />
            <span
              className={`${
                isDark ? 'text-cyan-300' : 'text-cyan-800'
              } ${isNepali ? "font-['Noto_Sans_Devanagari']" : ''}`}
            >
              {t.faq.badge}
            </span>
          </div>

          <h2
            id="faq-section-heading"
            className={`text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight font-display ${
              isDark ? 'text-white' : 'text-slate-950'
            }`}
          >
            {t.faq.title}
          </h2>

          <p
            className={`text-sm sm:text-base leading-relaxed ${
              isDark ? 'text-slate-200' : 'text-slate-700'
            }`}
          >
            {t.faq.subtitle}
          </p>
        </div>

        {/* Main Grid: 2 Columns on lg+ (Sidebar with Filters & Guides, Right with Search & Accordion) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column / Sidebar (lg:col-span-4) */}
          <div className="lg:col-span-4 space-y-5 lg:sticky lg:top-24">
            
            {/* Category Filter on desktop (vertical) & mobile (horizontal chips) */}
            <div className={`p-4 rounded-2xl border ${
              isDark ? 'border-white/15 bg-[#0a0d18]' : 'border-slate-200 bg-slate-50 shadow-xs'
            }`}>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-700 dark:text-cyan-300 block mb-3">
                {isNepali ? 'विषयगत वर्गीकरण' : 'Categories & Filters'}
              </span>

              {/* Desktop vertical list */}
              <div className="hidden lg:flex flex-col gap-1.5" role="tablist" aria-label="FAQ Categories">
                {categories.map((cat) => {
                  const IconComp = cat.icon;
                  const isSelected = selectedCategory === cat.id;
                  const count = cat.id === 'All' 
                    ? FAQ_ITEMS.length 
                    : FAQ_ITEMS.filter(f => f.category === cat.id).length;

                  return (
                    <button
                      key={cat.id}
                      role="tab"
                      aria-selected={isSelected}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`flex items-center justify-between gap-2 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-colors text-left cursor-pointer ${
                        isSelected
                          ? isDark
                            ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/50 shadow-xs'
                            : 'bg-cyan-600 text-white shadow-xs'
                          : isDark
                            ? 'text-slate-200 hover:text-white hover:bg-white/[0.06]'
                            : 'text-slate-700 hover:text-slate-950 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <IconComp className="h-4 w-4 shrink-0" aria-hidden="true" />
                        <span className="truncate">{isNepali ? cat.labelNe : cat.labelEn}</span>
                      </div>
                      <span className={`text-xs font-mono px-1.5 py-0.5 rounded ${
                        isSelected 
                          ? isDark ? 'bg-cyan-500/30 text-cyan-100' : 'bg-white/20 text-white'
                          : isDark ? 'bg-white/10 text-slate-200' : 'bg-slate-200 text-slate-800'
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Mobile / Tablet horizontal scrollable pills */}
              <div className="flex lg:hidden flex-wrap items-center gap-1.5" role="tablist" aria-label="FAQ Categories Mobile">
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
                      className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-colors min-h-[38px] cursor-pointer ${
                        isSelected
                          ? isDark
                            ? 'border-cyan-500/60 bg-cyan-500/20 text-cyan-200 shadow-xs'
                            : 'border-cyan-600 bg-cyan-50 text-cyan-900 shadow-xs'
                          : isDark
                            ? 'border-white/15 bg-white/[0.03] text-slate-200 hover:text-white'
                            : 'border-slate-300 bg-white text-slate-700 hover:text-slate-950'
                      }`}
                    >
                      <IconComp className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      <span>{isNepali ? cat.labelNe : cat.labelEn}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Context Guide Cards */}
            <div className="space-y-3.5">
              
              {/* Card 1: Payment Workaround */}
              <div
                className={`rounded-2xl border p-4.5 flex items-start gap-3.5 transition-colors ${
                  isDark
                    ? 'border-sky-500/30 bg-sky-950/25 text-slate-100'
                    : 'border-sky-300 bg-sky-50 text-slate-900'
                }`}
              >
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg shrink-0 ${
                  isDark ? 'bg-sky-500/20 text-sky-300' : 'bg-sky-100 text-sky-700'
                }`}>
                  <CreditCard className="h-4 w-4" aria-hidden="true" />
                </div>
                <div className="space-y-1 text-xs min-w-0">
                  <div className={`font-bold flex items-center gap-1.5 ${isDark ? 'text-sky-300' : 'text-sky-800'}`}>
                    <span className="truncate">{t.faq.paymentGuideCardTitle}</span>
                    <span className={`text-xs font-mono px-1.5 py-0.2 rounded shrink-0 ${
                      isDark ? 'bg-sky-500/20 text-sky-100' : 'bg-sky-100 text-sky-900'
                    }`}>
                      Guide
                    </span>
                  </div>
                  <p className={`leading-relaxed text-xs ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                    {t.faq.paymentGuideCardDesc}
                  </p>
                  <a
                    href="#tools-directory"
                    className={`inline-flex items-center gap-1 hover:underline pt-1 font-semibold text-xs ${
                      isDark ? 'text-sky-300' : 'text-sky-700'
                    }`}
                  >
                    <span>{isNepali ? 'भुक्तानी फिल्टर हेर्नुहोस्' : 'Browse payment filters'}</span>
                    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                </div>
              </div>

              {/* Card 2: Consulting Scopes */}
              <div
                className={`rounded-2xl border p-4.5 flex items-start gap-3.5 transition-colors ${
                  isDark
                    ? 'border-cyan-500/30 bg-cyan-950/25 text-slate-100'
                    : 'border-cyan-300 bg-cyan-50 text-slate-900'
                }`}
              >
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg shrink-0 ${
                  isDark ? 'bg-cyan-500/20 text-cyan-300' : 'bg-cyan-100 text-cyan-700'
                }`}>
                  <Briefcase className="h-4 w-4" aria-hidden="true" />
                </div>
                <div className="space-y-1 text-xs min-w-0">
                  <div className={`font-bold flex items-center gap-1.5 ${isDark ? 'text-cyan-300' : 'text-cyan-800'}`}>
                    <span className="truncate">{t.faq.consultingGuideCardTitle}</span>
                    <span className={`text-xs font-mono px-1.5 py-0.2 rounded shrink-0 ${
                      isDark ? 'bg-cyan-500/20 text-cyan-100' : 'bg-cyan-100 text-cyan-900'
                    }`}>
                      Advisory
                    </span>
                  </div>
                  <p className={`leading-relaxed text-xs ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                    {t.faq.consultingGuideCardDesc}
                  </p>
                  <button
                    type="button"
                    onClick={() => onOpenConsultation('Enterprise AI Advisory Scoping')}
                    className={`inline-flex items-center gap-1 hover:underline pt-1 font-semibold text-xs cursor-pointer ${
                      isDark ? 'text-cyan-300' : 'text-cyan-700'
                    }`}
                  >
                    <span>{isNepali ? 'परामर्श स्प्रिन्ट तालिका मिलाउनुहोस्' : 'Book a 30-min scoping call'}</span>
                    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
              </div>

            </div>

          </div>

          {/* Right Column / Accordion List (lg:col-span-8) */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* Search Box */}
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                <Search className={`h-4 w-4 ${isDark ? 'text-slate-300' : 'text-slate-600'}`} aria-hidden="true" />
              </div>
              <input
                type="text"
                id="faq-search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.faq.searchPlaceholder}
                aria-label={t.faq.searchPlaceholder}
                className={`w-full rounded-xl border py-3 pl-10 pr-10 text-sm transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-cyan-500 ${
                  isDark
                    ? 'border-white/15 bg-[#0d101d] text-white placeholder-slate-400 focus:border-cyan-400'
                    : 'border-slate-300 bg-slate-50 text-slate-950 placeholder-slate-500 focus:border-cyan-600 focus:bg-white shadow-2xs'
                } ${isNepali ? "font-['Noto_Sans_Devanagari']" : ''}`}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className={`absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer ${
                    isDark ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-950'
                  }`}
                  aria-label="Clear search input"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              )}
            </div>

            {/* Accordion FAQ List */}
            <div className="space-y-3">
          {filteredFaqs.length === 0 ? (
            <div
              className={`text-center py-12 rounded-2xl border ${
                isDark ? 'border-white/15 bg-[#0c0e18]' : 'border-slate-200 bg-slate-50'
              }`}
            >
              <HelpCircle className={`h-8 w-8 mx-auto mb-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`} aria-hidden="true" />
              <p className={`text-sm ${isDark ? 'text-slate-200' : 'text-slate-700'} ${isNepali ? "font-['Noto_Sans_Devanagari']" : ''}`}>
                {t.faq.noResults}
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
                className="mt-3 text-xs text-cyan-600 dark:text-cyan-400 hover:underline font-semibold cursor-pointer"
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
                  className={`rounded-2xl border transition-colors overflow-hidden ${
                    isOpen
                      ? isDark
                        ? 'border-cyan-500/50 bg-[#0d1222]'
                        : 'border-cyan-500 bg-white shadow-xs'
                      : isDark
                        ? 'border-white/15 bg-[#0c101d] hover:border-white/30'
                        : 'border-slate-200 bg-white hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  <button
                    type="button"
                    id={questionId}
                    aria-expanded={isOpen}
                    aria-controls={answerId}
                    onClick={() => toggleAccordion(item.id)}
                    className="w-full text-left p-4 sm:p-5 flex items-start justify-between gap-4 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-cyan-500 transition-colors cursor-pointer"
                  >
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-mono font-semibold text-cyan-700 dark:text-cyan-300">
                          0{index + 1}
                        </span>
                        {item.badge && (
                          <span className={`text-xs uppercase font-mono px-2 py-0.5 rounded border font-bold ${
                            isDark ? 'bg-cyan-500/15 border-cyan-500/35 text-cyan-300' : 'bg-cyan-50 border-cyan-300 text-cyan-800'
                          }`}>
                            {item.badge}
                          </span>
                        )}
                        <span className={`text-xs font-mono ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                          {item.category}
                        </span>
                      </div>

                      <h3
                        className={`text-base font-bold transition-colors ${
                          isOpen
                            ? isDark
                              ? 'text-white'
                              : 'text-slate-950'
                            : isDark
                              ? 'text-slate-100'
                              : 'text-slate-900'
                        } ${isNepali ? "font-['Noto_Sans_Devanagari']" : ''}`}
                      >
                        {q}
                      </h3>
                    </div>

                    <div
                      className={`flex h-7 w-7 items-center justify-center rounded-lg border shrink-0 transition-transform duration-200 ${
                        isOpen
                          ? 'rotate-180 bg-cyan-600 text-white border-cyan-500'
                          : isDark
                            ? 'border-white/15 bg-white/[0.06] text-slate-200'
                            : 'border-slate-300 bg-slate-100 text-slate-700'
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
                      className={`px-4 pb-5 sm:px-5 sm:pb-6 pt-2 border-t transition-colors ${
                        isDark ? 'border-white/10 text-slate-200' : 'border-slate-200 text-slate-700'
                      }`}
                    >
                      <p
                        className={`text-sm leading-relaxed ${
                          isNepali ? "font-['Noto_Sans_Devanagari']" : ''
                        }`}
                      >
                        {a}
                      </p>

                      {item.tags && item.tags.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-3 border-t border-slate-500/15">
                          {item.tags.map((tag, tIdx) => (
                            <span
                              key={tIdx}
                              className={`text-xs font-mono px-2 py-0.5 rounded border ${
                                isDark
                                  ? 'bg-white/[0.05] text-slate-200 border-white/15'
                                  : 'bg-slate-100 text-slate-800 border-slate-300'
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
          </div>
        </div>

        {/* Still Have Questions Footer CTA */}
        <div
          className={`mt-14 max-w-3xl mx-auto rounded-2xl border p-6 sm:p-8 text-center space-y-4 backdrop-blur-md ${
            isDark
              ? 'border-white/15 bg-[#0c0f1c] text-slate-100'
              : 'border-slate-200 bg-slate-50 text-slate-900'
          }`}
        >
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl border mx-auto ${
            isDark ? 'bg-cyan-500/15 border-cyan-500/35 text-cyan-300' : 'bg-cyan-50 border-cyan-200 text-cyan-700'
          }`}>
            <Sparkles className="h-5 w-5" aria-hidden="true" />
          </div>

          <div className="space-y-1">
            <h3
              className={`text-base sm:text-lg font-bold font-display ${
                isDark ? 'text-white' : 'text-slate-950'
              }`}
            >
              {t.faq.stillQuestions}
            </h3>
            <p
              className={`text-sm max-w-xl mx-auto leading-relaxed ${
                isDark ? 'text-slate-200' : 'text-slate-700'
              }`}
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
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 px-5 py-2.5 text-xs font-bold text-white transition-colors shadow-sm focus:outline-hidden focus-visible:ring-2 focus-visible:ring-cyan-500 cursor-pointer"
              aria-label="Direct consultation contact"
            >
              <span className={isNepali ? "font-['Noto_Sans_Devanagari']" : ''}>
                {t.faq.contactSupport}
              </span>
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </button>

            <a
              href="mailto:contact@nepalai.tech"
              className={`inline-flex items-center gap-2 rounded-xl border px-5 py-2.5 text-xs font-semibold transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-cyan-500 ${
                isDark
                  ? 'border-white/15 bg-white/[0.05] text-slate-200 hover:text-white'
                  : 'border-slate-300 bg-white text-slate-800 hover:text-slate-950 shadow-2xs'
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
