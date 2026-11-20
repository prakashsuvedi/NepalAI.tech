/**
 * trendsEngine.ts
 *
 * Pure domain logic for Nepal AI + Trends:
 * - 11 Nepal-specific trend categories
 * - Zero-dependency Google Trends RSS XML parser (ht:approx_traffic, ht:news_item, ht:picture)
 * - Rules-first Nepal classifier + audience intent detector (Nepal-local, Diaspora, Global Nepali)
 * - Source-grounded citation validator & deterministic fallback explainer
 * - Tri-script (English / Romanized Nepali / Devanagari) keyword expansion & commercial packs
 */

export type TrendCategorySlug =
  | 'politics-governance'
  | 'sports-npl'
  | 'entertainment-celebrities'
  | 'weather-disasters'
  | 'travel-tourism'
  | 'technology-ai'
  | 'jobs-education'
  | 'business-finance'
  | 'health'
  | 'festivals-culture'
  | 'diaspora-remittance';

export type AudienceSegment = 'nepal_local' | 'diaspora' | 'global_nepali';
export type TrendScriptLanguage = 'en' | 'ne' | 'romanized-ne' | 'mixed';

export interface TrendCategoryDef {
  slug: TrendCategorySlug;
  labelEn: string;
  labelNe: string;
  descriptionEn: string;
  keywords: RegExp[];
  linkedToolTab?: 'ev' | 'nepse' | 'it_export' | 'bullion' | 'fx' | 'tax' | 'market' | 'sarkari' | 'health' | 'letter';
}

export const TREND_CATEGORIES: TrendCategoryDef[] = [
  {
    slug: 'sports-npl',
    labelEn: 'Sports & NPL',
    labelNe: 'खेलकुद र NPL',
    descriptionEn: 'Nepal Premier League (NPL), Nepal cricket, football, and international tournaments.',
    keywords: [
      /\bnpl\b/i, /\bjanakpur\b/i, /\bchitwan rhinos\b/i, /\bbiratnagar kings\b/i, /\bkathmandu gurkhas\b/i,
      /\bpokhara avengers\b/i, /\bsudurpaschim\b/i, /\blumbini lions\b/i, /\bkarnali yaks\b/i,
      /\bcricket\b/i, /\bfootball\b/i, /\bsoccer\b/i, /\bbasketball\b/i, /\bnba\b/i, /\bfifa\b/i,
      /\bmatch\b/i, /\bworld cup\b/i, /\bipl\b/i, /\bpremier league\b/i, /\bvs\.?\b/i, /\bu-?19\b/i,
      /\bsandeep\b/i, /\brohit paudel\b/i, /\bdipendra\b/i, /\bkushal\b/i, /\banfa\b/i, /\bcan\b/i,
      /क्रिकेट/i, /खेल/i, /फुटबल/i, /एनपिएल/i,
    ],
  },
  {
    slug: 'politics-governance',
    labelEn: 'Politics & Governance',
    labelNe: 'राजनीति र शासन',
    descriptionEn: 'Nepal Parliament, cabinet decisions, ministries, elections, and Supreme Court updates.',
    keywords: [
      /\bparliament\b/i, /\bminister\b/i, /\bprime minister\b/i, /\belection\b/i, /\bsupreme court\b/i,
      /\bward\b/i, /\bnagarikta\b/i, /\bpassport\b/i, /\blocal level\b/i, /\bconstitution\b/i,
      /\boli\b/i, /\bprachanda\b/i, /\bdeuba\b/i, /\bbalen\b/i, /\brabi\b/i, /\braymajhi\b/i, /\bcongress\b/i, /\buml\b/i, /\brsp\b/i,
      /सरकार/i, /निर्वाचन/i, /मन्त्रालय/i, /संसद/i, /वडा/i, /नागरिकता/i, /पासपोर्ट/i,
    ],
    linkedToolTab: 'sarkari',
  },
  {
    slug: 'business-finance',
    labelEn: 'Business & Finance',
    labelNe: 'अर्थतन्त्र र सेयर बजार',
    descriptionEn: 'NEPSE market moves, NRB forex, gold/silver bullion, IPOs, taxes, and banking policy.',
    keywords: [
      /\bnepse\b/i, /\bipo\b/i, /\bshare\b/i, /\bstock\b/i, /\bnrb\b/i, /\bforex\b/i, /\busd to npr\b/i,
      /\bgold price\b/i, /\bsilver price\b/i, /\btax\b/i, /\bvat\b/i, /\bev tax\b/i, /\bbudget\b/i, /\bbank\b/i, /\besewa\b/i, /\bkhalti\b/i,
      /नेप्से/i, /सेयर/i, /सुन/i, /चाँदी/i, /कर/i, /बैंक/i, /आइपिओ/i, /डलर/i,
    ],
    linkedToolTab: 'nepse',
  },
  {
    slug: 'technology-ai',
    labelEn: 'Technology & AI',
    labelNe: 'प्रविधि र एआई',
    descriptionEn: 'Artificial intelligence, software, startups, cybersecurity, telecom, and IT exports in Nepal.',
    keywords: [
      /\bai\b/i, /\bchatgpt\b/i, /\bgemini\b/i, /\bclaude\b/i, /\bnvidia\b/i, /\bopenai\b/i, /\bapple\b/i, /\biphone\b/i,
      /\bsamsung\b/i, /\bsoftware\b/i, /\bit export\b/i, /\bnta\b/i, /\bntc\b/i, /\bncell\b/i, /\bstarlink\b/i, /\bcrypto\b/i,
      /\bcoloros\b/i, /\bandroid\b/i, /\bios\b/i, /\boppo\b/i, /\bxiaomi\b/i, /\bsmartphone\b/i,
      /एआई/i, /प्रविधि/i, /सफ्टवेयर/i, /मोबाइल/i, /इन्टरनेट/i,
    ],
    linkedToolTab: 'it_export',
  },
  {
    slug: 'weather-disasters',
    labelEn: 'Weather & Disasters',
    labelNe: 'मौसम र विपद्',
    descriptionEn: 'Monsoon alerts, Himalayan snowfall, Kathmandu AQI, landslides, and highway conditions.',
    keywords: [
      /\bweather\b/i, /\brain\b/i, /\bmonsoon\b/i, /\bsnow\b/i, /\bflood\b/i, /\blandslide\b/i, /\bearthquake\b/i,
      /\baqi\b/i, /\btemperature\b/i, /\bforecast\b/i, /\bhighway\b/i, /\bmausam\b/i,
      /मौसम/i, /हिमपात/i, /वर्षा/i, /पहिरो/i, /बाढी/i, /भूकम्प/i, /प्रदूषण/i,
    ],
  },
  {
    slug: 'travel-tourism',
    labelEn: 'Travel & Tourism',
    labelNe: 'पर्यटन र यात्रा',
    descriptionEn: 'Trekking seasons, Annapurna & Everest routes, domestic flights, Pokhara, and visas.',
    keywords: [
      /\btrek\b/i, /\btrekking\b/i, /\beverest\b/i, /\bannapurna\b/i, /\bmustang\b/i, /\bpokhara\b/i, /\bchitwan\b/i,
      /\blumbini\b/i, /\bflight\b/i, /\bairport\b/i, /\btia\b/i, /\bbuddha air\b/i, /\byeti airlines\b/i, /\bhotel\b/i, /\bvisa\b/i,
      /पर्यटन/i, /ट्रेकिङ/i, /पोखरा/i, /मुस्ताङ/i, /सगरमाथा/i, /हवाई/i, /भिसा/i,
    ],
  },
  {
    slug: 'jobs-education',
    labelEn: 'Jobs & Education',
    labelNe: 'रोजगार र शिक्षा',
    descriptionEn: 'Loksewa Aayog notices, SEE/NEB results, TU exams, scholarships, and Nepal IT vacancies.',
    keywords: [
      /\bloksewa\b/i, /\blok sewa\b/i, /\bsee result\b/i, /\bneb\b/i, /\btu\b/i, /\btribhuvan\b/i, /\bku\b/i,
      /\bvacancy\b/i, /\bjob\b/i, /\bscholarship\b/i, /\bielts\b/i, /\bexam\b/i, /\bresult\b/i, /\bhiring\b/i,
      /लोकसेवा/i, /नतिजा/i, /परीक्षा/i, /जागिर/i, /छात्रवृत्ति/i, /शिक्षा/i, /भर्ना/i,
    ],
  },
  {
    slug: 'entertainment-celebrities',
    labelEn: 'Entertainment & Celebrities',
    labelNe: 'मनोरञ्जन र कला',
    descriptionEn: 'Nepali cinema, music releases, viral YouTube/TikTok creators, and reality shows.',
    keywords: [
      /\bmovie\b/i, /\bfilm\b/i, /\bsong\b/i, /\bmusic\b/i, /\btrailer\b/i, /\bactress\b/i, /\bactor\b/i,
      /\bconcert\b/i, /\bcomedy\b/i, /\bviral\b/i, /\bdayahang\b/i, /\bbipin\b/i, /\bpaul shah\b/i, /\bswastima\b/i,
      /चलचित्र/i, /गीत/i, /फिल्म/i, /संगीत/i, /कलाकार/i,
    ],
  },
  {
    slug: 'health',
    labelEn: 'Health',
    labelNe: 'स्वास्थ्य',
    descriptionEn: 'Dengue/seasonal alerts, hospitals, lab test guidance, nutrition, and public health.',
    keywords: [
      /\bhealth\b/i, /\bhospital\b/i, /\bdengue\b/i, /\bdoctor\b/i, /\bdentist\b/i, /\bmedicine\b/i,
      /\bblood\b/i, /\bdiabetes\b/i, /\bvirus\b/i, /\bfever\b/i, /\bclinic\b/i, /\bteaching hospital\b/i,
      /स्वास्थ्य/i, /अस्पताल/i, /डेंगु/i, /औषधि/i, /डाक्टर/i, /रोग/i,
    ],
    linkedToolTab: 'health',
  },
  {
    slug: 'festivals-culture',
    labelEn: 'Festivals & Culture',
    labelNe: 'चाडपर्व र संस्कृति',
    descriptionEn: 'Dashain, Tihar, Chhath, Holi, Teej, Bisket Jatra, Nepali calendar dates, and traditions.',
    keywords: [
      /\bdashain\b/i, /\btihar\b/i, /\bchhath\b/i, /\bholi\b/i, /\bteej\b/i, /\bjatra\b/i, /\blhosar\b/i,
      /\bmaghe sankranti\b/i, /\bshivaratri\b/i, /\bpatro\b/i, /\bbikram sambat\b/i, /\bpanchanga\b/i, /\bholiday\b/i,
      /दशैं/i, /तिहार/i, /छठ/i, /होली/i, /जात्रा/i, /पात्रो/i, /चाडपर्व/i, /बिदा/i,
    ],
  },
  {
    slug: 'diaspora-remittance',
    labelEn: 'Diaspora & Remittance',
    labelNe: 'प्रवास र रेमिट्यान्स',
    descriptionEn: 'Foreign employment, remittance corridors, student visas, gifting to Nepal, and NRI/NRN news.',
    keywords: [
      /\bremittance\b/i, /\bdiaspora\b/i, /\bnrn\b/i, /\bshram\b/i, /\beps korea\b/i, /\bjapan visa\b/i,
      /\baustralia\b/i, /\bdubai\b/i, /\bqatar\b/i, /\bcanada\b/i, /\bdelivery in kathmandu\b/i, /\bsend money\b/i,
      /रेमिट्यान्स/i, /विदेश/i, /श्रम/i, /कोरिया/i, /अष्ट्रेलिया/i, /प्रवासी/i,
    ],
    linkedToolTab: 'fx',
  },
];

