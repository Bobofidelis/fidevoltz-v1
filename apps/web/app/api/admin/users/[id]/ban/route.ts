import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { ApiResponse } from '@fidevoltz/types';

// POST - Ban/Unban user
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
    const { ban, reason } = body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        isBanned: ban,
        bannedAt: ban ? new Date() : null,
        bannedBy: ban ? session.user.id : null,
        banReason: ban ? reason : null,
      },
    });

    // Notify user about ban/unban
    try {
      await prisma.notification.create({
        data: {
          userId: user.id,
          type: 'SYSTEM',
          title: ban ? 'Account Banned' : 'Account Unbanned',
          message: ban 
            ? `Your account has been banned. Reason: ${reason || 'Violation of community guidelines'}`
            : 'Your account has been unbanned. You can now access all features.',
          actionUrl: '/dashboard/profile',
          actionLabel: 'View Profile',
          priority: 'urgent',
        },
      });
    } catch (notifError) {
      console.error('[ADMIN USERS API] Notification error (non-blocking):', notifError);
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: user,
      message: ban ? 'User banned successfully' : 'User unbanned successfully',
    });
  } catch (error: any) {
    console.error('[ADMIN USERS API] Ban user error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to update ban status' },
      { status: 500 }
    );
  }
}
