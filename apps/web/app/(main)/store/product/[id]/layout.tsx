import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getProductWithStats, PUBLIC_PRODUCT_STATUSES } from '@/lib/catalog';
import { breadcrumbJsonLd, buildPageMetadata, getSiteIdentity, toMetaDescription } from '@/lib/seo';
import { absoluteUrl } from '@/lib/site';
import { JsonLd } from '@/components/seo/json-ld';
import { Prefetched } from '@/components/seo/prefetched';

interface Props {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
}

const isPublic = (status: string) => (PUBLIC_PRODUCT_STATUSES as string[]).includes(status);

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductWithStats(id);
  if (!product) return { title: 'Product Not Found', robots: { index: false } };

  return buildPageMetadata({
    title: product.name,
    description:
      toMetaDescription(product.description) ||
      `Buy ${product.name} in Nigeria from ${(await getSiteIdentity()).name}.`,
    path: `/store/product/${product.id}`,
    image: product.image || product.images?.[0],
    noIndex: !isPublic(product.status),
  });
}

export default async function ProductLayout({ params, children }: Props) {
  const { id } = await params;
  const product = await getProductWithStats(id);
  if (!product) notFound();

  // Drafts and archived products are only viewable by staff
  if (!isPublic(product.status)) {
    const session = await auth();
    const role = session?.user?.role;
    if (role !== 'ADMIN' && role !== 'EDITOR') notFound();
  }

  const identity = await getSiteIdentity();
  const url = absoluteUrl(`/store/product/${product.id}`);
  const images = [product.image, ...(product.images || [])].filter(Boolean).map((i) => absoluteUrl(i as string));
  const specs = (product.specifications || {}) as Record<string, unknown>;
  const brandKey = Object.keys(specs).find((k) => k.trim().toLowerCase() === 'brand');

  const productLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: toMetaDescription(product.description, 500),
    url,
    ...(images.length ? { image: [...new Set(images)] } : {}),
    ...(product.sku ? { sku: product.sku } : {}),
    ...(brandKey ? { brand: { '@type': 'Brand', name: String(specs[brandKey]) } } : {}),
    ...(product.category?.name ? { category: product.category.name } : {}),
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency: product.currency || 'NGN',
      price: Number(product.price),
      itemCondition: 'https://schema.org/NewCondition',
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: { '@type': 'Organization', name: identity.name },
    },
    // Only real, approved reviews: Google penalises invented ratings
    ...(product.reviewCount > 0
      ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: product.rating, reviewCount: product.reviewCount } }
      : {}),
  };

  return (
    <>
      <JsonLd data={productLd} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Store', path: '/store' },
          { name: product.name },
        ])}
      />
      <Prefetched queries={[{ key: ['product', id], data: product }]}>{children}</Prefetched>
    </>
  );
}
