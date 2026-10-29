import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  DEFAULT_STOREFRONT,
  STOREFRONT_KEYS,
  resolveTokens,
  type StorefrontCounts,
  type StorefrontStat,
} from '@/lib/storefront';

export const revalidate = 60;

// GET - Public storefront stats/badge with live numbers filled in
export async function GET() {
  try {
    const visible = { status: { in: ['ACTIVE', 'OUT_OF_STOCK'] as ('ACTIVE' | 'OUT_OF_STOCK')[] } };

    const [settings, productsInStock, products, units, categories, reviewAgg, projects, users, ordersDelivered] =
      await Promise.all([
        prisma.siteSettings.findMany({ where: { key: { in: Object.values(STOREFRONT_KEYS) } } }),
        prisma.product.count({ where: { ...visible, stock: { gt: 0 } } }),
        prisma.product.count({ where: visible }),
        prisma.product.aggregate({ where: { ...visible, stock: { gt: 0 } }, _sum: { stock: true } }),
        prisma.category.count(),
        prisma.review.aggregate({ where: { status: 'APPROVED' }, _avg: { rating: true }, _count: { _all: true } }),
        prisma.projectPost.count({ where: { status: 'PUBLISHED' } }),
        prisma.user.count(),
        prisma.order.count({ where: { status: { in: ['DELIVERED', 'COMPLETED'] } } }),
      ]);

    const counts: StorefrontCounts = {
      productsInStock,
      products,
      unitsInStock: units._sum.stock || 0,
      categories,
      avgRating: reviewAgg._avg.rating || 0,
      reviews: reviewAgg._count._all,
      projects,
      users,
      ordersDelivered,
    };

    const byKey = new Map(settings.map((s) => [s.key, s.value]));
    const rawStats = (byKey.get(STOREFRONT_KEYS.storeStats) as StorefrontStat[] | undefined) || DEFAULT_STOREFRONT.storeStats;
    const rawBadge = (byKey.get(STOREFRONT_KEYS.heroBadge) as string | undefined) ?? DEFAULT_STOREFRONT.heroBadge;

    const storeStats = rawStats
      .filter((s) => s && s.value?.trim())
      .map((s) => ({ value: resolveTokens(s.value, counts), label: resolveTokens(s.label || '', counts) }))
      .filter((s): s is { value: string; label: string } => s.value !== null && s.label !== null);

    return NextResponse.json({
      success: true,
      data: {
        storeStats,
        heroBadge: rawBadge.trim() ? resolveTokens(rawBadge, counts) : null,
        counts,
      },
    });
  } catch (error) {
    console.error('[STOREFRONT_GET]', error);
    return NextResponse.json({ success: false, error: 'Failed to load storefront stats' }, { status: 500 });
  }
}
