import { notFound } from 'next/navigation';
import { buildPageMetadata, descriptionFromPageContent } from '@/lib/seo';
import { prisma } from '@/lib/prisma';
import { Metadata } from 'next';
import { PageRenderer } from '@/components/page-renderer';
import { PublicSidebarRenderer } from "@/components/projects/PublicSidebarRenderer";
import { getSidebarLayout } from "@/lib/sidebar-layout";
import { JsonLd } from '@/components/seo/json-ld';

/** Questions and answers from the page's FAQ blocks, marked up so search engines and AI assistants can quote them */
function faqJsonLd(blocks: any[]) {
  const questions = blocks
    .filter((b) => b?.type === 'faq')
    .flatMap((b) => (b.categories || []).flatMap((c: any) => c.questions || []))
    .filter((q: any) => q?.q?.trim() && q?.a?.trim());
  if (!questions.length) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions.map((q: any) => ({
      '@type': 'Question',
      name: q.q.trim(),
      acceptedAnswer: { '@type': 'Answer', text: q.a.trim() },
    })),
  };
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Cached at the edge; refreshed within the hour, or straight away when the page is saved
export const revalidate = 3600;

// No pages are built ahead of time: each one is rendered on its first visit, then served from cache
// (refreshed hourly, or instantly when it is edited in the dashboard)
export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const page = await prisma.page.findUnique({ where: { slug } });
    if (!page) return { title: 'Page Not Found', robots: { index: false } };
    return buildPageMetadata({
      title: page.seoTitle || page.title,
      description: page.seoDesc || descriptionFromPageContent(page.content) || `${page.title} - FideVoltz`,
      path: `/${page.slug}`,
      noIndex: !page.isPublished,
    });
  } catch {
    return { title: 'Error' };
  }
}

// A page already has its <h1> when it has a hero block, a level-1 heading in its rich text
// (stored as { type: "heading", attrs: { level: 1 } }), or raw <h1> HTML
function pageHasTitle(node: unknown): boolean {
  if (typeof node === 'string') return /<h1[\s>]/i.test(node);
  if (Array.isArray(node)) return node.some(pageHasTitle);
  if (node && typeof node === 'object') {
    const n = node as { type?: string; attrs?: { level?: number } };
    if (n.type === 'hero' || (n.type === 'heading' && n.attrs?.level === 1)) return true;
    return Object.values(node).some(pageHasTitle);
  }
  return false;
}

export default async function DynamicPage({ params }: PageProps) {
  const { slug } = await params;

  let page;
  try {
    page = await prisma.page.findUnique({ where: { slug } });
  } catch (error: any) {
    console.error('Failed to render page:', error);
    notFound();
  }

  if (!page || !page.isPublished) notFound();

  const blocks = Array.isArray(page.content) ? (page.content as any[]) : [];
  const sidebarBlocks = Array.isArray(page.sidebar) ? (page.sidebar as any[]) : [];

  // Position, width and scroll behaviour come from the sidebar_settings block (Dashboard → Pages → Edit sidebar)
  const layout = getSidebarLayout(sidebarBlocks);

  // A page needs exactly one <h1>: its hero, a heading written in the content, or else the page title
  const faqData = faqJsonLd(blocks);
  const structuredData = faqData ? <JsonLd data={faqData} /> : null;
  const hasTitle = pageHasTitle(blocks);
  const titleHeader = hasTitle ? null : (
    <header className="bg-slate-900 text-white">
      {/* Lines up with the content box below: full width beside a sidebar, centred otherwise */}
      <div className={sidebarBlocks.length > 0 ? 'container px-4 md:px-6 lg:px-8 py-6 md:py-8' : 'container max-w-5xl mx-auto px-4 py-6 md:py-8'}>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{page.title}</h1>
      </div>
    </header>
  );

  if (sidebarBlocks.length > 0) {
    const heroBlock = blocks.find((b: any) => b.type === 'hero');
    const bodyBlocks = blocks.filter((b: any) => b.type !== 'hero');

    const sidebarElement = (
      <aside className={layout.asideClass}>
        {/* slug passed as-is so AdWidget targets 'about', 'contact' etc. matching PlacementManager values */}
        <PublicSidebarRenderer blocks={sidebarBlocks} slug={page.slug} />
      </aside>
    );
    const mainElement = (
      <div className="min-w-0 bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <PageRenderer content={bodyBlocks} fluid pageTitle={page.title} />
      </div>
    );

    return (
      <div className="min-h-screen bg-slate-50">
        {structuredData}
        {titleHeader}
        {heroBlock && <PageRenderer content={[heroBlock]} />}
        <div className="py-6">
          <div className="container px-4 md:px-6 lg:px-8">
            <div className={layout.gridClass} style={layout.style}>
              {layout.side === 'left' ? (
                <>
                  {sidebarElement}
                  {mainElement}
                </>
              ) : (
                <>
                  {mainElement}
                  {sidebarElement}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {structuredData}
      {titleHeader}
      <div className="container max-w-5xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <PageRenderer content={blocks} pageTitle={page.title} />
        </div>
      </div>
    </div>
  );
}
