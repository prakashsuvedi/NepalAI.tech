/**
 * toolSeo.ts
 *
 * Central SEO, OpenGraph, Twitter Card, Canonical URL, and Schema.org
 * `WebApplication` JSON-LD registry for NepalAI Daily Utility Tools.
 * Used identically on the server (SSR <head> injection for /tools/:slug bots/scrapers)
 * and on the client (SPA head synchronization on tab/route transitions).
 */

export type ToolTabId =
  | 'fx'
  | 'letter'
  | 'voice'
  | 'ocr'
  | 'tax'
  | 'market'
  | 'ev'
  | 'nepse'
  | 'it_export'
  | 'bullion'
  | 'khata'
  | 'contract'
  | 'health'
  | 'sarkari';

export interface ToolSeoMetadata {
  slug: string;
  tab: ToolTabId;
  idFragment: string;
  name: string;
  title: string; // 30-60 chars ideal
  description: string; // 120-160 chars ideal
  ogTitle: string;
  ogDescription: string;
  keywords: string;
  applicationCategory: string;
  operatingSystem: string;
  featureList: string[];
  audience: string[];
}

export const DEFAULT_SITE_SEO = {
  title: 'nepalai.tech – Sovereign AI Hub, Studio & Enterprise AI Consulting in Nepal',
  description:
    'Nepal’s Sovereign AI Hub & daily utilities: EV road tax calculator, NEPSE CGT terminal, Section 95Ka IT export engine, bullion calculator, Roman Nepali letters & AI tools.',
  ogTitle: 'nepalai.tech – Sovereign AI Hub, Daily Utilities & Enterprise Consulting',
  ogDescription:
    'Free Nepal daily tools (EV Tax, NEPSE, IT Export, Bullion, Roman Nepali Letters) and practical AI tools for students, officers, businesses & families.',
  siteName: 'NepalAI.tech',
  ogImagePath: '/assets/nepal-ai-og-banner.png',
};

