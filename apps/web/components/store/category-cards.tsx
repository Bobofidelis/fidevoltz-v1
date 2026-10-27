"use client";

import { useRef } from "react";
import { 
  Cpu, 
  Radio, 
  Wrench, 
  Zap, 
  Bot, 
  Monitor, 
  Wifi, 
  Package, 
  Layers, 
  ChevronLeft, 
  ChevronRight,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface CategoryItem {
  id: string;
  name: string;
  slug?: string;
  count?: number;
}

interface CategoryCardsProps {
  categories: CategoryItem[];
  selectedCategory: string | null;
  onSelectCategory: (categoryName: string | null) => void;
  totalProductsCount?: number;
}

// Map category names to icons dynamically with fallbacks
function getCategoryIcon(name: string) {
  const lower = name.toLowerCase();
  if (lower.includes("microcontroller") || lower.includes("ic") || lower.includes("chip") || lower.includes("processor")) {
    return Cpu;
  }
  if (lower.includes("sensor") || lower.includes("detector") || lower.includes("module")) {
    return Radio;
  }
  if (lower.includes("tool") || lower.includes("solder") || lower.includes("meter")) {
    return Wrench;
  }
  if (lower.includes("power") || lower.includes("battery") || lower.includes("voltage") || lower.includes("solar")) {
    return Zap;
  }
  if (lower.includes("robot") || lower.includes("motor") || lower.includes("servo")) {
    return Bot;
  }
  if (lower.includes("display") || lower.includes("screen") || lower.includes("oled") || lower.includes("lcd")) {
    return Monitor;
  }
  if (lower.includes("wireless") || lower.includes("wifi") || lower.includes("bluetooth") || lower.includes("iot")) {
    return Wifi;
  }
  if (lower.includes("board") || lower.includes("arduino") || lower.includes("raspberry") || lower.includes("esp")) {
    return Layers;
  }
  return Package;
}

export function CategoryCards({
  categories,
  selectedCategory,
  onSelectCategory,
  totalProductsCount,
}: CategoryCardsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 260;
      scrollRef.current.scrollBy({
        left: direction === "right" ? scrollAmount : -scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="relative mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-blue-600" />
            Explore by Category
          </h3>
          <p className="text-xs text-slate-500">
            Browse verified electronics components by discipline
          </p>
        </div>

        {/* Scroll Controls */}
        <div className="hidden sm:flex items-center gap-1.5">
          <Button
            variant="outline"
            size="icon"
            onClick={() => scroll("left")}
            className="h-8 w-8 rounded-full border-slate-200 text-slate-600 hover:bg-slate-100"
            aria-label="Scroll categories left"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => scroll("right")}
            className="h-8 w-8 rounded-full border-slate-200 text-slate-600 hover:bg-slate-100"
            aria-label="Scroll categories right"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex items-center gap-3 overflow-x-auto pb-2 scroll-smooth hide-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0"
      >
        {/* "All Components" Card */}
        <button
          type="button"
          onClick={() => onSelectCategory(null)}
          className={cn(
            "flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 text-left shrink-0 min-w-[170px]",
            selectedCategory === null
              ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20"
              : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-xs"
          )}
        >
          <div
            className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors",
              selectedCategory === null
                ? "bg-white/20 text-white"
                : "bg-blue-50 text-blue-600"
            )}
          >
            <Package className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight">All Components</p>
            {totalProductsCount !== undefined && (
              <p
                className={cn(
                  "text-xs mt-0.5",
                  selectedCategory === null ? "text-blue-100" : "text-slate-400"
                )}
              >
                {totalProductsCount} items
              </p>
            )}
          </div>
        </button>

        {/* Dynamic Categories */}
        {categories.map((cat) => {
          const Icon = getCategoryIcon(cat.name);
          const isSelected = selectedCategory?.toLowerCase() === cat.name.toLowerCase();

          return (
            <button
              key={cat.id || cat.name}
              type="button"
              onClick={() => onSelectCategory(isSelected ? null : cat.name)}
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 text-left shrink-0 min-w-[170px]",
                isSelected
                  ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20"
                  : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-xs"
              )}
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                  isSelected
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 text-slate-700 group-hover:text-blue-600"
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate leading-tight">
                  {cat.name}
                </p>
                {cat.count !== undefined && (
                  <p
                    className={cn(
                      "text-xs mt-0.5",
                      isSelected ? "text-blue-100" : "text-slate-400"
                    )}
                  >
                    {cat.count} {cat.count === 1 ? "item" : "items"}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
