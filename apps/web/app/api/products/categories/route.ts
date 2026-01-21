import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { ApiResponse, Category } from '@fidevoltz/types';

export async function GET(request: NextRequest) {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
    });

    return NextResponse.json<ApiResponse<Category[]>>(
      { success: true, data: categories as Category[] },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Get categories error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'An error occurred while fetching categories' },
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

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Category name is required' },
        { status: 400 }
      );
    }

    const category = await prisma.category.create({
      data: { name },
    });

    return NextResponse.json<ApiResponse<Category>>(
      {
        success: true,
        data: category as Category,
        message: 'Category created successfully',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create category error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'An error occurred while creating category' },
      { status: 500 }
    );
  }
}
