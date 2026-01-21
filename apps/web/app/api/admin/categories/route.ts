import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
        return new NextResponse("Unauthorized", { status: 403 });
    }

    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
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
    const { name } = body;

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    const category = await prisma.category.create({
      data: {
        name,
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error('[CATEGORIES_POST]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
