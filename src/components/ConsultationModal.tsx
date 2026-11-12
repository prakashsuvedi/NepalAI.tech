import React, { useState, useEffect } from 'react';
import { 
  X, 
  Send, 
  CheckCircle2, 
  ShieldCheck, 
  Mail, 
  MessageSquare, 
  Phone, 
  Building, 
  User, 
  Briefcase, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { ThemeMode, Language } from '../types';
import { submitConsultationRequest } from '../services/consultationService';

interface ConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefilledService?: string;
  theme?: ThemeMode;
  language?: Language;
}

export const ConsultationModal: React.FC<ConsultationModalProps> = ({
  isOpen,
  onClose,
  prefilledService = '',
  theme = 'dark',
  language = 'en',
}) => {
  const { showToast } = useToast();
  const isDark = theme === 'dark';
  const isNepali = language === 'ne';

  // Form Fields
  const [service, setService] = useState<string>(prefilledService || 'Enterprise AI Architecture & MVP Sprint');
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [organization, setOrganization] = useState<string>('');
  const [timeline, setTimeline] = useState<string>('2-Week MVP Sprint');
  const [budgetNpr, setBudgetNpr] = useState<string>('रू २,००,००० - ५,००,०००');
  const [projectScope, setProjectScope] = useState<string>('');
  
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (prefilledService) {
      setService(prefilledService);
    }
  }, [prefilledService, isOpen]);

  useEffect(() => {
    if (isOpen) {
      setSubmitted(false);
      setFormErrors({});
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const errors: { [key: string]: string } = {};
    if (!name.trim()) errors.name = isNepali ? 'कृपया आफ्नो नाम लेख्नुहोस्।' : 'Name is required.';
    if (!email.trim() || !email.includes('@')) errors.email = isNepali ? 'मान्य इमेल आवश्यक छ।' : 'Valid email is required.';
    if (!phone.trim()) errors.phone = isNepali ? 'सम्पर्क नम्बर आवश्यक छ।' : 'Phone or WhatsApp is required.';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await submitConsultationRequest({
        fullName: name,
        email,
        phone,
        organization,
        industry: 'Enterprise',
        serviceCategory: service,
        budgetRange: budgetNpr,
        timeline,
        billingPreference: 'NPR VAT Invoicing',
        message: projectScope || `Consultation request for ${service}`,
        source: 'consultation_modal',
      });
    } catch (err) {
      console.log('Lead persistence notice:', err);
    }

    setIsSubmitting(false);
    setSubmitted(true);
    showToast(
      isNepali ? 'अनुरोध प्राप्त भयो' : 'Request Received',
      isNepali ? 'तपाईंको परामर्श अनुरोध दर्ता भयो। हामी छिट्टै सम्पर्क गर्नेछौं।' : 'Your briefing has been received. We will contact you shortly.',
      'success',
      5000
    );
  };

  const whatsappMessage = encodeURIComponent(
    `Namaste NepalAI Team! I would like to book an AI consultation.\n\nName: ${name}\nOrganization: ${organization}\nService: ${service}\nPhone: ${phone}`
  );
  const whatsappUrl = `https://wa.me/9779800000000?text=${whatsappMessage}`;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm p-3 sm:p-4 flex min-h-screen items-center justify-center"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="consultation-modal-title"
        className={`relative w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] my-auto transition-colors ${
          isDark
            ? 'border-white/10 bg-[#090d16] text-slate-100 shadow-black/80'
            : 'border-slate-200 bg-white text-slate-900 shadow-xl'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className={`px-5 py-4 border-b flex items-center justify-between shrink-0 ${
          isDark ? 'border-white/10 bg-white/[0.02]' : 'border-slate-100 bg-slate-50/50'
        }`}>
          <div>
            <div className="text-[11px] font-mono font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-0.5">
              {isNepali ? 'परामर्श तथा इन्जिनियरिङ' : 'Advisory & Engineering'}
            </div>
            <h2 id="consultation-modal-title" className="text-base sm:text-lg font-bold font-display">
              {isNepali ? 'एआई परामर्श बुक गर्नुहोस्' : 'Schedule AI Consultation'}
            </h2>
          </div>

          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center ${
              isDark ? 'text-slate-400 hover:text-white hover:bg-white/10' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
            aria-label="Close modal"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 overscroll-contain text-xs">
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Service Selection */}
              <div>
                <label className={`block font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  {isNepali ? 'इच्छुक सेवा वा विषय' : 'Consulting Track'}
                </label>
                <select
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  className={`w-full rounded-xl border p-2.5 text-xs transition-colors focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 ${
                    isDark
                      ? 'border-white/10 bg-white/[0.04] text-white focus:border-emerald-500/60'
                      : 'border-slate-300 bg-slate-50 text-slate-900 focus:bg-white focus:border-emerald-600'
                  }`}
                >
                  <option value="Enterprise AI Architecture & MVP Sprint">Enterprise AI Architecture & 2-Week MVP Sprint</option>
                  <option value="Devanagari OCR & Document AI Pipeline">Devanagari OCR & Document AI Pipeline</option>
                  <option value="NRB IT Compliance & Data Residency Audit">NRB IT Compliance & Data Residency Audit</option>
                  <option value="WhatsApp & Conversational Banking Agent">WhatsApp & Conversational Banking Agent</option>
                  <option value="AI Infrastructure Proxy & Local Invoicing">Local NPR Invoicing & Token Gateway</option>
                  <option value="General Technical Advisory">General Technical Advisory</option>
                </select>
              </div>

              {/* Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={`block font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    {isNepali ? 'नाम *' : 'Full Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={isNepali ? 'तपाईंको नाम' : 'Your name'}
                    className={`w-full rounded-xl border px-3 py-2 text-xs transition-colors focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 ${
                      isDark
                        ? 'border-white/10 bg-white/[0.04] text-white placeholder:text-slate-500 focus:border-emerald-500/60'
                        : 'border-slate-300 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-emerald-600'
                    }`}
                  />
                  {formErrors.name && <p className="text-red-500 text-[11px] mt-1">{formErrors.name}</p>}
                </div>

                <div>
                  <label className={`block font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    {isNepali ? 'इमेल *' : 'Business Email *'}
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@organization.com"
                    className={`w-full rounded-xl border px-3 py-2 text-xs transition-colors focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 ${
                      isDark
                        ? 'border-white/10 bg-white/[0.04] text-white placeholder:text-slate-500 focus:border-emerald-500/60'
                        : 'border-slate-300 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-emerald-600'
                    }`}
                  />
                  {formErrors.email && <p className="text-red-500 text-[11px] mt-1">{formErrors.email}</p>}
                </div>
              </div>

              {/* Phone & Organization */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={`block font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    {isNepali ? 'फोन / ह्वाट्सएप *' : 'Phone / WhatsApp *'}
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+977 98XXXXXXXX"
                    className={`w-full rounded-xl border px-3 py-2 text-xs transition-colors focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 ${
                      isDark
                        ? 'border-white/10 bg-white/[0.04] text-white placeholder:text-slate-500 focus:border-emerald-500/60'
                        : 'border-slate-300 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-emerald-600'
                    }`}
                  />
                  {formErrors.phone && <p className="text-red-500 text-[11px] mt-1">{formErrors.phone}</p>}
                </div>

                <div>
                  <label className={`block font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    {isNepali ? 'संस्था / कम्पनी' : 'Organization'}
                  </label>
                  <input
                    type="text"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    placeholder={isNepali ? 'कम्पनीको नाम' : 'Company or Agency'}
                    className={`w-full rounded-xl border px-3 py-2 text-xs transition-colors focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 ${
                      isDark
                        ? 'border-white/10 bg-white/[0.04] text-white placeholder:text-slate-500 focus:border-emerald-500/60'
                        : 'border-slate-300 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-emerald-600'
                    }`}
                  />
                </div>
              </div>

              {/* Project Scope Note */}
              <div>
                <label className={`block font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  {isNepali ? 'परियोजना वा आवश्यकताको संक्षिप्त विवरण' : 'Project Note & Requirements'}
                </label>
                <textarea
                  rows={3}
                  value={projectScope}
                  onChange={(e) => setProjectScope(e.target.value)}
                  placeholder={isNepali ? 'तपाईंको मुख्य लक्ष्य र समयसीमा...' : 'Briefly describe your objectives, systems, or questions...'}
                  className={`w-full rounded-xl border p-2.5 text-xs transition-colors focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 ${
                    isDark
                      ? 'border-white/10 bg-white/[0.04] text-white placeholder:text-slate-500 focus:border-emerald-500/60'
                      : 'border-slate-300 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-emerald-600'
                  }`}
                />
              </div>

              {/* Privacy & NDA Guarantee */}
              <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" aria-hidden="true" />
                <span>
                  {isNepali
                    ? 'गोपनीयता सुरक्षित। सबै विवरणहरू व्यावसायिक मर्यादा अनुसार रहनेछन्।'
                    : 'NDA protected. All inquiries remain strictly confidential.'}
                </span>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 min-h-[44px]"
                >
                  <Send className="h-4 w-4" aria-hidden="true" />
                  <span>
                    {isSubmitting
                      ? (isNepali ? 'पठाउँदै...' : 'Submitting...')
                      : (isNepali ? 'परामर्श अनुरोध पेस गर्नुहोस्' : 'Submit Consultation Request')}
                  </span>
                </button>
              </div>

              {/* Quick WhatsApp Link */}
              <div className="text-center pt-1">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>{isNepali ? 'वा सिधै ह्वाट्सएपमा कुरा गर्नुहोस्' : 'Or chat directly via WhatsApp'}</span>
                </a>
              </div>

            </form>
          ) : (
            /* Submission Confirmation */
            <div className="text-center py-8 space-y-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
              </div>

              <h3 className={`text-lg font-bold font-display ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {isNepali ? 'अनुरोध दर्ता भयो!' : 'Consultation Request Registered!'}
              </h3>

              <p className={`text-xs max-w-sm mx-auto leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                {isNepali
                  ? `धन्यवाद ${name}! हाम्रो इन्जिनियरिङ टिमले २४ घण्टा भित्र सम्पर्क गर्नेछ।`
                  : `Thank you, ${name}! Our senior AI engineering team in Kathmandu will review your scope and get in touch within 24 hours.`}
              </p>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    onClose();
                  }}
                  className={`px-5 py-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                    isDark ? 'border-white/15 text-white hover:bg-white/10' : 'border-slate-300 text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  {isNepali ? 'सम्पन्न' : 'Done'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
