import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { ApiResponse } from '@fidevoltz/types';

// GET - Get all advertisements (admin only)
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
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const page = searchParams.get('page');

    // Build where clause
    const where: any = {};
    if (status && status !== 'ALL') {
      where.status = status;
    }
    if (type && type !== 'ALL') {
      where.type = type;
    }
    if (page) {
      where.targetPages = {
        has: page,
      };
    }

    const ads = await prisma.advertisement.findMany({
      where,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        placements: {
          include: {
            advertisement: false,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Get statistics
    const stats = {
      total: await prisma.advertisement.count(),
      active: await prisma.advertisement.count({ where: { status: 'ACTIVE' } }),
      draft: await prisma.advertisement.count({ where: { status: 'DRAFT' } }),
      paused: await prisma.advertisement.count({ where: { status: 'PAUSED' } }),
      totalImpressions: await prisma.advertisement.aggregate({
        _sum: { impressions: true },
      }),
      totalClicks: await prisma.advertisement.aggregate({
        _sum: { clicks: true },
      }),
      totalRevenue: await prisma.advertisement.aggregate({
        _sum: { revenue: true },
      }),
    };

    return NextResponse.json<ApiResponse>({
      success: true,
      data: { ads, stats },
    });
  } catch (error: any) {
    console.error('[ADMIN ADS API] Get ads error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to fetch advertisements' },
      { status: 500 }
    );
  }
}

// POST - Create new advertisement (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      name,
      type,
      format,
      status,
      title,
      description,
      imageUrl,
      customHtml,
      customCss,
      linkUrl,
      ctaText,
      startDate,
      endDate,
      targetPages,
      targetDevices,
      isGoogleAd,
      googleAdId,
      googleAdSlot,
      placements,
    } = body;

    // Validation
    if (!name || !format) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Name and format are required' },
        { status: 400 }
      );
    }

    const ad = await prisma.advertisement.create({
      data: {
        name,
        type: type || 'CUSTOM',
        format,
        status: status || 'ACTIVE',
        title,
        description,
        imageUrl,
        customHtml,
        customCss,
        linkUrl,
        ctaText,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        targetPages: targetPages || [],
        targetDevices: targetDevices || ['desktop', 'mobile', 'tablet'],
        isGoogleAd: isGoogleAd || false,
        googleAdId,
        googleAdSlot,
        createdBy: session.user.id,
        // Use user-specified placements; if none provided, create a sensible default
        placements: {
          create: placements && placements.length > 0
            ? placements.map((p: any) => ({
                page: p.page,
                zone: p.zone as any,
                isActive: p.isActive !== false,
              }))
            : [
                // Default: show on all project pages in content middle
                { page: 'projects', zone: 'CONTENT_MIDDLE' as any, isActive: true },
              ],
        },
      },
      include: {
        creator: {
          select: { id: true, name: true, email: true },
        },
        placements: true,
      },
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: ad,
      message: `Advertisement created successfully! It is now ${status || 'ACTIVE'} and targeting ${(placements && placements.length > 0) ? placements.length : 1} placement(s).`,
    });
  } catch (error: any) {
    console.error('[ADMIN ADS API] Create ad error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to create advertisement' },
      { status: 500 }
    );
  }
}
