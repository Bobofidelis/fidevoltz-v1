import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { ApiResponse } from '@fidevoltz/types';

// GET - Get active ads for a page (public)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const now = new Date();

    // Find active ads for this page
    const ads = await prisma.advertisement.findMany({
      where: {
        status: 'ACTIVE',
        OR: [
          { targetPages: { has: slug } },
          { targetPages: { isEmpty: true } }, // Show on all pages
        ],
        AND: [
          {
            OR: [
              { startDate: null },
              { startDate: { lte: now } },
            ],
          },
          {
            OR: [
              { endDate: null },
              { endDate: { gte: now } },
            ],
          },
        ],
      },
      include: {
        placements: {
          where: {
            page: slug,
            isActive: true,
          },
          orderBy: {
            position: 'asc',
          },
        },
      },
    });

    // Increment impressions
    if (ads.length > 0) {
      await prisma.advertisement.updateMany({
        where: {
          id: { in: ads.map(ad => ad.id) },
        },
        data: {
          impressions: { increment: 1 },
        },
      });
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: ads,
    });
  } catch (error: any) {
    console.error('[PUBLIC ADS API] Get ads error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to fetch ads' },
      { status: 500 }
    );
  }
}
