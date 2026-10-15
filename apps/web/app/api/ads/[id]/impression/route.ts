import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { ApiResponse } from '@fidevoltz/types';

// POST - Track ad impression (public)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Ad ID is required' },
        { status: 400 }
      );
    }

    await prisma.advertisement.update({
      where: { id },
      data: {
        impressions: { increment: 1 },
      },
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Impression tracked',
    });
  } catch (error: any) {
    console.error('[ADS API] Track impression error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to track impression' },
      { status: 500 }
    );
  }
}
