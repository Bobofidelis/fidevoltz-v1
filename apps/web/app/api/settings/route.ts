import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { ApiResponse } from '@fidevoltz/types';

// GET - Get public site settings
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    const where: any = { isPublic: true };
    if (category) {
      where.category = category;
    }

    const settings = await prisma.siteSettings.findMany({
      where,
      select: {
        key: true,
        value: true,
        category: true,
      },
    });

    // Group by category
    const grouped = settings.reduce((acc: any, setting) => {
      if (!acc[setting.category]) {
        acc[setting.category] = {};
      }
      acc[setting.category][setting.key] = setting.value;
      return acc;
    }, {});

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        settings,
        grouped,
      },
    });
  } catch (error: any) {
    console.error('[PUBLIC SETTINGS API] Get error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}
