import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { ApiResponse } from '@fidevoltz/types';

// GET - Get active advertisements for a specific page (public endpoint)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || 'home';

    console.log('[ADS API] Fetching ads for page:', page);

    // Build a list of page slugs to match against.
    // e.g., for page='projects/my-article-slug', we match placements on:
    // 'projects/my-article-slug', 'projects', and 'all'
    const pageVariants = [page, 'all'];
    // Add parent path segment(s) so a placement on 'projects' matches 'projects/any-slug'
    const segments = page.split('/');
    if (segments.length > 1) {
      // Add intermediate path segments like 'projects' for 'projects/slug'
      for (let i = 1; i < segments.length; i++) {
        pageVariants.push(segments.slice(0, i).join('/'));
      }
    }

    // Get all ACTIVE ads with placements for the specified page
    const ads = await prisma.advertisement.findMany({
      where: {
        status: 'ACTIVE',
        placements: {
          some: {
            page: { in: pageVariants },
            isActive: true,
          },
        },
      },
      include: {
        placements: {
          where: {
            page: { in: pageVariants },
            isActive: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log(`[ADS API] Found ${ads.length} active ads for page variants: ${pageVariants.join(', ')}`);

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
