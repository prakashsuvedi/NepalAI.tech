import React, { useState } from 'react';
import {
  Building2,
  CheckSquare,
  Square,
  AlertCircle,
  Clock,
  Coins,
  ExternalLink,
  Download,
  Copy,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { Language } from '../../types';
import { useToast } from '../../context/ToastContext';
import {
  SARKARI_WORKFLOWS,
  SarkariWorkflow,
  findSarkariWorkflow,
} from '../../utils/sarkariNavigatorEngine';
import { exportSarkariChecklistPdf } from '../../utils/pdfExport';

interface SarkariCounterNavigatorProps {
  isDark: boolean;
  language: Language;
}

export const SarkariCounterNavigator: React.FC<SarkariCounterNavigatorProps> = ({ isDark, language }) => {
  const isNe = language === 'ne';
  const { showToast } = useToast();

  const [selectedId, setSelectedId] = useState<string>(SARKARI_WORKFLOWS[0].id);
  const [checkedMap, setCheckedMap] = useState<Record<string, boolean>>({});
  const [customSituation, setCustomSituation] = useState<string>('');
  const [customAnswer, setCustomAnswer] = useState<string>('');
  const [isAsking, setIsAsking] = useState<boolean>(false);

  const activeWorkflow: SarkariWorkflow = findSarkariWorkflow(selectedId);

  const toggleDoc = (docId: string) => {
    const key = `${activeWorkflow.id}:${docId}`;
    setCheckedMap((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const isDocChecked = (docId: string) => Boolean(checkedMap[`${activeWorkflow.id}:${docId}`]);

  const mandatoryDocs = activeWorkflow.requiredDocs.filter((d) => d.mandatory);
  const mandatoryReadyCount = mandatoryDocs.filter((d) => isDocChecked(d.id)).length;
  const allMandatoryReady = mandatoryReadyCount === mandatoryDocs.length;

  const handleCopyChecklist = async () => {
    try {
      const text = `${isNe ? activeWorkflow.titleNe : activeWorkflow.titleEn}\n${
        isNe ? activeWorkflow.officeNe : activeWorkflow.officeEn
      }\n\n${activeWorkflow.requiredDocs
        .map((d) => `${isDocChecked(d.id) ? '[✓]' : '[ ]'} ${isNe ? d.labelNe : d.labelEn}`)
        .join('\n')}\n\n${
        isNe ? 'सरकारी दस्तुर:' : 'Fee:'
      } ${isNe ? activeWorkflow.estimatedFeeNe : activeWorkflow.estimatedFeeEn}`;
      await navigator.clipboard.writeText(text);
      showToast('success', isNe ? 'चेकलिस्ट कपी भयो' : 'Checklist Copied');
    } catch {
      showToast('error', 'Clipboard unavailable');
    }
  };

  const handleAskSituation = async () => {
    const q = customSituation.trim();
    if (!q) return;
    setIsAsking(true);
    try {
      const res = await fetch('/api/sarkari-guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workflowId: activeWorkflow.id,
          question: q,
          language,
        }),
      });
      const data = await res.json();
      if (res.ok && data?.answer) {
        setCustomAnswer(data.answer);
        return;
      }
      throw new Error('Fallback guide');
    } catch {
      setCustomAnswer(
        isNe
          ? `${activeWorkflow.titleNe} को लागि: ${activeWorkflow.counterSteps.map((s) => `${s.counterNameNe} — ${s.actionNe}`).join(' | ')}`
          : `For ${activeWorkflow.titleEn}: Verify ${activeWorkflow.requiredDocs.filter((d) => d.mandatory).map((d) => d.labelEn).join(', ')} at ${activeWorkflow.officeEn}.`
      );
    } finally {
      setIsAsking(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-slate-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className={`text-base sm:text-lg font-bold font-display flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-950'}`}>
            <Building2 className="h-5 w-5 text-indigo-500 shrink-0" />
            <span>{isNe ? 'सरकारी काम "शून्य-गल्ती" काउन्टर गाइड' : 'Sarkari Kaam "Zero-Mistake" Counter Navigator'}</span>
          </h3>
          <p className={`text-xs sm:text-sm mt-0.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            {isNe
              ? 'कुन कागज बोक्ने, कुन काउन्टरमा जाने, सरकारी दस्तुर कति लाग्छ र दोस्रो पटक नधाउन के ध्यान दिने — घरबाटै पक्का गर्नुहोस्।'
              : 'Know exact documents to carry, room-by-room counter sequence, official fees, and common rejection traps before leaving home.'}
          </p>
        </div>

        <a
          href={activeWorkflow.officialPortal}
          target="_blank"
          rel="noopener noreferrer"
          className={`min-h-[38px] px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 shrink-0 whitespace-nowrap transition-colors ${
            isDark
              ? 'border-indigo-400/40 bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-200'
              : 'border-indigo-600 bg-indigo-50 hover:bg-indigo-100 text-indigo-900'
          }`}
        >
          <ExternalLink className="h-3.5 w-3.5" />
          <span>{isNe ? 'आधिकारिक पोर्टल खोल्नुहोस्' : 'Official Portal'}</span>
        </a>
      </div>

      {/* 7 Workflow Selector Grid */}
      <div className="flex flex-wrap gap-2">
        {SARKARI_WORKFLOWS.map((wf) => {
          const active = wf.id === activeWorkflow.id;
          return (
            <button
              key={wf.id}
              type="button"
              onClick={() => {
                setSelectedId(wf.id);
                setCustomAnswer('');
              }}
              className={`min-h-[40px] px-3.5 py-2 rounded-xl border text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                active
                  ? 'bg-indigo-600 border-indigo-600 text-white'
                  : isDark
                  ? 'border-white/15 bg-white/5 text-slate-200 hover:bg-white/10'
                  : 'border-slate-300 bg-white text-slate-800 hover:bg-slate-100'
              }`}
            >
              {isNe ? wf.titleNe : wf.titleEn}
            </button>
          );
        })}
      </div>

      {/* Office, Fee & Time Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className={`p-3.5 rounded-xl border ${isDark ? 'border-white/15 bg-white/[0.03]' : 'border-slate-300 bg-white'}`}>
          <span className={`text-xs font-bold flex items-center gap-1.5 mb-1 ${isDark ? 'text-indigo-300' : 'text-indigo-800'}`}>
            <Building2 className="h-3.5 w-3.5" />
            <span>{isNe ? 'सम्बन्धित कार्यालय' : 'Office Desk'}</span>
          </span>
          <p className={`text-xs font-medium ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
            {isNe ? activeWorkflow.officeNe : activeWorkflow.officeEn}
          </p>
        </div>

        <div className={`p-3.5 rounded-xl border ${isDark ? 'border-white/15 bg-white/[0.03]' : 'border-slate-300 bg-white'}`}>
          <span className={`text-xs font-bold flex items-center gap-1.5 mb-1 ${isDark ? 'text-emerald-300' : 'text-emerald-800'}`}>
            <Coins className="h-3.5 w-3.5" />
            <span>{isNe ? 'आधिकारिक सरकारी दस्तुर' : 'Official Govt Fee'}</span>
          </span>
          <p className={`text-xs font-medium ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
            {isNe ? activeWorkflow.estimatedFeeNe : activeWorkflow.estimatedFeeEn}
          </p>
        </div>

        <div className={`p-3.5 rounded-xl border ${isDark ? 'border-white/15 bg-white/[0.03]' : 'border-slate-300 bg-white'}`}>
          <span className={`text-xs font-bold flex items-center gap-1.5 mb-1 ${isDark ? 'text-cyan-300' : 'text-cyan-800'}`}>
            <Clock className="h-3.5 w-3.5" />
            <span>{isNe ? 'लाग्ने समय' : 'Realistic Processing Time'}</span>
          </span>
          <p className={`text-xs font-medium ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
            {isNe ? activeWorkflow.estimatedTimeNe : activeWorkflow.estimatedTimeEn}
          </p>
        </div>
      </div>

      {/* Main Split: Interactive Checklist + Counter-by-Counter Sequence */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Document Checklist */}
        <div className="lg:col-span-5 space-y-4">
          <div className={`p-4 sm:p-5 rounded-2xl border ${isDark ? 'bg-[#080d1a] border-white/15' : 'bg-white border-slate-300 shadow-xs'}`}>
            <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-500/20">
              <span className={`text-xs sm:text-sm font-bold ${isDark ? 'text-white' : 'text-slate-950'}`}>
                {isNe ? '१. घरबाट बोक्ने कागजात चेकलिस्ट' : '1. Document Readiness Check'}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold font-mono ${
                allMandatoryReady
                  ? isDark ? 'bg-emerald-500/20 text-emerald-200' : 'bg-emerald-100 text-emerald-900'
                  : isDark ? 'bg-amber-500/20 text-amber-200' : 'bg-amber-100 text-amber-900'
              }`}>
                {mandatoryReadyCount}/{mandatoryDocs.length} {isNe ? 'अनिवार्य तयार' : 'Required Ready'}
              </span>
            </div>

            <div className="space-y-2.5">
              {activeWorkflow.requiredDocs.map((doc) => {
                const checked = isDocChecked(doc.id);
                return (
                  <button
                    key={doc.id}
                    type="button"
                    onClick={() => toggleDoc(doc.id)}
                    className={`w-full text-left p-3 rounded-xl border flex items-start gap-2.5 transition-colors cursor-pointer ${
                      checked
                        ? isDark
                          ? 'border-emerald-500/40 bg-emerald-500/10'
                          : 'border-emerald-500 bg-emerald-50'
                        : isDark
                        ? 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06]'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                    }`}
                  >
                    {checked ? (
                      <CheckSquare className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    ) : (
                      <Square className={`h-4 w-4 shrink-0 mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-950'}`}>
                          {isNe ? doc.labelNe : doc.labelEn}
                        </span>
                        {doc.mandatory && (
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                            isDark ? 'bg-rose-500/20 text-rose-200' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {isNe ? 'अनिवार्य' : 'Must'}
                          </span>
                        )}
                      </div>
                      {(doc.tipNe || doc.tipEn) && (
                        <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                          {isNe ? doc.tipNe : doc.tipEn}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {allMandatoryReady && (
              <div className={`mt-3 p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 ${
                isDark ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-200' : 'border-emerald-500 bg-emerald-50 text-emerald-900'
              }`}>
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{isNe ? 'तपाईंको सबै अनिवार्य कागजात तयार छन् — ढुक्क भएर जानुहोस्!' : 'All mandatory documents checked! Ready for your office visit.'}</span>
              </div>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() =>
                  exportSarkariChecklistPdf({
                    titleEn: activeWorkflow.titleEn,
                    titleNe: activeWorkflow.titleNe,
                    officeNe: activeWorkflow.officeNe,
                    estimatedFeeNe: activeWorkflow.estimatedFeeNe,
                    estimatedTimeNe: activeWorkflow.estimatedTimeNe,
                    officialPortal: activeWorkflow.officialPortal,
                    docs: activeWorkflow.requiredDocs.map((d) => ({
                      labelEn: d.labelEn,
                      labelNe: d.labelNe,
                      mandatory: d.mandatory,
                      checked: isDocChecked(d.id),
                    })),
                    steps: activeWorkflow.counterSteps,
                    mistakes: activeWorkflow.commonMistakes,
                  })
                }
                className="flex-1 min-h-[40px] px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                <span>{isNe ? 'चेकलिस्ट PDF' : 'Save Checklist PDF'}</span>
              </button>
              <button
                type="button"
                onClick={handleCopyChecklist}
                className={`min-h-[40px] px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                  isDark ? 'border-white/15 bg-white/5 hover:bg-white/10 text-slate-100' : 'border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-900'
                }`}
              >
                <Copy className="h-3.5 w-3.5" />
                <span>{isNe ? 'कपी' : 'Copy'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Room-by-Room Sequence + Rejection Traps + Custom Question */}
        <div className="lg:col-span-7 space-y-4">
          {/* Counter Sequence */}
          <div className={`p-4 sm:p-5 rounded-2xl border space-y-3 ${isDark ? 'bg-[#060a14] border-white/15' : 'bg-white border-slate-300 shadow-xs'}`}>
            <span className={`text-xs sm:text-sm font-bold block ${isDark ? 'text-white' : 'text-slate-950'}`}>
              {isNe ? '२. कार्यालय भित्र कुन काउन्टरपछि कुनमा जाने?' : '2. Exact Counter-by-Counter Order'}
            </span>
            <div className="space-y-2.5">
              {activeWorkflow.counterSteps.map((step) => (
                <div
                  key={step.stepNo}
                  className={`p-3.5 rounded-xl border flex items-start gap-3 ${
                    isDark ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <span className="h-6 w-6 rounded-lg bg-indigo-600 text-white text-xs font-extrabold flex items-center justify-center shrink-0">
                    {step.stepNo}
                  </span>
                  <div className="min-w-0 flex-1">
                    <span className={`text-xs sm:text-sm font-bold block ${isDark ? 'text-white' : 'text-slate-950'}`}>
                      {isNe ? step.counterNameNe : step.counterNameEn}
                    </span>
                    <p className={`text-xs mt-0.5 leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      {isNe ? step.actionNe : step.actionEn}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Avoid Second Trip Traps */}
          <div className={`p-4 rounded-2xl border ${isDark ? 'border-amber-500/30 bg-amber-500/10' : 'border-amber-300 bg-amber-50'}`}>
            <span className={`text-xs font-bold flex items-center gap-1.5 mb-2 ${isDark ? 'text-amber-200' : 'text-amber-900'}`}>
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{isNe ? 'काम नअड्कियोस् भनेर ध्यान दिने मुख्य कुरा:' : 'Avoid a Second Trip (Common Rejection Traps)'}</span>
            </span>
            <ul className="space-y-1.5 text-xs">
              {activeWorkflow.commonMistakes.map((m, idx) => (
                <li key={idx} className={isDark ? 'text-amber-100' : 'text-amber-950'}>
                  • {isNe ? m.ne : m.en}
                </li>
              ))}
            </ul>
          </div>

          {/* Optional Custom Situation Helper */}
          <div className={`p-4 rounded-2xl border ${isDark ? 'bg-[#080d1a] border-white/15' : 'bg-white border-slate-300 shadow-xs'}`}>
            <label className={`text-xs font-bold block mb-1.5 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
              {isNe ? 'तपाईंको विशेष अवस्था छ? (जस्तै: नागरिकता अर्कै जिल्लाको छ, भाडाको घर, हराएको कागज)' : 'Have a special case? (e.g., applying outside home district, lost copy, minor)'}
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={customSituation}
                onChange={(e) => setCustomSituation(e.target.value)}
                placeholder={isNe ? 'यहाँ छोटोमा लेख्नुहोस्...' : 'Ask about your specific case...'}
                className={`flex-1 min-h-[40px] px-3 py-2 rounded-xl border text-xs ${
                  isDark ? 'bg-[#060913] border-white/15 text-white placeholder:text-slate-500' : 'bg-slate-50 border-slate-300 text-slate-950 placeholder:text-slate-500'
                }`}
              />
              <button
                type="button"
                onClick={handleAskSituation}
                disabled={isAsking || !customSituation.trim()}
                className="min-h-[40px] px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
              >
                <Sparkles className={`h-3.5 w-3.5 ${isAsking ? 'animate-spin' : ''}`} />
                <span>{isAsking ? (isNe ? 'खोज्दैछ...' : 'Checking...') : (isNe ? 'सुझाव हेर्नुहोस्' : 'Check Steps')}</span>
              </button>
            </div>
            {customAnswer && (
              <div className={`mt-3 p-3 rounded-xl border text-xs leading-relaxed ${
                isDark ? 'border-indigo-500/30 bg-indigo-500/10 text-indigo-100' : 'border-indigo-200 bg-indigo-50 text-indigo-950'
              }`}>
                {customAnswer}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
