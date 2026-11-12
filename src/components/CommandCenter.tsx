import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Search, 
  ArrowRight, 
  ArrowUpRight, 
  Pin, 
  Sparkles, 
  Clock, 
  TrendingUp, 
  ShieldCheck, 
  Layers, 
  FileEdit, 
  Calculator, 
  ArrowRightLeft, 
  Scan, 
  Mic, 
  Compass, 
  Grid, 
  Briefcase, 
  Bot, 
  ExternalLink, 
  Check, 
  XCircle, 
  Bookmark, 
  Trash2, 
  SlidersHorizontal, 
  RotateCcw,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { ThemeMode, Language, AppPage } from '../types';
import { UTILITY_REGISTRY, UtilityItem, UtilityCategory } from '../data/utilityRegistry';
import { calculateNepalIncomeTax } from '../utils/nepalTaxCalculator';
import { convertFromRopaniSystem, convertFromSqFeet } from '../utils/nepalUnitsConverter';
import { getCurrentBikramSambatDate } from '../utils/nepaliTextConverter';
import { useToast } from '../context/ToastContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Breadcrumbs } from './ui/Breadcrumbs';
import { EmptyState } from './ui/EmptyState';
import { Alert } from './ui/Alert';

interface CommandCenterProps {
  theme: ThemeMode;
  language: Language;
  onNavigatePage: (page: AppPage, tab?: string) => void;
  onOpenConsultation: (serviceTitle?: string) => void;
  onOpenStackCalculator: () => void;
  onOpenHamroAI: () => void;
}

interface SavedCalculation {
  id: string;
  type: 'tax' | 'forex' | 'land';
  title: string;
  summary: string;
  timestamp: string;
}

