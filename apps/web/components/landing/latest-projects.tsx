import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FadeIn } from "@/components/ui/motion";
import Link from "next/link";
import { ArrowRight, Clock, TrendingUp } from "lucide-react";
import { prisma } from "@/lib/prisma";
import type { ProjectPost } from "@fidevoltz/types";

export async function LatestProjects() {
  // Fetch projects directly from Prisma
  const projectsData = await prisma.projectPost.findMany({
    where: { status: 'PUBLISHED' },
    take: 3,
    orderBy: { createdAt: 'desc' },
  });

  // Transform projects data
  const projects = projectsData.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    excerpt: (p.content as any)?.length > 100 
      ? JSON.stringify(p.content).substring(0, 150) + '...' 
      : 'Explore this project to learn more',
    image: p.featuredImage || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800',
    category: p.category || 'Tutorial',
    difficulty: p.difficulty || 'Beginner',
    readTime: '5 min read',
    date: new Date(p.createdAt).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    }),
    trending: true,
  }));

  // Empty state
  if (projects.length === 0) {
    return (
      <section className="py-24 bg-slate-50">
        <div className="container px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Latest Projects
            </h2>
            <p className="text-lg text-slate-600 mb-8">
              No projects available yet. Check back soon for exciting tutorials and guides!
            </p>
            <Link href="/projects">
              <Button size="lg" className="bg-slate-900 hover:bg-slate-800">
                View All Projects
              </Button>
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 bg-slate-50">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-4">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-2">Trending Projects</h2>
            <p className="text-slate-600">Popular tutorials this week</p>
          </div>
          <Link href="/projects">
            <Button variant="outline" className="group border-slate-300 hover:bg-slate-900 hover:text-white hover:border-slate-900">
              View All Projects
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <FadeIn key={project.id} delay={index * 0.1}>
              <Card className="group overflow-hidden border-slate-200 hover:shadow-2xl hover:shadow-slate-300/50 transition-all hover:-translate-y-2 bg-white flex flex-col h-full">
                {/* Project Image */}
                <div className="relative h-48 overflow-hidden flex-shrink-0">
                  <div 
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                    style={{ backgroundImage: `url('${project.image}')` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                  
                  {/* Category Badge */}
                  <div className="absolute top-4 left-4">
                    <div className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm">
                      <span className="text-xs font-semibold text-slate-900">{project.category}</span>
                    </div>
                  </div>

                  {/* Difficulty Badge (Only show if different from category) */}
                  {project.difficulty && project.difficulty.toLowerCase() !== project.category.toLowerCase() && (
                    <div className="absolute top-4 right-4">
                      <div className="px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-sm">
                        <span className="text-xs font-semibold text-white">{project.difficulty}</span>
                      </div>
                    </div>
                  )}
                </div>

                <CardContent className="p-6 flex flex-col flex-1">
                  <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {project.title}
                  </h3>
                  
                  <p className="text-slate-600 mb-4 line-clamp-2 flex-1">
                    {project.excerpt}
                  </p>

                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{project.readTime}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4" />
                        <span>Popular</span>
                      </div>
                    </div>
                    
                    <Link href={`/projects/${project.slug}`}>
                      <Button variant="ghost" size="sm" className="group/btn hover:bg-slate-100">
                        Read
                        <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