export const DIASPORA_COUNTRIES = [
  { code: 'US', labelEn: 'United States', labelNe: 'अमेरिका' },
  { code: 'AU', labelEn: 'Australia', labelNe: 'अष्ट्रेलिया' },
  { code: 'GB', labelEn: 'United Kingdom', labelNe: 'बेलायत' },
  { code: 'AE', labelEn: 'UAE', labelNe: 'यूएई' },
  { code: 'JP', labelEn: 'Japan', labelNe: 'जापान' },
  { code: 'CA', labelEn: 'Canada', labelNe: 'क्यानाडा' },
] as const;

export interface ParsedRssNewsItem {
  title: string;
  url: string;
  source: string;
  snippet?: string;
  imageUrl?: string;
}

export interface ParsedRssTrendItem {
  keyword: string;
  keywordNormalized: string;
  slug: string;
  trafficBand: string;
  numericTrafficFloor: number;
  publishedAt: string;
  imageUrl?: string;
  imageSource?: string;
  sourceUrl?: string;
  newsItems: ParsedRssNewsItem[];
}

const DEVANAGARI_REGEX = /[\u0900-\u097F]/;

const DEVANAGARI_TRANSLIT_MAP: Record<string, string> = {
  'अ': 'a', 'आ': 'aa', 'इ': 'i', 'ई': 'ee', 'उ': 'u', 'ऊ': 'oo', 'ऋ': 'ri',
  'ए': 'e', 'ऐ': 'ai', 'ओ': 'o', 'औ': 'au',
  'क': 'k', 'ख': 'kh', 'ग': 'g', 'घ': 'gh', 'ङ': 'ng',
  'च': 'ch', 'छ': 'chh', 'ज': 'j', 'झ': 'jh', 'ञ': 'yn',
  'ट': 't', 'ठ': 'th', 'ड': 'd', 'ढ': 'dh', 'ण': 'n',
  'त': 't', 'थ': 'th', 'द': 'd', 'ध': 'dh', 'न': 'n',
  'प': 'p', 'फ': 'ph', 'ब': 'b', 'भ': 'bh', 'म': 'm',
  'य': 'y', 'र': 'r', 'ल': 'l', 'व': 'w', 'श': 'sh', 'ष': 'sh', 'स': 's', 'ह': 'h',
  'ा': 'a', 'ि': 'i', 'ी': 'i', 'ु': 'u', 'ू': 'u', 'े': 'e', 'ै': 'ai', 'ो': 'o', 'ौ': 'au',
  'ं': 'n', 'ँ': 'n', 'ः': 'h', '्': '',
  '०': '0', '१': '1', '२': '2', '३': '3', '४': '4',
  '५': '5', '६': '6', '७': '7', '८': '8', '९': '9',
};

export function detectScriptLanguage(text: string): TrendScriptLanguage {
  const hasDevanagari = DEVANAGARI_REGEX.test(text);
  const hasLatin = /[a-zA-Z]/.test(text);
  if (hasDevanagari && hasLatin) return 'mixed';
  if (hasDevanagari) return 'ne';

  const lower = text.toLowerCase();
  if (/\b(ko|ma|ka|ki|le|lai|chha|xa|huncha|kasari|ramro|tirne|nepal ma|kathmandu ma|sasto|kinne|khulne|nata|nibedan)\b/.test(lower)) {
    return 'romanized-ne';
  }
  return 'en';
}

export function normalizeKeyword(input: string): string {
  return input
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

export function toTrendSlug(input: string): string {
  const clean = input.trim();
  let ascii = '';
  for (const ch of clean) {
    if (DEVANAGARI_TRANSLIT_MAP[ch] !== undefined) {
      ascii += DEVANAGARI_TRANSLIT_MAP[ch];
    } else {
      ascii += ch;
    }
  }
  const slug = ascii
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 72);

  if (slug.length >= 3) return slug;
  // Deterministic hash fallback if non-ASCII symbols stripped down
  let hash = 0;
  for (let i = 0; i < clean.length; i++) {
    hash = (hash * 31 + clean.charCodeAt(i)) >>> 0;
  }
  return `nepal-trend-${hash.toString(36)}`;
}

export function parseTrafficBandNumber(band?: string): number {
  if (!band) return 200;
  const clean = band.trim().toUpperCase().replace(/,/g, '').replace(/\+/g, '');
  const match = clean.match(/^(\d+(?:\.\d+)?)([KMB])?$/);
  if (!match) return 200;
  const num = parseFloat(match[1]);
  const mult = match[2] === 'M' ? 1_000_000 : match[2] === 'K' ? 1_000 : 1;
  return Math.round(num * mult);
}

