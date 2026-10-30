import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard', '/api/', '/auth/', '/cart', '/checkout', '/orders', '/profile', '/track-order', '/maintenance'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
