import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { ApiResponse } from '@fidevoltz/types';

// GET - Get all reviews (admin only)
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
    const productId = searchParams.get('productId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Build where clause
    const where: any = {};
    if (status && status !== 'ALL') {
      where.status = status;
    }
    if (productId) {
      where.productId = productId;
    }

    // Get reviews with pagination
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
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
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.review.count({ where }),
    ]);

    // Get statistics
    const stats = {
      total: await prisma.review.count(),
      pending: await prisma.review.count({ where: { status: 'PENDING' } }),
      approved: await prisma.review.count({ where: { status: 'APPROVED' } }),
      rejected: await prisma.review.count({ where: { status: 'REJECTED' } }),
    };

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        reviews,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        stats,
      },
    });
  } catch (error: any) {
    console.error('[ADMIN REVIEWS API] Get reviews error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}
