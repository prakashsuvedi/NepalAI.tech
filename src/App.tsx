/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { AboutSection } from './components/AboutSection';
import { StudioBanner } from './components/StudioBanner';
import { ConsultingSection } from './components/ConsultingSection';
import { NepalToolsDirectory } from './components/NepalToolsDirectory';
import { FreeAIToolsSection } from './components/FreeAIToolsSection';
import { AutomationSection } from './components/AutomationSection';
import { DailyEssentialTools } from './components/DailyEssentialTools';
import { FAQSection } from './components/FAQSection';
import { ContactSection } from './components/ContactSection';
import { PrivacyPolicyModal } from './components/PrivacyPolicyModal';
import { StackCalculatorModal } from './components/StackCalculatorModal';
import { ConsultationModal } from './components/ConsultationModal';
import { AdminConfigModal } from './components/AdminConfigModal';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { HamroAIChatModal } from './components/HamroAIChatModal';
import { BackToTop } from './components/BackToTop';
import { Footer } from './components/Footer';
import { CustomCursor } from './components/CustomCursor';
import { BentoSectionDivider } from './components/BentoSectionDivider';
import { ToastProvider } from './context/ToastContext';
import { ConsultingOffering, HeroConfig, ThemeMode, Language } from './types';
import { CONSULTING_OFFERINGS } from './data/consultingOfferings';
import { DEFAULT_HERO_CONFIG } from './data/defaultHeroConfig';
import { ambientFocusAudio } from './utils/ambientAudio';
import { 
  Sparkles, 
  Search, 
  Volume2, 
  VolumeX, 
  Sun, 
  Moon, 
  X 
} from 'lucide-react';

