/**
 * trendsSeo.ts
 *
 * Canonical SEO, OpenGraph, Twitter Cards, and Schema.org JSON-LD helpers for
 * Nepal AI + Trends routes (/trending/nepal, /trending/nepal/:category,
 * /trending/nepal/:slug, /trending/diaspora, /keywords/nepal, /keywords/nepal/business).
 */

import { TREND_CATEGORIES, TrendCategorySlug } from './trendsEngine';

export interface TrendsRouteMatch {
  view: 'nepal' | 'category' | 'detail' | 'diaspora' | 'keywords' | 'business-keywords' | 'seasonal' | 'api-vault';
  category?: TrendCategorySlug;
  slug?: string;
}

export interface TrendsSeoMeta {
  canonicalPath: string;
  title: string;
  description: string;
  ogType: 'website' | 'article';
  ogTitle: string;
  ogDescription: string;
  keywords: string;
  jsonLd: Record<string, unknown>;
}

export function resolveTrendsRouteFromPath(pathname: string): TrendsRouteMatch | null {
  const clean = pathname.replace(/\/+$/, '') || '/';
  if (clean === '/trending/nepal') {
    return { view: 'nepal' };
  }
  if (clean === '/trending/diaspora') {
    return { view: 'diaspora' };
  }
  if (clean === '/keywords/nepal') {
    return { view: 'keywords' };
  }
  if (clean === '/keywords/nepal/business') {
    return { view: 'business-keywords' };
  }
  if (clean === '/trending/seasonal' || clean === '/keywords/nepal/seasonal') {
    return { view: 'seasonal' };
  }
  if (clean === '/trending/api') {
    return { view: 'api-vault' };
  }
  if (clean.startsWith('/trending/nepal/')) {
    const segment = decodeURIComponent(clean.slice('/trending/nepal/'.length)).trim();
    if (!segment) return { view: 'nepal' };
    const matchedCategory = TREND_CATEGORIES.find((c) => c.slug === segment);
    if (matchedCategory) {
      return { view: 'category', category: matchedCategory.slug };
    }
    return { view: 'detail', slug: segment };
  }
  return null;
}

