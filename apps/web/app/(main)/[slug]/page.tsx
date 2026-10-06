import { notFound } from 'next/navigation';
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
    if (!page) return { title: 'Page Not Found' };
    return {
      title: page.seoTitle || page.title,
      description: page.seoDesc || `${page.title} - FideVoltz`,
    };
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
    return (
      <div className="p-10 text-red-500">
        <h1>Error Rendering Page</h1>
        <pre className="mt-4 bg-slate-100 p-4 rounded">{error.message}</pre>
      </div>
    );
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
        <PublicSidebarRenderer blocks={sidebarBlocks} slug={page.slug} />
      </aside>
    );
    const mainElement = (
      <div className={mainClass}>
        <PageRenderer content={bodyBlocks} />
      </div>
    );

    return (
      <main className="min-h-screen bg-slate-50">
        {heroBlock && <PageRenderer content={[heroBlock]} />}
        <div className="py-10">
          <div className="max-w-[1600px] mx-auto px-4 md:px-8 lg:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
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
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <PageRenderer content={blocks} />
    </main>
  );
}
