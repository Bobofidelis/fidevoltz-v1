import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { ApiResponse } from '@fidevoltz/types';
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const context = searchParams.get('context') || 'frontend'; // frontend, dashboard

    if (!query || query.length < 2) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Search query must be at least 2 characters' },
        { status: 400 }
      );
    }

    const session = await auth();
    const isAdmin = session?.user?.role === 'ADMIN';

    const results: any = {
      products: [],
      projects: [],
      categories: [],
      users: [],
      orders: [],
      pages: []
    };

    if (context === 'dashboard') {
      // DASHBOARD SEARCH
      if (isAdmin) {
        // Admins can search users, orders, all products, projects
        results.users = await prisma.user.findMany({
          where: {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { email: { contains: query, mode: 'insensitive' } },
            ],
          },
          take: 5,
          select: { id: true, name: true, email: true, role: true, avatar: true }
        });

        results.orders = await prisma.order.findMany({
          where: {
            OR: [
              { id: { contains: query, mode: 'insensitive' } },
            ],
          },
          take: 5,
          select: { id: true, status: true, total: true, createdAt: true, user: { select: { name: true } } }
        });
      } else if (session?.user?.id) {
        // Normal users can search their own orders
        results.orders = await prisma.order.findMany({
          where: {
            userId: session.user.id,
            id: { contains: query, mode: 'insensitive' }
          },
          take: 5,
          select: { id: true, status: true, total: true, createdAt: true }
        });
      }

      // Both admin and normal users might search products/projects in dashboard? 
      // Actually dashboard search might be mostly admin, but let's provide everything for admin and some for user.
      if (isAdmin) {
        results.products = await prisma.product.findMany({
          where: {
            OR: [
              { name: { contains: query, mode: 'insensitive' } }
            ],
          },
          take: 5,
          select: { id: true, name: true, price: true, status: true }
        });

        results.projects = await prisma.projectPost.findMany({
          where: {
            OR: [
              { title: { contains: query, mode: 'insensitive' } }
            ],
          },
          take: 5,
          select: { id: true, title: true, slug: true, status: true }
        });
      }

    } else {
      // FRONTEND SEARCH
      results.products = await prisma.product.findMany({
        where: {
          status: 'PUBLISHED',
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ],
        },
        include: {
          category: true,
        },
        take: 10,
      });

      results.projects = await prisma.projectPost.findMany({
        where: {
          status: 'PUBLISHED',
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { excerpt: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: 10,
      });

      results.categories = await prisma.category.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: 5,
      });
    }

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: results,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Search error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'An error occurred while searching' },
      { status: 500 }
    );
  }
}
