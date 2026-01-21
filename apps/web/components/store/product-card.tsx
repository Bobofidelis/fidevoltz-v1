"use client";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart-store";
import type { Product } from "@fidevoltz/types";
import { toast } from "sonner";
import Link from "next/link";
import { Eye, ShoppingCart, Star } from "lucide-react";
import { cn, formatCurrency as formatNaira } from "@/lib/utils";
import { useState } from "react";
import { QuickViewModal } from "./quick-view-modal";

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const { addItem } = useCartStore();
  const [showQuickView, setShowQuickView] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <Link href={`/store/product/${product.id}`} className={cn("block group h-full", className)}>
      <Card className="h-full overflow-hidden border-slate-200 bg-white transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col">
        {/* Image Container - Fixed aspect ratio */}
        <div className="relative w-full h-48 overflow-hidden bg-slate-100 flex-shrink-0">
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
            style={{ backgroundImage: `url('${product.image || ''}')` }}
          />
          
          {/* Badge */}
          {product.badge && (
            <div className="absolute top-3 left-3 z-10">
              <span className="px-3 py-1 text-xs font-bold text-white uppercase tracking-wider bg-blue-600 rounded-full shadow-sm">
                {product.badge}
              </span>
            </div>
          )}

          {/* Overlay Actions */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
            <Button 
              size="icon" 
              variant="secondary" 
              className="rounded-full h-10 w-10 bg-white text-slate-900 hover:bg-blue-600 hover:text-white transition-colors shadow-lg transform translate-y-4 group-hover:translate-y-0 duration-300 delay-75"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowQuickView(true);
              }}
            >
              <Eye className="h-5 w-5" />
              <span className="sr-only">Quick View</span>
            </Button>
            <Button 
              size="icon" 
              variant="secondary" 
              className="rounded-full h-10 w-10 bg-white text-slate-900 hover:bg-blue-600 hover:text-white transition-colors shadow-lg transform translate-y-4 group-hover:translate-y-0 duration-300 delay-100"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="h-5 w-5" />
              <span className="sr-only">Add to Cart</span>
            </Button>
          </div>
        </div>

        {/* Content - Fixed height */}
        <CardContent className="p-4 flex-1 flex flex-col h-40">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              {product.brand}
            </span>
            <div className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-semibold text-slate-700">{product.rating}</span>
            </div>
          </div>
          
          <h3 className="font-bold text-slate-900 text-base leading-tight mb-1 line-clamp-2 min-h-[2.5rem] group-hover:text-blue-600 transition-colors">
            {product.name}
          </h3>
          
          <p className="text-sm text-slate-500 line-clamp-2 mb-2 flex-1">
            {product.shortDescription}
          </p>
          
          <div className="flex items-end justify-between mt-auto">
            <div className="flex flex-col">
              {product.originalPrice && (
                <span className="text-xs text-slate-400 line-through mb-0.5">
                {formatNaira(product.originalPrice)}
                </span>
              )}
              <span className="text-xl font-bold text-slate-900">
                {formatNaira(product.price)}
              </span>
            </div>
            
            {product.stock !== undefined && product.stock === 0 && (
              <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded">
                Out of Stock
              </span>
            )}
          </div>
        </CardContent>
      </Card>
      
      <QuickViewModal 
        product={product}
        open={showQuickView}
        onOpenChange={setShowQuickView}
      />
    </Link>
  );
}
