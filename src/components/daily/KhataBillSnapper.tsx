import React, { useState, useEffect } from 'react';
import {
  Camera,
  Upload,
  Sparkles,
  Plus,
  Trash2,
  Download,
  Copy,
  CheckCircle2,
  MessageCircle,
  BookOpen,
  Receipt,
  Users,
  X,
} from 'lucide-react';
import { Language } from '../../types';
import { useToast } from '../../context/ToastContext';
import {
  KhataLedgerMode,
  KhataLedgerRecord,
  KHATA_SAMPLE_NOTES,
  parseHandwrittenKhataText,
  reconcileKhataLedger,
  buildKhataWhatsAppReminder,
  exportKhataCsv,
} from '../../utils/khataEngine';
import { exportKhataLedgerPdf } from '../../utils/pdfExport';

interface KhataBillSnapperProps {
  isDark: boolean;
  language: Language;
}

const STORAGE_KEY = 'nepalai_khata_book_v1';

export const KhataBillSnapper: React.FC<KhataBillSnapperProps> = ({ isDark, language }) => {
  const isNe = language === 'ne';
  const { showToast } = useToast();

  const [ledgerMode, setLedgerMode] = useState<KhataLedgerMode>('udharo_khata');
  const [rawNoteInput, setRawNoteInput] = useState<string>(KHATA_SAMPLE_NOTES[0].rawText);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoMimeType, setPhotoMimeType] = useState<string>('image/jpeg');
  const [photoFileName, setPhotoFileName] = useState<string>('');
  const [isExtracting, setIsExtracting] = useState<boolean>(false);

  const [senderShopName, setSenderShopName] = useState<string>('');
  const [esewaId, setEsewaId] = useState<string>('');

  const [activeRecord, setActiveRecord] = useState<KhataLedgerRecord>(() =>
    parseHandwrittenKhataText(KHATA_SAMPLE_NOTES[0].rawText, {
      ledgerMode: 'udharo_khata',
      language: 'ne',
    })
  );

  const [savedBook, setSavedBook] = useState<KhataLedgerRecord[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore storage errors
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedBook));
    } catch {
      // ignore storage errors
    }
  }, [savedBook]);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 6 * 1024 * 1024) {
      showToast('error', isNe ? 'फोटो धेरै ठूलो छ' : 'Photo Too Large', isNe ? '६ MB भन्दा कम साइजको फोटो छान्नुहोस्।' : 'Please choose a photo under 6 MB.');
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

  const handleExtractLedger = async (overrideText?: string, overrideMode?: KhataLedgerMode) => {
    const textToParse = (overrideText !== undefined ? overrideText : rawNoteInput).trim();
    const targetMode = overrideMode || ledgerMode;

    if (!photoPreview && !textToParse) {
      showToast('info', isNe ? 'फोटो वा विवरण राख्नुहोस्' : 'Add Photo or Bill Note', isNe ? 'बिलको फोटो अपलोड गर्नुहोस् वा तल सूची लेख्नुहोस्।' : 'Upload a bill photo or type/paste items below.');
      return;
    }

    setIsExtracting(true);
    try {
      const response = await fetch('/api/khata-snap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: overrideText !== undefined ? undefined : photoPreview || undefined,
          mimeType: photoMimeType,
          rawText: textToParse,
          ledgerMode: targetMode,
          language,
        }),
      });
      const data = await response.json();
      if (response.ok && data?.ledgerRecord) {
        setActiveRecord(reconcileKhataLedger(data.ledgerRecord));
        showToast(
          'success',
          isNe ? 'हिसाब तयार भयो!' : 'Ledger Extracted cleanly!',
          `${data.ledgerRecord.items?.length || 0} ${isNe ? 'वस्तुहरू निकालियो' : 'items reconciled'} · रू ${Number(data.ledgerRecord.totalNpr || 0).toLocaleString('en-IN')}`
        );
        return;
      }
      throw new Error(data?.error || 'Fallback parse');
    } catch {
      const local = parseHandwrittenKhataText(textToParse, { ledgerMode: targetMode, language });
      setActiveRecord(local);
      showToast(
        'success',
        isNe ? 'हिसाब तयार भयो' : 'Ledger Reconciled',
        `${local.items.length} ${isNe ? 'वस्तुहरू' : 'items'} · रू ${local.totalNpr.toLocaleString('en-IN')}`
      );
    } finally {
      setIsExtracting(false);
    }
  };

  const updateField = <K extends keyof KhataLedgerRecord>(field: K, value: KhataLedgerRecord[K]) => {
    setActiveRecord((prev) => reconcileKhataLedger({ ...prev, [field]: value }));
  };

  const updateItem = (itemId: string, patch: Partial<{ name: string; qty: string; amountNpr: number }>) => {
    setActiveRecord((prev) =>
      reconcileKhataLedger({
        ...prev,
        items: prev.items.map((item) => (item.id === itemId ? { ...item, ...patch } : item)),
      })
    );
  };

  const addEmptyItem = () => {
    setActiveRecord((prev) =>
      reconcileKhataLedger({
        ...prev,
        items: [
          ...prev.items,
          { id: `item_${Date.now()}`, name: isNe ? 'नयाँ सामान' : 'New Item', qty: '1', rateNpr: 0, amountNpr: 0 },
        ],
      })
    );
  };

  const removeItem = (itemId: string) => {
    setActiveRecord((prev) =>
      reconcileKhataLedger({
        ...prev,
        items: prev.items.filter((item) => item.id !== itemId),
      })
    );
  };

  const handleSaveToBook = () => {
    const clean = reconcileKhataLedger(activeRecord);
    setSavedBook((prev) => {
      const existingIdx = prev.findIndex((r) => r.id === clean.id);
      if (existingIdx >= 0) {
        const next = [...prev];
        next[existingIdx] = clean;
        return next;
      }
      return [clean, ...prev].slice(0, 30);
    });
    showToast('success', isNe ? 'खातामा सेभ भयो' : 'Saved to Khata Book', `${clean.shopOrPartyName} · ${isNe ? 'बाँकी' : 'Due'} रू ${clean.dueNpr.toLocaleString('en-IN')}`);
  };

  const handleMarkSettled = (recordId: string) => {
    setSavedBook((prev) =>
      prev.map((rec) =>
        rec.id === recordId
          ? reconcileKhataLedger({ ...rec, paidNpr: rec.totalNpr })
          : rec
      )
    );
    if (activeRecord.id === recordId) {
      updateField('paidNpr', activeRecord.totalNpr);
    }
    showToast('success', isNe ? 'हिसाब चुक्ता भयो!' : 'Marked as Paid / Settled');
  };

  const handleDownloadCsv = (recordsToExport: KhataLedgerRecord[]) => {
    const csv = exportKhataCsv(recordsToExport);
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `NepalAI_Khata_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showToast('success', isNe ? 'CSV डाउनलोड भयो' : 'CSV Exported');
  };

  const reminder = buildKhataWhatsAppReminder({
    record: activeRecord,
    senderShopName,
    esewaOrFonepayId: esewaId,
    language,
  });

  const handleCopyReminder = async () => {
    try {
      await navigator.clipboard.writeText(reminder.message);
      showToast('success', isNe ? 'सन्देश कपी भयो' : 'Reminder Message Copied');
    } catch {
      showToast('error', 'Clipboard unavailable');
    }
  };

  const totalPendingDue = savedBook.reduce((sum, rec) => sum + (rec.dueNpr || 0), 0);
  const splitPeople = Math.max(1, Number(activeRecord.splitCount || 1));
  const perPersonShare = Math.ceil((activeRecord.dueNpr > 0 ? activeRecord.dueNpr : activeRecord.totalNpr) / splitPeople);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-slate-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className={`text-base sm:text-lg font-bold font-display flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-950'}`}>
            <Receipt className="h-5 w-5 text-emerald-500 shrink-0" />
            <span>{isNe ? 'हस्तलिखित बिल र उधारो खाता स्क्यानर (Photo → Ledger)' : 'Handwritten Bill & Udharo Khata Snapper'}</span>
          </h3>
          <p className={`text-xs sm:text-sm mt-0.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            {isNe
              ? 'कागजको बिल वा उधारो कापीको फोटो खिच्नुहोस् — साफ हिसाब, WhatsApp रिमाइन्डर, Excel (CSV) र PDF तुरुन्तै बनाउनुहोस्।'
              : 'Snap a photo of any handwritten paper bill or shop udharo notebook to get a clean digital ledger, WhatsApp reminder & PDF.'}
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: 'udharo_khata' as KhataLedgerMode, label: isNe ? 'उधारो खाता' : 'Udharo Khata' },
            { id: 'grocery_bill' as KhataLedgerMode, label: isNe ? 'घर खर्च / बिल' : 'Grocery Bill' },
            { id: 'roommate_split' as KhataLedgerMode, label: isNe ? 'खर्च बाँडफाँट' : 'Split Bill' },
          ].map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => {
                setLedgerMode(m.id);
                updateField('ledgerMode', m.id);
              }}
              className={`min-h-[36px] px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer whitespace-nowrap ${
                ledgerMode === m.id
                  ? 'bg-emerald-600 border-emerald-600 text-white'
                  : isDark
                  ? 'border-white/15 bg-white/5 text-slate-200 hover:bg-white/10'
                  : 'border-slate-300 bg-white text-slate-800 hover:bg-slate-100'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Photo / Sample / Note Input */}
        <div className="lg:col-span-5 space-y-4">
          {/* Camera / Upload Dropzone */}
          <div className={`p-4 rounded-2xl border ${isDark ? 'bg-[#080d1a] border-white/15' : 'bg-white border-slate-300 shadow-xs'}`}>
            <div className="flex items-center justify-between mb-3">
              <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-emerald-300' : 'text-emerald-800'}`}>
                {isNe ? '१. बिल वा कापीको फोटो छान्नुहोस्' : '1. Snap or Upload Bill Photo'}
              </span>
              {photoPreview && (
                <button
                  type="button"
                  onClick={() => {
                    setPhotoPreview(null);
                    setPhotoFileName('');
                  }}
                  className={`text-xs font-semibold flex items-center gap-1 cursor-pointer ${isDark ? 'text-rose-300 hover:text-rose-200' : 'text-rose-700 hover:text-rose-800'}`}
                >
                  <X className="h-3.5 w-3.5" />
                  <span>{isNe ? 'हटाउनुहोस्' : 'Clear'}</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <label className={`min-h-[44px] px-3 py-2.5 rounded-xl border border-dashed flex items-center justify-center gap-2 text-xs font-bold cursor-pointer transition-colors ${
                isDark
                  ? 'border-emerald-500/50 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-200'
                  : 'border-emerald-600 bg-emerald-50 hover:bg-emerald-100 text-emerald-900'
              }`}>
                <Camera className="h-4 w-4 shrink-0" />
                <span>{isNe ? 'फोटो खिच्नुहोस्' : 'Take Photo'}</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotoSelect}
                  className="hidden"
                />
              </label>

              <label className={`min-h-[44px] px-3 py-2.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold cursor-pointer transition-colors ${
                isDark
                  ? 'border-white/15 bg-white/5 hover:bg-white/10 text-slate-100'
                  : 'border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-900'
              }`}>
                <Upload className="h-4 w-4 shrink-0" />
                <span>{isNe ? 'ग्यालरीबाट छान्नुहोस्' : 'Upload File'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoSelect}
                  className="hidden"
                />
              </label>
            </div>

            {photoPreview && (
              <div className={`mt-3 p-2.5 rounded-xl border flex items-center gap-3 ${isDark ? 'border-white/15 bg-white/[0.03]' : 'border-slate-200 bg-slate-50'}`}>
                <img
                  src={photoPreview}
                  alt="Uploaded bill preview"
                  className="h-16 w-16 object-cover rounded-lg border border-slate-500/30 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className={`text-xs font-bold truncate ${isDark ? 'text-white' : 'text-slate-950'}`}>{photoFileName || 'Bill Image'}</p>
                  <p className={`text-xs mt-0.5 ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>
                    {isNe ? 'फोटो तयार छ — तल बटन थिच्नुहोस्' : 'Ready for Vision OCR extraction'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* 1-Tap Samples */}
          <div className={`p-4 rounded-2xl border ${isDark ? 'bg-[#080d1a] border-white/15' : 'bg-white border-slate-300 shadow-xs'}`}>
            <span className={`text-xs font-bold block mb-2 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
              {isNe ? '२. नमुना बिल परीक्षण गर्नुहोस् (१-क्लिक)' : '2. Try 1-Tap Nepal Samples'}
            </span>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {KHATA_SAMPLE_NOTES.map((sample) => (
                <button
                  key={sample.id}
                  type="button"
                  onClick={() => {
                    setPhotoPreview(null);
                    setPhotoFileName('');
                    setLedgerMode(sample.ledgerMode);
                    setRawNoteInput(sample.rawText);
                    handleExtractLedger(sample.rawText, sample.ledgerMode);
                  }}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                    isDark
                      ? 'border-white/15 bg-white/5 hover:bg-emerald-500/15 text-slate-200 hover:text-white'
                      : 'border-slate-300 bg-slate-50 hover:bg-emerald-50 text-slate-800'
                  }`}
                >
                  {isNe ? sample.labelNe : sample.labelEn}
                </button>
              ))}
            </div>

            <label className={`text-xs font-semibold block mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              {isNe ? 'वा हस्तलिखित सूची / WhatsApp नोट पेस्ट गर्नुहोस्:' : 'Or type/paste rough Nepali or English bill list:'}
            </label>
            <textarea
              rows={6}
              value={rawNoteInput}
              onChange={(e) => setRawNoteInput(e.target.value)}
              placeholder={isNe ? 'उदाहरण:\nचामल १ बोरा - २७५०\nचिनी २ केजी - २२०\nतिरेको: १०००' : 'e.g.\nChamal 25kg - 2750\nTel 2 ltr - 680\nPaid: 1000'}
              className={`w-full rounded-xl border p-3 text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                isDark
                  ? 'bg-[#060913] border-white/15 text-slate-100 placeholder:text-slate-500'
                  : 'bg-slate-50 border-slate-300 text-slate-950 placeholder:text-slate-500'
              }`}
            />

            <button
              type="button"
              onClick={() => handleExtractLedger()}
              disabled={isExtracting}
              className="mt-3 w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Sparkles className={`h-4 w-4 ${isExtracting ? 'animate-spin' : ''}`} />
              <span>
                {isExtracting
                  ? isNe ? 'हिसाब निकाल्दैछ...' : 'Reading Bill...'
                  : isNe ? 'साफ डिजिटल खाता बनाउनुहोस्' : 'Extract & Build Clean Ledger'}
              </span>
            </button>
          </div>
        </div>

        {/* Right: Clean Editable Ledger & Actions */}
        <div className="lg:col-span-7 space-y-4">
          <div className={`p-4 sm:p-5 rounded-2xl border ${isDark ? 'bg-[#060a14] border-white/15' : 'bg-white border-slate-300 shadow-xs'}`}>
            {/* Party & Payment Settings */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pb-4 border-b border-slate-500/20">
              <div>
                <label className={`text-xs font-semibold block mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  {isNe ? 'ग्राहक / पसलको नाम' : 'Customer / Shop Name'}
                </label>
                <input
                  type="text"
                  value={activeRecord.shopOrPartyName}
                  onChange={(e) => updateField('shopOrPartyName', e.target.value)}
                  className={`w-full min-h-[40px] px-3 py-1.5 rounded-xl border text-xs sm:text-sm font-semibold ${
                    isDark ? 'bg-white/5 border-white/15 text-white' : 'bg-slate-50 border-slate-300 text-slate-950'
                  }`}
                />
              </div>
              <div>
                <label className={`text-xs font-semibold block mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  {isNe ? 'मोबाइल नं. (WhatsApp)' : 'Phone (for WhatsApp)'}
                </label>
                <input
                  type="text"
                  value={activeRecord.phone}
                  placeholder="98XXXXXXXX"
                  onChange={(e) => updateField('phone', e.target.value)}
                  className={`w-full min-h-[40px] px-3 py-1.5 rounded-xl border text-xs sm:text-sm font-mono ${
                    isDark ? 'bg-white/5 border-white/15 text-white placeholder:text-slate-500' : 'bg-slate-50 border-slate-300 text-slate-950 placeholder:text-slate-400'
                  }`}
                />
              </div>
              <div>
                <label className={`text-xs font-semibold block mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  {isNe ? 'मिति (B.S.)' : 'Date (B.S.)'}
                </label>
                <input
                  type="text"
                  value={activeRecord.billDateBs}
                  onChange={(e) => updateField('billDateBs', e.target.value)}
                  className={`w-full min-h-[40px] px-3 py-1.5 rounded-xl border text-xs sm:text-sm font-mono ${
                    isDark ? 'bg-white/5 border-white/15 text-white' : 'bg-slate-50 border-slate-300 text-slate-950'
                  }`}
                />
              </div>
            </div>

            {/* Editable Line Items Table */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-bold ${isDark ? 'text-emerald-300' : 'text-emerald-800'}`}>
                  {isNe ? `सामान विवरण (${activeRecord.items.length})` : `Extracted Line Items (${activeRecord.items.length})`}
                </span>
                <button
                  type="button"
                  onClick={addEmptyItem}
                  className={`px-2.5 py-1 rounded-lg border text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                    isDark
                      ? 'border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-200'
                      : 'border-emerald-600 bg-emerald-50 hover:bg-emerald-100 text-emerald-900'
                  }`}
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>{isNe ? 'सामान थप्नुहोस्' : 'Add Row'}</span>
                </button>
              </div>

              <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                {activeRecord.items.map((item) => (
                  <div
                    key={item.id}
                    className={`grid grid-cols-12 gap-2 items-center p-2 rounded-xl border ${
                      isDark ? 'border-white/10 bg-white/[0.02]' : 'border-slate-200 bg-slate-50'
                    }`}
                  >
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => updateItem(item.id, { name: e.target.value })}
                      aria-label="Item name"
                      className={`col-span-5 px-2.5 py-1.5 rounded-lg border text-xs font-medium ${
                        isDark ? 'bg-[#080d1a] border-white/10 text-white' : 'bg-white border-slate-300 text-slate-950'
                      }`}
                    />
                    <input
                      type="text"
                      value={item.qty}
                      onChange={(e) => updateItem(item.id, { qty: e.target.value })}
                      aria-label="Quantity"
                      className={`col-span-3 px-2 py-1.5 rounded-lg border text-xs font-mono text-center ${
                        isDark ? 'bg-[#080d1a] border-white/10 text-slate-200' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    />
                    <input
                      type="number"
                      value={item.amountNpr}
                      onChange={(e) => updateItem(item.id, { amountNpr: Number(e.target.value) || 0 })}
                      aria-label="Amount NPR"
                      className={`col-span-3 px-2 py-1.5 rounded-lg border text-xs font-mono font-bold text-right ${
                        isDark ? 'bg-[#080d1a] border-white/10 text-emerald-300' : 'bg-white border-slate-300 text-emerald-900'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      aria-label="Remove item"
                      className={`col-span-1 flex items-center justify-center p-1.5 rounded-lg cursor-pointer transition-colors ${
                        isDark ? 'text-slate-400 hover:text-rose-300 hover:bg-rose-500/10' : 'text-slate-500 hover:text-rose-700 hover:bg-rose-50'
                      }`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary KPI Bar (Total / Paid / Due) */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className={`p-3 rounded-xl border ${isDark ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-slate-50'}`}>
                <span className={`text-xs block ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  {isNe ? 'कुल जम्मा (Total)' : 'Grand Total'}
                </span>
                <span className={`text-lg font-extrabold font-mono ${isDark ? 'text-white' : 'text-slate-950'}`}>
                  रू {activeRecord.totalNpr.toLocaleString('en-IN')}
                </span>
              </div>

              <div className={`p-3 rounded-xl border ${isDark ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-slate-50'}`}>
                <label className={`text-xs block mb-0.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  {isNe ? 'बुझाएको (Paid NPR)' : 'Paid Amount (NPR)'}
                </label>
                <input
                  type="number"
                  value={activeRecord.paidNpr}
                  onChange={(e) => updateField('paidNpr', Math.max(0, Number(e.target.value) || 0))}
                  className={`w-full px-2.5 py-1 rounded-lg border text-sm font-bold font-mono ${
                    isDark ? 'bg-[#080d1a] border-white/15 text-cyan-300' : 'bg-white border-slate-300 text-cyan-900'
                  }`}
                />
              </div>

              <div className={`p-3 rounded-xl border ${
                activeRecord.dueNpr > 0
                  ? isDark ? 'border-amber-500/40 bg-amber-500/10' : 'border-amber-400 bg-amber-50'
                  : isDark ? 'border-emerald-500/40 bg-emerald-500/10' : 'border-emerald-400 bg-emerald-50'
              }`}>
                <span className={`text-xs font-bold block ${
                  activeRecord.dueNpr > 0
                    ? isDark ? 'text-amber-300' : 'text-amber-900'
                    : isDark ? 'text-emerald-300' : 'text-emerald-900'
                }`}>
                  {activeRecord.dueNpr > 0 ? (isNe ? 'बाँकी उधारो (Due)' : 'Balance Due') : (isNe ? 'हिसाब चुक्ता!' : 'Settled')}
                </span>
                <span className={`text-lg font-extrabold font-mono ${
                  activeRecord.dueNpr > 0
                    ? isDark ? 'text-amber-200' : 'text-amber-950'
                    : isDark ? 'text-emerald-200' : 'text-emerald-950'
                }`}>
                  रू {activeRecord.dueNpr.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Optional Roommate Split Helper */}
            {ledgerMode === 'roommate_split' && (
              <div className={`mt-3 p-3 rounded-xl border flex flex-wrap items-center justify-between gap-3 ${
                isDark ? 'border-cyan-500/30 bg-cyan-500/10' : 'border-cyan-300 bg-cyan-50'
              }`}>
                <div className="flex items-center gap-2">
                  <Users className={`h-4 w-4 ${isDark ? 'text-cyan-300' : 'text-cyan-700'}`} />
                  <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-950'}`}>
                    {isNe ? 'कति जनामा बाँड्ने?' : 'Split Among People:'}
                  </span>
                  <input
                    type="number"
                    min={1}
                    max={25}
                    value={splitPeople}
                    onChange={(e) => updateField('splitCount', Math.max(1, Number(e.target.value) || 1))}
                    className={`w-16 px-2 py-1 rounded-lg border text-xs font-bold text-center ${
                      isDark ? 'bg-[#080d1a] border-white/15 text-white' : 'bg-white border-slate-300 text-slate-950'
                    }`}
                  />
                </div>
                <span className={`text-xs sm:text-sm font-extrabold font-mono ${isDark ? 'text-cyan-200' : 'text-cyan-900'}`}>
                  {isNe ? 'प्रति व्यक्ति:' : 'Per Person:'} रू {perPersonShare.toLocaleString('en-IN')}
                </span>
              </div>
            )}

            {/* Optional Shop Name & eSewa/FonePay ID for WhatsApp Reminder */}
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <input
                type="text"
                value={senderShopName}
                onChange={(e) => setSenderShopName(e.target.value)}
                placeholder={isNe ? 'तपाईंको पसल / नाम (ऐच्छिक)' : 'Your Shop / Name (optional)'}
                className={`px-3 py-2 rounded-xl border text-xs ${
                  isDark ? 'bg-white/5 border-white/15 text-white placeholder:text-slate-500' : 'bg-slate-50 border-slate-300 text-slate-950 placeholder:text-slate-500'
                }`}
              />
              <input
                type="text"
                value={esewaId}
                onChange={(e) => setEsewaId(e.target.value)}
                placeholder={isNe ? 'eSewa / FonePay नं. (ऐच्छिक)' : 'eSewa / Khalti / FonePay ID (optional)'}
                className={`px-3 py-2 rounded-xl border text-xs font-mono ${
                  isDark ? 'bg-white/5 border-white/15 text-white placeholder:text-slate-500' : 'bg-slate-50 border-slate-300 text-slate-950 placeholder:text-slate-500'
                }`}
              />
            </div>

            {/* Action Buttons Row */}
            <div className="mt-4 pt-3 border-t border-slate-500/20 flex flex-wrap gap-2">
              <a
                href={reminder.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[42px] px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors whitespace-nowrap"
              >
                <MessageCircle className="h-4 w-4" />
                <span>{isNe ? 'WhatsApp रिमाइन्डर पठाउनुहोस्' : 'Send WhatsApp Reminder'}</span>
              </a>

              <button
                type="button"
                onClick={handleCopyReminder}
                className={`min-h-[42px] px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                  isDark ? 'border-white/15 bg-white/5 hover:bg-white/10 text-slate-100' : 'border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-900'
                }`}
              >
                <Copy className="h-4 w-4" />
                <span>{isNe ? 'कपी' : 'Copy'}</span>
              </button>

              <button
                type="button"
                onClick={handleSaveToBook}
                className={`min-h-[42px] px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                  isDark ? 'border-cyan-500/40 bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-200' : 'border-cyan-600 bg-cyan-50 hover:bg-cyan-100 text-cyan-900'
                }`}
              >
                <BookOpen className="h-4 w-4" />
                <span>{isNe ? 'खातामा सेभ गर्नुहोस्' : 'Save to Khata Book'}</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  exportKhataLedgerPdf({
                    shopOrPartyName: activeRecord.shopOrPartyName,
                    phone: activeRecord.phone,
                    billDateBs: activeRecord.billDateBs,
                    items: activeRecord.items,
                    totalNpr: activeRecord.totalNpr,
                    paidNpr: activeRecord.paidNpr,
                    dueNpr: activeRecord.dueNpr,
                    senderShopName,
                    esewaId,
                  })
                }
                className="min-h-[42px] px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>{isNe ? 'PDF सेभ' : 'Save PDF'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleDownloadCsv([activeRecord])}
                className={`min-h-[42px] px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                  isDark ? 'border-white/15 bg-white/5 hover:bg-white/10 text-slate-200' : 'border-slate-300 bg-white hover:bg-slate-100 text-slate-800'
                }`}
              >
                <Download className="h-4 w-4" />
                <span>CSV</span>
              </button>
            </div>
          </div>

          {/* Saved Khata Book Summary */}
          {savedBook.length > 0 && (
            <div className={`p-4 rounded-2xl border ${isDark ? 'bg-[#080d1a] border-white/15' : 'bg-white border-slate-300 shadow-xs'}`}>
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-500/20">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-emerald-500" />
                  <span className={`text-xs sm:text-sm font-bold ${isDark ? 'text-white' : 'text-slate-950'}`}>
                    {isNe ? `मेरो सेभ गरिएको खाता (${savedBook.length})` : `My Saved Khata Book (${savedBook.length})`}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-bold font-mono ${isDark ? 'text-amber-300' : 'text-amber-800'}`}>
                    {isNe ? 'कुल बाँकी:' : 'Total Pending:'} रू {totalPendingDue.toLocaleString('en-IN')}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDownloadCsv(savedBook)}
                    className={`px-2.5 py-1 rounded-lg border text-xs font-semibold cursor-pointer ${
                      isDark ? 'border-white/15 text-slate-200 hover:bg-white/10' : 'border-slate-300 text-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    {isNe ? 'सबै CSV' : 'Export All CSV'}
                  </button>
                </div>
              </div>

              <div className="mt-3 space-y-2 max-h-[180px] overflow-y-auto">
                {savedBook.map((rec) => (
                  <div
                    key={rec.id}
                    className={`flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl border text-xs ${
                      isDark ? 'border-white/10 bg-white/[0.02]' : 'border-slate-200 bg-slate-50'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setActiveRecord(rec);
                        setLedgerMode(rec.ledgerMode);
                      }}
                      className="text-left cursor-pointer min-w-0 flex-1"
                    >
                      <span className={`font-bold block truncate ${isDark ? 'text-white' : 'text-slate-950'}`}>
                        {rec.shopOrPartyName}
                      </span>
                      <span className={`text-xs font-mono ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                        {rec.billDateBs} · {rec.items.length} items · Total रू {rec.totalNpr.toLocaleString('en-IN')}
                      </span>
                    </button>

                    <div className="flex items-center gap-2">
                      <span className={`font-mono font-bold px-2 py-0.5 rounded ${
                        rec.dueNpr > 0
                          ? isDark ? 'bg-amber-500/20 text-amber-200' : 'bg-amber-100 text-amber-900'
                          : isDark ? 'bg-emerald-500/20 text-emerald-200' : 'bg-emerald-100 text-emerald-900'
                      }`}>
                        {rec.dueNpr > 0 ? `Due रू ${rec.dueNpr.toLocaleString('en-IN')}` : 'Paid'}
                      </span>
                      {rec.dueNpr > 0 && (
                        <button
                          type="button"
                          onClick={() => handleMarkSettled(rec.id)}
                          className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>{isNe ? 'चुक्ता' : 'Settle'}</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setSavedBook((prev) => prev.filter((item) => item.id !== rec.id))}
                        aria-label="Delete saved khata entry"
                        className={`p-1 rounded cursor-pointer ${isDark ? 'text-slate-400 hover:text-rose-300' : 'text-slate-500 hover:text-rose-700'}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
