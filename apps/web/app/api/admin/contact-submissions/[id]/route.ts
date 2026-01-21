import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { ApiResponse } from '@fidevoltz/types';

// GET - Get single contact submission (admin only)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    const submission = await prisma.contactSubmission.findUnique({
      where: { id },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!submission) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Submission not found' },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: submission,
    });
  } catch (error: any) {
    console.error('[ADMIN CONTACT SUBMISSION API] Get submission error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to fetch contact submission' },
      { status: 500 }
    );
  }
}

// PATCH - Update contact submission (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { status, notes, assignedToId } = body;

    const submission = await prisma.contactSubmission.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(notes !== undefined && { notes }),
        ...(assignedToId !== undefined && { assignedToId }),
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: submission,
      message: 'Submission updated successfully',
    });
  } catch (error: any) {
    console.error('[ADMIN CONTACT SUBMISSION API] Update submission error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to update contact submission' },
      { status: 500 }
    );
  }
}

// DELETE - Delete contact submission (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    await prisma.contactSubmission.delete({
      where: { id },
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Submission deleted successfully',
    });
  } catch (error: any) {
    console.error('[ADMIN CONTACT SUBMISSION API] Delete submission error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to delete contact submission' },
      { status: 500 }
    );
  }
}
