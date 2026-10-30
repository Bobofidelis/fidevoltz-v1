"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FadeIn } from "@/components/ui/motion";
import Link from "next/link";
import { ShoppingCart, ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";
import { useCartStore } from "@/store/cart-store";
import { useApiQuery } from "@/lib/hooks/use-api-query";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";
import type { Product, PaginatedResponse } from "@fidevoltz/types";

export function FeaturedProducts() {
  const { addItem } = useCartStore();
  
  // Use React Query hook to fetch products
  const { data, isLoading } = useApiQuery<PaginatedResponse<Product>>({
    endpoint: '/api/products?limit=8',
    queryKey: ['products', 'featured'],
  });

  // Transform products data
  const products = data?.data?.map((p: Product) => ({
    id: p.id,
    name: p.name,
    slug: p.id, // Use ID as slug for now
    description: p.description,
    price: Number(p.price),
    image: p.image || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400',
    category: p.category?.name || 'Uncategorized',
    // Only real stock states — no invented "Best Seller" labels
    badge: (p.stock || 0) === 0 ? 'Out of Stock' : (p.stock || 0) <= (p.minStock || 5) ? 'Low Stock' : undefined
  })) || [];

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 320; // Card width + gap
      const newScrollLeft = scrollContainerRef.current.scrollLeft + (direction === 'right' ? scrollAmount : -scrollAmount);
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  if (!isLoading && products.length === 0) {
    return null; // Don't show the section if there are no products
  }

  return (
    <section className="py-8 md:py-10 bg-white overflow-hidden">
      <div className="container px-4 md:px-6">
        <div className="flex items-end justify-between mb-5">
          <div className="max-w-2xl">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
              Featured Components
            </h2>
            <p className="text-lg text-slate-700">
              Premium quality electronics components for your next project
            </p>
          </div>
          
          {/* Scroll Controls */}
          <div className="hidden md:flex items-center gap-2">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => scroll('left')}
              className="rounded-full hover:bg-slate-100 border-slate-200"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => scroll('right')}
              className="rounded-full hover:bg-slate-100 border-slate-200"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Horizontal Scroll Container */}
        <div className="relative -mx-4 px-4 md:-mx-6 md:px-6 group/scroll">
          {isLoading ? (
            <div className="flex gap-6 overflow-hidden">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="min-w-[280px] md:min-w-[300px]">
                  <Card className="h-[400px] animate-pulse bg-slate-100" />
                </div>
              ))}
            </div>
          ) : (
          <div 
            ref={scrollContainerRef}
            className="flex overflow-x-auto pb-3 gap-4 snap-x snap-mandatory hide-scrollbar"
          >
            {products.map((product, index) => (
              <div key={product.id} className="min-w-[260px] flex-1 max-w-[440px] snap-center">
                <FadeIn delay={index * 0.1}>
                  <Card className="group overflow-hidden border-slate-200 hover:shadow-lg transition-all hover:-translate-y-0.5 bg-white h-full">
                    {/* Product Image */}
                    <div className="relative h-44 overflow-hidden bg-slate-100">
                      <div 
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                        style={{ backgroundImage: `url('${product.image}')` }}
                      />
                      
                      {/* Badge */}
                      {product.badge && (
                        <div className="absolute top-4 left-4">
                          <div className="px-3 py-1 rounded-full bg-blue-600 text-white">
                            <span className="text-xs font-semibold">{product.badge}</span>
                          </div>
                        </div>
                      )}

                      {/* Quick Add Button */}
                      <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <Button 
                          size="sm" 
                          className="bg-white text-slate-900 hover:bg-slate-100"
                          onClick={() => {
                            addItem(product as any, 1);
                            toast.success(`${product.name} added to cart!`);
                          }}
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Quick Add
                        </Button>
                      </div>
                    </div>

                    <CardContent className="p-5">
                      <Link href={`/store/product/${product.slug}`}>
                        <h3 className="font-semibold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2 min-h-[3rem]">
                          {product.name}
                        </h3>
                      </Link>
                      
                      {/* Category */}
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="secondary" className="text-xs">{product.category}</Badge>
                      </div>

                      {/* Price */}
                      <div className="flex items-center justify-between mt-auto">
                        <span className="text-2xl font-bold text-slate-900">
                          {formatCurrency(product.price)}
                        </span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="hover:bg-slate-100"
                          onClick={() => {
                            addItem(product as any, 1);
                            toast.success(`${product.name} added to cart!`);
                          }}
                        >
                          <ShoppingCart className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </FadeIn>
              </div>
            ))}
          </div>
          )}
          
          {/* Scroll Fade Gradients */}
          <div className="absolute top-0 bottom-8 left-0 w-12 bg-gradient-to-r from-white to-transparent pointer-events-none md:hidden" />
          <div className="absolute top-0 bottom-8 right-0 w-12 bg-gradient-to-l from-white to-transparent pointer-events-none md:hidden" />
        </div>

        <div className="text-center mt-5">
          <Link href="/store">
            <Button size="lg" className="bg-slate-900 hover:bg-slate-800 text-white">
              Browse All Products
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