export function buildTrendsListingSeo(
  route: TrendsRouteMatch,
  originUrl: string
): TrendsSeoMeta {
  const cleanOrigin = originUrl.replace(/\/+$/, '');

  if (route.view === 'diaspora') {
    return {
      canonicalPath: '/trending/diaspora',
      title: 'Nepali Diaspora Trends (US, UK, UAE, AU, JP, CA) | NepalAI',
      description:
        'Track Nepal-related search trends across the US, UK, UAE, Australia, Japan, and Canada — remittance, flights, festivals, gifting, and property demand.',
      ogType: 'website',
      ogTitle: 'Nepali Diaspora Search Trends & Global Pulse | NepalAI.tech',
      ogDescription:
        'Live Nepal search intelligence across major Nepali diaspora hubs worldwide.',
      keywords:
        'Nepali diaspora trends, NRN search trends, Nepal remittance trends, flights to Kathmandu search, Nepali in Australia US UAE UK Japan',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Nepali Diaspora Trends',
        url: `${cleanOrigin}/trending/diaspora`,
        description:
          'Nepal-linked search trends across major global diaspora countries.',
        publisher: {
          '@type': 'Organization',
          name: 'NepalAI Technologies',
          url: cleanOrigin,
        },
      },
    };
  }

  if (route.view === 'keywords') {
    return {
      canonicalPath: '/keywords/nepal',
      title: 'Nepal Keyword Explorer (English, Romanized & Devanagari) | NepalAI',
      description:
        'Search any term in English, Romanized Nepali, or Devanagari to uncover related queries, trend direction, local business intent, and diaspora relevance.',
      ogType: 'website',
      ogTitle: 'Nepal Tri-Script Keyword Explorer | NepalAI.tech',
      ogDescription:
        'Expand English, Romanized Nepali, and Devanagari keywords with trend direction and audience intent.',
      keywords:
        'Nepal keyword research, Romanized Nepali keywords, Devanagari SEO Nepal, Nepal search volume, Nepali content ideas',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'Nepal Keyword Explorer',
        url: `${cleanOrigin}/keywords/nepal`,
        description:
          'Multi-script keyword intelligence tool for Nepali creators, marketers, and businesses.',
      },
    };
  }

  if (route.view === 'api-vault') {
    return {
      canonicalPath: '/trending/api',
      title: 'Nepal Trends Creator Vault, Digest & Developer API v1 | NepalAI',
      description:
        'Manage tracked Nepal keyword watchlists, saved bilingual SEO content briefs, email digest previews, and metered REST API keys for Nepali media houses and agencies.',
      ogType: 'website',
      ogTitle: 'NepalAI Trends Developer API v1 & Creator Vault | NepalAI.tech',
      ogDescription:
        'Access live Nepal search intelligence via REST API v1, manage watchlists, and preview automated trend digests.',
      keywords:
        'Nepal trends API, Nepali keyword API, Nepal SEO content briefs, NepalAI developer API',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'Nepal Trends Creator Vault & Developer API v1',
        url: `${cleanOrigin}/trending/api`,
        description:
          'Creator content briefs, watchlists, digest dispatcher, and REST API v1 key management.',
      },
    };
  }

  if (route.view === 'seasonal') {
    return {
      canonicalPath: '/trending/seasonal',
      title: 'Nepal Rising & Seasonal Search Analytics (Festivals, Exams, Trekking) | NepalAI',
      description:
        'Explore 12-month Nepal seasonal search demand across Dashain/Tihar festivals, SEE/NEB/Lok Sewa exams, Everest/Annapurna trekking, and e-commerce.',
      ogType: 'website',
      ogTitle: 'Rising & Seasonal Nepal Search Demand Dashboard | NepalAI.tech',
      ogDescription:
        'Track recurring Bikram Sambat seasonal keyword cycles and rising search velocity across Nepal.',
      keywords:
        'Nepal seasonal keywords, Dashain search trends, SEE result trends, Nepal trekking season demand, rising keywords Nepal',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Nepal Rising & Seasonal Analytics',
        url: `${cleanOrigin}/trending/seasonal`,
        description:
          'Seasonal search demand matrix and rising keyword velocity analytics for Nepal.',
      },
    };
  }

  if (route.view === 'business-keywords') {
    return {
      canonicalPath: '/keywords/nepal/business',
      title: 'Nepal Commercial & Local Business Keyword Ideas | NepalAI',
      description:
        'Commercial tri-script keyword clusters for Nepali businesses — healthcare, trekking, fintech, local services, and diaspora e-commerce.',
      ogType: 'website',
      ogTitle: 'Commercial & Local-Service Keyword Intelligence for Nepali Businesses',
      ogDescription:
        'High-intent English, Romanized Nepali, and Devanagari keywords built for Nepali SMEs and agencies.',
      keywords:
        'Nepal business SEO keywords, Kathmandu local service keywords, Nepali digital marketing keywords',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Nepal Business Keywords',
        url: `${cleanOrigin}/keywords/nepal/business`,
        description:
          'Commercial keyword opportunities in English, Romanized Nepali, and Devanagari for Nepal businesses.',
      },
    };
  }

  if (route.view === 'category' && route.category) {
    const cat = TREND_CATEGORIES.find((c) => c.slug === route.category);
    const label = cat?.labelEn || 'Nepal Trends';
    return {
      canonicalPath: `/trending/nepal/${route.category}`,
      title: `${label} – Trending in Nepal Now | NepalAI`,
      description:
        cat?.descriptionEn ||
        `Live ${label} search trends in Nepal with AI-verified source context and traffic bands.`,
      ogType: 'website',
      ogTitle: `${label} Trending Searches in Nepal | NepalAI.tech`,
      ogDescription:
        cat?.descriptionEn || `Explore live ${label} searches across Nepal.`,
      keywords: `Trending ${label} Nepal, Nepal ${label} news, Google Trends Nepal ${label}`,
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: `${label} Trending in Nepal`,
        url: `${cleanOrigin}/trending/nepal/${route.category}`,
        description: cat?.descriptionEn,
      },
    };
  }

  return {
    canonicalPath: '/trending/nepal',
    title: 'Trending in Nepal Now – Live Search Pulse & AI Explainers | NepalAI',
    description:
      'Live top searches in Nepal refreshed every 20 minutes with Nepal category classification, approximate traffic bands, and source-cited AI explanations.',
    ogType: 'website',
    ogTitle: 'Trending in Nepal Now – Live AI Search Intelligence | NepalAI.tech',
    ogDescription:
      'Discover what Nepal is searching right now, why each topic is surging with news citations, and bilingual keyword variants.',
    keywords:
      'Trending in Nepal today, Google Trends Nepal live, Nepal search trends, Nepal AI trends, why is trending Nepal',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Trending Now Nepal',
      url: `${cleanOrigin}/trending/nepal`,
      description:
        'Live top searches in Nepal enriched with category tags and source-linked AI explainers.',
      publisher: {
        '@type': 'Organization',
        name: 'NepalAI Technologies',
        url: cleanOrigin,
      },
    },
  };
}

