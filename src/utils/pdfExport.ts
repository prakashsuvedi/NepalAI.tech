/**
 * pdfExport.ts
 *
 * Branded bilingual (English + Devanagari) A4 Print / Save-as-PDF engine.
 * Renders crisp white printable HTML documents inside an isolated hidden iframe
 * (avoiding window.open popups and dark-theme UI chrome leaks).
 */

import { getCurrentBikramSambatDate } from './nepaliTextConverter';
import { TaxCalculationResult } from './nepalTaxCalculator';
import { JewelryCalculationResult, BullionType } from './nepalBullionCalculator';
import { NepseTradeResult } from './nepseCalculator';
import { EvTaxResult } from './nepalEvCalculator';
import { calculateIrdTax, numberToEnglishWords, numberToNepaliWords } from './nepalInvoiceEngine';

function escapeHtml(value: string | number | undefined | null): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export interface BrandedPdfOptions {
  documentTitle: string;
  headerTitleEn: string;
  headerTitleNe: string;
  badgeText: string;
  referenceNo?: string;
  metadataRows?: Array<{ label: string; value: string }>;
  bodyHtml: string;
  footerNote?: string;
  includeSignatureBlock?: boolean;
}

/**
 * Core hidden-iframe A4 print/Save-as-PDF dispatcher.
 */
export function exportBrandedPdfDocument(options: BrandedPdfOptions): void {
  const bsDate = getCurrentBikramSambatDate();
  const adDate = new Date().toISOString().split('T')[0];
  const refNo = options.referenceNo || `NEP-${Date.now().toString().slice(-6)}`;

  const metadataHtml =
    options.metadataRows && options.metadataRows.length > 0
      ? `<div class="meta-grid">
          ${options.metadataRows
            .map(
              (m) => `
            <div class="meta-item">
              <span class="meta-label">${escapeHtml(m.label)}</span>
              <span class="meta-value">${escapeHtml(m.value)}</span>
            </div>`
            )
            .join('')}
        </div>`
      : '';

  const signatureHtml = options.includeSignatureBlock
    ? `<div class="signature-row">
        <div class="sig-box">
          <div class="sig-line"></div>
          <div class="sig-title">Prepared / Taxpayer Signature</div>
          <div class="sig-sub">नेपालएआई प्रमाणित कागजात</div>
        </div>
        <div class="sig-box">
          <div class="sig-line"></div>
          <div class="sig-title">Authorized Signatory / Stamp</div>
          <div class="sig-sub">nepalai.tech Sovereign Billing</div>
        </div>
      </div>`
    : '';

  const html = `<!DOCTYPE html>
<html lang="ne">
<head>
  <meta charset="UTF-8" />
  <title>${escapeHtml(options.documentTitle)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=Noto+Sans+Devanagari:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    @page { size: A4; margin: 16mm 14mm; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 20px;
      font-family: 'Inter', 'Noto Sans Devanagari', system-ui, -apple-system, sans-serif;
      color: #0f172a;
      background: #ffffff;
      font-size: 12px;
      line-height: 1.55;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .sheet {
      max-width: 780px;
      margin: 0 auto;
    }
    .letterhead {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #0e7490;
      padding-bottom: 12px;
      margin-bottom: 16px;
    }
    .brand-mark {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .brand-badge {
      width: 34px;
      height: 34px;
      border-radius: 8px;
      background: #0e7490;
      color: #ffffff;
      font-weight: 800;
      font-size: 15px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .brand-name {
      font-size: 16px;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.02em;
    }
    .brand-sub {
      font-size: 10px;
      color: #475569;
    }
    .doc-meta-top {
      text-align: right;
      font-size: 10.5px;
      color: #334155;
    }
    .doc-badge {
      display: inline-block;
      background: #ecfeff;
      color: #155e75;
      border: 1px solid #a5f3fc;
      padding: 2px 8px;
      border-radius: 999px;
      font-weight: 700;
      font-size: 10px;
      text-transform: uppercase;
      margin-bottom: 4px;
    }
    .title-block {
      margin-bottom: 14px;
    }
    .title-en {
      font-size: 17px;
      font-weight: 800;
      color: #0f172a;
      margin: 0;
    }
    .title-ne {
      font-size: 13px;
      font-weight: 600;
      color: #0e7490;
      margin: 2px 0 0 0;
    }
    .meta-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 8px 16px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 10px 12px;
      margin-bottom: 16px;
    }
    .meta-item {
      display: flex;
      justify-content: space-between;
      gap: 8px;
      font-size: 11px;
    }
    .meta-label { color: #475569; font-weight: 600; }
    .meta-value { color: #0f172a; font-weight: 700; text-align: right; }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 12px 0;
      font-size: 11.5px;
    }
    th {
      background: #f1f5f9;
      color: #1e293b;
      text-align: left;
      padding: 7px 10px;
      border-bottom: 2px solid #cbd5e1;
      font-weight: 700;
    }
    td {
      padding: 7px 10px;
      border-bottom: 1px solid #e2e8f0;
      color: #0f172a;
    }
    .num { text-align: right; font-variant-numeric: tabular-nums; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
    .highlight-box {
      background: #ecfeff;
      border: 1px solid #67e8f9;
      border-radius: 8px;
      padding: 12px 14px;
      margin: 14px 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .highlight-label { font-size: 11px; font-weight: 700; color: #155e75; text-transform: uppercase; }
    .highlight-value { font-size: 19px; font-weight: 800; color: #0e7490; font-variant-numeric: tabular-nums; }
    .letter-body {
      white-space: pre-wrap;
      font-size: 13px;
      line-height: 1.8;
      padding: 16px;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      background: #ffffff;
    }
    .signature-row {
      display: flex;
      justify-content: space-between;
      margin-top: 36px;
      gap: 32px;
    }
    .sig-box { width: 210px; text-align: center; }
    .sig-line { border-top: 1px solid #64748b; margin-bottom: 6px; }
    .sig-title { font-weight: 700; font-size: 11px; color: #0f172a; }
    .sig-sub { font-size: 10px; color: #64748b; }
    .footer {
      margin-top: 24px;
      padding-top: 10px;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      font-size: 10px;
      color: #64748b;
    }
  </style>
</head>
<body>
  <div class="sheet">
    <div class="letterhead">
      <div class="brand-mark">
        <div class="brand-badge">ने</div>
        <div>
          <div class="brand-name">nepalai.tech</div>
          <div class="brand-sub">Sovereign Financial &amp; Digital Infrastructure • Kathmandu, Nepal</div>
        </div>
      </div>
      <div class="doc-meta-top">
        <div class="doc-badge">${escapeHtml(options.badgeText)}</div>
        <div><strong>Ref:</strong> ${escapeHtml(refNo)}</div>
        <div><strong>BS Date:</strong> ${escapeHtml(bsDate.formattedBs)} | <strong>AD:</strong> ${escapeHtml(adDate)}</div>
      </div>
    </div>

    <div class="title-block">
      <h1 class="title-en">${escapeHtml(options.headerTitleEn)}</h1>
      <p class="title-ne">${escapeHtml(options.headerTitleNe)}</p>
    </div>

    ${metadataHtml}
    ${options.bodyHtml}
    ${signatureHtml}

    <div class="footer">
      <span>${escapeHtml(options.footerNote || 'Generated via NepalAI Official Utility Suite (https://nepalai.tech)')}</span>
      <span>Verified Bilingual A4 Print Export</span>
    </div>
  </div>
</body>
</html>`;

  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.style.visibility = 'hidden';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) {
    document.body.removeChild(iframe);
    return;
  }

  doc.open();
  doc.write(html);
  doc.close();

  const triggerPrint = () => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } finally {
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 1500);
    }
  };

  setTimeout(triggerPrint, 250);
}

