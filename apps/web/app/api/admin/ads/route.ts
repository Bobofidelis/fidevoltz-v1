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
        status: status || 'DRAFT',
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
        placements: placements && placements.length > 0 ? {
          create: placements.map((p: any) => ({
            page: p.page,
            zone: p.zone as any, // Cast to AdZone enum
            isActive: p.isActive !== false,
          })),
        } : undefined,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        placements: true,
      },
    });

    // Auto-create default placements based on format
    const defaultPlacements: { page: string; zone: string }[] = [];
    
    switch (format) {
      case 'BANNER':
        defaultPlacements.push({ page: 'home', zone: 'HEADER' });
        break;
      case 'SIDEBAR':
        defaultPlacements.push({ page: 'home', zone: 'SIDEBAR_RIGHT' });
        break;
      case 'POPUP':
        defaultPlacements.push({ page: 'home', zone: 'POPUP' });
        break;
      case 'INLINE':
        defaultPlacements.push({ page: 'home', zone: 'CONTENT_MIDDLE' });
        break;
      default:
        defaultPlacements.push({ page: 'home', zone: 'CONTENT_TOP' });
    }

    // Create placements
    if (defaultPlacements.length > 0) {
      await prisma.adPlacement.createMany({
        data: defaultPlacements.map((placement, index) => ({
          advertisementId: ad.id,
          page: placement.page,
          zone: placement.zone as any,
          position: index,
          isActive: true,
        })),
      });
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: ad,
      message: 'Advertisement created successfully with default placements',
    });
  } catch (error: any) {
    console.error('[ADMIN ADS API] Create ad error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to create advertisement' },
      { status: 500 }
    );
  }
}
