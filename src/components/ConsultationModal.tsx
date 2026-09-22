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
  ArrowLeft, 
  Check, 
  Sparkles, 
  DollarSign, 
  Clock, 
  FileText,
  CreditCard
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useToast } from '../context/ToastContext';
import { ThemeMode, Language } from '../types';
import { TRANSLATIONS } from '../data/translations';

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
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  // Multi-step State
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form Fields
  const [service, setService] = useState<string>(prefilledService || 'Enterprise AI Architecture & MVP Sprint');
  const [projectScope, setProjectScope] = useState<string>('');
  const [timeline, setTimeline] = useState<string>('2-Week Rapid MVP Sprint (Urgent)');
  
  const [organization, setOrganization] = useState<string>('');
  const [industry, setIndustry] = useState<string>('Banking & Financial Institutions (BFIs)');
  const [budgetNpr, setBudgetNpr] = useState<string>('रू २,००,००० - ५,००,००० ($1,500 - $3,800)');
  const [billingPreference, setBillingPreference] = useState<string>('Local NPR Invoicing (eSewa / Khalti / FonePay Bank)');

  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (prefilledService) {
      setService(prefilledService);
      setProjectScope(`We are seeking consultation and scoping for: ${prefilledService}.`);
    } else {
      setService('Enterprise AI Architecture & MVP Sprint');
    }
  }, [prefilledService, isOpen]);

  // Reset steps when opened
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      setSubmitted(false);
      setFormErrors({});
    }
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

  // Step Validation logic
  const validateStep = (step: number): boolean => {
    const errors: { [key: string]: string } = {};

    if (step === 1) {
      if (!service.trim()) errors.service = 'Please specify or select a service area.';
      if (!projectScope.trim() || projectScope.trim().length < 10) {
        errors.projectScope = 'Please describe your objectives (at least 10 characters).';
      }
    } else if (step === 2) {
      if (!organization.trim()) {
        errors.organization = 'Please provide your company or institution name.';
      }
    } else if (step === 3) {
      if (!name.trim()) errors.name = 'Full name is required.';
      if (!email.trim() || !email.includes('@')) errors.email = 'Valid business email is required.';
      if (!phone.trim() || phone.trim().length < 7) errors.phone = 'Contact number or WhatsApp is required.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setFormErrors({});
      setCurrentStep((prev) => Math.min(prev + 1, 3));
    }
  };

  const handlePrevStep = () => {
    setFormErrors({});
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(3)) return;

    try {
      const existingLeads = JSON.parse(localStorage.getItem('nepalai_consultation_leads') || '[]');
      const newLead = {
        name,
        email,
        organization,
        industry,
        phone,
        service,
        timeline,
        budgetNpr,
        billingPreference,
        projectScope,
        submittedAt: new Date().toISOString(),
      };
      localStorage.setItem('nepalai_consultation_leads', JSON.stringify([...existingLeads, newLead]));
      
      // Post to backend contact API
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: name,
          email,
          phone,
          organization,
          serviceCategory: `${service} (${industry})`,
          budgetRange: `${budgetNpr} [${billingPreference}]`,
          message: `[Timeline: ${timeline}]\n\nObjectives:\n${projectScope}`
        }),
      }).catch(err => console.log('Consultation lead api notice:', err));
    } catch (err) {
      console.log('Lead persistence note:', err);
    }

    setSubmitted(true);
    showToast(
      'Advisory Request Recorded!',
      `Thank you ${name}! Your consultation briefing has been registered. We will reach out within 4 business hours.`,
      'success',
      6000
    );
  };

  const handleSendEmail = () => {
    const subject = encodeURIComponent(`NepalAI Consultation: ${service} - ${organization || name}`);
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\nPhone/WhatsApp: ${phone}\nOrganization: ${organization} (${industry})\nService Track: ${service}\nTarget Timeline: ${timeline}\nBudget Bracket: ${budgetNpr}\nBilling Preference: ${billingPreference}\n\nProject Scope & Technical Objectives:\n${projectScope}`
    );
    window.open(`mailto:contact@nepalai.tech,prakashsuvedi@gmail.com?subject=${subject}&body=${body}`, '_blank');
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(
      `Namaste NepalAI Engineering Team!\n\nI have requested a consultation for *${service}*.\nName: ${name}\nOrganization: ${organization}\nTimeline: ${timeline}\nBudget: ${budgetNpr}\n\nKey Scope: ${projectScope}`
    );
    window.open(`https://wa.me/9779800000000?text=${text}`, '_blank');
  };

  // Stepper Header definitions
  const steps = [
    { number: 1, label: isNepali ? 'सेवा र लक्ष्य' : 'Scope & Goals', icon: Briefcase },
    { number: 2, label: isNepali ? 'संस्था र बजेट' : 'Company & Budget', icon: Building },
    { number: 3, label: isNepali ? 'सम्पर्क र समीक्षा' : 'Contact & Review', icon: User },
  ];

  const quickScopeChips = [
    'Devanagari OCR for KYC & Land Records',
    'NRB IT Compliance & Data Residency Audit',
    'WhatsApp / Viber Banking AI Assistant',
    'Sovereign LLM Fine-Tuning & Air-Gapped Setup',
    'eSewa / Khalti Automated AI Payment Proxy',
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="consultation-modal-title"
        className={`relative w-full max-w-2xl rounded-3xl border shadow-2xl my-8 overflow-hidden flex flex-col max-h-[92vh] ${
          isDark
            ? 'border-white/15 bg-[#080b12] text-slate-100 shadow-black/90'
            : 'border-slate-300 bg-white text-slate-900 shadow-xl'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header with Close Button */}
        <div className="relative px-6 pt-6 pb-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h2 id="consultation-modal-title" className="text-lg sm:text-xl font-bold font-display">
                {isNepali ? 'संस्थागत एआई परामर्श अनुरोध' : 'Book an Enterprise AI Consultation'}
              </h2>
              <p className="text-[11px] text-slate-400 font-mono">
                {isNepali ? 'नेपाल राष्ट्र बैंक निर्देशिका अनुकूल • रू NPR & $ USD' : 'NRB IT Aligned • Dual NPR & USD Billing'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
            aria-label="Close consultation modal"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* VISUAL PROGRESS STEPPER BAR */}
        {!submitted && (
          <div className="px-6 py-4 bg-white/[0.02] border-b border-white/5">
            <div className="relative flex items-center justify-between">
              {/* Connecting Background Line */}
              <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-0.5 bg-white/10 z-0" />
              
              {/* Connecting Active Line */}
              <div
                className="absolute left-6 top-1/2 -translate-y-1/2 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-400 z-0 transition-all duration-500"
                style={{
                  width: currentStep === 1 ? '0%' : currentStep === 2 ? '50%' : 'calc(100% - 3rem)',
                }}
              />

              {steps.map((step) => {
                const isCompleted = currentStep > step.number;
                const isActive = currentStep === step.number;
                const IconComp = step.icon;

                return (
                  <button
                    key={step.number}
                    type="button"
                    onClick={() => {
                      if (isCompleted) setCurrentStep(step.number);
                    }}
                    disabled={!isCompleted && !isActive}
                    className={`relative z-10 flex flex-col items-center gap-1.5 group cursor-pointer transition-all ${
                      !isCompleted && !isActive ? 'cursor-not-allowed opacity-60' : ''
                    }`}
                  >
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold transition-all shadow-md ${
                        isCompleted
                          ? 'bg-emerald-500 text-slate-950 ring-4 ring-emerald-500/20'
                          : isActive
                          ? 'bg-gradient-to-br from-emerald-400 to-teal-600 text-slate-950 ring-4 ring-emerald-500/30 scale-110'
                          : isDark
                          ? 'bg-slate-900 border border-white/20 text-slate-400'
                          : 'bg-slate-100 border border-slate-300 text-slate-600'
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="h-4 w-4 stroke-[3]" />
                      ) : (
                        <IconComp className="h-4 w-4" />
                      )}
                    </div>
                    <span
                      className={`text-[11px] font-semibold whitespace-nowrap transition-colors ${
                        isActive
                          ? 'text-emerald-400 font-bold'
                          : isCompleted
                          ? isDark ? 'text-slate-200' : 'text-slate-800'
                          : 'text-slate-400'
                      }`}
                    >
                      {step.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Modal Body & Step Content */}
        <div className="p-6 overflow-y-auto flex-1 text-xs">
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <AnimatePresence mode="wait">
                {/* STEP 1: SERVICE & SCOPE */}
                {currentStep === 1 && (
                  <motion.div
                    key="step-1"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-4"
                  >
                    <div>
                      <label htmlFor="consult-service-track" className="block text-slate-300 font-medium mb-1.5">
                        {isNepali ? 'इच्छुक सेवा वा ट्रयाक *' : 'Target Consulting Track *'}
                      </label>
                      <select
                        id="consult-service-track"
                        value={service}
                        onChange={(e) => setService(e.target.value)}
                        className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-white focus:border-emerald-500 focus:outline-hidden"
                      >
                        <option value="Enterprise AI Architecture & MVP Sprint">Enterprise AI Architecture & 2-Week MVP Sprint (रू ९५,००० देखि / From $750)</option>
                        <option value="Devanagari OCR & Document AI Pipeline">Devanagari OCR & Document AI Pipeline (रू ३,८०,००० / $2,800)</option>
                        <option value="NRB IT Compliance & Data Residency Audit">NRB IT Compliance & Data Residency Audit (रू १,८०,००० / $1,400)</option>
                        <option value="WhatsApp & Conversational Banking Agent">WhatsApp & Conversational Banking Agent (रू ४,५०,००० / $3,400)</option>
                        <option value="AI Infrastructure Proxy (Bypass $500 Limit)">AI Infrastructure Proxy & Token Caching (रू १,२०,००० / $900)</option>
                        <option value="Custom Sovereign Model Fine-Tuning">Custom Sovereign Model Fine-Tuning (रू ४,००,००० / $3,000)</option>
                        <option value="Fractional Chief AI Officer Advisory">Fractional Chief AI Officer Advisory (रू १,५०,०००/mo / $1,150/mo)</option>
                      </select>
                      {formErrors.service && <p className="text-red-400 text-[11px] mt-1">{formErrors.service}</p>}
                    </div>

                    <div>
                      <label htmlFor="consult-timeline-select" className="block text-slate-300 font-medium mb-1.5">
                        {isNepali ? 'लक्षित समयसीमा (Target Timeline)' : 'Target Delivery Timeline'}
                      </label>
                      <select
                        id="consult-timeline-select"
                        value={timeline}
                        onChange={(e) => setTimeline(e.target.value)}
                        className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-white focus:border-emerald-500 focus:outline-hidden"
                      >
                        <option value="2-Week Rapid MVP Sprint (Urgent)">⚡ 2-Week Rapid MVP Sprint (Urgent / Immediate)</option>
                        <option value="1 Month Delivery">1 Month Production Delivery</option>
                        <option value="Quarterly Enterprise Roadmap (2-3 Months)">Quarterly Enterprise Roadmap (2-3 Months)</option>
                        <option value="Exploratory / Discovery Phase">Exploratory / Feasibility Study Only</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="consult-scope-req" className="block text-slate-300 font-medium mb-1.5">
                        {isNepali ? 'परियोजनाको मुख्य उद्देश्य र आवश्यकताहरू *' : 'Project Objectives & Core Requirements *'}
                      </label>
                      <textarea
                        id="consult-scope-req"
                        required
                        rows={4}
                        value={projectScope}
                        onChange={(e) => setProjectScope(e.target.value)}
                        placeholder="Describe what you want to achieve, existing databases/APIs, security constraints, and key success metrics..."
                        className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-hidden"
                      />
                      {formErrors.projectScope && <p className="text-red-400 text-[11px] mt-1">{formErrors.projectScope}</p>}

                      {/* Prompt Helper Chips */}
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] text-slate-400 font-mono">Quick Suggestions:</span>
                        {quickScopeChips.map((chip, cIdx) => (
                          <button
                            key={cIdx}
                            type="button"
                            onClick={() => setProjectScope((prev) => prev ? `${prev} • ${chip}` : chip)}
                            className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.04] hover:bg-emerald-500/20 hover:text-emerald-300 border border-white/10 text-slate-300 transition-colors cursor-pointer"
                          >
                            + {chip}
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* STEP 2: COMPANY & BUDGET */}
                {currentStep === 2 && (
                  <motion.div
                    key="step-2"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="consult-org-input" className="block text-slate-300 font-medium mb-1.5">
                          {isNepali ? 'संस्था वा कम्पनीको नाम *' : 'Organization / Company Name *'}
                        </label>
                        <div className="relative">
                          <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
                          <input
                            id="consult-org-input"
                            type="text"
                            required
                            placeholder="e.g., Nabil Bank / IME Group / Tech Co."
                            value={organization}
                            onChange={(e) => setOrganization(e.target.value)}
                            className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-9 pr-3 py-2.5 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-hidden"
                          />
                        </div>
                        {formErrors.organization && <p className="text-red-400 text-[11px] mt-1">{formErrors.organization}</p>}
                      </div>

                      <div>
                        <label htmlFor="consult-industry-select" className="block text-slate-300 font-medium mb-1.5">
                          {isNepali ? 'उद्योग / क्षेत्र (Industry)' : 'Industry Sector'}
                        </label>
                        <select
                          id="consult-industry-select"
                          value={industry}
                          onChange={(e) => setIndustry(e.target.value)}
                          className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-white focus:border-emerald-500 focus:outline-hidden"
                        >
                          <option value="Banking & Financial Institutions (BFIs)">Banking & Fintech (NRB Audited)</option>
                          <option value="E-Commerce & Digital Commerce">E-Commerce & Retail</option>
                          <option value="Healthcare & Diagnostics">Healthcare & Hospitals</option>
                          <option value="Government & Public Services">Government & Public Sector</option>
                          <option value="Tourism, Treks & Hospitality">Tourism, Treks & Airlines</option>
                          <option value="Legal & Audit Firms">Legal, Compliance & Audit</option>
                          <option value="Tech Startup / SaaS">Technology Startup / SaaS</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="consult-budget-tier" className="block text-slate-300 font-medium mb-1.5">
                        {isNepali ? 'अनुमानित बजेट दायरा (Estimated Budget Bracket)' : 'Estimated Project Budget (NPR & USD)'}
                      </label>
                      <select
                        id="consult-budget-tier"
                        value={budgetNpr}
                        onChange={(e) => setBudgetNpr(e.target.value)}
                        className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-white focus:border-emerald-500 focus:outline-hidden"
                      >
                        <option value="रू ९५,००० - १,५०,००० ($750 - $1,150) — MVP Sprint">रू ९५,००० - १,५०,००० ($750 - $1,150) — 2-Week Sprint</option>
                        <option value="रू २,००,००० - ५,००,००० ($1,500 - $3,800) — Standard Deployment">रू २,००,००० - ५,००,००० ($1,500 - $3,800) — Standard Production AI</option>
                        <option value="रू ५,००,००० - १५,००,०००+ ($3,800 - $11,500+) — Enterprise Tier">रू ५,००,००० - १५,००,०००+ ($3,800 - $11,500+) — Enterprise Multi-Agent</option>
                        <option value="मासिक परामर्श (रू १,५०,०००/महिना / $1,150/mo Retainer)">मासिक सल्लाहकार (रू १,५०,०००/mo / $1,150/mo Fractional CAIO)</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="consult-billing-mode" className="block text-slate-300 font-medium mb-1.5">
                        {isNepali ? 'बिलिङ तथा भुक्तानी प्राथमिकता' : 'Billing & Invoice Routing'}
                      </label>
                      <select
                        id="consult-billing-mode"
                        value={billingPreference}
                        onChange={(e) => setBillingPreference(e.target.value)}
                        className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-white focus:border-emerald-500 focus:outline-hidden"
                      >
                        <option value="Local NPR Invoicing (eSewa / Khalti / FonePay Bank)">🇳🇵 Local Nepal NPR Invoicing with VAT (eSewa, Khalti, FonePay, Corporate Bank Wire)</option>
                        <option value="International USD Billing (Stripe / International Wire)">🌐 International USD Invoicing (Credit Card, Stripe, Swift Wire)</option>
                        <option value="Dual Currency / Hybrid Invoicing">Dual Currency / Hybrid</option>
                      </select>
                    </div>

                    <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300 flex items-start gap-2">
                      <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>
                        100% intellectual property (IP) and code transfer upon project delivery with zero foreign vendor lock-in.
                      </span>
                    </div>
                  </motion.div>
                )}

                {/* STEP 3: CONTACT & REVIEW */}
                {currentStep === 3 && (
                  <motion.div
                    key="step-3"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="consult-name-field" className="block text-slate-300 font-medium mb-1">
                          {isNepali ? 'पूरा नाम (Full Name) *' : 'Your Full Name *'}
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
                          <input
                            id="consult-name-field"
                            type="text"
                            required
                            placeholder="Prakash Suvedi"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-9 pr-3 py-2.5 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-hidden"
                          />
                        </div>
                        {formErrors.name && <p className="text-red-400 text-[11px] mt-1">{formErrors.name}</p>}
                      </div>

                      <div>
                        <label htmlFor="consult-email-field" className="block text-slate-300 font-medium mb-1">
                          {isNepali ? 'ईमेल (Business Email) *' : 'Business Email *'}
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
                          <input
                            id="consult-email-field"
                            type="email"
                            required
                            placeholder="prakash@organization.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-9 pr-3 py-2.5 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-hidden"
                          />
                        </div>
                        {formErrors.email && <p className="text-red-400 text-[11px] mt-1">{formErrors.email}</p>}
                      </div>
                    </div>

                    <div>
                      <label htmlFor="consult-phone-field" className="block text-slate-300 font-medium mb-1">
                        {isNepali ? 'ह्वाट्सएप / फोन नम्बर *' : 'WhatsApp / Mobile Number *'}
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
                        <input
                          id="consult-phone-field"
                          type="text"
                          required
                          placeholder="+977 98XXXXXXXX"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-9 pr-3 py-2.5 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-hidden"
                        />
                      </div>
                      {formErrors.phone && <p className="text-red-400 text-[11px] mt-1">{formErrors.phone}</p>}
                    </div>

                    {/* Compact Review Summary Card */}
                    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-3.5 space-y-2">
                      <div className="text-[11px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
                        {isNepali ? 'संक्षेप समीक्षा (Request Summary)' : 'Scoping Request Summary'}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div>
                          <span className="text-slate-400 block">Service Track:</span>
                          <span className="font-semibold text-white truncate block">{service}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Organization:</span>
                          <span className="font-semibold text-white truncate block">{organization || 'Individual / Confidential'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Estimated Budget:</span>
                          <span className="font-semibold text-emerald-400 truncate block">{budgetNpr}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Target Timeline:</span>
                          <span className="font-semibold text-indigo-300 truncate block">{timeline}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" aria-hidden="true" />
                      <span>
                        NDA Protected. Your technical architecture & proprietary data remain strictly confidential.
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Bottom Nav Actions */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>{isNepali ? 'पछाडि' : 'Back'}</span>
                  </button>
                ) : (
                  <div />
                )}

                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="px-6 py-2.5 rounded-xl bg-white text-slate-950 hover:bg-slate-200 font-bold transition-all flex items-center gap-1.5 shadow-md cursor-pointer ml-auto"
                  >
                    <span>{isNepali ? 'अगाडि बढ्नुहोस्' : 'Continue'}</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 hover:brightness-110 font-bold transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/25 cursor-pointer ml-auto"
                  >
                    <Send className="h-4 w-4" />
                    <span>{isNepali ? 'अनुरोध पेस गर्नुहोस्' : 'Submit Consultation Brief'}</span>
                  </button>
                )}
              </div>
            </form>
          ) : (
            /* Confirmation Screen */
            <div className="text-center py-6 space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 className="h-8 w-8" aria-hidden="true" />
              </div>

              <h3 className="text-2xl font-bold text-white font-display">
                {isNepali ? 'परामर्श अनुरोध सफलतापूर्वक दर्ता भयो!' : 'Consultation Brief Received!'}
              </h3>

              <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                Thank you, <span className="text-white font-semibold">{name}</span> from <span className="text-white font-semibold">{organization || 'your team'}</span>. Our AI architect team will review your requirements for <span className="text-emerald-400">{service}</span> and reach out within 4 business hours.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleSendEmail}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Mail className="h-4 w-4 text-emerald-400" aria-hidden="true" />
                  <span>Launch Direct Email</span>
                </button>

                <button
                  type="button"
                  onClick={handleWhatsApp}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 text-xs font-semibold transition-colors shadow-md shadow-emerald-600/20 cursor-pointer"
                >
                  <MessageSquare className="h-4 w-4" aria-hidden="true" />
                  <span>Chat on WhatsApp</span>
                </button>
              </div>

              <div className="pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    onClose();
                  }}
                  className="text-xs text-slate-400 hover:text-white px-4 py-1.5 rounded cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
