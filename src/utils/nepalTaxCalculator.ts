/**
 * Nepal Income Tax & IT Export TDS Engine
 * Strictly aligned with Nepal Inland Revenue Department (IRD / आन्तरिक राजस्व विभाग)
 * and the latest Nepal Finance Act (आर्थिक ऐन २०८१/२०८२)
 */

export interface TaxCalculationInput {
  status: 'single' | 'married';
  monthlyGrossSalary: number; // In NPR
  includeDashainBonus: boolean; // Standard 13th-month Dashain allowance
  isItExportFreelancer: boolean; // 5% TDS Final Tax under Section 95Ka
  isItExportCompany: boolean; // 1% Corporate Export TDS
  isSsfEnrolled: boolean; // If enrolled in Social Security Fund, first slab 1% is exempt
  isFemaleSingle: boolean; // 10% tax rebate under Nepal Tax Law
  epfMonthly: number; // Employee Provident Fund
  citMonthly: number; // Citizen Investment Trust
  annualLifeInsurance: number; // Max eligible: Rs. 40,000
  annualHealthInsurance: number; // Max eligible: Rs. 20,000
}

export interface TaxSlabBreakdown {
  slabName: string;
  slabNameNe: string;
  taxableAmount: number;
  ratePercent: number;
  taxAmount: number;
}

export interface TaxCalculationResult {
  annualGross: number;
  annualDashainBonus: number;
  totalAnnualIncome: number;
  totalDeductions: number;
  netTaxableIncome: number;
  slabs: TaxSlabBreakdown[];
  totalAnnualTax: number;
  femaleRebateAmount: number;
  finalAnnualTax: number;
  monthlyTaxTds: number;
  monthlyNetTakeHome: number;
  effectiveTaxRatePercent: number;
  isFinalTds: boolean;
  legalNote: string;
  legalNoteNe: string;
}

