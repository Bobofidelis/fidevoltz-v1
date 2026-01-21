import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { ApiResponse, ProjectPost, CreateProjectDto, PaginatedResponse } from '@fidevoltz/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const category = searchParams.get('category') || '';
    const published = searchParams.get('published');

    const skip = (page - 1) * limit;

    const where = {
      ...(category && { category }),
      ...(published !== null && { status: published === 'true' ? 'PUBLISHED' : 'DRAFT' }),
    };

    const [projects, total] = await Promise.all([
      prisma.projectPost.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.projectPost.count({ where }),
    ]);

    return NextResponse.json<ApiResponse<PaginatedResponse<ProjectPost>>>(
      {
        success: true,
        data: {
          data: projects as ProjectPost[],
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Get projects error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'An error occurred while fetching projects' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'ADMIN' && session.user.role !== 'EDITOR') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    const body: CreateProjectDto = await request.json();
    const { title, slug, content, category, published } = body;

    if (!title || !slug || !content || !category) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const project = await prisma.projectPost.create({
      data: {
        title,
        slug,
        content,
        category,
        status: published ? 'PUBLISHED' : 'DRAFT',
        author: { connect: { id: session.user.id } },
      },
    });

    return NextResponse.json<ApiResponse<ProjectPost>>(
      {
        success: true,
        data: project as ProjectPost,
        message: 'Project created successfully',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create project error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'An error occurred while creating project' },
      { status: 500 }
    );
  }
}
