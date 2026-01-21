import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { ApiResponse, UpdateCartItemDto } from '@fidevoltz/types';

interface RouteParams {
  params: Promise<{
    itemId: string;
  }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { itemId } = await params;
    const body: UpdateCartItemDto = await request.json();
    const { quantity } = body;

    if (!quantity || quantity < 1) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Invalid quantity' },
        { status: 400 }
      );
    }

    await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });

    return NextResponse.json<ApiResponse>(
      { success: true, message: 'Cart item updated' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Update cart item error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'An error occurred while updating cart item' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { itemId } = await params;

    await prisma.cartItem.delete({
      where: { id: itemId },
    });

    return NextResponse.json<ApiResponse>(
      { success: true, message: 'Item removed from cart' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Remove cart item error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'An error occurred while removing cart item' },
      { status: 500 }
    );
  }
}
