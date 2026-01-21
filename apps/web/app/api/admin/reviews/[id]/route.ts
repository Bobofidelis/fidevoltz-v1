import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { ApiResponse } from '@fidevoltz/types';

// PATCH - Update review status (approve/reject)
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

    const { id: reviewId } = await params;
    const body = await request.json();
    const { status } = body;

    // Validation
    if (!['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Invalid status' },
        { status: 400 }
      );
    }

    // Update review
    const review = await prisma.review.update({
      where: { id: reviewId },
      data: { status },
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
      },
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: review,
      message: `Review ${status.toLowerCase()} successfully`,
    });
  } catch (error: any) {
    console.error('[ADMIN REVIEWS API] Update review error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to update review' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a review
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

    const { id: reviewId } = await params;

    // Delete review
    await prisma.review.delete({
      where: { id: reviewId },
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (error: any) {
    console.error('[ADMIN REVIEWS API] Delete review error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to delete review' },
      { status: 500 }
    );
  }
}
