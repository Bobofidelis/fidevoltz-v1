import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { ApiResponse } from '@fidevoltz/types';

// GET - Get all payment gateways (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const gateways = await prisma.paymentGateway.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: gateways });
  } catch (error: any) {
    console.error('[ADMIN PAYMENTS API] Get error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch payment gateways' },
      { status: 500 }
    );
  }
}

// POST - Create new payment gateway
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, type, description, publicKey, secretKey, webhookKey, isActive, isTestMode } = body;

    if (!name || !type) {
      return NextResponse.json({ success: false, error: 'Name and type are required' }, { status: 400 });
    }

    // Check if type already exists
    const existing = await prisma.paymentGateway.findUnique({ where: { type } });
    if (existing) {
      return NextResponse.json({ success: false, error: `A gateway with type '${type}' already exists.` }, { status: 400 });
    }

    const gateway = await prisma.paymentGateway.create({
      data: {
        name,
        type,
        description,
        publicKey,
        secretKey,
        webhookKey,
        isActive: isActive ?? false,
        isTestMode: isTestMode ?? true,
      },
    });

    return NextResponse.json({ success: true, data: gateway, message: 'Gateway created successfully' });
  } catch (error: any) {
    console.error('[ADMIN PAYMENTS API] Create error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create payment gateway' },
      { status: 500 }
    );
  }
}
