import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { ApiResponse, Product, PaginatedResponse } from '@fidevoltz/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const categoryId = searchParams.get('categoryId') || '';

    const skip = (page - 1) * limit;

    const where = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { description: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
      ...(categoryId && { categoryId }),
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json<ApiResponse<PaginatedResponse<Product>>>(
      {
        success: true,
        data: {
          data: products as any,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Get products error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'An error occurred while fetching products' },
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

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, description, price, stock, minStock, sku, image, categoryId } = body;

    if (!name || !description || price === undefined || stock === undefined || !categoryId) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price,
        stock,
        minStock: minStock || 0,
        sku,
        image,
        categoryId,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json<ApiResponse<Product>>(
      {
        success: true,
        data: product as any,
        message: 'Product created successfully',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create product error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'An error occurred while creating product' },
      { status: 500 }
    );
  }
}
