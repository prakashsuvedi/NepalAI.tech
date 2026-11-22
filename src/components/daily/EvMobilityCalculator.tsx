import React, { useState } from 'react';
import { 
  Zap, 
  Car, 
  Truck, 
  Clock, 
  TrendingDown, 
  MapPin, 
  ShieldAlert, 
  HelpCircle,
  Copy,
  Check,
  Fuel,
  Info,
  Printer
} from 'lucide-react';
import { ThemeMode, Language } from '../../types';
import { 
  calculateEvRoadTax, 
  calculateNeaChargingCost, 
  simulateHighwayRoute 
} from '../../utils/nepalEvCalculator';
import { exportEvTaxPdf } from '../../utils/pdfExport';
import { ReactiveResultPanel } from '../ui/ReactiveResultPanel';

export interface EvMobilityCalculatorProps {
  theme?: ThemeMode;
  language?: Language;
}

export const EvMobilityCalculator: React.FC<EvMobilityCalculatorProps> = ({
  theme = 'dark',
  language = 'en',
}) => {
  const isDark = theme === 'dark';
  const isNe = language === 'ne';

  // Sub-tabs: 'tax' | 'charging' | 'routes'
  const [subTab, setSubTab] = useState<'tax' | 'charging' | 'routes'>('tax');

  // Road Tax State
  const [vehicleCategory, setVehicleCategory] = useState<'2wheeler' | 'car' | 'microbus' | 'bus'>('car');
  const [motorKw, setMotorKw] = useState<number>(70); // Default 70kW
  const [expiryMonthsLate, setExpiryMonthsLate] = useState<number>(0);
  const [copiedTax, setCopiedTax] = useState(false);

  // Charging & Energy State
  const [batteryKwh, setBatteryKwh] = useState<number>(40); // 40 kWh
  const [timeOfDay, setTimeOfDay] = useState<'peak' | 'normal' | 'off_peak'>('off_peak');
  const [dailyCommuteKm, setDailyCommuteKm] = useState<number>(35);

  // Highway Route State
  const [selectedRoute, setSelectedRoute] = useState<'ktm_pkr' | 'ktm_cht' | 'ktm_sindhuli'>('ktm_pkr');

  const taxResult = calculateEvRoadTax({
    category: vehicleCategory,
    motorKw,
    expiryMonthsLate,
  });

  const chargingResult = calculateNeaChargingCost({
    batteryKwh,
    timeOfDay,
    dailyCommuteKm,
  });

  const routeResult = simulateHighwayRoute(selectedRoute, batteryKwh);

  const handleCopyTaxSummary = () => {
    const text = `
🇳🇵 Nepal EV Road Tax & Bluebook Calculation
------------------------------------------
Category: ${taxResult.bracketDescription}
Motor Power: ${motorKw} kW
Annual Base Road Tax: रू ${taxResult.baseTaxNpr.toLocaleString('en-IN')}
Expiry Penalty (${taxResult.finePercent}%): रू ${taxResult.fineAmountNpr.toLocaleString('en-IN')}
Total Due: रू ${taxResult.totalTaxDueNpr.toLocaleString('en-IN')}
Regulated by: Provincial Motor Vehicle and Transport Management Act
Verified via: nepalai.tech
    `.trim();
    navigator.clipboard.writeText(text);
    setCopiedTax(true);
    setTimeout(() => setCopiedTax(false), 2000);
  };

  return (
    <div className={`rounded-3xl border p-5 sm:p-8 transition-colors ${
      isDark ? 'border-cyan-950/40 bg-[#0d1527] text-slate-100' : 'border-slate-200 bg-white text-slate-950 shadow-sm'
    }`}>
      {/* Header */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b ${
        isDark ? 'border-slate-800/80' : 'border-slate-200'
      }`}>
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-600 to-sky-400 text-white shadow-sm">
            <Zap className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight">
              {isNe ? 'ईभी सवारी कर तथा विद्युत महसुल क्याल्कुलेटर' : 'Nepal EV Road Tax & NEA Energy Engine'}
            </h2>
            <p className={`text-xs sm:text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              {isNe ? 'प्रदेश सवारी कर, ब्लुबुक जरिवाना र प्राधिकरणको TOD महसुल' : 'Provincial road tax, bluebook fine matrix & NEA charging costs'}
            </p>
          </div>
        </div>

        {/* Sub-Tab Navigation */}
        <div className={`flex items-center rounded-xl p-1 border text-xs ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-300'
        }`}>
          <button
            type="button"
            onClick={() => setSubTab('tax')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
              subTab === 'tax'
                ? 'bg-cyan-600 text-white shadow-xs'
                : isDark ? 'text-slate-300 hover:text-white' : 'text-slate-700 hover:text-slate-950'
            }`}
          >
            {isNe ? 'सवारी कर र ब्लुबुक' : 'Road Tax & Fines'}
          </button>
          <button
            type="button"
            onClick={() => setSubTab('charging')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
              subTab === 'charging'
                ? 'bg-cyan-600 text-white shadow-xs'
                : isDark ? 'text-slate-300 hover:text-white' : 'text-slate-700 hover:text-slate-950'
            }`}
          >
            {isNe ? 'विद्युत महसुल (NEA)' : 'Charging & Savings'}
          </button>
          <button
            type="button"
            onClick={() => setSubTab('routes')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
              subTab === 'routes'
                ? 'bg-cyan-600 text-white shadow-xs'
                : isDark ? 'text-slate-300 hover:text-white' : 'text-slate-700 hover:text-slate-950'
            }`}
          >
            {isNe ? 'राजमार्ग दूरी तथा ब्याट्री' : 'Highway Simulator'}
          </button>
        </div>
      </div>

      {/* TAB 1: ROAD TAX & BLUEBOOK RENEWAL */}
      {subTab === 'tax' && (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls */}
          <div className="lg:col-span-6 space-y-4 text-xs">
            <div>
              <label className={`font-semibold block mb-1.5 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                {isNe ? 'सवारी साधनको प्रकार (Vehicle Category)' : 'Vehicle Type'}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: '2wheeler', label: '2-Wheeler', kw: 1.5 },
                  { id: 'car', label: 'Car / SUV', kw: 70 },
                  { id: 'microbus', label: 'HiAce / Van', kw: 100 },
                  { id: 'bus', label: 'Public Bus', kw: 180 },
                ].map(v => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => {
                      setVehicleCategory(v.id as any);
                      setMotorKw(v.kw);
                    }}
                    className={`p-2.5 rounded-xl border text-center transition-colors cursor-pointer ${
                      vehicleCategory === v.id
                        ? isDark
                          ? 'border-cyan-400 bg-cyan-500/20 text-cyan-200 font-bold'
                          : 'border-cyan-600 bg-cyan-50 text-cyan-900 font-bold'
                        : isDark ? 'border-slate-700 bg-slate-900 text-slate-300 hover:text-white' : 'border-slate-300 bg-slate-50 text-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                  {isNe ? 'मोटर क्षमता (Electric Motor kW)' : 'Motor Power Rating (kW)'}
                </label>
                <span className={`font-mono font-bold text-sm tabular-nums ${isDark ? 'text-cyan-300' : 'text-cyan-700'}`}>{motorKw} kW</span>
              </div>
              <input
                type="range"
                min={vehicleCategory === '2wheeler' ? 0.5 : 20}
                max={vehicleCategory === '2wheeler' ? 5 : 250}
                step={vehicleCategory === '2wheeler' ? 0.1 : 5}
                value={motorKw}
                onChange={e => setMotorKw(parseFloat(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
              <div className={`flex justify-between text-xs mt-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                <span>{vehicleCategory === '2wheeler' ? '0.5 kW' : '20 kW (City)'}</span>
                <span>{vehicleCategory === '2wheeler' ? '5.0 kW' : '250 kW+ (High-Performance)'}</span>
              </div>
            </div>

            <div>
              <label className={`font-semibold block mb-1 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                {isNe ? 'ब्लुबुक म्याद नाघेको अवधि (Renewal Delay)' : 'Expired Delay Months'}
              </label>
              <select
                value={expiryMonthsLate}
                onChange={e => setExpiryMonthsLate(parseInt(e.target.value, 10))}
                className={`w-full rounded-xl px-3 py-2.5 border outline-none font-semibold cursor-pointer ${
                  isDark ? 'border-slate-700 bg-slate-900 text-slate-100' : 'border-slate-300 bg-slate-50 text-slate-950'
                }`}
              >
                <option value={0}>{isNe ? 'समयमै नवीकरण (०% जरिवाना - On Time)' : 'On Time (0% Fine)'}</option>
                <option value={2}>{isNe ? '१ देखि ३ महिना नाघेको (५% जरिवाना)' : '1 to 3 Months (5% Fine)'}</option>
                <option value={5}>{isNe ? '३ देखि ६ महिना नाघेको (१०% जरिवाना)' : '3 to 6 Months (10% Fine)'}</option>
                <option value={10}>{isNe ? '६ देखि १२ महिना नाघेको (२०% जरिवाना)' : '6 to 12 Months (20% Fine)'}</option>
                <option value={24}>{isNe ? '१ देखि ५ वर्ष नाघेको (३२% जरिवाना)' : '1 to 5 Years (32% Fine)'}</option>
                <option value={65}>{isNe ? '५ वर्ष भन्दा बढी (१००% जरिवाना)' : 'Above 5 Years (100% Fine)'}</option>
              </select>
            </div>

            <div className="pt-2">
              <span className={`font-semibold block mb-1.5 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                {isNe ? 'नवीकरणका लागि आवश्यक कागजातहरू:' : 'Required Documents for Transport Office:'}
              </span>
              <ul className={`space-y-1 text-xs ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                {taxResult.renewalChecklist.map((c, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-500 shrink-0" />
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Results Summary Card */}
          <ReactiveResultPanel
            resultKey={`ev-tax-${vehicleCategory}-${expiryMonthsLate}`}
            className="lg:col-span-6"
          >
            <div className={`rounded-2xl p-6 border flex flex-col justify-between h-full ${
              isDark ? 'border-cyan-900/50 bg-[#080d1a]' : 'border-slate-300 bg-slate-50'
            }`}>
              <div>
                <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-cyan-400' : 'text-cyan-700'}`}>
                  Provincial Finance Act Schedule
                </span>
                <h3 className={`mt-1 font-bold text-sm ${isDark ? 'text-white' : 'text-slate-950'}`}>
                  {taxResult.bracketDescription}
                </h3>

                <div className="mt-6 space-y-2.5 text-xs">
                  <div className={`flex justify-between ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    <span>{isNe ? 'वार्षिक सवारी कर (Base Road Tax):' : 'Annual Base Road Tax:'}</span>
                    <span className={`font-mono font-bold tabular-nums ${isDark ? 'text-white' : 'text-slate-950'}`}>रू {taxResult.baseTaxNpr.toLocaleString('en-IN')}</span>
                  </div>

                  {taxResult.fineAmountNpr > 0 && (
                    <div className={`flex justify-between ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>
                      <span>{isNe ? `ढिलाइ जरिवाना (${taxResult.finePercent}% Fine):` : `Late Renewal Penalty (${taxResult.finePercent}%):`}</span>
                      <span className="font-mono font-bold tabular-nums">+ रू {taxResult.fineAmountNpr.toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  <div className={`pt-3 border-t flex justify-between text-base font-bold ${
                    isDark ? 'border-slate-800 text-cyan-300' : 'border-slate-300 text-cyan-700'
                  }`}>
                    <span>{isNe ? 'जम्मा तिर्नुपर्ने रकम (Total Due):' : 'Total Payable Amount:'}</span>
                    <span className="font-mono tabular-nums">रू {taxResult.totalTaxDueNpr.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              <div className={`mt-8 pt-4 border-t flex items-center justify-between ${
                isDark ? 'border-slate-800/80' : 'border-slate-300'
              }`}>
                <span className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  {isNe ? 'यातायात व्यवस्था कार्यालय प्रमाणीकरण' : 'Applicable across Bagmati & Gandaki'}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      exportEvTaxPdf({
                        motorKw,
                        expiryMonthsLate,
                        result: taxResult,
                      })
                    }
                    className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors cursor-pointer ${
                      isDark
                        ? 'border-cyan-500/40 bg-cyan-500/15 text-cyan-200 hover:bg-cyan-500/25'
                        : 'border-cyan-300 bg-cyan-50 text-cyan-900 hover:bg-cyan-100'
                    }`}
                  >
                    <Printer className="h-3.5 w-3.5" />
                    <span>{isNe ? 'PDF' : 'Save PDF'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyTaxSummary}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white px-3.5 py-2 text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                  >
                    {copiedTax ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedTax ? 'Copied' : 'Copy Summary'}</span>
                  </button>
                </div>
              </div>
            </div>
          </ReactiveResultPanel>
        </div>
      )}

      {/* TAB 2: NEA CHARGING & SAVINGS */}
      {subTab === 'charging' && (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6 space-y-4 text-xs">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                  {isNe ? 'ब्याट्री क्षमता (Battery Size kWh)' : 'Battery Capacity (kWh)'}
                </label>
                <span className={`font-mono font-bold text-sm tabular-nums ${isDark ? 'text-cyan-300' : 'text-cyan-700'}`}>{batteryKwh} kWh</span>
              </div>
              <input
                type="range"
                min={15}
                max={100}
                step={1}
                value={batteryKwh}
                onChange={e => setBatteryKwh(parseInt(e.target.value, 10))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
              <div className={`flex justify-between text-xs mt-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                <span>15 kWh (City Hatch)</span>
                <span>100 kWh (Long Range SUV)</span>
              </div>
            </div>

            <div>
              <label className={`font-semibold block mb-1.5 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                {isNe ? 'चार्ज गर्ने समय तालिका (NEA Time-of-Day Tariff)' : 'NEA Time-of-Day Tariff Band'}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'off_peak', label: 'Night (11 PM-5 AM)', rate: 'रू ४.३०' },
                  { id: 'normal', label: 'Day (5 AM-5 PM)', rate: 'रू ८.५०' },
                  { id: 'peak', label: 'Peak (5 PM-11 PM)', rate: 'रू १२.००' },
                ].map(b => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setTimeOfDay(b.id as any)}
                    className={`p-2.5 rounded-xl border text-center transition-colors cursor-pointer ${
                      timeOfDay === b.id
                        ? isDark
                          ? 'border-cyan-400 bg-cyan-500/20 text-cyan-200 font-bold'
                          : 'border-cyan-600 bg-cyan-50 text-cyan-900 font-bold'
                        : isDark ? 'border-slate-700 bg-slate-900 text-slate-300 hover:text-white' : 'border-slate-300 bg-slate-50 text-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    <div>{b.label}</div>
                    <div className="text-xs font-mono mt-0.5">{b.rate}/unit</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                  {isNe ? 'दैनिक यात्रा दूरी (Daily Commute Km)' : 'Daily Commute Distance (KM)'}
                </label>
                <span className={`font-mono font-bold text-sm tabular-nums ${isDark ? 'text-cyan-300' : 'text-cyan-700'}`}>{dailyCommuteKm} km</span>
              </div>
              <input
                type="range"
                min={10}
                max={150}
                step={5}
                value={dailyCommuteKm}
                onChange={e => setDailyCommuteKm(parseInt(e.target.value, 10))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Savings Result */}
          <ReactiveResultPanel
            resultKey={`ev-charge-${timeOfDay}`}
            className="lg:col-span-6"
          >
            <div className={`rounded-2xl p-6 border flex flex-col justify-between h-full ${
              isDark ? 'border-cyan-900/50 bg-[#080d1a]' : 'border-slate-300 bg-slate-50'
            }`}>
              <div>
                <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-cyan-400' : 'text-cyan-700'}`}>
                  NEA Hydroelectric Cost Comparison
                </span>
                <div className="mt-3 grid grid-cols-2 gap-4">
                  <div className={`rounded-xl p-3 border text-center ${
                    isDark ? 'bg-cyan-950/30 border-cyan-800/40' : 'bg-cyan-50 border-cyan-300'
                  }`}>
                    <span className={`text-xs font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>EV Running Cost</span>
                    <div className={`text-xl font-bold font-mono mt-1 tabular-nums ${isDark ? 'text-cyan-300' : 'text-cyan-700'}`}>
                      रू {chargingResult.costPerKmEvNpr} / km
                    </div>
                  </div>
                  <div className={`rounded-xl p-3 border text-center ${
                    isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-300'
                  }`}>
                    <span className={`text-xs font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Petrol Car Cost</span>
                    <div className={`text-xl font-bold font-mono mt-1 tabular-nums ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>
                      रू {chargingResult.costPerKmPetrolNpr} / km
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-2 text-xs">
                  <div className={`flex justify-between ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    <span>Full Battery Charge Cost ({chargingResult.fullChargeUnitsKwh} units):</span>
                    <span className={`font-mono font-bold tabular-nums ${isDark ? 'text-white' : 'text-slate-950'}`}>रू {chargingResult.costPerFullChargeNpr}</span>
                  </div>
                  <div className={`flex justify-between ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    <span>Monthly Fuel/Energy Savings:</span>
                    <span className={`font-mono font-bold tabular-nums ${isDark ? 'text-cyan-300' : 'text-cyan-700'}`}>रू {chargingResult.monthlySavingsNpr.toLocaleString('en-IN')}</span>
                  </div>
                  <div className={`pt-2 border-t flex justify-between text-sm font-bold ${
                    isDark ? 'border-slate-800 text-cyan-300' : 'border-slate-300 text-cyan-700'
                  }`}>
                    <span>Annual Net Savings vs Petrol:</span>
                    <span className="font-mono tabular-nums">रू {chargingResult.annualSavingsNpr.toLocaleString('en-IN')} / year</span>
                  </div>
                </div>
              </div>

              <div className={`mt-6 p-3 rounded-xl border text-xs flex items-center gap-2 ${
                isDark ? 'bg-slate-900/60 border-slate-800 text-slate-300' : 'bg-white border-slate-300 text-slate-700'
              }`}>
                <Info className={`h-4 w-4 shrink-0 ${isDark ? 'text-cyan-400' : 'text-cyan-700'}`} />
                <span>NEA off-peak night charging reduces your running cost to under रू १.८० per kilometer.</span>
              </div>
            </div>
          </ReactiveResultPanel>
        </div>
      )}

      {/* TAB 3: HIGHWAY ROUTE SIMULATOR */}
      {subTab === 'routes' && (
        <div className="mt-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: 'ktm_pkr', label: 'Kathmandu ⇄ Pokhara', dist: '200 km', stop: 'Mugling' },
              { id: 'ktm_cht', label: 'Kathmandu ⇄ Chitwan', dist: '148 km', stop: 'Kurintar' },
              { id: 'ktm_sindhuli', label: 'Kathmandu ⇄ Sindhuli (BP Highway)', dist: '135 km', stop: 'Khurkot' },
            ].map(r => (
              <button
                key={r.id}
                type="button"
                onClick={() => setSelectedRoute(r.id as any)}
                className={`p-3.5 rounded-2xl border text-left transition-colors cursor-pointer ${
                  selectedRoute === r.id
                    ? isDark
                      ? 'border-cyan-400 bg-cyan-500/20 text-cyan-200'
                      : 'border-cyan-600 bg-cyan-50 text-cyan-950'
                    : isDark ? 'border-slate-700 bg-slate-900 text-slate-300 hover:text-white' : 'border-slate-300 bg-slate-50 text-slate-800 hover:bg-slate-100'
                }`}
              >
                <div className="font-bold text-xs">{r.label}</div>
                <div className={`text-xs mt-1 flex justify-between ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  <span>{r.dist}</span>
                  <span className={`font-semibold ${isDark ? 'text-cyan-300' : 'text-cyan-700'}`}>{r.stop} Stop</span>
                </div>
              </button>
            ))}
          </div>

          <ReactiveResultPanel
            resultKey={`ev-route-${selectedRoute}`}
            direction="up"
            className={`rounded-2xl p-6 border ${
              isDark ? 'border-cyan-900/50 bg-[#080d1a]' : 'border-slate-300 bg-slate-50'
            }`}
          >
            <h4 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-950'}`}>{routeResult.name}</h4>
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center text-xs">
              <div className={`rounded-xl p-3 border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-300'}`}>
                <div className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Highway Distance</div>
                <div className={`font-bold text-base font-mono mt-1 tabular-nums ${isDark ? 'text-cyan-300' : 'text-cyan-700'}`}>{routeResult.distanceKm} km</div>
              </div>
              <div className={`rounded-xl p-3 border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-300'}`}>
                <div className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Estimated Energy</div>
                <div className={`font-bold text-base font-mono mt-1 tabular-nums ${isDark ? 'text-white' : 'text-slate-950'}`}>{routeResult.estimatedKwhNeeded} kWh</div>
              </div>
              <div className={`rounded-xl p-3 border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-300'}`}>
                <div className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Single-Charge Feasible</div>
                <div className={`font-bold text-base mt-1 ${routeResult.canMakeWithoutStop ? (isDark ? 'text-cyan-300' : 'text-cyan-700') : (isDark ? 'text-amber-300' : 'text-amber-700')}`}>
                  {routeResult.canMakeWithoutStop ? 'Yes (Non-Stop)' : 'Requires DC Stop'}
                </div>
              </div>
              <div className={`rounded-xl p-3 border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-300'}`}>
                <div className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Battery at Destination</div>
                <div className={`font-bold text-base font-mono mt-1 tabular-nums ${isDark ? 'text-sky-300' : 'text-sky-700'}`}>~{routeResult.batteryRemainingPercent}%</div>
              </div>
            </div>

            <div className={`mt-4 pt-4 border-t text-xs ${isDark ? 'border-slate-800' : 'border-slate-300'}`}>
              <span className={`font-semibold block mb-1.5 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Recommended Fast Charging Checkpoints:</span>
              <div className="flex flex-wrap gap-2">
                {routeResult.recommendedStops.map((stop, i) => (
                  <span key={i} className={`px-2.5 py-1 rounded-lg border text-xs font-semibold ${
                    isDark ? 'bg-cyan-500/10 border-cyan-500/25 text-cyan-300' : 'bg-cyan-50 border-cyan-300 text-cyan-800'
                  }`}>
                    {stop}
                  </span>
                ))}
              </div>
            </div>
          </ReactiveResultPanel>
        </div>
      )}
    </div>
  );
};
