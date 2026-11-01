import { Card, CardContent } from "@/components/ui/card";
import { parseBlocks, readingMinutes } from "@/lib/reading-time";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Clock, ArrowRight, Calendar, Sparkles } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { FadeIn } from "@/components/ui/motion";
import { ProjectSearch } from "@/components/projects/project-search";
import { AdSlot } from "@/components/ads/AdSlot";
import { PublicSidebarRenderer } from "@/components/projects/PublicSidebarRenderer";
import { getListingSidebar } from "@/lib/sidebar-server";
import { getSidebarLayout } from "@/lib/sidebar-layout";

interface ProjectsPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    difficulty?: string;
    page?: string;
    tag?: string;
  }>;
}

export const revalidate = 60; // Revalidate every minute

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800";

const CARD_SELECT = {
  id: true,
  title: true,
  slug: true,
  excerpt: true,
  featuredImage: true,
  category: true,
  difficulty: true,
  publishedAt: true,
  createdAt: true,
  content: true,
} as const;

type CardProject = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featuredImage: string | null;
  category: string;
  difficulty: string | null;
  publishedAt: Date | null;
  createdAt: Date;
  content: unknown;
};

const formatDate = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

function ProjectCard({ project, isNew = false }: { project: CardProject; isNew?: boolean }) {
  return (
    <Card className="group overflow-hidden border border-slate-200 hover:border-blue-200 hover:shadow-lg transition-all bg-white flex flex-col h-full rounded-xl">
      <Link href={`/projects/${project.slug}`} className="relative block h-44 overflow-hidden flex-shrink-0" tabIndex={-1} aria-hidden="true">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
          style={{ backgroundImage: `url('${project.featuredImage || FALLBACK_IMAGE}')` }}
        />
        {isNew && (
          <Badge className="absolute top-3 left-3 bg-blue-600 text-white border-none shadow-sm">New</Badge>
        )}
        {project.difficulty && (
          <Badge variant="secondary" className="absolute top-3 right-3 backdrop-blur-md bg-white/90 text-slate-900 shadow-sm border-none">
            {project.difficulty}
          </Badge>
        )}
      </Link>
      <CardContent className="p-4 flex flex-col flex-1">
        <Badge variant="outline" className="mb-2 w-fit text-xs border-blue-200 text-blue-700 bg-blue-50">
          {project.category}
        </Badge>
        <Link href={`/projects/${project.slug}`}>
          <h3 className="font-bold text-lg mb-1.5 text-slate-900 group-hover:text-blue-600 line-clamp-2 leading-snug transition-colors">
            {project.title}
          </h3>
        </Link>
        <p className="text-slate-700 text-sm mb-3 line-clamp-2 leading-relaxed flex-1">
          {project.excerpt || "Step-by-step electronics tutorial."}
        </p>
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-auto text-xs text-slate-600">
          <span className="flex items-center gap-1.5 font-medium">
            <Clock className="h-3.5 w-3.5" />
            {readingMinutes(parseBlocks(project.content))} min read
            <span className="text-slate-400">·</span>
            {formatDate(project.publishedAt || project.createdAt)}
          </span>
          <Link href={`/projects/${project.slug}`} className="text-blue-600 font-semibold hover:text-blue-700 flex items-center gap-1 group/link">
            Read <ArrowRight className="h-3 w-3 transition-transform group-hover/link:translate-x-1" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  const { q, category: cat, difficulty: diff, page: p, tag } = await searchParams;

  const query = q || "";
  const category = cat || "All";
  const difficulty = diff || "";
  const page = Math.max(parseInt(p || "1") || 1, 1);
  const limit = 9;
  const skip = (page - 1) * limit;

  // Build filter
  const where: any = {
    status: "PUBLISHED",
  };

  if (query) {
    where.OR = [
      { title: { contains: query, mode: "insensitive" } },
      { excerpt: { contains: query, mode: "insensitive" } },
      { category: { contains: query, mode: "insensitive" } },
      { tags: { has: query } },
    ];
  }

  // Category filter only applies to real categories (not difficulty levels)
  if (category && category !== "All") {
    where.category = category;
  }

  // Difficulty filter — Beginner/Intermediate/Advanced filter by the difficulty column
  if (difficulty) {
    where.difficulty = { equals: difficulty, mode: "insensitive" };
  }

  // Handle tag filtering
  if (tag) {
    const allPublished = await prisma.projectPost.findMany({
      where: { status: "PUBLISHED" },
      select: { id: true, content: true }
    });

    const matchingIds = allPublished.filter(p => {
      if (!p.content) return false;
      const blocks = p.content as any[];
      const campaignBlock = blocks.find(b => b.type === "campaign_data");
      if (!campaignBlock?.content?.tags) return false;
      const tags = campaignBlock.content.tags.toLowerCase().split(",").map((t: string) => t.trim());
      return tags.includes(tag.toLowerCase());
    }).map(p => p.id);

    where.id = { in: matchingIds };
  }

  const isFiltered = !!(query || difficulty || tag || (category && category !== "All"));

  // The newest tutorials get their own section, and are left out of the full list below so nothing repeats
  const latestProjects: CardProject[] = isFiltered
    ? []
    : await prisma.projectPost.findMany({
        where: { status: "PUBLISHED" },
        orderBy: { publishedAt: "desc" },
        take: 3,
        select: CARD_SELECT,
      });
  if (latestProjects.length > 0) {
    where.id = { notIn: latestProjects.map((l) => l.id) };
  }

  // Fetch Data
  const [projects, totalProjects, sidebarBlocks] = await Promise.all([
    prisma.projectPost.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      skip,
      take: limit,
      select: CARD_SELECT,
    }),
    prisma.projectPost.count({ where }),
    getListingSidebar(),
  ]);

  const totalPages = Math.ceil(totalProjects / limit);

  // Get unique real categories from DB (excludes difficulty values)
  const difficultyLevels = ["Beginner", "Intermediate", "Advanced"];
  const distinctCats = await prisma.projectPost.findMany({
    select: { category: true },
    where: { status: "PUBLISHED" },
    distinct: ["category"]
  });

  const dbCategories = distinctCats
    .map(c => c.category)
    .filter(c => c && !difficultyLevels.includes(c))
    .sort();

  const layout = getSidebarLayout(sidebarBlocks);
  const hasSidebar = sidebarBlocks.some((b) => b.type !== "sidebar_settings");

  const pageHref = (n: number) => {
    const params = new URLSearchParams();
    if (n > 1) params.set("page", String(n));
    if (query) params.set("q", query);
    if (category && category !== "All") params.set("category", category);
    if (difficulty) params.set("difficulty", difficulty);
    if (tag) params.set("tag", tag);
    const qs = params.toString();
    return qs ? `/projects?${qs}` : "/projects";
  };

  const sidebar = hasSidebar ? (
    <aside className={layout.asideClass} aria-label="Sidebar">
      <PublicSidebarRenderer blocks={sidebarBlocks} slug="projects" />
    </aside>
  ) : null;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="bg-slate-900 text-white py-8 md:py-10 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1600')] bg-cover bg-center opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/90 to-transparent" />
        <div className="container px-4 md:px-6 lg:px-8 relative z-10">
          <Badge className="mb-3 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border-blue-500/20 px-3 py-1">
            <Sparkles className="w-3 h-3 mr-2" />
            Tutorials & Guides
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold mb-3 tracking-tight leading-tight">
            Master the Art of <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Electronics Engineering</span>
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl leading-relaxed">
            Step-by-step guides, project ideas, and technical documentation to help you build your next big invention.
          </p>
        </div>
      </section>

      <div className="container px-4 md:px-6 lg:px-8 py-6">
        <div className={hasSidebar ? layout.gridClass : ""} style={hasSidebar ? layout.style : undefined}>
          {layout.side === "left" && sidebar}

          <div className="min-w-0 space-y-6">
            {/* Content Top Ad */}
            <AdSlot page="projects" zone="CONTENT_TOP" className="w-full" />

            {/* Latest tutorials: separate from the full list (hidden while searching or filtering) */}
            {page === 1 && latestProjects.length > 0 && (
              <section aria-labelledby="latest-heading" className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <h2 id="latest-heading" className="text-xl md:text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    Latest Tutorials
                  </h2>
                  <span className="text-sm text-slate-600">Fresh off the press</span>
                </div>
                <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-4">
                  {latestProjects.map((project, index) => (
                    <FadeIn key={project.id} delay={index * 0.08}>
                      <ProjectCard project={project} isNew />
                    </FadeIn>
                  ))}
                </div>
              </section>
            )}

            {/* All tutorials */}
            <section id="all-projects" aria-labelledby="all-heading" className="space-y-3">
              <h2 id="all-heading" className="text-xl md:text-2xl font-bold text-slate-900 border-b border-slate-200 pb-3">
                {isFiltered ? "Search results" : "All Tutorials"}
              </h2>

              {/* Search & Filter Component (Client Side) */}
              <ProjectSearch
                initialQuery={query}
                initialCategory={category}
                initialDifficulty={difficulty}
                categories={dbCategories}
              />

              <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-slate-700 px-1">
                <span>
                  {totalProjects === 0
                    ? "No tutorials found"
                    : `Showing ${skip + 1}–${Math.min(skip + limit, totalProjects)} of ${totalProjects} ${isFiltered ? (totalProjects === 1 ? "result" : "results") : "tutorials"}`}
                </span>
                <div className="flex items-center gap-2">
                  {query && <span className="text-blue-700 font-medium">Search: &ldquo;{query}&rdquo;</span>}
                  {difficulty && <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-medium">{difficulty}</span>}
                  {category !== "All" && !difficulty && <span className="bg-slate-200 text-slate-800 px-2 py-0.5 rounded-full font-medium">{category}</span>}
                </div>
              </div>

              {/* Projects Grid */}
              <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
                {projects.length > 0 ? (
                  projects.map((project, index) => (
                    <FadeIn key={project.id} delay={index * 0.04}>
                      <ProjectCard project={project} />
                    </FadeIn>
                  ))
                ) : (
                  <div className="col-span-full text-center py-8 bg-white rounded-lg border border-dashed border-slate-300">
                    <p className="text-slate-800 text-lg">No tutorials match your search.</p>
                    <Link href="/projects" className="mt-2 text-blue-600 inline-block hover:underline">
                      Clear filters
                    </Link>
                  </div>
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <nav aria-label="Pagination" className="flex justify-center items-center gap-2 pt-4">
                  <Link href={pageHref(Math.max(1, page - 1))} aria-label="Previous page" aria-disabled={page === 1} className={page === 1 ? "pointer-events-none opacity-50" : ""}>
                    <Button variant="outline" tabIndex={-1} className="w-10 h-10 p-0 rounded-full">
                      <ArrowRight className="h-4 w-4 rotate-180" />
                    </Button>
                  </Link>
                  <span className="flex items-center px-4 h-10 text-sm font-medium text-slate-700 bg-white border rounded-full">
                    Page {page} of {totalPages}
                  </span>
                  <Link href={pageHref(Math.min(totalPages, page + 1))} aria-label="Next page" aria-disabled={page === totalPages} className={page === totalPages ? "pointer-events-none opacity-50" : ""}>
                    <Button variant="outline" tabIndex={-1} className="w-10 h-10 p-0 rounded-full">
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </nav>
              )}
            </section>
          </div>

          {layout.side === "right" && sidebar}
        </div>
      </div>
    </div>
  );
}
