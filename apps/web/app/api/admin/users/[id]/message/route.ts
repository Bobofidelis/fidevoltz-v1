import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { ApiResponse } from '@fidevoltz/types';

// POST - Send direct message to user (Admin only)
export async function POST(
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

    const body = await request.json();
    const { subject, message } = body;

    if (!message) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Message is required' },
        { status: 400 }
      );
    }

    const directMessage = await prisma.directMessage.create({
      data: {
        senderId: session.user.id,
        recipientId: id,
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

    // Create notification for user
    await prisma.notification.create({
      data: {
        type: 'MESSAGE',
        title: subject || 'New message from admin',
        message: `Admin sent you a message: "${message.substring(0, 100)}${message.length > 100 ? '...' : ''}"`,
        userId: id,
        actionUrl: '/dashboard/messages',
        actionLabel: 'View Message',
        priority: 'normal',
        sentBy: session.user.id,
      },
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: directMessage,
      message: 'Message sent successfully',
    });
  } catch (error: any) {
    console.error('[API] Send message error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to send message' },
      { status: 500 }
    );
  }
}

// GET - Get message history with user (Admin only)
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

    const messages = await prisma.directMessage.findMany({
      where: {
        OR: [
          { senderId: session.user.id, recipientId: id },
          { senderId: id, recipientId: session.user.id },
        ],
      },
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
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: messages,
    });
  } catch (error: any) {
    console.error('[API] Get messages error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}
