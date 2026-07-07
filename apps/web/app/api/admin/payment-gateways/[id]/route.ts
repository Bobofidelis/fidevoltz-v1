import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// PATCH - Update payment gateway
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const gateway = await prisma.paymentGateway.update({
      where: { id },
      data: body,
    });

    return NextResponse.json({ success: true, data: gateway, message: 'Gateway updated successfully' });
  } catch (error: any) {
    console.error('[ADMIN PAYMENTS API] Update error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update payment gateway' },
      { status: 500 }
    );
  }
}

// DELETE - Remove payment gateway
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    await prisma.paymentGateway.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Gateway deleted successfully' });
  } catch (error: any) {
    console.error('[ADMIN PAYMENTS API] Delete error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete payment gateway' },
      { status: 500 }
    );
  }
}
