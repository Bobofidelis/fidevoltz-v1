import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { ApiResponse, User, UpdateUserRoleDto } from '@fidevoltz/types';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
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

    // Only admins can update user roles
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body: UpdateUserRoleDto = await request.json();
    const { role } = body;

    if (!role || !['USER', 'EDITOR', 'ADMIN'].includes(role)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Invalid role' },
        { status: 400 }
      );
    }

    // Prevent changing your own role
    if (session.user.id === id) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Cannot change your own role' },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role },
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
        message: 'User role updated successfully',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Update user role error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'An error occurred while updating user role' },
      { status: 500 }
    );
  }
}
