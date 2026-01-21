import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { ApiResponse } from '@fidevoltz/types';
import { OrderStatus } from '@prisma/client';

// PATCH - Update order status (Admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('[API] Update order status - START');
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

    if (session.user.role !== 'ADMIN') {
      console.log('[API] Not admin - returning 403');
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { status, note } = body;
    console.log('[API] Request body:', { status, note });

    if (!status || !Object.values(OrderStatus).includes(status)) {
      console.log('[API] Invalid status - returning 400');
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Invalid status' },
        { status: 400 }
      );
    }

    console.log('[API] Updating order in database...');
    // Update order status
    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });
    console.log('[API] Order updated successfully');

    console.log('[API] Creating history entry...');
    console.log('[API] User ID from session:', session.user.id);
    
    // Verify user exists before creating history
    const userExists = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true },
    });
    
    console.log('[API] User exists in database:', !!userExists);
    
    // Create status history entry - changedBy is optional, so we can skip it if user doesn't exist
    await prisma.orderHistory.create({
      data: {
        orderId: id,
        status,
        changedBy: userExists ? session.user.id : null,
        note: note || `Status changed to ${status}${userExists ? '' : ' (by ' + session.user.email + ')'}`,
      },
    });
    console.log('[API] History created successfully');

    console.log('[API] Creating notification...');
    // Create notification for user
    await prisma.notification.create({
      data: {
        type: 'ORDER',
        title: `Order status updated to ${status}`,
        message: `Your order status has been updated to ${status}${note ? ': ' + note : ''}`,
        userId: order.userId,
        actionUrl: `/dashboard/orders/${id}`,
        actionLabel: 'View Order',
        priority: status === 'CANCELLED' ? 'high' : 'normal',
        metadata: {
          orderId: id,
          status,
          orderNumber: order.id.substring(0, 8),
        },
        sentBy: session.user.id,
      },
    });
    console.log('[API] Notification created successfully');

    console.log('[API] Returning success response');
    return NextResponse.json<ApiResponse>({
      success: true,
      data: order,
      message: 'Order status updated successfully',
    });
  } catch (error: any) {
    console.error('[API] ERROR:', error);
    console.error('[API] Error message:', error.message);
    console.error('[API] Error stack:', error.stack);
    return NextResponse.json<ApiResponse>(
      { success: false, error: error.message || 'Failed to update order status' },
      { status: 500 }
    );
  }
}
