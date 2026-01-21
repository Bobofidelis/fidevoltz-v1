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

    if (!session || !session.user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

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

    // Users can only view their own orders, admins can view any
    if (order.userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
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
