import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { ApiResponse } from '@fidevoltz/types';

// GET - Get user activity log (Admin only)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');

    const activities = await prisma.userActivity.findMany({
      where: { userId: id },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: activities,
    });
  } catch (error: any) {
    console.error('[API] Get activity error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to fetch activity' },
      { status: 500 }
    );
  }
}
