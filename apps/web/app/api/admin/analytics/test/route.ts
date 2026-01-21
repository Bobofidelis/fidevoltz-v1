import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    console.log('📊 Test Analytics - Session:', session?.user?.email);
    console.log('📊 Test Analytics - Role:', session?.user?.role);
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      console.log('❌ Test Analytics - Unauthorized');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('✅ Test Analytics - Authorized, fetching data...');

    // Simple query using only existing models
    const orderCount = await prisma.order.count();
    const userCount = await prisma.user.count();

    console.log('✅ Test Analytics - Data fetched successfully');

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalRevenue: 0,
          totalOrders: orderCount,
          totalPageViews: 0,
          uniqueVisitors: 0,
          uniqueUsers: userCount,
          newUsers: 0,
          conversionRate: 0,
          avgOrderValue: 0,
        },
        topProducts: [],
        recentActivities: [],
        charts: {
          revenue: [],
          visitors: [],
        },
      },
    });
  } catch (error) {
    console.error('❌ Test Analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
