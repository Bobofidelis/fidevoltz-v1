import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { ApiResponse, User } from '@fidevoltz/types';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Users can only view their own profile, admins can view any
    if (session.user.id !== id && session.user.role !== 'ADMIN') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id },
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
    console.error('Get user error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'An error occurred while fetching user' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Users can only update their own profile, admins can update any
    if (session.user.id !== id && session.user.role !== 'ADMIN') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, phoneNumber, address, bio, avatar } = body;

    const updatedUser = await prisma.user.update({
      where: { id },
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
        message: 'User updated successfully',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Update user error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'An error occurred while updating user' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only admins can delete users
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Prevent deleting yourself
    if (session.user.id === id) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json<ApiResponse>(
      { success: true, message: 'User deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Delete user error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'An error occurred while deleting user' },
      { status: 500 }
    );
  }
}
