import { prisma } from '@/lib/prisma';

// Adds real `rating` (average of approved reviews, 1 decimal) and `reviewCount` to products
export async function withReviewStats<T extends { id: string }>(products: T[]) {
  if (products.length === 0) return products.map((p) => ({ ...p, rating: 0, reviewCount: 0 }));

  const stats = await prisma.review.groupBy({
    by: ['productId'],
    where: { productId: { in: products.map((p) => p.id) }, status: 'APPROVED' },
    _avg: { rating: true },
    _count: { _all: true },
  });
  const byId = new Map(stats.map((s) => [s.productId, s]));

  return products.map((p) => {
    const s = byId.get(p.id);
    return {
      ...p,
      rating: s?._avg.rating ? Math.round(s._avg.rating * 10) / 10 : 0,
      reviewCount: s?._count._all ?? 0,
    };
  });
}
