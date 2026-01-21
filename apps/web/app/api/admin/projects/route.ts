
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/projects - List all projects
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const projects = await prisma.projectPost.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: { name: true, email: true }
        }
      }
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error("Error listing projects:", error);
    return NextResponse.json({ error: "Failed to list projects" }, { status: 500 });
  }
}

// POST /api/admin/projects - Create new project
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
      components,   // Array of { name, quantity, productId? }
      attachments   // Array of { name, url, type, size? }
    } = body;

    // Validation
    if (!title || !slug || !category) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check slug uniqueness
    const existing = await prisma.projectPost.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: "Slug already exists" }, { status: 400 });
    }

    const project = await prisma.projectPost.create({
      data: {
        title,
        slug,
        excerpt,
        content: content || [], // Ensure it's an array or object
        featuredImage,
        category,
        difficulty,
        status: status || "DRAFT",
        allowComments: allowComments ?? true,
        authorId: session.user.id,
        publishedAt: status === "PUBLISHED" ? new Date() : null,
        
        // Create components relations
        components: {
          create: components?.map((c: any) => ({
            name: c.name,
            quantity: c.quantity || 1,
            productId: c.productId || null
          })) || []
        },

        // Create attachments relations
        attachments: {
          create: attachments?.map((a: any) => ({
            name: a.name,
            url: a.url,
            type: a.type || "file",
            size: a.size || 0
          })) || []
        }
      }
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}
