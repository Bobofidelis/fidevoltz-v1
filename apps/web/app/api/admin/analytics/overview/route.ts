import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { ApiResponse } from '@fidevoltz/types';

// GET - Get comprehensive analytics overview
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');
    
    let dateFilter: any = {};
    if (startDateParam && startDateParam !== 'undefined') {
      dateFilter.gte = new Date(startDateParam);
    }
    if (endDateParam && endDateParam !== 'undefined') {
      dateFilter.lte = new Date(endDateParam);
    }
    
    // Default to last 7 days only if both are missing and it's not explicitly 'all'
    if (!startDateParam && !endDateParam) {
       dateFilter = { 
         gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
         lte: new Date()
       };
    }
    
    // Create the full where clause for date filtering
    const dateWhere = Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {};
    const dateWhereOrder = Object.keys(dateFilter).length > 0 ? { order: { createdAt: dateFilter } } : {};

    // Run all queries in parallel for better performance
    const [
      orders,
      uniqueVisitors,
      totalPageViews,
      newUsers,
      uniqueUsers,
      topProducts,
      recentActivities,
    ] = await Promise.all([
      // Orders
      prisma.order.findMany({
        where: {
          ...dateWhere,
          status: { in: ['COMPLETED', 'PROCESSING', 'SHIPPED'] },
        },
        select: { totalAmount: true, createdAt: true },
      }),
      // Unique visitors (with fallback)
      prisma.pageView.aggregate({
        _count: { sessionId: true },
        where: dateWhere,
      }).then(res => res._count.sessionId).catch(() => 0),
      // Total page views (with fallback)
      prisma.pageView.count({
        where: dateWhere,
      }).catch(() => 0),
      // New users
      prisma.user.count({
        where: dateWhere,
      }).catch(() => 0),
      // Unique users (active)
      prisma.user.count({
        where: { 
          ...dateWhere,
          lastLoginAt: { not: null }
        },
      }).catch(() => 0),
      // Top products
      prisma.orderItem.groupBy({
        by: ['productId'],
        _count: { productId: true },
        _sum: { quantity: true, price: true },
        orderBy: { _count: { productId: 'desc' } },
        take: 5,
        where: {
          order: {
            ...(dateWhere.createdAt ? { createdAt: dateWhere.createdAt } : {}),
            status: { in: ['COMPLETED', 'PROCESSING', 'SHIPPED'] },
          }
        }
      }).catch(() => []), 
      // Recent activities (from logs)
      prisma.activityLog.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true, email: true } } }
      }).catch(() => [])
    ]);

    // Calculate metrics
    const totalRevenue = orders.reduce((sum, order) => sum + Number(order.totalAmount), 0);
    const totalOrders = orders.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const conversionRate = uniqueVisitors > 0 ? (totalOrders / uniqueVisitors) * 100 : 0;

    // For raw queries, we use actual dates or bounds. If all time, we use a very early date
    const queryStartDate = dateFilter.gte || new Date(0);
    const queryEndDate = dateFilter.lte || new Date();

    // Get chart data in parallel (with fallbacks)
    const [revenueTrend, visitorTrend] = await Promise.all([
      prisma.$queryRaw`
        SELECT "createdAt"::date as date, SUM("totalAmount")::float as revenue
        FROM "Order"
        WHERE "createdAt" >= ${queryStartDate} AND "createdAt" <= ${queryEndDate}
          AND "status" IN ('COMPLETED', 'PROCESSING', 'SHIPPED')
        GROUP BY "createdAt"::date
        ORDER BY date ASC
      `.catch((e) => {
        console.error("Revenue trend error:", e);
        return [];
      }),
      prisma.$queryRaw`
        SELECT "createdAt"::date as date, COUNT(DISTINCT "sessionId")::int as visitors
        FROM "PageView"
        WHERE "createdAt" >= ${queryStartDate} AND "createdAt" <= ${queryEndDate}
        GROUP BY "createdAt"::date
        ORDER BY date ASC
      `.catch((e) => {
        console.error("Visitor trend error:", e);
        return [];
      }),
    ]);

    // Get product details for top products
    const topProductsWithDetails = await Promise.all(
      topProducts.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: { name: true, image: true, images: true },
        }).catch(() => null);
        return {
          id: item.productId,
          name: product?.name || 'Unknown',
          imageUrl: product?.images?.[0] || product?.image || null,
          quantity: (item as any)._sum?.quantity || 0,
          revenue: Number((item as any)._sum?.price || 0),
        };
      })
    );

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        overview: {
          totalRevenue,
          totalOrders,
          uniqueVisitors,
          totalPageViews,
          newUsers,
          uniqueUsers,
          avgOrderValue,
          conversionRate: Number(conversionRate.toFixed(2)),
        },
        charts: {
          revenue: revenueTrend,
          visitors: visitorTrend,
        },
        topProducts: topProductsWithDetails,
        recentActivities,
      },
    });
  } catch (error: any) {
    console.error('[ANALYTICS OVERVIEW API] Error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to fetch analytics overview' },
      { status: 500 }
    );
  }
}
