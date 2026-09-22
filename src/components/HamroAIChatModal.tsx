import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  Copy, 
  Check, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  Globe2, 
  Layers, 
  Code2, 
  Languages, 
  ExternalLink,
  ChevronRight,
  Calculator,
  MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useToast } from '../context/ToastContext';
import { ThemeMode, Language } from '../types';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  languageMode?: 'romanized' | 'unicode' | 'english';
  timestamp: string;
  codeSnippet?: string;
  suggestedActions?: {
    label: string;
    actionType: 'consultation' | 'stack' | 'link';
    payload?: string;
  }[];
}

interface HamroAIChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme?: ThemeMode;
  language?: Language;
  onOpenConsultation?: (serviceTitle?: string) => void;
  onOpenStackCalculator?: () => void;
}

// Lightweight Romanized to Devanagari basic phonetic transliterator helper for real-time assist
function romanToDevanagari(text: string): string {
  const map: Record<string, string> = {
    'namaste': 'नमस्ते',
    'nepal': 'नेपाल',
    'nepali': 'नेपाली',
    'kasto': 'कस्तो',
    'chha': 'छ',
    'cha': 'छ',
    'dhanyabad': 'धन्यवाद',
    'tapai': 'तपाईं',
    'tapaiko': 'तपाईंको',
    'mero': 'मेरो',
    'hamro': 'हाम्रो',
    'ai': 'एआई',
    'bidesh': 'विदेश',
    'paisa': 'पैसा',
    'khalti': 'खल्ती',
    'esewa': 'ईसेवा',
    'fonepay': 'फोनपे',
    'bank': 'बैंक',
    'rastra': 'राष्ट्र',
    'kathmandu': 'काठमाडौं',
    'nagarikta': 'नागरिकता',
    'lagi': 'लागि',
    'garnu': 'गर्नु',
    'garne': 'गर्ने',
    'sathi': 'साथी',
    'subha': 'शुभ',
    'din': 'दिन',
    'bikas': 'विकास',
    'technology': 'प्रविधि',
  };

  let processed = text.toLowerCase();
  Object.keys(map).forEach((k) => {
    const regex = new RegExp(`\\b${k}\\b`, 'gi');
    processed = processed.replace(regex, map[k]);
  });
  return processed;
}

