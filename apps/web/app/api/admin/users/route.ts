import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { ApiResponse } from '@fidevoltz/types';
import { Role } from '@prisma/client';

// GET - Fetch all users with filters (Admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') as Role | null;
    const status = searchParams.get('status') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role) where.role = role;
    if (status) where.status = status;

    // Fetch users with stats
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          status: true,
          avatar: true,
          createdAt: true,
          lastLoginAt: true,
          loginCount: true,
          _count: {
            select: {
              orders: true,
              activities: true,
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    // Get stats
    const stats = await prisma.user.groupBy({
      by: ['role', 'status'],
      _count: true,
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        users,
        total,
        page,
        totalPages: Math.ceil(total / limit),
        stats,
      },
    });
  } catch (error: any) {
    console.error('[API] Get users error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
