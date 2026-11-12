import React from 'react';
import { 
  Cpu, 
  CreditCard, 
  Lock, 
  Server, 
  ArrowUpRight
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
}) => {
  const isDark = theme === 'dark';
  const isNepali = language === 'ne';

  const pillars = [
    {
      icon: Cpu,
      title: isNepali ? 'देवनागरी भाषा प्रविधि' : 'Devanagari Intelligence',
      desc: isNepali
        ? 'नेपाली भाषा र व्याकरण बुझ्ने मोडल, वडा निवेदन ढाँचाहरू र उच्च-शुद्धता ओसीआर।'
        : 'Vernacular Devanagari NLP, official ward application generator, and high-accuracy OCR.',
      label: 'NLP & OCR',
    },
    {
      icon: CreditCard,
      title: isNepali ? 'स्थानीय भुक्तानी प्रणाली' : 'Local Payment Rails (NPR)',
      desc: isNepali
        ? 'eSewa, Khalti र FonePay मार्फत सिधै रुपैयाँमा भुक्तानी तथा आधिकारिक भ्याट बिलिङ।'
        : 'Native NPR settlement and VAT invoicing via eSewa, Khalti, and FonePay without card limits.',
      label: 'NPR Billing',
    },
    {
      icon: Lock,
      title: isNepali ? 'नियमन र राष्ट्र बैंक अनुपालन' : 'Regulatory Grounding',
      desc: isNepali
        ? 'नेपाल राष्ट्र बैंकको विदेशी मुद्रा तथा आन्तरिक राजस्व विभागको आयकर नियम अनुसार।'
        : 'Grounded in Nepal Rastra Bank foreign exchange directives and IRD tax legislation.',
      label: 'NRB & IRD',
    },
    {
      icon: Server,
      title: isNepali ? 'स्थानीय डेटा स्वायत्तता' : 'Data Sovereignty',
      desc: isNepali
        ? 'काठमाडौंमा स्थानीय होस्टिङ, कडा गोपनीयता संरक्षण र शून्य अनाधिकृत डेटा भण्डारण।'
        : 'Locally hosted infrastructure in Kathmandu with strict privacy and zero data leakage.',
      label: 'Kathmandu Cloud',
    },
  ];

  return (
    <section
      id="about"
      className={`py-12 sm:py-16 md:py-20 border-t transition-colors duration-300 ${
        isDark ? 'border-white/10 bg-[#06080e]' : 'border-slate-200 bg-white'
      }`}
      aria-labelledby="about-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <div className="text-[11px] sm:text-xs font-mono font-semibold tracking-wider text-emerald-600 dark:text-emerald-400 mb-2 uppercase">
            {isNepali ? 'संरचना · सार्वभौम पूर्वाधार' : 'Architecture · Sovereign Infrastructure'}
          </div>

          <h2
            id="about-heading"
            className={`text-2xl sm:text-3xl font-extrabold tracking-tight font-display ${
              isDark ? 'text-white' : 'text-slate-950'
            }`}
          >
            {isNepali 
              ? 'नेपालको दैनिक आवश्यकता अनुसार निर्मित'
              : 'Engineered for Nepal’s Daily Workflows'}
          </h2>

          <p
            className={`mt-2.5 text-xs sm:text-sm leading-relaxed max-w-xl mx-auto ${
              isDark ? 'text-slate-300' : 'text-slate-600'
            }`}
          >
            {isNepali
              ? 'स्थानीय भुक्तानी प्रणाली, मौलिक देवनागरी मोडल, र राष्ट्र बैंक नियम अनुकूल प्रविधि।'
              : 'Local payment settlement, native Devanagari models, and strict regulatory compliance.'}
          </p>
        </div>

        {/* 4 Clean Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-8 sm:mb-10">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={idx}
                className={`p-5 sm:p-6 rounded-2xl border transition-all ${
                  isDark
                    ? 'border-white/10 bg-white/[0.02] hover:border-white/20'
                    : 'border-slate-200 bg-slate-50/60 hover:border-slate-300 hover:bg-white shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between mb-3.5">
                  <div className={`p-2.5 rounded-xl border ${
                    isDark
                      ? 'border-white/10 bg-white/[0.04] text-emerald-400'
                      : 'border-slate-200 bg-white text-emerald-700 shadow-2xs'
                  }`}>
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                    {pillar.label}
                  </span>
                </div>

                <h3 className={`text-sm sm:text-base font-bold font-display mb-1.5 ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}>
                  {pillar.title}
                </h3>

                <p className={`text-xs leading-relaxed ${
                  isDark ? 'text-slate-300' : 'text-slate-600'
                }`}>
                  {pillar.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Minimal Provenance Strip */}
        <div
          className={`rounded-2xl border p-4 sm:p-6 transition-all ${
            isDark
              ? 'border-white/10 bg-[#090d18]'
              : 'border-slate-200 bg-slate-50/80 shadow-2xs'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                {isNepali ? 'इन्जिनियरिङ र नेतृत्व' : 'Engineering & Leadership'}
              </div>
              <div className={`text-sm sm:text-base font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {isNepali
                  ? 'स्क्यामस्पाइक सोलुसन्स प्रा. लि. · प्रकाश सुवेदी (संस्थापक)'
                  : 'Scamspike Solutions Pvt. Ltd. · Prakash Suvedi (Founder)'}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-300">
                {isNepali
                  ? 'काठमाडौं, नेपाल · साइबर सुरक्षा, सार्वभौम भाषा मोडल र स्थानीय गेटवे इन्जिनियरिङ'
                  : 'Kathmandu, Nepal · Cybersecurity, vernacular language modeling & domestic gateway integration'}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              <a
                href="https://prakashsuvedi.com.np"
                target="_blank"
                rel="noopener noreferrer"
                className={`px-3 py-1.5 rounded-lg border text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                  isDark
                    ? 'border-white/10 bg-white/5 text-slate-200 hover:text-white hover:bg-white/10'
                    : 'border-slate-300 bg-white text-slate-800 hover:bg-slate-100 shadow-2xs'
                }`}
              >
                <span>prakashsuvedi.com.np</span>
                <ArrowUpRight className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              </a>

              <a
                href="https://scamspike.com"
                target="_blank"
                rel="noopener noreferrer"
                className={`px-3 py-1.5 rounded-lg border text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                  isDark
                    ? 'border-white/10 bg-white/5 text-slate-200 hover:text-white hover:bg-white/10'
                    : 'border-slate-300 bg-white text-slate-800 hover:bg-slate-100 shadow-2xs'
                }`}
              >
                <span>scamspike.com</span>
                <ArrowUpRight className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              </a>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