export function exportFxAuditPdf(params: {
  serviceName: string;
  provider: string;
  billingCycle: string;
  liveNrbRate: number;
  effectiveTotalUsd: number;
  baseNpr: number;
  bankSpreadNpr: number;
  dstTaxNpr: number;
  vatNpr: number;
  totalNpr: number;
  quotaUsedPct: number;
  remainingUsd: number;
  publishedAt?: string;
}): void {
  exportBrandedPdfDocument({
    documentTitle: `NRB_FX_Audit_${params.serviceName}`,
    headerTitleEn: 'NRB Dollar Card & Subscription Cost Audit',
    headerTitleNe: 'नेपाल राष्ट्र बैंक विदेशी मुद्रा तथा डिजिटल सेवा कर विवरण',
    badgeText: 'NRB $500 Card Audit',
    metadataRows: [
      { label: 'Service / SaaS', value: `${params.serviceName} (${params.provider})` },
      { label: 'Billing Cycle', value: params.billingCycle.toUpperCase() },
      { label: 'NRB Exchange Rate', value: `1 USD = NPR ${params.liveNrbRate.toFixed(2)}` },
      { label: 'NRB Bulletin Date', value: params.publishedAt || 'Latest Published' },
    ],
    bodyHtml: `
      <div class="highlight-box">
        <div>
          <div class="highlight-label">Total Estimated Cost (NPR)</div>
          <div style="font-size:11px; color:#334155;">Includes applicable bank spread &amp; statutory taxes</div>
        </div>
        <div class="highlight-value">रू ${Math.round(params.totalNpr).toLocaleString('en-IN')}</div>
      </div>
      <table>
        <thead>
          <tr><th>Cost Component</th><th class="num">Amount (NPR)</th></tr>
        </thead>
        <tbody>
          <tr><td>Base FX Value ($${params.effectiveTotalUsd.toFixed(2)} USD × ${params.liveNrbRate.toFixed(2)})</td><td class="num">रू ${Math.round(params.baseNpr).toLocaleString('en-IN')}</td></tr>
          <tr><td>A-Class Bank FX Card Spread (3.0%)</td><td class="num">रू ${Math.round(params.bankSpreadNpr).toLocaleString('en-IN')}</td></tr>
          <tr><td>Nepal Finance Act Digital Services Tax (2.0% DST)</td><td class="num">रू ${Math.round(params.dstTaxNpr).toLocaleString('en-IN')}</td></tr>
          ${params.vatNpr > 0 ? `<tr><td>Local VAT Assessment (13.0%)</td><td class="num">रू ${Math.round(params.vatNpr).toLocaleString('en-IN')}</td></tr>` : ''}
          <tr><td><strong>Total Payable Estimate</strong></td><td class="num"><strong>रू ${Math.round(params.totalNpr).toLocaleString('en-IN')}</strong></td></tr>
        </tbody>
      </table>
      <table>
        <thead>
          <tr><th>NRB $500 Annual Dollar Card Compliance</th><th class="num">Quota Impact</th></tr>
        </thead>
        <tbody>
          <tr><td>Annual Statutory Cap</td><td class="num">$500.00 USD</td></tr>
          <tr><td>This Payment Consumes</td><td class="num">$${params.effectiveTotalUsd.toFixed(2)} USD (${params.quotaUsedPct.toFixed(1)}%)</td></tr>
          <tr><td>Remaining Annual Dollar Card Balance</td><td class="num">$${params.remainingUsd.toFixed(2)} USD</td></tr>
        </tbody>
      </table>
    `,
    footerNote: 'Calculated against Nepal Rastra Bank Foreign Exchange directives & Finance Act 2081/82.',
  });
}

