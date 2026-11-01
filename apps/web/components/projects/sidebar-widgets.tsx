"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight, List, Clock, TrendingUp, Star, Tag, Gauge, Layers } from "lucide-react";
import { AdSlot } from "@/components/ads/AdSlot";

// ─────────────────────────────────────────────
// Shared data: one request for the whole page, not one per widget
// ─────────────────────────────────────────────
interface SidebarProject {
  id: string;
  title: string;
  slug: string;
  featuredImage?: string | null;
  category?: string | null;
  difficulty?: string | null;
  featured?: boolean;
  publishedAt?: string | null;
  createdAt: string;
}

let projectsRequest: Promise<SidebarProject[]> | null = null;
let projectsRequestedAt = 0;

function fetchAllProjects(): Promise<SidebarProject[]> {
  if (!projectsRequest || Date.now() - projectsRequestedAt > 60_000) {
    projectsRequestedAt = Date.now();
    projectsRequest = fetch("/api/projects?limit=200&published=true")
      .then((r) => r.json())
      .then((data) => {
        const all = data?.data?.data || data?.data || data?.projects || [];
        return Array.isArray(all) ? (all as SidebarProject[]) : [];
      })
      .catch(() => {
        projectsRequest = null;
        return [];
      });
  }
  return projectsRequest;
}

function useProjects() {
  const [projects, setProjects] = useState<SidebarProject[] | null>(null);
  useEffect(() => {
    let alive = true;
    fetchAllProjects().then((p) => alive && setProjects(p));
    return () => {
      alive = false;
    };
  }, []);
  return projects;
}