const KNOWLEDGE_RESPONSES = [
  {
    triggers: ['nrb', 'compliance', 'bank', 'guideline', 'regulatory', 'राष्ट्र बैंक', 'नियम', 'वित्तीय'],
    responseNe: `नेपाल राष्ट्र बैंक (NRB) को IT & AI सुरक्षा निर्देशिका अनुसार वित्तीय डाटाहरू नेपालभित्रै Sovereign अन-प्रेम वा एयर-ग्याप क्लस्टरमा राख्नु अनिवार्य छ।

नेपालएआई (NepalAI) ले उपलब्ध गराउने बैंकिङ RAG आर्किटेक्चर:
१. **डाटा सार्वभौमिकता (Data Residency)**: ग्राहकको PII (व्यक्तिगत विवरण) विदेश नपठाई काठमाडौं क्लस्टरमै इन्फरेन्स हुन्छ।
२. **डुअल अथेन्टिकेसन**: FonePay, eSewa र बैंक API सँग इन्टिग्रेटेड सुरक्षित टोकन प्रणाली।
३. **नेपाली भाषा मोडलिङ**: ९९.४% शुद्धताका साथ देवनागरी चेक, भौचर र नागरिकता OCR प्रमाणीकरण।`,
    responseEn: `Under Nepal Rastra Bank (NRB) guidelines, financial institutions must maintain sovereign data residency and auditability for automated AI systems.

NepalAI Sovereign Banking Architecture offers:
1. **Local Kathmandu Inference**: 42ms low latency with zero foreign data egress for sensitive KYC and core banking data.
2. **Deterministic RAG**: Grounded on NRB directives and internal bank standard operating procedures.
3. **Dual Currency Feasibility**: Consulting deployments start from NPR 4,50,000 ($3,400) with complete IP transfer.`,
    code: `# NRB Sovereign Air-Gapped Inference Sample
from nepalai import SovereignRAGPipeline, NRBGuardrail

pipeline = SovereignRAGPipeline(
    cluster="kathmandu-cluster-01",
    data_residency="NP_BAGMATI",
    guardrails=NRBGuardrail(enforce_pii_masking=True)
)
result = pipeline.query("KYC verification for Nagarikta 27-01-78-00123")`
  },
  {
    triggers: ['esewa', 'khalti', 'payment', 'dollar card', '५००', 'डलर', 'भुक्तानी', 'खल्ती', 'ईसेवा'],
    responseNe: `नेपाल राष्ट्र बैंकको वार्षिक $५०० डलर कार्ड सीमालाई बाईपास गर्न नेपालएआईले **Enterprise AI Token Gateway** प्रदान गर्दछ।

मुख्य सुविधाहरू:
• **स्थानीय भुक्तानी**: ईसेवा (eSewa), खल्ती (Khalti), र FonePay QR मार्फत सिधै नेपाली रुपैयाँ (NPR) मा बिलिङ।
• **टोकन प्रोक्सी**: OpenAI, Claude, र DeepSeek मोडलहरूको खर्चमा ६०-८०% सम्म बचत।
• **भ्याट बिलिङ**: नेपालका कम्पनीहरूका लागि आधिकारिक लेखा प्रणालीमा समावेश गर्न मिल्ने भ्याट बिल।`,
    responseEn: `To overcome the NRB $500 annual prepaid dollar card limitation, NepalAI provides a managed **AI Payment & Token Proxy Gateway**.

Key Advantages:
• **Native NPR Billing**: Settle enterprise API tokens via eSewa, Khalti, and corporate bank transfer.
• **Prompt Caching**: Save 60-80% on token fees across OpenAI, Anthropic Claude, and DeepSeek.
• **Tax-Compliant Invoicing**: Official VAT invoices compliant with Inland Revenue Department (IRD) Nepal.`,
    code: `// Connect to NepalAI Token Proxy Gateway with NPR billing
const openai = new OpenAI({
  apiKey: process.env.NEPALAI_GATEWAY_KEY,
  baseURL: "https://gateway.nepalai.tech/v1", // Billed via eSewa/Khalti in NPR
});`
  },
  {
    triggers: ['ocr', 'nagarikta', 'pan', 'document', 'नागरिकता', 'प्यान', 'कागजात'],
    responseNe: `हाम्रो **देवनागरी भिजन ओसीआर (Devanagari Vision OCR)** ले नेपाली हस्तलिखित तथा कम्प्युटर प्रिन्ट गरिएका कागजातहरू ९९.४% शुद्धताका साथ स्ट्रक्चर्ड JSON मा रूपान्तरण गर्दछ।

समर्थित कागजातहरू:
१. नेपाली नागरिकता प्रमाणपत्र (पुरानो हस्तलिखित र नयाँ डिजिटल)
२. राष्ट्रिय परिचयपत्र (National ID) र प्यान कार्ड (PAN)
३. जग्गाधनी प्रमाण पुर्जा (लालपुर्जा) र बैंक भौचरहरू।`,
    responseEn: `NepalAI's **Devanagari Vision OCR & Document Intelligence** pipeline extracts structured data from handwritten and printed Nepali documents with 99.4% benchmark accuracy.

Supported Document Types:
1. Nepali Citizenship (Nagarikta) – Both legacy handwritten & new computerized formats.
2. National Identity Card (NID) and Inland Revenue PAN Cards.
3. Land ownership certificates (Lalpurja) and bank deposit receipts.`,
    code: `// Devanagari OCR Extraction Endpoint
POST /api/v1/ocr/nepali-document
Payload: { "image_base64": "...", "doc_type": "nagarikta" }
Response: {
  "name_devanagari": "प्रकाश सुवेदी",
  "dob_bikram_sambat": "२०५४/०८/१२",
  "citizenship_no": "२७-०१-७५-०८४९२",
  "district": "काठमाडौं",
  "confidence": 0.994
}`
  }
];

