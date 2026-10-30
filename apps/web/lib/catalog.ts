import { prisma } from '@/lib/prisma';
import { withReviewStats } from '@/lib/review-stats';

export const PUBLIC_PRODUCT_STATUSES = ['ACTIVE', 'OUT_OF_STOCK'] as ('ACTIVE' | 'OUT_OF_STOCK')[];

// Same JSON the browser would get from the API (Decimals and Dates become strings)
const toJson = <T,>(value: T): T => JSON.parse(JSON.stringify(value));

/** First page of the public catalog, shaped like GET /api/products */
export async function getPublicProducts(limit: number) {
  const where = { status: { in: PUBLIC_PRODUCT_STATUSES } };
  const [products, total] = await Promise.all([
    prisma.product.findMany({ where, include: { category: true }, take: limit, orderBy: { createdAt: 'desc' } }),
    prisma.product.count({ where }),
  ]);
  return toJson({
    data: await withReviewStats(products),
    pagination: { page: 1, limit, total, totalPages: Math.ceil(total / limit) },
  });
}

export async function getProductWithStats(id: string) {
  const product = await prisma.product.findUnique({ where: { id }, include: { category: true } });
  if (!product) return null;
  return toJson((await withReviewStats([product]))[0]);
}