export const TOOL_SEO_REGISTRY: ToolSeoMetadata[] = [
  {
    slug: 'ev-tax',
    tab: 'ev',
    idFragment: '#ev-calculator',
    name: 'Nepal EV Road Tax, Bluebook & NEA Charging Calculator',
    title: 'Nepal EV Road Tax & Charging Cost Calculator | NepalAI',
    description:
      'Calculate Bagmati & provincial EV road tax, bluebook renewal late fines, and NEA TOD off-peak EV charging savings vs petrol in Nepal for FY 2081/82.',
    ogTitle: 'Nepal EV Road Tax, Bluebook Fine & NEA Charging Calculator',
    ogDescription:
      'Instant provincial EV annual road tax (kW slabs), compound delay fines, and NEA off-peak charging cost savings vs petrol vehicles in Nepal.',
    keywords:
      'EV road tax Nepal, electric vehicle tax Bagmati, bluebook renewal fine Nepal, NEA EV charging rate, BYD Atto 3 tax Nepal, EV vs petrol calculator Nepal',
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'All',
    featureList: [
      'Provincial EV annual road tax by peak kW motor power',
      'Compound bluebook delay penalty calculator (5% to 100%)',
      'NEA Time-of-Day (TOD) off-peak EV charging vs petrol savings',
      'Free A4 PDF audit slip export',
    ],
    audience: ['EV Owners', 'Yatayat Visitors', 'Corporate Fleet Managers'],
  },
  {
    slug: 'nepse',
    tab: 'nepse',
    idFragment: '#nepse-terminal',
    name: 'NEPSE Broker Commission & Capital Gains Tax (CGT) Terminal',
    title: 'NEPSE Broker Commission & CGT Tax Calculator | NepalAI',
    description:
      'Compute exact NEPSE share buy/sell broker commission, SEBON fee, DP charge, 7.5% or 5% CGT, break-even sell price, and bonus/right share adjustment.',
    ogTitle: 'NEPSE Broker Commission, CGT & Break-Even Calculator',
    ogDescription:
      'SEBON 5-tier broker commission, 7.5%/5% capital gains tax (CGT), DP charge, break-even price target, and bonus/right price adjustment.',
    keywords:
      'NEPSE calculator, NEPSE broker commission Nepal, capital gains tax NEPSE 5% 7.5%, bonus share price adjustment Nepal, right share calculator, SEBON fees',
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'All',
    featureList: [
      'SEBON 5-tier equity broker commission breakdown',
      'Short-term (7.5%) and Long-term (5%) Capital Gains Tax calculation',
      'CDSC DP charge, SEBON fee, and break-even price finder',
      'Bonus and Right share book-closure price adjustment',
    ],
    audience: ['Retail Investors', 'Share Traders', 'Portfolio Managers'],
  },
  {
    slug: 'it-export',
    tab: 'it_export',
    idFragment: '#it-export-engine',
    name: 'Nepal IT Export Remittance & Section 95Ka Declaration',
    title: 'Nepal IT Export 5% TDS & Sec 95Ka Letter | NepalAI',
    description:
      'Calculate inward USD IT export remittance via NRB rate with Income Tax Act Section 95Ka 5% freelance or 1% company final TDS and auto bank letter.',
    ogTitle: 'Nepal IT Export Remittance & Section 95Ka Bank Declaration',
    ogDescription:
      'Compute USD inward wire value in NPR, 5% freelancer or 1% company final TDS under Section 95Ka, and print ready-to-sign Nepali bank self-declaration letters.',
    keywords:
      'IT export tax Nepal, Section 95Ka Nepal, 5% freelance TDS Nepal, inward remittance declaration letter Nepal bank, software export income tax Nepal',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'All',
    featureList: [
      'Live NRB buying rate inward USD to NPR conversion',
      'Income Tax Act Section 95Ka 5% individual & 1% company final TDS',
      'Bilingual bank self-declaration letter generator & A4 PDF export',
    ],
    audience: ['Software Freelancers', 'IT Export Companies', 'Remote Engineers'],
  },
  {
    slug: 'bullion',
    tab: 'bullion',
    idFragment: '#bullion-terminal',
    name: 'Nepal Gold & Silver Bullion, Tola & Jewelry Tax Calculator',
    title: 'Nepal Gold Silver Price, Tola & Jewelry Tax | NepalAI',
    description:
      'FENEGOSIDA daily 24K Chhapawal, 22K Tejabi & silver rates, tola-aana-lal-gram converter, making charge, jarti wastage, 2% luxury tax & 13% VAT slip.',
    ogTitle: 'Nepal Gold & Silver Rate, Tola Converter & Jewelry Tax Calculator',
    ogDescription:
      'Audit jewelry quotes with live FENEGOSIDA rates, Tola/Aana/Lal to Grams conversion, ज्याला (making), जर्ती (wastage), luxury tax, and 10-year return simulator.',
    keywords:
      'gold price Nepal today, FENEGOSIDA gold rate, tola to gram Nepal, jarti jyala calculator Nepal, tejabi gold rate, luxury tax gold Nepal',
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'All',
    featureList: [
      'FENEGOSIDA live Chhapawal, Tejabi Gold & Fine Silver rates',
      'Tola, Aana, Lal, and Gram weight converter',
      'Making charge (ज्याला), wastage (जर्ती), 2% luxury tax & 13% VAT audit',
      'Free A4 jewelry quote PDF slip',
    ],
    audience: ['Families & Homemakers', 'Jewelry Buyers', 'Bullion Savers'],
  },
  {
    slug: 'forex',
    tab: 'fx',
    idFragment: '#nrb-forex-auditor',
    name: 'NRB Live Forex & $500 Dollar Card Cost Auditor',
    title: 'NRB Forex Converter & $500 Dollar Card Audit | NepalAI',
    description:
      'Live Nepal Rastra Bank exchange rates across 11 currencies plus AI SaaS dollar card cost breakdown with 3% bank FX spread and 2% Digital Services Tax.',
    ogTitle: 'NRB Live Forex & $500 Dollar Card AI Subscription Auditor',
    ogDescription:
      'Convert 11 NRB currencies instantly and check total NPR cost for ChatGPT, Claude, or SaaS tools including bank FX spread and 2% DST.',
    keywords: 'NRB forex rate today, USD to NPR, Nepal dollar card $500 limit, 2% digital services tax Nepal, AI subscription cost NPR',
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'All',
    featureList: [
      'Live Nepal Rastra Bank rates for 11 global currencies',
      '3% bank spread and 2% Digital Services Tax calculation',
      '$500 annual prepaid dollar card quota tracker',
    ],
    audience: ['Students', 'Developers', 'Marketers', 'Travelers'],
  },
  {
    slug: 'ward-letter',
    tab: 'letter',
    idFragment: '#ward-letter-studio',
    name: 'Nepali Roman Typing Official Letter, Ward & PDF Studio',
    title: 'Roman Nepali Letter Studio, PDF Save & Print | NepalAI',
    description:
      'Type in Roman Nepali and get instant Devanagari ward nibedan, school leave, corporate & family letters with Preeti converter, direct PDF save & print.',
    ogTitle: 'Nepali Roman Typing Letter Studio — Ward, Student, Business & PDF',
    ogDescription:
      'Convert Roman Nepali typing to Devanagari live, choose verified letter templates for students, officers & businesses, convert to Preeti, print or save PDF.',
    keywords:
      'Roman to Nepali typing, Nepali letter generator, ward nibedan format, Preeti converter Nepal, Nepali PDF letter save print',
    applicationCategory: 'ProductivityApplication',
    operatingSystem: 'All',
    featureList: [
      'Live Romanized Nepali to Devanagari phonetic typing',
      'Verified templates for Citizens, Students, Officers, Business & Homemakers',
      'Unicode to Preeti conversion, direct A4 Save PDF, Print & Word export',
    ],
    audience: ['Students', 'Ward & Gov Officers', 'Business Owners', 'Homemakers'],
  },
  {
    slug: 'income-tax',
    tab: 'tax',
    idFragment: '#income-tax-calculator',
    name: 'Nepal IRD Income Tax & Salary Take-Home Calculator (FY 2081/82)',
    title: 'Nepal Income Tax & Salary TDS Calculator 2081/82 | NepalAI',
    description:
      'Official Nepal IRD income tax calculator for FY 2081/82 supporting Single/Married slabs, SSF, CIT/EPF deductions, female tax rebate, and PDF pay slip.',
    ogTitle: 'Nepal Income Tax & Monthly Salary TDS Calculator (FY 2081/82)',
    ogDescription:
      'Calculate monthly net take-home salary, IRD slabs, SSF 1% social security, CIT/EPF rebates, and export printable tax slips.',
    keywords: 'Nepal income tax calculator 2081/82, salary TDS calculator Nepal, SSF tax exemption Nepal, IRD Nepal tax slab',
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'All',
    featureList: [
      'Single and Married IRD progressive tax slabs (FY 2081/82)',
      'SSF, EPF, CIT & Insurance statutory deductions',
      '10% single female tax rebate and A4 tax slip PDF export',
    ],
    audience: ['Corporate Employees', 'HR & Payroll Officers', 'Accountants'],
  },
  {
    slug: 'land-kalimati',
    tab: 'market',
    idFragment: '#kalimati-land-units',
    name: 'Kalimati Daily Produce Rates & Ropani-Bigha Land Converter',
    title: 'Kalimati Vegetable Rates & Ropani Land Converter | NepalAI',
    description:
      'Check live Kalimati wholesale vegetable & fruit prices alongside instant Ropani-Aana-Paisa-Daam, Bigha-Kattha-Dhur, SqFt, and Dharni/Pau conversions.',
    ogTitle: 'Kalimati Daily Vegetable Prices & Nepali Land Unit Converter',
    ogDescription:
      'Live Kalimati market produce prices with retail margin estimator plus accurate Hilly Ropani and Terai Bigha land & weight converter.',
    keywords: 'Kalimati vegetable price today, Ropani to Bigha converter, Aana to Sq Ft Nepal, Dharni to Kg converter',
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'All',
    featureList: [
      'Live Kalimati Fruits & Vegetable Market daily wholesale prices',
      'Hilly Ropani-Aana-Paisa-Daam and Terai Bigha-Kattha-Dhur converter',
      'Traditional Nepali weights (Dharni, Pau, Kg) converter',
    ],
    audience: ['Homemakers', 'Agri Traders', 'Real Estate & Land Surveyors'],
  },
  {
    slug: 'nepali-ocr',
    tab: 'ocr',
    idFragment: '#devanagari-ocr',
    name: 'Devanagari Document Intelligence & Nepali OCR Parser',
    title: 'Nepali Devanagari OCR & Bill Extractor | NepalAI',
    description:
      'Extract structured JSON fields from Nepali Citizenship (Nagarikta), Land Lalpurja, IRD VAT invoices, and documents in seconds.',
    ogTitle: 'Devanagari Document OCR — Nagarikta, Lalpurja & VAT Bills',
    ogDescription:
      'Instant AI optical parsing for Nepali Citizenship IDs, Land Lalpurja deeds, VAT invoices, and business records into clean structured cards & JSON.',
    keywords: 'Nepali OCR, Devanagari OCR, Nagarikta extractor, Lalpurja parser, Nepal VAT invoice OCR',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'All',
    featureList: [
      'Image & PDF document upload or paste raw Devanagari text',
      'Structured extraction for Nagarikta, Lalpurja & VAT invoices',
      'Visual card inspection & downloadable JSON export',
    ],
    audience: ['Officers', 'Corporate Ops', 'Finance & Legal Teams'],
  },
  {
    slug: 'nepali-voice',
    tab: 'voice',
    idFragment: '#nepali-voice-studio',
    name: 'Nepali Neural Voice & Regional Accent Synthesizer',
    title: 'Nepali Text to Speech & Accent Studio | NepalAI',
    description:
      'Natural Nepali Devanagari text-to-speech with speed/pitch control and authentic Kathmandu, Pokhara, Kirati & Maithili cadence presets.',
    ogTitle: 'Nepali Text-to-Speech & Regional Dialect Studio',
    ogDescription:
      'Listen to Devanagari notices, study notes, and scripts aloud with adjustable speed, pitch, and exportable Nepali transcripts.',
    keywords: 'Nepali text to speech, Nepali TTS online, Devanagari voice reader, Nepali accent synthesizer',
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'All',
    featureList: [
      'Devanagari speech synthesis in-browser with speed & pitch controls',
      'Kathmandu, Gandaki Pokhara, Eastern Kirati & Terai cadence presets',
      'Instant transcript copy & text export',
    ],
    audience: ['Students', 'Marketers', 'Content Creators', 'Accessibility'],
  },
  {
    slug: 'khata-snap',
    tab: 'khata',
    idFragment: '#khata-bill-snapper',
    name: 'Handwritten Bill & Udharo Khata Photo-to-Ledger Snapper',
    title: 'Handwritten Bill & Udharo Khata Snapper | NepalAI',
    description:
      'Snap a photo of any handwritten paper bill or kirana udharo notebook to extract clean NPR items, track dues, send WhatsApp reminders, and export PDF/CSV.',
    ogTitle: 'Handwritten Bill & Udharo Khata Snapper (Photo → Clean Ledger)',
    ogDescription:
      'Convert handwritten Nepali or English shop bills and credit notebooks into clean digital ledgers with 1-tap WhatsApp reminders, PDF & Excel CSV.',
    keywords:
      'udharo khata Nepal, handwritten bill scanner Nepali, kirana pasal hisab app, digital khata PDF CSV Nepal, photo to ledger Nepali',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'All',
    featureList: [
      'Handwritten bill & notebook photo upload with Gemini multimodal extraction',
      'Devanagari digits (०-९) & Nepali/English unit parsing',
      '1-tap WhatsApp due reminder with eSewa/FonePay reference',
      'Local Khata Book persistence with A4 PDF and CSV export',
    ],
    audience: ['Kirana & Shop Owners', 'Homemakers', 'Students & Roommates', 'Small Businesses'],
  },
  {
    slug: 'contract-risk',
    tab: 'contract',
    idFragment: '#contract-risk-scanner',
    name: 'Nepal Contract & Tamasuk Risk Scanner (Before You Sign)',
    title: 'Contract & Tamasuk Risk Scanner Nepal | NepalAI',
    description:
      'Scan Nepali house rent agreements, kapali tamasuk loans, job offer bonds & business deals for unfair clauses, illegal interest & missing protections.',
    ogTitle: 'Contract & Tamasuk Risk Scanner — Check Agreements Before Signing',
    ogDescription:
      'Upload or paste any rent agreement, loan tamasuk, or job offer letter to spot hidden traps, Nepal Civil/Labor law risks, and safer rewrites.',
    keywords:
      'tamasuk format Nepal, ghar bhada samjhauta Nepal, job bond law Nepal, contract risk scanner Nepal, Muluki Civil Code loan interest',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'All',
    featureList: [
      'Scans rent deeds, kapali tamasuk loans, employment bonds & vendor deals',
      'Checks against Nepal Civil Code 10% loan cap & Labor Act fairness norms',
      'Provides plain-language explanations, safer rewrites & PDF risk report',
    ],
    audience: ['Tenants & Landlords', 'Job Seekers', 'Borrowers & Lenders', 'Small Businesses'],
  },
  {
    slug: 'health-translator',
    tab: 'health',
    idFragment: '#health-report-translator',
    name: 'Lab Report & Prescription Translator for Parents (Nepali Audio)',
    title: 'Lab Report & Medicine Guide in Nepali | NepalAI',
    description:
      'Translate blood tests and doctor prescriptions (OD/BD/TDS/HS) into calm Nepali explanations with Morning/Day/Night pill charts and voice readback.',
    ogTitle: 'Lab Report & Prescription Translator for Parents (+ Nepali Audio)',
    ogDescription:
      'Upload or paste any lab report or prescription to get large-print Morning/Day/Night pill schedules, gentle Nepali explanations, and audio readback.',
    keywords:
      'lab report explain Nepali, prescription BD OD HS meaning Nepali, medicine timing chart parents Nepal, blood sugar cholesterol Nepali guide',
    applicationCategory: 'HealthApplication',
    operatingSystem: 'All',
    featureList: [
      'Translates doctor prescription codes (OD, BD, TDS, HS, AC/PC) into Morning/Day/Night chart',
      'Explains Hemoglobin, Sugar, HbA1c, Lipid, Thyroid & CBC results calmly in Nepali',
      '1-tap Listen in Nepali audio readback & printable Fridge Chart PDF',
    ],
    audience: ['Parents & Elders', 'Families & Caregivers', 'Patients Across Nepal'],
  },
  {
    slug: 'sarkari-guide',
    tab: 'sarkari',
    idFragment: '#sarkari-counter-navigator',
    name: 'Sarkari Kaam Zero-Mistake Counter Navigator Nepal',
    title: 'Passport, License, PAN, Malpot Counter Guide | NepalAI',
    description:
      'Interactive Nepal government service guide: exact documents, room-by-room counter sequence, official fees & trap alerts for Passport, NID, License, PAN & Malpot.',
    ogTitle: 'Sarkari Kaam Zero-Mistake Counter Navigator (Nepal Citizen Guide)',
    ogDescription:
      'Prepare documents with interactive checklists & counter-by-counter maps for e-Passport, NID, Yatayat Driving License, PAN/VAT, OCR Company & Malpot Pass.',
    keywords:
      'Nepal passport documents fee, driving license renewal Yatayat Nepal, NID card registration Nepal, malpot jaggapass documents, OCR company registration Nepal',
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'All',
    featureList: [
      '7 verified citizen workflows: e-Passport, NID, Driving License, PAN/VAT, OCR Company, Malpot Land Pass & Police Clearance',
      'Interactive mandatory document readiness checklist',
      'Exact counter-by-counter steps, official government fees & printable A4 PDF checklist',
    ],
    audience: ['All Citizens', 'Students', 'Entrepreneurs', 'Homebuyers'],
  },
];

