import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { ApiResponse } from '@fidevoltz/types';

// POST - Add placement to advertisement
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { page, zone, position } = body;

    // Validation
    if (!page || !zone) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Page and zone are required' },
        { status: 400 }
      );
    }

    const placement = await prisma.adPlacement.create({
      data: {
        advertisementId: id,
        page,
        zone,
        position: position || 0,
      },
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: placement,
      message: 'Placement added successfully',
    });
  } catch (error: any) {
    console.error('[ADMIN ADS API] Add placement error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to add placement' },
      { status: 500 }
    );
  }
}