export function exportTaxComputationPdf(params: {
  taxStatus: 'single' | 'married';
  taxTrack: 'employment' | 'it_freelance' | 'it_company';
  monthlySalaryNpr: number;
  dashainBonus: boolean;
  ssfEnrolled: boolean;
  singleFemaleRebate: boolean;
  calculation: TaxCalculationResult;
}): void {
  const trackLabel =
    params.taxTrack === 'it_freelance'
      ? 'IT / Software Export Freelancer (Section 95Ka 5% Final TDS)'
      : params.taxTrack === 'it_company'
      ? 'Registered IT Company (1% TDS)'
      : 'Regular Salaried Employment';

  exportBrandedPdfDocument({
    documentTitle: 'Nepal_IRD_Income_Tax_Slip_FY2081_82',
    headerTitleEn: 'Inland Revenue Department (IRD) Tax Computation Slip',
    headerTitleNe: 'आन्तरिक राजस्व विभाग (आ.व. २०८१/८२) आयकर गणना विवरण',
    badgeText: 'FY 2081/82 Tax Slip',
    metadataRows: [
      { label: 'Filing Status', value: params.taxStatus === 'married' ? 'Married (दम्पती)' : 'Single (व्यक्तिगत)' },
      { label: 'Income Track', value: trackLabel },
      { label: 'Monthly Gross', value: `NPR ${params.monthlySalaryNpr.toLocaleString('en-IN')}` },
      { label: 'Annual Gross Income', value: `NPR ${params.calculation.totalAnnualIncome.toLocaleString('en-IN')}` },
      { label: 'SSF / Female Rebate', value: `${params.ssfEnrolled ? 'SSF Enrolled' : 'Non-SSF'} · ${params.singleFemaleRebate ? '10% Rebate' : 'Standard'}` },
      { label: 'Effective Tax Rate', value: `${params.calculation.effectiveTaxRatePercent}%` },
    ],
    bodyHtml: `
      <div class="highlight-box">
        <div>
          <div class="highlight-label">Monthly Net Take-Home Pay (मासिक खुद तलब)</div>
          <div style="font-size:11px; color:#334155;">Monthly Tax TDS: रू ${Math.round(params.calculation.monthlyTaxTds).toLocaleString('en-IN')}</div>
        </div>
        <div class="highlight-value">रू ${Math.round(params.calculation.monthlyNetTakeHome).toLocaleString('en-IN')}</div>
      </div>
      <table>
        <thead>
          <tr><th>IRD Tax Slab / Deduction</th><th class="num">Rate</th><th class="num">Taxable / Amount (NPR)</th></tr>
        </thead>
        <tbody>
          <tr><td>Total Annual Deductions (EPF/CIT/Insurance)</td><td class="num">—</td><td class="num">रू ${Math.round(params.calculation.totalDeductions).toLocaleString('en-IN')}</td></tr>
          <tr><td>Net Assessable Taxable Income</td><td class="num">—</td><td class="num">रू ${Math.round(params.calculation.netTaxableIncome).toLocaleString('en-IN')}</td></tr>
          ${params.calculation.slabs
            .map(
              (s) => `
            <tr>
              <td>${escapeHtml(s.slabName)}</td>
              <td class="num">${s.ratePercent}%</td>
              <td class="num">रू ${Math.round(s.taxAmount).toLocaleString('en-IN')}</td>
            </tr>`
            )
            .join('')}
          <tr>
            <td><strong>Total Annual Tax Liability</strong></td>
            <td class="num"><strong>${params.calculation.effectiveTaxRatePercent}%</strong></td>
            <td class="num"><strong>रू ${Math.round(params.calculation.finalAnnualTax).toLocaleString('en-IN')}</strong></td>
          </tr>
        </tbody>
      </table>
      <p style="font-size:11px; color:#334155;"><strong>Legal Reference:</strong> ${escapeHtml(params.calculation.legalNote)}</p>
    `,
    includeSignatureBlock: true,
    footerNote: 'Nepal Income Tax Act 2058 & Finance Act 2081/82 Computation Record • nepalai.tech',
  });
}

export function exportItExportDeclarationPdf(params: {
  freelancerName: string;
  panNumber: string;
  bankName: string;
  bankBranch: string;
  bankAccountNumber: string;
  inwardAmountUsd: number;
  nrbBuyRateNpr: number;
  grossAmountNpr: number;
  tdsRatePercent: number;
  tdsAmountNpr: number;
  netDepositedNpr: number;
  letterText: string;
}): void {
  exportBrandedPdfDocument({
    documentTitle: `Section95Ka_Declaration_${params.freelancerName}`,
    headerTitleEn: 'Foreign Currency IT Export Remittance Self-Declaration',
    headerTitleNe: 'आयकर ऐन २०५८ दफा ९५(क) अन्तर्गत बैंक स्वघोषणा पत्र',
    badgeText: `Section 95Ka (${params.tdsRatePercent}% TDS)`,
    metadataRows: [
      { label: 'Exporter / Beneficiary', value: params.freelancerName },
      { label: 'IRD PAN Number', value: params.panNumber },
      { label: 'Receiving Bank', value: `${params.bankName} (${params.bankBranch})` },
      { label: 'Account Number', value: params.bankAccountNumber },
      { label: 'Inward Remittance', value: `$${params.inwardAmountUsd.toLocaleString()} @ रू ${params.nrbBuyRateNpr.toFixed(2)}` },
      { label: 'TDS / Net Credited', value: `TDS रू ${params.tdsAmountNpr.toLocaleString('en-IN')} · Net रू ${params.netDepositedNpr.toLocaleString('en-IN')}` },
    ],
    bodyHtml: `
      <div class="highlight-box">
        <div>
          <div class="highlight-label">Net Amount Credited to Bank Account</div>
          <div style="font-size:11px; color:#334155;">Gross रू ${params.grossAmountNpr.toLocaleString('en-IN')} − ${params.tdsRatePercent}% Final TDS (रू ${params.tdsAmountNpr.toLocaleString('en-IN')})</div>
        </div>
        <div class="highlight-value">रू ${params.netDepositedNpr.toLocaleString('en-IN')}</div>
      </div>
      <div class="letter-body">${escapeHtml(params.letterText)}</div>
    `,
    includeSignatureBlock: true,
    footerNote: 'Prepared under Nepal Income Tax Act 2058 Section 95Ka (6Ga) for A-Class Commercial Banks.',
  });
}

