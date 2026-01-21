import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { ApiResponse } from '@fidevoltz/types';

// PATCH - Update ticket (status, priority, assign)
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

    const { id: ticketId } = await params;
    const body = await request.json();
    const { status, priority, assignedTo } = body;

    const updateData: any = {};
    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    if (assignedTo !== undefined) updateData.assignedTo = assignedTo || null;
    if (status === 'CLOSED') updateData.closedAt = new Date();

    const ticket = await prisma.supportTicket.update({
      where: { id: ticketId },
      data: updateData,
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
        },
        assignedAdmin: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Notify user about status change
    if (status && ticket.userId) {
      const statusMessages: Record<string, string> = {
        OPEN: 'Your support ticket has been reopened',
        IN_PROGRESS: 'Your support ticket is now being worked on',
        RESOLVED: 'Your support ticket has been resolved',
        CLOSED: 'Your support ticket has been closed',
      };

      await prisma.notification.create({
        data: {
          userId: ticket.userId,
          type: 'SYSTEM',
          title: 'Ticket Status Updated',
          message: `${statusMessages[status] || 'Your ticket status was updated'}: "${ticket.subject.substring(0, 50)}${ticket.subject.length > 50 ? '...' : ''}"`,
          actionUrl: `/dashboard/my-tickets`,
          actionLabel: 'View Ticket',
        },
      });
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: ticket,
      message: 'Ticket updated successfully',
    });
  } catch (error: any) {
    console.error('[ADMIN SUPPORT API] Update ticket error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to update ticket' },
      { status: 500 }
    );
  }
}

// DELETE - Delete ticket
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

    const { id: ticketId } = await params;

    await prisma.supportTicket.delete({
      where: { id: ticketId },
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Ticket deleted successfully',
    });
  } catch (error: any) {
    console.error('[ADMIN SUPPORT API] Delete ticket error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to delete ticket' },
      { status: 500 }
    );
  }
}
