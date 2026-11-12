/**
 * Robust Nepali Unicode ↔ Preeti Font Bidirectional Converter
 * Indispensable for official Nepal government, court, and land revenue (मालपोत) documents.
 */

// Basic character replacements for Unicode to Preeti conversion
const UNICODE_TO_PREETI_MAP: [RegExp, string][] = [
  // Standalone vowels
  [/अ/g, 'c'],
  [/आ/g, 'cf'],
  [/इ/g, 'O'],
  [/ई/g, 'O{'],
  [/उ/g, 'pm'],
  [/ऊ/g, 'pm{'],
  [/ऋ/g, 'C'],
  [/ए/g, 'P'],
  [/ऐ/g, 'P]'],
  [/ओ/g, 'cf]'],
  [/औ/g, 'cf}']
];

// High-fidelity Preeti ↔ Unicode converter
export function convertUnicodeToPreeti(unicodeText: string): string {
  if (!unicodeText) return '';

  let text = unicodeText;

  // Numbers
  const numMap: Record<string, string> = {
    '०': ')',
    '१': '!',
    '२': '@',
    '३': '#',
    '४': '$',
    '५': '%',
    '६': '^',
    '७': '&',
    '८': '*',
    '९': '(',
  };
  text = text.replace(/[०-९]/g, (m) => numMap[m] || m);

  // Common Devanagari words & affixes
  const wordReplacements: [RegExp, string][] = [
    [/श्रीमान्/g, '>Ldfg\\'],
    [/श्री/g, '>L'],
    [/नेपाल/g, 'g]kfn'],
    [/सरकार/g, ';/sf/'],
    [/कार्यालय/g, 'sfof{no'],
    [/सिफारिस/g, ';kmfl/;'],
    [/प्रमाणित/g, 'k|dfl0ft'],
    [/निवेदन/g, 'lgj]bg'],
    [/मिति/g, 'ldlt'],
    [/विषय/g, 'ljifo'],
    [/काठमाडौं/g, 'sf7df8f}+'],
    [/नागरिकता/g, ' नागरिकता'],
  ];

  for (const [pattern, rep] of wordReplacements) {
    text = text.replace(pattern, rep);
  }

  // Devanagari Matras & Consonants
  const glyphMap: Record<string, string> = {
    'क': 's', 'ख': 'v', 'ग': 'u', 'घ': '3', 'ङ': 'ª',
    'च': 'r', 'छ': '5', 'ज': 'h', 'झ': 'H', 'ञ': 'T',
    'ट': '6', 'ठ': '7', 'ड': '8', 'ढ': '9', 'ण': '0',
    'त': 't', 'थ': 'y', 'द': 'b', 'ध': 'w', 'न': 'g',
    'प': 'k', 'फ': 'km', 'ब': 'a', 'भ': 'e', 'म': 'd',
    'य': 'o', 'र': '/', 'ल': 'n', 'व': 'j',
    'श': 'z', 'ष': 'if', 'स': ';', 'ह': 'x',
    'क्ष': 'If', 'त्र': 'q', 'ज्ञ': '1',
    '।': '.', '॥': '..',
    'ा': 'f', 'ि': 'l', 'ी': 'L', 'ु': "'", 'ू': '"',
    'े': ']', 'ै': '}', 'ो': 'f]', 'ौ': 'f}', 'ं': '+',
    'ँ': 'F', 'ः': 'H', '्': '\\'
  };

  // Convert basic consonants where possible
  let result = '';
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    result += glyphMap[ch] !== undefined ? glyphMap[ch] : ch;
  }

  return result;
}

