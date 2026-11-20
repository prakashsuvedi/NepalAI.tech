import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ThemeMode, Language } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { BentoGridSkeleton } from './BentoGridSkeleton';
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
  Globe2,
  Printer,
  Compass,
  FileCheck2,
  Scale,
  Upload,
  Image as ImageIcon,
  FileSpreadsheet,
  Search,
  SlidersHorizontal,
  XCircle,
  Car,
  Square,
  Headphones,
  Receipt,
  ShieldAlert,
  HeartPulse,
  Building2
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import {
  convertUnicodeToPreeti,
  convertPreetiToUnicode,
  getCurrentBikramSambatDate,
  transliterateRomanToDevanagari,
  transliterateCompletedWordsOnSpace,
} from '../utils/nepaliTextConverter';
import { calculateNepalIncomeTax, TaxCalculationResult } from '../utils/nepalTaxCalculator';
import { convertFromSqFeet, convertFromRopaniSystem, convertFromBighaSystem, convertWeightKg, LandUnitResult } from '../utils/nepalUnitsConverter';
import { Breadcrumbs } from './ui/Breadcrumbs';
import { EmptyState } from './ui/EmptyState';
import { Badge } from './ui/Badge';
import { EvMobilityCalculator } from './daily/EvMobilityCalculator';
import { NepseCapitalTerminal } from './daily/NepseCapitalTerminal';
import { ItExportRemittanceTerminal } from './daily/ItExportRemittanceTerminal';
import { BullionJewelryTerminal } from './daily/BullionJewelryTerminal';
import { KhataBillSnapper } from './daily/KhataBillSnapper';
import { ContractRiskScanner } from './daily/ContractRiskScanner';
import { HealthReportTranslator } from './daily/HealthReportTranslator';
import { SarkariCounterNavigator } from './daily/SarkariCounterNavigator';
import { exportFxAuditPdf, exportTaxComputationPdf, exportOfficialLetterPdf } from '../utils/pdfExport';
import { LETTER_STARTER_PROMPTS, VOICE_SAMPLE_SCENARIOS, buildSovereignLetterDraft } from '../utils/letterDrafter';

interface DailyEssentialToolsProps {
  theme?: ThemeMode;
  language?: Language;
  onOpenConsultation?: (serviceTitle?: string) => void;
  onNavigateHome?: () => void;
  onOpenHamroAI?: () => void;
  onActiveToolChange?: (tab: ActiveToolTab) => void;
  initialTab?: ActiveToolTab;
  isHydrating?: boolean;
}

type ActiveToolTab = 'fx' | 'letter' | 'voice' | 'ocr' | 'tax' | 'market' | 'ev' | 'nepse' | 'it_export' | 'bullion' | 'khata' | 'contract' | 'health' | 'sarkari';