export function buildTrendDetailSeo(
  trend: {
    slug: string;
    keyword: string;
    category: string;
    trafficBand: string;
    aiWhyTrending?: string | null;
    firstSeenAt?: string | Date | null;
    lastSeenAt?: string | Date | null;
    citations?: Array<{ title: string; url: string; source: string }>;
  },
  originUrl: string
): TrendsSeoMeta {
  const cleanOrigin = originUrl.replace(/\/+$/, '');
  const catLabel =
    TREND_CATEGORIES.find((c) => c.slug === trend.category)?.labelEn || 'Nepal Trends';
  const canonicalPath = `/trending/nepal/${trend.slug}`;
  const fullUrl = `${cleanOrigin}${canonicalPath}`;
  const summary =
    trend.aiWhyTrending ||
    `${trend.keyword} is trending in Nepal (${trend.trafficBand} approximate searches) in ${catLabel}.`;

  const publishedIso = trend.firstSeenAt
    ? new Date(trend.firstSeenAt).toISOString()
    : new Date().toISOString();
  const modifiedIso = trend.lastSeenAt
    ? new Date(trend.lastSeenAt).toISOString()
    : publishedIso;

  return {
    canonicalPath,
    title: `${trend.keyword} – Why It Is Trending in Nepal | NepalAI`,
    description: summary.slice(0, 158),
    ogType: 'article',
    ogTitle: `Why "${trend.keyword}" Is Trending in Nepal (${trend.trafficBand})`,
    ogDescription: summary.slice(0, 158),
    keywords: `${trend.keyword}, ${trend.keyword} Nepal, ${catLabel} Nepal trends`,
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'NewsArticle',
          headline: `Why "${trend.keyword}" is trending in Nepal`,
          description: summary,
          mainEntityOfPage: fullUrl,
          datePublished: publishedIso,
          dateModified: modifiedIso,
          author: {
            '@type': 'Organization',
            name: 'NepalAI Editorial Intelligence',
            url: cleanOrigin,
          },
          publisher: {
            '@type': 'Organization',
            name: 'NepalAI.tech',
            url: cleanOrigin,
          },
          articleSection: catLabel,
          citation: (trend.citations || []).map((c) => c.url),
        },
        {
          '@type': 'FAQPage',
          mainEntity: [
            {
              '@type': 'Question',
              name: `Why is ${trend.keyword} trending in Nepal right now?`,
              acceptedAnswer: {
                '@type': 'Answer',
                text: summary,
              },
            },
          ],
        },
      ],
    },
  };
}

export function applyClientTrendsSeo(meta: TrendsSeoMeta): void {
  if (typeof document === 'undefined' || typeof window === 'undefined') return;
  const origin = window.location.origin;
  const fullUrl = `${origin}${meta.canonicalPath}`;

  document.title = meta.title;

  let canonical = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    document.head.appendChild(canonical);
  }
  canonical.setAttribute('href', fullUrl);

  const upsert = (attr: 'name' | 'property', key: string, value: string) => {
    let el = document.head.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attr, key);
      document.head.appendChild(el);
    }
    el.setAttribute('content', value);
  };

  upsert('name', 'description', meta.description);
  upsert('name', 'keywords', meta.keywords);
  upsert('property', 'og:type', meta.ogType);
  upsert('property', 'og:title', meta.ogTitle);
  upsert('property', 'og:description', meta.ogDescription);
  upsert('property', 'og:url', fullUrl);
  upsert('name', 'twitter:title', meta.ogTitle);
  upsert('name', 'twitter:description', meta.ogDescription);

  let script = document.getElementById('nepalai-tool-jsonld') as HTMLScriptElement | null;
  if (!script) {
    script = document.createElement('script');
    script.id = 'nepalai-tool-jsonld';
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(meta.jsonLd);
}
