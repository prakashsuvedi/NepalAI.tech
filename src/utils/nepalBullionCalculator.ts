/**
 * Sovereign Gold & Silver (सुन / चाँदी) Bullion & Jewelry Tax Engine
 * Grounded in FENEGOSIDA (Federation of Nepal Gold and Silver Dealers' Association)
 * and Inland Revenue Department (IRD) Nepal Finance Act guidelines.
 * 
 * Standard Conversion Ratios:
 * 1 Tola = 11.664 Grams
 * 1 Tola = 16 Aana (Gold weight system)
 * 1 Tola = 10 Lal (लाल / Centi-tola)
 * 1 Troy Ounce = 31.1035 Grams = 2.6666 Tolas
 */

export type BullionType = 'chhapawal_gold' | 'tejabi_gold' | 'silver';

export interface BullionRates {
  chhapawalGoldPerTola: number; // 24K 99.9% fine gold
  tejabiGoldPerTola: number;     // 22K 91.6% hallmark gold
  silverPerTola: number;         // Fine silver
  lastUpdated: string;
}

export const DEFAULT_FENEGOSIDA_RATES: BullionRates = {
  chhapawalGoldPerTola: 162500, // NPR per tola (24 Karat)
  tejabiGoldPerTola: 161700,    // NPR per tola (22 Karat)
  silverPerTola: 1960,          // NPR per tola (Fine Silver)
  lastUpdated: 'Live FENEGOSIDA Standard Benchmark',
};

export interface JewelryCalculationInput {
  bullionType: BullionType;
  // Weight input options
  inputMode: 'tola_aana_lal' | 'grams';
  tola?: number;
  aana?: number;
  lal?: number;
  grams?: number;
  // Custom rate override (optional, defaults to FENEGOSIDA)
  customRatePerTola?: number;
  // Making Charges (ज्याला)
  makingChargeType: 'flat_per_tola' | 'total_flat' | 'percentage';
  makingChargeValue: number;
  // Wastage / Melting Loss (जर्ती) in percentage (e.g. 2.5%)
  wastagePercent: number;
  // Regulatory & Retail Taxes
  includeLuxuryTax?: boolean; // 2% luxury tax for high-value purchases under Finance Act
  includeVat?: boolean;       // 13% VAT if purchasing with official IRD Tax Invoice
}

export interface JewelryCalculationResult {
  bullionType: BullionType;
  ratePerTola: number;
  ratePerGram: number;
  ratePer10Gram: number;
  // Weights
  pureWeightGrams: number;
  pureWeightTolas: number;
  pureWeightFormattedNe: string;
  pureWeightFormattedEn: string;
  // Wastage (जर्ती)
  wastageWeightGrams: number;
  wastageWeightTolas: number;
  wastageCostNpr: number;
  totalBilledWeightGrams: number;
  totalBilledWeightTolas: number;
  // Financial breakdown
  rawMetalCostNpr: number;
  metalWithWastageCostNpr: number;
  makingChargeNpr: number;
  subtotalBeforeTaxNpr: number;
  luxuryTaxRatePercent: number;
  luxuryTaxNpr: number;
  vatRatePercent: number;
  vatNpr: number;
  finalTotalNpr: number;
  // Customer Protection Metrics
  markupPercentageOverRawMetal: number; // How much above raw metal the jeweler is charging
  effectivePerGramCostNpr: number;
}

/**
 * Converts traditional Tola-Aana-Lal to Grams
 * 1 Tola = 16 Aana
 * 1 Tola = 10 Lal (1 Aana = 0.625 Lal)
 * 1 Tola = 11.664 Grams
 */
export function convertTolaAanaLalToGrams(tola = 0, aana = 0, lal = 0): number {
  const totalTolas = tola + (aana / 16) + (lal / 10);
  return Number((totalTolas * 11.664).toFixed(4));
}

/**
 * Converts Grams to Tola-Aana-Lal breakdown
 */
