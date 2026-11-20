import React, { useState, useEffect, useCallback } from 'react';
import { 
  Coins, 
  Scale, 
  TrendingUp, 
  ShieldCheck, 
  Copy, 
  Check, 
  Sparkles, 
  Info, 
  Percent, 
  AlertCircle, 
  Layers, 
  Clock,
  ArrowRightLeft,
  RefreshCw,
  Printer
} from 'lucide-react';
import { ThemeMode, Language } from '../../types';
import { 
  BullionType,
  DEFAULT_FENEGOSIDA_RATES,
  calculateJewelryCost,
  convertGramsToTolaBreakdown,
  convertTolaAanaLalToGrams,
  simulateGoldInvestment
} from '../../utils/nepalBullionCalculator';
import { exportBullionQuotePdf } from '../../utils/pdfExport';

export interface BullionJewelryTerminalProps {
  theme?: ThemeMode;
  language?: Language;
}

export const BullionJewelryTerminal: React.FC<BullionJewelryTerminalProps> = ({
  theme = 'dark',
  language = 'en',
}) => {
  const isDark = theme === 'dark';
  const isNe = language === 'ne';

  // Sub-tabs: 'purchase' | 'investment' | 'converter'
  const [subTab, setSubTab] = useState<'purchase' | 'investment' | 'converter'>('purchase');

  // Purchase State
  const [bullionType, setBullionType] = useState<BullionType>('chhapawal_gold');
  const [inputMode, setInputMode] = useState<'tola_aana_lal' | 'grams'>('tola_aana_lal');
  const [tola, setTola] = useState<number>(1);
  const [aana, setAana] = useState<number>(0);
  const [lal, setLal] = useState<number>(0);
  const [grams, setGrams] = useState<number>(11.664);
  const [customRate, setCustomRate] = useState<number>(DEFAULT_FENEGOSIDA_RATES.chhapawalGoldPerTola);
  const [liveRates, setLiveRates] = useState({
    chhapawalGoldPerTola: DEFAULT_FENEGOSIDA_RATES.chhapawalGoldPerTola,
    tejabiGoldPerTola: DEFAULT_FENEGOSIDA_RATES.tejabiGoldPerTola,
    silverPerTola: DEFAULT_FENEGOSIDA_RATES.silverPerTola,
    deltaChhapawalPerTola: 0,
    deltaSilverPerTola: 0,
    publishedAt: '',
    isLive: false,
  });
  const [isSyncingBullion, setIsSyncingBullion] = useState(false);

  const syncFenegosidaRates = useCallback(async (forceRefresh = false, activeType: BullionType = bullionType) => {
    setIsSyncingBullion(true);
    try {
      const res = await fetch(`/api/bullion/fenegosida${forceRefresh ? '?refresh=1' : ''}`);
      if (res.ok) {
        const data = await res.json();
        if (data?.rates) {
          const next = {
            chhapawalGoldPerTola: Number(data.rates.chhapawalGoldPerTola) || DEFAULT_FENEGOSIDA_RATES.chhapawalGoldPerTola,
            tejabiGoldPerTola: Number(data.rates.tejabiGoldPerTola) || DEFAULT_FENEGOSIDA_RATES.tejabiGoldPerTola,
            silverPerTola: Number(data.rates.silverPerTola) || DEFAULT_FENEGOSIDA_RATES.silverPerTola,
            deltaChhapawalPerTola: Number(data.rates.deltaChhapawalPerTola) || 0,
            deltaSilverPerTola: Number(data.rates.deltaSilverPerTola) || 0,
            publishedAt: data.publishedAt || '',
            isLive: Boolean(data.live),
          };
          setLiveRates(next);
          if (activeType === 'chhapawal_gold') setCustomRate(next.chhapawalGoldPerTola);
          else if (activeType === 'tejabi_gold') setCustomRate(next.tejabiGoldPerTola);
          else setCustomRate(next.silverPerTola);
        }
      }
    } catch {
      // Retain benchmark rates
    } finally {
      setIsSyncingBullion(false);
    }
  }, [bullionType]);

  useEffect(() => {
    syncFenegosidaRates(false, 'chhapawal_gold');
  }, []);

  // Making charges & wastage
  const [makingChargeType, setMakingChargeType] = useState<'flat_per_tola' | 'total_flat' | 'percentage'>('flat_per_tola');
  const [makingChargeValue, setMakingChargeValue] = useState<number>(5000);
  const [wastagePercent, setWastagePercent] = useState<number>(2.5);

  // Taxes
  const [includeLuxuryTax, setIncludeLuxuryTax] = useState<boolean>(false);
  const [includeVat, setIncludeVat] = useState<boolean>(false);
  const [copiedQuotation, setCopiedQuotation] = useState<boolean>(false);

  // Investment Simulator State
  const [investType, setInvestType] = useState<'lump_sum' | 'monthly_sip'>('monthly_sip');
  const [investAmount, setInvestAmount] = useState<number>(10000);
  const [investYears, setInvestYears] = useState<1 | 3 | 5 | 10>(5);

  // Weight Matrix State
  const [convGrams, setConvGrams] = useState<number>(11.664);

  // Sync custom rate when metal changes
  const handleBullionTypeChange = (type: BullionType) => {
    setBullionType(type);
    if (type === 'chhapawal_gold') {
      setCustomRate(liveRates.chhapawalGoldPerTola);
    } else if (type === 'tejabi_gold') {
      setCustomRate(liveRates.tejabiGoldPerTola);
    } else {
      setCustomRate(liveRates.silverPerTola);
      if (makingChargeValue > 2000) setMakingChargeValue(300);
    }
  };

  // Perform purchase calculation
  const purchaseResult = calculateJewelryCost({
    bullionType,
    inputMode,
    tola,
    aana,
    lal,
    grams,
    customRatePerTola: customRate,
    makingChargeType,
    makingChargeValue,
    wastagePercent,
    includeLuxuryTax,
    includeVat,
  });

  // Perform investment simulation
  const investResult = simulateGoldInvestment({
    investmentType: investType,
    amountNpr: investAmount,
    durationYears: investYears,
  }, customRate);

  const handleCopyQuotation = () => {
    const metalLabel = bullionType === 'chhapawal_gold' 
      ? 'Chhapawal Gold 24K (छापावाल सुन)' 
      : bullionType === 'tejabi_gold' 
      ? 'Tejabi Gold 22K (तेजाबी सुन)' 
      : 'Fine Silver (चाँदी)';

    const text = `
=== NEPALAI JEWELRY PURCHASE QUOTATION AUDIT ===
Metal: ${metalLabel}
Rate per Tola: रू ${purchaseResult.ratePerTola.toLocaleString()}
Rate per 10g: रू ${purchaseResult.ratePer10Gram.toLocaleString()}

[WEIGHT SPECIFICATION]
Pure Net Weight: ${purchaseResult.pureWeightFormattedEn} (${purchaseResult.pureWeightGrams} g)
Wastage (जर्ती @ ${wastagePercent}%): +${purchaseResult.wastageWeightGrams} g (रू ${purchaseResult.wastageCostNpr.toLocaleString()})
Total Billed Weight: ${purchaseResult.totalBilledWeightGrams} g (${purchaseResult.totalBilledWeightTolas} Tolas)

[FINANCIAL BREAKDOWN]
Raw Bullion Cost: रू ${purchaseResult.rawMetalCostNpr.toLocaleString()}
Metal + Wastage: रू ${purchaseResult.metalWithWastageCostNpr.toLocaleString()}
Making Charge (ज्याला): रू ${purchaseResult.makingChargeNpr.toLocaleString()}
${includeLuxuryTax ? `Luxury Tax (2%): रू ${purchaseResult.luxuryTaxNpr.toLocaleString()}\n` : ''}${includeVat ? `VAT (13%): रू ${purchaseResult.vatNpr.toLocaleString()}\n` : ''}FINAL PAYABLE AMOUNT: रू ${purchaseResult.finalTotalNpr.toLocaleString()}

Customer Markup over Raw Metal: +${purchaseResult.markupPercentageOverRawMetal}%
Effective Cost per Gram: रू ${purchaseResult.effectivePerGramCostNpr.toLocaleString()}/g
Verified via NepalAI Sovereign Bullion Terminal (FENEGOSIDA Standard)
https://nepalai.tech/#daily-tools
    `.trim();

    navigator.clipboard.writeText(text);
    setCopiedQuotation(true);
    setTimeout(() => setCopiedQuotation(false), 2000);
  };

  const convTolaData = convertGramsToTolaBreakdown(convGrams);
  const convTroyOz = (convGrams / 31.1035).toFixed(4);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border ${
        isDark
          ? 'bg-gradient-to-r from-amber-500/10 via-cyan-500/10 to-transparent border-amber-500/25'
          : 'bg-gradient-to-r from-amber-50 via-cyan-50/70 to-white border-amber-200'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl border ${
            isDark
              ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
              : 'bg-amber-100 text-amber-800 border-amber-300'
          }`}>
            <Coins className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className={`text-lg font-bold font-display ${isDark ? 'text-white' : 'text-slate-950'}`}>
                {isNe ? 'सुन / चाँदी गहना तथा बुलियन टर्मिनल' : 'Gold & Silver Bullion & Jewelry Tax Terminal'}
              </h3>
              <span className={`px-2 py-0.5 rounded-md text-xs font-mono font-semibold border ${
                isDark
                  ? 'bg-amber-500/20 text-amber-200 border-amber-500/35'
                  : 'bg-amber-100 text-amber-900 border-amber-300'
              }`}>
                FENEGOSIDA
              </span>
            </div>
            <p className={`text-xs mt-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              {isNe 
                ? 'तोला, आना, लाल र ग्राम रूपान्तरण, ज्याला र जर्ती अडिट, विलासिता कर तथा १३% भ्याट हिसाब।' 
                : 'FENEGOSIDA daily rates, Tola/Aana/Grams converter, Making charges (ज्याला), Wastage (जर्ती), Luxury Tax & 13% VAT.'}
            </p>
          </div>
        </div>

        {/* Live Daily Benchmarks */}
        <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto text-xs font-mono shrink-0 tabular-nums">
          <div className={`px-3 py-2 rounded-xl border ${
            isDark ? 'bg-slate-950/90 border-white/15' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <span className={`block text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>24K Chhapawal</span>
            <span className={`font-bold ${isDark ? 'text-amber-300' : 'text-amber-800'}`}>
              रू {liveRates.chhapawalGoldPerTola.toLocaleString()}
            </span>
          </div>
          <div className={`px-3 py-2 rounded-xl border ${
            isDark ? 'bg-slate-950/90 border-white/15' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <span className={`block text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>22K Tejabi</span>
            <span className={`font-bold ${isDark ? 'text-amber-200' : 'text-amber-800'}`}>
              रू {liveRates.tejabiGoldPerTola.toLocaleString()}
            </span>
          </div>
          <div className={`px-3 py-2 rounded-xl border ${
            isDark ? 'bg-slate-950/90 border-white/15' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <span className={`block text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Fine Silver</span>
            <span className={`font-bold ${isDark ? 'text-cyan-300' : 'text-cyan-800'}`}>
              रू {liveRates.silverPerTola.toLocaleString()}
            </span>
          </div>
          <button
            type="button"
            onClick={() => syncFenegosidaRates(true)}
            disabled={isSyncingBullion}
            title="Sync latest FENEGOSIDA rates"
            className={`px-2.5 py-2 rounded-xl border flex items-center gap-1 transition-colors cursor-pointer ${
              isDark
                ? 'bg-slate-950/90 border-white/15 text-cyan-300 hover:border-cyan-400/50'
                : 'bg-white border-slate-200 text-cyan-800 hover:bg-slate-50 shadow-xs'
            }`}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isSyncingBullion ? 'animate-spin' : ''}`} />
            <span className="text-[11px] font-sans font-semibold">{liveRates.publishedAt || 'Sync'}</span>
          </button>
        </div>
      </div>

      {/* Sub-Tabs Selector */}
      <div className={`flex items-center gap-2 p-1 rounded-xl border max-w-md ${
        isDark ? 'bg-slate-900/80 border-white/15' : 'bg-slate-100 border-slate-200'
      }`}>
        <button
          type="button"
          onClick={() => setSubTab('purchase')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer min-h-[40px] ${
            subTab === 'purchase'
              ? isDark
                ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/50'
                : 'bg-cyan-700 text-white border border-cyan-700'
              : isDark ? 'text-slate-300 hover:text-white' : 'text-slate-700 hover:text-slate-950'
          }`}
        >
          <Scale className="h-3.5 w-3.5" />
          <span>{isNe ? 'गहना खरिद हिसाब' : 'Jewelry Bill Audit'}</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab('investment')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer min-h-[40px] ${
            subTab === 'investment'
              ? isDark
                ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/50'
                : 'bg-cyan-700 text-white border border-cyan-700'
              : isDark ? 'text-slate-300 hover:text-white' : 'text-slate-700 hover:text-slate-950'
          }`}
        >
          <TrendingUp className="h-3.5 w-3.5" />
          <span>{isNe ? 'लगानी तुलना' : 'Gold vs NEPSE'}</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab('converter')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer min-h-[40px] ${
            subTab === 'converter'
              ? isDark
                ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/50'
                : 'bg-cyan-700 text-white border border-cyan-700'
              : isDark ? 'text-slate-300 hover:text-white' : 'text-slate-700 hover:text-slate-950'
          }`}
        >
          <ArrowRightLeft className="h-3.5 w-3.5" />
          <span>{isNe ? 'तौल रूपान्तरक' : 'Unit Matrix'}</span>
        </button>
      </div>

      {/* SUB-TAB 1: JEWELRY PURCHASE AUDITOR */}
      {subTab === 'purchase' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Form Controls */}
          <div className="lg:col-span-7 space-y-5">
            {/* Metal Selector */}
            <div className={`p-4 rounded-2xl border space-y-3 ${
              isDark ? 'bg-slate-900/60 border-white/15' : 'bg-slate-50 border-slate-200'
            }`}>
              <label className={`text-xs font-semibold block ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                {isNe ? 'धातु छनोट गर्नुहोस् (Metal Selection)' : 'Select Precious Metal'}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  { id: 'chhapawal_gold', label: '24K Chhapawal Gold', sub: '९९.९% छापावाल सुन' },
                  { id: 'tejabi_gold', label: '22K Tejabi Gold', sub: '९१.६% तेजाबी सुन' },
                  { id: 'silver', label: 'Fine Silver', sub: 'चाँदी' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleBullionTypeChange(item.id as BullionType)}
                    className={`p-2.5 rounded-xl border text-left transition-colors cursor-pointer ${
                      bullionType === item.id
                        ? isDark
                          ? 'bg-amber-500/20 border-amber-400/60 text-white'
                          : 'bg-amber-50 border-amber-500 text-slate-950'
                        : isDark
                          ? 'bg-slate-950/70 border-white/15 text-slate-300 hover:text-white'
                          : 'bg-white border-slate-300 text-slate-700 hover:text-slate-950'
                    }`}
                  >
                    <div className={`font-semibold text-xs ${
                      bullionType === item.id
                        ? (isDark ? 'text-amber-300' : 'text-amber-900')
                        : (isDark ? 'text-slate-200' : 'text-slate-900')
                    }`}>{item.label}</div>
                    <div className={`text-xs mt-0.5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{item.sub}</div>
                  </button>
                ))}
              </div>

              {/* Rate per Tola Input */}
              <div className="pt-2">
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className={isDark ? 'text-slate-200' : 'text-slate-700'}>
                    {isNe ? 'दर प्रति तोला (NPR Rate / Tola):' : 'Rate per Tola (NPR):'}
                  </span>
                  <span className={`font-mono text-xs font-semibold tabular-nums ${isDark ? 'text-cyan-300' : 'text-cyan-800'}`}>
                    = रू {Math.round(customRate / 11.664).toLocaleString()} / gram
                  </span>
                </div>
                <div className="relative">
                  <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>रू</span>
                  <input
                    type="number"
                    value={customRate}
                    onChange={(e) => setCustomRate(Math.max(0, Number(e.target.value)))}
                    className={`w-full pl-8 pr-3 py-2.5 rounded-xl text-sm font-mono tabular-nums border focus:outline-hidden focus:ring-2 focus:ring-cyan-500 ${
                      isDark
                        ? 'bg-slate-950 border-white/15 text-white'
                        : 'bg-white border-slate-300 text-slate-950'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Weight Input Box */}
            <div className={`p-4 rounded-2xl border space-y-3 ${
              isDark ? 'bg-slate-900/60 border-white/15' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className={`text-xs font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                  {isNe ? 'तौल प्रविष्टि (Weight Input)' : 'Net Jewelry Weight'}
                </label>
                <div className={`flex items-center gap-1 p-1 rounded-lg border text-xs ${
                  isDark ? 'bg-slate-950 border-white/15' : 'bg-white border-slate-200'
                }`}>
                  <button
                    type="button"
                    onClick={() => setInputMode('tola_aana_lal')}
                    className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                      inputMode === 'tola_aana_lal'
                        ? isDark ? 'bg-cyan-500/20 text-cyan-200 font-semibold' : 'bg-cyan-700 text-white font-semibold'
                        : isDark ? 'text-slate-300 hover:text-white' : 'text-slate-700 hover:text-slate-950'
                    }`}
                  >
                    तोला / आना / लाल
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputMode('grams')}
                    className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                      inputMode === 'grams'
                        ? isDark ? 'bg-cyan-500/20 text-cyan-200 font-semibold' : 'bg-cyan-700 text-white font-semibold'
                        : isDark ? 'text-slate-300 hover:text-white' : 'text-slate-700 hover:text-slate-950'
                    }`}
                  >
                    ग्राम (Grams)
                  </button>
                </div>
              </div>

              {inputMode === 'tola_aana_lal' ? (
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className={`text-xs block mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>तोला (Tola)</label>
                    <input
                      type="number"
                      min="0"
                      value={tola}
                      onChange={(e) => setTola(Math.max(0, Number(e.target.value)))}
                      className={`w-full px-3 py-2 rounded-xl text-sm font-mono tabular-nums border focus:outline-hidden focus:ring-2 focus:ring-cyan-500 ${
                        isDark ? 'bg-slate-950 border-white/15 text-white' : 'bg-white border-slate-300 text-slate-950'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`text-xs block mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>आना (0-15)</label>
                    <input
                      type="number"
                      min="0"
                      max="15"
                      value={aana}
                      onChange={(e) => setAana(Math.min(15, Math.max(0, Number(e.target.value))))}
                      className={`w-full px-3 py-2 rounded-xl text-sm font-mono tabular-nums border focus:outline-hidden focus:ring-2 focus:ring-cyan-500 ${
                        isDark ? 'bg-slate-950 border-white/15 text-white' : 'bg-white border-slate-300 text-slate-950'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`text-xs block mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>लाल (0-9.9)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="9.9"
                      value={lal}
                      onChange={(e) => setLal(Math.max(0, Number(e.target.value)))}
                      className={`w-full px-3 py-2 rounded-xl text-sm font-mono tabular-nums border focus:outline-hidden focus:ring-2 focus:ring-cyan-500 ${
                        isDark ? 'bg-slate-950 border-white/15 text-white' : 'bg-white border-slate-300 text-slate-950'
                      }`}
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>Weight in Grams (१ तोला = ११.६६४ ग्राम)</span>
                    <span className={`font-mono font-semibold ${isDark ? 'text-cyan-300' : 'text-cyan-800'}`}>{purchaseResult.pureWeightFormattedNe}</span>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={grams}
                    onChange={(e) => setGrams(Math.max(0, Number(e.target.value)))}
                    className={`w-full px-3 py-2 rounded-xl text-sm font-mono tabular-nums border focus:outline-hidden focus:ring-2 focus:ring-cyan-500 ${
                      isDark ? 'bg-slate-950 border-white/15 text-white' : 'bg-white border-slate-300 text-slate-950'
                    }`}
                  />
                </div>
              )}
            </div>

            {/* Wastage (जर्ती) & Making Charges (ज्याला) */}
            <div className={`p-4 rounded-2xl border space-y-4 ${
              isDark ? 'bg-slate-900/60 border-white/15' : 'bg-slate-50 border-slate-200'
            }`}>
              {/* Wastage */}
              <div>
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                    {isNe ? 'जर्ती (Wastage / Melting Loss %):' : 'Wastage / Jarti Loss (%):'}
                  </span>
                  <span className={`font-mono text-xs font-semibold tabular-nums ${isDark ? 'text-amber-300' : 'text-amber-800'}`}>
                    +{purchaseResult.wastageWeightGrams} g (+रू {purchaseResult.wastageCostNpr.toLocaleString()})
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  {[0, 1.5, 2.5, 3.5, 5.0].map((rate) => (
                    <button
                      key={rate}
                      type="button"
                      onClick={() => setWastagePercent(rate)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-mono border transition-colors cursor-pointer ${
                        wastagePercent === rate
                          ? isDark
                            ? 'bg-amber-500/20 text-amber-200 border-amber-400/50 font-semibold'
                            : 'bg-amber-600 text-white border-amber-600 font-semibold'
                          : isDark
                            ? 'bg-slate-950 border-white/15 text-slate-300 hover:text-white'
                            : 'bg-white border-slate-300 text-slate-700 hover:text-slate-950'
                      }`}
                    >
                      {rate}%
                    </button>
                  ))}
                  <div className="relative flex-1 min-w-[90px]">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={wastagePercent}
                      onChange={(e) => setWastagePercent(Math.max(0, Number(e.target.value)))}
                      className={`w-full pl-3 pr-6 py-1.5 rounded-lg text-xs font-mono border focus:outline-hidden focus:ring-2 focus:ring-cyan-500 ${
                        isDark ? 'bg-slate-950 border-white/15 text-white' : 'bg-white border-slate-300 text-slate-950'
                      }`}
                      placeholder="Custom %"
                    />
                    <span className={`absolute right-2 top-1/2 -translate-y-1/2 text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>%</span>
                  </div>
                </div>
                <p className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  {isNe 
                    ? 'काठमाडौं तथा स्थानीय सुन पसलहरूले सामान्यतया १.५% देखि ३.५% सम्म जर्ती जोड्ने गर्छन्।' 
                    : 'Standard Nepal jewelers typically charge 1.5% to 3.5% melting wastage for rings and chains.'}
                </p>
              </div>

              {/* Making Charges (ज्याला) */}
              <div className={`pt-3 border-t ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                    {isNe ? 'ज्याला (Making Charge):' : 'Making Charges (ज्याला):'}
                  </span>
                  <span className={`font-mono text-xs font-semibold tabular-nums ${isDark ? 'text-cyan-300' : 'text-cyan-800'}`}>
                    रू {purchaseResult.makingChargeNpr.toLocaleString()}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {[
                    { id: 'flat_per_tola', label: 'प्रति तोला (Flat/Tola)' },
                    { id: 'total_flat', label: 'एकमुष्ठ (Total Flat)' },
                    { id: 'percentage', label: 'प्रतिशत (% of Gold)' },
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setMakingChargeType(mode.id as any)}
                      className={`p-2 rounded-lg text-xs border text-center transition-colors cursor-pointer ${
                        makingChargeType === mode.id
                          ? isDark
                            ? 'bg-cyan-500/20 text-cyan-200 border-cyan-400/50 font-semibold'
                            : 'bg-cyan-700 text-white border-cyan-700 font-semibold'
                          : isDark
                            ? 'bg-slate-950 border-white/15 text-slate-300 hover:text-white'
                            : 'bg-white border-slate-300 text-slate-700 hover:text-slate-950'
                      }`}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    {makingChargeType === 'percentage' ? '%' : 'रू'}
                  </span>
                  <input
                    type="number"
                    value={makingChargeValue}
                    onChange={(e) => setMakingChargeValue(Math.max(0, Number(e.target.value)))}
                    className={`w-full pl-8 pr-3 py-2 rounded-xl text-sm font-mono tabular-nums border focus:outline-hidden focus:ring-2 focus:ring-cyan-500 ${
                      isDark ? 'bg-slate-950 border-white/15 text-white' : 'bg-white border-slate-300 text-slate-950'
                    }`}
                  />
                </div>
              </div>

              {/* Surcharges & Taxes Toggle */}
              <div className={`pt-3 border-t space-y-2 ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                <label className={`flex items-center justify-between text-xs cursor-pointer p-2 rounded-xl transition-colors ${
                  isDark ? 'hover:bg-white/[0.04]' : 'hover:bg-white'
                }`}>
                  <span className={isDark ? 'text-slate-200' : 'text-slate-800'}>
                    {isNe ? '२% विलासिता कर (Luxury Tax - Finance Act)' : '2% Luxury Tax (Finance Act surcharge)'}
                  </span>
                  <input
                    type="checkbox"
                    checked={includeLuxuryTax}
                    onChange={(e) => setIncludeLuxuryTax(e.target.checked)}
                    className="rounded-sm accent-cyan-500 h-4 w-4"
                  />
                </label>

                <label className={`flex items-center justify-between text-xs cursor-pointer p-2 rounded-xl transition-colors ${
                  isDark ? 'hover:bg-white/[0.04]' : 'hover:bg-white'
                }`}>
                  <span className={isDark ? 'text-slate-200' : 'text-slate-800'}>
                    {isNe ? '१३% आन्तरिक राजस्व भ्याट बिल (Official 13% IRD VAT)' : '13% IRD VAT (Official kar-bijak tax invoice)'}
                  </span>
                  <input
                    type="checkbox"
                    checked={includeVat}
                    onChange={(e) => setIncludeVat(e.target.checked)}
                    className="rounded-sm accent-cyan-500 h-4 w-4"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Right Column: Transparent Bill & Customer Protection Card */}
          <div className="lg:col-span-5 space-y-4">
            <div className={`p-5 rounded-3xl border shadow-lg space-y-5 ${
              isDark ? 'bg-slate-900/90 border-cyan-500/35' : 'bg-white border-cyan-300'
            }`}>
              <div className={`flex items-center justify-between border-b pb-3 ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                <div className="flex items-center gap-2">
                  <ShieldCheck className={`h-4 w-4 ${isDark ? 'text-cyan-400' : 'text-cyan-700'}`} />
                  <span className={`text-xs font-bold uppercase tracking-wider font-mono ${isDark ? 'text-white' : 'text-slate-950'}`}>
                    {isNe ? 'प्रमाणित गहना खरिद बिल' : 'Jewelry Audit Bill'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      exportBullionQuotePdf({
                        bullionType,
                        result: purchaseResult,
                        wastagePercent,
                        includeLuxuryTax,
                        includeVat,
                      })
                    }
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-colors cursor-pointer ${
                      isDark
                        ? 'bg-white/[0.05] text-slate-100 hover:bg-white/[0.1] border-white/15'
                        : 'bg-slate-100 text-slate-900 hover:bg-slate-200 border-slate-300'
                    }`}
                  >
                    <Printer className="h-3.5 w-3.5" />
                    <span>{isNe ? 'PDF' : 'Save PDF'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyQuotation}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-colors cursor-pointer ${
                      isDark
                        ? 'bg-cyan-500/15 text-cyan-200 hover:bg-cyan-500/25 border-cyan-500/40'
                        : 'bg-cyan-50 text-cyan-900 hover:bg-cyan-100 border-cyan-300'
                    }`}
                  >
                    {copiedQuotation ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedQuotation ? 'प्रतिलिपि गरियो' : 'Copy Quote'}</span>
                  </button>
                </div>
              </div>

              {/* Total Payable Hero */}
              <div className={`p-4 rounded-2xl border text-center ${
                isDark
                  ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/25 border-amber-500/35'
                  : 'bg-gradient-to-br from-amber-50 via-white to-amber-50/60 border-amber-300'
              }`}>
                <span className={`text-xs uppercase tracking-wider block font-mono ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  {isNe ? 'कुल तिर्नुपर्ने रकम (Total Payable)' : 'Total Payable Amount'}
                </span>
                <div className={`text-2xl sm:text-3xl font-extrabold font-mono mt-1 tabular-nums ${isDark ? 'text-amber-300' : 'text-amber-800'}`}>
                  रू {purchaseResult.finalTotalNpr.toLocaleString()}
                </div>
                <div className={`text-xs mt-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Effective Rate: <span className={`font-mono font-semibold tabular-nums ${isDark ? 'text-white' : 'text-slate-950'}`}>रू {purchaseResult.effectivePerGramCostNpr.toLocaleString()}/g</span>
                </div>
              </div>

              {/* Itemized Breakdown Table */}
              <div className="space-y-2 text-xs font-mono tabular-nums">
                <div className={`flex justify-between py-1.5 border-b ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                  <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>Pure Metal ({purchaseResult.pureWeightGrams} g):</span>
                  <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-950'}`}>रू {purchaseResult.rawMetalCostNpr.toLocaleString()}</span>
                </div>

                <div className={`flex justify-between py-1.5 border-b ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                  <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>
                    Wastage / जर्ती ({wastagePercent}% = {purchaseResult.wastageWeightGrams} g):
                  </span>
                  <span className={`font-semibold ${isDark ? 'text-amber-300' : 'text-amber-800'}`}>+रू {purchaseResult.wastageCostNpr.toLocaleString()}</span>
                </div>

                <div className={`flex justify-between py-1.5 border-b ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                  <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>Billed Metal Cost ({purchaseResult.totalBilledWeightGrams} g):</span>
                  <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-950'}`}>रू {purchaseResult.metalWithWastageCostNpr.toLocaleString()}</span>
                </div>

                <div className={`flex justify-between py-1.5 border-b ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                  <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>Making Charges / ज्याला:</span>
                  <span className={`font-semibold ${isDark ? 'text-cyan-300' : 'text-cyan-800'}`}>+रू {purchaseResult.makingChargeNpr.toLocaleString()}</span>
                </div>

                {includeLuxuryTax && (
                  <div className={`flex justify-between py-1.5 border-b ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                    <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>Luxury Tax (2%):</span>
                    <span className={`font-semibold ${isDark ? 'text-amber-300' : 'text-amber-800'}`}>+रू {purchaseResult.luxuryTaxNpr.toLocaleString()}</span>
                  </div>
                )}

                {includeVat && (
                  <div className={`flex justify-between py-1.5 border-b ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                    <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>IRD VAT (13%):</span>
                    <span className={`font-semibold ${isDark ? 'text-cyan-300' : 'text-cyan-800'}`}>+रू {purchaseResult.vatNpr.toLocaleString()}</span>
                  </div>
                )}
              </div>

              {/* Consumer Protection Alert Card */}
              <div className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                isDark ? 'bg-cyan-500/10 border-cyan-500/25' : 'bg-cyan-50 border-cyan-200'
              }`}>
                <div className={`flex items-center gap-1.5 font-bold ${isDark ? 'text-cyan-300' : 'text-cyan-900'}`}>
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>Consumer Transparency Audit</span>
                </div>
                <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                  Jeweler markup over raw metal is <strong className={`font-mono ${isDark ? 'text-cyan-300' : 'text-cyan-900'}`}>+{purchaseResult.markupPercentageOverRawMetal}%</strong> (ज्याला + जर्ती + कर). Always ask for an itemized weight slip before payment.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: GOLD VS NEPSE VS FD INVESTMENT SIMULATOR */}
      {subTab === 'investment' && (
        <div className={`p-6 rounded-3xl border space-y-6 ${
          isDark ? 'bg-slate-900/70 border-white/15' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 ${
            isDark ? 'border-white/10' : 'border-slate-200'
          }`}>
            <div>
              <h4 className={`text-base font-bold font-display ${isDark ? 'text-white' : 'text-slate-950'}`}>
                {isNe ? 'सुन vs सेयर बजार (NEPSE) vs मुद्दती निक्षेप (FD)' : 'Gold vs NEPSE vs Fixed Deposit Investment Growth'}
              </h4>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                {isNe 
                  ? 'नेपालको विगत १० वर्षको ऐतिहासिक प्रतिफल (CAGR) का आधारमा लगानी प्रतिफल तुलना।' 
                  : 'Historical 10-year compounding benchmarks: Gold (11.8% CAGR), NEPSE (9.2% CAGR), Bank FD (8.0%).'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setInvestType('monthly_sip')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                  investType === 'monthly_sip'
                    ? isDark
                      ? 'bg-amber-500/20 text-amber-200 border-amber-400/50'
                      : 'bg-amber-600 text-white border-amber-600'
                    : isDark
                      ? 'bg-slate-950 border-white/15 text-slate-300'
                      : 'bg-slate-100 border-slate-300 text-slate-700'
                }`}
              >
                मासिक बचत (Monthly SIP)
              </button>
              <button
                type="button"
                onClick={() => setInvestType('lump_sum')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                  investType === 'lump_sum'
                    ? isDark
                      ? 'bg-amber-500/20 text-amber-200 border-amber-400/50'
                      : 'bg-amber-600 text-white border-amber-600'
                    : isDark
                      ? 'bg-slate-950 border-white/15 text-slate-300'
                      : 'bg-slate-100 border-slate-300 text-slate-700'
                }`}
              >
                एकमुष्ठ (Lump Sum)
              </button>
            </div>
          </div>

          {/* Investment Parameters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className={`text-xs block mb-1 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                {investType === 'monthly_sip' ? 'मासिक लगानी (Monthly NPR)' : 'एकमुष्ठ लगानी (Lump Sum NPR)'}
              </label>
              <input
                type="number"
                step="1000"
                value={investAmount}
                onChange={(e) => setInvestAmount(Math.max(1000, Number(e.target.value)))}
                className={`w-full px-3 py-2 rounded-xl text-sm font-mono tabular-nums border focus:outline-hidden focus:ring-2 focus:ring-cyan-500 ${
                  isDark ? 'bg-slate-950 border-white/15 text-white' : 'bg-white border-slate-300 text-slate-950'
                }`}
              />
            </div>

            <div>
              <label className={`text-xs block mb-1 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>समय अवधि (Years)</label>
              <div className="grid grid-cols-4 gap-1.5">
                {[1, 3, 5, 10].map((yr) => (
                  <button
                    key={yr}
                    type="button"
                    onClick={() => setInvestYears(yr as any)}
                    className={`py-2 rounded-lg text-xs font-mono font-semibold border transition-colors cursor-pointer ${
                      investYears === yr
                        ? isDark
                          ? 'bg-cyan-500/20 text-cyan-200 border-cyan-400/50'
                          : 'bg-cyan-700 text-white border-cyan-700'
                        : isDark
                          ? 'bg-slate-950 border-white/15 text-slate-300 hover:text-white'
                          : 'bg-slate-50 border-slate-300 text-slate-700 hover:text-slate-950'
                    }`}
                  >
                    {yr} Yr
                  </button>
                ))}
              </div>
            </div>

            <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-950 border-white/15' : 'bg-slate-50 border-slate-200'}`}>
              <span className={`text-xs block uppercase font-mono ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Total Capital Invested</span>
              <span className={`text-sm sm:text-base font-bold font-mono tabular-nums ${isDark ? 'text-white' : 'text-slate-950'}`}>
                रू {investResult.totalInvestedNpr.toLocaleString()}
              </span>
            </div>

            <div className={`p-3 rounded-xl border ${isDark ? 'bg-amber-500/10 border-amber-500/30' : 'bg-amber-50 border-amber-200'}`}>
              <span className={`text-xs block uppercase font-mono ${isDark ? 'text-amber-300' : 'text-amber-900'}`}>Accumulated Gold Pure Tolas</span>
              <span className={`text-sm sm:text-base font-bold font-mono tabular-nums ${isDark ? 'text-amber-200' : 'text-amber-800'}`}>
                {investResult.equivalentPureGoldTolasAccumulated} तोला (Tolas)
              </span>
            </div>
          </div>

          {/* Comparison Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 tabular-nums">
            {/* Gold */}
            <div className={`p-4 rounded-2xl border space-y-2 ${
              isDark ? 'bg-amber-500/10 border-amber-500/30' : 'bg-amber-50/70 border-amber-200'
            }`}>
              <div className="flex justify-between items-center text-xs gap-2">
                <span className={`font-bold ${isDark ? 'text-amber-300' : 'text-amber-900'}`}>Gold / सुन (११.८% CAGR)</span>
                <span className={`px-2 py-0.5 rounded-md text-xs font-mono font-semibold ${
                  isDark ? 'bg-amber-500/20 text-amber-200' : 'bg-amber-100 text-amber-900'
                }`}>
                  Inflation Hedge
                </span>
              </div>
              <div className={`text-xl font-extrabold font-mono ${isDark ? 'text-white' : 'text-slate-950'}`}>
                रू {investResult.finalGoldValueNpr.toLocaleString()}
              </div>
              <div className={`text-xs font-mono ${isDark ? 'text-amber-300' : 'text-amber-800'}`}>
                Net Profit: +रू {investResult.goldNetProfitNpr.toLocaleString()}
              </div>
            </div>

            {/* NEPSE */}
            <div className={`p-4 rounded-2xl border space-y-2 ${
              isDark ? 'bg-cyan-500/10 border-cyan-500/30' : 'bg-cyan-50/70 border-cyan-200'
            }`}>
              <div className="flex justify-between items-center text-xs gap-2">
                <span className={`font-bold ${isDark ? 'text-cyan-300' : 'text-cyan-900'}`}>NEPSE / सेयर बजार (९.२% CAGR)</span>
                <span className={`px-2 py-0.5 rounded-md text-xs font-mono font-semibold ${
                  isDark ? 'bg-cyan-500/20 text-cyan-200' : 'bg-cyan-100 text-cyan-900'
                }`}>
                  Equity Growth
                </span>
              </div>
              <div className={`text-xl font-extrabold font-mono ${isDark ? 'text-white' : 'text-slate-950'}`}>
                रू {investResult.finalNepseValueNpr.toLocaleString()}
              </div>
              <div className={`text-xs font-mono ${isDark ? 'text-cyan-300' : 'text-cyan-800'}`}>
                Net Profit: +रू {investResult.nepseNetProfitNpr.toLocaleString()}
              </div>
            </div>

            {/* FD */}
            <div className={`p-4 rounded-2xl border space-y-2 ${
              isDark ? 'bg-slate-950 border-white/15' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex justify-between items-center text-xs gap-2">
                <span className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Bank FD / मुद्दती (८.०% Interest)</span>
                <span className={`px-2 py-0.5 rounded-md text-xs font-mono font-semibold ${
                  isDark ? 'bg-slate-800 text-slate-200' : 'bg-slate-200 text-slate-800'
                }`}>
                  Low Risk
                </span>
              </div>
              <div className={`text-xl font-extrabold font-mono ${isDark ? 'text-white' : 'text-slate-950'}`}>
                रू {investResult.finalFdValueNpr.toLocaleString()}
              </div>
              <div className={`text-xs font-mono ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Net Profit: +रू {investResult.fdNetProfitNpr.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: WEIGHT MATRIX & UNIT CONVERTER */}
      {subTab === 'converter' && (
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-3xl border ${
          isDark ? 'bg-slate-900/70 border-white/15' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <div className="space-y-4">
            <h4 className={`text-sm font-bold font-display ${isDark ? 'text-white' : 'text-slate-950'}`}>
              {isNe ? 'तौल रूपान्तरक (Interactive Weight Converter)' : 'Interactive Nepali Bullion Weight Converter'}
            </h4>
            <div>
              <label className={`text-xs block mb-1 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>प्रविष्टि गर्नुहोस् (Grams):</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={convGrams}
                onChange={(e) => setConvGrams(Math.max(0, Number(e.target.value)))}
                className={`w-full px-3 py-2.5 rounded-xl text-sm font-mono tabular-nums border focus:outline-hidden focus:ring-2 focus:ring-cyan-500 ${
                  isDark ? 'bg-slate-950 border-white/15 text-white' : 'bg-white border-slate-300 text-slate-950'
                }`}
              />
            </div>

            <div className="space-y-2 text-xs font-mono tabular-nums">
              <div className={`p-3 rounded-xl border flex justify-between ${
                isDark ? 'bg-slate-950 border-white/15' : 'bg-slate-50 border-slate-200'
              }`}>
                <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>Tola Equivalent:</span>
                <span className={`font-bold ${isDark ? 'text-amber-300' : 'text-amber-800'}`}>{convTolaData.totalTolas} Tolas</span>
              </div>
              <div className={`p-3 rounded-xl border flex justify-between ${
                isDark ? 'bg-slate-950 border-white/15' : 'bg-slate-50 border-slate-200'
              }`}>
                <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>Traditional Breakdown:</span>
                <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-950'}`}>{convTolaData.formattedNe}</span>
              </div>
              <div className={`p-3 rounded-xl border flex justify-between ${
                isDark ? 'bg-slate-950 border-white/15' : 'bg-slate-50 border-slate-200'
              }`}>
                <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>Troy Ounces:</span>
                <span className={`font-bold ${isDark ? 'text-cyan-300' : 'text-cyan-800'}`}>{convTroyOz} oz</span>
              </div>
            </div>
          </div>

          <div className={`space-y-3 p-4 rounded-2xl border text-xs ${
            isDark ? 'bg-slate-950 border-white/15' : 'bg-slate-50 border-slate-200'
          }`}>
            <span className={`font-bold text-xs block font-display ${isDark ? 'text-white' : 'text-slate-950'}`}>
              {isNe ? 'नेपाल सुनचाँदी आधिकारिक मानक अनुपात' : 'Official Nepal Bullion Conversion Standards'}
            </span>
            <ul className={`space-y-2 text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              <li className="flex items-start gap-2">
                <span className={`font-bold ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>•</span>
                <span><strong>१ तोला = ११.६६४ ग्राम (Grams)</strong> — FENEGOSIDA मानक।</span>
              </li>
              <li className="flex items-start gap-2">
                <span className={`font-bold ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>•</span>
                <span><strong>१ तोला = १६ आना (Aana)</strong> — नेपाली परम्परागत गहना तौल प्रणाली।</span>
              </li>
              <li className="flex items-start gap-2">
                <span className={`font-bold ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>•</span>
                <span><strong>१ तोला = १० लाल (Lal)</strong> — १ आना = ०.६२५ लाल।</span>
              </li>
              <li className="flex items-start gap-2">
                <span className={`font-bold ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>•</span>
                <span><strong>१० ग्राम = ०.८५७३ तोला</strong> — अन्तर्राष्ट्रिय बजार दर।</span>
              </li>
              <li className="flex items-start gap-2">
                <span className={`font-bold ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>•</span>
                <span><strong>१ ट्रोय आउन्स (Troy Oz) = ३१.१०३५ ग्राम = २.६६६६ तोला</strong>।</span>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
