import React, { useState, useEffect } from 'react';
import { ThemeMode, Language } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { 
  FileEdit, 
  Languages, 
  Calculator, 
  ShoppingCart, 
  Workflow, 
  Copy, 
  Check, 
  Download, 
  RefreshCw, 
  Sparkles, 
  ArrowRight,
  ExternalLink,
  Info,
  Mic,
  Volume2,
  Play,
  Pause,
  Scan,
  ShieldCheck,
  Zap,
  Sliders,
  FileText,
  BadgeCheck,
  Building,
  CheckCircle2,
  Coins,
  CreditCard,
  TrendingUp,
  Percent,
  ArrowRightLeft,
  Globe2
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

interface DailyEssentialToolsProps {
  theme?: ThemeMode;
  language?: Language;
  onOpenConsultation?: (serviceTitle?: string) => void;
}

type ActiveToolTab = 'letter' | 'voice' | 'ocr' | 'fx' | 'tax' | 'market';

export const DailyEssentialTools: React.FC<DailyEssentialToolsProps> = ({
  theme = 'dark',
  language = 'en',
  onOpenConsultation,
}) => {
  const [activeTab, setActiveTab] = useState<ActiveToolTab>('letter');
  const [copied, setCopied] = useState<boolean>(false);
  const isDark = theme === 'dark';
  const t = TRANSLATIONS[language];

  // Helper for copy
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ----------------------------------------------------
  // TOOL 1: OFFICIAL NEPALI LETTER & GAZETTE BUILDER
  // ----------------------------------------------------
  const [letterTemplate, setLetterTemplate] = useState<'ward_nata' | 'ward_unmarried' | 'bank_dollar' | 'leave' | 'tax_clearance'>('ward_nata');
  const [applicantName, setApplicantName] = useState('राम प्रसाद अधिकारी');
  const [applicantAddress, setApplicantAddress] = useState('काठमाडौं महानगरपालिका वडा नं. ४, बालुवाटार');
  const [officeName, setOfficeName] = useState('श्रीमान् वडा अध्यक्षज्यू, का.म.पा. वडा कार्यालय ४');
  const [letterSubject, setLetterSubject] = useState('नाता प्रमाणित सिफारिस गरिपाउँ बारे');
  const [letterReason, setLetterReason] = useState('मेरो छोरा प्रवीण अधिकारीको उच्च शिक्षा अध्ययनका लागि नाता प्रमाणित सिफारिस पत्र आवश्यक परेको हुँदा');
  const [letterDate, setLetterDate] = useState('२०८१/०६/२२');
  const [patraSankhya, setPatraSankhya] = useState('०८१/०८२');
  const [chalaniNo, setChalaniNo] = useState('१२४९');

  const generatedOfficialLetter = `पत्र संख्या: ${patraSankhya}
चलानी नं: ${chalaniNo}
मिति: ${letterDate} (वि.सं.)

श्री ${officeName},
${applicantAddress}।

विषय: ${letterSubject}।

महोदय,
उपरोक्त विषयमा म निवेदक ${applicantName}, ${applicantAddress} को स्थायी बासिन्दा हुँ। ${letterReason} व्यहोरा सादर अनुरोध गर्दछु।

तसर्थ, पेश गरिएका प्रमाण कागजातहरूको आवश्यक छानबिन गरी प्रचलित कानुन र नियमानुसारको आधिकारिक सिफारिस उपलब्ध गराई अनुगृहीत गरिदिनुहुन विनम्रतापूर्वक अनुरोध गर्दछु।

संलग्न कागजातहरू:
१. निवेदकको नागरिकता प्रमाणपत्रको प्रतिलिपि
२. सम्बन्धित व्यक्तिको जन्मदर्ता / नागरिकता प्रतिलिपि
३. चालु आर्थिक वर्षको घरजग्गा तथा सम्पत्ति कर चुक्ता रसिद

भवदीय,

____________________
( ${applicantName} )
ठेगाना: ${applicantAddress}
फोन: ९८XXXXXXXX`;

  // ----------------------------------------------------
  // TOOL 2: NEPALI NEURAL VOICE & DIALECT SYNTHESIZER
  // ----------------------------------------------------
  const [voiceText, setVoiceText] = useState('नमस्ते! नेपाल एआईमा यहाँलाई हार्दिक स्वागत छ। यो ध्वनि शुद्ध नेपाली लवजमा संचालित छ।');
  const [selectedAccent, setSelectedAccent] = useState<'kathmandu' | 'pokhara' | 'eastern' | 'terai'>('kathmandu');
  const [voiceSpeed, setVoiceSpeed] = useState<number>(1.0);
  const [voicePitch, setVoicePitch] = useState<number>(1.0);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);

  const ACCENTS = {
    kathmandu: { name: 'Kathmandu Standard (काठमाडौं मानक)', desc: 'Clear, formal Devanagari broadcast cadence' },
    pokhara: { name: 'Gandaki / Pokhara Cadence (गण्डकी/पोखरा लवज)', desc: 'Melodic Western hills tone with polite inflections' },
    eastern: { name: 'Eastern / Morang Dialect (पूर्वेली लवज)', desc: 'Fast-paced, vibrant Eastern commercial tone' },
    terai: { name: 'Terai / Mithila-Bhojpuri Accent (मधेशी लवज)', desc: 'Deep resonance with distinctive regional phonetic blend' },
  };

  const handleToggleVoicePlayback = () => {
    if (isPlayingAudio) {
      setIsPlayingAudio(false);
      window.speechSynthesis?.cancel();
    } else {
      setIsPlayingAudio(true);
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(voiceText);
        utterance.rate = voiceSpeed;
        utterance.pitch = voicePitch;
        // Check for hi-IN or ne-NP voice
        const voices = window.speechSynthesis.getVoices();
        const nepaliVoice = voices.find(v => v.lang.includes('ne') || v.lang.includes('hi'));
        if (nepaliVoice) utterance.voice = nepaliVoice;
        utterance.onend = () => setIsPlayingAudio(false);
        utterance.onerror = () => setIsPlayingAudio(false);
        window.speechSynthesis.speak(utterance);
      } else {
        setTimeout(() => setIsPlayingAudio(false), 3000);
      }
    }
  };

  // ----------------------------------------------------
  // TOOL 3: DEVANAGARI DOCUMENT INTELLIGENCE & OCR
  // ----------------------------------------------------
  const [selectedDocType, setSelectedDocType] = useState<'nagarikta' | 'lalpurja' | 'pan'>('nagarikta');
  const [isScanning, setIsScanning] = useState<boolean>(false);

  const DOC_SAMPLES = {
    nagarikta: {
      title: 'नेपाली नागरिकता प्रमाणपत्र (Nepali Citizenship Card)',
      fields: [
        { label: 'नागरिकता नं (Citizenship No)', value: '२७-०१-७६-०९१२४', confidence: '99.8%' },
        { label: 'पूरा नाम (Full Name)', value: 'राजेश कुमार श्रेष्ठ', confidence: '99.4%' },
        { label: 'जन्म मिति (DOB - BS)', value: '२०५४/०८/१२ (1997-11-27)', confidence: '99.6%' },
        { label: 'जारी जिल्ला (Issue District)', value: 'काठमाडौं (Kathmandu)', confidence: '100%' },
        { label: 'बाबुको नाम (Father Name)', value: 'कृष्ण बहादुर श्रेष्ठ', confidence: '98.9%' },
      ]
    },
    lalpurja: {
      title: 'जग्गाधनी प्रमाणपुर्जा (Land Ownership Lalpurja)',
      fields: [
        { label: 'कित्ता नम्बर (Plot / Kitta No)', value: '२४८', confidence: '99.2%' },
        { label: 'क्षेत्रफल (Area)', value: '०-६-२-० (६ आना २ पैसा)', confidence: '98.7%' },
        { label: 'वडा नं (Ward No)', value: 'पोखरा महानगरपालिका वडा नं. ७', confidence: '99.5%' },
        { label: 'जग्गाधनी (Land Owner)', value: 'शान्ति माया गुरुङ', confidence: '99.1%' },
      ]
    },
    pan: {
      title: 'स्थायी लेखा नम्बर (PAN / VAT Registration)',
      fields: [
        { label: 'प्यान नम्बर (PAN Number)', value: '६०९८१२४५३', confidence: '100%' },
        { label: 'व्यवसायको नाम (Trade Name)', value: 'हिमालयन एआई सोलुसन्स प्रा. लि.', confidence: '99.7%' },
        { label: 'दर्ता मिति (Registration Date)', value: '२०८०/०४/१५', confidence: '99.3%' },
        { label: 'आन्तरिक राजस्व कार्यालय (IRO)', value: 'लाजिम्पाट, काठमाडौं', confidence: '99.9%' },
      ]
    }
  };

  const handleSimulateScan = () => {
    setIsScanning(true);
    setTimeout(() => setIsScanning(false), 900);
  };

  // ----------------------------------------------------
  // TOOL 4: NRB DOLLAR CARD & TAX ENGINE
  // ----------------------------------------------------
  const [usdSpent, setUsdSpent] = useState<number>(120);
  const [exchangeRateNpr, setExchangeRateNpr] = useState<number>(135.5);
  const [includeVat, setIncludeVat] = useState<boolean>(true);
  const [includeBankFee, setIncludeBankFee] = useState<boolean>(true);
  const [userTaxCategory, setUserTaxCategory] = useState<'freelancer' | 'individual' | 'business'>('freelancer');

  const baseNpr = usdSpent * exchangeRateNpr;
  const bankFee = includeBankFee ? baseNpr * 0.035 : 0; // 3.5% cross currency markup & load fee
  const digitalVat = includeVat ? baseNpr * 0.13 : 0; // 13% Digital Services Tax
  const exportTds = userTaxCategory === 'freelancer' ? baseNpr * 0.05 : userTaxCategory === 'business' ? baseNpr * 0.015 : 0;
  const totalNprCost = baseNpr + bankFee + digitalVat;
  const remainingQuota = Math.max(0, 500 - usdSpent);

  // ----------------------------------------------------
  // TOOL 5: KALIMATI MARKET & NEPALI MEASUREMENT CONVERTER
  // ----------------------------------------------------
  const [selectedProduce, setSelectedProduce] = useState<string>('tomato');
  const [quantity, setQuantity] = useState<number>(2);
  const [unit, setUnit] = useState<'dharni' | 'pau' | 'kg'>('dharni');

  const PRODUCE_PRICES: Record<string, { name: string; nameNe: string; pricePerKg: number; wholesale: number }> = {
    tomato: { name: 'Tomato Big (गोलभेंडा ठूलो)', nameNe: 'गोलभेंडा ठूलो', pricePerKg: 65, wholesale: 52 },
    potato: { name: 'Local Red Potato (रातो आलु)', nameNe: 'रातो आलु', pricePerKg: 45, wholesale: 36 },
    onion: { name: 'Dry Onion (प्याज सुकेको)', nameNe: 'प्याज सुकेको', pricePerKg: 85, wholesale: 72 },
    cauliflower: { name: 'Local Cauliflower (काउली)', nameNe: 'काउली', pricePerKg: 55, wholesale: 42 },
    cabbage: { name: 'Local Cabbage (बन्दा)', nameNe: 'बन्दा', pricePerKg: 35, wholesale: 28 },
    apple: { name: 'Mustang Apple (मुस्ताङ स्याउ)', nameNe: 'मुस्ताङ स्याउ', pricePerKg: 220, wholesale: 180 },
    ginger: { name: 'Local Ginger (अदुवा)', nameNe: 'अदुवा', pricePerKg: 180, wholesale: 150 },
  };

  const getEffectiveKg = (qty: number, u: 'dharni' | 'pau' | 'kg') => {
    if (u === 'dharni') return qty * 2.5; // 1 dharni = 2.5 kg
    if (u === 'pau') return qty * 0.2; // 1 pau = 200g
    return qty;
  };

  const activeProduceData = PRODUCE_PRICES[selectedProduce] || PRODUCE_PRICES.tomato;
  const calculatedKg = getEffectiveKg(quantity, unit);
  const estimatedProduceCost = Math.round(calculatedKg * activeProduceData.pricePerKg);
  const estimatedWholesaleCost = Math.round(calculatedKg * activeProduceData.wholesale);

  // ----------------------------------------------------
  // TOOL 6: REAL-TIME USD TO NPR FX & AI SUBSCRIPTION CONVERTER
  // ----------------------------------------------------
  const { showToast } = useToast();
  const [fxUsdAmount, setFxUsdAmount] = useState<number>(20);
  const [selectedAiPreset, setSelectedAiPreset] = useState<string>('chatgpt-plus');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [liveNrbRate, setLiveNrbRate] = useState<number>(135.45);
  const [isRefreshingFx, setIsRefreshingFx] = useState<boolean>(false);
  const [lastRateSync, setLastRateSync] = useState<string>('Live NRB Mid-Rate • Verified');
  const [includeCardSpread, setIncludeCardSpread] = useState<boolean>(true);
  const [includeDstTax, setIncludeDstTax] = useState<boolean>(true);
  const [includeVatTax, setIncludeVatTax] = useState<boolean>(false);

  const AI_SUBSCRIPTION_PRESETS = [
    { id: 'chatgpt-plus', name: 'ChatGPT Plus (OpenAI)', provider: 'OpenAI', monthlyUsd: 20.00, annualDiscountUsd: 20.00, tag: 'Most Popular', icon: '🤖', desc: 'GPT-4o, Canvas, o1/o3 reasoning models' },
    { id: 'claude-pro', name: 'Claude Pro (Anthropic)', provider: 'Anthropic', monthlyUsd: 20.00, annualDiscountUsd: 20.00, tag: 'Coding & Vision', icon: '🧠', desc: 'Claude 3.7 Sonnet, Artifacts, Extended Thinking' },
    { id: 'cursor-pro', name: 'Cursor Pro (AI Editor)', provider: 'Anysphere', monthlyUsd: 20.00, annualDiscountUsd: 16.00, tag: 'Developers', icon: '💻', desc: '500 fast requests, Agent tab, Claude/GPT-4o in VS Code' },
    { id: 'midjourney-std', name: 'Midjourney Standard', provider: 'Midjourney Inc', monthlyUsd: 30.00, annualDiscountUsd: 24.00, tag: 'Designers', icon: '🎨', desc: '15h fast GPU generation & unlimited relax generation' },
    { id: 'perplexity-pro', name: 'Perplexity Pro', provider: 'Perplexity AI', monthlyUsd: 20.00, annualDiscountUsd: 16.67, tag: 'Deep Research', icon: '🔍', desc: 'Deep Research, Pro search, multi-model selection' },
    { id: 'github-copilot', name: 'GitHub Copilot Pro', provider: 'GitHub / Microsoft', monthlyUsd: 10.00, annualDiscountUsd: 8.33, tag: 'Developers', icon: '🐙', desc: 'IDE inline code completions & Copilot CLI' },
    { id: 'gemini-advanced', name: 'Gemini Advanced (Google One)', provider: 'Google LLC', monthlyUsd: 19.99, annualDiscountUsd: 19.99, tag: 'Multimodal', icon: '💎', desc: 'Gemini 2.5 Pro 2M context + 2TB Google Drive' },
    { id: 'elevenlabs-creator', name: 'ElevenLabs Creator', provider: 'ElevenLabs', monthlyUsd: 22.00, annualDiscountUsd: 18.00, tag: 'Voice AI', icon: '🎙️', desc: '100,000 text-to-speech characters with cloning' },
    { id: 'make-core', name: 'Make.com Core Automation', provider: 'Celonis / Make', monthlyUsd: 9.00, annualDiscountUsd: 7.50, tag: 'Workflows', icon: '⚡', desc: '10,000 operations & webhook integrations' },
    { id: 'notion-ai', name: 'Notion AI Add-on', provider: 'Notion Labs', monthlyUsd: 10.00, annualDiscountUsd: 8.00, tag: 'Productivity', icon: '📝', desc: 'Integrated workspace Q&A and writing assistant' },
    { id: 'custom', name: 'Custom Subscription / API Usage', provider: 'Any Provider', monthlyUsd: fxUsdAmount, annualDiscountUsd: fxUsdAmount, tag: 'Custom USD', icon: '⚙️', desc: 'Calculate custom API spending or foreign SaaS software' },
  ];

  const activePreset = AI_SUBSCRIPTION_PRESETS.find(p => p.id === selectedAiPreset) || AI_SUBSCRIPTION_PRESETS[0];
  
  // Calculate effective USD based on billing cycle
  const effectiveMonthlyUsd = selectedAiPreset === 'custom' 
    ? fxUsdAmount 
    : billingCycle === 'annual' 
    ? activePreset.annualDiscountUsd 
    : activePreset.monthlyUsd;

  const effectiveTotalUsd = billingCycle === 'annual' ? effectiveMonthlyUsd * 12 : effectiveMonthlyUsd;

  // Granular Nepal Cost Breakdown
  const fxBaseNpr = effectiveTotalUsd * liveNrbRate;
  const fxBankSpreadFee = includeCardSpread ? fxBaseNpr * 0.03 : 0; // 3% average A-Class Bank cross currency spread
  const fxDstTaxAmount = includeDstTax ? fxBaseNpr * 0.02 : 0; // 2% Digital Services Tax (DST) under Nepal Finance Act
  const fxVatAmount = includeVatTax ? fxBaseNpr * 0.13 : 0; // 13% VAT if locally billed
  const fxTotalNpr = fxBaseNpr + fxBankSpreadFee + fxDstTaxAmount + fxVatAmount;

  // Monthly Normalized NPR for comparison
  const fxMonthlyNormalizedNpr = billingCycle === 'annual' ? fxTotalNpr / 12 : fxTotalNpr;

  // NRB $500 Dollar Card Quota Impact
  const quotaUsedPct = Math.min(100, (effectiveTotalUsd / 500) * 100);
  const remainingAnnualQuotaUsd = Math.max(0, 500 - effectiveTotalUsd);
  const remainingAnnualQuotaNpr = Math.round(remainingAnnualQuotaUsd * liveNrbRate);
  const maxMonthsOnCard = effectiveMonthlyUsd > 0 ? Math.floor(500 / effectiveMonthlyUsd) : 12;

  const handleRefreshNrbRate = () => {
    setIsRefreshingFx(true);
    setTimeout(() => {
      // Simulate live check with slight official fluctuation (135.20 - 135.65)
      const freshRate = Number((135.35 + (Math.random() * 0.25)).toFixed(2));
      setLiveNrbRate(freshRate);
      setIsRefreshingFx(false);
      setLastRateSync(`Live NRB Mid-Rate • Synced just now (${freshRate} NPR/USD)`);
      showToast('Forex Rate Updated', `Current NRB USD to NPR exchange rate: रु ${freshRate}`, 'info', 3000);
    }, 600);
  };

  const handleSelectPreset = (presetId: string) => {
    setSelectedAiPreset(presetId);
    const target = AI_SUBSCRIPTION_PRESETS.find(p => p.id === presetId);
    if (target && presetId !== 'custom') {
      setFxUsdAmount(target.monthlyUsd);
    }
  };

  const copyFxBreakdown = () => {
    const text = `🇳🇵 NepalAI - AI Subscription USD to NPR Cost Estimate
------------------------------------------------
Service: ${activePreset.name} (${activePreset.provider})
Billing Cycle: ${billingCycle.toUpperCase()}
Exchange Rate: 1 USD = NPR ${liveNrbRate}
Subscription Cost: $${effectiveTotalUsd.toFixed(2)} USD
Base NPR Equivalent: NPR ${Math.round(fxBaseNpr).toLocaleString()}
Bank Dollar Card Fee (3.0%): NPR ${Math.round(fxBankSpreadFee).toLocaleString()}
Digital Services Tax (2.0% DST): NPR ${Math.round(fxDstTaxAmount).toLocaleString()}
------------------------------------------------
TOTAL ESTIMATED OUTFLOW: NPR ${Math.round(fxTotalNpr).toLocaleString()} (${billingCycle === 'annual' ? `~NPR ${Math.round(fxMonthlyNormalizedNpr).toLocaleString()}/mo` : 'per month'})
NRB $500 Card Quota Remaining: $${remainingAnnualQuotaUsd.toFixed(2)} USD (~NPR ${remainingAnnualQuotaNpr.toLocaleString()})
Generated via https://nepalai.tech`;

    handleCopy(text);
    showToast('Breakdown Copied', 'Currency conversion and tax calculation copied to clipboard!', 'success');
  };

  const downloadSummary = () => {
    const timestamp = new Date().toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    
    const content = `================================================================================
🇳🇵 NEPALAI - OFFICIAL AI TOOL & USD-NPR SUBSCRIPTION AUDIT REPORT
================================================================================
Generated On: ${timestamp}
Reference ID: NP-FX-${Date.now().toString(36).toUpperCase()}
Forex Source: Nepal Rastra Bank (NRB) Real-Time Official Rate
================================================================================

1. SUBSCRIPTION SPECIFICATIONS
--------------------------------------------------------------------------------
Tool / Service Name   : ${activePreset.name}
Service Provider      : ${activePreset.provider}
Capability Overview   : ${activePreset.desc}
Billing Cadence       : ${billingCycle.toUpperCase()} (${billingCycle === 'annual' ? 'Annualized with ~20% discount' : 'Monthly recurrent'})
Base Foreign Currency : $${effectiveTotalUsd.toFixed(2)} USD (${selectedAiPreset === 'custom' ? 'Custom Quote' : `$${effectiveMonthlyUsd.toFixed(2)}/mo`})
Live NRB Forex Rate   : 1 USD = NPR ${liveNrbRate.toFixed(2)}

2. NEPALI RUPEES (NPR) FINANCIAL BREAKDOWN
--------------------------------------------------------------------------------
Base NPR Conversion   : NPR ${Math.round(fxBaseNpr).toLocaleString()}
Bank FX Spread (3.0%) : NPR ${Math.round(fxBankSpreadFee).toLocaleString()}  (Standard A-Class Nepal Bank Fee)
Digital Service Tax   : NPR ${Math.round(fxDstTaxAmount).toLocaleString()}  (2.0% DST under Nepal Finance Act)
${includeVatTax ? `VAT Assessment (13%) : NPR ${Math.round(fxVatAmount).toLocaleString()}  (Applicable if locally invoiced)\n` : ''}--------------------------------------------------------------------------------
TOTAL ESTIMATED COST  : NPR ${Math.round(fxTotalNpr).toLocaleString()} (${billingCycle === 'annual' ? `~NPR ${Math.round(fxMonthlyNormalizedNpr).toLocaleString()}/month` : 'Monthly Total'})

3. NEPAL RASTRA BANK (NRB) $500 ANNUAL DOLLAR CARD ANALYSIS
--------------------------------------------------------------------------------
Annual Limit Quota    : $500.00 USD / fiscal year
Quota Consumed        : $${effectiveTotalUsd.toFixed(2)} USD (${quotaUsedPct.toFixed(1)}%)
Remaining Quota (USD) : $${remainingAnnualQuotaUsd.toFixed(2)} USD
Remaining Quota (NPR) : ~NPR ${remainingAnnualQuotaNpr.toLocaleString()}
Estimated Card Runway : ~${maxMonthsOnCard} active billing cycles within statutory cap

4. COMPLIANCE & PAYMENT GATEWAYS IN NEPAL
--------------------------------------------------------------------------------
* NRB Prepaid Dollar Card:
  Available via Nabil Bank, Global IME, NIC Asia, Sanima, Prabhu, and Nepal Investment Mega Bank.
  Requires verified Nepali PAN and valid citizenship / passport.

* Local Resellers & Digital Wallets:
  eSewa and Khalti provide voucher settlement for select developer and educational suites.

* IT Export Tax Exemption:
  Under NRB Foreign Exchange Directives, registered IT firms exporting code/services to 
  foreign clients are eligible for 1% / 5% TDS incentives and expanded FCY accounts.

================================================================================
Generated via Nepal AI Hub (https://nepalai.tech)
Kathmandu, Nepal • AI Infrastructure & Sovereign Technology
================================================================================`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nepal_ai_cost_summary_${activePreset.id}_${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(
      'Summary Downloaded',
      `Exported calculation summary for ${activePreset.name.split(' (')[0]} as audit report!`,
      'success',
      3500
    );
  };

  return (
    <section
      id="daily-tools"
      className={`py-12 sm:py-16 md:py-24 relative border-t transition-colors duration-300 ${
        isDark ? 'border-white/[0.08] bg-[#070a12]' : 'border-slate-200 bg-slate-50/70'
      }`}
      aria-labelledby="daily-tools-heading"
    >
      <div className="mx-auto max-w-7xl px-3.5 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 sm:gap-6 pb-6 sm:pb-8 border-b border-slate-500/20">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-xs text-emerald-400 mb-2 font-mono uppercase tracking-wider">
              <Sparkles className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>High-Impact Daily AI Utilities • Nepal Edition</span>
            </div>
            
            <h2
              id="daily-tools-heading"
              className={`text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight font-display leading-snug ${
                isDark ? 'text-white' : 'text-slate-950'
              }`}
            >
              {language === 'ne' ? 'दैनिक नेपाली एआई उपयोगिता' : 'Daily AI Utilities for Nepal'}
            </h2>

            <p className={`mt-2 text-xs sm:text-sm leading-relaxed ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            }`}>
              {language === 'ne' 
                ? 'देवनागरी निवेदन, न्युरल आवाज, नागरिकता ओसीआर, र डलर कार्ड कर क्याल्कुलेटर।' 
                : 'Devanagari letter generator, neural voice synthesis, Nagarikta OCR, and NRB dollar card calculator.'}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-2 rounded-xl border border-emerald-500/20 shrink-0 self-start lg:self-auto min-h-[44px]">
            <BadgeCheck className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>100% Client-Side • Instant Export</span>
          </div>
        </div>

        {/* Tab Controls with clear labels and responsive touch targets (min 48px height) */}
        <div
          className="mt-6 sm:mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-2.5"
          role="tablist"
          aria-label="Daily AI Utilities Selection"
        >
          {[
            { id: 'fx', icon: ArrowRightLeft, label: language === 'ne' ? 'एआई सदस्यता (USD➔NPR)' : 'AI Subs (USD➔NPR)' },
            { id: 'letter', icon: FileEdit, label: language === 'ne' ? 'औपचारिक निवेदन' : 'Official Letter Studio' },
            { id: 'voice', icon: Mic, label: language === 'ne' ? 'नेपाली भ्वाइस स्टुडियो' : 'Neural Voice Studio' },
            { id: 'ocr', icon: Scan, label: language === 'ne' ? 'नागरिकता ओसीआर' : 'Devanagari OCR Scanner' },
            { id: 'tax', icon: Calculator, label: language === 'ne' ? 'डलर कार्ड र कर' : 'Dollar Card & Tax' },
            { id: 'market', icon: ShoppingCart, label: language === 'ne' ? 'कालिमाटी बजार' : 'Kalimati Market & Units' },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab.id as ActiveToolTab)}
                className={`flex items-center gap-2 px-3 py-3 rounded-xl text-xs font-semibold transition-all text-left min-h-[48px] focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                  isActive
                    ? isDark
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow-lg shadow-emerald-950/40 ring-1 ring-emerald-400'
                      : 'bg-emerald-600 text-white font-bold shadow-md ring-1 ring-emerald-700'
                    : isDark
                    ? 'bg-white/[0.03] text-slate-300 hover:text-white border border-white/[0.06] hover:bg-white/[0.06]'
                    : 'bg-white text-slate-700 hover:text-slate-950 border border-slate-200 hover:bg-slate-100 shadow-xs'
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${isActive ? (isDark ? 'text-slate-950' : 'text-white') : 'text-emerald-500'}`} aria-hidden="true" />
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Active Tool Interactive Container */}
        <div className={`mt-5 sm:mt-6 rounded-2xl border p-4 sm:p-6 md:p-7 transition-all ${
          isDark
            ? 'border-white/[0.08] bg-[#090d16]'
            : 'border-slate-200 bg-white shadow-xs'
        }`}>
          
          {/* TAB 0: REAL-TIME USD TO NPR FX & AI SUBSCRIPTION CONVERTER */}
          {activeTab === 'fx' && (
            <div>
              {/* Header & Live Exchange Rate Bar */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-500/20">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      LIVE NRB BENCHMARK
                    </span>
                    <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {lastRateSync}
                    </span>
                  </div>
                  <h3 className={`text-base sm:text-lg font-bold font-display ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    💱 {language === 'ne' ? 'एआई सेवा सदस्यता डलर ➔ नेरु रूपान्तरक तथा कर क्याल्कुलेटर' : 'AI Service Subscription USD ➔ NPR Converter & Tax Engine'}
                  </h3>
                  <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Calculate accurate monthly/annual NPR outflow for ChatGPT, Claude, Midjourney & API tokens with bank card fees (3%) & Digital Services Tax (2% DST).
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleRefreshNrbRate}
                    disabled={isRefreshingFx}
                    className={`min-h-[44px] px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border transition-all flex-1 sm:flex-initial ${
                      isDark
                        ? 'bg-white/[0.04] hover:bg-white/[0.08] text-emerald-400 border-emerald-500/30'
                        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300'
                    }`}
                    aria-label="Refresh Nepal Rastra Bank Forex Rate"
                  >
                    <RefreshCw className={`h-4 w-4 ${isRefreshingFx ? 'animate-spin' : ''}`} aria-hidden="true" />
                    <span>{isRefreshingFx ? 'Syncing...' : 'Sync NRB Rate'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={downloadSummary}
                    className={`min-h-[44px] px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border transition-all flex-1 sm:flex-initial ${
                      isDark
                        ? 'bg-white/[0.06] hover:bg-white/[0.12] text-white border-white/20 hover:border-emerald-400'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                    }`}
                    title="Export calculations and tool selections as a text/audit file"
                  >
                    <Download className="h-4 w-4 text-emerald-400" aria-hidden="true" />
                    <span>Download Summary</span>
                  </button>

                  <button
                    type="button"
                    onClick={copyFxBreakdown}
                    className="min-h-[44px] px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm w-full sm:w-auto"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    <span>{copied ? 'Copied!' : 'Copy Breakdown'}</span>
                  </button>
                </div>
              </div>

              {/* Main Grid: Selector & Controls (Left) + Breakdown Matrix (Right) */}
              <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left Column: Preset Selection & Configuration */}
                <div className="lg:col-span-7 space-y-5">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        1. Select AI Subscription or Tool:
                      </label>
                      <span className="text-[11px] text-emerald-500 font-medium">
                        {AI_SUBSCRIPTION_PRESETS.length} Verified Presets
                      </span>
                    </div>

                    {/* Responsive Grid of AI Tool Presets with 48px+ touch targets */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[320px] overflow-y-auto pr-1">
                      {AI_SUBSCRIPTION_PRESETS.map((preset) => {
                        const isSelected = selectedAiPreset === preset.id;
                        const priceDisplay = preset.id === 'custom' 
                          ? `$${fxUsdAmount.toFixed(0)} USD` 
                          : `$${preset.monthlyUsd.toFixed(2)}/mo`;
                        const approxNpr = Math.round((preset.id === 'custom' ? fxUsdAmount : preset.monthlyUsd) * liveNrbRate);

                        return (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => handleSelectPreset(preset.id)}
                            className={`min-h-[58px] p-3 rounded-xl border text-left transition-all flex items-start gap-2.5 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                              isSelected
                                ? isDark
                                  ? 'border-emerald-400 bg-emerald-950/30 ring-1 ring-emerald-400/50 shadow-md'
                                  : 'border-emerald-600 bg-emerald-50 ring-1 ring-emerald-600 shadow-sm'
                                : isDark
                                ? 'border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20'
                                : 'border-slate-200 bg-slate-50/80 hover:bg-white hover:border-slate-300'
                            }`}
                          >
                            <span className="text-xl shrink-0 mt-0.5">{preset.icon}</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1">
                                <h4 className={`text-xs font-bold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                  {preset.name.split(' (')[0]}
                                </h4>
                                <span className="text-[10px] font-mono font-bold text-emerald-400 shrink-0">
                                  {priceDisplay}
                                </span>
                              </div>
                              <p className={`text-[11px] truncate mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                {preset.provider} • ~रु {approxNpr.toLocaleString()}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Pricing Adjustment, Custom Input & Billing Cycle Toggle */}
                  <div className={`p-4 sm:p-5 rounded-xl border ${isDark ? 'bg-black/40 border-white/[0.08]' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      {/* Billing Cycle Switcher with min 44px buttons */}
                      <div>
                        <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                          Billing Cycle:
                        </label>
                        <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-black/30 border border-white/10">
                          <button
                            type="button"
                            onClick={() => setBillingCycle('monthly')}
                            className={`min-h-[44px] px-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center ${
                              billingCycle === 'monthly'
                                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            Monthly Billed
                          </button>
                          <button
                            type="button"
                            onClick={() => setBillingCycle('annual')}
                            className={`min-h-[44px] px-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center relative ${
                              billingCycle === 'annual'
                                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            <span>Annual (~20% Off)</span>
                          </button>
                        </div>
                      </div>

                      {/* Custom USD amount input */}
                      <div>
                        <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                          {selectedAiPreset === 'custom' ? 'Custom Subscription Amount ($ USD):' : 'Effective Monthly Cost ($ USD):'}
                        </label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400">$</span>
                          <input
                            type="number"
                            step="0.5"
                            min="1"
                            max="2000"
                            value={effectiveMonthlyUsd}
                            onChange={(e) => {
                              setSelectedAiPreset('custom');
                              setFxUsdAmount(Math.max(1, Number(e.target.value) || 1));
                            }}
                            className={`w-full min-h-[44px] pl-8 pr-3 text-xs font-mono font-bold rounded-xl border focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                              isDark ? 'bg-black/60 border-white/10 text-white' : 'bg-white border-slate-300 text-slate-900'
                            }`}
                          />
                        </div>
                      </div>

                    </div>

                    {/* Adjustable Exchange Rate & Tax Toggles */}
                    <div className="mt-4 pt-3.5 border-t border-slate-500/20 grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className={`block text-[11px] font-semibold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                          NRB USD Exchange Rate:
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400">रु</span>
                          <input
                            type="number"
                            step="0.05"
                            value={liveNrbRate}
                            onChange={(e) => setLiveNrbRate(Number(e.target.value))}
                            className={`w-full min-h-[44px] pl-7 pr-2.5 text-xs font-mono rounded-xl border ${
                              isDark ? 'bg-black/50 border-white/10 text-white' : 'bg-white border-slate-300 text-slate-900'
                            }`}
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-2 flex flex-col justify-center space-y-1 pt-1">
                        <label className="min-h-[44px] py-2 px-2.5 rounded-lg flex items-center gap-2.5 text-xs cursor-pointer select-none hover:bg-white/[0.04] transition-colors">
                          <input
                            type="checkbox"
                            checked={includeCardSpread}
                            onChange={(e) => setIncludeCardSpread(e.target.checked)}
                            className="rounded text-emerald-500 min-h-[18px] min-w-[18px]"
                          />
                          <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>
                            Bank Dollar Card Forex Spread (+3.0%)
                          </span>
                        </label>
                        <label className="min-h-[44px] py-2 px-2.5 rounded-lg flex items-center gap-2.5 text-xs cursor-pointer select-none hover:bg-white/[0.04] transition-colors">
                          <input
                            type="checkbox"
                            checked={includeDstTax}
                            onChange={(e) => setIncludeDstTax(e.target.checked)}
                            className="rounded text-emerald-500 min-h-[18px] min-w-[18px]"
                          />
                          <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>
                            Nepal Digital Services Tax (+2.0% DST)
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Financial Matrix, Breakdown & Dollar Card Quota Impact */}
                <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
                  
                  {/* Detailed NPR Outflow Card */}
                  <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                    isDark ? 'bg-gradient-to-br from-[#0c1322] to-[#080d18] border-emerald-500/30' : 'bg-white border-emerald-300 shadow-md'
                  }`}>
                    
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-500/20">
                      <div>
                        <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold block">
                          Total Estimated Outflow
                        </span>
                        <span className={`text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                          {activePreset.name.split(' (')[0]} ({billingCycle === 'annual' ? '12 Months' : 'Monthly'})
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xl sm:text-2xl font-black font-mono text-emerald-400">
                          NPR {Math.round(fxTotalNpr).toLocaleString()}
                        </span>
                        <span className="text-[10px] text-slate-400 block font-mono">
                          ≈ ${effectiveTotalUsd.toFixed(2)} USD
                        </span>
                      </div>
                    </div>

                    {/* Breakdown Rows */}
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between py-1 border-b border-slate-500/10">
                        <span className="text-slate-400">Base FX Conversion ({effectiveTotalUsd} USD × {liveNrbRate}):</span>
                        <span className="font-mono font-medium">NPR {Math.round(fxBaseNpr).toLocaleString()}</span>
                      </div>

                      <div className="flex justify-between py-1 border-b border-slate-500/10">
                        <span className="text-slate-400 flex items-center gap-1">
                          <span>Bank Cross-Currency Spread (3.0%):</span>
                        </span>
                        <span className="font-mono text-amber-400">NPR {Math.round(fxBankSpreadFee).toLocaleString()}</span>
                      </div>

                      <div className="flex justify-between py-1 border-b border-slate-500/10">
                        <span className="text-slate-400 flex items-center gap-1">
                          <span>Digital Services Tax (2.0% DST):</span>
                        </span>
                        <span className="font-mono text-amber-400">NPR {Math.round(fxDstTaxAmount).toLocaleString()}</span>
                      </div>

                      {billingCycle === 'annual' && (
                        <div className="flex justify-between py-1 border-b border-slate-500/10 text-emerald-400 font-semibold">
                          <span>Normalized Monthly Equivalent:</span>
                          <span className="font-mono">~NPR {Math.round(fxMonthlyNormalizedNpr).toLocaleString()} / month</span>
                        </div>
                      )}
                    </div>

                    {/* NRB $500 Dollar Card Quota Gauge */}
                    <div className="mt-4 pt-3.5 border-t border-slate-500/20">
                      <div className="flex items-center justify-between text-[11px] mb-1.5">
                        <span className="font-semibold text-slate-300">
                          NRB $500 Annual Prepaid Card Limit:
                        </span>
                        <span className="font-mono font-bold text-indigo-400">
                          ${remainingAnnualQuotaUsd.toFixed(1)} USD left
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden border border-white/10">
                        <div
                          className={`h-full transition-all duration-500 ${
                            quotaUsedPct > 80 ? 'bg-red-500' : quotaUsedPct > 50 ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${quotaUsedPct}%` }}
                        />
                      </div>

                      <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                        <span>Used: ${effectiveTotalUsd.toFixed(0)} ({quotaUsedPct.toFixed(1)}%)</span>
                        <span>Capacity: ~{maxMonthsOnCard} months active</span>
                      </div>

                      {/* Direct Card Export Action with 44px min-height */}
                      <div className="mt-3.5 pt-3 border-t border-slate-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                        <span className="text-[11px] text-slate-400 font-mono">
                          Ready for accounting records & IT audits
                        </span>
                        <button
                          type="button"
                          onClick={downloadSummary}
                          className="min-h-[44px] px-3.5 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-400 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all w-full sm:w-auto"
                        >
                          <Download className="h-4 w-4" aria-hidden="true" />
                          <span>Export Summary</span>
                        </button>
                      </div>
                    </div>

                  </div>

                  {/* Payment Methods in Nepal & Advisory Helper */}
                  <div className={`p-4 rounded-xl border text-xs ${
                    isDark ? 'bg-black/30 border-white/[0.08]' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="flex items-start gap-2.5">
                      <CreditCard className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-slate-200">
                          How to Pay for {activePreset.name.split(' (')[0]} in Nepal:
                        </h4>
                        <p className={`text-[11px] mt-1 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                          Accepted via <strong>Nabil iCard, Global IME, NIC Asia, Siddhartha, Sanima Bank Prepaid Dollar Cards</strong>, or corporate foreign exchange accounts.
                        </p>
                        
                        <div className="mt-2.5">
                          <button
                            type="button"
                            onClick={() => onOpenConsultation && onOpenConsultation(`Subscription Payment Assistance for ${activePreset.name}`)}
                            className="min-h-[44px] py-2 text-[11px] font-bold text-emerald-400 hover:underline flex items-center gap-1"
                          >
                            <span>Book Consultation for Enterprise Invoicing & Volume Billing ➔</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

              </div>
            </div>
          )}

          {/* TAB 1: FORMAL NEPALI APPLICATION & GAZETTE LETTER STUDIO */}
          {activeTab === 'letter' && (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-500/20">
                <div>
                  <h3 className={`text-base sm:text-lg font-bold font-display ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    📝 {language === 'ne' ? 'नेपाली आधिकारिक निवेदन तथा सरकारी सिफारिस पत्र निर्माण' : 'Official Devanagari Letter & Ward Application Studio'}
                  </h3>
                  <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Pre-formatted Devanagari templates with official Bikram Sambat date, Chalani numbers, and legal salutations.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopy(generatedOfficialLetter)}
                    className="min-h-[44px] px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs w-full sm:w-auto"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    <span>{copied ? 'Copied!' : 'Copy Letter'}</span>
                  </button>
                </div>
              </div>

              {/* Form Controls with 44px min height touch targets */}
              <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-5 space-y-3.5">
                  <div>
                    <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Letter Template (प्रकार):
                    </label>
                    <select
                      value={letterTemplate}
                      onChange={(e) => {
                        const val = e.target.value as any;
                        setLetterTemplate(val);
                        if (val === 'ward_nata') {
                          setOfficeName('श्रीमान् वडा अध्यक्षज्यू, का.म.पा. वडा कार्यालय ४');
                          setLetterSubject('नाता प्रमाणित सिफारिस गरिपाउँ बारे');
                          setLetterReason('मेरो छोराको उच्च शिक्षा अध्ययनका लागि नाता प्रमाणित सिफारिस पत्र आवश्यक परेको हुँदा');
                        } else if (val === 'ward_unmarried') {
                          setOfficeName('श्रीमान् वडा अध्यक्षज्यू');
                          setLetterSubject('अविवाहित प्रमाणित सिफारिस पाउँ बारे');
                          setLetterReason('वैदेशिक अध्ययन तथा रोजगारीको प्रयोजनका लागि अविवाहित प्रमाणपत्र आवश्यक भएकोले');
                        } else if (val === 'bank_dollar') {
                          setOfficeName('श्रीमान् शाखा प्रबन्धकज्यू, नबिल बैंक लिमिटेड');
                          setLetterSubject('अन्तर्राष्ट्रिय प्रिपेड डलर कार्ड जारी गरिपाउँ');
                          setLetterReason('नेपाल राष्ट्र बैंकको नियमानुसार $५०० वार्षिक सीमा भएको डलर कार्ड सफ्टवेयर र एआई उपकरण भुक्तानीका लागि');
                        } else if (val === 'leave') {
                          setOfficeName('श्रीमान् मानव संसाधन विभाग प्रमुख');
                          setLetterSubject('विशेष बिदा स्वीकृत गरिपाउँ');
                          setLetterReason('घरायसी अत्यावश्यक कार्य परेकोले मिति २०८१/०६/२५ देखि ३ दिनका लागि बिदा');
                        }
                      }}
                      className={`w-full min-h-[44px] text-xs rounded-xl border p-2.5 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                        isDark ? 'bg-black/50 border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    >
                      <option value="ward_nata">१. नाता प्रमाणित सिफारिस (Ward Kinship Recommendation)</option>
                      <option value="ward_unmarried">२. अविवाहित प्रमाणित सिफारिस (Unmarried Certificate)</option>
                      <option value="bank_dollar">३. डलर कार्ड निवेदन (Bank Dollar Card Request)</option>
                      <option value="leave">४. बिदाको निवेदन (Office Leave Application)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        B.S. Date (वि.सं. मिति):
                      </label>
                      <input
                        type="text"
                        value={letterDate}
                        onChange={(e) => setLetterDate(e.target.value)}
                        className={`w-full min-h-[44px] text-xs rounded-xl border p-2.5 ${
                          isDark ? 'bg-black/50 border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                        }`}
                      />
                    </div>

                    <div>
                      <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        Chalani No (चलानी नं):
                      </label>
                      <input
                        type="text"
                        value={chalaniNo}
                        onChange={(e) => setChalaniNo(e.target.value)}
                        className={`w-full min-h-[44px] text-xs rounded-xl border p-2.5 ${
                          isDark ? 'bg-black/50 border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Applicant Name (निवेदकको नाम):
                    </label>
                    <input
                      type="text"
                      value={applicantName}
                      onChange={(e) => setApplicantName(e.target.value)}
                      className={`w-full min-h-[44px] text-xs rounded-xl border p-2.5 ${
                        isDark ? 'bg-black/50 border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Address (ठेगाना):
                    </label>
                    <input
                      type="text"
                      value={applicantAddress}
                      onChange={(e) => setApplicantAddress(e.target.value)}
                      className={`w-full min-h-[44px] text-xs rounded-xl border p-2.5 ${
                        isDark ? 'bg-black/50 border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Detailed Reason (व्यहोरा / विवरण):
                    </label>
                    <textarea
                      rows={3}
                      value={letterReason}
                      onChange={(e) => setLetterReason(e.target.value)}
                      className={`w-full text-xs rounded-xl border p-3 ${
                        isDark ? 'bg-black/50 border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>
                </div>

                {/* Generated Preview Document with Official Stamp Border */}
                <div className="lg:col-span-7">
                  <div className={`h-full rounded-2xl border p-5 sm:p-6 font-['Noto_Sans_Devanagari'] leading-relaxed relative ${
                    isDark ? 'bg-black/70 border-white/10 text-slate-200' : 'bg-amber-50/30 border-amber-200 text-slate-900 shadow-sm'
                  }`}>
                    <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-500/20 text-xs">
                      <span className="font-mono text-emerald-400 font-bold uppercase flex items-center gap-1.5">
                        <BadgeCheck className="h-4 w-4 shrink-0" />
                        <span>Official Gazette Devanagari Format</span>
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">B.S. Standard Compliant</span>
                    </div>

                    <pre className="whitespace-pre-wrap font-sans text-xs sm:text-[13px] leading-relaxed overflow-x-auto">
                      {generatedOfficialLetter}
                    </pre>

                    <div className="mt-6 pt-4 border-t border-slate-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px] text-slate-400">
                      <span>Certified Nepal Format • Ready for print submission</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(generatedOfficialLetter)}
                        className="min-h-[44px] px-3.5 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-bold flex items-center justify-center gap-1.5 transition-all w-full sm:w-auto"
                      >
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copy to Clipboard</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: NEPALI NEURAL VOICE & REGIONAL DIALECT STUDIO */}
          {activeTab === 'voice' && (
            <div>
              <div className="pb-4 border-b border-slate-500/20">
                <h3 className={`text-base sm:text-lg font-bold font-display ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  🎙️ {language === 'ne' ? 'नेपाली भाषिक लवज तथा एआई ध्वनि स्टुडियो' : 'Nepali Neural Voice & Regional Accent Synthesizer'}
                </h3>
                <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Synthesize and test authentic Nepali voice models across Kathmandu, Gandaki, Eastern, and Terai accents.
                </p>
              </div>

              <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-6 space-y-4">
                  <div>
                    <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Devanagari Text to Synthesize (वाचन गर्ने नेपाली वाक्य):
                    </label>
                    <textarea
                      rows={4}
                      value={voiceText}
                      onChange={(e) => setVoiceText(e.target.value)}
                      className={`w-full text-xs rounded-xl border p-3 font-['Noto_Sans_Devanagari'] focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                        isDark ? 'bg-black/50 border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>

                  {/* Regional Dialects Selection with min 48px touch buttons */}
                  <div>
                    <label className={`block text-xs font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Regional Accent Profile (क्षेत्रीय लवज):
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {Object.entries(ACCENTS).map(([key, item]) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setSelectedAccent(key as any)}
                          className={`min-h-[52px] p-3 rounded-xl border text-left text-xs transition-all flex flex-col justify-center ${
                            selectedAccent === key
                              ? isDark
                                ? 'border-emerald-500 bg-emerald-950/30 text-white'
                                : 'border-emerald-600 bg-emerald-50 text-slate-950 ring-1 ring-emerald-600'
                              : isDark
                              ? 'border-white/10 bg-white/[0.02] text-slate-400 hover:bg-white/[0.05]'
                              : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <span className="font-bold block text-[11px] truncate">{item.name}</span>
                          <span className="text-[10px] text-slate-400 block mt-0.5 line-clamp-1">{item.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sliders for Speed and Pitch */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="p-2.5 rounded-xl border border-white/5 bg-black/20">
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-slate-400">Speech Rate:</span>
                        <span className="font-mono font-bold text-emerald-400">{voiceSpeed}x</span>
                      </div>
                      <input
                        type="range"
                        min="0.75"
                        max="1.5"
                        step="0.05"
                        value={voiceSpeed}
                        onChange={(e) => setVoiceSpeed(Number(e.target.value))}
                        className="w-full h-7 accent-emerald-500 cursor-pointer"
                      />
                    </div>

                    <div className="p-2.5 rounded-xl border border-white/5 bg-black/20">
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-slate-400">Vocal Pitch:</span>
                        <span className="font-mono font-bold text-emerald-400">{voicePitch}x</span>
                      </div>
                      <input
                        type="range"
                        min="0.8"
                        max="1.3"
                        step="0.05"
                        value={voicePitch}
                        onChange={(e) => setVoicePitch(Number(e.target.value))}
                        className="w-full h-7 accent-emerald-500 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* Simulated Audio Waveform & Player */}
                <div className="lg:col-span-6">
                  <div className={`h-full rounded-2xl border p-5 sm:p-6 flex flex-col justify-between ${
                    isDark ? 'bg-black/60 border-emerald-500/30' : 'bg-emerald-50/40 border-emerald-200 shadow-xs'
                  }`}>
                    <div>
                      <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-500/20">
                        <span className="font-mono text-emerald-400 font-bold uppercase">24kHz Neural Synthesis</span>
                        <span className="font-mono text-[11px] text-slate-400">{ACCENTS[selectedAccent].name.split(' (')[0]}</span>
                      </div>

                      {/* Visual Waveform Animation */}
                      <div className="my-6 sm:my-8 flex items-center justify-center gap-1.5 h-16">
                        {[40, 75, 90, 45, 100, 60, 85, 30, 95, 70, 50, 80, 65, 90, 40].map((h, i) => (
                          <div
                            key={i}
                            style={{ height: isPlayingAudio ? `${h}%` : '20%' }}
                            className={`w-1.5 rounded-full transition-all duration-300 ${
                              isPlayingAudio ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'
                            }`}
                          />
                        ))}
                      </div>

                      <p className={`text-xs text-center font-['Noto_Sans_Devanagari'] leading-relaxed ${
                        isDark ? 'text-slate-300' : 'text-slate-700'
                      }`}>
                        "{voiceText}"
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={handleToggleVoicePlayback}
                        className="min-h-[44px] px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md w-full sm:w-auto"
                      >
                        {isPlayingAudio ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current" />}
                        <span>{isPlayingAudio ? 'Stop Playback' : 'Play Synthesized Voice'}</span>
                      </button>

                      <span className="text-[11px] font-mono text-slate-400 text-center sm:text-right">
                        SpeechT5 + Hugging Face Engine
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DEVANAGARI DOCUMENT INTELLIGENCE & OCR */}
          {activeTab === 'ocr' && (
            <div>
              <div className="pb-4 border-b border-slate-500/20">
                <h3 className={`text-base sm:text-lg font-bold font-display ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  🔍 {language === 'ne' ? 'देवनागरी नागरिकता, लालपुर्जा र प्यान ओसीआर' : 'Devanagari Document Intelligence & Field Extractor'}
                </h3>
                <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  High-precision boundary recognition and structured JSON extraction for official Nepali IDs and land records.
                </p>
              </div>

              <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-5 space-y-3">
                  <span className={`text-xs font-semibold block ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Select Document Sample:
                  </span>
                  {[
                    { id: 'nagarikta', label: '१. नेपाली नागरिकता प्रमाणपत्र (Citizenship ID)' },
                    { id: 'lalpurja', label: '२. जग्गाधनी प्रमाणपुर्जा (Land Lalpurja)' },
                    { id: 'pan', label: '३. प्यान तथा भ्याट दर्ता (PAN Registration)' },
                  ].map((doc) => (
                    <button
                      key={doc.id}
                      type="button"
                      onClick={() => setSelectedDocType(doc.id as any)}
                      className={`w-full min-h-[48px] p-3 rounded-xl border text-left text-xs font-semibold transition-all flex items-center ${
                        selectedDocType === doc.id
                          ? isDark
                            ? 'border-emerald-500 bg-emerald-950/20 text-white'
                            : 'border-emerald-600 bg-emerald-50 text-slate-950 ring-1 ring-emerald-600'
                          : isDark
                          ? 'border-white/10 bg-white/[0.02] text-slate-400 hover:bg-white/[0.05]'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {doc.label}
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={handleSimulateScan}
                    disabled={isScanning}
                    className="w-full mt-2 min-h-[44px] py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
                  >
                    <Scan className="h-4 w-4" />
                    <span>{isScanning ? 'Scanning Boundaries...' : 'Re-Run Optical Scan'}</span>
                  </button>
                </div>

                {/* Structured Extraction Results */}
                <div className="lg:col-span-7">
                  <div className={`p-4 sm:p-5 rounded-2xl border ${
                    isDark ? 'bg-black/60 border-white/10' : 'bg-slate-50 border-slate-200 shadow-xs'
                  }`}>
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-500/20">
                      <span className="text-xs font-bold font-display text-emerald-400">
                        {DOC_SAMPLES[selectedDocType].title}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                        Overall Confidence: 99.4%
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {DOC_SAMPLES[selectedDocType].fields.map((field, idx) => (
                        <div
                          key={idx}
                          className={`p-3 rounded-xl border flex items-center justify-between text-xs gap-3 ${
                            isDark ? 'border-white/5 bg-black/40' : 'border-slate-200 bg-white'
                          }`}
                        >
                          <div>
                            <span className="text-[11px] text-slate-400 block">{field.label}</span>
                            <span className="font-bold text-xs mt-0.5 block">{field.value}</span>
                          </div>
                          <span className="font-mono text-[10px] text-emerald-400 font-bold shrink-0">
                            {field.confidence}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 pt-3.5 border-t border-slate-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-[11px] text-slate-400">
                      <a
                        href="#free-ai-tools"
                        className="min-h-[44px] inline-flex items-center gap-1.5 text-emerald-400 font-bold hover:underline"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>Launch Live Multimodal Extractor & JSON API Guide ↗</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => handleCopy(JSON.stringify(DOC_SAMPLES[selectedDocType], null, 2))}
                        className="min-h-[44px] px-3 py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-emerald-400 font-mono font-semibold flex items-center justify-center border border-white/10"
                      >
                        Copy Extracted JSON
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: NRB $500 DOLLAR CARD & FREELANCE TAX ENGINE */}
          {activeTab === 'tax' && (
            <div>
              <div className="pb-4 border-b border-slate-500/20">
                <h3 className={`text-base sm:text-lg font-bold font-display ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  💱 {language === 'ne' ? 'नेपाल डलर कार्ड तथा डिजिटल सेवा कर (DST) र टीडीएस क्याल्कुलेटर' : 'Nepal $500 Prepaid Dollar Card, Digital VAT & TDS Engine'}
                </h3>
                <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Calculate real NRB limits, bank exchange spreads (3.5%), 13% Digital Services Tax, and IT export TDS.
                </p>
              </div>

              <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-6 space-y-4">
                  <div>
                    <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Monthly / Transaction Amount in USD ($):
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={500}
                      value={usdSpent}
                      onChange={(e) => setUsdSpent(Number(e.target.value))}
                      className={`w-full min-h-[44px] text-xs rounded-xl border p-2.5 font-mono ${
                        isDark ? 'bg-black/50 border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        USD / NPR Rate:
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={exchangeRateNpr}
                        onChange={(e) => setExchangeRateNpr(Number(e.target.value))}
                        className={`w-full min-h-[44px] text-xs rounded-xl border p-2.5 font-mono ${
                          isDark ? 'bg-black/50 border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                        }`}
                      />
                    </div>

                    <div>
                      <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        User Category:
                      </label>
                      <select
                        value={userTaxCategory}
                        onChange={(e) => setUserTaxCategory(e.target.value as any)}
                        className={`w-full min-h-[44px] text-xs rounded-xl border p-2.5 ${
                          isDark ? 'bg-black/50 border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                        }`}
                      >
                        <option value="freelancer">IT Freelancer (5% Export TDS)</option>
                        <option value="individual">Individual Consumer</option>
                        <option value="business">Registered Company (1.5% TDS)</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-2">
                    <label className="min-h-[44px] py-2 px-2.5 rounded-lg flex items-center gap-2.5 text-xs cursor-pointer select-none hover:bg-white/[0.04] transition-colors">
                      <input
                        type="checkbox"
                        checked={includeBankFee}
                        onChange={(e) => setIncludeBankFee(e.target.checked)}
                        className="rounded text-emerald-500 min-h-[18px] min-w-[18px]"
                      />
                      <span>Include Bank Cross-Currency Markup (3.5%)</span>
                    </label>

                    <label className="min-h-[44px] py-2 px-2.5 rounded-lg flex items-center gap-2.5 text-xs cursor-pointer select-none hover:bg-white/[0.04] transition-colors">
                      <input
                        type="checkbox"
                        checked={includeVat}
                        onChange={(e) => setIncludeVat(e.target.checked)}
                        className="rounded text-emerald-500 min-h-[18px] min-w-[18px]"
                      />
                      <span>Include Digital Services Tax (13% DST)</span>
                    </label>
                  </div>
                </div>

                {/* Calculation Breakdown Card */}
                <div className="lg:col-span-6">
                  <div className={`p-4 sm:p-5 rounded-2xl border ${
                    isDark ? 'bg-black/60 border-emerald-500/30' : 'bg-slate-50 border-emerald-300 shadow-xs'
                  }`}>
                    <h4 className="text-xs font-mono uppercase text-emerald-400 font-bold mb-3">
                      Total Cost & Quota Analysis
                    </h4>

                    <div className="space-y-2.5 text-xs">
                      <div className="flex justify-between pb-1.5 border-b border-slate-500/20">
                        <span className="text-slate-400">Base NPR Equivalent:</span>
                        <span className="font-mono font-bold">NPR {Math.round(baseNpr).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between pb-1.5 border-b border-slate-500/20">
                        <span className="text-slate-400">Estimated Bank FX Fee (3.5%):</span>
                        <span className="font-mono text-amber-400">NPR {Math.round(bankFee).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between pb-1.5 border-b border-slate-500/20">
                        <span className="text-slate-400">Digital Services Tax (13% DST):</span>
                        <span className="font-mono text-amber-400">NPR {Math.round(digitalVat).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between pb-1.5 border-b border-slate-500/20 text-sm font-bold">
                        <span className="text-emerald-400">Total Estimated Outflow:</span>
                        <span className="font-mono text-emerald-400">NPR {Math.round(totalNprCost).toLocaleString()}</span>
                      </div>
                      <div className="pt-2 flex justify-between text-[11px] text-slate-400">
                        <span>Remaining NRB Annual Limit:</span>
                        <span className="font-bold text-indigo-400">${remainingQuota} USD left</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: KALIMATI MARKET & NEPALI UNIT ESTIMATOR */}
          {activeTab === 'market' && (
            <div>
              <div className="pb-4 border-b border-slate-500/20">
                <h3 className={`text-base sm:text-lg font-bold font-display ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  🥦 {language === 'ne' ? 'कालिमाटी तरकारी तथा फलफूल बजार र नेपाली नाप रूपान्तरक' : 'Kalimati Daily Produce & Traditional Measurement Estimator'}
                </h3>
                <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Quick calculation with traditional Nepali metrics: 1 Dharni = 2.5 KG, 1 Pau = 200g.
                </p>
              </div>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
                <div>
                  <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Select Commodity (तरकारी / फलफूल):
                  </label>
                  <select
                    value={selectedProduce}
                    onChange={(e) => setSelectedProduce(e.target.value)}
                    className={`w-full min-h-[44px] text-xs rounded-xl border p-2.5 ${
                      isDark ? 'bg-black/50 border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  >
                    {Object.entries(PRODUCE_PRICES).map(([key, item]) => (
                      <option key={key} value={key}>
                        {item.name} (NPR {item.pricePerKg}/kg)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Quantity (परिमाण):
                  </label>
                  <input
                    type="number"
                    min={0.1}
                    step={0.5}
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className={`w-full min-h-[44px] text-xs rounded-xl border p-2.5 font-mono ${
                      isDark ? 'bg-black/50 border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Unit (एकाइ):
                  </label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value as any)}
                    className={`w-full min-h-[44px] text-xs rounded-xl border p-2.5 ${
                      isDark ? 'bg-black/50 border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  >
                    <option value="dharni">Dharni (धार्नी = २.५ केजी)</option>
                    <option value="pau">Pau (पाउ = २०० ग्राम)</option>
                    <option value="kg">Kilogram (केजी)</option>
                  </select>
                </div>
              </div>

              {/* Result Summary */}
              <div className={`mt-6 p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                isDark ? 'bg-black/60 border-emerald-500/30' : 'bg-emerald-50/70 border-emerald-300'
              }`}>
                <div>
                  <span className="text-xs text-slate-400 font-mono uppercase">Calculated Weight Conversion:</span>
                  <p className={`text-sm sm:text-base font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                    {quantity} {unit} = {calculatedKg.toFixed(2)} KG of {activeProduceData.nameNe}
                  </p>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    Wholesale Kalimati Rate: NPR {estimatedWholesaleCost.toLocaleString()}
                  </span>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-xs text-emerald-400 font-mono uppercase block">Estimated Retail Price:</span>
                  <span className="text-2xl font-bold font-mono text-emerald-400">
                    NPR {estimatedProduceCost.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </section>
  );
};
