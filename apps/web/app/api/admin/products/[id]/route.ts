import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { ProductStatus } from '@prisma/client';

const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  price: z.number().min(0).optional(),
  costPrice: z.number().optional(),
  stock: z.number().int().min(0).optional(),
  minStock: z.number().int().min(0).optional(),
  sku: z.string().optional(),
  images: z.array(z.string()).optional(),
  datasheet: z.string().optional().nullable(),
  specifications: z.record(z.string(), z.any()).optional().nullable(),
  tags: z.array(z.string()).optional(),
  status: z.nativeEnum(ProductStatus).optional(),
  allowReviews: z.boolean().optional(),
  categoryId: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || !session.user || (session.user.role !== 'ADMIN' && session.user.role !== 'EDITOR')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    console.error('Get product error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch product' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || !session.user || (session.user.role !== 'ADMIN' && session.user.role !== 'EDITOR')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const validatedData = updateProductSchema.parse(body);

    // If categoryId is changing, ensure it exists
    if (validatedData.categoryId) {
        const category = await prisma.category.findUnique({
            where: { id: validatedData.categoryId },
        });
        if (!category) {
            return NextResponse.json({ success: false, error: 'Category not found' }, { status: 400 });
        }
    }

    const { specifications, ...rest } = validatedData;
    const updateData: any = { ...rest };
    if (specifications !== undefined) {
      updateData.specifications = specifications || undefined;
    }
    // Maintain backward compatibility for 'image' field
    if (validatedData.images && validatedData.images.length > 0) {
      updateData.image = validatedData.images[0];
    }

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, data: product });
  } catch (error: any) {
    console.error('Update product error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: 'Validation failed', details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    
    // Check if product exists
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
       return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    // Instead of hard delete, maybe just archive? 
    // Plan said "add delete", user said "delete". We will hard delete but catch FK errors or use Cascade if configured
    // Schema has Cascade deletes for some relations, but maybe not all.
    // Let's try Delete and handle error.

    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete product' }, { status: 500 });
  }
}
