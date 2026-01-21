import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { ApiResponse } from '@fidevoltz/types';

// PATCH - Update tracking information (Admin only)
export async function PATCH(
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

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { trackingNumber, carrier, estimatedDelivery } = body;

    const updateData: any = {};
    if (trackingNumber !== undefined) updateData.trackingNumber = trackingNumber;
    if (carrier !== undefined) updateData.carrier = carrier;
    if (estimatedDelivery !== undefined) updateData.estimatedDelivery = new Date(estimatedDelivery);

    const order = await prisma.order.update({
      where: { id },
      data: updateData,
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

    // Create notification for user
    if (trackingNumber) {
      await prisma.notification.create({
        data: {
          type: 'ORDER',
          title: 'Order Tracking Update',
          message: `Tracking information added to your order: ${trackingNumber}`,
          userId: order.userId,
        },
      });
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: order,
      message: 'Tracking information updated successfully',
    });
  } catch (error: any) {
    console.error('Update tracking error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to update tracking information' },
      { status: 500 }
    );
  }
}
