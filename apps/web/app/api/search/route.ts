import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { ApiResponse } from '@fidevoltz/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const type = searchParams.get('type') || 'all'; // all, products, projects

    if (!query || query.length < 2) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Search query must be at least 2 characters' },
        { status: 400 }
      );
    }

    const results: any = {
      products: [],
      projects: [],
    };

    // Search products
    if (type === 'all' || type === 'products') {
      results.products = await prisma.product.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ],
        },
        include: {
          category: true,
        },
        take: 10,
      });
    }

    // Search projects
    if (type === 'all' || type === 'projects') {
      results.projects = await prisma.projectPost.findMany({
        where: {
          status: 'PUBLISHED',
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { excerpt: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: 10,
      });
    }

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: results,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Search error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'An error occurred while searching' },
      { status: 500 }
    );
  }
}
