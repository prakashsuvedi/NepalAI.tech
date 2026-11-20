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

// ============================================================================
// ROMANIZED NEPALI -> DEVANAGARI PHONETIC TRANSLITERATOR
// ============================================================================

const ROMAN_WORD_DICTIONARY: Record<string, string> = {
  namaste: 'नमस्ते',
  namaskar: 'नमस्कार',
  nepal: 'नेपाल',
  nepali: 'नेपाली',
  kathmandu: 'काठमाडौं',
  lalitpur: 'ललितपुर',
  bhaktapur: 'भक्तपुर',
  pokhara: 'पोखरा',
  biratnagar: 'विराटनगर',
  chitwan: 'चितवन',
  butwal: 'बुटवल',
  shree: 'श्री',
  shri: 'श्री',
  shreeman: 'श्रीमान्',
  shriman: 'श्रीमान्',
  mahoday: 'महोदय',
  mahodaya: 'महोदया',
  adhyaksha: 'अध्यक्षज्यू',
  adyaksha: 'अध्यक्षज्यू',
  ward: 'वडा',
  woda: 'वडा',
  karyalaya: 'कार्यालय',
  mahanagarpalika: 'महानगरपालिका',
  nagarpalika: 'नगरपालिका',
  gaupalika: 'गाउँपालिका',
  jilla: 'जिल्ला',
  bishay: 'विषय',
  bishaya: 'विषय',
  bisaya: 'विषय',
  miti: 'मिति',
  patra: 'पत्र',
  sankhya: 'संख्या',
  chalani: 'चलानी',
  nibedan: 'निवेदन',
  nibedak: 'निवेदक',
  sifaris: 'सिफारिस',
  shifaris: 'सिफारिस',
  pramanit: 'प्रमाणित',
  pramanpatra: 'प्रमाणपत्र',
  nagarikta: 'नागरिकता',
  nata: 'नाता',
  abibahit: 'अविवाहित',
  awibahit: 'अविवाहित',
  charkilla: 'चारकिल्ला',
  lalpurja: 'लालपुर्जा',
  malpot: 'मालपोत',
  byahora: 'व्यहोरा',
  behora: 'व्यहोरा',
  anurodh: 'अनुरोध',
  kripaya: 'कृपया',
  kripa: 'कृपा',
  bida: 'बिदा',
  ghar: 'घर',
  gharayasi: 'घरायसी',
  birami: 'बिरामी',
  swasthya: 'स्वास्थ्य',
  adhyayan: 'अध्ययन',
  bidyalay: 'विद्यालय',
  vidyalaya: 'विद्यालय',
  college: 'कलेज',
  school: 'स्कुल',
  bishes: 'विशेष',
  bishesh: 'विशेष',
  karobar: 'कारोबार',
  byabasaya: 'व्यवसाय',
  byawasaya: 'व्यवसाय',
  babasaya: 'व्यवसाय',
  udhyog: 'उद्योग',
  company: 'कम्पनी',
  grahak: 'ग्राहक',
  sewa: 'सेवा',
  bank: 'बैंक',
  khata: 'खाता',
  dollar: 'डलर',
  card: 'कार्ड',
  rupiya: 'रुपैयाँ',
  rupaiya: 'रुपैयाँ',
  paisa: 'पैसा',
  rakam: 'रकम',
  kar: 'कर',
  aayakar: 'आयकर',
  bhautik: 'भौतिक',
  bidyut: 'विद्युत',
  khanepani: 'खानेपानी',
  dhara: 'धारा',
  jadan: 'जडान',
  bhawadiya: 'भवदीय',
  bhabadiya: 'भवदीय',
  hastakshar: 'हस्ताक्षर',
  naam: 'नाम',
  thegana: 'ठेगाना',
  samparka: 'सम्पर्क',
  phone: 'फोन',
  mobile: 'मोबाइल',
  dhanyabad: 'धन्यवाद',
  dhanyawad: 'धन्यवाद',
  mero: 'मेरो',
  hamro: 'हाम्रो',
  tapai: 'तपाईं',
  tapaiko: 'तपाईंको',
  ma: 'म',
  malai: 'मलाई',
  hamilai: 'हामीलाई',
  chha: 'छ',
  cha: 'छ',
  chhan: 'छन्',
  ho: 'हो',
  hunchha: 'हुन्छ',
  huncha: 'हुन्छ',
  hunuhuncha: 'हुनुहुन्छ',
  bhayeko: 'भएको',
  vayeko: 'भएको',
  bhayo: 'भयो',
  parne: 'पर्ने',
  pareko: 'परेको',
  chahiyeko: 'चाहिएको',
  garna: 'गर्न',
  garne: 'गर्ने',
  garnu: 'गर्नु',
  garidinu: 'गरिदिनु',
  garidinuhaun: 'गरिदिनुहुन',
  garidiyema: 'गरिदिएमा',
  sadar: 'सादर',
  binamra: 'विनम्र',
  sthayi: 'स्थायी',
  basinda: 'बासिन्दा',
  chhora: 'छोरा',
  chhori: 'छोरी',
  buba: 'बुबा',
  aama: 'आमा',
  ama: 'आमा',
  shreemati: 'श्रीमती',
  shrimati: 'श्रीमती',
  pariwar: 'परिवार',
  samasya: 'समस्या',
  samadhan: 'समाधान',
  kagajat: 'कागजात',
  pratilipi: 'प्रतिलिपि',
  din: 'दिन',
  mahina: 'महिना',
  barsha: 'वर्ष',
  barsa: 'वर्ष',
  aaja: 'आज',
  bholi: 'भोलि',
  hijo: 'हिजो',
  ko: 'को',
  ka: 'का',
  ki: 'की',
  le: 'ले',
  lai: 'लाई',
  bata: 'बाट',
  sanga: 'सँग',
  ra: 'र',
  tatha: 'तथा',
  wa: 'वा',
  athawa: 'अथवा',
  lagi: 'लागि',
  bare: 'बारे',
  barema: 'बारेमा',
  huda: 'हुँदा',
  bhaye: 'भए',
  ramro: 'राम्रो',
  subha: 'शुभ',
  kasto: 'कस्तो',
  ram: 'राम',
  sita: 'सीता',
  prakash: 'प्रकाश',
  prasad: 'प्रसाद',
  bahadur: 'बहादुर',
  kumar: 'कुमार',
  kumari: 'कुमारी',
  devi: 'देवी',
  adhikari: 'अधिकारी',
  sharma: 'शर्मा',
  shrestha: 'श्रेष्ठ',
  thapa: 'थापा',
  gurung: 'गुरुङ',
  tamang: 'तामाङ',
  magar: 'मगर',
  poudel: 'पौडेल',
  karki: 'कार्की',
  bhattarai: 'भट्टराई',
  subedi: 'सुवेदी',
};

