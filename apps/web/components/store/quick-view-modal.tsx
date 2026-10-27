"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Heart, ExternalLink, Check } from "lucide-react";
import type { Product } from "@fidevoltz/types";
import { formatCurrency, cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import { toast } from "sonner";
import Link from "next/link";

interface QuickViewModalProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuickViewModal({ product, open, onOpenChange }: QuickViewModalProps) {
  const { addItem } = useCartStore();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [added, setAdded] = useState(false);

  if (!product) return null;

  const stock = product.stock ?? 0;
  const minStock = product.minStock || 5;
  const isOutOfStock = stock === 0;
  const isLowStock = !isOutOfStock && stock <= minStock;

  const hasDiscount = !!(product.originalPrice && product.originalPrice > product.price);
  const discountPercent = hasDiscount
    ? Math.round(((Number(product.originalPrice) - Number(product.price)) / Number(product.originalPrice)) * 100)
    : 0;

  const imageUrl =
    product.image ||
    product.images?.[0] ||
    "https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&q=80";

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addItem(product, 1);
    setAdded(true);
    toast.success(`${product.name} added to cart!`);
    setTimeout(() => {
      setAdded(false);
      onOpenChange(false);
    }, 1000);
  };

  const handleToggleWishlist = () => {
    const next = !isWishlisted;
    setIsWishlisted(next);
    if (next) {
      toast.success(`${product.name} saved to wishlist!`);
    } else {
      toast.info(`Removed ${product.name} from wishlist`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-6 overflow-hidden rounded-3xl bg-white border-slate-200">
        <DialogHeader>
          <DialogTitle className="sr-only">Quick View: {product.name}</DialogTitle>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6 pt-2">
          {/* Product Image */}
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-50 border border-slate-200/80 p-4">
            <div
              className="absolute inset-4 bg-contain bg-center bg-no-repeat transition-transform duration-500 hover:scale-105"
              style={{ backgroundImage: `url('${imageUrl}')` }}
            />

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
              {product.badge && (
                <Badge className="bg-blue-600 text-white font-semibold shadow-xs">
                  {product.badge}
                </Badge>
              )}
              {hasDiscount && (
                <Badge className="bg-rose-600 text-white font-semibold">
                  -{discountPercent}% OFF
                </Badge>
              )}
            </div>

            <button
              type="button"
              onClick={handleToggleWishlist}
              className={cn(
                "absolute top-3 right-3 z-10 h-9 w-9 rounded-full flex items-center justify-center transition-all bg-white shadow-xs hover:scale-110",
                isWishlisted ? "text-rose-500" : "text-slate-400 hover:text-slate-700"
              )}
              aria-label="Save to wishlist"
            >
              <Heart className={cn("h-4 w-4", isWishlisted && "fill-rose-500")} />
            </button>
          </div>

          {/* Product Details */}
          <div className="flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                  {product.category?.name || "Components"}
                </span>
                <span className="text-xs text-slate-400">
                  {product.brand || "Generic"}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3 leading-snug">
                {product.name}
              </h2>

              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {formatCurrency(Number(product.price))}
                </span>
                {hasDiscount && (
                  <span className="text-base text-slate-400 line-through">
                    {formatCurrency(Number(product.originalPrice))}
                  </span>
                )}
              </div>

              {/* Stock Status Indicator */}
              <div className="mb-4">
                {isOutOfStock ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-100">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                    Currently Out of Stock
                  </span>
                ) : isLowStock ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                    Low Stock: Only {stock} remaining
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    In Stock ({stock} available)
                  </span>
                )}
              </div>

              <p className="text-xs sm:text-sm text-slate-600 mb-6 line-clamp-4 leading-relaxed">
                {product.description ||
                  product.shortDescription ||
                  "Verified, reliable electronic hardware suitable for prototyping, educational, and commercial designs."}
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-100">
              <Button
                className={cn(
                  "flex-1 h-11 font-semibold transition-all",
                  added
                    ? "bg-emerald-600 hover:bg-emerald-600 text-white"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                )}
                onClick={handleAddToCart}
                disabled={isOutOfStock}
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Added to Cart!
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    {isOutOfStock ? "Out of Stock" : "Add to Cart"}
                  </>
                )}
              </Button>

              <Link
                href={`/store/product/${product.id}`}
                className="flex-1"
                onClick={() => onOpenChange(false)}
              >
                <Button variant="outline" className="w-full h-11 border-slate-200">
                  Full Details
                  <ExternalLink className="w-3.5 h-3.5 ml-1.5 text-slate-500" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
