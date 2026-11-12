/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Nepal Income Tax Act 2058, Section 95Ka (दफा ९५क) IT Software Export Engine
 * Computes 5% individual / 1% corporate final withholding tax on foreign currency software & BPO exports,
 * and generates official bank declaration letters for commercial bank wire clearing.
 */

export interface ItExportParams {
  inwardAmountUsd: number;
  nrbBuyRateNpr?: number; // e.g. 135.30
  entityType: 'individual_freelancer' | 'registered_company';
  freelancerName: string;
  panNumber: string;
  bankName: string;
  bankBranch: string;
  bankAccountNumber: string;
  foreignClientOrPlatform: string; // e.g. "Upwork Global Inc. / Remote Client"
  serviceType: string; // e.g. "Software Architecture & AI Development"
}

export interface ItExportResult {
  grossAmountNpr: number;
  tdsRatePercent: number;
  tdsAmountNpr: number;
  netDepositedNpr: number;
  effectiveExchangeRateNpr: number;
  selfDeclarationLetterNe: string;
  selfDeclarationLetterEn: string;
}

export function calculateItExportRemittance(params: ItExportParams): ItExportResult {
  const {
    inwardAmountUsd,
    nrbBuyRateNpr = 135.30,
    entityType,
    freelancerName,
    panNumber,
    bankName,
    bankBranch,
    bankAccountNumber,
    foreignClientOrPlatform,
    serviceType,
  } = params;

  const grossNpr = Math.round(inwardAmountUsd * nrbBuyRateNpr * 100) / 100;
  
  // Section 95Ka: 5% final withholding tax for individuals / 1% for companies
  const tdsRate = entityType === 'individual_freelancer' ? 5.0 : 1.0;
  const tdsAmt = Math.round((grossNpr * (tdsRate / 100)) * 100) / 100;
  const netNpr = Math.round((grossNpr - tdsAmt) * 100) / 100;
  const effectiveRate = Number((netNpr / (inwardAmountUsd || 1)).toFixed(2));

  const todayAd = new Date().toISOString().split('T')[0];

  // Official Nepali Bank Declaration Template
  const letterNe = `
मिति: ${todayAd}

श्रीमान् शाखा प्रबन्धक ज्यू,
${bankName}, ${bankBranch} शाखा, नेपाल।

विषय: आयकर ऐन, २०५८ को दफा ९५(क) बमोजिम सफ्टवेयर/सूचना प्रविधि निर्यात बापत अन्तिम कर कट्टी गरी रकम जम्मा गरिदिने सम्बन्धमा।

महोदय,
उपरोक्त सम्बन्धमा, म निवेदक ${freelancerName} (स्थायी लेखा नम्बर / PAN: ${panNumber}) ले विदेशस्थित सेवाग्राही (${foreignClientOrPlatform}) लाई नेपालमै बसी सूचना प्रविधि तथा सफ्टवेयर सम्बन्धी सेवा (${serviceType}) प्रदान गरे बापत प्राप्त भएको विदेशी मुद्रा USD $${inwardAmountUsd.toLocaleString('en-US')} मेरो यस बैंकमा रहेको खाता नं ${bankAccountNumber} मा प्राप्त भएको छ।

नेपाल सरकार, अर्थ मन्त्रालय, आन्तरिक राजस्व विभाग तथा आयकर ऐन, २०५८ को दफा ९५(क) अनुसार सूचना प्रविधि सेवा निर्यात गरे बापत प्राप्त रकममा ५% (व्यक्तिगत हकमा) अन्तिम कर कट्टी (Final Withholding TDS) हुने कानूनी व्यवस्था रहेकोले सो बमोजिम रू ${tdsAmt.toLocaleString('en-IN')} (पाँच प्रतिशत) कर कट्टी गरी बाँकी खुद रकम रू ${netNpr.toLocaleString('en-IN')} मेरो बैंक खातामा जम्मा गरिदिनुहुन यो स्वघोषणा पत्र पेश गरेको छु।

यसमा उल्लेखित विवरण सत्य तथ्य रहेको र कुनै झुट्टा ठहरिए प्रचलित कानून बमोजिम जवाफदेही हुनेछु।

निवेदक:
नाम: ${freelancerName}
प्यान नं: ${panNumber}
खाता नं: ${bankAccountNumber}
हस्ताक्षर: _______________________
`.trim();

  const letterEn = `
Date: ${todayAd}

To: The Branch Manager
${bankName}, ${bankBranch} Branch, Nepal.

Subject: Request for Inward IT Remittance Credit under Income Tax Act Section 95Ka (Final TDS)

Dear Sir/Madam,
I, ${freelancerName} (PAN: ${panNumber}), holding Account No: ${bankAccountNumber} at your branch, have received an inward foreign currency remittance of USD $${inwardAmountUsd.toLocaleString('en-US')} from ${foreignClientOrPlatform} as consideration for Information Technology & Software Export Services (${serviceType}).

As per Section 95Ka of the Income Tax Act 2058 (amended by the Finance Act), payments received in foreign currency for IT and software exports are subject to a final withholding TDS of 5% for individuals (1% for registered entities).

Kindly deduct the statutory 5% TDS amounting to NPR रू ${tdsAmt.toLocaleString('en-IN')} and credit the net amount of NPR रू ${netNpr.toLocaleString('en-IN')} to my account.

Beneficiary: ${freelancerName}
PAN: ${panNumber}
Account: ${bankAccountNumber}
Signature: _______________________
`.trim();

  return {
    grossAmountNpr: grossNpr,
    tdsRatePercent: tdsRate,
    tdsAmountNpr: tdsAmt,
    netDepositedNpr: netNpr,
    effectiveExchangeRateNpr: effectiveRate,
    selfDeclarationLetterNe: letterNe,
    selfDeclarationLetterEn: letterEn,
  };
}