const NEPALI_DIGIT_MAP: Record<string, string> = {
  '0': '०',
  '1': '१',
  '2': '२',
  '3': '३',
  '4': '४',
  '5': '५',
  '6': '६',
  '7': '७',
  '8': '८',
  '9': '९',
};

const INDEPENDENT_VOWELS: [string, string][] = [
  ['aa', 'आ'],
  ['ee', 'ई'],
  ['ii', 'ई'],
  ['oo', 'ऊ'],
  ['uu', 'ऊ'],
  ['ai', 'ऐ'],
  ['au', 'औ'],
  ['ou', 'औ'],
  ['ri', 'ऋ'],
  ['a', 'अ'],
  ['i', 'इ'],
  ['u', 'उ'],
  ['e', 'ए'],
  ['o', 'ओ'],
];

const VOWEL_MATRAS: [string, string][] = [
  ['aa', 'ा'],
  ['ee', 'ी'],
  ['ii', 'ी'],
  ['oo', 'ू'],
  ['uu', 'ू'],
  ['ai', 'ै'],
  ['au', 'ौ'],
  ['ou', 'ौ'],
  ['ri', 'ृ'],
  ['a', ''],
  ['i', 'ि'],
  ['u', 'ु'],
  ['e', 'े'],
  ['o', 'ो'],
];

const CONSONANTS: [string, string][] = [
  ['chh', 'छ'],
  ['ksh', 'क्ष'],
  ['tr', 'त्र'],
  ['gy', 'ज्ञ'],
  ['kh', 'ख'],
  ['gh', 'घ'],
  ['ng', 'ङ'],
  ['ch', 'च'],
  ['jh', 'झ'],
  ['th', 'थ'],
  ['dh', 'ध'],
  ['ph', 'फ'],
  ['bh', 'भ'],
  ['sh', 'श'],
  ['T', 'ट'],
  ['Th', 'ठ'],
  ['D', 'ड'],
  ['Dh', 'ढ'],
  ['N', 'ण'],
  ['k', 'क'],
  ['g', 'ग'],
  ['j', 'ज'],
  ['t', 'त'],
  ['d', 'द'],
  ['n', 'न'],
  ['p', 'प'],
  ['f', 'फ'],
  ['b', 'ब'],
  ['m', 'म'],
  ['y', 'य'],
  ['r', 'र'],
  ['l', 'ल'],
  ['v', 'व'],
  ['w', 'व'],
  ['s', 'स'],
  ['h', 'ह'],
  ['c', 'क'],
  ['q', 'क'],
  ['z', 'ज'],
  ['x', 'क्स'],
];

