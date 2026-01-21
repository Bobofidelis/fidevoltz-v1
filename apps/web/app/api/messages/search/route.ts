import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { ApiResponse } from '@fidevoltz/types';

// GET - Search messages
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
    const query = searchParams.get('q') || '';
    const partnerId = searchParams.get('partnerId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      OR: [
        { senderId: session.user.id },
        { recipientId: session.user.id },
      ],
    };

    // Add search filter
    if (query) {
      where.AND = [
        {
          OR: [
            { message: { contains: query, mode: 'insensitive' } },
            { subject: { contains: query, mode: 'insensitive' } },
          ],
        },
      ];
    }

    // Add partner filter
    if (partnerId) {
      where.AND = where.AND || [];
      where.AND.push({
        OR: [
          { senderId: partnerId, recipientId: session.user.id },
          { senderId: session.user.id, recipientId: partnerId },
        ],
      });
    }

    // Get messages
    const [messages, total] = await Promise.all([
      prisma.directMessage.findMany({
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
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.directMessage.count({ where }),
    ]);

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        messages,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error: any) {
    console.error('[API] Search messages error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to search messages' },
      { status: 500 }
    );
  }
}
