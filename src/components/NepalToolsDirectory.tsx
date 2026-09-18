import React, { useState, useRef } from 'react';
import { NEPAL_AI_TOOLS } from '../data/nepalTools';
import { ToolCategory, ThemeMode, Language, NepalAITool } from '../types';
import { Search, CheckCircle, AlertTriangle, ExternalLink, Plus, Check, Layers, Info, Sparkles, Zap, ShieldCheck, X } from 'lucide-react';
import { TRANSLATIONS } from '../data/translations';

interface NepalToolsDirectoryProps {
  theme?: ThemeMode;
  language?: Language;
  selectedStack: string[];
  onToggleStack: (toolId: string) => void;
  onOpenStackCalculator: () => void;
}

const CATEGORIES: ToolCategory[] = [
  'All',
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
}) => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<ToolCategory>('All');
  const [filterType, setFilterType] = useState<'all' | 'esewa' | 'dollar' | 'free'>('all');
  const [hoveredTool, setHoveredTool] = useState<NepalAITool | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number; alignRight?: boolean } | null>(null);
  const [pinnedToolId, setPinnedToolId] = useState<string | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
        ? item.nepalPaymentStatus === 'esewa-khalti'
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
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-500/20">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-xs text-emerald-500 mb-2">
              <span className="font-['Noto_Sans_Devanagari'] font-medium">
                {language === 'ne' ? 'स्थानीय पहुँच तथा भुक्तानी' : 'Verified Nepal Ecosystem'}
              </span>
              <span className={isDark ? 'text-slate-600' : 'text-slate-300'} aria-hidden="true">•</span>
              <span className={`font-mono uppercase tracking-wider text-[11px] ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}>
                {t.tools.badge}
              </span>
            </div>
            <h2
              id="tools-directory-heading"
              className={`text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight font-['Space_Grotesk'] ${
                isDark ? 'text-white' : 'text-slate-950'
              }`}
            >
              <span className={`block font-['Noto_Sans_Devanagari'] text-xl sm:text-2xl mb-1 ${
                isDark ? 'text-slate-200' : 'text-slate-800'
              }`}>
                {language === 'ne' ? 'नेपालमा चल्ने एआई टुल्स र भुक्तानी गाइड' : 'Connectivity & Payment Directory'}
              </span>
              <span>{t.tools.title}</span>
            </h2>
            <p className={`mt-2 text-xs sm:text-sm font-['Noto_Sans_Devanagari'] leading-relaxed ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            }`}>
              {t.tools.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onOpenStackCalculator}
              aria-label={`Open AI Stack Calculator with ${selectedStack.length} tools selected`}
              className={`px-4 py-2 rounded-xl border text-xs font-semibold transition-colors flex items-center gap-2 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                isDark
                  ? 'bg-white/[0.04] border-white/10 text-emerald-300 hover:text-white hover:border-emerald-500/50'
                  : 'bg-white border-slate-300 text-emerald-700 hover:text-emerald-900 shadow-sm'
              }`}
            >
              <Layers className="h-4 w-4 text-emerald-500" aria-hidden="true" />
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
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
            <input
              id="tools-search-input"
              type="text"
              aria-label={t.tools.searchPlaceholder}
              placeholder={t.tools.searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full rounded-xl border pl-9 pr-3.5 py-2 text-xs focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 transition-colors ${
                isDark
                  ? 'border-white/10 bg-black/40 text-white placeholder-slate-500 focus:border-white/30'
                  : 'border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:border-slate-500 shadow-xs'
              }`}
            />
          </div>

          {/* Quick Payment Filter */}
          <div
            className="flex flex-wrap items-center gap-1.5 text-xs"
            role="group"
            aria-label="Payment method filter"
          >
            <span className={`text-[11px] mr-1 font-mono ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
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
                className={`px-3 py-1.5 rounded-lg transition-colors text-xs focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                  filterType === f.id
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                    : isDark
                    ? 'bg-white/[0.02] border border-white/[0.06] text-slate-400 hover:text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-950 shadow-xs'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

        </div>

        {/* Categories */}
        <div
          className="mt-4 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs"
          role="group"
          aria-label="Tool categories filter"
        >
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={category === c}
              onClick={() => setCategory(c)}
              className={`px-3 py-1 rounded-full whitespace-nowrap transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                category === c
                  ? isDark
                    ? 'bg-white/10 text-emerald-400 border border-emerald-500/40'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-300 font-semibold'
                  : isDark
                  ? 'bg-black/20 text-slate-400 hover:text-slate-200'
                  : 'bg-white text-slate-600 border border-slate-200 hover:text-slate-900'
              }`}
            >
              {c === 'All' ? t.tools.allCategories : c}
            </button>
          ))}
        </div>

        {/* Hover Tooltip Overlay Indicator */}
        <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <span className="flex items-center gap-1.5">
            <Sparkles className="h-3 w-3 text-emerald-400 animate-pulse" aria-hidden="true" />
            <span>{language === 'ne' ? 'टुल्सको विस्तृत विवरण हेर्न माउस होभर वा ट्याप गर्नुहोस्' : 'Hover or tap on any tool card or info icon for instant capabilities tooltip'}</span>
          </span>
          <span className="hidden sm:inline">
            {filteredTools.length} {t.tools.toolsFound}
          </span>
        </div>

        {/* Modular Grid: Clean 3-Column Bento Cards with Tooltip Overlays */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTools.map((tool) => {
            const isSelected = selectedStack.includes(tool.id);
            const npr = Math.round(tool.monthlyPriceUsd * exchangeRate);
            const isTooltipActive = hoveredTool?.id === tool.id || pinnedToolId === tool.id;

            return (
              <article
                key={tool.id}
                onMouseEnter={(e) => handleMouseEnterTool(tool, e)}
                onMouseLeave={handleMouseLeaveTool}
                className={`group relative flex flex-col justify-between rounded-2xl border p-5 transition-all duration-200 focus-within:ring-2 focus-within:ring-emerald-500 ${
                  isSelected
                    ? isDark
                      ? 'border-emerald-500/40 bg-emerald-950/10'
                      : 'border-emerald-400 bg-emerald-50/40'
                    : isDark
                    ? 'border-white/[0.08] bg-white/[0.015] hover:border-emerald-500/40 hover:bg-white/[0.03]'
                    : 'border-slate-200 bg-white hover:border-emerald-400 hover:shadow-md'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] mb-2.5">
                    <span className={`font-mono px-2 py-0.5 rounded-md ${
                      isDark ? 'bg-white/[0.05] text-slate-300' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {tool.category}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {tool.worksInNepal === 'direct' ? (
                        <span className="flex items-center gap-1 text-emerald-500 font-medium text-[11px]">
                          <CheckCircle className="h-3 w-3" aria-hidden="true" />
                          <span>{t.tools.worksDirectly}</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-amber-500 font-medium text-[11px]">
                          <AlertTriangle className="h-3 w-3" aria-hidden="true" />
                          <span>{t.tools.needsVpn}</span>
                        </span>
                      )}

                      {/* Tooltip trigger button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTogglePinTooltip(tool);
                        }}
                        aria-label={`View detailed specs for ${tool.name}`}
                        title="Click to toggle specs overlay"
                        className={`p-1 rounded-md transition-colors ${
                          isTooltipActive
                            ? 'bg-emerald-500 text-slate-950'
                            : isDark
                            ? 'text-slate-400 hover:text-white hover:bg-white/[0.08]'
                            : 'text-slate-400 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                      >
                        <Info className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-start justify-between gap-2">
                    <h3 className={`text-sm font-bold leading-snug ${isDark ? 'text-white' : 'text-slate-950'}`}>
                      {tool.name}
                    </h3>
                    {tool.popularityInNepal === 'Essential' && (
                      <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-sm bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        Essential
                      </span>
                    )}
                  </div>

                  <p className={`text-xs mt-1.5 line-clamp-2 leading-relaxed ${
                    isDark ? 'text-slate-400' : 'text-slate-600'
                  }`}>
                    {tool.description}
                  </p>

                  {/* Standout Capability Pill */}
                  <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-emerald-500/90 font-mono">
                    <Zap className="h-3 w-3 shrink-0" aria-hidden="true" />
                    <span className="truncate">{tool.keyCapability}</span>
                  </div>

                  {/* Payment Details Box */}
                  <div className={`mt-3 rounded-xl border p-2.5 text-[11px] ${
                    isDark ? 'bg-black/40 border-white/[0.06]' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="flex items-center justify-between font-semibold">
                      <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>
                        {language === 'ne' ? 'भुक्तानी विधि:' : 'Payment Method:'}
                      </span>
                      <span className="text-emerald-500 font-mono">
                        {tool.monthlyPriceUsd > 0 ? `$${tool.monthlyPriceUsd}/mo (~NPR ${npr.toLocaleString()})` : 'Free Tier'}
                      </span>
                    </div>
                    <p className={`text-[11px] mt-0.5 leading-snug ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {tool.paymentDetails}
                    </p>
                  </div>
                </div>

                {/* Bottom Card Actions */}
                <div className="mt-4 pt-3 border-t border-slate-500/15 flex items-center justify-between">
                  <a
                    href={tool.officialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Visit official website for ${tool.name} (opens in new tab)`}
                    className={`text-[11px] flex items-center gap-1 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 rounded px-1.5 py-1 ${
                      isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    <span>{t.tools.visitOfficial}</span>
                    <ExternalLink className="h-3 w-3" aria-hidden="true" />
                  </a>

                  <button
                    type="button"
                    onClick={() => onToggleStack(tool.id)}
                    aria-label={isSelected ? `Remove ${tool.name} from stack` : `Add ${tool.name} to stack`}
                    aria-pressed={isSelected}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                      isSelected
                        ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                        : isDark
                        ? 'bg-white/[0.04] text-slate-300 hover:bg-white/[0.08] hover:text-white border border-white/10'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-950 border border-slate-200'
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <Check className="h-3 w-3" aria-hidden="true" />
                        <span className={language === 'ne' ? "font-['Noto_Sans_Devanagari']" : ''}>
                          {t.tools.inStack}
                        </span>
                      </>
                    ) : (
                      <>
                        <Plus className="h-3 w-3" aria-hidden="true" />
                        <span className={language === 'ne' ? "font-['Noto_Sans_Devanagari']" : ''}>
                          {t.tools.addToStack}
                        </span>
                      </>
                    )}
                  </button>
                </div>

                {/* INLINE TOOLTIP OVERLAY on Hover / Tap */}
                {isTooltipActive && (
                  <div
                    role="tooltip"
                    id={`tooltip-${tool.id}`}
                    className={`absolute inset-0 z-20 rounded-2xl p-4 flex flex-col justify-between backdrop-blur-md transition-all animate-in fade-in duration-200 ${
                      isDark
                        ? 'bg-[#080d16]/95 border-2 border-emerald-500/60 shadow-2xl shadow-black/80'
                        : 'bg-white/95 border-2 border-emerald-500 shadow-2xl shadow-slate-300'
                    }`}
                  >
                    <div>
                      {/* Tooltip Header */}
                      <div className="flex items-center justify-between pb-2 border-b border-slate-500/20">
                        <div className="flex items-center gap-1.5">
                          <ShieldCheck className="h-4 w-4 text-emerald-400" aria-hidden="true" />
                          <span className="font-bold text-xs text-emerald-400 uppercase tracking-wider">
                            NepalAI Verified Spec
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPinnedToolId(null);
                            setHoveredTool(null);
                          }}
                          className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10"
                          aria-label="Close tooltip overlay"
                        >
                          <X className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                      </div>

                      {/* Tool Title & Summary */}
                      <h4 className={`text-sm font-bold mt-2.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {tool.name}
                      </h4>
                      <p className={`text-xs mt-1 leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        {tool.description}
                      </p>

                      {/* Deep Capability Breakdown */}
                      <div className="mt-2.5 space-y-1.5 text-xs">
                        <div className={`p-2 rounded-lg ${isDark ? 'bg-white/[0.04]' : 'bg-slate-100'}`}>
                          <span className="font-mono text-[10px] text-emerald-400 block uppercase font-bold">
                            Standout Capability:
                          </span>
                          <span className={`text-[11px] leading-tight ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                            {tool.keyCapability}
                          </span>
                        </div>

                        <div className={`p-2 rounded-lg flex items-center justify-between ${isDark ? 'bg-white/[0.04]' : 'bg-slate-100'}`}>
                          <span className="font-mono text-[10px] text-slate-400 uppercase">
                            Nepal IP Connectivity:
                          </span>
                          <span className={`text-[11px] font-bold ${tool.worksInNepal === 'direct' ? 'text-emerald-400' : 'text-amber-400'}`}>
                            {tool.worksInNepal === 'direct' ? '✓ Direct (No VPN)' : '⚠ VPN Recommended'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Tooltip Actions */}
                    <div className="pt-2.5 border-t border-slate-500/20 flex items-center justify-between gap-2">
                      <a
                        href={tool.officialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
                      >
                        <span>Open Website</span>
                        <ExternalLink className="h-3 w-3" aria-hidden="true" />
                      </a>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleStack(tool.id);
                        }}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                          isSelected
                            ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30'
                            : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                        }`}
                      >
                        {isSelected ? 'Remove from Stack' : '+ Add to AI Stack'}
                      </button>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>

      </div>
    </section>
  );
};
