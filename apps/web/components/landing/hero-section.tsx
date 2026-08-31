"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Package } from "lucide-react";
import Link from "next/link";
import { FadeIn, SlideUp } from "@/components/ui/motion";

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
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
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
              <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-sm font-medium text-white">
                Join 10,000+ Makers Building the Future
              </span>
            </div>
          </FadeIn>

          <SlideUp delay={0.1}>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Build Amazing
              <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Electronics Projects
              </span>
            </h1>
          </SlideUp>

          <SlideUp delay={0.2}>
            <p className="text-xl text-slate-300 mb-8 max-w-2xl">
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
                <Button size="lg" variant="outline" className="border-white/30 text-white bg-transparent hover:text-slate-900 hover:bg-white backdrop-blur-sm group">
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
