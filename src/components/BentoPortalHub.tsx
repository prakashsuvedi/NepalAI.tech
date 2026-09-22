import React from 'react';
import { motion } from 'motion/react';
import { 
  Grid, 
  Wrench, 
  Sparkles, 
  Briefcase, 
  ShieldCheck, 
  ArrowRight,
  CreditCard,
  FileText,
  FileSearch,
  CheckCircle2
} from 'lucide-react';
import { AppPage, ThemeMode, Language } from '../types';

interface BentoPortalHubProps {
  onSelectPage: (page: AppPage) => void;
  theme: ThemeMode;
  language: Language;
}

export const BentoPortalHub: React.FC<BentoPortalHubProps> = ({
  onSelectPage,
  theme,
  language,
}) => {
  const isDark = theme === 'dark';
  const isNe = language === 'ne';

  const handleNavigate = (page: AppPage) => {
    onSelectPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const portals = [
    {
      id: 'directory' as AppPage,
      titleEn: 'Verified Tools Directory',
      titleNe: 'प्रमाणित टुल्स डाइरेक्टरी',
      descEn: 'Browse 40+ curated AI tools with NPR converted pricing, Nepal IP readiness, and eSewa / Khalti & Dollar Card support.',
      descNe: '४०+ प्रमाणित एआई टुल्स, नेपाली रूपैयाँमा रूपान्तरण, र डलर कार्ड तथा इसेवा/खल्ती भुक्तानी स्थिति।',
      icon: Grid,
      color: 'emerald',
      badgeEn: '40+ Tools Listed',
      badgeNe: '४०+ टुल्स सूचीकृत',
      featuresEn: ['NPR vs USD Price Converter', 'Nepal IP & VPN verification', 'Interactive AI Stack Builder'],
      featuresNe: ['नेपाली रूपैयाँ रूपान्तरक', 'नेपाल आइपी अनुकूलता', 'स्ट्याक क्याल्कुलेटर'],
    },
    {
      id: 'daily' as AppPage,
      titleEn: 'Daily Sovereign AI Utilities',
      titleNe: 'दैनिक एआई सेवाहरू',
      descEn: 'Hands-on sovereign tools tailored for Nepal: Devanagari application writer, Nepali voice synthesis, document OCR, and salary tax calculator.',
      descNe: 'नेपाल-केन्द्रित दैनिक एआई: नेपाली सरकारी निवेदन लेखक, देवनागरी आवाज, कागजात स्क्यानर र तलब कर क्याल्कुलेटर।',
      icon: Wrench,
      color: 'indigo',
      badgeEn: 'Zero Configuration',
      badgeNe: 'तत्काल प्रयोग गर्न सकिने',
      featuresEn: ['Devanagari Letter & Application Writer', 'Nepali Speech-to-Text & TTS', 'NPR Salary & Remittance Tax Engine'],
      featuresNe: ['सरकारी तथा व्यक्तिगत निवेदन', 'नेपाली बोली तथा आवाज', 'नेपाल तलब तथा कर क्याल्कुलेटर'],
    },
    {
      id: 'free' as AppPage,
      titleEn: 'Free AI & Intelligence Hub',
      titleNe: 'निःशुल्क एआई र समाचार',
      descEn: 'Explore top free AI APIs requiring no credit cards, multimodal data extractor for Nepali documents, and live Nepal AI bulletins.',
      descNe: 'कुनै अन्तर्राष्ट्रिय कार्ड बिना चल्ने निःशुल्क एआई एपीआईहरू, नागरिकता/लालपुर्जा डेटा एक्सट्र्याक्टर र ताजा समाचार।',
      icon: Sparkles,
      color: 'amber',
      badgeEn: '$0 / Month APIs',
      badgeNe: 'रु ० निःशुल्क एपीआई',
      featuresEn: ['Multimodal Nepali Document Extractor', 'Credit Card-free LLM Endpoints', 'Live Nepal AI Intelligence News'],
      featuresNe: ['नेपाली कागजात डेटा एक्सट्र्याक्टर', 'निःशुल्क मोडेल एपीआईहरू', 'नेपाल एआई तथा नियमन समाचार'],
    },
    {
      id: 'consulting' as AppPage,
      titleEn: 'Enterprise Consulting & Pipelines',
      titleNe: 'संस्थागत परामर्श तथा इन्जिनियरिङ',
      descEn: 'Custom AI architecture for banks, fintech, hospitals, and enterprises. Dual invoicing in NPR (PAN/VAT) & USD with full IP transfer.',
      descNe: 'नेपाली बैंक, वित्तीय संस्था, अस्पताल र उद्यमहरूका लागि सुरक्षित एआई पूर्वाधार र भ्याट बिलिङसहितको परामर्श सेवा।',
      icon: Briefcase,
      color: 'blue',
      badgeEn: 'NPR PAN/VAT Billing',
      badgeNe: 'आधिकारिक भ्याट बिलिङ',
      featuresEn: ['On-premise & Private VPC Deployments', 'Sovereign Devanagari LLM Fine-tuning', 'Fixed-Scope Sprints & Retainers'],
      featuresNe: ['स्थानीय डाटा सेन्टर पूर्वाधार', 'नेपाली भाषा मोडेल तालिम', 'निश्चित स्कोप तथा स्प्रिन्ट'],
    },
    {
      id: 'compliance' as AppPage,
      titleEn: 'Compliance & Cyber Safety',
      titleNe: 'नियम, सुरक्षा तथा सोधपुछ',
      descEn: 'Official Nepal Rastra Bank $500 Dollar Card regulations, CIB cyber safety guidelines, frequently asked questions, and direct support.',
      descNe: 'नेपाल राष्ट्र बैंकको $५०० डलर कार्ड नियमन, सीआईबी साइबर सुरक्षा सल्लाह, प्रायः सोधिने प्रश्न र प्रत्यक्ष सम्पर्क।',
      icon: ShieldCheck,
      color: 'rose',
      badgeEn: 'NRB & CIB Verified',
      badgeNe: 'राष्ट्र बैंक तथा सीआईबी नियम',
      featuresEn: ['Dollar Card $500 Annual Cap Guidance', 'CIB Cyber Fraud & Malicious App Alerts', 'Instant Consultation & Direct Inquiries'],
      featuresNe: ['वार्षिक $५०० डलर कार्ड सल्लाह', 'साइबर ठगी र नक्कली एपबाट बच्ने उपाय', 'परामर्श बुकिङ तथा सोधपुछ'],
    },
  ];

  return (
    <section
      className={`py-16 transition-colors ${
        isDark ? 'bg-[#06080e]' : 'bg-[#f8fafc]'
      }`}
      aria-label="Platform page portals"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-semibold mb-4">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{isNe ? 'प्लेटफर्मका प्रमुख खण्डहरू' : 'Modular Platform Hub'}</span>
          </div>
          <h2 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            {isNe 
              ? 'लामो स्क्रोलिङ बिना आवश्यक खण्डमा तुरुन्तै पुग्नुहोस्' 
              : 'Direct Page Navigation — Zero Endless Scrolling'}
          </h2>
          <p className={`mt-3 text-sm leading-relaxed ${
            isDark ? 'text-slate-400' : 'text-slate-600'
          }`}>
            {isNe
              ? 'नेपाल एआई प्लेटफर्मलाई ५ वटा व्यवस्थित र छिटो खुल्ने खण्डहरूमा विभाजन गरिएको छ। आफूलाई चाहिने खण्डमा क्लिक गर्नुहोस्:'
              : 'The platform is organized into dedicated, lightweight pages so you can focus directly on the tools, directory, or advisory you need without infinite vertical scrolling:'}
          </p>
        </div>

        {/* Bento Portal Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {portals.map((portal) => {
            const Icon = portal.icon;
            return (
              <motion.div
                key={portal.id}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                onClick={() => handleNavigate(portal.id)}
                className={`relative p-6 sm:p-7 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between group ${
                  isDark
                    ? 'bg-[#090d18]/80 border-white/[0.08] hover:border-emerald-500/40 hover:bg-[#0c1222] shadow-[0_4px_24px_rgba(0,0,0,0.4)]'
                    : 'bg-white border-slate-200/90 hover:border-emerald-400 hover:shadow-md shadow-xs'
                }`}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleNavigate(portal.id);
                  }
                }}
                aria-label={`Open ${portal.titleEn}`}
              >
                <div>
                  {/* Top Badge & Icon */}
                  <div className="flex items-center justify-between mb-5">
                    <div
                      className={`p-3 rounded-2xl border transition-colors ${
                        isDark
                          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20'
                          : 'border-emerald-200 bg-emerald-50 text-emerald-700 group-hover:bg-emerald-100'
                      }`}
                    >
                      <Icon className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <span
                      className={`text-[11px] font-mono font-semibold px-2.5 py-1 rounded-full border ${
                        isDark
                          ? 'border-white/10 bg-white/[0.04] text-slate-300'
                          : 'border-slate-200 bg-slate-100 text-slate-700'
                      }`}
                    >
                      {isNe ? portal.badgeNe : portal.badgeEn}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3
                    className={`text-lg font-bold transition-colors group-hover:text-emerald-400 ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    {isNe ? portal.titleNe : portal.titleEn}
                  </h3>
                  <p
                    className={`mt-2 text-xs leading-relaxed ${
                      isDark ? 'text-slate-400' : 'text-slate-600'
                    }`}
                  >
                    {isNe ? portal.descNe : portal.descEn}
                  </p>

                  {/* Feature Checkmarks */}
                  <div className="mt-5 space-y-2 border-t border-slate-500/15 pt-4">
                    {(isNe ? portal.featuresNe : portal.featuresEn).map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" aria-hidden="true" />
                        <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>
                          {feat}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom CTA Button */}
                <div className="mt-6 pt-4 border-t border-slate-500/15 flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-500 flex items-center gap-1.5 group-hover:translate-x-1 transition-transform">
                    <span>{isNe ? 'पृष्ठ खोल्नुहोस्' : 'Explore Page'}</span>
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span className={`text-[11px] font-mono ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    nepalai.tech/{portal.id}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
