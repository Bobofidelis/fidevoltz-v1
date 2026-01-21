import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { ApiResponse } from '@fidevoltz/types';
import { NotificationType } from '@prisma/client';

// POST - Broadcast notification (Admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { type, title, message, actionUrl, actionLabel, priority, targetRole } = body;

    if (!type || !title || !message) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Type, title, and message are required' },
        { status: 400 }
      );
    }

    // Get target users
    const where: any = {};
    if (targetRole && targetRole !== 'ALL') {
      where.role = targetRole;
    }

    const users = await prisma.user.findMany({
      where,
      select: { id: true },
    });

    // Create notifications for all target users
    const notifications = await prisma.notification.createMany({
      data: users.map(user => ({
        type: type as NotificationType,
        title,
        message,
        userId: user.id,
        actionUrl,
        actionLabel,
        priority: priority || 'normal',
        sentBy: session.user.id,
        isBroadcast: true,
      })),
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: { count: notifications.count },
      message: `Broadcast sent to ${notifications.count} users`,
    });
  } catch (error: any) {
    console.error('Broadcast notification error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to broadcast notification' },
      { status: 500 }
    );
  }
}
