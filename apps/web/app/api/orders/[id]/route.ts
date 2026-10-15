import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { ApiResponse, Order } from '@fidevoltz/types';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
                image: true,
                description: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
          },
        },
        notes: {
          include: {
            user: {
              select: {
                name: true,
                role: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        history: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!order) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    const isOwnerOrAdmin = session?.user && (session.user.role === 'ADMIN' || session.user.id === order.userId);

    if (!isOwnerOrAdmin) {
      // Return sanitized order data for public tracking
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
          items: order.items.map(item => ({
            id: item.id,
            productId: item.productId,
            quantity: item.quantity,
            price: Number(item.price),
            product: item.product,
          })),
          history: order.history.map(h => ({
            id: h.id,
            status: h.status,
            createdAt: h.createdAt,
            note: h.note,
          })),
          totalAmount: Number(order.totalAmount),
        } as any,
      });
    }

    return NextResponse.json<ApiResponse<Order>>(
      { success: true, data: order as any },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Get order error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'An error occurred while fetching order' },
      { status: 500 }
    );
  }
}