export function exportBullionQuotePdf(params: {
  bullionType: BullionType;
  result: JewelryCalculationResult;
  wastagePercent: number;
  includeLuxuryTax: boolean;
  includeVat: boolean;
}): void {
  const metalLabel =
    params.bullionType === 'chhapawal_gold'
      ? '24K Chhapawal Gold (छापावाल सुन)'
      : params.bullionType === 'tejabi_gold'
      ? '22K Tejabi Gold (तेजाबी सुन)'
      : 'Fine Silver (चाँदी)';

  exportBrandedPdfDocument({
    documentTitle: `FENEGOSIDA_Jewelry_Audit_${params.bullionType}`,
    headerTitleEn: 'FENEGOSIDA Bullion & Jewelry Purchase Audit Slip',
    headerTitleNe: 'सुनचाँदी तथा गहना ज्याला-जर्ती पारदर्शी कोटेसन विवरण',
    badgeText: 'FENEGOSIDA Standard',
    metadataRows: [
      { label: 'Precious Metal', value: metalLabel },
      { label: 'Benchmark Rate / Tola', value: `रू ${params.result.ratePerTola.toLocaleString('en-IN')}` },
      { label: 'Pure Net Weight', value: params.result.pureWeightFormattedEn },
      { label: 'Effective Cost / Gram', value: `रू ${params.result.effectivePerGramCostNpr.toLocaleString('en-IN')}/g` },
    ],
    bodyHtml: `
      <div class="highlight-box">
        <div>
          <div class="highlight-label">Total Audited Payable Amount</div>
          <div style="font-size:11px; color:#334155;">Markup over raw bullion: +${params.result.markupPercentageOverRawMetal}%</div>
        </div>
        <div class="highlight-value">रू ${params.result.finalTotalNpr.toLocaleString('en-IN')}</div>
      </div>
      <table>
        <thead>
          <tr><th>Audit Line Item</th><th class="num">Weight / Rate</th><th class="num">Amount (NPR)</th></tr>
        </thead>
        <tbody>
          <tr><td>Raw Precious Metal Value</td><td class="num">${params.result.pureWeightGrams} g</td><td class="num">रू ${params.result.rawMetalCostNpr.toLocaleString('en-IN')}</td></tr>
          <tr><td>Wastage / Melting Loss (जर्ती)</td><td class="num">${params.wastagePercent}% (+${params.result.wastageWeightGrams} g)</td><td class="num">रू ${params.result.wastageCostNpr.toLocaleString('en-IN')}</td></tr>
          <tr><td>Making Charges (ज्याला)</td><td class="num">Craftsmanship</td><td class="num">रू ${params.result.makingChargeNpr.toLocaleString('en-IN')}</td></tr>
          ${params.includeLuxuryTax ? `<tr><td>Luxury Tax</td><td class="num">2.0%</td><td class="num">रू ${params.result.luxuryTaxNpr.toLocaleString('en-IN')}</td></tr>` : ''}
          ${params.includeVat ? `<tr><td>IRD VAT</td><td class="num">13.0%</td><td class="num">रू ${params.result.vatNpr.toLocaleString('en-IN')}</td></tr>` : ''}
          <tr><td><strong>Final Total Payable</strong></td><td class="num"><strong>${params.result.totalBilledWeightGrams} g billed</strong></td><td class="num"><strong>रू ${params.result.finalTotalNpr.toLocaleString('en-IN')}</strong></td></tr>
        </tbody>
      </table>
    `,
    footerNote: '1 Tola = 11.664 Grams = 16 Aana = 10 Lal • Grounded in FENEGOSIDA & IRD Guidelines.',
  });
}

export function exportNepseTradePdf(params: {
  scripSymbol: string;
  units: number;
  buyPrice: number;
  sellPrice: number;
  holdingPeriod: string;
  result: NepseTradeResult;
}): void {
  exportBrandedPdfDocument({
    documentTitle: `NEPSE_Trade_${params.scripSymbol.toUpperCase()}`,
    headerTitleEn: `NEPSE Equity Settlement & CGT Report (${params.scripSymbol.toUpperCase()})`,
    headerTitleNe: 'नेपाल स्टक एक्सचेन्ज (NEPSE) सेयर खरिद-बिक्री तथा पुँजीगत लाभकर विवरण',
    badgeText: 'SEBON Compliant',
    metadataRows: [
      { label: 'Scrip Symbol', value: params.scripSymbol.toUpperCase() },
      { label: 'Shares Traded', value: `${params.units} Units` },
      { label: 'Buy / Sell Price', value: `रू ${params.buyPrice} → रू ${params.sellPrice}` },
      { label: 'CGT Holding Tier', value: `${params.holdingPeriod.replace('_', ' ')} (${params.result.cgtRatePercent}%)` },
    ],
    bodyHtml: `
      <div class="highlight-box">
        <div>
          <div class="highlight-label">${params.result.netProfitLossNpr >= 0 ? 'Net Profit After CGT & Fees' : 'Net Realized Loss'}</div>
          <div style="font-size:11px; color:#334155;">Break-Even Sell Price: रू ${params.result.breakEvenSellPrice} · ROI: ${params.result.returnOnInvestmentPercent}%</div>
        </div>
        <div class="highlight-value">${params.result.netProfitLossNpr >= 0 ? '+' : ''}रू ${params.result.netProfitLossNpr.toLocaleString('en-IN')}</div>
      </div>
      <table>
        <thead>
          <tr><th>Settlement Component</th><th class="num">Amount (NPR)</th></tr>
        </thead>
        <tbody>
          <tr><td>Total Purchase Cost (${params.units} × रू ${params.buyPrice})</td><td class="num">रू ${params.result.totalPurchaseAmount.toLocaleString('en-IN')}</td></tr>
          <tr><td>Total Gross Sales (${params.units} × रू ${params.sellPrice})</td><td class="num">रू ${params.result.totalSalesAmount.toLocaleString('en-IN')}</td></tr>
          <tr><td>SEBON Tiered Broker Commission (Buy + Sell)</td><td class="num">- रू ${params.result.totalBrokerCommission.toLocaleString('en-IN')}</td></tr>
          <tr><td>SEBON Regulatory Fee (0.015%)</td><td class="num">- रू ${params.result.sebonFeeNpr.toLocaleString('en-IN')}</td></tr>
          <tr><td>CDSC DP Fee</td><td class="num">- रू ${params.result.dpChargeNpr.toLocaleString('en-IN')}</td></tr>
          <tr><td>Capital Gains Tax (${params.result.cgtRatePercent}%)</td><td class="num">- रू ${params.result.capitalGainsTaxNpr.toLocaleString('en-IN')}</td></tr>
          <tr><td><strong>Net Receivable Credited to Bank</strong></td><td class="num"><strong>रू ${params.result.netReceivableNpr.toLocaleString('en-IN')}</strong></td></tr>
        </tbody>
      </table>
    `,
    footerNote: 'Calculated per Securities Board of Nepal (SEBON) & IRD Capital Gains Tax Schedule.',
  });
}

