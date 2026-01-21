import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { ApiResponse } from '@fidevoltz/types';

// POST - Reply to ticket
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  console.log('[SUPPORT API] ========== ROUTE HIT ==========');
  
  try {
    console.log('[SUPPORT API] Step 1: Getting session');
    const session = await auth();
    
    if (!session || !session.user) {
      console.log('[SUPPORT API] No session');
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    console.log('[SUPPORT API] Step 2: Getting params');
    const resolvedParams = await context.params;
    const ticketId = resolvedParams.id;
    console.log('[SUPPORT API] Ticket ID:', ticketId);
    
    console.log('[SUPPORT API] Step 3: Parsing request body');
    const body = await request.json();
    const { message } = body;
    console.log('[SUPPORT API] Message:', message);
    
    if (!message || message.trim().length < 5) {
      console.log('[SUPPORT API] Message too short');
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Message must be at least 5 characters' },
        { status: 400 }
      );
    }
    
    console.log('[SUPPORT API] Step 4: Looking up ticket');
    const ticket = await prisma.supportTicket.findUnique({
      where: { id: ticketId },
    });
    
    if (!ticket) {
      console.log('[SUPPORT API] Ticket not found');
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Ticket not found' },
        { status: 404 }
      );
    }
    
    console.log('[SUPPORT API] Step 5: Checking permissions');
    if (ticket.userId !== session.user.id && session.user.role !== 'ADMIN') {
      console.log('[SUPPORT API] Unauthorized access');
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }
    
    console.log('[SUPPORT API] Step 6: Verifying user exists in database');
    console.log('[SUPPORT API] Session user ID:', session.user.id);
    console.log('[SUPPORT API] Session user email:', session.user.email);
    
    // Verify the user exists in the database
    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, email: true, name: true, role: true }
    });
    
    if (!dbUser) {
      console.error('[SUPPORT API] User from session not found in database!');
      console.error('[SUPPORT API] Session user ID:', session.user.id);
      
      // Try to find user by email instead
      const userByEmail = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true, email: true, name: true, role: true }
      });
      
      if (userByEmail) {
        console.log('[SUPPORT API] Found user by email:', userByEmail.id);
        console.log('[SUPPORT API] Session has stale user ID - using database user ID');
        // Use the database user ID instead
        session.user.id = userByEmail.id;
      } else {
        console.error('[SUPPORT API] User not found by email either');
        return NextResponse.json<ApiResponse>(
          { success: false, error: 'User not found in database. Please log out and log in again.' },
          { status: 401 }
        );
      }
    } else {
      console.log('[SUPPORT API] User verified in database:', dbUser.id);
    }
    
    console.log('[SUPPORT API] Step 7: Creating ticket message');
    const ticketMessage = await prisma.ticketMessage.create({
      data: {
        ticketId,
        userId: session.user.id,
        message: message.trim(),
        isAdmin: session.user.role === 'ADMIN',
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
    console.log('[SUPPORT API] Message created:', ticketMessage.id);
    
    console.log('[SUPPORT API] Step 8: Updating ticket timestamp');
    await prisma.supportTicket.update({
      where: { id: ticketId },
      data: { updatedAt: new Date() },
    });
    
    console.log('[SUPPORT API] Step 9: Sending notifications');
    try {
      if (session.user.role === 'ADMIN') {
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
      } else {
        const admins = await prisma.user.findMany({
          where: { role: 'ADMIN' },
          select: { id: true },
        });
        
        await prisma.notification.createMany({
          data: admins.map((admin) => ({
            userId: admin.id,
            type: 'SYSTEM' as const,
            title: 'New Reply on Support Ticket',
            message: `${session.user.name || session.user.email} replied to ticket: "${ticket.subject.substring(0, 50)}${ticket.subject.length > 50 ? '...' : ''}"`,
            actionUrl: `/dashboard/support`,
            actionLabel: 'View Ticket',
          })),
        });
      }
    } catch (notifError) {
      console.error('[SUPPORT API] Notification error (non-blocking):', notifError);
    }
    
    console.log('[SUPPORT API] ========== SUCCESS ==========');
    return NextResponse.json<ApiResponse>({
      success: true,
      data: ticketMessage,
      message: 'Reply added successfully',
    });
  } catch (error: any) {
    console.error('[SUPPORT API] ========== ERROR ==========');
    console.error('[SUPPORT API] Error name:', error?.name);
    console.error('[SUPPORT API] Error message:', error?.message);
    console.error('[SUPPORT API] Error stack:', error?.stack);
    
    return NextResponse.json<ApiResponse>(
      { success: false, error: error?.message || 'Failed to add reply' },
      { status: 500 }
    );
  }
}
