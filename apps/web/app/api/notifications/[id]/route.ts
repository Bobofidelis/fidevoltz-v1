import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { ApiResponse } from '@fidevoltz/types';

// GET - Get single notification
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session || !session.user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const notification = await prisma.notification.findUnique({
      where: { id },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!notification) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Notification not found' },
        { status: 404 }
      );
    }

    // Check ownership
    if (notification.userId !== session.user.id) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: notification,
    });
  } catch (error: any) {
    console.error('Get notification error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to fetch notification' },
      { status: 500 }
    );
  }
}

// PATCH - Update notification (mark as read, archive)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session || !session.user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { isRead, archivedAt } = body;

    // Check ownership
    const existing = await prisma.notification.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existing || existing.userId !== session.user.id) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Notification not found' },
        { status: 404 }
      );
    }

    const updateData: any = {};
    if (isRead !== undefined) {
      updateData.isRead = isRead;
      updateData.readAt = isRead ? new Date() : null;
    }
    if (archivedAt !== undefined) {
      updateData.archivedAt = archivedAt ? new Date(archivedAt) : null;
    }

    const notification = await prisma.notification.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: notification,
      message: 'Notification updated successfully',
    });
  } catch (error: any) {
    console.error('Update notification error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to update notification' },
      { status: 500 }
    );
  }
}

// DELETE - Delete notification
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session || !session.user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check ownership
    const existing = await prisma.notification.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existing || existing.userId !== session.user.id) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Notification not found' },
        { status: 404 }
      );
    }

    await prisma.notification.delete({
      where: { id },
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Notification deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete notification error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to delete notification' },
      { status: 500 }
    );
  }
}