export function exportEvTaxPdf(params: {
  motorKw: number;
  expiryMonthsLate: number;
  result: EvTaxResult;
}): void {
  exportBrandedPdfDocument({
    documentTitle: `Nepal_EV_RoadTax_${params.motorKw}kW`,
    headerTitleEn: 'Provincial EV Road Tax & Bluebook Renewal Slip',
    headerTitleNe: 'प्रदेश सवारी साधन कर तथा ब्लुबुक नवीकरण जरिवाना विवरण',
    badgeText: 'EV Tax Audit',
    metadataRows: [
      { label: 'Vehicle Class', value: params.result.bracketDescription },
      { label: 'Peak Motor Power', value: `${params.motorKw} kW` },
      { label: 'Renewal Delay', value: `${params.expiryMonthsLate} Months` },
      { label: 'Penalty Rate', value: `${params.result.finePercent}%` },
    ],
    bodyHtml: `
      <div class="highlight-box">
        <div>
          <div class="highlight-label">Total Vehicle Road Tax Due</div>
          <div style="font-size:11px; color:#334155;">Base Tax रू ${params.result.baseTaxNpr.toLocaleString('en-IN')} + Delay Fine रू ${params.result.fineAmountNpr.toLocaleString('en-IN')}</div>
        </div>
        <div class="highlight-value">रू ${params.result.totalTaxDueNpr.toLocaleString('en-IN')}</div>
      </div>
      <table>
        <thead>
          <tr><th>Assessment Detail</th><th class="num">Amount (NPR)</th></tr>
        </thead>
        <tbody>
          <tr><td>Annual Provincial Base EV Tax</td><td class="num">रू ${params.result.baseTaxNpr.toLocaleString('en-IN')}</td></tr>
          <tr><td>Late Renewal Fine (${params.result.finePercent}%)</td><td class="num">रू ${params.result.fineAmountNpr.toLocaleString('en-IN')}</td></tr>
          <tr><td><strong>Total Payable at Yatayat Office</strong></td><td class="num"><strong>रू ${params.result.totalTaxDueNpr.toLocaleString('en-IN')}</strong></td></tr>
        </tbody>
      </table>
    `,
    footerNote: 'Grounded in Provincial Motor Vehicle and Transport Management Act.',
  });
}

export function exportIrdInvoicePdf(params: {
  businessName: string;
  businessPan: string;
  businessAddress: string;
  businessPhone: string;
  orderNumber: string;
  createdAt: string;
  paymentMethod: string;
  paymentStatus: string;
  buyerName: string;
  buyerAddress: string;
  buyerPhone: string;
  items: Array<{ title: string; quantity: number | string; unitPriceNpr: number | string }>;
  deliveryChargeNpr: number;
  discountNpr: number;
  totalNprOverride?: number;
}): void {
  const tax = calculateIrdTax(
    params.items.map((i) => ({
      title: i.title,
      quantity: i.quantity,
      unitPriceNpr: i.unitPriceNpr,
    })),
    params.deliveryChargeNpr,
    params.discountNpr,
    true
  );
  const finalTotal = params.totalNprOverride || tax.grandTotalNpr;
  const wordsNe = numberToNepaliWords(finalTotal);
  const wordsEn = numberToEnglishWords(finalTotal);
  const adDate = new Date(params.createdAt).toISOString().split('T')[0];

  exportBrandedPdfDocument({
    documentTitle: `Tax_Invoice_${params.orderNumber}`,
    headerTitleEn: `${params.businessName} — TAX INVOICE`,
    headerTitleNe: 'आन्तरिक राजस्व विभाग अनुसूची ५ कर बिजक (VAT 13%)',
    badgeText: `PAN ${params.businessPan}`,
    referenceNo: `#${params.orderNumber}`,
    metadataRows: [
      { label: 'Seller Address', value: `${params.businessAddress} · ${params.businessPhone}` },
      { label: 'Invoice Date (AD)', value: adDate },
      { label: 'Buyer Name', value: params.buyerName },
      { label: 'Buyer Contact', value: `${params.buyerAddress} · ${params.buyerPhone}` },
      { label: 'Payment Rail', value: `${params.paymentMethod.toUpperCase()} (${params.paymentStatus})` },
      { label: 'Seller PAN / VAT', value: params.businessPan },
    ],
    bodyHtml: `
      <table>
        <thead>
          <tr>
            <th>क्र.सं. (S.N.)</th>
            <th>विवरण (Particulars)</th>
            <th class="num">Qty</th>
            <th class="num">Rate (रू)</th>
            <th class="num">Amount (रू)</th>
          </tr>
        </thead>
        <tbody>
          ${tax.itemsCalculated
            .map(
              (item) => `
            <tr>
              <td>${item.sn}</td>
              <td>${escapeHtml(item.title)}</td>
              <td class="num">${item.quantity}</td>
              <td class="num">${item.unitPriceNpr.toLocaleString('en-IN')}</td>
              <td class="num"><strong>${item.totalNpr.toLocaleString('en-IN')}</strong></td>
            </tr>`
            )
            .join('')}
        </tbody>
      </table>
      <table>
        <tbody>
          <tr><td>कुल रकम (Subtotal)</td><td class="num">रू ${tax.subtotalNpr.toLocaleString('en-IN')}</td></tr>
          ${tax.discountNpr > 0 ? `<tr><td>छुट (Discount)</td><td class="num">- रू ${tax.discountNpr.toLocaleString('en-IN')}</td></tr>` : ''}
          <tr><td>करयोग्य रकम (Taxable Amount)</td><td class="num">रू ${tax.taxableAmountNpr.toLocaleString('en-IN')}</td></tr>
          <tr><td>१३% मूल्य अभिवृद्धि कर (13% VAT)</td><td class="num">रू ${tax.vat13PercentNpr.toLocaleString('en-IN')}</td></tr>
          ${tax.deliveryChargeNpr > 0 ? `<tr><td>ढुवानी शुल्क (Delivery Charge)</td><td class="num">रू ${tax.deliveryChargeNpr.toLocaleString('en-IN')}</td></tr>` : ''}
          <tr><td><strong>जम्मा रकम (Grand Total)</strong></td><td class="num"><strong>रू ${finalTotal.toLocaleString('en-IN')}</strong></td></tr>
        </tbody>
      </table>
      <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:10px 12px; font-size:11px;">
        <div><strong>अक्षरेपी:</strong> ${escapeHtml(wordsNe)}</div>
        <div><strong>In Words:</strong> ${escapeHtml(wordsEn)}</div>
      </div>
    `,
    includeSignatureBlock: true,
    footerNote: `IRD VAT Act 2052 Rule 17 Compliant Tax Invoice • Seller PAN ${params.businessPan}`,
  });
}

