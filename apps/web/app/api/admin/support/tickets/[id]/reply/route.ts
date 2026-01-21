import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { ApiResponse } from '@fidevoltz/types';

// POST - Admin reply to ticket
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('[ADMIN SUPPORT REPLY] Starting reply process');
    const session = await auth();
    console.log('[ADMIN SUPPORT REPLY] Session:', !!session, 'Role:', session?.user?.role);

    if (!session || !session.user || session.user.role !== 'ADMIN') {
      console.log('[ADMIN SUPPORT REPLY] Unauthorized');
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const { id: ticketId } = await params;
    console.log('[ADMIN SUPPORT REPLY] Ticket ID:', ticketId);
    
    const body = await request.json();
    const { message } = body;
    console.log('[ADMIN SUPPORT REPLY] Message length:', message?.length);

    // Validation
    if (!message || message.trim().length < 5) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Message must be at least 5 characters' },
        { status: 400 }
      );
    }

    // Check if ticket exists
    const ticket = await prisma.supportTicket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      console.log('[ADMIN SUPPORT REPLY] Ticket not found');
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Ticket not found' },
        { status: 404 }
      );
    }

    console.log('[ADMIN SUPPORT REPLY] Creating ticket message');
    // Create message
    const ticketMessage = await prisma.ticketMessage.create({
      data: {
        ticketId,
        userId: session.user.id,
        message: message.trim(),
        isAdmin: true,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Update ticket updatedAt
    await prisma.supportTicket.update({
      where: { id: ticketId },
      data: { updatedAt: new Date() },
    });

    // Send notification to ticket owner
    try {
      if (ticket.userId) {
        await prisma.notification.create({
          data: {
            userId: ticket.userId,
            type: 'SYSTEM',
            title: 'Admin Replied to Your Ticket',
            message: `An admin replied to your ticket: "${ticket.subject.substring(0, 50)}${ticket.subject.length > 50 ? '...' : ''}"`,
            actionUrl: `/dashboard/my-tickets`,
            actionLabel: 'View Ticket',
          },
        });
      }
    } catch (notifError) {
      console.error('[ADMIN SUPPORT REPLY] Notification error (non-blocking):', notifError);
    }

    console.log('[ADMIN SUPPORT REPLY] Success');
    return NextResponse.json<ApiResponse>({
      success: true,
      data: ticketMessage,
      message: 'Reply added successfully',
    });
  } catch (error: any) {
    console.error('[ADMIN SUPPORT REPLY] Error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to add reply' },
      { status: 500 }
    );
  }
}
