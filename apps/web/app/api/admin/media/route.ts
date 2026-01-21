import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { mediaUploader } from '@/lib/media/uploader';

interface ApiResponse {
  success: boolean;
  media?: any[];
  message?: string;
  error?: string;
}

// GET - List all media with filters
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const folder = searchParams.get('folder');
    const provider = searchParams.get('provider');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: any = {};
    if (type) where.type = type;
    if (folder) where.folder = folder;
    if (provider) where.provider = provider;

    const media = await prisma.media.findMany({
      where,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    const total = await prisma.media.count({ where });

    return NextResponse.json<ApiResponse>({
      success: true,
      media,
      message: `Found ${total} media items`,
    });
  } catch (error) {
    console.error('[API] List media error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to list media' },
      { status: 500 }
    );
  }
}

// POST - Upload new media
export async function POST(request: NextRequest) {
  console.log('🚀🚀🚀 MEDIA UPLOAD API CALLED 🚀🚀🚀');
  
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    console.log('[UPLOAD] User authenticated:', session.user.email, 'ID:', session.user.id);

    // Verify user exists in database to prevent FK violation
    const userExists = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true },
    });

    if (!userExists) {
      console.error('[UPLOAD] ❌ User not found in database:', session.user.id);
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'User account not found. Please sign out and sign in again.' },
        { status: 401 }
      );
    }

    // Check if provider is configured
    if (!mediaUploader.isConfigured()) {
      await mediaUploader.initialize();
      if (!mediaUploader.isConfigured()) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: 'No media provider configured. Please configure a provider in settings.' },
          { status: 400 }
        );
      }
    }

    console.log('[UPLOAD] Provider configured:', mediaUploader.getProvider());

    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const folder = formData.get('folder') as string | null;
    const tags = formData.get('tags') as string | null;
    const type = formData.get('type') as string | null;

    if (!files || files.length === 0) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'No files provided' },
        { status: 400 }
      );
    }

    console.log('[UPLOAD] Processing', files.length, 'file(s)');

    const uploadedMedia = [];
    const errors = [];

    for (const file of files) {
      try {
        console.log('[UPLOAD] Processing file:', file.name, 'type:', file.type, 'size:', file.size);

        // Determine media type
        const mediaType = type ? (type as any) : getMediaType(file.type);
        console.log('[UPLOAD] Media type:', mediaType);

        // Upload to provider
        console.log('[UPLOAD] Uploading to provider...');
        const result = await mediaUploader.upload(file, {
          folder: folder || undefined,
          tags: tags ? JSON.parse(tags) : [],
          type: mediaType,
        });

        console.log('[UPLOAD] Upload successful:', result.publicId);

        // Save to database
        console.log('[UPLOAD] Saving to database...');
        const media = await prisma.media.create({
          data: {
            provider: result.provider,
            type: result.type,
            publicId: result.publicId,
            url: result.url,
            secureUrl: result.secureUrl,
            format: result.format || file.name.split('.').pop()?.toLowerCase() || 'file',
            width: result.width,
            height: result.height,
            duration: result.duration,
            bytes: result.bytes,
            folder: result.folder,
            tags: result.tags || [],
            createdById: session.user.id,
          },
          include: {
            creator: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        });

        console.log('[UPLOAD] Database record created:', media.id);
        uploadedMedia.push(media);
      } catch (fileError) {
        console.error('[UPLOAD] ❌ Error processing file:', file.name);
        const errorMessage = fileError instanceof Error ? fileError.message : String(fileError);
        console.error('[UPLOAD] Error message:', errorMessage);
        errors.push({ file: file.name, error: errorMessage });
      }
    }

    if (uploadedMedia.length === 0) {
      const errorSummary = errors.map(e => `${e.file}: ${e.error}`).join('; ');
      return NextResponse.json<ApiResponse>(
        { success: false, error: `Failed to upload files. Details: ${errorSummary}` },
        { status: 500 }
      );
    }

    console.log('[UPLOAD] ✅ Upload complete! Uploaded', uploadedMedia.length, 'file(s)');

    return NextResponse.json<ApiResponse>({
      success: true,
      media: uploadedMedia,
      message: `Successfully uploaded ${uploadedMedia.length} file(s)${errors.length > 0 ? `. Failed: ${errors.length}` : ''}`,
    });
  } catch (error) {
    console.error('[UPLOAD] ❌ Upload error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: error instanceof Error ? error.message : 'Failed to upload media' },
      { status: 500 }
    );
  }
}

// Helper function to determine media type from MIME type
function getMediaType(mimeType: string): 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT' {
  if (mimeType.startsWith('image/')) return 'IMAGE';
  if (mimeType.startsWith('video/')) return 'VIDEO';
  if (mimeType.startsWith('audio/')) return 'AUDIO';
  if (mimeType.startsWith('application/') || mimeType.startsWith('text/')) return 'DOCUMENT';
  return 'IMAGE'; // Default
}