export function exportOfficialLetterPdf(params: {
  subject: string;
  officeName: string;
  applicantName: string;
  dateBs: string;
  chalaniNo: string;
  letterText: string;
  isPreeti?: boolean;
  categoryLabel?: string;
}): void {
  exportBrandedPdfDocument({
    documentTitle: `Nepal_Letter_${params.subject.slice(0, 32)}`,
    headerTitleEn: params.categoryLabel || 'Official Nepali Document & Application',
    headerTitleNe: params.subject,
    badgeText: params.isPreeti ? 'Preeti Format' : 'Official Devanagari A4',
    referenceNo: `Ch-${params.chalaniNo}`,
    metadataRows: [
      { label: 'Addressed To', value: params.officeName },
      { label: 'Applicant / Sender', value: params.applicantName },
      { label: 'B.S. Date (मिति)', value: params.dateBs },
      { label: 'Reference / Chalani', value: params.chalaniNo },
    ],
    bodyHtml: `
      <div class="letter-body" style="font-size:13.5px; line-height:1.9;">${escapeHtml(params.letterText)}</div>
    `,
    includeSignatureBlock: true,
    footerNote: 'Prepared via NepalAI Roman & Devanagari Letter Studio (https://nepalai.tech/tools/ward-letter)',
  });
}

export function exportKhataLedgerPdf(params: {
  shopOrPartyName: string;
  phone?: string;
  billDateBs: string;
  items: Array<{ name: string; qty: string; amountNpr: number }>;
  totalNpr: number;
  paidNpr: number;
  dueNpr: number;
  senderShopName?: string;
  esewaId?: string;
}): void {
  const wordsNe = numberToNepaliWords(Math.round(params.dueNpr > 0 ? params.dueNpr : params.totalNpr));
  exportBrandedPdfDocument({
    documentTitle: `Khata_Slip_${params.shopOrPartyName.replace(/\s+/g, '_')}`,
    headerTitleEn: 'Digital Bill & Udharo Khata Statement',
    headerTitleNe: 'बिल तथा उधारो खाता विवरण (हस्तलिखित फोटोबाट रूपान्तरित)',
    badgeText: params.dueNpr > 0 ? 'Balance Due' : 'Settled Bill',
    metadataRows: [
      { label: 'Customer / Party', value: params.shopOrPartyName },
      { label: 'Contact / Phone', value: params.phone || 'Not specified' },
      { label: 'Date (B.S.)', value: params.billDateBs },
      { label: 'Prepared By / Shop', value: params.senderShopName || 'NepalAI Khata Snap' },
    ],
    bodyHtml: `
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>विवरण (Item Description)</th>
            <th>परिमाण (Qty)</th>
            <th class="num">रकम (NPR)</th>
          </tr>
        </thead>
        <tbody>
          ${params.items
            .map(
              (item, idx) => `
            <tr>
              <td>${idx + 1}</td>
              <td>${escapeHtml(item.name)}</td>
              <td>${escapeHtml(item.qty)}</td>
              <td class="num">रू ${Math.round(item.amountNpr).toLocaleString('en-IN')}</td>
            </tr>`
            )
            .join('')}
        </tbody>
      </table>
      <table>
        <tbody>
          <tr><td>कुल रकम (Grand Total)</td><td class="num"><strong>रू ${Math.round(params.totalNpr).toLocaleString('en-IN')}</strong></td></tr>
          <tr><td>बुझाएको रकम (Paid)</td><td class="num">रू ${Math.round(params.paidNpr).toLocaleString('en-IN')}</td></tr>
          <tr><td><strong>बाँकी उधारो (Balance Due)</strong></td><td class="num"><strong>रू ${Math.round(params.dueNpr).toLocaleString('en-IN')}</strong></td></tr>
        </tbody>
      </table>
      <div class="highlight-box">
        <div>
          <div class="highlight-label">${params.dueNpr > 0 ? 'बाँकी तिर्नुपर्ने रकम (Balance Due)' : 'भुक्तानी पूर्ण (Total Settled)'}</div>
          <div style="font-size:11px; color:#334155;">अक्षरेपी: ${escapeHtml(wordsNe)}${params.esewaId ? ` • eSewa/FonePay: ${escapeHtml(params.esewaId)}` : ''}</div>
        </div>
        <div class="highlight-value">रू ${Math.round(params.dueNpr > 0 ? params.dueNpr : params.totalNpr).toLocaleString('en-IN')}</div>
      </div>
    `,
    includeSignatureBlock: true,
    footerNote: 'Generated via NepalAI Handwritten Bill & Udharo Khata Snapper (https://nepalai.tech/tools/khata-snap)',
  });
}

