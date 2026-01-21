import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { ApiResponse } from '@fidevoltz/types';

// GET - Get ad analytics
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
    const period = searchParams.get('period') || '30'; // days

    // Get overall analytics
    const totalAds = await prisma.advertisement.count();
    const activeAds = await prisma.advertisement.count({ where: { status: 'ACTIVE' } });

    const aggregates = await prisma.advertisement.aggregate({
      _sum: {
        impressions: true,
        clicks: true,
        conversions: true,
        revenue: true,
      },
    });

    // Get top performing ads
    const topAds = await prisma.advertisement.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { clicks: 'desc' },
      take: 10,
      select: {
        id: true,
        name: true,
        impressions: true,
        clicks: true,
        revenue: true,
      },
    });

    // Calculate CTR
    const totalImpressions = aggregates._sum.impressions || 0;
    const totalClicks = aggregates._sum.clicks || 0;
    const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        totalAds,
        activeAds,
        totalImpressions,
        totalClicks,
        totalConversions: aggregates._sum.conversions || 0,
        totalRevenue: aggregates._sum.revenue || 0,
        ctr: ctr.toFixed(2),
        topAds,
      },
    });
  } catch (error: any) {
    console.error('[ADMIN ADS ANALYTICS API] Error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
