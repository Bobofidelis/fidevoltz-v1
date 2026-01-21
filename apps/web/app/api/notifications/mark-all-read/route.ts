import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { ApiResponse } from '@fidevoltz/types';

// POST - Mark all notifications as read
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const result = await prisma.notification.updateMany({
      where: {
        userId: session.user.id,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: { count: result.count },
      message: `Marked ${result.count} notifications as read`,
    });
  } catch (error: any) {
    console.error('Mark all as read error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to mark notifications as read' },
      { status: 500 }
    );
  }
}
