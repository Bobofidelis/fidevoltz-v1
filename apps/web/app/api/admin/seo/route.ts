import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { ApiResponse } from '@fidevoltz/types';

// GET - Get all SEO metrics
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const metrics = await prisma.sEOMetrics.findMany({
      orderBy: {
        seoScore: 'desc',
      },
    });

    // Calculate overall stats
    const totalPages = metrics.length;
    const avgSeoScore = metrics.reduce((sum, m) => sum + m.seoScore, 0) / (totalPages || 1);
    const avgMobileScore = metrics.reduce((sum, m) => sum + m.mobileScore, 0) / (totalPages || 1);
    const avgSpeedScore = metrics.reduce((sum, m) => sum + m.speedScore, 0) / (totalPages || 1);

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        metrics,
        stats: {
          totalPages,
          avgSeoScore: Math.round(avgSeoScore),
          avgMobileScore: Math.round(avgMobileScore),
          avgSpeedScore: Math.round(avgSpeedScore),
        },
      },
    });
  } catch (error: any) {
    console.error('[ADMIN SEO API] Get metrics error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to fetch SEO metrics' },
      { status: 500 }
    );
  }
}
