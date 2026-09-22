import React, { useState } from 'react';
import { Sparkles, ArrowUpRight, Menu, X, SlidersHorizontal, Sun, Moon, Languages, Eye, Maximize2, Search, Command, Bot, MessageSquare } from 'lucide-react';
import { motion } from 'motion/react';
import { ThemeMode, Language } from '../types';
import { NepalAILogo } from './NepalAILogo';
import { TRANSLATIONS } from '../data/translations';

interface NavbarProps {
  theme: ThemeMode;
  language: Language;
  activeView?: 'studio' | 'directory' | 'tools' | 'enterprise' | 'all';
  onSelectView?: (view: 'studio' | 'directory' | 'tools' | 'enterprise' | 'all') => void;
  onNavigateSection?: (sectionId: string) => void;
  onToggleTheme: () => void;
  onToggleLanguage: () => void;
  onSelectLanguage: (lang: Language) => void;
  onOpenConsultation: (serviceTitle?: string) => void;
  onOpenStackCalculator: () => void;
  onOpenAdminPanel: () => void;
  onOpenSearch?: () => void;
  onOpenHamroAI?: () => void;
  selectedStackCount: number;
  isZenMode?: boolean;
  onToggleZenMode?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  theme,
  language,
  activeView = 'studio',
  onSelectView,
  onNavigateSection,
  onToggleTheme,
  onToggleLanguage,
  onSelectLanguage,
  onOpenConsultation,
  onOpenStackCalculator,
  onOpenAdminPanel,
  onOpenSearch,
  onOpenHamroAI,
  selectedStackCount,
  isZenMode = false,
  onToggleZenMode,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const isDark = theme === 'dark';
  const t = TRANSLATIONS[language];