export function calculateNepalIncomeTax(input: TaxCalculationInput): TaxCalculationResult {
  const monthsCount = input.includeDashainBonus ? 13 : 12;
  const annualGross = input.monthlyGrossSalary * 12;
  const annualDashainBonus = input.includeDashainBonus ? input.monthlyGrossSalary : 0;
  const totalAnnualIncome = annualGross + annualDashainBonus;

  // 1. Special Case: IT & Software Export to Foreign Clients (Section 95Ka)
  if (input.isItExportFreelancer) {
    const flatTdsRate = 5; // 5% Final Withholding Tax for Individual Tech Exporters
    const finalAnnualTax = totalAnnualIncome * (flatTdsRate / 100);
    const monthlyTaxTds = finalAnnualTax / monthsCount;
    return {
      annualGross,
      annualDashainBonus,
      totalAnnualIncome,
      totalDeductions: 0,
      netTaxableIncome: totalAnnualIncome,
      slabs: [
        {
          slabName: 'IT Software Export TDS (Section 95Ka)',
          slabNameNe: 'सफ्टवेयर तथा सूचना प्रविधि सेवा निर्यात (दफा ९५क)',
          taxableAmount: totalAnnualIncome,
          ratePercent: 5,
          taxAmount: finalAnnualTax
        }
      ],
      totalAnnualTax: finalAnnualTax,
      femaleRebateAmount: 0,
      finalAnnualTax,
      monthlyTaxTds,
      monthlyNetTakeHome: input.monthlyGrossSalary - monthlyTaxTds,
      effectiveTaxRatePercent: 5.0,
      isFinalTds: true,
      legalNote: 'Under Section 95Ka of Nepal Income Tax Act, 5% TDS deducted by commercial banks on foreign currency software & IT export receipts is treated as FINAL TAX for individual freelancers.',
      legalNoteNe: 'नेपाल आयकर ऐनको दफा ९५क बमोजिम सफ्टवेयर वा सूचना प्रविधि सेवा निर्यात गरी प्राप्त विदेशी मुद्रामा लाग्ने ५% अग्रिम कर नै अन्तिम कर मानिनेछ।'
    };
  }

  if (input.isItExportCompany) {
    const flatTdsRate = 1; // 1% for Registered Entities
    const finalAnnualTax = totalAnnualIncome * (flatTdsRate / 100);
    const monthlyTaxTds = finalAnnualTax / monthsCount;
    return {
      annualGross,
      annualDashainBonus,
      totalAnnualIncome,
      totalDeductions: 0,
      netTaxableIncome: totalAnnualIncome,
      slabs: [
        {
          slabName: 'Registered IT Export Entity (Section 95Ka)',
          slabNameNe: 'दर्ता भएको कम्पनीको सफ्टवेयर निर्यात (दफा ९५क)',
          taxableAmount: totalAnnualIncome,
          ratePercent: 1,
          taxAmount: finalAnnualTax
        }
      ],
      totalAnnualTax: finalAnnualTax,
      femaleRebateAmount: 0,
      finalAnnualTax,
      monthlyTaxTds,
      monthlyNetTakeHome: input.monthlyGrossSalary - monthlyTaxTds,
      effectiveTaxRatePercent: 1.0,
      isFinalTds: true,
      legalNote: 'Registered IT export firms in Nepal enjoy concessional 1% bank TDS with official corporate tax return eligibility.',
      legalNoteNe: 'दर्ता भएको सफ्टवेयर कम्पनीले बैंकबाट भुक्तानी प्राप्त गर्दा १% कट्टी हुन्छ।'
    };
  }

  // 2. Regular Salaried / Employment Income Calculation
  // Calculate allowable deductions:
  // EPF + CIT: Max 1/3 of total salary or Rs. 300,000 (whichever is lower)
  const annualEpfCit = (input.epfMonthly + input.citMonthly) * 12;
  const maxEpfCitAllowed = Math.min(totalAnnualIncome / 3, 300000);
  const eligibleEpfCit = Math.min(annualEpfCit, maxEpfCitAllowed);

  // Life Insurance: Max Rs. 40,000
  const eligibleLifeInsurance = Math.min(input.annualLifeInsurance || 0, 40000);

  // Health Insurance: Max Rs. 20,000
  const eligibleHealthInsurance = Math.min(input.annualHealthInsurance || 0, 20000);

  const totalDeductions = eligibleEpfCit + eligibleLifeInsurance + eligibleHealthInsurance;
  const netTaxableIncome = Math.max(0, totalAnnualIncome - totalDeductions);

  // Slabs setup based on Marital Status (Single vs Married)
  const slabs: TaxSlabBreakdown[] = [];
  let remaining = netTaxableIncome;
  let totalCalculatedTax = 0;

  const isSingle = input.status === 'single';
  const firstSlabLimit = isSingle ? 500000 : 600000;
  const firstSlabRate = input.isSsfEnrolled ? 0 : 1; // 0% if SSF enrolled, else 1% Social Security Tax

  // Slab 1: Up to 5L (Single) / 6L (Married)
  const slab1Amount = Math.min(remaining, firstSlabLimit);
  const slab1Tax = slab1Amount * (firstSlabRate / 100);
  slabs.push({
    slabName: isSingle ? 'First Rs. 5,00,000' : 'First Rs. 6,00,000',
    slabNameNe: isSingle ? 'पहिलो रु. ५,००,०००' : 'पहिलो रु. ६,००,०००',
    taxableAmount: slab1Amount,
    ratePercent: firstSlabRate,
    taxAmount: slab1Tax
  });
  remaining -= slab1Amount;
  totalCalculatedTax += slab1Tax;

  // Slab 2: Next Rs. 2,00,000 @ 10%
  if (remaining > 0) {
    const slab2Limit = 200000;
    const slab2Amount = Math.min(remaining, slab2Limit);
    const slab2Tax = slab2Amount * 0.10;
    slabs.push({
      slabName: isSingle ? 'Next Rs. 2,00,000 (5L - 7L)' : 'Next Rs. 2,00,000 (6L - 8L)',
      slabNameNe: isSingle ? 'दोस्रो रु. २,००,००० (५ देखि ७ लाख)' : 'दोस्रो रु. २,००,००० (६ देखि ८ लाख)',
      taxableAmount: slab2Amount,
      ratePercent: 10,
      taxAmount: slab2Tax
    });
    remaining -= slab2Amount;
    totalCalculatedTax += slab2Tax;
  }

  // Slab 3: Next Rs. 3,00,000 @ 20%
  if (remaining > 0) {
    const slab3Limit = 300000;
    const slab3Amount = Math.min(remaining, slab3Limit);
    const slab3Tax = slab3Amount * 0.20;
    slabs.push({
      slabName: isSingle ? 'Next Rs. 3,00,000 (7L - 10L)' : 'Next Rs. 3,00,000 (8L - 11L)',
      slabNameNe: isSingle ? 'तेस्रो रु. ३,००,००० (७ देखि १० लाख)' : 'तेस्रो रु. ३,००,००० (८ देखि ११ लाख)',
      taxableAmount: slab3Amount,
      ratePercent: 20,
      taxAmount: slab3Tax
    });
    remaining -= slab3Amount;
    totalCalculatedTax += slab3Tax;
  }

  // Slab 4: Next Rs. 10,00,000 (Single: 10L - 20L) / Rs. 9,00,000 (Married: 11L - 20L) @ 30%
  if (remaining > 0) {
    const slab4Limit = isSingle ? 1000000 : 900000;
    const slab4Amount = Math.min(remaining, slab4Limit);
    const slab4Tax = slab4Amount * 0.30;
    slabs.push({
      slabName: isSingle ? 'Next Rs. 10,00,000 (10L - 20L)' : 'Next Rs. 9,00,000 (11L - 20L)',
      slabNameNe: isSingle ? 'चौथो रु. १०,००,००० (१० देखि २० लाख)' : 'चौथो रु. ९,००,००० (११ देखि २० लाख)',
      taxableAmount: slab4Amount,
      ratePercent: 30,
      taxAmount: slab4Tax
    });
    remaining -= slab4Amount;
    totalCalculatedTax += slab4Tax;
  }

  // Slab 5: Above Rs. 20,00,000 up to 50,00,000 @ 36%
  if (remaining > 0) {
    const slab5Limit = 3000000; // 20L to 50L is 30L
    const slab5Amount = Math.min(remaining, slab5Limit);
    const slab5Tax = slab5Amount * 0.36;
    slabs.push({
      slabName: 'Next Rs. 30,00,000 (20L - 50L)',
      slabNameNe: 'पाँचौं रु. ३०,००,००० (२० देखि ५० लाख)',
      taxableAmount: slab5Amount,
      ratePercent: 36,
      taxAmount: slab5Tax
    });
    remaining -= slab5Amount;
    totalCalculatedTax += slab5Tax;
  }

  // Slab 6: Above Rs. 50,00,000 @ 39%
  if (remaining > 0) {
    const slab6Tax = remaining * 0.39;
    slabs.push({
      slabName: 'Above Rs. 50,00,000',
      slabNameNe: 'रु. ५०,००,००० भन्दा माथि',
      taxableAmount: remaining,
      ratePercent: 39,
      taxAmount: slab6Tax
    });
    totalCalculatedTax += slab6Tax;
  }

  // Female Rebate: 10% tax exemption for single female employee
  let femaleRebateAmount = 0;
  if (isSingle && input.isFemaleSingle) {
    femaleRebateAmount = totalCalculatedTax * 0.10;
  }

  const finalAnnualTax = Math.max(0, totalCalculatedTax - femaleRebateAmount);
  const monthlyTaxTds = finalAnnualTax / monthsCount;
  const effectiveTaxRatePercent = totalAnnualIncome > 0 ? (finalAnnualTax / totalAnnualIncome) * 100 : 0;

  return {
    annualGross,
    annualDashainBonus,
    totalAnnualIncome,
    totalDeductions,
    netTaxableIncome,
    slabs,
    totalAnnualTax: totalCalculatedTax,
    femaleRebateAmount,
    finalAnnualTax,
    monthlyTaxTds,
    monthlyNetTakeHome: input.monthlyGrossSalary - monthlyTaxTds - (input.epfMonthly + input.citMonthly),
    effectiveTaxRatePercent: Number(effectiveTaxRatePercent.toFixed(2)),
    isFinalTds: false,
    legalNote: `Calculated under official Inland Revenue Department (IRD) Finance Act slabs for Fiscal Year 2081/2082. ${input.isSsfEnrolled ? '1% Social Security Tax is waived due to active SSF registration.' : '1% Social Security Tax included on initial slab.'}`,
    legalNoteNe: `आन्तरिक राजस्व विभाग (IRD) को आर्थिक वर्ष २०८१/८२ को आधिकारिक कर स्ल्याब अनुसार गणना गरिएको। ${input.isSsfEnrolled ? 'सामाजिक सुरक्षा कोष (SSF) मा आबद्ध भएकाले १% कर छुट छ।' : 'पहिलो स्ल्याबमा १% सामाजिक सुरक्षा कर समावेश छ।'}`
  };
}