const formatDate = (p: SidebarProject) =>
  new Date(p.publishedAt || p.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

const difficultyColors: Record<string, string> = {
  Beginner: "bg-emerald-100 text-emerald-700",
  Intermediate: "bg-amber-100 text-amber-700",
  Advanced: "bg-red-100 text-red-700",
};

function WidgetSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <Card className="border-slate-200 shadow-sm">
      <CardContent className="p-4 space-y-3">
        {[...Array(rows)].map((_, i) => (
          <div key={i} className="flex gap-3 animate-pulse">
            <div className="w-16 h-14 bg-slate-200 rounded-lg shrink-0" />
            <div className="flex-1 space-y-2 py-1">
              <div className="h-3 bg-slate-200 rounded w-full" />
              <div className="h-3 bg-slate-200 rounded w-2/3" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function WidgetHeader({ icon: Icon, title, accent = false }: { icon: any; title: string; accent?: boolean }) {
  return (
    <CardHeader className={`py-3 px-4 border-b ${accent ? "bg-gradient-to-r from-blue-600 to-indigo-600 border-b-0" : "bg-slate-50 border-slate-200"}`}>
      <CardTitle className={`text-base font-semibold flex items-center gap-2 ${accent ? "text-white" : "text-slate-800"}`}>
        <Icon className={`h-4 w-4 ${accent ? "text-yellow-300 fill-yellow-300" : "text-blue-600"}`} />
        {title}
      </CardTitle>
    </CardHeader>
  );
}

function PostRow({ post, showMeta = "date" }: { post: SidebarProject; showMeta?: "date" | "badges" }) {
  return (
    <Link href={`/projects/${post.slug}`} className="group flex gap-3 p-3 hover:bg-slate-50 transition-colors">
      {post.featuredImage ? (
        <div
          role="img"
          aria-label={post.title}
          className="w-16 h-14 rounded-lg bg-cover bg-center shrink-0 border border-slate-200 group-hover:border-blue-300 transition-colors"
          style={{ backgroundImage: `url(${post.featuredImage})` }}
        />
      ) : (
        <div className="w-16 h-14 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 shrink-0 flex items-center justify-center">
          <TrendingUp className="h-5 w-5 text-white/80" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 line-clamp-2 leading-snug transition-colors">
          {post.title}
        </h4>
        {showMeta === "date" ? (
          <p className="text-xs text-slate-600 mt-1">{formatDate(post)}</p>
        ) : (
          <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
            {post.category && (
              <span className="text-xs font-medium bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full leading-none">
                {post.category}
              </span>
            )}
            {post.difficulty && (
              <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full leading-none ${difficultyColors[post.difficulty] || "bg-slate-100 text-slate-600"}`}>
                {post.difficulty}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}

// ─────────────────────────────────────────────
// Table of Contents
// ─────────────────────────────────────────────
export function TableOfContents({ title = "Table of Contents" }: { title?: string }) {
  const [headings, setHeadings] = useState<{ id: string; text: string; level: number }[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      // Only scan headings inside the main article content, not sidebar/footer headings
      const container = document.getElementById("article-content") || document;
      const elements = Array.from(container.querySelectorAll("h2, h3, h4"));
      const parsed = elements
        .filter(el => el.textContent && el.textContent.trim().length > 0)
        .map((el, index) => {
          if (!el.id) {
            const text = el.textContent || "";
            el.id = "toc-" + (text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "") || `heading-${index}`);
          }
          return { id: el.id, text: (el.textContent || "").trim(), level: parseInt(el.tagName.replace("H", "")) };
        });
      setHeadings(parsed);
    }, 800); // slight delay to let content render

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (headings.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find(e => e.isIntersecting);
        if (visible) setActiveId(visible.target.id);
      },
      { rootMargin: "-10% 0px -80% 0px" }
    );
    headings.forEach(h => {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <Card className="border-slate-200 shadow-sm overflow-hidden">
      <WidgetHeader icon={List} title={title} />
      <CardContent className="p-0 max-h-[60vh] overflow-y-auto">
        <nav>
          {headings.map((h) => (
            <a
              key={h.id}
              href={`#${h.id}`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(h.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className={`flex items-start gap-2 px-4 py-2 text-sm border-l-2 transition-all hover:bg-blue-50 ${
                activeId === h.id
                  ? "border-blue-500 text-blue-700 font-medium bg-blue-50/60"
                  : "border-transparent text-slate-700 hover:text-slate-900"
              }`}
              style={{ paddingLeft: `${(h.level - 2) * 12 + 16}px` }}
            >
              <span className="line-clamp-2 leading-snug">{h.text}</span>
            </a>
          ))}
        </nav>
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────
// Latest Posts
// ─────────────────────────────────────────────
export function LatestPostsWidget({ title = "Latest Posts", count = 4 }: { title?: string; count?: number }) {
  const projects = useProjects();
  if (!projects) return <WidgetSkeleton />;
  const posts = projects.slice(0, count); // already newest first
  if (!posts.length) return null;

  return (
    <Card className="border-slate-200 shadow-sm overflow-hidden">
      <WidgetHeader icon={Clock} title={title} />
      <CardContent className="p-0 divide-y divide-slate-100">
        {posts.map((post) => (
          <PostRow key={post.id} post={post} />
        ))}
        <div className="p-3 text-center">
          <Link href="/projects" className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center justify-center gap-1">
            View all tutorials <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────
// Featured Posts
// ─────────────────────────────────────────────
export function FeaturedPostsWidget({ title = "Featured Projects", slugs = "" }: { title?: string; slugs?: string }) {
  const projects = useProjects();
  if (!projects) return <WidgetSkeleton />;

  const featured = projects.filter((p) => p.featured);
  const picked = slugs.trim()
    ? (() => {
        const wanted = slugs.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
        const chosen = wanted.map((s) => projects.find((p) => p.slug?.toLowerCase() === s)).filter(Boolean) as SidebarProject[];
        // Nothing matched (typo or unpublished): fall back to whatever is flagged featured
        return chosen.length ? chosen : featured;
      })()
    : featured;
  const posts = picked.slice(0, 5);
  if (!posts.length) return null;

  return (
    <Card className="border-slate-200 shadow-sm overflow-hidden">
      <WidgetHeader icon={Star} title={title} accent />
      <CardContent className="p-0 divide-y divide-slate-100">
        {posts.map((post) => (
          <PostRow key={post.id} post={post} showMeta="badges" />
        ))}
        <div className="p-3 bg-slate-50 text-center">
          <Link href="/projects" className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center justify-center gap-1 transition-colors">
            Browse all tutorials <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────
// Related Posts (same category as the page being read)
// ─────────────────────────────────────────────
export function RelatedPostsWidget({
  title = "Related Tutorials",
  category,
  excludeSlug,
  count = 4,
}: {
  title?: string;
  category?: string | null;
  excludeSlug?: string;
  count?: number;
}) {
  const projects = useProjects();
  // Only meaningful on a tutorial page; on other pages there is nothing to be related to
  if (!category) return null;
  if (!projects) return <WidgetSkeleton />;

  const posts = projects
    .filter((p) => p.category?.toLowerCase() === category.toLowerCase() && p.slug !== excludeSlug)
    .slice(0, count);
  if (!posts.length) return null;

  return (
    <Card className="border-slate-200 shadow-sm overflow-hidden">
      <WidgetHeader icon={Layers} title={title} />
      <CardContent className="p-0 divide-y divide-slate-100">
        {posts.map((post) => (
          <PostRow key={post.id} post={post} showMeta="badges" />
        ))}
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────
// Categories
// ─────────────────────────────────────────────
export function CategoriesWidget({ title = "Categories" }: { title?: string }) {
  const projects = useProjects();
  if (!projects) return <Card className="border-slate-200 shadow-sm h-32 animate-pulse bg-slate-100" />;

  const counts: Record<string, number> = {};
  projects.forEach((p) => {
    if (p.category) counts[p.category] = (counts[p.category] || 0) + 1;
  });
  const categories = Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
  if (!categories.length) return null;

  return (
    <Card className="border-slate-200 shadow-sm overflow-hidden">
      <WidgetHeader icon={Tag} title={title} />
      <CardContent className="p-2">
        {categories.map((cat) => (
          <Link
            key={cat.name}
            href={`/projects?category=${encodeURIComponent(cat.name)}`}
            className="flex justify-between items-center px-3 py-2 rounded-lg hover:bg-slate-50 group transition-colors"
          >
            <span className="text-sm text-slate-800 group-hover:text-blue-600 flex items-center gap-2 transition-colors">
              <ChevronRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-blue-500 transition-colors" />
              {cat.name}
            </span>
            <span className="text-xs font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full group-hover:bg-blue-100 group-hover:text-blue-700 transition-colors">
              {cat.count}
            </span>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────
// Difficulty levels
// ─────────────────────────────────────────────
const LEVELS = [
  { name: "Beginner", dot: "bg-emerald-500", hint: "Start here" },
  { name: "Intermediate", dot: "bg-amber-500", hint: "Some experience" },
  { name: "Advanced", dot: "bg-red-500", hint: "Deep dives" },
];

export function LevelsWidget({ title = "Browse by Level" }: { title?: string }) {
  const projects = useProjects();
  if (!projects) return <Card className="border-slate-200 shadow-sm h-28 animate-pulse bg-slate-100" />;

  const counts: Record<string, number> = {};
  projects.forEach((p) => {
    if (p.difficulty) counts[p.difficulty] = (counts[p.difficulty] || 0) + 1;
  });
  const levels = LEVELS.filter((l) => counts[l.name] > 0);
  if (!levels.length) return null;

  return (
    <Card className="border-slate-200 shadow-sm overflow-hidden">
      <WidgetHeader icon={Gauge} title={title} />
      <CardContent className="p-2">
        {levels.map((level) => (
          <Link
            key={level.name}
            href={`/projects?difficulty=${level.name}`}
            className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 group transition-colors"
          >
            <span className="flex items-center gap-2.5">
              <span className={`h-2.5 w-2.5 rounded-full ${level.dot}`} />
              <span className="text-sm font-medium text-slate-900 group-hover:text-blue-600 transition-colors">{level.name}</span>
              <span className="text-xs text-slate-600 hidden sm:inline">{level.hint}</span>
            </span>
            <span className="text-xs font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full group-hover:bg-blue-100 group-hover:text-blue-700 transition-colors">
              {counts[level.name]}
            </span>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────
// Call to action
// ─────────────────────────────────────────────
export function CtaWidget({
  title = "Want us to build it for you?",
  text = "",
  buttonText = "Get in touch",
  href = "/contact",
}: {
  title?: string;
  text?: string;
  buttonText?: string;
  href?: string;
}) {
  // Only site-internal paths and full web addresses; anything else falls back to the contact page
  const safeHref = /^\/(?!\/)/.test(href) || /^https?:\/\//i.test(href) ? href : "/contact";
  return (
    <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white border-none shadow-sm">
      <CardContent className="p-5">
        <h3 className="text-lg font-bold mb-2">{title}</h3>
        {text && <p className="text-sm text-slate-300 mb-4 leading-relaxed">{text}</p>}
        <Link href={safeHref}>
          <Button variant="secondary" className="w-full font-semibold">
            {buttonText}
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────
// Ad Widget (sidebar)
// ─────────────────────────────────────────────
type AdZone = "POPUP" | "HEADER" | "SIDEBAR_LEFT" | "SIDEBAR_RIGHT" | "CONTENT_TOP" | "CONTENT_MIDDLE" | "CONTENT_BOTTOM" | "FOOTER";

export function AdWidget({ zone = "SIDEBAR_RIGHT", slug }: { zone?: AdZone; slug?: string }) {
  if (!slug) return null;
  // An ad placed in either sidebar zone shows in any sidebar, whichever side that page uses
  const zones: AdZone[] = zone.startsWith("SIDEBAR") ? ["SIDEBAR_RIGHT", "SIDEBAR_LEFT"] : [zone];
  return <AdSlot page={slug} zone={zones} framed className="w-full" />;
}
