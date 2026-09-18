import React from 'react';
import { Sparkles, ArrowUpRight, Mail, MapPin } from 'lucide-react';
import { ThemeMode, Language } from '../types';
import { NepalAILogo } from './NepalAILogo';
import { TRANSLATIONS } from '../data/translations';

interface FooterProps {
  theme?: ThemeMode;
  language?: Language;
  onOpenConsultation: () => void;
}

export const Footer: React.FC<FooterProps> = ({ theme = 'dark', language = 'en', onOpenConsultation }) => {
  const isDark = theme === 'dark';
  const t = TRANSLATIONS[language];

  return (
    <footer
      className={`border-t text-xs transition-colors duration-300 ${
        isDark ? 'border-slate-800 bg-[#06080e] text-slate-400' : 'border-slate-200 bg-white text-slate-600'
      }`}
      role="contentinfo"
      aria-label="Site footer"
    >
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-8 border-b border-slate-500/20">
          
          {/* Brand */}
          <div className="md:col-span-4 space-y-3">
            <NepalAILogo theme={theme} size="md" showDevanagariTag={true} />

            <p className={`text-xs leading-relaxed font-['Noto_Sans_Devanagari'] ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            }`}>
              {t.footer.tagline}
            </p>

            <div className="flex items-center gap-1.5 text-[11px] opacity-80">
              <MapPin className="h-3 w-3 text-emerald-500" aria-hidden="true" />
              <span>{t.footer.nepalLocations}</span>
            </div>
          </div>

          {/* Studio Link Column */}
          <div className="md:col-span-3 space-y-2.5">
            <h3 className={`text-xs font-semibold uppercase ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>
              {t.footer.studioPlatform}
            </h3>
            <ul className="space-y-1.5 text-xs">
              <li>
                <a
                  href="https://studio.nepalai.tech"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Open NepalAI Studio (opens in new tab)"
                  className="flex items-center gap-1.5 text-indigo-500 hover:text-indigo-600 font-semibold focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
                >
                  <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>NepalAI Studio ↗</span>
                </a>
              </li>
              <li>
                <a
                  href="#studio-bento"
                  className="hover:text-emerald-500 transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 rounded"
                >
                  Devnagari Prompt Sandbox
                </a>
              </li>
              <li>
                <a
                  href="#tools-directory"
                  className="hover:text-emerald-500 transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 rounded"
                >
                  Nepal AI Tools & Payment Directory
                </a>
              </li>
              <li>
                <a
                  href="https://studio.nepalai.tech"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="FonePay and eSewa Quick Recharge on NepalAI Studio"
                  className="hover:text-emerald-500 transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 rounded"
                >
                  FonePay & eSewa Quick Recharge
                </a>
              </li>
            </ul>
          </div>

          {/* Consulting Services Column */}
          <div className="md:col-span-3 space-y-2.5">
            <h3 className={`text-xs font-semibold uppercase ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>
              Enterprise Consulting
            </h3>
            <ul className="space-y-1.5 text-xs">
              <li>
                <a
                  href="#consulting"
                  className="hover:text-emerald-500 transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 rounded"
                >
                  Devnagari OCR & KYC Automation
                </a>
              </li>
              <li>
                <a
                  href="#consulting"
                  className="hover:text-emerald-500 transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 rounded"
                >
                  NRB Compliant AI Audit
                </a>
              </li>
              <li>
                <a
                  href="#consulting"
                  className="hover:text-emerald-500 transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 rounded"
                >
                  Nepali-English Legal RAG
                </a>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenConsultation}
                  aria-label="Book a scoping advisory session"
                  className="text-emerald-500 hover:underline flex items-center gap-1 font-medium focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 rounded"
                >
                  <span>Book Scoping Advisory</span>
                  <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
                </button>
              </li>
            </ul>
          </div>

          {/* Local Contact Column */}
          <div className="md:col-span-2 space-y-2.5">
            <h3 className={`text-xs font-semibold uppercase ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>
              {t.footer.contactUs}
            </h3>
            <div className="space-y-1.5 text-xs">
              <a
                href="mailto:contact@nepalai.tech"
                aria-label="Send email to contact@nepalai.tech"
                className="flex items-center gap-1.5 text-slate-400 hover:text-emerald-500 transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 rounded"
              >
                <Mail className="h-3.5 w-3.5 text-emerald-500" aria-hidden="true" />
                <span>contact@nepalai.tech</span>
              </a>
              <p className="text-[11px] opacity-75">
                Kathmandu Valley, Nepal
              </p>
            </div>
          </div>

        </div>

        {/* Bottom */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] opacity-75">
          <div>
            © {new Date().getFullYear()} nepalai.tech. {t.footer.rights}
          </div>

          <nav className="flex items-center gap-4" aria-label="Footer quick navigation">
            <a
              href="https://studio.nepalai.tech"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Launch NepalAI Studio (opens in new tab)"
              className="hover:underline focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 rounded px-0.5"
            >
              Launch Studio
            </a>
            <span aria-hidden="true">•</span>
            <a
              href="#case-studies"
              className="hover:underline focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 rounded px-0.5"
            >
              Case Studies
            </a>
            <span aria-hidden="true">•</span>
            <a
              href="#consulting"
              className="hover:underline focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 rounded px-0.5"
            >
              Enterprise Services
            </a>
          </nav>
        </div>

      </div>
    </footer>
  );
};
