import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { ApiResponse } from '@fidevoltz/types';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    const comment = await prisma.comment.findUnique({
      where: { id },
    });

    if (!comment) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Comment not found' },
        { status: 404 }
      );
    }

    // Only comment owner or admin can delete
    if (comment.userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    await prisma.comment.delete({
      where: { id },
    });

    return NextResponse.json<ApiResponse>(
      { success: true, message: 'Comment deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Delete comment error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'An error occurred while deleting comment' },
      { status: 500 }
    );
  }
}
