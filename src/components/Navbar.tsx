import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  ArrowUpRight, 
  Menu, 
  X, 
  SlidersHorizontal, 
  Sun, 
  Moon, 
  Languages, 
  Eye, 
  Search, 
  Bot, 
  MoreHorizontal,
  Layers,
  Home,
  Grid,
  Wrench,
  Briefcase,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ThemeMode, Language, AppPage } from '../types';
import { NepalAILogo } from './NepalAILogo';
import { TRANSLATIONS } from '../data/translations';

export interface NavbarProps {
  theme: ThemeMode;
  language: Language;
  currentPage: AppPage;
  onSelectPage: (page: AppPage) => void;
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
  currentPage,
  onSelectPage,
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
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  const isDark = theme === 'dark';
  const t = TRANSLATIONS[language];
  const isNe = language === 'ne';

  // Close more menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setMoreMenuOpen(false);
      }
    };
    if (moreMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [moreMenuOpen]);

  // The 6 main application pages
  const navPages: { id: AppPage; labelEn: string; labelNe: string; icon: React.ElementType }[] = [
    { id: 'home', labelEn: 'Home', labelNe: 'गृहपृष्ठ', icon: Home },
    { id: 'directory', labelEn: 'Tools Directory', labelNe: 'टुल्स डाइरेक्टरी', icon: Grid },
    { id: 'daily', labelEn: 'Daily AI', labelNe: 'दैनिक एआई', icon: Wrench },
    { id: 'free', labelEn: 'Free AI & News', labelNe: 'निःशुल्क एआई', icon: Sparkles },
    { id: 'consulting', labelEn: 'Consulting', labelNe: 'परामर्श सेवा', icon: Briefcase },
    { id: 'compliance', labelEn: 'Compliance & FAQ', labelNe: 'नियम तथा मद्दत', icon: ShieldCheck },
  ];

  const handlePageSelect = (page: AppPage) => {
    onSelectPage(page);
    setMobileOpen(false);
    setMoreMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b transition-colors duration-300 backdrop-blur-xl overflow-x-hidden ${
        isDark
          ? 'border-white/[0.08] bg-[#07090e]/90 text-slate-100'
          : 'border-slate-200/90 bg-white/95 text-slate-800 shadow-xs'
      }`}
      role="banner"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => handlePageSelect('home')}
            className="flex items-center group focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-lg cursor-pointer"
            id="navbar-brand"
            aria-label="nepalai.tech Home"
          >
            <NepalAILogo theme={theme} size="md" showDevanagariTag={true} animateOnLoad={true} />
          </button>
        </div>

        {/* Desktop Modular Page Navigation Tabs - Clean, no horizontal scroll */}
        <nav
          className="hidden xl:flex items-center gap-0.5 2xl:gap-1 bg-white/[0.04] dark:bg-black/30 p-1 rounded-full border border-slate-200/80 dark:border-white/[0.08]"
          role="navigation"
          aria-label="Main page navigation"
        >
          {navPages.map((page) => {
            const isActive = currentPage === page.id;
            return (
              <button
                key={page.id}
                type="button"
                onClick={() => handlePageSelect(page.id)}
                className={`relative px-2.5 2xl:px-3 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer min-h-[44px] flex items-center justify-center ${
                  isActive
                    ? isDark
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-xs'
                      : 'bg-emerald-600 text-white shadow-xs'
                    : isDark
                      ? 'text-slate-300 hover:text-white hover:bg-white/[0.06]'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                {isNe ? page.labelNe : page.labelEn}
              </button>
            );
          })}

          {/* External Studio Link */}
          <a
            href="https://studio.nepalai.tech"
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-1.5 px-2.5 2xl:px-3 rounded-full text-xs font-semibold whitespace-nowrap transition-all border min-h-[44px] ${
              isDark
                ? 'border-indigo-500/30 bg-indigo-950/30 text-indigo-300 hover:text-white hover:border-indigo-400'
                : 'border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
            }`}
            title="Open NepalAI Studio Workbench (new tab)"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true" />
            <span>Studio</span>
            <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
          </a>
        </nav>

        {/* Action Controls & Utilities */}
        <div className="hidden xl:flex items-center gap-1.5 2xl:gap-2 shrink-0">
          
          {/* HAMRO AI VERNACULAR CHAT */}
          {onOpenHamroAI && (
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onOpenHamroAI}
              className={`flex items-center gap-1.5 rounded-xl border px-2.5 2xl:px-3 text-xs font-semibold transition-all cursor-pointer min-h-[44px] ${
                isDark
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
                  : 'border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
              }`}
              title={isNe ? 'हाम्रो एआई च्याट' : 'Hamro AI Chat'}
              aria-label="Open Hamro AI Chat"
            >
              <Bot className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
              <span>{isNe ? 'हाम्रो एआई' : 'Hamro AI'}</span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </motion.button>
          )}

          {/* GLOBAL SEARCH COMMAND PALETTE */}
          {onOpenSearch && (
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onOpenSearch}
              className={`flex items-center justify-center gap-1.5 rounded-xl border px-2.5 text-xs transition-colors cursor-pointer min-h-[44px] min-w-[44px] ${
                isDark
                  ? 'border-white/10 bg-white/[0.04] text-slate-300 hover:text-white hover:bg-white/[0.08]'
                  : 'border-slate-200 bg-slate-100 text-slate-700 hover:text-slate-950'
              }`}
              title="Search tools & documentation (Ctrl+K)"
              aria-label="Open Global Search"
            >
              <Search className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
              <span className="hidden 2xl:inline text-[11px] font-mono text-slate-400">Ctrl+K</span>
            </motion.button>
          )}

          {/* LANGUAGE TOGGLE */}
          <div
            className={`flex items-center rounded-xl border p-0.5 text-xs min-h-[44px] ${
              isDark ? 'border-white/10 bg-white/[0.04]' : 'border-slate-200 bg-slate-100'
            }`}
            role="group"
            aria-label="Language selection"
          >
            <button
              type="button"
              onClick={() => onSelectLanguage('en')}
              className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all min-h-[38px] flex items-center justify-center ${
                language === 'en'
                  ? isDark
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                    : 'bg-white text-emerald-700 font-bold shadow-xs'
                  : isDark
                    ? 'text-slate-400 hover:text-white'
                    : 'text-slate-600 hover:text-slate-950'
              }`}
              aria-pressed={language === 'en'}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => onSelectLanguage('ne')}
              className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all min-h-[38px] flex items-center justify-center ${
                language === 'ne'
                  ? isDark
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                    : 'bg-white text-emerald-700 font-bold shadow-xs'
                  : isDark
                    ? 'text-slate-400 hover:text-white'
                    : 'text-slate-600 hover:text-slate-950'
              }`}
              aria-pressed={language === 'ne'}
            >
              नेपाली
            </button>
          </div>

          {/* THEME TOGGLE */}
          <motion.button
            type="button"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={onToggleTheme}
            className={`p-2 rounded-xl border transition-all text-xs cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center ${
              isDark
                ? 'border-white/10 bg-white/[0.04] text-amber-300 hover:text-white'
                : 'border-slate-200 bg-slate-100 text-slate-700 hover:text-slate-950'
            }`}
            title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
            aria-label={t.nav.toggleTheme}
          >
            {isDark ? (
              <Sun className="h-3.5 w-3.5 text-amber-400" aria-hidden="true" />
            ) : (
              <Moon className="h-3.5 w-3.5 text-indigo-600" aria-hidden="true" />
            )}
          </motion.button>

          {/* MORE TOOLS DROPDOWN (Zen, Admin Panel, Stack Calculator) */}
          <div className="relative" ref={moreMenuRef}>
            <button
              type="button"
              onClick={() => setMoreMenuOpen(!moreMenuOpen)}
              className={`p-2 rounded-xl border transition-all text-xs cursor-pointer relative min-h-[44px] min-w-[44px] flex items-center justify-center ${
                moreMenuOpen
                  ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400'
                  : isDark
                    ? 'border-white/10 bg-white/[0.04] text-slate-300 hover:text-white'
                    : 'border-slate-200 bg-slate-100 text-slate-700 hover:text-slate-950'
              }`}
              title="More Utilities & Settings"
              aria-label="More tools and utilities"
              aria-expanded={moreMenuOpen}
            >
              <MoreHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
              {selectedStackCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-slate-950">
                  {selectedStackCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {moreMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className={`absolute right-0 mt-2 w-56 rounded-2xl border p-2 shadow-2xl z-50 backdrop-blur-xl ${
                    isDark
                      ? 'border-white/10 bg-[#090d18]/95 text-slate-200 shadow-black/80'
                      : 'border-slate-200 bg-white/95 text-slate-800 shadow-xl'
                  }`}
                >
                  {/* Selected Stack Calculator */}
                  <button
                    type="button"
                    onClick={() => {
                      setMoreMenuOpen(false);
                      onOpenStackCalculator();
                    }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold transition-colors min-h-[44px] ${
                      isDark ? 'hover:bg-white/[0.06]' : 'hover:bg-slate-100'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Layers className="h-3.5 w-3.5 text-emerald-400" />
                      <span>{t.nav.stackCalculator}</span>
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold">
                      {selectedStackCount}
                    </span>
                  </button>

                  {/* Zen Reading Mode */}
                  {onToggleZenMode && (
                    <button
                      type="button"
                      onClick={() => {
                        setMoreMenuOpen(false);
                        onToggleZenMode();
                      }}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold transition-colors min-h-[44px] ${
                        isDark ? 'hover:bg-white/[0.06]' : 'hover:bg-slate-100'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Eye className="h-3.5 w-3.5 text-indigo-400" />
                        <span>{t.nav.zenMode}</span>
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">Z</span>
                    </button>
                  )}

                  {/* Admin Configuration Panel */}
                  <button
                    type="button"
                    onClick={() => {
                      setMoreMenuOpen(false);
                      onOpenAdminPanel();
                    }}
                    className={`w-full flex items-center gap-2 p-2.5 rounded-xl text-xs font-semibold transition-colors min-h-[44px] ${
                      isDark ? 'hover:bg-white/[0.06]' : 'hover:bg-slate-100'
                    }`}
                  >
                    <SlidersHorizontal className="h-3.5 w-3.5 text-amber-400" />
                    <span>{t.nav.adminPanel}</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* BOOK CONSULTATION CTA BUTTON */}
          <motion.button
            type="button"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onOpenConsultation()}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 px-3.5 text-xs font-bold text-slate-950 transition-colors shadow-sm cursor-pointer min-h-[44px]"
          >
            <span>{t.nav.bookConsultation}</span>
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </motion.button>
        </div>

        {/* Mobile & Tablet Top Bar Controls (< 1280px) */}
        <div className="flex xl:hidden items-center gap-2">
          {/* Quick Hamro AI */}
          {onOpenHamroAI && (
            <button
              type="button"
              onClick={onOpenHamroAI}
              className={`min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl border text-xs cursor-pointer ${
                isDark
                  ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-400'
                  : 'border-emerald-300 bg-emerald-50 text-emerald-800'
              }`}
              title="Hamro AI"
              aria-label="Open Hamro AI Chat"
            >
              <Bot className="h-4 w-4" aria-hidden="true" />
            </button>
          )}

          {/* Quick Search */}
          {onOpenSearch && (
            <button
              type="button"
              onClick={onOpenSearch}
              className={`min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl border text-xs cursor-pointer ${
                isDark
                  ? 'border-white/10 bg-white/[0.04] text-slate-300'
                  : 'border-slate-200 bg-slate-100 text-slate-700'
              }`}
              title="Search"
              aria-label="Open Global Search"
            >
              <Search className="h-4 w-4 text-emerald-400" aria-hidden="true" />
            </button>
          )}

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={onToggleTheme}
            className={`min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl border text-xs cursor-pointer ${
              isDark
                ? 'border-white/10 bg-white/[0.04] text-amber-300'
                : 'border-slate-200 bg-slate-100 text-slate-700'
            }`}
            aria-label="Toggle theme"
          >
            {isDark ? (
              <Sun className="h-4 w-4 text-amber-400" aria-hidden="true" />
            ) : (
              <Moon className="h-4 w-4 text-indigo-600" aria-hidden="true" />
            )}
          </button>

          {/* Mobile Menu Hamburger */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`min-h-[44px] min-w-[44px] flex items-center justify-center focus:outline-hidden rounded-xl border transition-colors cursor-pointer ${
              mobileOpen
                ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400'
                : isDark
                  ? 'border-white/10 bg-white/[0.04] text-slate-300'
                  : 'border-slate-200 bg-white text-slate-700'
            }`}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>

      </div>

      {/* Sleek Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className={`xl:hidden border-b px-4 py-5 space-y-4 max-h-[85vh] overflow-y-auto overflow-x-hidden ${
              isDark ? 'border-white/10 bg-[#07090e] text-slate-200' : 'border-slate-200 bg-white text-slate-800'
            }`}
            role="region"
            aria-label="Mobile navigation menu"
          >
            {/* Pages Segment List */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 px-2 block mb-2">
                {isNe ? 'मुख्य खण्डहरू (पृष्ठहरू):' : 'Platform Pages:'}
              </span>
              {navPages.map((page) => {
                const isActive = currentPage === page.id;
                const Icon = page.icon;
                return (
                  <button
                    key={page.id}
                    type="button"
                    onClick={() => handlePageSelect(page.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-semibold transition-all min-h-[44px] cursor-pointer ${
                      isActive
                        ? isDark
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-xs'
                          : 'bg-emerald-600 text-white shadow-xs'
                        : isDark
                          ? 'text-slate-300 hover:bg-white/[0.06] hover:text-white'
                          : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-4 w-4 text-emerald-400" aria-hidden="true" />
                      <span className="text-sm">
                        {isNe ? page.labelNe : page.labelEn}
                      </span>
                    </div>
                    {isActive && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-400 text-slate-950 font-bold">
                        Active
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Quick Actions & Language */}
            <div className="pt-4 border-t border-slate-500/20 space-y-3">
              {/* Language Switcher */}
              <div className="flex items-center justify-between px-2">
                <span className="text-xs text-slate-400 flex items-center gap-1.5">
                  <Languages className="h-3.5 w-3.5 text-emerald-400" />
                  <span>{isNe ? 'भाषा चयन:' : 'Language:'}</span>
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onSelectLanguage('en')}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold min-h-[44px] flex items-center justify-center ${
                      language === 'en'
                        ? 'bg-emerald-500 text-slate-950 font-bold'
                        : isDark ? 'text-slate-400 bg-white/[0.04]' : 'text-slate-600 bg-slate-100'
                    }`}
                  >
                    EN
                  </button>
                  <button
                    type="button"
                    onClick={() => onSelectLanguage('ne')}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold min-h-[44px] flex items-center justify-center ${
                      language === 'ne'
                        ? 'bg-emerald-500 text-slate-950 font-bold'
                        : isDark ? 'text-slate-400 bg-white/[0.04]' : 'text-slate-600 bg-slate-100'
                    }`}
                  >
                    नेपाली
                  </button>
                </div>
              </div>

              {/* Stack Calculator Button */}
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  onOpenStackCalculator();
                }}
                className={`w-full flex items-center justify-between p-3.5 rounded-2xl border text-xs font-semibold min-h-[44px] ${
                  isDark
                    ? 'border-white/10 bg-white/[0.03] text-slate-200'
                    : 'border-slate-200 bg-slate-50 text-slate-800'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-emerald-400" />
                  <span>{t.nav.stackCalculator}</span>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold">
                  {selectedStackCount} tools
                </span>
              </button>

              {/* Studio External Link */}
              <a
                href="https://studio.nepalai.tech"
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full flex items-center justify-between p-3.5 rounded-2xl border text-xs font-semibold min-h-[44px] ${
                  isDark
                    ? 'border-indigo-500/30 bg-indigo-950/20 text-indigo-300'
                    : 'border-indigo-200 bg-indigo-50 text-indigo-700'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-400" />
                  <span>NepalAI Studio Workbench</span>
                </span>
                <ArrowUpRight className="h-4 w-4" />
              </a>

              {/* Book Consultation Button */}
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  onOpenConsultation();
                }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md cursor-pointer min-h-[44px]"
              >
                <span>{t.nav.bookConsultation}</span>
                <ArrowUpRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
