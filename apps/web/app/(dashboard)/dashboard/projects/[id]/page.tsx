
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { ProjectEditor } from "@/components/projects/ProjectEditor";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface ProjectPageProps {
  params: Promise<{ id: string }>;
}

// Helper to serialize dates for client component
function serializeProject(project: any) {
  return {
    ...project,
    publishedAt: project.publishedAt ? project.publishedAt.toISOString() : null,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
    content: project.content || [],
    components: project.components?.map((c: any) => ({
      ...c,
      createdAt: c.createdAt?.toISOString(),
      updatedAt: c.updatedAt?.toISOString(),
    })) || [],
    attachments: project.attachments?.map((a: any) => ({
      ...a,
      createdAt: a.createdAt?.toISOString(),
      updatedAt: a.updatedAt?.toISOString(),
    })) || [],
  };
}

export default async function ProjectViewPage({ params }: ProjectPageProps) {
  const session = await auth();

  if (!session || !session.user || (session.user.role !== "ADMIN" && session.user.role !== "EDITOR")) {
    redirect("/auth/signin");
  }

  const { id } = await params;

  const project = await prisma.projectPost.findUnique({
    where: { id },
    include: {
      components: true,
      attachments: true,
      author: { select: { name: true, email: true } },
    },
  });

  if (!project) {
    notFound();
  }

  const serializedProject = serializeProject(project);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/projects">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Edit Project</h2>
          <p className="text-muted-foreground">Update tutorial content, blocks, SEO &amp; campaign data</p>
        </div>
      </div>

      <ProjectEditor initialData={serializedProject} />
    </div>
  );
}
