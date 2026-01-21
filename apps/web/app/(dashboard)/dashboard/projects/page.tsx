"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Pencil, 
  Trash2,
  Filter,
  Eye,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";

export default function ProjectsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    try {
      const res = await fetch("/api/admin/projects");
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      } else {
        toast.error("Failed to load projects");
      }
    } catch (error) {
      toast.error("Error loading projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      const res = await fetch(`/api/admin/projects/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Project deleted successfully");
        fetchProjects(); // Refresh list
      } else {
        toast.error("Failed to delete project");
      }
    } catch (error) {
      toast.error("Error deleting project");
    }
  };

  const filteredProjects = projects.filter(project => 
    project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Projects</h2>
          <p className="text-muted-foreground">
            Manage tutorials, guides, and project posts.
          </p>
        </div>
        <Link href="/dashboard/projects/add">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Project
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            className="pl-9 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" className="gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </div>

      <div className="rounded-md border bg-white overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="whitespace-nowrap">Title</TableHead>
              <TableHead className="whitespace-nowrap">Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Loading projects...
                </TableCell>
              </TableRow>
            ) : filteredProjects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No projects found. Create your first project!
                </TableCell>
              </TableRow>
            ) : (
              filteredProjects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell className="font-medium whitespace-nowrap flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    {project.title}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">{project.category}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={project.status === "PUBLISHED" ? "default" : "secondary"}
                    >
                      {project.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {project.author?.name || "Unknown"}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {formatDate(project.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                           <Link href={`/projects/${project.slug}`} target="_blank">
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/projects/${project.id}/edit`}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-red-600 focus:text-red-600 cursor-pointer"
                          onClick={() => handleDelete(project.id, project.title)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
