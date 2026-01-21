"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface StoreSidebarProps {
  categories: string[];
  brands: string[];
  selectedCategories: string[];
  selectedBrands: string[];
  priceRange: string[];
  onToggleCategory: (category: string) => void;
  onToggleBrand: (brand: string) => void;
  onTogglePrice: (range: string) => void;
  onReset: () => void;
  className?: string;
}

export function StoreSidebar(props: StoreSidebarProps) {
  return (
    <>
      {/* Mobile Filter Button */}
      <div className="lg:hidden w-full mb-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full flex items-center justify-between">
              <span className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                Filters
              </span>
              <span className="text-xs text-muted-foreground">
                {props.selectedCategories.length + props.selectedBrands.length + props.priceRange.length} active
              </span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-full sm:w-[350px] overflow-y-auto">
            <SheetHeader className="mb-6">
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <FilterContent {...props} />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <aside className={cn("hidden lg:block w-64 flex-shrink-0 space-y-6", props.className)}>
        <div className="sticky top-24 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-slate-900" />
              <h3 className="font-bold text-slate-900">Filters</h3>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-auto p-0 text-slate-500 hover:text-blue-600 font-medium"
              onClick={props.onReset}
            >
              Reset All
            </Button>
          </div>
          
          <Separator />
          
          <FilterContent {...props} />
        </div>
      </aside>
    </>
  );
}

function FilterContent({
  categories,
  brands,
  selectedCategories,
  selectedBrands,
  priceRange,
  onToggleCategory,
  onToggleBrand,
  onTogglePrice,
}: StoreSidebarProps) {
  return (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h4 className="text-sm font-bold text-slate-900 mb-2 uppercase tracking-wider">Categories</h4>
        <div className="space-y-2">
          {categories.map((category) => (
            <div key={category} className="flex items-center space-x-3 group">
              <Checkbox 
                id={`cat-${category}`} 
                checked={selectedCategories.includes(category)}
                onCheckedChange={() => onToggleCategory(category)}
                className="border-slate-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
              />
              <label 
                htmlFor={`cat-${category}`}
                className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer select-none"
              >
                {category}
              </label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Brands */}
      <div>
        <h4 className="text-sm font-bold text-slate-900 mb-2 uppercase tracking-wider">Brands</h4>
        <div className="space-y-2">
          {brands.map((brand) => (
            <div key={brand} className="flex items-center space-x-3 group">
              <Checkbox 
                id={`brand-${brand}`} 
                checked={selectedBrands.includes(brand)}
                onCheckedChange={() => onToggleBrand(brand)}
                className="border-slate-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
              />
              <label 
                htmlFor={`brand-${brand}`}
                className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer select-none"
              >
                {brand}
              </label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Price Range */}
      <div>
        <h4 className="text-sm font-bold text-slate-900 mb-2 uppercase tracking-wider">Price Range</h4>
        <div className="space-y-2">
          {["Under ₦10,000", "₦10,000 - ₦25,000", "₦25,000 - ₦50,000", "₦50,000+"].map((range) => (
            <div key={range} className="flex items-center space-x-3 group">
              <Checkbox 
                id={`price-${range}`} 
                checked={priceRange.includes(range)}
                onCheckedChange={() => onTogglePrice(range)}
                className="border-slate-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
              />
              <label 
                htmlFor={`price-${range}`} 
                className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors cursor-pointer select-none"
              >
                {range}
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
