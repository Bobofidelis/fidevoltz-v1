import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { ApiResponse } from '@fidevoltz/types';

// GET - Fetch messages for an order
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session || !session.user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user owns the order or is admin
    const order = await prisma.order.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!order) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    if (order.userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    const messages = await prisma.orderMessage.findMany({
      where: { orderId: id },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: messages,
    });
  } catch (error: any) {
    console.error('Get order messages error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

// POST - Send a message
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('[API] Send message - START');
    const session = await auth();
    const { id } = await params;
    console.log('[API] Order ID:', id);
    console.log('[API] Session:', session?.user);

    if (!session || !session.user) {
      console.log('[API] No session - returning 401');
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { message } = body;
    console.log('[API] Message:', message);

    if (!message || message.trim().length === 0) {
      console.log('[API] Empty message - returning 400');
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Message is required' },
        { status: 400 }
      );
    }

    console.log('[API] Checking order ownership...');
    // Check if user owns the order or is admin
    const order = await prisma.order.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!order) {
      console.log('[API] Order not found - returning 404');
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    if (order.userId !== session.user.id && session.user.role !== 'ADMIN') {
      console.log('[API] Not authorized - returning 403');
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    console.log('[API] Creating message...');
    console.log('[API] Sender ID from session:', session.user.id);
    
    // Verify sender exists in database
    const senderExists = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, email: true },
    });
    
    console.log('[API] Sender exists in database:', !!senderExists);
    
    if (!senderExists) {
      console.error('[API] Sender not found in database!');
      console.error('[API] Session user:', session.user);
      return NextResponse.json<ApiResponse>(
        { 
          success: false, 
          error: 'User account not found. Please logout and login again.' 
        },
        { status: 400 }
      );
    }
    
    const newMessage = await prisma.orderMessage.create({
      data: {
        orderId: id,
        senderId: session.user.id,
        message: message.trim(),
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            role: true,
          },
        },
      },
    });
    console.log('[API] Message created successfully');

    console.log('[API] Creating notification...');
    // Create notification for the other party
    const recipientId = session.user.role === 'ADMIN' ? order.userId : null;
    if (recipientId) {
      await prisma.notification.create({
        data: {
          type: 'MESSAGE',
          title: 'New message on your order',
          message: `${session.user.name || session.user.email} sent you a message: "${message.trim().substring(0, 100)}${message.length > 100 ? '...' : ''}"`,
          userId: recipientId,
          actionUrl: `/dashboard/orders/${id}?tab=messages`,
          actionLabel: 'View Message',
          priority: 'normal',
          metadata: {
            orderId: id,
            messageId: newMessage.id,
          },
          sentBy: session.user.id,
        },
      });
      console.log('[API] Notification created successfully');
    } else {
      console.log('[API] No recipient for notification (user messaging admin)');
    }

    console.log('[API] Returning success response');
    return NextResponse.json<ApiResponse>({
      success: true,
      data: newMessage,
      message: 'Message sent successfully',
    });
  } catch (error: any) {
    console.error('[API] ERROR:', error);
    console.error('[API] Error message:', error.message);
    console.error('[API] Error stack:', error.stack);
    return NextResponse.json<ApiResponse>(
      { success: false, error: error.message || 'Failed to send message' },
      { status: 500 }
    );
  }
}