function decodeXmlEntities(str: string): string {
  return str
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .trim();
}

function extractTag(block: string, tagName: string): string | undefined {
  const escaped = tagName.replace(/[:]/g, '\\:');
  const regex = new RegExp(`<${escaped}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${escaped}>`, 'i');
  const match = block.match(regex);
  return match ? decodeXmlEntities(match[1]) : undefined;
}

export function parseGoogleTrendsRssXml(xml: string): ParsedRssTrendItem[] {
  if (!xml || !xml.includes('<item')) return [];
  const items: ParsedRssTrendItem[] = [];
  const itemMatches = xml.match(/<item\b[^>]*>[\s\S]*?<\/item>/gi) || [];

  const seenNormalized = new Set<string>();

  for (const itemBlock of itemMatches) {
    // Strip news_item blocks when reading outer title/link
    const outerBlock = itemBlock.replace(/<ht:news_item>[\s\S]*?<\/ht:news_item>/gi, '');
    const keyword = extractTag(outerBlock, 'title');
    if (!keyword) continue;

    const keywordNormalized = normalizeKeyword(keyword);
    if (seenNormalized.has(keywordNormalized)) continue;
    seenNormalized.add(keywordNormalized);

    const trafficBand = extractTag(outerBlock, 'ht:approx_traffic') || '200+';
    const numericTrafficFloor = parseTrafficBandNumber(trafficBand);
    const pubDateRaw = extractTag(outerBlock, 'pubDate');
    const parsedDate = pubDateRaw && !Number.isNaN(Date.parse(pubDateRaw))
      ? new Date(pubDateRaw).toISOString()
      : new Date().toISOString();

    const imageUrl = extractTag(outerBlock, 'ht:picture');
    const imageSource = extractTag(outerBlock, 'ht:picture_source');
    const sourceUrl = extractTag(outerBlock, 'link');

    const newsMatches = itemBlock.match(/<ht:news_item>[\s\S]*?<\/ht:news_item>/gi) || [];
    const newsItems: ParsedRssNewsItem[] = [];
    const seenUrls = new Set<string>();

    for (const nb of newsMatches) {
      const title = extractTag(nb, 'ht:news_item_title');
      const url = extractTag(nb, 'ht:news_item_url');
      const source = extractTag(nb, 'ht:news_item_source') || 'News Source';
      const snippet = extractTag(nb, 'ht:news_item_snippet');
      const nImg = extractTag(nb, 'ht:news_item_picture');
      if (title && url && !seenUrls.has(url)) {
        seenUrls.add(url);
        newsItems.push({
          title,
          url,
          source,
          snippet,
          imageUrl: nImg,
        });
      }
    }

    items.push({
      keyword,
      keywordNormalized,
      slug: toTrendSlug(keyword),
      trafficBand,
      numericTrafficFloor,
      publishedAt: parsedDate,
      imageUrl,
      imageSource,
      sourceUrl,
      newsItems,
    });
  }

  return items;
}

export interface ClassificationResult {
  category: TrendCategorySlug;
  confidence: 'high' | 'ambiguous';
  audienceSegment: AudienceSegment;
  linkedToolTab?: TrendCategoryDef['linkedToolTab'];
  language: TrendScriptLanguage;
}

export function classifyTrendByRules(
  keyword: string,
  newsTitles: string[] = []
): ClassificationResult {
  const combined = `${keyword} ${newsTitles.join(' ')}`;
  const language = detectScriptLanguage(keyword);

  // Audience intent detection
  let audienceSegment: AudienceSegment = 'nepal_local';
  if (/(remittance|send money|delivery in kathmandu|land for sale|cake delivery|flight to kathmandu|australia|canada|dubai|uae|uk nepali|japan visa|eps korea|nrn)/i.test(combined)) {
    audienceSegment = 'diaspora';
  } else if (/(nepali movie|nepali song|npl|cricket|dashain|tihar|everest|annapurna|nepal news)/i.test(combined)) {
    audienceSegment = 'global_nepali';
  }

  // Specific linkedToolTab detection for NepalAI utility synergy
  let linkedToolTab: TrendCategoryDef['linkedToolTab'];
  if (/(ev tax|electric vehicle|bluebook|byd|tata ev)/i.test(combined)) linkedToolTab = 'ev';
  else if (/(nepse|ipo|share|bonus share|right share|sebon)/i.test(combined)) linkedToolTab = 'nepse';
  else if (/(gold price|silver price|tola|fenegosida|सुन|चाँदी)/i.test(combined)) linkedToolTab = 'bullion';
  else if (/(forex|dollar rate|usd to npr|nrb|डलर|विनिमय)/i.test(combined)) linkedToolTab = 'fx';
  else if (/(it export|95ka|freelance tax|dollar card)/i.test(combined)) linkedToolTab = 'it_export';
  else if (/(income tax|salary tds|ssf|cit|आयकर)/i.test(combined)) linkedToolTab = 'tax';
  else if (/(kalimati|ropani|bigha|कालिमाटी)/i.test(combined)) linkedToolTab = 'market';
  else if (/(passport|nagarikta|driving license|pan|वडा|नागरिकता|पासपोर्ट)/i.test(combined)) linkedToolTab = 'sarkari';
  else if (/(nibedan|letter|निवेदन)/i.test(combined)) linkedToolTab = 'letter';

  let bestCategory: TrendCategorySlug | null = null;
  let bestScore = 0;

  for (const cat of TREND_CATEGORIES) {
    let score = 0;
    for (const pattern of cat.keywords) {
      if (pattern.test(keyword)) score += 3;
      else if (pattern.test(combined)) score += 1;
    }
    if (score > bestScore) {
      bestScore = score;
      bestCategory = cat.slug;
    }
  }

  if (bestCategory && bestScore >= 2) {
    const catDef = TREND_CATEGORIES.find((c) => c.slug === bestCategory);
    return {
      category: bestCategory,
      confidence: 'high',
      audienceSegment,
      linkedToolTab: linkedToolTab || catDef?.linkedToolTab,
      language,
    };
  }

  return {
    category: bestCategory || 'entertainment-celebrities',
    confidence: 'ambiguous',
    audienceSegment,
    linkedToolTab,
    language,
  };
}

export interface GroundedCitation {
  title: string;
  url: string;
  source: string;
}

export function validateGroundedCitations(
  proposedCitations: Array<{ title?: string; url?: string; source?: string }> | undefined,
  allowedNews: ParsedRssNewsItem[]
): GroundedCitation[] {
  if (!allowedNews || allowedNews.length === 0) return [];
  const allowedByUrl = new Map(allowedNews.map((n) => [n.url.trim(), n]));
  const verified: GroundedCitation[] = [];

  if (Array.isArray(proposedCitations)) {
    for (const c of proposedCitations) {
      const url = (c.url || '').trim();
      const matched = allowedByUrl.get(url);
      if (matched) {
        verified.push({
          title: matched.title,
          url: matched.url,
          source: matched.source,
        });
      }
    }
  }

  if (verified.length === 0) {
    return allowedNews.slice(0, 3).map((n) => ({
      title: n.title,
      url: n.url,
      source: n.source,
    }));
  }
  return verified.slice(0, 4);
}

export function buildDeterministicWhyTrending(
  keyword: string,
  category: TrendCategorySlug,
  trafficBand: string,
  newsItems: ParsedRssNewsItem[]
): string {
  const catLabel = TREND_CATEGORIES.find((c) => c.slug === category)?.labelEn || 'Nepal News';
  if (newsItems.length === 0) {
    return `"${keyword}" is generating live search interest in Nepal (${trafficBand} approximate searches) under ${catLabel}.`;
  }
  const top = newsItems[0];
  const second = newsItems[1];
  const headlineSummary = second
    ? `${top.source} ("${top.title}") and ${second.source} ("${second.title}")`
    : `${top.source} ("${top.title}")`;

  return `"${keyword}" is trending in Nepal with ${trafficBand} approximate search interest under ${catLabel}, driven by recent reporting from ${headlineSummary}.`;
}

