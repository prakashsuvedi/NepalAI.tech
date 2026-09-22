import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Search, 
  X, 
  Sparkles, 
  Briefcase, 
  HelpCircle, 
  Compass, 
  ArrowRight, 
  ExternalLink, 
  Check, 
  Layers, 
  SlidersHorizontal,
  Command,
  CornerDownLeft,
  ChevronRight,
  Globe2,
  Cpu,
  FileText,
  Bot
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ThemeMode, Language } from '../types';
import { NEPAL_AI_TOOLS } from '../data/nepalTools';
import { CONSULTING_OFFERINGS } from '../data/consultingOfferings';
import { FAQ_ITEMS } from '../data/faqData';
import { TRANSLATIONS } from '../data/translations';

export type SearchCategory = 'all' | 'tools' | 'consulting' | 'sections' | 'faqs';

interface SearchResultItem {
  id: string;
  category: 'tool' | 'consulting' | 'section' | 'faq';
  titleEn: string;
  titleNe: string;
  descriptionEn: string;
  descriptionNe: string;
  badge?: string;
  extraInfo?: string;
  keywords: string[];
  actionType: 'navigate' | 'consultation' | 'link' | 'faq';
  targetId?: string;
  linkUrl?: string;
  consultingServiceTitle?: string;
}

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme?: ThemeMode;
  language?: Language;
  onNavigateSection?: (sectionId: string) => void;
  onOpenConsultation?: (serviceTitle?: string) => void;
  onOpenStackCalculator?: () => void;
  onOpenHamroAI?: () => void;
  onSelectLanguage?: (lang: Language) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  theme = 'dark',
  language = 'en',
  onNavigateSection,
  onOpenConsultation,
  onOpenStackCalculator,
  onOpenHamroAI,
  onSelectLanguage,
}) => {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<SearchCategory>('all');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const isDark = theme === 'dark';
  const isNepali = language === 'ne';
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  // Build searchable index
  const allSearchItems = useMemo<SearchResultItem[]>(() => {
    const items: SearchResultItem[] = [];

    // 1. Navigation Sections & Pages
    const sections: SearchResultItem[] = [
      {
        id: 'sec-hero',
        category: 'section',
        titleEn: 'Home & Sovereign Overview',
        titleNe: 'गृहपृष्ठ र स्वायत्त एआई परिचय',
        descriptionEn: 'Explore Nepal\'s sovereign AI foundation, dual-currency pricing, and key metrics.',
        descriptionNe: 'नेपालको आफ्नै स्वायत्त एआई प्लेटफर्म र परिदृश्य।',
        badge: 'Page Section',
        keywords: ['home', 'hero', 'overview', 'nepalai', 'gharapristha', 'start'],
        actionType: 'navigate',
        targetId: 'hero',
      },
      {
        id: 'sec-about',
        category: 'section',
        titleEn: 'About Sovereign AI & Devanagari',
        titleNe: 'हाम्रो बारेमा र देवनागरी मोडल',
        descriptionEn: 'Learn about indigenous Devanagari models, NRB compliance, and local Kathmandu Tier-3 data residency.',
        descriptionNe: 'देवनागरी मोडल, राष्ट्र बैंक निर्देशिका र काठमाडौँ डेटा सेन्टर।',
        badge: 'About',
        keywords: ['about', 'sovereign', 'devanagari', 'nrb', 'datacenter', 'hamro barema', 'kathmandu'],
        actionType: 'navigate',
        targetId: 'about',
      },
      {
        id: 'sec-studio',
        category: 'section',
        titleEn: 'NepalAI Studio Workbench',
        titleNe: 'NepalAI स्टुडियो वर्कबेन्च',
        descriptionEn: 'Sora-2 Video Studio, HamroAI Chatbot, Devanagari Voice Synthesis, and Timeline Video Editor.',
        descriptionNe: 'सोरा-२ भिडियो, हाम्रो एआई च्याट, देवनागरी भ्वाइस र भिडियो सम्पादक।',
        badge: 'Studio',
        keywords: ['studio', 'workbench', 'sora', 'hamroai', 'voice', 'audio', 'video', 'editor', 'chat'],
        actionType: 'navigate',
        targetId: 'studio-bento',
      },
      {
        id: 'sec-consulting',
        category: 'section',
        titleEn: 'Enterprise AI Consulting & Architecture',
        titleNe: 'संस्थागत एआई परामर्श तथा इन्जिनियरिङ',
        descriptionEn: 'Custom 2-week MVP sprints, Devanagari OCR, NRB audit compliance, and WhatsApp banking bot.',
        descriptionNe: '२-हप्ते प्रोटोटाइप स्प्रिन्ट, देवनागरी ओसीआर, एनआरबी अडिट तथा बैंकिङ एजेन्ट।',
        badge: 'Services',
        keywords: ['consulting', 'services', 'enterprise', 'advisory', 'paramarsha', 'sprint', 'architecture', 'pricing'],
        actionType: 'navigate',
        targetId: 'consulting',
      },
      {
        id: 'sec-directory',
        category: 'section',
        titleEn: 'Verified AI Tools Directory (Nepal-Ready)',
        titleNe: 'प्रमाणित एआई टुल्स डाइरेक्टरी',
        descriptionEn: 'Filter 20+ verified tools supporting eSewa, Khalti, Nepali cards, and local workflows.',
        descriptionNe: 'नेपालमा चल्ने २०+ एआई टुल्स, eSewa र खल्ती भुक्तानी मार्गनिर्देशन।',
        badge: 'Directory',
        keywords: ['tools', 'directory', 'chatgpt', 'claude', 'deepseek', 'esewa', 'khalti', 'dollar card', 'calculator'],
        actionType: 'navigate',
        targetId: 'tools-directory',
      },
      {
        id: 'sec-free-tools',
        category: 'section',
        titleEn: 'Free AI Tools, APIs & Free Tiers in Nepal',
        titleNe: 'नि:शुल्क एआई टुल्स र खुला एपीआई',
        descriptionEn: 'Explore top free AI models, DeepSeek R1, Groq high-speed tokens, and zero-dollar solutions.',
        descriptionNe: 'नि:शुल्क एआई मोडेल, DeepSeek R1 र Groq खुला एपीआई।',
        badge: 'Free Tier',
        keywords: ['free', 'open source', 'apis', 'deepseek', 'groq', 'nisshulka', 'zero dollar'],
        actionType: 'navigate',
        targetId: 'free-ai-tools',
      },
      {
        id: 'sec-automation',
        category: 'section',
        titleEn: 'AI Automation Workflows for Nepal',
        titleNe: 'स्वचालित एआई कार्यप्रवाह',
        descriptionEn: 'Automated invoice parsing, Devanagari KYC extraction, and social media scheduling.',
        descriptionNe: 'स्वचालित बिलिङ, नागरिकता KYC र सामाजिक सञ्जाल व्यवस्थापन।',
        badge: 'Automation',
        keywords: ['automation', 'workflows', 'make', 'n8n', 'zapier', 'invoice', 'kyc'],
        actionType: 'navigate',
        targetId: 'automation',
      },
      {
        id: 'sec-daily',
        category: 'section',
        titleEn: 'Daily Essential AI Tools (Office & School)',
        titleNe: 'दैनिक प्रयोगका अत्यावश्यक एआई टुल्स',
        descriptionEn: 'Essential everyday AI for students, writers, developers, and office productivity.',
        descriptionNe: 'विद्यार्थी, कार्यालय र लेखकहरूका लागि दैनिक एआई।',
        badge: 'Essentials',
        keywords: ['daily', 'essentials', 'student', 'office', 'writing', 'dainik'],
        actionType: 'navigate',
        targetId: 'daily-tools',
      },
      {
        id: 'sec-case-studies',
        category: 'section',
        titleEn: 'Case Studies & Production Deployments',
        titleNe: 'केस स्टडी तथा सफलताका कथाहरू',
        descriptionEn: 'Real-world implementations in Himalayan Bank, Trekking agencies, and Healthcare.',
        descriptionNe: 'नेपालका बैंक, पर्यटन र स्वास्थ्य संस्थामा एआई सफलता।',
        badge: 'Case Studies',
        keywords: ['case studies', 'success stories', 'banks', 'himalayan', 'trekking', 'healthcare'],
        actionType: 'navigate',
        targetId: 'case-studies',
      },
      {
        id: 'sec-faq',
        category: 'section',
        titleEn: 'Frequently Asked Questions (FAQ)',
        titleNe: 'प्राय: सोधिने प्रश्नहरू (FAQ)',
        descriptionEn: 'Answers to eSewa/Khalti billing, $500 Dollar Card, Devanagari OCR accuracy, and NRB laws.',
        descriptionNe: 'eSewa भुक्तानी, डलर कार्ड, राष्ट्र बैंक नियम र शुद्धतासम्बन्धी प्रश्नोत्तर।',
        badge: 'FAQ',
        keywords: ['faq', 'questions', 'help', 'esewa payment', 'dollar card limit', 'prashna'],
        actionType: 'navigate',
        targetId: 'faq',
      },
      {
        id: 'sec-contact',
        category: 'section',
        titleEn: 'Contact & Scoping Inquiry',
        titleNe: 'सम्पर्क तथा परामर्श फाराम',
        descriptionEn: 'Reach out to our Kathmandu engineering lab via WhatsApp, email, or direct consultation booking.',
        descriptionNe: 'काठमाडौँ इन्जिनियरिङ ल्याबसँग ह्वाट्सएप वा ईमेल मार्फत सिधै जोडिनुहोस्।',
        badge: 'Contact',
        keywords: ['contact', 'email', 'phone', 'whatsapp', 'address', 'kathmandu', 'samparka'],
        actionType: 'navigate',
        targetId: 'contact',
      },
    ];
    items.push(...sections);

    // 2. AI Tools from Directory
    NEPAL_AI_TOOLS.forEach((tool) => {
      items.push({
        id: `tool-${tool.id}`,
        category: 'tool',
        titleEn: tool.name,
        titleNe: `${tool.name} (नेपाल-तयार)`,
        descriptionEn: tool.description,
        descriptionNe: `${tool.category} • $${tool.monthlyPriceUsd}/mo (रू ${Math.round(tool.monthlyPriceUsd * 135).toLocaleString()}) • ${tool.paymentDetails}`,
        badge: tool.category,
        extraInfo: `$${tool.monthlyPriceUsd}/mo • NPR ${Math.round(tool.monthlyPriceUsd * 135).toLocaleString()}`,
        keywords: [
          tool.name.toLowerCase(),
          tool.category.toLowerCase(),
          tool.paymentDetails.toLowerCase(),
          tool.keyCapability.toLowerCase(),
          tool.nepalPaymentStatus.toLowerCase(),
          tool.worksInNepal.toLowerCase(),
          (tool.businessUsageTier || '').toLowerCase(),
          'ai tool',
          'software',
        ],
        actionType: 'navigate',
        targetId: 'tools-directory',
      });
    });

    // 3. Consulting Offerings
    CONSULTING_OFFERINGS.forEach((offering) => {
      items.push({
        id: `consulting-${offering.id}`,
        category: 'consulting',
        titleEn: offering.title,
        titleNe: offering.title,
        descriptionEn: `${offering.subtitle} — Starting from ${offering.startingPriceNpr} (${offering.startingPriceUsd}).`,
        descriptionNe: `${offering.subtitle} — सुरुवाती लागत: ${offering.startingPriceNpr} (${offering.startingPriceUsd})।`,
        badge: offering.tier,
        extraInfo: `${offering.startingPriceNpr} (${offering.startingPriceUsd})`,
        keywords: [
          offering.title.toLowerCase(),
          offering.subtitle.toLowerCase(),
          offering.tier.toLowerCase(),
          ...(offering.deliverables || []).map(d => d.toLowerCase()),
          'consulting',
          'service',
          'advisory',
          'paramarsha',
        ],
        actionType: 'consultation',
        consultingServiceTitle: offering.title,
      });
    });

    // 4. FAQ Topics
    FAQ_ITEMS.forEach((faq) => {
      items.push({
        id: `faq-${faq.id}`,
        category: 'faq',
        titleEn: faq.questionEn,
        titleNe: faq.questionNe,
        descriptionEn: faq.answerEn,
        descriptionNe: faq.answerNe,
        badge: faq.category,
        keywords: [
          faq.questionEn.toLowerCase(),
          faq.questionNe.toLowerCase(),
          faq.answerEn.toLowerCase(),
          faq.answerNe.toLowerCase(),
          ...(faq.tags || []).map(t => t.toLowerCase()),
          'faq',
          'help',
          'question',
          'prashna',
        ],
        actionType: 'faq',
        targetId: 'faq',
      });
    });

    return items;
  }, []);

  // Filtered items based on query and category
  const filteredResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    
    return allSearchItems.filter((item) => {
      // Category filter
      if (selectedCategory !== 'all') {
        if (selectedCategory === 'tools' && item.category !== 'tool') return false;
        if (selectedCategory === 'consulting' && item.category !== 'consulting') return false;
        if (selectedCategory === 'sections' && item.category !== 'section') return false;
        if (selectedCategory === 'faqs' && item.category !== 'faq') return false;
      }

      // Empty query shows curated top essentials
      if (!q) {
        return true;
      }

      // Multilingual matching across title, descriptions, and keyword tokens
      const matchesEn = item.titleEn.toLowerCase().includes(q) || item.descriptionEn.toLowerCase().includes(q);
      const matchesNe = item.titleNe.toLowerCase().includes(q) || item.descriptionNe.toLowerCase().includes(q);
      const matchesKeywords = item.keywords.some((kw) => kw.includes(q));
      const matchesBadge = item.badge?.toLowerCase().includes(q);

      return matchesEn || matchesNe || matchesKeywords || matchesBadge;
    });
  }, [allSearchItems, query, selectedCategory]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle Keyboard navigation inside modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < filteredResults.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredResults.length - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredResults[selectedIndex]) {
          handleSelectItem(filteredResults[selectedIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredResults, selectedIndex]);

  // Reset selectedIndex when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [query, selectedCategory]);

  // Auto-scroll selected item into view
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.querySelector(`[data-index="${selectedIndex}"]`) as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  const handleSelectItem = (item: SearchResultItem) => {
    onClose();

    if (item.actionType === 'consultation' && onOpenConsultation) {
      onOpenConsultation(item.consultingServiceTitle || item.titleEn);
    } else if (item.actionType === 'navigate' || item.actionType === 'faq') {
      if (item.targetId) {
        if (onNavigateSection) {
          onNavigateSection(item.targetId);
        } else {
          const el = document.getElementById(item.targetId);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
          }
        }
      }
    }
  };

  const getCategoryIcon = (cat: SearchResultItem['category']) => {
    switch (cat) {
      case 'tool':
        return Cpu;
      case 'consulting':
        return Briefcase;
      case 'faq':
        return HelpCircle;
      case 'section':
      default:
        return Compass;
    }
  };

  const categories: { id: SearchCategory; labelEn: string; labelNe: string; count: number }[] = [
    { id: 'all', labelEn: 'All Results', labelNe: 'सबै नतिजाहरू', count: allSearchItems.length },
    { id: 'tools', labelEn: 'AI Tools', labelNe: 'एआई टुल्स', count: allSearchItems.filter(i => i.category === 'tool').length },
    { id: 'consulting', labelEn: 'Consulting', labelNe: 'परामर्श सेवा', count: allSearchItems.filter(i => i.category === 'consulting').length },
    { id: 'sections', labelEn: 'Sections', labelNe: 'पृष्ठ खण्डहरू', count: allSearchItems.filter(i => i.category === 'section').length },
    { id: 'faqs', labelEn: 'FAQs', labelNe: 'प्रश्नोत्तर (FAQ)', count: allSearchItems.filter(i => i.category === 'faq').length },
  ];

  const popularPills = [
    { labelEn: 'eSewa & Khalti', labelNe: 'eSewa र Khalti', query: 'esewa' },
    { labelEn: 'Devanagari OCR', labelNe: 'देवनागरी ओसीआर', query: 'ocr' },
    { labelEn: '$500 Dollar Card', labelNe: '$५०० डलर कार्ड', query: 'dollar card' },
    { labelEn: 'HamroAI LLM', labelNe: 'हाम्रो एआई च्याट', query: 'hamroai' },
    { labelEn: 'DeepSeek R1', labelNe: 'DeepSeek R1', query: 'deepseek' },
    { labelEn: 'Sora-2 Video', labelNe: 'सोरा-२ भिडियो', query: 'sora' },
    { labelEn: 'NRB Compliance', labelNe: 'NRB निर्देशिका', query: 'nrb' },
  ];

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 sm:pt-16 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
      role="presentation"
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label="Global Search and Quick Navigation"
        initial={{ opacity: 0, scale: 0.96, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: -10 }}
        transition={{ duration: 0.2 }}
        className={`relative w-full max-w-3xl rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[85vh] ${
          isDark
            ? 'border-white/15 bg-[#080b11] text-slate-100 shadow-black/90'
            : 'border-slate-300 bg-white text-slate-900 shadow-xl'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="relative flex items-center px-4 sm:px-6 py-4 border-b border-white/10 gap-3">
          <Search className="h-5 w-5 text-emerald-400 shrink-0" aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              isNepali
                ? 'एआई टुल्स, परामर्श, FAQ वा पृष्ठ खोज्नुहोस्... (उदा. eSewa, OCR, HamroAI)'
                : 'Search verified AI tools, consulting services, FAQs, and sections... (e.g. eSewa, OCR, Sora)'
            }
            className={`w-full bg-transparent text-sm sm:text-base font-medium focus:outline-hidden placeholder-slate-400 ${
              isNepali ? "font-['Noto_Sans_Devanagari']" : ''
            }`}
            aria-label="Global search input"
          />

          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Clear search query"
            >
              <X className="h-4 w-4" />
            </button>
          )}

          <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/[0.06] border border-white/10 text-[10px] font-mono text-slate-400">
            <kbd className="font-sans">ESC</kbd>
            <span>to close</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="sm:hidden p-1.5 rounded-lg text-slate-400 hover:text-white"
            aria-label="Close search"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Category Filter Tabs & Popular Queries */}
        <div className="px-4 sm:px-6 py-2.5 border-b border-white/10 flex items-center justify-between gap-3 overflow-x-auto scrollbar-none text-xs">
          <div className="flex items-center gap-1.5 shrink-0">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                  selectedCategory === cat.id
                    ? isDark
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                      : 'bg-emerald-600 text-white font-bold shadow-xs'
                    : isDark
                    ? 'bg-white/[0.04] text-slate-300 hover:bg-white/[0.08] hover:text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>{isNepali ? cat.labelNe : cat.labelEn}</span>
                <span className={`text-[10px] font-mono px-1 rounded ${
                  selectedCategory === cat.id
                    ? 'bg-slate-950/20 text-slate-950 font-bold'
                    : 'text-slate-400'
                }`}>
                  {cat.count}
                </span>
              </button>
            ))}
          </div>

          {/* Quick Language Toggle inside Search */}
          {onSelectLanguage && (
            <div className="hidden md:flex items-center gap-1 text-[11px] font-mono text-slate-400 shrink-0">
              <Globe2 className="h-3 w-3 text-emerald-400" />
              <button
                type="button"
                onClick={() => onSelectLanguage(language === 'en' ? 'ne' : 'en')}
                className="hover:text-white underline cursor-pointer"
              >
                {language === 'en' ? 'नेपालीमा खोज्नुहोस्' : 'Search in EN'}
              </button>
            </div>
          )}
        </div>

        {/* Popular Tags Strip when query is empty */}
        {!query && (
          <div className="px-4 sm:px-6 py-2 bg-white/[0.02] border-b border-white/5 flex items-center gap-2 overflow-x-auto scrollbar-none text-[11px]">
            <span className="text-slate-400 shrink-0 font-medium">
              {isNepali ? 'लोकप्रिय खोज:' : 'Trending in Nepal:'}
            </span>
            {popularPills.map((pill, pIdx) => (
              <button
                key={pIdx}
                type="button"
                onClick={() => setQuery(pill.query)}
                className="px-2.5 py-0.5 rounded-full bg-white/[0.04] hover:bg-emerald-500/20 hover:text-emerald-300 border border-white/10 text-slate-300 whitespace-nowrap transition-colors cursor-pointer"
              >
                {isNepali ? pill.labelNe : pill.labelEn}
              </button>
            ))}
          </div>
        )}

        {/* Unified AI Engine Query Bridges: Hamro AI, Perplexity, ChatGPT, Claude, DeepSeek */}
        <div className="px-4 sm:px-6 py-2 bg-emerald-500/[0.03] border-b border-emerald-500/15 flex items-center gap-2 overflow-x-auto scrollbar-none text-[11px]">
          <span className="text-emerald-400 shrink-0 font-mono font-bold flex items-center gap-1">
            <Sparkles className="h-3 w-3" /> AI Engines:
          </span>

          {onOpenHamroAI && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenHamroAI();
              }}
              className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25 transition-all font-semibold flex items-center gap-1 shrink-0 cursor-pointer shadow-xs"
            >
              <Bot className="h-3 w-3" />
              <span>{isNepali ? 'हाम्रो एआई च्याट' : 'Hamro AI Chat'}</span>
            </button>
          )}

          <a
            href={`https://www.perplexity.ai/search?q=${encodeURIComponent(query ? query + ' in Nepal context' : 'Nepal AI sovereign tools NRB compliance')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/10 text-slate-300 hover:text-white hover:bg-white/[0.08] transition-all flex items-center gap-1 shrink-0"
          >
            <span>Perplexity Pro</span>
            <ExternalLink className="h-2.5 w-2.5 opacity-60" />
          </a>

          <a
            href={`https://chatgpt.com/?q=${encodeURIComponent(query ? query : 'Nepal AI enterprise consulting')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/10 text-slate-300 hover:text-white hover:bg-white/[0.08] transition-all flex items-center gap-1 shrink-0"
          >
            <span>ChatGPT</span>
            <ExternalLink className="h-2.5 w-2.5 opacity-60" />
          </a>

          <a
            href={`https://claude.ai/new?q=${encodeURIComponent(query ? query : 'Architecture for sovereign LLM in Nepal')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/10 text-slate-300 hover:text-white hover:bg-white/[0.08] transition-all flex items-center gap-1 shrink-0"
          >
            <span>Claude 3.7</span>
            <ExternalLink className="h-2.5 w-2.5 opacity-60" />
          </a>

          <a
            href={`https://chat.deepseek.com/?q=${encodeURIComponent(query ? query : 'DeepSeek R1 reasoning')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/10 text-slate-300 hover:text-white hover:bg-white/[0.08] transition-all flex items-center gap-1 shrink-0"
          >
            <span>DeepSeek R1</span>
            <ExternalLink className="h-2.5 w-2.5 opacity-60" />
          </a>
        </div>

        {/* Results List */}
        <div
          ref={listRef}
          className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-1.5 max-h-[50vh] divide-y divide-white/5"
          role="listbox"
        >
          {filteredResults.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.03] border border-white/10 text-slate-400">
                <Search className="h-6 w-6" />
              </div>
              <p className="text-sm font-semibold text-slate-300">
                {isNepali ? `"${query}" को लागि कुनै नतिजा फेला परेन` : `No matches found for "${query}"`}
              </p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {isNepali
                  ? 'कृपया अन्य नेपाली वा अंग्रेजी शब्दहरू (उदा: eSewa, OCR, HamroAI, Consulting) प्रयोग गर्नुहोस्।'
                  : 'Try searching for general keywords like eSewa, Devanagari, Cloud, NRB, or Consulting.'}
              </p>
            </div>
          ) : (
            filteredResults.map((item, index) => {
              const isSelected = index === selectedIndex;
              const IconComp = getCategoryIcon(item.category);

              return (
                <div
                  key={item.id}
                  data-index={index}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelectItem(item)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`p-3 rounded-2xl transition-all cursor-pointer flex items-start justify-between gap-3 group ${
                    isSelected
                      ? isDark
                        ? 'bg-emerald-500/15 border border-emerald-500/40 text-white'
                        : 'bg-emerald-50 border border-emerald-300 text-slate-900'
                      : isDark
                      ? 'hover:bg-white/[0.04] border border-transparent text-slate-200'
                      : 'hover:bg-slate-50 border border-transparent text-slate-800'
                  }`}
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className={`p-2 rounded-xl mt-0.5 shrink-0 ${
                      isSelected
                        ? 'bg-emerald-500 text-slate-950 font-bold'
                        : isDark
                        ? 'bg-white/[0.05] text-emerald-400 border border-white/10'
                        : 'bg-slate-100 text-emerald-700'
                    }`}>
                      <IconComp className="h-4 w-4" aria-hidden="true" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold truncate">
                          {isNepali ? item.titleNe : item.titleEn}
                        </span>

                        {item.badge && (
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                            isSelected
                              ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300'
                              : isDark
                              ? 'bg-white/[0.04] border-white/10 text-slate-400'
                              : 'bg-slate-100 border-slate-200 text-slate-600'
                          }`}>
                            {item.badge}
                          </span>
                        )}

                        {item.extraInfo && (
                          <span className="text-[11px] font-mono text-emerald-400 font-semibold">
                            {item.extraInfo}
                          </span>
                        )}
                      </div>

                      <p className={`text-xs mt-1 line-clamp-2 leading-relaxed ${
                        isSelected
                          ? isDark ? 'text-slate-200' : 'text-slate-700'
                          : isDark ? 'text-slate-400' : 'text-slate-600'
                      } ${isNepali ? "font-['Mukta']" : ''}`}>
                        {isNepali ? item.descriptionNe : item.descriptionEn}
                      </p>
                    </div>
                  </div>

                  {/* Action Pill */}
                  <div className="shrink-0 self-center pl-2">
                    <div className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg transition-all ${
                      isSelected
                        ? isDark
                          ? 'bg-emerald-500 text-slate-950 shadow-sm'
                          : 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-500 opacity-0 group-hover:opacity-100'
                    }`}>
                      <span className="text-[11px] hidden sm:inline">
                        {item.actionType === 'consultation'
                          ? isNepali ? 'परामर्श लिनुहोस्' : 'Book Scope'
                          : isNepali ? 'खोल्नुहोस्' : 'Jump to'}
                      </span>
                      <CornerDownLeft className="h-3.5 w-3.5" aria-hidden="true" />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Shortcut Helper Bar */}
        <div className="px-4 sm:px-6 py-3 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] font-mono text-slate-400 bg-white/[0.01]">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-[10px]">↑</kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-[10px]">↓</kbd>
              <span>navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-[10px]">↵</kbd>
              <span>select</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-[10px]">esc</kbd>
              <span>close</span>
            </span>
          </div>

          <div className="text-emerald-400 font-medium">
            <span>nepalai.tech Global Command Palette</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
