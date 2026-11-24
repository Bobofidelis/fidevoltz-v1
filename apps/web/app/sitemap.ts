import type { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';
import { SITE_URL } from '@/lib/site';
import { categoryPath, topicPath } from '@/lib/slug';

// Rebuilt hourly so new tutorials, products and pages reach search engines automatically
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/projects`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/store`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/contact`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/help`, changeFrequency: 'monthly', priority: 0.4 },
  ];

  try {
    const [projects, products, pages, categories] = await Promise.all([
      prisma.projectPost.findMany({ where: { status: 'PUBLISHED' }, select: { slug: true, category: true, updatedAt: true } }),
      prisma.product.findMany({
        where: { status: { in: ['ACTIVE', 'OUT_OF_STOCK'] } },
        select: { id: true, updatedAt: true },
      }),
      prisma.page.findMany({ where: { isPublished: true }, select: { slug: true, updatedAt: true } }),
      // Only categories that actually have products on sale: empty ones would be thin pages
      prisma.category.findMany({
        where: { products: { some: { status: { in: ['ACTIVE', 'OUT_OF_STOCK'] } } } },
        select: { name: true, slug: true },
      }),
    ]);

    for (const c of categories) {
      entries.push({ url: `${SITE_URL}${categoryPath(c)}`, changeFrequency: 'weekly', priority: 0.8 });
    }
    const topicUpdated = new Map<string, Date>();
    for (const p of projects) {
      if (!p.category) continue;
      const prev = topicUpdated.get(p.category);
      if (!prev || p.updatedAt > prev) topicUpdated.set(p.category, p.updatedAt);
    }
    for (const [topic, updatedAt] of topicUpdated) {
      entries.push({ url: `${SITE_URL}${topicPath(topic)}`, lastModified: updatedAt, changeFrequency: 'weekly', priority: 0.8 });
    }

    for (const p of projects) {
      entries.push({ url: `${SITE_URL}/projects/${p.slug}`, lastModified: p.updatedAt, changeFrequency: 'weekly', priority: 0.8 });
    }
    for (const p of products) {
      entries.push({ url: `${SITE_URL}/store/product/${p.id}`, lastModified: p.updatedAt, changeFrequency: 'weekly', priority: 0.7 });
    }
    for (const p of pages) {
      entries.push({ url: `${SITE_URL}/${p.slug}`, lastModified: p.updatedAt, changeFrequency: 'monthly', priority: 0.5 });
    }
  } catch (error) {
    console.error('[SITEMAP] Failed to load dynamic entries', error);
  }

  const seen = new Set<string>();
  return entries.filter((entry) => !seen.has(entry.url) && !!seen.add(entry.url));
}
