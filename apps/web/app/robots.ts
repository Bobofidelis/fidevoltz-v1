import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

const PRIVATE_PATHS = ['/dashboard', '/api/', '/auth/', '/cart', '/checkout', '/orders', '/profile', '/track-order', '/maintenance'];

const AI_AND_SEARCH_BOTS = [
  'Googlebot', 'Bingbot', 'Applebot', 'DuckDuckBot', 'YandexBot',
  'GPTBot', 'OAI-SearchBot', 'ChatGPT-User',
  'ClaudeBot', 'Claude-SearchBot', 'Claude-User',
  'PerplexityBot', 'Perplexity-User',
  'Google-Extended', 'Applebot-Extended', 'Amazonbot', 'meta-externalagent', 'CCBot',
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: PRIVATE_PATHS },
      // Search and AI assistants are explicitly welcome, so they can find and recommend the site
      { userAgent: AI_AND_SEARCH_BOTS, allow: '/', disallow: PRIVATE_PATHS },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
