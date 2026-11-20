import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';
import { ArrowUpRight, RefreshCw } from 'lucide-react';
import { Language, ThemeMode } from '../../types';
import { SEASONAL_PILLARS } from '../../utils/trendsEngine';

export interface SeasonalMapBenchmarkItem {
  id: string;
  keyword: string;
  pillar: string;
  bsMonthLabel: string;
  peakMonths: number[];
  monthlyIndex: number[];
  currentInterestScore: number;
  direction: 'rising' | 'pre-peak' | 'peak' | 'steady';
  romanizedNepali: string;
  devanagariVariant: string;
  linkedToolTab?: string | null;
  insightNote: string;
  dataSource: string;
}

interface SeasonalNepalTrendsMapProps {
  theme: ThemeMode;
  language: Language;
  benchmarks: SeasonalMapBenchmarkItem[];
  loading: boolean;
  error: string | null;
  trendsApiConfigured: boolean;
  liveApiEnrichedCount?: number;
  onExploreKeyword: (keyword: string) => void;
  onRefreshMap: () => void;
  onResetFilters: () => void;
}

const MONTHS_META = [
  { idx: 0, en: 'Jan', bs: 'Magh', seasonTag: 'Lok Sewa Peak' },
  { idx: 1, en: 'Feb', bs: 'Falgun', seasonTag: 'Holi Prep' },
  { idx: 2, en: 'Mar', bs: 'Chaitra', seasonTag: 'Spring Trek' },
  { idx: 3, en: 'Apr', bs: 'Baisakh', seasonTag: 'New Year · EBC' },
  { idx: 4, en: 'May', bs: 'Jestha', seasonTag: 'Trek Peak' },
  { idx: 5, en: 'Jun', bs: 'Ashad', seasonTag: 'SEE Results' },
  { idx: 6, en: 'Jul', bs: 'Shrawan', seasonTag: 'NEB +2' },
  { idx: 7, en: 'Aug', bs: 'Bhadra', seasonTag: 'Teej · IELTS' },
  { idx: 8, en: 'Sep', bs: 'Ashwin', seasonTag: 'Dashain Ramp' },
  { idx: 9, en: 'Oct', bs: 'Kartik', seasonTag: 'Dashain/Tihar · Trek' },
  { idx: 10, en: 'Nov', bs: 'Mangsir', seasonTag: '11.11 · Trek' },
  { idx: 11, en: 'Dec', bs: 'Poush', seasonTag: 'Winter Exams' },
];

