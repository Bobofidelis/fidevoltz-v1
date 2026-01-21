import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { ApiResponse, ProjectPost } from '@fidevoltz/types';

interface RouteParams {
  params: Promise<{
    slug: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;

    const project = await prisma.projectPost.findUnique({
      where: { slug },
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
    console.error('Get project by slug error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'An error occurred while fetching project' },
      { status: 500 }
    );
  }
}
