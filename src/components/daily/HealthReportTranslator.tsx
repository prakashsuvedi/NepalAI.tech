import React, { useState, useEffect } from 'react';
import {
  HeartPulse,
  Upload,
  Camera,
  Sparkles,
  Volume2,
  Square,
  Download,
  Copy,
  Sun,
  Sunset,
  Moon,
  HelpCircle,
  CheckCircle2,
  X,
} from 'lucide-react';
import { Language } from '../../types';
import { useToast } from '../../context/ToastContext';
import {
  HealthDocMode,
  HealthTranslationReport,
  HEALTH_SAMPLE_DOCS,
  translateHealthReportFallback,
} from '../../utils/healthTranslatorEngine';
import { exportHealthGuidePdf } from '../../utils/pdfExport';

interface HealthReportTranslatorProps {
  isDark: boolean;
  language: Language;
}

export const HealthReportTranslator: React.FC<HealthReportTranslatorProps> = ({ isDark, language }) => {
  const isNe = language === 'ne';
  const { showToast } = useToast();

  const [mode, setMode] = useState<HealthDocMode>('lab_report');
  const [rawText, setRawText] = useState<string>(HEALTH_SAMPLE_DOCS[0].text);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoMimeType, setPhotoMimeType] = useState<string>('image/jpeg');
  const [photoFileName, setPhotoFileName] = useState<string>('');
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  const [report, setReport] = useState<HealthTranslationReport>(() =>
    translateHealthReportFallback({
      text: HEALTH_SAMPLE_DOCS[0].text,
      mode: 'lab_report',
      language,
    })
  );

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 6 * 1024 * 1024) {
      showToast('error', isNe ? 'फाइल धेरै ठूलो छ' : 'File Too Large', isNe ? '६ MB भन्दा कम साइजको तस्बिर छान्नुहोस्।' : 'Choose an image under 6 MB.');
      return;
    }
    setPhotoFileName(file.name);
    setPhotoMimeType(file.type || 'image/jpeg');
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPhotoPreview(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleTranslate = async (overrideText?: string, overrideMode?: HealthDocMode) => {
    const textToParse = (overrideText !== undefined ? overrideText : rawText).trim();
    const targetMode = overrideMode || mode;

    if (!photoPreview && !textToParse) {
      showToast('info', isNe ? 'फोटो वा विवरण राख्नुहोस्' : 'Add Report Photo or Text', isNe ? 'रिपोर्ट/पर्चीको फोटो वा मानहरू तल राख्नुहोस्।' : 'Upload a lab sheet/prescription photo or paste values below.');
      return;
    }

    setIsTranslating(true);
    try {
      const response = await fetch('/api/health-translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: overrideText !== undefined ? undefined : photoPreview || undefined,
          mimeType: photoMimeType,
          rawText: textToParse,
          mode: targetMode,
          language,
        }),
      });
      const data = await response.json();
      if (response.ok && data?.report) {
        setReport(data.report);
        showToast(
          'success',
          isNe ? 'सरल नेपाली विवरण तयार भयो!' : 'Health Guide Ready!',
          isNe ? 'अब "नेपालीमा सुन्नुहोस्" थिचेर आमा–बुबालाई सुनाउनुहोस्।' : 'Tap "Listen in Nepali" to play calmly for parents.'
        );
        return;
      }
      throw new Error(data?.error || 'Fallback translate');
    } catch {
      const fallback = translateHealthReportFallback({
        text: textToParse,
        mode: targetMode,
        language,
      });
      setReport(fallback);
      showToast(
        'success',
        isNe ? 'सरल विवरण तयार भयो' : 'Translated Cleanly',
        isNe ? 'औषधि तालिका र जाँच विवरण तल हेर्नुहोस्।' : 'Medicine chart & plain explanations ready.'
      );
    } finally {
      setIsTranslating(false);
    }
  };

  const handleToggleAudio = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      showToast('info', isNe ? 'अडियो उपलब्ध छैन' : 'Audio Unavailable', isNe ? 'यस ब्राउजरमा स्पिच सुविधा छैन।' : 'Speech synthesis is not supported in this browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(report.audioScriptNe || report.warmSummaryNe);
    const voices = window.speechSynthesis.getVoices();
    const nepaliVoice = voices.find((v) => v.lang.toLowerCase().startsWith('ne') || v.lang.toLowerCase().startsWith('hi'));
    if (nepaliVoice) {
      utterance.voice = nepaliVoice;
      utterance.lang = nepaliVoice.lang;
    } else {
      utterance.lang = 'ne-NP';
    }
    utterance.rate = 0.92;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleCopyForFamily = async () => {
    try {
      const text = `${report.reportTitle}\n\n${report.warmSummaryNe}\n\n${
        report.medicineSchedule.length > 0
          ? report.medicineSchedule.map((m) => `• ${m.medicineName}: ${m.timingBadge} (${m.mealNote})`).join('\n')
          : report.labMarkers.map((l) => `• ${l.name} (${l.value}): ${l.meaningSimple}`).join('\n')
      }`;
      await navigator.clipboard.writeText(text);
      showToast('success', isNe ? 'परिवारका लागि कपी भयो' : 'Copied for Family WhatsApp');
    } catch {
      showToast('error', 'Clipboard unavailable');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-slate-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className={`text-base sm:text-lg font-bold font-display flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-950'}`}>
            <HeartPulse className="h-5 w-5 text-teal-500 shrink-0" />
            <span>{isNe ? 'आमा–बुबा स्वास्थ्य रिपोर्ट र औषधि बुझाउने (नेपाली अडियो)' : 'Lab Report & Prescription Translator for Parents (+ Nepali Audio)'}</span>
          </h3>
          <p className={`text-xs sm:text-sm mt-0.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            {isNe
              ? 'रगत जाँच वा डाक्टरको पर्चीको फोटो राख्नुहोस् — बिहान/दिउँसो/राति औषधि तालिका र शान्त नेपाली आवाजमा सरल अर्थ पाउनुहोस्।'
              : 'Snap any lab sheet or doctor prescription to get calm plain-Nepali explanations, a Morning/Day/Night pill chart, and 1-tap audio readback.'}
          </p>
        </div>

        {/* Mode Switch */}
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: 'lab_report' as HealthDocMode, label: isNe ? 'रगत / जाँच रिपोर्ट' : 'Lab Report' },
            { id: 'prescription' as HealthDocMode, label: isNe ? 'डाक्टरको औषधि पर्ची' : 'Prescription (Rx)' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setMode(item.id)}
              className={`min-h-[36px] px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer whitespace-nowrap ${
                mode === item.id
                  ? 'bg-teal-600 border-teal-600 text-white'
                  : isDark
                  ? 'border-white/15 bg-white/5 text-slate-200 hover:bg-white/10'
                  : 'border-slate-300 bg-white text-slate-800 hover:bg-slate-100'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Snap / Upload / Sample */}
        <div className="lg:col-span-5 space-y-4">
          <div className={`p-4 rounded-2xl border ${isDark ? 'bg-[#080d1a] border-white/15' : 'bg-white border-slate-300 shadow-xs'}`}>
            <div className="flex items-center justify-between mb-2.5">
              <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-teal-300' : 'text-teal-800'}`}>
                {isNe ? '१. रिपोर्ट वा पर्चीको फोटो छान्नुहोस्' : '1. Snap or Upload Report / Rx'}
              </span>
              {photoPreview && (
                <button
                  type="button"
                  onClick={() => {
                    setPhotoPreview(null);
                    setPhotoFileName('');
                  }}
                  className={`text-xs font-semibold flex items-center gap-1 cursor-pointer ${isDark ? 'text-rose-300' : 'text-rose-700'}`}
                >
                  <X className="h-3.5 w-3.5" />
                  <span>{isNe ? 'हटाउनुहोस्' : 'Clear'}</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 mb-3">
              <label className={`min-h-[42px] px-3 py-2 rounded-xl border border-dashed flex items-center justify-center gap-1.5 text-xs font-bold cursor-pointer transition-colors ${
                isDark
                  ? 'border-teal-500/50 bg-teal-500/10 hover:bg-teal-500/20 text-teal-200'
                  : 'border-teal-600 bg-teal-50 hover:bg-teal-100 text-teal-900'
              }`}>
                <Camera className="h-4 w-4 shrink-0" />
                <span>{isNe ? 'फोटो खिच्नुहोस्' : 'Take Photo'}</span>
                <input type="file" accept="image/*" capture="environment" onChange={handlePhotoUpload} className="hidden" />
              </label>
              <label className={`min-h-[42px] px-3 py-2 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-bold cursor-pointer transition-colors ${
                isDark ? 'border-white/15 bg-white/5 hover:bg-white/10 text-slate-100' : 'border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-900'
              }`}>
                <Upload className="h-4 w-4 shrink-0" />
                <span>{isNe ? 'फोटो अपलोड' : 'Upload Sheet'}</span>
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              </label>
            </div>

            {photoPreview && (
              <div className={`mb-3 p-2 rounded-xl border flex items-center gap-3 ${isDark ? 'border-white/15 bg-white/[0.03]' : 'border-slate-200 bg-slate-50'}`}>
                <img src={photoPreview} alt="Health report preview" className="h-14 w-14 object-cover rounded-lg border border-slate-500/30" />
                <div className="min-w-0 flex-1 text-xs">
                  <span className={`font-bold block truncate ${isDark ? 'text-white' : 'text-slate-950'}`}>{photoFileName}</span>
                  <span className={isDark ? 'text-teal-300' : 'text-teal-700'}>
                    {isNe ? 'पढ्न तयार छ' : 'Image loaded for translation'}
                  </span>
                </div>
              </div>
            )}

            {/* 1-Tap Samples */}
            <div className="mb-3">
              <span className={`text-xs font-semibold block mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                {isNe ? '१-क्लिक परीक्षण नमुनाहरू:' : 'Try 1-Tap Family Examples:'}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {HEALTH_SAMPLE_DOCS.map((sample) => (
                  <button
                    key={sample.id}
                    type="button"
                    onClick={() => {
                      setPhotoPreview(null);
                      setPhotoFileName('');
                      setMode(sample.mode);
                      setRawText(sample.text);
                      handleTranslate(sample.text, sample.mode);
                    }}
                    className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-colors ${
                      isDark
                        ? 'border-white/15 bg-white/5 hover:bg-teal-500/15 text-slate-200 hover:text-white'
                        : 'border-slate-300 bg-slate-50 hover:bg-teal-50 text-slate-800'
                    }`}
                  >
                    {isNe ? sample.labelNe : sample.labelEn}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              rows={7}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder={isNe ? 'रिपोर्टको नतिजा वा औषधिको नाम यहाँ टाइप/पेस्ट गर्नुहोस्...' : 'Paste lab report values or medicine lines here...'}
              className={`w-full rounded-xl border p-3 text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                isDark
                  ? 'bg-[#060913] border-white/15 text-slate-100 placeholder:text-slate-500'
                  : 'bg-slate-50 border-slate-300 text-slate-950 placeholder:text-slate-500'
              }`}
            />

            <button
              type="button"
              onClick={() => handleTranslate()}
              disabled={isTranslating}
              className="mt-3 w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-60 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Sparkles className={`h-4 w-4 ${isTranslating ? 'animate-spin' : ''}`} />
              <span>
                {isTranslating
                  ? isNe ? 'सरल नेपालीमा बनाउँदैछ...' : 'Translating...'
                  : isNe ? 'सरल नेपालीमा बुझाउनुहोस्' : 'Translate Clearly for Family'}
              </span>
            </button>
          </div>
        </div>

        {/* Right: Parent-Friendly Nepali Guide + Audio + Morning/Day/Night Chart */}
        <div className="lg:col-span-7 space-y-4">
          {/* Warm Summary + Big Nepali Audio CTA */}
          <div className={`p-4 sm:p-5 rounded-2xl border ${
            isDark ? 'bg-teal-950/30 border-teal-500/40' : 'bg-teal-50 border-teal-300 shadow-xs'
          }`}>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-teal-300' : 'text-teal-900'}`}>
                {report.reportTitle}
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleToggleAudio}
                  className={`min-h-[38px] px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors ${
                    isSpeaking
                      ? 'bg-rose-600 hover:bg-rose-500 text-white'
                      : 'bg-teal-600 hover:bg-teal-500 text-white'
                  }`}
                >
                  {isSpeaking ? <Square className="h-3.5 w-3.5" /> : <Volume2 className="h-4 w-4" />}
                  <span>{isSpeaking ? (isNe ? 'रोक्नुहोस्' : 'Stop Audio') : (isNe ? 'नेपालीमा सुन्नुहोस्' : 'Listen in Nepali')}</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    exportHealthGuidePdf({
                      reportTitle: report.reportTitle,
                      warmSummaryNe: report.warmSummaryNe,
                      labMarkers: report.labMarkers,
                      medicineSchedule: report.medicineSchedule,
                      questionsForDoctor: report.questionsForDoctor,
                    })
                  }
                  className="min-h-[38px] px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>{isNe ? 'फ्रिज तालिका PDF' : 'Save Guide PDF'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopyForFamily}
                  className={`min-h-[38px] px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1 cursor-pointer ${
                    isDark ? 'border-white/20 bg-white/10 text-white hover:bg-white/15' : 'border-teal-600 bg-white text-teal-900 hover:bg-teal-100'
                  }`}
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span>{isNe ? 'कपी' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <p className={`text-sm sm:text-base font-semibold leading-relaxed ${isDark ? 'text-white' : 'text-slate-950'}`}>
              {report.warmSummaryNe}
            </p>
            {!isNe && (
              <p className={`text-xs mt-1.5 ${isDark ? 'text-teal-200' : 'text-teal-800'}`}>
                {report.warmSummaryEn}
              </p>
            )}
          </div>

          {/* Visual Morning / Afternoon / Night Medicine Chart */}
          {report.medicineSchedule.length > 0 && (
            <div className={`p-4 sm:p-5 rounded-2xl border space-y-3 ${isDark ? 'bg-[#060a14] border-white/15' : 'bg-white border-slate-300 shadow-xs'}`}>
              <span className={`text-xs sm:text-sm font-bold block ${isDark ? 'text-white' : 'text-slate-950'}`}>
                {isNe ? 'दैनिक औषधि समय तालिका (बिहान · दिउँसो · राति)' : 'Daily Medicine Timing Chart'}
              </span>
              <div className="space-y-2.5">
                {report.medicineSchedule.map((med, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-xl border ${isDark ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-slate-50'}`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div>
                        <span className={`text-sm font-bold block ${isDark ? 'text-white' : 'text-slate-950'}`}>
                          {med.medicineName}
                        </span>
                        <span className={`text-xs ${isDark ? 'text-teal-300' : 'text-teal-800'}`}>
                          {med.purposeSimple}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className={`px-2.5 py-1 rounded-lg border text-xs font-bold flex items-center gap-1 ${
                          med.morning
                            ? 'bg-amber-500/20 border-amber-500/40 text-amber-800 dark:text-amber-200'
                            : isDark ? 'border-white/10 text-slate-500 opacity-50' : 'border-slate-200 text-slate-400 opacity-60'
                        }`}>
                          <Sun className="h-3.5 w-3.5" />
                          <span>{isNe ? 'बिहान' : 'AM'}</span>
                        </span>
                        <span className={`px-2.5 py-1 rounded-lg border text-xs font-bold flex items-center gap-1 ${
                          med.afternoon
                            ? 'bg-orange-500/20 border-orange-500/40 text-orange-800 dark:text-orange-200'
                            : isDark ? 'border-white/10 text-slate-500 opacity-50' : 'border-slate-200 text-slate-400 opacity-60'
                        }`}>
                          <Sunset className="h-3.5 w-3.5" />
                          <span>{isNe ? 'दिउँसो' : 'Day'}</span>
                        </span>
                        <span className={`px-2.5 py-1 rounded-lg border text-xs font-bold flex items-center gap-1 ${
                          med.night
                            ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-800 dark:text-indigo-200'
                            : isDark ? 'border-white/10 text-slate-500 opacity-50' : 'border-slate-200 text-slate-400 opacity-60'
                        }`}>
                          <Moon className="h-3.5 w-3.5" />
                          <span>{isNe ? 'राति' : 'Night'}</span>
                        </span>
                      </div>
                    </div>
                    <div className={`flex flex-wrap gap-3 text-xs pt-2 border-t border-slate-500/15 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      <span><strong>{isNe ? 'खाने समय:' : 'Meal:'}</strong> {med.mealNote}</span>
                      <span><strong>{isNe ? 'अवधि:' : 'Duration:'}</strong> {med.duration}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lab Markers Cards */}
          {report.labMarkers.length > 0 && (
            <div className={`p-4 sm:p-5 rounded-2xl border space-y-3 ${isDark ? 'bg-[#060a14] border-white/15' : 'bg-white border-slate-300 shadow-xs'}`}>
              <span className={`text-xs sm:text-sm font-bold block ${isDark ? 'text-white' : 'text-slate-950'}`}>
                {isNe ? 'रगत / जाँच रिपोर्टको सरल अर्थ' : 'Lab Markers Explained Simply'}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {report.labMarkers.map((marker, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-xl border ${isDark ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-slate-50'}`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-950'}`}>{marker.name}</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-bold shrink-0 ${
                        marker.status === 'attention'
                          ? isDark ? 'bg-rose-500/20 text-rose-200' : 'bg-rose-100 text-rose-800'
                          : marker.status === 'borderline'
                          ? isDark ? 'bg-amber-500/20 text-amber-200' : 'bg-amber-100 text-amber-900'
                          : isDark ? 'bg-emerald-500/20 text-emerald-200' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {marker.status === 'attention'
                          ? isNe ? 'डाक्टर देखाउनुहोस्' : 'Review'
                          : marker.status === 'borderline'
                          ? isNe ? 'ध्यान दिनुहोस्' : 'Watch'
                          : isNe ? 'सामान्य' : 'Normal'}
                      </span>
                    </div>
                    <div className={`text-sm font-extrabold font-mono mb-1 ${isDark ? 'text-teal-300' : 'text-teal-800'}`}>
                      {marker.value} <span className={`text-xs font-normal ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>(Normal: {marker.normalRange})</span>
                    </div>
                    <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                      {marker.meaningSimple}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Home Care & Questions for Doctor */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {report.homeCareTips.length > 0 && (
              <div className={`p-4 rounded-2xl border ${isDark ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-emerald-300 bg-emerald-50/70'}`}>
                <span className={`text-xs font-bold flex items-center gap-1.5 mb-2 ${isDark ? 'text-emerald-300' : 'text-emerald-900'}`}>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{isNe ? 'घरमै अपनाउने सरल हेरचाह' : 'Gentle Home Care Tips'}</span>
                </span>
                <ul className="space-y-1.5 text-xs">
                  {report.homeCareTips.map((tip, i) => (
                    <li key={i} className={`leading-relaxed ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                      • {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {report.questionsForDoctor.length > 0 && (
              <div className={`p-4 rounded-2xl border ${isDark ? 'border-cyan-500/30 bg-cyan-500/5' : 'border-cyan-300 bg-cyan-50/70'}`}>
                <span className={`text-xs font-bold flex items-center gap-1.5 mb-2 ${isDark ? 'text-cyan-300' : 'text-cyan-900'}`}>
                  <HelpCircle className="h-4 w-4" />
                  <span>{isNe ? 'अर्को पटक डाक्टरलाई सोध्ने प्रश्न' : 'Ask Doctor on Next Visit'}</span>
                </span>
                <ol className="space-y-1.5 text-xs list-decimal list-inside">
                  {report.questionsForDoctor.map((q, i) => (
                    <li key={i} className={`leading-relaxed ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                      {q}
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>

          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            {isNe
              ? 'मेडिकल जानकारी: यो टुलले रिपोर्ट र औषधिको समय बुझ्न मात्र मद्दत गर्छ; औषधि परिवर्तन वा उपचारका लागि सधैँ आफ्नो डाक्टरको सल्लाह मान्नुहोस्।'
              : 'Medical Note: Educational explanation tool only; never change prescribed doses without consulting your doctor or pharmacist.'}
          </p>
        </div>
      </div>
    </div>
  );
};
