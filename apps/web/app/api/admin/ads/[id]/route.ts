import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { ApiResponse } from '@fidevoltz/types';

// GET - Get single advertisement
export async function GET(
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

    const ad = await prisma.advertisement.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        placements: true,
      },
    });

    if (!ad) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Advertisement not found' },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: ad,
    });
  } catch (error: any) {
    console.error('[ADMIN ADS API] Get ad error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to fetch advertisement' },
      { status: 500 }
    );
  }
}

// PATCH - Update advertisement
export async function PATCH(
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

    const ad = await prisma.advertisement.update({
      where: { id },
      data: {
        ...body,
        startDate: body.startDate ? new Date(body.startDate) : undefined,
        endDate: body.endDate ? new Date(body.endDate) : undefined,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        placements: true,
      },
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: ad,
      message: 'Advertisement updated successfully',
    });
  } catch (error: any) {
    console.error('[ADMIN ADS API] Update ad error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to update advertisement' },
      { status: 500 }
    );
  }
}

// DELETE - Delete advertisement
export async function DELETE(
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

    await prisma.advertisement.delete({
      where: { id },
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Advertisement deleted successfully',
    });
  } catch (error: any) {
    console.error('[ADMIN ADS API] Delete ad error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to delete advertisement' },
      { status: 500 }
    );
  }
}
