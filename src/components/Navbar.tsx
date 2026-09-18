import React, { useState } from 'react';
import { Sparkles, ArrowUpRight, Menu, X, SlidersHorizontal, Sun, Moon, Languages } from 'lucide-react';
import { ThemeMode, Language } from '../types';
import { NepalAILogo } from './NepalAILogo';
import { TRANSLATIONS } from '../data/translations';

interface NavbarProps {
  theme: ThemeMode;
  language: Language;
  onToggleTheme: () => void;
  onToggleLanguage: () => void;
  onSelectLanguage: (lang: Language) => void;
  onOpenConsultation: (serviceTitle?: string) => void;
  onOpenStackCalculator: () => void;
  onOpenAdminPanel: () => void;
  selectedStackCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  theme,
  language,
  onToggleTheme,
  onToggleLanguage,
  onSelectLanguage,
  onOpenConsultation,
  onOpenStackCalculator,
  onOpenAdminPanel,
  selectedStackCount,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const isDark = theme === 'dark';
  const t = TRANSLATIONS[language];

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
          className="hidden md:flex items-center gap-6 text-xs"
          role="navigation"
          aria-label="Main navigation"
        >
          {/* Direct Link to studio.nepalai.tech */}
          <a
            href="https://studio.nepalai.tech"
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all shadow-sm group focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 ${
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
            href="#case-studies"
            className={`transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 rounded px-1 py-0.5 ${
              isDark ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-950'
            } ${language === 'ne' ? "font-['Noto_Sans_Devanagari']" : ''}`}
            aria-label="Navigate to Case Studies section"
          >
            {t.nav.caseStudies}
          </a>

          <a
            href="#consulting"
            className={`transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 rounded px-1 py-0.5 ${
              isDark ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-950'
            } ${language === 'ne' ? "font-['Noto_Sans_Devanagari']" : ''}`}
            aria-label="Navigate to AI Consulting Services section"
          >
            {t.nav.services}
          </a>

          <a
            href="#tools-directory"
            className={`transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 rounded px-1 py-0.5 ${
              isDark ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-950'
            } ${language === 'ne' ? "font-['Noto_Sans_Devanagari']" : ''}`}
            aria-label="Navigate to Verified AI Tools Directory"
          >
            {t.nav.toolsDirectory}
          </a>
        </nav>

        {/* Action Controls, Language Toggle & Theme Toggle */}
        <div className="hidden md:flex items-center gap-2.5">
          
          {/* LANGUAGE SEGMENTED SWITCHER */}
          <div
            className={`flex items-center rounded-xl border p-0.5 text-xs transition-colors ${
              isDark ? 'border-white/10 bg-white/[0.04]' : 'border-slate-200 bg-slate-100'
            }`}
            role="group"
            aria-label="Language selection"
          >
            <button
              type="button"
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
            </button>
            <button
              type="button"
              onClick={() => onSelectLanguage('ne')}
              className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all font-['Noto_Sans_Devanagari'] focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 ${
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
            </button>
          </div>

          {/* THEME TOGGLE: LIGHT / DARK */}
          <button
            type="button"
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
          </button>

          {/* Admin Customizer Trigger */}
          <button
            type="button"
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
          </button>

          {selectedStackCount > 0 && (
            <button
              type="button"
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
            </button>
          )}

          <button
            type="button"
            onClick={() => onOpenConsultation()}
            aria-label="Schedule an AI Consultation"
            className="flex items-center gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 px-3.5 py-1.5 text-xs font-bold text-slate-950 transition-colors shadow-sm focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            <span className={language === 'ne' ? "font-['Noto_Sans_Devanagari']" : ''}>
              {t.nav.bookConsultation}
            </span>
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>

        {/* Mobile Controls */}
        <div className="flex md:hidden items-center gap-2">
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
          className={`border-b px-4 py-4 md:hidden space-y-3 text-xs ${
            isDark ? 'border-white/10 bg-[#07090e] text-slate-200' : 'border-slate-200 bg-white text-slate-800'
          }`}
          role="region"
          aria-label="Mobile navigation menu"
        >
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
            href="#case-studies"
            onClick={() => setMobileOpen(false)}
            className={`block p-2 hover:text-emerald-500 ${language === 'ne' ? "font-['Noto_Sans_Devanagari']" : ''}`}
            aria-label="View Case Studies"
          >
            {t.nav.caseStudies}
          </a>

          <a
            href="#consulting"
            onClick={() => setMobileOpen(false)}
            className={`block p-2 hover:text-emerald-500 ${language === 'ne' ? "font-['Noto_Sans_Devanagari']" : ''}`}
            aria-label="View Consulting Services"
          >
            {t.nav.services}
          </a>

          <a
            href="#tools-directory"
            onClick={() => setMobileOpen(false)}
            className={`block p-2 hover:text-emerald-500 ${language === 'ne' ? "font-['Noto_Sans_Devanagari']" : ''}`}
            aria-label="View AI Tools Directory"
          >
            {t.nav.toolsDirectory}
          </a>

          <div className="pt-2 border-t border-slate-500/20 flex flex-col gap-2">
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
