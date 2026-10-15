import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { ApiResponse } from '@fidevoltz/types';

// GET - Get tracking information for an order
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        history: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            status: true,
            note: true,
            createdAt: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                name: true,
                image: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        id: order.id,
        status: order.status,
        trackingNumber: order.trackingNumber,
        carrier: order.carrier,
        estimatedDelivery: order.estimatedDelivery,
        actualDelivery: order.actualDelivery,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        history: order.history,
        items: order.items,
      },
    });
  } catch (error: any) {
    console.error('Get tracking error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to fetch tracking information' },
      { status: 500 }
    );
  }
}

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
