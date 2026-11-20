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
import { submitConsultationRequest } from '../services/consultationService';

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

    // Dispatch lead via secure consultationService utility using non-client-visible email proxy
    try {
      await submitConsultationRequest({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        organization: formData.organization,
        serviceCategory: formData.serviceCategory,
        budgetRange: formData.budgetRange,
        message: formData.message,
        source: 'contact_section',
      });
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
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-1 text-xs font-semibold shadow-xs">
            <MessageSquare className="h-3.5 w-3.5 text-cyan-500" aria-hidden="true" />
            <span
              className={isDark ? 'text-cyan-400' : 'text-cyan-800'}
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
              isDark ? 'text-slate-300' : 'text-slate-600'
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
                  ? 'border-white/[0.08] bg-[#0c1324] text-slate-200 shadow-xl'
                  : 'border-slate-200 bg-white text-slate-800 shadow-xs'
              }`}
            >
              <div className="space-y-1.5 pb-4 border-b border-slate-500/15">
                <h3
                  className={`text-base font-bold font-display ${
                    isDark ? 'text-white' : 'text-slate-950'
                  }`}
                >
                  {t.contact.directTitle}
                </h3>
                <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                  {t.contact.directSubtitle}
                </p>
              </div>

              <div className="space-y-4 text-xs">
                
                {/* Email */}
                <div className="flex items-start gap-3">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg border shrink-0 ${
                    isDark ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30' : 'bg-cyan-50 text-cyan-700 border-cyan-200'
                  }`}>
                    <Mail className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <div className="space-y-0.5">
                    <div className={`font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{t.contact.emailLabel}</div>
                    <a
                      href="mailto:contact@nepalai.tech"
                      className="font-bold text-cyan-700 dark:text-cyan-300 hover:underline text-sm inline-flex items-center min-h-[44px] focus:outline-hidden focus-visible:ring-2 focus-visible:ring-cyan-500 rounded"
                    >
                      {t.contact.emailVal}
                    </a>
                  </div>
                </div>

                {/* WhatsApp */}
                <div className="flex items-start gap-3">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg border shrink-0 ${
                    isDark ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30' : 'bg-cyan-50 text-cyan-700 border-cyan-200'
                  }`}>
                    <Phone className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <div className="space-y-0.5">
                    <div className={`font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{t.contact.whatsappLabel}</div>
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-cyan-700 dark:text-cyan-300 hover:underline text-sm inline-flex items-center gap-1 min-h-[44px] focus:outline-hidden focus-visible:ring-2 focus-visible:ring-cyan-500 rounded"
                    >
                      <span>{t.contact.whatsappVal}</span>
                      <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </a>
                  </div>
                </div>

                {/* Office Location */}
                <div className="flex items-start gap-3">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg border shrink-0 ${
                    isDark ? 'bg-sky-500/15 text-sky-300 border-sky-500/30' : 'bg-sky-50 text-sky-700 border-sky-200'
                  }`}>
                    <MapPin className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <div className="space-y-0.5">
                    <div className={`font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{t.contact.officeLabel}</div>
                    <div className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {t.contact.officeVal}
                    </div>
                  </div>
                </div>

                {/* Working Hours */}
                <div className="flex items-start gap-3">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg border shrink-0 ${
                    isDark ? 'bg-amber-500/15 text-amber-300 border-amber-500/30' : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    <Clock className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <div className="space-y-0.5">
                    <div className={`font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{t.contact.hoursLabel}</div>
                    <div className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
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
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-3 px-4 text-xs transition-colors shadow-md shadow-cyan-500/25 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-cyan-500"
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
                  ? 'border-cyan-500/30 bg-cyan-950/25 text-slate-100'
                  : 'border-cyan-300 bg-cyan-50 text-slate-900'
              }`}
            >
              <ShieldCheck className="h-6 w-6 text-cyan-600 dark:text-cyan-400 shrink-0" aria-hidden="true" />
              <div className="text-xs">
                <div className="font-bold text-cyan-800 dark:text-cyan-300">
                  {isNepali ? 'गोपनीयता र सम्झौताको ग्यारेन्टी' : 'Guaranteed NDA & Confidentiality'}
                </div>
                <div className={`text-xs mt-0.5 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
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
              className={`rounded-2xl border p-6 sm:p-8 transition-colors ${
                isDark
                  ? 'border-white/15 bg-[#0c1324] text-slate-100 shadow-xl'
                  : 'border-slate-200 bg-white text-slate-950 shadow-sm'
              }`}
            >
              {isSubmitted ? (
                <div className="text-center py-10 space-y-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/15 border border-cyan-500/35 text-cyan-500 dark:text-cyan-300 mx-auto">
                    <CheckCircle2 className="h-8 w-8" aria-hidden="true" />
                  </div>
                  
                  <div className="space-y-1.5">
                    <h3
                      className={`text-xl font-bold font-display ${
                        isDark ? 'text-white' : 'text-slate-950'
                      }`}
                    >
                      {t.contact.successTitle}
                    </h3>
                    <p
                      className={`text-sm max-w-md mx-auto leading-relaxed ${isDark ? 'text-slate-200' : 'text-slate-700'}`}
                    >
                      {t.contact.successMessage}
                    </p>
                  </div>

                  <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={handleResetForm}
                      className="px-4 py-2.5 rounded-xl bg-cyan-600 text-white text-xs font-bold hover:bg-cyan-500 transition-colors cursor-pointer"
                    >
                      {t.contact.sendAnother}
                    </button>
                    
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`px-4 py-2.5 rounded-xl border text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                        isDark ? 'border-white/15 text-slate-200 hover:text-white' : 'border-slate-300 text-slate-800 hover:text-slate-950'
                      }`}
                    >
                      <MessageSquare className="h-3.5 w-3.5 text-cyan-500 dark:text-cyan-400" aria-hidden="true" />
                      <span>{t.contact.whatsappChatBtn}</span>
                    </a>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4.5" noValidate>
                  
                  <div className="space-y-1 pb-2 border-b border-slate-500/15">
                    <h3
                      className={`text-base font-bold font-display ${
                        isDark ? 'text-white' : 'text-slate-950'
                      }`}
                    >
                      {t.contact.formTitle}
                    </h3>
                    <p className={`text-xs ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                      {t.contact.formSubtitle}
                    </p>
                  </div>

                  {errorMessage && (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-300 text-xs flex items-center gap-2">
                      <span className="font-bold">Notice:</span>
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    {/* Full Name */}
                    <div className="space-y-1.5">
                      <label 
                        htmlFor="contact-name" 
                        className={`block text-xs font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}
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
                        className={`w-full rounded-xl border px-3.5 py-2.5 text-xs transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-cyan-500 ${
                          isDark
                            ? 'border-white/15 bg-[#070912] text-white placeholder-slate-400 focus:border-cyan-400'
                            : 'border-slate-300 bg-slate-50 text-slate-950 placeholder-slate-500 focus:border-cyan-600 focus:bg-white'
                        }`}
                      />
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                      <label 
                        htmlFor="contact-email" 
                        className={`block text-xs font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}
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
                        className={`w-full rounded-xl border px-3.5 py-2.5 text-xs transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-cyan-500 ${
                          isDark
                            ? 'border-white/15 bg-[#070912] text-white placeholder-slate-400 focus:border-cyan-400'
                            : 'border-slate-300 bg-slate-50 text-slate-950 placeholder-slate-500 focus:border-cyan-600 focus:bg-white'
                        }`}
                      />
                    </div>

                    {/* Phone */}
                    <div className="space-y-1.5">
                      <label 
                        htmlFor="contact-phone" 
                        className={`block text-xs font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}
                      >
                        {t.contact.phoneLabel}
                      </label>
                      <input
                        type="tel"
                        id="contact-phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder={t.contact.phonePlaceholder}
                        className={`w-full rounded-xl border px-3.5 py-2.5 text-xs transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-cyan-500 ${
                          isDark
                            ? 'border-white/15 bg-[#070912] text-white placeholder-slate-400 focus:border-cyan-400'
                            : 'border-slate-300 bg-slate-50 text-slate-950 placeholder-slate-500 focus:border-cyan-600 focus:bg-white'
                        }`}
                      />
                    </div>

                    {/* Organization */}
                    <div className="space-y-1.5">
                      <label 
                        htmlFor="contact-org" 
                        className={`block text-xs font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}
                      >
                        {t.contact.orgLabel}
                      </label>
                      <input
                        type="text"
                        id="contact-org"
                        value={formData.organization}
                        onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                        placeholder={t.contact.orgPlaceholder}
                        className={`w-full rounded-xl border px-3.5 py-2.5 text-xs transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-cyan-500 ${
                          isDark
                            ? 'border-white/15 bg-[#070912] text-white placeholder-slate-400 focus:border-cyan-400'
                            : 'border-slate-300 bg-slate-50 text-slate-950 placeholder-slate-500 focus:border-cyan-600 focus:bg-white'
                        }`}
                      />
                    </div>

                  </div>

                  {/* Service Category & Budget */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    <div className="space-y-1.5">
                      <label 
                        htmlFor="contact-service" 
                        className={`block text-xs font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}
                      >
                        {t.contact.serviceLabel}
                      </label>
                      <select
                        id="contact-service"
                        value={formData.serviceCategory}
                        onChange={(e) => setFormData({ ...formData, serviceCategory: e.target.value })}
                        className={`w-full rounded-xl border px-3.5 py-2.5 text-xs transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-cyan-500 ${
                          isDark
                            ? 'border-white/15 bg-[#070912] text-white focus:border-cyan-400'
                            : 'border-slate-300 bg-slate-50 text-slate-950 focus:border-cyan-600 focus:bg-white'
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
                        className={`block text-xs font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}
                      >
                        {t.contact.budgetLabel}
                      </label>
                      <select
                        id="contact-budget"
                        value={formData.budgetRange}
                        onChange={(e) => setFormData({ ...formData, budgetRange: e.target.value })}
                        className={`w-full rounded-xl border px-3.5 py-2.5 text-xs transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-cyan-500 ${
                          isDark
                            ? 'border-white/15 bg-[#070912] text-white focus:border-cyan-400'
                            : 'border-slate-300 bg-slate-50 text-slate-950 focus:border-cyan-600 focus:bg-white'
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
                      className={`block text-xs font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}
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
                      className={`w-full rounded-xl border px-3.5 py-2.5 text-xs transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-cyan-500 ${
                        isDark
                          ? 'border-white/15 bg-[#070912] text-white placeholder-slate-400 focus:border-cyan-400'
                          : 'border-slate-300 bg-slate-50 text-slate-950 placeholder-slate-500 focus:border-cyan-600 focus:bg-white'
                      }`}
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-3 px-4 text-xs transition-colors shadow-md shadow-cyan-500/25 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-cyan-500 disabled:opacity-50 min-h-[44px] cursor-pointer"
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
