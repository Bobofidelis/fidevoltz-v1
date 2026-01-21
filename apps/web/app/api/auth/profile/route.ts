import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { ApiResponse, User } from '@fidevoltz/types';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phoneNumber: true,
        address: true,
        avatar: true,
        bio: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse<User>>(
      { success: true, data: user as User },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Get profile error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'An error occurred while fetching profile' },
      { status: 500 }
    );
  }
}

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
    const { name, phoneNumber, address, bio, avatar } = body;

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(name !== undefined && { name }),
        ...(phoneNumber !== undefined && { phoneNumber }),
        ...(address !== undefined && { address }),
        ...(bio !== undefined && { bio }),
        ...(avatar !== undefined && { avatar }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phoneNumber: true,
        address: true,
        avatar: true,
        bio: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json<ApiResponse<User>>(
      {
        success: true,
        data: updatedUser as User,
        message: 'Profile updated successfully',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Update profile error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'An error occurred while updating profile' },
      { status: 500 }
    );
  }
}
