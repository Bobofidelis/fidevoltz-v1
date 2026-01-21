import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { ApiResponse, Order, CreateOrderDto, PaginatedResponse } from '@fidevoltz/types';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const skip = (page - 1) * limit;

    // Build where clause based on role
    const where: any = {};
    
    // Non-admin users can only see their own orders
    if (session.user.role !== 'ADMIN') {
      where.userId = session.user.id;
    }

    // Status filter
    if (status) {
      where.status = status;
    }

    // Date range filter
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    // Search by order ID or user email (admin only)
    if (search && session.user.role === 'ADMIN') {
      where.OR = [
        { id: { contains: search, mode: 'insensitive' } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
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
              address: true,
            },
          },
          history: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
          _count: {
            select: {
              messages: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json<ApiResponse<PaginatedResponse<any>>>({
      success: true,
      data: {
        data: orders as any,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error: any) {
    console.error('Get orders error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'An error occurred while fetching orders' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body: CreateOrderDto = await request.json();
    const { items, totalAmount, paymentGateway, shippingAddress } = body;

    if (!items || items.length === 0 || !totalAmount || !paymentGateway) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        totalAmount,
        paymentGateway,
        paymentStatus: 'pending',
        status: 'PENDING',
        shippingAddress,
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
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
      },
    });

    // Clear cart after order
    const cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
    });

    if (cart) {
      await prisma.cartItem.deleteMany({
        where: { cartId: cart.id },
      });
    }

    return NextResponse.json<ApiResponse<Order>>(
      {
        success: true,
        data: order as any,
        message: 'Order created successfully',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create order error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'An error occurred while creating order' },
      { status: 500 }
    );
  }
}
