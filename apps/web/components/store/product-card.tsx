"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/store/cart-store";
import type { Product } from "@fidevoltz/types";
import { toast } from "sonner";
import { Eye, ShoppingCart, Star, Heart, Check } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { QuickViewModal } from "./quick-view-modal";

interface ProductCardProps {
  product: Product;
  className?: string;
  viewMode?: "grid" | "list";
}

export function ProductCard({ product, className, viewMode = "grid" }: ProductCardProps) {
  const { addItem } = useCartStore();
  const [showQuickView, setShowQuickView] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [addedAnimation, setAddedAnimation] = useState(false);

  const stock = product.stock ?? 0;
  const minStock = product.minStock || 5;
  const isOutOfStock = stock === 0;
  const isLowStock = !isOutOfStock && stock <= minStock;

  // Discount calculation
  const hasDiscount = !!(
    product.originalPrice &&
    product.originalPrice > product.price
  );
  const discountPercent = hasDiscount
    ? Math.round(
        ((Number(product.originalPrice) - Number(product.price)) /
          Number(product.originalPrice)) *
          100
      )
    : 0;

  const imageUrl =
    product.image ||
    product.images?.[0] ||
    "https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&q=80";

  const rating = product.rating ?? 4.8;
  const reviewCount = product.reviewCount ?? 14;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;

    addItem(product, 1);
    setAddedAnimation(true);
    toast.success(`${product.name} added to cart!`);
    setTimeout(() => setAddedAnimation(false), 1500);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const nextState = !isWishlisted;
    setIsWishlisted(nextState);
    if (nextState) {
      toast.success(`${product.name} saved to wishlist!`);
    } else {
      toast.info(`Removed ${product.name} from wishlist`);
    }
  };

  const handleOpenQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowQuickView(true);
  };

  // Stock status pill / dot component
  const StockStatus = () => {
    if (isOutOfStock) {
      return (
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">
          <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
          Out of stock
        </span>
      );
    }
    if (isLowStock) {
      return (
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
          Low stock: {stock} left
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        In stock
      </span>
    );
  };

  /* ================= LIST VIEW LAYOUT ================= */
  if (viewMode === "list") {
    return (
      <>
        <Link
          href={`/store/product/${product.id}`}
          className={cn("block group w-full", className)}
        >
          <Card className="overflow-hidden border-slate-200/90 bg-white hover:border-blue-400 hover:shadow-lg transition-all duration-300 flex flex-col sm:flex-row">
            {/* Image */}
            <div className="relative w-full sm:w-56 h-48 sm:h-auto overflow-hidden bg-slate-50 shrink-0">
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                style={{ backgroundImage: `url('${imageUrl}')` }}
              />

              {/* Badges */}
              <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
                {product.badge && (
                  <Badge className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                    {product.badge}
                  </Badge>
                )}
                {hasDiscount && (
                  <Badge className="bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    -{discountPercent}%
                  </Badge>
                )}
              </div>

              {/* Wishlist Button */}
              <button
                type="button"
                onClick={handleToggleWishlist}
                className={cn(
                  "absolute top-2.5 right-2.5 z-10 h-8 w-8 rounded-full flex items-center justify-center transition-all bg-white/90 backdrop-blur-xs shadow-xs hover:bg-white hover:scale-110",
                  isWishlisted ? "text-rose-500" : "text-slate-400 hover:text-slate-700"
                )}
                aria-label="Save to wishlist"
              >
                <Heart
                  className={cn("h-4 w-4", isWishlisted && "fill-rose-500")}
                />
              </button>
            </div>

            {/* List Content */}
            <CardContent className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                      {product.category?.name || "Components"}
                    </span>
                    <span className="text-xs text-slate-400">
                      {product.brand || "Generic"}
                    </span>
                  </div>
                  <StockStatus />
                </div>

                <h3 className="font-bold text-slate-900 text-lg leading-snug group-hover:text-blue-600 transition-colors line-clamp-1 mb-2">
                  {product.name}
                </h3>

                <p className="text-xs text-slate-500 line-clamp-2 mb-3">
                  {product.description || product.shortDescription || "High quality verified electronics component for your prototyping and production needs."}
                </p>

                <div className="flex items-center gap-1.5 mb-2">
                  <div className="flex items-center">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "h-3.5 w-3.5",
                          i < Math.floor(rating)
                            ? "fill-amber-400 text-amber-400"
                            : "text-slate-200"
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-slate-700">{rating}</span>
                  <span className="text-xs text-slate-400">({reviewCount})</span>
                </div>
              </div>

              {/* Bottom Actions Row */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-2">
                <div className="flex flex-col">
                  {hasDiscount && (
                    <span className="text-xs text-slate-400 line-through">
                      {formatCurrency(Number(product.originalPrice))}
                    </span>
                  )}
                  <span className="text-xl font-bold text-slate-900">
                    {formatCurrency(Number(product.price))}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-9 px-3 border-slate-200 hover:bg-slate-50"
                    onClick={handleOpenQuickView}
                  >
                    <Eye className="h-4 w-4 mr-1.5 text-slate-500" />
                    Quick View
                  </Button>

                  <Button
                    size="sm"
                    className={cn(
                      "h-9 px-4 font-semibold transition-all",
                      addedAnimation
                        ? "bg-emerald-600 hover:bg-emerald-600 text-white"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                    )}
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                  >
                    {addedAnimation ? (
                      <>
                        <Check className="h-4 w-4 mr-1.5" />
                        Added
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="h-4 w-4 mr-1.5" />
                        {isOutOfStock ? "Out of Stock" : "Add to Cart"}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <QuickViewModal
          product={product}
          open={showQuickView}
          onOpenChange={setShowQuickView}
        />
      </>
    );
  }

  /* ================= GRID VIEW LAYOUT ================= */
  return (
    <>
      <Link
        href={`/store/product/${product.id}`}
        className={cn("block group h-full select-none", className)}
      >
        <Card className="h-full overflow-hidden border border-slate-200/90 bg-white transition-all duration-300 hover:border-blue-400 hover:shadow-xl hover:-translate-y-1 flex flex-col rounded-2xl">
          {/* Image Container - Fixed aspect ratio */}
          <div className="relative w-full aspect-square overflow-hidden bg-slate-50/70 shrink-0">
            <div
              className="absolute inset-0 bg-contain bg-center bg-no-repeat transition-transform duration-500 group-hover:scale-105 p-4"
              style={{ backgroundImage: `url('${imageUrl}')` }}
            />

            {/* Badges Overlay */}
            <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
              {product.badge && (
                <Badge className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                  {product.badge}
                </Badge>
              )}
              {hasDiscount && (
                <Badge className="bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                  -{discountPercent}%
                </Badge>
              )}
            </div>

            {/* Wishlist Button */}
            <button
              type="button"
              onClick={handleToggleWishlist}
              className={cn(
                "absolute top-2.5 right-2.5 z-10 h-8 w-8 rounded-full flex items-center justify-center transition-all bg-white/90 backdrop-blur-xs shadow-xs hover:bg-white hover:scale-110",
                isWishlisted ? "text-rose-500" : "text-slate-400 hover:text-slate-700"
              )}
              aria-label="Save to wishlist"
            >
              <Heart
                className={cn("h-4 w-4", isWishlisted && "fill-rose-500")}
              />
            </button>

            {/* Hover Actions (Quick View & Quick Add on desktop) */}
            <div className="absolute inset-x-0 bottom-2 px-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hidden sm:flex items-center gap-2">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className="flex-1 h-8 text-xs bg-white/95 hover:bg-white text-slate-800 shadow-md font-medium backdrop-blur-xs"
                onClick={handleOpenQuickView}
              >
                <Eye className="h-3.5 w-3.5 mr-1 text-slate-600" />
                Quick View
              </Button>

              <Button
                type="button"
                size="sm"
                className={cn(
                  "h-8 px-3 text-xs shadow-md font-semibold transition-all",
                  addedAnimation
                    ? "bg-emerald-600 text-white hover:bg-emerald-600"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                )}
                onClick={handleAddToCart}
                disabled={isOutOfStock}
              >
                {addedAnimation ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <ShoppingCart className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>
          </div>

          {/* Card Content */}
          <CardContent className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
            <div>
              {/* Category & Rating */}
              <div className="flex items-center justify-between gap-1 mb-1.5">
                <span className="text-[10px] sm:text-[11px] font-semibold text-blue-600 uppercase tracking-wider truncate">
                  {product.category?.name || "Component"}
                </span>
                <div className="flex items-center gap-1 shrink-0">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  <span className="text-[11px] font-bold text-slate-700">
                    {rating}
                  </span>
                </div>
              </div>

              {/* Title */}
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors mb-2 min-h-[2.4rem]">
                {product.name}
              </h3>

              {/* Stock status indicator */}
              <div className="mb-2.5">
                <StockStatus />
              </div>
            </div>

            {/* Price & Mobile Add Button */}
            <div className="flex items-end justify-between pt-2 border-t border-slate-100 gap-1">
              <div className="flex flex-col min-w-0">
                {hasDiscount && (
                  <span className="text-[11px] text-slate-400 line-through leading-tight">
                    {formatCurrency(Number(product.originalPrice))}
                  </span>
                )}
                <span className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight truncate">
                  {formatCurrency(Number(product.price))}
                </span>
              </div>

              {/* Mobile cart button */}
              <Button
                type="button"
                size="sm"
                className={cn(
                  "sm:hidden h-8 w-8 p-0 rounded-lg shrink-0",
                  addedAnimation
                    ? "bg-emerald-600 text-white"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                )}
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                aria-label="Add to cart"
              >
                {addedAnimation ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <ShoppingCart className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </Link>

      <QuickViewModal
        product={product}
        open={showQuickView}
        onOpenChange={setShowQuickView}
      />
    </>
  );
}
