import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { ThemeMode, Language } from '../types';
import { TRANSLATIONS } from '../data/translations';

interface BackToTopProps {
  theme?: ThemeMode;
  language?: Language;
  className?: string;
}

export const BackToTop: React.FC<BackToTopProps> = ({ theme = 'dark', language = 'en', className = '' }) => {
  const [visible, setVisible] = useState(false);
  const isDark = theme === 'dark';
  const langKey = language && TRANSLATIONS[language] ? language : 'en';
  const t = TRANSLATIONS[langKey];

  useEffect(() => {
    const handleScroll = () => {
      // Show when scrolled past Hero (approx 450px)
      const scrolled = window.scrollY > 450;
      setVisible(scrolled);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const label = t?.backToTop?.label || 'Back to Top';

  if (!visible) return null;

  return (
    <div
      className={`transition-all duration-300 ${
        className ? className : 'fixed bottom-6 right-6 z-40'
      }`}
    >
      <button
        onClick={scrollToTop}
        type="button"
        id="back-to-top-button"
        aria-label={label}
        title={label}
        className={`group relative flex h-11 w-11 items-center justify-center rounded-xl border backdrop-blur-md shadow-lg transition-colors duration-200 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-cyan-500 cursor-pointer ${
          isDark
            ? 'bg-[#0f1320]/95 border-white/15 text-slate-200 hover:text-white hover:border-cyan-400/70 hover:bg-[#151a2c] shadow-black/40'
            : 'bg-white/95 border-slate-300 text-slate-800 hover:text-slate-950 hover:border-cyan-500 hover:bg-slate-50 shadow-slate-300/50'
        }`}
      >
        <ArrowUp className="h-5 w-5 transition-colors duration-200 group-hover:text-cyan-500 dark:group-hover:text-cyan-300" aria-hidden="true" />
        
        {/* Subtle tooltip on hover */}
        <span
          className={`absolute bottom-full mb-2 hidden md:group-hover:block whitespace-nowrap rounded-md px-2 py-1 text-[11px] font-medium tracking-tight pointer-events-none transition-opacity shadow-md ${
            isDark
              ? 'bg-slate-900 text-slate-200 border border-white/10'
              : 'bg-slate-900 text-white'
          }`}
        >
          {label}
        </span>
      </button>
    </div>
  );
};