const SLUG_MAP = new Map<string, ToolSeoMetadata>(
  TOOL_SEO_REGISTRY.map((item) => [item.slug.toLowerCase(), item])
);

const TAB_MAP = new Map<ToolTabId, ToolSeoMetadata>(
  TOOL_SEO_REGISTRY.map((item) => [item.tab, item])
);

export function getToolSeoBySlug(slug?: string | null): ToolSeoMetadata | undefined {
  if (!slug) return undefined;
  return SLUG_MAP.get(slug.replace(/^\/+|\/+$/g, '').toLowerCase());
}

export function getToolSeoByTab(tab?: ToolTabId | string | null): ToolSeoMetadata | undefined {
  if (!tab) return undefined;
  return TAB_MAP.get(tab as ToolTabId);
}

export function resolveToolFromUrl(
  pathname: string,
  search: string
): ToolSeoMetadata | undefined {
  const cleanPath = (pathname || '').replace(/\/+$/, '');
  if (cleanPath.startsWith('/tools/')) {
    const slug = cleanPath.slice('/tools/'.length).split('/')[0];
    const matched = getToolSeoBySlug(slug);
    if (matched) return matched;
  }

  if (search) {
    const params = new URLSearchParams(search);
    const toolParam = params.get('tool');
    if (toolParam) {
      const bySlug = getToolSeoBySlug(toolParam);
      if (bySlug) return bySlug;
      const byTab = getToolSeoByTab(toolParam);
      if (byTab) return byTab;
    }
  }

  return undefined;
}

