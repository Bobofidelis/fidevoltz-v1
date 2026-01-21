import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { ApiResponse } from '@fidevoltz/types';

// GET - Get all site settings
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    const where = category ? { category } : {};

    const settings = await prisma.siteSettings.findMany({
      where,
      orderBy: { key: 'asc' },
    });

    // Group by category
    const grouped = settings.reduce((acc: any, setting) => {
      if (!acc[setting.category]) {
        acc[setting.category] = {};
      }
      acc[setting.category][setting.key] = setting.value;
      return acc;
    }, {});

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        settings,
        grouped,
      },
    });
  } catch (error: any) {
    console.error('[ADMIN SETTINGS API] Get error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

// PATCH - Update site settings
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { settings } = body; // Array of { key, value, category, description }

    if (!Array.isArray(settings)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Settings must be an array' },
        { status: 400 }
      );
    }

    // Update or create each setting
    const results = await Promise.all(
      settings.map((setting: any) =>
        prisma.siteSettings.upsert({
          where: { key: setting.key },
          update: {
            value: setting.value,
            category: setting.category || 'general',
            description: setting.description,
            updatedBy: session.user.id,
          },
          create: {
            key: setting.key,
            value: setting.value,
            category: setting.category || 'general',
            description: setting.description,
            updatedBy: session.user.id,
          },
        })
      )
    );

    return NextResponse.json<ApiResponse>({
      success: true,
      data: results,
      message: 'Settings updated successfully',
    });
  } catch (error: any) {
    console.error('[ADMIN SETTINGS API] Update error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}

// POST - Initialize default settings
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const defaultSettings = [
      // Contact Information
      { key: 'contact.email', value: 'hello@fidevoltz.com', category: 'contact', description: 'Main contact email' },
      { key: 'contact.phone', value: '+1 (234) 567-890', category: 'contact', description: 'Contact phone number' },
      { key: 'contact.address', value: '123 Tech Avenue, Innovation City, TC 90210', category: 'contact', description: 'Office address' },
      { key: 'contact.supportEmail', value: 'support@fidevoltz.com', category: 'contact', description: 'Support email' },
      
      // Social Media
      { key: 'social.facebook', value: '', category: 'social', description: 'Facebook page URL' },
      { key: 'social.twitter', value: '', category: 'social', description: 'Twitter/X profile URL' },
      { key: 'social.instagram', value: '', category: 'social', description: 'Instagram profile URL' },
      { key: 'social.linkedin', value: '', category: 'social', description: 'LinkedIn company page URL' },
      { key: 'social.youtube', value: '', category: 'social', description: 'YouTube channel URL' },
      { key: 'social.tiktok', value: '', category: 'social', description: 'TikTok profile URL' },
      { key: 'social.whatsapp', value: '', category: 'social', description: 'WhatsApp business number' },
      { key: 'social.reddit', value: '', category: 'social', description: 'Reddit community URL' },
      
      // Social Media Visibility
      { key: 'social.show.facebook', value: true, category: 'social', description: 'Show Facebook link' },
      { key: 'social.show.twitter', value: true, category: 'social', description: 'Show Twitter/X link' },
      { key: 'social.show.instagram', value: true, category: 'social', description: 'Show Instagram link' },
      { key: 'social.show.linkedin', value: true, category: 'social', description: 'Show LinkedIn link' },
      { key: 'social.show.youtube', value: true, category: 'social', description: 'Show YouTube link' },
      { key: 'social.show.tiktok', value: true, category: 'social', description: 'Show TikTok link' },
      { key: 'social.show.whatsapp', value: true, category: 'social', description: 'Show WhatsApp link' },
      { key: 'social.show.reddit', value: true, category: 'social', description: 'Show Reddit link' },
      
      // Branding
      { key: 'branding.siteName', value: 'FideVoltz', category: 'branding', description: 'Site name' },
      { key: 'branding.tagline', value: 'Innovation in Electronics', category: 'branding', description: 'Site tagline' },
      { key: 'branding.logo', value: '/logo.png', category: 'branding', description: 'Logo URL' },
      { key: 'branding.favicon', value: '/favicon.ico', category: 'branding', description: 'Favicon URL' },
      { key: 'branding.primaryColor', value: '#3B82F6', category: 'branding', description: 'Primary brand color' },
      
      // Email
      { key: 'email.fromName', value: 'FideVoltz Team', category: 'email', description: 'Email sender name' },
      { key: 'email.fromEmail', value: 'noreply@fidevoltz.com', category: 'email', description: 'Email sender address' },
      { key: 'email.replyTo', value: 'hello@fidevoltz.com', category: 'email', description: 'Reply-to email' },
      
      // General
      { key: 'general.maintenanceMode', value: false, category: 'general', description: 'Maintenance mode enabled' },
      { key: 'general.allowRegistration', value: true, category: 'general', description: 'Allow new user registration' },
      { key: 'general.requireEmailVerification', value: true, category: 'general', description: 'Require email verification' },
    ];

    const results = await Promise.all(
      defaultSettings.map((setting) =>
        prisma.siteSettings.upsert({
          where: { key: setting.key },
          update: {},
          create: {
            ...setting,
            updatedBy: session.user.id,
          },
        })
      )
    );

    return NextResponse.json<ApiResponse>({
      success: true,
      data: results,
      message: 'Default settings initialized',
    });
  } catch (error: any) {
    console.error('[ADMIN SETTINGS API] Initialize error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to initialize settings' },
      { status: 500 }
    );
  }
}
