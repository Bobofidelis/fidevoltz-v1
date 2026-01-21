import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { ApiResponse } from '@fidevoltz/types';

// GET - Get all tickets (admin only)
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
    const priority = searchParams.get('priority');
    const assignedTo = searchParams.get('assignedTo');

    // Build where clause
    const where: any = {};
    if (status && status !== 'ALL') {
      where.status = status;
    }
    if (priority && priority !== 'ALL') {
      where.priority = priority;
    }
    if (assignedTo === 'ME') {
      where.assignedTo = session.user.id;
    } else if (assignedTo === 'UNASSIGNED') {
      where.assignedTo = null;
    } else if (assignedTo && assignedTo !== 'ALL') {
      where.assignedTo = assignedTo;
    }

    const tickets = await prisma.supportTicket.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        messages: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
        assignedAdmin: {
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

    // Get statistics
    const stats = {
      total: await prisma.supportTicket.count(),
      open: await prisma.supportTicket.count({ where: { status: 'OPEN' } }),
      inProgress: await prisma.supportTicket.count({ where: { status: 'IN_PROGRESS' } }),
      resolved: await prisma.supportTicket.count({ where: { status: 'RESOLVED' } }),
      closed: await prisma.supportTicket.count({ where: { status: 'CLOSED' } }),
    };

    return NextResponse.json<ApiResponse>({
      success: true,
      data: { tickets, stats },
    });
  } catch (error: any) {
    console.error('[ADMIN SUPPORT API] Get tickets error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to fetch tickets' },
      { status: 500 }
    );
  }
}
