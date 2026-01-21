import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { ApiResponse } from '@fidevoltz/types';

// PATCH - Mark message as read
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: messageId } = await params;

    // Verify message exists and user is recipient
    const message = await prisma.directMessage.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Message not found' },
        { status: 404 }
      );
    }

    if (message.recipientId !== session.user.id) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Not authorized to mark this message as read' },
        { status: 403 }
      );
    }

    // Mark as read
    const updatedMessage = await prisma.directMessage.update({
      where: { id: messageId },
      data: {
        isRead: true,
        readAt: new Date(),
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
      },
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: updatedMessage,
    });
  } catch (error: any) {
    console.error('[API] Mark message as read error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to mark message as read' },
      { status: 500 }
    );
  }
}
