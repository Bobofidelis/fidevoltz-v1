"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ProjectSearchProps {
  initialQuery: string;
  initialCategory: string;
  categories: string[];
}

export function ProjectSearch({ initialQuery, initialCategory, categories }: ProjectSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);

  // Debounce search update
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query !== initialQuery) {
        updateParams(query, category);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [query]);

  const updateParams = (newQuery: string, newCategory: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (newQuery) params.set("q", newQuery);
    else params.delete("q");
    
    if (newCategory && newCategory !== "All") params.set("category", newCategory);
    else params.delete("category");
    
    // Reset page to 1 on filter change
    params.set("page", "1");
    
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleCategoryChange = (newCat: string) => {
    setCategory(newCat);
    updateParams(query, newCat);
  };

  return (
    <div className="sticky top-20 z-30 backdrop-blur-md rounded-xl border shadow-sm p-4 transition-all duration-300 bg-white/80 border-slate-200">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
         
         {/* Search Input */}
         <div className="relative w-full md:max-w-md group">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none transition-colors ${query ? 'text-blue-600' : 'text-slate-400'}`} />
            <Input
              placeholder="Search for tutorials, guides..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className={`pl-10 transition-all shadow-sm ${query ? 'bg-white border-blue-500 ring-1 ring-blue-500' : 'bg-slate-50 border-slate-200 focus:bg-white'}`}
            />
         </div>

         {/* Categories Scroll */}
         <div className="w-full md:w-auto overflow-x-auto pb-1 md:pb-0 hide-scrollbar">
            <div className="flex items-center gap-2">
               <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1 hidden md:inline-block">Filter:</span>
               {categories.map(cat => (
                 <Button 
                   key={cat}
                   variant={category === cat ? "default" : "outline"}
                   size="sm"
                   onClick={() => handleCategoryChange(cat)}
                   className={`whitespace-nowrap rounded-full px-4 ${category === cat ? 'bg-slate-900 hover:bg-slate-800' : 'border-slate-200 hover:bg-slate-50'}`}
                 >
                   {cat}
                 </Button>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
}
