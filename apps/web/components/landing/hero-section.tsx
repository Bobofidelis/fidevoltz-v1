"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Package } from "lucide-react";
import Link from "next/link";
import { FadeIn, SlideUp } from "@/components/ui/motion";
import { useApiQuery } from "@/lib/hooks/use-api-query";

export function HeroSection() {
  const { data: storefront } = useApiQuery<{ heroBadge: string | null }>({
    endpoint: "/api/storefront",
    queryKey: ["storefront"],
    requireAuth: false,
  });

  return (
    <section className="relative py-12 md:py-16 lg:py-20 flex items-center overflow-hidden">
      {/* Background with overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-slate-800/90 to-slate-900/95 z-10" />
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-30"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1518770660439-4636190af475?w=1920&q=80')",
        }}
      />
      
      {/* Animated grid pattern */}
      <div className="absolute inset-0 z-10 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }} />
      </div>

      <div className="container relative z-20 px-4 md:px-6">
        <div className="max-w-4xl">
          {/* Badge text is managed in Dashboard → Settings → Storefront */}
          {storefront?.heroBadge && (
            <FadeIn>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
                <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-sm font-medium text-white">
                  {storefront.heroBadge}
                </span>
              </div>
            </FadeIn>
          )}

          <SlideUp delay={0.1}>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Build Amazing
              <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Electronics Projects
              </span>
            </h1>
          </SlideUp>

          <SlideUp delay={0.2}>
            <p className="text-xl text-slate-200 mb-5 max-w-2xl">
              From beginner tutorials to advanced IoT systems. Learn, shop, and create 
              with our comprehensive platform designed for electronics enthusiasts.
            </p>
          </SlideUp>

          <SlideUp delay={0.3}>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/projects">
                <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-100 group">
                  Explore Tutorials
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/store">
                <Button size="lg" variant="ghost" className="border border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white group">
                  <Package className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
                  Browse Products
                </Button>
              </Link>
            </div>
          </SlideUp>
        </div>
      </div>
    </section>
  );
}
