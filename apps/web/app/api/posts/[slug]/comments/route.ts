import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { ApiResponse } from '@fidevoltz/types';

// GET - Get approved comments for a post (public)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Get post by slug
    const post = await prisma.projectPost.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!post) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Post not found' },
        { status: 404 }
      );
    }

    // Get approved comments only (for public viewing)
    // Fetch with recursive replies
    const comments = await prisma.comment.findMany({
      where: {
        postId: post.id,
        status: 'APPROVED',
        parentId: null, // Only get top-level comments
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        replies: {
          where: {
            status: 'APPROVED',
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
            replies: {
              where: {
                status: 'APPROVED',
              },
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    avatar: true,
                  },
                },
                replies: {
                  where: {
                    status: 'APPROVED',
                  },
                  include: {
                    user: {
                      select: {
                        id: true,
                        name: true,
                        avatar: true,
                      },
                    },
                    replies: {
                      where: {
                        status: 'APPROVED',
                      },
                      include: {
                        user: {
                          select: {
                            id: true,
                            name: true,
                            avatar: true,
                          },
                        },
                        replies: {
                          where: {
                            status: 'APPROVED',
                          },
                          include: {
                            user: {
                              select: {
                                id: true,
                                name: true,
                                avatar: true,
                              },
                            },
                          },
                          orderBy: {
                            createdAt: 'asc',
                          },
                        },
                      },
                      orderBy: {
                        createdAt: 'asc',
                      },
                    },
                  },
                  orderBy: {
                    createdAt: 'asc',
                  },
                },
              },
              orderBy: {
                createdAt: 'asc',
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: comments,
    });
  } catch (error: any) {
    console.error('[POST COMMENTS API] Get comments error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

// POST - Create new comment (authenticated users only)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'You must be logged in to comment' },
        { status: 401 }
      );
    }

    const { slug } = await params;
    const body = await request.json();
    const { content, parentId } = body;

    // Validation
    if (!content || content.trim().length < 3) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Comment must be at least 3 characters' },
        { status: 400 }
      );
    }

    // Get post by slug
    const post = await prisma.projectPost.findUnique({
      where: { slug },
      select: { id: true, title: true },
    });

    if (!post) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Post not found' },
        { status: 404 }
      );
    }

    // Create comment (auto-approve for admins, pending for users)
    const isAdmin = session.user.role === 'ADMIN';
    
    const comment = await prisma.comment.create({
      data: {
        userId: session.user.id,
        postId: post.id,
        content: content.trim(),
        parentId: parentId || null,
        status: isAdmin ? 'APPROVED' : 'PENDING', // Auto-approve admin comments
        isAdmin: isAdmin, // Mark as admin comment
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    // Notify admins about new comment (only if from regular user)
    if (!isAdmin) {
      try {
        const admins = await prisma.user.findMany({
          where: { role: 'ADMIN' },
          select: { id: true },
        });

        await prisma.notification.createMany({
          data: admins.map((admin) => ({
            userId: admin.id,
            type: 'SYSTEM',
            title: 'New Comment Pending Approval',
            message: `${session.user.name || session.user.email} commented on "${post.title.substring(0, 40)}${post.title.length > 40 ? '...' : ''}"`,
            actionUrl: `/dashboard/comments`,
            actionLabel: 'Review Comment',
          })),
        });
      } catch (notifError) {
        console.error('[POST COMMENTS API] Notification error (non-blocking):', notifError);
      }
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: comment,
      message: isAdmin 
        ? 'Comment posted successfully!' 
        : 'Comment submitted successfully! It will appear after admin approval.',
    });
  } catch (error: any) {
    console.error('[POST COMMENTS API] Create comment error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to create comment' },
      { status: 500 }
    );
  }
}
