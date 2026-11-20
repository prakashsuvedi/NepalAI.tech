import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Download } from 'lucide-react';
import { Language, ThemeMode } from '../../types';
import { TrendVelocityPoint } from '../../utils/trendsEngine';
import { exportTrendsChartPdfReport } from '../../utils/trendsPdfReport';
import { useToast } from '../../context/ToastContext';

export interface SnapshotBarItem {
  slug: string;
  keyword: string;
  velocityScore: number;
  trafficBand: string;
  rank: number;
  categoryLabel: string;
}

type DatedVelocityPoint = TrendVelocityPoint & { dateObj: Date };

interface TrendsD3VelocityChartProps {
  theme: ThemeMode;
  language: Language;
  variant?: 'timeseries' | 'snapshot';
  title: string;
  subtitle?: string;
  primaryLabel: string;
  primaryPoints?: TrendVelocityPoint[];
  secondaryLabel?: string;
  secondaryPoints?: TrendVelocityPoint[];
  snapshotItems?: SnapshotBarItem[];
  onSelectTrendSlug?: (slug: string) => void;
  height?: number;
}

function formatTooltipDate(raw: string): string {
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return raw;
  return parsed.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: raw.includes('T') ? 'numeric' : undefined,
    minute: raw.includes('T') ? '2-digit' : undefined,
  });
}

function formatDeltaLabel(delta: number): string {
  if (!delta) return '0 (Steady)';
  return delta > 0 ? `+${delta.toLocaleString()}` : delta.toLocaleString();
}

