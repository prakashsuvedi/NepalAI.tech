/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { AboutSection } from './components/AboutSection';
import { StudioBanner } from './components/StudioBanner';
import { CaseStudiesSection } from './components/CaseStudiesSection';
import { ConsultingSection } from './components/ConsultingSection';
import { NepalToolsDirectory } from './components/NepalToolsDirectory';
import { FreeAIToolsSection } from './components/FreeAIToolsSection';
import { AutomationSection } from './components/AutomationSection';
import { DailyEssentialTools } from './components/DailyEssentialTools';
import { FAQSection } from './components/FAQSection';
import { ContactSection } from './components/ContactSection';
import { PrivacyPolicyModal } from './components/PrivacyPolicyModal';
import { CaseStudyModal } from './components/CaseStudyModal';
import { StackCalculatorModal } from './components/StackCalculatorModal';
import { ConsultationModal } from './components/ConsultationModal';
import { AdminConfigModal } from './components/AdminConfigModal';
import { BackToTop } from './components/BackToTop';
import { Footer } from './components/Footer';
import { ToastProvider } from './context/ToastContext';
import { CaseStudy, ConsultingOffering, HeroConfig, ThemeMode, Language } from './types';
import { CONSULTING_OFFERINGS } from './data/consultingOfferings';
import { DEFAULT_HERO_CONFIG } from './data/defaultHeroConfig';

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
    return 'dark';
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
  const [activeCaseStudy, setActiveCaseStudy] = useState<CaseStudy | null>(null);
  const [isStackCalculatorOpen, setIsStackCalculatorOpen] = useState<boolean>(false);
  const [isConsultationOpen, setIsConsultationOpen] = useState<boolean>(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState<boolean>(false);
  const [isPrivacyPolicyOpen, setIsPrivacyPolicyOpen] = useState<boolean>(false);
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
      <div
        className={`min-h-screen flex flex-col transition-colors duration-300 ${
          isDark
            ? 'bg-[#06080e] text-slate-100 selection:bg-emerald-500/30 selection:text-emerald-200'
            : 'bg-[#f8fafc] text-slate-900 selection:bg-emerald-500/20 selection:text-emerald-900'
        }`}
      >
        {/* Navigation Header with Theme Toggle, Language Switcher & Admin Customizer */}
      <Navbar
        theme={theme}
        language={language}
        onToggleTheme={handleToggleTheme}
        onToggleLanguage={handleToggleLanguage}
        onSelectLanguage={handleSelectLanguage}
        onOpenConsultation={handleOpenConsultation}
        onOpenStackCalculator={() => setIsStackCalculatorOpen(true)}
        onOpenAdminPanel={() => setIsAdminPanelOpen(true)}
        selectedStackCount={selectedStack.length}
      />

      {/* Main Content Area */}
      <main className="flex-1" id="main-content">
        {/* Dynamic & Cultural Hero Section with Background Studio Link */}
        <Hero
          config={heroConfig}
          theme={theme}
          language={language}
          onOpenConsultation={() => handleOpenConsultation('General Enterprise AI Advisory')}
          onExploreCaseStudies={() => handleScrollToSection('case-studies')}
          onOpenAdminPanel={() => setIsAdminPanelOpen(true)}
        />

        {/* Section: About NepalAI Sovereign Mission & 4 Engineering Pillars */}
        <AboutSection
          theme={theme}
          language={language}
          onOpenConsultation={handleOpenConsultation}
        />

        {/* Dedicated NepalAI Studio Spotlight (studio.nepalai.tech) */}
        <StudioBanner theme={theme} language={language} />

        {/* Section: Recent AI Project Case Studies */}
        <CaseStudiesSection
          theme={theme}
          language={language}
          onSelectCaseStudy={(caseStudy) => setActiveCaseStudy(caseStudy)}
          onOpenConsultation={handleOpenConsultation}
        />

        {/* Section: AI Consulting Service Offerings with Admin Pricing */}
        <ConsultingSection
          theme={theme}
          language={language}
          offerings={consultingOfferings}
          onOpenConsultation={handleOpenConsultation}
          onOpenAdminPricing={() => setIsAdminPanelOpen(true)}
        />

        {/* Section: Verified AI Tools Directory & Payment Guide for Nepal with Tooltip Overlays */}
        <NepalToolsDirectory
          theme={theme}
          language={language}
          selectedStack={selectedStack}
          onToggleStack={handleToggleStack}
          onOpenStackCalculator={() => setIsStackCalculatorOpen(true)}
        />

        {/* Section: Free AI Tools, APIs Guide & Live Multimodal Data Extractor */}
        <FreeAIToolsSection
          theme={theme}
          language={language}
          onOpenConsultation={handleOpenConsultation}
        />

        {/* Section: AI Automation Workflows for Nepal Businesses */}
        <AutomationSection
          theme={theme}
          language={language}
          onOpenConsultation={handleOpenConsultation}
        />

        {/* Section: Essential Daily AI Utilities (Letter Builder, Unicode, Tax, Market) */}
        <DailyEssentialTools
          theme={theme}
          language={language}
          onOpenConsultation={handleOpenConsultation}
        />

        {/* Section: FAQ Accordion (eSewa/Khalti, Dollar Card, Consulting, Devanagari OCR) */}
        <FAQSection
          theme={theme}
          language={language}
          onOpenConsultation={handleOpenConsultation}
          onScrollToContact={() => handleScrollToSection('contact')}
        />

        {/* Section: Contact & Direct Consultation Booking */}
        <ContactSection
          theme={theme}
          language={language}
        />
      </main>

      {/* Footer */}
      <Footer 
        theme={theme} 
        language={language} 
        onOpenConsultation={() => handleOpenConsultation()}
        onOpenPrivacyPolicy={() => setIsPrivacyPolicyOpen(true)}
      />

      {/* Floating Back to Top Button */}
      <BackToTop theme={theme} language={language} />

      {/* Interactive Modals */}
      <CaseStudyModal
        caseStudy={activeCaseStudy}
        onClose={() => setActiveCaseStudy(null)}
        onOpenConsultation={handleOpenConsultation}
      />

      {isStackCalculatorOpen && (
        <StackCalculatorModal
          selectedStack={selectedStack}
          onToggleStack={handleToggleStack}
          onClearStack={handleClearStack}
          onClose={() => setIsStackCalculatorOpen(false)}
          onOpenConsultation={handleOpenConsultation}
        />
      )}

      <ConsultationModal
        isOpen={isConsultationOpen}
        onClose={() => setIsConsultationOpen(false)}
        prefilledService={prefilledService}
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
