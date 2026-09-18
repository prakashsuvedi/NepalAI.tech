import React, { useState, useEffect } from 'react';
import {
  ArrowUpRight,
  Layers,
  Video,
  Mic,
  MessageSquare,
  FileCheck,
  ArrowRight,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Zap,
  SlidersHorizontal
} from 'lucide-react';
import { HeroConfig, ThemeMode, Language } from '../types';
import { NepaliHeritageArt } from './NepaliHeritageArt';
import { TRANSLATIONS } from '../data/translations';

interface HeroProps {
  config: HeroConfig;
  theme: ThemeMode;
  language: Language;
  onOpenConsultation: () => void;
  onExploreCaseStudies: () => void;
  onOpenAdminPanel: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  config,
  theme,
  language,
  onOpenConsultation,
  onExploreCaseStudies,
  onOpenAdminPanel,
}) => {
  const isDark = theme === 'dark';
  const t = TRANSLATIONS[language];
  const [activeTab, setActiveTab] = useState<'video' | 'voice' | 'chat' | 'ocr'>('video');
  const [pulseLive, setPulseLive] = useState(true);

  // Subtle blink interval for live connection indicator
  useEffect(() => {
    const timer = setInterval(() => {
      setPulseLive((prev) => !prev);
    }, 2400);
    return () => clearInterval(timer);
  }, []);

  const featureTabs = [
    {
      id: 'video' as const,
      label: language === 'ne' ? 'सोरा-२ भिडियो' : 'Sora-2 Video',
      icon: Video,
      color: 'text-indigo-400',
      tag: language === 'ne' ? '६-दृश्य निर्देशक' : '6-Scene Nepali Director',
      previewPrompt:
        language === 'ne'
          ? '“माछापुच्छ्रे हिमालको बिहानी दृश्य, सुनौलो घाम, लालीगुराँसको वन र हिमाली उपत्यकाको ४K सिनेमाटिक भिडियो।”'
          : '“Cinematic morning flight above Machapuchare (Fishtail) with golden alpine sunrise, traditional rhododendron valley, 4K 60fps.”',
      techBadge: 'OpenAI Sora-2 + FFmpeg Cloud',
    },
    {
      id: 'voice' as const,
      label: language === 'ne' ? 'न्युरल आवाज' : 'Neural Voice',
      icon: Mic,
      color: 'text-emerald-400',
      tag: 'SpeechT5 Devnagari',
      previewPrompt:
        language === 'ne'
          ? '“नमस्ते, नेपालको पहिलो उच्च-स्तरको नेपाली आवाज स्टुडियोमा स्वागत छ। अब अडियोबुक र विज्ञापन मिनेटमै बनाउनुहोस्।”'
          : '“Namaste, welcome to Nepal’s high-fidelity neural voice synthesis studio. Produce radio ads and audiobooks with authentic Nepali intonation in minutes.”',
      techBadge: '24kHz Studio Neural Audio',
    },
    {
      id: 'chat' as const,
      label: language === 'ne' ? 'हाम्रोएआई रिजनिङ' : 'HamroAI Reasoning',
      icon: MessageSquare,
      color: 'text-sky-400',
      tag: 'NRB & Legal RAG',
      previewPrompt:
        language === 'ne'
          ? '“नेपाल राष्ट्र बैंकको विदेशी मुद्रा भुक्तानी कार्यविधि २०८० अनुसार डलर कार्ड मार्फत वार्षिक कति खर्च गर्न पाइन्छ?”'
          : '“According to Nepal Rastra Bank foreign currency regulations 2080, what are the annual compliance limits and KYC requirements for prepaid dollar cards?”',
      techBadge: 'Local Vector RAG & Nepali LLM',
    },
    {
      id: 'ocr' as const,
      label: language === 'ne' ? 'देवनागरी ओसीआर' : 'Devnagari OCR',
      icon: FileCheck,
      color: 'text-amber-400',
      tag: '99.4% Accuracy',
      previewPrompt:
        language === 'ne'
          ? '“नागरिकता प्रमाणपत्र, राष्ट्रिय परिचयपत्र, र बैंक भौचरको देवनागरी हस्तलिखित विवरण तत्काल JSON मा रूपान्तरण।”'
          : '“Instant structured JSON extraction from handwritten Devanagari Nagarikta certificates, Lalpurja land deeds, and bank deposit slips.”',
      techBadge: 'Vision Transformer for Nepali',
    },
  ];

  const currentTab = featureTabs.find((t) => t.id === activeTab) || featureTabs[0];

  return (
    <section
      className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24 transition-colors duration-300"
      aria-label="nepalai.tech Introduction"
    >
      {/* Authentic Nepali Heritage Vector Art (Himalayas & Mandir Silhouette) */}
      <NepaliHeritageArt
        theme={theme}
        showHimalaya={config.showHimalayaArt}
        showMandir={config.showMandirMotif}
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        
        {/* Top Ticker: Himalayan Node, Live Latency, Sovereign Billing */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-dashed border-slate-500/20 text-[11px] mb-8 font-mono">
          <div className="flex items-center gap-2">
            <span
              className={`inline-block h-2 w-2 rounded-full transition-opacity duration-700 ${
                pulseLive ? 'bg-emerald-400 opacity-100 shadow-[0_0_8px_#34d399]' : 'bg-emerald-500 opacity-50'
              }`}
              aria-hidden="true"
            />
            <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>
              Himalaya Cluster 01: Kathmandu PoP (४५ms Latency)
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className={`flex items-center gap-1.5 ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              <span>NRB Data Sovereignty Compliant</span>
            </span>

            <span className={`hidden sm:inline ${isDark ? 'text-slate-600' : 'text-slate-300'}`} aria-hidden="true">|</span>

            <span className={`hidden sm:flex items-center gap-1.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              <Zap className="h-3.5 w-3.5 text-amber-400" aria-hidden="true" />
              <span>FonePay QR Instant Settlement</span>
            </span>

            <button
              type="button"
              onClick={onOpenAdminPanel}
              className={`flex items-center gap-1 px-2 py-0.5 rounded border text-[10px] transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                isDark
                  ? 'border-white/10 text-slate-400 hover:text-white hover:bg-white/[0.04]'
                  : 'border-slate-300 text-slate-600 hover:text-slate-900 bg-white'
              }`}
              title="Open Admin customizer"
              aria-label="Open Admin configuration modal"
            >
              <SlidersHorizontal className="h-2.5 w-2.5 text-indigo-400" aria-hidden="true" />
              <span>{t.nav.adminPanel}</span>
            </button>
          </div>
        </div>

        {/* Hero Title and Eyebrow */}
        <div className="text-center max-w-4xl mx-auto">
          
          {/* Eyebrow Pill linking to studio */}
          <a
            href={config.studioUrl || 'https://studio.nepalai.tech'}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Explore NepalAI Studio Workbench (opens in new tab)"
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs backdrop-blur-md mb-6 transition-all group shadow-sm focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 ${
              isDark
                ? 'border-white/10 bg-white/[0.03] hover:border-indigo-500/50 hover:bg-white/[0.07] text-slate-300'
                : 'border-slate-300/80 bg-white/80 hover:border-indigo-500 hover:bg-white text-slate-800 shadow-sm'
            }`}
          >
            <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
            <span className="font-['Noto_Sans_Devanagari'] font-semibold">
              {language === 'ne' ? config.eyebrowNepali : config.eyebrowEnglish}
            </span>
            <span className={isDark ? 'text-slate-600' : 'text-slate-300'} aria-hidden="true">•</span>
            <span className="text-indigo-400 font-semibold group-hover:underline">
              {t.nav.studio}
            </span>
            <ArrowUpRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" aria-hidden="true" />
          </a>

          {/* High-Status Typographic Display */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight font-['Space_Grotesk'] leading-[1.12]">
            <span className={`block font-['Noto_Sans_Devanagari'] font-bold text-2xl sm:text-4xl lg:text-5xl mb-2.5 ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              {config.headlineDevanagari}
            </span>
            <span className={`font-medium text-xl sm:text-3xl lg:text-4xl block ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            }`}>
              {config.headlineEnglish}
            </span>
          </h1>

          {/* Descriptive Pitch */}
          <p className={`mt-5 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed font-['Noto_Sans_Devanagari'] font-normal ${
            isDark ? 'text-slate-300' : 'text-slate-700'
          }`}>
            {config.descriptionNepali}
          </p>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
            <a
              href={config.studioUrl || 'https://studio.nepalai.tech'}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open NepalAI Studio in a new tab"
              className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-bold transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              <span className={language === 'ne' ? "font-['Noto_Sans_Devanagari']" : ''}>
                {language === 'ne' ? 'नेपाल AI स्टुडियो खोल्नुहोस्' : 'Launch NepalAI Studio'}
              </span>
              <ArrowUpRight className="h-4 w-4 ml-0.5" aria-hidden="true" />
            </a>

            <button
              type="button"
              onClick={onOpenConsultation}
              aria-label="Schedule an AI Consultation"
              className={`px-5 py-3 rounded-xl border text-sm font-semibold transition-all flex items-center gap-2 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                isDark
                  ? 'border-white/15 bg-white/[0.04] text-white hover:bg-white/[0.08] hover:border-white/30'
                  : 'border-slate-300 bg-white text-slate-900 hover:bg-slate-50 hover:border-slate-400 shadow-sm'
              }`}
            >
              <span className={language === 'ne' ? "font-['Noto_Sans_Devanagari']" : ''}>
                {t.hero.primaryCta}
              </span>
              <ArrowRight className="h-4 w-4 text-emerald-500" aria-hidden="true" />
            </button>
          </div>

          {/* 3 Live Key Metric Badges */}
          <div className="mt-8 grid grid-cols-3 gap-2 sm:gap-4 max-w-lg mx-auto">
            <div className={`p-3 rounded-xl border text-center transition-all ${
              isDark ? 'border-white/[0.08] bg-black/40' : 'border-slate-200 bg-white/90 shadow-sm'
            }`}>
              <div className="text-base sm:text-lg font-bold font-mono text-emerald-500">
                {config.metric1Value}
              </div>
              <div className={`text-[10px] sm:text-xs font-['Noto_Sans_Devanagari'] leading-tight mt-0.5 ${
                isDark ? 'text-slate-400' : 'text-slate-600'
              }`}>
                {config.metric1Label}
              </div>
            </div>

            <div className={`p-3 rounded-xl border text-center transition-all ${
              isDark ? 'border-white/[0.08] bg-black/40' : 'border-slate-200 bg-white/90 shadow-sm'
            }`}>
              <div className="text-base sm:text-lg font-bold font-mono text-indigo-400">
                {config.metric2Value}
              </div>
              <div className={`text-[10px] sm:text-xs font-['Noto_Sans_Devanagari'] leading-tight mt-0.5 ${
                isDark ? 'text-slate-400' : 'text-slate-600'
              }`}>
                {config.metric2Label}
              </div>
            </div>

            <div className={`p-3 rounded-xl border text-center transition-all ${
              isDark ? 'border-white/[0.08] bg-black/40' : 'border-slate-200 bg-white/90 shadow-sm'
            }`}>
              <div className="text-base sm:text-lg font-bold font-mono text-amber-500">
                {config.metric3Value}
              </div>
              <div className={`text-[10px] sm:text-xs font-['Noto_Sans_Devanagari'] leading-tight mt-0.5 ${
                isDark ? 'text-slate-400' : 'text-slate-600'
              }`}>
                {config.metric3Label}
              </div>
            </div>
          </div>

        </div>

        {/* ULTRA-CONVINCING INTERACTIVE STUDIO PREVIEW CARD */}
        <div className="mt-12 max-w-4xl mx-auto">
          
          <div className={`rounded-3xl border p-5 sm:p-7 shadow-2xl backdrop-blur-xl transition-all duration-300 relative ${
            isDark
              ? 'border-white/[0.12] bg-gradient-to-b from-white/[0.05] to-[#0a0d16]/90'
              : 'border-slate-300/80 bg-gradient-to-b from-white to-slate-50 shadow-xl'
          }`}>
            
            {/* Header with Direct URL & Live Badge */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-500/20">
              <div className="flex items-center gap-2.5">
                <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" aria-hidden="true" />
                <span className="text-xs font-mono font-bold tracking-wider text-emerald-500 uppercase">
                  {config.liveCreditAmount} • {language === 'ne' ? 'पूर्ण वर्कबेन्च सिमुलेशन' : 'FULL SUITE PREVIEW'}
                </span>
              </div>

              {/* Direct Link pill */}
              <a
                href={config.studioUrl || 'https://studio.nepalai.tech'}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Launch NepalAI Studio"
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-semibold transition-all focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                  isDark
                    ? 'border-indigo-500/40 bg-indigo-950/40 text-indigo-300 hover:bg-indigo-900/60 hover:text-white'
                    : 'border-indigo-300 bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                }`}
              >
                <span>{t.hero.launchStudioCta}</span>
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </div>

            {/* Interactive Capability Selectors */}
            <div
              className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2"
              role="tablist"
              aria-label="NepalAI Studio interactive capability presets"
            >
              {featureTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    id={`tab-${tab.id}`}
                    role="tab"
                    type="button"
                    aria-selected={isActive}
                    aria-controls={`tabpanel-${tab.id}`}
                    onClick={() => setActiveTab(tab.id)}
                    className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                      isActive
                        ? isDark
                          ? 'border-emerald-500/60 bg-emerald-950/30 text-white shadow-md'
                          : 'border-emerald-500 bg-emerald-50/80 text-slate-900 shadow-sm'
                        : isDark
                        ? 'border-white/[0.06] bg-black/30 text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
                        : 'border-slate-200 bg-white/70 text-slate-600 hover:text-slate-900 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <Icon className={`h-4 w-4 ${tab.color}`} aria-hidden="true" />
                      <span className="text-[10px] font-mono opacity-80">{tab.tag}</span>
                    </div>
                    <span className="text-xs font-bold">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Live Interactive Prompt & Engine Simulation Container */}
            <div
              id={`tabpanel-${currentTab.id}`}
              role="tabpanel"
              aria-labelledby={`tab-${currentTab.id}`}
              className={`mt-4 rounded-2xl border p-4 sm:p-5 transition-all ${
                isDark ? 'border-white/[0.08] bg-black/60' : 'border-slate-200 bg-slate-100/90'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-mono text-emerald-500 flex items-center gap-1">
                  <Sparkles className="h-3 w-3" aria-hidden="true" />
                  <span>{t.hero.samplePrompt}:</span>
                </span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md border ${
                  isDark ? 'border-white/10 bg-white/[0.04] text-slate-400' : 'border-slate-300 bg-white text-slate-600'
                }`}>
                  {currentTab.techBadge}
                </span>
              </div>

              <div className={`text-xs sm:text-sm font-['Noto_Sans_Devanagari'] italic leading-relaxed p-3 rounded-xl border ${
                isDark ? 'border-white/[0.04] bg-white/[0.02] text-slate-200' : 'border-slate-200 bg-white text-slate-800'
              }`}>
                {currentTab.previewPrompt}
              </div>

              {/* Action row with background launch */}
              <div className="mt-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2 border-t border-slate-500/15">
                <div className={`text-[11px] font-['Noto_Sans_Devanagari'] ${
                  isDark ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  {language === 'ne'
                    ? 'तत्काल FonePay, eSewa वा Khalti मार्फत सिधै रिचार्ज गरेर स्टुडियो चलाउनुहोस्।'
                    : 'Instantly top up via FonePay, eSewa, or Khalti to run neural pipelines in NepalAI Studio.'}
                </div>

                <a
                  href={config.studioUrl || 'https://studio.nepalai.tech'}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Run this pipeline in NepalAI Studio"
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors inline-flex items-center justify-center gap-1.5 shadow-sm shrink-0 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500"
                >
                  <span className={language === 'ne' ? "font-['Noto_Sans_Devanagari']" : ''}>
                    {language === 'ne' ? 'स्टुडियोमा रन गर्नुहोस्' : 'Run in Studio'}
                  </span>
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Quick Jump Anchor Links */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs">
          <button
            type="button"
            onClick={onExploreCaseStudies}
            aria-label="Scroll to Case Studies section"
            className={`transition-colors flex items-center gap-1.5 font-medium focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 rounded px-1.5 py-0.5 ${
              isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            <Layers className="h-3.5 w-3.5 text-emerald-500" aria-hidden="true" />
            <span className={language === 'ne' ? "font-['Noto_Sans_Devanagari']" : ''}>
              {language === 'ne' ? '६+ नेपाली उत्पादन केस स्टडीहरू' : '6+ Production Case Studies'}
            </span>
          </button>

          <span className={isDark ? 'text-slate-700' : 'text-slate-300'} aria-hidden="true">•</span>

          <button
            type="button"
            onClick={onOpenConsultation}
            aria-label="Schedule Enterprise AI Architecture Advisory"
            className={`transition-colors flex items-center gap-1 font-medium focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 rounded px-1.5 py-0.5 ${
              isDark ? 'text-slate-400 hover:text-emerald-400' : 'text-slate-600 hover:text-emerald-600'
            }`}
          >
            <span className={language === 'ne' ? "font-['Noto_Sans_Devanagari']" : ''}>
              {language === 'ne' ? 'उद्यम एआई आर्किटेक्चर परामर्श' : 'Enterprise AI Architecture Advisory'}
            </span>
            <ArrowRight className="h-3 w-3" aria-hidden="true" />
          </button>
        </div>

      </div>
    </section>
  );
};
