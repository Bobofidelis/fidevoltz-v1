import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { mediaUploader } from '@/lib/media/uploader';

// Cloudinary listing can take a while on large accounts
export const maxDuration = 60;

// POST - Import assets that exist at the provider but have no library record
export async function POST() {
  try {
    const session = await auth();

    if (!session || !session.user || (session.user.role !== 'ADMIN' && session.user.role !== 'EDITOR')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Admin or Editor access required' },
        { status: 403 }
      );
    }

    if (!mediaUploader.isConfigured()) {
      await mediaUploader.initialize();
      if (!mediaUploader.isConfigured()) {
        return NextResponse.json(
          { success: false, error: 'No media provider configured. Please configure a provider in settings.' },
          { status: 400 }
        );
      }
    }

    const remote = await mediaUploader.listAll();
    const existing = await prisma.media.findMany({ select: { publicId: true } });
    const known = new Set(existing.map((m) => m.publicId));

    const missing = remote.filter((r) => !known.has(r.publicId));

    if (missing.length > 0) {
      await prisma.media.createMany({
        data: missing.map((r) => ({
          provider: r.provider,
          type: r.type,
          publicId: r.publicId,
          url: r.url,
          secureUrl: r.secureUrl,
          format: r.format || 'file',
          width: r.width,
          height: r.height,
          duration: r.duration,
          bytes: r.bytes,
          folder: r.folder,
          tags: r.tags || [],
          createdById: session.user.id,
        })),
      });
    }

    return NextResponse.json({
      success: true,
      imported: missing.length,
      remoteTotal: remote.length,
      message:
        missing.length > 0
          ? `Imported ${missing.length} asset(s) from ${mediaUploader.getProvider()}`
          : 'Library is already in sync',
    });
  } catch (error) {
    console.error('[API] Media sync error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to sync media' },
      { status: 500 }
    );
  }
}
