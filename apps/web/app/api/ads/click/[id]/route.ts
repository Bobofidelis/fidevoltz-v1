import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { ApiResponse } from '@fidevoltz/types';

// POST - Track ad click (public)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.advertisement.update({
      where: { id },
      data: {
        clicks: { increment: 1 },
      },
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Click tracked',
    });
  } catch (error: any) {
    console.error('[PUBLIC ADS API] Track click error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to track click' },
      { status: 500 }
    );
  }
}
