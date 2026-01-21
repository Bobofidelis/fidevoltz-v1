import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { ApiResponse } from '@fidevoltz/types';

// POST - Warn user
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: userId } = await params;
    const body = await request.json();
    const { reason } = body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        warningCount: {
          increment: 1,
        },
        lastWarningAt: new Date(),
      },
    });

    // Notify user about warning
    try {
      await prisma.notification.create({
        data: {
          userId: user.id,
          type: 'SYSTEM',
          title: 'Warning Issued',
          message: reason || 'You have received a warning from the admin team. Please review our community guidelines.',
          actionUrl: '/dashboard/profile',
          actionLabel: 'View Profile',
          priority: 'high',
        },
      });
    } catch (notifError) {
      console.error('[ADMIN USERS API] Notification error (non-blocking):', notifError);
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: user,
      message: 'User warned successfully',
    });
  } catch (error: any) {
    console.error('[ADMIN USERS API] Warn user error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to warn user' },
      { status: 500 }
    );
  }
}
