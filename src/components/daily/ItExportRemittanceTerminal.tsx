import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  DollarSign, 
  Percent, 
  FileCheck2, 
  Copy, 
  Check, 
  Printer, 
  ShieldCheck, 
  ExternalLink,
  Info,
  ArrowRightLeft
} from 'lucide-react';
import { ThemeMode, Language } from '../../types';
import { calculateItExportRemittance } from '../../utils/nepalItExportEngine';
import { exportItExportDeclarationPdf } from '../../utils/pdfExport';
import { ReactiveResultPanel } from '../ui/ReactiveResultPanel';

export interface ItExportRemittanceTerminalProps {
  theme?: ThemeMode;
  language?: Language;
}

export const ItExportRemittanceTerminal: React.FC<ItExportRemittanceTerminalProps> = ({
  theme = 'dark',
  language = 'en',
}) => {
  const isDark = theme === 'dark';
  const isNe = language === 'ne';

  const [inwardAmountUsd, setInwardAmountUsd] = useState<number>(1500);
  const [nrbBuyRateNpr, setNrbBuyRateNpr] = useState<number>(135.30);
  const [entityType, setEntityType] = useState<'individual_freelancer' | 'registered_company'>('individual_freelancer');
  const [freelancerName, setFreelancerName] = useState('Prakash Suvedi');
  const [panNumber, setPanNumber] = useState('609812453');
  const [bankName, setBankName] = useState('Nabil Bank Ltd.');
  const [bankBranch, setBankBranch] = useState('Kathmandu Main Branch');
  const [bankAccountNumber, setBankAccountNumber] = useState('01201017500123');
  const [foreignClientOrPlatform, setForeignClientOrPlatform] = useState('Upwork Global Inc. / Remote Client');
  const [serviceType, setServiceType] = useState('AI Model Engineering & Software Architecture');
  
  const [copiedLetter, setCopiedLetter] = useState(false);
  const [letterLang, setLetterLang] = useState<'ne' | 'en'>('ne');
  const [rateSyncGen, setRateSyncGen] = useState(0);

  useEffect(() => {
    let active = true;
    fetch('/api/forex/nrb')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active && data?.rates?.USD?.buy) {
          setNrbBuyRateNpr(Number(data.rates.USD.buy));
          setRateSyncGen((n) => n + 1);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const result = calculateItExportRemittance({
    inwardAmountUsd,
    nrbBuyRateNpr,
    entityType,
    freelancerName,
    panNumber,
    bankName,
    bankBranch,
    bankAccountNumber,
    foreignClientOrPlatform,
    serviceType,
  });

  const activeLetter = letterLang === 'ne' ? result.selfDeclarationLetterNe : result.selfDeclarationLetterEn;

  const handleCopyLetter = () => {
    navigator.clipboard.writeText(activeLetter);
    setCopiedLetter(true);
    setTimeout(() => setCopiedLetter(false), 2000);
  };

  const handlePrint = () => {
    exportItExportDeclarationPdf({
      freelancerName,
      panNumber,
      bankName,
      bankBranch,
      bankAccountNumber,
      inwardAmountUsd,
      nrbBuyRateNpr,
      grossAmountNpr: result.grossAmountNpr,
      tdsRatePercent: result.tdsRatePercent,
      tdsAmountNpr: result.tdsAmountNpr,
      netDepositedNpr: result.netDepositedNpr,
      letterText: activeLetter,
    });
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
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold tracking-tight">
                {isNe ? 'आईटी सफ्टवेयर निर्यात तथा ५% अन्तिम कर इन्जिन' : 'IT Software Export & Section 95Ka Terminal'}
              </h2>
              <span className={`text-xs font-mono font-bold ${isDark ? 'text-cyan-300' : 'text-cyan-700'}`}>
                · दफा ९५(क)
              </span>
            </div>
            <p className={`text-xs sm:text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              {isNe ? 'आयकर ऐन २०५८ दफा ९५(क) ५% व्यक्तिगत अन्तिम टीडीएस र बैंक स्वघोषणा पत्र' : 'Income Tax Act 2058 Section 95Ka 5% final TDS and bank declaration generator'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-xs font-semibold px-3 py-1.5 rounded-xl border ${
            isDark ? 'text-cyan-300 bg-cyan-950/40 border-cyan-800/60' : 'text-cyan-800 bg-cyan-50 border-cyan-300'
          }`}>
            Final Withholding Tax (अन्तिम कर)
          </span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Controls */}
        <div className="lg:col-span-5 space-y-4 text-xs">
          <div>
            <label className={`font-semibold block mb-1.5 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
              {isNe ? 'करदाताको प्रकार (Taxpayer Category)' : 'Taxpayer Entity Type'}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'individual_freelancer', label: 'Individual (५% Final TDS)' },
                { id: 'registered_company', label: 'Company (१% Advance TDS)' },
              ].map(e => (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => setEntityType(e.id as any)}
                  className={`p-2.5 rounded-xl border text-center transition-colors cursor-pointer ${
                    entityType === e.id
                      ? isDark
                        ? 'border-cyan-400 bg-cyan-500/20 text-cyan-200 font-bold'
                        : 'border-cyan-600 bg-cyan-50 text-cyan-950 font-bold'
                      : isDark ? 'border-slate-700 bg-slate-900 text-slate-300 hover:text-white' : 'border-slate-300 bg-slate-50 text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  <div>{e.label}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={`font-semibold block mb-1 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                {isNe ? 'विदेशी मुद्रा (USD $ Amount)' : 'Inward Amount (USD)'}
              </label>
              <input
                type="number"
                min={1}
                value={inwardAmountUsd}
                onChange={e => setInwardAmountUsd(Math.max(1, parseFloat(e.target.value) || 0))}
                className={`w-full rounded-xl px-3 py-2 border outline-none font-mono font-bold tabular-nums ${
                  isDark ? 'border-slate-700 bg-slate-900 text-cyan-300' : 'border-slate-300 bg-slate-50 text-cyan-700'
                }`}
              />
            </div>

            <div>
              <label className={`font-semibold block mb-1 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                {isNe ? 'राष्ट्र बैंक खरिद दर (NRB Buy Rate)' : 'NRB Buy Rate (NPR)'}
              </label>
              <input
                type="number"
                step={0.01}
                value={nrbBuyRateNpr}
                onChange={e => setNrbBuyRateNpr(parseFloat(e.target.value) || 135)}
                className={`w-full rounded-xl px-3 py-2 border outline-none font-mono tabular-nums ${
                  isDark ? 'border-slate-700 bg-slate-900 text-white' : 'border-slate-300 bg-slate-50 text-slate-950'
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={`font-semibold block mb-1 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Full Name / Company</label>
              <input
                type="text"
                value={freelancerName}
                onChange={e => setFreelancerName(e.target.value)}
                className={`w-full rounded-xl px-3 py-2 border outline-none ${
                  isDark ? 'border-slate-700 bg-slate-900 text-white' : 'border-slate-300 bg-slate-50 text-slate-950'
                }`}
              />
            </div>
            <div>
              <label className={`font-semibold block mb-1 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>PAN Number</label>
              <input
                type="text"
                value={panNumber}
                onChange={e => setPanNumber(e.target.value)}
                className={`w-full rounded-xl px-3 py-2 border outline-none font-mono ${
                  isDark ? 'border-slate-700 bg-slate-900 text-white' : 'border-slate-300 bg-slate-50 text-slate-950'
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={`font-semibold block mb-1 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Commercial Bank</label>
              <input
                type="text"
                value={bankName}
                onChange={e => setBankName(e.target.value)}
                placeholder="e.g. Nabil Bank"
                className={`w-full rounded-xl px-3 py-2 border outline-none ${
                  isDark ? 'border-slate-700 bg-slate-900 text-white' : 'border-slate-300 bg-slate-50 text-slate-950'
                }`}
              />
            </div>
            <div>
              <label className={`font-semibold block mb-1 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Account Number</label>
              <input
                type="text"
                value={bankAccountNumber}
                onChange={e => setBankAccountNumber(e.target.value)}
                className={`w-full rounded-xl px-3 py-2 border outline-none font-mono ${
                  isDark ? 'border-slate-700 bg-slate-900 text-white' : 'border-slate-300 bg-slate-50 text-slate-950'
                }`}
              />
            </div>
          </div>

          <div>
            <label className={`font-semibold block mb-1 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Foreign Client or Platform</label>
            <input
              type="text"
              value={foreignClientOrPlatform}
              onChange={e => setForeignClientOrPlatform(e.target.value)}
              placeholder="e.g. Upwork Global Inc. / Remote Client"
              className={`w-full rounded-xl px-3 py-2 border outline-none ${
                isDark ? 'border-slate-700 bg-slate-900 text-white' : 'border-slate-300 bg-slate-50 text-slate-950'
              }`}
            />
          </div>

          <div>
            <label className={`font-semibold block mb-1 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>IT Service Export Scope</label>
            <input
              type="text"
              value={serviceType}
              onChange={e => setServiceType(e.target.value)}
              placeholder="e.g. AI Model Engineering & Cloud Infrastructure"
              className={`w-full rounded-xl px-3 py-2 border outline-none ${
                isDark ? 'border-slate-700 bg-slate-900 text-white' : 'border-slate-300 bg-slate-50 text-slate-950'
              }`}
            />
          </div>
        </div>

        {/* Remittance Output & Bank Letter */}
        <ReactiveResultPanel
          resultKey={`it-export-${entityType}-${letterLang}-${rateSyncGen}`}
          className="lg:col-span-7 space-y-4"
        >
          {/* Conversion Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className={`rounded-xl p-3 border text-center ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-300'
            }`}>
              <span className={`text-xs font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Gross Wire NPR</span>
              <div className={`text-lg font-bold font-mono mt-1 tabular-nums ${isDark ? 'text-white' : 'text-slate-950'}`}>
                रू {result.grossAmountNpr.toLocaleString('en-IN')}
              </div>
            </div>
            <div className={`rounded-xl p-3 border text-center ${
              isDark ? 'bg-cyan-950/40 border-cyan-800/40' : 'bg-cyan-50 border-cyan-300'
            }`}>
              <span className={`text-xs font-medium ${isDark ? 'text-cyan-300' : 'text-cyan-800'}`}>Section 95Ka TDS ({result.tdsRatePercent}%)</span>
              <div className={`text-lg font-bold font-mono mt-1 tabular-nums ${isDark ? 'text-cyan-300' : 'text-cyan-700'}`}>
                रू {result.tdsAmountNpr.toLocaleString('en-IN')}
              </div>
            </div>
            <div className={`rounded-xl p-3 border text-center ${
              isDark ? 'bg-sky-950/40 border-sky-800/40' : 'bg-sky-50 border-sky-300'
            }`}>
              <span className={`text-xs font-medium ${isDark ? 'text-sky-300' : 'text-sky-800'}`}>Net Deposited in Bank</span>
              <div className={`text-lg font-bold font-mono mt-1 tabular-nums ${isDark ? 'text-sky-300' : 'text-sky-700'}`}>
                रू {result.netDepositedNpr.toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          {/* Bank Self-Declaration Letter Preview */}
          <div className={`rounded-2xl border p-4 ${
            isDark ? 'border-cyan-900/40 bg-[#080d1a]' : 'border-slate-300 bg-slate-50'
          }`}>
            <div className={`flex items-center justify-between pb-3 border-b ${
              isDark ? 'border-slate-800' : 'border-slate-300'
            }`}>
              <div className="flex items-center gap-2 text-xs font-semibold">
                <FileCheck2 className={`h-4 w-4 ${isDark ? 'text-cyan-400' : 'text-cyan-700'}`} />
                <span>{isNe ? 'बैंक स्वघोषणा पत्र (Official Declaration)' : 'Official Bank Declaration Letter'}</span>
              </div>

              <div className="flex items-center gap-2">
                <div className={`flex rounded-lg p-0.5 text-xs ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
                  <button
                    type="button"
                    onClick={() => setLetterLang('ne')}
                    className={`px-2.5 py-1 rounded font-semibold cursor-pointer ${
                      letterLang === 'ne' ? 'bg-cyan-600 text-white' : isDark ? 'text-slate-300' : 'text-slate-800'
                    }`}
                  >
                    नेपाली
                  </button>
                  <button
                    type="button"
                    onClick={() => setLetterLang('en')}
                    className={`px-2.5 py-1 rounded font-semibold cursor-pointer ${
                      letterLang === 'en' ? 'bg-cyan-600 text-white' : isDark ? 'text-slate-300' : 'text-slate-800'
                    }`}
                  >
                    English
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handlePrint}
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
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
                  onClick={handleCopyLetter}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                >
                  {copiedLetter ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedLetter ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <div className={`mt-3 p-3.5 rounded-xl border font-mono text-xs whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto select-text ${
              isDark ? 'bg-white text-slate-950 border-slate-700' : 'bg-white text-slate-950 border-slate-300'
            }`}>
              {activeLetter}
            </div>
          </div>

          <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
            isDark ? 'bg-cyan-950/20 border-cyan-800/30 text-slate-300' : 'bg-cyan-50 border-cyan-300 text-slate-800'
          }`}>
            <ShieldCheck className={`h-4 w-4 shrink-0 ${isDark ? 'text-cyan-400' : 'text-cyan-700'}`} />
            <span>As per Finance Act 2081/82, 5% TDS deducted under Section 95Ka is the final withholding tax; no further return surcharge applies to individual IT export freelancers.</span>
          </div>
        </ReactiveResultPanel>
      </div>
    </div>
  );
};
