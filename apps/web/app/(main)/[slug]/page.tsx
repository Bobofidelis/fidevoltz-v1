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
  const isSticky: boolean = settingsBlock ? Boolean((settingsBlock as any).content?.sticky) : true;

  if (sidebarBlocks.length > 0) {
    return (
      <main className="min-h-screen bg-slate-50 py-10">
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            {/* Main content */}
            <div className="lg:col-span-8 xl:col-span-9 bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden min-w-0">
              <PageRenderer content={blocks} />
            </div>
            {/* Sidebar — optionally sticky and scrollable */}
            <aside className={`lg:col-span-4 xl:col-span-3 space-y-4 min-w-0 ${isSticky ? 'lg:sticky lg:top-6 lg:self-start lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent' : ''}`}>
              <PublicSidebarRenderer blocks={sidebarBlocks} slug={page.slug} />
            </aside>
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