export const TrendsD3VelocityChart: React.FC<TrendsD3VelocityChartProps> = ({
  theme,
  language,
  variant = 'timeseries',
  title,
  subtitle,
  primaryLabel,
  primaryPoints = [],
  secondaryLabel,
  secondaryPoints = [],
  snapshotItems = [],
  onSelectTrendSlug,
  height = 248,
}) => {
  const isDark = theme === 'dark';
  const isNe = language === 'ne';
  const { showToast } = useToast();

  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const [chartWidth, setChartWidth] = useState<number>(640);
  const [exportingPdf, setExportingPdf] = useState<boolean>(false);

  const normalizedPrimary = useMemo<DatedVelocityPoint[]>(
    () =>
      primaryPoints
        .map((pt) => ({
          ...pt,
          dateObj: new Date(pt.timestamp),
        }))
        .filter((pt) => !Number.isNaN(pt.dateObj.getTime()))
        .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime()),
    [primaryPoints]
  );

  const normalizedSecondary = useMemo<DatedVelocityPoint[]>(
    () =>
      secondaryPoints
        .map((pt) => ({
          ...pt,
          dateObj: new Date(pt.timestamp),
        }))
        .filter((pt) => !Number.isNaN(pt.dateObj.getTime()))
        .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime()),
    [secondaryPoints]
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateWidth = () => {
      const next = Math.max(300, Math.floor(el.clientWidth));
      setChartWidth(next);
    };

    updateWidth();
    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(updateWidth);
      ro.observe(el);
      return () => ro.disconnect();
    }
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  useEffect(() => {
    const svgEl = svgRef.current;
    const tooltipEl = tooltipRef.current;
    if (!svgEl) return;

    const svg = d3.select(svgEl);
    svg.selectAll('*').remove();

    const axisText = isDark ? '#94a3b8' : '#475569';
    const gridStroke = isDark ? 'rgba(148, 163, 184, 0.14)' : 'rgba(15, 23, 42, 0.08)';
    const primaryStroke = isDark ? '#22d3ee' : '#0891b2';
    const primaryFillTop = isDark ? 'rgba(34, 211, 238, 0.28)' : 'rgba(8, 145, 178, 0.22)';
    const primaryFillBottom = isDark ? 'rgba(34, 211, 238, 0.01)' : 'rgba(8, 145, 178, 0.01)';
    const secondaryStroke = isDark ? '#fbbf24' : '#d97706';

    const hideTooltip = () => {
      if (tooltipEl) {
        tooltipEl.classList.add('opacity-0', 'pointer-events-none');
      }
    };

    const showTooltipAt = (xPx: number, yPx: number, htmlContent: string) => {
      if (!tooltipEl || !containerRef.current) return;
      tooltipEl.innerHTML = htmlContent;
      tooltipEl.classList.remove('opacity-0', 'pointer-events-none');

      const boxWidth = containerRef.current.clientWidth || chartWidth;
      const tipWidth = tooltipEl.offsetWidth || 210;
      const tipHeight = tooltipEl.offsetHeight || 96;
      const clampedX = Math.min(Math.max(8, xPx + 14), Math.max(8, boxWidth - tipWidth - 8));
      const clampedY = Math.max(8, Math.min(yPx - tipHeight / 2, height - tipHeight - 8));
      tooltipEl.style.transform = `translate3d(${Math.round(clampedX)}px, ${Math.round(clampedY)}px, 0)`;
    };

    // =========================================================================
    // MODE A: SNAPSHOT BAR CHART (Keyword Velocity Snapshot across Top Topics)
    // =========================================================================
    if (variant === 'snapshot') {
      const items = snapshotItems.slice(0, 8);
      if (items.length === 0) return;

      const margin = { top: 14, right: 24, bottom: 28, left: Math.min(185, Math.max(120, Math.round(chartWidth * 0.3))) };
      const innerWidth = Math.max(120, chartWidth - margin.left - margin.right);
      const innerHeight = Math.max(120, height - margin.top - margin.bottom);

      const g = svg
        .attr('viewBox', `0 0 ${chartWidth} ${height}`)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      const yScale = d3
        .scaleBand<string>()
        .domain(items.map((d) => d.slug))
        .range([0, innerHeight])
        .padding(0.28);

      const xScale = d3
        .scaleLinear()
        .domain([0, 100])
        .range([0, innerWidth]);

      // Vertical gridlines
      const xAxisGrid = d3
        .axisBottom(xScale)
        .ticks(5)
        .tickSize(-innerHeight)
        .tickFormat(() => '');

      g.append('g')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(xAxisGrid)
        .call((axis) => axis.select('.domain').remove())
        .call((axis) => axis.selectAll('.tick line').attr('stroke', gridStroke).attr('stroke-dasharray', '3,3'));

      // X Axis
      g.append('g')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(d3.axisBottom(xScale).ticks(5).tickFormat((d) => `${d}`))
        .call((axis) => axis.select('.domain').attr('stroke', gridStroke))
        .call((axis) => axis.selectAll('text').attr('fill', axisText).attr('font-size', '11px').attr('font-family', 'JetBrains Mono, monospace'));

      // Y Axis with truncated keyword labels
      const labelBySlug = new Map(items.map((it) => [it.slug, `#${it.rank} ${it.keyword}`]));
      g.append('g')
        .call(
          d3.axisLeft(yScale).tickSize(0).tickFormat((slug) => {
            const raw = labelBySlug.get(slug) || slug;
            return raw.length > 22 ? `${raw.slice(0, 21)}…` : raw;
          })
        )
        .call((axis) => axis.select('.domain').remove())
        .call((axis) =>
          axis
            .selectAll('text')
            .attr('fill', isDark ? '#e2e8f0' : '#0f172a')
            .attr('font-size', '11px')
            .attr('font-weight', '600')
            .attr('dx', '-6')
        );

      // Bars
      const bars = g
        .selectAll('rect.velocity-bar')
        .data(items)
        .enter()
        .append('rect')
        .attr('class', 'velocity-bar')
        .attr('x', 0)
        .attr('y', (d) => yScale(d.slug) ?? 0)
        .attr('height', yScale.bandwidth())
        .attr('width', (d) => Math.max(4, xScale(d.velocityScore)))
        .attr('rx', 5)
        .attr('fill', (d, idx) => (idx === 0 ? primaryStroke : isDark ? 'rgba(34, 211, 238, 0.62)' : 'rgba(8, 145, 178, 0.72)'))
        .style('cursor', onSelectTrendSlug ? 'pointer' : 'default');

      // Inline value labels at bar end
      g.selectAll('text.velocity-val')
        .data(items)
        .enter()
        .append('text')
        .attr('class', 'velocity-val')
        .attr('x', (d) => Math.min(innerWidth - 4, xScale(d.velocityScore) + 6))
        .attr('y', (d) => (yScale(d.slug) ?? 0) + yScale.bandwidth() / 2 + 4)
        .attr('fill', axisText)
        .attr('font-size', '10.5px')
        .attr('font-family', 'JetBrains Mono, monospace')
        .text((d) => `${d.velocityScore}`);

      bars
        .on('mouseenter pointermove', function (event, d) {
          d3.select(this).attr('fill', isDark ? '#67e8f9' : '#0e7490');
          const [mx, my] = d3.pointer(event, svgEl);
          showTooltipAt(
            mx,
            my,
            `<div class="text-[11px] font-mono font-semibold text-cyan-500">#${d.rank} · ${d.categoryLabel}</div>
             <div class="text-xs font-bold mt-0.5 leading-snug">${d.keyword.replace(/</g, '&lt;')}</div>
             <div class="mt-2 pt-1.5 border-t border-slate-200/20 grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] font-mono tabular-nums">
               <span class="opacity-75">Velocity Index</span><span class="font-bold text-right">${d.velocityScore}/100</span>
               <span class="opacity-75">Approx. Search</span><span class="font-bold text-right">${d.trafficBand}</span>
             </div>`
          );
        })
        .on('mouseleave', function (_event, d) {
          const idx = items.indexOf(d);
          d3.select(this).attr('fill', idx === 0 ? primaryStroke : isDark ? 'rgba(34, 211, 238, 0.62)' : 'rgba(8, 145, 178, 0.72)');
          hideTooltip();
        })
        .on('click', (_event, d) => {
          if (onSelectTrendSlug) onSelectTrendSlug(d.slug);
        });

      return;
    }

    // =========================================================================
    // MODE B: TIME-SERIES VELOCITY / INTEREST CHART + BISECTOR TOOLTIP
    // =========================================================================
    const allPts = [...normalizedPrimary, ...normalizedSecondary];
    if (allPts.length === 0) return;

    const margin = { top: 18, right: 20, bottom: 30, left: 40 };
    const innerWidth = Math.max(160, chartWidth - margin.left - margin.right);
    const innerHeight = Math.max(120, height - margin.top - margin.bottom);

    const g = svg
      .attr('viewBox', `0 0 ${chartWidth} ${height}`)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const defs = svg.append('defs');
    const gradId = `velocity-area-${Math.random().toString(36).slice(2, 8)}`;
    const gradient = defs
      .append('linearGradient')
      .attr('id', gradId)
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');
    gradient.append('stop').attr('offset', '0%').attr('stop-color', primaryFillTop);
    gradient.append('stop').attr('offset', '100%').attr('stop-color', primaryFillBottom);

    const timeExtent = d3.extent(allPts, (d) => d.dateObj) as [Date, Date];
    let minTime = timeExtent[0].getTime();
    let maxTime = timeExtent[1].getTime();
    if (minTime === maxTime) {
      // Pad single-snapshot window symmetrically (+/- 12h) without fabricating points
      minTime -= 12 * 60 * 60 * 1000;
      maxTime += 12 * 60 * 60 * 1000;
    }

    const xScale = d3.scaleTime().domain([new Date(minTime), new Date(maxTime)]).range([0, innerWidth]);
    const yScale = d3.scaleLinear().domain([0, 100]).range([innerHeight, 0]);

    // Horizontal gridlines
    g.append('g')
      .call(d3.axisLeft(yScale).ticks(4).tickSize(-innerWidth).tickFormat(() => ''))
      .call((axis) => axis.select('.domain').remove())
      .call((axis) => axis.selectAll('.tick line').attr('stroke', gridStroke).attr('stroke-dasharray', '3,3'));

    // Y Axis
    g.append('g')
      .call(d3.axisLeft(yScale).ticks(4))
      .call((axis) => axis.select('.domain').remove())
      .call((axis) =>
        axis
          .selectAll('text')
          .attr('fill', axisText)
          .attr('font-size', '11px')
          .attr('font-family', 'JetBrains Mono, monospace')
      );

    // X Axis
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).ticks(chartWidth < 460 ? 3 : 5))
      .call((axis) => axis.select('.domain').attr('stroke', gridStroke))
      .call((axis) =>
        axis
          .selectAll('text')
          .attr('fill', axisText)
          .attr('font-size', '10.5px')
          .attr('font-family', 'JetBrains Mono, monospace')
      );

    // Primary area & line
    if (normalizedPrimary.length > 1) {
      const areaGen = d3
        .area<(typeof normalizedPrimary)[number]>()
        .x((d) => xScale(d.dateObj))
        .y0(innerHeight)
        .y1((d) => yScale(d.velocityScore))
        .curve(d3.curveMonotoneX);

      const lineGen = d3
        .line<(typeof normalizedPrimary)[number]>()
        .x((d) => xScale(d.dateObj))
        .y((d) => yScale(d.velocityScore))
        .curve(d3.curveMonotoneX);

      g.append('path').datum(normalizedPrimary).attr('fill', `url(#${gradId})`).attr('d', areaGen);
      g.append('path')
        .datum(normalizedPrimary)
        .attr('fill', 'none')
        .attr('stroke', primaryStroke)
        .attr('stroke-width', 2.5)
        .attr('d', lineGen);
    } else if (normalizedPrimary.length === 1) {
      // Single authentic snapshot recorded: draw honest dashed baseline at exact score
      const singleY = yScale(normalizedPrimary[0].velocityScore);
      g.append('line')
        .attr('x1', 0)
        .attr('x2', innerWidth)
        .attr('y1', singleY)
        .attr('y2', singleY)
        .attr('stroke', primaryStroke)
        .attr('stroke-width', 1.5)
        .attr('stroke-dasharray', '4,4')
        .attr('opacity', 0.6);
    }

    // Secondary Compare Curve (Compare A vs B)
    if (normalizedSecondary.length > 1) {
      const secLine = d3
        .line<(typeof normalizedSecondary)[number]>()
        .x((d) => xScale(d.dateObj))
        .y((d) => yScale(d.velocityScore))
        .curve(d3.curveMonotoneX);

      g.append('path')
        .datum(normalizedSecondary)
        .attr('fill', 'none')
        .attr('stroke', secondaryStroke)
        .attr('stroke-width', 2.25)
        .attr('stroke-dasharray', '5,3')
        .attr('d', secLine);
    }

    // Data point dots
    g.selectAll('circle.primary-dot')
      .data<DatedVelocityPoint>(normalizedPrimary)
      .enter()
      .append('circle')
      .attr('class', 'primary-dot')
      .attr('cx', (d: DatedVelocityPoint) => xScale(d.dateObj))
      .attr('cy', (d: DatedVelocityPoint) => yScale(d.velocityScore))
      .attr('r', normalizedPrimary.length === 1 ? 5.5 : 3.5)
      .attr('fill', primaryStroke)
      .attr('stroke', isDark ? '#0b1220' : '#ffffff')
      .attr('stroke-width', 1.5);

    if (normalizedSecondary.length > 0) {
      g.selectAll('circle.secondary-dot')
        .data<DatedVelocityPoint>(normalizedSecondary)
        .enter()
        .append('circle')
        .attr('class', 'secondary-dot')
        .attr('cx', (d: DatedVelocityPoint) => xScale(d.dateObj))
        .attr('cy', (d: DatedVelocityPoint) => yScale(d.velocityScore))
        .attr('r', normalizedSecondary.length === 1 ? 5 : 3.5)
        .attr('fill', secondaryStroke)
        .attr('stroke', isDark ? '#0b1220' : '#ffffff')
        .attr('stroke-width', 1.5);
    }

    // Interactive Crosshair & Hover Overlay
    const focusGroup = g.append('g').style('display', 'none');
    const crosshair = focusGroup
      .append('line')
      .attr('y1', 0)
      .attr('y2', innerHeight)
      .attr('stroke', isDark ? '#94a3b8' : '#64748b')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '3,3');

    const activeDotA = focusGroup
      .append('circle')
      .attr('r', 6)
      .attr('fill', primaryStroke)
      .attr('stroke', isDark ? '#0b1220' : '#ffffff')
      .attr('stroke-width', 2);

    const activeDotB = focusGroup
      .append('circle')
      .attr('r', 5.5)
      .attr('fill', secondaryStroke)
      .attr('stroke', isDark ? '#0b1220' : '#ffffff')
      .attr('stroke-width', 2)
      .style('display', 'none');

    const bisectDate = d3.bisector<DatedVelocityPoint, Date>((d) => d.dateObj).left;

    const findNearest = (arr: DatedVelocityPoint[], targetDate: Date): DatedVelocityPoint | null => {
      if (arr.length === 0) return null;
      if (arr.length === 1) return arr[0];
      const idx = bisectDate(arr, targetDate, 1);
      const d0 = arr[idx - 1];
      const d1 = arr[idx];
      if (!d1) return d0;
      return targetDate.getTime() - d0.dateObj.getTime() > d1.dateObj.getTime() - targetDate.getTime() ? d1 : d0;
    };

    g.append('rect')
      .attr('width', innerWidth)
      .attr('height', innerHeight)
      .attr('fill', 'transparent')
      .style('cursor', 'crosshair')
      .on('mouseenter', () => {
        focusGroup.style('display', null);
      })
      .on('mouseleave', () => {
        focusGroup.style('display', 'none');
        hideTooltip();
      })
      .on('pointermove mousemove touchmove', (event) => {
        const [gx, gy] = d3.pointer(event);
        const hoveredDate = xScale.invert(Math.max(0, Math.min(innerWidth, gx)));
        const ptA = findNearest(normalizedPrimary, hoveredDate);
        if (!ptA) return;

        const ptB = normalizedSecondary.length > 0 ? findNearest(normalizedSecondary, hoveredDate) : null;
        const cx = xScale(ptA.dateObj);
        const cy = yScale(ptA.velocityScore);

        focusGroup.style('display', null);
        crosshair.attr('x1', cx).attr('x2', cx);
        activeDotA.attr('cx', cx).attr('cy', cy);

        if (ptB) {
          activeDotB.style('display', null).attr('cx', xScale(ptB.dateObj)).attr('cy', yScale(ptB.velocityScore));
        } else {
          activeDotB.style('display', 'none');
        }

        const safeLabelA = primaryLabel.replace(/</g, '&lt;');
        const safeLabelB = (secondaryLabel || 'Comparison').replace(/</g, '&lt;');
        const rankRow = ptA.rankPosition
          ? `<span class="opacity-75">Rank Position</span><span class="font-bold text-right">#${ptA.rankPosition}</span>`
          : '';
        const bandRow =
          ptA.trafficFloor > 0
            ? `<span class="opacity-75">Search Band</span><span class="font-bold text-right">${ptA.trafficBand}</span>`
            : '';
        const compareBlock = ptB
          ? `<div class="mt-1.5 pt-1.5 border-t border-slate-200/20 flex items-center justify-between gap-3 text-[11px] font-mono">
               <span class="text-amber-500 font-semibold truncate max-w-[120px]">${safeLabelB}</span>
               <span class="font-bold">${ptB.velocityScore}/100</span>
             </div>`
          : '';

        showTooltipAt(
          margin.left + cx,
          margin.top + Math.min(cy, gy),
          `<div class="text-[11px] font-mono text-cyan-500 font-semibold">${formatTooltipDate(ptA.timestamp)}</div>
           <div class="text-xs font-bold mt-0.5 truncate max-w-[200px]">${safeLabelA}</div>
           <div class="mt-1.5 grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] font-mono tabular-nums">
             <span class="opacity-75">Keyword Velocity</span><span class="font-bold text-right">${ptA.velocityScore}/100</span>
             <span class="opacity-75">Velocity Delta</span><span class="font-bold text-right">${formatDeltaLabel(ptA.velocityDelta)}</span>
             ${bandRow}
             ${rankRow}
           </div>
           ${compareBlock}`
        );
      });
  }, [
    chartWidth,
    height,
    isDark,
    normalizedPrimary,
    normalizedSecondary,
    onSelectTrendSlug,
    primaryLabel,
    secondaryLabel,
    snapshotItems,
    variant,
  ]);

  const hasData = variant === 'snapshot' ? snapshotItems.length > 0 : normalizedPrimary.length > 0;

  const handleDownloadReport = async () => {
    if (!hasData) return;
    setExportingPdf(true);
    try {
      await exportTrendsChartPdfReport({
        title,
        subtitle,
        variant: variant === 'snapshot' ? 'snapshot' : 'timeseries',
        primaryLabel,
        primaryPoints,
        secondaryLabel,
        secondaryPoints,
        snapshotItems,
        svgElement: svgRef.current,
        isDark,
      });
      showToast(
        isNe ? 'PDF रिपोर्ट डाउनलोड भयो।' : 'PDF trend report downloaded.',
        'success'
      );
    } catch (err: any) {
      showToast(err?.message || 'Unable to generate PDF report.', 'error');
    } finally {
      setExportingPdf(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className={`text-sm sm:text-base font-bold ${isDark ? 'text-white' : 'text-slate-950'}`}>
            {title}
          </h3>
          {subtitle && (
            <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Clean Chart Legend */}
          {variant === 'timeseries' && hasData && (
            <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
              <span className="inline-flex items-center gap-1.5">
                <span className={`w-2.5 h-2.5 rounded-full ${isDark ? 'bg-cyan-400' : 'bg-cyan-600'}`} />
                <span className={isDark ? 'text-slate-200' : 'text-slate-800'}>{primaryLabel}</span>
              </span>
              {secondaryLabel && normalizedSecondary.length > 0 && (
                <span className="inline-flex items-center gap-1.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${isDark ? 'bg-amber-400' : 'bg-amber-600'}`} />
                  <span className={isDark ? 'text-slate-200' : 'text-slate-800'}>{secondaryLabel}</span>
                </span>
              )}
            </div>
          )}

          {hasData && (
            <button
              type="button"
              onClick={handleDownloadReport}
              disabled={exportingPdf}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                isDark
                  ? 'border-slate-700 bg-[#080d1a] text-cyan-300 hover:border-cyan-400'
                  : 'border-slate-300 bg-slate-50 text-cyan-800 hover:border-cyan-600'
              }`}
            >
              <Download className="h-3.5 w-3.5" />
              <span>
                {exportingPdf
                  ? isNe
                    ? 'PDF बन्दै...'
                    : 'Exporting...'
                  : isNe
                    ? 'रिपोर्ट डाउनलोड (PDF)'
                    : 'Download Report'}
              </span>
            </button>
          )}
        </div>
      </div>

      {!hasData ? (
        <div
          className={`rounded-xl border p-6 text-xs text-center ${
            isDark ? 'border-slate-800 bg-[#080d1a] text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-600'
          }`}
        >
          {isNe
            ? 'डाटा पोइन्टहरू संकलन हुँदैछन् — प्रत्येक २० मिनेटमा नयाँ गति रेकर्ड थपिन्छन्।'
            : 'Initial velocity baseline recorded. Additional timestamped points accumulate automatically every 20 minutes.'}
        </div>
      ) : (
        <div ref={containerRef} className="relative w-full select-none">
          <svg
            ref={svgRef}
            className="w-full overflow-visible block"
            role="img"
            aria-label={title}
          />
          <div
            ref={tooltipRef}
            className={`opacity-0 pointer-events-none absolute top-0 left-0 z-20 min-w-[195px] rounded-xl border px-3 py-2.5 shadow-lg transition-opacity duration-100 ${
              isDark
                ? 'bg-[#080d1a]/95 border-slate-700 text-slate-100'
                : 'bg-white/95 border-slate-300 text-slate-900'
            }`}
          />
        </div>
      )}
    </div>
  );
};
