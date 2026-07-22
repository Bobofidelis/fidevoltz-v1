
import { Card, CardContent } from "@/components/ui/card";
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
    page?: string;
    tag?: string;
  }>;
}

export const revalidate = 60; // Revalidate every minute

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  const { q, category: cat, page: p } = await searchParams;
  
  const query = q || "";
  const category = cat || "All";
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
    ];
  }

  if (category && category !== "All") {
    where.category = category;
  }

  // Handle tag filtering by fetching matching IDs first if tag is present
  // Since content is a JSON array, Prisma filtering is complex. 
  // We'll fetch all PUBLISHED projects and filter their content array in memory for the tag, 
  // then restrict the main query to those IDs.
  const { tag } = await searchParams;
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
  const [projects, totalProjects, latestProjects] = await Promise.all([
    prisma.projectPost.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      skip,
      take: limit,
      include: { author: true }
    }),
    prisma.projectPost.count({ where }),
    prisma.projectPost.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      take: 3,
    })
  ]);

  const totalPages = Math.ceil(totalProjects / limit);

  // Get unique categories for filter
  // Ideally this should be a separate query or aggregated, but simplified for now
  // We can hardcode common categories or fetch distinct
  const categories = ["All", "Beginner", "Intermediate", "Advanced", "IoT", "Robotics", "Automation", "Sensors", "Programming"];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="bg-slate-900 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1600')] bg-cover bg-center opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/90 to-transparent" />
        <div className="container px-4 md:px-6 relative z-10">
          <Badge className="mb-6 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border-blue-500/20 px-3 py-1">
            <Sparkles className="w-3 h-3 mr-2" />
            Tutorials & Guides
          </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight leading-tight">
            Master the Art of <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Electronics Engineering</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl leading-relaxed mb-8">
            Step-by-step guides, project ideas, and technical documentation to help you build your next big invention.
          </p>
        </div>
      </section>

      <div className="container px-4 md:px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
           
           {/* Main Content (3 Columns) */}
           <div className="lg:col-span-3 space-y-16">
              
              {/* Content Top Ad */}
              <AdSlot page="projects" zone="CONTENT_TOP" className="w-full" />

              {/* Latest Projects Section (Hidden when searching) */}
              {!query && page === 1 && latestProjects.length > 0 && (
                <section className="space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-blue-600" />
                      Fresh Off the Press
                    </h2>
                    <span className="text-sm text-slate-500">Recently Published</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {latestProjects.map((project, index) => (
                      <FadeIn key={project.id} delay={index * 0.1}>
                        <Link href={`/projects/${project.slug}`} className="group block h-full">
                          <Card className="h-full overflow-hidden border-none shadow-md hover:shadow-xl transition-all duration-300 bg-white ring-1 ring-slate-200/50 hover:ring-blue-500/20">
                            <div className="relative h-48 overflow-hidden">
                              <div 
                                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                                style={{ backgroundImage: `url('${project.featuredImage || "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800"}')` }}
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                              <Badge className="absolute top-3 right-3 bg-blue-600 text-white border-none shadow-sm">
                                New
                              </Badge>
                              <Badge className="absolute bottom-3 left-3 bg-white/90 text-slate-900 backdrop-blur-sm shadow-sm border-none">
                                {project.category}
                              </Badge>
                            </div>
                            <CardContent className="p-5">
                              <h3 className="font-bold text-lg mb-2 text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                                {project.title}
                              </h3>
                            </CardContent>
                          </Card>
                        </Link>
                      </FadeIn>
                    ))}
                  </div>
                </section>
              )}

              {/* All Projects Section */}
              <section id="all-projects" className={`space-y-6 transition-all duration-500 ${query ? 'pt-4 min-h-screen' : ''}`}>
                
                {/* Search Component (Client Side) */}
                <ProjectSearch initialQuery={query} initialCategory={category} categories={categories} />
                
                {/* Results Count Helper */}
                <div className="mt-3 flex items-center justify-between text-xs text-slate-500 px-1">
                    <span>Found {totalProjects} results</span>
                    {query && <span className="text-blue-600 font-medium">Searching for "{query}"</span>}
                </div>

                {/* Projects Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  {projects.length > 0 ? (
                    projects.map((project, index) => (
                      <FadeIn key={project.id} delay={index * 0.05}>
                        <Card className="group overflow-hidden border border-slate-200 hover:border-blue-200 hover:shadow-lg transition-all bg-white flex flex-col h-full rounded-xl">
                          <div className="relative h-56 overflow-hidden flex-shrink-0">
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
                          <CardContent className="p-6 flex flex-col flex-1">
                             <div className="mb-3 flex items-center gap-2">
                                <Badge variant="outline" className="text-xs border-blue-200 text-blue-700 bg-blue-50">
                                   {project.category}
                                </Badge>
                             </div>
                             
                             <Link href={`/projects/${project.slug}`}>
                              <h3 className="font-bold text-xl mb-3 text-slate-900 group-hover:text-blue-600 line-clamp-2 leading-snug transition-colors">
                                {project.title}
                              </h3>
                             </Link>
                             
                             <p className="text-slate-600 text-sm mb-6 line-clamp-3 leading-relaxed flex-1">
                               {project.excerpt || "No description available."}
                             </p>
                             
                             <div className="pt-5 border-t border-slate-100 flex items-center justify-between mt-auto text-xs text-slate-500">
                                <div className="flex items-center gap-4">
                                  <span className="flex items-center gap-1.5 font-medium"><Clock className="h-3.5 w-3.5"/> 5 min read</span>
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
                    <div className="col-span-full text-center py-20 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                      <p className="text-slate-500 text-lg">No projects match your search.</p>
                      <Link href="/projects" className="mt-2 text-blue-600 inline-block hover:underline">
                        Clear Filters
                      </Link>
                    </div>
                  )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 pt-12">
                     <Link href={`?page=${Math.max(1, page - 1)}&q=${query}&category=${category}`}>
                       <Button variant="outline" disabled={page === 1} className="w-10 h-10 p-0 rounded-full">
                          <ArrowRight className="h-4 w-4 rotate-180" />
                       </Button>
                     </Link>
                     <span className="flex items-center px-4 text-sm font-medium text-slate-600 bg-white border rounded-full">
                       Page {page} of {totalPages}
                     </span>
                     <Link href={`?page=${Math.min(totalPages, page + 1)}&q=${query}&category=${category}`}>
                       <Button variant="outline" disabled={page === totalPages} className="w-10 h-10 p-0 rounded-full">
                          <ArrowRight className="h-4 w-4" />
                       </Button>
                     </Link>
                  </div>
                )}
              </section>
           </div>

           {/* Sidebar (Right Side - 1 Column) */}
           <aside className="hidden lg:block lg:col-span-1 space-y-6 pl-6 border-l border-slate-200">
              {/* Popular Posts */}
              <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                 <h3 className="font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-orange-600" />
                    Latest
                 </h3>
                 <div className="space-y-3">
                    {latestProjects.slice(0, 3).map((project, idx) => (
                       <Link 
                          key={project.id} 
                          href={`/projects/${project.slug}`}
                          className="group block"
                       >
                          <div className="flex gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors">
                             <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                                #{idx + 1}
                             </div>
                             <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-sm text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-tight">
                                   {project.title}
                                </h4>
                             </div>
                          </div>
                       </Link>
                    ))}
                 </div>
              </div>
              {/* Other sidebar items maintained */}
           </aside>
        </div>
      </div>
    </div>
  );
}
