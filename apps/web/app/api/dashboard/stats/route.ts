import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { ApiResponse, DashboardStats } from '@fidevoltz/types';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    const [
      totalUsers,
      totalOrders,
      totalProducts,
      lowStockProducts,
      recentOrders,
      orders,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.order.count(),
      prisma.product.count(),
      prisma.product.count({
        where: {
          stock: {
            lte: prisma.product.fields.minStock,
          },
        },
      }),
      prisma.order.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
          },
        },
      }),
      prisma.order.findMany({
        select: {
          totalAmount: true,
        },
      }),
    ]);

    const totalRevenue = orders.reduce(
      (sum, order) => sum + Number(order.totalAmount),
      0
    );

    const stats: DashboardStats = {
      totalUsers,
      totalOrders,
      totalRevenue,
      totalProducts,
      recentOrders,
      lowStockProducts,
    };

    return NextResponse.json<ApiResponse<DashboardStats>>(
      { success: true, data: stats },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Get dashboard stats error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'An error occurred while fetching stats' },
      { status: 500 }
    );
  }
}
