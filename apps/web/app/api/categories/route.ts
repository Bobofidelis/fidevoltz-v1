import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { ApiResponse } from '@fidevoltz/types';

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error('[CATEGORIES_PUBLIC_GET]', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal Error' },
      { status: 500 }
    );
  }
}
