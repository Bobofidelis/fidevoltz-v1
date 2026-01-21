import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { ApiResponse } from '@fidevoltz/types';

// GET - Get recent notifications
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    const notifications = await prisma.notification.findMany({
      where: { userId: session.user.id },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: notifications,
    });
  } catch (error: any) {
    console.error('[NOTIFICATIONS API] Error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}
