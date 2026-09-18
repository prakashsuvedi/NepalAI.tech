import React, { useState } from 'react';
import { CASE_STUDIES } from '../data/caseStudies';
import { CaseStudy, CaseStudyCategory, ThemeMode, Language } from '../types';
import { Layers, MapPin, Clock, ArrowRight } from 'lucide-react';
import { TRANSLATIONS } from '../data/translations';

interface CaseStudiesSectionProps {
  theme?: ThemeMode;
  language?: Language;
  onSelectCaseStudy: (caseStudy: CaseStudy) => void;
  onOpenConsultation: (serviceTitle?: string) => void;
}

const CATEGORIES: { id: CaseStudyCategory; label: string; nepali: string }[] = [
  { id: 'All', label: 'All Projects', nepali: 'सबै परियोजनाहरू' },
  { id: 'Fintech & KYC', label: 'Fintech & KYC', nepali: 'बैंकिङ र केवाइसी' },
  { id: 'Voice & NLP', label: 'Voice & NLP', nepali: 'भाषा र च्याटबट' },
  { id: 'Tourism & Edge', label: 'Tourism & Edge', nepali: 'पर्यटन र अफलाइन' },
  { id: 'Health & Gov', label: 'Health & Gov', nepali: 'स्वास्थ्य र सरकारी' },
  { id: 'AgriTech', label: 'AgriTech', nepali: 'कृषि प्रविधि' },
];

