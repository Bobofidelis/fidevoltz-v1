import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { ApiResponse } from '@fidevoltz/types';

// PATCH - Update user profile
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
    const { name, phoneNumber, bio, avatar } = body;

    // Phone number validation
    if (phoneNumber && !/^\+?[1-9]\d{1,14}$/.test(phoneNumber.replace(/[\s-]/g, ''))) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Invalid phone number format. Use international format with country code.' },
        { status: 400 }
      );
    }

    // Update user profile
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(name !== undefined && { name }),
        ...(phoneNumber !== undefined && { phoneNumber }),
        ...(bio !== undefined && { bio }),
        ...(avatar !== undefined && { avatar }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        phoneNumber: true,
        avatar: true,
        bio: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: user,
      message: 'Profile updated successfully',
    });
  } catch (error: any) {
    console.error('[USER PROFILE API] Update error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
