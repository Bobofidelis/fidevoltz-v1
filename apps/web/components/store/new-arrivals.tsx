"use client";

import { useRef } from "react";
import { Product } from "@fidevoltz/types";
import { ProductCard } from "@/components/store/product-card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { FadeIn } from "@/components/ui/motion";

interface NewArrivalsProps {
  products: Product[];
}

export function NewArrivals({ products }: NewArrivalsProps) {
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

  if (products.length === 0) return null;

  return (
    <section className="mb-16">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Sparkles className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">New Arrivals</h2>
            <p className="text-sm text-slate-500">Check out the latest additions to our catalog</p>
          </div>
        </div>
        
        {/* Scroll Controls */}
        <div className="hidden md:flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => scroll('left')}
            className="h-8 w-8 rounded-full hover:bg-slate-100 border-slate-200"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => scroll('right')}
            className="h-8 w-8 rounded-full hover:bg-slate-100 border-slate-200"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="relative -mx-4 px-4 md:-mx-0 md:px-0 group/scroll">
        <div 
          ref={scrollContainerRef}
          className="flex overflow-x-auto pb-8 gap-6 snap-x snap-mandatory hide-scrollbar"
        >
          {products.map((product, index) => (
            <div key={product.id} className="min-w-[280px] md:min-w-[300px] snap-center">
              <FadeIn delay={index * 0.1}>
                <ProductCard product={product} />
              </FadeIn>
            </div>
          ))}
        </div>
        
        {/* Scroll Fade Gradients */}
        <div className="absolute top-0 bottom-8 left-0 w-12 bg-gradient-to-r from-slate-50 to-transparent pointer-events-none md:hidden" />
        <div className="absolute top-0 bottom-8 right-0 w-12 bg-gradient-to-l from-slate-50 to-transparent pointer-events-none md:hidden" />
      </div>
    </section>
  );
}
