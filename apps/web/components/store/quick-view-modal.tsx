"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, X } from "lucide-react";
import type { Product } from "@fidevoltz/types";
import { formatCurrency as formatNaira } from "@/lib/utils";
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

  if (!product) return null;

  const handleAddToCart = () => {
    addItem(product, 1);
    toast.success(`${product.name} added to cart!`);
    onOpenChange(false);
  };

  const isOutOfStock = product.stock !== undefined && product.stock === 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">Product Quick View</DialogTitle>
        </DialogHeader>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Product Image */}
          <div className="relative aspect-square rounded-lg overflow-hidden bg-slate-100">
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url('${product.image || ''}')` }}
            />
            {product.badge && (
              <Badge className="absolute top-3 left-3 bg-blue-600">
                {product.badge}
              </Badge>
            )}
          </div>

          {/* Product Details */}
          <div className="flex flex-col">
            <div className="mb-2">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                {product.brand || 'Generic'}
              </span>
            </div>
            
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              {product.name}
            </h2>
            
            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-3xl font-bold text-slate-900">
                {formatNaira(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-lg text-slate-400 line-through">
                  {formatNaira(product.originalPrice)}
                </span>
              )}
            </div>

            {product.description && (
              <p className="text-slate-600 mb-6 line-clamp-4">
                {product.description}
              </p>
            )}

            {/* Stock Status */}
            <div className="mb-6">
              {isOutOfStock ? (
                <Badge variant="destructive">Out of Stock</Badge>
              ) : product.stock !== undefined && product.stock <= (product.minStock || 5) ? (
                <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                  Low Stock - Only {product.stock} left
                </Badge>
              ) : (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  In Stock
                </Badge>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-auto">
              <Button 
                className="flex-1" 
                size="lg"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
              </Button>
              <Link href={`/store/product/${product.id}`} className="flex-1">
                <Button variant="outline" size="lg" className="w-full">
                  View Details
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