export function isNepalRelevantForDiaspora(keyword: string, newsTitles: string[] = []): boolean {
  const combined = `${keyword} ${newsTitles.join(' ')}`;
  return /(nepal|nepali|kathmandu|pokhara|everest|annapurna|lumbini|biratnagar|chitwan|npl|dashain|tihar|chhath|remittance|esewa|nepse|sandeep lamichhane|balen|नेपाल|काठमाडौं)/i.test(
    combined
  );
}

export interface TriScriptVariantRow {
  baseKeyword: string;
  englishVariant: string;
  romanizedNepali: string;
  devanagariVariant: string;
  intentTag: string;
}

const COMMERCIAL_KEYWORD_LIBRARY: Array<{
  match: RegExp;
  category: TrendCategorySlug;
  localIntentScore: number;
  diasporaIntentScore: number;
  direction: 'rising' | 'steady' | 'seasonal';
  variants: TriScriptVariantRow[];
  contentAngles: string[];
}> = [
  {
    match: /(dentist|dental|दाँत|दन्त)/i,
    category: 'health',
    localIntentScore: 92,
    diasporaIntentScore: 28,
    direction: 'steady',
    variants: [
      {
        baseKeyword: 'dentist Kathmandu',
        englishVariant: 'best dentist in Kathmandu',
        romanizedNepali: 'kathmandu ma ramro dentist',
        devanagariVariant: 'काठमाडौंमा राम्रो दन्त चिकित्सक',
        intentTag: 'Local Service',
      },
      {
        baseKeyword: 'dental clinic Nepal',
        englishVariant: 'dental implant cost Kathmandu',
        romanizedNepali: 'daat halne kharcha kati lagcha',
        devanagariVariant: 'दाँत हाल्ने खर्च कति लाग्छ',
        intentTag: 'Price Inquiry',
      },
    ],
    contentAngles: [
      'Compare root canal, scaling, and implant price ranges in Kathmandu & Lalitpur clinics',
      'Bilingual checklist for choosing NMC-registered dental specialists',
    ],
  },
  {
    match: /(trek|everest|annapurna|mustang|pokhara|ट्रेक|अन्नपूर्ण|मुस्ताङ)/i,
    category: 'travel-tourism',
    localIntentScore: 55,
    diasporaIntentScore: 84,
    direction: 'seasonal',
    variants: [
      {
        baseKeyword: 'Nepal trekking',
        englishVariant: 'Annapurna Base Camp trek',
        romanizedNepali: 'Annapurna base camp trek cost',
        devanagariVariant: 'अन्नपूर्ण बेस क्याम्प ट्रेक',
        intentTag: 'Tourism & Booking',
      },
      {
        baseKeyword: 'Pokhara Mustang trip',
        englishVariant: 'Upper Mustang permit & itinerary',
        romanizedNepali: 'Mustang jane bato ra kharcha',
        devanagariVariant: 'मुस्ताङ जाने बाटो र खर्च',
        intentTag: 'Seasonal Travel',
      },
    ],
    contentAngles: [
      'Day-by-day permit fees (TIMS/ACAP) and offline packing checklist for Nepali & foreign trekkers',
      'Best autumn vs. spring weather windows with domestic flight & jeep estimates',
    ],
  },
  {
    match: /(ai job|vacancy|loksewa|hiring|jagira|जागिर|एआई)/i,
    category: 'jobs-education',
    localIntentScore: 88,
    diasporaIntentScore: 46,
    direction: 'rising',
    variants: [
      {
        baseKeyword: 'AI jobs Nepal',
        englishVariant: 'AI & Python developer jobs in Nepal',
        romanizedNepali: 'AI jobs Nepal ko vacancy',
        devanagariVariant: 'एआई जागिर नेपाल',
        intentTag: 'Career & Hiring',
      },
      {
        baseKeyword: 'AI course Nepal',
        englishVariant: 'AI & data science course Kathmandu',
        romanizedNepali: 'Nepal ma AI padhne thau',
        devanagariVariant: 'नेपालमा एआई पढ्ने कोर्स',
        intentTag: 'Education',
      },
    ],
    contentAngles: [
      'Salary benchmarks for junior vs. senior AI engineers in Kathmandu and remote USD roles',
      'Section 95Ka 5% final TDS tax guide for Nepali remote AI engineers',
    ],
  },
  {
    match: /(payment|esewa|khalti|bijuli|electricity|bill|बिजुली|भुक्तानी)/i,
    category: 'business-finance',
    localIntentScore: 94,
    diasporaIntentScore: 62,
    direction: 'rising',
    variants: [
      {
        baseKeyword: 'online payment Nepal',
        englishVariant: 'pay electricity bill online Nepal',
        romanizedNepali: 'bijuli bill online tirne',
        devanagariVariant: 'बिजुली बिल अनलाइन तिर्ने',
        intentTag: 'Utility Payment',
      },
      {
        baseKeyword: 'remittance to eSewa',
        englishVariant: 'send money abroad to Nepal wallet',
        romanizedNepali: 'bidesh bata esewa ma paisa pathaune',
        devanagariVariant: 'विदेशबाट ईसेवामा पैसा पठाउने',
        intentTag: 'Diaspora Remittance',
      },
    ],
    contentAngles: [
      'Step-by-step NEA meter number lookup and QR bill settlement guide',
      'Remittance bonus & NRB compliance checklist for overseas Nepali senders',
    ],
  },
  {
    match: /(cake|gift|delivery|land|property|jagga|घर|जग्गा|केक)/i,
    category: 'diaspora-remittance',
    localIntentScore: 64,
    diasporaIntentScore: 95,
    direction: 'rising',
    variants: [
      {
        baseKeyword: 'cake delivery Kathmandu',
        englishVariant: 'same day birthday cake delivery Kathmandu',
        romanizedNepali: 'bidesh bata kathmandu ma cake pathaune',
        devanagariVariant: 'काठमाडौंमा केक डेलिभरी सेवा',
        intentTag: 'Diaspora Gifting',
      },
      {
        baseKeyword: 'land for sale Pokhara',
        englishVariant: 'verified ghar jagga for sale in Pokhara',
        romanizedNepali: 'Pokhara ma sasto jagga bikrima',
        devanagariVariant: 'पोखरामा घर जग्गा बिक्री',
        intentTag: 'Diaspora Property',
      },
    ],
    contentAngles: [
      'Trusted gift & bakery storefronts accepting international cards & diaspora remittance',
      'Land unit conversion (Ropani/Aana vs Bigha/Kattha) & Lalpurja verification guide for NRN buyers',
    ],
  },
];

export interface KeywordAnalysisOutput {
  keyword: string;
  keywordNormalized: string;
  detectedScript: TrendScriptLanguage;
  category: TrendCategorySlug;
  direction: 'rising' | 'steady' | 'seasonal';
  localIntentScore: number;
  diasporaIntentScore: number;
  variants: TriScriptVariantRow[];
  relatedQueries: string[];
  contentAngles: string[];
}

export function buildFallbackTriScriptVariants(input: string): KeywordAnalysisOutput {
  const clean = input.trim();
  const normalized = normalizeKeyword(clean);
  const detectedScript = detectScriptLanguage(clean);

  for (const preset of COMMERCIAL_KEYWORD_LIBRARY) {
    if (preset.match.test(clean)) {
      return {
        keyword: clean,
        keywordNormalized: normalized,
        detectedScript,
        category: preset.category,
        direction: preset.direction,
        localIntentScore: preset.localIntentScore,
        diasporaIntentScore: preset.diasporaIntentScore,
        variants: preset.variants,
        relatedQueries: preset.variants.flatMap((v) => [v.englishVariant, v.romanizedNepali]),
        contentAngles: preset.contentAngles,
      };
    }
  }

  const rule = classifyTrendByRules(clean);
  const isDiaspora = rule.audienceSegment === 'diaspora';
  return {
    keyword: clean,
    keywordNormalized: normalized,
    detectedScript,
    category: rule.category,
    direction: 'steady',
    localIntentScore: isDiaspora ? 58 : 78,
    diasporaIntentScore: isDiaspora ? 86 : 34,
    variants: [
      {
        baseKeyword: clean,
        englishVariant: `${clean} Nepal guide`,
        romanizedNepali: `${clean} nepal ma kasari`,
        devanagariVariant: `${clean} नेपाल जानकारी`,
        intentTag: 'Informational',
      },
      {
        baseKeyword: `${clean} price`,
        englishVariant: `best ${clean} service Kathmandu`,
        romanizedNepali: `kathmandu ma ${clean} kharcha`,
        devanagariVariant: `काठमाडौंमा ${clean} सेवा र शुल्क`,
        intentTag: 'Commercial',
      },
    ],
    relatedQueries: [
      `${clean} Nepal`,
      `${clean} Kathmandu`,
      `${clean} price in Nepal`,
      `${clean} latest update`,
    ],
    contentAngles: [
      `Plain-language Nepali & English explainer covering what "${clean}" means for residents and NRNs`,
      `Actionable price, official portal, and step-by-step checklist for "${clean}" in Nepal`,
    ],
  };
}

