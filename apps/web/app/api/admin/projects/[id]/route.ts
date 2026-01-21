
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || !session.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const project = await prisma.projectPost.findUnique({
      where: { id },
      include: {
        components: true,
        attachments: true
      }
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error("Error fetching project:", error);
    return NextResponse.json({ error: "Failed to fetch project" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || !session.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { 
      title, 
      slug, 
      excerpt, 
      content, 
      featuredImage, 
      category, 
      difficulty, 
      status, 
      allowComments,
      components,
      attachments
    } = body;

    // Check if slug is taken by another project
    if (slug) {
      const existing = await prisma.projectPost.findFirst({
        where: { slug, NOT: { id } }
      });
      if (existing) {
        return NextResponse.json({ error: "Slug already exists" }, { status: 400 });
      }
    }

    // Use transaction to handle relations update
    const project = await prisma.$transaction(async (tx) => {
      // 1. Update main fields
      const updated = await tx.projectPost.update({
        where: { id },
        data: {
          title,
          slug,
          excerpt,
          content: content || [],
          featuredImage,
          category,
          difficulty,
          status,
          allowComments,
          publishedAt: status === "PUBLISHED" ? new Date() : null,
        }
      });

      // 2. Handle Components: Delete all existing and recreate (simplest sync strategy)
      if (components) {
        await tx.projectComponent.deleteMany({ where: { projectId: id } });
        if (components.length > 0) {
          await tx.projectComponent.createMany({
            data: components.map((c: any) => ({
              projectId: id,
              name: c.name,
              quantity: c.quantity || 1,
              productId: c.productId || null
            }))
          });
        }
      }

      // 3. Handle Attachments: Delete all existing and recreate
      if (attachments) {
        await tx.projectAttachment.deleteMany({ where: { projectId: id } });
        if (attachments.length > 0) {
          await tx.projectAttachment.createMany({
            data: attachments.map((a: any) => ({
              projectId: id,
              name: a.name,
              url: a.url,
              type: a.type || "file",
              size: a.size || 0
            }))
          });
        }
      }

      return updated;
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error("Error updating project:", error);
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || !session.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await prisma.projectPost.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting project:", error);
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
  }
}
