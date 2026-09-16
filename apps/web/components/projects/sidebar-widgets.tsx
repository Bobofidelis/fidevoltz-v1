"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight, List } from "lucide-react";

export function TableOfContents({ title = "Table of Contents" }: { title?: string }) {
  const [headings, setHeadings] = useState<{ id: string; text: string; level: number }[]>([]);

  useEffect(() => {
    // Small delay to let the main content render
    const timer = setTimeout(() => {
      const elements = Array.from(document.querySelectorAll("h2, h3, h4"));
      const parsedHeadings = elements.map((el, index) => {
        if (!el.id) {
          const text = el.textContent || "";
          el.id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') || `heading-${index}`;
        }
        return {
          id: el.id,
          text: el.textContent || "",
          level: parseInt(el.tagName.replace("H", ""))
        };
      });
      setHeadings(parsedHeadings);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  if (headings.length === 0) return null;

  return (
    <Card className="my-6 shadow-sm">
      <CardHeader className="pb-3 border-b border-slate-100">
        <CardTitle className="text-lg flex items-center gap-2">
          <List className="h-5 w-5 text-blue-600" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <ul className="space-y-2 text-sm text-slate-600 font-medium">
          {headings.map((h, i) => (
            <li key={i} style={{ marginLeft: `${(h.level - 2) * 12}px` }}>
              <a 
                href={`#${h.id}`} 
                className="hover:text-blue-600 hover:underline transition-colors block py-1 line-clamp-1"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(h.id)?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                {h.text}
              </a>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

export function LatestPostsWidget({ title = "Latest Posts", count = 3 }: { title?: string, count?: number }) {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/projects?limit=${count}`)
      .then(r => r.json())
      .then(data => {
        setPosts(data?.projects || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [count]);

  if (loading) return <div className="animate-pulse h-32 bg-slate-100 rounded-xl my-6"></div>;
  if (!posts.length) return null;

  return (
    <Card className="my-6 shadow-sm">
      <CardHeader className="pb-3 border-b border-slate-100">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        {posts.map((post: any) => (
          <Link key={post.id} href={`/projects/${post.slug}`} className="group flex gap-3">
            {post.featuredImage && (
              <div 
                className="w-16 h-16 rounded-md bg-cover bg-center shrink-0 border border-slate-200"
                style={{ backgroundImage: `url(${post.featuredImage})` }}
              />
            )}
            <div>
              <h4 className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 line-clamp-2 leading-tight">
                {post.title}
              </h4>
              <p className="text-xs text-slate-500 mt-1">{new Date(post.publishedAt || post.createdAt).toLocaleDateString()}</p>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}

export function FeaturedPostsWidget({ title = "Featured", slugs = "" }: { title?: string, slugs?: string }) {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/projects?limit=5`)
      .then(r => r.json())
      .then(data => {
        const all = data?.projects || [];
        if (slugs.trim().length > 0) {
          const slugList = slugs.split(",").map(s => s.trim().toLowerCase());
          const filtered = all.filter((p: any) => slugList.includes(p.slug.toLowerCase()));
          setPosts(filtered.length > 0 ? filtered : all.slice(0, 3));
        } else {
          setPosts(all.slice(0, 3));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slugs]);

  if (loading) return <div className="animate-pulse h-32 bg-slate-100 rounded-xl my-6"></div>;
  if (!posts.length) return null;

  return (
    <Card className="my-6 shadow-sm bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
      <CardHeader className="pb-3 border-b border-blue-200/50">
        <CardTitle className="text-lg text-blue-900">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        {posts.map((post: any) => (
          <Link key={post.id} href={`/projects/${post.slug}`} className="group block">
            <h4 className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 line-clamp-2 leading-tight">
              {post.title}
            </h4>
            <p className="text-xs text-blue-600/70 mt-1 font-medium">{post.category}</p>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}

export function CategoriesWidget({ title = "Categories" }: { title?: string }) {
  const [categories, setCategories] = useState<{name: string, count: number}[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/projects?limit=50`)
      .then(r => r.json())
      .then(data => {
        const all = data?.projects || [];
        const counts: Record<string, number> = {};
        all.forEach((p: any) => {
          if (p.category) {
            counts[p.category] = (counts[p.category] || 0) + 1;
          }
        });
        const arr = Object.entries(counts).map(([name, count]) => ({ name, count }));
        arr.sort((a, b) => b.count - a.count);
        setCategories(arr.slice(0, 8)); // top 8 categories
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="animate-pulse h-32 bg-slate-100 rounded-xl my-6"></div>;
  if (!categories.length) return null;

  return (
    <Card className="my-6 shadow-sm">
      <CardHeader className="pb-3 border-b border-slate-100">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <ul className="space-y-2">
          {categories.map((cat: any) => (
            <li key={cat.name}>
              <Link href={`/projects?category=${encodeURIComponent(cat.name.toLowerCase())}`} className="flex justify-between items-center group">
                <span className="text-sm text-slate-600 group-hover:text-blue-600 flex items-center gap-1">
                  <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  {cat.name}
                </span>
                <span className="text-xs font-medium bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full group-hover:bg-blue-100 group-hover:text-blue-700">
                  {cat.count}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
