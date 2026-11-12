import React, { useState } from 'react';
import {
  ArrowRight,
  Search,
  FileText,
  Calculator,
  ArrowRightLeft,
  Scan,
  Check,
  Copy,
  LayoutDashboard
} from 'lucide-react';
import { HeroConfig, ThemeMode, Language, AppPage } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { Button } from './ui/Button';
import { HimalayanWireframeScene } from './3d/HimalayanWireframeScene';
import { Card3DTilt } from './3d/Card3DTilt';

interface HeroProps {
  config: HeroConfig;
  theme: ThemeMode;
  language: Language;
  onOpenConsultation: () => void;
  onExploreConsulting: () => void;
  onOpenAdminPanel: () => void;
  onOpenSearch?: () => void;
  onSelectPage?: (page: AppPage) => void;
}

export const Hero: React.FC<HeroProps> = ({
  theme,
  language,
  onOpenSearch,
  onSelectPage,
}) => {
  const isDark = theme === 'dark';
  const isNepali = language === 'ne';

  const [activePreview, setActivePreview] = useState<'nibedan' | 'tax' | 'forex' | 'ocr'>('nibedan');
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section
      className={`relative pt-10 pb-14 sm:pt-16 sm:pb-24 transition-colors duration-300 overflow-hidden ${
        isDark
          ? 'bg-[#080d1a] text-white'
          : 'bg-gradient-to-b from-white via-slate-50/80 to-slate-100/40 text-slate-900 border-b border-slate-200/80'
      }`}
      aria-label="NepalAI Platform Introduction"
    >
      {/* Luxury Ambient Lighting Glows (Cyan & Sky Blue, 0ms load penalty) */}
      <div
        className="absolute top-1/2 right-[-5%] -translate-y-1/2 w-[520px] h-[520px] rounded-full blur-3xl pointer-events-none opacity-60 dark:opacity-75"
        style={{
          background: isDark
            ? 'radial-gradient(circle, rgba(6, 182, 212, 0.14) 0%, rgba(14, 165, 233, 0.05) 45%, transparent 70%)'
            : 'radial-gradient(circle, rgba(6, 182, 212, 0.10) 0%, rgba(14, 165, 233, 0.04) 45%, transparent 70%)',
        }}
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-16 left-[-5%] w-[420px] h-[420px] rounded-full blur-3xl pointer-events-none opacity-40 dark:opacity-50"
        style={{
          background: isDark
            ? 'radial-gradient(circle, rgba(56, 189, 248, 0.08) 0%, transparent 65%)'
            : 'radial-gradient(circle, rgba(6, 182, 212, 0.05) 0%, transparent 65%)',
        }}
        aria-hidden="true"
      />

      {/* 3D Himalayan Topographic Contour Horizon (Masked to right side only, 0 particles, 120 FPS GPU transforms) */}
      <HimalayanWireframeScene theme={theme} />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
          
          {/* Left Column: Clear Value Proposition, Search & Actions (100% particle-free zone) */}
          <div className="lg:col-span-6 text-center lg:text-left">
            
            {/* Minimalist Typographic Eyebrow */}
            <div className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-mono font-medium tracking-wider text-cyan-600 dark:text-cyan-400 mb-3 uppercase">
              <span>{isNepali ? 'नेपालएआई' : 'NEPALAI'}</span>
              <span aria-hidden="true" className="opacity-50">·</span>
              <span>{isNepali ? 'सार्वभौम इन्टेलिजेन्स र क्लाउड' : 'SOVEREIGN CLOUD & AI'}</span>
              <span aria-hidden="true" className="opacity-50">·</span>
              <span>{isNepali ? 'काठमाडौं' : 'KATHMANDU'}</span>
            </div>

            {/* Perfect, High-Legibility Display Headline */}
            <h1
              className={`text-3xl sm:text-5xl lg:text-[3.25rem] font-extrabold tracking-tight font-display leading-[1.12] text-balance ${
                isDark ? 'text-white' : 'text-slate-950'
              }`}
            >
              {isNepali ? (
                <>
                  नेपालको आफ्नै <br className="hidden sm:inline" />
                  <span className="bg-gradient-to-r from-cyan-600 via-sky-600 to-blue-600 bg-clip-text text-transparent dark:from-cyan-400 dark:via-sky-300 dark:to-blue-400">
                    एआई प्लेटफर्म।
                  </span>
                </>
              ) : (
                <>
                  Nepal’s Sovereign <br className="hidden sm:inline" />
                  <span className="bg-gradient-to-r from-cyan-600 via-sky-600 to-blue-600 bg-clip-text text-transparent dark:from-cyan-400 dark:via-sky-300 dark:to-blue-400">
                    AI Platform.
                  </span>
                </>
              )}
            </h1>

            {/* Pristine, Highly Legible Tagline */}
            <p
              className={`mt-4 text-base sm:text-lg leading-relaxed max-w-xl mx-auto lg:mx-0 font-normal ${
                isDark ? 'text-slate-300' : 'text-slate-600'
              }`}
            >
              {isNepali
                ? 'आयकर हिसाब, वडा निवेदन, राष्ट्र बैंक विनिमय दर, र दैनिक एआई — एउटै सरल ठाउँमा।'
                : 'Tax calculations, official ward applications, NRB exchange rates, and Devanagari AI — unified in one clean workspace.'}
            </p>

            {/* Tactile Command Input with 3D Tilt */}
            <div className="mt-6 sm:mt-7 w-full max-w-lg mx-auto lg:mx-0">
              <Card3DTilt maxTilt={4} depth={6} className="rounded-xl">
                <div
                  onClick={onOpenSearch}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onOpenSearch?.(); }}
                  className={`flex items-center justify-between px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-xl border shadow-xs transition-all cursor-pointer group ${
                    isDark
                      ? 'border-slate-800 bg-[#0d1527]/95 hover:bg-[#111a30] text-slate-300 hover:border-cyan-400/50'
                      : 'border-slate-300/90 bg-white/95 hover:bg-white text-slate-700 hover:border-cyan-500/70 shadow-xs'
                  }`}
                  aria-label="Open search command palette"
                >
                  <div className="flex items-center gap-2.5 text-xs sm:text-sm">
                    <Search className="h-4 w-4 text-cyan-600 dark:text-cyan-400 shrink-0" aria-hidden="true" />
                    <span className="truncate font-medium">
                      {isNepali ? 'खोज्नुहोस्: आयकर, डलर दर, वडा निवेदन...' : 'Search tools, forex rates, ward letters, tax...'}
                    </span>
                  </div>
                  <kbd className="hidden sm:inline-flex text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10">
                    Ctrl+K
                  </kbd>
                </div>
              </Card3DTilt>

              {/* Minimalist Quick Shortcuts */}
              <div className="mt-3 flex items-center gap-1.5 sm:gap-2 flex-wrap justify-center lg:justify-start text-xs">
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  {isNepali ? 'द्रुत:' : 'Quick:'}
                </span>
                {[
                  { label: isNepali ? 'कमान्ड सेन्टर' : 'Command Center', page: 'command-center' as AppPage },
                  { label: isNepali ? 'आयकर हिसाब' : 'Income Tax', page: 'daily' as AppPage },
                  { label: isNepali ? 'डलर दर' : 'NRB Forex', page: 'daily' as AppPage },
                  { label: isNepali ? 'वडा निवेदन' : 'Ward Nibedan', page: 'daily' as AppPage },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onSelectPage?.(item.page)}
                    className={`text-[11px] px-2.5 py-1 rounded-md border transition-colors cursor-pointer ${
                      isDark
                        ? 'border-slate-800 bg-slate-900/40 text-slate-300 hover:bg-cyan-500/10 hover:text-cyan-400 hover:border-cyan-500/30'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-cyan-50 hover:text-cyan-800 hover:border-cyan-300'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Clean Action Buttons */}
            <div className="mt-7 sm:mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-3">
              <Button
                variant="primary"
                size="md"
                onClick={() => onSelectPage?.('command-center')}
                leftIcon={<LayoutDashboard className="h-4 w-4" aria-hidden="true" />}
              >
                {isNepali ? 'कमान्ड सेन्टर खोल्नुहोस्' : 'Open Command Center'}
              </Button>

              <Button
                variant="outline"
                size="md"
                onClick={() => onSelectPage?.('daily')}
                rightIcon={<ArrowRight className="h-4 w-4" aria-hidden="true" />}
              >
                {isNepali ? 'दैनिक टुल्स हेर्नुहोस्' : 'Explore Utilities'}
              </Button>
            </div>

            {/* Quiet Credibility Strip */}
            <div className="mt-8 sm:mt-9 pt-5 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4 text-[11px] sm:text-xs text-slate-600 dark:text-slate-400">
              <span>{isNepali ? 'राष्ट्र बैंक निर्देशिका अनुकूल' : 'NRB Forex Grounded'}</span>
              <span aria-hidden="true">·</span>
              <span>{isNepali ? 'eSewa / Khalti भुक्तानी' : 'eSewa & Khalti Invoicing'}</span>
              <span aria-hidden="true">·</span>
              <span>{isNepali ? '२४kHz देवनागरी आवाज' : '24kHz Devanagari Voice'}</span>
              <span aria-hidden="true">·</span>
              <span>{isNepali ? 'काठमाडौं क्लाउड' : 'Kathmandu Local Cloud'}</span>
            </div>

          </div>

          {/* Right Column: Sleek, Mobile-Friendly Live Utility Showcase */}
          <div className="lg:col-span-6 w-full">
            <div className="space-y-2.5">
              
              {/* Segmented Utility Switcher (2x2 on mobile, 4-col on sm+) */}
              <div
                className={`p-1 rounded-xl border grid grid-cols-2 sm:grid-cols-4 gap-1 ${
                  isDark ? 'border-slate-800 bg-[#0d1527]/60' : 'border-slate-200 bg-white shadow-2xs'
                }`}
                role="tablist"
                aria-label="Live Utility Previews"
              >
                {[
                  { id: 'nibedan' as const, label: isNepali ? 'वडा निवेदन' : 'Ward Letter', icon: FileText },
                  { id: 'tax' as const, label: isNepali ? 'आयकर TDS' : 'Tax & TDS', icon: Calculator },
                  { id: 'forex' as const, label: isNepali ? 'डलर दर' : 'NRB Forex', icon: ArrowRightLeft },
                  { id: 'ocr' as const, label: isNepali ? 'कागजात OCR' : 'Devanagari OCR', icon: Scan },
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = activePreview === item.id;
                  return (
                    <button
                      key={item.id}
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => setActivePreview(item.id)}
                      className={`py-2 px-2.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
                        isActive
                          ? isDark
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-xs'
                            : 'bg-cyan-600 text-white shadow-xs'
                          : isDark
                            ? 'text-slate-300 hover:text-white hover:bg-white/5'
                            : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Clean Preview Slip with 3D Tilt */}
              <Card3DTilt maxTilt={5} depth={10} className="rounded-2xl">
                <div
                  className={`rounded-2xl border p-4 sm:p-5 transition-all ${
                    isDark ? 'border-slate-800 bg-[#0b1220]/90 backdrop-blur-md shadow-xl' : 'border-slate-200/90 bg-white/95 backdrop-blur-md shadow-sm'
                  }`}
                >
                {/* 1. Ward Nibedan Preview */}
                {activePreview === 'nibedan' && (
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between pb-2.5 border-b border-slate-200 dark:border-slate-800">
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">
                          {isNepali ? 'नेपाली नागरिकता सिफारिस निवेदन' : 'Ward Citizenship Recommendation Template'}
                        </div>
                        <div className="text-[11px] text-slate-600 dark:text-slate-400">
                          {isNepali ? 'स्थानीय तह वडा कार्यालय प्रयोजन' : 'Official Devanagari Format'}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy('श्रीमान् वडा अध्यक्षज्यू,\nवडा कार्यालय, काठमाडौं।\nविषय: नागरिकता प्रमाणपत्रको सिफारिस पाउँ।')}
                        className="text-xs text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer font-medium"
                      >
                        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                        <span>{copied ? (isNepali ? 'कपी भयो' : 'Copied') : (isNepali ? 'कपी' : 'Copy')}</span>
                      </button>
                    </div>

                    <div className={`p-3.5 rounded-xl border font-mono text-xs leading-relaxed space-y-1.5 ${
                      isDark ? 'bg-black/40 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}>
                      <div className="text-slate-500 dark:text-slate-400 text-[11px]">मिति: २०८१/०८/१५</div>
                      <div className="font-semibold text-slate-900 dark:text-white">श्रीमान् वडा अध्यक्षज्यू,</div>
                      <div className="text-slate-700 dark:text-slate-300">वडा नं. ४ को कार्यालय, काठमाडौं महानगरपालिका।</div>
                      <div className="text-cyan-600 dark:text-cyan-400 font-semibold pt-0.5">
                        विषय: नेपाली नागरिकता प्रमाणपत्रको सिफारिस पाउँ।
                      </div>
                      <div className="text-slate-600 dark:text-slate-300 text-[11px] pt-0.5 leading-normal">
                        म निवेदक विगत १५ वर्षदेखि यसै वडामा स्थायी बसोबास गर्दै आएको हुँदा १६ वर्ष पूरा भएकोले नागरिकता प्राप्तिका लागि आवश्यक सिफारिस गरिपाऊँ...
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 text-xs">
                      <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                        {isNepali ? '५०+ वडा ढाँचाहरू उपलब्ध' : '50+ Ward Templates Included'}
                      </span>
                      <button
                        type="button"
                        onClick={() => onSelectPage?.('daily')}
                        className="text-cyan-600 dark:text-cyan-400 font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer"
                      >
                        <span>{isNepali ? 'पूर्ण स्टुडियो खोल्नुहोस्' : 'Open Template Studio'}</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* 2. Tax & TDS Preview */}
                {activePreview === 'tax' && (
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between pb-2.5 border-b border-slate-200 dark:border-slate-800">
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">
                          {isNepali ? 'आ.व. २०८१/८२ आयकर तथा टीडीएस' : 'Nepal Income Tax & TDS (FY 2081/82)'}
                        </div>
                        <div className="text-[11px] text-slate-600 dark:text-slate-400">
                          {isNepali ? 'आन्तरिक राजस्व विभाग (IRD) स्ल्याब' : 'Inland Revenue Department Guidelines'}
                        </div>
                      </div>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 font-medium">
                        Finance Act 2081/82
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className={`p-2.5 sm:p-3 rounded-xl border text-center ${
                        isDark ? 'bg-white/[0.02] border-slate-800' : 'bg-slate-50 border-slate-200'
                      }`}>
                        <div className="text-[10px] sm:text-[11px] text-slate-600 dark:text-slate-400">{isNepali ? 'मासिक तलब' : 'Gross Monthly'}</div>
                        <div className="text-xs sm:text-sm font-bold font-mono mt-0.5 text-slate-900 dark:text-white">रू ६०,०००</div>
                      </div>
                      <div className={`p-2.5 sm:p-3 rounded-xl border text-center ${
                        isDark ? 'bg-cyan-950/30 border-cyan-500/30' : 'bg-cyan-50 border-cyan-200'
                      }`}>
                        <div className="text-[10px] sm:text-[11px] text-cyan-700 dark:text-cyan-400 font-medium">{isNepali ? 'मासिक TDS' : 'Monthly TDS'}</div>
                        <div className="text-xs sm:text-sm font-bold font-mono mt-0.5 text-cyan-800 dark:text-cyan-300">रू १,८३३</div>
                      </div>
                      <div className={`p-2.5 sm:p-3 rounded-xl border text-center ${
                        isDark ? 'bg-white/[0.02] border-slate-800' : 'bg-slate-50 border-slate-200'
                      }`}>
                        <div className="text-[10px] sm:text-[11px] text-slate-600 dark:text-slate-400">{isNepali ? 'हात पर्ने' : 'Take-Home'}</div>
                        <div className="text-xs sm:text-sm font-bold font-mono mt-0.5 text-slate-900 dark:text-white">रू ५८,१६७</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 text-xs">
                      <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                        {isNepali ? 'SSF छुट, बीमा, EPF र CIT गणना' : 'Includes SSF, EPF & CIT reliefs'}
                      </span>
                      <button
                        type="button"
                        onClick={() => onSelectPage?.('daily')}
                        className="text-cyan-600 dark:text-cyan-400 font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer"
                      >
                        <span>{isNepali ? 'विस्तृत हिसाब गर्नुहोस्' : 'Full Tax Calculator'}</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* 3. NRB Forex Preview */}
                {activePreview === 'forex' && (
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between pb-2.5 border-b border-slate-200 dark:border-slate-800">
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">
                          {isNepali ? 'नेपाल राष्ट्र बैंक आधिकारिक विनिमय दर' : 'Nepal Rastra Bank Exchange Rates'}
                        </div>
                        <div className="text-[11px] text-slate-600 dark:text-slate-400">
                          {isNepali ? 'केन्द्रीय बैंक बेन्चमार्क' : 'Central Bank Official Benchmark'}
                        </div>
                      </div>
                      <span className="text-[11px] font-mono text-cyan-600 dark:text-cyan-400 font-medium">
                        Live / Official
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className={`p-2.5 sm:p-3 rounded-xl border ${
                        isDark ? 'bg-white/[0.02] border-slate-800' : 'bg-slate-50 border-slate-200'
                      }`}>
                        <div className="text-xs font-bold text-slate-900 dark:text-slate-200">USD (१)</div>
                        <div className="text-xs sm:text-sm font-bold font-mono text-cyan-600 dark:text-cyan-400 mt-0.5">रू १३५.३०</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">बिक्री: १३५.९०</div>
                      </div>
                      <div className={`p-2.5 sm:p-3 rounded-xl border ${
                        isDark ? 'bg-white/[0.02] border-slate-800' : 'bg-slate-50 border-slate-200'
                      }`}>
                        <div className="text-xs font-bold text-slate-900 dark:text-slate-200">EUR (१)</div>
                        <div className="text-xs sm:text-sm font-bold font-mono text-cyan-600 dark:text-cyan-400 mt-0.5">रू १४४.१५</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">बिक्री: १४४.८०</div>
                      </div>
                      <div className={`p-2.5 sm:p-3 rounded-xl border ${
                        isDark ? 'bg-white/[0.02] border-slate-800' : 'bg-slate-50 border-slate-200'
                      }`}>
                        <div className="text-xs font-bold text-slate-900 dark:text-slate-200">GBP (१)</div>
                        <div className="text-xs sm:text-sm font-bold font-mono text-cyan-600 dark:text-cyan-400 mt-0.5">रू १७२.८०</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">बिक्री: १७३.५५</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 text-xs">
                      <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                        {isNepali ? '५०० डलर कार्ड कोटा ट्र्याकर समावेश' : '$500 Card Quota Calculator Included'}
                      </span>
                      <button
                        type="button"
                        onClick={() => onSelectPage?.('daily')}
                        className="text-cyan-600 dark:text-cyan-400 font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer"
                      >
                        <span>{isNepali ? 'विस्तृत विनिमय टुल' : 'Full NRB Forex Tool'}</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* 4. Devanagari OCR Preview */}
                {activePreview === 'ocr' && (
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between pb-2.5 border-b border-slate-200 dark:border-slate-800">
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">
                          {isNepali ? 'नागरिकता तथा लालपुर्जा स्क्यानर' : 'Devanagari OCR Extraction Slip'}
                        </div>
                        <div className="text-[11px] text-slate-600 dark:text-slate-400">
                          {isNepali ? 'स्वचालित देवनागरी डेटा एक्सट्र्याक्सन' : 'Automated Field Extraction'}
                        </div>
                      </div>
                      <span className="text-[11px] font-mono text-cyan-600 dark:text-cyan-400 font-medium">
                        JSON Ready
                      </span>
                    </div>

                    <div className={`p-3 rounded-xl border text-xs space-y-1.5 font-mono ${
                      isDark ? 'bg-black/30 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}>
                      <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400">{isNepali ? 'नाम:' : 'Name:'}</span>
                        <span className="font-semibold text-slate-900 dark:text-white">राम बहादुर खत्री</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400">{isNepali ? 'नागरिकता नं:' : 'Citizenship No:'}</span>
                        <span className="font-semibold text-slate-900 dark:text-white">२७-०१-७८-०४९२१</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400">{isNepali ? 'जारी जिल्ला:' : 'Issue District:'}</span>
                        <span className="font-semibold text-slate-900 dark:text-white">काठमाडौं (Kathmandu)</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 text-xs">
                      <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                        {isNepali ? 'हस्तलिखित र छापिएका दुवै कागजात' : 'Supports printed and handwritten docs'}
                      </span>
                      <button
                        type="button"
                        onClick={() => onSelectPage?.('daily')}
                        className="text-cyan-600 dark:text-cyan-400 font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer"
                      >
                        <span>{isNepali ? 'ओसीआर टुल खोल्नुहोस्' : 'Open OCR Scanner'}</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                )}
                </div>
              </Card3DTilt>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
