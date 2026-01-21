import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { ApiResponse, ProjectPost, UpdateProjectDto } from '@fidevoltz/types';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const project = await prisma.projectPost.findUnique({
      where: { id },
      include: {
        comments: {
          where: { parentId: null },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
            replies: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    avatar: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!project) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse<ProjectPost>>(
      { success: true, data: project as ProjectPost },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Get project error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'An error occurred while fetching project' },
      { status: 500 }
    );
  }
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

    if (session.user.role !== 'ADMIN' && session.user.role !== 'EDITOR') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body: UpdateProjectDto = await request.json();
    const { title, slug, content, category, published } = body;

    const updatedProject = await prisma.projectPost.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(slug !== undefined && { slug }),
        ...(content !== undefined && { content }),
        ...(category !== undefined && { category }),
        ...(published !== undefined && { status: published ? 'PUBLISHED' : 'DRAFT' }),
      },
    });

    return NextResponse.json<ApiResponse<ProjectPost>>(
      {
        success: true,
        data: updatedProject as ProjectPost,
        message: 'Project updated successfully',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Update project error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'An error occurred while updating project' },
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

    await prisma.projectPost.delete({
      where: { id },
    });

    return NextResponse.json<ApiResponse>(
      { success: true, message: 'Project deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Delete project error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'An error occurred while deleting project' },
      { status: 500 }
    );
  }
}
