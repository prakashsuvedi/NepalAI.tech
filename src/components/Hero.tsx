import React, { useState, useEffect } from 'react';
import {
  ArrowUpRight,
  Video,
  Mic,
  MessageSquare,
  FileCheck,
  ArrowRight,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  SlidersHorizontal,
  Copy,
  Check,
  Play,
  Pause,
  Maximize2,
  Volume2,
  Zap,
  Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { HeroConfig, ThemeMode, Language } from '../types';
import { TRANSLATIONS } from '../data/translations';

interface HeroProps {
  config: HeroConfig;
  theme: ThemeMode;
  language: Language;
  onOpenConsultation: () => void;
  onExploreConsulting: () => void;
  onOpenAdminPanel: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  config,
  theme,
  language,
  onOpenConsultation,
  onExploreConsulting,
  onOpenAdminPanel,
}) => {
  const isDark = theme === 'dark';
  const isNepali = language === 'ne';
  const t = TRANSLATIONS[language];
  
  const [activeTab, setActiveTab] = useState<'video' | 'voice' | 'chat' | 'ocr'>('video');
  const [isPlaying, setIsPlaying] = useState(true);
  const [copied, setCopied] = useState(false);
  const [progress, setProgress] = useState(38);

  // Simulated media scrubber animation
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 0 : prev + 1));
    }, 150);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const featureTabs = [
    {
      id: 'video' as const,
      label: isNepali ? 'सोरा-२ ४K भिडियो' : 'Sora-2 4K Video',
      icon: Video,
      color: 'text-indigo-400',
      tag: '4K HDR • 60 FPS',
      badge: 'OpenAI Sora-2 + FFmpeg Cloud',
      previewPrompt: isNepali
        ? '“माछापुच्छ्रे हिमालको बिहानी दृश्य, सुनौलो घाम, लालीगुराँसको वन र हिमाली उपत्यकाको ४K सिनेमाटिक भिडियो।”'
        : '“Cinematic morning aerial of Machapuchare peak with golden sunrise and traditional rhododendron valley, 4K 60fps.”',
      outputDetail: '6 Scenes Generated • 4K ProRes 422 HQ',
      mediaType: 'video'
    },
    {
      id: 'voice' as const,
      label: isNepali ? '२४kHz न्युरल भ्वाइस' : '24kHz Neural Voice',
      icon: Mic,
      color: 'text-emerald-400',
      tag: 'Studio Master • Dolby',
      badge: 'SpeechT5 Devanagari Engine',
      previewPrompt: isNepali
        ? '“नमस्ते, नेपालको पहिलो उच्च-स्तरको न्युरल आवाज स्टुडियोमा स्वागत छ। अब अडियो सामग्री मिनेटमै तयार गर्नुहोस्।”'
        : '“Namaste, welcome to Nepal’s studio-grade neural voice synthesis platform with authentic Nepali prosody.”',
      outputDetail: '24kHz High-Fidelity Lossless Audio • 0ms Latency',
      mediaType: 'audio'
    },
    {
      id: 'ocr' as const,
      label: isNepali ? 'देवनागरी भिजन ओसीआर' : 'Devanagari Vision OCR',
      icon: FileCheck,
      color: 'text-amber-400',
      tag: '99.4% Accuracy',
      badge: 'Vision Transformer (Devanagari)',
      previewPrompt: isNepali
        ? '“नागरिकता प्रमाणपत्र, राष्ट्रिय परिचयपत्र, र बैंक भौचरको हस्तलिखित विवरण तत्काल JSON मा रूपान्तरण।”'
        : '“Instant structured JSON extraction from handwritten Devanagari Nagarikta certificates and bank deposit slips.”',
      outputDetail: 'Structured JSON Payload • Verified Confidence 99.4%',
      mediaType: 'document'
    },
    {
      id: 'chat' as const,
      label: isNepali ? 'हाम्रोएआई लिगल RAG' : 'HamroAI Legal RAG',
      icon: MessageSquare,
      color: 'text-sky-400',
      tag: 'NRB Air-Gapped',
      badge: 'Sovereign Vector RAG + Llama-3',
      previewPrompt: isNepali
        ? '“नेपाल राष्ट्र बैंकको विदेशी मुद्रा भुक्तानी कार्यविधि अनुसार डलर कार्ड र ई-कमर्स भुक्तानीको कानुनी दायरा।”'
        : '“Nepal Rastra Bank foreign currency regulations for international payments, Dollar Card KYC, and limits.”',
      outputDetail: 'Cited 4 NRB Directives • Air-Gapped Local Cluster',
      mediaType: 'chat'
    },
  ];

  const currentTab = featureTabs.find((tab) => tab.id === activeTab) || featureTabs[0];

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(currentTab.previewPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section
      className={`relative overflow-hidden pt-10 pb-14 md:pt-16 md:pb-20 transition-colors duration-300 ${
        isDark ? 'bg-[#06080e] text-white' : 'bg-slate-50/80 text-slate-900 border-b border-slate-200/80'
      }`}
      aria-label="NepalAI Platform Introduction"
    >
      {/* Background Glow */}
      <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[450px] blur-[120px] pointer-events-none -z-10 ${
        isDark 
          ? 'bg-gradient-to-tr from-emerald-500/15 via-indigo-500/10 to-rose-500/10' 
          : 'bg-gradient-to-tr from-emerald-400/10 via-indigo-400/10 to-amber-300/10'
      }`} />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Hero Title & Pitch - Sweet, Punchy, Bilingual */}
        <div className="text-center max-w-3xl mx-auto">
          
          {/* Eyebrow Badge */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-medium mb-4 shadow-sm ${
              isDark 
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' 
                : 'border-emerald-300 bg-emerald-50 text-emerald-800'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-emerald-500 animate-pulse" />
            <span className="font-semibold">Sovereign AI for Nepal • नेपालको आफ्नै एआई</span>
          </motion.div>

          {/* Sweet Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className={`text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight font-display leading-[1.15] ${
              isDark ? 'text-white' : 'text-slate-950'
            }`}
          >
            Devanagari Intelligence. <br className="hidden sm:inline" />
            <span className="text-emerald-500 dark:text-emerald-400">
              {isNepali ? 'नेपालको आफ्नै सार्वभौम एआई।' : 'Local Rails & Sovereign AI.'}
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className={`mt-4 text-sm sm:text-base max-w-xl mx-auto leading-relaxed ${
              isDark ? 'text-slate-300' : 'text-slate-600'
            }`}
          >
            {isNepali ? (
              <span>मौलिक देवनागरी भाषा मोडल, २४kHz न्युरल भ्वाइस, र eSewa/FonePay भुक्तानी।</span>
            ) : (
              <span>Fine-tuned Devanagari LLMs, 24kHz neural voice synthesis, and native eSewa/FonePay payment rails.</span>
            )}
          </motion.p>

          {/* Action CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-6 flex flex-wrap items-center justify-center gap-3"
          >
            <a
              href={config.studioUrl || 'https://studio.nepalai.tech'}
              target="_blank"
              rel="noopener noreferrer"
              className={`px-6 py-3 rounded-full font-bold text-xs transition-all shadow-md flex items-center gap-2 group cursor-pointer ${
                isDark 
                  ? 'bg-white text-slate-950 hover:bg-slate-200' 
                  : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/20'
              }`}
            >
              <Sparkles className="h-4 w-4 group-hover:scale-110 transition-transform" />
              <span>{isNepali ? 'एआई स्टुडियो खोल्नुहोस्' : 'Launch AI Studio'}</span>
              <ArrowUpRight className="h-4 w-4 opacity-75 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>

            <button
              type="button"
              onClick={onOpenConsultation}
              className={`px-6 py-3 rounded-full border text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                isDark 
                  ? 'border-white/20 bg-white/5 hover:bg-white/10 text-white' 
                : 'border-slate-300 bg-white hover:bg-slate-100 text-slate-800 shadow-xs'
              }`}
            >
              <span>{t.hero.primaryCta}</span>
              <ArrowRight className="h-3.5 w-3.5 text-emerald-500" />
            </button>
          </motion.div>

        </div>

        {/* INTERACTIVE SHOWCASE STAGE */}
        <div className="mt-10 max-w-4xl mx-auto">
          
          {/* Segmented Controller Tab Bar */}
          <div className={`p-1.5 rounded-full border max-w-xl mx-auto flex items-center justify-between gap-1 mb-4 shadow-sm ${
            isDark ? 'border-white/10 bg-white/[0.04]' : 'border-slate-300 bg-white'
          }`}>
            {featureTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-1.5 px-2.5 rounded-full text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    isActive
                      ? isDark 
                        ? 'bg-white text-slate-950 shadow-md' 
                        : 'bg-slate-900 text-white shadow-md'
                      : isDark 
                        ? 'text-slate-400 hover:text-white hover:bg-white/5' 
                        : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Interactive Screen Container */}
          <div className={`relative rounded-2xl border transition-all shadow-xl overflow-hidden ${
            isDark ? 'border-white/10 bg-black/60' : 'border-slate-300 bg-white'
          }`}>
            
            {/* Stage Header */}
            <div className={`flex items-center justify-between px-5 py-3 border-b text-xs ${
              isDark ? 'border-white/10 bg-white/[0.02]' : 'border-slate-200 bg-slate-50'
            }`}>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 mr-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
                  <div className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
                </div>
                <span className={`font-mono font-bold tracking-wider uppercase text-[11px] ${
                  isDark ? 'text-slate-300' : 'text-slate-700'
                }`}>
                  {currentTab.badge}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-full border text-[10px] font-mono font-semibold ${
                  isDark ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' : 'border-emerald-300 bg-emerald-50 text-emerald-800'
                }`}>
                  {currentTab.tag}
                </span>
                <button
                  type="button"
                  onClick={handleCopyPrompt}
                  className={`p-1 rounded-md border transition-colors cursor-pointer ${
                    isDark ? 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10' : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
                  }`}
                  title="Copy Prompt"
                >
                  {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                </button>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-5 sm:p-6 flex flex-col justify-between">
              <div>
                <div className="text-[11px] font-mono text-emerald-500 flex items-center gap-1.5 mb-2 font-bold">
                  <Sparkles className="h-3 w-3" />
                  <span>NATURAL LANGUAGE SCENARIO</span>
                </div>
                <p className={`text-sm sm:text-base font-medium leading-relaxed ${
                  isDark ? 'text-slate-100' : 'text-slate-800'
                }`}>
                  {currentTab.previewPrompt}
                </p>
              </div>

              {/* Scrubber and Action */}
              <div className={`mt-5 pt-4 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                isDark ? 'border-white/10' : 'border-slate-200'
              }`}>
                <div className="flex items-center gap-3 flex-1">
                  <button
                    type="button"
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="h-8 w-8 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center transition-transform hover:scale-105 cursor-pointer shrink-0"
                    aria-label={isPlaying ? "Pause simulation" : "Play simulation"}
                  >
                    {isPlaying ? <Pause className="h-3.5 w-3.5 fill-slate-950" /> : <Play className="h-3.5 w-3.5 fill-slate-950 ml-0.5" />}
                  </button>

                  <div className="flex-1">
                    <div className={`flex items-center justify-between text-[11px] font-mono mb-1 ${
                      isDark ? 'text-slate-400' : 'text-slate-500'
                    }`}>
                      <span>{currentTab.outputDetail}</span>
                      <span>{progress}%</span>
                    </div>
                    <div className={`h-1.5 w-full rounded-full overflow-hidden ${
                      isDark ? 'bg-white/10' : 'bg-slate-200'
                    }`}>
                      <div
                        className="h-full bg-emerald-500 transition-all duration-150"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>

                <a
                  href={config.studioUrl || 'https://studio.nepalai.tech'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`px-4 py-2 rounded-full border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0 ${
                    isDark 
                      ? 'bg-white/10 hover:bg-white/20 border-white/15 text-white' 
                      : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
                  }`}
                >
                  <span>Open Pipeline</span>
                  <ExternalLink className="h-3 w-3 text-slate-400" />
                </a>
              </div>

            </div>

          </div>

          {/* Quick 3-Metric Summary Strip */}
          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            <div className={`p-3 rounded-xl border ${
              isDark ? 'border-white/10 bg-white/[0.02]' : 'border-slate-200 bg-white shadow-xs'
            }`}>
              <div className={`text-xl font-bold font-display ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {config.metric1Value}
              </div>
              <div className={`text-[11px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {config.metric1Label}
              </div>
            </div>
            <div className={`p-3 rounded-xl border ${
              isDark ? 'border-white/10 bg-white/[0.02]' : 'border-slate-200 bg-white shadow-xs'
            }`}>
              <div className="text-xl font-bold font-display text-emerald-500">
                {config.metric2Value}
              </div>
              <div className={`text-[11px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {config.metric2Label}
              </div>
            </div>
            <div className={`p-3 rounded-xl border ${
              isDark ? 'border-white/10 bg-white/[0.02]' : 'border-slate-200 bg-white shadow-xs'
            }`}>
              <div className={`text-xl font-bold font-display ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
                {config.metric3Value}
              </div>
              <div className={`text-[11px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {config.metric3Label}
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
