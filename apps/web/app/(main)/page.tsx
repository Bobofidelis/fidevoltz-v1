import Image from "next/image";
import { HeroSection } from "@/components/landing/hero-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { LatestProjects } from "@/components/landing/latest-projects";
import { FeaturedProducts } from "@/components/landing/featured-products";
import { ServicesSection } from "@/components/landing/services-section";
import { AdSlot } from "@/components/ads/AdSlot";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header Ad - Full width banner */}
      <AdSlot page="home" zone="HEADER" className="container mx-auto px-4 mb-4" />
      
      <HeroSection />
      
      {/* Content Top Ad */}
      <AdSlot page="home" zone="CONTENT_TOP" className="container mx-auto px-4 my-8" />
      
      <LatestProjects />
      <FeaturesSection />
      
      {/* Content Middle Ad */}
      <AdSlot page="home" zone="CONTENT_MIDDLE" className="container mx-auto px-4 my-8" />
      
      <ServicesSection />
      <FeaturedProducts />
      
      {/* Content Bottom Ad */}
      <AdSlot page="home" zone="CONTENT_BOTTOM" className="container mx-auto px-4 my-8" />
      
      {/* Footer Ad */}
      <AdSlot page="home" zone="FOOTER" className="container mx-auto px-4 mt-8 mb-4" />
    </div>
  );
}
