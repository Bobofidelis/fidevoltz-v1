import type { Metadata } from 'next';
import { FREE_SHIPPING_THRESHOLD, SHIPPING_COST } from '@/store/cart-store';
import { categoryPath } from '@/lib/slug';
import { notFound } from 'next/navigation';
import { draftMode } from 'next/headers';
import { getProductWithStats, PUBLIC_PRODUCT_STATUSES } from '@/lib/catalog';
import { breadcrumbJsonLd, buildPageMetadata, getSiteIdentity, toMetaDescription } from '@/lib/seo';
import { absoluteUrl } from '@/lib/site';
import { JsonLd } from '@/components/seo/json-ld';
import { Prefetched } from '@/components/seo/prefetched';
import { optimizedImage } from '@/lib/image-url';

interface Props {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
}

const isPublic = (status: string) => (PUBLIC_PRODUCT_STATUSES as string[]).includes(status);

// Cached at the edge; refreshed within the hour, or straight away when the product is saved
export const revalidate = 3600;

// No pages are built ahead of time: each one is rendered on its first visit, then served from cache
// (refreshed hourly, or instantly when it is edited in the dashboard)
export function generateStaticParams() {
  return [];
}

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

  // Drafts and archived products are only viewable by staff, through /api/preview (Next.js draft mode)
  if (!isPublic(product.status) && !(await draftMode()).isEnabled) notFound();

  const identity = await getSiteIdentity();
  // Same order the product page uses: the gallery first, then the main image
  const firstImage = (product.images?.length ? product.images[0] : product.image) || null;
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
      // Same delivery rule checkout charges (flat fee, free above the threshold)
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'NG' },
        shippingRate: {
          '@type': 'MonetaryAmount',
          value: Number(product.price) >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST,
          currency: 'NGN',
        },
      },
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
          ...(product.category ? [{ name: product.category.name, path: categoryPath(product.category) }] : []),
          { name: product.name },
        ])}
      />
      {/* Start downloading the main photo straight away (same URL and size the page shows first) */}
      {firstImage && <link rel="preload" as="image" href={optimizedImage(firstImage, 1000)} fetchPriority="high" />}
      <Prefetched queries={[{ key: ['product', id], data: product }]}>{children}</Prefetched>
    </>
  );
}
