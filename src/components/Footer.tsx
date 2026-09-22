import React from 'react';
import { Sparkles, ArrowUpRight, Mail, MapPin, ShieldCheck, HelpCircle, FileText } from 'lucide-react';
import { ThemeMode, Language } from '../types';
import { NepalAILogo } from './NepalAILogo';
import { TRANSLATIONS } from '../data/translations';

interface FooterProps {
  theme?: ThemeMode;
  language?: Language;
  onOpenConsultation: () => void;
  onOpenPrivacyPolicy?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ 
  theme = 'dark', 
  language = 'en', 
  onOpenConsultation,
  onOpenPrivacyPolicy 
}) => {
  const isDark = theme === 'dark';
  const t = TRANSLATIONS[language];
  const isNepali = language === 'ne';

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

            <p className={`text-xs leading-relaxed ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            }`}>
              {t.footer.tagline}
            </p>

            <div className="flex items-center gap-1.5 text-[11px] opacity-80">
              <MapPin className="h-3 w-3 text-emerald-500" aria-hidden="true" />
              <span>{t.footer.nepalLocations}</span>
            </div>
          </div>

          {/* Quick Navigation Column */}
          <div className="md:col-span-3 space-y-2.5">
            <h3 className={`text-xs font-semibold uppercase ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>
              {t.footer.quickLinks}
            </h3>
            <ul className="space-y-1.5 text-xs">
              <li>
                <a
                  href="#about"
                  className="hover:text-emerald-500 transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 rounded"
                >
                  {t.nav.about} (Sovereign AI)
                </a>
              </li>
              <li>
                <a
                  href="#consulting"
                  className="hover:text-emerald-500 transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 rounded"
                >
                  {t.nav.services}
                </a>
              </li>
              <li>
                <a
                  href="#tools-directory"
                  className="hover:text-emerald-500 transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 rounded"
                >
                  {t.nav.toolsDirectory}
                </a>
              </li>
              <li>
                <a
                  href="#faq"
                  className="hover:text-emerald-500 transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 rounded flex items-center gap-1"
                >
                  <HelpCircle className="h-3 w-3 text-emerald-500" aria-hidden="true" />
                  <span>{t.nav.faq}</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Studio & Payments Column */}
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
                  href="#faq"
                  className="hover:text-emerald-500 transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 rounded"
                >
                  eSewa / Khalti & Dollar Card Guide
                </a>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenPrivacyPolicy?.()}
                  className="hover:text-emerald-500 transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 rounded flex items-center gap-1 text-left"
                >
                  <ShieldCheck className="h-3 w-3 text-emerald-500" aria-hidden="true" />
                  <span>{t.footer.privacyPolicy}</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenConsultation}
                  aria-label="Book a scoping advisory session"
                  className="text-emerald-500 hover:underline flex items-center gap-1 font-medium focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 rounded text-left"
                >
                  <span>Book Scoping Advisory</span>
                  <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
                </button>
              </li>
            </ul>
          </div>

          {/* Direct Contact Column */}
          <div className="md:col-span-2 space-y-2.5">
            <h3 className={`text-xs font-semibold uppercase ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>
              {t.footer.contactUs}
            </h3>
            <div className="space-y-2 text-xs">
              <a
                href="#contact"
                className="inline-block hover:text-emerald-500 transition-colors font-medium"
              >
                {isNepali ? 'सम्पर्क फारम खोल्नुहोस्' : 'Open Contact Form'}
              </a>
              <a
                href="mailto:contact@nepalai.tech"
                aria-label="Send email to contact@nepalai.tech"
                className="flex items-center gap-1.5 text-slate-400 hover:text-emerald-500 transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 rounded"
              >
                <Mail className="h-3.5 w-3.5 text-emerald-500" aria-hidden="true" />
                <span>contact@nepalai.tech</span>
              </a>
              <p className="text-[11px] opacity-75">
                Kathmandu & Pokhara
              </p>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] opacity-75">
          <div>
            © {new Date().getFullYear()} nepalai.tech. {t.footer.rights}
          </div>

          <nav className="flex flex-wrap items-center gap-3 sm:gap-4" aria-label="Footer quick navigation">
            <a
              href="#about"
              className="hover:underline focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 rounded px-0.5"
            >
              {t.nav.about}
            </a>
            <span aria-hidden="true">•</span>
            <a
              href="#faq"
              className="hover:underline focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 rounded px-0.5"
            >
              {t.nav.faq}
            </a>
            <span aria-hidden="true">•</span>
            <a
              href="#contact"
              className="hover:underline focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 rounded px-0.5"
            >
              {t.nav.contact}
            </a>
            <span aria-hidden="true">•</span>
            <button
              type="button"
              onClick={() => onOpenPrivacyPolicy?.()}
              className="hover:underline focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 rounded px-0.5"
            >
              Privacy Policy
            </button>
          </nav>
        </div>

      </div>
    </footer>
  );
};
