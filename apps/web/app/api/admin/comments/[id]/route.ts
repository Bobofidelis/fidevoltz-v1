import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { ApiResponse } from '@fidevoltz/types';

// PATCH - Update comment (approve, reject, flag)
export async function PATCH(
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
    const { status, isFlagged, flagReason } = body;

    const updateData: any = {};
    if (status) updateData.status = status;
    if (isFlagged !== undefined) {
      updateData.isFlagged = isFlagged;
      if (isFlagged) {
        updateData.flagReason = flagReason;
        updateData.flaggedBy = session.user.id;
        updateData.flaggedAt = new Date();
      } else {
        updateData.flagReason = null;
        updateData.flaggedBy = null;
        updateData.flaggedAt = null;
      }
    }

    const comment = await prisma.comment.update({
      where: { id: commentId },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        post: {
          select: {
            id: true,
            slug: true,
            title: true,
          },
        },
      },
    });

    // Notify user if comment status changed
    if (status && comment.userId) {
      const statusMessages: Record<string, string> = {
        APPROVED: 'Your comment has been approved',
        REJECTED: 'Your comment has been rejected',
        FLAGGED: 'Your comment has been flagged for review',
      };

      if (statusMessages[status]) {
        try {
          await prisma.notification.create({
            data: {
              userId: comment.userId,
              type: 'SYSTEM',
              title: 'Comment Status Updated',
              message: `${statusMessages[status]}: "${comment.content.substring(0, 50)}${comment.content.length > 50 ? '...' : ''}"`,
              actionUrl: `/projects/${comment.post.slug}`,
              actionLabel: 'View Post',
            },
          });
        } catch (notifError) {
          console.error('[ADMIN COMMENTS API] Notification error (non-blocking):', notifError);
        }
      }
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: comment,
      message: 'Comment updated successfully',
    });
  } catch (error: any) {
    console.error('[ADMIN COMMENTS API] Update comment error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to update comment' },
      { status: 500 }
    );
  }
}

// DELETE - Delete comment
export async function DELETE(
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

    await prisma.comment.delete({
      where: { id: commentId },
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Comment deleted successfully',
    });
  } catch (error: any) {
    console.error('[ADMIN COMMENTS API] Delete comment error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to delete comment' },
      { status: 500 }
    );
  }
}
