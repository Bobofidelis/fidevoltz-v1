import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { compare, hash } from 'bcryptjs';
import type { ApiResponse } from '@fidevoltz/types';

// PATCH - Change user password
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
    const { currentPassword, newPassword, confirmPassword } = body;

    // Validate inputs
    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'All password fields are required' },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'New passwords do not match' },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'New password must be at least 8 characters' },
        { status: 400 }
      );
    }

    // Get user with password hash
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, passwordHash: true },
    });

    if (!user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Verify current password
    const isValidPassword = await compare(currentPassword, user.passwordHash);

    if (!isValidPassword) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Current password is incorrect' },
        { status: 400 }
      );
    }

    // Hash new password
    const newPasswordHash = await hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: session.user.id },
      data: { passwordHash: newPasswordHash },
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error: any) {
    console.error('Change password error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to change password' },
      { status: 500 }
    );
  }
}
