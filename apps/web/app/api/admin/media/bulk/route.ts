import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { unlink } from 'fs/promises';
import { join } from 'path';
import type { ApiResponse } from '@fidevoltz/types';

// POST - Bulk operations on media
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { action, ids, data } = body;

    if (!action || !ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Invalid request. Action and IDs required' },
        { status: 400 }
      );
    }

    let result;

    switch (action) {
      case 'delete':
        // Get media files to delete
        const mediaToDelete = await prisma.media.findMany({
          where: { id: { in: ids } },
          select: { id: true, url: true },
        });

        // Delete files from filesystem
        for (const media of mediaToDelete) {
          try {
            const filePath = join(process.cwd(), 'apps', 'web', 'public', media.url);
            await unlink(filePath);
          } catch (err) {
            console.error('Error deleting file:', err);
          }
        }

        // Delete from database
        result = await prisma.media.deleteMany({
          where: { id: { in: ids } },
        });
        break;

      case 'updateFolder':
        if (!data || !data.folder) {
          return NextResponse.json<ApiResponse>(
            { success: false, error: 'Folder required for update' },
            { status: 400 }
          );
        }
        result = await prisma.media.updateMany({
          where: { id: { in: ids } },
          data: { folder: data.folder },
        });
        break;

      case 'addTags':
        if (!data || !data.tags || !Array.isArray(data.tags)) {
          return NextResponse.json<ApiResponse>(
            { success: false, error: 'Tags array required' },
            { status: 400 }
          );
        }
        // Get existing media to merge tags
        const mediaItems = await prisma.media.findMany({
          where: { id: { in: ids } },
          select: { id: true, tags: true },
        });

        // Update each media item with merged tags
        await Promise.all(
          mediaItems.map((item) =>
            prisma.media.update({
              where: { id: item.id },
              data: { tags: [...new Set([...item.tags, ...data.tags])] },
            })
          )
        );
        result = { count: mediaItems.length };
        break;

      default:
        return NextResponse.json<ApiResponse>(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: result,
      message: `Bulk ${action} completed successfully`,
    });
  } catch (error: any) {
    console.error('[MEDIA API] Bulk operation error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to perform bulk operation' },
      { status: 500 }
    );
  }
}
