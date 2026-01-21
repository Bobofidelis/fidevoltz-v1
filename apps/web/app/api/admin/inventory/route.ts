import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ProductStatus } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user || (session.user.role !== 'ADMIN' && session.user.role !== 'EDITOR')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const lowStock = searchParams.get('lowStock') === 'true';
    const search = searchParams.get('search') || '';

    const where: any = {
      status: { not: ProductStatus.ARCHIVED }
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (lowStock) {
      // Prisma doesn't support direct field comparison in where easily without raw query
      // For simplicity/safety, we will fetch active products and filter in memory if creating complex logic,
      // OR specifically filter where stock <= minStock
      // BUT Prisma `where` clause can't do `stock: { lte: prisma.product.fields.minStock }` directly yet in standard API.
      // So we will fetch all active and filter, or just rely on a reasonable fixed threshold if possible?
      // No, user wants real comparison.
      // Let's use Raw Query for low stock or just filter in JS for now if dataset isn't huge.
      // Given it's "real data", let's assume it could be large. But raw query is safer.
      
      const products = await prisma.$queryRaw`
        SELECT * FROM "Product"
        WHERE "status" != 'ARCHIVED'
        AND "stock" <= "minStock"
        AND ("name" ILIKE ${'%' + search + '%'} OR "sku" ILIKE ${'%' + search + '%'})
        ORDER BY "stock" ASC
      `;
      
      return NextResponse.json({ success: true, data: products });
    }

    // Standard inventory list
    const products = await prisma.product.findMany({
      where,
      select: {
        id: true,
        name: true,
        sku: true,
        stock: true,
        minStock: true,
        price: true,
        costPrice: true,
        status: true,
        image: true,
        images: true,
        updatedAt: true,
      },
      orderBy: { stock: 'asc' },
    });

    return NextResponse.json({ success: true, data: products });
  } catch (error) {
    console.error('Get inventory error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch inventory' }, { status: 500 });
  }
}
