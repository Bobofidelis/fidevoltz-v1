import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { mediaUploader } from '@/lib/media/uploader';

// POST - Activate a provider
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
    const { providerId } = body;

    if (!providerId) {
      return NextResponse.json(
        { success: false, error: 'Provider ID is required' },
        { status: 400 }
      );
    }

    // Get the provider config
    const providerConfig = await prisma.mediaProviderConfig.findUnique({
      where: { id: providerId },
    });

    if (!providerConfig) {
      return NextResponse.json(
        { success: false, error: 'Provider configuration not found' },
        { status: 404 }
      );
    }

    // Deactivate all other providers
    await prisma.mediaProviderConfig.updateMany({
      where: { isActive: true },
      data: { isActive: false },
    });

    // Activate the selected provider
    await prisma.mediaProviderConfig.update({
      where: { id: providerId },
      data: { isActive: true },
    });

    // Reinitialize the media uploader
    await mediaUploader.reinitialize();

    return NextResponse.json({
      success: true,
      message: `${providerConfig.provider} provider activated successfully`,
    });
  } catch (error) {
    console.error('[API] Activate provider error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to activate provider' },
      { status: 500 }
    );
  }
}
