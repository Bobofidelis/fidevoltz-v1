"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { formatNaira } from "@/lib/utils/currency";
import { Badge } from "@/components/ui/badge";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  badge?: string;
  stock: number;
}

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

  // Limit to 5 suggestions
  const suggestions = products.slice(0, 5);

  const handleProductClick = (productId: string) => {
    onSelect();
    router.push(`/store/product/${productId}`);
  };

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden z-50 max-h-[400px] overflow-y-auto">
      <div className="p-2">
        <div className="text-xs text-slate-500 px-3 py-2 font-medium">
          {products.length} {products.length === 1 ? 'result' : 'results'} found
        </div>
        <div className="space-y-1">
          {suggestions.map((product) => (
            <button
              key={product.id}
              onClick={() => handleProductClick(product.id)}
              className="w-full flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg transition-colors text-left group"
            >
              {/* Product Image */}
              <div className="relative w-12 h-12 flex-shrink-0 bg-slate-100 rounded-md overflow-hidden">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform"
                />
              </div>

              {/* Product Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-sm text-slate-900 truncate">
                    {product.name}
                  </h4>
                  {product.badge && (
                    <Badge 
                      variant={product.badge === 'Out of Stock' ? 'destructive' : 'secondary'}
                      className="text-xs"
                    >
                      {product.badge}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-slate-500 truncate">
                  {product.category}
                </p>
              </div>

              {/* Price */}
              <div className="text-sm font-semibold text-blue-600 flex-shrink-0">
                {formatNaira(product.price)}
              </div>
            </button>
          ))}
        </div>

        {products.length > 5 && (
          <div className="text-xs text-slate-500 px-3 py-2 text-center border-t border-slate-100 mt-2">
            +{products.length - 5} more results. Keep typing to refine your search.
          </div>
        )}
      </div>
    </div>
  );
}
