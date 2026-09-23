import React from 'react';
import { Sparkles, ArrowUpRight, Mail, MapPin, ShieldCheck, HelpCircle, FileText } from 'lucide-react';
import { ThemeMode, Language, AppPage } from '../types';
import { NepalAILogo } from './NepalAILogo';
import { TRANSLATIONS } from '../data/translations';

interface FooterProps {
  theme?: ThemeMode;
  language?: Language;
  onSelectPage?: (page: AppPage) => void;
  onOpenConsultation: () => void;
  onOpenPrivacyPolicy?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ 
  theme = 'dark', 
  language = 'en', 
  onSelectPage,
  onOpenConsultation,
  onOpenPrivacyPolicy 
}) => {
  const isDark = theme === 'dark';
  const t = TRANSLATIONS[language];
  const isNepali = language === 'ne';

  const handlePageClick = (e: React.MouseEvent, page: AppPage) => {
    e.preventDefault();
    if (onSelectPage) {
      onSelectPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

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
              isDark ? 'text-slate-300' : 'text-slate-600'
            }`}>
              {t.footer.tagline}
            </p>

            {/* Platform Provenance Badge */}
            <div className={`p-3 rounded-xl border text-xs ${
              isDark ? 'bg-white/[0.03] border-white/10 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}>
              <div className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 mb-1">
                <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                <span>Engineered by Scamspike Solutions</span>
              </div>
              <p className="text-[11px] leading-relaxed opacity-90">
                Platform designed and created by{' '}
                <a
                  href="https://scamspike.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold underline hover:text-emerald-500 transition-colors"
                >
                  Scamspike Solutions Pvt. Ltd.
                </a>
                {' '}(Founder:{' '}
                <a
                  href="https://prakashsuvedi.com.np"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold underline hover:text-emerald-500 transition-colors"
                >
                  Prakash Suvedi
                </a>
                ).
              </p>
            </div>

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
                <button
                  type="button"
                  onClick={(e) => handlePageClick(e, 'home')}
                  className="hover:text-emerald-500 transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 rounded text-left cursor-pointer"
                >
                  {t.nav.home} ({isNepali ? 'गृहपृष्ठ' : 'Home Overview'})
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={(e) => handlePageClick(e, 'directory')}
                  className="hover:text-emerald-500 transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 rounded text-left cursor-pointer"
                >
                  {t.nav.directory} ({isNepali ? 'टुल्स डाइरेक्टरी' : '40+ Tools'})
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={(e) => handlePageClick(e, 'daily')}
                  className="hover:text-emerald-500 transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 rounded text-left cursor-pointer"
                >
                  {t.nav.daily} ({isNepali ? 'दैनिक एआई' : 'OCR & Voice'})
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={(e) => handlePageClick(e, 'free')}
                  className="hover:text-emerald-500 transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 rounded text-left cursor-pointer"
                >
                  {t.nav.free} ({isNepali ? 'निःशुल्क' : 'Free APIs'})
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={(e) => handlePageClick(e, 'consulting')}
                  className="hover:text-emerald-500 transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 rounded text-left cursor-pointer"
                >
                  {t.nav.consulting} ({isNepali ? 'परामर्श' : 'Enterprise'})
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={(e) => handlePageClick(e, 'compliance')}
                  className="hover:text-emerald-500 transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 rounded flex items-center gap-1 text-left cursor-pointer"
                >
                  <HelpCircle className="h-3 w-3 text-emerald-500" aria-hidden="true" />
                  <span>{t.nav.compliance}</span>
                </button>
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
                <button
                  type="button"
                  onClick={(e) => handlePageClick(e, 'compliance')}
                  className="hover:text-emerald-500 transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 rounded text-left cursor-pointer"
                >
                  eSewa / Khalti & Dollar Card Guide
                </button>
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

        {/* Executive Engineering Attribution Bar */}
        <div className={`my-6 p-4 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-4 text-xs transition-colors ${
          isDark 
            ? 'bg-gradient-to-r from-emerald-950/20 via-black/30 to-indigo-950/20 border-emerald-500/20 text-slate-300' 
            : 'bg-emerald-50/50 border-emerald-200 text-slate-700'
        }`}>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-bold shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="font-semibold text-xs flex items-center gap-2">
                <span>Platform Designed & Created by</span>
                <a
                  href="https://scamspike.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
                >
                  <span>Scamspike Solutions Pvt. Ltd.</span>
                  <ArrowUpRight className="h-3 w-3" />
                </a>
              </div>
              <p className="text-[11px] opacity-80 mt-0.5">
                Pioneering Devanagari sovereign artificial intelligence, cybersecurity, and enterprise automation in Nepal.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right hidden sm:block">
              <div className="text-[11px] opacity-75 font-mono">Engineering Leadership</div>
              <div className="font-bold text-xs">Prakash Suvedi (Founder)</div>
            </div>
            <a
              href="https://prakashsuvedi.com.np"
              target="_blank"
              rel="noopener noreferrer"
              className={`px-3.5 py-1.5 rounded-xl border text-xs font-semibold inline-flex items-center gap-1.5 transition-all shadow-2xs ${
                isDark
                  ? 'bg-white/5 border-white/10 text-emerald-300 hover:bg-emerald-500/15 hover:border-emerald-500/40'
                  : 'bg-white border-slate-200 text-emerald-900 hover:border-emerald-400'
              }`}
            >
              <span>prakashsuvedi.com.np</span>
              <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500" />
            </a>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] opacity-75">
          <div>
            © {new Date().getFullYear()} nepalai.tech. Platform by{' '}
            <a
              href="https://scamspike.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold hover:text-emerald-500 transition-colors"
            >
              Scamspike Solutions Pvt. Ltd.
            </a>
            {' '}(Founder:{' '}
            <a
              href="https://prakashsuvedi.com.np"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold hover:text-emerald-500 transition-colors"
            >
              Prakash Suvedi
            </a>
            ). {t.footer.rights}
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
