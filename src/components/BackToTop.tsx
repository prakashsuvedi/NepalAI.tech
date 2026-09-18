import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { ThemeMode, Language } from '../types';
import { TRANSLATIONS } from '../data/translations';

interface BackToTopProps {
  theme?: ThemeMode;
  language?: Language;
}

export const BackToTop: React.FC<BackToTopProps> = ({ theme = 'dark', language = 'en' }) => {
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

  return (
    <div
      className={`fixed bottom-6 right-6 z-40 transition-all duration-300 ${
        visible
          ? 'opacity-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
    >
      <button
        onClick={scrollToTop}
        type="button"
        id="back-to-top-button"
        aria-label={label}
        title={label}
        className={`group relative flex h-11 w-11 items-center justify-center rounded-xl border backdrop-blur-md shadow-lg transition-all duration-200 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 active:scale-95 ${
          isDark
            ? 'bg-[#0f1320]/80 border-white/10 text-slate-300 hover:text-white hover:border-emerald-500/50 hover:bg-[#151a2c] shadow-black/40'
            : 'bg-white/90 border-slate-200 text-slate-700 hover:text-slate-950 hover:border-emerald-400 hover:bg-slate-50 shadow-slate-300/50'
        }`}
      >
        <ArrowUp className="h-5 w-5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:text-emerald-500" aria-hidden="true" />
        
        {/* Subtle tooltip on hover */}
        <span
          className={`absolute bottom-full mb-2 hidden md:group-hover:block whitespace-nowrap rounded-md px-2 py-1 text-[11px] font-medium tracking-tight pointer-events-none transition-opacity shadow-md ${
            isDark
              ? 'bg-slate-900 text-slate-200 border border-white/10'
              : 'bg-slate-900 text-white'
          } ${langKey === 'ne' ? "font-['Noto_Sans_Devanagari']" : ''}`}
        >
          {label}
        </span>
      </button>
    </div>
  );
};
