import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { ApiResponse } from '@fidevoltz/types';

// GET - Get detailed user information (Admin only)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            orders: true,
            activities: true,
            sentMessages: true,
            receivedMessages: true,
            notifications: true,
          },
        },
        orders: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            totalAmount: true,
            status: true,
            createdAt: true,
          },
        },
        activities: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Calculate total spent
    const orderStats = await prisma.order.aggregate({
      where: { userId: id, status: { in: ['COMPLETED', 'DELIVERED'] } },
      _sum: { totalAmount: true },
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        ...user,
        totalSpent: orderStats._sum.totalAmount || 0,
      },
    });
  } catch (error: any) {
    console.error('[API] Get user details error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to fetch user details' },
      { status: 500 }
    );
  }
}

// PATCH - Update user (Admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { role, status, name, email } = body;

    console.log('[USER UPDATE] Updating user:', id);
    console.log('[USER UPDATE] Update data:', { role, status, name, email });

    const updateData: any = {};
    if (role) updateData.role = role;
    if (status) updateData.status = status;
    if (name) updateData.name = name;
    if (email) updateData.email = email;

    console.log('[USER UPDATE] Prepared update data:', updateData);

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    console.log('[USER UPDATE] User updated successfully');

    // Log activity
    await prisma.userActivity.create({
      data: {
        userId: id,
        action: 'profile_updated_by_admin',
        metadata: { 
          changes: updateData, 
          adminId: session.user.id,
          adminEmail: session.user.email,
          message: `Admin ${session.user.email} updated user profile`
        },
      },
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: user,
      message: 'User updated successfully',
    });
  } catch (error: any) {
    console.error('[USER UPDATE] ========== ERROR ==========');
    console.error('[USER UPDATE] Error name:', error?.name);
    console.error('[USER UPDATE] Error message:', error?.message);
    console.error('[USER UPDATE] Error code:', error?.code);
    console.error('[USER UPDATE] Full error:', error);
    
    return NextResponse.json<ApiResponse>(
      { success: false, error: error?.message || 'Failed to update user' },
      { status: 500 }
    );
  }
}

// DELETE - Delete user (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    // Soft delete by setting status to inactive
    await prisma.user.update({
      where: { id },
      data: { status: 'inactive' },
    });

    // Log activity
    await prisma.userActivity.create({
      data: {
        userId: id,
        action: 'account_deactivated_by_admin',
        metadata: { 
          adminId: session.user.id,
          adminEmail: session.user.email,
          message: `Admin ${session.user.email} deactivated user account`
        },
      },
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'User deactivated successfully',
    });
  } catch (error: any) {
    console.error('[API] Delete user error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
