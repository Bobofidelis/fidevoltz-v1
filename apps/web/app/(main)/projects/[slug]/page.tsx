
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Clock, ArrowLeft, User, Calendar, Signal } from "lucide-react";
import { BlockRenderer } from "@/components/projects/block-renderer";
import { ProjectSidebar } from "@/components/projects/project-sidebar";
import { CommentSection } from "@/components/comments/CommentSection";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

// Fetch project from DB
async function getProject(slugOrId: string) {
  // Try finding by slug first (preferred)
  let project = await prisma.projectPost.findUnique({
    where: { slug: slugOrId },
    include: {
      author: true,
      components: true,
      attachments: true,
    }
  });

  // Fallback: Try finding by ID if not found by slug (for legacy/notification links)
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


export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProject(slug);

  if (!project) {
    notFound();
  }

  // Parse content if it's JSON string, otherwise use as is
  let blocks = [];
  try {
    if (typeof project.content === 'string') {
      try {
        const parsed = JSON.parse(project.content);
        // Ensure blocks is an array. If not (e.g. single string in valid JSON), wrap it.
        blocks = Array.isArray(parsed) ? parsed : [{ id: '1', type: 'text', content: project.content }];
      } catch {
        // Not valid JSON, likely raw HTML from seed or legacy data
        blocks = [{ id: 'legacy-html', type: 'text', content: project.content }];
      }
    } else if (Array.isArray(project.content)) {
      blocks = project.content;
    } else if (project.content && typeof project.content === 'object') {
      // It's a single JSON object, wrap it in an array
      blocks = [project.content];
    }
  } catch (e) {
    console.error("Failed to parse project content", e);
  }

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
          <Link href="/projects" className="inline-flex items-center text-white/80 hover:text-white mb-6 group w-fit">
            <ArrowLeft className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
            Back to Projects
          </Link>
          
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
               
               {/* Excerpt/Intro */}
               {project.excerpt && (
                  <div className="text-xl leading-relaxed text-slate-600 font-medium border-l-4 border-blue-500 pl-4 py-1 bg-white p-4 rounded-r-lg shadow-sm">
                     {project.excerpt}
                  </div>
               )}

              <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-100">
                 <BlockRenderer blocks={blocks} />
              </div>
              
              {/* Comments Section */}
              {project.allowComments && (
                 <div className="mt-12 bg-white rounded-xl p-8 shadow-sm border border-slate-100">
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
