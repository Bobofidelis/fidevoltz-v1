import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { ApiResponse, Comment, CreateCommentDto } from '@fidevoltz/types';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body: CreateCommentDto = await request.json();
    const { content, postId, parentId } = body;

    if (!content || !postId) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Content and postId are required' },
        { status: 400 }
      );
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        userId: session.user.id,
        postId,
        parentId: parentId || null,
        isAdmin: session.user.role === 'ADMIN',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    return NextResponse.json<ApiResponse<Comment>>(
      {
        success: true,
        data: comment as Comment,
        message: 'Comment created successfully',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create comment error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'An error occurred while creating comment' },
      { status: 500 }
    );
  }
}
