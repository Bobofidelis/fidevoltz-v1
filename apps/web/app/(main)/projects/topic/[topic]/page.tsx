import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight, Clock } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { breadcrumbJsonLd, buildPageMetadata, toMetaDescription } from '@/lib/seo';
import { absoluteUrl } from '@/lib/site';
import { slugify, topicPath } from '@/lib/slug';
import { optimizedImage } from '@/lib/image-url';
import { parseBlocks, readingMinutes } from '@/lib/reading-time';
import { JsonLd } from '@/components/seo/json-ld';

// A real, indexable page per tutorial topic ("IoT Tutorials & Projects"), so the blog can rank for
// topic searches. Cached and refreshed when tutorials are saved.
export const revalidate = 3600;

// No pages are built ahead of time: each one is rendered on its first visit, then served from cache
// (refreshed hourly, or instantly when it is edited in the dashboard)
export function generateStaticParams() {
  return [];
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1518770660439-4636190af475';

async function getTopic(slug: string) {
  const topics = await prisma.projectPost.groupBy({ by: ['category'], where: { status: 'PUBLISHED' }, _count: true });
  const match = topics.find((t) => slugify(t.category) === slug);
  if (!match) return null;

  const tutorials = await prisma.projectPost.findMany({
    where: { status: 'PUBLISHED', category: match.category },
    orderBy: { publishedAt: 'desc' },
    select: { id: true, title: true, slug: true, excerpt: true, featuredImage: true, difficulty: true, publishedAt: true, createdAt: true, content: true },
  });
  const others = topics.filter((t) => t.category !== match.category).sort((a, b) => b._count - a._count);
  const topic = match.category;
  const intro = `Step-by-step ${topic} tutorials and projects with wiring diagrams, working code and a full bill of materials for every build. ${tutorials.length} ${tutorials.length === 1 ? 'guide' : 'guides'}, from beginner to advanced.`;
  return { topic, intro, tutorials, others };
}

export async function generateMetadata({ params }: { params: Promise<{ topic: string }> }): Promise<Metadata> {
  const { topic } = await params;
  const data = await getTopic(topic);
  if (!data) return { title: 'Topic Not Found', robots: { index: false } };

  return buildPageMetadata({
    title: `${data.topic} Tutorials & Projects`,
    description: toMetaDescription(data.intro),
    path: topicPath(data.topic),
    image: data.tutorials.find((t) => t.featuredImage)?.featuredImage,
  });
}

export default async function TopicPage({ params }: { params: Promise<{ topic: string }> }) {
  const { topic: slug } = await params;
  const data = await getTopic(slug);
  if (!data) notFound();

  const { topic, intro, tutorials, others } = data;

  return (
    <div className="min-h-screen bg-slate-50">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Tutorials', path: '/projects' },
          { name: topic },
        ])}
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: `${topic} Tutorials & Projects`,
          description: intro,
          url: absoluteUrl(topicPath(topic)),
          mainEntity: {
            '@type': 'ItemList',
            numberOfItems: tutorials.length,
            itemListElement: tutorials.map((t, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              url: absoluteUrl(`/projects/${t.slug}`),
              name: t.title,
            })),
          },
        }}
      />

      <section className="bg-slate-900 text-white">
        <div className="container px-4 md:px-6 lg:px-8 py-8 md:py-10">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-slate-300 mb-3">
            <Link href="/" className="hover:text-white">Home</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href="/projects" className="hover:text-white">Tutorials</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-white">{topic}</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{topic} Tutorials &amp; Projects</h1>
          <p className="mt-3 max-w-3xl text-lg text-slate-200 leading-relaxed">{intro}</p>
        </div>
      </section>

      <div className="container px-4 md:px-6 lg:px-8 py-8 space-y-8">
        <section aria-labelledby="tutorials-heading">
          <h2 id="tutorials-heading" className="sr-only">{topic} tutorials</h2>
          <ul className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
            {tutorials.map((t) => (
              <li key={t.id}>
                <Link
                  href={`/projects/${t.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition-all hover:border-blue-300 hover:shadow-md"
                >
                  <div className="relative h-44 overflow-hidden bg-slate-100">
                    <img
                      src={optimizedImage(t.featuredImage || FALLBACK_IMAGE, 640)}
                      alt={t.title}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {t.difficulty && (
                      <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-semibold text-slate-900">
                        {t.difficulty}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <h3 className="text-lg font-bold leading-snug text-slate-900 group-hover:text-blue-700 line-clamp-2">{t.title}</h3>
                    <p className="mt-1.5 text-sm text-slate-700 line-clamp-2">{t.excerpt}</p>
                    <span className="mt-auto flex items-center gap-1.5 pt-3 text-xs font-medium text-slate-600">
                      <Clock className="h-3.5 w-3.5" />
                      {readingMinutes(parseBlocks(t.content))} min read
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {others.length > 0 && (
          <section aria-labelledby="topics-heading" className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 id="topics-heading" className="text-lg font-bold text-slate-900">More topics</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {others.map((o) => (
                <Link
                  key={o.category}
                  href={topicPath(o.category)}
                  className="rounded-full border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-800 hover:border-blue-300 hover:text-blue-700"
                >
                  {o.category} <span className="text-slate-500">({o._count})</span>
                </Link>
              ))}
              <Link href="/projects" className="rounded-full bg-slate-900 px-3 py-1.5 text-sm font-semibold text-white hover:bg-slate-800">
                All tutorials
              </Link>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
