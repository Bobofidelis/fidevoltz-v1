import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { ApiResponse } from '@fidevoltz/types';

// PATCH - Update user avatar
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { avatarUrl } = body;

    if (!avatarUrl) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Avatar URL is required' },
        { status: 400 }
      );
    }

    // Reject base64 data URLs to prevent session bloat
    if (avatarUrl.startsWith('data:')) {
      return NextResponse.json<ApiResponse>(
        { 
          success: false, 
          error: 'Base64 images are not supported. Please use an external URL or upload to a file hosting service.' 
        },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(avatarUrl);
    } catch {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Invalid avatar URL' },
        { status: 400 }
      );
    }

    // Update user avatar
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { avatar: avatarUrl },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
      },
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: updatedUser,
      message: 'Avatar updated successfully',
    });
  } catch (error: any) {
    console.error('Update avatar error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to update avatar' },
      { status: 500 }
    );
  }
}
