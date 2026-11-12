import React from 'react';
import { 
  Grid, 
  Wrench, 
  Sparkles, 
  Briefcase, 
  ShieldCheck, 
  ArrowRight,
  LayoutDashboard,
  ShoppingBag
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
      id: 'command-center' as AppPage,
      titleEn: 'Command Center',
      titleNe: 'कमान्ड सेन्टर',
      descEn: 'All-in-one workspace with real-time NRB forex, tax estimator, and land converter.',
      descNe: 'राष्ट्र बैंक विनिमय दर, आयकर हिसाब र जग्गा रूपान्तरणको एकीकृत कार्यथलो।',
      icon: LayoutDashboard,
      tag: '01',
    },
    {
      id: 'daily' as AppPage,
      titleEn: 'Daily AI Utilities',
      titleNe: 'दैनिक एआई सेवाहरू',
      descEn: 'Ward Nibedan application studio, Devanagari OCR, 24kHz voice, and Kalimati rates.',
      descNe: 'वडा निवेदन स्टुडियो, देवनागरी ओसीआर, न्युरल आवाज र कालिमाटी बजार दर।',
      icon: Wrench,
      tag: '02',
    },
    {
      id: 'directory' as AppPage,
      titleEn: 'Tools Directory',
      titleNe: 'टुल्स डाइरेक्टरी',
      descEn: 'Browse 40+ curated AI tools with NPR pricing, Nepal IP readiness, and eSewa / Khalti billing.',
      descNe: '४०+ प्रमाणित एआई टुल्स, नेपाली रूपैयाँमा रूपान्तरण र स्थानीय भुक्तानी स्थिति।',
      icon: Grid,
      tag: '03',
    },
    {
      id: 'free' as AppPage,
      titleEn: 'Free AI & Intelligence',
      titleNe: 'निःशुल्क एआई र समाचार',
      descEn: 'Credit card-free AI APIs, multimodal document extractor, and Nepal AI regulatory bulletins.',
      descNe: 'कुनै कार्ड बिना चल्ने निःशुल्क एआई एपीआईहरू र ताजा नीतिगत सूचनाहरू।',
      icon: Sparkles,
      tag: '04',
    },
    {
      id: 'consulting' as AppPage,
      titleEn: 'Enterprise Advisory',
      titleNe: 'संस्थागत परामर्श',
      descEn: 'Fixed-scope engineering sprints with senior architects in Kathmandu and full IP ownership.',
      descNe: 'नेपाली बैंक तथा उद्यमहरूका लागि सुरक्षित एआई पूर्वाधार र भ्याट बिलिङसहितको सेवा।',
      icon: Briefcase,
      tag: '05',
    },
    {
      id: 'commerce' as AppPage,
      titleEn: 'NepalAI Commerce',
      titleNe: 'नेपालएआई कमर्स',
      descEn: 'Multi-tenant storefront & merchant portal with eSewa, Khalti, Nepal QR and instant WhatsApp order alerts.',
      descNe: 'ईसेवा, खल्ती, नेपाल क्युआर र ह्वाट्सएप अर्डर प्रेषणसहितको बहु-व्यापारिक डिजिटल स्टोर।',
      icon: ShoppingBag,
      tag: '06',
    },
    {
      id: 'compliance' as AppPage,
      titleEn: 'Compliance & FAQ',
      titleNe: 'नियम तथा मद्दत',
      descEn: 'Official NRB $500 Dollar Card regulations, CIB cybersecurity advice, and direct support.',
      descNe: 'राष्ट्र बैंकको $५०० डलर कार्ड नियम, साइबर सुरक्षा उपाय र प्रत्यक्ष सोधपुछ।',
      icon: ShieldCheck,
      tag: '07',
    },
  ];

  return (
    <section
      className={`py-12 sm:py-16 md:py-20 border-t transition-colors ${
        isDark ? 'border-white/10 bg-[#06080e]' : 'border-slate-200 bg-white'
      }`}
      aria-label="Platform page portals"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <div className="text-[11px] sm:text-xs font-mono font-semibold tracking-wider text-emerald-600 dark:text-emerald-400 mb-2 uppercase">
            {isNe ? 'निर्देशिका · प्लेटफर्म' : 'Directory · Platform'}
          </div>
          <h2 className={`text-2xl sm:text-3xl font-extrabold tracking-tight font-display ${
            isDark ? 'text-white' : 'text-slate-950'
          }`}>
            {isNe ? 'नेपालएआई सेवाहरू' : 'Explore NepalAI'}
          </h2>
          <p className={`mt-2 text-xs sm:text-sm leading-relaxed ${
            isDark ? 'text-slate-300' : 'text-slate-600'
          }`}>
            {isNe
              ? 'उत्पादकता, नियमन र दैनिक एआई उपकरणहरू — एकै क्लिकमा।'
              : 'Direct access to productivity, compliance, and developer tools.'}
          </p>
        </div>

        {/* Clean 6-Portal Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {portals.map((portal) => {
            const Icon = portal.icon;
            return (
              <div
                key={portal.id}
                onClick={() => handleNavigate(portal.id)}
                className={`p-5 sm:p-6 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group ${
                  isDark
                    ? 'bg-white/[0.02] border-white/10 hover:border-emerald-500/40 hover:bg-white/[0.04]'
                    : 'bg-slate-50/60 border-slate-200 hover:border-slate-300 hover:bg-white shadow-2xs hover:shadow-xs'
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
                  <div className="flex items-center justify-between mb-3.5">
                    <div
                      className={`p-2.5 rounded-xl border transition-colors ${
                        isDark
                          ? 'border-white/10 bg-white/[0.04] text-slate-200 group-hover:border-emerald-500/40 group-hover:text-emerald-400'
                          : 'border-slate-200 bg-white text-slate-800 group-hover:border-emerald-400 group-hover:text-emerald-700 shadow-2xs'
                      }`}
                    >
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 font-semibold">
                      {portal.tag}
                    </span>
                  </div>

                  <h3
                    className={`text-base font-bold font-display transition-colors group-hover:text-emerald-600 dark:group-hover:text-emerald-400 ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    {isNe ? portal.titleNe : portal.titleEn}
                  </h3>

                  <p
                    className={`mt-2 text-xs sm:text-sm leading-relaxed ${
                      isDark ? 'text-slate-300' : 'text-slate-600'
                    }`}
                  >
                    {isNe ? portal.descNe : portal.descEn}
                  </p>
                </div>

                <div className="mt-5 pt-3.5 border-t border-slate-200/80 dark:border-white/5 flex items-center justify-between text-xs">
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 group-hover:gap-1.5 transition-all">
                    <span>{isNe ? 'खोल्नुहोस्' : 'Open'}</span>
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                  <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                    /{portal.id}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
