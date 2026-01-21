import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { ApiResponse } from '@fidevoltz/types';

// GET - Get all conversations for current user
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get all unique conversation partners
    const sentMessages = await prisma.directMessage.findMany({
      where: { senderId: session.user.id },
      select: { recipientId: true },
      distinct: ['recipientId'],
    });

    const receivedMessages = await prisma.directMessage.findMany({
      where: { recipientId: session.user.id },
      select: { senderId: true },
      distinct: ['senderId'],
    });

    // Combine and get unique user IDs
    const partnerIds = new Set([
      ...sentMessages.map(m => m.recipientId),
      ...receivedMessages.map(m => m.senderId),
    ]);

    // Get conversation details for each partner
    const conversations = await Promise.all(
      Array.from(partnerIds).map(async (partnerId) => {
        // Get partner info
        const partner = await prisma.user.findUnique({
          where: { id: partnerId },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            avatar: true,
          },
        });

        if (!partner) return null;

        // Get last message
        const lastMessage = await prisma.directMessage.findFirst({
          where: {
            OR: [
              { senderId: session.user.id, recipientId: partnerId },
              { senderId: partnerId, recipientId: session.user.id },
            ],
          },
          orderBy: { createdAt: 'desc' },
          select: {
            message: true,
            createdAt: true,
            senderId: true,
          },
        });

        // Count unread messages from this partner
        const unreadCount = await prisma.directMessage.count({
          where: {
            senderId: partnerId,
            recipientId: session.user.id,
            isRead: false,
          },
        });

        // Count total messages
        const totalMessages = await prisma.directMessage.count({
          where: {
            OR: [
              { senderId: session.user.id, recipientId: partnerId },
              { senderId: partnerId, recipientId: session.user.id },
            ],
          },
        });

        return {
          participant: partner,
          lastMessage: lastMessage ? {
            message: lastMessage.message,
            createdAt: lastMessage.createdAt,
            isSentByMe: lastMessage.senderId === session.user.id,
          } : null,
          unreadCount,
          totalMessages,
        };
      })
    );

    // Filter out null values and sort by last message date
    const validConversations = conversations
      .filter(c => c !== null)
      .sort((a, b) => {
        const dateA = a.lastMessage?.createdAt || new Date(0);
        const dateB = b.lastMessage?.createdAt || new Date(0);
        return dateB.getTime() - dateA.getTime();
      });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: validConversations,
    });
  } catch (error: any) {
    console.error('[API] Get conversations error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}