  const handleLinkClick = (e: React.MouseEvent, sectionId: string) => {
    e.preventDefault();
    setMobileOpen(false);
    if (onNavigateSection) {
      onNavigateSection(sectionId);
    } else {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b transition-colors duration-300 backdrop-blur-xl ${
        isDark
          ? 'border-white/[0.08] bg-[#07090e]/85 text-slate-100'
          : 'border-slate-200/90 bg-white/90 text-slate-800 shadow-xs'
      }`}
      role="banner"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand */}
        <a
          href="#"
          className="flex items-center group focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-lg"
          id="navbar-brand"
          aria-label="nepalai.tech Home"
        >
          <NepalAILogo theme={theme} size="md" showDevanagariTag={true} />
        </a>

        {/* Desktop Navigation */}
        <nav
          className="hidden xl:flex items-center gap-4 text-xs font-medium"
          role="navigation"
          aria-label="Main navigation"
        >
          {/* Direct Link to studio.nepalai.tech */}
          <a
            href="https://studio.nepalai.tech"
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all shadow-xs group focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 ${
              isDark
                ? 'border-indigo-500/40 bg-indigo-950/40 text-indigo-200 hover:border-indigo-400 hover:text-white'
                : 'border-indigo-300 bg-indigo-50 text-indigo-700 hover:border-indigo-500 hover:bg-indigo-100'
            }`}
            id="nav-studio-link"
            aria-label="Launch NepalAI Studio (opens in a new tab)"
          >
            <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true" />
            <Sparkles className="h-3 w-3 text-amber-400" aria-hidden="true" />
            <span className={language === 'ne' ? "font-['Noto_Sans_Devanagari']" : ''}>
              {t.nav.studio}
            </span>
            <ArrowUpRight className="h-3 w-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" aria-hidden="true" />
          </a>

          <a
            href="#about"
            onClick={(e) => handleLinkClick(e, 'about')}
            className={`transition-colors whitespace-nowrap focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 rounded px-1.5 py-1 ${
              isDark ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-950'
            } ${language === 'ne' ? "font-['Noto_Sans_Devanagari']" : ''}`}
            aria-label="Navigate to About section"
          >
            {t.nav.about}
          </a>

          <a
            href="#consulting"
            onClick={(e) => handleLinkClick(e, 'consulting')}
            className={`transition-colors whitespace-nowrap focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 rounded px-1.5 py-1 ${
              isDark ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-950'
            } ${language === 'ne' ? "font-['Noto_Sans_Devanagari']" : ''}`}
            aria-label="Navigate to AI Consulting Services section"
          >
            {t.nav.services}
          </a>

          <a
            href="#tools-directory"
            onClick={(e) => handleLinkClick(e, 'tools-directory')}
            className={`transition-colors whitespace-nowrap focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 rounded px-1.5 py-1 ${
              isDark ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-950'
            } ${language === 'ne' ? "font-['Noto_Sans_Devanagari']" : ''}`}
            aria-label="Navigate to Verified AI Tools Directory"
          >
            {t.nav.toolsDirectory}
          </a>

          <a
            href="#free-ai-tools"
            onClick={(e) => handleLinkClick(e, 'free-ai-tools')}
            className={`transition-colors whitespace-nowrap focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 rounded px-1.5 py-1 ${
              isDark ? 'text-emerald-400 hover:text-emerald-300 font-semibold' : 'text-emerald-700 hover:text-emerald-800 font-semibold'
            } ${language === 'ne' ? "font-['Noto_Sans_Devanagari']" : ''}`}
            aria-label="Navigate to Free AI Tools, APIs and Data Extraction Guide"
          >
            {t.nav.freeTools}
          </a>

          <a
            href="#automation"
            onClick={(e) => handleLinkClick(e, 'automation')}
            className={`transition-colors whitespace-nowrap focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 rounded px-1.5 py-1 ${
              isDark ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-950'
            } ${language === 'ne' ? "font-['Noto_Sans_Devanagari']" : ''}`}
            aria-label="Navigate to AI Automation Section"
          >
            {t.nav.automation}
          </a>

          <a
            href="#daily-tools"
            onClick={(e) => handleLinkClick(e, 'daily-tools')}
            className={`transition-colors whitespace-nowrap focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 rounded px-1.5 py-1 ${
              isDark ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-950'
            } ${language === 'ne' ? "font-['Noto_Sans_Devanagari']" : ''}`}
            aria-label="Navigate to Daily Essential AI Tools"
          >
            {t.nav.dailyTools}
          </a>

          <a
            href="#faq"
            onClick={(e) => handleLinkClick(e, 'faq')}
            className={`transition-colors whitespace-nowrap focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 rounded px-1.5 py-1 ${
              isDark ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-950'
            } ${language === 'ne' ? "font-['Noto_Sans_Devanagari']" : ''}`}
            aria-label="Navigate to FAQ section"
          >
            {t.nav.faq}
          </a>

          <a
            href="#contact"
            onClick={(e) => handleLinkClick(e, 'contact')}
            className={`transition-colors whitespace-nowrap focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 rounded px-1.5 py-1 ${
              isDark ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-950'
            } ${language === 'ne' ? "font-['Noto_Sans_Devanagari']" : ''}`}
            aria-label="Navigate to Contact section"
          >
            {t.nav.contact}
          </a>
        </nav>

        {/* Action Controls, Search, Language Toggle, Zen Mode & Theme Toggle */}
        <div className="hidden xl:flex items-center gap-2">
          
          {/* HAMRO AI VERNACULAR CHAT TRIGGER */}
          {onOpenHamroAI && (
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onOpenHamroAI}
              className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 cursor-pointer ${
                isDark
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 hover:border-emerald-400'
                  : 'border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
              }`}
              title={language === 'ne' ? 'हाम्रो एआई च्याट (रोमन/देवनागरी)' : 'Hamro AI Chat (Romanized / Devanagari)'}
              aria-label="Open Hamro AI Vernacular Chat"
            >
              <Bot className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
              <span>{language === 'ne' ? 'हाम्रो एआई' : 'Hamro AI'}</span>
              <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </motion.button>
          )}

          {/* GLOBAL SEARCH COMMAND PALETTE TRIGGER (Ctrl+K / ⌘K) */}
          {onOpenSearch && (
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onOpenSearch}
              className={`flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 cursor-pointer ${
                isDark
                  ? 'border-white/10 bg-white/[0.04] text-slate-300 hover:text-white hover:bg-white/[0.08]'
                  : 'border-slate-200 bg-slate-100 text-slate-700 hover:text-slate-950 hover:bg-slate-200'
              }`}
              title={language === 'ne' ? 'खोजी गर्नुहोस् (Ctrl+K)' : 'Search AI tools, services & FAQs (Ctrl+K)'}
              aria-label="Open Global Search Command Palette"
            >
              <Search className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
              <span className={`font-medium ${language === 'ne' ? "font-['Noto_Sans_Devanagari']" : ''}`}>
                {language === 'ne' ? 'खोजी...' : 'Search...'}
              </span>
              <kbd className="inline-flex items-center rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-mono text-slate-400">
                ⌘K
              </kbd>
            </motion.button>
          )}

          {/* ZEN READING MODE TOGGLE */}
          {onToggleZenMode && (
            <motion.button
              type="button"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={onToggleZenMode}
              className={`p-2 rounded-xl border transition-all flex items-center gap-1.5 text-xs focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                isZenMode
                  ? 'border-emerald-500 bg-emerald-500/15 text-emerald-400 font-semibold'
                  : isDark
                    ? 'border-white/10 bg-white/[0.04] text-slate-300 hover:text-white hover:bg-white/[0.08]'
                    : 'border-slate-200 bg-slate-100 text-slate-700 hover:text-slate-950 hover:bg-slate-200'
              }`}
              title={language === 'ne' ? 'जेन पठन मोड (Z)' : 'Zen Reading Mode (Press Z)'}
              aria-label={language === 'ne' ? t.nav.zenMode : 'Toggle Zen Reading Mode'}
            >
              <Eye className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
              <span className="text-[11px] font-mono hidden 2xl:inline">
                {language === 'ne' ? 'जेन' : 'Zen'}
              </span>
            </motion.button>
          )}

          {/* LANGUAGE SEGMENTED SWITCHER */}
          <div
            className={`flex items-center rounded-xl border p-0.5 text-xs transition-colors ${
              isDark ? 'border-white/10 bg-white/[0.04]' : 'border-slate-200 bg-slate-100'
            }`}
            role="group"
            aria-label="Language selection"
          >
            <motion.button
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelectLanguage('en')}
              className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                language === 'en'
                  ? isDark
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                    : 'bg-white text-emerald-700 font-bold shadow-xs'
                  : isDark
                    ? 'text-slate-400 hover:text-white'
                    : 'text-slate-600 hover:text-slate-950'
              }`}
              aria-label="Switch interface language to English"
              aria-pressed={language === 'en'}
            >
              EN
            </motion.button>
            <motion.button
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelectLanguage('ne')}
              className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                language === 'ne'
                  ? isDark
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                    : 'bg-white text-emerald-700 font-bold shadow-xs'
                  : isDark
                    ? 'text-slate-400 hover:text-white'
                    : 'text-slate-600 hover:text-slate-950'
              }`}
              aria-label="इन्टरफेस भाषा नेपालीमा परिवर्तन गर्नुहोस्"
              aria-pressed={language === 'ne'}
            >
              नेपाली
            </motion.button>
          </div>

          {/* THEME TOGGLE: LIGHT / DARK */}
          <motion.button
            type="button"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={onToggleTheme}
            className={`p-2 rounded-xl border transition-all flex items-center gap-1.5 text-xs focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 ${
              isDark
                ? 'border-white/10 bg-white/[0.04] text-amber-300 hover:text-white hover:bg-white/[0.08]'
                : 'border-slate-200 bg-slate-100 text-slate-700 hover:text-slate-950 hover:bg-slate-200'
            }`}
            title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
            aria-label={t.nav.toggleTheme}
          >
            {isDark ? (
              <>
                <Sun className="h-3.5 w-3.5 text-amber-400" aria-hidden="true" />
                <span className="text-[11px] font-mono">Light</span>
              </>
            ) : (
              <>
                <Moon className="h-3.5 w-3.5 text-indigo-600" aria-hidden="true" />
                <span className="text-[11px] font-mono">Dark</span>
              </>
            )}
          </motion.button>

          {/* Admin Customizer Trigger */}
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onOpenAdminPanel}
            title="Open Admin Panel to customize Hero data & pricing"
            aria-label="Open Admin Configuration Panel"
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 ${
              isDark
                ? 'border-white/[0.08] bg-white/[0.02] text-slate-400 hover:text-white hover:bg-white/[0.06]'
                : 'border-slate-200 bg-white text-slate-600 hover:text-slate-950 hover:bg-slate-50'
            }`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5 text-indigo-400" aria-hidden="true" />
            <span className="font-mono text-[11px]">{t.nav.adminPanel}</span>
          </motion.button>

          {selectedStackCount > 0 && (
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onOpenStackCalculator}
              aria-label={`Open AI Stack Calculator with ${selectedStackCount} tools selected`}
              className={`flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                isDark
                  ? 'border-white/10 bg-white/[0.04] text-slate-200 hover:text-white'
                  : 'border-slate-200 bg-white text-slate-700 hover:text-slate-950'
              }`}
            >
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-slate-950">
                {selectedStackCount}
              </span>
              <span className={language === 'ne' ? "font-['Noto_Sans_Devanagari']" : ''}>
                {t.nav.selectedTools}
              </span>
            </motion.button>
          )}

          <motion.button
            type="button"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onOpenConsultation()}
            aria-label="Schedule an AI Consultation"
            className="flex items-center gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 px-3.5 py-1.5 text-xs font-bold text-slate-950 transition-colors shadow-sm focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            <span className={language === 'ne' ? "font-['Noto_Sans_Devanagari']" : ''}>
              {t.nav.bookConsultation}
            </span>
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </motion.button>
        </div>

        {/* Mobile Controls */}
        <div className="flex xl:hidden items-center gap-2">
          {/* Mobile Hamro AI Chat Trigger */}
          {onOpenHamroAI && (
            <button
              type="button"
              onClick={onOpenHamroAI}
              className={`p-1.5 rounded-lg border text-xs focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 cursor-pointer ${
                isDark
                  ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-400'
                  : 'border-emerald-300 bg-emerald-50 text-emerald-800'
              }`}
              title="Hamro AI"
              aria-label="Open Hamro AI Chat"
            >
              <Bot className="h-4 w-4 text-emerald-400" aria-hidden="true" />
            </button>
          )}

          {/* Mobile Global Search Trigger */}
          {onOpenSearch && (
            <button
              type="button"
              onClick={onOpenSearch}
              className={`p-1.5 rounded-lg border text-xs focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 cursor-pointer ${
                isDark
                  ? 'border-white/10 bg-white/[0.04] text-slate-300'
                  : 'border-slate-200 bg-slate-100 text-slate-700'
              }`}
              title={language === 'ne' ? 'खोजी (Ctrl+K)' : 'Search (Ctrl+K)'}
              aria-label="Open Global Search"
            >
              <Search className="h-4 w-4 text-emerald-400" aria-hidden="true" />
            </button>
          )}

          {/* Mobile Zen Mode Toggle */}
          {onToggleZenMode && (
            <button
              type="button"
              onClick={onToggleZenMode}
              className={`p-1.5 rounded-lg border text-xs focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                isZenMode
                  ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400'
                  : isDark
                    ? 'border-white/10 bg-white/[0.04] text-slate-300'
                    : 'border-slate-200 bg-slate-100 text-slate-700'
              }`}
              title="Zen Mode"
              aria-label="Toggle Zen Mode"
            >
              <Eye className="h-4 w-4 text-emerald-400" aria-hidden="true" />
            </button>
          )}

          {/* Mobile Language Switcher Button */}
          <button
            type="button"
            onClick={onToggleLanguage}
            className={`px-2 py-1 rounded-lg border text-xs font-bold transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 font-['Noto_Sans_Devanagari'] ${
              isDark
                ? 'border-white/10 bg-white/[0.04] text-emerald-400'
                : 'border-slate-200 bg-slate-100 text-emerald-700'
            }`}
            aria-label={language === 'en' ? 'नेपाली भाषामा बदल्नुहोस्' : 'Switch language to English'}
          >
            {language === 'en' ? 'नेपाली' : 'EN'}
          </button>

          {/* Mobile Theme Toggle */}
          <button
            type="button"
            onClick={onToggleTheme}
            className={`p-1.5 rounded-lg border text-xs focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 ${
              isDark
                ? 'border-white/10 bg-white/[0.04] text-amber-300'
                : 'border-slate-200 bg-slate-100 text-slate-700'
            }`}
            aria-label={t.nav.toggleTheme}
          >
            {isDark ? (
              <Sun className="h-4 w-4 text-amber-400" aria-hidden="true" />
            ) : (
              <Moon className="h-4 w-4 text-indigo-600" aria-hidden="true" />
            )}
          </button>

          <a
            href="https://studio.nepalai.tech"
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-semibold focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 ${
              isDark
                ? 'border-indigo-500/40 bg-indigo-950/40 text-indigo-200'
                : 'border-indigo-300 bg-indigo-50 text-indigo-700'
            }`}
            aria-label="Open Studio"
          >
            <span>Studio ↗</span>
          </a>

          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`p-1.5 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-lg ${
              isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-950'
            }`}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav-menu"
          >
            {mobileOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div
          id="mobile-nav-menu"
          className={`border-b px-4 py-4 xl:hidden space-y-3 text-xs ${
            isDark ? 'border-white/10 bg-[#07090e] text-slate-200' : 'border-slate-200 bg-white text-slate-800'
          }`}
          role="region"
          aria-label="Mobile navigation menu"
        >
          {/* Brand Header inside Drawer */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-500/20">
            <NepalAILogo theme={theme} size="sm" showDevanagariTag={true} />
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
              Sovereign AI Hub
            </span>
          </div>

          {/* Mobile Language Selector inside drawer */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-500/20">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Languages className="h-3.5 w-3.5 text-emerald-500" aria-hidden="true" />
              <span>Language / भाषा:</span>
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => onSelectLanguage('en')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                  language === 'en'
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : isDark ? 'text-slate-400 bg-white/[0.04]' : 'text-slate-600 bg-slate-100'
                }`}
                aria-pressed={language === 'en'}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => onSelectLanguage('ne')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold font-['Noto_Sans_Devanagari'] ${
                  language === 'ne'
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : isDark ? 'text-slate-400 bg-white/[0.04]' : 'text-slate-600 bg-slate-100'
                }`}
                aria-pressed={language === 'ne'}
              >
                नेपाली
              </button>
            </div>
          </div>

          {/* Mobile Hamro AI Chat inside Drawer */}
          {onOpenHamroAI && (
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                onOpenHamroAI();
              }}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl border font-medium cursor-pointer transition-colors ${
                isDark
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
                  : 'border-emerald-300 bg-emerald-50 text-emerald-900 hover:bg-emerald-100'
              }`}
            >
              <div className="flex items-center gap-2">
                <Bot className="h-4 w-4 text-emerald-400" />
                <span className={language === 'ne' ? "font-['Noto_Sans_Devanagari']" : ''}>
                  {language === 'ne' ? 'हाम्रो एआई (रोमन/देवनागरी च्याट)' : 'Hamro AI (Romanized & Unicode Chat)'}
                </span>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500 text-slate-950">LIVE</span>
            </button>
          )}

          {/* Mobile Global Search Button inside Drawer */}
          {onOpenSearch && (
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                onOpenSearch();
              }}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl border font-medium cursor-pointer transition-colors ${
                isDark
                  ? 'border-white/10 bg-white/[0.04] text-slate-200 hover:bg-white/[0.08]'
                  : 'border-slate-200 bg-slate-100 text-slate-800 hover:bg-slate-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-emerald-400" />
                <span className={language === 'ne' ? "font-['Noto_Sans_Devanagari']" : ''}>
                  {language === 'ne' ? 'एआई टुल्स, सेवा र FAQ खोज्नुहोस्...' : 'Search tools, services & FAQs...'}
                </span>
              </div>
              <kbd className="text-[10px] font-mono bg-white/10 px-2 py-0.5 rounded text-slate-400">⌘K</kbd>
            </button>
          )}

          <a
            href="https://studio.nepalai.tech"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMobileOpen(false)}
            className={`flex items-center justify-between p-2.5 rounded-xl border font-medium ${
              isDark
                ? 'border-indigo-500/40 bg-indigo-950/40 text-indigo-200'
                : 'border-indigo-200 bg-indigo-50 text-indigo-700'
            }`}
            aria-label="Launch NepalAI Studio (opens in new tab)"
          >
            <span className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-400" aria-hidden="true" />
              <span className={language === 'ne' ? "font-['Noto_Sans_Devanagari']" : ''}>
                {t.nav.studio}
              </span>
            </span>
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </a>

          <a
            href="#about"
            onClick={(e) => handleLinkClick(e, 'about')}
            className={`block p-2 hover:text-emerald-500 ${language === 'ne' ? "font-['Noto_Sans_Devanagari']" : ''}`}
            aria-label="View About section"
          >
            {t.nav.about}
          </a>

          <a
            href="#consulting"
            onClick={(e) => handleLinkClick(e, 'consulting')}
            className={`block p-2 hover:text-emerald-500 ${language === 'ne' ? "font-['Noto_Sans_Devanagari']" : ''}`}
            aria-label="View Consulting Services"
          >
            {t.nav.services}
          </a>

          <a
            href="#tools-directory"
            onClick={(e) => handleLinkClick(e, 'tools-directory')}
            className={`block p-2 hover:text-emerald-500 ${language === 'ne' ? "font-['Noto_Sans_Devanagari']" : ''}`}
            aria-label="View AI Tools Directory"
          >
            {t.nav.toolsDirectory}
          </a>

          <a
            href="#free-ai-tools"
            onClick={(e) => handleLinkClick(e, 'free-ai-tools')}
            className={`block p-2 text-emerald-400 font-semibold hover:text-emerald-300 ${language === 'ne' ? "font-['Noto_Sans_Devanagari']" : ''}`}
            aria-label="View Free AI Tools, APIs and Data Extraction Guide"
          >
            {t.nav.freeTools}
          </a>

          <a
            href="#automation"
            onClick={(e) => handleLinkClick(e, 'automation')}
            className={`block p-2 hover:text-emerald-500 ${language === 'ne' ? "font-['Noto_Sans_Devanagari']" : ''}`}
            aria-label="View AI Automation Workflows"
          >
            {t.automation?.title || 'Automation'}
          </a>

          <a
            href="#daily-tools"
            onClick={(e) => handleLinkClick(e, 'daily-tools')}
            className={`block p-2 hover:text-emerald-500 ${language === 'ne' ? "font-['Noto_Sans_Devanagari']" : ''}`}
            aria-label="View Daily Essential Utilities"
          >
            {t.dailyTools?.title || 'Daily Utilities'}
          </a>

          <a
            href="#faq"
            onClick={(e) => handleLinkClick(e, 'faq')}
            className={`block p-2 hover:text-emerald-500 ${language === 'ne' ? "font-['Noto_Sans_Devanagari']" : ''}`}
            aria-label="View FAQ"
          >
            {t.nav.faq}
          </a>

          <a
            href="#contact"
            onClick={(e) => handleLinkClick(e, 'contact')}
            className={`block p-2 hover:text-emerald-500 ${language === 'ne' ? "font-['Noto_Sans_Devanagari']" : ''}`}
            aria-label="View Contact section"
          >
            {t.nav.contact}
          </a>

          <div className="pt-2 border-t border-slate-500/20 flex flex-col gap-2">
            {onToggleZenMode && (
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  onToggleZenMode();
                }}
                className={`w-full py-2 rounded-xl border text-xs text-center font-semibold flex items-center justify-center gap-2 ${
                  isZenMode
                    ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400'
                    : isDark
                      ? 'border-white/10 bg-white/[0.04] text-slate-300'
                      : 'border-slate-200 bg-slate-100 text-slate-700'
                }`}
                aria-label="Toggle Zen Mode"
              >
                <Eye className="h-3.5 w-3.5 text-emerald-400" />
                <span>{language === 'ne' ? 'जेन पठन मोड खोल्नुहोस्' : 'Enter Zen Reading Mode'}</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                onOpenAdminPanel();
              }}
              className={`w-full py-2 rounded-xl border text-xs text-center font-mono ${
                isDark
                  ? 'border-white/10 bg-white/[0.04] text-slate-300'
                  : 'border-slate-200 bg-slate-100 text-slate-700'
              }`}
              aria-label="Open Admin Configuration Panel"
            >
              {t.nav.adminPanel}
            </button>
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                onOpenConsultation();
              }}
              className="w-full py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-center text-xs shadow-sm"
              aria-label="Book an AI Consultation"
            >
              <span className={language === 'ne' ? "font-['Noto_Sans_Devanagari']" : ''}>
                {t.nav.bookConsultation}
              </span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
