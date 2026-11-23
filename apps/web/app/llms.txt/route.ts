import { prisma } from '@/lib/prisma';
import { getSiteIdentity, toMetaDescription } from '@/lib/seo';
import { PUBLIC_PRODUCT_STATUSES } from '@/lib/catalog';
import { absoluteUrl, SITE_URL } from '@/lib/site';
import { formatCurrency } from '@/lib/utils';

// /llms.txt: a plain-text map of the site for AI assistants and agents (https://llmstxt.org).
// Built from live data, so new tutorials and products appear automatically.
export const revalidate = 3600;

export async function GET() {
  const identity = await getSiteIdentity();

  const [tutorials, products, pages] = await Promise.all([
    prisma.projectPost.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { publishedAt: 'desc' },
      select: { title: true, slug: true, excerpt: true, category: true, difficulty: true },
    }),
    prisma.product.findMany({
      where: { status: { in: PUBLIC_PRODUCT_STATUSES } },
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, description: true, price: true, stock: true, category: { select: { name: true } } },
    }),
    prisma.page.findMany({ where: { isPublished: true }, select: { title: true, slug: true, seoDesc: true } }),
  ]);

  const lines: string[] = [
    `# ${identity.name}`,
    '',
    `> ${identity.tagline} Electronics tutorials (Arduino, ESP32, Raspberry Pi, IoT, robotics) and an online store for electronic components, based in ${identity.contact.city || 'Nigeria'}, Nigeria, delivering nationwide.`,
    '',
    `Website: ${SITE_URL}`,
    ...(identity.contact.email ? [`Contact: ${identity.contact.email}`] : []),
    ...(identity.contact.phone ? [`Phone / WhatsApp: ${identity.contact.phone}`] : []),
    '',
    '## Main sections',
    `- [Electronics tutorials](${absoluteUrl('/projects')}): step-by-step builds with wiring, code and bills of materials`,
    `- [Electronics store](${absoluteUrl('/store')}): microcontrollers, sensors, modules and tools, priced in Naira (NGN)`,
    `- [Custom builds](${absoluteUrl('/contact?type=service')}): request an engineer to build a project for you`,
    '',
    '## Tutorials',
    ...tutorials.map(
      (t) =>
        `- [${t.title}](${absoluteUrl(`/projects/${t.slug}`)}): ${[t.category, t.difficulty].filter(Boolean).join(', ')}. ${toMetaDescription(t.excerpt, 200)}`
    ),
    '',
    '## Products',
    ...products.map(
      (p) =>
        `- [${p.name}](${absoluteUrl(`/store/product/${p.id}`)}): ${formatCurrency(Number(p.price))}, ${p.stock > 0 ? 'in stock' : 'out of stock'}${p.category?.name ? `, ${p.category.name}` : ''}. ${toMetaDescription(p.description, 200)}`
    ),
    '',
    '## Information',
    ...pages.map((p) => `- [${p.title}](${absoluteUrl(`/${p.slug}`)})${p.seoDesc ? `: ${p.seoDesc}` : ''}`),
    '',
  ];

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