export function convertGramsToTolaBreakdown(grams: number): {
  totalTolas: number;
  tola: number;
  aana: number;
  lal: number;
  formattedNe: string;
  formattedEn: string;
} {
  const totalTolas = grams / 11.664;
  const tola = Math.floor(totalTolas);
  const remainingAfterTola = (totalTolas - tola) * 16;
  const aana = Math.floor(remainingAfterTola);
  const remainingAfterAana = (remainingAfterTola - aana) * 0.625 * 10;
  const lal = Math.round(remainingAfterAana * 10) / 10;

  return {
    totalTolas: Number(totalTolas.toFixed(4)),
    tola,
    aana,
    lal,
    formattedNe: `${tola} तोला ${aana} आना ${lal} लाल (${grams.toFixed(2)} ग्राम)`,
    formattedEn: `${tola} Tola ${aana} Aana ${lal} Lal (${grams.toFixed(2)} g)`,
  };
}

/**
 * Calculates complete transparent jewelry purchase breakdown
 */
export function calculateJewelryCost(input: JewelryCalculationInput): JewelryCalculationResult {
  // 1. Resolve Active Rate
  let ratePerTola = input.customRatePerTola;
  if (!ratePerTola || ratePerTola <= 0) {
    if (input.bullionType === 'chhapawal_gold') {
      ratePerTola = DEFAULT_FENEGOSIDA_RATES.chhapawalGoldPerTola;
    } else if (input.bullionType === 'tejabi_gold') {
      ratePerTola = DEFAULT_FENEGOSIDA_RATES.tejabiGoldPerTola;
    } else {
      ratePerTola = DEFAULT_FENEGOSIDA_RATES.silverPerTola;
    }
  }

  const ratePerGram = ratePerTola / 11.664;
  const ratePer10Gram = ratePerGram * 10;

  // 2. Resolve Pure Weight in Grams & Tolas
  let pureWeightGrams = 0;
  if (input.inputMode === 'grams') {
    pureWeightGrams = Math.max(0, input.grams || 0);
  } else {
    pureWeightGrams = convertTolaAanaLalToGrams(input.tola || 0, input.aana || 0, input.lal || 0);
  }

  const pureWeightTolas = pureWeightGrams / 11.664;
  const tolaBreakdown = convertGramsToTolaBreakdown(pureWeightGrams);

  // 3. Raw Metal Cost without markup
  const rawMetalCostNpr = pureWeightTolas * ratePerTola;

  // 4. Wastage (जर्ती) computation
  const wastagePercent = Math.max(0, input.wastagePercent || 0);
  const wastageWeightGrams = (pureWeightGrams * wastagePercent) / 100;
  const wastageWeightTolas = wastageWeightGrams / 11.664;
  const wastageCostNpr = wastageWeightTolas * ratePerTola;

  const totalBilledWeightGrams = pureWeightGrams + wastageWeightGrams;
  const totalBilledWeightTolas = pureWeightTolas + wastageWeightTolas;
  const metalWithWastageCostNpr = totalBilledWeightTolas * ratePerTola;

  // 5. Making Charges (ज्याला) computation
  let makingChargeNpr = 0;
  if (input.makingChargeType === 'flat_per_tola') {
    makingChargeNpr = pureWeightTolas * (input.makingChargeValue || 0);
  } else if (input.makingChargeType === 'total_flat') {
    makingChargeNpr = Math.max(0, input.makingChargeValue || 0);
  } else if (input.makingChargeType === 'percentage') {
    makingChargeNpr = (rawMetalCostNpr * Math.max(0, input.makingChargeValue || 0)) / 100;
  }

  // 6. Subtotal before taxes
  const subtotalBeforeTaxNpr = metalWithWastageCostNpr + makingChargeNpr;

  // 7. Taxes
  const luxuryTaxRatePercent = input.includeLuxuryTax ? 2.0 : 0;
  const luxuryTaxNpr = (subtotalBeforeTaxNpr * luxuryTaxRatePercent) / 100;

  const preVatAmount = subtotalBeforeTaxNpr + luxuryTaxNpr;
  const vatRatePercent = input.includeVat ? 13.0 : 0;
  const vatNpr = (preVatAmount * vatRatePercent) / 100;

  const finalTotalNpr = Math.round(preVatAmount + vatNpr);

  // 8. Protection Metrics
  const totalMarkupNpr = finalTotalNpr - rawMetalCostNpr;
  const markupPercentageOverRawMetal = rawMetalCostNpr > 0 
    ? Number(((totalMarkupNpr / rawMetalCostNpr) * 100).toFixed(2)) 
    : 0;

  const effectivePerGramCostNpr = pureWeightGrams > 0 
    ? Math.round(finalTotalNpr / pureWeightGrams) 
    : 0;

  return {
    bullionType: input.bullionType,
    ratePerTola,
    ratePerGram: Math.round(ratePerGram),
    ratePer10Gram: Math.round(ratePer10Gram),
    pureWeightGrams: Number(pureWeightGrams.toFixed(3)),
    pureWeightTolas: Number(pureWeightTolas.toFixed(4)),
    pureWeightFormattedNe: tolaBreakdown.formattedNe,
    pureWeightFormattedEn: tolaBreakdown.formattedEn,
    wastageWeightGrams: Number(wastageWeightGrams.toFixed(3)),
    wastageWeightTolas: Number(wastageWeightTolas.toFixed(4)),
    wastageCostNpr: Math.round(wastageCostNpr),
    totalBilledWeightGrams: Number(totalBilledWeightGrams.toFixed(3)),
    totalBilledWeightTolas: Number(totalBilledWeightTolas.toFixed(4)),
    rawMetalCostNpr: Math.round(rawMetalCostNpr),
    metalWithWastageCostNpr: Math.round(metalWithWastageCostNpr),
    makingChargeNpr: Math.round(makingChargeNpr),
    subtotalBeforeTaxNpr: Math.round(subtotalBeforeTaxNpr),
    luxuryTaxRatePercent,
    luxuryTaxNpr: Math.round(luxuryTaxNpr),
    vatRatePercent,
    vatNpr: Math.round(vatNpr),
    finalTotalNpr,
    markupPercentageOverRawMetal,
    effectivePerGramCostNpr,
  };
}

