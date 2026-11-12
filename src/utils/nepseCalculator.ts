/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * NEPSE (Nepal Stock Exchange) & SEBON Capital Intelligence Terminal
 * Computes Capital Gains Tax (CGT), SEBON Regulatory Fees, DP Charges, Broker Tiered Slabs,
 * Break-Even targets, and Bonus/Right Share Book-Close Price Adjustments.
 */

export interface NepseTradeParams {
  units: number;
  buyPrice: number;
  sellPrice: number;
  holdingPeriod: 'short_term' | 'long_term' | 'corporate'; // <365 days = 7.5%, >=365 days = 5.0%, Corporate = 10.0%
}

export interface NepseTradeResult {
  totalPurchaseAmount: number;
  totalSalesAmount: number;
  grossProfitNpr: number;
  buyBrokerCommission: number;
  sellBrokerCommission: number;
  totalBrokerCommission: number;
  sebonFeeNpr: number;
  dpChargeNpr: number; // NPR 25 per settlement
  capitalGainsTaxNpr: number;
  cgtRatePercent: number;
  netReceivableNpr: number;
  netProfitLossNpr: number;
  returnOnInvestmentPercent: number;
  breakEvenSellPrice: number;
}

/**
 * Calculates tiered NEPSE broker commission as per SEBON regulations
 * Slab 1: Up to 50,000 -> 0.40%
 * Slab 2: 50,001 to 5,00,000 -> 0.37%
 * Slab 3: 5,00,001 to 20,00,000 -> 0.34%
 * Slab 4: 20,00,001 to 1,00,00,000 -> 0.30%
 * Slab 5: Above 1,00,00,000 -> 0.27%
 * Minimum commission: NPR 10
 */
export function calculateBrokerCommission(tradeAmount: number): number {
  if (tradeAmount <= 0) return 0;

  let comm = 0;
  if (tradeAmount <= 50000) {
    comm = tradeAmount * 0.0040;
  } else if (tradeAmount <= 500000) {
    comm = tradeAmount * 0.0037;
  } else if (tradeAmount <= 2000000) {
    comm = tradeAmount * 0.0034;
  } else if (tradeAmount <= 10000000) {
    comm = tradeAmount * 0.0030;
  } else {
    comm = tradeAmount * 0.0027;
  }

  return Math.max(10, Math.round(comm * 100) / 100);
}

/**
 * Computes full NEPSE trade P&L and regulatory deductions
 */
export function calculateNepseTrade(params: NepseTradeParams): NepseTradeResult {
  const { units, buyPrice, sellPrice, holdingPeriod } = params;

  const totalBuy = units * buyPrice;
  const totalSell = units * sellPrice;

  // Broker commissions
  const buyComm = calculateBrokerCommission(totalBuy);
  const sellComm = calculateBrokerCommission(totalSell);
  const totalComm = Math.round((buyComm + sellComm) * 100) / 100;

  // SEBON Regulatory Fee (0.015% on both buy and sell)
  const buySebon = totalBuy * 0.00015;
  const sellSebon = totalSell * 0.00015;
  const sebonFee = Math.round((buySebon + sellSebon) * 100) / 100;

  // DP (Depository Participant) Fee: NPR 25 per transaction on sale
  const dpFee = totalSell > 0 ? 25 : 0;

  // Effective purchase cost
  const effectiveCost = totalBuy + buyComm + buySebon;

  // Effective sales proceeds before tax
  const effectiveProceedsBeforeTax = totalSell - sellComm - sellSebon - dpFee;

  const netGain = effectiveProceedsBeforeTax - effectiveCost;

  let cgtRate = 7.5;
  if (holdingPeriod === 'long_term') {
    cgtRate = 5.0;
  } else if (holdingPeriod === 'corporate') {
    cgtRate = 10.0;
  }

  let cgt = 0;
  if (netGain > 0) {
    cgt = Math.round((netGain * (cgtRate / 100)) * 100) / 100;
  }

  const netReceivable = Math.round((effectiveProceedsBeforeTax - cgt) * 100) / 100;
  const netProfitLoss = Math.round((netGain - cgt) * 100) / 100;
  const roi = effectiveCost > 0 ? Math.round((netProfitLoss / effectiveCost) * 10000) / 100 : 0;

  // Break-even price calculation: solving for sellPrice where netGain = 0
  // sellAmount * (1 - 0.0040 - 0.00015) - 25 = effectiveCost
  const breakEvenTotalSell = (effectiveCost + dpFee) / (1 - 0.0040 - 0.00015);
  const breakEvenSellPrice = units > 0 ? Math.round((breakEvenTotalSell / units) * 100) / 100 : buyPrice;

  return {
    totalPurchaseAmount: totalBuy,
    totalSalesAmount: totalSell,
    grossProfitNpr: totalSell - totalBuy,
    buyBrokerCommission: buyComm,
    sellBrokerCommission: sellComm,
    totalBrokerCommission: totalComm,
    sebonFeeNpr: sebonFee,
    dpChargeNpr: dpFee,
    capitalGainsTaxNpr: cgt,
    cgtRatePercent: cgtRate,
    netReceivableNpr: netReceivable,
    netProfitLossNpr: netProfitLoss,
    returnOnInvestmentPercent: roi,
    breakEvenSellPrice: breakEvenSellPrice,
  };
}

/**
 * Computes bonus and right share post-book-close adjusted prices
 */
export function calculateBookCloseAdjustments(params: {
  marketPriceBeforeBookClose: number;
  bonusPercent?: number; // e.g. 15 for 15%
  rightPercent?: number; // e.g. 20 for 20% (1:0.2)
  paidUpValue?: number; // Default NPR 100
}) {
  const { marketPriceBeforeBookClose: p, bonusPercent = 0, rightPercent = 0, paidUpValue = 100 } = params;

  const bFraction = bonusPercent / 100;
  const rFraction = rightPercent / 100;

  // NEPSE Formula:
  // Adjusted Price = (Market Price + (Right Fraction * Paid Up Value)) / (1 + Bonus Fraction + Right Fraction)
  const adjustedPrice = Math.round(((p + (rFraction * paidUpValue)) / (1 + bFraction + rFraction)) * 100) / 100;

  return {
    originalPrice: p,
    adjustedPriceNpr: adjustedPrice,
    priceDifferenceNpr: Math.round((p - adjustedPrice) * 100) / 100,
    bonusPercent,
    rightPercent,
  };
}
