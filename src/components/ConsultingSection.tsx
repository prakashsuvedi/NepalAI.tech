import React, { useState } from 'react';
import { ConsultingOffering, ThemeMode, Language } from '../types';
import { Briefcase, CheckCircle2, ArrowRight, SlidersHorizontal, Sparkles } from 'lucide-react';
import { TRANSLATIONS } from '../data/translations';
import { motion, AnimatePresence } from 'motion/react';
import { BentoGridSkeleton } from './BentoGridSkeleton';
import { Breadcrumbs } from './ui/Breadcrumbs';

interface ConsultingSectionProps {
  theme?: ThemeMode;
  language?: Language;
  offerings: ConsultingOffering[];
  onOpenConsultation: (serviceTitle?: string) => void;
  onOpenAdminPricing?: () => void;
  onNavigateHome?: () => void;
  isHydrating?: boolean;
}

export const ConsultingSection: React.FC<ConsultingSectionProps> = ({
  theme = 'dark',
  language = 'en',
  offerings,
  onOpenConsultation,
  onOpenAdminPricing,
  onNavigateHome,
  isHydrating = false,
}) => {
  const [selectedIndustry, setSelectedIndustry] = useState('Banking & Fintech');
  const isDark = theme === 'dark';
  const t = TRANSLATIONS[language];
  const isNepali = language === 'ne';

  const industries = ['Banking & Fintech', 'E-Commerce', 'Tourism & Treks', 'Healthcare', 'Legal & Gov', 'Tech Startups'];

  const objectivesByIndustry: Record<string, { en: string; ne: string; price: string }[]> = {
    'Banking & Fintech': [
      { en: 'Devanagari Document OCR & KYC Automation', ne: 'देवनागरी नागरिकता/PAN ओसीआर र स्वचालित KYC', price: 'रू ३,८०,००० / $2,800' },
      { en: 'NRB Compliant AI Architecture Audit', ne: 'नेपाल राष्ट्र बैंक निर्देशिका अनुकूल एआई अडिट', price: 'रू १,८०,००० / $1,400' },
      { en: 'Conversational WhatsApp Banking Agent', ne: 'व्हाट्सएप र भाइबर बैंकिङ स्मार्ट एजेन्ट', price: 'रू ४,५०,००० / $3,400' },
    ],
    'E-Commerce': [
      { en: 'Romanized Nepali Conversational Checkout Bot', ne: 'रोमनाइज्ड नेपाली च्याटबट र चेकआउट', price: 'रू २,२०,००० / $1,650' },
      { en: 'Vector Semantic Search & Recommendations', ne: 'भेक्टर सिमान्टिक सर्च र उत्पादन सिफारिस', price: 'रू २,८०,००० / $2,100' },
      { en: 'eSewa & Khalti Automated AI Billing', ne: 'eSewa र Khalti स्वचालित एआई बिलिङ गेटवे', price: 'रू १,२०,००० / $900' },
    ],
    'Tourism & Treks': [
      { en: 'Offline Himalayan Trail & AMS Guide', ne: 'अफलाइन हिमालयन ट्रेल र लेक लाग्ने (AMS) सल्लाहकार', price: 'रू १,९०,००० / $1,450' },
      { en: 'Multilingual Guest Booking Agent', ne: 'बहुभाषिक पर्यटक बुकिङ र सिफारिस एजेन्ट', price: 'रू २,५०,००० / $1,900' },
      { en: 'Emergency Satellite SMS Triage Beacon', ne: 'आपतकालीन स्याटेलाइट एसएमएस उद्धार एआई', price: 'रू ३,२०,००० / $2,400' },
    ],
    'Healthcare': [
      { en: 'Devanagari Ambient Clinical Voice Scribe', ne: 'डाक्टर-बिरामी वार्तालाप देवनागरी भ्वाइस स्क्राइब', price: 'रू ३,५०,००० / $2,600' },
      { en: 'Rural Telemedicine Diagnostic Triaging', ne: 'ग्रामीण टेलिमेडिसिन प्राथमिक लक्षण परीक्षण', price: 'रू २,९०,००० / $2,200' },
      { en: 'FHIR Medical Record Standardization', ne: 'FHIR स्वास्थ्य रिपोर्ट मानकीकरण', price: 'रू २,४०,००० / $1,800' },
    ],
    'Legal & Gov': [
      { en: 'Nepal Supreme Court & Muluki Ain Legal RAG', ne: 'नेपाल सर्वोच्च अदालत नजिर र मुलुकी ऐन RAG', price: 'रू ४,००,००० / $3,000' },
      { en: 'Automated Commercial Contract Reviewer', ne: 'वाणिज्य सम्झौता र करार स्वचालित परीक्षण', price: 'रू २,५०,००० / $1,900' },
      { en: 'Nepali-English Legal Document Verification', ne: 'नेपाली-अंग्रेजी कानुनी कागजात प्रमाणीकरण', price: 'रू १,८०,००० / $1,400' },
    ],
    'Tech Startups': [
      { en: 'AI Infrastructure Proxy (Bypass $500 Dollar Limit)', ne: '५०० डलर सीमा हटाउने टोकन क्यासिङ गेटवे', price: 'रू १,२०,००० / $900' },
      { en: 'Autonomous AI Agent Engineering Sprint', ne: 'स्वायत्त एआई एजेन्ट इन्जिनियरिङ स्प्रिन्ट', price: 'रू ३,५०,००० / $2,650' },
      { en: 'Fractional Chief AI Officer Advisory', ne: 'मासिक एआई सल्लाहकार तथा आर्किटेक्ट नेतृत्व', price: 'रू १,५०,०००/महिना ($1,150/mo)' },
    ],
  };

  const [selectedObjective, setSelectedObjective] = useState(objectivesByIndustry['Banking & Fintech'][0].en);

  const handleIndustryChange = (ind: string) => {
    setSelectedIndustry(ind);
    setSelectedObjective(objectivesByIndustry[ind]?.[0]?.en || '');
  };

  return (
    <section
      id="consulting"
      className={`py-16 md:py-24 border-t relative transition-colors duration-500 ${
        isDark ? 'border-white/10 bg-[#06070c]' : 'border-slate-200 bg-white'
      }`}
      aria-labelledby="consulting-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Navigation */}
        <div className="mb-4">
          <Breadcrumbs
            items={[
              { label: isNepali ? 'गृहपृष्ठ' : 'Home', onClick: onNavigateHome },
              { label: isNepali ? 'संस्थागत परामर्श' : 'Enterprise Consulting', isCurrent: true },
            ]}
          />
        </div>

        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5 }}
          className={`flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b ${
            isDark ? 'border-white/10' : 'border-slate-200'
          }`}
        >
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-xs text-cyan-700 dark:text-cyan-400 mb-2.5">
              <Briefcase className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="font-semibold">
                {isNepali ? 'संस्थागत एआई परामर्श' : 'Enterprise AI Advisory'}
              </span>
              <span className={isDark ? 'text-slate-500' : 'text-slate-400'} aria-hidden="true">•</span>
              <span className={`font-mono uppercase tracking-wider text-xs ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                {t.consulting.badge}
              </span>
            </div>
            
            <h2
              id="consulting-heading"
              className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight font-display ${
                isDark ? 'text-white' : 'text-slate-950'
              }`}
            >
              <span>{t.consulting.title}</span>
            </h2>

            <p className={`mt-3 text-sm sm:text-base leading-relaxed ${
              isDark ? 'text-slate-200' : 'text-slate-700'
            }`}>
              {t.consulting.subtitle}
            </p>

            <div className="mt-2.5 flex items-center gap-2 text-xs font-mono font-semibold text-cyan-700 dark:text-cyan-300">
              <span>NPR (रू) & USD ($) Billing</span>
              <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>•</span>
              <span>100% IP Ownership</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => onOpenConsultation('General Enterprise Advisory')}
              data-cursor="Book"
              aria-label="Schedule a general enterprise AI advisory session"
              className={`min-h-[44px] px-6 py-2.5 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-cyan-500 ${
                isDark 
                  ? 'bg-cyan-500 text-slate-950 hover:bg-cyan-400' 
                  : 'bg-cyan-600 text-white hover:bg-cyan-700 shadow-cyan-600/20'
              }`}
            >
              <span>
                {t.consulting.bookAdvisory}
              </span>
              <ArrowRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            </button>
          </div>
        </motion.div>

        {/* Apple-Style Bento 3-Column Grid of Offerings with Staggered Framer Motion Animation */}
        <AnimatePresence mode="wait">
          {isHydrating ? (
            <div key="consulting-skeleton" className="mt-8">
              <BentoGridSkeleton theme={theme} type="consulting" count={3} />
            </div>
          ) : (
            <motion.div
              key="consulting-content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              {offerings.map((offering, idx) => (
                <motion.article
                  key={offering.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.4, delay: 0.06 * idx }}
                  data-cursor="Scope"
                  onClick={() => onOpenConsultation(offering.title)}
                  className={`flex flex-col justify-between rounded-2xl border p-6 transition-colors duration-200 group shadow-xs cursor-pointer ${
                    isDark
                      ? 'border-slate-700/80 bg-[#0c1324] hover:border-cyan-400'
                      : 'border-slate-200 bg-white hover:border-cyan-600 hover:shadow-md'
                  }`}
                >
                  <div>
                    {/* Header Tag */}
                    <div className="flex items-center justify-between text-xs mb-3">
                      <span className="font-mono text-cyan-700 dark:text-cyan-300 font-bold tracking-wide">
                        {offering.tier} • {offering.duration}
                      </span>
                      {offering.badge && (
                        <span className={`rounded-md border px-2 py-0.5 text-[11px] font-mono font-semibold ${
                          isDark
                            ? 'bg-white/[0.06] border-white/15 text-slate-200'
                            : 'bg-slate-100 border-slate-300 text-slate-800'
                        }`}>
                          {offering.badge}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className={`text-lg font-bold font-display transition-colors leading-snug group-hover:text-cyan-600 dark:group-hover:text-cyan-300 ${
                      isDark ? 'text-white' : 'text-slate-950'
                    }`}>
                      {offering.title}
                    </h3>
                    
                    <p className={`text-sm mt-2 mb-4 leading-relaxed ${
                      isDark ? 'text-slate-200' : 'text-slate-700'
                    }`}>
                      {offering.subtitle}
                    </p>

                    {/* Pricing Pill with Dual NPR (रू) and USD ($) */}
                    <div className={`rounded-xl border p-3.5 mb-4 flex items-center justify-between text-xs ${
                      isDark ? 'bg-black/40 border-slate-700' : 'bg-slate-50 border-slate-200'
                    }`}>
                      <span className={`text-xs font-mono font-medium ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                        {isNepali ? 'सुरुवाती लागत' : t.consulting.startingFrom}:
                      </span>
                      <div className="text-right">
                        <span className="font-bold text-cyan-700 dark:text-cyan-300 font-mono text-xs sm:text-sm">
                          {offering.startingPriceNpr || 'Custom Scoped'}
                        </span>
                        {offering.startingPriceUsd && (
                          <span className={`text-xs font-mono ml-1.5 font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                            ({offering.startingPriceUsd})
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Key Deliverables */}
                    <div className="space-y-2 mb-5">
                      {offering.deliverables.slice(0, 3).map((item, dIdx) => (
                        <div key={dIdx} className="flex items-start gap-2 text-xs sm:text-sm">
                          <CheckCircle2 className="h-4 w-4 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5" aria-hidden="true" />
                          <span className={`line-clamp-1 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                            {item}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action */}
                  <div className={`pt-4 border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                    <div
                      className={`w-full min-h-[44px] py-2.5 px-4 rounded-xl border text-xs font-bold transition-colors flex items-center justify-center gap-1.5 ${
                        isDark
                          ? 'bg-white/[0.06] border-slate-700 group-hover:bg-cyan-500 group-hover:text-slate-950 text-white'
                          : 'bg-slate-50 border-slate-300 group-hover:bg-cyan-600 group-hover:text-white text-slate-900'
                      }`}
                    >
                      <span className={isNepali ? "font-['Noto_Sans_Devanagari']" : ''}>
                        {t.consulting.bookAdvisory}
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    </div>
                  </div>
                </motion.article>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Interactive Scope Scenarios Builder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className={`mt-10 rounded-2xl border p-6 sm:p-7 transition-colors shadow-xs ${
            isDark ? 'border-slate-700 bg-[#0c1324]' : 'border-slate-200 bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-2.5 mb-4">
            <Sparkles className="h-4 w-4 text-cyan-600 dark:text-cyan-400 shrink-0" aria-hidden="true" />
            <h3 className={`text-base font-bold font-display ${isDark ? 'text-white' : 'text-slate-950'}`}>
              {isNepali ? 'उद्योग अनुसार सिफारिस गरिएको सेवा र लागत' : 'Recommended Solutions by Industry'}
            </h3>
          </div>

          <div
            className="flex items-center gap-2 overflow-x-auto pb-3 scrollbar-none"
            role="tablist"
            aria-label="Filter recommended architectures by industry"
          >
            {industries.map((ind) => (
              <button
                key={ind}
                role="tab"
                type="button"
                aria-selected={selectedIndustry === ind}
                aria-label={`Select industry: ${ind}`}
                onClick={() => handleIndustryChange(ind)}
                data-cursor="Industry"
                className={`min-h-[44px] min-w-[44px] px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center justify-center cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-cyan-500 ${
                  selectedIndustry === ind
                    ? isDark 
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-xs' 
                      : 'bg-cyan-600 text-white font-bold shadow-xs'
                    : isDark
                    ? 'bg-white/[0.06] text-slate-200 hover:text-white border border-slate-700'
                    : 'bg-white border border-slate-300 text-slate-800 hover:border-cyan-600'
                }`}
              >
                {ind}
              </button>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {objectivesByIndustry[selectedIndustry]?.map((item, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setSelectedObjective(item.en);
                  onOpenConsultation(`${selectedIndustry}: ${item.en} (${item.price})`);
                }}
                data-cursor="Inquire"
                aria-label={`Consult about: ${item.en}`}
                className={`min-h-[80px] p-4 rounded-2xl border text-left text-xs transition-colors flex flex-col justify-between group cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-cyan-500 ${
                  selectedObjective === item.en
                    ? isDark ? 'border-cyan-400 bg-cyan-950/40 text-white' : 'border-cyan-600 bg-cyan-50 text-slate-950'
                    : isDark ? 'border-slate-700 bg-white/[0.03] text-slate-100 hover:border-cyan-400/70' : 'border-slate-200 bg-white text-slate-800 hover:border-cyan-600 shadow-2xs'
                }`}
              >
                <div>
                  <div className="font-bold text-sm line-clamp-1">{isNepali ? item.ne : item.en}</div>
                  <div className={`text-xs font-mono mt-1 line-clamp-1 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{isNepali ? item.en : item.ne}</div>
                </div>
                <div className={`mt-3 pt-2 border-t flex items-center justify-between ${
                  isDark ? 'border-slate-700' : 'border-slate-200'
                }`}>
                  <span className="font-mono text-cyan-700 dark:text-cyan-300 font-bold text-xs">{item.price}</span>
                  <ArrowRight className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400 shrink-0 ml-2" aria-hidden="true" />
                </div>
              </button>
            ))}
          </div>
        </motion.div>

      </div>
    </section>
  );
};
