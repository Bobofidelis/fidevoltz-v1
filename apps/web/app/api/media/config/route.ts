import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { CloudinaryAdapter } from '@/lib/media/providers/cloudinary';

// GET - Get active provider configuration
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const activeConfig = await prisma.mediaProviderConfig.findFirst({
      where: { isActive: true },
    });

    if (!activeConfig) {
      return NextResponse.json({
        success: true,
        config: null,
      });
    }

    return NextResponse.json({
      success: true,
      config: {
        id: activeConfig.id,
        provider: activeConfig.provider,
        config: activeConfig.config, // Include credentials for admin
        isActive: activeConfig.isActive,
        createdAt: activeConfig.createdAt,
        updatedAt: activeConfig.updatedAt,
      },
    });
  } catch (error) {
    console.error('[API] Get provider config error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get provider configuration' },
      { status: 500 }
    );
  }
}

// POST - Save/update provider configuration
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { provider, config } = body;

    if (!provider || !config) {
      return NextResponse.json(
        { success: false, error: 'Provider and config are required' },
        { status: 400 }
      );
    }

    // Validate provider
    if (!['CLOUDINARY', 'AWS_S3', 'LOCAL'].includes(provider)) {
      return NextResponse.json(
        { success: false, error: 'Invalid provider' },
        { status: 400 }
      );
    }

    // Validate config based on provider
    if (provider === 'CLOUDINARY') {
      const { cloudName, apiKey, apiSecret } = config;
      if (!cloudName || !apiKey || !apiSecret) {
        return NextResponse.json(
          { success: false, error: 'Cloudinary requires cloudName, apiKey, and apiSecret' },
          { status: 400 }
        );
      }

      // Test connection
      const isValid = await CloudinaryAdapter.testConnection(config);
      if (!isValid) {
        return NextResponse.json(
          { success: false, error: 'Invalid Cloudinary credentials' },
          { status: 400 }
        );
      }
    }

    // Check if config already exists for this provider
    const existingConfig = await prisma.mediaProviderConfig.findFirst({
      where: { provider },
    });

    let savedConfig;
    if (existingConfig) {
      // Update existing config
      savedConfig = await prisma.mediaProviderConfig.update({
        where: { id: existingConfig.id },
        data: { config },
      });
    } else {
      // Create new config
      savedConfig = await prisma.mediaProviderConfig.create({
        data: {
          provider,
          config,
          isActive: false,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Provider configuration saved successfully',
      config: {
        id: savedConfig.id,
        provider: savedConfig.provider,
        isActive: savedConfig.isActive,
      },
    });
  } catch (error) {
    console.error('[API] Save provider config error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save provider configuration' },
      { status: 500 }
    );
  }
}