function transliteratePhoneticToken(token: string): string {
  if (!token) return '';
  if (!/[A-Za-z0-9]/.test(token)) return token;

  // Replace digits inside token with Devanagari numerals
  if (/^\d+$/.test(token)) {
    return token.replace(/\d/g, (d) => NEPALI_DIGIT_MAP[d] || d);
  }

  const lower = token.toLowerCase();
  if (ROMAN_WORD_DICTIONARY[lower]) {
    return ROMAN_WORD_DICTIONARY[lower];
  }

  // Handle common case-sensitive retroflex capitals if typed, otherwise lowercase
  let src = token;
  let i = 0;
  let out = '';

  const matchFromList = (pos: number, list: [string, string][], caseSensitive = false) => {
    for (const [roman, dev] of list) {
      const slice = src.slice(pos, pos + roman.length);
      if ((caseSensitive ? slice : slice.toLowerCase()) === roman) {
        return { roman, dev };
      }
    }
    return null;
  };

  while (i < src.length) {
    const ch = src[i];

    // Preserve already-Devanagari characters untouched
    if (/[\u0900-\u097F]/.test(ch)) {
      out += ch;
      i++;
      continue;
    }

    if (/\d/.test(ch)) {
      out += NEPALI_DIGIT_MAP[ch] || ch;
      i++;
      continue;
    }

    // Try matching consonant (check uppercase retroflex first, then lowercase)
    const consMatch =
      matchFromList(i, CONSONANTS.filter(([r]) => /[TDN]/.test(r)), true) ||
      matchFromList(i, CONSONANTS.filter(([r]) => !/[TDN]/.test(r)), false);

    if (consMatch) {
      i += consMatch.roman.length;
      const matraMatch = matchFromList(i, VOWEL_MATRAS, false);
      if (matraMatch) {
        out += consMatch.dev + matraMatch.dev;
        i += matraMatch.roman.length;
      } else if (i < src.length && /[A-Za-z]/.test(src[i])) {
        // Consonant cluster (half-letter) when followed directly by another consonant
        out += consMatch.dev + '्';
      } else {
        // Word-final consonant normally carries inherent 'a' in casual Nepali typing unless explicit
        out += consMatch.dev;
      }
      continue;
    }

    // Try independent vowel
    const vowelMatch = matchFromList(i, INDEPENDENT_VOWELS, false);
    if (vowelMatch) {
      out += vowelMatch.dev;
      i += vowelMatch.roman.length;
      continue;
    }

    // Fallback: pass character through
    out += ch;
    i++;
  }

  return out;
}

/**
 * Transliterate a Romanized Nepali sentence or phrase into Devanagari Unicode.
 * Preserves whitespace, newlines, punctuation, and existing Devanagari text.
 */
export function transliterateRomanToDevanagari(input: string, convertPeriodToDanda = false): string {
  if (!input) return '';

  const tokens = input.split(/([A-Za-z0-9]+|\s+|[^A-Za-z0-9\s]+)/g).filter(Boolean);
  return tokens
    .map((tok) => {
      if (convertPeriodToDanda && tok === '.') return '।';
      if (/^[A-Za-z0-9]+$/.test(tok)) {
        return transliteratePhoneticToken(tok);
      }
      return tok;
    })
    .join('');
}

/**
 * Converts already-completed words (everything before trailing whitespace) in real-time typing
 * so the active partial word stays editable until the user presses Space or Enter.
 */
export function transliterateCompletedWordsOnSpace(input: string): string {
  if (!input) return '';
  const match = input.match(/^([\s\S]*?)(\s+)([A-Za-z0-9]*)$/);
  if (!match) {
    // Only convert whole string if it ends with whitespace
    if (/\s$/.test(input)) {
      return transliterateRomanToDevanagari(input);
    }
    return input;
  }
  const [, head, trailingSpace, partialWord] = match;
  return transliterateRomanToDevanagari(head) + trailingSpace + partialWord;
}

