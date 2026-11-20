import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NEPAL_AI_TOOLS } from '../data/nepalTools';
import { ToolCategory, ThemeMode, Language, NepalAITool } from '../types';
import { Search, CheckCircle, AlertTriangle, ExternalLink, Plus, Check, Layers, Info, Sparkles, Zap, ShieldCheck, X, TrendingUp, Award, ShieldAlert, Lock, AlertCircle, RefreshCw } from 'lucide-react';
import { TRANSLATIONS } from '../data/translations';
import { BentoGridSkeleton } from './BentoGridSkeleton';
import { AppleTooltip } from './AppleTooltip';
import { Breadcrumbs } from './ui/Breadcrumbs';

interface NepalToolsDirectoryProps {
  theme?: ThemeMode;
  language?: Language;
  selectedStack: string[];
  onToggleStack: (toolId: string) => void;
  onOpenStackCalculator: () => void;
  onNavigateHome?: () => void;
  isHydrating?: boolean;
}

const CATEGORIES: ToolCategory[] = [
  'All',
  'Nepal Sovereign AI',
  'Coding',
  'LLM & Writing',
  'Design & Video',
  'Audio & Voice',
  'Automation'
];

export const NepalToolsDirectory: React.FC<NepalToolsDirectoryProps> = ({
  theme = 'dark',
  language = 'en',
  selectedStack,
  onToggleStack,
  onOpenStackCalculator,
  onNavigateHome,
  isHydrating = false,
}) => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<ToolCategory>('All');
  const [filterType, setFilterType] = useState<'all' | 'esewa' | 'dollar' | 'free'>('all');
  const [hoveredTool, setHoveredTool] = useState<NepalAITool | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number; alignRight?: boolean } | null>(null);
  const [pinnedToolId, setPinnedToolId] = useState<string | null>(null);
  const [isFetchingData, setIsFetchingData] = useState<boolean>(true);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Content-aware initial hydration state
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsFetchingData(false);
    }, 700);
    return () => clearTimeout(timer);
  }, []);

  const handleRefreshDirectory = () => {
    setIsFetchingData(true);
    setTimeout(() => {
      setIsFetchingData(false);
    }, 600);
  };

  const isDark = theme === 'dark';
  const t = TRANSLATIONS[language];

  const exchangeRate = 135; // 1 USD = 135 NPR

  const handleMouseEnterTool = (tool: NepalAITool, e: React.MouseEvent<HTMLElement>) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    const rect = e.currentTarget.getBoundingClientRect();
    const isRightSide = rect.left > window.innerWidth / 2;
    setTooltipPos({
      top: rect.bottom + window.scrollY + 8,
      left: isRightSide ? rect.right + window.scrollX : rect.left + window.scrollX,
      alignRight: isRightSide,
    });
    setHoveredTool(tool);
  };

  const handleMouseLeaveTool = () => {
    if (pinnedToolId) return;
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredTool(null);
    }, 150);
  };

  const handleTogglePinTooltip = (tool: NepalAITool) => {
    if (pinnedToolId === tool.id) {
      setPinnedToolId(null);
      setHoveredTool(null);
    } else {
      setPinnedToolId(tool.id);
      setHoveredTool(tool);
    }
  };

  const filteredTools = NEPAL_AI_TOOLS.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase()) ||
      item.keyCapability.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = category === 'All' || item.category === category;

    const matchesFilter =
      filterType === 'all'
        ? true
        : filterType === 'esewa'
        ? (item.nepalPaymentStatus === 'esewa-khalti' || Boolean(item.supportsQuickPay))
        : filterType === 'free'
        ? item.freeTierAvailable
        : item.nepalPaymentStatus === 'dollar-card-only';

    return matchesSearch && matchesCategory && matchesFilter;
  });

  return (
    <section
      id="tools-directory"
      className={`py-16 md:py-24 relative border-t transition-colors duration-300 ${
        isDark ? 'border-white/[0.08]' : 'border-slate-200 bg-slate-50/50'
      }`}
      aria-labelledby="tools-directory-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Navigation */}
        <div className="mb-4">
          <Breadcrumbs
            items={[
              { label: language === 'ne' ? 'गृहपृष्ठ' : 'Home', onClick: onNavigateHome },
              { label: language === 'ne' ? 'टुल्स डाइरेक्टरी' : 'Tools Directory', isCurrent: true },
            ]}
          />
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-500/20">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-xs text-cyan-500 mb-2 font-semibold">
              <span className="font-['Noto_Sans_Devanagari']">
                {language === 'ne' ? 'स्थानीय पहुँच तथा भुक्तानी' : 'Verified Nepal Ecosystem'}
              </span>
              <span className={isDark ? 'text-slate-600' : 'text-slate-300'} aria-hidden="true">•</span>
              <span className={`font-mono uppercase tracking-wider text-[11px] ${
                isDark ? 'text-cyan-400/90' : 'text-cyan-700'
              }`}>
                {t.tools.badge}
              </span>
            </div>
            <h2
              id="tools-directory-heading"
              className={`text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight font-display ${
                isDark ? 'text-white' : 'text-slate-950'
              }`}
            >
              {language === 'ne' ? 'प्रमाणित एआई टुल्स र भुक्तानी गाइड' : 'Verified AI Tools & Payment Directory'}
            </h2>
            <p className={`mt-2 text-xs sm:text-sm leading-relaxed ${
              isDark ? 'text-slate-300' : 'text-slate-700'
            }`}>
              {t.tools.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onOpenStackCalculator}
              aria-label={`Open AI Stack Calculator with ${selectedStack.length} tools selected`}
              className={`min-h-[44px] px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all flex items-center justify-center gap-2 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-cyan-500 cursor-pointer ${
                isDark
                  ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300 hover:text-white hover:bg-cyan-500/20 hover:border-cyan-400 shadow-sm shadow-cyan-500/10'
                  : 'bg-white border-cyan-200 text-cyan-800 hover:text-cyan-950 hover:border-cyan-400 shadow-xs'
              }`}
            >
              <Layers className="h-4 w-4 text-cyan-500 shrink-0" aria-hidden="true" />
              <span className={language === 'ne' ? "font-['Noto_Sans_Devanagari']" : ''}>
                {t.nav.stackCalculator} ({selectedStack.length})
              </span>
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="mt-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Search */}
          <div className="relative md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" aria-hidden="true" />
            <input
              id="tools-search-input"
              type="text"
              aria-label={t.tools.searchPlaceholder}
              placeholder={t.tools.searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full min-h-[44px] rounded-xl border pl-10 pr-3.5 py-2.5 text-xs focus:outline-hidden focus-visible:ring-2 focus-visible:ring-cyan-500 transition-colors ${
                isDark
                  ? 'border-white/10 bg-[#0c1324] text-white placeholder-slate-400 focus:border-cyan-500'
                  : 'border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:border-cyan-500 shadow-xs'
              }`}
            />
          </div>

          {/* Quick Payment Filter with 44px touch targets */}
          <div
            className="flex flex-wrap items-center gap-2 text-xs"
            role="group"
            aria-label="Payment method filter"
          >
            <span className={`text-xs mr-1 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              {t.tools.paymentFilterLabel}:
            </span>
            {[
              { id: 'all', label: t.tools.allPayments },
              { id: 'esewa', label: 'eSewa / Khalti' },
              { id: 'dollar', label: '$500 Dollar Card' },
              { id: 'free', label: 'Free Tier' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                aria-pressed={filterType === f.id}
                onClick={() => setFilterType(f.id as any)}
                className={`min-h-[44px] px-3.5 py-2 rounded-xl transition-colors text-xs font-semibold flex items-center justify-center focus:outline-hidden focus-visible:ring-2 focus-visible:ring-cyan-500 cursor-pointer ${
                  filterType === f.id
                    ? 'bg-gradient-to-r from-cyan-600 via-sky-600 to-blue-600 text-white font-bold shadow-xs border-transparent'
                    : isDark
                    ? 'bg-white/[0.06] border border-slate-700 text-slate-200 hover:text-white hover:border-cyan-400'
                    : 'bg-white border border-slate-300 text-slate-800 hover:text-slate-950 hover:border-cyan-600 shadow-2xs'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

        </div>

        {/* Categories */}
        <div
          className="mt-4 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs"
          role="group"
          aria-label="Tool categories filter"
        >
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={category === c}
              onClick={() => setCategory(c)}
              className={`min-h-[44px] min-w-[44px] px-4 py-2.5 rounded-xl whitespace-nowrap transition-colors flex items-center justify-center focus:outline-hidden focus-visible:ring-2 focus-visible:ring-cyan-500 cursor-pointer font-semibold ${
                category === c
                  ? isDark
                    ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400 font-bold'
                    : 'bg-cyan-50 text-cyan-950 border border-cyan-500 font-bold shadow-xs'
                  : isDark
                  ? 'bg-black/40 border border-slate-800 text-slate-200 hover:text-white hover:border-slate-600'
                  : 'bg-white text-slate-800 border border-slate-300 hover:text-slate-950 hover:border-cyan-600'
              }`}
            >
              {c === 'All' ? t.tools.allCategories : c === 'Nepal Sovereign AI' ? (language === 'ne' ? '🇳🇵 स्वदेशी एआई (Nepal Sovereign)' : '🇳🇵 Nepal Sovereign AI') : c}
            </button>
          ))}
        </div>

        {/* Smart Reminder & Nepal Police Cyber Bureau (CIB) Safety Advisory */}
        <div 
          className={`mt-5 p-4 sm:p-5 rounded-2xl border transition-all ${
            isDark 
              ? 'border-amber-500/25 bg-amber-500/[0.04]' 
              : 'border-amber-200 bg-amber-50/70 shadow-xs'
          }`}
          role="region"
          aria-label="Nepal AI Cyber Security and CIB Warning Advisory"
        >
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className={`p-2.5 rounded-xl shrink-0 ${
                isDark ? 'bg-amber-500/15 text-amber-400' : 'bg-amber-100 text-amber-800'
              }`}>
                <ShieldAlert className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-[11px] font-bold font-mono uppercase px-2 py-0.5 rounded-full border ${
                    isDark 
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' 
                      : 'bg-amber-100 text-amber-900 border-amber-300'
                  }`}>
                    {language === 'ne' ? 'नेपाल साइबर सुरक्षा सतर्कता' : 'Smart Cyber Security Reminder'}
                  </span>
                  <span className={`text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    {language === 'ne' ? 'नेपाल प्रहरी साइबर ब्युरो (CIB) निर्देशिका' : 'Nepal Police Cyber Bureau (CIB) Guidelines'}
                  </span>
                </div>
                <h3 className={`text-sm sm:text-base font-bold font-display ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {language === 'ne'
                    ? 'अनधिकृत एप्लिकेसन डाउनलोड नगर्नुहोस् र रिमोट पहुँच कहिल्यै नदिनुहोस्'
                    : 'Never Download Unverified Third-Party Apps or Grant Remote Access'}
                </h3>
                <p className={`text-xs sm:text-[13px] leading-relaxed max-w-4xl ${
                  isDark ? 'text-slate-300' : 'text-slate-700'
                }`}>
                  {language === 'ne'
                    ? 'nepalai.tech को डिरेक्टरी पूर्णतया सुरक्षित र केवल आधिकारिक वेबसाइटहरूमा लिङ्क गरिएको छ। अनधिकृत तेस्रो-पक्ष APK, क्र्याक फाइल वा शंकास्पद "एआई ट्रेडिङ बट/नेप्से क्लोन" (जस्तै नेपाल प्रहरी साइबर ब्युरो CIB द्वारा प्रतिबन्धित नक्कली नेप्से एआई जस्ता ठगीहरू) बाट सावधान रहनुहोस्। कसैलाई पनि AnyDesk, TeamViewer वा बैंकिङ OTP नदिनुहोस्।'
                    : 'While the informational directory at nepalai.tech is 100% verified and links strictly to official portals, always practice fundamental cyber hygiene: never download unverified third-party apps, cracked APKs, or grant remote access (AnyDesk/TeamViewer) to your device. Be vigilant against malicious scams such as the fake Nepse AI clone recently flagged and penalized by the Nepal Police Cyber Bureau (CIB).'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap md:flex-col items-start md:items-end gap-2 shrink-0 text-xs font-mono">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border text-[11px] font-semibold ${
                isDark 
                  ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300' 
                  : 'border-cyan-200 bg-cyan-50 text-cyan-900'
              }`}>
                <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" aria-hidden="true" />
                <span>100% Official Links Only</span>
              </span>
              <span className={`inline-flex items-center gap-1 text-[11px] ${
                isDark ? 'text-slate-400' : 'text-slate-600'
              }`}>
                <Lock className="h-3 w-3 text-amber-500" aria-hidden="true" />
                <span>Zero Malware / No APKs</span>
              </span>
            </div>
          </div>
        </div>

        {/* Tooltip Overlay Indicator & Live Sync Trigger */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" aria-hidden="true" />
            <span className={`font-medium ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
              {language === 'ne' 
                ? 'विस्तृत विवरण र भुक्तानी गाइड हेर्न कुनै पनि टुलमा क्लिक गर्नुहोस्' 
                : 'Click the info icon on any tool card for bilingual details'}
            </span>
          </span>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleRefreshDirectory}
              disabled={isFetchingData || isHydrating}
              aria-label={language === 'ne' ? 'टुल्स डाटा पुनः सिंक गर्नुहोस्' : 'Sync directory data'}
              className={`inline-flex items-center justify-center gap-1.5 min-h-[40px] px-3.5 py-2 rounded-xl border text-xs font-mono font-semibold transition-colors cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-cyan-500 ${
                isDark
                  ? 'border-slate-700 bg-white/[0.06] text-slate-100 hover:border-cyan-400'
                  : 'border-slate-300 bg-white text-slate-800 hover:border-cyan-600'
              }`}
              title={language === 'ne' ? 'टुल्स डाटा पुनः लोड गर्नुहोस्' : 'Refresh tools directory'}
            >
              <RefreshCw
                className={`h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400 shrink-0 ${
                  isFetchingData || isHydrating ? 'animate-spin' : ''
                }`}
                aria-hidden="true"
              />
              <span>
                {isFetchingData || isHydrating
                  ? language === 'ne'
                    ? 'अपडेट हुँदैछ...'
                    : 'Updating...'
                  : language === 'ne'
                  ? 'रिफ्रेस'
                  : 'Refresh'}
              </span>
            </button>

            <span className={`hidden sm:inline font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
              {filteredTools.length} {t.tools.toolsFound}
            </span>
          </div>
        </div>

        {/* Content-Aware Skeleton State during Data Fetch & Hydration */}
        <AnimatePresence mode="wait">
          {isFetchingData || isHydrating ? (
            <div key="directory-skeleton" className="mt-4">
              <BentoGridSkeleton theme={theme} type="tools" count={6} />
            </div>
          ) : (
            /* Modular Responsive Grid: Clean 1-col on mobile, 2-col on sm/tablet, 3-col on lg/desktop */
            <motion.div
              key="directory-content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5"
            >
              {filteredTools.map((tool, idx) => {
                const isSelected = selectedStack.includes(tool.id);
                const npr = Math.round(tool.monthlyPriceUsd * exchangeRate);
                const isTooltipActive = hoveredTool?.id === tool.id || pinnedToolId === tool.id;
                const supportsQuickPay = Boolean(
                  tool.supportsQuickPay ||
                  tool.nepalPaymentStatus === 'esewa-khalti' ||
                  tool.paymentDetails.toLowerCase().includes('esewa') ||
                  tool.paymentDetails.toLowerCase().includes('khalti')
                );

                const adoption = tool.localAdoptionPercent || 85;
                const isHighValue = adoption >= 90;

                return (
                  <motion.article
                    key={tool.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.35, delay: (idx % 6) * 0.04 }}
                onMouseEnter={(e) => handleMouseEnterTool(tool, e)}
                onMouseLeave={handleMouseLeaveTool}
                className={`group relative flex flex-col justify-between rounded-2xl border p-5 transition-colors duration-200 focus-within:ring-2 focus-within:ring-cyan-500 cursor-default ${
                  isSelected
                    ? isDark
                      ? 'border-cyan-400 bg-[#0d182d] ring-1 ring-cyan-400/40'
                      : 'border-cyan-600 bg-cyan-50/70 shadow-sm'
                    : isDark
                    ? 'border-slate-700/80 bg-[#0c1324] hover:border-cyan-400/80'
                    : 'border-slate-200 bg-white hover:border-cyan-600 hover:shadow-md'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-2.5 gap-2">
                    <span className={`font-semibold px-2.5 py-0.5 rounded-md text-xs ${
                      isDark ? 'bg-white/[0.08] text-slate-200' : 'bg-slate-100 text-slate-800'
                    }`}>
                      {tool.category}
                    </span>

                    <div className="flex items-center gap-2">
                      {tool.worksInNepal === 'direct' ? (
                        <span className="flex items-center gap-1 text-cyan-700 dark:text-cyan-300 font-semibold text-xs">
                          <CheckCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                          <span>{t.tools.worksDirectly}</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold text-xs">
                          <AlertTriangle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                          <span>{t.tools.needsVpn}</span>
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTogglePinTooltip(tool);
                        }}
                        aria-label={`View bilingual description and specs for ${tool.name}`}
                        title="Click to toggle specs tooltip"
                        className={`min-w-[38px] min-h-[38px] flex items-center justify-center -mr-1 rounded-xl transition-colors cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-cyan-500 ${
                          isTooltipActive
                            ? 'bg-cyan-600 text-white'
                            : isDark
                            ? 'text-slate-300 hover:text-white hover:bg-white/[0.08]'
                            : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
                        }`}
                      >
                        <Info className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-start justify-between gap-2">
                    <h3 className={`text-base font-bold leading-snug group-hover:text-cyan-700 dark:group-hover:text-cyan-300 transition-colors ${isDark ? 'text-white' : 'text-slate-950'}`}>
                      {tool.name}
                    </h3>
                    {supportsQuickPay && (
                      <span
                        id={`quick-pay-badge-${tool.id}`}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold border shrink-0 ${
                          isDark
                            ? 'bg-cyan-950/70 border-cyan-500/40 text-cyan-300'
                            : 'bg-cyan-50 border-cyan-300 text-cyan-900'
                        }`}
                      >
                        {tool.quickPayProvider || 'eSewa / Khalti'}
                      </span>
                    )}
                  </div>

                  <p className={`text-sm mt-1.5 line-clamp-2 leading-relaxed ${
                    isDark ? 'text-slate-200' : 'text-slate-700'
                  }`}>
                    {language === 'ne' && tool.descriptionNe ? tool.descriptionNe : tool.description}
                  </p>

                  {/* Standout Capability Line */}
                  <div className={`mt-2.5 flex items-center gap-1.5 text-xs font-semibold ${
                    isDark ? 'text-cyan-300' : 'text-cyan-800'
                  }`}>
                    <Zap className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    <span className="truncate">{tool.keyCapability}</span>
                  </div>

                  {/* Clean Compact Cost & Adoption Summary */}
                  <div className={`mt-3.5 rounded-xl border p-3 space-y-2 text-xs ${
                    isDark ? 'bg-black/40 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="flex items-center justify-between font-semibold">
                      <span className={isDark ? 'text-slate-200' : 'text-slate-800'}>
                        {language === 'ne' ? 'लागत / भुक्तानी:' : 'Price & Payment:'}
                      </span>
                      <span className={`font-bold tabular-nums font-mono ${isDark ? 'text-cyan-300' : 'text-cyan-800'}`}>
                        {tool.monthlyPriceUsd > 0 ? `$${tool.monthlyPriceUsd}/mo (~NPR ${npr.toLocaleString()})` : 'Free Tier'}
                      </span>
                    </div>
                    <p className={`text-xs leading-snug ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                      {tool.paymentDetails}
                    </p>
                    <div className={`flex items-center justify-between pt-1.5 border-t ${isDark ? 'border-slate-800 text-slate-200' : 'border-slate-200 text-slate-700'}`}>
                      <span className="flex items-center gap-1 font-medium">
                        <TrendingUp className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" aria-hidden="true" />
                        <span>{language === 'ne' ? 'नेपाल प्रयोग:' : 'Nepal Adoption:'}</span>
                      </span>
                      <span className="font-bold font-mono text-cyan-700 dark:text-cyan-300">{adoption}%</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Card Actions with clear touch targets */}
                <div className="mt-4 pt-3 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-2">
                  <a
                    href={tool.officialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Visit official website for ${tool.name} (opens in new tab)`}
                    className={`min-h-[44px] px-3 py-2 text-xs font-semibold flex items-center justify-center gap-1.5 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-cyan-500 rounded-xl transition-colors cursor-pointer ${
                      isDark ? 'text-slate-200 hover:text-white' : 'text-slate-800 hover:text-slate-950'
                    }`}
                  >
                    <span>{t.tools.visitOfficial}</span>
                    <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  </a>

                  <button
                    type="button"
                    onClick={() => onToggleStack(tool.id)}
                    aria-label={isSelected ? `Remove ${tool.name} from stack` : `Add ${tool.name} to stack`}
                    aria-pressed={isSelected}
                    className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-cyan-500 cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-r from-cyan-600 via-sky-600 to-blue-600 text-white font-bold shadow-xs border-transparent'
                        : isDark
                        ? 'bg-white/[0.08] text-slate-100 hover:bg-cyan-500/20 hover:text-cyan-200 border border-slate-700'
                        : 'bg-slate-100 text-slate-900 hover:bg-slate-200 border border-slate-300'
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <Check className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        <span className={language === 'ne' ? "font-['Noto_Sans_Devanagari']" : ''}>
                          {t.tools.inStack}
                        </span>
                      </>
                    ) : (
                      <>
                        <Plus className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        <span className={language === 'ne' ? "font-['Noto_Sans_Devanagari']" : ''}>
                          {t.tools.addToStack}
                        </span>
                      </>
                    )}
                  </button>
                </div>

                {/* Minimalist Apple-Style Hover Tooltip Component */}
                <AppleTooltip
                  isVisible={isTooltipActive}
                  theme={theme}
                  language={language}
                  toolName={tool.name}
                  category={tool.category}
                  descriptionEn={tool.description}
                  descriptionNe={tool.descriptionNe}
                  supportsQuickPay={supportsQuickPay}
                  quickPayProvider={tool.quickPayProvider || 'eSewa & Khalti'}
                  worksInNepal={tool.worksInNepal}
                  priceLabel={tool.monthlyPriceUsd > 0 ? `$${tool.monthlyPriceUsd}/mo (~NPR ${npr.toLocaleString()})` : 'Free Tier'}
                  isPinned={pinnedToolId === tool.id}
                  onClose={() => {
                    setPinnedToolId(null);
                    setHoveredTool(null);
                  }}
                />
              </motion.article>
            );
          })}
        </motion.div>
      )}
    </AnimatePresence>

      </div>
    </section>
  );
};
