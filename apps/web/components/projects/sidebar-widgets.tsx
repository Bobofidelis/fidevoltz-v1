"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, List, Clock, TrendingUp, Star, Tag, Megaphone } from "lucide-react";
import { AdSlot } from "@/components/ads/AdSlot";

// ─────────────────────────────────────────────
// Table of Contents
// ─────────────────────────────────────────────
export function TableOfContents({ title = "Table of Contents" }: { title?: string }) {
  const [headings, setHeadings] = useState<{ id: string; text: string; level: number }[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      const elements = Array.from(document.querySelectorAll("h2, h3, h4"));
      const parsed = elements
        .filter(el => el.textContent && el.textContent.trim().length > 0)
        .map((el, index) => {
          if (!el.id) {
            const text = el.textContent || "";
            el.id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "") || `heading-${index}`;
          }
          return { id: el.id, text: (el.textContent || "").trim(), level: parseInt(el.tagName.replace("H", "")) };
        });
      setHeadings(parsed);
    }, 600);

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
      <CardHeader className="py-3 px-4 bg-slate-50 border-b border-slate-200">
        <CardTitle className="text-sm font-semibold flex items-center gap-2 text-slate-700">
          <List className="h-4 w-4 text-blue-500" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
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
                  : "border-transparent text-slate-600 hover:text-slate-900"
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
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/projects?limit=${count}&published=true`)
      .then((r) => r.json())
      .then((data) => {
        // API returns { success: true, data: { data: [...], pagination: {} } }
        const posts = data?.data?.data || data?.data || data?.projects || [];
        setPosts(Array.isArray(posts) ? posts : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [count]);

  if (loading) {
    return (
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-4 space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="w-14 h-14 bg-slate-200 rounded-lg shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-slate-200 rounded w-full" />
                <div className="h-3 bg-slate-200 rounded w-2/3" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }
  if (!posts.length) return null;

  return (
    <Card className="border-slate-200 shadow-sm overflow-hidden">
      <CardHeader className="py-3 px-4 bg-slate-50 border-b border-slate-200">
        <CardTitle className="text-sm font-semibold flex items-center gap-2 text-slate-700">
          <Clock className="h-4 w-4 text-blue-500" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 divide-y divide-slate-100">
        {posts.map((post: any) => (
          <Link key={post.id} href={`/projects/${post.slug}`} className="group flex gap-3 p-4 hover:bg-slate-50 transition-colors">
            {post.featuredImage ? (
              <div
                className="w-14 h-14 rounded-lg bg-cover bg-center shrink-0 border border-slate-200 group-hover:border-blue-300 transition-colors"
                style={{ backgroundImage: `url(${post.featuredImage})` }}
              />
            ) : (
              <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 shrink-0 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-slate-400" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-slate-800 group-hover:text-blue-600 line-clamp-2 leading-snug transition-colors">
                {post.title}
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                {new Date(post.publishedAt || post.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
              </p>
            </div>
          </Link>
        ))}
        <div className="p-3 text-center">
          <Link href="/projects" className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center justify-center gap-1">
            View all tutorials <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────
// Featured Posts
// ─────────────────────────────────────────────
export function FeaturedPostsWidget({ title = "Featured", slugs = "" }: { title?: string; slugs?: string }) {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/projects?limit=50&published=true`)
      .then((r) => r.json())
      .then((data) => {
        const all: any[] = data?.data?.data || data?.data || data?.projects || [];
        if (!Array.isArray(all)) { setLoading(false); return; }
        if (slugs.trim()) {
          const slugList = slugs.split(",").map((s) => s.trim().toLowerCase());
          const filtered = all.filter((p) => slugList.includes(p.slug?.toLowerCase()));
          setPosts(filtered.length > 0 ? filtered : all.slice(0, 3));
        } else {
          setPosts(all.slice(0, 3));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slugs]);

  if (loading) return <Card className="border-slate-200 shadow-sm h-32 animate-pulse bg-slate-100" />;
  if (!posts.length) return null;

  return (
    <Card className="border-slate-200 shadow-sm overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
      <CardHeader className="py-3 px-4 border-b border-white/20">
        <CardTitle className="text-sm font-semibold flex items-center gap-2 text-white">
          <Star className="h-4 w-4 text-yellow-300" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 divide-y divide-white/10">
        {posts.map((post: any) => (
          <Link key={post.id} href={`/projects/${post.slug}`} className="group block p-4 hover:bg-white/10 transition-colors">
            <h4 className="text-sm font-medium text-white group-hover:text-yellow-300 line-clamp-2 leading-snug transition-colors">
              {post.title}
            </h4>
            {post.category && (
              <Badge className="mt-2 text-[10px] bg-white/20 text-white border-none hover:bg-white/30">
                {post.category}
              </Badge>
            )}
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────
// Categories
// ─────────────────────────────────────────────
export function CategoriesWidget({ title = "Categories" }: { title?: string }) {
  const [categories, setCategories] = useState<{ name: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/projects?limit=200&published=true`)
      .then((r) => r.json())
      .then((data) => {
        const all: any[] = data?.data?.data || data?.data || data?.projects || [];
        if (!Array.isArray(all)) { setLoading(false); return; }
        const counts: Record<string, number> = {};
        all.forEach((p) => {
          if (p.category) counts[p.category] = (counts[p.category] || 0) + 1;
        });
        const arr = Object.entries(counts)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);
        setCategories(arr);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <Card className="border-slate-200 shadow-sm h-32 animate-pulse bg-slate-100" />;
  if (!categories.length) return null;

  return (
    <Card className="border-slate-200 shadow-sm overflow-hidden">
      <CardHeader className="py-3 px-4 bg-slate-50 border-b border-slate-200">
        <CardTitle className="text-sm font-semibold flex items-center gap-2 text-slate-700">
          <Tag className="h-4 w-4 text-blue-500" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3">
        <div className="space-y-1">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              href={`/projects?category=${encodeURIComponent(cat.name.toLowerCase())}`}
              className="flex justify-between items-center px-3 py-2 rounded-lg hover:bg-slate-50 group transition-colors"
            >
              <span className="text-sm text-slate-600 group-hover:text-blue-600 flex items-center gap-2 transition-colors">
                <ChevronRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-blue-400 transition-colors" />
                {cat.name}
              </span>
              <span className="text-xs font-medium bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full group-hover:bg-blue-100 group-hover:text-blue-700 transition-colors">
                {cat.count}
              </span>
            </Link>
          ))}
        </div>
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
  return (
    <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm">
      <AdSlot page={`projects/${slug}`} zone={zone} className="w-full" />
    </div>
  );
}
