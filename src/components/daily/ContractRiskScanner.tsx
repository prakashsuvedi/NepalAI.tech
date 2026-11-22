import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Upload,
  Camera,
  Sparkles,
  Copy,
  Download,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  X,
} from 'lucide-react';
import { Language } from '../../types';
import { useToast } from '../../context/ToastContext';
import {
  ContractDocType,
  ContractRiskReport,
  CONTRACT_SAMPLE_DOCS,
  analyzeContractRiskFallback,
} from '../../utils/contractRiskEngine';
import { exportContractRiskPdf } from '../../utils/pdfExport';
import { ReactiveResultPanel } from '../ui/ReactiveResultPanel';

interface ContractRiskScannerProps {
  isDark: boolean;
  language: Language;
}

export const ContractRiskScanner: React.FC<ContractRiskScannerProps> = ({ isDark, language }) => {
  const isNe = language === 'ne';
  const { showToast } = useToast();

  const [docType, setDocType] = useState<ContractDocType>('rent_agreement');
  const [rawText, setRawText] = useState<string>(CONTRACT_SAMPLE_DOCS[0].text);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoMimeType, setPhotoMimeType] = useState<string>('image/jpeg');
  const [photoFileName, setPhotoFileName] = useState<string>('');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [riskGen, setRiskGen] = useState<number>(0);

  const [report, setReport] = useState<ContractRiskReport>(() =>
    analyzeContractRiskFallback({
      text: CONTRACT_SAMPLE_DOCS[0].text,
      docType: 'rent_agreement',
      language,
    })
  );

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 6 * 1024 * 1024) {
      showToast('error', isNe ? 'फाइल धेरै ठूलो छ' : 'File Too Large', isNe ? '६ MB भन्दा कम साइजको तस्बिर छान्नुहोस्।' : 'Choose a photo under 6 MB.');
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

  const handleScanContract = async (overrideText?: string, overrideType?: ContractDocType) => {
    const textToScan = (overrideText !== undefined ? overrideText : rawText).trim();
    const targetType = overrideType || docType;

    if (!photoPreview && !textToScan) {
      showToast('info', isNe ? 'कागजात राख्नुहोस्' : 'Add Agreement Text or Photo', isNe ? 'सम्झौताको फोटो वा पाठ तल राख्नुहोस्।' : 'Upload a document photo or paste agreement text.');
      return;
    }

    setIsScanning(true);
    try {
      const response = await fetch('/api/contract-risk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: overrideText !== undefined ? undefined : photoPreview || undefined,
          mimeType: photoMimeType,
          rawText: textToScan,
          docType: targetType,
          language,
        }),
      });
      const data = await response.json();
      if (response.ok && data?.report) {
        setReport(data.report);
        setRiskGen((n) => n + 1);
        showToast(
          data.report.riskLevel === 'high' ? 'info' : 'success',
          isNe ? `जोखिम जाँच पूरा: ${data.report.safetyScore}/100` : `Risk Scan Complete: ${data.report.safetyScore}/100`,
          `${data.report.redFlags?.length || 0} ${isNe ? 'जोखिम बुँदा भेटिए' : 'red flags highlighted'}`
        );
        return;
      }
      throw new Error(data?.error || 'Fallback risk scan');
    } catch {
      const fallback = analyzeContractRiskFallback({
        text: textToScan,
        docType: targetType,
        language,
      });
      setReport(fallback);
      setRiskGen((n) => n + 1);
      showToast(
        fallback.riskLevel === 'high' ? 'info' : 'success',
        isNe ? `सुरक्षा स्कोर: ${fallback.safetyScore}/100` : `Safety Score: ${fallback.safetyScore}/100`,
        `${fallback.redFlags.length} ${isNe ? 'जोखिम बुँदा फेला परे' : 'risk clauses highlighted'}`
      );
    } finally {
      setIsScanning(false);
    }
  };

  const copyText = async (val: string, msg: string) => {
    try {
      await navigator.clipboard.writeText(val);
      showToast('success', msg);
    } catch {
      showToast('error', 'Clipboard unavailable');
    }
  };

  const scoreColors =
    report.riskLevel === 'high'
      ? isDark
        ? 'border-rose-500/50 bg-rose-500/10 text-rose-200'
        : 'border-rose-300 bg-rose-50 text-rose-900'
      : report.riskLevel === 'medium'
      ? isDark
        ? 'border-amber-500/50 bg-amber-500/10 text-amber-200'
        : 'border-amber-300 bg-amber-50 text-amber-900'
      : isDark
      ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-200'
      : 'border-emerald-300 bg-emerald-50 text-emerald-900';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-slate-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className={`text-base sm:text-lg font-bold font-display flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-950'}`}>
            <ShieldAlert className="h-5 w-5 text-rose-500 shrink-0" />
            <span>{isNe ? 'कागजात तथा तमसुक जोखिम जाँच (हस्ताक्षर अघि जाँच्नुहोस्)' : 'Contract & Tamasuk Risk Scanner (Check Before Signing)'}</span>
          </h3>
          <p className={`text-xs sm:text-sm mt-0.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            {isNe
              ? 'घरभाडा सम्झौता, ऋण तमसुक, नोकरी अफर वा साझेदारी कागजका लुकेका जोखिम, अवैध ब्याज र छुटेका सुरक्षा बुँदा सरल भाषामा हेर्नुहोस्।'
              : 'Spot hidden penalties, illegal interest rates, one-sided bond terms, and missing Nepal legal safeguards before you sign.'}
          </p>
        </div>

        {/* Doc type chips */}
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: 'rent_agreement' as ContractDocType, label: isNe ? 'घरभाडा' : 'House Rent' },
            { id: 'tamasuk_loan' as ContractDocType, label: isNe ? 'तमसुक / ऋण' : 'Tamasuk' },
            { id: 'job_offer' as ContractDocType, label: isNe ? 'नोकरी' : 'Job Offer' },
            { id: 'business_partnership' as ContractDocType, label: isNe ? 'साझेदारी' : 'Business' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setDocType(item.id)}
              className={`min-h-[36px] px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer whitespace-nowrap ${
                docType === item.id
                  ? 'bg-rose-600 border-rose-600 text-white'
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

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Upload Photo or Paste Contract Text */}
        <div className="lg:col-span-5 space-y-4">
          <div className={`p-4 rounded-2xl border ${isDark ? 'bg-[#080d1a] border-white/15' : 'bg-white border-slate-300 shadow-xs'}`}>
            <div className="flex items-center justify-between mb-2.5">
              <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-rose-300' : 'text-rose-800'}`}>
                {isNe ? '१. कागजातको फोटो वा पाठ राख्नुहोस्' : '1. Snap Photo or Paste Agreement'}
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
                  ? 'border-rose-500/50 bg-rose-500/10 hover:bg-rose-500/20 text-rose-200'
                  : 'border-rose-500 bg-rose-50 hover:bg-rose-100 text-rose-900'
              }`}>
                <Camera className="h-4 w-4 shrink-0" />
                <span>{isNe ? 'फोटो खिच्नुहोस्' : 'Camera Snap'}</span>
                <input type="file" accept="image/*" capture="environment" onChange={handlePhotoUpload} className="hidden" />
              </label>
              <label className={`min-h-[42px] px-3 py-2 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-bold cursor-pointer transition-colors ${
                isDark ? 'border-white/15 bg-white/5 hover:bg-white/10 text-slate-100' : 'border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-900'
              }`}>
                <Upload className="h-4 w-4 shrink-0" />
                <span>{isNe ? 'फोटो अपलोड' : 'Upload Page'}</span>
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              </label>
            </div>

            {photoPreview && (
              <div className={`mb-3 p-2 rounded-xl border flex items-center gap-3 ${isDark ? 'border-white/15 bg-white/[0.03]' : 'border-slate-200 bg-slate-50'}`}>
                <img src={photoPreview} alt="Agreement preview" className="h-14 w-14 object-cover rounded-lg border border-slate-500/30" />
                <div className="min-w-0 flex-1 text-xs">
                  <span className={`font-bold block truncate ${isDark ? 'text-white' : 'text-slate-950'}`}>{photoFileName}</span>
                  <span className={isDark ? 'text-emerald-300' : 'text-emerald-700'}>
                    {isNe ? 'फोटो तयार छ' : 'Ready for Vision Risk Scan'}
                  </span>
                </div>
              </div>
            )}

            {/* 1-Tap Samples */}
            <div className="mb-3">
              <span className={`text-xs font-semibold block mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                {isNe ? '१-क्लिक नेपाल नमुनाहरू:' : 'Try 1-Tap Nepal Agreement Samples:'}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {CONTRACT_SAMPLE_DOCS.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      setPhotoPreview(null);
                      setPhotoFileName('');
                      setDocType(s.docType);
                      setRawText(s.text);
                      handleScanContract(s.text, s.docType);
                    }}
                    className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-colors ${
                      isDark
                        ? 'border-white/15 bg-white/5 hover:bg-rose-500/15 text-slate-200 hover:text-white'
                        : 'border-slate-300 bg-slate-50 hover:bg-rose-50 text-slate-800'
                    }`}
                  >
                    {isNe ? s.labelNe : s.labelEn}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              rows={7}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder={isNe ? 'यहाँ सम्झौता वा तमसुकको शर्तहरू पेस्ट गर्नुहोस्...' : 'Paste rent deed, job offer bond, or tamasuk clauses here...'}
              className={`w-full rounded-xl border p-3 text-xs sm:text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-rose-500 ${
                isDark
                  ? 'bg-[#060913] border-white/15 text-slate-100 placeholder:text-slate-500'
                  : 'bg-slate-50 border-slate-300 text-slate-950 placeholder:text-slate-500'
              }`}
            />

            <button
              type="button"
              onClick={() => handleScanContract()}
              disabled={isScanning}
              className="mt-3 w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-60 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Sparkles className={`h-4 w-4 ${isScanning ? 'animate-spin' : ''}`} />
              <span>
                {isScanning
                  ? isNe ? 'जोखिम जाँच गर्दैछ...' : 'Scanning Clauses...'
                  : isNe ? 'जोखिम र छुटेका बुँदा जाँच्नुहोस्' : 'Scan Risks Before Signing'}
              </span>
            </button>
          </div>
        </div>

        {/* Right: Safety Score & Plain Explanation */}
        <ReactiveResultPanel
          resultKey={`${docType}-${riskGen}`}
          className="lg:col-span-7 space-y-4"
        >
          {/* Safety Banner */}
          <div className={`p-4 sm:p-5 rounded-2xl border ${scoreColors}`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider block opacity-90">
                  {report.docTitle}
                </span>
                <p className="text-xs sm:text-sm font-medium mt-1 leading-relaxed">
                  {report.plainSummary}
                </p>
              </div>
              <div className={`px-4 py-2 rounded-xl border text-center shrink-0 ${
                isDark ? 'bg-[#060a14]/70 border-white/20' : 'bg-white/90 border-slate-300'
              }`}>
                <span className={`text-2xl font-extrabold font-mono block ${isDark ? 'text-white' : 'text-slate-950'}`}>
                  {report.safetyScore}/100
                </span>
                <span className={`text-xs font-bold uppercase ${
                  report.riskLevel === 'high'
                    ? isDark ? 'text-rose-300' : 'text-rose-700'
                    : report.riskLevel === 'medium'
                    ? isDark ? 'text-amber-300' : 'text-amber-700'
                    : isDark ? 'text-emerald-300' : 'text-emerald-700'
                }`}>
                  {report.riskLevel === 'high'
                    ? isNe ? 'उच्च जोखिम' : 'High Risk'
                    : report.riskLevel === 'medium'
                    ? isNe ? 'सावधानी आवश्यक' : 'Caution'
                    : isNe ? 'सन्तुलित' : 'Balanced'}
                </span>
              </div>
            </div>
          </div>

          {/* Red Flags */}
          <div className={`p-4 sm:p-5 rounded-2xl border space-y-3 ${isDark ? 'bg-[#060a14] border-white/15' : 'bg-white border-slate-300 shadow-xs'}`}>
            <div className="flex items-center justify-between">
              <span className={`text-xs sm:text-sm font-bold flex items-center gap-1.5 ${isDark ? 'text-white' : 'text-slate-950'}`}>
                <AlertTriangle className="h-4 w-4 text-rose-500" />
                <span>
                  {isNe ? `भेटिएका जोखिम बुँदाहरू (${report.redFlags.length})` : `Red Flags & Hidden Risks (${report.redFlags.length})`}
                </span>
              </span>
              <button
                type="button"
                onClick={() =>
                  exportContractRiskPdf({
                    docTitle: report.docTitle,
                    safetyScore: report.safetyScore,
                    riskLevel: report.riskLevel,
                    plainSummary: report.plainSummary,
                    redFlags: report.redFlags,
                    missingProtections: report.missingProtections,
                    questionsToAsk: report.questionsToAsk,
                  })
                }
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                <span>{isNe ? 'रिपोर्ट PDF' : 'Save PDF'}</span>
              </button>
            </div>

            {report.redFlags.length === 0 ? (
              <div className={`p-4 rounded-xl border text-xs flex items-center gap-2 ${
                isDark ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200' : 'border-emerald-300 bg-emerald-50 text-emerald-900'
              }`}>
                <ShieldCheck className="h-5 w-5 shrink-0" />
                <span>{isNe ? 'कुनै गम्भीर एकतर्फी जोखिम बुँदा भेटिएन।' : 'No major high-risk trap clauses detected.'}</span>
              </div>
            ) : (
              <div className="space-y-3">
                {report.redFlags.map((flag) => (
                  <div
                    key={flag.id}
                    className={`p-3.5 rounded-xl border ${
                      isDark ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-slate-50'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                      <span className={`text-xs sm:text-sm font-bold ${isDark ? 'text-white' : 'text-slate-950'}`}>
                        {flag.title}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                        flag.severity === 'high'
                          ? isDark ? 'bg-rose-500/20 text-rose-200' : 'bg-rose-100 text-rose-800'
                          : isDark ? 'bg-amber-500/20 text-amber-200' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {flag.severity === 'high' ? (isNe ? 'गम्भीर' : 'High Risk') : (isNe ? 'सचेत' : 'Medium')}
                      </span>
                    </div>
                    <p className={`text-xs mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      {flag.whyRisky}
                    </p>
                    <div className={`p-2.5 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                      isDark ? 'border-cyan-500/30 bg-cyan-500/10' : 'border-cyan-200 bg-cyan-50'
                    }`}>
                      <p className={`text-xs font-medium ${isDark ? 'text-cyan-100' : 'text-cyan-950'}`}>
                        <strong>{isNe ? 'सुरक्षित विकल्प: ' : 'Safer Rewrite: '}</strong>
                        {flag.saferRewrite}
                      </p>
                      <button
                        type="button"
                        onClick={() => copyText(flag.saferRewrite, isNe ? 'सुरक्षित वाक्य कपी भयो' : 'Safer clause copied')}
                        className={`px-2.5 py-1 rounded-lg border text-xs font-bold flex items-center gap-1 shrink-0 cursor-pointer ${
                          isDark ? 'border-cyan-400/40 bg-cyan-950/50 text-cyan-200 hover:bg-cyan-900' : 'border-cyan-600 bg-white text-cyan-900 hover:bg-cyan-100'
                        }`}
                      >
                        <Copy className="h-3 w-3" />
                        <span>{isNe ? 'कपी' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Missing Protections & Polite Questions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              {report.missingProtections.length > 0 && (
                <div className={`p-3.5 rounded-xl border ${isDark ? 'border-amber-500/30 bg-amber-500/5' : 'border-amber-300 bg-amber-50/70'}`}>
                  <span className={`text-xs font-bold flex items-center gap-1.5 mb-2 ${isDark ? 'text-amber-300' : 'text-amber-900'}`}>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>{isNe ? 'हस्ताक्षर अघि थप्नैपर्ने बुँदा' : 'Missing Before Signing'}</span>
                  </span>
                  <ul className="space-y-1.5 text-xs">
                    {report.missingProtections.map((m, i) => (
                      <li key={i} className={`leading-relaxed ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                        • {m}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {report.questionsToAsk.length > 0 && (
                <div className={`p-3.5 rounded-xl border ${isDark ? 'border-cyan-500/30 bg-cyan-500/5' : 'border-cyan-300 bg-cyan-50/70'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-bold flex items-center gap-1.5 ${isDark ? 'text-cyan-300' : 'text-cyan-900'}`}>
                      <HelpCircle className="h-4 w-4" />
                      <span>{isNe ? 'सोध्ने ३ सरल प्रश्न' : 'Questions to Ask Politely'}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        copyText(
                          report.questionsToAsk.map((q, i) => `${i + 1}. ${q}`).join('\n'),
                          isNe ? 'प्रश्नहरू कपी भए' : 'Questions copied'
                        )
                      }
                      className={`text-xs font-bold underline cursor-pointer ${isDark ? 'text-cyan-300' : 'text-cyan-800'}`}
                    >
                      {isNe ? 'सबै कपी' : 'Copy All'}
                    </button>
                  </div>
                  <ol className="space-y-1.5 text-xs list-decimal list-inside">
                    {report.questionsToAsk.map((q, i) => (
                      <li key={i} className={`leading-relaxed ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                        {q}
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>

            <p className={`text-xs pt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {isNe
                ? 'नोट: यो जनचेतना र प्रारम्भिक जाँच उपकरण हो। ठूलो रकम वा जग्गा विवादमा कानुन व्यवसायीसँग परामर्श लिनुहोस्।'
                : 'Note: Educational Nepal contract awareness check; consult a licensed advocate for high-value legal filings.'}
            </p>
          </div>
        </ReactiveResultPanel>
      </div>
    </div>
  );
};
