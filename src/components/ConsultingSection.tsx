import React, { useState } from 'react';
import { ConsultingOffering, ThemeMode, Language } from '../types';
import { Briefcase, CheckCircle2, ArrowRight, SlidersHorizontal, Sparkles } from 'lucide-react';
import { TRANSLATIONS } from '../data/translations';

interface ConsultingSectionProps {
  theme?: ThemeMode;
  language?: Language;
  offerings: ConsultingOffering[];
  onOpenConsultation: (serviceTitle?: string) => void;
  onOpenAdminPricing: () => void;
}

export const ConsultingSection: React.FC<ConsultingSectionProps> = ({
  theme = 'dark',
  language = 'en',
  offerings,
  onOpenConsultation,
  onOpenAdminPricing,
}) => {
  const [selectedIndustry, setSelectedIndustry] = useState('Banking & Fintech');
  const isDark = theme === 'dark';
  const t = TRANSLATIONS[language];

  const industries = ['Banking & Fintech', 'E-Commerce', 'Tourism & Treks', 'Healthcare', 'Legal & Gov', 'Tech Startups'];

  const objectivesByIndustry: Record<string, string[]> = {
    'Banking & Fintech': ['Devnagari Document OCR & KYC Automation', 'NRB Compliant AI Architecture Audit', 'Conversational WhatsApp Banking Agent'],
    'E-Commerce': ['Romanized Nepali Conversational Checkout Bot', 'Vector Semantic Search & Recommendations', 'eSewa & Khalti Automated AI Billing'],
    'Tourism & Treks': ['Offline Himalayan Trail & AMS Guide', 'Multilingual Guest Booking Agent', 'Emergency Satellite SMS Triage Beacon'],
    'Healthcare': ['Devnagari Ambient Clinical Voice Scribe', 'Rural Telemedicine Diagnostic Triaging', 'FHIR Medical Record Standardization'],
    'Legal & Gov': ['Nepal Supreme Court & Muluki Ain Legal RAG', 'Automated Commercial Contract Reviewer', 'Nepali-English Legal Document Verification'],
    'Tech Startups': ['AI Infrastructure Proxy (Bypass $500 Dollar Limit)', 'Autonomous AI Agent Engineering Sprint', 'Fractional Chief AI Officer Advisory']
  };

  const [selectedObjective, setSelectedObjective] = useState(objectivesByIndustry['Banking & Fintech'][0]);

  const handleIndustryChange = (ind: string) => {
    setSelectedIndustry(ind);
    setSelectedObjective(objectivesByIndustry[ind]?.[0] || '');
  };

  return (
    <section
      id="consulting"
      className={`py-16 md:py-24 border-t relative transition-colors duration-300 ${
        isDark ? 'border-white/[0.08]' : 'border-slate-200 bg-white'
      }`}
      aria-labelledby="consulting-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-500/20">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-xs text-emerald-500 mb-2">
              <Briefcase className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="font-['Noto_Sans_Devanagari'] font-medium">
                {language === 'ne' ? 'इन्टरप्राइज एआई परामर्श' : 'Enterprise AI Advisory'}
              </span>
              <span className={isDark ? 'text-slate-600' : 'text-slate-300'} aria-hidden="true">•</span>
              <span className={`font-mono uppercase tracking-wider text-[11px] ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}>
                {t.consulting.badge}
              </span>
            </div>
            
            <h2
              id="consulting-heading"
              className={`text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight font-['Space_Grotesk'] ${
                isDark ? 'text-white' : 'text-slate-950'
              }`}
            >
              <span className={`block font-['Noto_Sans_Devanagari'] text-xl sm:text-2xl mb-1 ${
                isDark ? 'text-slate-200' : 'text-slate-800'
              }`}>
                {language === 'ne' ? 'नेपालका उद्यमका लागि एआई परामर्श सेवा' : 'Engineered for Sovereignty'}
              </span>
              <span>{t.consulting.title}</span>
            </h2>

            <p className={`mt-2 text-xs sm:text-sm font-['Noto_Sans_Devanagari'] leading-relaxed ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            }`}>
              {t.consulting.subtitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Admin Panel Customization Button */}
            <button
              type="button"
              onClick={onOpenAdminPricing}
              className={`px-3.5 py-2 rounded-xl border text-xs font-mono transition-colors flex items-center gap-1.5 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                isDark
                  ? 'border-white/10 bg-white/[0.03] hover:bg-white/[0.08] text-slate-300 hover:text-white'
                  : 'border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-950'
              }`}
              title="Customize service rates and scopes from Admin Panel"
              aria-label="Customize consulting pricing in Admin Panel"
            >
              <SlidersHorizontal className="h-3.5 w-3.5 text-indigo-500" aria-hidden="true" />
              <span>Admin Pricing Panel</span>
            </button>

            <button
              type="button"
              onClick={() => onOpenConsultation('General Enterprise Advisory')}
              aria-label="Schedule a general enterprise AI advisory session"
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-xs font-bold text-slate-950 transition-colors flex items-center gap-1.5 shadow-sm focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <span className={language === 'ne' ? "font-['Noto_Sans_Devanagari']" : ''}>
                {t.consulting.bookAdvisory}
              </span>
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Minimalist 3-Column Grid of Offerings */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {offerings.map((offering) => (
            <article
              key={offering.id}
              className={`flex flex-col justify-between rounded-2xl border p-6 transition-all group focus-within:ring-2 focus-within:ring-emerald-500 ${
                isDark
                  ? 'border-white/[0.08] bg-white/[0.015] hover:border-white/20 hover:bg-white/[0.03]'
                  : 'border-slate-200 bg-white hover:border-indigo-300 hover:shadow-md'
              }`}
            >
              <div>
                {/* Header Tag */}
                <div className="flex items-center justify-between text-[11px] mb-3">
                  <span className="font-mono text-emerald-500 font-medium tracking-wide">
                    {offering.tier} • {offering.duration}
                  </span>
                  {offering.badge && (
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-mono ${
                      isDark
                        ? 'bg-white/[0.04] border-white/10 text-slate-300'
                        : 'bg-slate-100 border-slate-200 text-slate-700'
                    }`}>
                      {offering.badge}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className={`text-base font-bold transition-colors leading-snug group-hover:text-emerald-500 ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}>
                  {offering.title}
                </h3>
                
                <p className={`text-xs mt-2 mb-4 leading-relaxed font-normal ${
                  isDark ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  {offering.subtitle}
                </p>

                {/* Admin-Customized Pricing Pill */}
                <div className={`rounded-xl border p-3 mb-4 flex items-center justify-between text-xs ${
                  isDark ? 'bg-black/40 border-white/[0.06]' : 'bg-slate-50 border-slate-200'
                }`}>
                  <span className={`text-[11px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {t.consulting.startingFrom}:
                  </span>
                  <div className="text-right">
                    <span className="font-bold text-emerald-500 font-mono text-xs">
                      {offering.startingPriceNpr || 'Custom Scoped'}
                    </span>
                    {offering.startingPriceUsd && (
                      <span className={`text-[11px] font-mono ml-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        ({offering.startingPriceUsd})
                      </span>
                    )}
                  </div>
                </div>

                {/* Key Deliverables */}
                <div className="space-y-2 mb-5">
                  {offering.deliverables.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" aria-hidden="true" />
                      <span className={`line-clamp-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action */}
              <div className="pt-3 border-t border-slate-500/15">
                <button
                  type="button"
                  onClick={() => onOpenConsultation(offering.title)}
                  aria-label={`Book consulting session for ${offering.title}`}
                  className={`w-full py-2.5 rounded-xl border text-xs font-semibold transition-all flex items-center justify-center gap-1.5 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                    isDark
                      ? 'bg-white/[0.04] border-white/10 hover:bg-emerald-500 hover:text-slate-950 text-slate-200'
                      : 'bg-slate-50 border-slate-200 hover:bg-emerald-500 hover:text-slate-950 text-slate-800'
                  }`}
                >
                  <span className={language === 'ne' ? "font-['Noto_Sans_Devanagari']" : ''}>
                    {t.consulting.bookAdvisory}
                  </span>
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
            </article>
          ))}
        </div>

        {/* Interactive Scope Scenarios Builder */}
        <div className={`mt-10 rounded-2xl border p-6 transition-all ${
          isDark ? 'border-white/[0.08] bg-black/40' : 'border-slate-200 bg-slate-50'
        }`}>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-emerald-500" aria-hidden="true" />
            <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {language === 'ne' ? 'उद्योग अनुसार सिफारिस गरिएको आर्किटेक्चर' : 'Targeted Architecture by Industry'}
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
                className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                  selectedIndustry === ind
                    ? 'bg-indigo-600 text-white font-bold'
                    : isDark
                    ? 'bg-white/[0.04] text-slate-400 hover:text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
                }`}
              >
                {ind}
              </button>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
            {objectivesByIndustry[selectedIndustry]?.map((obj, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setSelectedObjective(obj);
                  onOpenConsultation(`${selectedIndustry}: ${obj}`);
                }}
                aria-label={`Consult about: ${obj}`}
                className={`p-3 rounded-xl border text-left text-xs transition-all flex items-center justify-between group focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                  selectedObjective === obj
                    ? isDark ? 'border-emerald-500/50 bg-emerald-950/20 text-white' : 'border-emerald-400 bg-emerald-50 text-emerald-950'
                    : isDark ? 'border-white/[0.06] bg-white/[0.01] text-slate-300 hover:border-white/20' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                }`}
              >
                <span className="line-clamp-2">{obj}</span>
                <ArrowRight className="h-3.5 w-3.5 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2" aria-hidden="true" />
              </button>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
