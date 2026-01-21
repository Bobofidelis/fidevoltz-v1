import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { ApiResponse } from '@fidevoltz/types';

// GET - Get all comments (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const postId = searchParams.get('postId');
    const userId = searchParams.get('userId');
    const flagged = searchParams.get('flagged');

    // Build where clause
    const where: any = {};
    if (status && status !== 'ALL') {
      where.status = status;
    }
    if (postId) {
      where.postId = postId;
    }
    if (userId) {
      where.userId = userId;
    }
    if (flagged === 'true') {
      where.isFlagged = true;
    }

    const comments = await prisma.comment.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            warningCount: true,
            isBanned: true,
          },
        },
        post: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        parent: {
          select: {
            id: true,
            content: true,
          },
        },
        replies: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log('[ADMIN COMMENTS API] Found comments:', comments.length);
    console.log('[ADMIN COMMENTS API] Where clause:', JSON.stringify(where));

    // Get statistics
    const stats = {
      total: await prisma.comment.count(),
      pending: await prisma.comment.count({ where: { status: 'PENDING' } }),
      approved: await prisma.comment.count({ where: { status: 'APPROVED' } }),
      rejected: await prisma.comment.count({ where: { status: 'REJECTED' } }),
      flagged: await prisma.comment.count({ where: { isFlagged: true } }),
    };

    console.log('[ADMIN COMMENTS API] Stats:', stats);

    return NextResponse.json<ApiResponse>({
      success: true,
      data: { comments, stats },
    });
  } catch (error: any) {
    console.error('[ADMIN COMMENTS API] Get comments error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}
