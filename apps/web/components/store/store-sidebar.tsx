"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { SlidersHorizontal, RotateCcw, Star, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StoreSidebarProps {
  categories: string[];
  categoryCounts?: Record<string, number>;
  brands: string[];
  selectedCategories: string[];
  selectedBrands: string[];
  priceRange: string[];
  inStockOnly?: boolean;
  selectedRating?: number | null;
  onToggleCategory: (category: string) => void;
  onToggleBrand: (brand: string) => void;
  onTogglePrice: (range: string) => void;
  onToggleInStock?: (val: boolean) => void;
  onSelectRating?: (rating: number | null) => void;
  onReset: () => void;
  totalFilteredCount?: number;
  className?: string;
}

const PRICE_PRESETS = [
  "Under ₦10,000",
  "₦10,000 - ₦25,000",
  "₦25,000 - ₦50,000",
  "₦50,000+",
];

const RATINGS = [
  { value: 4, label: "4.0 & above" },
  { value: 3, label: "3.0 & above" },
];

export function StoreSidebar(props: StoreSidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const activeFiltersCount =
    props.selectedCategories.length +
    props.selectedBrands.length +
    props.priceRange.length +
    (props.inStockOnly ? 1 : 0) +
    (props.selectedRating ? 1 : 0);

  return (
    <>
      {/* Mobile Filter Button */}
      <div className="lg:hidden w-full mb-4">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              className="w-full flex items-center justify-between border-slate-300 bg-white shadow-xs h-11"
            >
              <span className="flex items-center gap-2 font-semibold text-slate-800">
                <SlidersHorizontal className="h-4 w-4 text-blue-600" />
                Filter Products
              </span>
              <div className="flex items-center gap-2">
                {activeFiltersCount > 0 && (
                  <Badge className="bg-blue-600 text-white hover:bg-blue-600 px-2 py-0.5 text-xs">
                    {activeFiltersCount}
                  </Badge>
                )}
                {props.totalFilteredCount !== undefined && (
                  <span className="text-xs text-slate-500 font-normal">
                    ({props.totalFilteredCount} items)
                  </span>
                )}
              </div>
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-full sm:w-[380px] p-0 flex flex-col h-full bg-white"
          >
            <SheetHeader className="px-6 py-4 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <SheetTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <SlidersHorizontal className="h-5 w-5 text-blue-600" />
                  Filters
                </SheetTitle>
                {activeFiltersCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={props.onReset}
                    className="text-xs text-blue-600 hover:text-blue-700 h-8 px-2"
                  >
                    Reset All
                  </Button>
                )}
              </div>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              <FilterSections {...props} />
            </div>

            <SheetFooter className="p-4 border-t border-slate-200 bg-slate-50 flex flex-row items-center gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={props.onReset}
                disabled={activeFiltersCount === 0}
              >
                Clear All
              </Button>
              <Button
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => setMobileOpen(false)}
              >
                Apply Filters {props.totalFilteredCount !== undefined ? `(${props.totalFilteredCount})` : ""}
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <aside className={cn("hidden lg:block w-64 xl:w-72 shrink-0", props.className)}>
        <div className="sticky top-24 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-blue-50 text-blue-600">
                <SlidersHorizontal className="h-4 w-4" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Filters</h3>
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-xs px-1.5 py-0">
                  {activeFiltersCount}
                </Badge>
              )}
            </div>

            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs text-slate-500 hover:text-blue-600 font-medium"
                onClick={props.onReset}
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Reset
              </Button>
            )}
          </div>

          <FilterSections {...props} />
        </div>
      </aside>
    </>
  );
}

