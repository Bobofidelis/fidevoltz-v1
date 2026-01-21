import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { ApiResponse } from '@fidevoltz/types';

// GET - Get WhatsApp settings
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    // Allow all authenticated users to view WhatsApp settings
    if (!session || !session.user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get settings from database or return default
    const settings = await prisma.setting.findUnique({
      where: { key: 'whatsapp_settings' },
    });

    const data = settings?.value as any || {
      phoneNumber: '',
      enabled: false,
    };

    return NextResponse.json<ApiResponse>({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error('[API] Get WhatsApp settings error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to fetch WhatsApp settings' },
      { status: 500 }
    );
  }
}

// POST - Update WhatsApp settings
export async function POST(request: NextRequest) {
  try {
    console.log('[WHATSAPP API] POST request received');
    const session = await auth();
    console.log('[WHATSAPP API] Session:', session ? 'EXISTS' : 'NULL');
    console.log('[WHATSAPP API] User role:', session?.user?.role);

    if (!session || !session.user || session.user.role !== 'ADMIN') {
      console.error('[WHATSAPP API] Unauthorized');
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log('[WHATSAPP API] Request body:', body);
    const { phoneNumber, enabled } = body;

    // Validate phone number
    if (enabled && !phoneNumber) {
      console.error('[WHATSAPP API] Phone number required but not provided');
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Phone number is required when WhatsApp is enabled' },
        { status: 400 }
      );
    }

    console.log('[WHATSAPP API] Attempting to upsert settings...');
    // Save settings
    const settings = await prisma.setting.upsert({
      where: { key: 'whatsapp_settings' },
      update: {
        value: { phoneNumber, enabled },
      },
      create: {
        key: 'whatsapp_settings',
        value: { phoneNumber, enabled },
      },
    });

    console.log('[WHATSAPP API] Settings saved successfully:', settings);

    return NextResponse.json<ApiResponse>({
      success: true,
      data: settings.value,
      message: 'WhatsApp settings updated successfully',
    });
  } catch (error: any) {
    console.error('[WHATSAPP API] Update WhatsApp settings error:', error);
    console.error('[WHATSAPP API] Error message:', error.message);
    console.error('[WHATSAPP API] Error stack:', error.stack);
    return NextResponse.json<ApiResponse>(
      { success: false, error: error.message || 'Failed to update WhatsApp settings' },
      { status: 500 }
    );
  }
}
