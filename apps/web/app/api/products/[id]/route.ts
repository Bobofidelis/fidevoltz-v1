import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { ApiResponse, Product } from '@fidevoltz/types';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });

    if (!product) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse<Product>>(
      { success: true, data: product as any },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Get product error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'An error occurred while fetching product' },
      { status: 500 }
    );
  }
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

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { name, description, price, stock, minStock, sku, image, categoryId } = body;

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price }),
        ...(stock !== undefined && { stock }),
        ...(minStock !== undefined && { minStock }),
        ...(sku !== undefined && { sku }),
        ...(image !== undefined && { image }),
        ...(categoryId !== undefined && { categoryId }),
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json<ApiResponse<Product>>(
      {
        success: true,
        data: updatedProduct as any,
        message: 'Product updated successfully',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Update product error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'An error occurred while updating product' },
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

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    const { id } = await params;

    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json<ApiResponse>(
      { success: true, message: 'Product deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Delete product error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'An error occurred while deleting product' },
      { status: 500 }
    );
  }
}
