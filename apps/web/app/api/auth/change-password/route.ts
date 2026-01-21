import { NextRequest, NextResponse } from 'next/server';

import { hash } from 'bcryptjs';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { ApiResponse, ChangePasswordDto } from '@fidevoltz/types';
import { compare } from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body: ChangePasswordDto = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Current password and new password are required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'New password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Get user with password hash
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Verify current password
    const isPasswordValid = await compare(currentPassword, user.passwordHash);

    if (!isPasswordValid) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Current password is incorrect' },
        { status: 400 }
      );
    }

    // Hash new password
    const newPasswordHash = await hash(newPassword, 12);

    // Update password
    await prisma.user.update({
      where: { id: session.user.id },
      data: { passwordHash: newPasswordHash },
    });

    return NextResponse.json<ApiResponse>(
      { success: true, message: 'Password changed successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Change password error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'An error occurred while changing password' },
      { status: 500 }
    );
  }
}
