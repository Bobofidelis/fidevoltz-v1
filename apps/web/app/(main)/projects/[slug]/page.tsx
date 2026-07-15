
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Clock, User, Calendar, Signal, ArrowRight } from "lucide-react";
import { BlockRenderer } from "@/components/projects/block-renderer";
import { ProjectSidebar } from "@/components/projects/project-sidebar";
import { CommentSection } from "@/components/comments/CommentSection";
import { ShareBlock } from "@/components/projects/ShareBlock";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { AdSlot } from "@/components/ads/AdSlot";

// Fetch project from DB
async function getProject(slugOrId: string) {
  let project = await prisma.projectPost.findUnique({
    where: { slug: slugOrId },
    include: {
      author: true,
      components: true,
      attachments: true,
    }
  });

  if (!project) {
    project = await prisma.projectPost.findUnique({
      where: { id: slugOrId },
      include: {
        author: true,
        components: true,
        attachments: true,
      }
    });
  }
  
  return project;
}

// Fetch related projects (same category, exclude current)
async function getRelatedProjects(category: string, excludeId: string) {
  return prisma.projectPost.findMany({
    where: {
      status: "PUBLISHED",
      category: category,
      id: { not: excludeId },
    },
    orderBy: { publishedAt: "desc" },
    take: 3,
    select: {
      id: true,
      slug: true,
      title: true,
      featuredImage: true,
      category: true,
      difficulty: true,
      excerpt: true,
    },
  });
}


export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProject(slug);

  if (!project) {
    notFound();
  }

  const relatedProjects = await getRelatedProjects(project.category || "", project.id);

  // Parse content if it's JSON string, otherwise use as is
  let blocks: any[] = [];
  try {
    if (typeof project.content === 'string') {
      try {
        const parsed = JSON.parse(project.content);
        blocks = Array.isArray(parsed) ? parsed : [{ id: '1', type: 'text', content: project.content }];
      } catch {
        blocks = [{ id: 'legacy-html', type: 'text', content: project.content }];
      }
    } else if (Array.isArray(project.content)) {
      blocks = project.content as any[];
    } else if (project.content && typeof project.content === 'object') {
      blocks = [project.content];
    }
  } catch (e) {
    console.error("Failed to parse project content", e);
  }

  const projectUrl = `https://fidevoltz.com/projects/${project.slug}`;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="relative h-[50vh] min-h-[400px] overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${project.featuredImage || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800'}')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-slate-900/40" />
        
        <div className="relative container px-4 md:px-6 h-full flex flex-col justify-end pb-12">
          <nav className="flex items-center gap-2 text-sm text-white/70 mb-6 font-medium flex-wrap">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span>&gt;</span>
            <Link href="/projects" className="hover:text-white transition-colors">Tutorials</Link>
            {project.category && (
              <>
                <span>&gt;</span>
                <Link href={`/projects?category=${project.category.toLowerCase()}`} className="hover:text-white transition-colors">{project.category}</Link>
              </>
            )}
            <span>&gt;</span>
            <span className="text-white truncate max-w-[200px] md:max-w-md">{project.title}</span>
          </nav>
          
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <Badge className="bg-blue-600 text-white border-none hover:bg-blue-700">
              {project.category}
            </Badge>
            {project.difficulty && (
               <Badge variant="outline" className="text-white border-white/30 backdrop-blur-sm">
                 <Signal className="h-3 w-3 mr-1" />
                 {project.difficulty}
               </Badge>
            )}
            {project.status !== 'PUBLISHED' && (
                <Badge variant="destructive">
                    {project.status}
                </Badge>
            )}
          </div>
          
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-6 max-w-4xl leading-tight">
            {project.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-6 text-slate-300 text-sm md:text-base">
            <div className="flex items-center gap-2">
               <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center border border-slate-600">
                  <User className="h-4 w-4 text-slate-300" />
               </div>
               <span className="font-medium text-white">{project.author?.name || "FideVoltz Team"}</span>
            </div>
            <div className="hidden md:block h-1 w-1 rounded-full bg-slate-500" />
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(project.publishedAt || project.createdAt)}</span>
            </div>
            <div className="hidden md:block h-1 w-1 rounded-full bg-slate-500" />
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>5 min read</span>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="container px-4 md:px-6">
          <AdSlot page={`projects/${project.slug}`} zone="HEADER" className="mb-8" />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
               
               {/* Excerpt/Intro */}
               {project.excerpt && (
                  <div className="text-xl leading-relaxed text-slate-600 font-medium border-l-4 border-blue-500 pl-4 py-1 bg-white p-4 rounded-r-lg shadow-sm">
                     {project.excerpt}
                  </div>
               )}

               {/* Content Top Ad */}
               <AdSlot page={`projects/${project.slug}`} zone="CONTENT_TOP" className="w-full" />

              <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-100">
                 <BlockRenderer blocks={blocks} slug={project.slug} />
              </div>

              {/* Content Bottom Ad */}
              <AdSlot page={`projects/${project.slug}`} zone="CONTENT_BOTTOM" className="w-full" />

              {/* Inline Share block at end of article */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
                <ShareBlock 
                  url={projectUrl} 
                  title={project.title} 
                  variant="row"
                />
              </div>

              {/* Related Projects Grid */}
              {relatedProjects.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <h2 className="text-2xl font-bold text-slate-900">Related Projects</h2>
                    <Link href={`/projects?category=${project.category?.toLowerCase()}`} className="text-sm text-blue-600 font-medium hover:underline flex items-center gap-1">
                      View all <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {relatedProjects.map((rel) => (
                      <Link key={rel.id} href={`/projects/${rel.slug}`} className="group block">
                        <Card className="overflow-hidden h-full border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 bg-white">
                          <div className="relative h-36 overflow-hidden">
                            <div
                              className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                              style={{ backgroundImage: `url('${rel.featuredImage || "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400"}')` }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                            <Badge className="absolute bottom-2 left-2 bg-blue-600/90 text-white border-none text-xs">
                              {rel.category}
                            </Badge>
                          </div>
                          <CardContent className="p-3">
                            <h3 className="font-semibold text-sm text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                              {rel.title}
                            </h3>
                            {rel.difficulty && (
                              <span className="text-xs text-slate-500 mt-1 inline-block">{rel.difficulty}</span>
                            )}
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Comments Section */}
              {project.allowComments && (
                 <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-100">
                    <h3 className="text-2xl font-bold text-slate-900 mb-6">Discussion</h3>
                    <CommentSection postSlug={project.slug} />
                 </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
               <ProjectSidebar project={project} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
