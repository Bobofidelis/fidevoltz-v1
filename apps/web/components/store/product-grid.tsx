"use client";

import type { Product } from "@fidevoltz/types";
import { ProductCard } from "@/components/store/product-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ListFilter } from "lucide-react";

interface ProductGridProps {
  products: Product[];
  totalProducts: number;
  sortBy: string;
  onSortChange: (value: string) => void;
  onReset: () => void;
  hideHeader?: boolean;
  isLoading?: boolean;
}

export function ProductCardSkeleton() {
  return (
    <div className="h-full overflow-hidden rounded-xl border border-slate-200 bg-white flex flex-col shadow-sm">
      <Skeleton className="h-48 w-full rounded-none bg-slate-200" />
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-8" />
          </div>
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-3.5 w-full" />
          <Skeleton className="h-3.5 w-3/4" />
        </div>
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-8 w-8 rounded-full" />
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
  isLoading = false
}: ProductGridProps) {
  return (
    <div className="flex-1">
      {!hideHeader && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            {isLoading ? (
              <span className="text-slate-400">Loading products...</span>
            ) : (
              <>
                <span className="font-medium text-slate-900">{products.length}</span> results found
              </>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">Sort by:</span>
              <select 
                aria-label="Sort products"
                className="text-sm border border-slate-200 rounded-md bg-white font-medium text-slate-900 focus:ring-1 focus:ring-blue-500 cursor-pointer py-1 px-2.5"
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value)}
              >
                <option value="Featured">Featured</option>
                <option value="Price: Low to High">Price: Low to High</option>
                <option value="Price: High to Low">Price: High to Low</option>
                <option value="Newest">Newest</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-xl border border-slate-100 shadow-sm">
          <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <ListFilter className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">No products found</h3>
          <p className="text-slate-500 mb-6 max-w-sm mx-auto">
            We couldn't find any products matching your current filters. Try adjusting your search or filters.
          </p>
          <Button onClick={onReset} variant="outline">
            Clear all filters
          </Button>
        </div>
      )}
      
      {/* Pagination (Visual - Hidden if no products or few products) */}
      {products.length > 12 && (
        <div className="mt-12 flex justify-center">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>Previous</Button>
            <Button variant="outline" size="sm" className="bg-slate-900 text-white hover:bg-slate-800 hover:text-white">1</Button>
            <Button variant="outline" size="sm">2</Button>
            <span className="text-slate-400 px-2">...</span>
            <Button variant="outline" size="sm">Next</Button>
          </div>
        </div>
      )}
    </div>
  );
}
