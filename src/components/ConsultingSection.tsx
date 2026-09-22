import React, { useState } from 'react';
import { ConsultingOffering, ThemeMode, Language } from '../types';
import { Briefcase, CheckCircle2, ArrowRight, SlidersHorizontal, Sparkles } from 'lucide-react';
import { TRANSLATIONS } from '../data/translations';
import { motion, AnimatePresence } from 'motion/react';
import { BentoGridSkeleton } from './BentoGridSkeleton';

interface ConsultingSectionProps {
  theme?: ThemeMode;
  language?: Language;
  offerings: ConsultingOffering[];
  onOpenConsultation: (serviceTitle?: string) => void;
  onOpenAdminPricing: () => void;
  isHydrating?: boolean;
}

export const ConsultingSection: React.FC<ConsultingSectionProps> = ({
  theme = 'dark',
  language = 'en',
  offerings,
  onOpenConsultation,
  onOpenAdminPricing,
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
            <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 mb-2.5">
              <Briefcase className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="font-semibold">
                {isNepali ? 'इन्टरप्राइज एआई परामर्श (Enterprise AI)' : 'Enterprise AI Advisory & Engineering'}
              </span>
              <span className={isDark ? 'text-slate-600' : 'text-slate-300'} aria-hidden="true">•</span>
              <span className={`font-mono uppercase tracking-wider text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {t.consulting.badge}
              </span>
            </div>
            
            <h2
              id="consulting-heading"
              className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight font-display ${
                isDark ? 'text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-slate-400' : 'text-slate-950'
              }`}
            >
              <span>{t.consulting.title}</span>
            </h2>

            <p className={`mt-3 text-xs sm:text-sm leading-relaxed ${
              isDark ? 'text-slate-300' : 'text-slate-600'
            }`}>
              {t.consulting.subtitle}
            </p>

            <div className="mt-2 flex items-center gap-2 text-xs font-mono text-emerald-600 dark:text-emerald-400">
              <span>Dual Invoicing: NPR (नेपाली रुपैयाँ रू) & USD ($)</span>
              <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>•</span>
              <span>100% IP Transfer</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Admin Panel Customization Button with 44px min touch target */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onOpenAdminPricing}
              data-cursor="Pricing"
              className={`min-h-[44px] px-4 py-2.5 rounded-full border text-xs font-mono transition-colors flex items-center justify-center gap-1.5 cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                isDark
                  ? 'border-white/10 bg-white/[0.03] hover:bg-white/[0.08] text-slate-300 hover:text-white'
                  : 'border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-950 shadow-xs'
              }`}
              title="Customize service rates and scopes from Admin Panel"
            >
              <SlidersHorizontal className="h-3.5 w-3.5 text-indigo-500 shrink-0" aria-hidden="true" />
              <span>Admin Rates (रू/$)</span>
            </motion.button>

            <motion.button
              type="button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onOpenConsultation('General Enterprise Advisory')}
              data-cursor="Book"
              aria-label="Schedule a general enterprise AI advisory session"
              className={`min-h-[44px] px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                isDark 
                  ? 'bg-white text-slate-950 hover:bg-slate-200' 
                  : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/20'
              }`}
            >
              <span>
                {t.consulting.bookAdvisory}
              </span>
              <ArrowRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            </motion.button>
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
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.5, delay: 0.08 * idx }}
                  whileHover={{ y: -4, scale: 1.01 }}
                  data-cursor="Scope"
                  onClick={() => onOpenConsultation(offering.title)}
                  className={`flex flex-col justify-between rounded-3xl border p-7 transition-all duration-300 group shadow-sm cursor-pointer ${
                    isDark
                      ? 'border-white/10 bg-white/[0.02] hover:border-emerald-500/50 hover:bg-white/[0.04]'
                      : 'border-slate-200 bg-white hover:border-emerald-500 hover:shadow-md'
                  }`}
                >
                  <div>
                    {/* Header Tag */}
                    <div className="flex items-center justify-between text-[11px] mb-4">
                      <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold tracking-wide">
                        {offering.tier} • {offering.duration}
                      </span>
                      {offering.badge && (
                        <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-mono ${
                          isDark
                            ? 'bg-white/[0.04] border-white/10 text-slate-300'
                            : 'bg-slate-100 border-slate-200 text-slate-700'
                        }`}>
                          {offering.badge}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className={`text-lg font-bold font-display transition-colors leading-snug group-hover:text-emerald-500 ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}>
                      {offering.title}
                    </h3>
                    
                    <p className={`text-xs mt-2 mb-4 leading-relaxed ${
                      isDark ? 'text-slate-300' : 'text-slate-600'
                    }`}>
                      {offering.subtitle}
                    </p>

                    {/* Pricing Pill with Dual NPR (रू) and USD ($) */}
                    <div className={`rounded-2xl border p-3.5 mb-5 flex items-center justify-between text-xs ${
                      isDark ? 'bg-black/40 border-white/10' : 'bg-slate-50 border-slate-200'
                    }`}>
                      <span className={`text-[11px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {isNepali ? 'सुरुवाती लागत' : t.consulting.startingFrom}:
                      </span>
                      <div className="text-right">
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono text-xs">
                          {offering.startingPriceNpr || 'Custom Scoped'}
                        </span>
                        {offering.startingPriceUsd && (
                          <span className={`text-[11px] font-mono ml-1.5 ${isDark ? 'text-indigo-300' : 'text-indigo-600 font-semibold'}`}>
                            ({offering.startingPriceUsd})
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Key Deliverables */}
                    <div className="space-y-2.5 mb-5">
                      {offering.deliverables.slice(0, 3).map((item, dIdx) => (
                        <div key={dIdx} className="flex items-start gap-2 text-xs">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" aria-hidden="true" />
                          <span className={`line-clamp-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                            {item}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action */}
                  <div className={`pt-4 border-t ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                    <div
                      className={`w-full min-h-[44px] py-2.5 px-4 rounded-full border text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                        isDark
                          ? 'bg-white/[0.04] border-white/10 group-hover:bg-emerald-500 group-hover:text-slate-950 text-slate-200'
                          : 'bg-slate-50 border-slate-200 group-hover:bg-emerald-600 group-hover:text-white text-slate-800'
                      }`}
                    >
                      <span className={isNepali ? "font-['Noto_Sans_Devanagari']" : ''}>
                        {t.consulting.bookAdvisory} (रू & $)
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    </div>
                  </div>
                </motion.article>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Interactive Scope Scenarios Builder (Apple Bento Style) */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className={`mt-10 rounded-3xl border p-6 sm:p-7 transition-all shadow-sm ${
            isDark ? 'border-white/10 bg-black/50' : 'border-slate-200 bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-2.5 mb-4">
            <Sparkles className="h-4 w-4 text-emerald-500 shrink-0" aria-hidden="true" />
            <h3 className={`text-sm font-bold font-display ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {isNepali ? 'उद्योग अनुसार सिफारिस गरिएको आर्किटेक्चर र लागत' : 'Targeted Architecture & Pricing by Industry'}
            </h3>
          </div>

          <div
            className="flex items-center gap-2 overflow-x-auto pb-3 scrollbar-none"
            role="tablist"
            aria-label="Filter recommended architectures by industry"
          >
            {industries.map((ind) => (
              <motion.button
                key={ind}
                role="tab"
                type="button"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                aria-selected={selectedIndustry === ind}
                aria-label={`Select industry: ${ind}`}
                onClick={() => handleIndustryChange(ind)}
                data-cursor="Industry"
                className={`min-h-[44px] min-w-[44px] px-4 py-2.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors flex items-center justify-center cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                  selectedIndustry === ind
                    ? isDark 
                      ? 'bg-white text-slate-950 font-bold shadow-md' 
                      : 'bg-slate-900 text-white font-bold shadow-md'
                    : isDark
                    ? 'bg-white/[0.04] text-slate-400 hover:text-white border border-white/5'
                    : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
                }`}
              >
                {ind}
              </motion.button>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {objectivesByIndustry[selectedIndustry]?.map((item, i) => (
              <motion.button
                key={i}
                type="button"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setSelectedObjective(item.en);
                  onOpenConsultation(`${selectedIndustry}: ${item.en} (${item.price})`);
                }}
                data-cursor="Inquire"
                aria-label={`Consult about: ${item.en}`}
                className={`min-h-[76px] p-4 rounded-2xl border text-left text-xs transition-all flex flex-col justify-between group cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                  selectedObjective === item.en
                    ? isDark ? 'border-emerald-500/60 bg-emerald-950/30 text-white shadow-lg' : 'border-emerald-500 bg-emerald-50 text-emerald-950 shadow-xs'
                    : isDark ? 'border-white/10 bg-white/[0.015] text-slate-300 hover:border-white/20' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 shadow-xs'
                }`}
              >
                <div>
                  <div className="font-semibold line-clamp-1">{isNepali ? item.ne : item.en}</div>
                  <div className={`text-[11px] font-mono mt-0.5 line-clamp-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{isNepali ? item.en : item.ne}</div>
                </div>
                <div className={`mt-3 pt-2 border-t flex items-center justify-between ${
                  isDark ? 'border-white/10' : 'border-slate-200'
                }`}>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">{item.price}</span>
                  <ArrowRight className="h-3.5 w-3.5 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2" aria-hidden="true" />
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

      </div>
    </section>
  );
};
