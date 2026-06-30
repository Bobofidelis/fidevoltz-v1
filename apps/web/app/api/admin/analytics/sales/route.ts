import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { ApiResponse } from '@fidevoltz/types';

// GET - Get comprehensive sales analytics
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
    
    // Default to last 30 days only if both are missing and it's not explicitly 'all'
    if (!startDateParam && !endDateParam) {
       dateFilter = { 
         gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
         lte: new Date()
       };
    }
    
    // Create the full where clause for date filtering
    const dateWhere = Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {};
    
    const queryStartDate = dateFilter.gte || new Date(0);
    const queryEndDate = dateFilter.lte || new Date();

    // Run queries in parallel
    const [
      totalSales,
      salesByCategory,
      salesByDay,
      topCustomers,
      recentOrders,
    ] = await Promise.all([
      // Total sales summary
      prisma.order.aggregate({
        where: {
          ...dateWhere,
          status: { in: ['COMPLETED', 'PROCESSING', 'SHIPPED'] },
        },
        _sum: { totalAmount: true },
        _count: true,
        _avg: { totalAmount: true },
      }).catch(() => ({ _sum: { totalAmount: 0 }, _count: 0, _avg: { totalAmount: 0 } })),

      // Sales by category
      prisma.$queryRaw`
        SELECT 
          p."category",
          COUNT(DISTINCT o.id)::int as order_count,
          SUM(oi."quantity")::int as items_sold,
          SUM(oi."price" * oi."quantity")::float as revenue
        FROM "Order" o
        JOIN "OrderItem" oi ON oi."orderId" = o.id
        JOIN "Product" p ON p.id = oi."productId"
        WHERE o."createdAt" >= ${queryStartDate} AND o."createdAt" <= ${queryEndDate}
          AND o."status" IN ('COMPLETED', 'PROCESSING', 'SHIPPED')
        GROUP BY p."category"
        ORDER BY revenue DESC
      `.catch(() => []),

      // Sales by day
      prisma.$queryRaw`
        SELECT 
          o."createdAt"::date as date,
          COUNT(o.id)::int as orders,
          SUM(o."totalAmount")::float as revenue
        FROM "Order" o
        WHERE o."createdAt" >= ${queryStartDate} AND o."createdAt" <= ${queryEndDate}
          AND o."status" IN ('COMPLETED', 'PROCESSING', 'SHIPPED')
        GROUP BY o."createdAt"::date
        ORDER BY date ASC
      `.catch((e) => {
        console.error("Sales by day error:", e);
        return [];
      }),

      // Top customers
      prisma.$queryRaw`
        SELECT 
          u.id,
          u.name,
          u.email,
          COUNT(o.id)::int as order_count,
          SUM(o."totalAmount")::float as total_spent
        FROM "User" u
        JOIN "Order" o ON o."userId" = u.id
        WHERE o."createdAt" >= ${queryStartDate} AND o."createdAt" <= ${queryEndDate}
          AND o."status" IN ('COMPLETED', 'PROCESSING', 'SHIPPED')
        GROUP BY u.id, u.name, u.email
        ORDER BY total_spent DESC
        LIMIT 10
      `.catch(() => []),

      // Recent orders
      prisma.order.findMany({
        where: dateWhere,
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { name: true, email: true },
          },
        },
      }).catch(() => []),
    ]);

    // Calculate metrics
    const totalRevenue = Number((totalSales as any)._sum.totalAmount || 0);
    const totalOrders = (totalSales as any)._count || 0;
    const avgOrderValue = Number((totalSales as any)._avg.totalAmount || 0);

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        summary: {
          totalRevenue,
          totalOrders,
          avgOrderValue,
        },
        salesByCategory,
        salesByDay,
        topCustomers,
        recentOrders,
      },
    });
  } catch (error: any) {
    console.error('[SALES ANALYTICS API] Error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to fetch sales analytics' },
      { status: 500 }
    );
  }
}
