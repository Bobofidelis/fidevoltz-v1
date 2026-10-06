"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { 
  Plus, Search, MoreHorizontal, Pencil, Trash2, Filter, Eye, FileText,
  ChevronDown, X, Star, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";

const DIFFICULTY_OPTIONS = ["Beginner", "Intermediate", "Advanced"];
const STATUS_OPTIONS = ["DRAFT", "PUBLISHED", "ARCHIVED"];

export default function ProjectsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDifficulty, setFilterDifficulty] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterFeatured, setFilterFeatured] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/projects");
      if (res.ok) {
        const data = await res.json();
        const list: any[] = Array.isArray(data) ? data : [];
        setProjects(list);
        // Extract unique categories
        const cats = Array.from(new Set(list.map((p: any) => p.category).filter(Boolean))) as string[];
        setCategories(cats.sort());
      } else {
        toast.error("Failed to load projects");
      }
    } catch {
      toast.error("Error loading projects");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/admin/projects/${id}`, { method: "DELETE" });
      if (res.ok) { toast.success("Project deleted"); fetchProjects(); }
      else toast.error("Failed to delete project");
    } catch { toast.error("Error deleting project"); }
  };

  // Client-side filtering covering title, excerpt, category, tags, difficulty, status, featured
  const filtered = projects.filter(p => {
    const q = searchTerm.toLowerCase().trim();
    const matchSearch = !q ||
      (p.title || "").toLowerCase().includes(q) ||
      (p.excerpt || "").toLowerCase().includes(q) ||
      (p.category || "").toLowerCase().includes(q) ||
      (p.difficulty || "").toLowerCase().includes(q) ||
      (Array.isArray(p.tags) && p.tags.some((t: string) => t.toLowerCase().includes(q)));

    const matchStatus = filterStatus === "all" || p.status === filterStatus;
    const matchDifficulty = filterDifficulty === "all" || p.difficulty === filterDifficulty;
    const matchCategory = filterCategory === "all" || p.category === filterCategory;
    const matchFeatured = !filterFeatured || p.featured;

    return matchSearch && matchStatus && matchDifficulty && matchCategory && matchFeatured;
  });

  const activeFilterCount = [
    filterStatus !== "all",
    filterDifficulty !== "all",
    filterCategory !== "all",
    filterFeatured,
  ].filter(Boolean).length;

  const clearFilters = () => {
    setFilterStatus("all");
    setFilterDifficulty("all");
    setFilterCategory("all");
    setFilterFeatured(false);
  };

  const statusVariant = (s: string) =>
    s === "PUBLISHED" ? "default" : s === "ARCHIVED" ? "destructive" : "secondary";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Projects</h2>
          <p className="text-muted-foreground text-sm mt-1">
            {loading ? "Loading..." : `${filtered.length} of ${projects.length} project${projects.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <Link href="/dashboard/projects/add">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Project
          </Button>
        </Link>
      </div>

      {/* Search + Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search by title, tags, category, excerpt..."
            className="pl-9"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-slate-700 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <Popover open={filterOpen} onOpenChange={setFilterOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2 shrink-0 relative">
              <Filter className="h-4 w-4" />
              Filter
              {activeFilterCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 h-4.5 w-4.5 flex items-center justify-center bg-blue-600 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px]">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4 space-y-4" align="end">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-sm text-slate-900">Filters</h4>
              {activeFilterCount > 0 && (
                <button onClick={clearFilters} className="text-xs text-blue-600 hover:underline">
                  Clear all
                </button>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-600 uppercase tracking-wide">Status</label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {STATUS_OPTIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-600 uppercase tracking-wide">Difficulty</label>
              <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All difficulties</SelectItem>
                  {DIFFICULTY_OPTIONS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-600 uppercase tracking-wide">Category</label>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <input
                type="checkbox"
                id="featured-filter"
                checked={filterFeatured}
                onChange={e => setFilterFeatured(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 accent-blue-600"
              />
              <label htmlFor="featured-filter" className="text-sm font-medium text-slate-700 cursor-pointer flex items-center gap-1.5">
                <Star className="h-3.5 w-3.5 text-amber-500" />
                Featured only
              </label>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Active filter chips */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filterStatus !== "all" && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 text-xs rounded-full font-medium border border-blue-200">
              Status: {filterStatus}
              <button onClick={() => setFilterStatus("all")}><X className="h-3 w-3" /></button>
            </span>
          )}
          {filterDifficulty !== "all" && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-50 text-purple-700 text-xs rounded-full font-medium border border-purple-200">
              {filterDifficulty}
              <button onClick={() => setFilterDifficulty("all")}><X className="h-3 w-3" /></button>
            </span>
          )}
          {filterCategory !== "all" && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-700 text-xs rounded-full font-medium border border-green-200">
              {filterCategory}
              <button onClick={() => setFilterCategory("all")}><X className="h-3 w-3" /></button>
            </span>
          )}
          {filterFeatured && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 text-xs rounded-full font-medium border border-amber-200">
              ⭐ Featured
              <button onClick={() => setFilterFeatured(false)}><X className="h-3 w-3" /></button>
            </span>
          )}
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border bg-white overflow-x-auto shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 hover:bg-slate-50">
              <TableHead className="whitespace-nowrap font-semibold">Title</TableHead>
              <TableHead className="whitespace-nowrap font-semibold">Category</TableHead>
              <TableHead className="whitespace-nowrap font-semibold">Difficulty</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold">Author</TableHead>
              <TableHead className="font-semibold">Date</TableHead>
              <TableHead className="text-right font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-16">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-slate-400" />
                  <p className="text-sm text-muted-foreground mt-2">Loading projects...</p>
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-16 text-muted-foreground">
                  <FileText className="h-10 w-10 mx-auto mb-3 text-slate-200" />
                  <p className="font-medium text-slate-600">
                    {searchTerm || activeFilterCount > 0 ? "No projects match your search." : "No projects yet. Create your first!"}
                  </p>
                  {(searchTerm || activeFilterCount > 0) && (
                    <button onClick={() => { setSearchTerm(""); clearFilters(); }} className="text-sm text-blue-600 hover:underline mt-1">
                      Clear search & filters
                    </button>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((project) => (
                <TableRow key={project.id} className="hover:bg-slate-50/50 transition-colors">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="truncate max-w-[260px] text-slate-900">{project.title}</span>
                      {project.featured && (
                        <span title="Featured" className="text-amber-500 shrink-0">⭐</span>
                      )}
                    </div>
                    {Array.isArray(project.tags) && project.tags.length > 0 && (
                      <div className="flex gap-1 mt-1 flex-wrap ml-6">
                        {project.tags.slice(0, 3).map((tag: string) => (
                          <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded font-mono">
                            {tag}
                          </span>
                        ))}
                        {project.tags.length > 3 && (
                          <span className="text-[10px] text-slate-400">+{project.tags.length - 3}</span>
                        )}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-slate-600">{project.category}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    <Badge variant="outline" className="text-xs font-medium">
                      {project.difficulty || "Intermediate"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(project.status)}>
                      {project.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-slate-600 text-sm">
                    {project.author?.name || "Unknown"}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-slate-500 text-sm">
                    {formatDate(project.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                          <Link href={`/projects/${project.slug}`} target="_blank">
                            <Eye className="mr-2 h-4 w-4" />
                            View Live
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
