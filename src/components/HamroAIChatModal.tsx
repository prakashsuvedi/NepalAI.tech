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
import { transliterateRomanToDevanagari } from '../utils/nepaliTextConverter';

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

type AssistantPersona =
  | 'general'
  | 'student'
  | 'officer'
  | 'business'
  | 'corporate'
  | 'marketer'
  | 'homemaker';

interface PersonaConfig {
  id: AssistantPersona;
  labelEn: string;
  labelNe: string;
  prompts: Array<{
    chipEn: string;
    chipNe: string;
    promptRoman: string;
    promptUnicode: string;
    promptEn: string;
  }>;
  fallbackNe: string;
  fallbackEn: string;
}

const PERSONA_CONFIGS: PersonaConfig[] = [
  {
    id: 'general',
    labelEn: 'All',
    labelNe: 'सबै',
    prompts: [
      {
        chipEn: 'Draft Nepali Letter',
        chipNe: 'नेपाली निवेदन लेख',
        promptRoman: 'malai ward karyalaya ko lagi bida wa sifaris ko nibedan lekhidinu',
        promptUnicode: 'मलाई नेपाली निवेदनको सरल ढाँचा लेखिदिनुहोस्।',
        promptEn: 'Help me write a polite formal Nepali application letter.',
      },
      {
        chipEn: 'EV Tax vs Petrol',
        chipNe: 'ईभी कर र बचत',
        promptRoman: 'Nepal ma 100kW EV car ko road tax ra charging kharcha kati huncha?',
        promptUnicode: 'नेपालमा १०० किलोवाट ईभी गाडीको सडक कर र चार्जिङ खर्च कति हुन्छ?',
        promptEn: 'Explain Nepal EV road tax and monthly home charging savings vs petrol.',
      },
      {
        chipEn: 'IT Export 5% Tax',
        chipNe: 'आईटी निर्यात ५% कर',
        promptRoman: 'bidesh bata dollar aayema Section 95Ka 5% TDS ra bank letter kasari garne?',
        promptUnicode: 'विदेशबाट डलर आम्दानी हुँदा ५% टीडीएस र बैंक स्वघोषणा कसरी गर्ने?',
        promptEn: 'How does Nepal Section 95Ka 5% final TDS work for foreign freelance income?',
      },
    ],
    fallbackNe: `नमस्ते! म **हाम्रो एआई** हुँ — विद्यार्थी, सरकारी/वडा कर्मचारी, व्यापारी, कर्पोरेट, मार्केटर र गृहिणी सबैका लागि सरल सहायक।\n\nतपाईं रोमन नेपाली (जस्तै "kasto chha"), देवनागरी वा अंग्रेजीमा सिधै प्रश्न सोध्न सक्नुहुन्छ।`,
    fallbackEn: `Namaste! I am **Hamro AI** — a clean, everyday assistant for students, officers, business owners, corporate teams, marketers, and homemakers. Pick a role above or ask any question.`,
  },
  {
    id: 'student',
    labelEn: 'Student',
    labelNe: 'विद्यार्थी',
    prompts: [
      {
        chipEn: 'Daily Study Plan',
        chipNe: 'पढाइ तालिका',
        promptRoman: 'exam ko lagi din ko 4 ghanta ramro study routine banaidinu',
        promptUnicode: 'परीक्षा तयारीको लागि दैनिक ४ घण्टाको सरल अध्ययन तालिका बनाइदिनुहोस्।',
        promptEn: 'Create a practical 4-hour daily exam study routine with breaks and revision.',
      },
      {
        chipEn: 'Scholarship Essay',
        chipNe: 'छात्रवृत्ति निवेदन',
        promptRoman: 'college scholarship ko lagi ramro nibedan ra essay tip dinu',
        promptUnicode: 'कलेज छात्रवृत्ति निवेदन र निबन्ध लेख्ने सजिलो तरिका बताउनुहोस्।',
        promptEn: 'Give me a clear outline for a strong scholarship application letter.',
      },
      {
        chipEn: 'Learn Coding / AI',
        chipNe: 'कोडिङ सिक्न',
        promptRoman: 'beginner student le free AI ra coding kasari sikne Nepal ma?',
        promptUnicode: 'नेपालमा विद्यार्थीले नि:शुल्क कोडिङ र एआई कसरी सुरु गर्ने?',
        promptEn: 'How can a beginner student in Nepal start learning AI and coding for free?',
      },
    ],
    fallbackNe: `विद्यार्थी सहायक मोड:\n• **४५-१० नियम**: ४५ मिनेट ध्यान दिएर पढ्ने र १० मिनेट मुख्य बुँदा कण्ठ गर्ने।\n• **निवेदन र पत्र**: कलेज बिदा, चारित्रिक वा छात्रवृत्ति निवेदनका लागि "Daily Tools → Roman Letter Studio" बाट तुरुन्तै PDF बनाउनुहोस्।`,
    fallbackEn: `Student Assistant:\n• Study in 45-min focus blocks followed by a 10-min self-quiz.\n• Need a leave or scholarship application? Use our Letter Studio with Roman typing and click Save PDF directly.`,
  },
  {
    id: 'officer',
    labelEn: 'Officer',
    labelNe: 'कर्मचारी / वडा',
    prompts: [
      {
        chipEn: 'Office Tippani Draft',
        chipNe: 'टिप्पणी आदेश ढाँचा',
        promptRoman: 'karyalaya ma tippani aadesh lekhda ke ke kura rakhnu parcha?',
        promptUnicode: 'सरकारी कार्यालयमा टिप्पणी तथा आदेश लेख्दा मुख्य के बुँदा राख्नु पर्छ?',
        promptEn: 'Give me a clean 3-part structure for an official Nepali office Tippani memo.',
      },
      {
        chipEn: 'Citizen Notice',
        chipNe: 'सार्वजनिक सूचना',
        promptRoman: 'ward karyalaya bata sarbajanik suchana ko namuna banaidinu',
        promptUnicode: 'वडा कार्यालयबाट जारी गर्ने स्पष्ट सार्वजनिक सूचनाको नमुना लेखिदिनुहोस्।',
        promptEn: 'Draft a clear, polite public ward notice for document verification.',
      },
      {
        chipEn: 'Devanagari OCR Guide',
        chipNe: 'कागजात स्क्यान',
        promptRoman: 'purano nagarikta ra lalpurja bata text kasari nikalne?',
        promptUnicode: 'पुरानो नागरिकता र लालपुर्जाको फोटोबाट तुरुन्तै देवनागरी विवरण कसरी निकाल्ने?',
        promptEn: 'How can officers extract clean text from scanned Nagarikta & Lalpurja documents?',
      },
    ],
    fallbackNe: `सरकारी/कार्यालय सहायक:\n• **टिप्पणी लेखन**: १. पृष्ठभूमि, २. प्रचलित ऐन/नियमको आधार, ३. स्पष्ट प्रस्तावित निर्णय।\n• आधिकारिक वडा सिफारिस र रोमन-टु-प्रीति प्रिन्टको लागि Letter Studio प्रयोग गर्नुहोस्।`,
    fallbackEn: `Officer Desk Guide:\n• Structure every official memo (Tippani) into Background, Rule Citation, and Clear Action Proposal.\n• Use Letter Studio for print-ready A4 letters and Word (.doc) downloads.`,
  },
  {
    id: 'business',
    labelEn: 'Business',
    labelNe: 'व्यापार / उद्यम',
    prompts: [
      {
        chipEn: 'Pricing & Margin',
        chipNe: 'नाफा र मूल्य हिसाब',
        promptRoman: 'saman bechda 13% VAT ra delivery jodera sahi margin kasari rakhne?',
        promptUnicode: 'सामान बेच्दा १३% भ्याट र डेलिभरी खर्च जोडेर सही नाफा कसरी हिसाब गर्ने?',
        promptEn: 'How should a Nepal retail business price products after 13% VAT and delivery fees?',
      },
      {
        chipEn: 'Supplier WhatsApp',
        chipNe: 'सप्लायर सन्देश',
        promptRoman: 'supplier lai saman order garna polite Nepali ra English message banaidinu',
        promptUnicode: 'होलसेल सप्लायरलाई सामान अर्डर गर्न सभ्य सन्देश तयार गरिदिनुहोस्।',
        promptEn: 'Write a polite wholesale order inquiry message for my supplier.',
      },
      {
        chipEn: 'Accept QR / eSewa',
        chipNe: 'इसेवा / खल्ती भुक्तानी',
        promptRoman: 'mero pasal ko lagi online store ra eSewa/Khalti checkout kasari chalaune?',
        promptUnicode: 'मेरो पसलको लागि अनलाइन स्टोर र इसेवा/खल्ती भुक्तानी कसरी सुरु गर्ने?',
        promptEn: 'How can I list products and accept eSewa, Khalti, and FonePay in NepalAI Commerce?',
      },
    ],
    fallbackNe: `व्यवसाय सहायक:\n• खुद्रा मूल्य तय गर्दा खरिद लागत + ढुवानी + १३% भ्याट + प्याकेजिङ जोडेर मात्र नाफा निकाल्नुहोस्।\n• ग्राहक र सप्लायर बिलको लागि Commerce Portal वा Letter Studio प्रयोग गर्नुहोस्।`,
    fallbackEn: `Business Helper:\n• Always calculate true landed cost (item + shipping + 13% VAT + packaging) before setting retail prices.\n• Open Commerce Portal to manage products, QR invoices, and WhatsApp order alerts.`,
  },
  {
    id: 'corporate',
    labelEn: 'Corporate',
    labelNe: 'कर्पोरेट / क्लाइन्ट',
    prompts: [
      {
        chipEn: 'Client Proposal Email',
        chipNe: 'क्लाइन्ट प्रस्तावना',
        promptRoman: 'client lai project proposal ra quote pathaune professional email lekhidinu',
        promptUnicode: 'क्लाइन्टलाई सेवा प्रस्तावना र मूल्य कोटेसन पठाउने पेशागत इमेल लेखिदिनुहोस्।',
        promptEn: 'Write a crisp executive email to send a service proposal & quotation to a client.',
      },
      {
        chipEn: 'Salary & Tax TDS',
        chipNe: 'तलब र कर हिसाब',
        promptRoman: 'monthly salary ma SSF ra CIT rakhda income tax kati kam huncha?',
        promptUnicode: 'मासिक तलबमा SSF र नागरिक लगानी कोष (CIT) राख्दा आयकर कति जोगिन्छ?',
        promptEn: 'How do SSF and CIT deductions reduce monthly IRD income tax TDS?',
      },
      {
        chipEn: 'NRB $500 Card Audit',
        chipNe: 'डलर कार्ड अडिट',
        promptRoman: 'dollar card ma SaaS tool tirda 3% bank spread ra 2% DST kati parcha?',
        promptUnicode: 'डलर कार्डबाट विदेशी सफ्टवेयर तिर्दा बैंक शुल्क र २% डिजिटल कर कति लाग्छ?',
        promptEn: 'Explain the true NPR cost of SaaS subscriptions on a Nepal $500 dollar card.',
      },
    ],
    fallbackNe: `कर्पोरेट र क्लाइन्ट सहायक:\n• क्लाइन्ट प्रस्तावनामा मुख्य ३ कुरा स्पष्ट राख्नुहोस्: समाधान, समयसीमा र जम्मा रकम।\n• तलब कर र IT निर्यात दफा ९५क पत्रको लागि Daily Tools प्रयोग गर्नुहोस्।`,
    fallbackEn: `Corporate & Client Assistant:\n• Keep client proposals focused on Deliverable, Timeline, and Transparent Pricing.\n• Use Income Tax and IT Export 95Ka tools for instant PDF slips and bank letters.`,
  },
  {
    id: 'marketer',
    labelEn: 'Marketer',
    labelNe: 'मार्केटिङ',
    prompts: [
      {
        chipEn: 'TikTok / FB Ad Hook',
        chipNe: 'फेसबुक / टिकटक हुक',
        promptRoman: 'Nepal ko customer ko lagi TikTok ra Facebook ad ko 3 ota catchy Nepali hook dinu',
        promptUnicode: 'नेपाली ग्राहकका लागि फेसबुक र टिकटक विज्ञापनको ३ आकर्षक सुरुवाती लाइन दिनुहोस्।',
        promptEn: 'Give me 3 high-converting Facebook & TikTok ad hooks in Nepali and English.',
      },
      {
        chipEn: 'Festival Offer Copy',
        chipNe: 'चाडपर्व अफर प्रचार',
        promptRoman: 'chhadparba special 20% discount offer ko lagi chhoto post lekhidinu',
        promptUnicode: 'चाडपर्व विशेष २०% छुट अफरको लागि छोटो र आकर्षक पोस्ट लेखिदिनुहोस्।',
        promptEn: 'Write a short, attractive festive discount campaign post for Nepali shoppers.',
      },
      {
        chipEn: 'Ad Budget in NPR',
        chipNe: 'विज्ञापन डलर खर्च',
        promptRoman: 'Facebook boost ma $50 kharcha garda NRB rate ra tax jodera NPR kati parcha?',
        promptUnicode: 'फेसबुक बुस्टमा ५० डलर खर्च गर्दा बैंक शुल्क र कर सहित नेपाली कति पर्छ?',
        promptEn: 'How do I estimate my true NPR budget for USD digital ads in Nepal?',
      },
    ],
    fallbackNe: `मार्केटर सहायक:\n• **नेपाली हुक**: "अब महँगो खर्च नगरी घरमै बसी सहजै..." बाट सुरु गरी अन्त्यमा सिधा WhatsApp/Call बटन राख्नुहोस्।\n• डलर बुस्ट खर्च जाँच गर्न NRB Forex टुल प्रयोग गर्नुहोस्।`,
    fallbackEn: `Marketer Helper:\n• Open with a 1-line problem/benefit hook, show clear NPR pricing, and finish with a single direct action.\n• Use our NRB Forex Auditor to estimate true ad spend after FX spread and 2% DST.`,
  },
  {
    id: 'homemaker',
    labelEn: 'Homemaker',
    labelNe: 'गृहिणी / परिवार',
    prompts: [
      {
        chipEn: 'Weekly Meal Plan',
        chipNe: 'साप्ताहिक खाना योजना',
        promptRoman: 'pariwar ko lagi sasto ra swasthya weekly Nepali khana ra tiffin plan banaidinu',
        promptUnicode: 'परिवारको लागि सस्तो र स्वस्थ साप्ताहिक नेपाली खाना र खाजाको तालिका बनाइदिनुहोस्।',
        promptEn: 'Create a healthy, budget-friendly weekly Nepali family meal and school tiffin plan.',
      },
      {
        chipEn: 'Home Budget Tips',
        chipNe: 'घरायसी बजेट',
        promptRoman: 'ghar ko mahina ko tarkari ra kirana kharcha 20% kasari bachaune?',
        promptUnicode: 'घरको मासिक तरकारी र किराना खर्च २०% सम्म कसरी बचत गर्ने?',
        promptEn: 'Practical tips to save 20% on monthly Nepali household groceries and kitchen expenses.',
      },
      {
        chipEn: 'Gold Buying Check',
        chipNe: 'सुन किन्दा ध्यान',
        promptRoman: 'suna ko gahana kinda jyala jarti ra kar kasari check garne?',
        promptUnicode: 'सुनको गहना किन्दा ज्याला, जर्ती र कर ठिक छ कि छैन कसरी जाँच गर्ने?',
        promptEn: 'What should families check regarding jyala, jarti & tax before buying gold jewelry?',
      },
    ],
    fallbackNe: `परिवार तथा गृहिणी सहायक:\n• **मौसमी किनमेल**: कालिमाटीको ताजा दर हेरेर सिजन अनुसार तरकारी किन्दा मासिक २०% सम्म बचत हुन्छ।\n• **सुनचाँदी तथा बिदा पत्र**: गहनाको हिसाब Bullion टुलबाट र बच्चाको स्कुल बिदा पत्र Letter Studio बाट १ मिनेटमै बनाउनुहोस्।`,
    fallbackEn: `Homemaker & Family Helper:\n• Check seasonal Kalimati rates before weekly grocery shopping to save 15–20%.\n• Audit jewelry making charges (ज्याला/जर्ती) in our Bullion tool, or save school leave letters as PDF in Letter Studio.`,
  },
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

  const [persona, setPersona] = useState<AssistantPersona>('general');
  const [inputMode, setInputMode] = useState<'romanized' | 'unicode' | 'english'>('romanized');
  const [inputText, setInputText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isAudioSpeaking, setIsAudioSpeaking] = useState<string | null>(null);

  const activePersonaConfig =
    PERSONA_CONFIGS.find((p) => p.id === persona) || PERSONA_CONFIGS[0];

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-msg',
      sender: 'assistant',
      text: language === 'ne'
        ? `नमस्ते! म **हाम्रो एआई** हुँ — सबै उमेर र पेशाका लागि सरल सहायक।\nमाथि आफ्नो भूमिका छान्नुहोस् (विद्यार्थी, कर्मचारी, व्यापार, कर्पोरेट, मार्केटिङ वा गृहिणी/परिवार) र रोमन नेपाली, देवनागरी वा अंग्रेजीमा सिधै सोध्नुहोस्।`
        : `Namaste! I am **Hamro AI** — simple, practical help for every role.\nPick your role above (Student, Officer, Business, Corporate, Marketer, or Homemaker) and ask in Roman Nepali, Devanagari, or English.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
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

    // Call real /api/chat with persona context and helpful fallback
    const historyPayload = messages.slice(-5).map(m => ({
      role: m.sender === 'user' ? 'user' : 'model',
      text: m.text
    }));

    (async () => {
      let replyText = '';

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text,
            language: language,
            persona: persona,
            history: historyPayload
          })
        });

        if (res.ok) {
          const data = await res.json();
          if (data && data.reply) {
            replyText = data.reply;
          }
        }
      } catch {
        // network fallback
      }

      if (!replyText) {
        const preferNe = language === 'ne' || inputMode === 'unicode';
        replyText = preferNe ? activePersonaConfig.fallbackNe : activePersonaConfig.fallbackEn;
      }

      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
      setIsGenerating(false);
    })();
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
            <div className="relative flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-sky-500 text-white shadow-md">
              <Bot className="h-5 w-5" />
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-cyan-300 border-2 border-[#080b12]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold tracking-tight">
                  Hamro AI (हाम्रो एआई)
                </h2>
                <span className={`px-2 py-0.5 text-xs font-mono font-semibold rounded-full border ${
                  isDark ? 'bg-cyan-500/15 border-cyan-500/35 text-cyan-300' : 'bg-cyan-50 border-cyan-300 text-cyan-800'
                }`}>
                  Kathmandu 42ms
                </span>
              </div>
              <p className={`text-xs hidden sm:block ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
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
                  ? 'border-white/15 bg-white/[0.05] text-slate-200 hover:text-white hover:bg-white/[0.1]'
                  : 'border-slate-300 bg-white text-slate-700 hover:text-slate-950'
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
                  ? 'border-white/15 bg-white/[0.05] text-slate-200 hover:text-white hover:bg-white/[0.1]'
                  : 'border-slate-300 bg-white text-slate-700 hover:text-slate-950'
              }`}
              aria-label="Close Hamro AI Chat"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Clean Role Selector & Script Bar */}
        <div className={`px-4 sm:px-6 py-2.5 border-b space-y-2 text-xs ${
          isDark ? 'border-white/10 bg-black/30 text-slate-200' : 'border-slate-200 bg-slate-100 text-slate-800'
        }`}>
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className={`font-semibold shrink-0 mr-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              {language === 'ne' ? 'तपाईंको भूमिका:' : 'Who are you?'}
            </span>
            {PERSONA_CONFIGS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPersona(p.id)}
                className={`px-2.5 py-1 rounded-lg font-semibold whitespace-nowrap border transition-colors cursor-pointer ${
                  persona === p.id
                    ? 'bg-cyan-600 text-white border-cyan-500 shadow-xs'
                    : isDark
                      ? 'bg-white/5 text-slate-300 border-white/10 hover:text-white'
                      : 'bg-white text-slate-700 border-slate-300 hover:text-slate-950'
                }`}
              >
                {language === 'ne' ? p.labelNe : p.labelEn}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 font-mono">
            <div className="flex items-center gap-2">
              <Languages className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-300" />
              <span className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Typing:</span>
              <div className={`inline-flex rounded-lg p-0.5 border ${isDark ? 'bg-black/40 border-white/15' : 'bg-white border-slate-300'}`}>
                <button
                  type="button"
                  onClick={() => setInputMode('romanized')}
                  className={`px-2 py-0.5 rounded text-xs font-semibold transition-colors cursor-pointer ${
                    inputMode === 'romanized'
                      ? 'bg-cyan-600 text-white shadow-xs'
                      : isDark ? 'text-slate-300 hover:text-white' : 'text-slate-700 hover:text-slate-950'
                  }`}
                >
                  Roman Nepali
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode('unicode')}
                  className={`px-2 py-0.5 rounded text-xs font-semibold transition-colors cursor-pointer ${
                    inputMode === 'unicode'
                      ? 'bg-cyan-600 text-white shadow-xs'
                      : isDark ? 'text-slate-300 hover:text-white' : 'text-slate-700 hover:text-slate-950'
                  }`}
                >
                  देवनागरी
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode('english')}
                  className={`px-2 py-0.5 rounded text-xs font-semibold transition-colors cursor-pointer ${
                    inputMode === 'english'
                      ? 'bg-cyan-600 text-white shadow-xs'
                      : isDark ? 'text-slate-300 hover:text-white' : 'text-slate-700 hover:text-slate-950'
                  }`}
                >
                  English
                </button>
              </div>
            </div>
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
                      ? 'bg-gradient-to-tr from-cyan-500 to-sky-500 text-white shadow-md'
                      : 'bg-sky-700 text-white'
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
                          ? 'bg-white/[0.05] border border-white/15 text-slate-100 shadow-sm'
                          : 'bg-slate-100 border border-slate-200 text-slate-950'
                        : 'bg-cyan-600 text-white shadow-md'
                    }`}
                  >
                    <div className="whitespace-pre-wrap font-sans text-sm">
                      {msg.text}
                    </div>

                    {/* Code Snippet if present */}
                    {msg.codeSnippet && (
                      <div className="mt-3 rounded-xl overflow-hidden border border-white/15 bg-[#04060a] text-xs font-mono">
                        <div className="flex items-center justify-between px-3 py-1.5 bg-white/5 border-b border-white/10 text-slate-300">
                          <span className="flex items-center gap-1.5">
                            <Code2 className="h-3.5 w-3.5 text-cyan-400" />
                            <span>Architecture Snippet</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyMessage(`${msg.id}-code`, msg.codeSnippet || '')}
                            className="hover:text-white transition-colors cursor-pointer"
                          >
                            {copiedId === `${msg.id}-code` ? <Check className="h-3.5 w-3.5 text-cyan-400" /> : <Copy className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                        <pre className="p-3 text-slate-100 overflow-x-auto text-xs leading-relaxed">
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
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs border transition-colors cursor-pointer ${
                          isDark
                            ? 'border-white/15 text-slate-200 hover:text-white hover:bg-white/10'
                            : 'border-slate-300 text-slate-700 hover:text-slate-950 hover:bg-slate-100'
                        }`}
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-cyan-500" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSpeakMessage(msg.id, msg.text)}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs border transition-colors cursor-pointer ${
                          isAudioSpeaking === msg.id
                            ? 'border-cyan-500 bg-cyan-500/20 text-cyan-300'
                            : isDark
                            ? 'border-white/15 text-slate-200 hover:text-white hover:bg-white/10'
                            : 'border-slate-300 text-slate-700 hover:text-slate-950 hover:bg-slate-100'
                        }`}
                      >
                        {isAudioSpeaking === msg.id ? (
                          <>
                            <VolumeX className="h-3.5 w-3.5 text-cyan-400" />
                            <span>Stop Voice</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="h-3.5 w-3.5" />
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
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-md border transition-colors text-xs font-semibold cursor-pointer ${
                            isDark
                              ? 'bg-cyan-500/15 border-cyan-500/35 text-cyan-300 hover:bg-cyan-500/25'
                              : 'bg-cyan-50 border-cyan-300 text-cyan-800 hover:bg-cyan-100'
                          }`}
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
            <div className="flex items-center gap-3 mr-auto">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-sky-500 text-white flex items-center justify-center">
                <Bot className="h-4 w-4 animate-spin" />
              </div>
              <div className={`p-3.5 rounded-2xl border text-xs font-mono flex items-center gap-2 ${
                isDark ? 'border-white/15 bg-white/[0.04] text-cyan-300' : 'border-slate-200 bg-slate-100 text-cyan-800'
              }`}>
                <span className="flex h-2 w-2 rounded-full bg-cyan-400" />
                <span>Kathmandu Sovereign Cluster processing in {inputMode.toUpperCase()}...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Dynamic Persona Quick Suggestion Chips */}
        <div className={`px-4 sm:px-6 py-2.5 border-t overflow-x-auto no-scrollbar flex items-center gap-2 ${
          isDark ? 'border-white/10 bg-black/40' : 'border-slate-200 bg-slate-50'
        }`}>
          <span className={`text-xs font-mono shrink-0 flex items-center gap-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span>{language === 'ne' ? 'सुझाव:' : 'Try:'}</span>
          </span>
          {activePersonaConfig.prompts.map((item, idx) => {
            const promptVal =
              inputMode === 'romanized'
                ? item.promptRoman
                : inputMode === 'unicode'
                ? item.promptUnicode
                : item.promptEn;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleQuickPrompt(promptVal)}
                className={`text-xs px-3 py-1 rounded-full border font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  isDark
                    ? 'border-white/15 bg-white/5 text-slate-200 hover:text-white hover:bg-white/10'
                    : 'border-slate-300 bg-white text-slate-800 hover:text-slate-950'
                }`}
              >
                {language === 'ne' ? item.chipNe : item.chipEn}
              </button>
            );
          })}
        </div>

        {/* Input Bar */}
        <div className={`p-3 sm:p-4 border-t ${
          isDark ? 'border-white/10 bg-[#06080e]' : 'border-slate-200 bg-white'
        }`}>
          {/* Live Transliteration Preview Bar when typing in Romanized */}
          {inputMode === 'romanized' && inputText.trim().length > 1 && (
            <div className={`mb-2 px-3 py-1.5 rounded-lg border text-xs flex items-center justify-between gap-2 ${
              isDark ? 'border-cyan-500/35 bg-cyan-500/10 text-cyan-200' : 'border-cyan-300 bg-cyan-50 text-cyan-950'
            }`}>
              <div className="flex items-center gap-1.5 truncate">
                <span className={`text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>देवनागरी:</span>
                <span className={`font-semibold font-['Noto_Sans_Devanagari'] ${isDark ? 'text-white' : 'text-slate-950'}`}>
                  {transliterateRomanToDevanagari(inputText)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setInputText(transliterateRomanToDevanagari(inputText))}
                className="shrink-0 text-xs px-2.5 py-0.5 rounded bg-cyan-600 text-white font-bold hover:bg-cyan-500 cursor-pointer"
              >
                Apply नेपाली
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
                className={`w-full p-3 rounded-xl border text-sm resize-none focus:outline-hidden focus:ring-2 focus:ring-cyan-500 transition-colors ${
                  isDark
                    ? 'border-white/15 bg-white/[0.05] text-white placeholder:text-slate-400'
                    : 'border-slate-300 bg-slate-50 text-slate-950 placeholder:text-slate-500'
                }`}
              />
            </div>

            <button
              type="submit"
              disabled={!inputText.trim() || isGenerating}
              className={`p-3.5 rounded-xl font-semibold transition-colors flex items-center justify-center cursor-pointer ${
                inputText.trim() && !isGenerating
                  ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-500/25'
                  : isDark ? 'bg-white/10 text-slate-400 cursor-not-allowed' : 'bg-slate-200 text-slate-500 cursor-not-allowed'
              }`}
              aria-label="Send message to Hamro AI"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>

          <div className={`flex items-center justify-between mt-2 text-xs font-mono ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            <span>Press Enter to send • Shift+Enter for new line</span>
            <span>NepalAI Cluster 01 • Sovereign Air-Gapped</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
