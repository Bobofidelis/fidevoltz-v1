import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { ApiResponse, Cart, AddToCartDto } from '@fidevoltz/types';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    let cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                image: true,
                stock: true,
              },
            },
          },
        },
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: session.user.id },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                  image: true,
                  stock: true,
                },
              },
            },
          },
        },
      });
    }

    return NextResponse.json<ApiResponse<Cart>>(
      { success: true, data: cart as any },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Get cart error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'An error occurred while fetching cart' },
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

    const body: AddToCartDto = await request.json();
    const { productId, quantity } = body;

    if (!productId || !quantity || quantity < 1) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Invalid product or quantity' },
        { status: 400 }
      );
    }

    let cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: session.user.id },
      });
    }

    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId,
      },
    });

    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
        },
      });
    }

    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                image: true,
                stock: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json<ApiResponse<Cart>>(
      {
        success: true,
        data: updatedCart as any,
        message: 'Item added to cart',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Add to cart error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'An error occurred while adding to cart' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
    });

    if (cart) {
      await prisma.cartItem.deleteMany({
        where: { cartId: cart.id },
      });
    }

    return NextResponse.json<ApiResponse>(
      { success: true, message: 'Cart cleared' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Clear cart error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'An error occurred while clearing cart' },
      { status: 500 }
    );
  }
}
