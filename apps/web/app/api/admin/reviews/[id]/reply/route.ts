import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { ApiResponse } from '@fidevoltz/types';

// POST - Add admin reply to review
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('[REVIEW REPLY API] POST request received');
    const session = await auth();
    console.log('[REVIEW REPLY API] Session:', session ? 'EXISTS' : 'NULL');
    console.log('[REVIEW REPLY API] User role:', session?.user?.role);

    if (!session || !session.user || session.user.role !== 'ADMIN') {
      console.error('[REVIEW REPLY API] Unauthorized');
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: reviewId } = await params;
    console.log('[REVIEW REPLY API] Review ID:', reviewId);
    
    const body = await request.json();
    console.log('[REVIEW REPLY API] Request body:', body);
    const { reply } = body;

    // Validation
    if (!reply || reply.trim().length < 5) {
      console.error('[REVIEW REPLY API] Reply too short or missing');
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Reply must be at least 5 characters' },
        { status: 400 }
      );
    }

    console.log('[REVIEW REPLY API] Updating review with reply...');
    // Update review with admin reply
    const review = await prisma.review.update({
      where: { id: reviewId },
      data: {
        adminReply: reply.trim(),
        repliedAt: new Date(),
        repliedBy: session.user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
          },
        },
        adminUser: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    console.log('[REVIEW REPLY API] Reply added successfully');

    return NextResponse.json<ApiResponse>({
      success: true,
      data: review,
      message: 'Reply added successfully',
    });
  } catch (error: any) {
    console.error('[REVIEW REPLY API] Add reply error:', error);
    console.error('[REVIEW REPLY API] Error message:', error.message);
    console.error('[REVIEW REPLY API] Error stack:', error.stack);
    return NextResponse.json<ApiResponse>(
      { success: false, error: error.message || 'Failed to add reply' },
      { status: 500 }
    );
  }
}
