import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { ApiResponse } from '@fidevoltz/types';

// GET - Get overview stats for admin dashboard
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Today's revenue
    const todayOrders = await prisma.order.findMany({
      where: {
        createdAt: { gte: today },
        status: { in: ['COMPLETED', 'PROCESSING', 'SHIPPED'] },
      },
      select: { totalAmount: true },
    });
    const todayRevenue = todayOrders.reduce((sum, order) => sum + Number(order.totalAmount), 0);

    // Pending orders
    const pendingOrders = await prisma.order.count({
      where: { status: 'PENDING' },
    });

    // Unread messages (DirectMessage)
    const unreadMessages = await prisma.directMessage.count({
      where: {
        recipientId: session.user.id,
        isRead: false,
      },
    });

    // New notifications
    const newNotifications = await prisma.notification.count({
      where: {
        userId: session.user.id,
        isRead: false,
      },
    });

    // Low stock products
    const lowStockCount = await prisma.product.count({
      where: {
        stock: { lte: 10 }, // Simplified for build stability
      },
    });

    // Today's orders count
    const todayOrdersCount = todayOrders.length;

    // Active users (users who logged in today)
    const activeUsers = await prisma.user.count({
      where: {
        lastLoginAt: { gte: today },
      },
    });

    // Conversion rate (orders / unique visitors) - simplified
    const totalVisitors = await prisma.pageView.count({
      where: { createdAt: { gte: today } },
    });
    const conversionRate = totalVisitors > 0 ? (todayOrdersCount / totalVisitors) * 100 : 0;

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        todayRevenue,
        activeUsers,
        pendingOrders,
        unreadMessages,
        newNotifications,
        lowStockCount,
        todayOrders: todayOrdersCount,
        conversionRate: Number(conversionRate.toFixed(2)),
      },
    });
  } catch (error: any) {
    console.error('[OVERVIEW STATS API] Error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to fetch overview stats' },
      { status: 500 }
    );
  }
}
