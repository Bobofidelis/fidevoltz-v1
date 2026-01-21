import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { ApiResponse } from '@fidevoltz/types';

// GET - Get comprehensive user analytics
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
    const startDate = searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : new Date();

    // Run queries in parallel
    const [
      totalUsers,
      newUsers,
      usersByRole,
      userGrowth,
      activeUsers,
      topActiveUsers,
    ] = await Promise.all([
      // Total users
      prisma.user.count().catch(() => 0),

      // New users in period
      prisma.user.count({
        where: { createdAt: { gte: startDate, lte: endDate } },
      }).catch(() => 0),

      // Users by role
      prisma.user.groupBy({
        by: ['role'],
        _count: true,
      }).catch(() => []),

      // User growth by day
      prisma.$queryRaw`
        SELECT 
          "createdAt"::date as date,
          COUNT(id)::int as new_users
        FROM "User"
        WHERE "createdAt" >= ${startDate} AND "createdAt" <= ${endDate}
        GROUP BY "createdAt"::date
        ORDER BY date ASC
      `.catch((e) => {
        console.error("User growth error:", e);
        return [];
      }),

      // Active users (logged in recently)
      prisma.user.count({
        where: {
          lastLoginAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      }).catch(() => 0),

      // Top active users (by order count)
      prisma.$queryRaw`
        SELECT 
          u.id,
          u.name,
          u.email,
          u."createdAt",
          u."lastLoginAt",
          COUNT(o.id)::int as order_count
        FROM "User" u
        LEFT JOIN "Order" o ON o."userId" = u.id
        WHERE u."createdAt" >= ${startDate} AND u."createdAt" <= ${endDate}
        GROUP BY u.id, u.name, u.email, u."createdAt", u."lastLoginAt"
        ORDER BY order_count DESC
        LIMIT 10
      `.catch(() => []),
    ]);

    // Calculate retention (users who made 2+ orders)
    const retentionData = await prisma.$queryRaw`
      SELECT COUNT(DISTINCT "userId")::int as retained_users
      FROM (
        SELECT "userId", COUNT(id) as order_count
        FROM "Order"
        WHERE "createdAt" >= ${startDate} AND "createdAt" <= ${endDate}
        GROUP BY "userId"
        HAVING COUNT(id) >= 2
      ) as repeat_customers
    `.catch(() => [{ retained_users: 0 }]) as any[];

    const retainedUsers = retentionData[0]?.retained_users || 0;
    const retentionRate = newUsers > 0 ? (retainedUsers / newUsers) * 100 : 0;

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        summary: {
          totalUsers,
          newUsers,
          activeUsers,
          retentionRate: Number(retentionRate.toFixed(2)),
        },
        usersByRole,
        userGrowth,
        topActiveUsers,
      },
    });
  } catch (error: any) {
    console.error('[USER ANALYTICS API] Error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to fetch user analytics' },
      { status: 500 }
    );
  }
}
