import { notFound } from 'next/navigation';
import { buildPageMetadata } from '@/lib/seo';
import { prisma } from '@/lib/prisma';
import { Metadata } from 'next';
import { PageRenderer } from '@/components/page-renderer';
import { PublicSidebarRenderer } from "@/components/projects/PublicSidebarRenderer";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const page = await prisma.page.findUnique({ where: { slug } });
    if (!page) return { title: 'Page Not Found', robots: { index: false } };
    return buildPageMetadata({
      title: page.seoTitle || page.title,
      description: page.seoDesc || `${page.title} - FideVoltz`,
      path: `/${page.slug}`,
      noIndex: !page.isPublished,
    });
  } catch {
    return { title: 'Error' };
  }
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

  // Determine sticky/floating behaviour from the sidebar_settings config block
  const settingsBlock = sidebarBlocks.find((b: any) => b.type === 'sidebar_settings');
  const sidebarSide: "left" | "right" = settingsBlock?.content?.side || "right";
  const scrollMode: "sticky" | "scroll" = settingsBlock?.content?.scrollMode === "scroll" ? "scroll" : "sticky";
  const sidebarWidth: "narrow" | "normal" | "wide" = settingsBlock?.content?.width || "normal";
  
  // Use explicit tailwind class names for compiler safety
  let asideCols = "lg:col-span-4 xl:col-span-3";
  let mainCols = "lg:col-span-8 xl:col-span-9";
  
  if (sidebarWidth === 'narrow') {
    asideCols = "lg:col-span-3 xl:col-span-2";
    mainCols = "lg:col-span-9 xl:col-span-10";
  } else if (sidebarWidth === 'wide') {
    asideCols = "lg:col-span-5 xl:col-span-4";
    mainCols = "lg:col-span-7 xl:col-span-8";
  }

  const asideClass = scrollMode === "sticky"
    ? `${asideCols} space-y-4 min-w-0 lg:sticky lg:top-20 lg:self-start`
    : `${asideCols} space-y-4 min-w-0`;
    
  const mainClass = `${mainCols} bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden min-w-0`;

  if (sidebarBlocks.length > 0) {
    const heroBlock = blocks.find((b: any) => b.type === 'hero');
    const bodyBlocks = blocks.filter((b: any) => b.type !== 'hero');

    const sidebarElement = (
      <aside className={asideClass}>
        {/* slug passed as-is so AdWidget targets 'about', 'contact' etc. matching PlacementManager values */}
        <PublicSidebarRenderer blocks={sidebarBlocks} slug={page.slug} />
      </aside>
    );
    const mainElement = (
      <div className={mainClass}>
        <PageRenderer content={bodyBlocks} />
      </div>
    );

    return (
      <div className="min-h-screen bg-slate-50">
        {heroBlock && <PageRenderer content={[heroBlock]} />}
        <div className="py-6">
          <div className="max-w-[1240px] mx-auto px-4 md:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-5 items-start">
              {sidebarSide === 'left' ? (
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
      <div className="container max-w-5xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <PageRenderer content={blocks} />
        </div>
      </div>
    </div>
  );
}