export const SeasonalNepalTrendsMap: React.FC<SeasonalNepalTrendsMapProps> = ({
  theme,
  language,
  benchmarks,
  loading,
  error,
  trendsApiConfigured,
  liveApiEnrichedCount = 0,
  onExploreKeyword,
  onRefreshMap,
  onResetFilters,
}) => {
  const isDark = theme === 'dark';
  const isNe = language === 'ne';

  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  const [containerWidth, setContainerWidth] = useState<number>(820);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const currentMonthIdx = useMemo(() => new Date().getUTCMonth(), []);

  const selectedBenchmark = useMemo(
    () => benchmarks.find((b) => b.id === selectedId) || benchmarks[0] || null,
    [benchmarks, selectedId]
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => {
      setContainerWidth(Math.max(540, Math.floor(el.clientWidth)));
    };
    measure();
    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(measure);
      ro.observe(el);
      return () => ro.disconnect();
    }
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const rowHeight = 36;
  const margin = {
    top: 56,
    right: 18,
    bottom: 22,
    left: Math.min(250, Math.max(175, Math.round(containerWidth * 0.28))),
  };
  const svgHeight = margin.top + Math.max(1, benchmarks.length) * rowHeight + margin.bottom;

  useEffect(() => {
    const svgEl = svgRef.current;
    const tooltipEl = tooltipRef.current;
    if (!svgEl || loading || benchmarks.length === 0) return;

    const svg = d3.select(svgEl);
    svg.selectAll('*').remove();

    const innerWidth = Math.max(320, containerWidth - margin.left - margin.right);
    const innerHeight = benchmarks.length * rowHeight;

    const g = svg
      .attr('viewBox', `0 0 ${containerWidth} ${svgHeight}`)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const xScale = d3
      .scaleBand<string>()
      .domain(MONTHS_META.map((m) => m.en))
      .range([0, innerWidth])
      .padding(0.08);

    const yScale = d3
      .scaleBand<string>()
      .domain(benchmarks.map((b) => b.id))
      .range([0, innerHeight])
      .padding(0.14);

    // Calibrated intensity ramp preserving WCAG contrast in both dark and light modes
    const colorScale = d3
      .scaleThreshold<number, string>()
      .domain([25, 45, 65, 80])
      .range(
        isDark
          ? ['#0f172a', '#164e63', '#0e7490', '#06b6d4', '#f59e0b']
          : ['#f1f5f9', '#cffafe', '#67e8f9', '#0891b2', '#d97706']
      );

    const textColorOnCell = (score: number) => {
      if (isDark) {
        return score >= 65 ? '#080d1a' : '#e2e8f0';
      }
      return score >= 65 ? '#ffffff' : '#0f172a';
    };

    const axisText = isDark ? '#cbd5e1' : '#334155';
    const subAxisText = isDark ? '#94a3b8' : '#64748b';
    const cellBorder = isDark ? 'rgba(148, 163, 184, 0.14)' : 'rgba(15, 23, 42, 0.08)';

    // Seasonal Event Window Bands above X-axis (Trekking / Exams / Dashain-Tihar)
    const seasonalBands = [
      { label: 'Spring Trek', startEn: 'Mar', endEn: 'May', color: isDark ? '#10b981' : '#059669' },
      { label: 'SEE / NEB Exams', startEn: 'Jun', endEn: 'Aug', color: isDark ? '#38bdf8' : '#0284c7' },
      { label: 'Dashain / Tihar · Autumn Trek', startEn: 'Sep', endEn: 'Nov', color: isDark ? '#f59e0b' : '#d97706' },
    ];

    seasonalBands.forEach((band) => {
      const x1 = xScale(band.startEn) ?? 0;
      const x2 = (xScale(band.endEn) ?? 0) + xScale.bandwidth();
      g.append('line')
        .attr('x1', x1)
        .attr('x2', x2)
        .attr('y1', -40)
        .attr('y2', -40)
        .attr('stroke', band.color)
        .attr('stroke-width', 2.5)
        .attr('stroke-linecap', 'round');

      g.append('text')
        .attr('x', (x1 + x2) / 2)
        .attr('y', -45)
        .attr('text-anchor', 'middle')
        .attr('fill', band.color)
        .attr('font-size', '10px')
        .attr('font-family', '"JetBrains Mono", monospace')
        .attr('font-weight', 700)
        .text(band.label);
    });

    // Month Headers (Gregorian + Bikram Sambat)
    const monthHeaders = g
      .selectAll('.month-hdr')
      .data(MONTHS_META)
      .enter()
      .append('g')
      .attr('class', 'month-hdr')
      .attr('transform', (m) => `translate(${(xScale(m.en) ?? 0) + xScale.bandwidth() / 2}, -10)`);

    monthHeaders
      .append('text')
      .attr('y', -12)
      .attr('text-anchor', 'middle')
      .attr('fill', (m) => (m.idx === currentMonthIdx ? (isDark ? '#22d3ee' : '#0891b2') : axisText))
      .attr('font-size', '11px')
      .attr('font-family', '"JetBrains Mono", monospace')
      .attr('font-weight', (m) => (m.idx === currentMonthIdx ? 700 : 600))
      .text((m) => m.en);

    monthHeaders
      .append('text')
      .attr('y', 1)
      .attr('text-anchor', 'middle')
      .attr('fill', subAxisText)
      .attr('font-size', '9.5px')
      .attr('font-family', '"Plus Jakarta Sans", sans-serif')
      .text((m) => m.bs);

    // Current Month Column Highlight Frame
    const curMonthEn = MONTHS_META[currentMonthIdx]?.en;
    if (curMonthEn && xScale(curMonthEn) !== undefined) {
      g.append('rect')
        .attr('x', (xScale(curMonthEn) ?? 0) - 2)
        .attr('y', -4)
        .attr('width', xScale.bandwidth() + 4)
        .attr('height', innerHeight + 8)
        .attr('rx', 6)
        .attr('fill', 'none')
        .attr('stroke', isDark ? '#22d3ee' : '#0891b2')
        .attr('stroke-width', 1.5)
        .attr('stroke-dasharray', '4 3');
    }

    // Y-axis Keyword Labels
    const yLabels = g
      .selectAll('.row-label')
      .data<SeasonalMapBenchmarkItem>(benchmarks)
      .enter()
      .append('g')
      .attr('class', 'row-label')
      .attr('transform', (b) => `translate(-10, ${(yScale(b.id) ?? 0) + yScale.bandwidth() / 2})`)
      .style('cursor', 'pointer')
      .on('click', (_evt, b) => {
        setSelectedId(b.id);
      });

    yLabels
      .append('text')
      .attr('text-anchor', 'end')
      .attr('dy', '0.1em')
      .attr('fill', (b) =>
        selectedBenchmark?.id === b.id
          ? isDark
            ? '#22d3ee'
            : '#0891b2'
          : isDark
            ? '#f1f5f9'
            : '#0f172a'
      )
      .attr('font-size', '11.5px')
      .attr('font-weight', (b) => (selectedBenchmark?.id === b.id ? 700 : 600))
      .text((b) => {
        const maxChars = margin.left > 210 ? 28 : 22;
        return b.keyword.length > maxChars ? `${b.keyword.slice(0, maxChars - 1)}…` : b.keyword;
      });

    yLabels
      .append('text')
      .attr('text-anchor', 'end')
      .attr('dy', '1.25em')
      .attr('fill', subAxisText)
      .attr('font-size', '9.5px')
      .attr('font-family', '"JetBrains Mono", monospace')
      .text((b) => b.bsMonthLabel);

    const hideTooltip = () => {
      if (tooltipEl) tooltipEl.classList.add('opacity-0', 'pointer-events-none');
    };

    const showTooltip = (xPx: number, yPx: number, html: string) => {
      if (!tooltipEl || !containerRef.current) return;
      tooltipEl.innerHTML = html;
      tooltipEl.classList.remove('opacity-0', 'pointer-events-none');
      const boxWidth = containerRef.current.clientWidth || containerWidth;
      const tipW = tooltipEl.offsetWidth || 235;
      const tipH = tooltipEl.offsetHeight || 110;
      const left = Math.min(Math.max(8, xPx + 14), Math.max(8, boxWidth - tipW - 8));
      const top = Math.max(8, Math.min(yPx - tipH / 2, svgHeight - tipH - 8));
      tooltipEl.style.transform = `translate3d(${Math.round(left)}px, ${Math.round(top)}px, 0)`;
    };

    // Flatten cells for D3 binding
    interface HeatCell {
      benchmark: SeasonalMapBenchmarkItem;
      month: (typeof MONTHS_META)[number];
      score: number;
      prevScore: number;
      delta: number;
    }

    const cells: HeatCell[] = [];
    for (const b of benchmarks) {
      MONTHS_META.forEach((m) => {
        const score = Math.max(0, Math.min(100, b.monthlyIndex[m.idx] ?? 0));
        const prevScore = Math.max(0, Math.min(100, b.monthlyIndex[(m.idx + 11) % 12] ?? score));
        cells.push({
          benchmark: b,
          month: m,
          score,
          prevScore,
          delta: score - prevScore,
        });
      });
    }

    const cellGroups = g
      .selectAll('.heat-cell')
      .data(cells)
      .enter()
      .append('g')
      .attr('class', 'heat-cell')
      .attr(
        'transform',
        (d) => `translate(${xScale(d.month.en) ?? 0}, ${yScale(d.benchmark.id) ?? 0})`
      )
      .style('cursor', 'pointer');

    cellGroups
      .append('rect')
      .attr('width', xScale.bandwidth())
      .attr('height', yScale.bandwidth())
      .attr('rx', 5)
      .attr('fill', (d) => colorScale(d.score))
      .attr('stroke', (d) =>
        selectedBenchmark?.id === d.benchmark.id
          ? isDark
            ? '#22d3ee'
            : '#0891b2'
          : cellBorder
      )
      .attr('stroke-width', (d) => (selectedBenchmark?.id === d.benchmark.id ? 1.4 : 1))
      .on('mouseenter', (event, d) => {
        const pillarObj = SEASONAL_PILLARS.find((p) => p.slug === d.benchmark.pillar);
        const pillarName = isNe ? pillarObj?.labelNe || d.benchmark.pillar : pillarObj?.labelEn || d.benchmark.pillar;
        const deltaStr = d.delta > 0 ? `+${d.delta}` : `${d.delta}`;
        const sourceName =
          d.benchmark.dataSource === 'google_trends_api'
            ? 'Google Trends API'
            : 'BS Calendar + RSS';

        const [mx, my] = d3.pointer(event, containerRef.current);
        showTooltip(
          mx,
          my,
          `<div style="font-weight:700;font-size:12px;margin-bottom:4px;">${d.benchmark.keyword}</div>
           <div style="font-size:11px;opacity:0.85;margin-bottom:6px;">${d.month.en} (${d.month.bs}) · ${d.month.seasonTag}</div>
           <div style="display:flex;justify-content:space-between;gap:14px;font-size:11px;font-family:monospace;">
             <span>Spike Index:</span><strong>${d.score} / 100</strong>
           </div>
           <div style="display:flex;justify-content:space-between;gap:14px;font-size:11px;font-family:monospace;">
             <span>MoM Change:</span><strong>${deltaStr}</strong>
           </div>
           <div style="margin-top:5px;padding-top:4px;border-top:1px solid rgba(148,163,184,0.25);font-size:10px;opacity:0.8;">
             ${pillarName} · ${sourceName}
           </div>`
        );
      })
      .on('mousemove', (event) => {
        const [mx, my] = d3.pointer(event, containerRef.current);
        if (tooltipEl && !tooltipEl.classList.contains('opacity-0')) {
          showTooltip(mx, my, tooltipEl.innerHTML);
        }
      })
      .on('mouseleave', hideTooltip)
      .on('click', (_evt, d) => {
        setSelectedId(d.benchmark.id);
      });

    // Numeric Spike Indicator inside high-velocity cells (>= 65) or current month
    cellGroups
      .filter((d) => d.score >= 65 || d.month.idx === currentMonthIdx)
      .append('text')
      .attr('x', xScale.bandwidth() / 2)
      .attr('y', yScale.bandwidth() / 2 + 3.5)
      .attr('text-anchor', 'middle')
      .attr('pointer-events', 'none')
      .attr('font-size', '10px')
      .attr('font-family', '"JetBrains Mono", monospace')
      .attr('font-weight', 700)
      .attr('fill', (d) => textColorOnCell(d.score))
      .text((d) => String(d.score));
  }, [benchmarks, containerWidth, svgHeight, isDark, isNe, loading, currentMonthIdx, selectedBenchmark?.id, margin.left]);

  return (
    <div
      className={`rounded-2xl border p-5 sm:p-6 space-y-4 ${
        isDark
          ? 'border-slate-800 bg-[#0b1220] text-slate-100'
          : 'border-slate-200 bg-white text-slate-900 shadow-2xs'
      }`}
    >
      {/* Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="text-xs font-mono font-semibold text-cyan-700 dark:text-cyan-400">
            {trendsApiConfigured && liveApiEnrichedCount > 0
              ? `Google Trends API (${liveApiEnrichedCount} live series) · Bikram Sambat Map`
              : 'D3.js Temporal Spike Matrix · Dashain/Tihar, Exams & Trekking'}
          </div>
          <h2 className={`mt-0.5 text-lg sm:text-xl font-extrabold font-display tracking-tight ${isDark ? 'text-white' : 'text-slate-950'}`}>
            {isNe
              ? 'नेपाल मौसमी ट्रेन्ड्स नक्सा (D3.js वार्षिक स्पाइक म्याट्रिक्स)'
              : 'Seasonal Nepal Trends Map'}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Compact Heatmap Legend */}
          <div className="flex items-center gap-1.5 text-[11px] font-mono tabular-nums text-slate-500 dark:text-slate-400">
            <span>Low</span>
            {(isDark
              ? ['#0f172a', '#164e63', '#0e7490', '#06b6d4', '#f59e0b']
              : ['#f1f5f9', '#cffafe', '#67e8f9', '#0891b2', '#d97706']
            ).map((hex, i) => (
              <span
                key={i}
                className="inline-block w-3.5 h-3.5 rounded-xs border border-slate-300/40 dark:border-slate-700"
                style={{ backgroundColor: hex }}
                title={i === 4 ? 'Peak Window (80–100)' : `Intensity tier ${i + 1}`}
              />
            ))}
            <span>Peak (80+)</span>
          </div>

          <button
            type="button"
            onClick={onRefreshMap}
            disabled={loading}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer whitespace-nowrap shrink-0 ${
              isDark
                ? 'border-slate-700 bg-[#080d1a] text-slate-200 hover:border-cyan-400'
                : 'border-slate-300 bg-slate-50 text-slate-800 hover:border-cyan-600'
            }`}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{isNe ? 'सिङ्क अपडेट' : 'Refresh Map'}</span>
          </button>
        </div>
      </div>

      {/* 4-State Matrix Viewport */}
      {loading ? (
        <div className="space-y-2.5 py-2">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className={`h-8 rounded-lg animate-pulse ${isDark ? 'bg-slate-900' : 'bg-slate-100'}`}
            />
          ))}
        </div>
      ) : error ? (
        <div className="py-8 text-center space-y-3">
          <p className="text-sm text-red-500 font-medium">{error}</p>
          <button
            type="button"
            onClick={onRefreshMap}
            className="px-4 py-2 rounded-xl bg-cyan-600 text-white text-xs font-semibold cursor-pointer"
          >
            Retry Seasonal Map
          </button>
        </div>
      ) : benchmarks.length === 0 ? (
        <div className="py-8 text-center space-y-3">
          <p className="text-sm font-semibold">No seasonal keywords match the active filter.</p>
          <button
            type="button"
            onClick={onResetFilters}
            className="px-4 py-2 rounded-xl bg-cyan-600 text-white text-xs font-semibold cursor-pointer"
          >
            Reset Seasonal Filters
          </button>
        </div>
      ) : (
        <div ref={containerRef} className="relative w-full overflow-x-auto">
          <svg
            ref={svgRef}
            className="w-full min-w-[600px] select-none block"
            height={svgHeight}
            role="img"
            aria-label="Seasonal Nepal Trends Map D3 visualization"
          />

          <div
            ref={tooltipRef}
            className={`opacity-0 pointer-events-none absolute top-0 left-0 z-20 rounded-xl border px-3 py-2.5 shadow-lg transition-opacity duration-150 ${
              isDark
                ? 'border-slate-700 bg-[#080d1a]/95 text-slate-100'
                : 'border-slate-300 bg-white/95 text-slate-900'
            }`}
          />
        </div>
      )}

      {/* Selected Seasonal Track Drilldown Footer */}
      {!loading && selectedBenchmark && (
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="min-w-0 space-y-0.5">
            <div className="text-xs font-bold truncate">
              {selectedBenchmark.keyword}{' '}
              <span className="font-mono font-semibold text-cyan-600 dark:text-cyan-400">
                · {selectedBenchmark.bsMonthLabel} · Now {selectedBenchmark.currentInterestScore}/100
              </span>
            </div>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {selectedBenchmark.insightNote}
            </p>
          </div>

          <button
            type="button"
            onClick={() => onExploreKeyword(selectedBenchmark.keyword)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold whitespace-nowrap shrink-0 cursor-pointer"
          >
            <span>{isNe ? 'Google Trends API मा हेर्नुहोस्' : 'Inspect Live Trends API'}</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