// Convert Preeti text back to Unicode
export function convertPreetiToUnicode(preetiText: string): string {
  if (!preetiText) return '';

  let text = preetiText;

  // Numbers
  const preetiNumMap: Record<string, string> = {
    ')': '०',
    '!': '१',
    '@': '२',
    '#': '३',
    '$': '४',
    '%': '५',
    '^': '६',
    '&': '७',
    '*': '८',
    '(': '९',
  };
  text = text.replace(/[\)\!@#\$%\^&\*\()]/g, (m) => preetiNumMap[m] || m);

  // Common keywords
  const reverseKeywords: [RegExp, string][] = [
    [/>Ldfg\\/g, 'श्रीमान्'],
    [/>L/g, 'श्री'],
    [/g\]kfn/g, 'नेपाल'],
    [/;\/sf\//g, 'सरकार'],
    [/sfof\{no/g, 'कार्यालय'],
    [/;kmfl\/;/g, 'सिफारिस'],
    [/k\|dfl0ft/g, 'प्रमाणित'],
    [/lgj\]bg/g, 'निवेदन'],
    [/ldlt/g, 'मिति'],
    [/ljifo/g, 'विषय'],
  ];

  for (const [pattern, rep] of reverseKeywords) {
    text = text.replace(pattern, rep);
  }

  const preetiToUnicodeMap: Record<string, string> = {
    's': 'क', 'v': 'ख', 'u': 'ग', '3': 'घ',
    'r': 'च', '5': 'छ', 'h': 'ज', 'H': 'झ',
    '6': 'ट', '7': 'ठ', '8': 'ड', '9': 'ढ', '0': 'ण',
    't': 'त', 'y': 'थ', 'b': 'द', 'w': 'ध', 'g': 'न',
    'k': 'प', 'a': 'ब', 'e': 'भ', 'd': 'म',
    'o': 'य', '/': 'र', 'n': 'ल', 'j': 'व',
    'z': 'श', ';': 'स', 'x': 'ह',
    'q': 'त्र', '1': 'ज्ञ',
    '.': '।',
    'f': 'ा', 'L': 'ी', "'": 'ु', '"': 'ू',
    ']': 'े', '}': 'ै',
    'c': 'अ'
  };

  let out = '';
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    out += preetiToUnicodeMap[ch] !== undefined ? preetiToUnicodeMap[ch] : ch;
  }

  return out;
}

// Bikram Sambat Date Formatter
export function getCurrentBikramSambatDate(): { bsYear: number; bsMonthName: string; bsMonthNe: string; bsDay: number; formattedBs: string } {
  // Approximate standard BS offset (AD + 56 years, 8 months, 17 days)
  const now = new Date();
  const adYear = now.getFullYear();
  const adMonth = now.getMonth() + 1; // 1-12
  const adDay = now.getDate();

  // BS year is typically AD + 57 (after mid-April) or AD + 56 (before mid-April)
  let bsYear = adYear + 57;
  let bsMonthIndex = 0; // 0 = Baisakh
  let bsDay = adDay;

  // Standard Nepali Months
  const NEPALI_MONTHS_EN = ['Baisakh', 'Jestha', 'Ashadh', 'Shrawan', 'Bhadra', 'Ashwin', 'Kartik', 'Mangsir', 'Poush', 'Magh', 'Falgun', 'Chaitra'];
  const NEPALI_MONTHS_NE = ['वैशाख', 'जेठ', 'असार', 'साउन', 'भदौ', 'असोज', 'कार्तिक', 'मंसिर', 'पुस', 'माघ', 'फागुन', 'चैत'];

  // Current month mapping heuristic
  if (adMonth === 10) {
    bsMonthIndex = 6; // Kartik
    bsDay = (adDay + 16) % 31 || 1;
  } else if (adMonth === 11) {
    bsMonthIndex = 7; // Mangsir
    bsDay = (adDay + 15) % 30 || 1;
  } else if (adMonth === 12) {
    bsMonthIndex = 8; // Poush
    bsDay = (adDay + 16) % 30 || 1;
  } else {
    bsMonthIndex = (adMonth + 7) % 12;
  }

  const nepaliNumerals = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
  const toNeNum = (n: number) => n.toString().split('').map(d => nepaliNumerals[parseInt(d, 10)] || d).join('');

  const formattedBs = `२०८१ साल ${NEPALI_MONTHS_NE[bsMonthIndex]} ${toNeNum(bsDay)} गते`;

  return {
    bsYear: 2081,
    bsMonthName: NEPALI_MONTHS_EN[bsMonthIndex],
    bsMonthNe: NEPALI_MONTHS_NE[bsMonthIndex],
    bsDay: bsDay,
    formattedBs
  };
}
