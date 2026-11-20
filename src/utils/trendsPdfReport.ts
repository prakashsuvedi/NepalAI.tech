import { jsPDF } from 'jspdf';
import { TrendVelocityPoint } from './trendsEngine';
import type { SnapshotBarItem } from '../components/trends/TrendsD3VelocityChart';

export interface TrendsPdfReportInput {
  title: string;
  subtitle?: string;
  variant: 'timeseries' | 'snapshot';
  primaryLabel: string;
  primaryPoints: TrendVelocityPoint[];
  secondaryLabel?: string;
  secondaryPoints?: TrendVelocityPoint[];
  snapshotItems?: SnapshotBarItem[];
  svgElement: SVGSVGElement | null;
  isDark: boolean;
}

function hasNonLatin1(str: string): boolean {
  return /[^\u0020-\u00FF]/.test(str);
}

function renderBannerImage(title: string, subtitle: string): string | null {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = 1400;
  canvas.height = 175;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#06b6d4';
  ctx.fillRect(0, 0, 12, canvas.height);

  ctx.fillStyle = '#22d3ee';
  ctx.font = '700 22px "JetBrains Mono", monospace';
  ctx.fillText('NEPALAI.TECH  ·  NEPAL TRENDS INTELLIGENCE REPORT', 44, 46);

  ctx.fillStyle = '#ffffff';
  ctx.font = '700 36px "Plus Jakarta Sans", "Noto Sans Devanagari", sans-serif';
  const clippedTitle = title.length > 68 ? `${title.slice(0, 67)}…` : title;
  ctx.fillText(clippedTitle, 44, 100);

  ctx.fillStyle = '#cbd5e1';
  ctx.font = '400 22px "Plus Jakarta Sans", "Noto Sans Devanagari", sans-serif';
  const clippedSub = subtitle.length > 96 ? `${subtitle.slice(0, 95)}…` : subtitle;
  ctx.fillText(clippedSub, 44, 144);

  return canvas.toDataURL('image/png');
}

function renderInlineUnicodeTextImage(
  text: string,
  color = '#0f172a',
  fontWeight = '600'
): { dataUrl: string; widthMm: number; heightMm: number } | null {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = 560;
  canvas.height = 44;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = color;
  ctx.font = `${fontWeight} 24px "Plus Jakarta Sans", "Noto Sans Devanagari", sans-serif`;
  const clipped = text.length > 38 ? `${text.slice(0, 37)}…` : text;
  ctx.fillText(clipped, 0, 30);

  return {
    dataUrl: canvas.toDataURL('image/png'),
    widthMm: 54,
    heightMm: 4.3,
  };
}

async function svgToPngDataUrl(
  svgEl: SVGSVGElement,
  isDark: boolean
): Promise<{ dataUrl: string; aspectRatio: number } | null> {
  if (typeof document === 'undefined') return null;

  const viewBox = svgEl.getAttribute('viewBox');
  let width = 680;
  let height = 250;
  if (viewBox) {
    const parts = viewBox.trim().split(/[\s,]+/).map(Number);
    if (parts.length === 4 && parts[2] > 0 && parts[3] > 0) {
      width = parts[2];
      height = parts[3];
    }
  } else {
    const rect = svgEl.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      width = Math.round(rect.width);
      height = Math.round(rect.height);
    }
  }

  const cloned = svgEl.cloneNode(true) as SVGSVGElement;
  cloned.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  cloned.setAttribute('width', String(width));
  cloned.setAttribute('height', String(height));

  // Inject crisp background rect behind the SVG chart so dark/light themes stay legible in print
  const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  bgRect.setAttribute('x', '0');
  bgRect.setAttribute('y', '0');
  bgRect.setAttribute('width', String(width));
  bgRect.setAttribute('height', String(height));
  bgRect.setAttribute('rx', '12');
  bgRect.setAttribute('fill', isDark ? '#0b1220' : '#ffffff');
  cloned.insertBefore(bgRect, cloned.firstChild);

  const svgXml = new XMLSerializer().serializeToString(cloned);
  const svgBlob = new Blob([svgXml], { type: 'image/svg+xml;charset=utf-8' });
  const blobUrl = URL.createObjectURL(svgBlob);

  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = (e) => reject(e);
      image.src = blobUrl;
    });

    const scale = 2;
    const canvas = document.createElement('canvas');
    canvas.width = width * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.scale(scale, scale);
    ctx.drawImage(img, 0, 0, width, height);

    return {
      dataUrl: canvas.toDataURL('image/png'),
      aspectRatio: height / width,
    };
  } finally {
    URL.revokeObjectURL(blobUrl);
  }
}

