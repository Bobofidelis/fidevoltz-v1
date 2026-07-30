"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Loader2 } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { toast } from "sonner";
import Link from "next/link";

interface AddToCartBOMButtonProps {
  item: any;
}

export function AddToCartBOMButton({ item }: AddToCartBOMButtonProps) {
  const [loading, setLoading] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  const handleAddToCart = async () => {
    // If we have full product data saved from the editor, use it directly
    if (item.productId && item.productName && item.productPrice !== undefined) {
      addItem({
        id: item.productId,
        name: item.productName,
        price: item.productPrice,
        image: item.productImage,
        slug: item.productSlug,
        stock: item.productStock ?? 99,
      } as any, 1);
      toast.success("Added to cart");
      return;
    }

    // Otherwise, fallback to fetching from API if we only have the slug/URL
    setLoading(true);
    try {
      const slug = item.productLink.split("/").pop();
      const res = await fetch(`/api/products?search=${encodeURIComponent(slug)}`);
      const data = await res.json();
      if (data.success && data.data?.data?.length > 0) {
        // Find exact match by slug if possible, otherwise take the first
        const matchedProduct = data.data.data.find((p: any) => p.slug === slug) || data.data.data[0];
        addItem({
          id: matchedProduct.id,
          name: matchedProduct.name,
          price: matchedProduct.price,
          image: matchedProduct.image,
          slug: matchedProduct.slug,
          stock: matchedProduct.stock ?? 99,
        } as any, 1);
        toast.success("Added to cart");
      } else {
        // Fallback: just open the link if we can't add directly
        window.open(item.productLink, "_blank");
      }
    } catch (e) {
      window.open(item.productLink, "_blank");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      size="sm" 
      variant="outline" 
      className="border-blue-200 text-blue-700 hover:bg-blue-50 w-full sm:w-auto"
      onClick={handleAddToCart}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <ShoppingCart className="w-4 h-4 mr-2" />
      )}
      {item.linkText || "Add to Cart"}
    </Button>
  );
}
