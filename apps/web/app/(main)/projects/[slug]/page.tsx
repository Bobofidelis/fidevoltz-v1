import { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Clock, User, Calendar, Signal, ArrowRight } from "lucide-react";
import { BlockRenderer } from "@/components/projects/block-renderer";
import { ProjectSidebar } from "@/components/projects/project-sidebar";
import { PublicSidebarRenderer } from "@/components/projects/PublicSidebarRenderer";
import { CommentSection } from "@/components/comments/CommentSection";
import { ShareBlock } from "@/components/projects/ShareBlock";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { AdSlot } from "@/components/ads/AdSlot";
import { auth } from "@/lib/auth";
import { breadcrumbJsonLd, buildPageMetadata, descriptionFromBlocks, getSiteIdentity, toMetaDescription } from "@/lib/seo";
import { SITE_URL, absoluteUrl } from "@/lib/site";
import { JsonLd } from "@/components/seo/json-ld";
import { parseBlocks, readingMinutes } from "@/lib/reading-time";

// Fetch project from DB
async function getProject(slugOrId: string) {
  let project = await prisma.projectPost.findUnique({
    where: { slug: slugOrId },
    include: {
      author: { select: { id: true, name: true, avatar: true } },
      components: true,
      attachments: true,
    }
  });

  if (!project) {
    project = await prisma.projectPost.findUnique({
      where: { id: slugOrId },
      include: {
        author: { select: { id: true, name: true, avatar: true } },
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

// Generate Metadata for SEO
// Unpublished projects are only viewable by staff (preview)
async function canView(project: { status: string }) {
  if (project.status === "PUBLISHED") return true;
  const session = await auth();
  return session?.user?.role === "ADMIN" || session?.user?.role === "EDITOR";
}

export async function generateMetadata(
  props: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await props.params;
  const project = await getProject(slug);

  if (!project) return { title: "Tutorial Not Found", robots: { index: false } };

  // SEO fields come from the project's "Campaign" tab in the dashboard
  const blocks = parseBlocks(project.content);
  const campaign = blocks.find((b) => b.type === "campaign_data")?.content;
  const description =
    toMetaDescription(campaign?.metaDescription || project.excerpt) ||
    descriptionFromBlocks(blocks) ||
    `${project.title}: step-by-step electronics tutorial.`;

  return buildPageMetadata({
    title: campaign?.metaTitle || project.title,
    description,
    path: `/projects/${project.slug}`,
    image: project.featuredImage,
    type: "article",
    noIndex: project.status !== "PUBLISHED",
    publishedTime: (project.publishedAt || project.createdAt).toISOString(),
    modifiedTime: project.updatedAt.toISOString(),
    authors: project.author?.name ? [project.author.name] : undefined,
    keywords: campaign?.tags ? String(campaign.tags).split(",").map((t: string) => t.trim()).filter(Boolean) : project.tags,
  });
}


const colSpanMap: Record<string, { main: string; aside: string }> = {
  narrow: { main: 'lg:col-span-9 xl:col-span-10', aside: 'lg:col-span-3 xl:col-span-2' },
  normal: { main: 'lg:col-span-8', aside: 'lg:col-span-4' },
  wide: { main: 'lg:col-span-7 xl:col-span-8', aside: 'lg:col-span-5 xl:col-span-4' },
};

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProject(slug);

  if (!project || !(await canView(project))) {
    notFound();
  }

  const relatedProjects = await getRelatedProjects(project.category || "", project.id);

  const allBlocks = parseBlocks(project.content);
  // Campaign data is private marketing material: it must never reach the browser
  const blocks = allBlocks.filter((b) => b.type !== "campaign_data");
  const campaign = allBlocks.find((b) => b.type === "campaign_data")?.content;
  const minutes = readingMinutes(blocks);
  const identity = await getSiteIdentity();

  const projectUrl = absoluteUrl(`/projects/${project.slug}`);
  const articleLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: project.title.slice(0, 110),
    description: toMetaDescription(campaign?.metaDescription || project.excerpt) || descriptionFromBlocks(blocks),
    url: projectUrl,
    mainEntityOfPage: projectUrl,
    ...(project.featuredImage ? { image: [absoluteUrl(project.featuredImage)] } : {}),
    datePublished: (project.publishedAt || project.createdAt).toISOString(),
    dateModified: project.updatedAt.toISOString(),
    author: { "@type": "Person", name: project.author?.name || identity.name },
    publisher: { "@id": `${SITE_URL}/#organization` },
    ...(project.category ? { articleSection: project.category } : {}),
    ...(project.difficulty ? { proficiencyLevel: project.difficulty } : {}),
    timeRequired: `PT${minutes}M`,
  };

  // Parse sidebar settings
  const sidebarBlocks = Array.isArray(project.sidebar) ? (project.sidebar as any[]) : [];
  const settingsBlock = sidebarBlocks.find((b: any) => b.type === 'sidebar_settings');
  const sidebarSide: "left" | "right" = settingsBlock?.content?.side || "right";
  const scrollMode: "sticky" | "scroll" = settingsBlock?.content?.scrollMode === "scroll" ? "scroll" : "sticky";
  const sidebarWidth: "narrow" | "normal" | "wide" = settingsBlock?.content?.width || "normal";
  
  const colSpans = colSpanMap[sidebarWidth] || colSpanMap.normal;

  // Sticky: sidebar sticks at the top as user scrolls (natural, no own scrollbar)
  // Scroll: sidebar just flows normally with the page
  const asideClass = scrollMode === "sticky"
    ? `${colSpans.aside} min-w-0 lg:sticky lg:top-20 lg:self-start`
    : `${colSpans.aside} min-w-0`;

  // Whether there are any custom sidebar blocks to show above the defaults
  const hasCustomSidebar = sidebarBlocks.filter((b: any) => b.type !== 'sidebar_settings').length > 0;

  // Sidebar JSX element
  const sidebarAside = (
    <aside className={asideClass}>
      <div className="space-y-4">
        {/* Custom sidebar blocks from the editor come first */}
        {hasCustomSidebar && (
          <PublicSidebarRenderer blocks={sidebarBlocks} slug={`projects/${project.slug}`} />
        )}
        {/* Default project sidebar (components, downloads, CTA, share) always renders */}
        <ProjectSidebar project={{ slug: project.slug, title: project.title, components: project.components, attachments: project.attachments }} />
      </div>
    </aside>
  );

  return (
    <article className="min-h-screen bg-slate-50">
      <JsonLd data={articleLd} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Tutorials", path: "/projects" },
          ...(project.category ? [{ name: project.category, path: `/projects?category=${project.category.toLowerCase()}` }] : []),
          { name: project.title },
        ])}
      />
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${project.featuredImage || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800'}')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-slate-900/40" />
        
        <div className="relative max-w-[1240px] mx-auto px-4 md:px-6 pt-6 pb-8 md:pt-8 md:pb-10">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-white/70 mb-4 font-medium flex-wrap">
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
          
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 max-w-4xl leading-tight tracking-tight">
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
              <span>{minutes} min read</span>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-8">
        <div className="max-w-[1240px] mx-auto px-4 md:px-6">
          <AdSlot page={`projects/${project.slug}`} zone="HEADER" className="mb-5" />
          
          {/* Grid: sidebar order depends on side setting */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6">
            {/* Left sidebar */}
            {sidebarSide === "left" && sidebarAside}

            {/* Main Content */}
            <div className={`${colSpans.main} min-w-0 space-y-5`}>
               
               {/* Excerpt/Intro */}
               {project.excerpt && (
                  <div className="text-lg leading-relaxed text-slate-700 border-l-4 border-blue-500 bg-white p-4 rounded-r-lg shadow-sm">
                     {project.excerpt}
                  </div>
               )}

               {/* Content Top Ad */}
               <AdSlot page={`projects/${project.slug}`} zone="CONTENT_TOP" className="w-full" />

              <div id="article-content" className="bg-white rounded-xl p-5 md:p-7 shadow-sm border border-slate-100">
                 <BlockRenderer blocks={blocks} slug={project.slug} />
              </div>

              {/* Content Bottom Ad */}
              <AdSlot page={`projects/${project.slug}`} zone="CONTENT_BOTTOM" className="w-full" />

              {/* Tags Section */}
              {(() => {
                const campaignBlock = blocks.find((b: any) => b.type === "campaign_data");
                const tagsStr = campaignBlock?.content?.tags;
                if (!tagsStr) return null;
                const tags = tagsStr.split(",").map((t: string) => t.trim()).filter(Boolean);
                if (tags.length === 0) return null;
                return (
                  <div className="flex flex-wrap gap-2 py-4 border-t border-slate-100">
                    <span className="text-sm font-semibold text-slate-500 flex items-center mr-2">Tags:</span>
                    {tags.map((tag: string) => (
                      <Link key={tag} href={`/projects?tag=${encodeURIComponent(tag)}`}>
                        <Badge variant="secondary" className="hover:bg-blue-100 hover:text-blue-700 transition-colors cursor-pointer">
                          #{tag}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                );
              })()}

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

            {/* Right sidebar */}
            {sidebarSide === "right" && sidebarAside}
          </div>
        </div>
      </section>
    </article>
  );
}
