"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const DIFFICULTY_LEVELS = ["Beginner", "Intermediate", "Advanced"];

interface ProjectSearchProps {
  initialQuery: string;
  initialCategory: string;
  initialDifficulty: string;
  categories: string[]; // real DB categories only, no difficulty levels
}

export function ProjectSearch({ initialQuery, initialCategory, initialDifficulty, categories }: ProjectSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [difficulty, setDifficulty] = useState(initialDifficulty);

  // Debounce text search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query !== initialQuery) {
        pushParams(query, category, difficulty);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [query]);

  const pushParams = (q: string, cat: string, diff: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (q) params.set("q", q); else params.delete("q");
    if (cat && cat !== "All") params.set("category", cat); else params.delete("category");
    if (diff) params.set("difficulty", diff); else params.delete("difficulty");
    params.set("page", "1");

    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleCategoryClick = (cat: string) => {
    const newCat = cat === "All" ? "All" : (category === cat ? "All" : cat);
    setCategory(newCat);
    // When picking a category, clear difficulty
    setDifficulty("");
    pushParams(query, newCat, "");
  };

  const handleDifficultyClick = (diff: string) => {
    const newDiff = difficulty === diff ? "" : diff;
    setDifficulty(newDiff);
    // When picking difficulty, clear category
    setCategory("All");
    pushParams(query, "All", newDiff);
  };

  const clearAll = () => {
    setQuery("");
    setCategory("All");
    setDifficulty("");
    pushParams("", "All", "");
  };

  const hasActiveFilter = query || difficulty || (category && category !== "All");

  return (
    <div className="sticky top-20 z-30 backdrop-blur-md rounded-xl border shadow-sm p-4 transition-all duration-300 bg-white/90 border-slate-200">
      {/* Search Row */}
      <div className="flex items-center gap-3 mb-3">
        <div className="relative flex-1">
          <Search className={cn("absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none transition-colors", query ? "text-blue-600" : "text-slate-400")} />
          <Input
            placeholder="Search tutorials, guides..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={cn("pl-10 transition-all", query ? "bg-white border-blue-400 ring-1 ring-blue-400" : "bg-slate-50 border-slate-200 focus:bg-white")}
          />
        </div>
        {hasActiveFilter && (
          <Button variant="ghost" size="sm" onClick={clearAll} className="shrink-0 text-slate-500 hover:text-red-600 gap-1">
            <X className="h-3.5 w-3.5" /> Clear
          </Button>
        )}
      </div>

      {/* Filters Row */}
      <div className="overflow-x-auto hide-scrollbar">
        <div className="flex items-center gap-1.5 min-w-max">
          {/* All pill */}
          <button
            onClick={() => handleCategoryClick("All")}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm font-semibold border transition-all shrink-0",
              !difficulty && (category === "All" || !category)
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-white text-slate-600 border-slate-200 hover:border-slate-400 hover:text-slate-900"
            )}
          >
            All
          </button>

          {/* Difficulty divider */}
          <div className="h-5 w-px bg-slate-200 mx-1" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mr-0.5">Level</span>

          {/* Difficulty pills */}
          {DIFFICULTY_LEVELS.map((diff) => {
            const isActive = difficulty === diff;
            const colors: Record<string, string> = {
              Beginner: "bg-emerald-600 text-white border-emerald-600",
              Intermediate: "bg-amber-500 text-white border-amber-500",
              Advanced: "bg-red-600 text-white border-red-600",
            };
            const hoverColors: Record<string, string> = {
              Beginner: "hover:border-emerald-400 hover:text-emerald-700",
              Intermediate: "hover:border-amber-400 hover:text-amber-700",
              Advanced: "hover:border-red-400 hover:text-red-700",
            };
            return (
              <button
                key={diff}
                onClick={() => handleDifficultyClick(diff)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-sm font-semibold border transition-all shrink-0",
                  isActive ? colors[diff] : `bg-white text-slate-600 border-slate-200 ${hoverColors[diff]}`
                )}
              >
                {diff}
              </button>
            );
          })}

          {/* Category divider — only show if there are categories */}
          {categories.length > 0 && (
            <>
              <div className="h-5 w-px bg-slate-200 mx-1" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mr-0.5">Topic</span>
            </>
          )}

          {/* Category pills from DB */}
          {categories.map((cat) => {
            const isActive = category === cat && !difficulty;
            return (
              <button
                key={cat}
                onClick={() => handleCategoryClick(cat)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-sm font-semibold border transition-all shrink-0",
                  isActive
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-700"
                )}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
