import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { ApiResponse } from '@fidevoltz/types';

// GET - Get current user's reviews
export async function GET() {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get all reviews by current user
    const reviews = await prisma.review.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            image: true,
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

    return NextResponse.json<ApiResponse>({
      success: true,
      data: reviews,
    });
  } catch (error: any) {
    console.error('[USER REVIEWS API] Get reviews error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}
