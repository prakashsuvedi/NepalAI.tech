/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { AboutSection } from './components/AboutSection';
import { StudioBanner } from './components/StudioBanner';
import { ConsultingSection } from './components/ConsultingSection';
import { NepalToolsDirectory } from './components/NepalToolsDirectory';
import { FreeAIToolsSection } from './components/FreeAIToolsSection';
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
import { BentoPortalHub } from './components/BentoPortalHub';
import { PageFlowNavigator } from './components/PageFlowNavigator';
import { CommandCenter } from './components/CommandCenter';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { AuthModal } from './components/auth/AuthModal';
import { CommercePortal } from './components/commerce/CommercePortal';
import { ConsultingOffering, HeroConfig, ThemeMode, Language, AppPage } from './types';
import { CONSULTING_OFFERINGS } from './data/consultingOfferings';
import { DEFAULT_HERO_CONFIG } from './data/defaultHeroConfig';
import { Bot } from 'lucide-react';
import {
  resolveToolFromUrl,
  getToolSeoByTab,
  applyClientToolSeo,
  resetDefaultSiteSeo,
  ToolTabId,
} from './utils/toolSeo';
import { TrendingHomepageStrip } from './components/trends/TrendingHomepageStrip';
import { NepalTrendsPortal } from './components/trends/NepalTrendsPortal';
import { resolveTrendsRouteFromPath, TrendsRouteMatch } from './utils/trendsSeo';

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

  // Global Search Modal State
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

  // Authentication Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalInitialMode, setAuthModalInitialMode] = useState<'signin' | 'signup' | 'forgot'>('signin');

  // Global keyboard shortcuts (Ctrl+K for search, Ctrl+Shift+A for Admin)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Command + Shift + A or Ctrl + Shift + A opens Admin Panel
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === 'a' || e.key === 'A')) {
        e.preventDefault();
        setIsAdminPanelOpen((prev) => !prev);
        return;
      }

      // Command + K or Ctrl + K opens/toggles the global search command palette
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
        return;
      }

      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen]);

  // Update HTML lang attribute on language change
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  // Sync Tailwind v4 `.dark` class and native color-scheme on <html>
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    root.style.colorScheme = theme;
  }, [theme]);

  // Hero Configuration with Admin Panel customization
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

  // Modular Page View State - Eliminates long vertical scrolling
  const validPages: AppPage[] = ['home', 'command-center', 'dashboard', 'directory', 'daily', 'trends', 'free', 'consulting', 'compliance', 'commerce'];

  const parseHashRoute = (rawHash: string): { page: AppPage; storeSlug?: string } => {
    const clean = rawHash.replace(/^#/, '').trim();
    if (clean.startsWith('store/')) {
      const slug = decodeURIComponent(clean.slice('store/'.length)).trim();
      if (slug) {
        return { page: 'commerce', storeSlug: slug };
      }
    }
    if (validPages.includes(clean as AppPage)) {
      return { page: clean === 'dashboard' ? 'command-center' : (clean as AppPage) };
    }
    return { page: 'home' };
  };

  const [storeSlug, setStoreSlug] = useState<string | undefined>(() => {
    try {
      return parseHashRoute(window.location.hash).storeSlug;
    } catch {
      return undefined;
    }
  });

  const [trendsRoute, setTrendsRoute] = useState<TrendsRouteMatch>(() => {
    try {
      return resolveTrendsRouteFromPath(window.location.pathname) || { view: 'nepal' };
    } catch {
      return { view: 'nepal' };
    }
  });

  const [dailyInitialTab, setDailyInitialTab] = useState<ToolTabId | undefined>(() => {
    try {
      const matched = resolveToolFromUrl(window.location.pathname, window.location.search);
      return matched?.tab;
    } catch {
      return undefined;
    }
  });

  const [currentPage, setCurrentPage] = useState<AppPage>(() => {
    try {
      const trendsFromPath = resolveTrendsRouteFromPath(window.location.pathname);
      if (trendsFromPath) {
        return 'trends';
      }
      const toolFromPath = resolveToolFromUrl(window.location.pathname, window.location.search);
      if (toolFromPath) {
        return 'daily';
      }
      if (window.location.hash) {
        const parsed = parseHashRoute(window.location.hash);
        if (parsed.storeSlug || validPages.includes(window.location.hash.replace('#', '') as AppPage)) {
          return parsed.page;
        }
      }
      const saved = localStorage.getItem('nepalai_current_page') as AppPage;
      if (saved && validPages.includes(saved)) {
        return saved === 'dashboard' ? 'command-center' : saved;
      }
    } catch (e) {
      console.error('Failed to read page from storage', e);
    }
    return 'home';
  });

  const handleOpenTrendsRoute = (path: string) => {
    const matched = resolveTrendsRouteFromPath(path) || { view: 'nepal' as const };
    setStoreSlug(undefined);
    setTrendsRoute(matched);
    setCurrentPage('trends');
    try {
      localStorage.setItem('nepalai_current_page', 'trends');
      window.history.pushState({}, '', path);
    } catch {
      // ignore history errors
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectPage = (page: AppPage) => {
    const resolvedPage = page === 'dashboard' ? 'command-center' : page;
    setStoreSlug(undefined);
    setCurrentPage(resolvedPage);
    try {
      localStorage.setItem('nepalai_current_page', resolvedPage);
      if (resolvedPage === 'trends') {
        setTrendsRoute({ view: 'nepal' });
        window.history.pushState({}, '', '/trending/nepal');
      } else if (resolvedPage !== 'daily') {
        if (
          window.location.pathname.startsWith('/tools/') ||
          window.location.pathname.startsWith('/trending/') ||
          window.location.pathname.startsWith('/keywords/')
        ) {
          window.history.replaceState({}, '', `/#${resolvedPage}`);
        } else {
          window.location.hash = resolvedPage;
        }
        resetDefaultSiteSeo();
      } else {
        const activeTabSeo = getToolSeoByTab(dailyInitialTab || 'fx');
        if (activeTabSeo) {
          window.history.replaceState({}, '', `/tools/${activeTabSeo.slug}`);
          applyClientToolSeo(activeTabSeo);
        }
      }
    } catch (e) {
      console.error(e);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateWithTab = (page: AppPage, tab?: string) => {
    if (page === 'daily' && tab) {
      const typedTab = tab as ToolTabId;
      setDailyInitialTab(typedTab);
      const seo = getToolSeoByTab(typedTab);
      if (seo) {
        try {
          window.history.replaceState({}, '', `/tools/${seo.slug}`);
          applyClientToolSeo(seo);
        } catch {
          // ignore history failure
        }
      }
    }
    handleSelectPage(page);
  };

  // Apply initial /tools/:slug or /trending/* SEO tags and listen to browser hashchange & popstate
  useEffect(() => {
    const syncFromUrl = () => {
      const trendsMatched = resolveTrendsRouteFromPath(window.location.pathname);
      if (trendsMatched) {
        setTrendsRoute(trendsMatched);
        setCurrentPage('trends');
        return;
      }
      const toolMatched = resolveToolFromUrl(window.location.pathname, window.location.search);
      if (toolMatched) {
        setDailyInitialTab(toolMatched.tab);
        setCurrentPage('daily');
        applyClientToolSeo(toolMatched);
        return;
      }
      const clean = window.location.hash.replace(/^#/, '').trim();
      if (!clean) return;
      const parsed = parseHashRoute(window.location.hash);
      if (parsed.storeSlug) {
        setStoreSlug(parsed.storeSlug);
        setCurrentPage('commerce');
        resetDefaultSiteSeo();
      } else if (validPages.includes(clean as AppPage)) {
        setStoreSlug(undefined);
        setCurrentPage(parsed.page);
        if (parsed.page !== 'daily') {
          resetDefaultSiteSeo();
        }
      }
    };

    const initialTool = resolveToolFromUrl(window.location.pathname, window.location.search);
    if (initialTool) {
      applyClientToolSeo(initialTool);
    }

    window.addEventListener('hashchange', syncFromUrl);
    window.addEventListener('popstate', syncFromUrl);
    return () => {
      window.removeEventListener('hashchange', syncFromUrl);
      window.removeEventListener('popstate', syncFromUrl);
    };
  }, []);

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
    <AuthProvider>
      <ToastProvider>
        <div
          className={`min-h-screen flex flex-col transition-colors duration-300 relative ${
            isDark
              ? 'bg-[#070B14] text-slate-50 selection:bg-cyan-500/30 selection:text-cyan-100'
              : 'bg-[#FAF9F6] text-slate-950 selection:bg-cyan-500/20 selection:text-cyan-950'
          }`}
        >
          {/* Navigation Bar */}
          <Navbar
            theme={theme}
            language={language}
            currentPage={currentPage}
            onSelectPage={handleSelectPage}
            onToggleTheme={handleToggleTheme}
            onToggleLanguage={handleToggleLanguage}
            onSelectLanguage={handleSelectLanguage}
            onOpenConsultation={handleOpenConsultation}
            onOpenStackCalculator={() => setIsStackCalculatorOpen(true)}
            onOpenAdminPanel={() => setIsAdminPanelOpen(true)}
            onOpenSearch={() => setIsSearchOpen(true)}
            onOpenHamroAI={() => setIsHamroAIOpen(true)}
            onOpenAuth={(mode) => {
              setAuthModalInitialMode(mode || 'signin');
              setIsAuthModalOpen(true);
            }}
            selectedStackCount={selectedStack.length}
          />

        {/* Main Content Area */}
        <main className="flex-1 overflow-x-hidden" id="main-content">
          <AnimatePresence mode="wait">
            {currentPage === 'home' && (
              <motion.div
                key="page-home"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="space-y-0"
              >
                {/* 1. Editorial Split Hero + Live Nepal Pulse */}
                <Hero
                  config={heroConfig}
                  theme={theme}
                  language={language}
                  onOpenConsultation={() => handleOpenConsultation('General Enterprise AI Advisory')}
                  onExploreConsulting={() => handleSelectPage('consulting')}
                  onOpenAdminPanel={() => setIsAdminPanelOpen(true)}
                  onOpenSearch={() => setIsSearchOpen(true)}
                  onSelectPage={handleSelectPage}
                  onOpenDailyTab={(tab) => handleNavigateWithTab('daily', tab)}
                  onOpenTrendDetail={(slug) => handleOpenTrendsRoute(`/trending/nepal/${slug}`)}
                />

                {/* 2. Live Nepal Pulse Broadsheet (Trending + Official Market Desk) */}
                <TrendingHomepageStrip
                  theme={theme}
                  language={language}
                  onOpenTrendDetail={(slug) => handleOpenTrendsRoute(`/trending/nepal/${slug}`)}
                  onOpenTrendsRoute={handleOpenTrendsRoute}
                  onOpenDailyTab={(tab) => handleNavigateWithTab('daily', tab)}
                />

                {/* 3. Asymmetric Marquee Bento Hub */}
                <BentoPortalHub
                  onSelectPage={handleSelectPage}
                  onOpenTrendsRoute={handleOpenTrendsRoute}
                  theme={theme}
                  language={language}
                />

                {/* 4. Sovereign Proof & Enterprise Consultation */}
                <AboutSection
                  theme={theme}
                  language={language}
                  onOpenConsultation={handleOpenConsultation}
                />
              </motion.div>
            )}

            {(currentPage === 'command-center' || currentPage === 'dashboard') && (
              <motion.div
                key="page-command-center"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <CommandCenter
                  theme={theme}
                  language={language}
                  onNavigatePage={handleNavigateWithTab}
                  onOpenConsultation={handleOpenConsultation}
                  onOpenStackCalculator={() => setIsStackCalculatorOpen(true)}
                  onOpenHamroAI={() => setIsHamroAIOpen(true)}
                />
              </motion.div>
            )}

            {currentPage === 'directory' && (
              <motion.div
                key="page-directory"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <NepalToolsDirectory
                  theme={theme}
                  language={language}
                  selectedStack={selectedStack}
                  onToggleStack={handleToggleStack}
                  onOpenStackCalculator={() => setIsStackCalculatorOpen(true)}
                  onNavigateHome={() => handleSelectPage('home')}
                />
              </motion.div>
            )}

            {currentPage === 'daily' && (
              <motion.div
                key="page-daily"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <DailyEssentialTools
                  theme={theme}
                  language={language}
                  onOpenConsultation={handleOpenConsultation}
                  onNavigateHome={() => handleSelectPage('home')}
                  onOpenHamroAI={() => setIsHamroAIOpen(true)}
                  onActiveToolChange={(tab) => {
                    setDailyInitialTab(tab);
                    const seo = getToolSeoByTab(tab);
                    if (seo) {
                      try {
                        window.history.replaceState({}, '', `/tools/${seo.slug}`);
                        applyClientToolSeo(seo);
                      } catch {
                        // ignore
                      }
                    }
                  }}
                  initialTab={dailyInitialTab}
                />
              </motion.div>
            )}

            {currentPage === 'trends' && (
              <motion.div
                key="page-trends"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <NepalTrendsPortal
                  theme={theme}
                  language={language}
                  route={trendsRoute}
                  onChangeRoute={handleOpenTrendsRoute}
                  onNavigateToolTab={(tab) => handleNavigateWithTab('daily', tab)}
                  onNavigateHome={() => handleSelectPage('home')}
                />
              </motion.div>
            )}

            {currentPage === 'free' && (
              <motion.div
                key="page-free"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <FreeAIToolsSection
                  theme={theme}
                  language={language}
                  onOpenConsultation={handleOpenConsultation}
                  onNavigateHome={() => handleSelectPage('home')}
                />
              </motion.div>
            )}

            {currentPage === 'consulting' && (
              <motion.div
                key="page-consulting"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="space-y-0"
              >
                <ConsultingSection
                  theme={theme}
                  language={language}
                  offerings={consultingOfferings}
                  onOpenConsultation={handleOpenConsultation}
                  onOpenAdminPricing={() => setIsAdminPanelOpen(true)}
                  onNavigateHome={() => handleSelectPage('home')}
                />
              </motion.div>
            )}

            {currentPage === 'compliance' && (
              <motion.div
                key="page-compliance"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="space-y-0"
              >
                <FAQSection
                  theme={theme}
                  language={language}
                  onOpenConsultation={handleOpenConsultation}
                  onNavigateHome={() => handleSelectPage('home')}
                  onScrollToContact={() => {
                    const el = document.getElementById('contact');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                />

                <ContactSection
                  theme={theme}
                  language={language}
                />
              </motion.div>
            )}

            {currentPage === 'commerce' && (
              <motion.div
                key="page-commerce"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="space-y-0"
              >
                <CommercePortal
                  theme={theme}
                  language={language}
                  initialTab={storeSlug ? 'storefront' : undefined}
                  storeSlug={storeSlug}
                  onNavigateHome={() => handleSelectPage('home')}
                  onOpenConsultation={handleOpenConsultation}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom Page Navigation (Shown only on inner pages, not redundant with Home Bento Hub) */}
          {currentPage !== 'home' && (
            <PageFlowNavigator
              currentPage={currentPage}
              onSelectPage={handleSelectPage}
              theme={theme}
              language={language}
            />
          )}
        </main>

        {/* Site Footer */}
        <Footer 
          theme={theme} 
          language={language} 
          onSelectPage={handleSelectPage}
          onOpenConsultation={() => handleOpenConsultation()}
          onOpenPrivacyPolicy={() => setIsPrivacyPolicyOpen(true)}
          onOpenAdminPanel={() => setIsAdminPanelOpen(true)}
        />

        {/* Floating Quick Action Button & Back to Top */}
        <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-2 pointer-events-none">
          <div className="pointer-events-auto flex flex-col items-end gap-2">
            <button
              type="button"
              onClick={() => setIsHamroAIOpen(true)}
              className="flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-950/20 transition-all cursor-pointer min-h-[44px]"
              aria-label={language === 'ne' ? 'हाम्रो AI च्याट खोल्नुहोस्' : 'Open Hamro AI Chat'}
              title={language === 'ne' ? 'हाम्रो AI च्याट' : 'Hamro AI Chat'}
            >
              <Bot className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="hidden sm:inline">{language === 'ne' ? 'हाम्रो AI च्याट' : 'Hamro AI Chat'}</span>
            </button>
            <BackToTop theme={theme} language={language} className="static" />
          </div>
        </div>

        {/* Modals */}
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

        {isConsultationOpen && (
          <ConsultationModal
            isOpen={isConsultationOpen}
            onClose={() => setIsConsultationOpen(false)}
            theme={theme}
            language={language}
            prefilledService={prefilledService}
          />
        )}

        {isAdminPanelOpen && (
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
        )}

        {isPrivacyPolicyOpen && (
          <PrivacyPolicyModal
            isOpen={isPrivacyPolicyOpen}
            onClose={() => setIsPrivacyPolicyOpen(false)}
            theme={theme}
            language={language}
          />
        )}

        {isSearchOpen && (
          <GlobalSearchModal
            isOpen={isSearchOpen}
            onClose={() => setIsSearchOpen(false)}
            theme={theme}
            language={language}
            onSelectPage={handleSelectPage}
            onOpenTrendsRoute={handleOpenTrendsRoute}
            onOpenConsultation={handleOpenConsultation}
            onOpenStackCalculator={() => setIsStackCalculatorOpen(true)}
          />
        )}

        {isHamroAIOpen && (
          <HamroAIChatModal
            isOpen={isHamroAIOpen}
            onClose={() => setIsHamroAIOpen(false)}
            theme={theme}
            language={language}
            onOpenConsultation={handleOpenConsultation}
            onOpenStackCalculator={() => setIsStackCalculatorOpen(true)}
          />
        )}

        {/* Authentication & Identity Modal */}
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          theme={theme}
          language={language}
          initialMode={authModalInitialMode}
        />

      </div>
    </ToastProvider>
  </AuthProvider>
  );
}
