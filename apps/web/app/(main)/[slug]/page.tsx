import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Metadata } from 'next';
import { PageRenderer } from '@/components/page-renderer';
import { BlockRenderer } from "@/components/projects/block-renderer";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  console.log(`[DynamicPage] Generating metadata for slug: ${slug}`);
  
  try {
    const page = await prisma.page.findUnique({
      where: { slug },
    });

    if (!page) {
      console.log(`[DynamicPage] Page not found for slug: ${slug}`);
      return {
        title: 'Page Not Found',
      };
    }

    return {
      title: page.seoTitle || page.title,
      description: page.seoDesc || `${page.title} - FideVoltz`,
    };
  } catch (error) {
    console.error(`[DynamicPage] Metadata error for slug ${slug}:`, error);
    return {
      title: 'Error',
    };
  }
}

export default async function DynamicPage({ params }: PageProps) {
  const { slug } = await params;
  console.log(`[DynamicPage] Rendering page for slug: ${slug}`);
  
  let page;
  try {
    page = await prisma.page.findUnique({
      where: { slug },
    });
  } catch (error: any) {
    console.error(`[DynamicPage] Render error for slug ${slug}:`, error);
    return (
      <div className="p-10 text-red-500">
        <h1>Error Rendering Page</h1>
        <pre className="mt-4 bg-slate-100 p-4 rounded">{error.message}</pre>
      </div>
    );
  }

  if (!page || !page.isPublished) {
    console.log(`[DynamicPage] Page not found or not published for slug: ${slug}`);
    notFound();
  }

  // Cast Json content to Block array and ensure it's an array
  const blocks = Array.isArray(page.content) ? (page.content as any[]) : [];
  const sidebarBlocks = Array.isArray(page.sidebar) ? (page.sidebar as any[]) : [];
  console.log(`[DynamicPage] Found ${blocks.length} blocks for slug: ${slug}`);

  if (sidebarBlocks.length > 0) {
    return (
      <main className="min-h-screen bg-slate-50 py-12">
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            <div className="lg:col-span-8 xl:col-span-9 space-y-8 bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
              <PageRenderer content={blocks} />
            </div>
            <div className="lg:col-span-4 xl:col-span-3 space-y-6">
              <BlockRenderer blocks={sidebarBlocks} slug={page.slug} />
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