export const CaseStudiesSection: React.FC<CaseStudiesSectionProps> = ({
  theme = 'dark',
  language = 'en',
  onSelectCaseStudy,
  onOpenConsultation,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<CaseStudyCategory>('All');
  const isDark = theme === 'dark';
  const t = TRANSLATIONS[language];

  const filteredCaseStudies =
    selectedCategory === 'All'
      ? CASE_STUDIES
      : CASE_STUDIES.filter((cs) => cs.category === selectedCategory);

  return (
    <section
      id="case-studies"
      className={`py-16 md:py-24 relative border-t transition-colors duration-300 ${
        isDark ? 'border-white/[0.08]' : 'border-slate-200 bg-slate-50/50'
      }`}
      aria-labelledby="case-studies-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-500/20">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-xs text-emerald-500 mb-2">
              <Layers className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="font-['Noto_Sans_Devanagari'] font-medium">
                {language === 'ne' ? 'सफल परियोजनाहरू' : 'Production Case Studies'}
              </span>
              <span className={isDark ? 'text-slate-600' : 'text-slate-300'} aria-hidden="true">•</span>
              <span className={`font-mono uppercase tracking-wider text-[11px] ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}>
                {t.caseStudies.badge}
              </span>
            </div>

            <h2
              id="case-studies-heading"
              className={`text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight font-['Space_Grotesk'] ${
                isDark ? 'text-white' : 'text-slate-950'
              }`}
            >
              <span className={`block font-['Noto_Sans_Devanagari'] text-xl sm:text-2xl mb-1 ${
                isDark ? 'text-slate-200' : 'text-slate-800'
              }`}>
                {language === 'ne' ? 'नेपालमा कार्यान्वयन गरिएका एआई परियोजनाहरू' : 'Proven Sovereign Deployments'}
              </span>
              <span>{t.caseStudies.title}</span>
            </h2>

            <p className={`mt-2 text-xs sm:text-sm font-['Noto_Sans_Devanagari'] leading-relaxed ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            }`}>
              {t.caseStudies.subtitle}
            </p>
          </div>

          <button
            type="button"
            onClick={() => onOpenConsultation('Custom AI Project Commission')}
            aria-label="Commission or propose a custom AI project"
            className={`self-start md:self-auto px-4 py-2 rounded-xl border text-xs font-semibold transition-colors flex items-center gap-1.5 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 ${
              isDark
                ? 'bg-white/[0.04] border-white/10 text-slate-200 hover:text-white hover:border-emerald-500/50'
                : 'bg-white border-slate-300 text-slate-800 hover:border-emerald-500 hover:text-emerald-700 shadow-sm'
            }`}
          >
            <span className={language === 'ne' ? "font-['Noto_Sans_Devanagari']" : ''}>
              {language === 'ne' ? 'नयाँ परियोजना सुरु गर्नुहोस्' : 'Commission a Project'}
            </span>
            <ArrowRight className="h-3.5 w-3.5 text-emerald-500" aria-hidden="true" />
          </button>
        </div>

        {/* Minimalist Filter Pills */}
        <div
          className="flex items-center gap-2 overflow-x-auto py-6 scrollbar-none"
          role="tablist"
          aria-label="Filter case studies by industry domain"
        >
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              role="tab"
              type="button"
              aria-selected={selectedCategory === cat.id}
              aria-label={`Show ${cat.label} case studies`}
              onClick={() => setSelectedCategory(cat.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                selectedCategory === cat.id
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                  : isDark
                  ? 'bg-white/[0.02] border border-white/[0.06] text-slate-400 hover:text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 shadow-xs'
              }`}
            >
              <span>{cat.label}</span>
              <span className="text-[10px] opacity-75 font-['Noto_Sans_Devanagari']">({cat.nepali})</span>
            </button>
          ))}
        </div>

        {/* Minimalist 3-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCaseStudies.map((study) => (
            <article
              key={study.id}
              tabIndex={0}
              role="button"
              aria-label={`View case study: ${study.title} for ${study.client}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectCaseStudy(study);
                }
              }}
              className={`flex flex-col justify-between rounded-2xl border p-6 transition-all group cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                isDark
                  ? 'border-white/[0.08] bg-white/[0.015] hover:border-white/20 hover:bg-white/[0.03]'
                  : 'border-slate-200 bg-white hover:border-emerald-400 hover:shadow-md'
              }`}
              onClick={() => onSelectCaseStudy(study)}
            >
              <div>
                {/* Category & Location */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className={`text-[11px] font-mono px-2 py-0.5 rounded border ${
                    isDark
                      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                      : 'border-emerald-300 bg-emerald-50 text-emerald-700'
                  }`}>
                    {study.category}
                  </span>

                  <span className={`flex items-center gap-1 text-[11px] ${
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    <MapPin className="h-3 w-3" aria-hidden="true" />
                    <span>{study.location}</span>
                  </span>
                </div>

                <h3 className={`text-base font-bold mb-1 group-hover:text-emerald-500 transition-colors ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}>
                  {study.title}
                </h3>

                <p className={`text-xs mb-4 line-clamp-3 leading-relaxed ${
                  isDark ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  {study.summary}
                </p>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-2 mb-4 p-3 rounded-xl border border-slate-500/15 bg-slate-500/5">
                  {study.metrics.slice(0, 2).map((m, idx) => (
                    <div key={idx}>
                      <div className={`text-sm font-bold font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {m.value}
                      </div>
                      <div className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {m.label}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Tech Chips */}
                <div className="flex flex-wrap gap-1 mb-4" aria-label="Technologies used">
                  {study.technologies.slice(0, 3).map((t) => (
                    <span
                      key={t}
                      className={`rounded-md border px-2 py-0.5 text-[10px] font-mono ${
                        isDark
                          ? 'bg-white/[0.04] border-white/[0.06] text-slate-300'
                          : 'bg-slate-100 border-slate-200 text-slate-700'
                      }`}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action */}
              <div className="pt-3 border-t border-slate-500/15 flex items-center justify-between">
                <span className={`flex items-center gap-1 text-[11px] font-mono ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  <Clock className="h-3 w-3" aria-hidden="true" />
                  <span>{study.duration}</span>
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectCaseStudy(study);
                  }}
                  aria-label={`Read full case study for ${study.title}`}
                  className="text-xs font-semibold text-emerald-500 group-hover:text-emerald-600 flex items-center gap-1 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 rounded px-1"
                >
                  <span className={language === 'ne' ? "font-['Noto_Sans_Devanagari']" : ''}>
                    {t.caseStudies.viewDetails}
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
                </button>
              </div>
            </article>
          ))}
        </div>

      </div>
    </section>
  );
};
