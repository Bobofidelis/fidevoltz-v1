import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { z } from 'zod';

const updateCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  slug: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
});

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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'EDITOR')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) {
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: category });
  } catch (error) {
    console.error('[CATEGORY_GET]', error);
    return NextResponse.json({ success: false, error: 'Internal Error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const validatedData = updateCategorySchema.parse(body);

    const existingCategory = await prisma.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });
    }

    // Name conflict check
    if (validatedData.name && validatedData.name !== existingCategory.name) {
      const nameConflict = await prisma.category.findFirst({
        where: {
          name: validatedData.name,
          id: { not: id },
        },
      });
      if (nameConflict) {
        return NextResponse.json(
          { success: false, error: 'A category with this name already exists' },
          { status: 400 }
        );
      }
    }

    // Determine slug
    let newSlug = validatedData.slug !== undefined ? validatedData.slug : undefined;
    if (newSlug) {
      newSlug = slugify(newSlug);
    } else if (validatedData.name && !existingCategory.slug) {
      newSlug = slugify(validatedData.name);
    }

    if (newSlug) {
      const slugConflict = await prisma.category.findFirst({
        where: {
          slug: newSlug,
          id: { not: id },
        },
      });
      if (slugConflict) {
        return NextResponse.json(
          { success: false, error: 'A category with this slug already exists' },
          { status: 400 }
        );
      }
    }

    const updateData: {
      name?: string;
      slug?: string | null;
      description?: string | null;
    } = {};

    if (validatedData.name !== undefined) updateData.name = validatedData.name;
    if (newSlug !== undefined) updateData.slug = newSlug;
    if (validatedData.description !== undefined) updateData.description = validatedData.description;

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: updateData,
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    return NextResponse.json({ success: true, data: updatedCategory });
  } catch (error: any) {
    console.error('[CATEGORY_PUT]', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues[0]?.message || 'Validation failed' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to update category' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) {
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });
    }

    if (category._count.products > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot delete category "${category.name}" because it contains ${category._count.products} product${category._count.products === 1 ? '' : 's'}. Please reassign or delete these products first.`,
        },
        { status: 400 }
      );
    }

    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Category deleted successfully' });
  } catch (error: any) {
    console.error('[CATEGORY_DELETE]', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to delete category' },
      { status: 500 }
    );
  }
}
