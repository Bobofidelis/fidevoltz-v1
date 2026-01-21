import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Metadata } from 'next';
import { PageRenderer } from '@/components/page-renderer';

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
  
  try {
    const page = await prisma.page.findUnique({
      where: { slug },
    });

    if (!page || !page.isPublished) {
      console.log(`[DynamicPage] Page not found or not published for slug: ${slug}`);
      notFound();
    }

    // Cast Json content to Block array and ensure it's an array
    const blocks = Array.isArray(page.content) ? (page.content as any[]) : [];
    console.log(`[DynamicPage] Found ${blocks.length} blocks for slug: ${slug}`);

    return (
      <main className="min-h-screen">
        <PageRenderer content={blocks} />
      </main>
    );
  } catch (error: any) {
    console.error(`[DynamicPage] Render error for slug ${slug}:`, error);
    return (
      <div className="p-10 text-red-500">
        <h1>Error Rendering Page</h1>
        <pre className="mt-4 bg-slate-100 p-4 rounded">{error.message}</pre>
        <pre className="mt-4 bg-slate-100 p-4 rounded text-xs">{error.stack}</pre>
      </div>
    );
  }
}
