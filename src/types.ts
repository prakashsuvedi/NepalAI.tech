export type ThemeMode = 'dark' | 'light';
export type Language = 'en' | 'ne';

export interface HeroConfig {
  eyebrowNepali: string;
  eyebrowEnglish: string;
  studioUrl: string;
  headlineDevanagari: string;
  headlineEnglish: string;
  descriptionNepali: string;
  liveCreditAmount: string;
  metric1Value: string;
  metric1Label: string;
  metric2Value: string;
  metric2Label: string;
  metric3Value: string;
  metric3Label: string;
  showHimalayaArt: boolean;
  showMandirMotif: boolean;
}

export type CaseStudyCategory = 'All' | 'Fintech & KYC' | 'Voice & NLP' | 'Tourism & Edge' | 'Health & Gov' | 'AgriTech';

export interface CaseStudy {
  id: string;
  title: string;
  client: string;
  location: string;
  category: CaseStudyCategory;
  summary: string;
  metrics: {
    label: string;
    value: string;
    subtext?: string;
  }[];
  challenge: string;
  solution: string;
  architecture: string[];
  technologies: string[];
  duration: string;
  roi: string;
  featured: boolean;
  demoUrl?: string;
}

export type ConsultingTier = 'Sprint' | 'Project' | 'Retainer' | 'Workshop';

export interface ConsultingOffering {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  badge?: string;
  duration: string;
  tier: ConsultingTier;
  deliverables: string[];
  idealFor: string[];
  techFocus: string[];
  startingPriceNpr?: string;
  startingPriceUsd?: string;
}

export type ToolCategory = 'All' | 'Coding' | 'LLM & Writing' | 'Design & Video' | 'Audio & Voice' | 'Automation';

export interface NepalAITool {
  id: string;
  name: string;
  category: ToolCategory;
  description: string;
  worksInNepal: 'direct' | 'needs-vpn' | 'restricted';
  nepalPaymentStatus: 'esewa-khalti' | 'dollar-card-only' | 'free-tier-available' | 'no-payment-needed';
  paymentDetails: string;
  monthlyPriceUsd: number;
  freeTierAvailable: boolean;
  popularityInNepal: 'Top 1%' | 'Trending' | 'Essential' | 'Specialized';
  officialUrl: string;
  keyCapability: string;
  localAdoptionPercent?: number;
  businessUsageTier?: string;
  monthlyActiveBusinesses?: string;
}

export interface NepalAINewsItem {
  id: string;
  headline: string;
  source: string;
  date: string;
  category: string;
  summary: string;
  impactForNepal: string;
  sourceUrl?: string;
  verifiedTag?: string;
}

export type FAQCategory = 'All' | 'Payments & Wallets' | 'AI Consulting' | 'Sovereign AI & Studio' | 'Privacy & Compliance';

export interface FAQItem {
  id: string;
  category: FAQCategory;
  questionEn: string;
  questionNe: string;
  answerEn: string;
  answerNe: string;
  tags?: string[];
  badge?: string;
}

export interface ContactFormData {
  fullName: string;
  email: string;
  phone?: string;
  organization?: string;
  serviceCategory?: string;
  budgetRange?: string;
  message: string;
}
