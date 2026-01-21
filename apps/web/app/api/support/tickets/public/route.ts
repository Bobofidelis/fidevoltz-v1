import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { ApiResponse } from '@fidevoltz/types';

// POST - Create ticket for non-logged users (public)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userEmail, subject, description, priority } = body;

    // Validation
    if (!userEmail || !userEmail.includes('@')) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Valid email is required' },
        { status: 400 }
      );
    }

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

    // Create ticket without userId (for non-logged users)
    const ticket = await prisma.supportTicket.create({
      data: {
        userEmail: userEmail.trim(),
        subject: subject.trim(),
        description: description.trim(),
        priority: priority || 'MEDIUM',
        status: 'OPEN',
      },
    });

    // Notify all admins about new ticket from guest
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true },
    });

    await prisma.notification.createMany({
      data: admins.map((admin) => ({
        userId: admin.id,
        type: 'SYSTEM',
        title: 'New Support Ticket (Guest)',
        message: `Guest user (${userEmail}) created a ${priority} priority ticket: ${subject.substring(0, 50)}${subject.length > 50 ? '...' : ''}`,
        actionUrl: `/dashboard/support`,
        actionLabel: 'View Ticket',
      })),
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: ticket,
      message: 'Ticket created successfully. We will contact you via email.',
    });
  } catch (error: any) {
    console.error('[PUBLIC SUPPORT API] Create ticket error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to create ticket' },
      { status: 500 }
    );
  }
}