/**
 * Historical Return Comparison: Gold vs NEPSE vs Commercial Bank Fixed Deposit (FD)
 */
export interface GoldInvestmentSimulationInput {
  investmentType: 'lump_sum' | 'monthly_sip';
  amountNpr: number;
  durationYears: 1 | 3 | 5 | 10;
  customGoldCagr?: number;  // Default: ~11.8% historical NPR gold CAGR
  customNepseCagr?: number; // Default: ~9.2% historical NEPSE index CAGR
  customFdRate?: number;    // Default: ~8.0% historical commercial bank FD
}

export interface InvestmentComparisonYear {
  year: number;
  investedCapitalNpr: number;
  goldValueNpr: number;
  goldGainNpr: number;
  nepseValueNpr: number;
  nepseGainNpr: number;
  fdValueNpr: number;
  fdGainNpr: number;
}

export interface GoldInvestmentSimulationResult {
  investmentType: 'lump_sum' | 'monthly_sip';
  durationYears: number;
  totalInvestedNpr: number;
  goldCagrPercent: number;
  nepseCagrPercent: number;
  fdRatePercent: number;
  finalGoldValueNpr: number;
  finalNepseValueNpr: number;
  finalFdValueNpr: number;
  goldNetProfitNpr: number;
  nepseNetProfitNpr: number;
  fdNetProfitNpr: number;
  equivalentPureGoldTolasAccumulated: number;
  yearlyBreakdown: InvestmentComparisonYear[];
}

