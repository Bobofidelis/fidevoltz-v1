import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { ApiResponse } from '@fidevoltz/types';

// GET - Get user settings
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get or create user settings
    let settings = await prisma.userSettings.findUnique({
      where: { userId: session.user.id },
    });

    if (!settings) {
      settings = await prisma.userSettings.create({
        data: { userId: session.user.id },
      });
    }

    // Get user profile
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        phoneNumber: true,
        avatar: true,
        bio: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        profile: user,
        settings,
      },
    });
  } catch (error: any) {
    console.error('[USER SETTINGS API] Get error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

// PATCH - Update user settings
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
    const {
      emailNotifications,
      orderNotifications,
      messageNotifications,
      marketingEmails,
      digestFrequency,
      profileVisibility,
      showEmail,
      showPhone,
      language,
      timezone,
      theme,
    } = body;

    // Update settings
    const settings = await prisma.userSettings.upsert({
      where: { userId: session.user.id },
      update: {
        ...(emailNotifications !== undefined && { emailNotifications }),
        ...(orderNotifications !== undefined && { orderNotifications }),
        ...(messageNotifications !== undefined && { messageNotifications }),
        ...(marketingEmails !== undefined && { marketingEmails }),
        ...(digestFrequency && { digestFrequency }),
        ...(profileVisibility && { profileVisibility }),
        ...(showEmail !== undefined && { showEmail }),
        ...(showPhone !== undefined && { showPhone }),
        ...(language && { language }),
        ...(timezone && { timezone }),
        ...(theme && { theme }),
      },
      create: {
        userId: session.user.id,
        ...(emailNotifications !== undefined && { emailNotifications }),
        ...(orderNotifications !== undefined && { orderNotifications }),
        ...(messageNotifications !== undefined && { messageNotifications }),
        ...(marketingEmails !== undefined && { marketingEmails }),
        ...(digestFrequency && { digestFrequency }),
        ...(profileVisibility && { profileVisibility }),
        ...(showEmail !== undefined && { showEmail }),
        ...(showPhone !== undefined && { showPhone }),
        ...(language && { language }),
        ...(timezone && { timezone }),
        ...(theme && { theme }),
      },
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: settings,
      message: 'Settings updated successfully',
    });
  } catch (error: any) {
    console.error('[USER SETTINGS API] Update error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
