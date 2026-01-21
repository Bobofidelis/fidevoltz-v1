import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { ApiResponse } from '@fidevoltz/types';

// GET - Get all contact submissions (admin only)
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
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build where clause
    const where: any = {};
    
    if (type && type !== 'ALL') {
      where.type = type;
    }
    
    if (status && status !== 'ALL') {
      where.status = status;
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { subject: { contains: search, mode: 'insensitive' } },
        { message: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get total count
    const total = await prisma.contactSubmission.count({ where });

    // Get submissions
    const submissions = await prisma.contactSubmission.findMany({
      where,
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Get statistics
    const stats = {
      total: await prisma.contactSubmission.count(),
      new: await prisma.contactSubmission.count({ where: { status: 'NEW' } }),
      inProgress: await prisma.contactSubmission.count({ where: { status: 'IN_PROGRESS' } }),
      resolved: await prisma.contactSubmission.count({ where: { status: 'RESOLVED' } }),
      archived: await prisma.contactSubmission.count({ where: { status: 'ARCHIVED' } }),
      general: await prisma.contactSubmission.count({ where: { type: 'GENERAL' } }),
      service: await prisma.contactSubmission.count({ where: { type: 'SERVICE' } }),
      partnership: await prisma.contactSubmission.count({ where: { type: 'PARTNERSHIP' } }),
    };

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        submissions,
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
    console.error('[ADMIN CONTACT SUBMISSIONS API] Get submissions error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to fetch contact submissions' },
      { status: 500 }
    );
  }
}