export default function App() {
  // Global Theme Mode: Light and Dark
  const [theme, setTheme] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem('nepalai_theme');
      if (saved === 'light' || saved === 'dark') {
        return saved;
      }
    } catch (e) {
      console.error('Failed to read theme from localStorage', e);
    }
    return 'light';
  });

  // Global Language: 'en' (English) | 'ne' (Nepali / Devanagari)
  const [language, setLanguage] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('nepalai_language');
      if (saved === 'en' || saved === 'ne') {
        return saved;
      }
    } catch (e) {
      console.error('Failed to read language from localStorage', e);
    }
    return 'en';
  });

  // Zen Mode (Distraction-Free Minimalist Reading Experience)
  const [isZenMode, setIsZenMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('nepalai_zen_mode');
      return saved === 'true';
    } catch (e) {
      console.error('Failed to read zen mode from localStorage', e);
      return false;
    }
  });

  // Global Search Modal State
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

  // Ambient Focus Audio State (Procedural binaural 108Hz/114Hz Theta wave focus generator)
  const [isAmbientAudio, setIsAmbientAudio] = useState(false);

  const handleToggleAmbientAudio = () => {
    const nextState = ambientFocusAudio.toggle();
    setIsAmbientAudio(nextState);
  };

  const handleToggleZenMode = () => {
    setIsZenMode((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('nepalai_zen_mode', String(next));
      } catch (e) {
        console.error('Failed to save zen mode to localStorage', e);
      }
      return next;
    });
  };

  // Turn off ambient audio when exiting Zen Mode to maintain clean user control
  useEffect(() => {
    if (!isZenMode && isAmbientAudio) {
      ambientFocusAudio.stop();
      setIsAmbientAudio(false);
    }
  }, [isZenMode, isAmbientAudio]);

  // Global keyboard shortcuts for Zen Mode (Z to toggle, Escape to exit) and Global Search (Ctrl+K / Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Command + K or Ctrl + K opens/toggles the global search command palette
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
        return;
      }

      const target = e.target as HTMLElement | null;
      const isInput = target && (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable
      );
      if (isInput) return;

      if ((e.key === 'z' || e.key === 'Z') && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        handleToggleZenMode();
      } else if (e.key === 'Escape') {
        if (isSearchOpen) {
          setIsSearchOpen(false);
        } else if (isZenMode) {
          setIsZenMode(false);
          try {
            localStorage.setItem('nepalai_zen_mode', 'false');
          } catch (err) {
            console.error(err);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isZenMode, isSearchOpen]);

  // Update HTML lang attribute on language change
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  // Hero Configuration with full Admin Panel customization
  const [heroConfig, setHeroConfig] = useState<HeroConfig>(() => {
    try {
      const saved = localStorage.getItem('nepalai_hero_config');
      if (saved) {
        return { ...DEFAULT_HERO_CONFIG, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.error('Failed to parse saved hero config', e);
    }
    return DEFAULT_HERO_CONFIG;
  });

  // Selected tools in AI Stack
  const [selectedStack, setSelectedStack] = useState<string[]>([
    'claude-pro',
    'cursor-ai',
    'v0-vercel',
  ]);

  // Consulting Offerings with Admin Panel persistence
  const [consultingOfferings, setConsultingOfferings] = useState<ConsultingOffering[]>(() => {
    try {
      const saved = localStorage.getItem('nepalai_consulting_offerings');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to parse saved consulting offerings', e);
    }
    return CONSULTING_OFFERINGS;
  });

  // Modals state
  const [isStackCalculatorOpen, setIsStackCalculatorOpen] = useState<boolean>(false);
  const [isConsultationOpen, setIsConsultationOpen] = useState<boolean>(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState<boolean>(false);
  const [isPrivacyPolicyOpen, setIsPrivacyPolicyOpen] = useState<boolean>(false);
  const [isHamroAIOpen, setIsHamroAIOpen] = useState<boolean>(false);
  const [prefilledService, setPrefilledService] = useState<string>('');

  const handleToggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem('nepalai_theme', next);
      } catch (e) {
        console.error('Failed to save theme to localStorage', e);
      }
      return next;
    });
  };

  const handleToggleLanguage = () => {
    setLanguage((prev) => {
      const next = prev === 'en' ? 'ne' : 'en';
      try {
        localStorage.setItem('nepalai_language', next);
      } catch (e) {
        console.error('Failed to save language to localStorage', e);
      }
      return next;
    });
  };

  const handleSelectLanguage = (lang: Language) => {
    setLanguage(lang);
    try {
      localStorage.setItem('nepalai_language', lang);
    } catch (e) {
      console.error('Failed to save language to localStorage', e);
    }
  };

  const handleToggleStack = (toolId: string) => {
    setSelectedStack((prev) =>
      prev.includes(toolId) ? prev.filter((id) => id !== toolId) : [...prev, toolId]
    );
  };

  const handleClearStack = () => {
    setSelectedStack([]);
  };

  const handleOpenConsultation = (serviceTitle?: string) => {
    setPrefilledService(serviceTitle || '');
    setIsConsultationOpen(true);
  };

  const handleScrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Hero config updates
  const handleSaveHeroConfig = (updated: HeroConfig) => {
    setHeroConfig(updated);
    try {
      localStorage.setItem('nepalai_hero_config', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save hero config', e);
    }
  };

  const handleResetHeroConfig = () => {
    setHeroConfig(DEFAULT_HERO_CONFIG);
    try {
      localStorage.removeItem('nepalai_hero_config');
    } catch (e) {
      console.error('Failed to reset hero config', e);
    }
  };

  // Consulting offerings updates
  const handleSaveOfferings = (updated: ConsultingOffering[]) => {
    setConsultingOfferings(updated);
    try {
      localStorage.setItem('nepalai_consulting_offerings', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save consulting offerings to localStorage', e);
    }
  };

  const handleResetOfferings = () => {
    setConsultingOfferings(CONSULTING_OFFERINGS);
    try {
      localStorage.removeItem('nepalai_consulting_offerings');
    } catch (e) {
      console.error('Failed to reset consulting offerings', e);
    }
  };

  const isDark = theme === 'dark';

  return (
    <ToastProvider>
      <CustomCursor theme={theme} />
      <div
        className={`min-h-screen flex flex-col transition-colors duration-300 ${
          isDark
            ? 'bg-[#06080e] text-slate-100 selection:bg-emerald-500/30 selection:text-emerald-200'
            : 'bg-[#f8fafc] text-slate-900 selection:bg-emerald-500/20 selection:text-emerald-900'
        }`}
      >
        {/* Single Unified Navigation Header (Hidden in Zen Mode) */}
        <AnimatePresence>
          {!isZenMode && (
            <motion.div
              initial={{ y: -60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -60, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
            >
              <Navbar
                theme={theme}
                language={language}
                onNavigateSection={handleScrollToSection}
                onToggleTheme={handleToggleTheme}
                onToggleLanguage={handleToggleLanguage}
                onSelectLanguage={handleSelectLanguage}
                onOpenConsultation={handleOpenConsultation}
                onOpenStackCalculator={() => setIsStackCalculatorOpen(true)}
                onOpenAdminPanel={() => setIsAdminPanelOpen(true)}
                onOpenSearch={() => setIsSearchOpen(true)}
                onOpenHamroAI={() => setIsHamroAIOpen(true)}
                selectedStackCount={selectedStack.length}
                isZenMode={isZenMode}
                onToggleZenMode={handleToggleZenMode}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* FLOATING ZEN HUD (Active exclusively in Zen Mode) */}
        <AnimatePresence>
          {isZenMode && (
            <motion.aside
              initial={{ y: -40, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -40, opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className="fixed top-4 inset-x-0 mx-auto w-fit z-50 px-3 max-w-[95vw]"
              aria-label="Zen Mode Navigation HUD"
            >
              <div className={`flex items-center gap-1.5 sm:gap-2.5 p-1.5 sm:p-2 rounded-full border shadow-2xl backdrop-blur-xl ${
                isDark
                  ? 'border-emerald-500/30 bg-[#07090e]/90 text-white shadow-[0_10px_40px_rgba(0,0,0,0.8)]'
                  : 'border-emerald-400/50 bg-white/95 text-slate-900 shadow-[0_10px_30px_rgba(0,0,0,0.15)]'
              }`}>
                
                {/* Zen Status Pill */}
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                  <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true" />
                  <span className="font-mono text-[11px]">
                    {language === 'ne' ? 'ध्यान मोड • NepalAI' : 'Zen Focus • NepalAI'}
                  </span>
                </div>

                <div className="h-4 w-px bg-slate-500/20" aria-hidden="true" />

                {/* Quick Search in Zen Mode */}
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.92 }}
                  onClick={() => setIsSearchOpen(true)}
                  className={`p-1.5 rounded-full border transition-colors cursor-pointer ${
                    isDark
                      ? 'border-white/10 bg-white/[0.05] text-emerald-400 hover:text-white'
                      : 'border-slate-200 bg-slate-100 text-emerald-700 hover:text-slate-950'
                  }`}
                  title={language === 'ne' ? 'खोजी (Ctrl+K)' : 'Global Search (Ctrl+K)'}
                  aria-label="Open Global Search in Zen Mode"
                >
                  <Search className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
                </motion.button>

                {/* Quick Language Toggle */}
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.92 }}
                  onClick={handleToggleLanguage}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold border transition-colors cursor-pointer ${
                    isDark
                      ? 'border-white/10 bg-white/[0.05] text-slate-300 hover:text-white'
                      : 'border-slate-200 bg-slate-100 text-slate-700 hover:text-slate-950'
                  }`}
                  aria-label="Toggle language in Zen Mode"
                >
                  {language === 'en' ? 'नेपाली' : 'EN'}
                </motion.button>

                {/* Quick Theme Toggle */}
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.92 }}
                  onClick={handleToggleTheme}
                  className={`p-1.5 rounded-full border transition-colors cursor-pointer ${
                    isDark
                      ? 'border-white/10 bg-white/[0.05] text-amber-300 hover:text-white'
                      : 'border-slate-200 bg-slate-100 text-indigo-600 hover:text-slate-950'
                  }`}
                  aria-label="Toggle theme in Zen Mode"
                >
                  {isDark ? (
                    <Sun className="h-3.5 w-3.5 text-amber-400" aria-hidden="true" />
                  ) : (
                    <Moon className="h-3.5 w-3.5 text-indigo-600" aria-hidden="true" />
                  )}
                </motion.button>

                {/* Ambient Focus Audio Toggle */}
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleToggleAmbientAudio}
                  className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                    isAmbientAudio
                      ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400 shadow-sm shadow-emerald-500/20'
                      : isDark
                      ? 'border-white/10 bg-white/[0.04] text-slate-400 hover:text-white'
                      : 'border-slate-200 bg-slate-100 text-slate-600 hover:text-slate-900'
                  }`}
                  title={isAmbientAudio ? (language === 'ne' ? 'एम्बियन्ट ध्यान ध्वनि बन्द गर्नुहोस्' : 'Mute Ambient Focus Audio') : (language === 'ne' ? 'एम्बियन्ट ध्यान ध्वनि बजाउनुहोस्' : 'Play Binaural Ambient Focus Track')}
                  aria-label="Toggle ambient focus sound in Zen Mode"
                  aria-pressed={isAmbientAudio}
                >
                  {isAmbientAudio ? (
                    <>
                      <Volume2 className="h-3.5 w-3.5 text-emerald-400 animate-pulse" aria-hidden="true" />
                      <span className="text-[11px] font-medium hidden sm:inline">
                        {language === 'ne' ? 'ध्वनि' : 'Ambient'}
                      </span>
                    </>
                  ) : (
                    <>
                      <VolumeX className="h-3.5 w-3.5" aria-hidden="true" />
                      <span className="text-[11px] font-medium hidden sm:inline">
                        {language === 'ne' ? 'ध्वनि बन्द' : 'Sound Off'}
                      </span>
                    </>
                  )}
                </motion.button>

                {/* Exit Zen Mode Button */}
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleToggleZenMode}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 text-xs font-semibold transition-colors cursor-pointer"
                  title="Exit Zen Mode (Esc)"
                  aria-label="Exit Zen Reading Mode"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                  <span className="hidden sm:inline text-[11px]">
                    {language === 'ne' ? 'निस्कनुहोस्' : 'Exit'}
                  </span>
                  <span className="hidden lg:inline text-[9px] font-mono px-1 py-0.2 rounded bg-black/40 text-red-300">
                    Esc
                  </span>
                </motion.button>

              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Unified Content Flow - All real sections seamlessly organized */}
        <main className={`flex-1 transition-all duration-300 ${isZenMode ? 'zen-active zen-prose pt-14 pb-16' : ''}`} id="main-content">
          <div className="space-y-0 transition-opacity duration-300">
            
            {/* 1. Hero Platform Introduction */}
            <Hero
              config={heroConfig}
              theme={theme}
              language={language}
              onOpenConsultation={() => handleOpenConsultation('General Enterprise AI Advisory')}
              onExploreConsulting={() => handleScrollToSection('consulting')}
              onOpenAdminPanel={() => setIsAdminPanelOpen(true)}
            />

            <BentoSectionDivider theme={theme} variant="emerald" />

            {/* 2. Mission Pillars & Sovereign Infrastructure */}
            <AboutSection
              theme={theme}
              language={language}
              onOpenConsultation={handleOpenConsultation}
            />

            <BentoSectionDivider theme={theme} variant="indigo" />

            {/* 3. NepalAI Studio Workbench Showcase */}
            <StudioBanner theme={theme} language={language} />

            <BentoSectionDivider theme={theme} variant="emerald" />

            {/* 4. Enterprise Consulting & Dual NPR/USD Pricing */}
            <ConsultingSection
              theme={theme}
              language={language}
              offerings={consultingOfferings}
              onOpenConsultation={handleOpenConsultation}
              onOpenAdminPricing={() => setIsAdminPanelOpen(true)}
            />

            <BentoSectionDivider theme={theme} variant="indigo" />

            {/* 5. Verified Nepal AI Tools Directory & Dollar Card Guide */}
            <NepalToolsDirectory
              theme={theme}
              language={language}
              selectedStack={selectedStack}
              onToggleStack={handleToggleStack}
              onOpenStackCalculator={() => setIsStackCalculatorOpen(true)}
            />

            <BentoSectionDivider theme={theme} variant="indigo" />

            {/* 6. Free APIs, Open Source Models & Data Extraction */}
            <FreeAIToolsSection
              theme={theme}
              language={language}
              onOpenConsultation={handleOpenConsultation}
            />

            <BentoSectionDivider theme={theme} variant="emerald" />

            {/* 7. Daily Sovereign Utilities (OCR, Speech, Tax, Kalimati) */}
            <DailyEssentialTools
              theme={theme}
              language={language}
              onOpenConsultation={handleOpenConsultation}
            />

            <BentoSectionDivider theme={theme} variant="indigo" />

            {/* 8. Enterprise Automation & Production Pipelines */}
            <AutomationSection
              theme={theme}
              language={language}
              onOpenConsultation={handleOpenConsultation}
            />

            <BentoSectionDivider theme={theme} variant="emerald" />

            {/* 9. Nepal Rastra Bank FAQ & Compliance */}
            <FAQSection
              theme={theme}
              language={language}
              onOpenConsultation={handleOpenConsultation}
              onScrollToContact={() => handleScrollToSection('contact')}
            />

            <BentoSectionDivider theme={theme} variant="slate" />

            {/* 10. Contact & Advisory Booking */}
            <ContactSection
              theme={theme}
              language={language}
            />
          </div>
        </main>

        {/* Footer */}
        <Footer 
          theme={theme} 
          language={language} 
          onOpenConsultation={() => handleOpenConsultation()}
          onOpenPrivacyPolicy={() => setIsPrivacyPolicyOpen(true)}
        />

        {/* Floating Back to Top & Quick Hamro AI Button */}
        <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsHamroAIOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-xl shadow-emerald-500/25 border border-emerald-300 transition-all cursor-pointer"
            aria-label="Open Hamro AI Chat"
          >
            <div className="relative flex items-center justify-center">
              <span className="h-2 w-2 rounded-full bg-slate-950 animate-ping absolute" />
              <span className="h-2 w-2 rounded-full bg-slate-950 relative" />
            </div>
            <span>{language === 'ne' ? 'हाम्रो AI च्याट' : 'Hamro AI Chat'}</span>
          </motion.button>
          <BackToTop theme={theme} language={language} />
        </div>

        {/* Interactive Modals */}
        {isStackCalculatorOpen && (
          <StackCalculatorModal
            selectedStack={selectedStack}
            onToggleStack={handleToggleStack}
            onClearStack={handleClearStack}
            onClose={() => setIsStackCalculatorOpen(false)}
            onOpenConsultation={handleOpenConsultation}
            theme={theme}
            language={language}
          />
        )}

        <ConsultationModal
          isOpen={isConsultationOpen}
          onClose={() => setIsConsultationOpen(false)}
          prefilledService={prefilledService}
          theme={theme}
          language={language}
        />

        {/* Global Search Command Palette (Ctrl+K) */}
        <GlobalSearchModal
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          theme={theme}
          language={language}
          onNavigateSection={handleScrollToSection}
          onOpenConsultation={handleOpenConsultation}
          onOpenStackCalculator={() => setIsStackCalculatorOpen(true)}
          onOpenHamroAI={() => setIsHamroAIOpen(true)}
          onSelectLanguage={handleSelectLanguage}
        />

        {/* Hamro AI Sovereign Vernacular Chat Modal */}
        <HamroAIChatModal
          isOpen={isHamroAIOpen}
          onClose={() => setIsHamroAIOpen(false)}
          theme={theme}
          language={language}
          onOpenConsultation={handleOpenConsultation}
          onOpenStackCalculator={() => setIsStackCalculatorOpen(true)}
        />

        {/* Privacy Policy Modal */}
        <PrivacyPolicyModal
          isOpen={isPrivacyPolicyOpen}
          onClose={() => setIsPrivacyPolicyOpen(false)}
          theme={theme}
          language={language}
        />

        {/* Unified Admin Panel: Hero Data, Cultural Motifs & Pricing Customizer */}
        <AdminConfigModal
          isOpen={isAdminPanelOpen}
          onClose={() => setIsAdminPanelOpen(false)}
          heroConfig={heroConfig}
          onSaveHeroConfig={handleSaveHeroConfig}
          onResetHeroConfig={handleResetHeroConfig}
          offerings={consultingOfferings}
          onSaveOfferings={handleSaveOfferings}
          onResetOfferings={handleResetOfferings}
        />
      </div>
    </ToastProvider>
  );
}
