import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { ApiResponse } from '@fidevoltz/types';

// POST - Admin reply to comment
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

    const { id: commentId } = await params;
    const body = await request.json();
    const { reply } = body;

    if (!reply || reply.trim().length < 5) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Reply must be at least 5 characters' },
        { status: 400 }
      );
    }

    const comment = await prisma.comment.update({
      where: { id: commentId },
      data: {
        adminReply: reply.trim(),
        repliedBy: session.user.id,
        repliedAt: new Date(),
      },
      include: {
        user: true,
        post: {
          select: {
            id: true,
            slug: true,
            title: true,
          },
        },
      },
    });

    // Notify user about admin reply
    if (comment.userId) {
      try {
        await prisma.notification.create({
          data: {
            userId: comment.userId,
            type: 'SYSTEM',
            title: 'Admin Replied to Your Comment',
            message: `An admin replied to your comment on "${comment.post.title}"`,
            actionUrl: `/projects/${comment.post.slug}`,
            actionLabel: 'View Post',
          },
        });
      } catch (notifError) {
        console.error('[ADMIN COMMENTS API] Notification error (non-blocking):', notifError);
      }
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: comment,
      message: 'Reply added successfully',
    });
  } catch (error: any) {
    console.error('[ADMIN COMMENTS API] Reply error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to add reply' },
      { status: 500 }
    );
  }
}
