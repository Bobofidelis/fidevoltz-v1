import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { ApiResponse } from '@fidevoltz/types';

// GET - Fetch current user's profile
export async function GET() {
  try {
    console.log('[PROFILE API] GET request received');
    const session = await auth();
    console.log('[PROFILE API] Session:', session ? 'EXISTS' : 'NULL');
    console.log('[PROFILE API] User ID:', session?.user?.id);

    if (!session || !session.user) {
      console.error('[PROFILE API] Unauthorized - no session or user');
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('[PROFILE API] Fetching user from database...');
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        phoneNumber: true,
        address: true,
        bio: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    console.log('[PROFILE API] User found:', user ? 'YES' : 'NO');

    if (!user) {
      console.error('[PROFILE API] User not found in database');
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    console.log('[PROFILE API] Returning user data');
    return NextResponse.json<ApiResponse>({
      success: true,
      data: user,
    });
  } catch (error: any) {
    console.error('[PROFILE API] Error:', error);
    console.error('[PROFILE API] Error message:', error.message);
    console.error('[PROFILE API] Error stack:', error.stack);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

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
    const { name, phoneNumber, address, bio } = body;

    // Validate inputs
    if (name && name.trim().length < 2) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Name must be at least 2 characters' },
        { status: 400 }
      );
    }

    if (phoneNumber && !/^[+]?[\d\s-()]+$/.test(phoneNumber)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Invalid phone number format' },
        { status: 400 }
      );
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(name && { name: name.trim() }),
        ...(phoneNumber !== undefined && { phoneNumber }),
        ...(address !== undefined && { address }),
        ...(bio !== undefined && { bio }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        phoneNumber: true,
        address: true,
        bio: true,
        updatedAt: true,
      },
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: updatedUser,
      message: 'Profile updated successfully',
    });
  } catch (error: any) {
    console.error('Update profile error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
