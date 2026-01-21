import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { ApiResponse } from '@fidevoltz/types';

// GET - Get user's full conversation (both sent and received messages)
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
    const partnerId = searchParams.get('partnerId');

    // Build where clause
    const where: any = {
      OR: [
        { recipientId: session.user.id }, // Messages TO user
        { senderId: session.user.id },    // Messages FROM user
      ],
    };

    // Filter by conversation partner if provided
    if (partnerId) {
      where.AND = [
        {
          OR: [
            { senderId: partnerId, recipientId: session.user.id },
            { senderId: session.user.id, recipientId: partnerId },
          ],
        },
      ];
    }

    // Get ALL messages - both received and sent by the user for full conversation
    const messages = await prisma.directMessage.findMany({
      where,
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            avatar: true,
          },
        },
        recipient: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' }, // Chronological order for conversation flow
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: messages,
    });
  } catch (error: any) {
    console.error('[API] Get user messages error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

// POST - Send reply to admin (for regular users)
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
    const { subject, message, recipientId } = body;

    if (!message) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Message is required' },
        { status: 400 }
      );
    }

    // Find an admin to send to (if recipientId not provided)
    let targetRecipientId = recipientId;
    if (!targetRecipientId) {
      const admin = await prisma.user.findFirst({
        where: { role: 'ADMIN' },
        select: { id: true },
      });

      if (!admin) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: 'No admin found to send message to' },
          { status: 404 }
        );
      }

      targetRecipientId = admin.id;
    }

    const directMessage = await prisma.directMessage.create({
      data: {
        senderId: session.user.id,
        recipientId: targetRecipientId,
        subject,
        message,
      },
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
    });

    // Create notification for admin
    await prisma.notification.create({
      data: {
        type: 'MESSAGE',
        title: subject || 'New message from user',
        message: `${session.user.name || session.user.email} sent you a message: "${message.substring(0, 100)}${message.length > 100 ? '...' : ''}"`,
        userId: targetRecipientId,
        actionUrl: `/dashboard/users`,
        actionLabel: 'View Messages',
        priority: 'normal',
        sentBy: session.user.id,
      },
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: directMessage,
      message: 'Reply sent successfully',
    });
  } catch (error: any) {
    console.error('[API] Send reply error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to send reply' },
      { status: 500 }
    );
  }
}
