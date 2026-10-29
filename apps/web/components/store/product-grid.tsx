"use client";

import { useState, useMemo, useEffect } from "react";
import type { Product } from "@fidevoltz/types";
import { ProductCard } from "@/components/store/product-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { 
  LayoutGrid, 
  List, 
  PackageSearch, 
  ChevronLeft, 
  ChevronRight,
  ArrowUpDown,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface ActiveFilter {
  id: string;
  label: string;
  onRemove: () => void;
}

interface ProductGridProps {
  products: Product[];
  totalProducts: number;
  sortBy: string;
  onSortChange: (value: string) => void;
  onReset: () => void;
  hideHeader?: boolean;
  isLoading?: boolean;
  activeFilters?: ActiveFilter[];
  itemsPerPage?: number;
}

export function ProductCardSkeleton({ viewMode = "grid" }: { viewMode?: "grid" | "list" }) {
  if (viewMode === "list") {
    return (
      <div className="w-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white flex flex-col sm:flex-row p-4 gap-4 shadow-xs">
        <Skeleton className="w-full sm:w-48 h-40 rounded-xl bg-slate-200 shrink-0" />
        <div className="flex-1 flex flex-col justify-between py-1 space-y-3">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24 rounded bg-slate-200" />
            <Skeleton className="h-5 w-3/4 rounded bg-slate-200" />
            <Skeleton className="h-3 w-full rounded bg-slate-100" />
            <Skeleton className="h-3 w-2/3 rounded bg-slate-100" />
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <Skeleton className="h-6 w-28 rounded bg-slate-200" />
            <div className="flex gap-2">
              <Skeleton className="h-9 w-24 rounded-lg bg-slate-100" />
              <Skeleton className="h-9 w-28 rounded-lg bg-slate-200" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white flex flex-col shadow-xs">
      <Skeleton className="w-full aspect-square rounded-none bg-slate-200" />
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-16 bg-slate-200" />
            <Skeleton className="h-3 w-8 bg-slate-200" />
          </div>
          <Skeleton className="h-4 w-4/5 bg-slate-200" />
          <Skeleton className="h-3.5 w-full bg-slate-100" />
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <Skeleton className="h-5 w-20 bg-slate-200" />
          <Skeleton className="h-8 w-8 rounded-lg bg-slate-200" />
        </div>
      </div>
    </div>
  );
}

export function StoreProductGrid({
  products,
  totalProducts,
  sortBy,
  onSortChange,
  onReset,
  hideHeader = false,
  isLoading = false,
  activeFilters = [],
  itemsPerPage = 12,
}: ProductGridProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);

  // Reset to page 1 whenever products array or sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [products.length, sortBy]);

  const totalPages = Math.max(1, Math.ceil(products.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, products.length);

  const paginatedProducts = useMemo(() => {
    return products.slice(startIndex, endIndex);
  }, [products, startIndex, endIndex]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 350, behavior: "smooth" });
    }
  };

  return (
    <div className="flex-1 min-w-0 w-full">
      {/* Grid Toolbar */}
      {!hideHeader && (
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 shadow-xs mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Results Count */}
            <div className="flex items-center gap-2 text-base text-slate-700">
              {isLoading ? (
                <span className="text-slate-500">Loading catalog...</span>
              ) : (
                <span>
                  Showing{" "}
                  <strong className="text-slate-900 font-bold">
                    {products.length === 0 ? 0 : startIndex + 1}–{endIndex}
                  </strong>{" "}
                  of <strong className="text-slate-900 font-bold">{products.length}</strong> items
                  {totalProducts > products.length && (
                    <span className="text-slate-500"> (filtered from {totalProducts})</span>
                  )}
                </span>
              )}
            </div>

            {/* Controls (View mode + Sort) */}
            <div className="flex items-center justify-between sm:justify-end gap-3">
              {/* View Mode Toggle */}
              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200/60">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-7 w-7 rounded-md transition-all",
                    viewMode === "grid"
                      ? "bg-white text-slate-900 shadow-xs font-semibold"
                      : "text-slate-500 hover:text-slate-900"
                  )}
                  onClick={() => setViewMode("grid")}
                  aria-label="Grid view"
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-7 w-7 rounded-md transition-all",
                    viewMode === "list"
                      ? "bg-white text-slate-900 shadow-xs font-semibold"
                      : "text-slate-500 hover:text-slate-900"
                  )}
                  onClick={() => setViewMode("list")}
                  aria-label="List view"
                >
                  <List className="h-3.5 w-3.5" />
                </Button>
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-1.5">
                <ArrowUpDown className="h-3.5 w-3.5 text-slate-400 hidden sm:inline" />
                <select
                  aria-label="Sort products"
                  className="text-xs border border-slate-200 rounded-lg bg-white font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer py-1.5 px-2.5 shadow-2xs hover:border-slate-300 transition-colors"
                  value={sortBy}
                  onChange={(e) => onSortChange(e.target.value)}
                >
                  <option value="Featured">Featured</option>
                  <option value="Price: Low to High">Price: Low to High</option>
                  <option value="Price: High to Low">Price: High to Low</option>
                  <option value="Newest">Newest Arrivals</option>
                  <option value="Rating">Customer Rating</option>
                  <option value="Name: A to Z">Name: A to Z</option>
                </select>
              </div>
            </div>
          </div>

          {/* Active Filters Tag Pills */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-3 mt-3 border-t border-slate-100">
              <span className="text-xs font-medium text-slate-400 mr-1">
                Active filters:
              </span>
              {activeFilters.map((filter) => (
                <Badge
                  key={filter.id}
                  variant="secondary"
                  className="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-100 text-xs px-2 py-0.5 rounded-md flex items-center gap-1 cursor-pointer transition-colors"
                  onClick={filter.onRemove}
                >
                  <span>{filter.label}</span>
                  <X className="h-3 w-3 opacity-60 hover:opacity-100" />
                </Badge>
              ))}
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs text-blue-600 hover:text-blue-800 font-medium"
                onClick={onReset}
              >
                Clear all
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Main Grid / List */}
      {isLoading ? (
        <div
          className={cn(
            viewMode === "grid"
              ? "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-5"
              : "flex flex-col gap-4"
          )}
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={i} viewMode={viewMode} />
          ))}
        </div>
      ) : paginatedProducts.length > 0 ? (
        <div
          className={cn(
            viewMode === "grid"
              ? "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-5"
              : "flex flex-col gap-4"
          )}
        >
          {paginatedProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              viewMode={viewMode}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-20 px-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="h-16 w-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-100">
            <PackageSearch className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">
            No matching components found
          </h3>
          <p className="text-sm text-slate-700 mb-6 max-w-md mx-auto leading-relaxed">
            We couldn't find any electronics components matching your current filter selection. Try adjusting your search keywords, category, or price range.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button
              onClick={onReset}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Reset All Filters
            </Button>
          </div>
        </div>
      )}

      {/* Working Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <p className="text-sm text-slate-700">
            Page <span className="font-semibold text-slate-900">{currentPage}</span> of{" "}
            <span className="font-semibold text-slate-900">{totalPages}</span>
          </p>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="h-8 px-2.5 text-xs border-slate-200"
            >
              <ChevronLeft className="h-3.5 w-3.5 mr-1" />
              Previous
            </Button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
              // Only show nearby pages if many pages
              if (
                totalPages > 6 &&
                page !== 1 &&
                page !== totalPages &&
                Math.abs(page - currentPage) > 1
              ) {
                if (Math.abs(page - currentPage) === 2) {
                  return (
                    <span key={page} className="text-slate-400 text-xs px-1">
                      ...
                    </span>
                  );
                }
                return null;
              }

              return (
                <Button
                  key={page}
                  variant={page === currentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(page)}
                  className={cn(
                    "h-8 w-8 p-0 text-xs",
                    page === currentPage
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "border-slate-200 text-slate-700 hover:bg-slate-50"
                  )}
                >
                  {page}
                </Button>
              );
            })}

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="h-8 px-2.5 text-xs border-slate-200"
            >
              Next
              <ChevronRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