export async function exportTrendsChartPdfReport(input: TrendsPdfReportInput): Promise<void> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = 210;
  const marginX = 14;
  const contentWidth = pageWidth - marginX * 2;
  let y = 14;

  // 1. Header Banner (canvas-rendered for clean English + Devanagari typography)
  const generatedStamp = new Date().toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
  const bannerSubtitle =
    input.subtitle || `Generated ${generatedStamp} · Relative Velocity & Snapshot Metrics`;
  const bannerPng = renderBannerImage(input.title, bannerSubtitle);
  if (bannerPng) {
    const bannerHeight = 23;
    doc.addImage(bannerPng, 'PNG', marginX, y, contentWidth, bannerHeight);
    y += bannerHeight + 7;
  } else {
    doc.setFontSize(16);
    doc.text(input.title, marginX, y + 6);
    y += 14;
  }

  // 2. Snapshot Summary Metrics Cards
  const isSnapshot = input.variant === 'snapshot' && (input.snapshotItems?.length || 0) > 0;
  const scores = isSnapshot
    ? (input.snapshotItems || []).map((i) => i.velocityScore)
    : input.primaryPoints.map((p) => p.velocityScore);

  const latestVal = scores.length > 0 ? scores[isSnapshot ? 0 : scores.length - 1] : 0;
  const peakVal = scores.length > 0 ? Math.max(...scores) : 0;
  const avgVal = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  const countVal = scores.length;

  const kpis = isSnapshot
    ? [
        { label: 'Top Velocity', value: `${peakVal} / 100` },
        { label: 'Top Topic Band', value: input.snapshotItems?.[0]?.trafficBand || 'N/A' },
        { label: 'Mean Velocity', value: `${avgVal} / 100` },
        { label: 'Topics Tracked', value: String(countVal) },
      ]
    : [
        { label: 'Latest Velocity', value: `${latestVal} / 100` },
        { label: 'Peak Velocity', value: `${peakVal} / 100` },
        { label: 'Average Velocity', value: `${avgVal} / 100` },
        { label: 'Snapshots Recorded', value: String(countVal) },
      ];

  const boxGap = 3;
  const boxWidth = (contentWidth - boxGap * 3) / 4;
  const boxHeight = 16;

  kpis.forEach((kpi, idx) => {
    const bx = marginX + idx * (boxWidth + boxGap);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(bx, y, boxWidth, boxHeight, 2, 2, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text(kpi.label.toUpperCase(), bx + 3, y + 5.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text(kpi.value, bx + 3, y + 12.2);
  });

  y += boxHeight + 7;

  // 3. Rendered D3.js Chart Visualization
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Rendered Trend Velocity Visualization', marginX, y);
  y += 3;

  if (input.svgElement) {
    const renderedChart = await svgToPngDataUrl(input.svgElement, input.isDark);
    if (renderedChart) {
      const imgHeight = Math.min(76, Math.max(46, contentWidth * renderedChart.aspectRatio));
      doc.setDrawColor(203, 213, 225);
      doc.roundedRect(marginX, y, contentWidth, imgHeight + 2, 2, 2, 'S');
      doc.addImage(renderedChart.dataUrl, 'PNG', marginX + 1, y + 1, contentWidth - 2, imgHeight);
      y += imgHeight + 8;
    }
  } else {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text('Chart SVG unavailable for capture.', marginX, y + 6);
    y += 12;
  }

  // 4. Historical Velocity & Metrics Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text(
    isSnapshot ? 'Top Keyword Velocity Snapshot Table' : 'Historical Keyword Velocity Metrics',
    marginX,
    y
  );
  y += 4;

  // Table header
  doc.setFillColor(15, 23, 42);
  doc.rect(marginX, y, contentWidth, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);

  if (isSnapshot) {
    doc.text('RANK', marginX + 3, y + 4.8);
    doc.text('KEYWORD / TOPIC', marginX + 18, y + 4.8);
    doc.text('CATEGORY', marginX + 95, y + 4.8);
    doc.text('SEARCH BAND', marginX + 135, y + 4.8);
    doc.text('VELOCITY', marginX + 162, y + 4.8);
  } else {
    doc.text('TIMESTAMP', marginX + 3, y + 4.8);
    doc.text('SERIES / KEYWORD', marginX + 46, y + 4.8);
    doc.text('VELOCITY', marginX + 105, y + 4.8);
    doc.text('DELTA', marginX + 130, y + 4.8);
    doc.text('BAND / RANK', marginX + 152, y + 4.8);
  }
  y += 7;

  const drawTextCell = (text: string, x: number, rowY: number, color: [number, number, number]) => {
    if (hasNonLatin1(text)) {
      const img = renderInlineUnicodeTextImage(
        text,
        `rgb(${color[0]},${color[1]},${color[2]})`,
        '600'
      );
      if (img) {
        doc.addImage(img.dataUrl, 'PNG', x, rowY + 1.2, img.widthMm, img.heightMm);
        return;
      }
    }
    doc.setTextColor(color[0], color[1], color[2]);
    const clipped = text.length > 34 ? `${text.slice(0, 33)}…` : text;
    doc.text(clipped, x, rowY + 4.6);
  };

  if (isSnapshot) {
    const rows = (input.snapshotItems || []).slice(0, 14);
    rows.forEach((item, idx) => {
      if (y > 272) return;
      doc.setFillColor(idx % 2 === 0 ? 255 : 248, idx % 2 === 0 ? 255 : 250, idx % 2 === 0 ? 255 : 252);
      doc.rect(marginX, y, contentWidth, 6.8, 'F');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(15, 23, 42);
      doc.text(`#${item.rank}`, marginX + 3, y + 4.6);
      drawTextCell(item.keyword, marginX + 18, y, [15, 23, 42]);
      drawTextCell(item.categoryLabel, marginX + 95, y, [71, 85, 105]);
      doc.setTextColor(15, 23, 42);
      doc.text(item.trafficBand, marginX + 135, y + 4.6);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(8, 145, 178);
      doc.text(`${item.velocityScore} / 100`, marginX + 162, y + 4.6);
      y += 6.8;
    });
  } else {
    const combinedRows: Array<{ point: TrendVelocityPoint; seriesName: string }> = [
      ...input.primaryPoints.map((p) => ({ point: p, seriesName: input.primaryLabel })),
      ...(input.secondaryPoints || []).map((p) => ({
        point: p,
        seriesName: input.secondaryLabel || 'Comparison',
      })),
    ].slice(0, 16);

    combinedRows.forEach(({ point, seriesName }, idx) => {
      if (y > 272) return;
      doc.setFillColor(idx % 2 === 0 ? 255 : 248, idx % 2 === 0 ? 255 : 250, idx % 2 === 0 ? 255 : 252);
      doc.rect(marginX, y, contentWidth, 6.8, 'F');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.8);

      const d = new Date(point.timestamp);
      const formattedTime = Number.isNaN(d.getTime())
        ? point.timestamp
        : d.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: point.timestamp.includes('T') ? 'numeric' : undefined,
            minute: point.timestamp.includes('T') ? '2-digit' : undefined,
          });

      doc.setTextColor(71, 85, 105);
      doc.text(formattedTime, marginX + 3, y + 4.6);
      drawTextCell(seriesName, marginX + 46, y, [15, 23, 42]);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(8, 145, 178);
      doc.text(`${point.velocityScore} / 100`, marginX + 105, y + 4.6);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(15, 23, 42);
      const deltaStr = point.velocityDelta > 0 ? `+${point.velocityDelta}` : String(point.velocityDelta);
      doc.text(deltaStr, marginX + 130, y + 4.6);

      const bandRank = point.rankPosition ? `${point.trafficBand} (#${point.rankPosition})` : point.trafficBand;
      doc.text(bandRank, marginX + 152, y + 4.6);
      y += 6.8;
    });
  }

  // Footer
  doc.setDrawColor(226, 232, 240);
  doc.line(marginX, 282, pageWidth - marginX, 282);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(
    `NepalAI Trends Portal (nepalai.tech) · Generated ${generatedStamp}`,
    marginX,
    287
  );
  doc.text('Relative Velocity Intelligence Report', pageWidth - marginX, 287, { align: 'right' });

  const safeSlug = input.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48) || 'nepal-trends-report';
  doc.save(`${safeSlug}-${new Date().toISOString().slice(0, 10)}.pdf`);
}
