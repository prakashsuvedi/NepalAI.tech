import React, { useState } from 'react';
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
  ArrowRightLeft
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
      setCustomRate(DEFAULT_FENEGOSIDA_RATES.chhapawalGoldPerTola);
    } else if (type === 'tejabi_gold') {
      setCustomRate(DEFAULT_FENEGOSIDA_RATES.tejabiGoldPerTola);
    } else {
      setCustomRate(DEFAULT_FENEGOSIDA_RATES.silverPerTola);
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-cyan-500/10 to-transparent border border-amber-500/20">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Coins className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white font-display">
                {isNe ? 'सुन / चाँदी गहना तथा बुलियन टर्मिनल' : 'Gold & Silver Bullion & Jewelry Tax Terminal'}
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
                FENEGOSIDA
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {isNe 
                ? 'तोला, आना, लाल र ग्राम रूपान्तरण, ज्याला र जर्ती अडिट, विलासिता कर तथा १३% भ्याट हिसाब।' 
                : 'FENEGOSIDA daily rates, Tola/Aana/Grams converter, Making charges (ज्याला), Wastage (जर्ती), Luxury Tax & 13% VAT.'}
            </p>
          </div>
        </div>

        {/* Live Daily Benchmarks */}
        <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto text-xs font-mono shrink-0">
          <div className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-white/10">
            <span className="text-slate-400 block text-[10px]">24K Chhapawal</span>
            <span className="text-amber-300 font-bold">रू {DEFAULT_FENEGOSIDA_RATES.chhapawalGoldPerTola.toLocaleString()}</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-white/10">
            <span className="text-slate-400 block text-[10px]">22K Tejabi</span>
            <span className="text-amber-200/90 font-bold">रू {DEFAULT_FENEGOSIDA_RATES.tejabiGoldPerTola.toLocaleString()}</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-white/10">
            <span className="text-slate-400 block text-[10px]">Fine Silver</span>
            <span className="text-cyan-300 font-bold">रू {DEFAULT_FENEGOSIDA_RATES.silverPerTola.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Sub-Tabs Selector */}
      <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-900/70 border border-white/10 max-w-md">
        <button
          type="button"
          onClick={() => setSubTab('purchase')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            subTab === 'purchase'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-xs'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Scale className="h-3.5 w-3.5" />
          <span>{isNe ? 'गहना खरिद हिसाब' : 'Jewelry Bill Audit'}</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab('investment')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            subTab === 'investment'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-xs'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <TrendingUp className="h-3.5 w-3.5" />
          <span>{isNe ? 'लगानी तुलना' : 'Gold vs NEPSE'}</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab('converter')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            subTab === 'converter'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-xs'
              : 'text-slate-400 hover:text-white'
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
            <div className="p-4 rounded-2xl bg-slate-900/50 border border-white/10 space-y-3">
              <label className="text-xs font-semibold text-slate-300 block">
                {isNe ? 'धातु छनोट गर्नुहोस् (Metal Selection)' : 'Select Precious Metal'}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'chhapawal_gold', label: '24K Chhapawal Gold', sub: '९९.९% छापावाल सुन' },
                  { id: 'tejabi_gold', label: '22K Tejabi Gold', sub: '९१.६% तेजाबी सुन' },
                  { id: 'silver', label: 'Fine Silver', sub: 'चाँदी' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleBullionTypeChange(item.id as BullionType)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      bullionType === item.id
                        ? 'bg-amber-500/20 border-amber-500/50 text-white'
                        : 'bg-slate-900/60 border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="font-semibold text-xs text-amber-300">{item.label}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{item.sub}</div>
                  </button>
                ))}
              </div>

              {/* Rate per Tola Input */}
              <div className="pt-2">
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="text-slate-400">{isNe ? 'दर प्रति तोला (NPR Rate / Tola):' : 'Rate per Tola (NPR):'}</span>
                  <span className="text-cyan-400 font-mono text-[11px]">
                    = रू {Math.round(customRate / 11.664).toLocaleString()} / gram
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-mono">रू</span>
                  <input
                    type="number"
                    value={customRate}
                    onChange={(e) => setCustomRate(Math.max(0, Number(e.target.value)))}
                    className="w-full pl-8 pr-3 py-2 rounded-xl text-xs sm:text-sm bg-slate-950 border border-white/10 text-white font-mono focus:outline-hidden focus:ring-1 focus:ring-cyan-500/50"
                  />
                </div>
              </div>
            </div>

            {/* Weight Input Box */}
            <div className="p-4 rounded-2xl bg-slate-900/50 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">
                  {isNe ? 'तौल प्रविष्टि (Weight Input)' : 'Net Jewelry Weight'}
                </label>
                <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-950 border border-white/10 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setInputMode('tola_aana_lal')}
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                      inputMode === 'tola_aana_lal' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400'
                    }`}
                  >
                    तोला / आना / लाल
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputMode('grams')}
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                      inputMode === 'grams' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400'
                    }`}
                  >
                    ग्राम (Grams)
                  </button>
                </div>
              </div>

              {inputMode === 'tola_aana_lal' ? (
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">तोला (Tola)</label>
                    <input
                      type="number"
                      min="0"
                      value={tola}
                      onChange={(e) => setTola(Math.max(0, Number(e.target.value)))}
                      className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm bg-slate-950 border border-white/10 text-white font-mono focus:outline-hidden focus:ring-1 focus:ring-cyan-500/50"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">आना (Aana, 0-15)</label>
                    <input
                      type="number"
                      min="0"
                      max="15"
                      value={aana}
                      onChange={(e) => setAana(Math.min(15, Math.max(0, Number(e.target.value))))}
                      className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm bg-slate-950 border border-white/10 text-white font-mono focus:outline-hidden focus:ring-1 focus:ring-cyan-500/50"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">लाल (Lal, 0-9.9)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="9.9"
                      value={lal}
                      onChange={(e) => setLal(Math.max(0, Number(e.target.value)))}
                      className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm bg-slate-950 border border-white/10 text-white font-mono focus:outline-hidden focus:ring-1 focus:ring-cyan-500/50"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between items-center text-[11px] text-slate-400 mb-1">
                    <span>Weight in Grams (१ तोला = ११.६६४ ग्राम)</span>
                    <span className="text-cyan-400 font-mono">{purchaseResult.pureWeightFormattedNe}</span>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={grams}
                    onChange={(e) => setGrams(Math.max(0, Number(e.target.value)))}
                    className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm bg-slate-950 border border-white/10 text-white font-mono focus:outline-hidden focus:ring-1 focus:ring-cyan-500/50"
                  />
                </div>
              )}
            </div>

            {/* Wastage (जर्ती) & Making Charges (ज्याला) */}
            <div className="p-4 rounded-2xl bg-slate-900/50 border border-white/10 space-y-4">
              {/* Wastage */}
              <div>
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="font-semibold text-slate-300">
                    {isNe ? 'जर्ती (Wastage / Melting Loss %):' : 'Wastage / Jarti Loss (%):'}
                  </span>
                  <span className="text-amber-400 font-mono text-xs">
                    +{purchaseResult.wastageWeightGrams} g (+रू {purchaseResult.wastageCostNpr.toLocaleString()})
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  {[0, 1.5, 2.5, 3.5, 5.0].map((rate) => (
                    <button
                      key={rate}
                      type="button"
                      onClick={() => setWastagePercent(rate)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono border transition-all cursor-pointer ${
                        wastagePercent === rate
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-slate-950 border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      {rate}%
                    </button>
                  ))}
                  <div className="relative flex-1">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={wastagePercent}
                      onChange={(e) => setWastagePercent(Math.max(0, Number(e.target.value)))}
                      className="w-full pl-3 pr-6 py-1 rounded-lg text-xs bg-slate-950 border border-white/10 text-white font-mono"
                      placeholder="Custom %"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">%</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400">
                  {isNe 
                    ? 'काठमाडौं तथा स्थानीय सुन पसलहरूले सामान्यतया १.५% देखि ३.५% सम्म जर्ती जोड्ने गर्छन्।' 
                    : 'Standard Nepal jewelers typically charge 1.5% to 3.5% melting wastage for rings and chains.'}
                </p>
              </div>

              {/* Making Charges (ज्याला) */}
              <div className="pt-2 border-t border-white/10">
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="font-semibold text-slate-300">
                    {isNe ? 'ज्याला (Making Charge):' : 'Making Charges (ज्याला):'}
                  </span>
                  <span className="text-cyan-400 font-mono text-xs">
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
                      className={`p-2 rounded-lg text-[11px] border text-center transition-all cursor-pointer ${
                        makingChargeType === mode.id
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-semibold'
                          : 'bg-slate-950 border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-mono">
                    {makingChargeType === 'percentage' ? '%' : 'रू'}
                  </span>
                  <input
                    type="number"
                    value={makingChargeValue}
                    onChange={(e) => setMakingChargeValue(Math.max(0, Number(e.target.value)))}
                    className="w-full pl-8 pr-3 py-2 rounded-xl text-xs sm:text-sm bg-slate-950 border border-white/10 text-white font-mono"
                  />
                </div>
              </div>

              {/* Surcharges & Taxes Toggle */}
              <div className="pt-2 border-t border-white/10 space-y-2">
                <label className="flex items-center justify-between text-xs cursor-pointer p-2 rounded-xl hover:bg-white/[0.02]">
                  <span className="text-slate-300">
                    {isNe ? '२% विलासिता कर (Luxury Tax - Finance Act)' : '2% Luxury Tax (Finance Act surcharge)'}
                  </span>
                  <input
                    type="checkbox"
                    checked={includeLuxuryTax}
                    onChange={(e) => setIncludeLuxuryTax(e.target.checked)}
                    className="rounded-sm accent-cyan-500 h-4 w-4"
                  />
                </label>

                <label className="flex items-center justify-between text-xs cursor-pointer p-2 rounded-xl hover:bg-white/[0.02]">
                  <span className="text-slate-300">
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
            <div className="p-5 rounded-3xl bg-slate-900/80 border border-cyan-500/30 shadow-xl space-y-5">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-cyan-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                    {isNe ? 'प्रमाणित गहना खरिद बिल' : 'Jewelry Audit Bill'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyQuotation}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 border border-cyan-500/30 transition-all cursor-pointer"
                >
                  {copiedQuotation ? <Check className="h-3.5 w-3.5 text-cyan-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedQuotation ? 'प्रतिलिपि गरियो' : 'Copy Quote'}</span>
                </button>
              </div>

              {/* Total Payable Hero */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/20 border border-amber-500/30 text-center">
                <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-mono">
                  {isNe ? 'कुल तिर्नुपर्ने रकम (Total Payable)' : 'Total Payable Amount'}
                </span>
                <div className="text-2xl sm:text-3xl font-extrabold text-amber-300 font-mono mt-1">
                  रू {purchaseResult.finalTotalNpr.toLocaleString()}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Effective Rate: <span className="text-white font-mono">रू {purchaseResult.effectivePerGramCostNpr.toLocaleString()}/g</span>
                </div>
              </div>

              {/* Itemized Breakdown Table */}
              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-slate-400">Pure Metal ({purchaseResult.pureWeightGrams} g):</span>
                  <span className="text-white font-semibold">रू {purchaseResult.rawMetalCostNpr.toLocaleString()}</span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-slate-400">
                    Wastage / जर्ती ({wastagePercent}% = {purchaseResult.wastageWeightGrams} g):
                  </span>
                  <span className="text-amber-400 font-semibold">+रू {purchaseResult.wastageCostNpr.toLocaleString()}</span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-slate-400">Billed Metal Cost ({purchaseResult.totalBilledWeightGrams} g):</span>
                  <span className="text-white font-semibold">रू {purchaseResult.metalWithWastageCostNpr.toLocaleString()}</span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-slate-400">Making Charges / ज्याला:</span>
                  <span className="text-cyan-400 font-semibold">+रू {purchaseResult.makingChargeNpr.toLocaleString()}</span>
                </div>

                {includeLuxuryTax && (
                  <div className="flex justify-between py-1.5 border-b border-white/5">
                    <span className="text-slate-400">Luxury Tax (2%):</span>
                    <span className="text-amber-400 font-semibold">+रू {purchaseResult.luxuryTaxNpr.toLocaleString()}</span>
                  </div>
                )}

                {includeVat && (
                  <div className="flex justify-between py-1.5 border-b border-white/5">
                    <span className="text-slate-400">IRD VAT (13%):</span>
                    <span className="text-cyan-400 font-semibold">+रू {purchaseResult.vatNpr.toLocaleString()}</span>
                  </div>
                )}
              </div>

              {/* Consumer Protection Alert Card */}
              <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 text-cyan-300 font-bold">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>Consumer Transparency Audit</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Jeweler markup over raw metal is <strong className="text-cyan-300 font-mono">+{purchaseResult.markupPercentageOverRawMetal}%</strong> (ज्याला + जर्ती + कर). Always ask for an itemized weight slip before payment.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: GOLD VS NEPSE VS FD INVESTMENT SIMULATOR */}
      {subTab === 'investment' && (
        <div className="p-6 rounded-3xl bg-slate-900/70 border border-white/10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <h4 className="text-base font-bold text-white font-display">
                {isNe ? 'सुन vs सेयर बजार (NEPSE) vs मुद्दती निक्षेप (FD)' : 'Gold vs NEPSE vs Fixed Deposit Investment Growth'}
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                {isNe 
                  ? 'नेपालको विगत १० वर्षको ऐतिहासिक प्रतिफल (CAGR) का आधारमा लगानी प्रतिफल तुलना।' 
                  : 'Historical 10-year compounding benchmarks: Gold (11.8% CAGR), NEPSE (9.2% CAGR), Bank FD (8.0%).'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setInvestType('monthly_sip')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  investType === 'monthly_sip'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-slate-950 border border-white/10 text-slate-400'
                }`}
              >
                मासिक बचत (Monthly SIP)
              </button>
              <button
                type="button"
                onClick={() => setInvestType('lump_sum')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  investType === 'lump_sum'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-slate-950 border border-white/10 text-slate-400'
                }`}
              >
                एकमुष्ठ (Lump Sum)
              </button>
            </div>
          </div>

          {/* Investment Parameters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1">
                {investType === 'monthly_sip' ? 'मासिक लगानी (Monthly NPR)' : 'एकमुष्ठ लगानी (Lump Sum NPR)'}
              </label>
              <input
                type="number"
                step="1000"
                value={investAmount}
                onChange={(e) => setInvestAmount(Math.max(1000, Number(e.target.value)))}
                className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm bg-slate-950 border border-white/10 text-white font-mono"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">समय अवधि (Years)</label>
              <div className="grid grid-cols-4 gap-1.5">
                {[1, 3, 5, 10].map((yr) => (
                  <button
                    key={yr}
                    type="button"
                    onClick={() => setInvestYears(yr as any)}
                    className={`py-2 rounded-lg text-xs font-mono font-semibold border transition-all cursor-pointer ${
                      investYears === yr
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                        : 'bg-slate-950 border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    {yr} Yr
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-white/10">
              <span className="text-[10px] text-slate-400 block uppercase font-mono">Total Capital Invested</span>
              <span className="text-sm sm:text-base font-bold text-white font-mono">
                रू {investResult.totalInvestedNpr.toLocaleString()}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <span className="text-[10px] text-amber-300 block uppercase font-mono">Accumulated Gold Pure Tolas</span>
              <span className="text-sm sm:text-base font-bold text-amber-300 font-mono">
                {investResult.equivalentPureGoldTolasAccumulated} तोला (Tolas)
              </span>
            </div>
          </div>

          {/* Comparison Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Gold */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-amber-300">Gold / सुन (११.८% CAGR)</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/20 text-amber-300 font-mono">
                  Inflation Hedge
                </span>
              </div>
              <div className="text-xl font-extrabold text-white font-mono">
                रू {investResult.finalGoldValueNpr.toLocaleString()}
              </div>
              <div className="text-xs text-amber-400 font-mono">
                Net Profit: +रू {investResult.goldNetProfitNpr.toLocaleString()}
              </div>
            </div>

            {/* NEPSE */}
            <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-cyan-300">NEPSE / सेयर बजार (९.२% CAGR)</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-cyan-500/20 text-cyan-300 font-mono">
                  Equity Growth
                </span>
              </div>
              <div className="text-xl font-extrabold text-white font-mono">
                रू {investResult.finalNepseValueNpr.toLocaleString()}
              </div>
              <div className="text-xs text-cyan-400 font-mono">
                Net Profit: +रू {investResult.nepseNetProfitNpr.toLocaleString()}
              </div>
            </div>

            {/* FD */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-white/10 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-300">Bank FD / मुद्दती (८.०% Interest)</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-400 font-mono">
                  Low Risk
                </span>
              </div>
              <div className="text-xl font-extrabold text-white font-mono">
                रू {investResult.finalFdValueNpr.toLocaleString()}
              </div>
              <div className="text-xs text-slate-400 font-mono">
                Net Profit: +रू {investResult.fdNetProfitNpr.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: WEIGHT MATRIX & UNIT CONVERTER */}
      {subTab === 'converter' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-3xl bg-slate-900/70 border border-white/10">
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white font-display">
              {isNe ? 'तौल रूपान्तरक (Interactive Weight Converter)' : 'Interactive Nepali Bullion Weight Converter'}
            </h4>
            <div>
              <label className="text-xs text-slate-400 block mb-1">प्रविष्टि गर्नुहोस् (Grams):</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={convGrams}
                onChange={(e) => setConvGrams(Math.max(0, Number(e.target.value)))}
                className="w-full px-3 py-2.5 rounded-xl text-sm bg-slate-950 border border-white/10 text-white font-mono"
              />
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="p-3 rounded-xl bg-slate-950 border border-white/10 flex justify-between">
                <span className="text-slate-400">Tola Equivalent:</span>
                <span className="text-amber-300 font-bold">{convTolaData.totalTolas} Tolas</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-white/10 flex justify-between">
                <span className="text-slate-400">Traditional Breakdown:</span>
                <span className="text-white font-bold">{convTolaData.formattedNe}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-white/10 flex justify-between">
                <span className="text-slate-400">Troy Ounces:</span>
                <span className="text-cyan-300 font-bold">{convTroyOz} oz</span>
              </div>
            </div>
          </div>

          <div className="space-y-3 p-4 rounded-2xl bg-slate-950 border border-white/10 text-xs">
            <span className="font-bold text-white text-xs block font-display">
              {isNe ? 'नेपाल सुनचाँदी आधिकारिक मानक अनुपात' : 'Official Nepal Bullion Conversion Standards'}
            </span>
            <ul className="space-y-2 text-slate-400 text-[11px] leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">•</span>
                <span><strong>१ तोला = ११.६६४ ग्राम (Grams)</strong> — FENEGOSIDA मानक।</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">•</span>
                <span><strong>१ तोला = १६ आना (Aana)</strong> — नेपाली परम्परागत गहना तौल प्रणाली।</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">•</span>
                <span><strong>१ तोला = १० लाल (Lal)</strong> — १ आना = ०.६२५ लाल।</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">•</span>
                <span><strong>१० ग्राम = ०.८५७३ तोला</strong> — अन्तर्राष्ट्रिय बजार दर।</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">•</span>
                <span><strong>१ ट्रोय आउन्स (Troy Oz) = ३१.१०३५ ग्राम = २.६६६६ तोला</strong>।</span>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
