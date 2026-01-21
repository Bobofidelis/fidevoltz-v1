import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { ApiResponse } from '@fidevoltz/types';

// GET - Get all approved reviews for a product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;

    // Get approved reviews
    const reviews = await prisma.review.findMany({
      where: {
        productId,
        status: 'APPROVED',
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
        adminUser: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calculate statistics
    const stats = {
      averageRating: reviews.length > 0
        ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
        : 0,
      totalReviews: reviews.length,
      ratingDistribution: {
        5: reviews.filter(r => r.rating === 5).length,
        4: reviews.filter(r => r.rating === 4).length,
        3: reviews.filter(r => r.rating === 3).length,
        2: reviews.filter(r => r.rating === 2).length,
        1: reviews.filter(r => r.rating === 1).length,
      },
    };

    return NextResponse.json<ApiResponse>({
      success: true,
      data: { reviews, stats },
    });
  } catch (error: any) {
    console.error('[REVIEWS API] Get reviews error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

// POST - Submit a new review
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: productId } = await params;
    const body = await request.json();
    const { rating, title, comment } = body;

    // Validation
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    if (!comment || comment.trim().length < 10) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Comment must be at least 10 characters' },
        { status: 400 }
      );
    }

    // Check if user already reviewed this product
    const existingReview = await prisma.review.findFirst({
      where: {
        productId,
        userId: session.user.id,
      },
    });

    if (existingReview) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'You have already reviewed this product' },
        { status: 400 }
      );
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        productId,
        userId: session.user.id,
        rating,
        title: title || null,
        comment: comment.trim(),
        status: 'PENDING', // Reviews start as pending
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

    return NextResponse.json<ApiResponse>({
      success: true,
      data: review,
      message: 'Review submitted successfully. It will be visible after admin approval.',
    });
  } catch (error: any) {
    console.error('[REVIEWS API] Create review error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to submit review' },
      { status: 500 }
    );
  }
}
