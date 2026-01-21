import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { ApiResponse } from '@fidevoltz/types';

interface SeoSetting {
  id: string;
  page: string;
  title: string;
  description: string;
  keywords: string;
  ogImage?: string;
  createdAt: Date;
  updatedAt: Date;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page');

    if (page) {
      // Get SEO for specific page
      const seo = await prisma.adSetting.findFirst({
        where: { platform: `seo-${page}` },
      });

      if (!seo) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: 'SEO settings not found' },
          { status: 404 }
        );
      }

      const seoData = JSON.parse(seo.adCode);
      return NextResponse.json<ApiResponse<SeoSetting>>(
        { success: true, data: seoData },
        { status: 200 }
      );
    }

    // Get all SEO settings
    const seoSettings = await prisma.adSetting.findMany({
      where: {
        platform: { startsWith: 'seo-' },
      },
    });

    const formattedSettings = seoSettings.map((setting) => ({
      id: setting.id,
      page: setting.platform.replace('seo-', ''),
      ...JSON.parse(setting.adCode),
      createdAt: setting.createdAt,
      updatedAt: setting.updatedAt,
    }));

    return NextResponse.json<ApiResponse<SeoSetting[]>>(
      { success: true, data: formattedSettings as SeoSetting[] },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Get SEO error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'An error occurred while fetching SEO settings' },
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
    const { page, title, description, keywords, ogImage } = body;

    if (!page || !title || !description) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Page, title, and description are required' },
        { status: 400 }
      );
    }

    const seoData = {
      title,
      description,
      keywords: keywords || '',
      ogImage: ogImage || null,
    };

    const seo = await prisma.adSetting.create({
      data: {
        platform: `seo-${page}`,
        adCode: JSON.stringify(seoData),
        placement: 'head',
        isActive: true,
      },
    });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          id: seo.id,
          page,
          ...seoData,
          createdAt: seo.createdAt,
          updatedAt: seo.updatedAt,
        },
        message: 'SEO settings created successfully',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create SEO error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'An error occurred while creating SEO settings' },
      { status: 500 }
    );
  }
}
