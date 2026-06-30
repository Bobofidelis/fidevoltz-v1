import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { ApiResponse } from '@fidevoltz/types';

// GET - Get profit analytics
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

    // Get all completed orders in date range
    const orders = await prisma.order.findMany({
      where: {
        ...dateWhere,
        status: { in: ['COMPLETED', 'PROCESSING', 'SHIPPED'] },
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                costPrice: true,
                price: true,
                name: true,
              },
            },
          },
        },
      },
    });

    let totalRevenue = 0;
    let totalCost = 0;
    const productProfits: Record<string, { name: string; revenue: number; cost: number; profit: number; quantity: number }> = {};

    orders.forEach((order) => {
      order.items.forEach((item) => {
        const revenue = Number(item.price) * item.quantity;
        const cost = Number(item.product?.costPrice || 0) * item.quantity;
        const profit = revenue - cost;

        totalRevenue += revenue;
        totalCost += cost;

        if (!productProfits[item.productId]) {
          productProfits[item.productId] = {
            name: item.product?.name || 'Unknown',
            revenue: 0,
            cost: 0,
            profit: 0,
            quantity: 0,
          };
        }

        productProfits[item.productId].revenue += revenue;
        productProfits[item.productId].cost += cost;
        productProfits[item.productId].profit += profit;
        productProfits[item.productId].quantity += item.quantity;
      });
    });

    const totalProfit = totalRevenue - totalCost;
    const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

    // Top profitable products
    const topProfitableProducts = Object.entries(productProfits)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 10);

    const queryStartDate = dateFilter.gte || new Date(0);
    const queryEndDate = dateFilter.lte || new Date();

    // Profit trend (daily)
    const profitTrend = await prisma.$queryRaw`
      SELECT 
        DATE(o."createdAt") as date,
        SUM(oi."price" * oi."quantity")::float as revenue,
        SUM(COALESCE(p."costPrice", 0) * oi."quantity")::float as cost
      FROM "Order" o
      JOIN "OrderItem" oi ON oi."orderId" = o.id
      LEFT JOIN "Product" p ON p.id = oi."productId"
      WHERE o."createdAt" >= ${queryStartDate} AND o."createdAt" <= ${queryEndDate}
        AND o."status" IN ('COMPLETED', 'PROCESSING', 'SHIPPED')
      GROUP BY DATE(o."createdAt")
      ORDER BY date ASC
    `;

    const profitTrendWithProfit = (profitTrend as any[]).map((item) => ({
      date: item.date,
      revenue: item.revenue,
      cost: item.cost,
      profit: item.revenue - item.cost,
    }));

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        summary: {
          totalRevenue,
          totalCost,
          totalProfit,
          profitMargin: Number(profitMargin.toFixed(2)),
        },
        topProfitableProducts,
        profitTrend: profitTrendWithProfit,
      },
    });
  } catch (error: any) {
    console.error('[PROFIT ANALYTICS API] Error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to fetch profit analytics' },
      { status: 500 }
    );
  }
}
