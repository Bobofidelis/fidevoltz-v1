"use client";

import { useRouter } from "next/navigation";
import { SearchX, ArrowRight } from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@fidevoltz/types";

export const MAX_SUGGESTIONS = 6;

interface SearchSuggestionsProps {
  products: Product[];
  searchQuery: string;
  onSelect: () => void;
  onViewAll?: () => void;
  activeIndex?: number;
  onHover?: (index: number) => void;
}

function Highlight({ text, query }: { text: string; query: string }) {
  const q = query.trim();
  if (!q) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(q.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-blue-100 text-blue-900 rounded px-0.5">{text.slice(idx, idx + q.length)}</mark>
      {text.slice(idx + q.length)}
    </>
  );
}

export function SearchSuggestions({ products, searchQuery, onSelect, onViewAll, activeIndex = -1, onHover }: SearchSuggestionsProps) {
  const router = useRouter();

  if (!searchQuery.trim()) {
    return null;
  }

  const suggestions = products.slice(0, MAX_SUGGESTIONS);

  const handleProductClick = (productId: string) => {
    onSelect();
    router.push(`/store/product/${productId}`);
  };

  return (
    <div
      role="listbox"
      className="absolute top-full left-0 right-0 mt-2 bg-white text-slate-900 rounded-2xl shadow-2xl ring-1 ring-slate-900/10 overflow-hidden z-50 animate-in fade-in-50 slide-in-from-top-2 duration-200"
    >
      {suggestions.length === 0 ? (
        <div className="flex flex-col items-center text-center gap-2 px-6 py-8">
          <SearchX className="h-8 w-8 text-slate-400" />
          <p className="text-base font-semibold text-slate-900">No components match &ldquo;{searchQuery.trim()}&rdquo;</p>
          <p className="text-sm text-slate-600">Try a part number, brand, or a broader term like &ldquo;sensor&rdquo;.</p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between text-sm text-slate-600 px-4 py-2.5 font-medium border-b border-slate-100">
            <span>{products.length} {products.length === 1 ? 'component' : 'components'} found</span>
            <span className="hidden sm:inline text-xs text-slate-500">↑↓ to navigate · Enter to open</span>
          </div>
          <div className="p-2 space-y-0.5 max-h-[min(380px,60vh)] overflow-y-auto overscroll-contain">
            {suggestions.map((product, index) => {
              const imgUrl = product.image || product.images?.[0] || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=200';
              const categoryName = typeof product.category === 'string' ? product.category : product.category?.name || 'Component';

              return (
                <button
                  key={product.id}
                  type="button"
                  role="option"
                  aria-selected={index === activeIndex}
                  onMouseDown={(e) => e.preventDefault()}
                  onMouseEnter={() => onHover?.(index)}
                  onClick={() => handleProductClick(product.id)}
                  className={cn(
                    "w-full flex items-center gap-3 p-2.5 rounded-xl transition-colors text-left group",
                    index === activeIndex ? "bg-blue-50" : "hover:bg-slate-50"
                  )}
                >
                  <div
                    className="w-12 h-12 flex-shrink-0 bg-slate-100 rounded-lg overflow-hidden bg-cover bg-center border border-slate-200/80"
                    style={{ backgroundImage: `url('${imgUrl}')` }}
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-base text-slate-900 group-hover:text-blue-700 transition-colors truncate">
                        <Highlight text={product.name} query={searchQuery} />
                      </h4>
                      {product.badge && (
                        <Badge
                          variant={product.badge === 'Out of Stock' ? 'destructive' : 'secondary'}
                          className="text-xs px-1.5 py-0 h-5 shrink-0"
                        >
                          {product.badge}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 truncate mt-0.5">
                      {categoryName}
                    </p>
                  </div>

                  <div className="text-base font-bold text-slate-900 shrink-0">
                    {formatCurrency(Number(product.price))}
                  </div>
                </button>
              );
            })}
          </div>

          {onViewAll && (
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={onViewAll}
              className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-blue-700 px-4 py-3 border-t border-slate-100 bg-slate-50 hover:bg-blue-50 transition-colors"
            >
              {products.length > MAX_SUGGESTIONS
                ? `View all ${products.length} results`
                : 'Show results in catalog'}
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </>
      )}
    </div>
  );
}