export function simulateGoldInvestment(
  input: GoldInvestmentSimulationInput,
  currentGoldRatePerTola = DEFAULT_FENEGOSIDA_RATES.chhapawalGoldPerTola
): GoldInvestmentSimulationResult {
  const goldCagr = (input.customGoldCagr ?? 11.8) / 100;
  const nepseCagr = (input.customNepseCagr ?? 9.2) / 100;
  const fdRate = (input.customFdRate ?? 8.0) / 100;

  const yearlyBreakdown: InvestmentComparisonYear[] = [];
  const years = input.durationYears;

  let totalInvested = 0;
  let goldVal = 0;
  let nepseVal = 0;
  let fdVal = 0;

  if (input.investmentType === 'lump_sum') {
    totalInvested = input.amountNpr;
    for (let y = 1; y <= years; y++) {
      const g = totalInvested * Math.pow(1 + goldCagr, y);
      const n = totalInvested * Math.pow(1 + nepseCagr, y);
      const f = totalInvested * Math.pow(1 + fdRate, y);
      yearlyBreakdown.push({
        year: y,
        investedCapitalNpr: totalInvested,
        goldValueNpr: Math.round(g),
        goldGainNpr: Math.round(g - totalInvested),
        nepseValueNpr: Math.round(n),
        nepseGainNpr: Math.round(n - totalInvested),
        fdValueNpr: Math.round(f),
        fdGainNpr: Math.round(f - totalInvested),
      });
    }
    goldVal = yearlyBreakdown[years - 1].goldValueNpr;
    nepseVal = yearlyBreakdown[years - 1].nepseValueNpr;
    fdVal = yearlyBreakdown[years - 1].fdValueNpr;
  } else {
    // Monthly SIP compounding
    const monthlyDeposit = input.amountNpr;
    const monthlyGoldRate = Math.pow(1 + goldCagr, 1 / 12) - 1;
    const monthlyNepseRate = Math.pow(1 + nepseCagr, 1 / 12) - 1;
    const monthlyFdRate = Math.pow(1 + fdRate, 1 / 12) - 1;

    let gAccum = 0;
    let nAccum = 0;
    let fAccum = 0;

    for (let y = 1; y <= years; y++) {
      for (let m = 1; m <= 12; m++) {
        gAccum = (gAccum + monthlyDeposit) * (1 + monthlyGoldRate);
        nAccum = (nAccum + monthlyDeposit) * (1 + monthlyNepseRate);
        fAccum = (fAccum + monthlyDeposit) * (1 + monthlyFdRate);
      }
      const investedToDate = monthlyDeposit * 12 * y;
      yearlyBreakdown.push({
        year: y,
        investedCapitalNpr: investedToDate,
        goldValueNpr: Math.round(gAccum),
        goldGainNpr: Math.round(gAccum - investedToDate),
        nepseValueNpr: Math.round(nAccum),
        nepseGainNpr: Math.round(nAccum - investedToDate),
        fdValueNpr: Math.round(fAccum),
        fdGainNpr: Math.round(fAccum - investedToDate),
      });
    }
    totalInvested = monthlyDeposit * 12 * years;
    goldVal = Math.round(gAccum);
    nepseVal = Math.round(nAccum);
    fdVal = Math.round(fAccum);
  }

  const equivalentTolas = currentGoldRatePerTola > 0 ? Number((goldVal / currentGoldRatePerTola).toFixed(2)) : 0;

  return {
    investmentType: input.investmentType,
    durationYears: years,
    totalInvestedNpr: totalInvested,
    goldCagrPercent: Number((goldCagr * 100).toFixed(1)),
    nepseCagrPercent: Number((nepseCagr * 100).toFixed(1)),
    fdRatePercent: Number((fdRate * 100).toFixed(1)),
    finalGoldValueNpr: goldVal,
    finalNepseValueNpr: nepseVal,
    finalFdValueNpr: fdVal,
    goldNetProfitNpr: goldVal - totalInvested,
    nepseNetProfitNpr: nepseVal - totalInvested,
    fdNetProfitNpr: fdVal - totalInvested,
    equivalentPureGoldTolasAccumulated: equivalentTolas,
    yearlyBreakdown,
  };
}
