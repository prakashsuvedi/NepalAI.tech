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
  Info
} from 'lucide-react';
import { ThemeMode, Language } from '../../types';
import { 
  calculateEvRoadTax, 
  calculateNeaChargingCost, 
  simulateHighwayRoute 
} from '../../utils/nepalEvCalculator';

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
      isDark ? 'border-cyan-950/40 bg-[#0d1527] text-slate-100' : 'border-slate-200 bg-white text-slate-900 shadow-sm'
    }`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-600 to-sky-400 text-white shadow-md shadow-cyan-500/20">
            <Zap className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight">
              {isNe ? 'ईभी सवारी कर तथा विद्युत महसुल क्याल्कुलेटर' : 'Nepal Electric Vehicle (EV) & NEA Energy Engine'}
            </h2>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {isNe ? 'प्रदेश सरकारको सवारी कर, ब्लुबुक जरिवाना र प्राधिकरणको TOD महसुल हिसाब' : 'Provincial annual road tax, bluebook fine matrix & NEA Time-of-Day charging costs'}
            </p>
          </div>
        </div>

        {/* Sub-Tab Navigation */}
        <div className="flex items-center rounded-xl p-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => setSubTab('tax')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              subTab === 'tax'
                ? 'bg-cyan-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {isNe ? 'सवारी कर र ब्लुबुक' : 'Road Tax & Fines'}
          </button>
          <button
            type="button"
            onClick={() => setSubTab('charging')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              subTab === 'charging'
                ? 'bg-cyan-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {isNe ? 'विद्युत महसुल (NEA)' : 'Charging & Savings'}
          </button>
          <button
            type="button"
            onClick={() => setSubTab('routes')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              subTab === 'routes'
                ? 'bg-cyan-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
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
              <label className="font-semibold block mb-1 text-slate-300">
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
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      vehicleCategory === v.id
                        ? 'border-cyan-500 bg-cyan-500/20 text-cyan-300 font-bold'
                        : isDark ? 'border-slate-800 bg-slate-900 text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-700'
                    }`}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-semibold text-slate-300">
                  {isNe ? 'मोटर क्षमता (Electric Motor kW)' : 'Motor Power Rating (kW)'}
                </label>
                <span className="font-mono font-bold text-cyan-400 text-sm">{motorKw} kW</span>
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
              <div className="flex justify-between text-3xs text-slate-500 mt-1">
                <span>{vehicleCategory === '2wheeler' ? '0.5 kW' : '20 kW (City)'}</span>
                <span>{vehicleCategory === '2wheeler' ? '5.0 kW' : '250 kW+ (High-Performance)'}</span>
              </div>
            </div>

            <div>
              <label className="font-semibold block mb-1 text-slate-300">
                {isNe ? 'ब्लुबुक म्याद नाघेको अवधि (Renewal Delay)' : 'Expired Delay Months'}
              </label>
              <select
                value={expiryMonthsLate}
                onChange={e => setExpiryMonthsLate(parseInt(e.target.value, 10))}
                className={`w-full rounded-xl px-3 py-2 border outline-none font-semibold cursor-pointer ${
                  isDark ? 'border-slate-700 bg-slate-900 text-slate-200' : 'border-slate-300 bg-slate-50 text-slate-800'
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
              <span className="font-semibold block mb-1.5 text-slate-300">
                {isNe ? 'नवीकरणका लागि आवश्यक कागजातहरू:' : 'Required Documents for Transport Office:'}
              </span>
              <ul className="space-y-1 text-2xs text-slate-400">
                {taxResult.renewalChecklist.map((c, i) => (
                  <li key={i} className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Results Summary Card */}
          <div className="lg:col-span-6">
            <div className={`rounded-2xl p-6 border flex flex-col justify-between h-full ${
              isDark ? 'border-cyan-900/50 bg-[#080d1a]' : 'border-slate-200 bg-slate-50'
            }`}>
              <div>
                <span className="text-2xs font-bold uppercase tracking-wider text-cyan-400">
                  Provincial Finance Act Schedule
                </span>
                <h3 className="mt-1 font-bold text-sm text-slate-200">
                  {taxResult.bracketDescription}
                </h3>

                <div className="mt-6 space-y-2.5 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>{isNe ? 'वार्षिक सवारी कर (Base Road Tax):' : 'Annual Base Road Tax:'}</span>
                    <span className="font-mono font-bold text-slate-200">रू {taxResult.baseTaxNpr.toLocaleString('en-IN')}</span>
                  </div>

                  {taxResult.fineAmountNpr > 0 && (
                    <div className="flex justify-between text-amber-400">
                      <span>{isNe ? `ढिलाइ जरिवाना (${taxResult.finePercent}% Fine):` : `Late Renewal Penalty (${taxResult.finePercent}%):`}</span>
                      <span className="font-mono font-bold">+ रू {taxResult.fineAmountNpr.toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  <div className="pt-3 border-t border-slate-800 flex justify-between text-base font-bold text-cyan-400">
                    <span>{isNe ? 'जम्मा तिर्नुपर्ने रकम (Total Due):' : 'Total Payable Amount:'}</span>
                    <span className="font-mono">रू {taxResult.totalTaxDueNpr.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-2xs text-slate-500">
                  {isNe ? 'यातायात व्यवस्था कार्यालय प्रमाणीकरण' : 'Applicable across Bagmati & Gandaki'}
                </span>
                <button
                  type="button"
                  onClick={handleCopyTaxSummary}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer shadow-xs"
                >
                  {copiedTax ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedTax ? 'Copied' : 'Copy Summary'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: NEA CHARGING & SAVINGS */}
      {subTab === 'charging' && (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6 space-y-4 text-xs">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-semibold text-slate-300">
                  {isNe ? 'ब्याट्री क्षमता (Battery Size kWh)' : 'Battery Capacity (kWh)'}
                </label>
                <span className="font-mono font-bold text-cyan-400 text-sm">{batteryKwh} kWh</span>
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
              <div className="flex justify-between text-3xs text-slate-500 mt-1">
                <span>15 kWh (City Hatch)</span>
                <span>100 kWh (Long Range SUV)</span>
              </div>
            </div>

            <div>
              <label className="font-semibold block mb-1 text-slate-300">
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
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      timeOfDay === b.id
                        ? 'border-cyan-500 bg-cyan-500/20 text-cyan-300 font-bold'
                        : isDark ? 'border-slate-800 bg-slate-900 text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div>{b.label}</div>
                    <div className="text-2xs font-mono mt-0.5">{b.rate}/unit</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-semibold text-slate-300">
                  {isNe ? 'दैनिक यात्रा दूरी (Daily Commute Km)' : 'Daily Commute Distance (KM)'}
                </label>
                <span className="font-mono font-bold text-cyan-400 text-sm">{dailyCommuteKm} km</span>
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
          <div className="lg:col-span-6">
            <div className={`rounded-2xl p-6 border flex flex-col justify-between h-full ${
              isDark ? 'border-cyan-900/50 bg-[#080d1a]' : 'border-slate-200 bg-slate-50'
            }`}>
              <div>
                <span className="text-2xs font-bold uppercase tracking-wider text-cyan-400">
                  NEA Hydroelectric Cost Comparison
                </span>
                <div className="mt-3 grid grid-cols-2 gap-4">
                  <div className="rounded-xl p-3 bg-cyan-950/30 border border-cyan-800/40 text-center">
                    <span className="text-2xs text-slate-400">EV Running Cost</span>
                    <div className="text-xl font-bold text-cyan-400 font-mono mt-1">
                      रू {chargingResult.costPerKmEvNpr} / km
                    </div>
                  </div>
                  <div className="rounded-xl p-3 bg-slate-900 border border-slate-800 text-center">
                    <span className="text-2xs text-slate-400">Petrol Car Cost</span>
                    <div className="text-xl font-bold text-slate-300 font-mono mt-1">
                      रू {chargingResult.costPerKmPetrolNpr} / km
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Full Battery Charge Cost ({chargingResult.fullChargeUnitsKwh} units):</span>
                    <span className="font-mono font-bold text-slate-200">रू {chargingResult.costPerFullChargeNpr}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Monthly Fuel/Energy Savings:</span>
                    <span className="font-mono font-bold text-cyan-400">रू {chargingResult.monthlySavingsNpr.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-800 flex justify-between text-sm font-bold text-teal-400">
                    <span>Annual Net Savings vs Petrol:</span>
                    <span className="font-mono">रू {chargingResult.annualSavingsNpr.toLocaleString('en-IN')} / year</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-2xs text-slate-400 flex items-center gap-2">
                <Info className="h-4 w-4 text-cyan-400 shrink-0" />
                <span>NEA off-peak night charging reduces your running cost to under रू १.८० per kilometer.</span>
              </div>
            </div>
          </div>
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
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  selectedRoute === r.id
                    ? 'border-cyan-500 bg-cyan-500/20 text-cyan-300'
                    : isDark ? 'border-slate-800 bg-slate-900 text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-700'
                }`}
              >
                <div className="font-bold text-xs">{r.label}</div>
                <div className="text-2xs text-slate-400 mt-1 flex justify-between">
                  <span>{r.dist}</span>
                  <span className="text-cyan-400">{r.stop} Stop</span>
                </div>
              </button>
            ))}
          </div>

          <div className={`rounded-2xl p-6 border ${
            isDark ? 'border-cyan-900/50 bg-[#080d1a]' : 'border-slate-200 bg-slate-50'
          }`}>
            <h4 className="font-bold text-sm text-slate-200">{routeResult.name}</h4>
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center text-xs">
              <div className="rounded-xl p-3 bg-slate-900 border border-slate-800">
                <div className="text-slate-400 text-2xs">Highway Distance</div>
                <div className="font-bold text-cyan-400 text-base font-mono mt-1">{routeResult.distanceKm} km</div>
              </div>
              <div className="rounded-xl p-3 bg-slate-900 border border-slate-800">
                <div className="text-slate-400 text-2xs">Estimated Energy</div>
                <div className="font-bold text-slate-200 text-base font-mono mt-1">{routeResult.estimatedKwhNeeded} kWh</div>
              </div>
              <div className="rounded-xl p-3 bg-slate-900 border border-slate-800">
                <div className="text-slate-400 text-2xs">Single-Charge Feasible</div>
                <div className={`font-bold text-base mt-1 ${routeResult.canMakeWithoutStop ? 'text-teal-400' : 'text-amber-400'}`}>
                  {routeResult.canMakeWithoutStop ? 'Yes (Non-Stop)' : 'Requires DC Stop'}
                </div>
              </div>
              <div className="rounded-xl p-3 bg-slate-900 border border-slate-800">
                <div className="text-slate-400 text-2xs">Battery at Destination</div>
                <div className="font-bold text-sky-400 text-base font-mono mt-1">~{routeResult.batteryRemainingPercent}%</div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-800 text-xs">
              <span className="font-semibold text-slate-300 block mb-1">Recommended Fast Charging Checkpoints:</span>
              <div className="flex flex-wrap gap-2">
                {routeResult.recommendedStops.map((stop, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-2xs font-semibold">
                    ⚡ {stop}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