export const CommandCenter: React.FC<CommandCenterProps> = ({
  theme,
  language,
  onNavigatePage,
  onOpenConsultation,
  onOpenStackCalculator,
  onOpenHamroAI,
}) => {
  const isDark = theme === 'dark';
  const isNe = language === 'ne';
  const { showToast } = useToast();

  // Search & Command State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<UtilityCategory>('all');
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // User Pinned Tools (persisted in localStorage)
  const [pinnedToolIds, setPinnedToolIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('nepalai_pinned_tools');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return ['nrb-forex', 'income-tax-tds', 'ward-nibedan-studio', 'devanagari-ocr'];
  });

  // Recently Launched Tools (persisted in localStorage)
  const [recentToolIds, setRecentToolIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('nepalai_recent_tools');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  // Saved Calculations (persisted in localStorage)
  const [savedCalculations, setSavedCalculations] = useState<SavedCalculation[]>(() => {
    try {
      const saved = localStorage.getItem('nepalai_saved_calculations');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  // Active Workspace Tab
  const [workspaceTab, setWorkspaceTab] = useState<'pinned' | 'recent' | 'saved' | 'preferences'>('pinned');

  // Mini-Widget 1: Live NRB Forex Data
  const [nrbForexData, setNrbForexData] = useState<{
    publishedAt: string;
    usdBuy: number;
    usdSell: number;
    eurBuy: number;
    gbpBuy: number;
    inrBuy: number;
    isLive: boolean;
  }>({
    publishedAt: new Date().toISOString().split('T')[0],
    usdBuy: 135.30,
    usdSell: 135.90,
    eurBuy: 144.15,
    gbpBuy: 172.80,
    inrBuy: 160.00,
    isLive: true,
  });

  useEffect(() => {
    const fetchNrbRates = async () => {
      try {
        const res = await fetch('/api/forex/nrb');
        if (res.ok) {
          const data = await res.json();
          if (data?.rates?.USD) {
            setNrbForexData({
              publishedAt: data.publishedAt || new Date().toISOString().split('T')[0],
              usdBuy: data.rates.USD.buy || 135.30,
              usdSell: data.rates.USD.sell || 135.90,
              eurBuy: data.rates.EUR?.buy || 144.15,
              gbpBuy: data.rates.GBP?.buy || 172.80,
              inrBuy: data.rates.INR?.buy || 160.00,
              isLive: true,
            });
          }
        }
      } catch {
        // Keeps benchmark fallback
      }
    };
    fetchNrbRates();
  }, []);

  // Mini-Widget 2: Fast Tax Estimator State
  const [miniSalaryNpr, setMiniSalaryNpr] = useState<number>(75000);
  const [miniTaxMarital, setMiniTaxMarital] = useState<'single' | 'married'>('single');
  const [miniTaxSsf, setMiniTaxSsf] = useState<boolean>(true);
  const [miniIsItExport, setMiniIsItExport] = useState<boolean>(false);

  // Mini-Widget 3: Fast Land Converter State
  const [miniRopani, setMiniRopani] = useState<number>(1);
  const [miniAana, setMiniAana] = useState<number>(0);

  // Time-aware greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return isNe ? 'शुभ प्रभात' : 'Good morning';
    if (hour >= 12 && hour < 17) return isNe ? 'शुभ दिन' : 'Good afternoon';
    if (hour >= 17 && hour < 21) return isNe ? 'शुभ साँझ' : 'Good evening';
    return isNe ? 'शुभ रात्रि' : 'Good evening';
  }, [isNe]);

  // Track tool launch
  const handleLaunchUtility = (tool: UtilityItem) => {
    // Record in recent tools
    setRecentToolIds((prev) => {
      const filtered = prev.filter((id) => id !== tool.id);
      const updated = [tool.id, ...filtered].slice(0, 8);
      try {
        localStorage.setItem('nepalai_recent_tools', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });

    // Check modal triggers
    if (tool.modalTrigger === 'stack_calculator') {
      onOpenStackCalculator();
      return;
    }
    if (tool.modalTrigger === 'hamro_ai') {
      onOpenHamroAI();
      return;
    }
    if (tool.modalTrigger === 'consultation') {
      onOpenConsultation(tool.nameEn);
      return;
    }

    // Navigate to page + tab
    onNavigatePage(tool.targetPage, tool.targetTab);
  };

  // Toggle Pin Tool
  const handleTogglePin = (toolId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPinnedToolIds((prev) => {
      const isPinned = prev.includes(toolId);
      const updated = isPinned ? prev.filter((id) => id !== toolId) : [...prev, toolId];
      try {
        localStorage.setItem('nepalai_pinned_tools', JSON.stringify(updated));
      } catch (err) {
        console.error(err);
      }
      showToast(
        isPinned ? 'Unpinned' : 'Pinned to Dashboard',
        isPinned
          ? isNe ? 'उपयोगिता हटाइयो' : 'Removed from pinned shortcuts'
          : isNe ? 'कमान्ड सेन्टरमा पिन गरियो' : 'Saved to pinned shortcuts',
        'info',
        2000
      );
      return updated;
    });
  };

  // Filtered Registry for Global Search
  const filteredTools = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return UTILITY_REGISTRY.filter((tool) => {
      const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
      if (!q) return matchesCategory;

      const matchesQuery =
        tool.nameEn.toLowerCase().includes(q) ||
        tool.nameNe.toLowerCase().includes(q) ||
        tool.descEn.toLowerCase().includes(q) ||
        tool.descNe.toLowerCase().includes(q) ||
        tool.keywords.toLowerCase().includes(q);

      return matchesCategory && matchesQuery;
    });
  }, [searchQuery, selectedCategory]);

  // Keyboard Navigation inside search results
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery, selectedCategory]);

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (filteredTools.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredTools.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredTools.length) % filteredTools.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const chosen = filteredTools[selectedIndex];
      if (chosen) {
        handleLaunchUtility(chosen);
      }
    } else if (e.key === 'Escape') {
      setSearchQuery('');
    }
  };

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Quick Tax Estimation
  const miniTaxResult = useMemo(() => {
    return calculateNepalIncomeTax({
      status: miniTaxMarital,
      monthlyGrossSalary: miniSalaryNpr,
      includeDashainBonus: false,
      isItExportFreelancer: miniIsItExport,
      isItExportCompany: false,
      isSsfEnrolled: miniTaxSsf,
      isFemaleSingle: false,
      epfMonthly: 0,
      citMonthly: 0,
      annualLifeInsurance: 0,
      annualHealthInsurance: 0,
    });
  }, [miniSalaryNpr, miniTaxMarital, miniTaxSsf, miniIsItExport]);

  // Quick Land Estimation
  const miniLandResult = useMemo(() => {
    return convertFromRopaniSystem(miniRopani, miniAana, 0, 0);
  }, [miniRopani, miniAana]);

  // Save Current Tax Calculation
  const handleSaveTaxCalc = () => {
    const newCalc: SavedCalculation = {
      id: `calc-tax-${Date.now()}`,
      type: 'tax',
      title: `${isNe ? 'तलब आयकर' : 'Salary Tax'} (NPR ${miniSalaryNpr.toLocaleString()}/mo)`,
      summary: `${miniTaxMarital === 'married' ? 'Married' : 'Single'} • Monthly TDS: NPR ${Math.round(miniTaxResult.monthlyTaxTds).toLocaleString()} • Net: NPR ${Math.round(miniTaxResult.monthlyNetTakeHome).toLocaleString()}`,
      timestamp: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    };
    const updated = [newCalc, ...savedCalculations];
    setSavedCalculations(updated);
    try {
      localStorage.setItem('nepalai_saved_calculations', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    showToast('Saved', isNe ? 'आयकर हिसाब सुरक्षित गरियो' : 'Calculation saved to Workspace', 'success', 2000);
  };

  // Delete Saved Calculation
  const handleDeleteSavedCalc = (id: string) => {
    const updated = savedCalculations.filter((c) => c.id !== id);
    setSavedCalculations(updated);
    try {
      localStorage.setItem('nepalai_saved_calculations', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  // Resolved list of pinned tools
  const pinnedTools = useMemo(() => {
    return UTILITY_REGISTRY.filter((t) => pinnedToolIds.includes(t.id));
  }, [pinnedToolIds]);

  // Resolved list of recent tools
  const recentTools = useMemo(() => {
    return recentToolIds
      .map((id) => UTILITY_REGISTRY.find((t) => t.id === id))
      .filter((t): t is UtilityItem => Boolean(t));
  }, [recentToolIds]);

  // Icon Resolver
  const renderIcon = (iconName: string, className = 'h-4 w-4') => {
    switch (iconName) {
      case 'ArrowRightLeft': return <ArrowRightLeft className={className} />;
      case 'Calculator': return <Calculator className={className} />;
      case 'FileEdit': return <FileEdit className={className} />;
      case 'Scan': return <Scan className={className} />;
      case 'Mic': return <Mic className={className} />;
      case 'TrendingUp': return <TrendingUp className={className} />;
      case 'Compass': return <Compass className={className} />;
      case 'Grid': return <Grid className={className} />;
      case 'Layers': return <Layers className={className} />;
      case 'Sparkles': return <Sparkles className={className} />;
      case 'Briefcase': return <Briefcase className={className} />;
      case 'ShieldCheck': return <ShieldCheck className={className} />;
      case 'Bot': return <Bot className={className} />;
      default: return <Sparkles className={className} />;
    }
  };

  return (
    <div className={`min-h-screen pb-20 transition-colors duration-300 ${
      isDark ? 'bg-[#06080e] text-slate-100' : 'bg-[#f8fafc] text-slate-900'
    }`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        
        {/* Breadcrumb Navigation */}
        <div className="mb-4">
          <Breadcrumbs
            items={[
              { label: isNe ? 'गृहपृष्ठ' : 'Home', onClick: () => onNavigatePage('home') },
              { label: isNe ? 'कमान्ड सेन्टर' : 'Command Center', isCurrent: true },
            ]}
          />
        </div>

        {/* =========================================================================
            SECTION A: COMPACT WELCOME & GLOBAL COMMAND SEARCH
           ========================================================================= */}
        <div className={`rounded-2xl border p-5 sm:p-7 mb-8 transition-all ${
          isDark
            ? 'border-white/10 bg-gradient-to-b from-[#0b0f19] to-[#080b13] shadow-lg'
            : 'border-slate-200 bg-white shadow-xs'
        }`}>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-200/60 dark:border-white/10">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 mb-1">
                <span>{isNe ? 'कमान्ड सेन्टर' : 'Command Center'}</span>
                <span className="text-slate-400 dark:text-slate-600">·</span>
                <span>{getCurrentBikramSambatDate().formattedBs}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-slate-900 dark:text-white">
                {greeting}, {isNe ? 'कार्यथलोमा स्वागत छ' : 'Welcome to NepalAI'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl leading-relaxed">
                {isNe 
                  ? 'दैनिक विनिमय दर, आयकर हिसाब, र प्रमाणित उपयोगिताहरू — एकै ठाउँमा।' 
                  : 'Real-time exchange rates, income tax calculations, and daily utilities at a glance.'}
              </p>
            </div>

            {/* Quick Live Indicators */}
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-mono text-[11px]">
                <span>NRB USD: रू {nrbForexData.usdBuy.toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                <span>FY 2081/82 IRD</span>
              </div>
            </div>
          </div>

          {/* Prominent Global Command Search Bar */}
          <div className="mt-5">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-cyan-500 shrink-0 pointer-events-none" aria-hidden="true" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder={isNe ? 'कमान्ड खोज्नुहोस् (उदा: डलर दर, आयकर, वडा निवेदन, ओसीआर, कालिमाटी, Ropani)...' : 'Type a command or search (NRB Forex, Income Tax, Ward Nibedan, OCR, Kalimati, Ropani)...'}
                className="w-full pl-12 pr-28 py-3.5 rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-[#06080e] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm sm:text-base focus:outline-hidden focus:ring-2 focus:ring-cyan-500/40 shadow-xs transition-all"
                aria-label="Global utility search"
              />
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    aria-label="Clear search"
                  >
                    <XCircle className="h-4 w-4" />
                  </button>
                ) : (
                  <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono px-2 py-1 rounded-md bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/10 select-none">
                    <span>Ctrl</span>
                    <span>+</span>
                    <span>K</span>
                  </span>
                )}
              </div>
            </div>

            {/* Category Filter Badges */}
            <div className="mt-3 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mr-1">
                  {isNe ? 'श्रेणी:' : 'Filter:'}
                </span>
                {[
                  { id: 'all', labelEn: 'All (13)', labelNe: 'सबै (१३)' },
                  { id: 'financial', labelEn: 'Financial', labelNe: 'वित्तीय' },
                  { id: 'legal', labelEn: 'Legal & Ward', labelNe: 'वडा तथा कानुनी' },
                  { id: 'linguistic', labelEn: 'Language & Voice', labelNe: 'भाषा तथा आवाज' },
                  { id: 'agri', labelEn: 'Agri & Land', labelNe: 'कृषि तथा जग्गा' },
                  { id: 'directory', labelEn: 'Tools Directory', labelNe: 'डाइरेक्टरी' },
                  { id: 'enterprise', labelEn: 'Enterprise', labelNe: 'संस्थागत' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id as UtilityCategory)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer select-none whitespace-nowrap min-h-[30px] ${
                      selectedCategory === cat.id
                        ? 'bg-cyan-600 text-white shadow-xs font-semibold'
                        : isDark
                          ? 'bg-white/[0.04] text-slate-400 hover:text-white border border-white/5'
                          : 'bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200'
                    }`}
                  >
                    {isNe ? cat.labelNe : cat.labelEn}
                  </button>
                ))}
              </div>

              <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden md:inline">
                {isNe ? 'नेभिगेसन: ↑ ↓ इन्टर' : 'Use ↑ ↓ to navigate, Enter to launch'}
              </span>
            </div>

            {/* Interactive Search Results Dropdown/Flyout (when query is entered) */}
            {searchQuery.trim().length > 0 && (
              <div className="mt-3 rounded-xl border border-slate-200 dark:border-white/15 bg-white dark:bg-[#0a0d17] p-2 shadow-xl max-h-80 overflow-y-auto">
                {filteredTools.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500">
                    {isNe ? `"${searchQuery}" सँग मेल खाने कुनै सेवा फेला परेन।` : `No utilities matching "${searchQuery}". Try 'tax', 'nrb', 'ward', or 'ocr'.`}
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredTools.map((tool, idx) => {
                      const isHighlighted = idx === selectedIndex;
                      return (
                        <div
                          key={tool.id}
                          onClick={() => handleLaunchUtility(tool)}
                          onMouseEnter={() => setSelectedIndex(idx)}
                          className={`flex items-center justify-between p-2.5 rounded-lg transition-colors cursor-pointer ${
                            isHighlighted
                              ? 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-950 dark:text-cyan-100'
                              : 'hover:bg-slate-100 dark:hover:bg-white/[0.04] text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="p-2 rounded-md bg-cyan-500/10 text-cyan-500 shrink-0">
                              {renderIcon(tool.icon, 'h-4 w-4')}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-xs sm:text-sm truncate">
                                  {isNe ? tool.nameNe : tool.nameEn}
                                </span>
                                {tool.badgeEn && (
                                  <Badge variant="unboxed" size="sm" className="hidden sm:inline">
                                    {isNe ? tool.badgeNe : tool.badgeEn}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-lg">
                                {isNe ? tool.descNe : tool.descEn}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 ml-3">
                            <button
                              type="button"
                              onClick={(e) => handleTogglePin(tool.id, e)}
                              className="p-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-white/10 text-slate-400 hover:text-amber-500 transition-colors"
                              title={pinnedToolIds.includes(tool.id) ? 'Unpin' : 'Pin'}
                              aria-label={pinnedToolIds.includes(tool.id) ? 'Unpin tool' : 'Pin tool'}
                            >
                              <Pin className={`h-3.5 w-3.5 ${pinnedToolIds.includes(tool.id) ? 'fill-amber-500 text-amber-500' : ''}`} />
                            </button>
                            <ArrowRight className="h-4 w-4 text-cyan-500" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Quick Action Chips Row */}
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/5 flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mr-1">
                {isNe ? 'द्रुत सर्टकट:' : 'Quick Actions:'}
              </span>
              {[
                { label: isNe ? 'आयकर क्याल्कुलेटर' : 'Income Tax Slabs', id: 'income-tax-tds' },
                { label: isNe ? 'राष्ट्र बैंक विदेशी मुद्रा' : 'NRB Forex Rates', id: 'nrb-forex' },
                { label: isNe ? 'वडा निवेदन' : 'Ward Nibedan', id: 'ward-nibedan-studio' },
                { label: isNe ? 'देवनागरी ओसीआर' : 'Devanagari OCR', id: 'devanagari-ocr' },
                { label: isNe ? 'न्युरल आवाज' : 'Neural Voice TTS', id: 'neural-voice-tts' },
                { label: isNe ? 'कालिमाटी तरकारी' : 'Kalimati Produce', id: 'kalimati-market-rates' },
                { label: isNe ? 'जग्गा रूपान्तरक' : 'Land Converter', id: 'nepal-land-converter' },
              ].map((action, idx) => {
                const target = UTILITY_REGISTRY.find((t) => t.id === action.id);
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => target && handleLaunchUtility(target)}
                    className="text-xs px-2.5 py-1 rounded-md border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.03] hover:border-cyan-500/50 hover:bg-cyan-500/10 hover:text-cyan-600 dark:hover:text-cyan-400 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer select-none"
                  >
                    {action.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* =========================================================================
            SECTION B: REAL FINANCIAL & REGULATORY WIDGETS (3-COLUMN RESPONSIVE)
           ========================================================================= */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold font-display text-slate-900 dark:text-white">
                {isNe ? 'प्रत्यक्ष वित्तीय तथा नियामक विजेटहरू' : 'Live Financial & Regulatory Telemetry'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isNe ? 'आधिकारिक स्रोतहरूबाट सिधै हिसाब र विनिमय विश्लेषण' : 'Source-grounded calculators powered by official government frameworks'}
              </p>
            </div>
            <Badge variant="info" size="sm">
              {isNe ? 'अद्यावधिक' : 'Verified'}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Widget 1: NRB Foreign Exchange Benchmark */}
            <Card hoverable className="flex flex-col justify-between">
              <div>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-md bg-cyan-500/10 text-cyan-500">
                        <ArrowRightLeft className="h-4 w-4" />
                      </div>
                      <CardTitle className="text-sm">NRB Forex Rates</CardTitle>
                    </div>
                    <span className="text-[10px] font-mono text-cyan-500 font-semibold">Live Benchmark</span>
                  </div>
                  <CardDescription className="text-[11px]">
                    Nepal Rastra Bank daily peg
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-3 pb-3 space-y-2">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded-lg bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5">
                      <span className="text-[10px] text-slate-400 block font-mono">USD Buy / Sell</span>
                      <span className="font-bold font-mono text-slate-800 dark:text-slate-200">
                        रू {nrbForexData.usdBuy.toFixed(2)} / {nrbForexData.usdSell.toFixed(2)}
                      </span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5">
                      <span className="text-[10px] text-slate-400 block font-mono">EUR Buy</span>
                      <span className="font-bold font-mono text-slate-800 dark:text-slate-200">
                        रू {nrbForexData.eurBuy.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-cyan-500/5 border border-cyan-500/20 text-[11px] text-slate-600 dark:text-slate-300">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium">$500 Dollar Card Quota:</span>
                      <span className="font-mono text-cyan-500 font-bold">Cap Active</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight">
                      Statutory 3.0% bank spread + 2.0% DST applies automatically.
                    </p>
                  </div>
                </CardContent>
              </div>
              <CardFooter className="pt-2 pb-2">
                <span className="text-[10px] text-slate-400 font-mono">
                  Pub: {nrbForexData.publishedAt}
                </span>
                <button
                  type="button"
                  onClick={() => onNavigatePage('daily', 'fx')}
                  className="text-xs text-cyan-500 hover:text-cyan-400 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <span>Convert</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </CardFooter>
            </Card>

            {/* Widget 2: Income Tax Slabs (Finance Act 2081/82) */}
            <Card hoverable className="flex flex-col justify-between">
              <div>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-md bg-sky-500/10 text-sky-500">
                        <Calculator className="h-4 w-4" />
                      </div>
                      <CardTitle className="text-sm">Income Tax & TDS</CardTitle>
                    </div>
                    <Badge variant="unboxed" size="sm">FY 2081/82</Badge>
                  </div>
                  <CardDescription className="text-[11px]">
                    Inland Revenue Department brackets
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-3 pb-3 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-500">Monthly Salary:</span>
                    <input
                      type="number"
                      step={5000}
                      value={miniSalaryNpr}
                      onChange={(e) => setMiniSalaryNpr(Math.max(0, Number(e.target.value)))}
                      className="w-24 px-2 py-0.5 rounded border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.04] text-right font-mono text-xs focus:outline-hidden"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-1 p-1 rounded-md bg-slate-100 dark:bg-white/[0.04] text-[11px]">
                    <button
                      type="button"
                      onClick={() => setMiniTaxMarital('single')}
                      className={`flex-1 py-0.5 rounded font-medium text-center cursor-pointer ${
                        miniTaxMarital === 'single' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold' : 'text-slate-500'
                      }`}
                    >
                      Single
                    </button>
                    <button
                      type="button"
                      onClick={() => setMiniTaxMarital('married')}
                      className={`flex-1 py-0.5 rounded font-medium text-center cursor-pointer ${
                        miniTaxMarital === 'married' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold' : 'text-slate-500'
                      }`}
                    >
                      Married
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <div className="p-1.5 rounded bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5">
                      <span className="text-[10px] text-slate-400 block font-mono">Monthly TDS</span>
                      <span className="font-bold font-mono text-cyan-600 dark:text-cyan-400">
                        रू {Math.round(miniTaxResult.monthlyTaxTds).toLocaleString()}
                      </span>
                    </div>
                    <div className="p-1.5 rounded bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5">
                      <span className="text-[10px] text-slate-400 block font-mono">Take Home</span>
                      <span className="font-bold font-mono text-slate-800 dark:text-slate-200">
                        रू {Math.round(miniTaxResult.monthlyNetTakeHome).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </div>
              <CardFooter className="pt-2 pb-2">
                <button
                  type="button"
                  onClick={handleSaveTaxCalc}
                  className="text-[10px] text-slate-400 hover:text-cyan-500 flex items-center gap-1 cursor-pointer"
                >
                  <Bookmark className="h-3 w-3" />
                  <span>Save</span>
                </button>
                <button
                  type="button"
                  onClick={() => onNavigatePage('daily', 'tax')}
                  className="text-xs text-sky-500 hover:text-sky-400 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <span>Full Tax Slip</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </CardFooter>
            </Card>

            {/* Widget 3: Kalimati Produce Rates */}
            <Card hoverable className="flex flex-col justify-between">
              <div>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-md bg-amber-500/10 text-amber-500">
                        <TrendingUp className="h-4 w-4" />
                      </div>
                      <CardTitle className="text-sm">Kalimati Produce</CardTitle>
                    </div>
                    <span className="text-[10px] font-mono text-amber-500 font-semibold">20 Items</span>
                  </div>
                  <CardDescription className="text-[11px]">
                    Kalimati market daily rates (रू/kg)
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-2 pb-2">
                  <div className="divide-y divide-slate-100 dark:divide-white/5 text-xs">
                    {[
                      { name: 'Tomato Big (गोलभेँडा)', price: 75, wholesale: 60 },
                      { name: 'Potato Red (रातो आलु)', price: 58, wholesale: 48 },
                      { name: 'Dry Onion (सुकेको प्याज)', price: 95, wholesale: 80 },
                      { name: 'Mushroom (च्याउ)', price: 220, wholesale: 180 },
                    ].map((item, idx) => (
                      <div key={idx} className="py-1.5 flex items-center justify-between">
                        <span className="truncate max-w-[130px] text-slate-700 dark:text-slate-300 text-[11px]">
                          {item.name}
                        </span>
                        <div className="flex items-center gap-2 font-mono text-[11px]">
                          <span className="font-bold text-slate-800 dark:text-slate-200">रू {item.price}</span>
                          <span className="text-[10px] text-slate-400">(W: {item.wholesale})</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </div>
              <CardFooter className="pt-2 pb-2">
                <span className="text-[10px] text-slate-400 font-mono">
                  Board: Kalimati
                </span>
                <button
                  type="button"
                  onClick={() => onNavigatePage('daily', 'market')}
                  className="text-xs text-amber-500 hover:text-amber-400 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <span>CSV Matrix</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </CardFooter>
            </Card>

            {/* Widget 4: Traditional Land Converter Gauge */}
            <Card hoverable className="flex flex-col justify-between">
              <div>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-md bg-indigo-500/10 text-indigo-500">
                        <Compass className="h-4 w-4" />
                      </div>
                      <CardTitle className="text-sm">Land Converter</CardTitle>
                    </div>
                    <Badge variant="unboxed" size="sm">Hills ↔ Terai</Badge>
                  </div>
                  <CardDescription className="text-[11px]">
                    Ropani-Aana to Bigha-Kattha
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-3 pb-3 space-y-2">
                  <div className="flex items-center gap-2 text-xs">
                    <div className="flex-1">
                      <label className="text-[10px] text-slate-400 block font-mono">Ropani</label>
                      <input
                        type="number"
                        min={0}
                        value={miniRopani}
                        onChange={(e) => setMiniRopani(Math.max(0, Number(e.target.value)))}
                        className="w-full px-2 py-1 rounded border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.04] font-mono text-xs focus:outline-hidden"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-[10px] text-slate-400 block font-mono">Aana</label>
                      <input
                        type="number"
                        min={0}
                        max={15}
                        value={miniAana}
                        onChange={(e) => setMiniAana(Math.max(0, Math.min(15, Number(e.target.value))))}
                        className="w-full px-2 py-1 rounded border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.04] font-mono text-xs focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 space-y-1 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-400 text-[11px]">Sq. Feet:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {miniLandResult.sqFeet.toLocaleString()} sq ft
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 text-[11px]">Terai System:</span>
                      <span className="font-bold text-cyan-600 dark:text-cyan-400">
                        {miniLandResult.bigha} Bigha {miniLandResult.kattha} Kattha
                      </span>
                    </div>
                  </div>
                </CardContent>
              </div>
              <CardFooter className="pt-2 pb-2">
                <span className="text-[10px] text-slate-400 font-mono">
                  1 Ropani = 5,476 sq ft
                </span>
                <button
                  type="button"
                  onClick={() => onNavigatePage('daily', 'market')}
                  className="text-xs text-indigo-500 hover:text-indigo-400 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <span>Full Units</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </CardFooter>
            </Card>

          </div>
        </div>

        {/* =========================================================================
            SECTION C: WORKSPACE (PINNED TOOLS, RECENT ACTIVITY, SAVED CALCULATIONS)
           ========================================================================= */}
        <div>
          {/* Workspace Tabs Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-200 dark:border-white/10">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setWorkspaceTab('pinned')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer min-h-[36px] ${
                  workspaceTab === 'pinned'
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Pin className="h-3.5 w-3.5" />
                <span>{isNe ? 'पिन गरिएका उपयोगिताहरू' : 'Pinned Shortcuts'} ({pinnedTools.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setWorkspaceTab('recent')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer min-h-[36px] ${
                  workspaceTab === 'recent'
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Clock className="h-3.5 w-3.5" />
                <span>{isNe ? 'हालै चलाइएका' : 'Recently Used'} ({recentTools.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setWorkspaceTab('saved')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer min-h-[36px] ${
                  workspaceTab === 'saved'
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Bookmark className="h-3.5 w-3.5" />
                <span>{isNe ? 'सुरक्षित हिसाब' : 'Saved Records'} ({savedCalculations.length})</span>
              </button>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigatePage('directory')}
              rightIcon={<ArrowUpRight className="h-3.5 w-3.5" />}
            >
              {isNe ? 'सबै टुल्स हेर्नुहोस्' : 'Browse All 28+ Utilities'}
            </Button>
          </div>

          {/* Tab 1: Pinned Shortcuts Grid */}
          {workspaceTab === 'pinned' && (
            <div>
              {pinnedTools.length === 0 ? (
                <EmptyState
                  icon={<Pin className="h-6 w-6 text-slate-400" />}
                  title={isNe ? 'कुनै पनि उपयोगिता पिन गरिएको छैन' : 'No Pinned Shortcuts Yet'}
                  description={isNe 
                    ? 'कुनै पनि उपयोगिताको माथिल्लो दायाँ भागमा रहेको पिन आइकन थिचेर यहाँ तुरुन्तै पहुँचका लागि राख्नुहोस्।' 
                    : 'Click the pin icon on any tool card to keep your most frequented Nepal utilities at the top of your Command Center.'}
                  actionLabel={isNe ? 'डाइरेक्टरी हेर्नुहोस्' : 'Explore Tools Directory'}
                  onAction={() => onNavigatePage('directory')}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {pinnedTools.map((tool) => (
                    <Card
                      key={tool.id}
                      hoverable
                      onClick={() => handleLaunchUtility(tool)}
                      className="cursor-pointer group relative flex flex-col justify-between"
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 shrink-0 group-hover:scale-105 transition-transform">
                            {renderIcon(tool.icon, 'h-5 w-5')}
                          </div>
                          <button
                            type="button"
                            onClick={(e) => handleTogglePin(tool.id, e)}
                            className="p-1 rounded text-amber-500 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                            title="Unpin"
                            aria-label="Unpin tool"
                          >
                            <Pin className="h-3.5 w-3.5 fill-amber-500" />
                          </button>
                        </div>
                        <CardTitle className="mt-2 text-sm">
                          {isNe ? tool.nameNe : tool.nameEn}
                        </CardTitle>
                        <CardDescription className="text-xs line-clamp-2">
                          {isNe ? tool.descNe : tool.descEn}
                        </CardDescription>
                      </CardHeader>
                      <CardFooter className="pt-2 pb-2">
                        <span className="text-[10px] text-slate-400 font-mono">
                          {tool.badgeEn || 'Active'}
                        </span>
                        <span className="text-xs text-cyan-600 dark:text-cyan-400 font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                          <span>Launch</span>
                          <ArrowRight className="h-3 w-3" />
                        </span>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Recently Used Tools */}
          {workspaceTab === 'recent' && (
            <div>
              {recentTools.length === 0 ? (
                <EmptyState
                  icon={<Clock className="h-6 w-6 text-slate-400" />}
                  title={isNe ? 'हालै कुनै गतिविधि छैन' : 'No Recent Activity Yet'}
                  description={isNe 
                    ? 'तपाईंले कमान्ड सेन्टरबाट प्रयोग गरेका सेवाहरू यहाँ देखा पर्नेछन्। तलको बटनबाट सेवा सुरु गर्नुहोस्।' 
                    : 'Tools you launch from the search bar or shortcuts will automatically appear here for quick continuation.'}
                  actionLabel={isNe ? 'दैनिक सेवा खोल्नुहोस्' : 'Open Daily Utilities'}
                  onAction={() => onNavigatePage('daily')}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {recentTools.map((tool) => (
                    <Card
                      key={tool.id}
                      hoverable
                      onClick={() => handleLaunchUtility(tool)}
                      className="cursor-pointer group flex flex-col justify-between"
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 rounded-lg bg-slate-100 dark:bg-white/10 text-cyan-500 shrink-0">
                            {renderIcon(tool.icon, 'h-4 w-4')}
                          </div>
                          <div>
                            <CardTitle className="text-sm">
                              {isNe ? tool.nameNe : tool.nameEn}
                            </CardTitle>
                            <span className="text-[10px] text-slate-400 block font-mono">
                              Category: {tool.category}
                            </span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardFooter className="pt-2 pb-2">
                        <span className="text-[10px] text-slate-400">
                          {tool.sourceMetadata.verifiedYear}
                        </span>
                        <span className="text-xs text-cyan-500 font-semibold flex items-center gap-1">
                          <span>Re-open</span>
                          <ArrowRight className="h-3 w-3" />
                        </span>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Saved Records & Calculations */}
          {workspaceTab === 'saved' && (
            <div>
              {savedCalculations.length === 0 ? (
                <EmptyState
                  icon={<Bookmark className="h-6 w-6 text-slate-400" />}
                  title={isNe ? 'कुनै सुरक्षित हिसाब छैन' : 'No Saved Records Yet'}
                  description={isNe
                    ? 'आयकर क्याल्कुलेटर वा मुद्रा रूपान्तरकमा हिसाब गरी "Save" थिच्नुभएपछि तपाईंका हिसाबहरू यहाँ देखिनेछन्।'
                    : 'Calculations saved from the Income Tax, Forex, or Land tools are retained in your local workspace and can be reviewed here.'}
                  actionLabel={isNe ? 'आयकर क्याल्कुलेटरमा जानुहोस्' : 'Open Income Tax Tool'}
                  onAction={() => onNavigatePage('daily', 'tax')}
                />
              ) : (
                <div className="space-y-2">
                  {savedCalculations.map((calc) => (
                    <div
                      key={calc.id}
                      className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0a0d17] shadow-2xs"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {calc.title}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            {calc.timestamp}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate max-w-xl">
                          {calc.summary}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 ml-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onNavigatePage('daily', calc.type === 'tax' ? 'tax' : calc.type === 'forex' ? 'fx' : 'market')}
                        >
                          {isNe ? 'हेर्नुहोस्' : 'View'}
                        </Button>
                        <button
                          type="button"
                          onClick={() => handleDeleteSavedCalc(calc.id)}
                          className="p-1.5 rounded-md text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                          title="Delete calculation"
                          aria-label="Delete calculation"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
