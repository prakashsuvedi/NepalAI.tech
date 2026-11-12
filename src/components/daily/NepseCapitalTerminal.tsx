import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Percent, 
  DollarSign, 
  Scale, 
  Clock, 
  Copy, 
  Check, 
  Sparkles, 
  Info,
  Layers,
  ArrowRight
} from 'lucide-react';
import { ThemeMode, Language } from '../../types';
import { 
  calculateNepseTrade, 
  calculateBookCloseAdjustments 
} from '../../utils/nepseCalculator';

export interface NepseCapitalTerminalProps {
  theme?: ThemeMode;
  language?: Language;
}

export const NepseCapitalTerminal: React.FC<NepseCapitalTerminalProps> = ({
  theme = 'dark',
  language = 'en',
}) => {
  const isDark = theme === 'dark';
  const isNe = language === 'ne';

  // Sub-tabs: 'trade' | 'book_close'
  const [subTab, setSubTab] = useState<'trade' | 'book_close'>('trade');

  // Trade inputs
  const [scripSymbol, setScripSymbol] = useState('NABIL');
  const [units, setUnits] = useState<number>(100);
  const [buyPrice, setBuyPrice] = useState<number>(450);
  const [sellPrice, setSellPrice] = useState<number>(560);
  const [holdingPeriod, setHoldingPeriod] = useState<'short_term' | 'long_term' | 'corporate'>('short_term');
  const [copied, setCopied] = useState(false);

  // Book close inputs
  const [bookCloseMarketPrice, setBookCloseMarketPrice] = useState<number>(600);
  const [bonusPercent, setBonusPercent] = useState<number>(15);
  const [rightPercent, setRightPercent] = useState<number>(0);

  const tradeResult = calculateNepseTrade({
    units,
    buyPrice,
    sellPrice,
    holdingPeriod,
  });

  const adjustmentResult = calculateBookCloseAdjustments({
    marketPriceBeforeBookClose: bookCloseMarketPrice,
    bonusPercent,
    rightPercent,
  });

  const handleCopyTradeSummary = () => {
    const text = `
🇳🇵 NEPSE Trade Breakdown (${scripSymbol.toUpperCase()})
-------------------------------------------------
Units: ${units} shares
Purchase Price: रू ${buyPrice} (Total: रू ${tradeResult.totalPurchaseAmount.toLocaleString('en-IN')})
Sales Price: रू ${sellPrice} (Total: रू ${tradeResult.totalSalesAmount.toLocaleString('en-IN')})
Broker Commission: रू ${tradeResult.totalBrokerCommission.toLocaleString('en-IN')}
SEBON Regulatory Fee (0.015%): रू ${tradeResult.sebonFeeNpr}
DP Fee: रू ${tradeResult.dpChargeNpr}
Capital Gains Tax (${tradeResult.cgtRatePercent}%): रू ${tradeResult.capitalGainsTaxNpr.toLocaleString('en-IN')}
Net Receivable: रू ${tradeResult.netReceivableNpr.toLocaleString('en-IN')}
Net Profit / Loss: रू ${tradeResult.netProfitLossNpr.toLocaleString('en-IN')} (${tradeResult.returnOnInvestmentPercent}%)
Break-Even Sell Price: रू ${tradeResult.breakEvenSellPrice}
Calculated via: nepalai.tech Capital Terminal
    `.trim();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`rounded-3xl border p-5 sm:p-8 transition-colors ${
      isDark ? 'border-cyan-950/40 bg-[#0d1527] text-slate-100' : 'border-slate-200 bg-white text-slate-900 shadow-sm'
    }`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-600 to-sky-400 text-white shadow-md shadow-cyan-500/20">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight">
              {isNe ? 'नेप्से तथा शेयर बजार क्यापिटल टर्मिनल' : 'NEPSE & SEBON Capital Intelligence Terminal'}
            </h2>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {isNe ? 'पुँजीगत लाभकर (CGT), ब्रोकर कमिसन, ब्रेक-इभेन र बोनस समायोजित मूल्य' : 'Capital Gains Tax (CGT), SEBON fees, tiered broker slabs & book-close price adjustments'}
            </p>
          </div>
        </div>

        {/* Sub-Tabs */}
        <div className="flex items-center rounded-xl p-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => setSubTab('trade')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              subTab === 'trade'
                ? 'bg-cyan-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {isNe ? 'ट्रेडिङ नाफा तथा कर' : 'Trade P&L & CGT'}
          </button>
          <button
            type="button"
            onClick={() => setSubTab('book_close')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              subTab === 'book_close'
                ? 'bg-cyan-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {isNe ? 'बोनस तथा राइट समायोजन' : 'Book Close Adjustments'}
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: TRADE P&L AND REGULATORY CHARGES */}
      {subTab === 'trade' && (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Trade Inputs */}
          <div className="lg:col-span-5 space-y-4 text-xs">
            <div>
              <label className="font-semibold block mb-1 text-slate-300">
                {isNe ? 'कम्पनी संकेत (Scrip Symbol)' : 'Scrip / Stock Symbol'}
              </label>
              <input
                type="text"
                value={scripSymbol}
                onChange={e => setScripSymbol(e.target.value.toUpperCase())}
                placeholder="e.g. NABIL, SHIVM, CHCL"
                className={`w-full rounded-xl px-3 py-2 border outline-none font-mono font-bold ${
                  isDark ? 'border-slate-700 bg-slate-900 text-slate-200' : 'border-slate-300 bg-slate-50 text-slate-800'
                }`}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold block mb-1 text-slate-300">
                  {isNe ? 'कित्ता संख्या (Share Units)' : 'Units / Kitta'}
                </label>
                <input
                  type="number"
                  min={1}
                  value={units}
                  onChange={e => setUnits(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className={`w-full rounded-xl px-3 py-2 border outline-none font-mono ${
                    isDark ? 'border-slate-700 bg-slate-900 text-slate-200' : 'border-slate-300 bg-slate-50 text-slate-800'
                  }`}
                />
              </div>

              <div>
                <label className="font-semibold block mb-1 text-slate-300">
                  {isNe ? 'खरिद दर (Buy Price रू)' : 'Buy Price (NPR)'}
                </label>
                <input
                  type="number"
                  min={1}
                  value={buyPrice}
                  onChange={e => setBuyPrice(Math.max(1, parseFloat(e.target.value) || 0))}
                  className={`w-full rounded-xl px-3 py-2 border outline-none font-mono ${
                    isDark ? 'border-slate-700 bg-slate-900 text-slate-200' : 'border-slate-300 bg-slate-50 text-slate-800'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="font-semibold block mb-1 text-slate-300">
                {isNe ? 'बिक्री दर (Sell Price रू)' : 'Sell Price (NPR)'}
              </label>
              <input
                type="number"
                min={1}
                value={sellPrice}
                onChange={e => setSellPrice(Math.max(1, parseFloat(e.target.value) || 0))}
                className={`w-full rounded-xl px-3 py-2 border outline-none font-mono font-bold text-cyan-400 ${
                  isDark ? 'border-slate-700 bg-slate-900' : 'border-slate-300 bg-slate-50'
                }`}
              />
            </div>

            <div>
              <label className="font-semibold block mb-1 text-slate-300">
                {isNe ? 'शेयर राखेको अवधि (Holding Period for CGT)' : 'Holding Period (Capital Gains Tax)'}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'short_term', label: 'Short Term', sub: '< 365 Days (7.5%)' },
                  { id: 'long_term', label: 'Long Term', sub: '≥ 365 Days (5.0%)' },
                  { id: 'corporate', label: 'Corporate', sub: 'Institutional (10%)' },
                ].map(h => (
                  <button
                    key={h.id}
                    type="button"
                    onClick={() => setHoldingPeriod(h.id as any)}
                    className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                      holdingPeriod === h.id
                        ? 'border-cyan-500 bg-cyan-500/20 text-cyan-300 font-bold'
                        : isDark ? 'border-slate-800 bg-slate-900 text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="font-semibold">{h.label}</div>
                    <div className="text-3xs text-slate-500 mt-0.5">{h.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Break Even Highlight */}
            <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-800/40 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">{isNe ? 'शून्य नाफा-नोक्सान बिक्री दर (Break-Even):' : 'Break-Even Target Sell Price:'}</span>
                <span className="font-mono font-bold text-cyan-300 text-sm">रू {tradeResult.breakEvenSellPrice}</span>
              </div>
              <p className="text-3xs text-slate-400 mt-1">
                Sell at or above रू {tradeResult.breakEvenSellPrice} to cover all broker slabs, SEBON fee, and DP charge.
              </p>
            </div>
          </div>

          {/* Trade Output Breakdown */}
          <div className="lg:col-span-7">
            <div className={`rounded-2xl p-6 border flex flex-col justify-between h-full ${
              isDark ? 'border-cyan-900/50 bg-[#080d1a]' : 'border-slate-200 bg-slate-50'
            }`}>
              <div>
                {/* Net P&L Hero Card */}
                <div className={`rounded-xl p-4 border flex items-center justify-between ${
                  tradeResult.netProfitLossNpr >= 0
                    ? 'border-teal-500/30 bg-teal-500/10 text-teal-400'
                    : 'border-red-500/30 bg-red-500/10 text-red-400'
                }`}>
                  <div>
                    <span className="text-2xs font-semibold uppercase tracking-wider block">
                      {tradeResult.netProfitLossNpr >= 0 ? 'Net Profit (खुद नाफा)' : 'Net Loss (खुद नोक्सान)'}
                    </span>
                    <div className="text-2xl font-bold font-mono mt-0.5">
                      {tradeResult.netProfitLossNpr >= 0 ? '+' : ''}रू {tradeResult.netProfitLossNpr.toLocaleString('en-IN')}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xs block">ROI / Return</span>
                    <span className="text-lg font-bold font-mono">
                      {tradeResult.returnOnInvestmentPercent >= 0 ? '+' : ''}{tradeResult.returnOnInvestmentPercent}%
                    </span>
                  </div>
                </div>

                {/* Regulatory Deductions Table */}
                <div className="mt-5 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Total Purchase Value ({units} × रू {buyPrice}):</span>
                    <span className="font-mono text-slate-200">रू {tradeResult.totalPurchaseAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Total Sales Value ({units} × रू {sellPrice}):</span>
                    <span className="font-mono text-slate-200">रू {tradeResult.totalSalesAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Broker Commission (SEBON Tiered Slabs):</span>
                    <span className="font-mono text-slate-300">- रू {tradeResult.totalBrokerCommission.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>SEBON Regulatory Fee (0.015%):</span>
                    <span className="font-mono text-slate-300">- रू {tradeResult.sebonFeeNpr}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>DP (Depository Participant) Fee:</span>
                    <span className="font-mono text-slate-300">- रू {tradeResult.dpChargeNpr}</span>
                  </div>

                  {tradeResult.capitalGainsTaxNpr > 0 && (
                    <div className="flex justify-between text-amber-400">
                      <span>Capital Gains Tax (CGT {tradeResult.cgtRatePercent}%):</span>
                      <span className="font-mono font-bold">- रू {tradeResult.capitalGainsTaxNpr.toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  <div className="pt-3 border-t border-slate-800 flex justify-between text-sm font-bold text-cyan-400">
                    <span>Net Amount Credited (बैंक खातामा जम्मा हुने):</span>
                    <span className="font-mono">रू {tradeResult.netReceivableNpr.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-2xs text-slate-500 font-mono">
                  SEBON Directive 2081/82 Compliant
                </span>
                <button
                  type="button"
                  onClick={handleCopyTradeSummary}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer shadow-xs"
                >
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy Trade Summary'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: BOOK CLOSE ADJUSTMENTS */}
      {subTab === 'book_close' && (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6 space-y-4 text-xs">
            <div>
              <label className="font-semibold block mb-1 text-slate-300">
                {isNe ? 'बुक क्लोज अघिको अन्तिम बजार मूल्य (Market Price before Book Close रू)' : 'Market Price before Book Close (NPR)'}
              </label>
              <input
                type="number"
                min={10}
                value={bookCloseMarketPrice}
                onChange={e => setBookCloseMarketPrice(Math.max(1, parseFloat(e.target.value) || 0))}
                className={`w-full rounded-xl px-3 py-2 border outline-none font-mono font-bold ${
                  isDark ? 'border-slate-700 bg-slate-900 text-slate-200' : 'border-slate-300 bg-slate-50 text-slate-800'
                }`}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-semibold text-slate-300">
                  {isNe ? 'बोनस शेयर प्रतिशत (Bonus Share %)' : 'Bonus Share (%)'}
                </label>
                <span className="font-mono font-bold text-cyan-400 text-sm">{bonusPercent}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={0.5}
                value={bonusPercent}
                onChange={e => setBonusPercent(parseFloat(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-semibold text-slate-300">
                  {isNe ? 'हकप्रद शेयर प्रतिशत (Right Share %)' : 'Right Share (%)'}
                </label>
                <span className="font-mono font-bold text-sky-400 text-sm">{rightPercent}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={rightPercent}
                onChange={e => setRightPercent(parseFloat(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Adjustment Results */}
          <div className="lg:col-span-6">
            <div className={`rounded-2xl p-6 border flex flex-col justify-between h-full ${
              isDark ? 'border-cyan-900/50 bg-[#080d1a]' : 'border-slate-200 bg-slate-50'
            }`}>
              <div>
                <span className="text-2xs font-bold uppercase tracking-wider text-cyan-400">
                  NEPSE Official Adjustment Formula
                </span>
                <div className="mt-3 rounded-xl p-4 bg-cyan-950/30 border border-cyan-800/40 text-center">
                  <span className="text-2xs text-slate-400 uppercase">समायोजित शेयर मूल्य (Adjusted Open Price)</span>
                  <div className="text-3xl font-extrabold text-cyan-300 font-mono mt-1">
                    रू {adjustmentResult.adjustedPriceNpr}
                  </div>
                  <span className="text-3xs text-slate-400 mt-1 block">
                    Pre-Adjustment Price: रू {adjustmentResult.originalPrice} (-रू {adjustmentResult.priceDifferenceNpr})
                  </span>
                </div>

                <div className="mt-5 p-3 rounded-xl bg-slate-900 border border-slate-800 text-2xs text-slate-300 space-y-1.5 font-mono">
                  <div className="text-slate-400 font-sans font-bold">Standard NEPSE Formula:</div>
                  <div>P' = [P + (Right % × PaidUp)] / [1 + Bonus % + Right %]</div>
                  <div>P' = [{bookCloseMarketPrice} + ({rightPercent / 100} × 100)] / [1 + {bonusPercent / 100} + {rightPercent / 100}]</div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800 text-2xs text-slate-500 flex items-center gap-1.5">
                <Info className="h-4 w-4 text-cyan-400 shrink-0" />
                <span>Adjusted price reflects initial opening baseline on the trading day following book closure.</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