export const HamroAIChatModal: React.FC<HamroAIChatModalProps> = ({
  isOpen,
  onClose,
  theme = 'dark',
  language = 'en',
  onOpenConsultation,
  onOpenStackCalculator,
}) => {
  const isDark = theme === 'dark';
  const { showToast } = useToast();

  const [inputMode, setInputMode] = useState<'romanized' | 'unicode' | 'english'>('romanized');
  const [inputText, setInputText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isAudioSpeaking, setIsAudioSpeaking] = useState<string | null>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-msg',
      sender: 'assistant',
      text: language === 'ne'
        ? `नमस्ते! म **हाम्रो एआई (Hamro AI)** हुँ — नेपालको सार्वभौम इन्टेलिजेन्स सहायक। तपाईं मलाई रोमन नेपाली (Romanized Nepali), शुद्ध देवनागरी वा अंग्रेजीमा प्रश्न सोध्न सक्नुहुन्छ।\n\nतपाईंलाई नेपाल राष्ट्र बैंकको एआई नियम, ईसेवा/खल्ती पेमेन्ट, देवनागरी OCR, वा इन्टरप्राइज कन्सल्टिङ बारे के जानकारी चाहिन्छ?`
        : `Namaste! I am **Hamro AI** — Nepal's sovereign vernacular intelligence assistant. You can converse with me in Romanized Nepali (e.g. "kasto cha"), pure Devanagari Unicode (e.g. "नमस्ते"), or English.\n\nHow can I assist your enterprise with NRB compliance, eSewa/Khalti AI payments, Devanagari OCR, or custom sovereign LLMs?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedActions: [
        { label: '🇳🇵 NRB IT Compliance', actionType: 'consultation', payload: 'Enterprise FinTech & NRB Compliance RAG' },
        { label: '💳 eSewa/Khalti AI Billing', actionType: 'consultation', payload: 'Nepal Payment Bridge & AI Infrastructure Proxy' },
        { label: '📊 Calculate AI ROI Stack', actionType: 'stack' }
      ]
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  if (!isOpen) return null;

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isGenerating) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      languageMode: inputMode,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsGenerating(true);

    // Analyze intent
    const lower = text.toLowerCase();
    const match = KNOWLEDGE_RESPONSES.find((k) =>
      k.triggers.some((t) => lower.includes(t))
    );

    setTimeout(() => {
      let replyText = '';
      let code = match?.code;

      if (match) {
        replyText = language === 'ne' || inputMode === 'unicode' || lower.includes('nepali') || lower.includes('namaste')
          ? match.responseNe
          : match.responseEn;
      } else {
        if (inputMode === 'romanized' || lower.includes('cha') || lower.includes('kasto') || lower.includes('garnu')) {
          replyText = `तपाईंको प्रश्न प्राप्त भयो। नेपालएआईको **काठमाडौं क्लस्टर ०१** ले रोमन नेपाली र देवनागरी दुवैलाई बुझेर इन्टरप्राइज-ग्रेड नतिजा दिन्छ।\n\n• **स्थानीय पूर्वाधार**: ४२ms लेटन्सी, शून्य विदेशी डाटा जोखिम।\n• **भुक्तानी सुविधा**: ईसेवा, खल्ती, र फोनपे मार्फत NPR मा सिधै बिलिङ।\n• **कन्सल्टिङ**: $७५० (रू ९५,०००) देखि सुरु हुने व्यावहारिक एआई रोडम्याप।`;
        } else if (language === 'ne' || inputMode === 'unicode') {
          replyText = `नमस्ते! नेपालएआई (NepalAI) को सार्वभौम क्लस्टरले नेपाली बजारका लागि इन्टरप्राइज एआई मोडलिङ, देवनागरी ओसीआर (OCR), र राष्ट्र बैंक अनुपालन सुनिश्चित गर्दछ। थप विस्तृत रणनीतिको लागि हामीसँग प्रत्यक्ष परामर्श बुक गर्न सक्नुहुन्छ।`;
        } else {
          replyText = `Thank you for your inquiry. NepalAI operates sovereign 42ms low-latency clusters tailored for Nepal's regulatory landscape, offering dual NPR/USD pricing, localized Devanagari RAG, and seamless eSewa/Khalti integration.`;
        }
      }

      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        codeSnippet: code,
        suggestedActions: [
          { label: 'Book Advisory Consultation', actionType: 'consultation', payload: 'Custom Nepali LLMs, RAG & Autonomous Agents' },
          { label: 'Launch Stack Calculator', actionType: 'stack' }
        ]
      };

      setMessages((prev) => [...prev, botMsg]);
      setIsGenerating(false);
    }, 700);
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast(language === 'ne' ? 'सन्देश प्रतिलिपि गरियो!' : 'Message copied to clipboard!', 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSpeakMessage = (id: string, text: string) => {
    if ('speechSynthesis' in window) {
      if (isAudioSpeaking === id) {
        window.speechSynthesis.cancel();
        setIsAudioSpeaking(null);
        return;
      }
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/[*#`]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 0.95;
      utterance.onend = () => setIsAudioSpeaking(null);
      utterance.onerror = () => setIsAudioSpeaking(null);
      window.speechSynthesis.speak(utterance);
      setIsAudioSpeaking(id);
    } else {
      showToast('Speech synthesis not supported in this browser.', 'info');
    }
  };

  const handleQuickPrompt = (promptText: string) => {
    handleSendMessage(promptText);
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'assistant',
        text: language === 'ne'
          ? 'कुराकानी रिसेट भयो। तपाईंलाई के विषयमा सहयोग चाहिन्छ?'
          : 'Chat session refreshed. What topic would you like to explore?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
    ]);
    showToast('Chat history refreshed', 'info');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-hidden">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-md"
        aria-hidden="true"
      />

      {/* Modal Container */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 15 }}
        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
        className={`relative flex flex-col w-full max-w-4xl h-[92vh] max-h-[850px] rounded-2xl sm:rounded-3xl border shadow-2xl overflow-hidden z-10 transition-colors ${
          isDark
            ? 'bg-[#080b12] border-white/10 text-white shadow-[0_25px_70px_rgba(0,0,0,0.9)]'
            : 'bg-white border-slate-200 text-slate-900 shadow-2xl'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Hamro AI Vernacular Chat Assistant"
      >
        {/* Header */}
        <div className={`flex items-center justify-between px-4 sm:px-6 py-3.5 border-b backdrop-blur-md ${
          isDark ? 'border-white/10 bg-white/[0.02]' : 'border-slate-200 bg-slate-50'
        }`}>
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 shadow-md">
              <Bot className="h-5 w-5" />
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 border-2 border-[#080b12]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold tracking-tight">
                  Hamro AI (हाम्रो एआई)
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-mono font-semibold rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                  Kathmandu 42ms
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Sovereign Vernacular LLM • Romanized & Devanagari Nepali • NRB Grounded
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Reset */}
            <button
              type="button"
              onClick={handleResetChat}
              className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                isDark
                  ? 'border-white/10 bg-white/[0.04] text-slate-400 hover:text-white hover:bg-white/[0.08]'
                  : 'border-slate-200 bg-white text-slate-600 hover:text-slate-900'
              }`}
              title="Reset Conversation"
              aria-label="Reset Conversation"
            >
              <RotateCcw className="h-4 w-4" />
            </button>

            {/* Close */}
            <button
              type="button"
              onClick={onClose}
              className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                isDark
                  ? 'border-white/10 bg-white/[0.04] text-slate-400 hover:text-white hover:bg-white/[0.08]'
                  : 'border-slate-200 bg-white text-slate-600 hover:text-slate-900'
              }`}
              aria-label="Close Hamro AI Chat"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Status / Script Bar */}
        <div className={`px-4 sm:px-6 py-2 border-b flex flex-wrap items-center justify-between gap-2 text-xs font-mono ${
          isDark ? 'border-white/[0.06] bg-black/30 text-slate-400' : 'border-slate-200 bg-slate-100/70 text-slate-600'
        }`}>
          <div className="flex items-center gap-2">
            <Languages className="h-3.5 w-3.5 text-emerald-400" />
            <span className="font-semibold text-slate-300">Input Mode:</span>
            <div className="inline-flex rounded-lg p-0.5 bg-black/40 border border-white/10">
              <button
                type="button"
                onClick={() => setInputMode('romanized')}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                  inputMode === 'romanized'
                    ? 'bg-emerald-500 text-slate-950 shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Roman Nepali
              </button>
              <button
                type="button"
                onClick={() => setInputMode('unicode')}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                  inputMode === 'unicode'
                    ? 'bg-emerald-500 text-slate-950 shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                देवनागरी (Unicode)
              </button>
              <button
                type="button"
                onClick={() => setInputMode('english')}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                  inputMode === 'english'
                    ? 'bg-emerald-500 text-slate-950 shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                English
              </button>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1 text-emerald-400">
              <ShieldCheck className="h-3 w-3" /> NRB Ready
            </span>
            <span className="flex items-center gap-1 text-amber-400">
              <Zap className="h-3 w-3" /> eSewa/Khalti Invoicing
            </span>
          </div>
        </div>

        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
          {messages.map((msg) => {
            const isBot = msg.sender === 'assistant';
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 max-w-[90%] sm:max-w-[85%] ${
                  isBot ? 'mr-auto' : 'ml-auto flex-row-reverse'
                }`}
              >
                {/* Avatar */}
                <div
                  className={`h-8 w-8 shrink-0 rounded-xl flex items-center justify-center font-bold text-xs ${
                    isBot
                      ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 shadow-md'
                      : 'bg-indigo-600 text-white'
                  }`}
                >
                  {isBot ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                </div>

                {/* Message Bubble */}
                <div className="space-y-2">
                  <div
                    className={`rounded-2xl p-4 sm:p-4.5 text-sm leading-relaxed ${
                      isBot
                        ? isDark
                          ? 'bg-white/[0.04] border border-white/10 text-slate-100 shadow-sm'
                          : 'bg-slate-100 border border-slate-200 text-slate-900'
                        : 'bg-emerald-600 text-white shadow-md'
                    }`}
                  >
                    <div className="whitespace-pre-wrap font-sans text-[13.5px] sm:text-sm">
                      {msg.text}
                    </div>

                    {/* Code Snippet if present */}
                    {msg.codeSnippet && (
                      <div className="mt-3 rounded-xl overflow-hidden border border-white/15 bg-[#04060a] text-xs font-mono">
                        <div className="flex items-center justify-between px-3 py-1.5 bg-white/5 border-b border-white/10 text-slate-400">
                          <span className="flex items-center gap-1.5">
                            <Code2 className="h-3 w-3 text-emerald-400" />
                            <span>Architecture Snippet</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyMessage(`${msg.id}-code`, msg.codeSnippet || '')}
                            className="hover:text-white transition-colors cursor-pointer"
                          >
                            {copiedId === `${msg.id}-code` ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                          </button>
                        </div>
                        <pre className="p-3 text-slate-200 overflow-x-auto text-[11px] leading-relaxed">
                          {msg.codeSnippet}
                        </pre>
                      </div>
                    )}
                  </div>

                  {/* Actions under bubble */}
                  {isBot && (
                    <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                      <button
                        type="button"
                        onClick={() => handleCopyMessage(msg.id, msg.text)}
                        className={`flex items-center gap-1 px-2 py-0.8 rounded-md text-[11px] border transition-colors cursor-pointer ${
                          isDark
                            ? 'border-white/10 text-slate-400 hover:text-white hover:bg-white/5'
                            : 'border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="h-3 w-3 text-emerald-400" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSpeakMessage(msg.id, msg.text)}
                        className={`flex items-center gap-1 px-2 py-0.8 rounded-md text-[11px] border transition-colors cursor-pointer ${
                          isAudioSpeaking === msg.id
                            ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400'
                            : isDark
                            ? 'border-white/10 text-slate-400 hover:text-white hover:bg-white/5'
                            : 'border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                      >
                        {isAudioSpeaking === msg.id ? (
                          <>
                            <VolumeX className="h-3 w-3 text-emerald-400" />
                            <span>Stop Voice</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="h-3 w-3" />
                            <span>Listen (Neural Voice)</span>
                          </>
                        )}
                      </button>

                      {msg.suggestedActions?.map((act, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            if (act.actionType === 'consultation' && onOpenConsultation) {
                              onOpenConsultation(act.payload);
                              onClose();
                            } else if (act.actionType === 'stack' && onOpenStackCalculator) {
                              onOpenStackCalculator();
                              onClose();
                            }
                          }}
                          className="flex items-center gap-1 px-2.5 py-0.8 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25 transition-all text-[11px] font-semibold cursor-pointer"
                        >
                          <Sparkles className="h-3 w-3" />
                          <span>{act.label}</span>
                          <ChevronRight className="h-3 w-3" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}

          {isGenerating && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 mr-auto"
            >
              <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center">
                <Bot className="h-4 w-4 animate-spin" />
              </div>
              <div className={`p-3.5 rounded-2xl border text-xs font-mono flex items-center gap-2 ${
                isDark ? 'border-white/10 bg-white/[0.03] text-emerald-400' : 'border-slate-200 bg-slate-100 text-emerald-700'
              }`}>
                <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Kathmandu Sovereign Cluster processing in {inputMode.toUpperCase()}...</span>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className={`px-4 sm:px-6 py-2.5 border-t overflow-x-auto no-scrollbar flex items-center gap-2 ${
          isDark ? 'border-white/10 bg-black/40' : 'border-slate-200 bg-slate-50'
        }`}>
          <span className="text-[11px] font-mono text-slate-400 shrink-0 flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-amber-400" /> Prompts:
          </span>
          <button
            type="button"
            onClick={() => handleQuickPrompt(inputMode === 'romanized' ? 'nepal ma kyc automation ra nagarikta ocr kasari garne?' : 'नेपालमा नागरिकता ओसीआर र केवाईसी प्रमाणीकरण कसरी गर्ने?')}
            className={`text-xs px-2.5 py-1 rounded-full border whitespace-nowrap transition-colors cursor-pointer ${
              isDark ? 'border-white/10 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10' : 'border-slate-200 bg-white text-slate-700 hover:text-slate-950'
            }`}
          >
            🇳🇵 {inputMode === 'romanized' ? 'Nagarikta KYC & OCR' : 'नागरिकता ओसीआर केवाईसी'}
          </button>
          <button
            type="button"
            onClick={() => handleQuickPrompt(inputMode === 'romanized' ? 'nrb compliance ma sovereign LLM deploy garna kati khracha lagcha?' : 'नेपाल राष्ट्र बैंकको नियम अनुसार वित्तीय एआई कति लागतमा बन्छ?')}
            className={`text-xs px-2.5 py-1 rounded-full border whitespace-nowrap transition-colors cursor-pointer ${
              isDark ? 'border-white/10 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10' : 'border-slate-200 bg-white text-slate-700 hover:text-slate-950'
            }`}
          >
            🏛️ {inputMode === 'romanized' ? 'NRB Banking AI Cost' : 'राष्ट्र बैंक एआई लागत'}
          </button>
          <button
            type="button"
            onClick={() => handleQuickPrompt(inputMode === 'romanized' ? 'dollar card bina esewa ra khalti bata enterprise AI token kasari line?' : 'ईसेवा र खल्तीबाट एआई टोकन भुक्तानी कसरी गर्ने?')}
            className={`text-xs px-2.5 py-1 rounded-full border whitespace-nowrap transition-colors cursor-pointer ${
              isDark ? 'border-white/10 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10' : 'border-slate-200 bg-white text-slate-700 hover:text-slate-950'
            }`}
          >
            💳 {inputMode === 'romanized' ? 'eSewa/Khalti AI Gateway' : 'ईसेवा/खल्ती भुक्तानी'}
          </button>
        </div>

        {/* Input Bar */}
        <div className={`p-3 sm:p-4 border-t ${
          isDark ? 'border-white/10 bg-[#06080e]' : 'border-slate-200 bg-white'
        }`}>
          {/* Live Transliteration Preview Bar if typing in Romanized */}
          {inputMode === 'romanized' && inputText.trim().length > 2 && (
            <div className="mb-2 px-3 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-xs font-mono flex items-center justify-between text-emerald-400">
              <div className="flex items-center gap-1.5 truncate">
                <span className="text-[10px] text-slate-400 uppercase">Devanagari Live Assist:</span>
                <span className="font-semibold text-white">{romanToDevanagari(inputText)}</span>
              </div>
              <button
                type="button"
                onClick={() => setInputText(romanToDevanagari(inputText))}
                className="shrink-0 text-[10px] px-2 py-0.5 rounded bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 cursor-pointer"
              >
                Apply Unicode
              </button>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-end gap-2"
          >
            <div className="relative flex-1">
              <textarea
                ref={inputRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                rows={2}
                placeholder={
                  inputMode === 'romanized'
                    ? 'Romanized Nepali ma type garnus (e.g. namaste, kasto cha, AI kasari deploy garne)...'
                    : inputMode === 'unicode'
                    ? 'शुद्ध देवनागरीमा लेख्नुहोस् (उदा: नमस्ते, नेपालमा एआई कन्सल्टिङ...)'
                    : 'Ask in English about sovereign AI, NRB compliance, pricing in NPR/USD...'
                }
                className={`w-full p-3 rounded-xl border text-sm resize-none focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition-colors ${
                  isDark
                    ? 'border-white/15 bg-white/[0.04] text-white placeholder:text-slate-500'
                    : 'border-slate-300 bg-slate-50 text-slate-900 placeholder:text-slate-400'
                }`}
              />
            </div>

            <button
              type="submit"
              disabled={!inputText.trim() || isGenerating}
              className={`p-3.5 rounded-xl font-semibold transition-all flex items-center justify-center cursor-pointer ${
                inputText.trim() && !isGenerating
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/25'
                  : 'bg-white/10 text-slate-500 cursor-not-allowed'
              }`}
              aria-label="Send message to Hamro AI"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>

          <div className="flex items-center justify-between mt-2 text-[10px] text-slate-500 font-mono">
            <span>Press Enter to send • Shift+Enter for new line</span>
            <span>NepalAI Cluster 01 • Sovereign Air-Gapped</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
