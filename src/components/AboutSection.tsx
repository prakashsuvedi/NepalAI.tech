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
  ArrowUpRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { ThemeMode, Language } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { motion } from 'motion/react';

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
      titleSecondary: isNepali ? 'Indigenous LLMs & Voice' : 'देवनागरी र नेपाली भाषिक एआई',
      description: t.about.pillar1Desc,
      tag: isNepali ? 'देवनागरी मोडल' : 'Indigenous LLMs',
      stat: '98.4%',
      statLabel: isNepali ? 'देवनागरी शुद्धता' : 'Devanagari Acc',
      dualPrice: isNepali ? 'रू / $ दुवै समर्थित' : 'NPR & USD Compatible'
    },
    {
      icon: CreditCard,
      title: t.about.pillar2Title,
      titleSecondary: isNepali ? 'Local NPR Invoicing' : 'eSewa, Khalti र FonePay बिलिङ',
      description: t.about.pillar2Desc,
      tag: isNepali ? 'eSewa / Khalti' : 'Local Billing',
      stat: 'NPR / USD',
      statLabel: isNepali ? 'शून्य डलर कार्ड झन्झट' : 'Zero Dollar Card Hassle',
      dualPrice: isNepali ? 'रू १५,००० देखि / From $115' : 'NPR 15k+ / From $115'
    },
    {
      icon: Lock,
      title: t.about.pillar3Title,
      titleSecondary: isNepali ? 'NRB IT Security Standards' : 'नेपाल राष्ट्र बैंक डेटा मापदण्ड',
      description: t.about.pillar3Desc,
      tag: isNepali ? 'NRB IT निर्देशिका' : 'Data Residency',
      stat: 'Tier-3 DC',
      statLabel: isNepali ? 'स्थानीय डेटा केन्द्र' : 'Kathmandu Cluster',
      dualPrice: isNepali ? '१००% डेटा सार्वभौमिकता' : '100% Data Sovereignty'
    },
    {
      icon: Server,
      title: t.about.pillar4Title,
      titleSecondary: isNepali ? 'Production MVP Sprint' : '१४ दिने इन्टरप्राइज डेलिभरी',
      description: t.about.pillar4Desc,
      tag: isNepali ? 'इन्टरप्राइज डेलिभरी' : 'Sprint Delivery',
      stat: '14 Days',
      statLabel: isNepali ? 'प्रोटोटाइप देखि लाइभ' : 'MVP to Live Prod',
      dualPrice: isNepali ? 'रू ९५,००० देखि / From $750' : 'NPR 95k+ / From $750'
    },
  ];

  const techBadges = [
    { label: 'Devanagari OCR v3.2', sub: '>98.4% Acc', neLabel: 'देवनागरी ओसीआर' },
    { label: 'Nepali Dialect Neural TTS', sub: 'Low Latency', neLabel: 'नेपाली न्युरल भ्वाइस' },
    { label: 'Air-Gapped LLM Deployments', sub: 'H100/L40S', neLabel: 'सुरक्षित स्थानीय सर्भर' },
    { label: 'NRB IT Audit Compliance', sub: 'Tier-3 Local DC', neLabel: 'NRB IT अडिट' },
    { label: 'Bilingual Legal & KYC RAG', sub: 'Zero Retention', neLabel: 'द्विभाषिक कानुन र KYC' },
    { label: 'FonePay / eSewa API Bridge', sub: 'NPR / USD Invoicing', neLabel: 'नेपाली भुक्तानी गेटवे' },
  ];

  return (
    <section
      id="about"
      className={`relative border-t py-16 md:py-24 transition-colors duration-500 ${
        isDark ? 'border-white/10 bg-[#050609]' : 'border-slate-200 bg-slate-50/70'
      }`}
      aria-labelledby="about-heading"
    >
      {/* Subtle Ambient Lighting */}
      <div 
        className="pointer-events-none absolute inset-0 overflow-hidden opacity-25" 
        aria-hidden="true"
      >
        <div className="absolute top-1/4 left-1/3 -translate-y-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-emerald-500/15 rounded-full blur-[140px]" />
        <div className="absolute bottom-10 right-1/4 w-[500px] h-[350px] bg-indigo-500/15 rounded-full blur-[140px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Apple Style Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-3xl text-center space-y-4 mb-14"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold shadow-xs">
            <Globe2 className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
            <span
              className={`${
                isDark ? 'text-emerald-300' : 'text-emerald-800'
              } ${isNepali ? "font-['Noto_Sans_Devanagari']" : ''}`}
            >
              {t.about.badge}
            </span>
          </div>

          <h2
            id="about-heading"
            className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight ${
              isDark ? 'text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-slate-400' : 'text-slate-900'
            } ${isNepali ? "font-devanagari" : "font-display"}`}
          >
            {t.about.title}
          </h2>

          <p
            className={`text-sm sm:text-base leading-relaxed ${
              isDark ? 'text-slate-300' : 'text-slate-600'
            } ${isNepali ? "font-['Mukta']" : ''}`}
          >
            {t.about.subtitle}
          </p>

          {/* Bilingual Quick Tagline */}
          <div className={`text-xs font-mono flex items-center justify-center gap-2 pt-1 ${
            isDark ? 'text-emerald-400' : 'text-emerald-800 font-semibold'
          }`}>
            <span>🇳🇵 Devanagari AI Native</span>
            <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>•</span>
            <span>Billing in NPR (रू) & USD ($)</span>
          </div>
        </motion.div>

        {/* APPLE-STYLE BENTO GRID ARCHITECTURE (Staggered Entrance) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-8">
          
          {/* Bento Cell 1: Sovereign Mission (Spans 7 cols) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.55, delay: 0.05 }}
            whileHover={{ y: -2 }}
            className={`lg:col-span-7 rounded-3xl border p-7 sm:p-9 transition-all relative overflow-hidden backdrop-blur-2xl shadow-xl flex flex-col justify-between group cursor-pointer ${
              isDark
                ? 'border-white/10 bg-white/[0.03] hover:border-emerald-500/40 hover:bg-white/[0.05]'
                : 'border-slate-300/90 bg-white hover:border-emerald-500/50 shadow-sm'
            }`}
            onClick={() => onOpenConsultation('Sovereignty & Indigenous LLM Architecture')}
            data-cursor="Explore"
          >
            {/* Top Badge & Header */}
            <div>
              <div className="flex items-center justify-between gap-4 mb-5">
                <div className="flex items-center gap-3">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border shadow-inner ${
                    isDark ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  }`}>
                    <Sparkles className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className={`text-xl font-bold font-display ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {t.about.missionHeading}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-[11px] font-mono uppercase tracking-wider font-semibold ${
                        isDark ? 'text-emerald-400' : 'text-emerald-700'
                      }`}>
                        {isNepali ? 'स्वायत्त प्राविधिक आत्मनिर्भरता' : 'Indigenous Sovereignty'}
                      </span>
                      <span className={`text-[10px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {isNepali ? '(Sovereign AI)' : '(देवनागरी एआई)'}
                      </span>
                    </div>
                  </div>
                </div>
                <ArrowUpRight className="h-5 w-5 text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>

              <p className={`text-sm leading-relaxed mb-6 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                {t.about.missionBody}
              </p>

              {/* Bento Feature Points */}
              <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 pt-5 border-t ${
                isDark ? 'border-white/10' : 'border-slate-200'
              }`}>
                <div className={`flex items-start gap-2.5 p-3 rounded-xl border ${
                  isDark ? 'border-white/5 bg-white/[0.02]' : 'border-slate-200 bg-slate-50'
                }`}>
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    {isNepali
                      ? 'नेपाली, नेवारी र मैथिली भाषाहरूका लागि विशेष टोकनाइजेसन'
                      : 'Dialect-aware tokenizers for Devanagari & Nepali scripts'}
                  </span>
                </div>
                <div className={`flex items-start gap-2.5 p-3 rounded-xl border ${
                  isDark ? 'border-white/5 bg-white/[0.02]' : 'border-slate-200 bg-slate-50'
                }`}>
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    {isNepali
                      ? 'स्थानीय नेपाली डेटा सेन्टरहरूमा शून्य-डेटा-लिकेज होस्टिङ'
                      : 'Zero-data-leakage hosting on sovereign Nepali data centers'}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Status Bar */}
            <div className={`mt-6 pt-4 border-t flex items-center justify-between text-xs font-mono ${
              isDark ? 'border-white/10 text-slate-400' : 'border-slate-200 text-slate-600'
            }`}>
              <span className={`flex items-center gap-1.5 ${isDark ? 'text-emerald-400' : 'text-emerald-700 font-medium'}`}>
                <ShieldCheck className="h-4 w-4" />
                <span>Zero Foreign Cloud Lock-in • NPR Billing</span>
              </span>
              <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Tier-3 Kathmandu DC</span>
            </div>
          </motion.div>

          {/* Bento Cell 2: Enterprise Transformation (Spans 5 cols) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.55, delay: 0.15 }}
            whileHover={{ y: -2 }}
            className={`lg:col-span-5 rounded-3xl border p-7 sm:p-9 transition-all relative overflow-hidden backdrop-blur-2xl shadow-xl flex flex-col justify-between group cursor-pointer ${
              isDark
                ? 'border-white/10 bg-white/[0.03] hover:border-indigo-500/40 hover:bg-white/[0.05]'
                : 'border-slate-300/90 bg-white hover:border-indigo-500/50 shadow-sm'
            }`}
            onClick={() => onOpenConsultation('Commercial Enterprise AI Transformation')}
            data-cursor="Scale"
          >
            <div>
              <div className="flex items-center justify-between gap-4 mb-5">
                <div className="flex items-center gap-3">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border shadow-inner ${
                    isDark ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' : 'bg-indigo-50 border-indigo-200 text-indigo-700'
                  }`}>
                    <Building2 className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className={`text-xl font-bold font-display ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {t.about.visionHeading}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-[11px] font-mono uppercase tracking-wider font-semibold ${
                        isDark ? 'text-indigo-400' : 'text-indigo-700'
                      }`}>
                        {isNepali ? 'इन्टरप्राइज एआई रूपान्तरण' : 'Enterprise Scale'}
                      </span>
                      <span className={`text-[10px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {isNepali ? '(Commercial AI)' : '(संस्थागत रूपान्तरण)'}
                      </span>
                    </div>
                  </div>
                </div>
                <ArrowUpRight className="h-5 w-5 text-slate-400 group-hover:text-indigo-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>

              <p className={`text-sm leading-relaxed mb-6 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                {t.about.visionBody}
              </p>

              <div className={`space-y-2.5 pt-5 border-t ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                <div className={`flex items-start gap-2.5 p-3 rounded-xl border ${
                  isDark ? 'border-white/5 bg-white/[0.02]' : 'border-slate-200 bg-slate-50'
                }`}>
                  <CheckCircle2 className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
                  <span className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    {isNepali
                      ? 'वाणिज्य बैंक र वित्तीय संस्थाहरूका लागि NRB मापदण्ड अनुकूल'
                      : 'NRB IT guideline aligned architectures for commercial banks'}
                  </span>
                </div>
                <div className={`flex items-start gap-2.5 p-3 rounded-xl border ${
                  isDark ? 'border-white/5 bg-white/[0.02]' : 'border-slate-200 bg-slate-50'
                }`}>
                  <CheckCircle2 className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
                  <span className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    {isNepali
                      ? 'हप्तौंभित्र कार्यशील प्रोटोटाइप र भौतिक इन्जिनियरिङ सहयोग'
                      : 'Rapid 2-week MVP sprints with on-site deployment in Nepal'}
                  </span>
                </div>
              </div>
            </div>

            <div className={`mt-6 pt-4 border-t flex items-center justify-between text-xs font-mono ${
              isDark ? 'border-white/10 text-slate-400' : 'border-slate-200 text-slate-600'
            }`}>
              <span className={`flex items-center gap-1.5 ${isDark ? 'text-indigo-400' : 'text-indigo-700 font-medium'}`}>
                <Zap className="h-4 w-4" />
                <span>Production Ready • Full IP Transfer</span>
              </span>
              <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>रू / $ Invoicing</span>
            </div>
          </motion.div>

        </div>

        {/* Four Core Engineering Pillars Bento Grid (Staggered Entrance) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {pillars.map((pillar, idx) => {
            const IconComp = pillar.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: 0.1 + idx * 0.08 }}
                whileHover={{ y: -3, scale: 1.01 }}
                onClick={() => onOpenConsultation(`Inquiry: ${pillar.title}`)}
                data-cursor="Pillar"
                className={`rounded-2xl border p-6 transition-all flex flex-col justify-between group backdrop-blur-xl cursor-pointer ${
                  isDark
                    ? 'border-white/10 bg-white/[0.02] hover:border-white/25 hover:bg-white/[0.05]'
                    : 'border-slate-300/90 bg-white hover:border-slate-400 hover:shadow-md'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl border group-hover:scale-105 transition-transform ${
                      isDark ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}>
                      <IconComp className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                      isDark ? 'bg-white/[0.04] border-white/10 text-emerald-400' : 'bg-emerald-50 border-emerald-300 text-emerald-800'
                    }`}>
                      {pillar.tag}
                    </span>
                  </div>

                  <h4 className={`text-base font-bold leading-snug font-display mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {pillar.title}
                  </h4>
                  <div className={`text-[11px] font-mono mb-2 ${
                    isDark ? 'text-emerald-400/90' : 'text-emerald-700 font-medium'
                  }`}>
                    {pillar.titleSecondary}
                  </div>

                  <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    {pillar.description}
                  </p>
                </div>

                <div className={`pt-4 mt-4 border-t flex items-center justify-between font-mono ${
                  isDark ? 'border-white/10' : 'border-slate-200'
                }`}>
                  <div>
                    <div className={`text-sm font-bold tabular-nums ${isDark ? 'text-white' : 'text-slate-900'}`}>{pillar.stat}</div>
                    <div className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>{pillar.statLabel}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block">{pillar.dualPrice}</span>
                    <ArrowUpRight className="h-4 w-4 text-slate-500 group-hover:text-emerald-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all inline-block mt-0.5" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bento Stat Strip (Staggered Entrance) */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className={`rounded-3xl border p-6 sm:p-8 mb-12 shadow-sm ${
            isDark
              ? 'border-white/10 bg-gradient-to-r from-emerald-950/20 via-black/40 to-indigo-950/20 text-slate-100'
              : 'border-slate-200 bg-white text-slate-800'
          }`}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono tracking-tight">
                {t.about.stats.stat1Val}
              </div>
              <div className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                {t.about.stats.stat1Label}
              </div>
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                {isNepali ? '४०+ बैंक तथा संस्था' : '40+ Orgs in Nepal'}
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold text-indigo-600 dark:text-indigo-400 font-mono tracking-tight">
                {t.about.stats.stat2Val}
              </div>
              <div className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                {t.about.stats.stat2Label}
              </div>
              <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-mono">
                {isNepali ? 'रू / $ दुवै बिलिङ' : 'eSewa / Khalti / USD'}
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold text-amber-600 dark:text-amber-400 font-mono tracking-tight">
                {t.about.stats.stat3Val}
              </div>
              <div className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                {t.about.stats.stat3Label}
              </div>
              <div className="text-[10px] text-amber-600 dark:text-amber-400 font-mono">
                {isNepali ? 'नेपालमा प्रत्यक्ष सहयोग' : 'Kathmandu HQ Support'}
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold text-teal-600 dark:text-cyan-400 font-mono tracking-tight">
                {t.about.stats.stat4Val}
              </div>
              <div className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                {t.about.stats.stat4Label}
              </div>
              <div className="text-[10px] text-teal-600 dark:text-cyan-400 font-mono">
                {isNepali ? 'देवनागरी मोडल शुद्धता' : '98%+ Accuracy'}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Technical Capabilities Badges (Staggered Entrance) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="text-center space-y-5"
        >
          <h4 className={`text-xs font-mono uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {t.about.techStackHeading} • <span>Devanagari & English AI Architecture</span>
          </h4>

          <div className="flex flex-wrap items-center justify-center gap-2.5 max-w-4xl mx-auto">
            {techBadges.map((badge, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: 0.3 + idx * 0.05 }}
                className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-medium ${
                  isDark
                    ? 'border-white/10 bg-white/[0.03] text-slate-300'
                    : 'border-slate-300 bg-white text-slate-700 shadow-xs'
                }`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
                <span>{badge.label}</span>
                <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400">({badge.sub})</span>
              </motion.div>
            ))}
          </div>

          <div className="pt-3">
            <button
              type="button"
              onClick={() => onOpenConsultation('Enterprise Sovereign AI Strategy')}
              className={`inline-flex items-center gap-2 rounded-full px-6 py-3 text-xs font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer ${
                isDark 
                  ? 'bg-white text-slate-950 hover:bg-slate-200' 
                  : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/20'
              }`}
              data-cursor="Book"
              aria-label="Schedule a sovereign AI scoping session"
            >
              <span className={isNepali ? "font-['Noto_Sans_Devanagari']" : ''}>
                {isNepali ? 'हाम्रा एआई वास्तुकारसँग छलफल गर्नुहोस् (Book Scoping)' : 'Discuss Sovereign AI Architecture with Us (रू & $)'}
              </span>
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </motion.div>

      </div>
    </section>
  );
};
