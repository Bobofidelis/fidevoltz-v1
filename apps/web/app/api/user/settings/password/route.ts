import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { ApiResponse } from '@fidevoltz/types';
import bcrypt from 'bcryptjs';

// POST - Change password
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Current password and new password are required' },
        { status: 400 }
      );
    }

    // Password validation
    if (newPassword.length < 8) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Get user
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
    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);

    if (!isValid) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Current password is incorrect' },
        { status: 400 }
      );
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: session.user.id },
      data: { passwordHash },
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error: any) {
    console.error('[USER PASSWORD API] Change error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to change password' },
      { status: 500 }
    );
  }
}
