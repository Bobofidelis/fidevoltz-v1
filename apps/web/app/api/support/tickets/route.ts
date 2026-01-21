import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { ApiResponse } from '@fidevoltz/types';

// GET - Get user's own tickets
export async function GET() {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const tickets = await prisma.supportTicket.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
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

    return NextResponse.json<ApiResponse>({
      success: true,
      data: tickets,
    });
  } catch (error: any) {
    console.error('[SUPPORT API] Get tickets error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to fetch tickets' },
      { status: 500 }
    );
  }
}

// POST - Create new ticket
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { subject, description, priority } = body;

    // Validation
    if (!subject || subject.trim().length < 5) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Subject must be at least 5 characters' },
        { status: 400 }
      );
    }

    if (!description || description.trim().length < 10) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Description must be at least 10 characters' },
        { status: 400 }
      );
    }

    // Create ticket
    const ticket = await prisma.supportTicket.create({
      data: {
        userId: session.user.id,
        userEmail: session.user.email,
        subject: subject.trim(),
        description: description.trim(),
        priority: priority || 'MEDIUM',
        status: 'OPEN',
      },
      include: {
        messages: true,
        assignedAdmin: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Notify all admins about new ticket
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true },
    });

    await prisma.notification.createMany({
      data: admins.map((admin) => ({
        userId: admin.id,
        type: 'SYSTEM',
        title: 'New Support Ticket',
        message: `${session.user.name || session.user.email} created a new ${priority} priority ticket: ${subject.substring(0, 50)}${subject.length > 50 ? '...' : ''}`,
        actionUrl: `/dashboard/support`,
        actionLabel: 'View Ticket',
      })),
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: ticket,
      message: 'Ticket created successfully',
    });
  } catch (error: any) {
    console.error('[SUPPORT API] Create ticket error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to create ticket' },
      { status: 500 }
    );
  }
}
