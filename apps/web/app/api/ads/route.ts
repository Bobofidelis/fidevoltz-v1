import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { ApiResponse } from '@fidevoltz/types';

// GET - Get active advertisements for a specific page (public endpoint)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || 'home';

    console.log('[ADS API] Fetching ads for page:', page);

    // Get all ACTIVE ads with placements for the specified page
    const ads = await prisma.advertisement.findMany({
      where: {
        status: 'ACTIVE',
        placements: {
          some: {
            page: {
              in: [page, 'all'], // Match specific page or 'all' pages
            },
            isActive: true,
          },
        },
      },
      include: {
        placements: {
          where: {
            page: {
              in: [page, 'all'],
            },
            isActive: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log(`[ADS API] Found ${ads.length} active ads`);

    return NextResponse.json<ApiResponse>({
      success: true,
      data: ads,
    });
  } catch (error: any) {
    console.error('[ADS API] Error fetching ads:', error);
    console.error('[ADS API] Error stack:', error.stack);
    return NextResponse.json<ApiResponse>(
      { success: false, error: error.message || 'Failed to fetch advertisements' },
      { status: 500 }
    );
  }
}