function FilterSections(props: StoreSidebarProps) {
  const {
    categories,
    categoryCounts = {},
    brands,
    selectedCategories,
    selectedBrands,
    priceRange,
    inStockOnly = false,
    selectedRating,
    onToggleCategory,
    onToggleBrand,
    onTogglePrice,
    onToggleInStock,
    onSelectRating,
  } = props;

  return (
    <div className="space-y-4">
      {/* In-Stock Only Toggle */}
      {onToggleInStock && (
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/70">
          <div>
            <label
              htmlFor="stock-toggle"
              className="text-xs font-semibold text-slate-900 cursor-pointer block"
            >
              In Stock Only
            </label>
            <p className="text-xs text-slate-500">
              Exclude backordered items
            </p>
          </div>
          <Switch
            id="stock-toggle"
            checked={inStockOnly}
            onCheckedChange={onToggleInStock}
          />
        </div>
      )}

      {/* Collapsible Accordion Sections */}
      <Accordion
        type="multiple"
        defaultValue={["categories", "price", "brands", "rating"]}
        className="space-y-2"
      >
        {/* Categories Section */}
        <AccordionItem value="categories" className="border-b border-slate-100 py-1">
          <AccordionTrigger className="text-xs font-bold uppercase tracking-wider text-slate-800 hover:no-underline py-2">
            <span>Categories</span>
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-2">
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {categories.map((category) => {
                const isChecked = selectedCategories.includes(category);
                const count = categoryCounts[category];

                return (
                  <div
                    key={category}
                    className="flex items-center justify-between group cursor-pointer hover:bg-slate-50 p-1.5 rounded-lg transition-colors"
                    onClick={() => onToggleCategory(category)}
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <Checkbox
                        id={`cat-${category}`}
                        checked={isChecked}
                        onCheckedChange={() => onToggleCategory(category)}
                        className="border-slate-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <label
                        htmlFor={`cat-${category}`}
                        className="text-sm text-slate-700 group-hover:text-slate-900 cursor-pointer select-none truncate"
                      >
                        {category}
                      </label>
                    </div>
                    {count !== undefined && (
                      <span className="text-xs text-slate-500 font-medium ml-2">
                        {count}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Price Range Section */}
        <AccordionItem value="price" className="border-b border-slate-100 py-1">
          <AccordionTrigger className="text-xs font-bold uppercase tracking-wider text-slate-800 hover:no-underline py-2">
            <span>Price Range</span>
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-2">
            <div className="space-y-1.5">
              {PRICE_PRESETS.map((range) => {
                const isChecked = priceRange.includes(range);
                return (
                  <div
                    key={range}
                    className="flex items-center space-x-2.5 group cursor-pointer hover:bg-slate-50 p-1.5 rounded-lg transition-colors"
                    onClick={() => onTogglePrice(range)}
                  >
                    <Checkbox
                      id={`price-${range}`}
                      checked={isChecked}
                      onCheckedChange={() => onTogglePrice(range)}
                      className="border-slate-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <label
                      htmlFor={`price-${range}`}
                      className="text-sm text-slate-700 group-hover:text-slate-900 cursor-pointer select-none"
                    >
                      {range}
                    </label>
                  </div>
                );
              })}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Brands Section */}
        <AccordionItem value="brands" className="border-b border-slate-100 py-1">
          <AccordionTrigger className="text-xs font-bold uppercase tracking-wider text-slate-800 hover:no-underline py-2">
            <span>Brands</span>
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-2">
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {brands.map((brand) => {
                const isChecked = selectedBrands.includes(brand);
                return (
                  <div
                    key={brand}
                    className="flex items-center space-x-2.5 group cursor-pointer hover:bg-slate-50 p-1.5 rounded-lg transition-colors"
                    onClick={() => onToggleBrand(brand)}
                  >
                    <Checkbox
                      id={`brand-${brand}`}
                      checked={isChecked}
                      onCheckedChange={() => onToggleBrand(brand)}
                      className="border-slate-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <label
                      htmlFor={`brand-${brand}`}
                      className="text-sm text-slate-700 group-hover:text-slate-900 cursor-pointer select-none"
                    >
                      {brand}
                    </label>
                  </div>
                );
              })}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Rating Filter Section */}
        {onSelectRating && (
          <AccordionItem value="rating" className="border-b-0 py-1">
            <AccordionTrigger className="text-xs font-bold uppercase tracking-wider text-slate-800 hover:no-underline py-2">
              <span>Customer Rating</span>
            </AccordionTrigger>
            <AccordionContent className="pt-2 pb-1">
              <div className="space-y-1.5">
                {RATINGS.map((r) => {
                  const isSelected = selectedRating === r.value;
                  return (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => onSelectRating(isSelected ? null : r.value)}
                      className={cn(
                        "w-full flex items-center justify-between p-1.5 rounded-lg text-left transition-colors",
                        isSelected ? "bg-blue-50 text-blue-700 font-medium" : "hover:bg-slate-50 text-slate-700"
                      )}
                    >
                      <div className="flex items-center gap-1.5 text-xs">
                        <div className="flex items-center">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={cn(
                                "h-3.5 w-3.5",
                                i < r.value
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-slate-200"
                              )}
                            />
                          ))}
                        </div>
                        <span className="ml-1 text-xs text-slate-600">{r.label}</span>
                      </div>
                      {isSelected && <Check className="h-3.5 w-3.5 text-blue-600" />}
                    </button>
                  );
                })}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}
      </Accordion>
    </div>
  );
}
