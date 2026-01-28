import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { ApiResponse } from '@fidevoltz/types';

// GET - Get single page
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session || !session.user || (session.user.role !== 'ADMIN' && session.user.role !== 'EDITOR')) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const page = await prisma.page.findUnique({
      where: { id },
    });

    if (!page) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Page not found' },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: page,
    });
  } catch (error: any) {
    console.error('[API] Get page error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to fetch page' },
      { status: 500 }
    );
  }
}

// PATCH - Update page
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session || !session.user || (session.user.role !== 'ADMIN' && session.user.role !== 'EDITOR')) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    console.log('[API] Update page - Session User:', JSON.stringify(session.user));

    const body = await request.json();
    console.log('[API] Update page body:', JSON.stringify(body, null, 2));
    const { title, slug, content, isPublished, seoTitle, seoDesc } = body;

    // Check if slug is taken by another page (if slug is being updated)
    if (slug) {
      const existingPage = await prisma.page.findFirst({
        where: {
          slug,
          NOT: { id },
        },
      });

      if (existingPage) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: 'Page with this URL already exists' },
          { status: 409 }
        );
      }
    }

    const page = await prisma.page.update({
      where: { id },
      data: {
        title,
        slug,
        content,
        isPublished,
        seoTitle,
        seoDesc,
      },
    });

    // Log activity (non-blocking)
    try {
      if (session.user.id) {
        await prisma.userActivity.create({
          data: {
            userId: session.user.id,
            action: 'updated_page',
            resource: 'page',
            resourceId: page.id,
            metadata: { title: page.title, slug: page.slug },
          },
        });
      }
    } catch (logError) {
      console.error('[API] Failed to log activity:', logError);
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: page,
      message: 'Page updated successfully',
    });
  } catch (error: any) {
    console.error('[API] Update page error:', error);
    
    return NextResponse.json<ApiResponse>(
      { 
        success: false, 
        error: error.message || 'Failed to update page',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete page
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session || !session.user || (session.user.role !== 'ADMIN' && session.user.role !== 'EDITOR')) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    await prisma.page.delete({
      where: { id },
    });

    // Log activity
    await prisma.userActivity.create({
      data: {
        userId: session.user.id,
        action: 'deleted_page',
        resource: 'page',
        resourceId: id,
      },
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Page deleted successfully',
    });
  } catch (error: any) {
    console.error('[API] Delete page error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to delete page' },
      { status: 500 }
    );
  }
}