export const BUSINESS_KEYWORD_PACKS = COMMERCIAL_KEYWORD_LIBRARY;

function csvEscapeCell(value: string | number | null | undefined): string {
  const s = String(value ?? '');
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function buildKeywordCsvExport(input: {
  keyword: string;
  category: string;
  direction: string;
  localIntentScore: number;
  diasporaIntentScore: number;
  variants: TriScriptVariantRow[];
}): string {
  const header = [
    'Base Keyword',
    'English Variant',
    'Romanized Nepali',
    'Devanagari Variant',
    'Intent Tag',
    'Category',
    'Direction',
    'Local Intent Score',
    'Diaspora Intent Score',
  ].join(',');

  const rows = input.variants.map((v) =>
    [
      csvEscapeCell(v.baseKeyword),
      csvEscapeCell(v.englishVariant),
      csvEscapeCell(v.romanizedNepali),
      csvEscapeCell(v.devanagariVariant),
      csvEscapeCell(v.intentTag),
      csvEscapeCell(input.category),
      csvEscapeCell(input.direction),
      csvEscapeCell(input.localIntentScore),
      csvEscapeCell(input.diasporaIntentScore),
    ].join(',')
  );

  return [header, ...rows].join('\n');
}

export interface TrendVelocityPoint {
  timestamp: string;
  label: string;
  velocityScore: number;
  trafficFloor: number;
  trafficBand: string;
  rankPosition?: number;
  velocityDelta: number;
}

export function buildVelocitySeriesFromSnapshots(input: {
  snapshots: Array<{
    capturedAt: string;
    rankPosition: number;
    trafficBand: string;
    numericTrafficFloor: number;
    velocityDelta: number;
  }>;
  fallbackTrendScore?: number;
  fallbackTrafficBand?: string;
  fallbackTrafficFloor?: number;
  firstSeenAt?: string;
  lastSeenAt?: string;
}): TrendVelocityPoint[] {
  const sorted = [...(input.snapshots || [])]
    .filter((s) => Boolean(s.capturedAt))
    .sort((a, b) => new Date(a.capturedAt).getTime() - new Date(b.capturedAt).getTime());

  if (sorted.length === 0) {
    const baseScore = Math.max(10, Math.min(100, Math.round(input.fallbackTrendScore ?? 55)));
    const band = input.fallbackTrafficBand || '200+';
    const floor = input.fallbackTrafficFloor || parseTrafficBandNumber(band);
    const ts = input.lastSeenAt || input.firstSeenAt || new Date().toISOString();
    return [
      {
        timestamp: ts,
        label: 'Latest Snapshot',
        velocityScore: baseScore,
        trafficFloor: floor,
        trafficBand: band,
        rankPosition: 1,
        velocityDelta: 0,
      },
    ];
  }

  return sorted.map((snap, idx) => {
    const floor = Math.max(100, snap.numericTrafficFloor || parseTrafficBandNumber(snap.trafficBand));
    const rankBonus = Math.max(0, 20 - Math.min(Math.max(1, snap.rankPosition) - 1, 19));
    const rawScore = Math.round(Math.log10(floor) * 18) + rankBonus;
    const velocityScore = Math.max(10, Math.min(100, rawScore));
    const prev = idx > 0 ? sorted[idx - 1] : null;
    const computedDelta =
      typeof snap.velocityDelta === 'number' && snap.velocityDelta !== 0
        ? snap.velocityDelta
        : prev
          ? floor - (prev.numericTrafficFloor || floor)
          : 0;

    return {
      timestamp: snap.capturedAt,
      label: `#${snap.rankPosition} · ${snap.trafficBand}`,
      velocityScore,
      trafficFloor: floor,
      trafficBand: snap.trafficBand,
      rankPosition: snap.rankPosition,
      velocityDelta: computedDelta,
    };
  });
}

export function buildVelocitySeriesFromInterest(input: {
  series: Array<{ date: string; score: number }>;
  keyword: string;
  fallbackScore: number;
}): TrendVelocityPoint[] {
  const clean = (input.series || [])
    .filter((pt) => Boolean(pt.date))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (clean.length === 0) {
    return [
      {
        timestamp: new Date().toISOString().slice(0, 10),
        label: input.keyword,
        velocityScore: Math.max(0, Math.min(100, Math.round(input.fallbackScore || 0))),
        trafficFloor: 0,
        trafficBand: `${Math.round(input.fallbackScore || 0)}/100`,
        velocityDelta: 0,
      },
    ];
  }

  return clean.map((pt, idx) => {
    const score = Math.max(0, Math.min(100, Math.round(pt.score)));
    const prevScore = idx > 0 ? Math.max(0, Math.min(100, Math.round(clean[idx - 1].score))) : score;
    return {
      timestamp: pt.date,
      label: input.keyword,
      velocityScore: score,
      trafficFloor: 0,
      trafficBand: `${score}/100`,
      velocityDelta: idx > 0 ? score - prevScore : 0,
    };
  });
}

export interface DigestTrendSummary {
  slug: string;
  keyword: string;
  category: string;
  trafficBand: string;
  trendScore?: number;
  aiWhyTrending?: string | null;
  relatedQueries?: string[];
  lastSeenAt: string;
}

export function buildDigestEmailContent(input: {
  originUrl: string;
  cadence: string;
  preferredLanguage?: 'en' | 'ne' | 'bilingual';
  categories: string[];
  trends: DigestTrendSummary[];
  unsubscribeUrl: string;
}): {
  subject: string;
  text: string;
  html: string;
} {
  const cleanOrigin = input.originUrl.replace(/\/+$/, '');
  const lang = input.preferredLanguage === 'en' || input.preferredLanguage === 'ne' ? input.preferredLanguage : 'bilingual';
  const catNames = input.categories
    .map((slug) => {
      const found = TREND_CATEGORIES.find((c) => c.slug === slug);
      if (!found) return slug;
      return lang === 'ne' ? found.labelNe : found.labelEn;
    })
    .join(', ');

  const isBreaking = input.cadence === 'breaking';
  const subject =
    lang === 'ne'
      ? `NepalAI ट्रेन्ड्स ${isBreaking ? 'ताजा अलर्ट' : 'दैनिक इन्साइट्स'}: ${input.trends.length} प्रमुख विषय`
      : `NepalAI Trends ${isBreaking ? 'Spike Alert' : 'Daily Digest'}: ${input.trends.length} AI-Analyzed Topics`;

  const introText =
    lang === 'ne'
      ? `नेपाल एआई + ट्रेन्ड्स दैनिक इन्साइट्स (${catNames})`
      : lang === 'bilingual'
        ? `Nepal AI + Trends Personalized Insights / नेपाल दैनिक इन्साइट्स (${catNames})`
        : `Nepal AI + Trends Personalized Insights (${catNames})`;

  const textLines = [
    introText,
    '',
    ...input.trends.map((t, idx) => {
      const cat = TREND_CATEGORIES.find((c) => c.slug === t.category);
      const catLabel = lang === 'ne' ? cat?.labelNe || t.category : cat?.labelEn || t.category;
      const related =
        Array.isArray(t.relatedQueries) && t.relatedQueries.length > 0
          ? `\n   Related searches: ${t.relatedQueries.slice(0, 3).join(', ')}`
          : '';
      const velocityNote = typeof t.trendScore === 'number' ? ` · Velocity ${t.trendScore}/100` : '';
      return `${idx + 1}. ${t.keyword} (${catLabel} · ${t.trafficBand}${velocityNote})\n   ${t.aiWhyTrending || 'Trending in Nepal search.'}${related}\n   ${cleanOrigin}/trending/nepal/${t.slug}`;
    }),
    '',
    lang === 'ne'
      ? `लाइभ ट्रेन्ड पोर्टल हेर्नुहोस्: ${cleanOrigin}/trending/nepal`
      : `Explore live trends: ${cleanOrigin}/trending/nepal`,
    `Unsubscribe: ${input.unsubscribeUrl}`,
  ];

  const escapeHtml = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  const itemsHtml = input.trends
    .map((t, idx) => {
      const cat = TREND_CATEGORIES.find((c) => c.slug === t.category);
      const catLabel = lang === 'ne' ? cat?.labelNe || t.category : cat?.labelEn || t.category;
      const velocityBadge =
        typeof t.trendScore === 'number' ? ` · Velocity ${t.trendScore}/100` : '';
      const relatedLine =
        Array.isArray(t.relatedQueries) && t.relatedQueries.length > 0
          ? `<div style="font-size:12px;color:#475569;margin-top:6px;"><strong>Keyword Ideas:</strong> ${escapeHtml(
              t.relatedQueries.slice(0, 3).join(' · ')
            )}</div>`
          : '';

      return `<li style="margin-bottom:16px;padding-bottom:14px;border-bottom:1px solid #e2e8f0;">
        <div style="font-size:12px;color:#0891b2;font-weight:600;">#${idx + 1} · ${escapeHtml(catLabel)} · ${escapeHtml(t.trafficBand)}${escapeHtml(velocityBadge)}</div>
        <div style="font-size:16px;font-weight:700;margin-top:4px;">
          <a href="${cleanOrigin}/trending/nepal/${encodeURIComponent(t.slug)}" style="color:#0f172a;text-decoration:none;">${escapeHtml(t.keyword)}</a>
        </div>
        <p style="font-size:13px;color:#334155;margin:6px 0 0;line-height:1.5;">${escapeHtml(t.aiWhyTrending || '')}</p>
        ${relatedLine}
      </li>`;
    })
    .join('');

  const headingTitle =
    lang === 'ne'
      ? `नेपाल एआई + ट्रेन्ड्स ${isBreaking ? 'ताजा स्पाइक अलर्ट' : 'दैनिक इन्साइट्स'}`
      : `Nepal AI + Trends ${isBreaking ? 'Breaking Alert' : 'Daily Insights Digest'}`;

  const html = `<div style="font-family:'Plus Jakarta Sans',sans-serif;max-width:620px;margin:0 auto;padding:24px;color:#0f172a;background:#ffffff;">
    <div style="border-bottom:2px solid #0891b2;padding-bottom:12px;margin-bottom:18px;">
      <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#0891b2;">NepalAI Trends Intelligence</div>
      <h2 style="margin:6px 0 4px;font-size:20px;">${escapeHtml(headingTitle)}</h2>
      <p style="font-size:13px;color:#475569;margin:0;">Categories: ${escapeHtml(catNames)}</p>
    </div>
    <ol style="list-style:none;padding:0;margin:0;">${itemsHtml}</ol>
    <p style="margin-top:20px;font-size:13px;"><a href="${cleanOrigin}/trending/nepal" style="color:#0891b2;font-weight:600;">Open Live Trends Portal →</a></p>
    <p style="margin-top:16px;font-size:12px;color:#64748b;">Manage or unsubscribe anytime: <a href="${escapeHtml(input.unsubscribeUrl)}">${escapeHtml(input.unsubscribeUrl)}</a></p>
  </div>`;

  return {
    subject,
    text: textLines.join('\n'),
    html,
  };
}

export interface VelocityAlertRuleInput {
  id: string;
  email: string;
  keywordFilter?: string | null;
  keywordNormalized?: string | null;
  category: string;
  country: string;
  minVelocityScore: number;
  minVelocityDelta: number;
  deliveryChannel?: string;
  whatsappNumber?: string | null;
  whatsappWebhookUrl?: string | null;
  isActive: boolean;
  cooldownMinutes: number;
  lastTriggeredAt?: string | null;
  unsubscribeToken: string;
}

export interface VelocityAlertCandidateTrend {
  id: string;
  slug: string;
  keyword: string;
  keywordNormalized: string;
  country: string;
  category: string;
  trafficBand: string;
  trendScore: number;
  latestVelocityDelta?: number;
  aiWhyTrending?: string | null;
  lastSeenAt: string;
}

export interface VelocityThresholdMatch {
  alert: VelocityAlertRuleInput;
  matchedTrends: VelocityAlertCandidateTrend[];
}

export function evaluateVelocityThresholdAlerts(
  alerts: VelocityAlertRuleInput[],
  activeTrends: VelocityAlertCandidateTrend[],
  nowMs: number = Date.now()
): VelocityThresholdMatch[] {
  const triggered: VelocityThresholdMatch[] = [];

  for (const alert of alerts) {
    if (!alert.isActive) continue;

    if (alert.lastTriggeredAt) {
      const lastMs = new Date(alert.lastTriggeredAt).getTime();
      const cooldownMs = Math.max(15, alert.cooldownMinutes || 180) * 60 * 1000;
      if (!Number.isNaN(lastMs) && nowMs - lastMs < cooldownMs) {
        continue;
      }
    }

    const filterNorm = (alert.keywordNormalized || normalizeKeyword(alert.keywordFilter || '')).trim();
    const matched = activeTrends
      .filter((tr) => {
        if (alert.country && alert.country !== 'ALL' && tr.country.toUpperCase() !== alert.country.toUpperCase()) {
          return false;
        }
        if (alert.category && alert.category !== 'all' && tr.category !== alert.category) {
          return false;
        }
        if (filterNorm) {
          const matchesKeyword =
            tr.keywordNormalized.includes(filterNorm) ||
            tr.keyword.toLowerCase().includes((alert.keywordFilter || '').trim().toLowerCase());
          if (!matchesKeyword) return false;
        }
        if (tr.trendScore < alert.minVelocityScore) {
          return false;
        }
        if ((alert.minVelocityDelta || 0) > 0 && (tr.latestVelocityDelta ?? 0) < alert.minVelocityDelta) {
          return false;
        }
        return true;
      })
      .sort((a, b) => b.trendScore - a.trendScore)
      .slice(0, 6);

    if (matched.length > 0) {
      triggered.push({ alert, matchedTrends: matched });
    }
  }

  return triggered;
}

export function buildVelocityThresholdEmailContent(input: {
  originUrl: string;
  alert: VelocityAlertRuleInput;
  matchedTrends: VelocityAlertCandidateTrend[];
  unsubscribeUrl: string;
}): {
  subject: string;
  text: string;
  html: string;
} {
  const cleanOrigin = input.originUrl.replace(/\/+$/, '');
  const top = input.matchedTrends[0];
  const catLabel =
    input.alert.category === 'all'
      ? 'All Nepal Categories'
      : TREND_CATEGORIES.find((c) => c.slug === input.alert.category)?.labelEn || input.alert.category;

  const subject = `Velocity Alert Triggered (>= ${input.alert.minVelocityScore}/100): ${top.keyword} hit ${top.trendScore}/100`;

  const escapeHtml = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  const textLines = [
    `NepalAI Keyword Velocity Threshold Alert`,
    `Rule: ${input.alert.keywordFilter ? `Keyword "${input.alert.keywordFilter}"` : catLabel} >= ${input.alert.minVelocityScore}/100`,
    '',
    ...input.matchedTrends.map(
      (t, i) =>
        `${i + 1}. ${t.keyword} — Velocity ${t.trendScore}/100 (${t.trafficBand})\n   ${t.aiWhyTrending || ''}\n   ${cleanOrigin}/trending/nepal/${t.slug}`
    ),
    '',
    `Manage alerts: ${cleanOrigin}/trending/nepal`,
    `Delete this threshold rule: ${input.unsubscribeUrl}`,
  ];

  const itemsHtml = input.matchedTrends
    .map(
      (t, i) => `<li style="margin-bottom:14px;padding-bottom:12px;border-bottom:1px solid #e2e8f0;">
        <div style="font-size:12px;font-weight:700;color:#0891b2;">#${i + 1} · Velocity ${t.trendScore}/100 · ${escapeHtml(t.trafficBand)}</div>
        <div style="font-size:16px;font-weight:700;margin-top:4px;">
          <a href="${cleanOrigin}/trending/nepal/${encodeURIComponent(t.slug)}" style="color:#0f172a;text-decoration:none;">${escapeHtml(t.keyword)}</a>
        </div>
        <p style="font-size:13px;color:#334155;margin:6px 0 0;line-height:1.5;">${escapeHtml(t.aiWhyTrending || '')}</p>
      </li>`
    )
    .join('');

  const html = `<div style="font-family:'Plus Jakarta Sans',sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#0f172a;background:#ffffff;">
    <div style="border-bottom:2px solid #0891b2;padding-bottom:12px;margin-bottom:18px;">
      <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#0891b2;">NepalAI Velocity Threshold Alert</div>
      <h2 style="margin:6px 0 4px;font-size:19px;">Threshold Surpassed (&ge; ${input.alert.minVelocityScore}/100)</h2>
      <p style="font-size:13px;color:#475569;margin:0;">Filter: ${escapeHtml(input.alert.keywordFilter || catLabel)} (${escapeHtml(input.alert.country)})</p>
    </div>
    <ol style="list-style:none;padding:0;margin:0;">${itemsHtml}</ol>
    <p style="margin-top:18px;font-size:13px;"><a href="${cleanOrigin}/trending/nepal" style="color:#0891b2;font-weight:600;">Open Nepal Trends Portal &rarr;</a></p>
    <p style="margin-top:14px;font-size:12px;color:#64748b;">Remove this threshold alert: <a href="${escapeHtml(input.unsubscribeUrl)}">${escapeHtml(input.unsubscribeUrl)}</a></p>
  </div>`;

  return { subject, text: textLines.join('\n'), html };
}

// =========================================================================
// PHASE 3B: SEASONAL NEPAL ANALYTICS & WHATSAPP BUSINESS WEBHOOK RELAY
// =========================================================================

export type SeasonalPillarSlug = 'festivals' | 'exams' | 'trekking' | 'ecommerce';

export interface SeasonalPillarDef {
  slug: SeasonalPillarSlug;
  labelEn: string;
  labelNe: string;
  bsWindowLabel: string;
  descriptionEn: string;
}

export const SEASONAL_PILLARS: SeasonalPillarDef[] = [
  {
    slug: 'festivals',
    labelEn: 'Festivals & Culture',
    labelNe: 'चाडपर्व र संस्कृति',
    bsWindowLabel: 'Bhadra–Kartik & Falgun',
    descriptionEn: 'Dashain, Tihar, Teej, Chhath, and Holi search demand across flights, gifting, gold, and patro.',
  },
  {
    slug: 'exams',
    labelEn: 'Exams & Education',
    labelNe: 'परीक्षा र लोकसेवा',
    bsWindowLabel: 'Jestha–Bhadra & Poush',
    descriptionEn: 'SEE results, NEB Grade 12, TU admissions, IELTS, and Lok Sewa Aayog civil service cycles.',
  },
  {
    slug: 'trekking',
    labelEn: 'Trekking & Tourism',
    labelNe: 'ट्रेकिङ र पर्यटन',
    bsWindowLabel: 'Chaitra–Jestha & Ashwin–Mangsir',
    descriptionEn: 'Everest Base Camp, Annapurna Circuit, Upper Mustang, Pokhara flights, and TIMS/ACAP permits.',
  },
  {
    slug: 'ecommerce',
    labelEn: 'E-commerce & Fintech',
    labelNe: 'ई-कमर्स र फिनटेक',
    bsWindowLabel: 'Kartik–Mangsir & Baisakh',
    descriptionEn: 'Daraz 11.11, Dashain mega sales, Nepali New Year offers, eSewa/Khalti utility & remittance spikes.',
  },
];

export interface CuratedSeasonalBenchmarkSeed {
  id: string;
  keyword: string;
  pillar: SeasonalPillarSlug;
  bsMonthLabel: string;
  peakMonths: number[]; // 1..12 (Gregorian calendar anchor)
  monthlyIndex: number[]; // 12-month relative interest (0..100)
  romanizedNepali: string;
  devanagariVariant: string;
  linkedToolTab?: TrendCategoryDef['linkedToolTab'];
  insightNote: string;
}

export const CURATED_SEASONAL_BENCHMARKS: CuratedSeasonalBenchmarkSeed[] = [
  {
    id: 'sb_dashain_flights',
    keyword: 'Dashain Bus & Domestic Flight Ticket',
    pillar: 'festivals',
    bsMonthLabel: 'Ashwin–Kartik',
    peakMonths: [9, 10],
    monthlyIndex: [18, 16, 20, 22, 24, 26, 28, 42, 86, 100, 48, 22],
    romanizedNepali: 'Dashain ko ticket booking Nepal',
    devanagariVariant: 'दशैंको बस र हवाई टिकट बुकिङ',
    linkedToolTab: 'fx',
    insightNote: 'Search interest surges 4 weeks prior to Ghatasthapana as Kathmandu residents & diaspora travel home.',
  },
  {
    id: 'sb_tihar_gifts',
    keyword: 'Tihar Bhai Tika Gift & Lights Nepal',
    pillar: 'festivals',
    bsMonthLabel: 'Kartik',
    peakMonths: [10, 11],
    monthlyIndex: [14, 14, 15, 16, 15, 16, 18, 25, 58, 96, 92, 20],
    romanizedNepali: 'Tihar bhai tika gift Kathmandu',
    devanagariVariant: 'तिहार भाइटीका उपहार र झिलिमिली बत्ती',
    linkedToolTab: 'bullion',
    insightNote: 'High overseas Nepali gifting demand (US, AU, UK) overlaps with gold/silver coin & sweets orders.',
  },
  {
    id: 'sb_teej_shopping',
    keyword: 'Hartalika Teej Saree & Gold Rate Nepal',
    pillar: 'festivals',
    bsMonthLabel: 'Bhadra',
    peakMonths: [8, 9],
    monthlyIndex: [20, 22, 20, 24, 26, 30, 56, 94, 72, 34, 24, 20],
    romanizedNepali: 'Teej saree ra sun ko bhau Nepal',
    devanagariVariant: 'हरितालिका तीज साडी र सुनको भाउ',
    linkedToolTab: 'bullion',
    insightNote: 'Bhadra jewelry and ethnic apparel searches drive sharp retail and bullion rate lookups.',
  },
  {
    id: 'sb_see_result',
    keyword: 'SEE Result & Grade 11 Admission Nepal',
    pillar: 'exams',
    bsMonthLabel: 'Ashad–Shrawan',
    peakMonths: [6, 7],
    monthlyIndex: [18, 20, 32, 46, 52, 98, 90, 44, 24, 18, 16, 16],
    romanizedNepali: 'SEE result kasari herne Nepal',
    devanagariVariant: 'एसईई नतिजा र कक्षा ११ भर्ना नेपाल',
    linkedToolTab: 'sarkari',
    insightNote: 'Peaks in Ashad/June-July with GPA lookup tutorials, SMS portals, and Plus-Two college comparisons.',
  },
  {
    id: 'sb_loksewa_vacancy',
    keyword: 'Lok Sewa Aayog Vacancy & Exam Calendar',
    pillar: 'exams',
    bsMonthLabel: 'Mangsir–Magh',
    peakMonths: [11, 12, 1],
    monthlyIndex: [84, 72, 64, 58, 54, 52, 56, 60, 68, 76, 94, 96],
    romanizedNepali: 'Loksewa naya vacancy form Nepal',
    devanagariVariant: 'लोकसेवा आयोग नयाँ विज्ञापन र परीक्षा तालिका',
    linkedToolTab: 'sarkari',
    insightNote: 'Major Officer/Nayab Subba/Kharidar cycles push sustained winter spikes across all 77 districts.',
  },
  {
    id: 'sb_neb_plus2',
    keyword: 'NEB Class 12 Result & Abroad Study IELTS',
    pillar: 'exams',
    bsMonthLabel: 'Shrawan–Bhadra',
    peakMonths: [7, 8, 9],
    monthlyIndex: [38, 40, 44, 48, 56, 62, 88, 95, 78, 52, 44, 40],
    romanizedNepali: 'Class 12 result ra Australia Japan visa',
    devanagariVariant: 'कक्षा १२ नतिजा र विदेश अध्ययन IELTS',
    linkedToolTab: 'fx',
    insightNote: 'Post-NEB results trigger immediate spillover into IELTS dates, No Objection Certificate (NOC), and AU/JP visas.',
  },
  {
    id: 'sb_ebc_trek',
    keyword: 'Everest Base Camp Trek Weather & Lukla Flight',
    pillar: 'trekking',
    bsMonthLabel: 'Chaitra–Baisakh & Ashwin–Mangsir',
    peakMonths: [3, 4, 10, 11],
    monthlyIndex: [30, 44, 78, 94, 62, 26, 22, 34, 68, 98, 86, 36],
    romanizedNepali: 'Everest base camp trek kharcha ra season',
    devanagariVariant: 'सगरमाथा आधार शिविर ट्रेक र लुक्ला उडान',
    insightNote: 'Bimodal Himalayan window: Spring (Mar–Apr) and post-monsoon Autumn (Oct–Nov) drive global bookings.',
  },
  {
    id: 'sb_annapurna_mustang',
    keyword: 'Annapurna Circuit & Upper Mustang Permit',
    pillar: 'trekking',
    bsMonthLabel: 'Ashwin–Kartik & Baisakh',
    peakMonths: [4, 5, 10, 11],
    monthlyIndex: [28, 36, 64, 86, 76, 38, 30, 42, 72, 95, 82, 32],
    romanizedNepali: 'Annapurna base camp ra Mustang jane bato',
    devanagariVariant: 'अन्नपूर्ण बेस क्याम्प र मुस्ताङ भ्रमण अनुमति',
    insightNote: 'High domestic Nepali youth travel during Dashain-Tihar holidays combined with international ACAP demand.',
  },
  {
    id: 'sb_daraz_1111',
    keyword: 'Nepal E-Commerce 11.11 & Festive Discount',
    pillar: 'ecommerce',
    bsMonthLabel: 'Kartik–Mangsir',
    peakMonths: [10, 11],
    monthlyIndex: [34, 32, 36, 48, 38, 36, 38, 44, 66, 88, 100, 52],
    romanizedNepali: 'Daraz 11.11 discount offer Nepal',
    devanagariVariant: 'नेपाल अनलाइन सपिङ ११.११ र चाडपर्व छुट',
    linkedToolTab: 'nepse',
    insightNote: 'Electronics, winter wear, and QR wallet cashback campaigns peak sharply across Dashain–11.11.',
  },
  {
    id: 'sb_esewa_remit',
    keyword: 'eSewa / Khalti Remittance & New Year Cashback',
    pillar: 'ecommerce',
    bsMonthLabel: 'Chaitra–Baisakh & Ashwin',
    peakMonths: [4, 9, 10],
    monthlyIndex: [52, 50, 58, 84, 64, 58, 60, 62, 78, 92, 70, 56],
    romanizedNepali: 'bidesh bata esewa ma remittance bonus',
    devanagariVariant: 'ईसेवा खल्ती रेमिट्यान्स बोनस र नयाँ वर्ष अफर',
    linkedToolTab: 'fx',
    insightNote: 'Nepali New Year (Baisakh) and Dashain remittance inflows accelerate wallet top-up and utility searches.',
  },
];

export function computeSeasonalDirection(
  monthlyIndex: number[],
  monthNum: number // 1..12
): {
  currentScore: number;
  direction: 'rising' | 'pre-peak' | 'peak' | 'steady';
} {
  const idx = ((monthNum - 1) % 12 + 12) % 12;
  const nextIdx = (idx + 1) % 12;
  const prevIdx = (idx + 11) % 12;
  const current = monthlyIndex[idx] ?? 50;
  const next = monthlyIndex[nextIdx] ?? current;
  const prev = monthlyIndex[prevIdx] ?? current;

  if (current >= 80) return { currentScore: current, direction: 'peak' };
  if (next - current >= 16) return { currentScore: current, direction: 'pre-peak' };
  if (current - prev >= 10 || next > current) return { currentScore: current, direction: 'rising' };
  return { currentScore: current, direction: 'steady' };
}

export function buildSeasonalCurveSeries(
  items: Array<{ monthlyIndex: number[] }>,
  year = new Date().getUTCFullYear()
): TrendVelocityPoint[] {
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  if (items.length === 0) return [];

  return monthNames.map((label, mIdx) => {
    const sum = items.reduce((acc, it) => acc + (it.monthlyIndex[mIdx] ?? 0), 0);
    const avg = Math.round(sum / items.length);
    const prevSum = items.reduce((acc, it) => acc + (it.monthlyIndex[(mIdx + 11) % 12] ?? 0), 0);
    const prevAvg = mIdx > 0 ? Math.round(prevSum / items.length) : avg;
    const monthPadded = String(mIdx + 1).padStart(2, '0');
    return {
      timestamp: `${year}-${monthPadded}-15`,
      label,
      velocityScore: Math.max(0, Math.min(100, avg)),
      trafficFloor: 0,
      trafficBand: `${avg}/100 (${label})`,
      velocityDelta: mIdx > 0 ? avg - prevAvg : 0,
    };
  });
}

export function normalizeWhatsappNumber(raw?: string | null): string {
  if (!raw) return '';
  const cleaned = raw.trim().replace(/[\s()-]/g, '');
  if (!cleaned) return '';
  if (cleaned.startsWith('+')) return `+${cleaned.slice(1).replace(/\D/g, '')}`;
  if (cleaned.startsWith('00')) return `+${cleaned.slice(2).replace(/\D/g, '')}`;
  if (/^9[78]\d{8}$/.test(cleaned)) return `+977${cleaned}`;
  const digits = cleaned.replace(/\D/g, '');
  return digits ? `+${digits}` : '';
}

export function isValidWhatsappNumber(raw?: string | null): boolean {
  const normalized = normalizeWhatsappNumber(raw);
  return /^\+[1-9]\d{7,14}$/.test(normalized);
}

export function buildWhatsappDigestMessage(input: {
  originUrl: string;
  cadence: string;
  preferredLanguage?: 'en' | 'ne' | 'bilingual';
  trends: DigestTrendSummary[];
}): string {
  const cleanOrigin = input.originUrl.replace(/\/+$/, '');
  const header =
    input.preferredLanguage === 'ne'
      ? `*NepalAI ट्रेन्ड्स (${input.cadence === 'breaking' ? 'ताजा अलर्ट' : 'दैनिक सारांश'})*`
      : `*NepalAI Trends (${input.cadence === 'breaking' ? 'Breaking Spike' : 'Daily Digest'})*`;

  const lines = input.trends.slice(0, 4).map((t, i) => {
    const score = typeof t.trendScore === 'number' ? ` · ${t.trendScore}/100` : '';
    return `${i + 1}. *${t.keyword}* (${t.trafficBand}${score})\n${cleanOrigin}/trending/nepal/${t.slug}`;
  });

  return [header, '', ...lines].join('\n');
}

export function buildWhatsappThresholdMessage(input: {
  originUrl: string;
  alert: VelocityAlertRuleInput;
  matchedTrends: VelocityAlertCandidateTrend[];
}): string {
  const cleanOrigin = input.originUrl.replace(/\/+$/, '');
  const top = input.matchedTrends[0];
  const scope = input.alert.keywordFilter ? `"${input.alert.keywordFilter}"` : input.alert.category;
  const header = `*NepalAI Velocity Alert (>= ${input.alert.minVelocityScore}/100)*\nRule: ${scope} (${input.alert.country})`;
  const rows = input.matchedTrends.slice(0, 3).map(
    (t, i) =>
      `${i + 1}. *${t.keyword}* — Velocity *${t.trendScore}/100* (${t.trafficBand})\n${cleanOrigin}/trending/nepal/${t.slug}`
  );
  return [
    header,
    `Top surge: ${top.keyword} (${top.trendScore}/100)`,
    '',
    ...rows,
  ].join('\n');
}



