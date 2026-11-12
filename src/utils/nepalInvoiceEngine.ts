/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Nepal Inland Revenue Department (IRD) Compliant Tax Invoice & Currency Words Engine
 * Conforms to IRD Value Added Tax Act 2052, Schedule 5 (कर बिजक अनुसूची ५).
 */

const ONES_NE: string[] = ['', 'एक', 'दुई', 'तीन', 'चार', 'पाँच', 'छ', 'सात', 'आठ', 'नौ', 'दस', 'एघार', 'बाह्र', 'तेह्र', 'चौध', 'पन्ध्र', 'सोह्र', 'सत्र', 'अठार', 'उन्नाइस', 'बीस'];
const TENS_NE: Record<number, string> = {
  20: 'बीस', 30: 'तीस', 40: 'चालीस', 50: 'पचास', 60: 'साठी', 70: 'सत्तरी', 80: 'असी', 90: 'नब्बे'
};

const ONES_EN: string[] = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
const TENS_EN: string[] = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

export function numberToEnglishWords(num: number): string {
  if (num === 0) return 'Zero Rupees Only';
  const n = Math.floor(Math.abs(num));

  function convertChunk(val: number): string {
    if (val === 0) return '';
    if (val < 20) return ONES_EN[val] + ' ';
    if (val < 100) return TENS_EN[Math.floor(val / 10)] + ' ' + (val % 10 !== 0 ? ONES_EN[val % 10] + ' ' : '');
    return ONES_EN[Math.floor(val / 100)] + ' Hundred ' + (val % 100 !== 0 ? convertChunk(val % 100) : '');
  }

  let words = '';
  const crore = Math.floor(n / 10000000);
  const lakh = Math.floor((n % 10000000) / 100000);
  const thousand = Math.floor((n % 100000) / 1000);
  const remainder = n % 1000;

  if (crore > 0) words += convertChunk(crore) + 'Crore ';
  if (lakh > 0) words += convertChunk(lakh) + 'Lakh ';
  if (thousand > 0) words += convertChunk(thousand) + 'Thousand ';
  if (remainder > 0) words += convertChunk(remainder);

  return words.trim() + ' Rupees Only';
}

export function numberToNepaliWords(num: number): string {
  if (num === 0) return 'शून्य रुपैयाँ मात्र';
  const n = Math.floor(Math.abs(num));

  function convertSmall(val: number): string {
    if (val === 0) return '';
    if (val <= 20) return ONES_NE[val] + ' ';
    const tensDigit = Math.floor(val / 10) * 10;
    const onesDigit = val % 10;
    const tensWord = TENS_NE[tensDigit] || '';
    const onesWord = onesDigit > 0 ? ONES_NE[onesDigit] : '';
    return (tensWord + ' ' + onesWord).trim() + ' ';
  }

  function convertUnderThousand(val: number): string {
    let res = '';
    const hundreds = Math.floor(val / 100);
    const rest = val % 100;
    if (hundreds > 0) {
      res += ONES_NE[hundreds] + ' सय ';
    }
    if (rest > 0) {
      res += convertSmall(rest);
    }
    return res;
  }

  let out = '';
  const crore = Math.floor(n / 10000000);
  const lakh = Math.floor((n % 10000000) / 100000);
  const thousand = Math.floor((n % 100000) / 1000);
  const rem = n % 1000;

  if (crore > 0) out += convertUnderThousand(crore) + 'करोड ';
  if (lakh > 0) out += convertUnderThousand(lakh) + 'लाख ';
  if (thousand > 0) out += convertUnderThousand(thousand) + 'हजार ';
  if (rem > 0) out += convertUnderThousand(rem);

  return out.trim() + ' रुपैयाँ मात्र';
}

export interface IrdTaxInvoiceData {
  invoiceNumber: string;
  billDateBs: string;
  billDateAd: string;
  sellerName: string;
  sellerPan: string;
  sellerAddress: string;
  sellerPhone?: string;
  buyerName: string;
  buyerPan?: string;
  buyerAddress: string;
  buyerPhone?: string;
  paymentMethod: string;
  items: Array<{
    sn: number;
    title: string;
    quantity: number;
    unitPriceNpr: number;
    totalNpr: number;
  }>;
  subtotalNpr: number;
  discountNpr: number;
  taxableAmountNpr: number;
  vat13PercentNpr: number;
  deliveryChargeNpr: number;
  grandTotalNpr: number;
  amountInWordsNe: string;
  amountInWordsEn: string;
  irdQrPayload: string;
}

/**
 * Calculates official IRD 13% VAT and subtotal breakdown
 */
export function calculateIrdTax(
  items: Array<{ title: string; quantity: number | string; unitPriceNpr: number | string }>,
  deliveryCharge = 0,
  discount = 0,
  isVatRegistered = true
): {
  subtotalNpr: number;
  discountNpr: number;
  taxableAmountNpr: number;
  vat13PercentNpr: number;
  deliveryChargeNpr: number;
  grandTotalNpr: number;
  itemsCalculated: Array<{
    sn: number;
    title: string;
    quantity: number;
    unitPriceNpr: number;
    totalNpr: number;
  }>;
} {
  let subtotal = 0;
  const itemsCalculated = items.map((item, index) => {
    const qty = Number(item.quantity) || 1;
    const rate = Number(item.unitPriceNpr) || 0;
    const lineTotal = qty * rate;
    subtotal += lineTotal;
    return {
      sn: index + 1,
      title: item.title,
      quantity: qty,
      unitPriceNpr: rate,
      totalNpr: lineTotal,
    };
  });

  const disc = Number(discount) || 0;
  const delivery = Number(deliveryCharge) || 0;
  const taxable = Math.max(0, subtotal - disc);
  const vat = isVatRegistered ? Math.round(taxable * 0.13) : 0;
  const grandTotal = taxable + vat + delivery;

  return {
    subtotalNpr: subtotal,
    discountNpr: disc,
    taxableAmountNpr: taxable,
    vat13PercentNpr: vat,
    deliveryChargeNpr: delivery,
    grandTotalNpr: grandTotal,
    itemsCalculated,
  };
}