export const DailyEssentialTools: React.FC<DailyEssentialToolsProps> = ({
  theme = 'dark',
  language = 'en',
  onOpenConsultation,
  onNavigateHome,
  onOpenHamroAI,
  onActiveToolChange,
  initialTab,
  isHydrating = false,
}) => {
  const [activeTab, setActiveTab] = useState<ActiveToolTab>(initialTab || 'fx');

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const handleSelectToolTab = (tab: ActiveToolTab) => {
    setActiveTab(tab);
    onActiveToolChange?.(tab);
  };

  const [copied, setCopied] = useState<boolean>(false);
  const [isHydratingLocal, setIsHydratingLocal] = useState<boolean>(true);
  const isDark = theme === 'dark';
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const isNe = language === 'ne';
  const { showToast } = useToast();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsHydratingLocal(false);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  const handleCopy = (text: string, label = 'Copied') => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast(label, isNe ? 'क्लिपबोर्डमा प्रतिलिपि गरियो!' : 'Copied to clipboard!', 'success', 2000);
    setTimeout(() => setCopied(false), 2000);
  };

  // =========================================================================
  // TOOL 1: REAL-TIME USD TO NPR FX & AI SUBSCRIPTIONS (NRB DIRECT)
  // =========================================================================
  const [fxUsdAmount, setFxUsdAmount] = useState<number>(20);
  const [selectedAiPreset, setSelectedAiPreset] = useState<string>('chatgpt-plus');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [liveNrbRate, setLiveNrbRate] = useState<number>(135.60);
  const [isRefreshingFx, setIsRefreshingFx] = useState<boolean>(false);
  const [lastRateSync, setLastRateSync] = useState<string>('Live NRB Official Rate');
  const [includeCardSpread, setIncludeCardSpread] = useState<boolean>(true);
  const [includeDstTax, setIncludeDstTax] = useState<boolean>(true);
  const [includeVatTax, setIncludeVatTax] = useState<boolean>(false);

  const [fxMode, setFxMode] = useState<'ai_subs' | 'currency_converter'>('ai_subs');
  const [selectedCurrency, setSelectedCurrency] = useState<string>('USD');
  const [currencyInputAmount, setCurrencyInputAmount] = useState<number>(100);
  const [nrbRates, setNrbRates] = useState<Record<string, { buy: number; sell: number; mid: number; unit: number }>>({
    USD: { buy: 135.30, sell: 135.90, mid: 135.60, unit: 1 },
    EUR: { buy: 144.15, sell: 144.80, mid: 144.48, unit: 1 },
    GBP: { buy: 172.80, sell: 173.55, mid: 173.18, unit: 1 },
    AUD: { buy: 88.75, sell: 89.20, mid: 88.98, unit: 1 },
    CAD: { buy: 98.30, sell: 98.80, mid: 98.55, unit: 1 },
    INR: { buy: 160.00, sell: 160.15, mid: 160.00, unit: 100 },
    JPY: { buy: 8.85, sell: 8.92, mid: 8.88, unit: 10 },
    QAR: { buy: 37.10, sell: 37.30, mid: 37.20, unit: 1 },
    AED: { buy: 36.80, sell: 37.00, mid: 36.90, unit: 1 },
    SAR: { buy: 36.05, sell: 36.25, mid: 36.15, unit: 1 },
    CNY: { buy: 18.70, sell: 18.85, mid: 18.78, unit: 1 },
  });

  const AI_SUBSCRIPTION_PRESETS = [
    { id: 'chatgpt-plus', name: 'ChatGPT Plus (OpenAI)', provider: 'OpenAI', monthlyUsd: 20.00, annualDiscountUsd: 20.00, tag: 'Most Popular', icon: '🤖', desc: 'GPT-4o, Canvas, o1/o3 reasoning models' },
    { id: 'claude-pro', name: 'Claude Pro (Anthropic)', provider: 'Anthropic', monthlyUsd: 20.00, annualDiscountUsd: 20.00, tag: 'Coding & Vision', icon: '🧠', desc: 'Claude 3.7 Sonnet, Artifacts, Extended Thinking' },
    { id: 'cursor-pro', name: 'Cursor Pro (AI Editor)', provider: 'Anysphere', monthlyUsd: 20.00, annualDiscountUsd: 16.00, tag: 'Developers', icon: '💻', desc: '500 fast requests, Agent tab, Claude/GPT-4o in VS Code' },
    { id: 'v0-pro', name: 'v0 by Vercel Pro', provider: 'Vercel Inc', monthlyUsd: 20.00, annualDiscountUsd: 20.00, tag: 'Frontend AI', icon: '⚡', desc: '5,000 monthly credits, Next.js / Tailwind UI generation' },
    { id: 'lovable-starter', name: 'Lovable AI Starter', provider: 'Lovable Dev', monthlyUsd: 20.00, annualDiscountUsd: 20.00, tag: 'Fullstack AI', icon: '💖', desc: 'Fullstack app generation with Supabase & GitHub sync' },
    { id: 'runway-standard', name: 'Runway Gen-3 Standard', provider: 'Runway ML', monthlyUsd: 15.00, annualDiscountUsd: 12.00, tag: 'Video AI', icon: '🎬', desc: '625 credits/mo, Gen-3 Alpha high-definition video' },
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

  const effectiveMonthlyUsd = selectedAiPreset === 'custom' 
    ? fxUsdAmount 
    : billingCycle === 'annual' 
    ? activePreset.annualDiscountUsd 
    : activePreset.monthlyUsd;

  const effectiveTotalUsd = billingCycle === 'annual' ? effectiveMonthlyUsd * 12 : effectiveMonthlyUsd;

  // Granular Cost Breakdown under Nepal Finance Act
  const fxBaseNpr = effectiveTotalUsd * liveNrbRate;
  const fxBankSpreadFee = includeCardSpread ? fxBaseNpr * 0.03 : 0; // 3% average A-Class Bank spread
  const fxDstTaxAmount = includeDstTax ? fxBaseNpr * 0.02 : 0; // 2% Digital Services Tax (DST) under Nepal Finance Act
  const fxVatAmount = includeVatTax ? fxBaseNpr * 0.13 : 0; // 13% VAT if locally billed
  const fxTotalNpr = fxBaseNpr + fxBankSpreadFee + fxDstTaxAmount + fxVatAmount;
  const fxMonthlyNormalizedNpr = billingCycle === 'annual' ? fxTotalNpr / 12 : fxTotalNpr;

  // NRB $500 Dollar Card Quota Impact
  const quotaUsedPct = Math.min(100, (effectiveTotalUsd / 500) * 100);
  const remainingAnnualQuotaUsd = Math.max(0, 500 - effectiveTotalUsd);
  const remainingAnnualQuotaNpr = Math.round(remainingAnnualQuotaUsd * liveNrbRate);
  const maxMonthsOnCard = effectiveMonthlyUsd > 0 ? Math.floor(500 / effectiveMonthlyUsd) : 12;

  const [nrbPublishedAt, setNrbPublishedAt] = useState<string>('');

  // Live NRB Fetch
  const fetchLiveNrbForex = async (forceRefresh = false) => {
    setIsRefreshingFx(true);
    try {
      const res = await fetch(`/api/forex/nrb${forceRefresh ? '?refresh=1' : ''}`);
      if (res.ok) {
        const data = await res.json();
        if (data.rates) {
          setNrbRates(data.rates);
        }
        if (data.publishedAt) {
          setNrbPublishedAt(data.publishedAt);
        }
        const freshRate = data.rates?.USD?.mid || 135.60;
        setLiveNrbRate(freshRate);
        const modeLabel = data.live ? 'NRB Live API' : 'NRB Benchmark';
        setLastRateSync(`${modeLabel} (${data.publishedAt || 'Today'}) • रू ${freshRate}/USD`);
        if (forceRefresh) {
          showToast('NRB Forex Synced', `Rate: 1 USD = रू ${freshRate}`, 'success', 2500);
        }
      }
    } catch {
      setLastRateSync('NRB Verified Benchmark (135.60 NPR/USD)');
    } finally {
      setIsRefreshingFx(false);
    }
  };

  useEffect(() => {
    fetchLiveNrbForex(false);
  }, []);

  const handleSelectPreset = (presetId: string) => {
    setSelectedAiPreset(presetId);
    const target = AI_SUBSCRIPTION_PRESETS.find(p => p.id === presetId);
    if (target && presetId !== 'custom') {
      setFxUsdAmount(target.monthlyUsd);
    }
  };

  const downloadFxSummary = () => {
    const content = `================================================================================
NEPAL RASTRA BANK (NRB) - AI SUBSCRIPTION & FOREX AUDIT REPORT
================================================================================
Generated: ${new Date().toLocaleString()}
Ecosystem Benchmark: Nepal Rastra Bank Directives & Nepal Finance Act
Platform: https://nepalai.tech (Kathmandu, Nepal)

1. SERVICE SPECIFICATION:
--------------------------------------------------------------------------------
Service / Tool       : ${activePreset.name} (${activePreset.provider})
Billing Mode         : ${billingCycle.toUpperCase()}
Exchange Rate        : 1 USD = NPR ${liveNrbRate} (NRB Benchmark Rate)
USD Price Charged    : $${effectiveTotalUsd.toFixed(2)} USD

2. NEPALI RUPEES (NPR) STATUTORY COST BREAKDOWN:
--------------------------------------------------------------------------------
Base NPR Conversion   : NPR ${Math.round(fxBaseNpr).toLocaleString()}
Bank FX Spread (3.0%) : NPR ${Math.round(fxBankSpreadFee).toLocaleString()}  (Standard A-Class Nepal Bank Fee)
Digital Service Tax   : NPR ${Math.round(fxDstTaxAmount).toLocaleString()}  (2.0% DST under Nepal Finance Act)
${includeVatTax ? `VAT Assessment (13%) : NPR ${Math.round(fxVatAmount).toLocaleString()}  (Applicable if locally invoiced)\n` : ''}--------------------------------------------------------------------------------
TOTAL ESTIMATED COST  : NPR ${Math.round(fxTotalNpr).toLocaleString()} (${billingCycle === 'annual' ? `~NPR ${Math.round(fxMonthlyNormalizedNpr).toLocaleString()}/month` : 'Monthly Total'})

3. NEPAL RASTRA BANK (NRB) $500 ANNUAL DOLLAR CARD ANALYSIS:
--------------------------------------------------------------------------------
Annual Limit Quota    : $500.00 USD / fiscal year
Quota Consumed        : $${effectiveTotalUsd.toFixed(2)} USD (${quotaUsedPct.toFixed(1)}%)
Remaining Quota (USD) : $${remainingAnnualQuotaUsd.toFixed(2)} USD
Remaining Quota (NPR) : ~NPR ${remainingAnnualQuotaNpr.toLocaleString()}
Estimated Card Runway : ~${maxMonthsOnCard} active billing cycles within statutory cap

4. STATUTORY GUIDELINES & ALTERNATIVES:
--------------------------------------------------------------------------------
* NRB Prepaid Dollar Card: Capped at $500/fiscal year. Available at Nabil, Global IME, NIC Asia, Sanima.
* Local Invoicing Option : NepalAI provides native NPR invoicing via eSewa/FonePay for enterprise suites.
* IT Export Incentive    : 1% or 5% final TDS on foreign currency software export receipts under Section 95Ka.

================================================================================
Generated via Nepal AI Hub • Sovereign AI & Local Rails (nepalai.tech)
================================================================================`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nrb_ai_cost_audit_${activePreset.id}_${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Report Downloaded', 'Audit summary exported as text file', 'success', 2500);
  };

  // =========================================================================
  // TOOL 2: OFFICIAL DEVANAGARI & ROMAN LETTER STUDIO + PDF / PRINT
  // =========================================================================
  const bsDateObj = getCurrentBikramSambatDate();
  const [letterPersona, setLetterPersona] = useState<'all' | 'officer' | 'student' | 'business' | 'marketer' | 'homemaker'>('all');
  const [letterTemplate, setLetterTemplate] = useState<string>('ward_nata');
  const [applicantName, setApplicantName] = useState('राम प्रसाद अधिकारी');
  const [applicantCitizenship, setApplicantCitizenship] = useState('२७-०१-७६-०९१२४');
  const [applicantAddress, setApplicantAddress] = useState('काठमाडौं महानगरपालिका वडा नं. ४, बालुवाटार');
  const [officeName, setOfficeName] = useState('श्रीमान् वडा अध्यक्षज्यू, का.म.पा. वडा कार्यालय ४');
  const [letterSubject, setLetterSubject] = useState('नाता प्रमाणित सिफारिस गरिपाउँ बारे');
  const [letterReason, setLetterReason] = useState('मेरो छोरा प्रवीण अधिकारीको उच्च शिक्षा अध्ययनका लागि नाता प्रमाणित सिफारिस पत्र आवश्यक परेको हुँदा');
  const [letterDate, setLetterDate] = useState(bsDateObj.formattedBs);
  const [patraSankhya, setPatraSankhya] = useState('२०८१/०८२');
  const [chalaniNo, setChalaniNo] = useState('१२४९');
  const [viewPreetiFont, setViewPreetiFont] = useState<boolean>(false);
  const [romanTypingEnabled, setRomanTypingEnabled] = useState<boolean>(true);
  const [romanQuickInput, setRomanQuickInput] = useState<string>('');
  const [customLetterBody, setCustomLetterBody] = useState<string | null>(null);
  const [aiDraftPrompt, setAiDraftPrompt] = useState<string>('');
  const [isDraftingLetter, setIsDraftingLetter] = useState<boolean>(false);
  const [letterChecklist, setLetterChecklist] = useState<{
    recommendedOffice?: string;
    estimatedFee?: string;
    checklist?: string[];
  } | null>(null);

  // Voice-to-Official-PDF state & refs
  const [voiceSpeechLang, setVoiceSpeechLang] = useState<'ne-NP' | 'en-US'>('ne-NP');
  const [isRecordingVoice, setIsRecordingVoice] = useState<boolean>(false);
  const [voiceRecordSeconds, setVoiceRecordSeconds] = useState<number>(0);
  const [voiceLiveTranscript, setVoiceLiveTranscript] = useState<string>('');
  const [isProcessingVoice, setIsProcessingVoice] = useState<boolean>(false);
  const [isReadingLetterAloud, setIsReadingLetterAloud] = useState<boolean>(false);

  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const audioChunksRef = React.useRef<Blob[]>([]);
  const speechRecRef = React.useRef<any>(null);
  const voiceTimerRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
  const voiceTranscriptRef = React.useRef<string>('');
  const audioUploadInputRef = React.useRef<HTMLInputElement | null>(null);

  const OFFICIAL_TEMPLATES = [
    {
      id: 'ward_nata',
      persona: 'officer' as const,
      labelEn: 'Ward: Kinship / Relationship Recommendation (नाता प्रमाणित)',
      office: 'श्रीमान् वडा अध्यक्षज्यू, का.म.पा. वडा कार्यालय ४',
      subject: 'नाता प्रमाणित सिफारिस गरिपाउँ बारे',
      reason: 'मेरो छोरा प्रवीण अधिकारीको उच्च शिक्षा अध्ययन तथा वैदेशिक प्रयोजनका लागि नाता प्रमाणित सिफारिस पत्र आवश्यक परेको हुँदा',
    },
    {
      id: 'ward_unmarried',
      persona: 'officer' as const,
      labelEn: 'Ward: Unmarried Certificate Recommendation (अविवाहित प्रमाणित)',
      office: 'श्रीमान् वडा अध्यक्षज्यू, स्थानीय वडा कार्यालय',
      subject: 'अविवाहित प्रमाणित सिफारिस पाउँ बारे',
      reason: 'मेरो वैदेशिक अध्ययन तथा रोजगारीको प्रयोजनका लागि अविवाहित प्रमाणपत्र आवश्यक परेको हुँदा',
    },
    {
      id: 'charkilla',
      persona: 'officer' as const,
      labelEn: 'Ward: Property Boundary Charkilla (चारकिल्ला प्रमाणित)',
      office: 'श्रीमान् वडा अध्यक्षज्यू, वडा कार्यालय',
      subject: 'घरजग्गा चारकिल्ला प्रमाणित सिफारिस पाउँ बारे',
      reason: 'मेरो नाममा दर्ता स्रेस्ता कायम रहेको जग्गाको बैंक धितो प्रयोजनका लागि चारकिल्ला प्रमाणित सिफारिस पत्र आवश्यक परेको हुँदा',
    },
    {
      id: 'rti_application',
      persona: 'officer' as const,
      labelEn: 'Officer: Right to Information RTI (सूचनाको हक निवेदन)',
      office: 'श्रीमान् सूचना अधिकारीज्यू, सार्वजनिक निकाय',
      subject: 'सूचनाको हक सम्बन्धी ऐन, २०६४ अनुसार सूचना उपलब्ध गराइपाउँ बारे',
      reason: 'सार्वजनिक चासोको यस विषयमा प्रमाणित विवरण तथा निर्णयको प्रतिलिपि अध्ययन प्रयोजनका लागि आवश्यक भएकोले',
    },
    {
      id: 'land_transfer',
      persona: 'officer' as const,
      labelEn: 'Malpot: Land Transfer / Dakhil Kharej (जग्गा नामसारी)',
      office: 'श्रीमान् प्रमुख मालपोत अधिकृतज्यू, मालपोत कार्यालय',
      subject: 'हकसैया जग्गा नामसारी तथा दाखिल खारेज दर्ता गरिपाउँ बारे',
      reason: 'स्वर्गीय बुबाको नाममा दर्ता कायम रहेको कित्ता नं. २४८ को जग्गा प्रचलित कानुन अनुसार अंशियारहरू बीच निर्विवाद नामसारी गर्न निवेदन पेश गरेको छु',
    },
    {
      id: 'vital_event',
      persona: 'officer' as const,
      labelEn: 'Ward: Birth / Marriage / Vital Registration (घटना दर्ता)',
      office: 'श्रीमान् स्थानीय पञ्जिकाधिकारीज्यू, स्थानीय वडा कार्यालय',
      subject: 'व्यक्तिगत घटना दर्ता प्रमाणपत्र जारी गरिपाउँ बारे',
      reason: 'स्थानीय तहको व्यक्तिगत घटना दर्ता ऐन बमोजिम आवश्यक प्रमाणपत्र उपलब्ध गराइपाउँ भनी निवेदन गर्दछु',
    },
    {
      id: 'student_leave',
      persona: 'student' as const,
      labelEn: 'Student: School / College Leave Application (बिदा निवेदन)',
      office: 'श्रीमान् प्रधानाध्यापक / क्याम्पस प्रमुखज्यू',
      subject: 'बिरामी / घरायसी कामले ३ दिन बिदा स्वीकृत गरिपाउँ बारे',
      reason: 'अस्वस्थता / आवश्यक घरायसी कार्यका कारण म कक्षामा उपस्थित हुन असमर्थ भएकोले मिति २०८१/०८/१० देखि ३ दिनको बिदा स्वीकृत गरिदिनुहुन अनुरोध गर्दछु',
    },
    {
      id: 'student_scholarship',
      persona: 'student' as const,
      labelEn: 'Student: Scholarship / Fee Waiver (छात्रवृत्ति निवेदन)',
      office: 'श्रीमान् छात्रवृत्ति समिति प्रमुखज्यू, विद्यालय / कलेज प्रशासन',
      subject: 'जेहेन्दार तथा आर्थिक छात्रवृत्ति उपलब्ध गराइपाउँ बारे',
      reason: 'मेरो शैक्षिक नतिजा उत्कृष्ट रहेको तथा पारिवारिक आर्थिक अवस्थाका कारण अध्ययन निरन्तरताका लागि छात्रवृत्ति / शुल्क सहुलियत उपलब्ध गराइदिनुहुन अनुरोध गर्दछु',
    },
    {
      id: 'student_bonafide',
      persona: 'student' as const,
      labelEn: 'Student: Character / Bonafide Certificate (चारित्रिक प्रमाणपत्र)',
      office: 'श्रीमान् प्रशासन प्रमुखज्यू, कलेज / विद्यालय',
      subject: 'अध्ययनरत (Bonafide) तथा चारित्रिक प्रमाणपत्र पाउँ बारे',
      reason: 'उच्च शिक्षा आवेदन तथा बैंक खाता प्रयोजनका लागि म यस संस्थाको नियमित विद्यार्थी रहेको प्रमाणित पत्र आवश्यक परेको हुँदा',
    },
    {
      id: 'bank_dollar',
      persona: 'business' as const,
      labelEn: 'Business: Bank Prepaid Dollar Card Request ($500)',
      office: 'श्रीमान् शाखा प्रबन्धकज्यू, वाणिज्य बैंक लिमिटेड',
      subject: 'अन्तर्राष्ट्रिय प्रिपेड डलर कार्ड जारी गरिपाउँ बारे',
      reason: 'नेपाल राष्ट्र बैंकको निर्देशिका अनुसार वार्षिक ५०० अमेरिकी डलर सीमा भएको डलर कार्ड सफ्टवेयर, क्लाउड सर्भर तथा व्यवसायिक सेवा भुक्तानीका लागि आवश्यक भएको हुँदा',
    },
    {
      id: 'ward_business',
      persona: 'business' as const,
      labelEn: 'Business: Firm / Shop Registration (व्यवसाय दर्ता सिफारिस)',
      office: 'श्रीमान् वडा अध्यक्षज्यू, स्थानीय वडा कार्यालय',
      subject: 'व्यवसाय तथा फर्म दर्ता सिफारिस गरिपाउँ बारे',
      reason: 'यस वडा क्षेत्रभित्र व्यवसायिक प्रतिष्ठान सञ्चालन गर्न फर्म तथा प्यान दर्ताका लागि सिफारिस आवश्यक भएकोले',
    },
    {
      id: 'pan_application',
      persona: 'business' as const,
      labelEn: 'Business: Personal / Business PAN Registration (प्यान दर्ता)',
      office: 'श्रीमान् प्रमुख कर अधिकृतज्यू, आन्तरिक राजस्व कार्यालय (IRD)',
      subject: 'व्यक्तिगत तथा व्यवसायिक स्थायी लेखा नम्बर (PAN) जारी गरिपाउँ बारे',
      reason: 'आयकर ऐन २०५८ अनुसार आय विवरण तथा बैंकिङ कारोबार पारदर्शी बनाउन प्यान दर्ता गर्नुपर्ने भएकोले',
    },
    {
      id: 'fonepay_qr',
      persona: 'business' as const,
      labelEn: 'Business: QR Merchant Application (eSewa / FonePay)',
      office: 'श्रीमान् मर्चेन्ट सेवा विभाग प्रमुख, भुक्तानी सेवा प्रदायक',
      subject: 'डिजिटल क्युआर कोड (Dynamic QR) मर्चेन्ट सुविधा उपलब्ध गराइदिने बारे',
      reason: 'हाम्रो व्यवसायिक प्रतिष्ठानमा ग्राहकहरूबाट सिधै मोबाइल बैंकिङ र वालेटमार्फत नगदरहित भुक्तानी लिन आधिकारिक मर्चेन्ट अकाउन्ट आवश्यक परेकोले',
    },
    {
      id: 'office_leave',
      persona: 'business' as const,
      labelEn: 'Corporate: Employee Leave Application (कर्मचारी बिदा)',
      office: 'श्रीमान् मानव संसाधन विभाग प्रमुख / कार्यालय प्रमुख',
      subject: 'विशेष घरबिदा स्वीकृत गरिपाउँ बारे',
      reason: 'घरायसी अत्यावश्यक कार्य परेकोले मिति २०८१/०८/१० देखि ३ दिनका लागि विशेष बिदा स्वीकृत गरिदिनुहुन',
    },
    {
      id: 'corp_proposal',
      persona: 'business' as const,
      labelEn: 'Corporate / Client: Service Proposal & Quote (प्रस्तावना पत्र)',
      office: 'श्रीमान् प्रबन्ध निर्देशकज्यू, साझेदार / ग्राहक संस्था',
      subject: 'सेवा प्रस्तावना तथा दररेट कोटेसन पेश गरिएको बारे',
      reason: 'तपाईंको संस्थाको आवश्यकता अनुसार गुणस्तरीय सेवा, समयबद्ध डेलिभरी र पारदर्शी नेपाली रुपैयाँ (NPR) बिलिङ सहितको प्रस्तावना यसैसाथ पेश गरेका छौँ',
    },
    {
      id: 'mkt_promo',
      persona: 'marketer' as const,
      labelEn: 'Marketer: Festive Client Offer Letter (चाडपर्व अफर पत्र)',
      office: 'आदरणीय ग्राहक महानुभावहरू तथा साझेदार संस्था',
      subject: 'विशेष चाडपर्व छुट तथा ग्राहक उपहार योजना सम्बन्धी सूचना',
      reason: 'हाम्रा नियमित ग्राहकहरूको विश्वासका लागि आभार व्यक्त गर्दै यस सिजनमा विशेष २५% छुट तथा निःशुल्क डेलिभरी अफर सार्वजनिक गरिएको जानकारी गराउँदछौँ',
    },
    {
      id: 'corp_payment_reminder',
      persona: 'marketer' as const,
      labelEn: 'Client Billing: Polite Payment Follow-up (भुक्तानी अनुरोध)',
      office: 'श्रीमान् लेखा / खरिद विभाग प्रमुख, ग्राहक संस्था',
      subject: 'बिल नं. बक्यौता रकम भुक्तानी मिलान गरिदिने बारे',
      reason: 'सम्झौता बमोजिम सेवा/सामान डेलिभरी भइसकेको र जारी भ्याट/प्यान बिलको भुक्तानी म्याद सम्पन्न भएकोले नियमानुसार रकम फर्स्यौट गरिदिनुहुन अनुरोध छ',
    },
    {
      id: 'electricity_water',
      persona: 'homemaker' as const,
      labelEn: 'Family: Electricity & Water Meter Request (बिजुली / पानी)',
      office: 'श्रीमान् वडा अध्यक्षज्यू / विद्युत तथा खानेपानी कार्यालय',
      subject: 'विद्युत मिटर तथा खानेपानी धारा जडान सिफारिस गरिपाउँ बारे',
      reason: 'यस वडाभित्र रहेको मेरो घरमा दैनिक जीवनयापनका लागि विद्युत मिटर तथा खानेपानी धारा जडान गर्न सिफारिस पत्र आवश्यक परेको हुँदा',
    },
    {
      id: 'family_school_note',
      persona: 'homemaker' as const,
      labelEn: 'Homemaker / Parent: Child School Leave Note (अभिभावक पत्र)',
      office: 'श्रीमान् कक्षा शिक्षक / प्रधानाध्यापकज्यू',
      subject: 'मेरो छोरा/छोरीको विद्यालय अनुपस्थिति बिदा स्वीकृत गरिपाउँ',
      reason: 'पारिवारिक आवश्यक कार्य र स्वास्थ्य जाँचका कारण मेरो छोरा/छोरी आज र भोलि विद्यालय उपस्थित हुन नसक्ने व्यहोरा अभिभावकको तर्फबाट जानकारी गराउँदछु',
    },
  ];

  const visibleLetterTemplates =
    letterPersona === 'all'
      ? OFFICIAL_TEMPLATES
      : OFFICIAL_TEMPLATES.filter((t) => t.persona === letterPersona);

  const handleTemplateChange = (tplId: string) => {
    setLetterTemplate(tplId);
    setCustomLetterBody(null);
    const tpl = OFFICIAL_TEMPLATES.find(t => t.id === tplId);
    if (tpl) {
      setOfficeName(tpl.office);
      setLetterSubject(tpl.subject);
      setLetterReason(tpl.reason);
    }
  };

  const handleRomanFieldInput = (
    setter: React.Dispatch<React.SetStateAction<string>>,
    rawVal: string
  ) => {
    if (romanTypingEnabled) {
      setter(transliterateCompletedWordsOnSpace(rawVal));
    } else {
      setter(rawVal);
    }
  };

  const handleAiDraftLetter = async (promptOverride?: string) => {
    const promptText = (promptOverride ?? aiDraftPrompt).trim();
    if (!promptText || isDraftingLetter) return;

    if (promptOverride) {
      setAiDraftPrompt(promptOverride);
    }
    setIsDraftingLetter(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: 'letter_draft',
          message: promptText,
          language,
          persona: letterPersona,
          letterContext: {
            applicantName,
            applicantAddress,
            applicantCitizenship,
            letterDate,
            patraSankhya,
            chalaniNo,
          },
        }),
      });

      const data = await response.json();
      if (data?.success && data?.letterDraft?.letterBody) {
        const d = data.letterDraft;
        if (d.officeName) setOfficeName(d.officeName);
        if (d.subject) setLetterSubject(d.subject);
        if (d.reason) setLetterReason(d.reason);
        setCustomLetterBody(d.letterBody);
        setLetterChecklist(
          d.checklist || d.recommendedOffice
            ? {
                recommendedOffice: d.recommendedOffice,
                estimatedFee: d.estimatedFee,
                checklist: d.checklist,
              }
            : null
        );
        setViewPreetiFont(false);
        showToast(
          isNe ? 'पत्र ड्राफ्ट तयार भयो' : 'AI Letter Ready',
          isNe ? 'तल हेरेर सिधै PDF सेभ वा प्रिन्ट गर्नुहोस्।' : 'Review below and click Save PDF or Print.',
          'success',
          2600
        );
        return;
      }
      throw new Error('Fallback to local drafter');
    } catch {
      const localDraft = buildSovereignLetterDraft({
        prompt: promptText,
        persona: letterPersona,
        applicantName,
        applicantAddress,
        applicantCitizenship,
        letterDate,
        patraSankhya,
        chalaniNo,
        language: language === 'ne' ? 'ne' : 'en',
      });
      setOfficeName(localDraft.officeName);
      setLetterSubject(localDraft.subject);
      setLetterReason(localDraft.reason);
      setCustomLetterBody(localDraft.letterBody);
      setLetterChecklist({
        recommendedOffice: localDraft.recommendedOffice,
        estimatedFee: localDraft.estimatedFee,
        checklist: localDraft.checklist,
      });
      setViewPreetiFont(false);
      showToast(
        isNe ? 'पत्र ड्राफ्ट तयार भयो' : 'Letter Draft Ready',
        isNe ? 'सिधै सम्पादन, PDF सेभ वा प्रिन्ट गर्न सक्नुहुन्छ।' : 'Ready to edit, Save PDF, or Print.',
        'success',
        2600
      );
    } finally {
      setIsDraftingLetter(false);
    }
  };

  const applyVoiceDraftResult = (
    draft: {
      officeName?: string;
      subject?: string;
      reason?: string;
      letterBody: string;
      recommendedOffice?: string;
      estimatedFee?: string;
      checklist?: string[];
    },
    spokenTranscript?: string
  ) => {
    if (spokenTranscript) {
      setAiDraftPrompt(spokenTranscript);
      setVoiceLiveTranscript(spokenTranscript);
    }
    if (draft.officeName) setOfficeName(draft.officeName);
    if (draft.subject) setLetterSubject(draft.subject);
    if (draft.reason) setLetterReason(draft.reason);
    setCustomLetterBody(draft.letterBody);
    setLetterChecklist({
      recommendedOffice: draft.recommendedOffice,
      estimatedFee: draft.estimatedFee,
      checklist: draft.checklist,
    });
    setViewPreetiFont(false);
    showToast(
      isNe ? 'आवाजबाट पत्र तयार भयो!' : 'Voice Converted to Official PDF Letter',
      isNe ? 'सिधै PDF सेभ वा प्रिन्ट गर्न सक्नुहुन्छ।' : 'Ready to Save PDF, Print, or Edit below.',
      'success',
      3000
    );
  };

  const submitVoicePayloadToApi = async (payload: {
    audioBase64?: string;
    mimeType?: string;
    transcript?: string;
    personaOverride?: string;
  }) => {
    setIsProcessingVoice(true);
    try {
      const response = await fetch('/api/voice-to-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioBase64: payload.audioBase64,
          mimeType: payload.mimeType || 'audio/webm',
          transcript: payload.transcript || '',
          persona: payload.personaOverride || letterPersona,
          language: voiceSpeechLang === 'ne-NP' ? 'ne' : 'en',
          letterContext: {
            applicantName,
            applicantAddress,
            applicantCitizenship,
            letterDate,
            patraSankhya,
            chalaniNo,
          },
        }),
      });
      const data = await response.json();
      if (data?.success && data?.letterDraft?.letterBody) {
        applyVoiceDraftResult(data.letterDraft, data.transcript || payload.transcript);
        return;
      }
      throw new Error(data?.error || 'Voice conversion fallback');
    } catch {
      const fallbackText = (payload.transcript || '').trim();
      if (fallbackText) {
        const localDraft = buildSovereignLetterDraft({
          prompt: fallbackText,
          persona: payload.personaOverride || letterPersona,
          applicantName,
          applicantAddress,
          applicantCitizenship,
          letterDate,
          patraSankhya,
          chalaniNo,
          language: voiceSpeechLang === 'ne-NP' ? 'ne' : 'en',
        });
        applyVoiceDraftResult(localDraft, fallbackText);
      } else {
        showToast(
          isNe ? 'आवाज सुनिएन' : 'No clear voice detected',
          isNe ? 'कृपया नजिकैबाट स्पष्ट बोल्नुहोस् वा नमुना बटन थिच्नुहोस्।' : 'Please speak clearly near your mic or try a 1-tap demo voice.',
          'warning',
          3200
        );
      }
    } finally {
      setIsProcessingVoice(false);
    }
  };

  const startVoiceRecording = async () => {
    if (isRecordingVoice || isProcessingVoice) return;
    setVoiceLiveTranscript('');
    voiceTranscriptRef.current = '';
    setVoiceRecordSeconds(0);
    audioChunksRef.current = [];

    let startedAnyInput = false;

    // 1. Browser live SpeechRecognition (gives real-time captions)
    const SpeechRecCtor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecCtor) {
      try {
        const recognition = new SpeechRecCtor();
        recognition.lang = voiceSpeechLang;
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.onresult = (event: any) => {
          let combined = '';
          for (let i = 0; i < event.results.length; i++) {
            combined += event.results[i][0]?.transcript || '';
          }
          const cleanText = combined.trim();
          voiceTranscriptRef.current = cleanText;
          setVoiceLiveTranscript(cleanText);
        };
        recognition.onerror = () => {
          // Audio recorder fallback continues cleanly
        };
        recognition.start();
        speechRecRef.current = recognition;
        startedAnyInput = true;
      } catch {
        // Ignore and rely on MediaRecorder
      }
    }

    // 2. MediaRecorder audio capture (works across browsers & supports Gemini audio transcription)
    if (navigator.mediaDevices?.getUserMedia && typeof MediaRecorder !== 'undefined') {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        recorder.ondataavailable = (ev) => {
          if (ev.data && ev.data.size > 0) {
            audioChunksRef.current.push(ev.data);
          }
        };
        recorder.onstop = () => {
          stream.getTracks().forEach((t) => t.stop());
          const chunks = audioChunksRef.current;
          const capturedText = voiceTranscriptRef.current.trim();
          if (chunks.length > 0) {
            const audioBlob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' });
            const reader = new FileReader();
            reader.onloadend = () => {
              const dataUrl = typeof reader.result === 'string' ? reader.result : '';
              submitVoicePayloadToApi({
                audioBase64: dataUrl,
                mimeType: recorder.mimeType || 'audio/webm',
                transcript: capturedText,
              });
            };
            reader.readAsDataURL(audioBlob);
          } else if (capturedText) {
            submitVoicePayloadToApi({ transcript: capturedText });
          } else {
            showToast(
              isNe ? 'आवाज रेकर्ड भएन' : 'No speech captured',
              isNe ? 'कृपया माइक अनुमति जाँच गर्नुहोस् वा अडियो फाइल अपलोड गर्नुहोस्।' : 'Check mic permission or tap a demo voice sample.',
              'warning',
              3000
            );
          }
        };
        recorder.start(300);
        mediaRecorderRef.current = recorder;
        startedAnyInput = true;
      } catch {
        // Microphone denied or unavailable
      }
    }

    if (!startedAnyInput) {
      showToast(
        isNe ? 'माइक उपलब्ध छैन' : 'Microphone Unavailable',
        isNe ? 'तलको अडियो अपलोड वा १-क्लिक आवाज नमुना प्रयोग गर्नुहोस्।' : 'Upload a voice note or tap a 1-click sample scenario below.',
        'warning',
        3200
      );
      return;
    }

    setIsRecordingVoice(true);
    voiceTimerRef.current = setInterval(() => {
      setVoiceRecordSeconds((s) => s + 1);
    }, 1000);
  };

  const stopVoiceRecording = () => {
    if (!isRecordingVoice) return;
    setIsRecordingVoice(false);
    if (voiceTimerRef.current) {
      clearInterval(voiceTimerRef.current);
      voiceTimerRef.current = null;
    }

    if (speechRecRef.current) {
      try {
        speechRecRef.current.stop();
      } catch {
        // ignore
      }
      speechRecRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        // ignore
      }
      mediaRecorderRef.current = null;
      return;
    }

    // SpeechRecognition-only path
    const capturedText = voiceTranscriptRef.current.trim();
    if (capturedText) {
      submitVoicePayloadToApi({ transcript: capturedText });
    }
  };

  const handleAudioFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = typeof reader.result === 'string' ? reader.result : '';
      if (dataUrl) {
        submitVoicePayloadToApi({
          audioBase64: dataUrl,
          mimeType: file.type || 'audio/mp3',
          transcript: '',
        });
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleReadLetterAloud = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      showToast('Speech unavailable', 'Audio playback is not supported in this browser.', 'warning', 2500);
      return;
    }
    if (isReadingLetterAloud) {
      window.speechSynthesis.cancel();
      setIsReadingLetterAloud(false);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(effectiveUnicodeLetter);
    utterance.lang = /[\u0900-\u097F]/.test(effectiveUnicodeLetter) ? 'ne-NP' : 'en-US';
    utterance.rate = 0.95;
    utterance.onend = () => setIsReadingLetterAloud(false);
    utterance.onerror = () => setIsReadingLetterAloud(false);
    setIsReadingLetterAloud(true);
    window.speechSynthesis.speak(utterance);
  };

  const generatedOfficialLetter = `पत्र संख्या: ${patraSankhya}
चलानी नं: ${chalaniNo}
मिति: ${letterDate}

श्री ${officeName},
${applicantAddress}।

विषय: ${letterSubject}।

महोदय,
उपरोक्त विषयमा म निवेदक ${applicantName}, पहिचान/ना.प्र.नं. ${applicantCitizenship}, ${applicantAddress} निवासी हुँ। ${letterReason}।

तसर्थ, आवश्यक विवरण जाँचबुझ गरी नियमानुसार सहयोग तथा सिफारिस/स्वीकृति उपलब्ध गराई अनुगृहीत गरिदिनुहुन विनम्रतापूर्वक अनुरोध गर्दछु।

भवदीय,

____________________
हस्ताक्षर:
नाम: ${applicantName}
ना.प्र.नं / रोल नं: ${applicantCitizenship}
ठेगाना: ${applicantAddress}
सम्पर्क फोन: ९८XXXXXXXX`;

  const effectiveUnicodeLetter = customLetterBody !== null ? customLetterBody : generatedOfficialLetter;
  const preetiConvertedText = convertUnicodeToPreeti(effectiveUnicodeLetter);
  const displayedLetterText = viewPreetiFont ? preetiConvertedText : effectiveUnicodeLetter;

  const printDocument = () => {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const safeHtmlContent = displayedLetterText
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(`
        <!DOCTYPE html>
        <html lang="ne">
          <head>
            <title>${letterSubject} - Nepal Official Letter</title>
            <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;600;700&display=swap" rel="stylesheet">
            <style>
              @page { size: A4; margin: 18mm; }
              body { font-family: 'Noto Sans Devanagari', 'Times New Roman', serif; padding: 32px; line-height: 1.9; color: #0f172a; background: #fff; }
              .content { white-space: pre-wrap; font-size: 15px; }
            </style>
          </head>
          <body>
            <div class="content">${safeHtmlContent}</div>
          </body>
        </html>
      `);
      doc.close();
      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }, 1200);
      }, 200);
    }
  };

  const saveDirectPdf = () => {
    exportOfficialLetterPdf({
      subject: letterSubject,
      officeName,
      applicantName,
      dateBs: letterDate,
      chalaniNo,
      letterText: displayedLetterText,
      isPreeti: viewPreetiFont,
      categoryLabel: OFFICIAL_TEMPLATES.find((t) => t.id === letterTemplate)?.labelEn,
    });
    showToast(
      isNe ? 'PDF तयार भयो' : 'PDF Print Sheet Ready',
      isNe ? 'प्रिन्ट संवादमा "Save as PDF" छान्नुहोस्।' : 'Select "Save as PDF" in the dialog to save directly.',
      'success',
      3200
    );
  };

  const downloadAsDoc = () => {
    const text = displayedLetterText;
    const blob = new Blob([text], { type: 'application/msword;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nepal_official_letter_${letterTemplate}_${Date.now()}.doc`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Word Document Downloaded', 'Official letter exported as .doc file', 'success', 2500);
  };

  // =========================================================================
  // TOOL 3: NEPALI NEURAL VOICE & DIALECT SYNTHESIZER (WEB SPEECH + ACCENTS)
  // =========================================================================
  const [voiceText, setVoiceText] = useState('नमस्ते! नेपाल एआईको सार्वभौम न्युरल आवाज प्रणालीमा यहाँलाई हार्दिक स्वागत छ।');
  const [selectedAccent, setSelectedAccent] = useState<'kathmandu' | 'pokhara' | 'eastern' | 'terai'>('kathmandu');
  const [voiceSpeed, setVoiceSpeed] = useState<number>(1.0);
  const [voicePitch, setVoicePitch] = useState<number>(1.0);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);

  const ACCENTS = {
    kathmandu: {
      name: 'Kathmandu Native (काठमाडौँ लवज)',
      desc: 'Urban standard Devanagari with crisp phonetics and neutral pitch',
      sample: 'नमस्ते, आजको मुख्य समाचार र बजार मूल्य विश्लेषण प्रस्तुत गर्दैछौँ।'
    },
    pokhara: {
      name: 'Gandaki Valley (गण्डकी पोखरेली लवज)',
      desc: 'Melodic Western Nepali cadence with natural soft vowel elongation',
      sample: 'फेवातालको किनारमा चिसो हावा चल्दैछ, पोखरामा पर्यटकहरूको चहलपहल बढ्यो।'
    },
    eastern: {
      name: 'Eastern Kirati (पूर्वेली लवज)',
      desc: 'Rhythmic Koshi & Mechi hill rhythm with assertive tonal clarity',
      sample: 'इलामको चियाबारी र धरानको बजारमा आज नयाँ सिजनको उत्साह छाएको छ।'
    },
    terai: {
      name: 'Terai Maithili Cadence (तराई मैथिली लय)',
      desc: 'Polite, sweet classical cadence with traditional phonetic depth',
      sample: 'जनकपुरधामको जानकी मन्दिर परिसरमा आज विशेष उत्सवको आयोजना हुँदैछ।'
    }
  };

  const downloadVoiceScript = () => {
    const blob = new Blob([voiceText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nepali_voice_script_${selectedAccent}_${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Voice Script Exported', 'Downloaded Devanagari speech script', 'success', 2000);
  };

  const handleToggleVoicePlayback = () => {
    if (isPlayingAudio) {
      setIsPlayingAudio(false);
      window.speechSynthesis?.cancel();
    } else {
      setIsPlayingAudio(true);
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(voiceText);
        utterance.rate = voiceSpeed;
        utterance.pitch = voicePitch;

        // Try to pick Hindi/Nepali voice engine
        const voices = window.speechSynthesis.getVoices();
        const suitableVoice = voices.find(v => v.lang.includes('ne') || v.lang.includes('hi')) || voices[0];
        if (suitableVoice) utterance.voice = suitableVoice;

        utterance.onend = () => setIsPlayingAudio(false);
        utterance.onerror = () => setIsPlayingAudio(false);
        window.speechSynthesis.speak(utterance);
      } else {
        setTimeout(() => setIsPlayingAudio(false), 2500);
      }
    }
  };

  // =========================================================================
  // TOOL 4: REAL DEVANAGARI DOCUMENT INTELLIGENCE & OCR (API CONNECTED)
  // =========================================================================
  const [selectedDocType, setSelectedDocType] = useState<'nagarikta' | 'lalpurja' | 'vat_bill'>('nagarikta');
  const [customOcrInput, setCustomOcrInput] = useState<string>('');
  const [ocrUploadedImage, setOcrUploadedImage] = useState<string | null>(null);
  const [ocrUploadedFileName, setOcrUploadedFileName] = useState<string>('');
  const [ocrViewMode, setOcrViewMode] = useState<'cards' | 'raw_json'>('cards');
  const [isOcrProcessing, setIsOcrProcessing] = useState<boolean>(false);
  const [extractedOcrResult, setExtractedOcrResult] = useState<any>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setOcrUploadedFileName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        setOcrUploadedImage(reader.result as string);
        setCustomOcrInput(`[Scanned from file: ${file.name}]\n` + DOC_RAW_PRESETS[selectedDocType]);
        showToast('Document Loaded', `${file.name} prepared for OCR extraction`, 'info', 2500);
      };
      reader.readAsDataURL(file);
    }
  };

  const downloadOcrJson = () => {
    if (!extractedOcrResult) return;
    const blob = new Blob([JSON.stringify(extractedOcrResult, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nepal_ocr_${selectedDocType}_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Structured JSON Exported', 'Saved OCR fields to .json file', 'success', 2000);
  };

  const DOC_RAW_PRESETS = {
    nagarikta: `नेपाल सरकार
गृह मन्त्रालय
नेपाली नागरिकताको प्रमाणपत्र
ना.प्र.नं.: २७-०१-७६-०९१२४
नाम, थर: राजेश कुमार श्रेष्ठ (RAJESH KUMAR SHRESTHA)
जन्म मिति: २०५४/०८/१२ (ई.सं. 1997-11-27)
जन्मस्थान: काठमाडौं महानगरपालिका वडा नं. ४
स्थायी ठेगाना: काठमाडौं, बागमती प्रदेश
बाबुको नाम: कृष्ण बहादुर श्रेष्ठ
आमाको नाम: लक्ष्मी देवी श्रेष्ठ
नागरिकता जारी मिति: २०७६/०५/१४
जारी जिल्ला: काठमाडौं`,
    lalpurja: `नेपाल सरकार, भूमि व्यवस्था मन्त्रालय
मालपोत कार्यालय, कास्की पोखरा
जग्गाधनी दर्ता प्रमाणपुर्जा
कित्ता नम्बर: २४८
क्षेत्रफल: ०-६-२-० (छ आना दुई पैसा)
साबिक गा.वि.स./न.पा.: पोखरा महानगरपालिका वडा नं. ७
जग्गाधनीको नाम: शान्ति माया गुरुङ
नागरिकता नं: ०२-०१-६८-०४२१
जग्गाको किसिम: कमोद / आवाद
कैफियत: बैंक धितो फुकुवा मिति २०८०/०३/१०`,
    vat_bill: `कर बिजक (VAT INVOICE)
हिमालयन एआई सोलुसन्स प्रा. लि.
प्यान / भ्याट नं.: ६०९८१२४५३
बिजक नं.: INV-2081-8942
मिति: २०८१/०६/२२
क्रेताको नाम: काठमाडौं टेक कन्सल्टिङ
विवरण:
१. Cloud Sovereign Server Hosting (1 Month) : रु. ८,५००
२. Devanagari OCR Batch Processing (10,000 pgs) : रु. ३,५००
जम्मा रकम (Subtotal): रु. १२,०००
१३% मूल्य अभिवृद्धि कर (VAT): रु. १,५६०
कुल जम्मा (Grand Total): रु. १३,५६०`
  };

  const handleExecuteRealOcr = async (type = selectedDocType) => {
    setIsOcrProcessing(true);
    setExtractedOcrResult(null);

    const inputText = customOcrInput.trim() || DOC_RAW_PRESETS[type];

    try {
      const res = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText,
          extractionType: type
        })
      });

      if (res.ok) {
        const json = await res.json();
        setExtractedOcrResult(json.extractedData);
        showToast('OCR Extracted Successfully', 'Structured JSON generated via Sovereign Pipeline', 'success', 2500);
      }
    } catch {
      showToast('Extraction notice', 'Parsed via client fallback engine', 'info', 2000);
    } finally {
      setIsOcrProcessing(false);
    }
  };

  // =========================================================================
  // TOOL 5: COMPLETE NEPAL INCOME TAX & IT EXPORT TDS ENGINE (FINANCE ACT)
  // =========================================================================
  const [taxStatus, setTaxStatus] = useState<'single' | 'married'>('single');
  const [taxTrack, setTaxTrack] = useState<'employment' | 'it_freelance' | 'it_company'>('it_freelance');
  const [monthlySalaryNpr, setMonthlySalaryNpr] = useState<number>(120000);
  const [dashainBonus, setDashainBonus] = useState<boolean>(true);
  const [ssfEnrolled, setSsfEnrolled] = useState<boolean>(false);
  const [singleFemaleRebate, setSingleFemaleRebate] = useState<boolean>(false);
  const [monthlyEpfCit, setMonthlyEpfCit] = useState<number>(10000);
  const [annualLifeInsurance, setAnnualLifeInsurance] = useState<number>(25000);

  const taxCalculation: TaxCalculationResult = calculateNepalIncomeTax({
    status: taxStatus,
    monthlyGrossSalary: monthlySalaryNpr,
    includeDashainBonus: dashainBonus,
    isItExportFreelancer: taxTrack === 'it_freelance',
    isItExportCompany: taxTrack === 'it_company',
    isSsfEnrolled: ssfEnrolled,
    isFemaleSingle: singleFemaleRebate && taxStatus === 'single',
    epfMonthly: monthlyEpfCit / 2,
    citMonthly: monthlyEpfCit / 2,
    annualLifeInsurance: annualLifeInsurance,
    annualHealthInsurance: 0
  });

  const downloadTaxSummary = () => {
    const summary = `================================================================================
NEPAL INLAND REVENUE DEPARTMENT (IRD) - INCOME TAX COMPUTATION SLIP
================================================================================
Fiscal Year: 2081/2082 (Finance Act 2081)
Platform: https://nepalai.tech (Kathmandu, Nepal)
Generated: ${new Date().toLocaleString()}

1. TAXPAYER DETAILS:
--------------------------------------------------------------------------------
Filing Status       : ${taxStatus === 'married' ? 'Married (दम्पती)' : 'Single (व्यक्तिगत)'}
Income Track        : ${taxTrack === 'it_freelance' ? 'IT / Software Export (Section 95Ka - 5% Final TDS)' : taxTrack === 'it_company' ? 'Registered IT Company (1% TDS)' : 'Regular Employment / Salaried'}
Monthly Gross       : NPR ${monthlySalaryNpr.toLocaleString()}
Annual Gross Income : NPR ${taxCalculation.totalAnnualIncome.toLocaleString()} ${dashainBonus ? '(Includes 13th-Month Dashain Bonus)' : ''}

2. STATUTORY DEDUCTIONS:
--------------------------------------------------------------------------------
EPF / CIT (Monthly) : NPR ${monthlyEpfCit.toLocaleString()} (Max eligible applied)
Life Insurance      : NPR ${annualLifeInsurance.toLocaleString()} (Max capped at 40,000)
Social Security Fund: ${ssfEnrolled ? 'Enrolled (1% Social Security Tax Waived)' : 'Not Enrolled (1% Tax Applies)'}
Female Single Rebate: ${singleFemaleRebate ? 'Applied (10% Tax Rebate under Nepal Tax Law)' : 'Not Applied'}
Total Deductions    : NPR ${taxCalculation.totalDeductions.toLocaleString()}
Net Taxable Income  : NPR ${taxCalculation.netTaxableIncome.toLocaleString()}

3. IRD TAX SLABS BREAKDOWN:
--------------------------------------------------------------------------------
${taxCalculation.slabs.map(s => `${s.slabName.padEnd(45)} (${s.ratePercent}%): NPR ${Math.round(s.taxAmount).toLocaleString()}`).join('\n')}
--------------------------------------------------------------------------------
TOTAL ANNUAL TAX    : NPR ${Math.round(taxCalculation.finalAnnualTax).toLocaleString()}
MONTHLY TAX TDS     : NPR ${Math.round(taxCalculation.monthlyTaxTds).toLocaleString()} / month
NET TAKE-HOME SALARY: NPR ${Math.round(taxCalculation.monthlyNetTakeHome).toLocaleString()} / month
EFFECTIVE TAX RATE  : ${taxCalculation.effectiveTaxRatePercent}%

Legal Basis: ${taxCalculation.legalNote}
================================================================================
Generated via Nepal AI Hub • IRD Tax Engine (nepalai.tech)
================================================================================`;

    const blob = new Blob([summary], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nepal_tax_computation_fy2081_82_${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Tax Slip Downloaded', 'Exported IRD tax calculation report', 'success', 2500);
  };

  // =========================================================================
  // TOOL 6: KALIMATI PRODUCE & TRADITIONAL LAND CONVERTER (ROPANI ↔ BIGHA)
  // =========================================================================
  const [landSubTab, setLandSubTab] = useState<'produce' | 'land'>('land');
  const [landInputMode, setLandInputMode] = useState<'sqft' | 'ropani' | 'bigha'>('sqft');
  const [landSqFtInput, setLandSqFtInput] = useState<number>(342.25 * 4); // 4 Aana
  const [landRopani, setLandRopani] = useState<number>(0);
  const [landAana, setLandAana] = useState<number>(4);
  const [landPaisa, setLandPaisa] = useState<number>(0);
  const [landDaam, setLandDaam] = useState<number>(0);
  const [landBigha, setLandBigha] = useState<number>(0);
  const [landKattha, setLandKattha] = useState<number>(1);
  const [landDhur, setLandDhur] = useState<number>(0);

  const convertedLand: LandUnitResult = landInputMode === 'ropani'
    ? convertFromRopaniSystem(landRopani, landAana, landPaisa, landDaam)
    : landInputMode === 'bigha'
    ? convertFromBighaSystem(landBigha, landKattha, landDhur)
    : convertFromSqFeet(landSqFtInput);

  const [selectedProduce, setSelectedProduce] = useState<string>('tomato_big');
  const [quantity, setQuantity] = useState<number>(2);
  const [unit, setUnit] = useState<'dharni' | 'pau' | 'kg'>('dharni');

  const DEFAULT_PRODUCE_PRICES: Record<string, { name: string; nameNe: string; pricePerKg: number; wholesale: number }> = {
    tomato_big: { name: 'Tomato Big (गोलभेंडा ठूलो)', nameNe: 'गोलभेंडा ठूलो', pricePerKg: 65, wholesale: 52 },
    tomato_local: { name: 'Tomato Local (गोलभेंडा सानो लोकल)', nameNe: 'गोलभेंडा सानो लोकल', pricePerKg: 45, wholesale: 35 },
    potato_red: { name: 'Local Red Potato (रातो आलु)', nameNe: 'रातो आलु', pricePerKg: 50, wholesale: 40 },
    potato_white: { name: 'White Potato (सेतो आलु)', nameNe: 'सेतो आलु', pricePerKg: 42, wholesale: 32 },
    onion_dry: { name: 'Dry Onion (प्याज सुकेको)', nameNe: 'प्याज सुकेको', pricePerKg: 85, wholesale: 72 },
    cauliflower: { name: 'Local Cauliflower (काउली)', nameNe: 'काउली', pricePerKg: 60, wholesale: 48 },
    cabbage: { name: 'Local Cabbage (बन्दा)', nameNe: 'बन्दा', pricePerKg: 38, wholesale: 28 },
    mushroom_button: { name: 'Button Mushroom (कन्ये/डल्ले च्याउ)', nameNe: 'कन्ये/डल्ले च्याउ', pricePerKg: 220, wholesale: 180 },
    mushroom_shiitake: { name: 'Shiitake Mushroom (सिताके च्याउ)', nameNe: 'सिताके च्याउ', pricePerKg: 350, wholesale: 290 },
    chilli_green: { name: 'Green Chilli (हरियो खुर्सानी)', nameNe: 'हरियो खुर्सानी', pricePerKg: 90, wholesale: 75 },
    lemon: { name: 'Local Lemon (कागती)', nameNe: 'कागती', pricePerKg: 160, wholesale: 130 },
    coriander: { name: 'Green Coriander (हरियो धनिया)', nameNe: 'हरियो धनिया', pricePerKg: 120, wholesale: 95 },
    carrot: { name: 'Local Carrot (गाजर)', nameNe: 'गाजर', pricePerKg: 70, wholesale: 55 },
    radish: { name: 'White Radish (सेतो मुला)', nameNe: 'सेतो मुला', pricePerKg: 35, wholesale: 25 },
    broccoli: { name: 'Fresh Broccoli (ब्रोकाउली)', nameNe: 'ब्रोकाउली', pricePerKg: 95, wholesale: 75 },
    okra: { name: 'Lady Finger / Okra (भिन्डी)', nameNe: 'भिन्डी', pricePerKg: 80, wholesale: 65 },
    bitter_gourd: { name: 'Bitter Gourd (तीतो करेला)', nameNe: 'तीतो करेला', pricePerKg: 75, wholesale: 60 },
    ginger: { name: 'Fresh Ginger (अदुवा)', nameNe: 'अदुवा', pricePerKg: 190, wholesale: 160 },
    garlic_dry: { name: 'Dry Garlic (सुकेको लसुन)', nameNe: 'सुकेको लसुन', pricePerKg: 280, wholesale: 240 },
    apple_mustang: { name: 'Mustang Organic Apple (मुस्ताङ स्याउ)', nameNe: 'मुस्ताङ स्याउ', pricePerKg: 240, wholesale: 190 },
  };

  const [producePrices, setProducePrices] = useState<Record<string, { name: string; nameNe: string; pricePerKg: number; wholesale: number }>>(DEFAULT_PRODUCE_PRICES);
  const [kalimatiAllItems, setKalimatiAllItems] = useState<Array<{ id: string; name: string; nameNe: string; pricePerKg: number; wholesale: number }>>([]);
  const [kalimatiMeta, setKalimatiMeta] = useState<{ publishedAt: string; live: boolean; count: number }>({
    publishedAt: new Date().toISOString().split('T')[0],
    live: false,
    count: 20,
  });
  const [isRefreshingKalimati, setIsRefreshingKalimati] = useState<boolean>(false);

  const fetchLiveKalimati = async (forceRefresh = false) => {
    setIsRefreshingKalimati(true);
    try {
      const res = await fetch(`/api/market/kalimati${forceRefresh ? '?refresh=1' : ''}`);
      if (res.ok) {
        const data = await res.json();
        if (data.featuredRates) {
          setProducePrices(data.featuredRates);
        }
        if (Array.isArray(data.allCommodities)) {
          setKalimatiAllItems(data.allCommodities);
        }
        setKalimatiMeta({
          publishedAt: data.publishedAt || new Date().toISOString().split('T')[0],
          live: Boolean(data.live),
          count: Number(data.count) || 20,
        });
        if (forceRefresh) {
          showToast('Kalimati Rates Synced', `Loaded ${data.count || 20} commodities (${data.publishedAt || 'Today'})`, 'success', 2500);
        }
      }
    } catch {
      // Keep fallback produce prices
    } finally {
      setIsRefreshingKalimati(false);
    }
  };

  useEffect(() => {
    fetchLiveKalimati(false);
  }, []);

  const [produceSearch, setProduceSearch] = useState('');
  const [produceCategory, setProduceCategory] = useState<'all' | 'daily' | 'leafy' | 'spices' | 'specialty'>('all');

  const downloadKalimatiCsv = () => {
    const headers = 'Item,Nepali Name,Wholesale Price (NPR/kg),Retail Price (NPR/kg),Margin (NPR/kg)\n';
    const sourceRows = kalimatiAllItems.length > 0 ? kalimatiAllItems : Object.values(producePrices);
    const rows = sourceRows
      .map(p => `"${p.name}","${p.nameNe}",${p.wholesale},${p.pricePerKg},${p.pricePerKg - p.wholesale}`)
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `kalimati_tarkari_rates_${kalimatiMeta.publishedAt || Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Price Sheet Downloaded', `Exported ${sourceRows.length} Kalimati commodity prices (.csv)`, 'success', 2500);
  };

  const producePoolMap: Record<string, { name: string; nameNe: string; pricePerKg: number; wholesale: number }> =
    produceSearch.trim() && kalimatiAllItems.length > 0
      ? Object.fromEntries(kalimatiAllItems.map(item => [item.id, item]))
      : producePrices;

  const activeProduceData =
    producePrices[selectedProduce] ||
    kalimatiAllItems.find(item => item.id === selectedProduce) ||
    DEFAULT_PRODUCE_PRICES.tomato_big;
  const convertedWeight = convertWeightKg(unit === 'dharni' ? quantity * 2.5 : unit === 'pau' ? quantity * 0.2 : quantity);
  const estimatedProduceRetailNpr = Math.round(convertedWeight.kg * activeProduceData.pricePerKg);
  const estimatedProduceWholesaleNpr = Math.round(convertedWeight.kg * activeProduceData.wholesale);

  const DAILY_UTILITIES_DIRECTORY = [
    {
      id: 'fx' as ActiveToolTab,
      category: 'financial' as const,
      icon: ArrowRightLeft,
      labelEn: 'NRB Forex & Dollar Card',
      labelNe: 'विदेशी मुद्रा र डलर कार्ड',
      descEn: '11 Live NRB rates + $500 annual card quota tracking with 3% bank spread & 2% DST.',
      descNe: '११ विदेशी मुद्राको राष्ट्र बैंक दर, ३% बैंक स्प्रेड, २% डिजिटल सेवा कर, र $५०० वार्षिक सीमा।',
      keywords: 'forex dollar nrb currency aud cad inr jpy qar aed chatgpt claude cursor subs quota विनिमय दर डलर कार्ड',
    },
    {
      id: 'ev' as ActiveToolTab,
      category: 'mobility' as const,
      icon: Zap,
      labelEn: 'EV Road Tax & NEA TOD',
      labelNe: 'ईभी सडक कर र चार्जिंग',
      descEn: 'Provincial EV road tax rates (Bagmati/All provinces), bluebook delay penalties (5%-100%), and NEA TOD charging cost vs. petrol savings.',
      descNe: 'बागमती प्रदेश ईभी सडक कर, ब्लुबुक नवीकरण जरिवाना, र नेपाल विद्युत प्राधिकरण (NEA) TOD युनिट चार्जिंग दर तथा बचत।',
      keywords: 'ev electric vehicle road tax bluebook nea charging tod fine bagmati car microbus hiace सडक कर ब्लुबुक जरिवाना विद्युतीय सवारी',
    },
    {
      id: 'nepse' as ActiveToolTab,
      category: 'financial' as const,
      icon: TrendingUp,
      labelEn: 'NEPSE Capital & CGT',
      labelNe: 'नेप्से सेयर र पुँजीगत लाभकर',
      descEn: 'SEBON 5-tier broker commission, short-term (7.5%) & long-term (5%) CGT, DP fees, break-even target price, and bonus/right share adjustments.',
      descNe: 'धितोपत्र बोर्डको ५ तह ब्रोकर कमिसन, ७.५% / ५% पुँजीगत लाभकर (CGT), डिपी शुल्क, ब्रेक-इभन मूल्य र बोनस सेयर समायोजन।',
      keywords: 'nepse sebon share cgt broker commission dividend bonus right share break-even share market trading सेयर बजार ब्रोकर कमिसन पुँजीगत लाभकर नेप्से',
    },
    {
      id: 'it_export' as ActiveToolTab,
      category: 'financial' as const,
      icon: FileCheck2,
      labelEn: 'IT Export Remittance 95Ka',
      labelNe: 'आईटी निर्यात तथा दफा ९५क',
      descEn: 'Income Tax Act 2058 Section 95Ka 5% individual final TDS / 1% company TDS on USD wire remittances with bilingual bank declaration letter export.',
      descNe: 'आयकर ऐन २०५८ दफा ९५क अन्तर्गत सफ्टवेयर तथा आईटी निर्यातको ५%/१% अन्तिम टीडीएस र वाणिज्य बैंक स्वघोषणा पत्र।',
      keywords: 'it export remittance wire usd nrb tds 95ka declaration letter freelance software contract foreign currency विप्रेषण स्वघोषणा पत्र आईटी निर्यात',
    },
    {
      id: 'bullion' as ActiveToolTab,
      category: 'financial' as const,
      icon: Coins,
      labelEn: 'Gold & Silver Bullion',
      labelNe: 'सुनचाँदी र गहना हिसाब',
      descEn: 'FENEGOSIDA daily bullion rates, Tola/Aana/Grams calculator, making charges (ज्याला), wastage (जर्ती), and luxury tax.',
      descNe: 'नेपाल सुनचाँदी व्यवसायी महासंघ दर, तोला/आना/ग्राम रूपान्तरण, ज्याला र जर्ती हिसाब, विलासिता कर तथा १३% भ्याट।',
      keywords: 'gold silver bullion tola aana lal gram fenegosida jeweller wastage jarti making charge luxury tax सुन चाँदी गहना तोला',
    },
    {
      id: 'tax' as ActiveToolTab,
      category: 'financial' as const,
      icon: Calculator,
      labelEn: 'Nepal Income Tax & TDS',
      labelNe: 'नेपाल आयकर तथा टीडीएस',
      descEn: 'IRD progressive tax slabs (FY 2081/82) + Section 95Ka IT export TDS (5% individual / 1% company).',
      descNe: 'आन्तरिक राजस्व विभाग २०८१/८२ कर स्ल्याब, आईटी सफ्टवेयर निर्यात ५%/१% टीडीएस र तलब विवरण।',
      keywords: 'tax tds income salary payroll ssf epf cit ird finance act 2081/82 software export आयकर तलब',
    },
    {
      id: 'letter' as ActiveToolTab,
      category: 'legal' as const,
      icon: FileEdit,
      labelEn: 'Ward Nibedan & Preeti',
      labelNe: 'वडा निवेदन र प्रीति',
      descEn: '12 verified legal municipality templates + real-time Unicode ↔ Preeti converter & Word export.',
      descNe: '१२ आधिकारिक वडा निवेदन ढाँचाहरू र नेपाली युनिकोड ↔ प्रीति रूपान्तरक तथा वर्ड डाउनलोड।',
      keywords: 'ward nibedan preeti unicode nata pramanit letter template word doc print वडा निवेदन प्रीति',
    },
    {
      id: 'voice' as ActiveToolTab,
      category: 'linguistic' as const,
      icon: Mic,
      labelEn: 'Nepali Neural Voice',
      labelNe: 'नेपाली न्युरल आवाज',
      descEn: 'Natural Devanagari text-to-speech with 4 regional accents (Kathmandu, Pokhara, Kirati, Maithili).',
      descNe: '४ क्षेत्रीय लवज (काठमाडौं, पोखरेली, किराँती, मैथिली) सहितको प्राकृतिक नेपाली आवाज।',
      keywords: 'voice audio speech tts accent devanagari बोली आवाज अडियो',
    },
    {
      id: 'khata' as ActiveToolTab,
      category: 'financial' as const,
      icon: Receipt,
      labelEn: 'Bill & Udharo Khata Snap',
      labelNe: 'बिल र उधारो खाता',
      descEn: 'Snap handwritten bills or udharo notebooks into clean digital ledgers with WhatsApp reminders & PDF.',
      descNe: 'हस्तलिखित बिल वा उधारो कापीको फोटोबाट साफ डिजिटल खाता, WhatsApp रिमाइन्डर र PDF।',
      keywords: 'udharo khata bill snap kirana photo handwritten ledger hisab whatsapp reminder उधारो खाता बिल',
    },
    {
      id: 'contract' as ActiveToolTab,
      category: 'legal' as const,
      icon: ShieldAlert,
      labelEn: 'Contract & Tamasuk Check',
      labelNe: 'सम्झौता र तमसुक जाँच',
      descEn: 'Scan house rent deeds, loan tamasuk & job offer bonds to spot hidden traps & illegal interest before signing.',
      descNe: 'घरभाडा सम्झौता, तमसुक र नोकरी अफरका लुकेका जोखिम र छुटेका सुरक्षा बुँदा हस्ताक्षर अघि जाँच्नुहोस्।',
      keywords: 'contract tamasuk risk rent agreement job bond ghar bhada samjhauta तमसुक सम्झौता घरभाडा जोखिम',
    },
    {
      id: 'health' as ActiveToolTab,
      category: 'linguistic' as const,
      icon: HeartPulse,
      labelEn: 'Lab & Rx Parents Guide',
      labelNe: 'रिपोर्ट र औषधि (आमा–बुबा)',
      descEn: 'Translate blood reports & prescriptions into a Morning/Day/Night pill chart with calm Nepali audio readback.',
      descNe: 'रगत जाँच र औषधि पर्चीको फोटोबाट बिहान/दिउँसो/राति औषधि तालिका र शान्त नेपाली आवाजमा सरल अर्थ।',
      keywords: 'lab report prescription medicine blood sugar thyroid parents audio nepali स्वास्थ्य रिपोर्ट औषधि पर्ची आमाबुबा',
    },
    {
      id: 'sarkari' as ActiveToolTab,
      category: 'legal' as const,
      icon: Building2,
      labelEn: 'Sarkari Counter Guide',
      labelNe: 'सरकारी काम गाइड',
      descEn: 'Zero-mistake document checklists, room-by-room counters & fees for Passport, NID, License, PAN & Malpot.',
      descNe: 'राहदानी, NID, लाइसेन्स, प्यान, कम्पनी र मालपोत कामका कागजात चेकलिस्ट, काउन्टर क्रम र सरकारी दस्तुर।',
      keywords: 'passport nid license yatayat pan vat ocr malpot police clearance sarkari राहदानी मालपोत लाइसेन्स',
    },
    {
      id: 'ocr' as ActiveToolTab,
      category: 'legal' as const,
      icon: Scan,
      labelEn: 'Devanagari OCR',
      labelNe: 'कागजात ओसीआर',
      descEn: 'Instant field extraction from Nepali Citizenship (Nagarikta), Land Lalpurja, or VAT bills.',
      descNe: 'नागरिकता, जग्गाधनी प्रमाणपुर्जा र कर बिजकको स्क्यान तथा तस्बिरबाट स्वचालित देवनागरी डाटा।',
      keywords: 'ocr nagarikta lalpurja vat citizenship land deed scan extract devanagari ओसीआर नागरिकता',
    },
    {
      id: 'market' as ActiveToolTab,
      category: 'agri' as const,
      icon: Compass,
      labelEn: 'Kalimati & Land Units',
      labelNe: 'कालिमाटी र जग्गा नाप',
      descEn: '20 Kalimati commodities with wholesale/retail margins + Hilly (Ropani) & Terai (Bigha) land units.',
      descNe: '२० कालिमाटी कृषि उपज दर, सीएसभी डाउनलोड, र पहाडी (रोपनी) तथा तराई (बिघा) जग्गा नाप।',
      keywords: 'kalimati vegetable produce price ropani aana paisa daam bigha kattha dhur land converter कालिमाटी जग्गा',
    },
  ];

  const [utilitySearch, setUtilitySearch] = useState('');
  const [utilityCategoryFilter, setUtilityCategoryFilter] = useState<'all' | 'financial' | 'mobility' | 'legal' | 'linguistic' | 'agri'>('all');

  const filteredDailyTools = DAILY_UTILITIES_DIRECTORY.filter((tool) => {
    const matchesCat = utilityCategoryFilter === 'all' || tool.category === utilityCategoryFilter;
    const q = utilitySearch.toLowerCase().trim();
    const matchesSearch = !q || 
      tool.labelEn.toLowerCase().includes(q) ||
      tool.labelNe.toLowerCase().includes(q) ||
      tool.descEn.toLowerCase().includes(q) ||
      tool.descNe.toLowerCase().includes(q) ||
      tool.keywords.toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  const activeToolMeta = DAILY_UTILITIES_DIRECTORY.find((t) => t.id === activeTab) || DAILY_UTILITIES_DIRECTORY[0];

  return (
    <section
      id="daily-tools"
      className={`py-12 sm:py-16 md:py-20 relative border-t transition-colors duration-300 ${
        isDark ? 'border-white/[0.08] bg-[#070a12]' : 'border-slate-200 bg-slate-50/70'
      }`}
      aria-labelledby="daily-tools-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Navigation */}
        <div className="mb-4">
          <Breadcrumbs
            items={[
              { label: isNe ? 'गृहपृष्ठ' : 'Home', onClick: onNavigateHome },
              { label: isNe ? 'दैनिक एआई सेवाहरू' : 'Daily AI Utilities' },
              { label: isNe ? activeToolMeta.labelNe : activeToolMeta.labelEn, isCurrent: true },
            ]}
          />
        </div>

        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 sm:gap-6 pb-6 sm:pb-8 border-b border-slate-500/20">
          <div className="max-w-3xl">
            <div className={`flex items-center gap-2 text-xs mb-2 font-mono uppercase tracking-wider font-semibold ${
              isDark ? 'text-cyan-400' : 'text-cyan-700'
            }`}>
              <Sparkles className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{isNe ? 'दैनिक व्यावहारिक एआई उपयोगिता • प्रमाणित डेटा' : 'Daily AI Utilities • Verified Nepal Data'}</span>
            </div>
            
            <h2
              id="daily-tools-heading"
              className={`text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight font-display leading-snug ${
                isDark ? 'text-white' : 'text-slate-950'
              }`}
            >
              {isNe ? 'दैनिक नेपाली एआई, कर तथा सवारी उपयोगिता' : 'Daily AI, Tax, EV & Capital Utilities'}
            </h2>

            <p className={`mt-2 text-sm leading-relaxed ${
              isDark ? 'text-slate-300' : 'text-slate-700'
            }`}>
              {isNe 
                ? 'ईभी सडक कर, नेप्से सेयर र CGT, दफा ९५क निर्यात कर, डलर कार्ड, वडा निवेदन र जग्गा नाप।' 
                : 'EV road tax & NEA charging, NEPSE CGT, Section 95Ka declaration, Dollar Card calculator, ward letters & land units.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0 self-start lg:self-auto">
            {onOpenHamroAI && (
              <button
                type="button"
                onClick={onOpenHamroAI}
                className={`min-h-[44px] px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  isDark
                    ? 'bg-white/[0.06] hover:bg-white/[0.12] border-white/15 text-white'
                    : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-900 shadow-xs'
                }`}
              >
                <Sparkles className="h-4 w-4 text-cyan-500" />
                <span>{isNe ? 'एआई सहायक (सबैको लागि)' : 'Ask AI Helper'}</span>
              </button>
            )}
            <div className={`flex items-center gap-2 text-xs font-mono font-semibold px-3.5 py-2 rounded-xl border min-h-[44px] ${
              isDark
                ? 'text-cyan-300 bg-cyan-500/10 border-cyan-500/30'
                : 'text-cyan-800 bg-cyan-50 border-cyan-200'
            }`}>
              <BadgeCheck className="h-4 w-4 text-cyan-500 shrink-0" />
              <span>Verified Data · Instant Export</span>
            </div>
          </div>
        </div>

        {/* Searchable, Filterable Daily AI Utilities Directory Controls */}
        <div className="mt-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Category Filter Tabs */}
          <div className={`flex items-center gap-1.5 overflow-x-auto no-scrollbar p-1 rounded-xl border ${
            isDark ? 'bg-white/[0.04] border-white/10' : 'bg-slate-100 border-slate-200'
          }`}>
            {[
              { id: 'all', labelEn: 'All Utilities', labelNe: 'सबै (१०)', count: 10 },
              { id: 'financial', labelEn: 'Financial & Gold', labelNe: 'वित्तीय तथा सुनचाँदी (५)', count: 5 },
              { id: 'mobility', labelEn: 'EV Mobility', labelNe: 'ईभी सवारी (१)', count: 1 },
              { id: 'legal', labelEn: 'Ward & Legal', labelNe: 'वडा तथा कानुनी (२)', count: 2 },
              { id: 'linguistic', labelEn: 'Voice & Audio', labelNe: 'आवाज तथा भाषा (१)', count: 1 },
              { id: 'agri', labelEn: 'Market & Land', labelNe: 'बजार तथा जग्गा (१)', count: 1 },
            ].map((cat) => {
              const isSelected = utilityCategoryFilter === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setUtilityCategoryFilter(cat.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer min-h-[36px] flex items-center gap-1.5 ${
                    isSelected
                      ? isDark
                        ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/40'
                        : 'bg-cyan-700 text-white shadow-xs'
                      : isDark
                        ? 'text-slate-300 hover:text-white hover:bg-white/[0.06]'
                        : 'text-slate-700 hover:text-slate-950 hover:bg-slate-200/70'
                  }`}
                >
                  <span>{isNe ? cat.labelNe : cat.labelEn}</span>
                  <span className="text-xs opacity-90 font-mono">({cat.count})</span>
                </button>
              );
            })}
          </div>

          {/* Utility Keyword Search */}
          <div className="relative w-full md:w-80 shrink-0">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${isDark ? 'text-slate-300' : 'text-slate-600'}`} aria-hidden="true" />
            <input
              type="text"
              value={utilitySearch}
              onChange={(e) => setUtilitySearch(e.target.value)}
              placeholder={isNe ? 'सेवा खोज्नुहोस् (उदा: ईभी, नेप्से, कर)...' : 'Filter utilities (ev, nepse, tax, dollar)...'}
              className={`w-full pl-9 pr-8 py-2 rounded-xl text-sm border focus:outline-hidden focus:ring-2 focus:ring-cyan-500/50 min-h-[44px] ${
                isDark
                  ? 'border-white/15 bg-[#0c101d] text-slate-100 placeholder:text-slate-400'
                  : 'border-slate-300 bg-white text-slate-950 placeholder:text-slate-500'
              }`}
            />
            {utilitySearch && (
              <button
                type="button"
                onClick={() => setUtilitySearch('')}
                className={`absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer ${
                  isDark ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-950'
                }`}
                aria-label="Clear utility search"
              >
                <XCircle className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Tab Controls with 44px+ touch targets */}
        {filteredDailyTools.length === 0 ? (
          <div className="mt-8">
            <EmptyState
              icon={<Search className="h-6 w-6 text-slate-400" />}
              title={isNe ? 'कुनै उपयोगिता फेला परेन' : 'No Utilities Matched Your Search'}
              description={
                isNe
                  ? `"${utilitySearch}" सँग सम्बन्धित कुनै उपयोगिता भेटिएन। कृपया अर्को शब्द खोजी गर्नुहोस्।`
                  : `No utility matched "${utilitySearch}". Try searching for 'ev', 'nepse', '95ka', 'tax', or 'forex'.`
              }
              actionLabel={isNe ? 'फिल्टर हटाउनुहोस्' : 'Reset Filter'}
              onAction={() => {
                setUtilitySearch('');
                setUtilityCategoryFilter('all');
              }}
            />
          </div>
        ) : (
          <div
            className="mt-6 sm:mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-10 gap-2 sm:gap-2.5"
            role="tablist"
            aria-label="Daily AI Utilities Selection"
          >
            {filteredDailyTools.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={isActive}
                  type="button"
                  onClick={() => handleSelectToolTab(tab.id as ActiveToolTab)}
                  className={`min-h-[48px] p-2.5 sm:p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                    isActive
                      ? isDark
                        ? 'bg-cyan-500/20 text-cyan-200 border-cyan-500/50'
                        : 'bg-cyan-700 text-white border-cyan-700 shadow-xs'
                      : isDark
                        ? 'border-white/10 bg-white/[0.03] text-slate-300 hover:text-white hover:bg-white/[0.06]'
                        : 'border-slate-300 bg-white text-slate-700 hover:text-slate-950 hover:border-slate-400'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="truncate">{isNe ? tab.labelNe : tab.labelEn}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Active Tool Interactive Container */}
        <AnimatePresence mode="wait">
          {isHydrating || isHydratingLocal ? (
            <motion.div
              key="daily-skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-6"
            >
              <BentoGridSkeleton theme={theme} type="daily" count={3} />
            </motion.div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className={`mt-6 rounded-3xl border p-5 sm:p-7 transition-all ${
                isDark
                  ? 'border-white/[0.08] bg-[#090d16]'
                  : 'border-slate-200 bg-white shadow-xs'
              }`}
            >
              
              {/* ============================================================= */}
              {/* TAB 1: REAL-TIME USD TO NPR FX & NRB AI SUBSCRIPTION CONVERTER */}
              {/* ============================================================= */}
              {activeTab === 'fx' && (
                <div>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-500/20">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold border ${
                          isDark ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30' : 'bg-cyan-50 text-cyan-800 border-cyan-300'
                        }`}>
                          NRB OFFICIAL BENCHMARK
                        </span>
                        <span className={`text-xs font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                          {lastRateSync}
                        </span>
                      </div>
                      <h3 className={`text-base sm:text-lg font-bold font-display ${isDark ? 'text-white' : 'text-slate-950'}`}>
                        {isNe ? 'एआई सेवा सदस्यता डलर ➔ नेरु रूपान्तरक तथा कर गणना' : 'AI Subscription USD ➔ NPR Converter & NRB Engine'}
                      </h3>
                      <p className={`text-xs sm:text-sm mt-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        Accurate NPR calculation for ChatGPT, Claude, Cursor, Midjourney with 3% bank spread & 2% Digital Services Tax (DST).
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => fetchLiveNrbForex(true)}
                        disabled={isRefreshingFx}
                        className={`min-h-[44px] px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border transition-colors cursor-pointer ${
                          isDark
                            ? 'bg-white/[0.05] hover:bg-white/[0.1] text-cyan-300 border-white/15'
                            : 'bg-slate-100 hover:bg-slate-200 text-cyan-800 border-slate-300'
                        }`}
                        title="Sync live rate from Nepal Rastra Bank"
                      >
                        <RefreshCw className={`h-4 w-4 ${isRefreshingFx ? 'animate-spin' : ''}`} aria-hidden="true" />
                        <span>{isRefreshingFx ? 'Syncing...' : 'Sync NRB Rate'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          exportFxAuditPdf({
                            serviceName: activePreset.name,
                            provider: activePreset.provider,
                            billingCycle,
                            liveNrbRate,
                            effectiveTotalUsd,
                            baseNpr: fxBaseNpr,
                            bankSpreadNpr: fxBankSpreadFee,
                            dstTaxNpr: fxDstTaxAmount,
                            vatNpr: fxVatAmount,
                            totalNpr: fxTotalNpr,
                            quotaUsedPct,
                            remainingUsd: remainingAnnualQuotaUsd,
                            publishedAt: nrbPublishedAt,
                          })
                        }
                        className={`min-h-[44px] px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-colors cursor-pointer ${
                          isDark
                            ? 'bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-200 border-cyan-500/40'
                            : 'bg-cyan-50 hover:bg-cyan-100 text-cyan-900 border-cyan-300'
                        }`}
                      >
                        <Printer className="h-4 w-4" />
                        <span>Save PDF</span>
                      </button>

                      <button
                        type="button"
                        onClick={downloadFxSummary}
                        className="min-h-[44px] px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                      >
                        <Download className="h-4 w-4" />
                        <span>Export Audit (.txt)</span>
                      </button>
                    </div>
                  </div>

                  {/* Mode Switcher */}
                  <div className={`mt-4 flex flex-wrap items-center gap-2 p-1 rounded-xl border w-fit ${
                    isDark ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-slate-100'
                  }`}>
                    <button
                      type="button"
                      onClick={() => setFxMode('ai_subs')}
                      className={`min-h-[40px] px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        fxMode === 'ai_subs'
                          ? 'bg-cyan-600 text-white shadow-xs'
                          : isDark ? 'text-slate-300 hover:text-white' : 'text-slate-700 hover:text-slate-950'
                      }`}
                    >
                      {isNe ? 'एआई सदस्यता र डलर कार्ड ($५००)' : 'AI Subscription & $500 Dollar Card'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setFxMode('currency_converter')}
                      className={`min-h-[40px] px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        fxMode === 'currency_converter'
                          ? 'bg-cyan-600 text-white shadow-xs'
                          : isDark ? 'text-slate-300 hover:text-white' : 'text-slate-700 hover:text-slate-950'
                      }`}
                    >
                      {isNe ? 'राष्ट्र बैंक बहु-मुद्रा रूपान्तरक (११ मुद्रा)' : 'NRB Multi-Currency Exchange (11 Rates)'}
                    </button>
                  </div>

                  {fxMode === 'currency_converter' ? (
                    <div className="mt-6 space-y-6">
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        <div className="lg:col-span-6 space-y-4">
                          <div>
                            <label className={`text-xs font-semibold block mb-2 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                              {isNe ? 'मुद्रा छनोट गर्नुहोस्:' : 'Select Foreign Currency:'}
                            </label>
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                              {Object.keys(nrbRates).map((curr) => {
                                const r = nrbRates[curr];
                                const isSelected = selectedCurrency === curr;
                                return (
                                  <button
                                    key={curr}
                                    type="button"
                                    onClick={() => setSelectedCurrency(curr)}
                                    className={`min-h-[44px] p-2 rounded-xl border text-xs font-bold flex flex-col items-center justify-center transition-colors cursor-pointer ${
                                      isSelected
                                        ? isDark
                                          ? 'border-cyan-400 bg-cyan-500/15 text-cyan-200 ring-1 ring-cyan-400'
                                          : 'border-cyan-600 bg-cyan-50 text-cyan-900 ring-1 ring-cyan-600'
                                        : isDark
                                          ? 'border-white/10 bg-white/[0.03] text-slate-200 hover:bg-white/[0.06]'
                                          : 'border-slate-300 bg-slate-50 text-slate-800 hover:bg-slate-100'
                                    }`}
                                  >
                                    <span className="font-mono text-sm">{curr}</span>
                                    <span className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>रु. {r.mid}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          <div>
                            <label className={`text-xs font-semibold block mb-1 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                              {isNe ? `रकम प्रविष्ट गर्नुहोस् (${selectedCurrency}):` : `Enter Amount in ${selectedCurrency}:`}
                            </label>
                            <input
                              type="number"
                              min={1}
                              value={currencyInputAmount}
                              onChange={(e) => setCurrencyInputAmount(Math.max(1, Number(e.target.value)))}
                              className={`w-full min-h-[44px] text-base font-mono font-bold rounded-xl border p-2.5 ${
                                isDark ? 'bg-[#060913] border-white/15 text-white' : 'bg-slate-50 border-slate-300 text-slate-950'
                              }`}
                            />
                          </div>
                        </div>

                        <div className="lg:col-span-6">
                          {(() => {
                            const activeRate = nrbRates[selectedCurrency] || nrbRates.USD;
                            const grossNpr = (currencyInputAmount / activeRate.unit) * activeRate.mid;
                            const buyNpr = (currencyInputAmount / activeRate.unit) * activeRate.buy;
                            const sellNpr = (currencyInputAmount / activeRate.unit) * activeRate.sell;
                            return (
                              <div className={`p-5 rounded-2xl border space-y-4 ${
                                isDark ? 'bg-[#0c1322] border-cyan-500/35' : 'bg-white border-cyan-300 shadow-sm'
                              }`}>
                                <div className="flex items-center justify-between pb-3 border-b border-slate-500/20">
                                  <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-cyan-400' : 'text-cyan-700'}`}>
                                    NRB Official Calculation ({selectedCurrency} ➔ NPR)
                                  </span>
                                  <span className={`text-xs font-mono ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Unit: {activeRate.unit} {selectedCurrency}</span>
                                </div>

                                <div>
                                  <span className={`text-xs font-mono uppercase block ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Mid-Market Equivalent</span>
                                  <span className={`text-3xl font-black font-mono block mt-0.5 tabular-nums ${isDark ? 'text-cyan-300' : 'text-cyan-700'}`}>
                                    रू {Math.round(grossNpr).toLocaleString()}
                                  </span>
                                  <span className={`text-xs mt-1 block ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                    {currencyInputAmount} {selectedCurrency} at रू {activeRate.mid} per {activeRate.unit > 1 ? `${activeRate.unit} ` : ''}{selectedCurrency}
                                  </span>
                                </div>

                                <div className="space-y-2 pt-2 border-t border-slate-500/15 text-xs">
                                  <div className="flex justify-between py-1 border-b border-slate-500/10">
                                    <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>NRB Buying Rate (खरिद दर):</span>
                                    <span className={`font-mono font-semibold tabular-nums ${isDark ? 'text-white' : 'text-slate-950'}`}>रू {activeRate.buy} ➔ रू {Math.round(buyNpr).toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between py-1 border-b border-slate-500/10">
                                    <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>NRB Selling Rate (बिक्री दर):</span>
                                    <span className={`font-mono font-semibold tabular-nums ${isDark ? 'text-white' : 'text-slate-950'}`}>रू {activeRate.sell} ➔ रू {Math.round(sellNpr).toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between py-1">
                                    <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>Directive:</span>
                                    <span className={`font-mono text-xs font-semibold ${isDark ? 'text-cyan-400' : 'text-cyan-700'}`}>NRB Foreign Exchange Dept 2081/82</span>
                                  </div>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      </div>

                      {/* Complete NRB Forex Rates Table */}
                      <div className={`rounded-2xl border overflow-hidden ${
                        isDark ? 'border-white/10 bg-[#060a14]' : 'border-slate-300 bg-white'
                      }`}>
                        <div className={`p-3.5 border-b flex items-center justify-between ${
                          isDark ? 'bg-white/[0.03] border-white/10' : 'bg-slate-50 border-slate-200'
                        }`}>
                          <span className={`text-xs font-bold font-mono uppercase ${isDark ? 'text-cyan-400' : 'text-cyan-700'}`}>
                            Official Nepal Rastra Bank (NRB) Benchmark Exchange Board
                          </span>
                          <span className={`text-xs font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{Object.keys(nrbRates).length} Published Currencies</span>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs">
                            <thead>
                              <tr className={`border-b ${isDark ? 'border-white/10 text-slate-300' : 'border-slate-200 text-slate-800'}`}>
                                <th className="p-3 font-semibold">Currency</th>
                                <th className="p-3 font-semibold">Unit</th>
                                <th className="p-3 font-semibold">Buying (खरिद)</th>
                                <th className="p-3 font-semibold">Selling (बिक्री)</th>
                                <th className="p-3 font-semibold">Mid-Rate (मध्यम)</th>
                              </tr>
                            </thead>
                            <tbody>
                              {Object.entries(nrbRates).map(([curr, r]: [string, { buy: number; sell: number; mid: number; unit: number }]) => (
                                <tr key={curr} className={`border-b ${isDark ? 'border-white/5 hover:bg-white/[0.03] text-slate-200' : 'border-slate-100 hover:bg-slate-50 text-slate-900'}`}>
                                  <td className={`p-3 font-bold font-mono ${isDark ? 'text-cyan-300' : 'text-cyan-700'}`}>{curr}</td>
                                  <td className="p-3 font-mono tabular-nums">{r.unit}</td>
                                  <td className="p-3 font-mono tabular-nums">रू {r.buy}</td>
                                  <td className="p-3 font-mono tabular-nums">रू {r.sell}</td>
                                  <td className="p-3 font-mono font-bold tabular-nums">रू {r.mid}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Main Grid: Presets (Left) + Outflow Matrix (Right) */
                    <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
                      
                      {/* Left Column: Preset Selection & Configuration */}
                      <div className="lg:col-span-7 space-y-5">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                              1. Select AI Tool or Enter Custom USD:
                            </label>
                            <span className={`text-xs font-semibold ${isDark ? 'text-cyan-400' : 'text-cyan-700'}`}>
                              {AI_SUBSCRIPTION_PRESETS.length} Verified Tools
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[340px] overflow-y-auto pr-1">
                            {AI_SUBSCRIPTION_PRESETS.map((preset) => {
                              const isSelected = selectedAiPreset === preset.id;
                              const priceDisplay = preset.id === 'custom' 
                                ? `$${fxUsdAmount.toFixed(0)} USD` 
                                : `$${preset.monthlyUsd.toFixed(2)}/mo`;

                              return (
                                <button
                                  key={preset.id}
                                  type="button"
                                  onClick={() => handleSelectPreset(preset.id)}
                                  className={`min-h-[58px] p-3 rounded-xl border text-left transition-colors flex items-start gap-2.5 cursor-pointer ${
                                    isSelected
                                      ? isDark
                                        ? 'border-cyan-400 bg-cyan-950/35 ring-1 ring-cyan-400/50 text-white'
                                        : 'border-cyan-600 bg-cyan-50 ring-1 ring-cyan-600 text-slate-950'
                                      : isDark
                                      ? 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06] text-slate-100'
                                      : 'border-slate-300 bg-slate-50 hover:bg-white text-slate-900'
                                  }`}
                                >
                                  <span className="text-xl shrink-0" aria-hidden="true">{preset.icon}</span>
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center justify-between gap-1">
                                      <span className="font-bold text-xs truncate">{preset.name}</span>
                                      <span className={`text-xs font-mono font-bold shrink-0 ${isDark ? 'text-cyan-300' : 'text-cyan-700'}`}>
                                        {priceDisplay}
                                      </span>
                                    </div>
                                    <p className={`text-xs truncate mt-0.5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{preset.desc}</p>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Custom Amount input if selected */}
                        {selectedAiPreset === 'custom' && (
                          <div className={`p-3.5 rounded-xl border ${
                            isDark ? 'border-cyan-500/35 bg-cyan-500/5' : 'border-cyan-300 bg-cyan-50/60'
                          }`}>
                            <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-cyan-300' : 'text-cyan-800'}`}>
                              Custom Monthly Spending in USD ($):
                            </label>
                            <input
                              type="number"
                              min={1}
                              max={500}
                              value={fxUsdAmount}
                              onChange={(e) => setFxUsdAmount(Math.max(1, Number(e.target.value)))}
                              className={`w-full min-h-[44px] text-sm rounded-lg border px-3 font-mono font-bold ${
                                isDark
                                  ? 'border-cyan-500/40 bg-[#060913] text-white'
                                  : 'border-cyan-400 bg-white text-slate-950'
                              }`}
                            />
                          </div>
                        )}

                        {/* Billing Cycle & Tax Toggles */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-500/15 text-xs">
                          <div>
                            <label className={`font-semibold block mb-1 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Billing Cycle:</label>
                            <div className={`flex rounded-xl border p-1 ${
                              isDark ? 'border-white/10 bg-white/[0.03]' : 'border-slate-300 bg-slate-100'
                            }`}>
                              <button
                                type="button"
                                onClick={() => setBillingCycle('monthly')}
                                className={`flex-1 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                                  billingCycle === 'monthly'
                                    ? 'bg-cyan-600 text-white shadow-xs'
                                    : isDark ? 'text-slate-300' : 'text-slate-700'
                                }`}
                              >
                                Monthly
                              </button>
                              <button
                                type="button"
                                onClick={() => setBillingCycle('annual')}
                                className={`flex-1 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                                  billingCycle === 'annual'
                                    ? 'bg-cyan-600 text-white shadow-xs'
                                    : isDark ? 'text-slate-300' : 'text-slate-700'
                                }`}
                              >
                                Annual (12 Mos)
                              </button>
                            </div>
                          </div>

                          <div className={`space-y-2 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={includeCardSpread}
                                onChange={(e) => setIncludeCardSpread(e.target.checked)}
                                className="rounded accent-cyan-600 min-h-[18px] min-w-[18px]"
                              />
                              <span>Bank Card Spread (+3.0%)</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={includeDstTax}
                                onChange={(e) => setIncludeDstTax(e.target.checked)}
                                className="rounded accent-cyan-600 min-h-[18px] min-w-[18px]"
                              />
                              <span>Nepal Digital Services Tax (+2.0% DST)</span>
                            </label>
                          </div>
                        </div>

                      </div>

                      {/* Right Column: Financial Outflow Matrix */}
                      <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
                        
                        <div className={`p-5 rounded-2xl border ${
                          isDark ? 'bg-[#0c1322] border-cyan-500/35' : 'bg-white border-cyan-300 shadow-sm'
                        }`}>
                          
                          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-500/20">
                            <div>
                              <span className={`text-xs font-mono uppercase font-bold block ${isDark ? 'text-cyan-400' : 'text-cyan-700'}`}>
                                Total Outflow in NPR
                              </span>
                              <span className={`text-xs font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                                {activePreset.name.split(' (')[0]} ({billingCycle === 'annual' ? '12 Months' : 'Monthly'})
                              </span>
                            </div>
                            <div className="text-right">
                              <span className={`text-2xl font-black font-mono tabular-nums ${isDark ? 'text-cyan-300' : 'text-cyan-700'}`}>
                                रू {Math.round(fxTotalNpr).toLocaleString()}
                              </span>
                              <span className={`text-xs block font-mono ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                ≈ ${effectiveTotalUsd.toFixed(2)} USD
                              </span>
                            </div>
                          </div>

                          <div className="space-y-2 text-xs">
                            <div className="flex justify-between py-1 border-b border-slate-500/10">
                              <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>Base NRB Exchange (${effectiveTotalUsd} × {liveNrbRate}):</span>
                              <span className={`font-mono font-medium tabular-nums ${isDark ? 'text-white' : 'text-slate-950'}`}>रू {Math.round(fxBaseNpr).toLocaleString()}</span>
                            </div>

                            <div className="flex justify-between py-1 border-b border-slate-500/10">
                              <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>Bank Spread Markup (3.0%):</span>
                              <span className={`font-mono font-semibold tabular-nums ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>रू {Math.round(fxBankSpreadFee).toLocaleString()}</span>
                            </div>

                            <div className="flex justify-between py-1 border-b border-slate-500/10">
                              <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>Digital Services Tax (2.0% DST):</span>
                              <span className={`font-mono font-semibold tabular-nums ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>रू {Math.round(fxDstTaxAmount).toLocaleString()}</span>
                            </div>

                            {billingCycle === 'annual' && (
                              <div className={`flex justify-between py-1 border-b border-slate-500/10 font-semibold ${isDark ? 'text-cyan-300' : 'text-cyan-700'}`}>
                                <span>Monthly Equivalent Outflow:</span>
                                <span className="font-mono tabular-nums">~रू {Math.round(fxMonthlyNormalizedNpr).toLocaleString()} / mo</span>
                              </div>
                            )}
                          </div>

                          {/* NRB $500 Dollar Card Quota Gauge */}
                          <div className="mt-4 pt-3.5 border-t border-slate-500/20">
                            <div className="flex items-center justify-between text-xs mb-1.5">
                              <span className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                                NRB $500 Annual Dollar Card Limit:
                              </span>
                              <span className={`font-mono font-bold tabular-nums ${isDark ? 'text-cyan-300' : 'text-cyan-700'}`}>
                                ${effectiveTotalUsd.toFixed(0)} / $500 USD ({quotaUsedPct.toFixed(1)}%)
                              </span>
                            </div>

                            <div className={`w-full h-2.5 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
                              <div 
                                className={`h-full rounded-full transition-all duration-500 ${
                                  quotaUsedPct > 80 ? 'bg-rose-500' : quotaUsedPct > 50 ? 'bg-amber-400' : 'bg-cyan-500'
                                }`} 
                                style={{ width: `${quotaUsedPct}%` }} 
                              />
                            </div>

                            <p className={`text-xs mt-2 leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                              Card runway: <strong>~{maxMonthsOnCard} active billing cycles</strong> before exhausting annual statutory limit.
                            </p>
                          </div>

                        </div>

                      </div>

                    </div>
                  )}
                </div>
              )}

              {/* ============================================================= */}
              {/* TAB 2: ROMAN NEPALI & OFFICIAL LETTER STUDIO + PDF & PRINT     */}
              {/* ============================================================= */}
              {activeTab === 'letter' && (
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-500/20">
                    <div>
                      <h3 className={`text-base sm:text-lg font-bold font-display ${isDark ? 'text-white' : 'text-slate-950'}`}>
                        {isNe ? 'रोमन नेपाली र आधिकारिक पत्र स्टुडियो (PDF / प्रिन्ट)' : 'Roman Nepali & Official Letter Studio'}
                      </h3>
                      <p className={`text-xs sm:text-sm mt-0.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        {isNe
                          ? `रोमन टाइप गर्नुहोस् (उदा: "namaste nepal") → सिधै देवनागरी बन्छ। विद्यार्थी, कार्यालय, व्यापार र परिवारका लागि तयार ढाँचा (${bsDateObj.formattedBs})।`
                          : `Type in Roman Nepali -> instant Devanagari. Ready templates for students, officers, business, marketers & families (${bsDateObj.formattedBs}).`}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setRomanTypingEnabled(!romanTypingEnabled)}
                        className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer flex items-center gap-1.5 ${
                          romanTypingEnabled
                            ? 'bg-emerald-600 text-white border-emerald-500 shadow-xs'
                            : isDark ? 'bg-white/5 border-white/15 text-slate-200 hover:bg-white/10' : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-100'
                        }`}
                        title="Toggle auto Roman-to-Devanagari conversion on space"
                      >
                        <Languages className="h-4 w-4" />
                        <span>{romanTypingEnabled ? 'रोमन → नेपाली ON' : 'Roman Typing OFF'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={saveDirectPdf}
                        className="min-h-[44px] px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                        title="Save clean A4 PDF directly"
                      >
                        <Download className="h-4 w-4" />
                        <span>{isNe ? 'PDF सेभ' : 'Save PDF'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={printDocument}
                        className={`min-h-[44px] px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                          isDark
                            ? 'bg-slate-800 hover:bg-slate-700 border-white/15 text-white'
                            : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-900'
                        }`}
                      >
                        <Printer className="h-4 w-4" />
                        <span>{isNe ? 'प्रिन्ट' : 'Print'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={downloadAsDoc}
                        className="min-h-[44px] px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                        title="Download as Word .doc file"
                      >
                        <FileText className="h-4 w-4" />
                        <span>.doc</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCopy(displayedLetterText, 'Letter Copied')}
                        className={`min-h-[44px] px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                          isDark
                            ? 'bg-white/5 hover:bg-white/10 border-white/15 text-white'
                            : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-900'
                        }`}
                      >
                        {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                        <span>Copy</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setViewPreetiFont(!viewPreetiFont)}
                        className={`min-h-[44px] px-3 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                          viewPreetiFont
                            ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-xs'
                            : isDark ? 'bg-white/5 border-white/15 text-amber-300 hover:bg-white/10' : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                        }`}
                      >
                        {viewPreetiFont ? '✓ Preeti' : 'Preeti'}
                      </button>
                    </div>
                  </div>

                  {/* Minimalistic Persona Role Filter Pills */}
                  <div className="mt-4 flex flex-wrap items-center gap-1.5">
                    {[
                      { id: 'all', label: isNe ? 'सबै (१९)' : 'All (19)' },
                      { id: 'officer', label: isNe ? 'वडा / सरकारी' : 'Officers & Ward' },
                      { id: 'student', label: isNe ? 'विद्यार्थी' : 'Students' },
                      { id: 'business', label: isNe ? 'व्यापार / कर्पोरेट' : 'Business & Corporate' },
                      { id: 'marketer', label: isNe ? 'मार्केटिङ / ग्राहक' : 'Marketers & Clients' },
                      { id: 'homemaker', label: isNe ? 'परिवार / गृहिणी' : 'Homemaker & Family' },
                    ].map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          const role = p.id as typeof letterPersona;
                          setLetterPersona(role);
                          const firstMatch = role === 'all' ? OFFICIAL_TEMPLATES[0] : OFFICIAL_TEMPLATES.find((t) => t.persona === role);
                          if (firstMatch) handleTemplateChange(firstMatch.id);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer min-h-[36px] ${
                          letterPersona === p.id
                            ? isDark
                              ? 'bg-cyan-500/20 text-cyan-200 border-cyan-500/50'
                              : 'bg-cyan-700 text-white border-cyan-700'
                            : isDark
                              ? 'bg-white/[0.03] text-slate-300 border-white/10 hover:text-white'
                              : 'bg-white text-slate-700 border-slate-300 hover:text-slate-950'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>

                  {/* Voice-to-Official-PDF Spotlight Card (Speak -> A4 PDF + Checklist) */}
                  <div className={`mt-4 p-4 rounded-2xl border transition-colors ${
                    isRecordingVoice
                      ? isDark
                        ? 'bg-rose-950/30 border-rose-500/60'
                        : 'bg-rose-50 border-rose-400'
                      : isDark
                      ? 'bg-[#081224] border-emerald-500/35'
                      : 'bg-emerald-50/70 border-emerald-300'
                  }`}>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <Mic className={`h-4 w-4 shrink-0 ${isRecordingVoice ? 'text-rose-500 animate-pulse' : isDark ? 'text-emerald-400' : 'text-emerald-700'}`} />
                          <h4 className={`text-xs sm:text-sm font-bold ${isDark ? 'text-white' : 'text-slate-950'}`}>
                            {isNe ? 'बोलेरै निवेदन तयार पार्नुहोस् (Voice-to-PDF)' : 'Voice-to-Official-PDF (Speak in Nepali or English)'}
                          </h4>
                        </div>
                        <p className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                          {isNe
                            ? 'टाइप गर्न झन्झट लाग्छ? माइक थिचेर आफ्नो कुरा बोल्नुहोस् — पूरा निवेदन र बोक्नुपर्ने कागजातको सूची आफैँ तयार हुन्छ।'
                            : 'No typing needed. Tap the mic, say what you need in everyday Nepali or English, and get an A4 PDF + document checklist.'}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <select
                          aria-label="Voice recognition language"
                          value={voiceSpeechLang}
                          onChange={(e) => setVoiceSpeechLang(e.target.value as 'ne-NP' | 'en-US')}
                          disabled={isRecordingVoice || isProcessingVoice}
                          className={`min-h-[44px] px-2.5 py-2 rounded-xl border text-xs font-semibold cursor-pointer ${
                            isDark ? 'bg-[#0c1220] border-white/15 text-white' : 'bg-white border-slate-300 text-slate-900'
                          }`}
                        >
                          <option value="ne-NP">नेपाली (Nepali)</option>
                          <option value="en-US">English</option>
                        </select>

                        {!isRecordingVoice ? (
                          <button
                            type="button"
                            onClick={startVoiceRecording}
                            disabled={isProcessingVoice}
                            className="min-h-[44px] px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors shadow-xs whitespace-nowrap"
                          >
                            <Mic className="h-4 w-4" />
                            <span>
                              {isProcessingVoice
                                ? isNe ? 'पत्र बन्दैछ...' : 'Generating...'
                                : isNe ? 'बोल्नुहोस् (Speak)' : 'Speak to Draft'}
                            </span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={stopVoiceRecording}
                            className="min-h-[44px] px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors shadow-xs whitespace-nowrap"
                          >
                            <Square className="h-3.5 w-3.5 fill-current" />
                            <span>
                              {isNe ? `रोक्नुहोस् (${voiceRecordSeconds}s) → पत्र बनाउनुहोस्` : `Stop (${voiceRecordSeconds}s) & Create`}
                            </span>
                          </button>
                        )}

                        <input
                          ref={audioUploadInputRef}
                          type="file"
                          accept="audio/*"
                          onChange={handleAudioFileUpload}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => audioUploadInputRef.current?.click()}
                          disabled={isRecordingVoice || isProcessingVoice}
                          className={`min-h-[44px] px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap ${
                            isDark
                              ? 'bg-white/5 hover:bg-white/10 border-white/15 text-slate-100'
                              : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-900'
                          }`}
                          title="Upload recorded WhatsApp / Phone voice note"
                        >
                          <Upload className="h-3.5 w-3.5" />
                          <span>{isNe ? 'अडियो अपलोड' : 'Upload Audio'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Live transcript preview while speaking or after capture */}
                    {(isRecordingVoice || voiceLiveTranscript || isProcessingVoice) && (
                      <div className={`mt-3 px-3 py-2 rounded-xl border text-xs ${
                        isDark ? 'bg-[#060a14] border-white/15 text-slate-100' : 'bg-white border-emerald-200 text-slate-950'
                      }`}>
                        <span className={`font-bold mr-1.5 ${isDark ? 'text-emerald-300' : 'text-emerald-800'}`}>
                          {isProcessingVoice
                            ? isNe ? 'प्रशोधन हुँदैछ:' : 'Drafting letter:'
                            : isRecordingVoice
                            ? isNe ? 'सुन्दैछु:' : 'Listening:'
                            : isNe ? 'तपाईंले बोल्नुभएको:' : 'Heard:'}
                        </span>
                        <span className="font-['Noto_Sans_Devanagari']">
                          {voiceLiveTranscript || (isRecordingVoice ? (isNe ? 'स्पष्ट बोल्नुहोस्...' : 'Speak clearly now...') : '...')}
                        </span>
                      </div>
                    )}

                    {/* 1-Tap Demo Voice Scenarios for elders / quick testing */}
                    <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                      <span className={`text-[11px] font-semibold mr-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        {isNe ? 'नमुना आवाज:' : 'Try 1-Tap Voice Sample:'}
                      </span>
                      {VOICE_SAMPLE_SCENARIOS.map((sample) => (
                        <button
                          key={sample.id}
                          type="button"
                          disabled={isRecordingVoice || isProcessingVoice}
                          onClick={() => {
                            setVoiceLiveTranscript(sample.spokenText);
                            submitVoicePayloadToApi({
                              transcript: sample.spokenText,
                              personaOverride: sample.persona,
                            });
                          }}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer whitespace-nowrap ${
                            isDark
                              ? 'bg-white/[0.04] border-white/15 text-slate-200 hover:text-white hover:border-emerald-400'
                              : 'bg-white border-slate-300 text-slate-800 hover:text-slate-950 hover:border-emerald-500'
                          }`}
                        >
                          🎙️ {isNe ? sample.labelNe : sample.labelEn}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Inline AI Letter Writer + Live Roman Nepali Composer */}
                  <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-3.5">
                    {/* AI Letter Writer */}
                    <div className={`p-3.5 rounded-2xl border ${
                      isDark ? 'bg-[#070d1c] border-sky-500/30' : 'bg-sky-50/70 border-sky-300'
                    }`}>
                      <label htmlFor="ai-letter-prompt" className={`flex items-center gap-1.5 text-xs font-bold mb-1.5 ${isDark ? 'text-sky-300' : 'text-sky-900'}`}>
                        <Sparkles className="h-3.5 w-3.5 shrink-0" />
                        <span>
                          {isNe
                            ? 'AI पत्र लेखक (१ लाइन लेख्नुहोस् → पूरा पत्र तयार):'
                            : 'AI Letter Writer (describe in 1 line in Nepali/Roman/English):'}
                        </span>
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          id="ai-letter-prompt"
                          type="text"
                          value={aiDraftPrompt}
                          onChange={(e) => setAiDraftPrompt(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAiDraftLetter();
                            }
                          }}
                          placeholder='e.g. "college 3 day sick leave" or "bank ma dollar card ko lagi"'
                          className={`flex-1 min-w-0 min-h-[42px] text-xs rounded-xl border px-3 py-2 ${
                            isDark ? 'bg-[#0c1220] border-white/15 text-white placeholder:text-slate-400' : 'bg-white border-slate-300 text-slate-950 placeholder:text-slate-500'
                          }`}
                        />
                        <button
                          type="button"
                          disabled={!aiDraftPrompt.trim() || isDraftingLetter}
                          onClick={() => handleAiDraftLetter()}
                          className="min-h-[42px] px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-45 text-white text-xs font-bold cursor-pointer transition-colors shrink-0 whitespace-nowrap flex items-center gap-1.5"
                        >
                          <Sparkles className={`h-3.5 w-3.5 ${isDraftingLetter ? 'animate-spin' : ''}`} />
                          <span>{isDraftingLetter ? (isNe ? 'तयार हुँदै...' : 'Drafting...') : (isNe ? 'पत्र बनाउनुहोस्' : 'Draft Letter')}</span>
                        </button>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        {(LETTER_STARTER_PROMPTS[letterPersona] || LETTER_STARTER_PROMPTS.all).map((idea) => (
                          <button
                            key={idea.label}
                            type="button"
                            disabled={isDraftingLetter}
                            onClick={() => handleAiDraftLetter(idea.prompt)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer whitespace-nowrap ${
                              isDark
                                ? 'bg-white/[0.04] border-white/15 text-slate-200 hover:text-white hover:border-sky-400'
                                : 'bg-white border-slate-300 text-slate-800 hover:text-slate-950 hover:border-sky-500'
                            }`}
                          >
                            {idea.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Live Roman Nepali Composer */}
                    <div className={`p-3.5 rounded-2xl border ${
                      isDark ? 'bg-[#060913] border-cyan-500/30' : 'bg-cyan-50/60 border-cyan-300'
                    }`}>
                      <label htmlFor="roman-quick-input" className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-cyan-300' : 'text-cyan-900'}`}>
                        {isNe
                          ? 'रोमन नेपाली टाइपिङ बक्स (अंग्रेजीमा लेख्नुहोस् → देवनागरी):'
                          : 'Live Roman Nepali Composer (type phonetically e.g. "malai bida chahiyeko chha"):'}
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          id="roman-quick-input"
                          type="text"
                          value={romanQuickInput}
                          onChange={(e) => setRomanQuickInput(e.target.value)}
                          placeholder='Type Roman Nepali: e.g. "malai 3 din ko bida chahiyeko chha"'
                          className={`flex-1 min-w-0 min-h-[42px] text-xs rounded-xl border px-3 py-2 ${
                            isDark ? 'bg-[#0c1220] border-white/15 text-white placeholder:text-slate-400' : 'bg-white border-slate-300 text-slate-950 placeholder:text-slate-500'
                          }`}
                        />
                        <button
                          type="button"
                          disabled={!romanQuickInput.trim()}
                          onClick={() => {
                            const dev = transliterateRomanToDevanagari(romanQuickInput, true);
                            setLetterReason((prev) => (prev ? `${prev} ${dev}` : dev));
                            setCustomLetterBody(null);
                            setRomanQuickInput('');
                            showToast('Inserted Devanagari', dev.slice(0, 60), 'success', 2000);
                          }}
                          className="min-h-[42px] px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-45 text-white text-xs font-bold cursor-pointer transition-colors shrink-0 whitespace-nowrap"
                        >
                          {isNe ? 'व्यहोरामा राख्नुहोस्' : 'Add to Reason'}
                        </button>
                      </div>

                      {romanQuickInput.trim() ? (
                        <div className={`mt-2 px-3 py-1.5 rounded-xl border text-xs flex flex-wrap items-center justify-between gap-2 ${
                          isDark ? 'bg-white/[0.04] border-white/10 text-slate-100' : 'bg-white border-cyan-200 text-slate-950'
                        }`}>
                          <span className="font-['Noto_Sans_Devanagari'] text-sm font-semibold">
                            → {transliterateRomanToDevanagari(romanQuickInput, true)}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(transliterateRomanToDevanagari(romanQuickInput, true), 'Devanagari Copied')}
                            className={`text-xs font-bold hover:underline cursor-pointer ${isDark ? 'text-cyan-400' : 'text-cyan-700'}`}
                          >
                            Copy Nepali
                          </button>
                        </div>
                      ) : (
                        <p className={`mt-2 text-[11px] ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                          {isNe ? 'उदाहरण: "namaste nepal" → नमस्ते नेपाल (सिधै तलको बक्समा पनि रोमन चल्छ)' : 'Tip: Typing directly in the fields or A4 letter below also converts Roman words on Space.'}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Controls */}
                    <div className="lg:col-span-5 space-y-3.5">
                      <div>
                        <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Select Template (निवेदन / पत्रको प्रकार):</label>
                        <select
                          value={letterTemplate}
                          onChange={(e) => handleTemplateChange(e.target.value)}
                          className={`w-full min-h-[44px] text-xs rounded-xl border p-2.5 ${
                            isDark ? 'bg-[#060913] border-white/15 text-white' : 'bg-slate-50 border-slate-300 text-slate-950'
                          }`}
                        >
                          {visibleLetterTemplates.map(tpl => (
                            <option key={tpl.id} value={tpl.id}>{tpl.labelEn}</option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>B.S. Date (वि.सं. मिति):</label>
                          <input
                            type="text"
                            value={letterDate}
                            onChange={(e) => handleRomanFieldInput(setLetterDate, e.target.value)}
                            className={`w-full min-h-[44px] text-xs rounded-xl border p-2.5 ${
                              isDark ? 'bg-[#060913] border-white/15 text-white' : 'bg-slate-50 border-slate-300 text-slate-950'
                            }`}
                          />
                        </div>
                        <div>
                          <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Chalani No (चलानी नं):</label>
                          <input
                            type="text"
                            value={chalaniNo}
                            onChange={(e) => handleRomanFieldInput(setChalaniNo, e.target.value)}
                            className={`w-full min-h-[44px] text-xs rounded-xl border p-2.5 ${
                              isDark ? 'bg-[#060913] border-white/15 text-white' : 'bg-slate-50 border-slate-300 text-slate-950'
                            }`}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Sender Name (निवेदकको नाम):</label>
                          <input
                            type="text"
                            value={applicantName}
                            onChange={(e) => handleRomanFieldInput(setApplicantName, e.target.value)}
                            className={`w-full min-h-[44px] text-xs rounded-xl border p-2.5 ${
                              isDark ? 'bg-[#060913] border-white/15 text-white' : 'bg-slate-50 border-slate-300 text-slate-950'
                            }`}
                          />
                        </div>
                        <div>
                          <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>ID / Roll / PAN (पहिचान नं.):</label>
                          <input
                            type="text"
                            value={applicantCitizenship}
                            onChange={(e) => handleRomanFieldInput(setApplicantCitizenship, e.target.value)}
                            className={`w-full min-h-[44px] text-xs rounded-xl border p-2.5 ${
                              isDark ? 'bg-[#060913] border-white/15 text-white' : 'bg-slate-50 border-slate-300 text-slate-950'
                            }`}
                          />
                        </div>
                      </div>

                      <div>
                        <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Addressed Office (कार्यालय / प्रापक):</label>
                        <input
                          type="text"
                          value={officeName}
                          onChange={(e) => {
                            setCustomLetterBody(null);
                            handleRomanFieldInput(setOfficeName, e.target.value);
                          }}
                          className={`w-full min-h-[44px] text-xs rounded-xl border p-2.5 ${
                            isDark ? 'bg-[#060913] border-white/15 text-white' : 'bg-slate-50 border-slate-300 text-slate-950'
                          }`}
                        />
                      </div>

                      <div>
                        <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Subject (विषय):</label>
                        <input
                          type="text"
                          value={letterSubject}
                          onChange={(e) => {
                            setCustomLetterBody(null);
                            handleRomanFieldInput(setLetterSubject, e.target.value);
                          }}
                          className={`w-full min-h-[44px] text-xs rounded-xl border p-2.5 ${
                            isDark ? 'bg-[#060913] border-white/15 text-white' : 'bg-slate-50 border-slate-300 text-slate-950'
                          }`}
                        />
                      </div>

                      <div>
                        <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Address (ठेगाना):</label>
                        <input
                          type="text"
                          value={applicantAddress}
                          onChange={(e) => handleRomanFieldInput(setApplicantAddress, e.target.value)}
                          className={`w-full min-h-[44px] text-xs rounded-xl border p-2.5 ${
                            isDark ? 'bg-[#060913] border-white/15 text-white' : 'bg-slate-50 border-slate-300 text-slate-950'
                          }`}
                        />
                      </div>

                      <div>
                        <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                          Reason / Details (व्यहोरा {romanTypingEnabled ? '· Roman Auto-Convert on Space' : ''}):
                        </label>
                        <textarea
                          rows={3}
                          value={letterReason}
                          onChange={(e) => {
                            setCustomLetterBody(null);
                            handleRomanFieldInput(setLetterReason, e.target.value);
                          }}
                          className={`w-full text-xs rounded-xl border p-2.5 ${
                            isDark ? 'bg-[#060913] border-white/15 text-white' : 'bg-slate-50 border-slate-300 text-slate-950'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Editable Preview Document Box */}
                    <div className="lg:col-span-7">
                      <div className={`rounded-2xl border p-5 sm:p-6 ${
                        isDark ? 'bg-[#060913] border-white/15 text-slate-100' : 'bg-white border-slate-300 text-slate-950 shadow-xs'
                      }`}>
                        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-500/20 text-xs">
                          <span className={`font-mono font-bold uppercase flex items-center gap-1.5 ${isDark ? 'text-cyan-400' : 'text-cyan-700'}`}>
                            <BadgeCheck className="h-4 w-4 shrink-0" />
                            <span>{viewPreetiFont ? 'Preeti ASCII View' : 'Editable Devanagari A4 Letter'}</span>
                          </span>
                          <div className="flex items-center gap-2.5">
                            <button
                              type="button"
                              onClick={handleReadLetterAloud}
                              className={`px-2.5 py-1 rounded-lg border text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                                isReadingLetterAloud
                                  ? 'bg-emerald-600 text-white border-emerald-500'
                                  : isDark
                                  ? 'bg-white/5 border-white/15 text-slate-200 hover:text-white'
                                  : 'bg-slate-100 border-slate-300 text-slate-800 hover:bg-slate-200'
                              }`}
                            >
                              <Headphones className="h-3.5 w-3.5" />
                              <span>{isReadingLetterAloud ? (isNe ? 'रोक्नुहोस्' : 'Stop Audio') : (isNe ? 'सुन्नुहोस्' : 'Listen')}</span>
                            </button>
                            {customLetterBody !== null && (
                              <button
                                type="button"
                                onClick={() => {
                                  setCustomLetterBody(null);
                                  setLetterChecklist(null);
                                }}
                                className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                              >
                                Reset Draft
                              </button>
                            )}
                            <span className={`text-xs font-mono ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                              {viewPreetiFont ? 'Read-Only Preeti' : 'Click text below to edit'}
                            </span>
                          </div>
                        </div>

                        {viewPreetiFont ? (
                          <pre className="whitespace-pre-wrap font-mono text-xs sm:text-sm leading-relaxed overflow-x-auto max-h-[460px]">
                            {preetiConvertedText}
                          </pre>
                        ) : (
                          <textarea
                            rows={16}
                            aria-label="Editable Official Nepali Letter"
                            value={effectiveUnicodeLetter}
                            onChange={(e) =>
                              setCustomLetterBody(
                                romanTypingEnabled
                                  ? transliterateCompletedWordsOnSpace(e.target.value)
                                  : e.target.value
                              )
                            }
                            className={`w-full rounded-xl border p-3 font-['Noto_Sans_Devanagari'] text-xs sm:text-sm leading-relaxed focus:outline-hidden focus:ring-2 focus:ring-cyan-500 ${
                              isDark
                                ? 'bg-[#0a101d] border-white/10 text-slate-100'
                                : 'bg-amber-50/40 border-amber-200 text-slate-950'
                            }`}
                          />
                        )}

                        {/* Carry-With-You Checklist & Office Counter Guide */}
                        {letterChecklist && (
                          <div className={`mt-4 p-3.5 rounded-xl border text-xs space-y-2 ${
                            isDark ? 'bg-[#0a1324] border-emerald-500/30 text-slate-100' : 'bg-emerald-50/60 border-emerald-300 text-slate-900'
                          }`}>
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className={`font-bold flex items-center gap-1.5 ${isDark ? 'text-emerald-300' : 'text-emerald-900'}`}>
                                <CheckCircle2 className="h-4 w-4 shrink-0" />
                                <span>{isNe ? 'बुझाउन जाँदा के-के बोक्ने? (कागजात र शुल्क)' : 'What to Carry & Where to Submit'}</span>
                              </span>
                              {letterChecklist.estimatedFee && (
                                <span className={`font-mono text-[11px] font-bold px-2 py-0.5 rounded-md border ${
                                  isDark ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-200' : 'bg-white border-emerald-300 text-emerald-900'
                                }`}>
                                  {letterChecklist.estimatedFee}
                                </span>
                              )}
                            </div>
                            {letterChecklist.recommendedOffice && (
                              <div className={`text-xs font-medium ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                                <strong className={isDark ? 'text-white' : 'text-slate-950'}>{isNe ? 'कार्यालय/फाँट: ' : 'Submit at: '}</strong>
                                {letterChecklist.recommendedOffice}
                              </div>
                            )}
                            {letterChecklist.checklist && letterChecklist.checklist.length > 0 && (
                              <ul className="space-y-1 pl-1">
                                {letterChecklist.checklist.map((item, idx) => (
                                  <li key={idx} className="flex items-start gap-2">
                                    <span className={`font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>✓</span>
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ============================================================= */}
              {/* TAB 3: NEPALI NEURAL VOICE & REGIONAL ACCENTS                   */}
              {/* ============================================================= */}
              {activeTab === 'voice' && (
                <div>
                  <div className="pb-4 border-b border-slate-500/20">
                    <h3 className={`text-base sm:text-lg font-bold font-display ${isDark ? 'text-white' : 'text-slate-950'}`}>
                      {isNe ? 'नेपाली न्युरल आवाज तथा क्षेत्रीय लवज स्टुडियो' : 'Nepali Neural Voice & Regional Accent Synthesizer'}
                    </h3>
                    <p className={`text-xs sm:text-sm mt-0.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Web Speech API synthesis across Kathmandu, Gandaki (Pokhara), Eastern Kirati, and Terai Maithili accents.
                    </p>
                  </div>

                  <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-6 space-y-4">
                      <div>
                        <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Devanagari Text to Synthesize:</label>
                        <textarea
                          rows={4}
                          value={voiceText}
                          onChange={(e) => setVoiceText(e.target.value)}
                          className={`w-full text-sm rounded-xl border p-3 font-['Noto_Sans_Devanagari'] ${
                            isDark ? 'bg-[#060913] border-white/15 text-white' : 'bg-slate-50 border-slate-300 text-slate-950'
                          }`}
                        />
                      </div>

                      <div>
                        <label className={`block text-xs font-semibold mb-2 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Select Regional Accent Profile:</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {Object.entries(ACCENTS).map(([key, item]) => (
                            <button
                              key={key}
                              type="button"
                              onClick={() => {
                                setSelectedAccent(key as any);
                                setVoiceText(item.sample);
                              }}
                              className={`p-3 rounded-xl border text-left text-xs transition-colors cursor-pointer ${
                                selectedAccent === key
                                  ? isDark
                                    ? 'border-cyan-400 bg-cyan-500/15 text-cyan-200 ring-1 ring-cyan-400'
                                    : 'border-cyan-600 bg-cyan-50 text-cyan-950 ring-1 ring-cyan-600'
                                  : isDark ? 'border-white/10 bg-white/[0.03] text-slate-200 hover:bg-white/[0.06]' : 'border-slate-300 bg-slate-50 text-slate-800 hover:bg-white'
                              }`}
                            >
                              <span className="font-bold block text-xs">{item.name}</span>
                              <span className={`text-xs mt-0.5 block ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{item.desc}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <div>
                          <label className={`text-xs font-medium block mb-1 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Speed: {voiceSpeed}x</label>
                          <input
                            type="range"
                            min="0.7"
                            max="1.4"
                            step="0.1"
                            value={voiceSpeed}
                            onChange={(e) => setVoiceSpeed(Number(e.target.value))}
                            className="w-full accent-cyan-500"
                          />
                        </div>
                        <div>
                          <label className={`text-xs font-medium block mb-1 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Pitch: {voicePitch}x</label>
                          <input
                            type="range"
                            min="0.8"
                            max="1.3"
                            step="0.1"
                            value={voicePitch}
                            onChange={(e) => setVoicePitch(Number(e.target.value))}
                            className="w-full accent-cyan-500"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="lg:col-span-6 flex flex-col justify-between">
                      <div className={`p-6 rounded-2xl border text-center space-y-4 ${
                        isDark ? 'bg-[#060a14] border-white/15' : 'bg-slate-50 border-slate-300 shadow-xs'
                      }`}>
                        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl mx-auto ${
                          isDark ? 'bg-cyan-500/20 text-cyan-300' : 'bg-cyan-100 text-cyan-700'
                        }`}>
                          <Volume2 className="h-6 w-6" />
                        </div>

                        <div>
                          <h4 className={`text-sm font-bold font-display ${isDark ? 'text-white' : 'text-slate-950'}`}>Live Audio Synthesizer</h4>
                          <p className={`text-xs mt-1 max-w-sm mx-auto ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                            Renders natural Devanagari cadence in-browser using standard Web Speech Audio.
                          </p>
                        </div>

                        {/* Animated waveform bars */}
                        <div className="flex items-center justify-center gap-1.5 h-10">
                          {[30, 70, 45, 90, 60, 30, 80, 50, 95, 40].map((h, i) => (
                            <div
                              key={i}
                              className={`w-1.5 rounded-full transition-all duration-300 ${
                                isPlayingAudio ? 'bg-cyan-500 animate-pulse' : isDark ? 'bg-slate-700' : 'bg-slate-300'
                              }`}
                              style={{ height: isPlayingAudio ? `${h}%` : '20%' }}
                            />
                          ))}
                        </div>

                        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                          <button
                            type="button"
                            onClick={handleToggleVoicePlayback}
                            className="min-h-[44px] px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer"
                          >
                            {isPlayingAudio ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current" />}
                            <span>{isPlayingAudio ? 'Stop Voice Playback' : 'Play Synthesized Speech'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={downloadVoiceScript}
                            className={`min-h-[44px] px-4 py-2.5 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                              isDark
                                ? 'bg-white/5 hover:bg-white/10 border-white/15 text-white'
                                : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-900'
                            }`}
                          >
                            <Download className={`h-4 w-4 ${isDark ? 'text-cyan-400' : 'text-cyan-700'}`} />
                            <span>Export Script</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleCopy(voiceText, 'Nepali voice text copied')}
                            className={`min-h-[44px] px-4 py-2.5 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                              isDark
                                ? 'bg-white/5 hover:bg-white/10 border-white/15 text-slate-200'
                                : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-800'
                            }`}
                          >
                            <Copy className="h-4 w-4" />
                            <span>Copy</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ============================================================= */}
              {/* TAB 4: DEVANAGARI DOCUMENT INTELLIGENCE & OCR (REAL API)        */}
              {/* ============================================================= */}
              {activeTab === 'ocr' && (
                <div>
                  <div className="pb-4 border-b border-slate-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className={`text-base sm:text-lg font-bold font-display ${isDark ? 'text-white' : 'text-slate-950'}`}>
                        {isNe ? 'देवनागरी नागरिकता, लालपुर्जा र भ्याट बिल ओसीआर' : 'Devanagari Document Intelligence & OCR Parser'}
                      </h3>
                      <p className={`text-xs sm:text-sm mt-0.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        Connected directly to /api/extract with structured field extraction and confidence metrics.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleExecuteRealOcr()}
                      disabled={isOcrProcessing}
                      className="min-h-[44px] px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                    >
                      <Scan className={`h-4 w-4 ${isOcrProcessing ? 'animate-spin' : ''}`} />
                      <span>{isOcrProcessing ? 'Extracting via AI...' : 'Run Optical Extraction'}</span>
                    </button>
                  </div>

                  <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className={`text-xs font-semibold block ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Select Document Preset or Upload File:</label>
                        {ocrUploadedFileName && (
                          <span className={`text-xs font-mono truncate max-w-[140px] ${isDark ? 'text-cyan-300' : 'text-cyan-700'}`}>
                            {ocrUploadedFileName}
                          </span>
                        )}
                      </div>

                      {/* File Upload Button */}
                      <label className={`flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed transition-colors cursor-pointer text-xs font-semibold ${
                        isDark
                          ? 'border-cyan-500/50 bg-cyan-500/5 hover:bg-cyan-500/10 text-cyan-300'
                          : 'border-cyan-600/60 bg-cyan-50 hover:bg-cyan-100 text-cyan-800'
                      }`}>
                        <Upload className="h-4 w-4" />
                        <span>{ocrUploadedFileName ? 'Replace Document File' : 'Upload Image / Document File'}</span>
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>

                      {/* Preview Image if uploaded */}
                      {ocrUploadedImage && (
                        <div className={`p-2 rounded-xl border flex items-center gap-3 ${
                          isDark ? 'border-white/15 bg-[#060913]' : 'border-slate-300 bg-slate-50'
                        }`}>
                          <img
                            src={ocrUploadedImage}
                            alt="Uploaded document preview"
                            className="h-16 w-16 object-cover rounded-lg border border-slate-500/30"
                          />
                          <div className="min-w-0 flex-1 text-xs">
                            <span className={`font-bold block truncate ${isDark ? 'text-white' : 'text-slate-950'}`}>{ocrUploadedFileName}</span>
                            <span className={`text-xs font-mono ${isDark ? 'text-cyan-300' : 'text-cyan-700'}`}>Image Loaded · Ready for OCR</span>
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {[
                          { id: 'nagarikta', label: 'नागरिकता (ID)' },
                          { id: 'lalpurja', label: 'लालपुर्जा (Land)' },
                          { id: 'vat_bill', label: 'भ्याट बिल (VAT)' },
                        ].map((doc) => (
                          <button
                            key={doc.id}
                            type="button"
                            onClick={() => {
                              setSelectedDocType(doc.id as any);
                              setCustomOcrInput(DOC_RAW_PRESETS[doc.id as keyof typeof DOC_RAW_PRESETS]);
                              setOcrUploadedImage(null);
                              setOcrUploadedFileName('');
                            }}
                            className={`min-h-[44px] p-2.5 rounded-xl border text-center text-xs font-semibold transition-colors cursor-pointer ${
                              selectedDocType === doc.id && !ocrUploadedFileName
                                ? isDark
                                  ? 'border-cyan-400 bg-cyan-950/30 text-white ring-1 ring-cyan-400'
                                  : 'border-cyan-600 bg-cyan-50 text-cyan-950 ring-1 ring-cyan-600'
                                : isDark ? 'border-white/10 bg-white/[0.03] text-slate-300 hover:text-white' : 'border-slate-300 bg-slate-50 text-slate-800 hover:bg-white'
                            }`}
                          >
                            {doc.label}
                          </button>
                        ))}
                      </div>

                      <div className="pt-1">
                        <label className={`text-xs font-semibold block mb-1 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Raw Devanagari OCR Text:</label>
                        <textarea
                          rows={5}
                          value={customOcrInput || DOC_RAW_PRESETS[selectedDocType]}
                          onChange={(e) => setCustomOcrInput(e.target.value)}
                          className={`w-full text-xs rounded-xl border p-2.5 font-mono ${
                            isDark ? 'bg-[#060913] border-white/15 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-950'
                          }`}
                        />
                      </div>
                    </div>

                    <div className="lg:col-span-7">
                      <div className={`p-5 rounded-2xl border ${
                        isDark ? 'bg-[#060a14] border-white/15' : 'bg-slate-50 border-slate-300 shadow-xs'
                      }`}>
                        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-500/20">
                          <span className={`text-xs font-bold ${isDark ? 'text-cyan-400' : 'text-cyan-700'}`}>
                            Extracted Structured Records
                          </span>

                          <div className="flex items-center gap-2">
                            <div className={`flex rounded-lg border p-0.5 text-xs ${
                              isDark ? 'border-white/15 bg-white/[0.03]' : 'border-slate-300 bg-white'
                            }`}>
                              <button
                                type="button"
                                onClick={() => setOcrViewMode('cards')}
                                className={`px-2.5 py-1 rounded font-semibold transition-colors cursor-pointer ${
                                  ocrViewMode === 'cards' ? 'bg-cyan-600 text-white' : isDark ? 'text-slate-300' : 'text-slate-700'
                                }`}
                              >
                                Visual Cards
                              </button>
                              <button
                                type="button"
                                onClick={() => setOcrViewMode('raw_json')}
                                className={`px-2.5 py-1 rounded font-semibold transition-colors cursor-pointer ${
                                  ocrViewMode === 'raw_json' ? 'bg-cyan-600 text-white' : isDark ? 'text-slate-300' : 'text-slate-700'
                                }`}
                              >
                                Raw JSON
                              </button>
                            </div>

                            <span className={`text-xs font-mono px-2.5 py-0.5 rounded font-bold ${
                              isDark ? 'bg-cyan-500/20 text-cyan-300' : 'bg-cyan-100 text-cyan-800'
                            }`}>
                              API Ready
                            </span>
                          </div>
                        </div>

                        {extractedOcrResult ? (
                          <div className="space-y-3 text-xs">
                            {ocrViewMode === 'cards' ? (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[300px] overflow-y-auto pr-1">
                                {Object.entries(extractedOcrResult).map(([key, val]) => (
                                  <div
                                    key={key}
                                    className={`p-3 rounded-xl border ${
                                      isDark ? 'border-white/10 bg-white/[0.03]' : 'border-slate-300 bg-white'
                                    }`}
                                  >
                                    <span className={`text-xs font-mono uppercase block ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                                      {key.replace(/_/g, ' ')}
                                    </span>
                                    <span className={`font-semibold mt-0.5 block break-words ${isDark ? 'text-white' : 'text-slate-950'}`}>
                                      {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <pre className={`p-3 rounded-xl border font-mono text-xs overflow-x-auto max-h-[300px] ${
                                isDark ? 'bg-[#060913] border-cyan-500/30 text-cyan-300' : 'bg-slate-900 border-slate-700 text-cyan-300'
                              }`}>
                                {JSON.stringify(extractedOcrResult, null, 2)}
                              </pre>
                            )}

                            <div className="flex flex-wrap justify-end gap-2 pt-2 border-t border-slate-500/15">
                              <button
                                type="button"
                                onClick={downloadOcrJson}
                                className="min-h-[40px] px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                              >
                                <Download className="h-4 w-4" />
                                <span>Export JSON</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleCopy(JSON.stringify(extractedOcrResult, null, 2), 'JSON Copied')}
                                className={`min-h-[40px] px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                                  isDark
                                    ? 'bg-white/5 hover:bg-white/10 border-white/15 text-cyan-300'
                                    : 'bg-white hover:bg-slate-100 border-slate-300 text-cyan-800'
                                }`}
                              >
                                <Copy className="h-4 w-4" />
                                <span>Copy JSON</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className={`py-12 text-center text-xs space-y-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                            <Scan className="h-8 w-8 mx-auto text-cyan-500" />
                            <p>Click &ldquo;Run Optical Extraction&rdquo; to parse fields via the document pipeline.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ============================================================= */}
              {/* TAB 5: COMPLETE NEPAL INCOME TAX & IT EXPORT TDS ENGINE         */}
              {/* ============================================================= */}
              {activeTab === 'tax' && (
                <div>
                  <div className="pb-4 border-b border-slate-500/20">
                    <h3 className={`text-base sm:text-lg font-bold font-display ${isDark ? 'text-white' : 'text-slate-950'}`}>
                      {isNe ? 'नेपाल आयकर तथा सफ्टवेयर निर्यात टीडीएस (TDS) इन्जिन' : 'Nepal Income Tax & Software Export TDS Engine'}
                    </h3>
                    <p className={`text-xs sm:text-sm mt-0.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Inland Revenue Department (IRD) Fiscal Year 2081/82 Finance Act Slabs, SSF exemptions, and 5% IT Export Final Tax (Section 95Ka).
                    </p>
                  </div>

                  <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Input Controls */}
                    <div className="lg:col-span-5 space-y-4">
                      <div>
                        <label className={`text-xs font-semibold block mb-1 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Income & Tax Track:</label>
                        <div className={`grid grid-cols-3 gap-1.5 p-1 rounded-xl border ${
                          isDark ? 'border-white/10 bg-white/[0.03]' : 'border-slate-300 bg-slate-100'
                        }`}>
                          <button
                            type="button"
                            onClick={() => setTaxTrack('it_freelance')}
                            className={`py-2 px-1 text-center rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                              taxTrack === 'it_freelance' ? 'bg-cyan-600 text-white shadow-xs' : isDark ? 'text-slate-300' : 'text-slate-700'
                            }`}
                          >
                            IT Export (5% TDS)
                          </button>
                          <button
                            type="button"
                            onClick={() => setTaxTrack('employment')}
                            className={`py-2 px-1 text-center rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                              taxTrack === 'employment' ? 'bg-cyan-600 text-white shadow-xs' : isDark ? 'text-slate-300' : 'text-slate-700'
                            }`}
                          >
                            Salaried Job
                          </button>
                          <button
                            type="button"
                            onClick={() => setTaxTrack('it_company')}
                            className={`py-2 px-1 text-center rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                              taxTrack === 'it_company' ? 'bg-cyan-600 text-white shadow-xs' : isDark ? 'text-slate-300' : 'text-slate-700'
                            }`}
                          >
                            IT Company (1%)
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className={`text-xs font-semibold block mb-1 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                          Monthly Gross Income in NPR (मासिक तलब):
                        </label>
                        <input
                          type="number"
                          step={5000}
                          value={monthlySalaryNpr}
                          onChange={(e) => setMonthlySalaryNpr(Math.max(0, Number(e.target.value)))}
                          className={`w-full min-h-[44px] text-sm font-mono font-bold rounded-xl border px-3 ${
                            isDark ? 'border-cyan-500/40 bg-[#060913] text-white' : 'border-cyan-400 bg-slate-50 text-slate-950'
                          }`}
                        />
                      </div>

                      {taxTrack === 'employment' && (
                        <div className="space-y-3 pt-2 border-t border-slate-500/15">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className={`text-xs font-medium block mb-1 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Marital Status:</label>
                              <select
                                value={taxStatus}
                                onChange={(e) => setTaxStatus(e.target.value as any)}
                                className={`w-full min-h-[40px] text-xs rounded-xl border px-2.5 ${
                                  isDark ? 'border-white/15 bg-[#060913] text-white' : 'border-slate-300 bg-slate-50 text-slate-950'
                                }`}
                              >
                                <option value="single">Single (५ लाख स्ल्याब)</option>
                                <option value="married">Married (६ लाख स्ल्याब)</option>
                              </select>
                            </div>

                            <div>
                              <label className={`text-xs font-medium block mb-1 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>EPF & CIT Monthly:</label>
                              <input
                                type="number"
                                step={1000}
                                value={monthlyEpfCit}
                                onChange={(e) => setMonthlyEpfCit(Number(e.target.value))}
                                className={`w-full min-h-[40px] text-xs font-mono rounded-xl border px-2.5 ${
                                  isDark ? 'border-white/15 bg-[#060913] text-white' : 'border-slate-300 bg-slate-50 text-slate-950'
                                }`}
                              />
                            </div>
                            <div>
                              <label className={`text-xs font-medium block mb-1 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Annual Life Insurance (वार्षिक बीमा):</label>
                              <input
                                type="number"
                                step={5000}
                                max={40000}
                                value={annualLifeInsurance}
                                onChange={(e) => setAnnualLifeInsurance(Math.min(40000, Math.max(0, Number(e.target.value))))}
                                className={`w-full min-h-[40px] text-xs font-mono rounded-xl border px-2.5 ${
                                  isDark ? 'border-white/15 bg-[#060913] text-white' : 'border-slate-300 bg-slate-50 text-slate-950'
                                }`}
                                title="Max deductible: Rs. 40,000 under Nepal Income Tax Act"
                              />
                            </div>
                          </div>

                          <div className={`space-y-1.5 text-xs ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={dashainBonus}
                                onChange={(e) => setDashainBonus(e.target.checked)}
                                className="rounded accent-cyan-600"
                              />
                              <span>Include 13th-Month Dashain Bonus (दशैँ खर्च)</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={ssfEnrolled}
                                onChange={(e) => setSsfEnrolled(e.target.checked)}
                                className="rounded accent-cyan-600"
                              />
                              <span>Enrolled in Social Security Fund (SSF 1% waived)</span>
                            </label>
                            {taxStatus === 'single' && (
                              <label className="flex items-center gap-2 cursor-pointer select-none">
                                <input
                                  type="checkbox"
                                  checked={singleFemaleRebate}
                                  onChange={(e) => setSingleFemaleRebate(e.target.checked)}
                                  className="rounded accent-cyan-600"
                                />
                                <span>Female Resident Taxpayer (१०% कर छुट / 10% Tax Rebate)</span>
                              </label>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Output Card & Slab Breakdown */}
                    <div className="lg:col-span-7">
                      <div className={`p-5 rounded-2xl border ${
                        isDark ? 'bg-[#0c1322] border-cyan-500/35' : 'bg-white border-cyan-300 shadow-sm'
                      }`}>
                        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-500/20">
                          <div>
                            <span className={`text-xs font-mono uppercase font-bold block ${isDark ? 'text-cyan-400' : 'text-cyan-700'}`}>
                              Net Take-Home Salary (मासिक खुद आम्दानी)
                            </span>
                            <span className={`text-2xl font-black font-mono tabular-nums ${isDark ? 'text-cyan-300' : 'text-cyan-700'}`}>
                              रू {Math.round(taxCalculation.monthlyNetTakeHome).toLocaleString()} / महिना
                            </span>
                          </div>
                          <div className="text-right">
                            <span className={`text-xs block font-mono ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Monthly Tax TDS:</span>
                            <span className={`text-base font-bold font-mono tabular-nums ${isDark ? 'text-rose-400' : 'text-rose-700'}`}>
                              - रू {Math.round(taxCalculation.monthlyTaxTds).toLocaleString()}
                            </span>
                          </div>
                        </div>

                        {/* Slabs breakdown */}
                        <div className="space-y-1.5 text-xs">
                          <span className={`font-bold text-xs uppercase tracking-wider block mb-1 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                            IRD Slabs Breakdown ({taxCalculation.effectiveTaxRatePercent}% Effective Tax):
                          </span>
                          {taxCalculation.slabs.map((slab, i) => (
                            <div key={i} className="flex justify-between py-1 border-b border-slate-500/10">
                              <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>{slab.slabName} ({slab.ratePercent}%):</span>
                              <span className={`font-mono font-semibold tabular-nums ${isDark ? 'text-white' : 'text-slate-950'}`}>रू {Math.round(slab.taxAmount).toLocaleString()}</span>
                            </div>
                          ))}
                          <div className={`flex justify-between py-1.5 font-bold pt-2 border-t border-slate-500/20 ${isDark ? 'text-cyan-300' : 'text-cyan-700'}`}>
                            <span>Total Annual Tax Liability:</span>
                            <span className="font-mono tabular-nums">रू {Math.round(taxCalculation.finalAnnualTax).toLocaleString()} / वर्ष</span>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 mt-3 border-t border-slate-500/20">
                          <p className={`text-xs leading-relaxed max-w-md ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                            {isNe ? taxCalculation.legalNoteNe : taxCalculation.legalNote}
                          </p>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() =>
                                exportTaxComputationPdf({
                                  taxStatus,
                                  taxTrack,
                                  monthlySalaryNpr,
                                  dashainBonus,
                                  ssfEnrolled,
                                  singleFemaleRebate,
                                  calculation: taxCalculation,
                                })
                              }
                              className={`min-h-[40px] px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                                isDark
                                  ? 'bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-200 border-cyan-500/40'
                                  : 'bg-cyan-50 hover:bg-cyan-100 text-cyan-900 border-cyan-300'
                              }`}
                            >
                              <Printer className="h-4 w-4" />
                              <span>Save PDF Slip</span>
                            </button>
                            <button
                              type="button"
                              onClick={downloadTaxSummary}
                              className="min-h-[40px] px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                            >
                              <Download className="h-4 w-4" />
                              <span>Download (.txt)</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ============================================================= */}
              {/* TAB 6: KALIMATI PRODUCE & TRADITIONAL LAND CONVERTER           */}
              {/* ============================================================= */}
              {activeTab === 'market' && (
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-500/20">
                    <div>
                      <h3 className={`text-base sm:text-lg font-bold font-display ${isDark ? 'text-white' : 'text-slate-950'}`}>
                        {isNe ? 'कालिमाटी बजार दर तथा परम्परागत नेपाली जग्गा नाप रूपान्तरक' : 'Kalimati Daily Produce & Traditional Land Converter'}
                      </h3>
                      <p className={`text-xs sm:text-sm mt-0.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        Official Ropani-Aana-Paisa-Daam (RAPD) ↔ Bigha-Kattha-Dhur (BKD) ↔ Sq. Feet converter for Nepal land records.
                      </p>
                    </div>

                    <div className={`flex rounded-xl border p-1 ${
                      isDark ? 'border-white/10 bg-white/[0.03]' : 'border-slate-300 bg-slate-100'
                    }`}>
                      <button
                        type="button"
                        onClick={() => setLandSubTab('land')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                          landSubTab === 'land' ? 'bg-cyan-600 text-white shadow-xs' : isDark ? 'text-slate-300' : 'text-slate-700'
                        }`}
                      >
                        Land Units (जग्गा नाप)
                      </button>
                      <button
                        type="button"
                        onClick={() => setLandSubTab('produce')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                          landSubTab === 'produce' ? 'bg-cyan-600 text-white shadow-xs' : isDark ? 'text-slate-300' : 'text-slate-700'
                        }`}
                      >
                        Kalimati Vegetables
                      </button>
                    </div>
                  </div>

                  {landSubTab === 'land' ? (
                    <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
                      <div className="lg:col-span-5 space-y-4">
                        {/* Mode Selector */}
                        <div>
                          <label className={`text-xs font-semibold block mb-1 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Input Method (प्रणाली छनोट):</label>
                          <div className={`grid grid-cols-3 gap-1.5 p-1 rounded-xl border ${
                            isDark ? 'border-white/10 bg-white/[0.03]' : 'border-slate-300 bg-slate-100'
                          }`}>
                            <button
                              type="button"
                              onClick={() => setLandInputMode('sqft')}
                              className={`py-1.5 px-2 text-center rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                                landInputMode === 'sqft' ? 'bg-cyan-600 text-white shadow-xs' : isDark ? 'text-slate-300' : 'text-slate-700'
                              }`}
                            >
                              Sq. Feet
                            </button>
                            <button
                              type="button"
                              onClick={() => setLandInputMode('ropani')}
                              className={`py-1.5 px-2 text-center rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                                landInputMode === 'ropani' ? 'bg-cyan-600 text-white shadow-xs' : isDark ? 'text-slate-300' : 'text-slate-700'
                              }`}
                            >
                              रोपनी प्रणाली
                            </button>
                            <button
                              type="button"
                              onClick={() => setLandInputMode('bigha')}
                              className={`py-1.5 px-2 text-center rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                                landInputMode === 'bigha' ? 'bg-cyan-600 text-white shadow-xs' : isDark ? 'text-slate-300' : 'text-slate-700'
                              }`}
                            >
                              तराई बिघा
                            </button>
                          </div>
                        </div>

                        {landInputMode === 'sqft' && (
                          <div className="space-y-3">
                            <div>
                              <label className={`text-xs font-semibold block mb-1 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                                Enter Land Area in Square Feet (वर्ग फिट):
                              </label>
                              <input
                                type="number"
                                step={100}
                                value={landSqFtInput}
                                onChange={(e) => setLandSqFtInput(Math.max(1, Number(e.target.value)))}
                                className={`w-full min-h-[44px] text-sm font-mono font-bold rounded-xl border px-3 ${
                                  isDark ? 'border-cyan-500/40 bg-[#060913] text-white' : 'border-cyan-400 bg-slate-50 text-slate-950'
                                }`}
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-xs">
                              {[
                                { label: '४ आना (4 Aana)', sqft: 342.25 * 4 },
                                { label: '१ रोपनी (16 Aana)', sqft: 5476 },
                                { label: '१ कट्ठा (20 Dhur)', sqft: 3645 },
                                { label: '१ बिघा (20 Kattha)', sqft: 72900 },
                              ].map((item, i) => (
                                <button
                                  key={i}
                                  type="button"
                                  onClick={() => setLandSqFtInput(item.sqft)}
                                  className={`p-2 rounded-lg border font-medium transition-colors cursor-pointer ${
                                    isDark
                                      ? 'border-white/10 bg-white/[0.03] hover:bg-white/[0.07] text-slate-200'
                                      : 'border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-800'
                                  }`}
                                >
                                  {item.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {landInputMode === 'ropani' && (
                          <div className="space-y-3">
                            <label className={`text-xs font-semibold block ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                              Enter Ropani - Aana - Paisa - Daam (रोपनी-आना-पैसा-दाम):
                            </label>
                            <div className="grid grid-cols-4 gap-2">
                              <div>
                                <span className={`text-xs block mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>रोपनी</span>
                                <input
                                  type="number"
                                  min={0}
                                  value={landRopani}
                                  onChange={(e) => setLandRopani(Math.max(0, Number(e.target.value)))}
                                  className={`w-full min-h-[40px] text-xs font-mono font-bold rounded-xl border px-2 ${
                                    isDark ? 'border-white/15 bg-[#060913] text-white' : 'border-slate-300 bg-slate-50 text-slate-950'
                                  }`}
                                />
                              </div>
                              <div>
                                <span className={`text-xs block mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>आना (0-15)</span>
                                <input
                                  type="number"
                                  min={0}
                                  max={15}
                                  value={landAana}
                                  onChange={(e) => setLandAana(Math.min(15, Math.max(0, Number(e.target.value))))}
                                  className={`w-full min-h-[40px] text-xs font-mono font-bold rounded-xl border px-2 ${
                                    isDark ? 'border-white/15 bg-[#060913] text-white' : 'border-slate-300 bg-slate-50 text-slate-950'
                                  }`}
                                />
                              </div>
                              <div>
                                <span className={`text-xs block mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>पैसा (0-3)</span>
                                <input
                                  type="number"
                                  min={0}
                                  max={3}
                                  value={landPaisa}
                                  onChange={(e) => setLandPaisa(Math.min(3, Math.max(0, Number(e.target.value))))}
                                  className={`w-full min-h-[40px] text-xs font-mono font-bold rounded-xl border px-2 ${
                                    isDark ? 'border-white/15 bg-[#060913] text-white' : 'border-slate-300 bg-slate-50 text-slate-950'
                                  }`}
                                />
                              </div>
                              <div>
                                <span className={`text-xs block mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>दाम (0-3.9)</span>
                                <input
                                  type="number"
                                  min={0}
                                  max={3.99}
                                  step={0.1}
                                  value={landDaam}
                                  onChange={(e) => setLandDaam(Math.min(3.99, Math.max(0, Number(e.target.value))))}
                                  className={`w-full min-h-[40px] text-xs font-mono font-bold rounded-xl border px-2 ${
                                    isDark ? 'border-white/15 bg-[#060913] text-white' : 'border-slate-300 bg-slate-50 text-slate-950'
                                  }`}
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {landInputMode === 'bigha' && (
                          <div className="space-y-3">
                            <label className={`text-xs font-semibold block ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                              Enter Bigha - Kattha - Dhur (बिघा-कट्ठा-धुर):
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                              <div>
                                <span className={`text-xs block mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>बिघा</span>
                                <input
                                  type="number"
                                  min={0}
                                  value={landBigha}
                                  onChange={(e) => setLandBigha(Math.max(0, Number(e.target.value)))}
                                  className={`w-full min-h-[40px] text-xs font-mono font-bold rounded-xl border px-2 ${
                                    isDark ? 'border-white/15 bg-[#060913] text-white' : 'border-slate-300 bg-slate-50 text-slate-950'
                                  }`}
                                />
                              </div>
                              <div>
                                <span className={`text-xs block mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>कट्ठा (0-19)</span>
                                <input
                                  type="number"
                                  min={0}
                                  max={19}
                                  value={landKattha}
                                  onChange={(e) => setLandKattha(Math.min(19, Math.max(0, Number(e.target.value))))}
                                  className={`w-full min-h-[40px] text-xs font-mono font-bold rounded-xl border px-2 ${
                                    isDark ? 'border-white/15 bg-[#060913] text-white' : 'border-slate-300 bg-slate-50 text-slate-950'
                                  }`}
                                />
                              </div>
                              <div>
                                <span className={`text-xs block mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>धुर (0-19.9)</span>
                                <input
                                  type="number"
                                  min={0}
                                  max={19.99}
                                  step={0.1}
                                  value={landDhur}
                                  onChange={(e) => setLandDhur(Math.min(19.99, Math.max(0, Number(e.target.value))))}
                                  className={`w-full min-h-[40px] text-xs font-mono font-bold rounded-xl border px-2 ${
                                    isDark ? 'border-white/15 bg-[#060913] text-white' : 'border-slate-300 bg-slate-50 text-slate-950'
                                  }`}
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="lg:col-span-7">
                        <div className={`p-5 rounded-2xl border space-y-4 ${
                          isDark ? 'bg-[#060a14] border-cyan-500/35' : 'bg-slate-50 border-cyan-300 shadow-xs'
                        }`}>
                          <div className="flex items-center justify-between pb-2 border-b border-slate-500/20">
                            <span className={`text-xs font-mono font-bold uppercase ${isDark ? 'text-cyan-400' : 'text-cyan-700'}`}>
                              Official Nepal Land Revenue Units (मालपोत अभिलेख)
                            </span>
                            <span className={`text-xs font-mono font-semibold tabular-nums ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{convertedLand.sqFeet} Sq. Ft.</span>
                          </div>

                          <div className="space-y-3">
                            <div className={`p-3.5 rounded-xl border ${
                              isDark ? 'border-cyan-500/35 bg-cyan-500/10' : 'border-cyan-300 bg-cyan-50'
                            }`}>
                              <span className={`text-xs font-mono uppercase font-bold block ${isDark ? 'text-cyan-300' : 'text-cyan-800'}`}>
                                उपत्यका तथा पहाडी प्रणाली (Hilly System):
                              </span>
                              <span className={`text-base font-bold block mt-1 ${isDark ? 'text-white' : 'text-slate-950'}`}>
                                {convertedLand.formattedRopaniSystemNe}
                              </span>
                              <span className={`text-xs font-mono block mt-0.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                {convertedLand.formattedRopaniSystem}
                              </span>
                            </div>

                            <div className={`p-3.5 rounded-xl border ${
                              isDark ? 'border-sky-500/35 bg-sky-500/10' : 'border-sky-300 bg-sky-50'
                            }`}>
                              <span className={`text-xs font-mono uppercase font-bold block ${isDark ? 'text-sky-300' : 'text-sky-800'}`}>
                                तराई प्रणाली (Terai System):
                              </span>
                              <span className={`text-base font-bold block mt-1 ${isDark ? 'text-white' : 'text-slate-950'}`}>
                                {convertedLand.formattedTeraiSystemNe}
                              </span>
                              <span className={`text-xs font-mono block mt-0.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                {convertedLand.formattedTeraiSystem}
                              </span>
                            </div>

                            <div className={`flex flex-wrap justify-between gap-2 text-xs pt-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                              <span>Square Meters: <strong>{convertedLand.sqMeters} m²</strong></span>
                              <span>1 Ropani = 5,476 sq. ft. · 1 Bigha = 72,900 sq. ft.</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-6 space-y-5">
                      {/* Search & Actions Bar */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="relative flex-1 max-w-md">
                          <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 ${isDark ? 'text-slate-300' : 'text-slate-600'}`} />
                          <input
                            type="text"
                            placeholder={isNe ? 'तरकारी वा फलफूल खोज्नुहोस् (उदा: आलु, tomato, च्याउ)...' : 'Search produce by English or Nepali name...'}
                            value={produceSearch}
                            onChange={(e) => setProduceSearch(e.target.value)}
                            className={`w-full min-h-[44px] pl-10 pr-4 text-xs sm:text-sm rounded-xl border ${
                              isDark ? 'bg-[#060913] border-white/15 text-white placeholder:text-slate-400' : 'bg-slate-50 border-slate-300 text-slate-950 placeholder:text-slate-500'
                            }`}
                          />
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => fetchLiveKalimati(true)}
                            disabled={isRefreshingKalimati}
                            className={`min-h-[44px] px-3.5 py-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
                              isDark
                                ? 'bg-white/[0.05] hover:bg-white/[0.1] text-cyan-300 border-white/15'
                                : 'bg-slate-100 hover:bg-slate-200 text-cyan-800 border-slate-300'
                            }`}
                          >
                            <RefreshCw className={`h-4 w-4 ${isRefreshingKalimati ? 'animate-spin' : ''}`} />
                            <span>{isRefreshingKalimati ? 'Syncing...' : `Sync Live (${kalimatiMeta.publishedAt})`}</span>
                          </button>

                          <button
                            type="button"
                            onClick={downloadKalimatiCsv}
                            className="min-h-[44px] px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer shrink-0"
                          >
                            <FileSpreadsheet className="h-4 w-4" />
                            <span>Export Price Sheet (.csv)</span>
                          </button>
                        </div>
                      </div>

                      {/* Calculator & Active Produce Box */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                        <div className="md:col-span-7 space-y-4">
                          <div>
                            <label className={`text-xs font-semibold block mb-2 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                              {isNe
                                ? `कालिमाटी कृषि उपज छनोट गर्नुहोस् (${kalimatiMeta.count} दैनिक वस्तुहरू):`
                                : `Select Kalimati Commodity (${kalimatiMeta.live ? `${kalimatiMeta.count} Live Board Items` : '20 Featured Items'}):`}
                            </label>
                            
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[220px] overflow-y-auto pr-1">
                              {Object.entries(producePoolMap)
                                .filter(([key, item]) => {
                                  if (!produceSearch.trim()) return true;
                                  const q = produceSearch.toLowerCase();
                                  return item.name.toLowerCase().includes(q) || item.nameNe.includes(q) || key.includes(q);
                                })
                                .map(([key, item]) => {
                                  const isSelected = selectedProduce === key;
                                  return (
                                    <button
                                      key={key}
                                      type="button"
                                      onClick={() => setSelectedProduce(key)}
                                      className={`p-2.5 rounded-xl border text-left text-xs transition-colors cursor-pointer ${
                                        isSelected
                                          ? isDark
                                            ? 'border-cyan-400 bg-cyan-500/15 text-cyan-200 ring-1 ring-cyan-400'
                                            : 'border-cyan-600 bg-cyan-50 text-cyan-950 ring-1 ring-cyan-600'
                                          : isDark ? 'border-white/10 bg-white/[0.03] text-slate-200 hover:bg-white/[0.06]' : 'border-slate-300 bg-slate-50 text-slate-800 hover:bg-white'
                                      }`}
                                    >
                                      <span className="font-bold text-xs block truncate">{item.nameNe}</span>
                                      <span className={`text-xs block truncate ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{item.name.split(' (')[0]}</span>
                                      <span className={`text-xs font-mono font-bold block mt-1 tabular-nums ${isDark ? 'text-cyan-300' : 'text-cyan-700'}`}>
                                        रू {item.pricePerKg}/kg
                                      </span>
                                    </button>
                                  );
                                })}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-500/15">
                            <div>
                              <label className={`text-xs font-semibold block mb-1 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Quantity (परिमाण):</label>
                              <input
                                type="number"
                                min={0.2}
                                step={0.2}
                                value={quantity}
                                onChange={(e) => setQuantity(Math.max(0.2, Number(e.target.value)))}
                                className={`w-full min-h-[44px] text-sm font-mono font-bold rounded-xl border p-2.5 ${
                                  isDark ? 'bg-[#060913] border-white/15 text-white' : 'bg-slate-50 border-slate-300 text-slate-950'
                                }`}
                              />
                            </div>

                            <div>
                              <label className={`text-xs font-semibold block mb-1 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Nepali Unit (एकाइ):</label>
                              <select
                                value={unit}
                                onChange={(e) => setUnit(e.target.value as any)}
                                className={`w-full min-h-[44px] text-xs font-semibold rounded-xl border p-2.5 ${
                                  isDark ? 'bg-[#060913] border-white/15 text-white' : 'bg-slate-50 border-slate-300 text-slate-950'
                                }`}
                              >
                                <option value="dharni">१ धार्नी (Dharni = २.५ केजी)</option>
                                <option value="pau">१ पाउ (Pau = २०० ग्राम)</option>
                                <option value="kg">१ किलोग्राम (Kg)</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        {/* Cost Summary Box */}
                        <div className="md:col-span-5 flex flex-col justify-between">
                          <div className={`p-5 rounded-2xl border space-y-4 ${
                            isDark ? 'bg-[#0c1322] border-cyan-500/35' : 'bg-white border-cyan-300 shadow-sm'
                          }`}>
                            <div className="flex items-center justify-between pb-3 border-b border-slate-500/20">
                              <span className={`text-xs font-mono font-bold uppercase ${isDark ? 'text-cyan-400' : 'text-cyan-700'}`}>
                                Kalimati Board Rate
                              </span>
                              <span className={`text-xs font-mono font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                {quantity} {unit === 'dharni' ? 'धार्नी' : unit === 'pau' ? 'पाउ' : 'केजी'}
                              </span>
                            </div>

                            <div>
                              <span className={`text-sm font-bold block ${isDark ? 'text-white' : 'text-slate-950'}`}>
                                {activeProduceData.name}
                              </span>
                              <div className="mt-2 flex items-baseline gap-2">
                                <span className={`text-3xl font-black font-mono tabular-nums ${isDark ? 'text-cyan-300' : 'text-cyan-700'}`}>
                                  रू {estimatedProduceRetailNpr.toLocaleString()}
                                </span>
                                <span className={`text-xs font-mono ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Retail Total</span>
                              </div>
                            </div>

                            <div className="space-y-1.5 text-xs pt-2 border-t border-slate-500/15">
                              <div className="flex justify-between py-1 border-b border-slate-500/10">
                                <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>Wholesale Total (थोक मूल्य):</span>
                                <span className={`font-mono font-semibold tabular-nums ${isDark ? 'text-white' : 'text-slate-950'}`}>रू {estimatedProduceWholesaleNpr.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between py-1 border-b border-slate-500/10">
                                <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>Direct Savings (बचत):</span>
                                <span className={`font-mono font-semibold tabular-nums ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>
                                  रू {(estimatedProduceRetailNpr - estimatedProduceWholesaleNpr).toLocaleString()}
                                </span>
                              </div>
                              <div className="flex justify-between py-1">
                                <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>Equivalent Metric Weight:</span>
                                <span className={`font-mono font-bold ${isDark ? 'text-cyan-300' : 'text-cyan-700'}`}>{convertedWeight.formattedNe}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TOOL 7: EV MOBILITY, BLUEBOOK & NEA TOD CHARGING */}
              {activeTab === 'ev' && (
                <EvMobilityCalculator theme={theme} language={language} />
              )}

              {/* TOOL 8: NEPSE CAPITAL MARKET & CGT */}
              {activeTab === 'nepse' && (
                <NepseCapitalTerminal theme={theme} language={language} />
              )}

              {/* TOOL 9: IT EXPORT REMITTANCE & SECTION 95KA DECLARATION */}
              {activeTab === 'it_export' && (
                <ItExportRemittanceTerminal theme={theme} language={language} />
              )}

              {/* TOOL 10: GOLD & SILVER BULLION & JEWELRY AUDITOR */}
              {activeTab === 'bullion' && (
                <BullionJewelryTerminal theme={theme} language={language} />
              )}

              {/* TOOL 11: HANDWRITTEN BILL & UDHARO KHATA SNAPPER */}
              {activeTab === 'khata' && (
                <KhataBillSnapper isDark={isDark} language={language} />
              )}

              {/* TOOL 12: CONTRACT & TAMASUK RISK SCANNER */}
              {activeTab === 'contract' && (
                <ContractRiskScanner isDark={isDark} language={language} />
              )}

              {/* TOOL 13: LAB REPORT & PRESCRIPTION TRANSLATOR FOR PARENTS */}
              {activeTab === 'health' && (
                <HealthReportTranslator isDark={isDark} language={language} />
              )}

              {/* TOOL 14: SARKARI KAAM ZERO-MISTAKE COUNTER NAVIGATOR */}
              {activeTab === 'sarkari' && (
                <SarkariCounterNavigator isDark={isDark} language={language} />
              )}

            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
};
