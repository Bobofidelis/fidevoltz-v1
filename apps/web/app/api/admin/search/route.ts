import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';

    if (!query || query.length < 2) {
      return NextResponse.json({ success: true, data: [] });
    }

    // Run searches in parallel
    const [products, projects, users, orders] = await Promise.all([
      // 1. Products
      prisma.product.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { sku: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: 5,
        select: { id: true, name: true, description: true, status: true },
      }),
      // 2. Projects
      prisma.projectPost.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { excerpt: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: 5,
        select: { id: true, title: true, excerpt: true, status: true },
      }),
      // 3. Users
      prisma.user.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: 5,
        select: { id: true, name: true, email: true, role: true },
      }),
      // 4. Orders
      prisma.order.findMany({
        where: {
          OR: [
            { id: { contains: query, mode: 'insensitive' } },
            { stripeSessionId: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: 5,
        select: { id: true, status: true, totalAmount: true },
      }),
    ]);

    // Normalize results for the frontend
    const formattedResults = [
      ...products.map(p => ({
        id: p.id,
        type: 'product',
        title: p.name,
        description: p.description || 'No description',
        category: 'Products',
        url: `/dashboard/products/${p.id}/edit`,
      })),
      ...projects.map(p => ({
        id: p.id,
        type: 'project',
        title: p.title,
        description: p.excerpt || 'No excerpt',
        category: 'Projects',
        url: `/dashboard/projects/${p.id}/edit`,
      })),
      ...users.map(u => ({
        id: u.id,
        type: 'user',
        title: u.name || 'Unknown User',
        description: u.email,
        category: 'Users',
        url: `/dashboard/users`,
      })),
      ...orders.map(o => ({
        id: o.id,
        type: 'order',
        title: `Order #${o.id.substring(0, 8)}`,
        description: `Status: ${o.status} - $${(o.totalAmount || 0).toFixed(2)}`,
        category: 'Orders',
        url: `/dashboard/orders`,
      })),
    ];

    return NextResponse.json({ success: true, data: formattedResults });
  } catch (error: any) {
    console.error('Admin search error:', error);
    return NextResponse.json(
      { success: false, error: 'An error occurred while searching' },
      { status: 500 }
    );
  }
}
