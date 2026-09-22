import React, { useEffect } from 'react';
import { X, ShieldCheck, Lock, FileText, Server, Printer, CheckCircle2 } from 'lucide-react';
import { ThemeMode, Language } from '../types';
import { TRANSLATIONS } from '../data/translations';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme?: ThemeMode;
  language?: Language;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({
  isOpen,
  onClose,
  theme = 'dark',
  language = 'en',
}) => {
  const isDark = theme === 'dark';
  const t = TRANSLATIONS[language];
  const isNepali = language === 'ne';

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="privacy-modal-title"
        className={`relative w-full max-w-3xl rounded-2xl border p-5 sm:p-7 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden ${
          isDark
            ? 'border-white/10 bg-[#0c0e18] text-slate-100'
            : 'border-slate-200 bg-white text-slate-900'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-500/20 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shrink-0">
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3
                  id="privacy-modal-title"
                  className={`text-base sm:text-lg font-bold font-display ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  {t.privacy.modalTitle}
                </h3>
                <span className="hidden sm:inline-block text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-300">
                  Sovereignty
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {t.privacy.badge} • {t.privacy.lastUpdated}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              title="Print policy document"
              className="p-1.5 rounded-lg border border-slate-500/20 text-slate-400 hover:text-white hover:bg-white/5 transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500"
              aria-label="Print policy document"
            >
              <Printer className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg border border-slate-500/20 text-slate-400 hover:text-white hover:bg-white/5 transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto py-5 space-y-6 text-xs sm:text-sm leading-relaxed pr-2">
          
          <div
            className={`p-4 rounded-xl border ${
              isDark
                ? 'border-emerald-500/20 bg-emerald-950/20 text-emerald-200'
                : 'border-emerald-200 bg-emerald-50 text-emerald-900'
            }`}
          >
            <p className={isNepali ? "font-['Noto_Sans_Devanagari']" : ''}>
              {t.privacy.intro}
            </p>
          </div>

          {/* Section 1 */}
          <div className="space-y-2">
            <h4
              className={`text-sm font-bold flex items-center gap-2 ${
                isDark ? 'text-white' : 'text-slate-900'
              } ${isNepali ? "font-['Noto_Sans_Devanagari']" : ''}`}
            >
              <Lock className="h-4 w-4 text-emerald-400 shrink-0" aria-hidden="true" />
              <span>{t.privacy.section1Title}</span>
            </h4>
            <p className={`text-slate-400 ${isNepali ? "font-['Noto_Sans_Devanagari']" : ''}`}>
              {t.privacy.section1Body}
            </p>
          </div>

          {/* Section 2 */}
          <div className="space-y-2">
            <h4
              className={`text-sm font-bold flex items-center gap-2 ${
                isDark ? 'text-white' : 'text-slate-900'
              } ${isNepali ? "font-['Noto_Sans_Devanagari']" : ''}`}
            >
              <Server className="h-4 w-4 text-indigo-400 shrink-0" aria-hidden="true" />
              <span>{t.privacy.section2Title}</span>
            </h4>
            <p className={`text-slate-400 ${isNepali ? "font-['Noto_Sans_Devanagari']" : ''}`}>
              {t.privacy.section2Body}
            </p>
          </div>

          {/* Section 3 */}
          <div className="space-y-2">
            <h4
              className={`text-sm font-bold flex items-center gap-2 ${
                isDark ? 'text-white' : 'text-slate-900'
              } ${isNepali ? "font-['Noto_Sans_Devanagari']" : ''}`}
            >
              <FileText className="h-4 w-4 text-amber-400 shrink-0" aria-hidden="true" />
              <span>{t.privacy.section3Title}</span>
            </h4>
            <p className={`text-slate-400 ${isNepali ? "font-['Noto_Sans_Devanagari']" : ''}`}>
              {t.privacy.section3Body}
            </p>
          </div>

          {/* Section 4 */}
          <div className="space-y-2">
            <h4
              className={`text-sm font-bold flex items-center gap-2 ${
                isDark ? 'text-white' : 'text-slate-900'
              } ${isNepali ? "font-['Noto_Sans_Devanagari']" : ''}`}
            >
              <ShieldCheck className="h-4 w-4 text-cyan-400 shrink-0" aria-hidden="true" />
              <span>{t.privacy.section4Title}</span>
            </h4>
            <p className={`text-slate-400 ${isNepali ? "font-['Noto_Sans_Devanagari']" : ''}`}>
              {t.privacy.section4Body}
            </p>
          </div>

          {/* Section 5 */}
          <div className="space-y-2">
            <h4
              className={`text-sm font-bold flex items-center gap-2 ${
                isDark ? 'text-white' : 'text-slate-900'
              } ${isNepali ? "font-['Noto_Sans_Devanagari']" : ''}`}
            >
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" aria-hidden="true" />
              <span>{t.privacy.section5Title}</span>
            </h4>
            <p className={`text-slate-400 ${isNepali ? "font-['Noto_Sans_Devanagari']" : ''}`}>
              {t.privacy.section5Body}
            </p>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="pt-4 border-t border-slate-500/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shrink-0">
          <span className="text-slate-400 font-mono text-[11px]">
            {t.privacy.contactDpo}
          </span>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-colors"
          >
            {t.privacy.closeBtn}
          </button>
        </div>

      </div>
    </div>
  );
};
