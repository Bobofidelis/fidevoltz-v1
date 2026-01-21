import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { ApiResponse } from '@fidevoltz/types';

// GET - Get all categories
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    // Get unique folders from media
    const folders = await prisma.media.findMany({
      where: {
        folder: { not: null },
      },
      select: {
        folder: true,
      },
      distinct: ['folder'],
    });
    const folderList = folders
      .map((f) => f.folder)
      .filter((f): f is string => f !== null)
      .sort();
    // Get counts for each folder
    const foldersWithCounts = await Promise.all(
      folderList.map(async (folder) => {
        const count = await prisma.media.count({
          where: { folder },
        });
        return { name: folder, count };
      })
    );
    return NextResponse.json<ApiResponse>({
      success: true,
      data: foldersWithCounts,
    });
  } catch (error: any) {
    console.error('[MEDIA API] Get categories error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}