export function exportContractRiskPdf(params: {
  docTitle: string;
  safetyScore: number;
  riskLevel: string;
  plainSummary: string;
  redFlags: Array<{ title: string; clauseFound: string; whyRisky: string; saferRewrite: string; severity: string }>;
  missingProtections: string[];
  questionsToAsk: string[];
}): void {
  exportBrandedPdfDocument({
    documentTitle: `Contract_Risk_Report_${params.safetyScore}`,
    headerTitleEn: params.docTitle,
    headerTitleNe: 'कागजात तथा तमसुक जोखिम जाँच प्रतिवेदन',
    badgeText: `Safety Score ${params.safetyScore}/100 (${params.riskLevel.toUpperCase()})`,
    metadataRows: [
      { label: 'Safety Score', value: `${params.safetyScore} / 100` },
      { label: 'Risk Rating', value: params.riskLevel.toUpperCase() },
      { label: 'Red Flags Found', value: String(params.redFlags.length) },
      { label: 'Missing Safeguards', value: String(params.missingProtections.length) },
    ],
    bodyHtml: `
      <div class="highlight-box">
        <div>
          <div class="highlight-label">Plain Summary (सरल सारांश)</div>
          <div style="font-size:12px; color:#0f172a; margin-top:4px;">${escapeHtml(params.plainSummary)}</div>
        </div>
        <div class="highlight-value">${params.safetyScore}/100</div>
      </div>
      ${
        params.redFlags.length > 0
          ? `<h3 style="font-size:13px; margin:14px 0 6px;">Red Flags & Safer Rewrites (जोखिम बुँदा र सुरक्षित विकल्प)</h3>
             <table>
               <thead>
                 <tr><th>Risk</th><th>Why It Hurts You</th><th>Safer Rewrite</th></tr>
               </thead>
               <tbody>
                 ${params.redFlags
                   .map(
                     (f) => `<tr>
                       <td><strong>${escapeHtml(f.title)}</strong><br/><span style="font-size:10px; color:#475569;">${escapeHtml(f.clauseFound)}</span></td>
                       <td>${escapeHtml(f.whyRisky)}</td>
                       <td style="color:#0e7490;"><strong>${escapeHtml(f.saferRewrite)}</strong></td>
                     </tr>`
                   )
                   .join('')}
               </tbody>
             </table>`
          : ''
      }
      ${
        params.missingProtections.length > 0
          ? `<h3 style="font-size:13px; margin:14px 0 6px;">Missing Protections (छुटेका सुरक्षा बुँदा)</h3>
             <ul style="padding-left:18px; margin:4px 0;">
               ${params.missingProtections.map((m) => `<li style="margin-bottom:4px;">${escapeHtml(m)}</li>`).join('')}
             </ul>`
          : ''
      }
      ${
        params.questionsToAsk.length > 0
          ? `<h3 style="font-size:13px; margin:14px 0 6px;">Questions to Ask Before Signing (हस्ताक्षर अघि सोध्ने प्रश्नहरू)</h3>
             <ol style="padding-left:18px; margin:4px 0;">
               ${params.questionsToAsk.map((q) => `<li style="margin-bottom:4px;">${escapeHtml(q)}</li>`).join('')}
             </ol>`
          : ''
      }
      <p style="font-size:10px; color:#64748b; margin-top:12px;">Note: Educational risk awareness tool based on general Nepal Civil Code & Labor Act principles; consult a licensed advocate for court filings.</p>
    `,
    includeSignatureBlock: false,
    footerNote: 'Prepared via NepalAI Contract & Tamasuk Risk Scanner (https://nepalai.tech/tools/contract-risk)',
  });
}

