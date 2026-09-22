import React from 'react';
import { CaseStudy } from '../types';
import { X, CheckCircle2, ArrowRight, ShieldAlert, Sparkles, MapPin, Clock, TrendingUp, Code2, Server } from 'lucide-react';

interface CaseStudyModalProps {
  caseStudy: CaseStudy | null;
  onClose: () => void;
  onOpenConsultation: (serviceTitle?: string) => void;
}

export const CaseStudyModal: React.FC<CaseStudyModalProps> = ({
  caseStudy,
  onClose,
  onOpenConsultation,
}) => {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (caseStudy) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [caseStudy, onClose]);

  if (!caseStudy) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="case-study-title"
        className="relative w-full max-w-3xl rounded-2xl border border-slate-700/80 bg-slate-900 p-6 sm:p-8 shadow-2xl shadow-emerald-950/40 my-8 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 rounded-full p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500"
          aria-label="Close case study details"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>

        {/* Modal Header */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">
              {caseStudy.category}
            </span>
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <MapPin className="h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
              {caseStudy.location}
            </span>
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <Clock className="h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
              {caseStudy.duration}
            </span>
          </div>

          <h2 id="case-study-title" className="text-2xl sm:text-3xl font-bold text-white font-display leading-tight">
            {caseStudy.title}
          </h2>

          <p className="text-sm font-medium text-slate-400">
            Enterprise Client: <span className="text-slate-200 font-semibold">{caseStudy.client}</span>
          </p>
        </div>

        {/* Verified Impact Metrics Banner */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4">
          {caseStudy.metrics.map((m, idx) => (
            <div key={idx} className="space-y-0.5">
              <div className="text-xl sm:text-2xl font-extrabold text-emerald-300 font-display">
                {m.value}
              </div>
              <div className="text-xs font-semibold text-white">{m.label}</div>
              {m.subtext && <div className="text-[10px] text-slate-400">{m.subtext}</div>}
            </div>
          ))}
        </div>

        {/* Challenge & Solution Sections */}
        <div className="mt-6 space-y-6 text-sm">
          
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
            <div className="flex items-center gap-2 text-rose-400 font-semibold mb-2">
              <ShieldAlert className="h-4 w-4" />
              <span>The Operational Challenge</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              {caseStudy.challenge}
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-2">
              <Sparkles className="h-4 w-4" />
              <span>The NepalAI Engineering Solution</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              {caseStudy.solution}
            </p>
          </div>

          {/* Technical Architecture Breakdown */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
            <div className="flex items-center gap-2 text-indigo-400 font-semibold mb-3">
              <Server className="h-4 w-4" />
              <span>Production System Architecture</span>
            </div>
            <ul className="space-y-2">
              {caseStudy.architecture.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Tech Stack & ROI */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mb-2">
                <Code2 className="h-4 w-4 text-slate-400" />
                <span>Technologies & Frameworks</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {caseStudy.technologies.map((t) => (
                  <span key={t} className="rounded bg-slate-800 px-2.5 py-1 text-xs font-mono text-slate-200">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mb-2">
                <TrendingUp className="h-4 w-4 text-emerald-400" />
                <span>Annualized Economic Impact</span>
              </div>
              <p className="text-sm font-semibold text-emerald-300">
                {caseStudy.roi}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Verified performance metrics validated with client engineering leadership.
              </p>
            </div>
          </div>

        </div>

        {/* Modal Actions */}
        <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
          >
            Close Blueprint
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenConsultation(`Replicate ${caseStudy.title}`);
            }}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-xs font-bold text-slate-950 hover:brightness-110 active:scale-95 transition-all shadow-md shadow-emerald-500/20"
          >
            <span>Commission Similar AI Solution</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