export function buildWebApplicationJsonLd(tool: ToolSeoMetadata, baseOrigin: string) {
  const cleanBase = baseOrigin.replace(/\/+$/, '');
  const toolUrl = `${cleanBase}/tools/${tool.slug}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    '@id': `${cleanBase}/${tool.idFragment}`,
    name: tool.name,
    url: toolUrl,
    applicationCategory: tool.applicationCategory,
    operatingSystem: tool.operatingSystem,
    browserRequirements: 'Requires JavaScript. Modern Chrome, Safari, Edge, or Firefox.',
    inLanguage: ['en-US', 'ne-NP'],
    description: tool.description,
    featureList: tool.featureList,
    audience: {
      '@type': 'Audience',
      audienceType: tool.audience.join(', '),
    },
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'NPR',
      availability: 'https://schema.org/InStock',
    },
    provider: {
      '@type': 'Organization',
      name: 'NepalAI Technologies',
      url: cleanBase,
    },
  };
}

function upsertMetaTag(
  selector: string,
  attrName: 'name' | 'property',
  attrValue: string,
  content: string
) {
  if (typeof document === 'undefined') return;
  let el = document.head.querySelector(selector) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attrName, attrValue);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertCanonicalLink(href: string) {
  if (typeof document === 'undefined') return;
  let link = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', href);
}

export function applyClientToolSeo(tool: ToolSeoMetadata): void {
  if (typeof document === 'undefined' || typeof window === 'undefined') return;

  const origin = window.location.origin;
  const toolUrl = `${origin}/tools/${tool.slug}`;
  const ogImage = `${origin}${DEFAULT_SITE_SEO.ogImagePath}`;

  document.title = tool.title;
  upsertCanonicalLink(toolUrl);

  upsertMetaTag('meta[name="description"]', 'name', 'description', tool.description);
  upsertMetaTag('meta[name="keywords"]', 'name', 'keywords', tool.keywords);

  upsertMetaTag('meta[property="og:title"]', 'property', 'og:title', tool.ogTitle);
  upsertMetaTag('meta[property="og:description"]', 'property', 'og:description', tool.ogDescription);
  upsertMetaTag('meta[property="og:url"]', 'property', 'og:url', toolUrl);
  upsertMetaTag('meta[property="og:type"]', 'property', 'og:type', 'website');
  upsertMetaTag('meta[property="og:site_name"]', 'property', 'og:site_name', DEFAULT_SITE_SEO.siteName);
  upsertMetaTag('meta[property="og:image"]', 'property', 'og:image', ogImage);

  upsertMetaTag('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
  upsertMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', tool.ogTitle);
  upsertMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', tool.ogDescription);
  upsertMetaTag('meta[name="twitter:image"]', 'name', 'twitter:image', ogImage);

  const jsonLd = buildWebApplicationJsonLd(tool, origin);
  let script = document.getElementById('nepalai-tool-jsonld') as HTMLScriptElement | null;
  if (!script) {
    script = document.createElement('script');
    script.id = 'nepalai-tool-jsonld';
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(jsonLd);
}

export function resetDefaultSiteSeo(): void {
  if (typeof document === 'undefined' || typeof window === 'undefined') return;
  const origin = window.location.origin;
  const homeUrl = `${origin}${window.location.pathname === '/' ? '' : window.location.pathname}`;

  document.title = DEFAULT_SITE_SEO.title;
  upsertCanonicalLink(origin);

  upsertMetaTag('meta[name="description"]', 'name', 'description', DEFAULT_SITE_SEO.description);
  upsertMetaTag('meta[property="og:title"]', 'property', 'og:title', DEFAULT_SITE_SEO.ogTitle);
  upsertMetaTag('meta[property="og:description"]', 'property', 'og:description', DEFAULT_SITE_SEO.ogDescription);
  upsertMetaTag('meta[property="og:url"]', 'property', 'og:url', homeUrl);
  upsertMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', DEFAULT_SITE_SEO.ogTitle);
  upsertMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', DEFAULT_SITE_SEO.ogDescription);

  const script = document.getElementById('nepalai-tool-jsonld');
  if (script) {
    script.remove();
  }
}
