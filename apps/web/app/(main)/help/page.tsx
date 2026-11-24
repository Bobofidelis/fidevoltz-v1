import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { breadcrumbJsonLd, buildPageMetadata } from '@/lib/seo';
import { JsonLd } from '@/components/seo/json-ld';
import { HelpCenter, type FaqSection } from '@/components/help/help-center';

// The questions come from the FAQ page (Dashboard → Pages → FAQ), so there is one place to edit them.
// Cached, and refreshed as soon as the FAQ page is saved.
export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: 'Help Center',
    description:
      'Get help with your FideVoltz order, delivery, returns or an electronics project. Search common questions or send us a message and we will reply.',
    path: '/help',
  });
}

async function getFaqs(): Promise<FaqSection[]> {
  const page = await prisma.page.findUnique({ where: { slug: 'faq' }, select: { content: true, isPublished: true } });
  if (!page?.isPublished || !Array.isArray(page.content)) return [];
  return (page.content as any[])
    .filter((b) => b?.type === 'faq')
    .flatMap((b) => b.categories || [])
    .map((c: any) => ({
      name: String(c.name || 'General'),
      questions: (c.questions || [])
        .filter((q: any) => q?.q?.trim() && q?.a?.trim())
        .map((q: any) => ({ q: String(q.q).trim(), a: String(q.a).trim() })),
    }))
    .filter((c) => c.questions.length > 0);
}

async function getWhatsappUrl() {
  const setting = await prisma.siteSettings.findUnique({ where: { key: 'social.whatsapp' }, select: { value: true } });
  const url = typeof setting?.value === 'string' ? setting.value.trim() : '';
  return url.startsWith('https://') ? url : null;
}

export default async function HelpPage() {
  const [faqs, whatsappUrl] = await Promise.all([getFaqs(), getWhatsappUrl()]);

  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'Help Center' }])} />
      <HelpCenter faqs={faqs} whatsappUrl={whatsappUrl} />
    </>
  );
}
