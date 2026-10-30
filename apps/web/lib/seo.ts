import { cache } from 'react';
import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { SITE_URL, absoluteUrl } from '@/lib/site';

const SOCIAL_PLATFORMS = ['facebook', 'twitter', 'instagram', 'linkedin', 'youtube', 'tiktok', 'reddit'];

// Site name, logo and social profiles come from Dashboard → Settings (Branding / Social Media)
export const getSiteIdentity = cache(async () => {
  let values: Record<string, unknown> = {};
  try {
    const settings = await prisma.siteSettings.findMany({
      where: { OR: [{ category: 'branding' }, { category: 'social' }, { key: 'seo.googleVerification' }] },
    });
    values = Object.fromEntries(settings.map((s) => [s.key, s.value]));
  } catch {
    // Metadata must never take a page down; fall back to defaults below
  }

  const str = (key: string) => (typeof values[key] === 'string' ? (values[key] as string).trim() : '');
  const sameAs = SOCIAL_PLATFORMS
    .filter((p) => values[`social.show.${p}`] !== false)
    .map((p) => str(`social.${p}`))
    .filter((url) => /^https?:\/\//i.test(url));

  const logo = str('branding.logo');
  return {
    name: str('branding.siteName') || 'FideVoltz',
    tagline: str('branding.tagline') || 'Electronics Tutorials & Store',
    logo: logo ? absoluteUrl(logo) : undefined,
    favicon: str('branding.favicon') || '/favicon.ico',
    sameAs,
    googleVerification: str('seo.googleVerification') || undefined,
  };
});

/** Strip HTML/markup and cut at a word boundary, for meta descriptions (about 160 characters) */
export function toMetaDescription(text: string | null | undefined, max = 160) {
  const clean = (text || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\$\$?[^$]*\$\$?/g, ' ')
    .replace(/&[a-z#0-9]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(' ');
  return `${lastSpace > 80 ? cut.slice(0, lastSpace) : cut}…`;
}

/** First readable text of a project's blocks, used when no excerpt/meta description was written */
export function descriptionFromBlocks(blocks: unknown) {
  if (!Array.isArray(blocks)) return '';
  for (const block of blocks as { type?: string; content?: unknown }[]) {
    if (block?.type !== 'text' && block?.type !== 'markdown') continue;
    if (typeof block.content !== 'string') continue;
    const text = toMetaDescription(block.content);
    if (text.length > 40) return text;
  }
  return '';
}

interface PageSeo {
  title: string;
  absoluteTitle?: boolean;
  description: string;
  path: string;
  image?: string | null;
  type?: 'website' | 'article';
  noIndex?: boolean;
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  keywords?: string[];
}

/** Complete per-page metadata. Next replaces (not merges) openGraph, so each page sets all of it. */
export async function buildPageMetadata(seo: PageSeo): Promise<Metadata> {
  const identity = await getSiteIdentity();
  const image = seo.image ? absoluteUrl(seo.image) : identity.logo;
  // Built here rather than via the layout template: a nested layout with its own title resets the template
  const fullTitle = seo.absoluteTitle
    ? seo.title
    : seo.title.toLowerCase().includes(identity.name.toLowerCase())
      ? seo.title
      : `${seo.title} | ${identity.name}`;
  const socialTitle = seo.title;

  return {
    title: { absolute: fullTitle },
    description: seo.description,
    ...(seo.keywords?.length ? { keywords: seo.keywords } : {}),
    alternates: { canonical: seo.path },
    ...(seo.noIndex ? { robots: { index: false, follow: false } } : {}),
    openGraph: {
      title: socialTitle,
      description: seo.description,
      url: seo.path,
      siteName: identity.name,
      locale: 'en_NG',
      type: seo.type || 'website',
      ...(image ? { images: [image] } : {}),
      ...(seo.type === 'article'
        ? { publishedTime: seo.publishedTime, modifiedTime: seo.modifiedTime, authors: seo.authors }
        : {}),
    },
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title: socialTitle,
      description: seo.description,
      ...(image ? { images: [image] } : {}),
    },
  };
}

export function breadcrumbJsonLd(items: { name: string; path?: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      ...(item.path ? { item: absoluteUrl(item.path) } : {}),
    })),
  };
}

export function organizationJsonLd(identity: Awaited<ReturnType<typeof getSiteIdentity>>) {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: identity.name,
      url: SITE_URL,
      description: identity.tagline,
      ...(identity.logo ? { logo: identity.logo } : {}),
      ...(identity.sameAs.length ? { sameAs: identity.sameAs } : {}),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      name: identity.name,
      url: SITE_URL,
      publisher: { '@id': `${SITE_URL}/#organization` },
    },
  ];
}
