import React, { useEffect } from 'react';
import { NEPAL_AI_TOOLS } from '../data/nepalTools';
import { X, Trash2, CheckCircle2, ShieldCheck, ArrowRight, ExternalLink, Calculator } from 'lucide-react';

interface StackCalculatorModalProps {
  selectedStack: string[];
  onToggleStack: (toolId: string) => void;
  onClearStack: () => void;
  onClose: () => void;
  onOpenConsultation: (serviceTitle?: string) => void;
}

export const StackCalculatorModal: React.FC<StackCalculatorModalProps> = ({
  selectedStack,
  onToggleStack,
  onClearStack,
  onClose,
  onOpenConsultation,
}) => {
  const exchangeRate = 135; // 1 USD = 135 NPR

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const stackTools = NEPAL_AI_TOOLS.filter((t) => selectedStack.includes(t.id));

  const totalUsd = stackTools.reduce((acc, curr) => acc + curr.monthlyPriceUsd, 0);
  const totalNpr = Math.round(totalUsd * exchangeRate);
  const annualUsd = totalUsd * 12;

  // NRB Dollar Card Limit Check (Max $500 per fiscal year)
  const isNearOrOverLimit = annualUsd >= 400;

  // Estimated hours saved (approx 4 hours per paid AI tool per week)
  const estimatedHoursSaved = stackTools.length * 16;
  const estimatedNprSaved = estimatedHoursSaved * 1200; // conservative NPR 1200/hr value

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="stack-calculator-title"
        className="relative w-full max-w-2xl rounded-2xl border border-slate-700 bg-slate-900 p-6 sm:p-8 shadow-2xl shadow-emerald-950/40 my-8 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 rounded-full p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500"
          aria-label="Close stack calculator modal"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Calculator className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h2 id="stack-calculator-title" className="text-xl sm:text-2xl font-bold text-white font-['Space_Grotesk']">
              Nepal AI Stack Cost & ROI Calculator
            </h2>
            <p className="text-xs text-slate-400">
              Calculate exact monthly/annual spend, NRB $500 Dollar Card quota, and productivity gains.
            </p>
          </div>
        </div>

        {/* Summary Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
            <span className="text-[11px] text-slate-400 font-mono">Monthly Budget</span>
            <div className="text-xl font-bold text-emerald-400 font-mono mt-1">
              ${totalUsd} <span className="text-xs font-normal text-slate-400">/ mo</span>
            </div>
            <div className="text-xs text-slate-300 font-mono mt-0.5">
              ~NPR {totalNpr.toLocaleString()}
            </div>
          </div>

          <div className={`rounded-xl border p-4 ${
            isNearOrOverLimit ? 'border-amber-500/40 bg-amber-950/20' : 'border-slate-800 bg-slate-950/60'
          }`}>
            <span className="text-[11px] text-slate-400 font-mono">Annual ($500 Quota)</span>
            <div className={`text-xl font-bold font-mono mt-1 ${
              isNearOrOverLimit ? 'text-amber-400' : 'text-white'
            }`}>
              ${annualUsd} <span className="text-xs font-normal text-slate-400">/ yr</span>
            </div>
            <div className="text-[11px] text-slate-300 mt-0.5">
              {annualUsd > 500 ? (
                <span className="text-red-400 font-semibold">Exceeds $500 NRB Limit</span>
              ) : (
                <span>${500 - annualUsd} remaining quota</span>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4">
            <span className="text-[11px] text-emerald-400 font-mono">Est. Value Saved</span>
            <div className="text-xl font-bold text-emerald-300 font-mono mt-1">
              {estimatedHoursSaved} hrs
            </div>
            <div className="text-xs text-emerald-400 font-mono mt-0.5">
              ~NPR {estimatedNprSaved.toLocaleString()}/mo ROI
            </div>
          </div>
        </div>

        {/* NRB Limit Alert if exceeded */}
        {isNearOrOverLimit && (
          <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-200 flex items-start gap-2.5">
            <ShieldCheck className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="font-semibold">NRB $500 Dollar Card Quota Alert:</p>
              <p className="text-[11px] text-amber-300/80 mt-0.5 leading-relaxed">
                Nepal Rastra Bank caps prepaid dollar cards at $500 per fiscal year. For teams or power users requiring higher limits, we provide enterprise billing proxies, INR/international corporate invoicing, and local NPR bank agreements.
              </p>
            </div>
          </div>
        )}

        {/* Selected Stack List */}
        <div>
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
            <span>Selected Tools ({stackTools.length}):</span>
            {stackTools.length > 0 && (
              <button
                type="button"
                onClick={onClearStack}
                aria-label="Clear all tools from stack"
                className="text-slate-500 hover:text-red-400 transition-colors flex items-center gap-1 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-red-400 rounded px-1"
              >
                <Trash2 className="h-3 w-3" aria-hidden="true" />
                <span>Clear All</span>
              </button>
            )}
          </div>

          {stackTools.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-800 p-8 text-center text-xs text-slate-400">
              No tools selected in your stack yet. Click "Add to Stack" on any tool card in the directory.
            </div>
          ) : (
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {stackTools.map((tool) => (
                <div
                  key={tool.id}
                  className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/60 p-2.5 text-xs"
                >
                  <div>
                    <span className="font-semibold text-white">{tool.name}</span>
                    <span className="text-[11px] text-slate-400 ml-2">
                      (${tool.monthlyPriceUsd}/mo • NPR {Math.round(tool.monthlyPriceUsd * exchangeRate).toLocaleString()})
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => onToggleStack(tool.id)}
                    className="p-1 text-slate-400 hover:text-red-400 transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-red-400 rounded"
                    aria-label={`Remove ${tool.name} from stack`}
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-8 pt-5 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            Back to Directory
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenConsultation('Enterprise AI Stack Setup & Payment Proxy');
            }}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-xs font-bold text-slate-950 hover:brightness-110 active:scale-95 transition-all shadow-md shadow-emerald-500/20 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            <span>Consult on Team AI Billing & Setup</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

      </div>
    </div>
  );
};
