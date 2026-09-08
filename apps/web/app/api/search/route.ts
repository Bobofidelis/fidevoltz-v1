import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { ApiResponse } from '@fidevoltz/types';
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const context = searchParams.get('context') || 'frontend';

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
      pages: [],
      tickets: [],
    };

    if (context === 'dashboard') {
      // ── DASHBOARD SEARCH ──────────────────────────────────────────────────
      if (isAdmin) {
        results.users = await prisma.user.findMany({
          where: {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { email: { contains: query, mode: 'insensitive' } },
            ],
          },
          take: 5,
          select: { id: true, name: true, email: true, role: true, avatar: true },
        });

        results.orders = await prisma.order.findMany({
          where: {
            OR: [{ id: { contains: query, mode: 'insensitive' } }],
          },
          take: 5,
          select: {
            id: true,
            status: true,
            totalAmount: true,
            createdAt: true,
            user: { select: { name: true } },
          },
        });

        results.products = await prisma.product.findMany({
          where: {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { description: { contains: query, mode: 'insensitive' } },
            ],
          },
          take: 6,
          select: { id: true, name: true, price: true, status: true },
        });

        results.projects = await prisma.projectPost.findMany({
          where: {
            OR: [
              { title: { contains: query, mode: 'insensitive' } },
              { category: { contains: query, mode: 'insensitive' } },
            ],
          },
          take: 6,
          select: { id: true, title: true, slug: true, status: true, category: true },
        });

        results.pages = await prisma.page.findMany({
          where: {
            OR: [
              { title: { contains: query, mode: 'insensitive' } },
              { slug: { contains: query, mode: 'insensitive' } },
            ],
          },
          take: 4,
          select: { id: true, title: true, slug: true },
        });

        results.tickets = await prisma.supportTicket.findMany({
          where: {
            OR: [
              { subject: { contains: query, mode: 'insensitive' } },
            ],
          },
          take: 4,
          select: { id: true, subject: true, status: true, priority: true },
        });

      } else if (session?.user?.id) {
        // Regular users: search their own orders and tickets
        results.orders = await prisma.order.findMany({
          where: {
            userId: session.user.id,
            id: { contains: query, mode: 'insensitive' },
          },
          take: 5,
          select: { id: true, status: true, totalAmount: true, createdAt: true },
        });

        results.tickets = await prisma.supportTicket.findMany({
          where: {
            userId: session.user.id,
            subject: { contains: query, mode: 'insensitive' },
          },
          take: 4,
          select: { id: true, subject: true, status: true, priority: true },
        });
      }

    } else {
      // ── FRONTEND SEARCH ───────────────────────────────────────────────────
      // Products: match name, description, or any tag
      results.products = await prisma.product.findMany({
        where: {
          status: 'ACTIVE',
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { tags: { has: query } },
          ],
        },
        include: { category: true },
        take: 10,
      });

      // Projects: match title, excerpt, or category
      results.projects = await prisma.projectPost.findMany({
        where: {
          status: 'PUBLISHED',
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { excerpt: { contains: query, mode: 'insensitive' } },
            { category: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: 10,
      });

      // Categories: match by name
      results.categories = await prisma.category.findMany({
        where: {
          name: { contains: query, mode: 'insensitive' },
        },
        take: 5,
      });
    }

    return NextResponse.json<ApiResponse>(
      { success: true, data: results },
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
