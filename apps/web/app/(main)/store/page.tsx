import { prisma } from '@/lib/prisma';
import { getPublicProducts } from '@/lib/catalog';
import { getStorefrontData } from '@/lib/storefront-server';
import { Prefetched } from '@/components/seo/prefetched';
import StorePage from './store-content';

// Load the catalog on the server so product names and prices are in the initial HTML
export default async function Page() {
  const [products, storefront, categories] = await Promise.all([
    getPublicProducts(500),
    getStorefrontData(),
    prisma.category.findMany({
      select: { id: true, name: true, slug: true, _count: { select: { products: true } } },
      orderBy: { name: 'asc' },
    }),
  ]);

  return (
    <Prefetched
      queries={[
        { key: ['products', 'store', 'catalog'], data: products },
        { key: ['storefront'], data: storefront },
        { key: ['categories', 'public'], data: categories },
      ]}
    >
      <StorePage />
    </Prefetched>
  );
}
