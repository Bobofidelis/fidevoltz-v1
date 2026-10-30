
import { Card, CardContent } from "@/components/ui/card";
import { parseBlocks, readingMinutes } from "@/lib/reading-time";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Clock, TrendingUp, ArrowRight, Search, Calendar, Sparkles } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { FadeIn } from "@/components/ui/motion";
import { ProjectSearch } from "@/components/projects/project-search";
import { AdSlot } from "@/components/ads/AdSlot";


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

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  const { q, category: cat, difficulty: diff, page: p, tag } = await searchParams;
  
  const query = q || "";
  const category = cat || "All";
  const difficulty = diff || "";
  const page = parseInt(p || "1");
  const limit = 8;
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

  // Fetch Data
  const [projects, totalProjects] = await Promise.all([
    prisma.projectPost.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      skip,
      take: limit,
      include: { author: { select: { id: true, name: true, avatar: true } } }
    }),
    prisma.projectPost.count({ where }),
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

  // Active filter state to pass to client component
  const activeFilter = difficulty || category;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="bg-slate-900 text-white py-8 md:py-10 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1600')] bg-cover bg-center opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/90 to-transparent" />
        <div className="container px-4 md:px-6 relative z-10">
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

      <div className="container px-4 md:px-6 py-8 md:py-10">
        <div>
           
           {/* Main Content (3 Columns) */}
           <div className="space-y-4">
              
              {/* Content Top Ad */}
              <AdSlot page="projects" zone="CONTENT_TOP" className="w-full" />

              {/* All Projects Section */}
              <section id="all-projects" className={`space-y-3 transition-all duration-500 ${query ? 'pt-4 min-h-screen' : ''}`}>
                
                {/* Search & Filter Component (Client Side) */}
                <ProjectSearch 
                  initialQuery={query} 
                  initialCategory={category} 
                  initialDifficulty={difficulty}
                  categories={dbCategories} 
                />
                
                {/* Results Count Helper */}
                <div className="mt-3 flex items-center justify-between text-xs text-slate-500 px-1">
                    <span>Found <strong>{totalProjects}</strong> {totalProjects === 1 ? "result" : "results"}</span>
                    <div className="flex items-center gap-2">
                      {query && <span className="text-blue-600 font-medium">Search: "{query}"</span>}
                      {difficulty && <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">{difficulty}</span>}
                      {category !== "All" && !difficulty && <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-medium">{category}</span>}
                    </div>
                </div>

                {/* Projects Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
                  {projects.length > 0 ? (
                    projects.map((project, index) => (
                      <FadeIn key={project.id} delay={index * 0.05}>
                        <Card className="group overflow-hidden border border-slate-200 hover:border-blue-200 hover:shadow-lg transition-all bg-white flex flex-col h-full rounded-xl">
                          <div className="relative h-44 overflow-hidden flex-shrink-0">
                             <div 
                               className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                               style={{ backgroundImage: `url('${project.featuredImage || "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800"}')` }}
                             />
                             <div className="absolute top-3 right-3">
                                <Badge variant="secondary" className="backdrop-blur-md bg-white/90 text-slate-900 shadow-sm border-none">
                                   {project.difficulty || "Intermediate"}
                                </Badge>
                             </div>
                          </div>
                          <CardContent className="p-4 flex flex-col flex-1">
                             <div className="mb-3 flex items-center gap-2">
                                <Badge variant="outline" className="text-xs border-blue-200 text-blue-700 bg-blue-50">
                                   {project.category}
                                </Badge>
                             </div>
                             
                             <Link href={`/projects/${project.slug}`}>
                              <h3 className="font-bold text-lg mb-1.5 text-slate-900 group-hover:text-blue-600 line-clamp-2 leading-snug transition-colors">
                                {project.title}
                              </h3>
                             </Link>
                             
                             <p className="text-slate-700 text-sm mb-3 line-clamp-2 leading-relaxed flex-1">
                               {project.excerpt || "No description available."}
                             </p>
                             
                             <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-auto text-xs text-slate-600">
                                <div className="flex items-center gap-4">
                                  <span className="flex items-center gap-1.5 font-medium">
                                    <Clock className="h-3.5 w-3.5"/>
                                    {readingMinutes(parseBlocks(project.content))} min read
                                  </span>
                                </div>
                                <Link href={`/projects/${project.slug}`} className="text-blue-600 font-semibold hover:text-blue-700 flex items-center gap-1 group/link">
                                  Read Article <ArrowRight className="h-3 w-3 transition-transform group-hover/link:translate-x-1"/>
                                </Link>
                             </div>
                          </CardContent>
                        </Card>
                      </FadeIn>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-8 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                      <p className="text-slate-700 text-lg">No projects match your search.</p>
                      <Link href="/projects" className="mt-2 text-blue-600 inline-block hover:underline">
                        Clear Filters
                      </Link>
                    </div>
                  )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 pt-8">
                     <Link href={`?page=${Math.max(1, page - 1)}&q=${query}&category=${category}&difficulty=${difficulty}`}>
                       <Button variant="outline" disabled={page === 1} className="w-10 h-10 p-0 rounded-full">
                          <ArrowRight className="h-4 w-4 rotate-180" />
                       </Button>
                     </Link>
                     <span className="flex items-center px-4 text-sm font-medium text-slate-600 bg-white border rounded-full">
                       Page {page} of {totalPages}
                     </span>
                     <Link href={`?page=${Math.min(totalPages, page + 1)}&q=${query}&category=${category}&difficulty=${difficulty}`}>
                       <Button variant="outline" disabled={page === totalPages} className="w-10 h-10 p-0 rounded-full">
                          <ArrowRight className="h-4 w-4" />
                       </Button>
                     </Link>
                  </div>
                )}
              </section>
           </div>

        </div>
      </div>
    </div>
  );
}
