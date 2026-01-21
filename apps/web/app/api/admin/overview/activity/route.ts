import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { ApiResponse } from '@fidevoltz/types';

// GET - Get recent activity feed
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
    const limit = parseInt(searchParams.get('limit') || '20');

    // Get recent activity logs
    const activities = await prisma.activityLog.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: activities,
    });
  } catch (error: any) {
    console.error('[ACTIVITY FEED API] Error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to fetch activity feed' },
      { status: 500 }
    );
  }
}
