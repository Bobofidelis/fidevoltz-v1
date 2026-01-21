import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { ProductStatus } from '@prisma/client';

const createProductSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.number().min(0, 'Price must be positive'),
  costPrice: z.number().optional(),
  stock: z.number().int().min(0, 'Stock must be non-negative'),
  minStock: z.number().int().min(0).default(0),
  sku: z.string().optional(),
  images: z.array(z.string()).default([]),
  datasheet: z.string().optional().nullable(),
  specifications: z.record(z.string(), z.any()).optional().nullable(),
  tags: z.array(z.string()).default([]),
  status: z.nativeEnum(ProductStatus).default(ProductStatus.DRAFT),
  allowReviews: z.boolean().default(true),
  categoryId: z.string(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user || (session.user.role !== 'ADMIN' && session.user.role !== 'EDITOR')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') as ProductStatus | undefined;
    const categoryId = searchParams.get('categoryId');

    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (status) where.status = status;
    if (categoryId) where.categoryId = categoryId;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { category: true },
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        products,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Get products error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user || (session.user.role !== 'ADMIN' && session.user.role !== 'EDITOR')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createProductSchema.parse(body);

    // Ensure category exists
    const category = await prisma.category.findUnique({
      where: { id: validatedData.categoryId },
    });

    if (!category) {
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 400 });
    }

    const { specifications, ...rest } = validatedData;
    const product = await prisma.product.create({
      data: {
        ...rest,
        specifications: specifications || undefined,
        // Backward compatibility for 'image' field if needed, or just set it to first image
        image: validatedData.images[0] || null,
      },
    });

    return NextResponse.json({ success: true, data: product }, { status: 201 });
  } catch (error: any) {
    console.error('Create product error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: 'Validation failed', details: error.issues }, { status: 400 });
    }
    // Check for unique constraint (SKU)
    if (error.code === 'P2002') {
         return NextResponse.json({ success: false, error: 'SKU must be unique' }, { status: 409 });
    }
    return NextResponse.json({ success: false, error: 'Failed to create product' }, { status: 500 });
  }
}
