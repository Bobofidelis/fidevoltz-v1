import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { ApiResponse } from '@fidevoltz/types';
import { NotificationType } from '@prisma/client';

// GET - Fetch user's notifications with filters
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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const type = searchParams.get('type') as NotificationType | null;
    const isRead = searchParams.get('isRead');
    const priority = searchParams.get('priority');

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      userId: session.user.id,
      archivedAt: null, // Don't show archived by default
    };

    if (type) where.type = type;
    if (isRead !== null && isRead !== undefined) {
      where.isRead = isRead === 'true';
    }
    if (priority) where.priority = priority;

    // Fetch notifications
    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({
        where: {
          userId: session.user.id,
          isRead: false,
          archivedAt: null,
        },
      }),
    ]);

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        notifications,
        total,
        unreadCount,
        page,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Get notifications error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

// POST - Create notification (for testing or admin broadcast)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { type, title, message, actionUrl, actionLabel, priority, metadata } = body;

    if (!type || !title || !message) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Type, title, and message are required' },
        { status: 400 }
      );
    }

    const notification = await prisma.notification.create({
      data: {
        type,
        title,
        message,
        userId: session.user.id,
        actionUrl,
        actionLabel,
        priority: priority || 'normal',
        metadata: metadata || {},
      },
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: notification,
      message: 'Notification created successfully',
    });
  } catch (error: any) {
    console.error('Create notification error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to create notification' },
      { status: 500 }
    );
  }
}
