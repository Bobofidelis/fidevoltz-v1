import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight, PackageSearch } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { PUBLIC_PRODUCT_STATUSES } from '@/lib/catalog';
import { withReviewStats } from '@/lib/review-stats';
import { breadcrumbJsonLd, buildPageMetadata, getSiteIdentity, toMetaDescription } from '@/lib/seo';
import { absoluteUrl } from '@/lib/site';
import { categoryPath, slugify } from '@/lib/slug';
import { optimizedImage } from '@/lib/image-url';
import { formatCurrency } from '@/lib/utils';
import { JsonLd } from '@/components/seo/json-ld';

// A real, indexable page per store category ("Microcontrollers in Nigeria"), so the store can rank for
// category searches instead of only the generic /store page. Cached and refreshed when products change.
export const revalidate = 3600;

// No pages are built ahead of time: each one is rendered on its first visit, then served from cache
// (refreshed hourly, or instantly when it is edited in the dashboard)
export function generateStaticParams() {
  return [];
}

const titleCase = (s: string) => s.replace(/\b\w/g, (c) => c.toUpperCase());

async function getCategory(slug: string) {
  const categories = await prisma.category.findMany({ select: { id: true, name: true, slug: true, description: true } });
  const category = categories.find((c) => c.slug === slug || slugify(c.name) === slug);
  if (!category) return null;

  const products = await withReviewStats(
    await prisma.product.findMany({
      where: { categoryId: category.id, status: { in: PUBLIC_PRODUCT_STATUSES } },
      orderBy: [{ stock: 'desc' }, { createdAt: 'desc' }],
      select: { id: true, name: true, description: true, price: true, stock: true, image: true, images: true },
    })
  );

  const others = await prisma.category.findMany({
    where: { id: { not: category.id }, products: { some: { status: { in: PUBLIC_PRODUCT_STATUSES } } } },
    select: { name: true, slug: true },
    orderBy: { name: 'asc' },
  });

  const name = titleCase(category.name);
  const intro =
    category.description?.trim() ||
    (products.length
      ? `Shop ${name.toLowerCase()} in Nigeria: ${products.length} ${products.length === 1 ? 'product' : 'products'} including ${products
          .slice(0, 3)
          .map((p) => p.name)
          .join(', ')}. Every part is tested before dispatch and delivered nationwide.`
      : `${name} for electronics projects, coming soon to the FideVoltz store.`);

  return { category, name, intro, products, others };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const data = await getCategory(slug);
  if (!data) return { title: 'Category Not Found', robots: { index: false } };

  return buildPageMetadata({
    title: `${data.name} in Nigeria`,
    description: toMetaDescription(data.intro),
    path: categoryPath(data.category),
    image: data.products[0]?.image,
    // An empty category is a thin page: keep it out of search results until it has products
    noIndex: data.products.length === 0,
  });
}

export default async function StoreCategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getCategory(slug);
  if (!data) notFound();

  const { category, name, intro, products, others } = data;
  const identity = await getSiteIdentity();
  const url = absoluteUrl(categoryPath(category));

  return (
    <div className="min-h-screen bg-slate-50">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Store', path: '/store' },
          { name },
        ])}
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: `${name} in Nigeria`,
          description: toMetaDescription(intro, 300),
          url,
          mainEntity: {
            '@type': 'ItemList',
            numberOfItems: products.length,
            itemListElement: products.map((p, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              url: absoluteUrl(`/store/product/${p.id}`),
              name: p.name,
            })),
          },
          provider: { '@type': 'Organization', name: identity.name },
        }}
      />

      <section className="bg-slate-900 text-white">
        <div className="container px-4 md:px-6 lg:px-8 py-8 md:py-10">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-slate-300 mb-3">
            <Link href="/" className="hover:text-white">Home</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href="/store" className="hover:text-white">Store</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-white">{name}</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{name}</h1>
          <p className="mt-3 max-w-3xl text-lg text-slate-200 leading-relaxed">{intro}</p>
        </div>
      </section>

      <div className="container px-4 md:px-6 lg:px-8 py-8 space-y-8">
        {products.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <PackageSearch className="mx-auto h-10 w-10 text-slate-400" />
            <p className="mt-3 text-lg font-semibold text-slate-900">No {name.toLowerCase()} in stock right now</p>
            <p className="mt-1 text-slate-700">Browse the full store or ask us to source a part for you.</p>
            <div className="mt-4 flex justify-center gap-3">
              <Link href="/store" className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700">Browse the store</Link>
              <Link href="/contact" className="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-900 hover:bg-slate-50">Request a part</Link>
            </div>
          </div>
        ) : (
          <section aria-labelledby="products-heading">
            <h2 id="products-heading" className="sr-only">{name} products</h2>
            <ul className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
              {products.map((p) => {
                const image = p.images?.[0] || p.image;
                return (
                  <li key={p.id}>
                    <Link
                      href={`/store/product/${p.id}`}
                      className="group flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition-all hover:border-blue-300 hover:shadow-md"
                    >
                      <div className="aspect-square bg-white p-4">
                        {image ? (
                          <img
                            src={optimizedImage(image, 400)}
                            alt={p.name}
                            loading="lazy"
                            decoding="async"
                            className="h-full w-full object-contain transition-transform group-hover:scale-105"
                          />
                        ) : null}
                      </div>
                      <div className="flex flex-1 flex-col border-t border-slate-100 p-4">
                        <h3 className="font-semibold leading-snug text-slate-900 group-hover:text-blue-700 line-clamp-2">{p.name}</h3>
                        <p className="mt-1 text-sm text-slate-700 line-clamp-2">{toMetaDescription(p.description, 110)}</p>
                        <div className="mt-auto flex items-center justify-between pt-3">
                          <span className="text-lg font-bold text-slate-900">{formatCurrency(Number(p.price))}</span>
                          <span className={`text-xs font-semibold ${p.stock > 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                            {p.stock > 0 ? 'In stock' : 'Out of stock'}
                          </span>
                        </div>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {others.length > 0 && (
          <section aria-labelledby="more-heading" className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 id="more-heading" className="text-lg font-bold text-slate-900">More categories</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {others.map((c) => (
                <Link
                  key={c.name}
                  href={categoryPath(c)}
                  className="rounded-full border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-800 hover:border-blue-300 hover:text-blue-700"
                >
                  {titleCase(c.name)}
                </Link>
              ))}
              <Link href="/store" className="rounded-full bg-slate-900 px-3 py-1.5 text-sm font-semibold text-white hover:bg-slate-800">
                All products
              </Link>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
