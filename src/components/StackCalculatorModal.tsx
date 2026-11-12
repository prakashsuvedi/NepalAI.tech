import React, { useState, useEffect, useMemo } from 'react';
import { NEPAL_AI_TOOLS } from '../data/nepalTools';
import { 
  X, 
  Trash2, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowRight, 
  ArrowLeft, 
  Calculator, 
  Layers, 
  Plus, 
  Sparkles, 
  AlertTriangle, 
  Check, 
  Copy, 
  Share2, 
  FileText,
  DollarSign,
  TrendingUp,
  CreditCard,
  Briefcase
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useToast } from '../context/ToastContext';
import { ThemeMode, Language } from '../types';

interface StackCalculatorModalProps {
  selectedStack: string[];
  onToggleStack: (toolId: string) => void;
  onClearStack: () => void;
  onClose: () => void;
  onOpenConsultation: (serviceTitle?: string) => void;
  theme?: ThemeMode;
  language?: Language;
}

export const StackCalculatorModal: React.FC<StackCalculatorModalProps> = ({
  selectedStack,
  onToggleStack,
  onClearStack,
  onClose,
  onOpenConsultation,
  theme = 'dark',
  language = 'en',
}) => {
  const { showToast } = useToast();
  const exchangeRate = 135; // 1 USD = 135 NPR
  const isDark = theme === 'dark';
  const isNepali = language === 'ne';

  // Multi-step State
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [toolSearch, setToolSearch] = useState<string>('');
  const [selectedAddons, setSelectedAddons] = useState<string[]>([
    'Local NPR Invoicing & VAT Bill (eSewa / Khalti)',
  ]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const stackTools = useMemo(() => {
    return NEPAL_AI_TOOLS.filter((t) => selectedStack.includes(t.id));
  }, [selectedStack]);

  const totalUsd = stackTools.reduce((acc, curr) => acc + curr.monthlyPriceUsd, 0);
  const totalNpr = Math.round(totalUsd * exchangeRate);
  const annualUsd = totalUsd * 12;
  const annualNpr = Math.round(annualUsd * exchangeRate);

  // NRB Dollar Card Limit Check (Max $500 per fiscal year)
  const quotaUsedPercent = Math.min(Math.round((annualUsd / 500) * 100), 150);
  const isOverLimit = annualUsd > 500;
  const isNearLimit = annualUsd >= 400 && annualUsd <= 500;

  // Estimated hours saved (approx 4 hours per paid AI tool per week)
  const estimatedHoursSaved = stackTools.length * 16;
  const estimatedNprSaved = estimatedHoursSaved * 1200; // conservative NPR 1200/hr value

  // Preset Bundles
  const presets = [
    {
      id: 'preset-dev',
      name: 'Freelance Dev Stack',
      toolIds: ['cursor-ai', 'claude-coding', 'github-copilot', 'chatgpt-plus'],
      desc: 'Coding, refactoring, and code review',
    },
    {
      id: 'preset-creator',
      name: 'Content & Creator Pro',
      toolIds: ['midjourney', 'elevenlabs', 'runway-gen3', 'canva-magic'],
      desc: 'Visuals, voiceovers, video, and social',
    },
    {
      id: 'preset-fintech',
      name: 'Fintech & Enterprise Team',
      toolIds: ['sora-2-studio', 'claude-coding', 'perplexity-pro', 'n8n-enterprise'],
      desc: 'Bilingual docs, research, and sovereign AI',
    },
    {
      id: 'preset-nepal-sovereign',
      name: 'Nepal Local & Open Source',
      toolIds: ['ollama-runner', 'n8n-enterprise', 'dify-ai', 'flowise-ai'],
      desc: '100% On-premise air-gapped zero dollar spend',
    },
  ];

  const handleApplyPreset = (presetToolIds: string[]) => {
    presetToolIds.forEach((id) => {
      if (!selectedStack.includes(id)) {
        onToggleStack(id);
      }
    });
    showToast(
      'Preset Applied!',
      'Selected tools have been added to your custom AI Stack.',
      'success',
      3000
    );
  };

  const handleCopySummary = () => {
    const summaryText = `NepalAI Tech Stack Report:\n- Selected Tools (${stackTools.length}): ${stackTools.map(t => `${t.name} ($${t.monthlyPriceUsd}/mo)`).join(', ')}\n- Monthly Spend: $${totalUsd}/mo (~NPR ${totalNpr.toLocaleString()})\n- Annual Spend: $${annualUsd}/yr (~NPR ${annualNpr.toLocaleString()})\n- NRB $500 Limit Status: ${isOverLimit ? 'EXCEEDS $500 (Enterprise Proxy Recommended)' : `$${500 - annualUsd} remaining quota`}\n- Estimated ROI: ~NPR ${estimatedNprSaved.toLocaleString()}/mo (${estimatedHoursSaved} hrs saved)\nGenerated via nepalai.tech`;
    
    navigator.clipboard.writeText(summaryText);
    showToast(
      'Report Copied to Clipboard!',
      'You can now share this AI stack calculation with your team or accountant.',
      'success',
      4000
    );
  };

  const toggleAddon = (addon: string) => {
    setSelectedAddons((prev) =>
      prev.includes(addon) ? prev.filter((a) => a !== addon) : [...prev, addon]
    );
  };

  const steps = [
    { number: 1, label: isNepali ? 'टुल्स छनोट' : 'Tool Stack', icon: Layers },
    { number: 2, label: isNepali ? 'बजेट र NRB कोटा' : 'Budget & Quota', icon: Calculator },
    { number: 3, label: isNepali ? 'कार्यान्वयन योजना' : 'Deploy & Action', icon: ArrowRight },
  ];

  const filteredUnselectedTools = useMemo(() => {
    if (!toolSearch.trim()) return [];
    const q = toolSearch.toLowerCase();
    return NEPAL_AI_TOOLS.filter(
      (t) =>
        !selectedStack.includes(t.id) &&
        (t.name.toLowerCase().includes(q) || t.category.toLowerCase().includes(q))
    ).slice(0, 5);
  }, [toolSearch, selectedStack]);

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto p-3 sm:p-4 flex min-h-screen items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="stack-calculator-title"
        className={`relative w-full max-w-2xl rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] my-auto ${
          isDark
            ? 'border-white/10 bg-[#080b12] text-slate-100 shadow-black/90'
            : 'border-slate-200 bg-white text-slate-900 shadow-xl'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`relative px-5 sm:px-6 pt-5 pb-4 border-b flex items-center justify-between shrink-0 ${
          isDark ? 'border-white/10' : 'border-slate-200'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`flex h-9 w-9 items-center justify-center rounded-xl border shrink-0 ${
              isDark ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}>
              <Calculator className="h-4 w-4" />
            </div>
            <div>
              <h2 id="stack-calculator-title" className="text-base sm:text-lg font-bold font-display">
                {isNepali ? 'नेपाल एआई स्ट्याक तथा ROI क्याल्कुलेटर' : 'Nepal AI Stack Cost & ROI Calculator'}
              </h2>
              <p className={`text-[11px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {isNepali ? 'NRB $५०० डलर कार्ड सीमा र eSewa/Khalti विश्लेषण' : 'NRB $500 Dollar Card Quota & NPR Budget Optimizer'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`rounded-full p-2 transition-colors cursor-pointer ${
              isDark ? 'text-slate-400 hover:bg-white/10 hover:text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
            }`}
            aria-label="Close stack calculator modal"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* VISUAL PROGRESS STEPPER BAR */}
        <div className={`px-5 sm:px-6 py-3.5 border-b shrink-0 ${
          isDark ? 'bg-white/[0.02] border-white/10' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="relative flex items-center justify-between">
            {/* Connecting Background Line */}
            <div className={`absolute left-6 right-6 top-1/2 -translate-y-1/2 h-0.5 z-0 ${
              isDark ? 'bg-white/10' : 'bg-slate-200'
            }`} />
            
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
                  onClick={() => setCurrentStep(step.number)}
                  className="relative z-10 flex flex-col items-center gap-1 group cursor-pointer transition-all"
                >
                  <div
                    className={`flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full text-xs font-bold transition-all shadow-xs ${
                      isCompleted
                        ? 'bg-emerald-500 text-slate-950 ring-4 ring-emerald-500/20'
                        : isActive
                        ? 'bg-emerald-600 text-white ring-4 ring-emerald-500/30 scale-105'
                        : isDark
                        ? 'bg-slate-900 border border-white/20 text-slate-400'
                        : 'bg-white border border-slate-300 text-slate-600'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="h-3.5 w-3.5 stroke-[3]" />
                    ) : (
                      <IconComp className="h-3.5 w-3.5" />
                    )}
                  </div>
                  <span
                    className={`text-[10px] sm:text-[11px] font-semibold whitespace-nowrap transition-colors ${
                      isActive
                        ? isDark ? 'text-emerald-400 font-bold' : 'text-emerald-700 font-bold'
                        : isCompleted
                        ? isDark ? 'text-slate-200' : 'text-slate-800'
                        : isDark ? 'text-slate-400' : 'text-slate-500'
                    }`}
                  >
                    {step.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Modal Step Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 text-xs">
          <AnimatePresence mode="wait">
            {/* STEP 1: CONFIGURE STACK & PRESETS */}
            {currentStep === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                {/* 1-Click Preset Strip */}
                <div>
                  <span className={`text-[11px] font-mono block mb-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    {isNepali ? 'द्रुत स्ट्याक बन्डलहरू (1-Click Presets):' : 'Popular 1-Click Stack Presets for Nepal:'}
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {presets.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleApplyPreset(preset.toolIds)}
                        className={`p-3 rounded-2xl border text-left transition-all group cursor-pointer ${
                          isDark
                            ? 'border-white/10 bg-white/[0.02] hover:bg-emerald-500/10 hover:border-emerald-500/30'
                            : 'border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`font-bold text-xs ${
                            isDark ? 'text-white group-hover:text-emerald-300' : 'text-slate-900 group-hover:text-emerald-700'
                          }`}>
                            {preset.name}
                          </span>
                          <Plus className={`h-3.5 w-3.5 ${
                            isDark ? 'text-slate-400 group-hover:text-emerald-400' : 'text-slate-500 group-hover:text-emerald-600'
                          }`} />
                        </div>
                        <p className={`text-[10px] mt-1 line-clamp-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                          {preset.desc}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick Add Search */}
                <div className="relative">
                  <input
                    type="text"
                    value={toolSearch}
                    onChange={(e) => setToolSearch(e.target.value)}
                    placeholder="Search & add more AI tools (e.g. ChatGPT, Perplexity, ElevenLabs)..."
                    className={`w-full rounded-xl border px-3.5 py-2.5 text-xs transition-all focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                      isDark
                        ? 'border-white/10 bg-[#070912] text-white placeholder-slate-500'
                        : 'border-slate-300 bg-white text-slate-900 placeholder-slate-400'
                    }`}
                  />
                  {filteredUnselectedTools.length > 0 && (
                    <div className={`absolute top-full left-0 right-0 mt-1 rounded-xl border shadow-xl z-20 overflow-hidden divide-y ${
                      isDark ? 'border-white/15 bg-slate-900 divide-white/5' : 'border-slate-200 bg-white divide-slate-100 shadow-md'
                    }`}>
                      {filteredUnselectedTools.map((t) => (
                        <div
                          key={t.id}
                          onClick={() => {
                            onToggleStack(t.id);
                            setToolSearch('');
                          }}
                          className={`p-2.5 cursor-pointer flex items-center justify-between text-xs transition-colors ${
                            isDark ? 'hover:bg-emerald-500/15' : 'hover:bg-emerald-50'
                          }`}
                        >
                          <span className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{t.name}</span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-mono text-[11px] font-semibold">
                            ${t.monthlyPriceUsd}/mo • + Add
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Selected Stack List */}
                <div>
                  <div className={`flex items-center justify-between text-xs font-semibold mb-2 ${
                    isDark ? 'text-slate-300' : 'text-slate-700'
                  }`}>
                    <span>Active Tools in Stack ({stackTools.length}):</span>
                    {stackTools.length > 0 && (
                      <button
                        type="button"
                        onClick={onClearStack}
                        className={`transition-colors flex items-center gap-1 cursor-pointer text-[11px] ${
                          isDark ? 'text-slate-400 hover:text-red-400' : 'text-slate-500 hover:text-red-600'
                        }`}
                      >
                        <Trash2 className="h-3 w-3" />
                        <span>Clear All</span>
                      </button>
                    )}
                  </div>

                  {stackTools.length === 0 ? (
                    <div className={`rounded-2xl border border-dashed p-7 text-center text-xs space-y-1.5 ${
                      isDark ? 'border-white/10 text-slate-400' : 'border-slate-300 text-slate-600 bg-slate-50/50'
                    }`}>
                      <p className="font-medium">No tools in your stack yet.</p>
                      <p className="text-[11px] opacity-80">
                        Click any of the preset buttons above or search to calculate your stack spend.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                      {stackTools.map((tool) => (
                        <div
                          key={tool.id}
                          className={`flex items-center justify-between rounded-xl border p-2.5 text-xs ${
                            isDark
                              ? 'border-white/10 bg-white/[0.02]'
                              : 'border-slate-200 bg-white shadow-2xs'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{tool.name}</span>
                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                              isDark ? 'bg-white/[0.04] border-white/10 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                            }`}>
                              {tool.category}
                            </span>
                            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono font-semibold">
                              ${tool.monthlyPriceUsd}/mo (रू {Math.round(tool.monthlyPriceUsd * exchangeRate).toLocaleString()})
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => onToggleStack(tool.id)}
                            className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                              isDark ? 'text-slate-400 hover:text-red-400' : 'text-slate-500 hover:text-red-600'
                            }`}
                            aria-label={`Remove ${tool.name} from stack`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* STEP 2: BUDGET, NRB QUOTA & ROI ANALYSIS */}
            {currentStep === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                {/* Metric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className={`rounded-2xl border p-3.5 ${
                    isDark ? 'border-white/10 bg-white/[0.02]' : 'border-slate-200 bg-white shadow-2xs'
                  }`}>
                    <span className={`text-[11px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Monthly AI Spend</span>
                    <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-1">
                      ${totalUsd} <span className="text-xs font-normal opacity-75">/ mo</span>
                    </div>
                    <div className={`text-xs font-mono mt-0.5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      ~रू {totalNpr.toLocaleString()}
                    </div>
                  </div>

                  <div className={`rounded-2xl border p-3.5 ${
                    isOverLimit
                      ? 'border-red-500/40 bg-red-950/20'
                      : isNearLimit
                      ? 'border-amber-500/40 bg-amber-950/20'
                      : isDark ? 'border-white/10 bg-white/[0.02]' : 'border-slate-200 bg-white shadow-2xs'
                  }`}>
                    <span className={`text-[11px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Annual ($500 Quota)</span>
                    <div className={`text-xl font-bold font-mono mt-1 ${
                      isOverLimit ? 'text-red-500 dark:text-red-400' : isNearLimit ? 'text-amber-500 dark:text-amber-400' : isDark ? 'text-white' : 'text-slate-900'
                    }`}>
                      ${annualUsd} <span className="text-xs font-normal opacity-75">/ yr</span>
                    </div>
                    <div className={`text-[11px] mt-0.5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      {isOverLimit ? (
                        <span className="text-red-500 dark:text-red-400 font-semibold">Exceeds $500 NRB Limit</span>
                      ) : (
                        <span>${500 - annualUsd} remaining quota</span>
                      )}
                    </div>
                  </div>

                  <div className={`rounded-2xl border p-3.5 ${
                    isDark ? 'border-emerald-500/30 bg-emerald-950/20' : 'border-emerald-200 bg-emerald-50/70'
                  }`}>
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono">Est. Value Saved</span>
                    <div className="text-xl font-bold text-emerald-700 dark:text-emerald-300 font-mono mt-1">
                      {estimatedHoursSaved} hrs/mo
                    </div>
                    <div className="text-xs text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                      ~रू {estimatedNprSaved.toLocaleString()}/mo ROI
                    </div>
                  </div>
                </div>

                {/* NRB Dollar Card Visual Quota Bar */}
                <div className={`rounded-2xl border p-4 space-y-2 ${
                  isDark ? 'border-white/10 bg-white/[0.02]' : 'border-slate-200 bg-white shadow-2xs'
                }`}>
                  <div className="flex items-center justify-between text-xs">
                    <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      Nepal Rastra Bank $500 Dollar Card Quota:
                    </span>
                    <span className={`font-mono font-bold ${
                      isOverLimit ? 'text-red-500 dark:text-red-400' : isNearLimit ? 'text-amber-500 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'
                    }`}>
                      ${annualUsd} / $500 ({quotaUsedPercent}%)
                    </span>
                  </div>

                  <div className={`w-full h-3 rounded-full overflow-hidden ${isDark ? 'bg-white/10' : 'bg-slate-100'}`}>
                    <div
                      className={`h-full transition-all duration-500 ${
                        isOverLimit
                          ? 'bg-gradient-to-r from-red-500 to-rose-600'
                          : isNearLimit
                          ? 'bg-gradient-to-r from-amber-400 to-orange-500'
                          : 'bg-gradient-to-r from-emerald-500 to-teal-400'
                      }`}
                      style={{ width: `${Math.min(quotaUsedPercent, 100)}%` }}
                    />
                  </div>

                  {isOverLimit ? (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-300 text-[11px] space-y-1">
                      <p className="font-bold flex items-center gap-1.5">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        Annual spend exceeds the $500 NRB Dollar Card ceiling.
                      </p>
                      <p className="leading-relaxed">
                        To support your full stack without card declines, NepalAI provides corporate NPR token routing, VAT invoices, and local bank settlement.
                      </p>
                    </div>
                  ) : (
                    <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      Your annual subscriptions fit comfortably inside 1 standard Nepali bank prepaid dollar card.
                    </p>
                  )}
                </div>

                {/* Payment Routing Guide */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className={`p-3 rounded-xl border ${
                    isDark ? 'border-white/10 bg-white/[0.01]' : 'border-slate-200 bg-slate-50'
                  }`}>
                    <span className={`font-bold block mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>Direct Card Subscriptions</span>
                    <p className={`text-[11px] leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      Use your PAN-linked Nabil/Global/NIC prepaid dollar card for direct OpenAI, Claude & Cursor tools.
                    </p>
                  </div>
                  <div className={`p-3 rounded-xl border ${
                    isDark ? 'border-white/10 bg-white/[0.01]' : 'border-slate-200 bg-slate-50'
                  }`}>
                    <span className={`font-bold block mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>Local NPR & eSewa Invoicing</span>
                    <p className={`text-[11px] leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      Pay through eSewa, Khalti, or FonePay QR for NepalAI Studio compute credits and managed proxy gateways.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 3: DEPLOYMENT & ACTION PLAN */}
            {currentStep === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                <div>
                  <span className={`text-xs font-semibold block mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Select Implementation & Advisory Add-ons:
                  </span>
                  <div className="space-y-2">
                    {[
                      'Local NPR Invoicing & VAT Bill (eSewa / Khalti)',
                      'Air-Gapped Sovereign Data Residency (Kathmandu Datacenter)',
                      'NRB IT Compliance & Security Review',
                      'Devanagari Prompt Engineering & Custom System Prompts',
                      'Multi-Seat Team License & SSO Provisioning',
                    ].map((addon, idx) => {
                      const isChecked = selectedAddons.includes(addon);
                      return (
                        <div
                          key={idx}
                          onClick={() => toggleAddon(addon)}
                          className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                            isChecked
                              ? isDark ? 'border-emerald-500/40 bg-emerald-500/10 text-white' : 'border-emerald-500 bg-emerald-50 text-emerald-950 font-semibold'
                              : isDark ? 'border-white/10 bg-white/[0.02] text-slate-300 hover:bg-white/[0.04]' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <span className="text-xs">{addon}</span>
                          <div className={`h-5 w-5 rounded-md flex items-center justify-center border ${
                            isChecked
                              ? 'bg-emerald-500 border-emerald-400 text-slate-950 font-bold'
                              : isDark ? 'border-white/20' : 'border-slate-300'
                          }`}>
                            {isChecked && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Final Stack Summary Box */}
                <div className={`rounded-2xl border p-4 space-y-2 ${
                  isDark ? 'border-emerald-500/30 bg-emerald-950/20' : 'border-emerald-200 bg-emerald-50'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-700 dark:text-emerald-300 text-xs">Final Stack Assessment:</span>
                    <span className={`text-xs font-mono font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      ${totalUsd}/mo (~रू {totalNpr.toLocaleString()})
                    </span>
                  </div>
                  <p className={`text-[11px] ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    {stackTools.length} selected AI tools with ~{estimatedHoursSaved} hours saved monthly and ~रू {estimatedNprSaved.toLocaleString()}/mo in productivity ROI.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Navigation Actions */}
        <div className={`px-5 sm:px-6 py-4 border-t flex items-center justify-between gap-3 shrink-0 ${
          isDark ? 'border-white/10 bg-white/[0.01]' : 'border-slate-200 bg-slate-50/70'
        }`}>
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => Math.max(prev - 1, 1))}
              className={`min-h-[40px] px-4 py-2 rounded-xl border transition-colors flex items-center gap-1.5 cursor-pointer text-xs font-medium ${
                isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-300 text-slate-700 hover:bg-white'
              }`}
            >
              <ArrowLeft className="h-4 w-4" />
              <span>{isNepali ? 'पछाडि' : 'Back'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className={`min-h-[40px] px-4 py-2 rounded-xl border transition-colors cursor-pointer text-xs font-medium ${
                isDark ? 'border-slate-700 text-slate-400 hover:text-white' : 'border-slate-300 text-slate-600 hover:text-slate-900 hover:bg-white'
              }`}
            >
              {isNepali ? 'बन्द गर्नुहोस्' : 'Close'}
            </button>
          )}

          <div className="flex items-center gap-2">
            {currentStep === 2 && (
              <button
                type="button"
                onClick={handleCopySummary}
                className={`min-h-[40px] px-3.5 py-2 rounded-xl border transition-colors flex items-center gap-1.5 cursor-pointer text-xs font-medium ${
                  isDark ? 'border-white/20 text-slate-200 hover:bg-white/10' : 'border-slate-300 text-slate-700 hover:bg-white'
                }`}
                title="Copy Stack Summary"
              >
                <Copy className="h-3.5 w-3.5 text-emerald-500" />
                <span className="hidden sm:inline">Copy Report</span>
              </button>
            )}

            {currentStep < 3 ? (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => Math.min(prev + 1, 3))}
                className={`min-h-[40px] px-5 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer text-xs ${
                  isDark ? 'bg-white text-slate-950 hover:bg-slate-200' : 'bg-slate-900 text-white hover:bg-slate-800'
                }`}
              >
                <span>{isNepali ? 'अगाडि बढ्नुहोस्' : 'Next Step'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenConsultation(`Stack Deployment (${stackTools.map(t => t.name).join(', ')})`);
                }}
                className="min-h-[40px] px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all flex items-center gap-2 shadow-xs cursor-pointer text-xs"
              >
                <Sparkles className="h-4 w-4" />
                <span>{isNepali ? 'स्ट्याक सेटअप परामर्श लिनुहोस्' : 'Book 1-Click Stack Consultation'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