export function exportHealthGuidePdf(params: {
  reportTitle: string;
  warmSummaryNe: string;
  labMarkers: Array<{ name: string; value: string; normalRange: string; status: string; meaningSimple: string }>;
  medicineSchedule: Array<{
    medicineName: string;
    timingBadge: string;
    morning: boolean;
    afternoon: boolean;
    night: boolean;
    mealNote: string;
    duration: string;
    purposeSimple: string;
  }>;
  questionsForDoctor: string[];
}): void {
  exportBrandedPdfDocument({
    documentTitle: 'NepalAI_Parents_Health_Medicine_Guide',
    headerTitleEn: params.reportTitle,
    headerTitleNe: 'आमा–बुबा र परिवारका लागि सरल स्वास्थ्य तथा औषधि तालिका',
    badgeText: 'Family Health Guide',
    bodyHtml: `
      <div class="highlight-box">
        <div>
          <div class="highlight-label">सरल सारांश (Simple Summary)</div>
          <div style="font-size:13px; color:#0f172a; margin-top:4px; line-height:1.7;">${escapeHtml(params.warmSummaryNe)}</div>
        </div>
      </div>
      ${
        params.medicineSchedule.length > 0
          ? `<h3 style="font-size:14px; margin:14px 0 6px;">दैनिक औषधि तालिका (Morning / Day / Night Chart)</h3>
             <table>
               <thead>
                 <tr>
                   <th>औषधि (Medicine)</th>
                   <th>बिहान</th>
                   <th>दिउँसो</th>
                   <th>राति</th>
                   <th>खाने तरिका र अवधि</th>
                 </tr>
               </thead>
               <tbody>
                 ${params.medicineSchedule
                   .map(
                     (m) => `<tr>
                       <td><strong>${escapeHtml(m.medicineName)}</strong><br/><span style="font-size:10px; color:#475569;">${escapeHtml(m.purposeSimple)}</span></td>
                       <td style="text-align:center; font-size:14px;">${m.morning ? '✅' : '—'}</td>
                       <td style="text-align:center; font-size:14px;">${m.afternoon ? '✅' : '—'}</td>
                       <td style="text-align:center; font-size:14px;">${m.night ? '✅' : '—'}</td>
                       <td>${escapeHtml(m.mealNote)}<br/><span style="font-size:10px; color:#0e7490;">अवधि: ${escapeHtml(m.duration)}</span></td>
                     </tr>`
                   )
                   .join('')}
               </tbody>
             </table>`
          : ''
      }
      ${
        params.labMarkers.length > 0
          ? `<h3 style="font-size:14px; margin:14px 0 6px;">प्रयोगशाला जाँचको अर्थ (Lab Results Explained)</h3>
             <table>
               <thead>
                 <tr><th>जाँच (Test)</th><th>तपाईंको मान</th><th>सामान्य दायरा</th><th>सरल अर्थ</th></tr>
               </thead>
               <tbody>
                 ${params.labMarkers
                   .map(
                     (l) => `<tr>
                       <td><strong>${escapeHtml(l.name)}</strong></td>
                       <td><strong>${escapeHtml(l.value)}</strong></td>
                       <td>${escapeHtml(l.normalRange)}</td>
                       <td>${escapeHtml(l.meaningSimple)}</td>
                     </tr>`
                   )
                   .join('')}
               </tbody>
             </table>`
          : ''
      }
      ${
        params.questionsForDoctor.length > 0
          ? `<h3 style="font-size:14px; margin:14px 0 6px;">अर्को पटक डाक्टरलाई सोध्ने प्रश्नहरू</h3>
             <ol style="padding-left:18px; margin:4px 0; font-size:12px;">
               ${params.questionsForDoctor.map((q) => `<li style="margin-bottom:4px;">${escapeHtml(q)}</li>`).join('')}
             </ol>`
          : ''
      }
      <p style="font-size:10px; color:#64748b; margin-top:14px;">Medical Note: This guide translates report values and abbreviations for easier understanding. Always follow your licensed doctor's final medical advice.</p>
    `,
    includeSignatureBlock: false,
    footerNote: 'Prepared via NepalAI Health Report & Prescription Translator (https://nepalai.tech/tools/health-translator)',
  });
}

export function exportSarkariChecklistPdf(params: {
  titleEn: string;
  titleNe: string;
  officeNe: string;
  estimatedFeeNe: string;
  estimatedTimeNe: string;
  officialPortal: string;
  docs: Array<{ labelEn: string; labelNe: string; mandatory: boolean; checked: boolean }>;
  steps: Array<{ stepNo: number; counterNameNe: string; actionNe: string }>;
  mistakes: Array<{ ne: string; en: string }>;
}): void {
  exportBrandedPdfDocument({
    documentTitle: `Sarkari_Guide_${params.titleEn.replace(/\s+/g, '_')}`,
    headerTitleEn: params.titleEn,
    headerTitleNe: `${params.titleNe} — कार्यालय कागजात र काउन्टर गाइड`,
    badgeText: 'Zero-Mistake Counter Checklist',
    metadataRows: [
      { label: 'Office (कार्यालय)', value: params.officeNe },
      { label: 'Official Fee (सरकारी दस्तुर)', value: params.estimatedFeeNe },
      { label: 'Realistic Time (अनुमानित समय)', value: params.estimatedTimeNe },
      { label: 'Official Portal', value: params.officialPortal },
    ],
    bodyHtml: `
      <h3 style="font-size:13.5px; margin:12px 0 6px;">१. घरबाट हिँड्नुअघि तयार गर्ने कागजातहरू (Document Checklist)</h3>
      <table>
        <thead>
          <tr><th>अवस्था</th><th>आवश्यक कागजात (Document)</th><th>प्रकार</th></tr>
        </thead>
        <tbody>
          ${params.docs
            .map(
              (d) => `<tr>
                <td style="text-align:center; font-size:14px;">${d.checked ? '☑️' : '☐'}</td>
                <td><strong>${escapeHtml(d.labelNe)}</strong><br/><span style="font-size:10px; color:#475569;">${escapeHtml(d.labelEn)}</span></td>
                <td>${d.mandatory ? 'अनिवार्य (Required)' : 'सहायक (If Applicable)'}</td>
              </tr>`
            )
            .join('')}
        </tbody>
      </table>
      <h3 style="font-size:13.5px; margin:14px 0 6px;">२. कार्यालय भित्रको काउन्टर क्रम (Counter-by-Counter Flow)</h3>
      <table>
        <thead>
          <tr><th>क्रम</th><th>काउन्टर / डेस्क</th><th>के गर्ने?</th></tr>
        </thead>
        <tbody>
          ${params.steps
            .map(
              (s) => `<tr>
                <td style="text-align:center; font-weight:700;">${s.stepNo}</td>
                <td><strong>${escapeHtml(s.counterNameNe)}</strong></td>
                <td>${escapeHtml(s.actionNe)}</td>
              </tr>`
            )
            .join('')}
        </tbody>
      </table>
      <h3 style="font-size:13.5px; margin:14px 0 6px;">३. दोस्रो पटक धाउन नपर्ने सावधानी (Avoid Rejection)</h3>
      <ul style="padding-left:18px; margin:4px 0; font-size:11.5px;">
        ${params.mistakes.map((m) => `<li style="margin-bottom:4px;">${escapeHtml(m.ne)} (${escapeHtml(m.en)})</li>`).join('')}
      </ul>
    `,
    includeSignatureBlock: false,
    footerNote: 'Prepared via NepalAI Sarkari Kaam Counter Navigator (https://nepalai.tech/tools/sarkari-guide)',
  });
}





