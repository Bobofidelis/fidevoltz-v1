import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'EDITOR')) {
        return new NextResponse("Unauthorized", { status: 403 });
    }

    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('[CATEGORIES_GET]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
        return new NextResponse("Unauthorized", { status: 403 });
    }

    const body = await req.json();
    const { name, slug, description } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const trimmedName = name.trim();
    const existing = await prisma.category.findUnique({
      where: { name: trimmedName },
    });

    if (existing) {
      return NextResponse.json({ error: "A category with this name already exists" }, { status: 400 });
    }

    let finalSlug = slug ? slugify(slug) : slugify(trimmedName);
    if (finalSlug) {
      const slugConflict = await prisma.category.findUnique({
        where: { slug: finalSlug },
      });
      if (slugConflict) {
        finalSlug = `${finalSlug}-${Date.now().toString(36)}`;
      }
    }

    const category = await prisma.category.create({
      data: {
        name: trimmedName,
        slug: finalSlug || null,
        description: description?.trim() || null,
      },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error: any) {
    console.error('[CATEGORIES_POST]', error);
    return NextResponse.json({ error: error?.message || "Internal Error" }, { status: 500 });
  }
}
