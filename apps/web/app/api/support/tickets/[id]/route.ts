import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { ApiResponse, UpdateSupportTicketDto } from '@fidevoltz/types';

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

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body: UpdateSupportTicketDto = await request.json();
    const { status, message } = body;

    const updatedTicket = await prisma.supportTicket.update({
      where: { id },
      data: {
        ...(status !== undefined && { status: status as any }),
        ...(message !== undefined && { message }),
      },
    });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: updatedTicket,
        message: 'Ticket updated successfully',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Update ticket error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'An error occurred while updating ticket' },
      { status: 500 }
    );
  }
}
