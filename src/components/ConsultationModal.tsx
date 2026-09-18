import React, { useState, useEffect } from 'react';
import { X, Send, CheckCircle2, ShieldCheck, Mail, MessageSquare, Phone, Building, User } from 'lucide-react';
import { useToast } from '../context/ToastContext';

interface ConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefilledService?: string;
}

export const ConsultationModal: React.FC<ConsultationModalProps> = ({
  isOpen,
  onClose,
  prefilledService = '',
}) => {
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [organization, setOrganization] = useState('');
  const [phone, setPhone] = useState('');
  const [projectScope, setProjectScope] = useState('');
  const [budgetNpr, setBudgetNpr] = useState('NPR 2,00,000 - 5,00,000');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (prefilledService) {
      setProjectScope(`We are interested in consulting regarding: ${prefilledService}.`);
    }
  }, [prefilledService]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const existingLeads = JSON.parse(localStorage.getItem('nepalai_consultation_leads') || '[]');
      const newLead = {
        name,
        email,
        organization,
        phone,
        budgetNpr,
        projectScope,
        service: prefilledService || 'General Consultation',
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
          serviceCategory: prefilledService || 'Consulting Modal',
          budgetRange: budgetNpr,
          message: projectScope
        }),
      }).catch(err => console.log('Consultation lead api notice:', err));
    } catch (err) {
      console.log('Lead persistence note:', err);
    }
    setSubmitted(true);
    showToast(
      'Advisory Session Scheduled!',
      `Thank you ${name || 'there'}! Your briefing for ${prefilledService || 'AI Advisory'} has been recorded. We will connect shortly.`,
      'success',
      6000
    );
  };

  const handleSendEmail = () => {
    const subject = encodeURIComponent(`NepalAI Consulting Request - ${organization || name}`);
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\nOrganization: ${organization}\nPhone: ${phone}\nEstimated Budget: ${budgetNpr}\n\nProject Scope & Objectives:\n${projectScope}`
    );
    window.open(`mailto:prakashsuvedi@gmail.com,contact@nepalai.tech?subject=${subject}&body=${body}`, '_blank');
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(
      `Namaste NepalAI Team!\nMy name is ${name} from ${organization || 'Nepal'}.\nI would like to discuss: ${projectScope}\nEmail: ${email}`
    );
    window.open(`https://wa.me/9779800000000?text=${text}`, '_blank');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="consultation-modal-title"
        className="relative w-full max-w-xl rounded-2xl border border-slate-700 bg-slate-900 p-6 sm:p-8 shadow-2xl shadow-emerald-950/40 my-8 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 rounded-full p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500"
          aria-label="Close consultation modal"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>

        {!submitted ? (
          <div>
            {/* Header */}
            <div className="mb-6">
              <span className="rounded-md bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 text-xs font-semibold text-emerald-400">
                AI Engineering & Advisory
              </span>
              <h2 id="consultation-modal-title" className="text-2xl font-bold text-white font-['Space_Grotesk'] mt-2">
                Book an AI Consultation
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Connect with our principal AI architects to evaluate feasibility, ROI, and technical roadmaps.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="consult-name" className="block text-slate-300 font-medium mb-1">Your Full Name *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
                    <input
                      id="consult-name"
                      type="text"
                      required
                      placeholder="Prakash Suvedi"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-9 pr-3 py-2.5 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="consult-email" className="block text-slate-300 font-medium mb-1">Business Email *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
                    <input
                      id="consult-email"
                      type="email"
                      required
                      placeholder="prakash@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-9 pr-3 py-2.5 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="consult-org" className="block text-slate-300 font-medium mb-1">Organization / Company</label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
                    <input
                      id="consult-org"
                      type="text"
                      placeholder="Himalayan Tech / Bank / Startup"
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-9 pr-3 py-2.5 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="consult-phone" className="block text-slate-300 font-medium mb-1">WhatsApp / Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
                    <input
                      id="consult-phone"
                      type="text"
                      placeholder="+977 98XXXXXXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-9 pr-3 py-2.5 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="consult-budget" className="block text-slate-300 font-medium mb-1">Estimated Project Budget</label>
                <select
                  id="consult-budget"
                  value={budgetNpr}
                  onChange={(e) => setBudgetNpr(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-white focus:border-emerald-500 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500"
                >
                  <option value="Under NPR 1,50,000 (Sprint / Masterclass)">Under NPR 1,50,000 (Sprint / Masterclass)</option>
                  <option value="NPR 2,00,000 - 5,00,000 (Standard AI Deployment)">NPR 2,00,000 - 5,00,000 (Standard AI Deployment)</option>
                  <option value="NPR 5,00,000 - 15,00,000+ (Enterprise Multi-Model System)">NPR 5,00,000 - 15,00,000+ (Enterprise Multi-Model System)</option>
                  <option value="Retainer / Ongoing Advisory">Retainer / Ongoing Advisory</option>
                </select>
              </div>

              <div>
                <label htmlFor="consult-scope" className="block text-slate-300 font-medium mb-1">Project Objectives & Requirements *</label>
                <textarea
                  id="consult-scope"
                  required
                  rows={4}
                  placeholder="Describe what you want to achieve, your data sources, timeline, and any specific constraints..."
                  value={projectScope}
                  onChange={(e) => setProjectScope(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-1">
                <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" aria-hidden="true" />
                <span>NDA protected. Your proprietary data and internal systems remain strictly confidential.</span>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 py-3 text-xs font-bold text-slate-950 hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-emerald-500/20 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500"
                >
                  <Send className="h-4 w-4" aria-hidden="true" />
                  <span>Submit Consultation Request</span>
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Confirmation View with Direct Send Buttons */
          <div className="text-center py-6 space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="h-8 w-8" aria-hidden="true" />
            </div>

            <h3 className="text-2xl font-bold text-white font-['Space_Grotesk']">
              Inquiry Prepared!
            </h3>

            <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
              Thank you, <span className="text-white font-semibold">{name}</span>. Your consultation inquiry has been compiled. You can directly launch your email client or WhatsApp to send this immediately to the NepalAI team.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={handleSendEmail}
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 text-xs font-semibold transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500"
              >
                <Mail className="h-4 w-4 text-emerald-400" aria-hidden="true" />
                <span>Launch Direct Email</span>
              </button>

              <button
                onClick={handleWhatsApp}
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 text-xs font-semibold transition-colors shadow-md shadow-emerald-600/20 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500"
              >
                <MessageSquare className="h-4 w-4" aria-hidden="true" />
                <span>Send via WhatsApp</span>
              </button>
            </div>

            <div className="pt-4 border-t border-slate-800">
              <button
                onClick={() => {
                  setSubmitted(false);
                  onClose();
                }}
                className="text-xs text-slate-400 hover:text-white focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 px-3 py-1 rounded"
              >
                Done
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
