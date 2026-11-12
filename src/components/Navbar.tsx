import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  ArrowUpRight, 
  Menu, 
  X, 
  Sun, 
  Moon, 
  Search, 
  Layers,
  Grid,
  Wrench,
  Briefcase,
  ShieldCheck,
  LayoutDashboard,
  ChevronDown,
  User as UserIcon,
  LogOut,
  Building2,
  Check,
  ShoppingBag
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { ThemeMode, Language, AppPage } from '../types';
import { NepalAILogo } from './NepalAILogo';
import { TRANSLATIONS } from '../data/translations';
import { useAuth } from '../context/AuthContext';
import { PWAInstallButton } from './pwa/PWAInstallButton';

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
  onOpenAuth?: (mode?: 'signin' | 'signup') => void;
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
  onSelectLanguage,
  onOpenConsultation,
  onOpenStackCalculator,
  onOpenSearch,
  onOpenAuth,
  selectedStackCount,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  
  const moreRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const { user, profile, currentBusiness, businesses, setCurrentBusiness, signOut } = useAuth();

  const isDark = theme === 'dark';
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const isNe = language === 'ne';

  // Core 4 primary destinations (calibrated for laptop width without overstretching)
  const primaryPages: { id: AppPage; labelEn: string; labelNe: string; icon: React.ElementType }[] = [
    { id: 'command-center', labelEn: 'Command Center', labelNe: 'कमान्ड सेन्टर', icon: LayoutDashboard },
    { id: 'directory', labelEn: 'Directory', labelNe: 'डाइरेक्टरी', icon: Grid },
    { id: 'daily', labelEn: 'Daily Utilities', labelNe: 'दैनिक टुल्स', icon: Wrench },
    { id: 'consulting', labelEn: 'Consulting', labelNe: 'परामर्श सेवा', icon: Briefcase },
  ];

  // Secondary pages housed under "More" popover to preserve laptop horizontal grid
  const secondaryPages: { id: AppPage; labelEn: string; labelNe: string; icon: React.ElementType }[] = [
    { id: 'commerce', labelEn: 'NepalAI Commerce', labelNe: 'नेपालएआई कमर्स', icon: ShoppingBag },
    { id: 'free', labelEn: 'Free AI & News', labelNe: 'निःशुल्क एआई', icon: Sparkles },
    { id: 'compliance', labelEn: 'Compliance & FAQ', labelNe: 'नियम तथा मद्दत', icon: ShieldCheck },
  ];

  const isSecondaryActive = secondaryPages.some((p) => p.id === currentPage);

  // Close popovers on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  const handlePageSelect = (page: AppPage) => {
    onSelectPage(page);
    setMobileOpen(false);
    setMoreOpen(false);
    setUserMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b transition-colors duration-300 backdrop-blur-xl ${
        isDark
          ? 'border-slate-800/80 bg-[#080d1a]/95 text-slate-100'
          : 'border-slate-200/90 bg-white/95 text-slate-800 shadow-2xs'
      }`}
      role="banner"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand Logo Zone */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => handlePageSelect('home')}
            className="flex items-center rounded-lg cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-cyan-500"
            aria-label="nepalai.tech Home"
          >
            <NepalAILogo theme={theme} size="md" showDevanagariTag={true} />
          </button>
        </div>

        {/* Desktop Navigation Links Zone (Streamlined 4 core items + More dropdown: Fits perfectly on 1024px+ laptops) */}
        <nav
          className="hidden lg:flex items-center gap-1 bg-slate-100/80 dark:bg-slate-900/60 p-1 rounded-full border border-slate-200/80 dark:border-slate-800"
          role="navigation"
          aria-label="Main page navigation"
        >
          {primaryPages.map((page) => {
            const isActive = currentPage === page.id;
            return (
              <button
                key={page.id}
                type="button"
                onClick={() => handlePageSelect(page.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap min-h-[34px] ${
                  isActive
                    ? isDark
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-xs'
                      : 'bg-cyan-600 text-white shadow-xs'
                    : isDark
                      ? 'text-slate-300 hover:text-white hover:bg-white/[0.06]'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white shadow-2xs'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                {isNe ? page.labelNe : page.labelEn}
              </button>
            );
          })}

          {/* "More" Popover Menu for Secondary Pages */}
          <div className="relative" ref={moreRef}>
            <button
              type="button"
              onClick={() => setMoreOpen(!moreOpen)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap min-h-[34px] flex items-center gap-1 ${
                isSecondaryActive
                  ? isDark
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'bg-cyan-600 text-white'
                  : isDark
                    ? 'text-slate-300 hover:text-white hover:bg-white/[0.06]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white'
              }`}
              aria-expanded={moreOpen}
              aria-label="More navigation options"
            >
              <span>{isNe ? 'थप' : 'More'}</span>
              <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${moreOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {moreOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className={`absolute left-0 mt-2 w-52 rounded-xl border p-1.5 shadow-lg backdrop-blur-xl z-50 ${
                    isDark
                      ? 'bg-[#0b1220]/95 border-slate-800 text-slate-200 shadow-cyan-950/20'
                      : 'bg-white/95 border-slate-200 text-slate-800 shadow-slate-300/40'
                  }`}
                >
                  {secondaryPages.map((page) => {
                    const Icon = page.icon;
                    const isActive = currentPage === page.id;
                    return (
                      <button
                        key={page.id}
                        type="button"
                        onClick={() => handlePageSelect(page.id)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left cursor-pointer ${
                          isActive
                            ? isDark
                              ? 'bg-cyan-500/20 text-cyan-300 font-semibold'
                              : 'bg-cyan-50 text-cyan-800 font-semibold'
                            : isDark
                              ? 'text-slate-300 hover:bg-white/5 hover:text-white'
                              : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950'
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5 text-cyan-500" />
                        <span>{isNe ? page.labelNe : page.labelEn}</span>
                      </button>
                    );
                  })}

                  <div className="my-1 border-t border-slate-200 dark:border-slate-800" />

                  {/* External Studio Link */}
                  <a
                    href="https://studio.nepalai.tech"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      isDark
                        ? 'text-slate-300 hover:bg-cyan-500/10 hover:text-cyan-300'
                        : 'text-slate-700 hover:bg-cyan-50 hover:text-cyan-800'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                      <span>{isNe ? 'नेपालएआई स्टुडियो' : 'NepalAI Studio'}</span>
                    </span>
                    <ArrowUpRight className="h-3 w-3 text-cyan-500" />
                  </a>

                  {/* Stack ROI Calculator */}
                  <button
                    type="button"
                    onClick={() => {
                      setMoreOpen(false);
                      onOpenStackCalculator();
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left cursor-pointer ${
                      isDark
                        ? 'text-slate-300 hover:bg-cyan-500/10 hover:text-cyan-300'
                        : 'text-slate-700 hover:bg-cyan-50 hover:text-cyan-800'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Layers className="h-3.5 w-3.5 text-cyan-400" />
                      <span>{t.nav.stackCalculator}</span>
                    </span>
                    {selectedStackCount > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono">
                        {selectedStackCount}
                      </span>
                    )}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </nav>

        {/* Desktop Action Zone: Search, Language, Theme, Auth & Primary CTA */}
        <div className="hidden lg:flex items-center gap-2 shrink-0">
          
          {/* Global Search */}
          {onOpenSearch && (
            <button
              type="button"
              onClick={onOpenSearch}
              className={`flex items-center justify-center rounded-xl border px-2.5 py-1.5 text-xs cursor-pointer min-h-[38px] min-w-[38px] transition-colors ${
                isDark
                  ? 'border-slate-800 bg-slate-900/60 text-slate-300 hover:text-white hover:border-cyan-500/40'
                  : 'border-slate-200 bg-slate-100 text-slate-700 hover:text-slate-950 hover:border-cyan-400/50'
              }`}
              title="Search tools, rates, and docs (Ctrl+K)"
              aria-label="Open Search"
            >
              <Search className="h-3.5 w-3.5 text-cyan-500 dark:text-cyan-400" aria-hidden="true" />
            </button>
          )}

          {/* Language Toggle (Compact EN / नेपाली switch) */}
          <div
            className={`flex items-center rounded-xl border p-0.5 text-xs min-h-[38px] ${
              isDark ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-slate-100'
            }`}
            role="group"
            aria-label="Language selection"
          >
            <button
              type="button"
              onClick={() => onSelectLanguage('en')}
              className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all min-h-[30px] cursor-pointer ${
                language === 'en'
                  ? isDark
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-xs'
                    : 'bg-white text-cyan-800 font-bold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              aria-pressed={language === 'en'}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => onSelectLanguage('ne')}
              className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all min-h-[30px] cursor-pointer ${
                language === 'ne'
                  ? isDark
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-xs'
                    : 'bg-white text-cyan-800 font-bold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              aria-pressed={language === 'ne'}
            >
              नेपाली
            </button>
          </div>

          {/* PWA In-App Install Button */}
          <PWAInstallButton />

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={onToggleTheme}
            className={`p-2 rounded-xl border transition-all text-xs cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center ${
              isDark
                ? 'border-slate-800 bg-slate-900/60 text-amber-300 hover:text-white'
                : 'border-slate-200 bg-slate-100 text-slate-700 hover:text-slate-950'
            }`}
            title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
            aria-label={t.nav.toggleTheme}
          >
            {isDark ? (
              <Sun className="h-3.5 w-3.5 text-amber-400" aria-hidden="true" />
            ) : (
              <Moon className="h-3.5 w-3.5 text-cyan-600" aria-hidden="true" />
            )}
          </button>

          {/* User Identity / Sign In Menu Button */}
          {user ? (
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium min-h-[38px] cursor-pointer transition-all ${
                  isDark
                    ? 'border-slate-800 bg-slate-900/70 hover:border-cyan-500/40 text-slate-200'
                    : 'border-slate-200 bg-white hover:border-cyan-500/50 text-slate-800 shadow-2xs'
                }`}
                aria-expanded={userMenuOpen}
                aria-label="User account and business menu"
              >
                <div className="w-5 h-5 rounded-full bg-cyan-600 text-white font-bold text-[10px] flex items-center justify-center">
                  {(profile?.fullName || user.email || 'N')[0].toUpperCase()}
                </div>
                <span className="font-semibold max-w-[100px] truncate">
                  {currentBusiness?.name || profile?.fullName || 'Account'}
                </span>
                <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* User Account Popover */}
              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className={`absolute right-0 mt-2 w-64 rounded-2xl border p-2 shadow-xl backdrop-blur-xl z-50 ${
                      isDark
                        ? 'bg-[#0b1220]/95 border-slate-800 text-slate-200 shadow-cyan-950/30'
                        : 'bg-white/98 border-slate-200 text-slate-800 shadow-slate-300/50'
                    }`}
                  >
                    {/* User profile card */}
                    <div className="p-2.5 pb-3 border-b border-slate-200 dark:border-slate-800">
                      <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {profile?.fullName || 'NepalAI User'}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {user.email}
                      </div>
                      <span className="inline-block mt-1 text-[9px] font-mono px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-bold uppercase">
                        {profile?.systemRole === 'super_admin' ? 'Super Admin' : 'Business Owner'}
                      </span>
                    </div>

                    {/* Active Business Tenant Switcher */}
                    <div className="py-2 border-b border-slate-200 dark:border-slate-800">
                      <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 px-2.5 mb-1">
                        {isNe ? 'सक्रिय व्यापार (Tenant):' : 'Active Business:'}
                      </div>
                      {businesses.map((biz) => {
                        const isCurrent = biz.id === currentBusiness?.id;
                        return (
                          <button
                            key={biz.id}
                            type="button"
                            onClick={() => {
                              setCurrentBusiness(biz);
                              setUserMenuOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                              isCurrent
                                ? isDark
                                  ? 'bg-cyan-500/20 text-cyan-300'
                                  : 'bg-cyan-50 text-cyan-800 font-semibold'
                                : isDark
                                  ? 'text-slate-300 hover:bg-white/5'
                                  : 'text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            <span className="flex items-center gap-2 truncate">
                              <Building2 className="h-3.5 w-3.5 text-cyan-500 shrink-0" />
                              <span className="truncate">{biz.name}</span>
                            </span>
                            {isCurrent && <Check className="h-3.5 w-3.5 text-cyan-500 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>

                    {/* Sign Out */}
                    <div className="pt-1.5">
                      <button
                        type="button"
                        onClick={async () => {
                          setUserMenuOpen(false);
                          await signOut();
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-colors text-left cursor-pointer"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        <span>{isNe ? 'लग-आउट गर्नुहोस्' : 'Sign Out'}</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onOpenAuth?.('signin')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all min-h-[38px] cursor-pointer ${
                isDark
                  ? 'border-slate-800 bg-slate-900/60 hover:border-cyan-500/40 text-slate-200 hover:text-white'
                  : 'border-slate-200 bg-white hover:border-cyan-500/50 text-slate-700 hover:text-slate-950 shadow-2xs'
              }`}
            >
              <UserIcon className="h-3.5 w-3.5 text-cyan-500" />
              <span>{isNe ? 'लग-इन' : 'Sign In'}</span>
            </button>
          )}

          {/* Book Consultation Primary CTA Button (Cyan Sovereign Palette) */}
          <button
            type="button"
            onClick={() => onOpenConsultation()}
            className="flex items-center gap-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 px-3.5 py-2 text-xs font-bold text-white transition-all shadow-xs hover:shadow-cyan-500/20 cursor-pointer min-h-[38px]"
          >
            <span>{t.nav.bookConsultation}</span>
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>

        {/* Mobile & Tablet Bar Controls (< 1024px: Clean 3-element zone, zero stretching) */}
        <div className="flex lg:hidden items-center gap-1.5 sm:gap-2">
          
          {/* Language Switcher in Mobile Top Bar */}
          <div
            className={`flex items-center rounded-xl border p-0.5 text-xs min-h-[36px] ${
              isDark ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-slate-100'
            }`}
            role="group"
            aria-label="Language selection"
          >
            <button
              type="button"
              onClick={() => onSelectLanguage('en')}
              className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-all min-h-[28px] cursor-pointer ${
                language === 'en'
                  ? isDark ? 'bg-cyan-500 text-slate-950' : 'bg-white text-cyan-800 shadow-xs'
                  : 'text-slate-400'
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => onSelectLanguage('ne')}
              className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-all min-h-[28px] cursor-pointer ${
                language === 'ne'
                  ? isDark ? 'bg-cyan-500 text-slate-950' : 'bg-white text-cyan-800 shadow-xs'
                  : 'text-slate-400'
              }`}
            >
              नेपाली
            </button>
          </div>

          {/* PWA In-App Install Button */}
          <PWAInstallButton />

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={onToggleTheme}
            className={`min-h-[36px] min-w-[36px] flex items-center justify-center rounded-xl border text-xs cursor-pointer transition-colors ${
              isDark
                ? 'border-slate-800 bg-slate-900/60 text-amber-300 hover:text-amber-200'
                : 'border-slate-200 bg-slate-100 text-slate-700 hover:text-slate-900'
            }`}
            aria-label="Toggle theme"
          >
            {isDark ? (
              <Sun className="h-3.5 w-3.5 text-amber-400" aria-hidden="true" />
            ) : (
              <Moon className="h-3.5 w-3.5 text-cyan-600" aria-hidden="true" />
            )}
          </button>

          {/* Menu Hamburger Button */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`min-h-[36px] min-w-[36px] flex items-center justify-center rounded-xl border transition-colors cursor-pointer ${
              mobileOpen
                ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-400'
                : isDark
                  ? 'border-slate-800 bg-slate-900/60 text-slate-300'
                  : 'border-slate-200 bg-white text-slate-700'
            }`}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>

      </div>

      {/* Clean Mobile & Tablet Navigation Drawer (Structured into logical sections, 0 overflow) */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className={`lg:hidden border-b px-4 py-4 space-y-4 max-h-[85vh] overflow-y-auto ${
              isDark ? 'border-slate-800 bg-[#080d1a] text-slate-200' : 'border-slate-200 bg-white text-slate-800'
            }`}
            role="region"
            aria-label="Mobile navigation menu"
          >
            {/* Quick Search Bar in Drawer */}
            {onOpenSearch && (
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  onOpenSearch();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-xs font-semibold min-h-[44px] cursor-pointer transition-colors ${
                  isDark
                    ? 'border-slate-800 bg-slate-900/60 text-slate-300 hover:text-white hover:border-cyan-500/40'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:border-cyan-500/40'
                }`}
                aria-label="Search tools and pages"
              >
                <span className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-cyan-500" />
                  <span>{isNe ? 'टुल्स तथा सामग्री खोज्नुहोस्...' : 'Search tools, docs, or pages...'}</span>
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-400 font-bold">
                  Ctrl+K
                </span>
              </button>
            )}

            {/* User Account / Sign In in Mobile Drawer */}
            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40">
              {user ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        {profile?.fullName || 'User Account'}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {currentBusiness?.name || user.email}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={async () => {
                        setMobileOpen(false);
                        await signOut();
                      }}
                      className="text-xs text-red-500 font-medium hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>{isNe ? 'लग-आउट' : 'Sign Out'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    onOpenAuth?.('signin');
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-cyan-600 text-white font-bold text-xs"
                >
                  <UserIcon className="h-4 w-4" />
                  <span>{isNe ? 'नेपालएआई लग-इन / खाता सिर्जना' : 'Sign In / Create Account'}</span>
                </button>
              )}
            </div>

            {/* Core Destinations */}
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2 block mb-1.5">
                {isNe ? 'प्रमुख खण्डहरू' : 'Core Destinations'}
              </span>
              {[...primaryPages, ...secondaryPages].map((page) => {
                const isActive = currentPage === page.id;
                const Icon = page.icon;
                return (
                  <button
                    key={page.id}
                    type="button"
                    onClick={() => handlePageSelect(page.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all min-h-[42px] cursor-pointer ${
                      isActive
                        ? isDark
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-xs'
                          : 'bg-cyan-600 text-white shadow-xs'
                        : isDark
                          ? 'text-slate-300 hover:bg-white/[0.04]'
                          : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="h-4 w-4 text-cyan-500 dark:text-cyan-400" aria-hidden="true" />
                      <span className="text-sm">
                        {isNe ? page.labelNe : page.labelEn}
                      </span>
                    </div>
                    {isActive && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-400 text-slate-950 font-bold">
                        Active
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Workbenches & External Studio */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2 block">
                {isNe ? 'स्टुडियो र उपकरणहरू' : 'Studio & Workbenches'}
              </span>

              {/* Stack Calculator Button */}
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  onOpenStackCalculator();
                }}
                className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs font-semibold min-h-[44px] cursor-pointer ${
                  isDark
                    ? 'border-slate-800 bg-slate-900/40 text-slate-200'
                    : 'border-slate-200 bg-slate-50 text-slate-800'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Layers className="h-4 w-4 text-cyan-500" />
                  <span>{t.nav.stackCalculator}</span>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 font-bold text-[10px]">
                  {selectedStackCount} tools
                </span>
              </button>

              {/* Studio External Link */}
              <a
                href="https://studio.nepalai.tech"
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs font-semibold min-h-[44px] ${
                  isDark
                    ? 'border-slate-800 bg-slate-900/40 text-cyan-300'
                    : 'border-cyan-200 bg-cyan-50/60 text-cyan-800'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Sparkles className="h-4 w-4 text-cyan-400" />
                  <span>NepalAI Studio Workbench</span>
                </span>
                <ArrowUpRight className="h-4 w-4" />
              </a>

              {/* Primary Consultation Action Button */}
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  onOpenConsultation();
                }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-xs cursor-pointer min-h-[44px]"
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
