import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { ApiResponse } from '@fidevoltz/types';

export async function GET() {
  try {
    const categories = await prisma.projectPost.findMany({
      select: { category: true },
      distinct: ['category'],
      where: {
        category: {
          not: ''
        }
      }
    });

    const uniqueCategories = categories.map(c => c.category);

    return NextResponse.json<ApiResponse<string[]>>(
      {
        success: true,
        data: uniqueCategories,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Get categories error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'An error occurred while fetching categories' },
      { status: 500 }
    );
  }
}
