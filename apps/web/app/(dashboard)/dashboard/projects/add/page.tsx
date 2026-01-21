"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProjectEditor } from "@/components/projects/ProjectEditor";
import { RoleGuard } from "@/components/guards/role-guard";

export default function AddProjectPage() {
  return (
    <RoleGuard allowedRoles={["ADMIN", "EDITOR"]}>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/projects">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Add Project</h2>
            <p className="text-muted-foreground">Create a new tutorial or project post</p>
          </div>
        </div>

        <ProjectEditor />
      </div>
    </RoleGuard>
  );
}
