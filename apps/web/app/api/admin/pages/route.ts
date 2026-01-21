import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { ApiResponse } from '@fidevoltz/types';

// GET - List all pages
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user || (session.user.role !== 'ADMIN' && session.user.role !== 'EDITOR')) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const pages = await prisma.page.findMany({
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        isPublished: true,
        updatedAt: true,
        createdAt: true,
      },
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: pages,
    });
  } catch (error: any) {
    console.error('[API] Get pages error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to fetch pages' },
      { status: 500 }
    );
  }
}

// POST - Create new page
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user || (session.user.role !== 'ADMIN' && session.user.role !== 'EDITOR')) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, slug, content, isPublished, seoTitle, seoDesc } = body;

    // Validate required fields
    if (!title || !slug || !content) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Title, slug, and content are required' },
        { status: 400 }
      );
    }

    // Check if slug exists
    const existingPage = await prisma.page.findUnique({
      where: { slug },
    });

    if (existingPage) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Page with this URL already exists' },
        { status: 409 }
      );
    }

    const page = await prisma.page.create({
      data: {
        title,
        slug,
        content,
        isPublished: isPublished ?? true,
        seoTitle,
        seoDesc,
      },
    });

    // Log activity
    await prisma.userActivity.create({
      data: {
        userId: session.user.id,
        action: 'created_page',
        resource: 'page',
        resourceId: page.id,
        metadata: { title: page.title, slug: page.slug },
      },
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: page,
      message: 'Page created successfully',
    });
  } catch (error: any) {
    console.error('[API] Create page error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: error.message || 'Failed to create page' },
      { status: 500 }
    );
  }
}
