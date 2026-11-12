import React from 'react';
import { ArrowUpRight, Mail, MapPin, ShieldCheck, FileText } from 'lucide-react';
import { ThemeMode, Language, AppPage } from '../types';
import { NepalAILogo } from './NepalAILogo';
import { TRANSLATIONS } from '../data/translations';

interface FooterProps {
  theme?: ThemeMode;
  language?: Language;
  onSelectPage?: (page: AppPage) => void;
  onOpenConsultation: () => void;
  onOpenPrivacyPolicy?: () => void;
  onOpenAdminPanel?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ 
  theme = 'dark', 
  language = 'en', 
  onSelectPage,
  onOpenConsultation,
  onOpenPrivacyPolicy,
  onOpenAdminPanel
}) => {
  const isDark = theme === 'dark';
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
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
          
          {/* Brand & Provenance */}
          <div className="md:col-span-5 space-y-3">
            <NepalAILogo theme={theme} size="md" showDevanagariTag={true} />

            <p className={`text-xs leading-relaxed max-w-md ${
              isDark ? 'text-slate-300' : 'text-slate-600'
            }`}>
              {t.footer.tagline}
            </p>

            {/* Authoritative Single Provenance Card */}
            <div className={`p-3.5 rounded-xl border text-xs max-w-md ${
              isDark ? 'bg-white/[0.02] border-white/10 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}>
              <div className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 mb-1">
                <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                <span>{isNepali ? 'स्क्यामस्पाइक सोलुसन्सद्वारा निर्मित' : 'Engineered by Scamspike Solutions'}</span>
              </div>
              <p className="text-[11px] leading-relaxed opacity-90">
                {isNepali ? (
                  <>
                    प्लेटफर्म डिजाइन र निर्माण:{' '}
                    <a
                      href="https://scamspike.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold underline hover:text-emerald-500 transition-colors"
                    >
                      स्क्यामस्पाइक सोलुसन्स प्रा. लि. (Scamspike Solutions Pvt. Ltd.)
                    </a>
                    {' '}• संस्थापक:{' '}
                    <a
                      href="https://prakashsuvedi.com.np"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold underline hover:text-emerald-500 transition-colors"
                    >
                      प्रकाश सुवेदी (Prakash Suvedi)
                    </a>
                  </>
                ) : (
                  <>
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
                  </>
                )}
              </p>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] opacity-80 pt-1">
              <MapPin className="h-3.5 w-3.5 text-emerald-500" aria-hidden="true" />
              <span>{t.footer.nepalLocations}</span>
            </div>
          </div>

          {/* Quick Navigation Pages */}
          <div className="md:col-span-3 space-y-2.5">
            <h3 className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>
              {t.footer.quickLinks}
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  type="button"
                  onClick={(e) => handlePageClick(e, 'home')}
                  className="hover:text-emerald-500 transition-colors cursor-pointer text-left"
                >
                  {isNepali ? 'गृहपृष्ठ (Home)' : 'Home Overview'}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={(e) => handlePageClick(e, 'command-center')}
                  className="hover:text-emerald-500 transition-colors cursor-pointer text-left"
                >
                  {isNepali ? 'कमान्ड सेन्टर (Command Center)' : 'Command Center'}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={(e) => handlePageClick(e, 'directory')}
                  className="hover:text-emerald-500 transition-colors cursor-pointer text-left"
                >
                  {isNepali ? 'टुल्स डाइरेक्टरी (Tools Directory)' : 'AI Tools Directory'}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={(e) => handlePageClick(e, 'daily')}
                  className="hover:text-emerald-500 transition-colors cursor-pointer text-left"
                >
                  {isNepali ? 'दैनिक एआई (Daily Tools)' : 'Daily Essential Tools'}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={(e) => handlePageClick(e, 'free')}
                  className="hover:text-emerald-500 transition-colors cursor-pointer text-left"
                >
                  {isNepali ? 'निःशुल्क एआई र समाचार (Free AI)' : 'Free APIs & Intelligence'}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={(e) => handlePageClick(e, 'consulting')}
                  className="hover:text-emerald-500 transition-colors cursor-pointer text-left"
                >
                  {isNepali ? 'परामर्श सेवा (Consulting)' : 'Enterprise Consulting'}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={(e) => handlePageClick(e, 'compliance')}
                  className="hover:text-emerald-500 transition-colors cursor-pointer text-left"
                >
                  {isNepali ? 'नियम तथा मद्दत (Compliance & FAQ)' : 'Compliance & FAQ'}
                </button>
              </li>
            </ul>
          </div>

          {/* Platform & Resources */}
          <div className="md:col-span-2 space-y-2.5">
            <h3 className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>
              {isNepali ? 'स्रोत र स्टुडियो' : 'Studio & Resources'}
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="https://studio.nepalai.tech"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-indigo-500 hover:text-indigo-400 font-semibold"
                >
                  <span>NepalAI Studio</span>
                  <ArrowUpRight className="h-3 w-3" />
                </a>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenConsultation}
                  className="text-emerald-500 hover:underline flex items-center gap-1 cursor-pointer text-left font-medium"
                >
                  <span>{isNepali ? 'परामर्श बुक गर्नुहोस्' : 'Book Scoping Advisory'}</span>
                  <ArrowUpRight className="h-3 w-3" />
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenPrivacyPolicy?.()}
                  className="hover:text-emerald-500 transition-colors cursor-pointer text-left"
                >
                  {t.footer.privacyPolicy}
                </button>
              </li>
              <li>
                <a
                  href="/llms.txt"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-500 transition-colors inline-flex items-center gap-1 font-mono text-[11px]"
                >
                  <FileText className="h-3 w-3 text-emerald-500" />
                  <span>AI Agent (llms.txt)</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="md:col-span-2 space-y-2.5">
            <h3 className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>
              {t.footer.contactUs}
            </h3>
            <div className="space-y-2 text-xs">
              <a
                href="mailto:contact@nepalai.tech"
                className="flex items-center gap-1.5 hover:text-emerald-500 transition-colors"
              >
                <Mail className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                <span>contact@nepalai.tech</span>
              </a>
              <a
                href="https://prakashsuvedi.com.np"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-emerald-500 hover:underline font-mono text-[11px]"
              >
                <span>prakashsuvedi.com.np</span>
                <ArrowUpRight className="h-3 w-3" />
              </a>
              <p className="text-[11px] opacity-75">
                Kathmandu & Pokhara, Nepal
              </p>
            </div>
          </div>

        </div>

        {/* Bottom Clean Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] opacity-75">
          <div>
            © {new Date().getFullYear()} nepalai.tech. {isNepali ? 'सर्वाधिकार सुरक्षित।' : 'All rights reserved.'}{' '}
            Scamspike Solutions Pvt. Ltd. (Prakash Suvedi).
          </div>

          <div className="flex items-center gap-4">
            <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer" className="hover:underline">
              Sitemap
            </a>
            <span>•</span>
            <a href="/robots.txt" target="_blank" rel="noopener noreferrer" className="hover:underline">
              Robots.txt
            </a>
            {onOpenAdminPanel && (
              <>
                <span>•</span>
                <button
                  type="button"
                  onClick={onOpenAdminPanel}
                  className="text-emerald-500 hover:underline cursor-pointer"
                >
                  Admin
                </button>
              </>
            )}
          </div>
        </div>

      </div>
    </footer>
  );
};
