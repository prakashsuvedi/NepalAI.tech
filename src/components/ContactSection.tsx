import React, { useState } from 'react';
import { 
  Mail, 
  MapPin, 
  Clock, 
  Send, 
  CheckCircle2, 
  MessageSquare, 
  Sparkles, 
  Phone, 
  ArrowUpRight,
  ShieldCheck,
  Building
} from 'lucide-react';
import { ThemeMode, Language, ContactFormData } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { useToast } from '../context/ToastContext';

interface ContactSectionProps {
  theme: ThemeMode;
  language: Language;
}

export const ContactSection: React.FC<ContactSectionProps> = ({
  theme,
  language,
}) => {
  const { showToast } = useToast();
  const isDark = theme === 'dark';
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const isNepali = language === 'ne';

  const [formData, setFormData] = useState<ContactFormData>({
    fullName: '',
    email: '',
    phone: '',
    organization: '',
    serviceCategory: '',
    budgetRange: '',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const serviceOptions = [
    { value: 'devanagari-ocr', labelEn: 'Devanagari OCR & Document AI (Nagarikta / Lalpurja)', labelNe: 'देवनागरी ओसीआर तथा कागजात एआई' },
    { value: 'enterprise-consulting', labelEn: 'Enterprise AI Architecture & 2-Week Prototyping Sprint', labelNe: 'संस्थागत एआई परामर्श तथा २-हप्ते स्प्रिन्ट' },
    { value: 'banking-compliance', labelEn: 'NRB Compliant AI Audit & Air-Gapped On-Premises Deploy', labelNe: 'राष्ट्र बैंक निर्देशिका तथा आफ्नै सर्भरमा कार्यान्वयन' },
    { value: 'studio-enterprise', labelEn: 'NepalAI Studio API Access & Team Volume Billing', labelNe: 'नेपाल एआई स्टुडियो एपीआई तथा टिम बिलिङ' },
    { value: 'devanagari-voice', labelEn: 'Nepali / Newari Dialect Neural Voice & Conversational Chat', labelNe: 'नेपाली न्युरल आवाज तथा द्विभाषिक च्याट' },
    { value: 'general-advisory', labelEn: 'General Executive Advisory & Feasibility Assessment', labelNe: 'सामान्य परामर्श तथा सम्भाव्यता अध्ययन' },
  ];

  const budgetOptions = [
    { value: 'under-50k', labelEn: 'Under NPR 50,000 (Scoping / Starter)', labelNe: 'रु. ५०,००० भन्दा कम (प्रारम्भिक)' },
    { value: '50k-150k', labelEn: 'NPR 50,000 – 1,50,000 (Rapid Sprint)', labelNe: 'रु. ५०,००० – १,५०,००० (द्रुत स्प्रिन्ट)' },
    { value: '150k-500k', labelEn: 'NPR 1,50,000 – 5,00,000 (Production System)', labelNe: 'रु. १,५०,००० – ५,००,००० (उत्पादन प्रणाली)' },
    { value: 'enterprise-custom', labelEn: 'NPR 5,00,000+ / Custom Enterprise Contract', labelNe: 'रु. ५,००,०००+ वा संस्थागत सम्झौता' },
    { value: 'usd-intl', labelEn: '$500 – $3,000+ USD (International / Diaspora)', labelNe: '$५०० – $३,०००+ USD (अन्तर्राष्ट्रिय)' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.fullName.trim() || !formData.email.trim() || !formData.message.trim()) {
      const msg = isNepali
        ? 'कृपया आफ्नो नाम, इमेल र परियोजनाको विवरण भर्नुहोस्।'
        : 'Please complete all required fields (Name, Email, and Message).';
      setErrorMessage(msg);
      showToast(isNepali ? 'अपूर्ण फारम' : 'Incomplete Form', msg, 'error');
      return;
    }

    setIsSubmitting(true);

    // Save lead to local storage and send to backend API
    try {
      const existingLeads = JSON.parse(localStorage.getItem('nepalai_contact_leads') || '[]');
      const newLead = {
        ...formData,
        submittedAt: new Date().toISOString(),
        id: `lead_${Date.now()}`,
      };
      localStorage.setItem('nepalai_contact_leads', JSON.stringify([...existingLeads, newLead]));

      // Dispatch to /api/contact
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      }).catch(err => console.log('API contact endpoint noted:', err));

    } catch (e) {
      console.error('Contact lead processing note', e);
    }

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      showToast(
        isNepali ? 'सम्पर्क अनुरोध प्राप्त भयो!' : 'Consultation Request Dispatched!',
        isNepali
          ? `धन्यवाद ${formData.fullName}! नेपाल एआई टिमले तपाईंलाई २४ घण्टा भित्र सम्पर्क गर्नेछ।`
          : `Thank you ${formData.fullName}! Our AI engineering team in Kathmandu will review your scope and get back within 24 hours.`,
        'success',
        6000
      );
    }, 600);
  };

  const handleResetForm = () => {
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      organization: '',
      serviceCategory: '',
      budgetRange: '',
      message: '',
    });
    setIsSubmitted(false);
    setErrorMessage('');
  };

  const whatsappMessage = encodeURIComponent(
    `Namaste NepalAI Team! I would like to inquire about AI Consulting and sovereign solutions for my project.`
  );
  const whatsappUrl = `https://wa.me/9779800000000?text=${whatsappMessage}`;

  return (
    <section
      id="contact"
      className={`relative border-t py-20 transition-colors duration-300 ${
        isDark ? 'border-white/[0.08] bg-[#070912]' : 'border-slate-200 bg-slate-50/70'
      }`}
      aria-labelledby="contact-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center space-y-3 mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold shadow-xs">
            <MessageSquare className="h-3.5 w-3.5 text-emerald-500" aria-hidden="true" />
            <span
              className={isDark ? 'text-emerald-400' : 'text-emerald-700'}
            >
              {t.contact.badge}
            </span>
          </div>

          <h2
            id="contact-heading"
            className={`text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight font-display ${
              isDark ? 'text-white' : 'text-slate-950'
            }`}
          >
            {t.contact.title}
          </h2>

          <p
            className={`text-sm sm:text-base leading-relaxed ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            }`}
          >
            {t.contact.subtitle}
          </p>
        </div>

        {/* Two Columns: Direct Info & Interactive Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Direct Info & Physical Locations */}
          <div className="lg:col-span-5 space-y-6">
            
            <div
              className={`rounded-2xl border p-6 sm:p-7 space-y-6 transition-all ${
                isDark
                  ? 'border-white/[0.08] bg-[#0c0f1c] text-slate-200'
                  : 'border-slate-200 bg-white text-slate-800 shadow-xs'
              }`}
            >
              <div className="space-y-1.5 pb-4 border-b border-slate-500/15">
                <h3
                  className={`text-base font-bold font-display ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  {t.contact.directTitle}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {t.contact.directSubtitle}
                </p>
              </div>

              <div className="space-y-4 text-xs">
                
                {/* Email */}
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                    <Mail className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-slate-400 font-medium">{t.contact.emailLabel}</div>
                    <a
                      href="mailto:contact@nepalai.tech"
                      className="font-bold text-emerald-400 hover:underline text-sm focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 rounded"
                    >
                      {t.contact.emailVal}
                    </a>
                  </div>
                </div>

                {/* WhatsApp */}
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                    <Phone className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-slate-400 font-medium">{t.contact.whatsappLabel}</div>
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-emerald-400 hover:underline text-sm flex items-center gap-1 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 rounded"
                    >
                      <span>{t.contact.whatsappVal}</span>
                      <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
                    </a>
                  </div>
                </div>

                {/* Office Location */}
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
                    <MapPin className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-slate-400 font-medium">{t.contact.officeLabel}</div>
                    <div className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                      {t.contact.officeVal}
                    </div>
                  </div>
                </div>

                {/* Working Hours */}
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                    <Clock className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-slate-400 font-medium">{t.contact.hoursLabel}</div>
                    <div className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                      {t.contact.hoursVal}
                    </div>
                  </div>
                </div>

              </div>

              {/* Instant WhatsApp Action Button */}
              <div className="pt-2 border-t border-slate-500/15">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-4 text-xs transition-all shadow-sm focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500"
                  aria-label="Direct chat on WhatsApp"
                >
                  <MessageSquare className="h-4 w-4" aria-hidden="true" />
                  <span>
                    {t.contact.whatsappChatBtn}
                  </span>
                </a>
              </div>
            </div>

            {/* Enterprise Security Commitment Badge */}
            <div
              className={`rounded-2xl border p-5 flex items-center gap-3.5 ${
                isDark
                  ? 'border-emerald-500/20 bg-emerald-950/20 text-slate-300'
                  : 'border-emerald-200 bg-emerald-50/80 text-slate-700'
              }`}
            >
              <ShieldCheck className="h-6 w-6 text-emerald-400 shrink-0" aria-hidden="true" />
              <div className="text-xs">
                <div className="font-bold text-emerald-400">
                  {isNepali ? 'गोपनीयता र सम्झौताको ग्यारेन्टी' : 'Guaranteed NDA & Confidentiality'}
                </div>
                <div className="text-[11px] opacity-80">
                  {isNepali
                    ? 'हाम्रा सबै परामर्श र छलफलहरू कानुनी रूपमा सुरक्षित र गोप्य रहनेछन्।'
                    : 'All discussions are protected under standard mutual NDAs before technical discovery.'}
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Interactive Consultation & Booking Form */}
          <div className="lg:col-span-7">
            <div
              className={`rounded-2xl border p-6 sm:p-8 transition-all ${
                isDark
                  ? 'border-white/[0.08] bg-[#0c0f1e] text-slate-100'
                  : 'border-slate-200 bg-white text-slate-900 shadow-sm'
              }`}
            >
              {isSubmitted ? (
                <div className="text-center py-10 space-y-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mx-auto animate-bounce">
                    <CheckCircle2 className="h-8 w-8" aria-hidden="true" />
                  </div>
                  
                  <div className="space-y-1.5">
                    <h3
                      className={`text-xl font-bold font-display ${
                        isDark ? 'text-white' : 'text-slate-900'
                      }`}
                    >
                      {t.contact.successTitle}
                    </h3>
                    <p
                      className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed"
                    >
                      {t.contact.successMessage}
                    </p>
                  </div>

                  <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={handleResetForm}
                      className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold hover:bg-emerald-400 transition-colors"
                    >
                      {t.contact.sendAnother}
                    </button>
                    
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl border border-white/10 text-xs text-slate-300 hover:text-white transition-colors flex items-center gap-1.5"
                    >
                      <MessageSquare className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
                      <span>{t.contact.whatsappChatBtn}</span>
                    </a>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4.5" noValidate>
                  
                  <div className="space-y-1 pb-2 border-b border-slate-500/15">
                    <h3
                      className={`text-base font-bold font-display ${
                        isDark ? 'text-white' : 'text-slate-900'
                      }`}
                    >
                      {t.contact.formTitle}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {t.contact.formSubtitle}
                    </p>
                  </div>

                  {errorMessage && (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                      <span className="font-bold">Notice:</span>
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    {/* Full Name */}
                    <div className="space-y-1.5">
                      <label 
                        htmlFor="contact-name" 
                        className={`block text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}
                      >
                        {t.contact.nameLabel}
                      </label>
                      <input
                        type="text"
                        id="contact-name"
                        required
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        placeholder={t.contact.namePlaceholder}
                        className={`w-full rounded-xl border px-3.5 py-2.5 text-xs transition-all focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                          isDark
                            ? 'border-white/10 bg-[#070912] text-white placeholder-slate-500 focus:border-emerald-500/50'
                            : 'border-slate-300 bg-slate-50 text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:bg-white'
                        }`}
                      />
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                      <label 
                        htmlFor="contact-email" 
                        className={`block text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}
                      >
                        {t.contact.emailInputLabel}
                      </label>
                      <input
                        type="email"
                        id="contact-email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder={t.contact.emailPlaceholder}
                        className={`w-full rounded-xl border px-3.5 py-2.5 text-xs transition-all focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                          isDark
                            ? 'border-white/10 bg-[#070912] text-white placeholder-slate-500 focus:border-emerald-500/50'
                            : 'border-slate-300 bg-slate-50 text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:bg-white'
                        }`}
                      />
                    </div>

                    {/* Phone */}
                    <div className="space-y-1.5">
                      <label 
                        htmlFor="contact-phone" 
                        className={`block text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}
                      >
                        {t.contact.phoneLabel}
                      </label>
                      <input
                        type="tel"
                        id="contact-phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder={t.contact.phonePlaceholder}
                        className={`w-full rounded-xl border px-3.5 py-2.5 text-xs transition-all focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                          isDark
                            ? 'border-white/10 bg-[#070912] text-white placeholder-slate-500 focus:border-emerald-500/50'
                            : 'border-slate-300 bg-slate-50 text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:bg-white'
                        }`}
                      />
                    </div>

                    {/* Organization */}
                    <div className="space-y-1.5">
                      <label 
                        htmlFor="contact-org" 
                        className={`block text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}
                      >
                        {t.contact.orgLabel}
                      </label>
                      <input
                        type="text"
                        id="contact-org"
                        value={formData.organization}
                        onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                        placeholder={t.contact.orgPlaceholder}
                        className={`w-full rounded-xl border px-3.5 py-2.5 text-xs transition-all focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                          isDark
                            ? 'border-white/10 bg-[#070912] text-white placeholder-slate-500 focus:border-emerald-500/50'
                            : 'border-slate-300 bg-slate-50 text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:bg-white'
                        }`}
                      />
                    </div>

                  </div>

                  {/* Service Category & Budget */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    <div className="space-y-1.5">
                      <label 
                        htmlFor="contact-service" 
                        className={`block text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}
                      >
                        {t.contact.serviceLabel}
                      </label>
                      <select
                        id="contact-service"
                        value={formData.serviceCategory}
                        onChange={(e) => setFormData({ ...formData, serviceCategory: e.target.value })}
                        className={`w-full rounded-xl border px-3.5 py-2.5 text-xs transition-all focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                          isDark
                            ? 'border-white/10 bg-[#070912] text-white focus:border-emerald-500/50'
                            : 'border-slate-300 bg-slate-50 text-slate-900 focus:border-emerald-500 focus:bg-white'
                        }`}
                      >
                        <option value="">{t.contact.serviceOptionDefault}</option>
                        {serviceOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {isNepali ? opt.labelNe : opt.labelEn}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label 
                        htmlFor="contact-budget" 
                        className={`block text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}
                      >
                        {t.contact.budgetLabel}
                      </label>
                      <select
                        id="contact-budget"
                        value={formData.budgetRange}
                        onChange={(e) => setFormData({ ...formData, budgetRange: e.target.value })}
                        className={`w-full rounded-xl border px-3.5 py-2.5 text-xs transition-all focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                          isDark
                            ? 'border-white/10 bg-[#070912] text-white focus:border-emerald-500/50'
                            : 'border-slate-300 bg-slate-50 text-slate-900 focus:border-emerald-500 focus:bg-white'
                        }`}
                      >
                        <option value="">{t.contact.budgetOptionDefault}</option>
                        {budgetOptions.map((b) => (
                          <option key={b.value} value={b.value}>
                            {isNepali ? b.labelNe : b.labelEn}
                          </option>
                        ))}
                      </select>
                    </div>

                  </div>

                  {/* Message */}
                  <div className="space-y-1.5">
                    <label 
                      htmlFor="contact-message" 
                      className={`block text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}
                    >
                      {t.contact.messageLabel}
                    </label>
                    <textarea
                      id="contact-message"
                      rows={3}
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder={t.contact.messagePlaceholder}
                      className={`w-full rounded-xl border px-3.5 py-2.5 text-xs transition-all focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                        isDark
                          ? 'border-white/10 bg-[#070912] text-white placeholder-slate-500 focus:border-emerald-500/50'
                          : 'border-slate-300 bg-slate-50 text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:bg-white'
                      }`}
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 px-4 text-xs transition-all shadow-md focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <span>{t.contact.submittingBtn}</span>
                      ) : (
                        <>
                          <Send className="h-4 w-4" aria-hidden="true" />
                          <span>
                            {t.contact.submitBtn}
                          </span>
                        </>
                      )}
                    </button>
                  </div>

                </form>
              )}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
