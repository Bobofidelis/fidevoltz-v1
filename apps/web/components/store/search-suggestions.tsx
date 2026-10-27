"use client";

import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@fidevoltz/types";

interface SearchSuggestionsProps {
  products: Product[];
  searchQuery: string;
  onSelect: () => void;
}

export function SearchSuggestions({ products, searchQuery, onSelect }: SearchSuggestionsProps) {
  const router = useRouter();

  if (!searchQuery || products.length === 0) {
    return null;
  }

  // Limit to 6 suggestions
  const suggestions = products.slice(0, 6);

  const handleProductClick = (productId: string) => {
    onSelect();
    router.push(`/store/product/${productId}`);
  };

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden z-50 max-h-[420px] overflow-y-auto animate-in fade-in-50 slide-in-from-top-2 duration-200">
      <div className="p-2">
        <div className="flex items-center justify-between text-xs text-slate-500 px-3 py-2 font-medium border-b border-slate-100 mb-1">
          <span>{products.length} {products.length === 1 ? 'component' : 'components'} found</span>
          <span className="text-[11px] text-slate-400">Click to view detail</span>
        </div>
        <div className="space-y-1">
          {suggestions.map((product) => {
            const imgUrl = product.image || product.images?.[0] || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=200';
            const categoryName = typeof product.category === 'string' ? product.category : product.category?.name || 'Component';

            return (
              <button
                key={product.id}
                onClick={() => handleProductClick(product.id)}
                className="w-full flex items-center gap-3 p-2.5 hover:bg-slate-50 rounded-xl transition-colors text-left group"
              >
                {/* Product Image */}
                <div 
                  className="w-12 h-12 flex-shrink-0 bg-slate-100 rounded-lg overflow-hidden bg-cover bg-center border border-slate-200/80 group-hover:scale-105 transition-transform"
                  style={{ backgroundImage: `url('${imgUrl}')` }}
                />

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-sm text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                      {product.name}
                    </h4>
                    {product.badge && (
                      <Badge 
                        variant={product.badge === 'Out of Stock' ? 'destructive' : 'secondary'}
                        className="text-[10px] px-1.5 py-0 h-4 shrink-0"
                      >
                        {product.badge}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 truncate mt-0.5">
                    {categoryName}
                  </p>
                </div>

                {/* Price */}
                <div className="text-sm font-bold text-slate-900 group-hover:text-blue-600 shrink-0">
                  {formatCurrency(Number(product.price))}
                </div>
              </button>
            );
          })}
        </div>

        {products.length > 6 && (
          <div className="text-xs text-slate-500 px-3 py-2 text-center border-t border-slate-100 mt-1 bg-slate-50/50 rounded-b-xl">
            +{products.length - 6} more matching components. Press Enter or view all below.
          </div>
        )}
      </div>
    </div>
  );
}
