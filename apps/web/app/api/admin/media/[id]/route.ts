import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { mediaUploader } from '@/lib/media/uploader';

interface ApiResponse {
  success: boolean;
  media?: any;
  message?: string;
  error?: string;
}

// GET - Get specific media details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { id } = await params;

    const media = await prisma.media.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!media) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Media not found' },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      media,
    });
  } catch (error) {
    console.error('[API] Get media error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to get media' },
      { status: 500 }
    );
  }
}

// DELETE - Delete media
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Get media record
    const media = await prisma.media.findUnique({
      where: { id },
    });

    if (!media) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Media not found' },
        { status: 404 }
      );
    }

    // Delete from provider
    try {
      await mediaUploader.delete(media.publicId);
    } catch (providerError) {
      console.error('[API] Error deleting from provider:', providerError);
      // Continue with database deletion even if provider deletion fails
    }

    // Delete from database
    await prisma.media.delete({
      where: { id },
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Media deleted successfully',
    });
  } catch (error) {
    console.error('[API] Delete media error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to delete media' },
      { status: 500 }
    );
  }
}

// PATCH - Update media metadata
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { folder, tags } = body;

    const media = await prisma.media.update({
      where: { id },
      data: {
        folder: folder !== undefined ? folder : undefined,
        tags: tags !== undefined ? tags : undefined,
      },
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      media,
      message: 'Media updated successfully',
    });
  } catch (error) {
    console.error('[API] Update media error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to update media' },
      { status: 500 }
    );
  }
}

