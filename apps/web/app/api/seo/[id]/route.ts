import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { ApiResponse } from '@fidevoltz/types';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { title, description, keywords, ogImage } = body;

    const currentSeo = await prisma.adSetting.findUnique({
      where: { id },
    });

    if (!currentSeo) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'SEO settings not found' },
        { status: 404 }
      );
    }

    const currentData = JSON.parse(currentSeo.adCode);
    const updatedData = {
      title: title !== undefined ? title : currentData.title,
      description: description !== undefined ? description : currentData.description,
      keywords: keywords !== undefined ? keywords : currentData.keywords,
      ogImage: ogImage !== undefined ? ogImage : currentData.ogImage,
    };

    const updated = await prisma.adSetting.update({
      where: { id },
      data: {
        adCode: JSON.stringify(updatedData),
      },
    });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          id: updated.id,
          page: updated.platform.replace('seo-', ''),
          ...updatedData,
          updatedAt: updated.updatedAt,
        },
        message: 'SEO settings updated successfully',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Update SEO error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'An error occurred while updating SEO settings' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    const { id } = await params;

    await prisma.adSetting.delete({
      where: { id },
    });

    return NextResponse.json<ApiResponse>(
      { success: true, message: 'SEO settings deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Delete SEO error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'An error occurred while deleting SEO settings' },
      { status: 500 }
    );
  }
}
