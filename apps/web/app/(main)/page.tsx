import { Metadata } from "next";
import { HeroSection } from "@/components/landing/hero-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { LatestProjects } from "@/components/landing/latest-projects";
import { FeaturedProducts } from "@/components/landing/featured-products";
import { ServicesSection } from "@/components/landing/services-section";
import { AdSlot } from "@/components/ads/AdSlot";
import { buildPageMetadata, getSiteIdentity } from "@/lib/seo";
import { getPublicProducts } from "@/lib/catalog";
import { getStorefrontData } from "@/lib/storefront-server";
import { Prefetched } from "@/components/seo/prefetched";

export async function generateMetadata(): Promise<Metadata> {
  const { name } = await getSiteIdentity();
  return buildPageMetadata({
    title: `${name}: Electronics Tutorials & Components in Nigeria`,
    absoluteTitle: true,
    description:
      'Learn electronics with step-by-step Arduino, ESP32 and IoT tutorials, and buy tested components, sensors and microcontrollers in Nigeria.',
    path: '/',
  });
}

export default async function Home() {
  const [featured, storefront] = await Promise.all([getPublicProducts(8), getStorefrontData()]);

  return (
    <Prefetched
      queries={[
        { key: ['products', 'featured'], data: featured },
        { key: ['storefront'], data: storefront },
      ]}
    >
    <div className="flex flex-col min-h-screen">
      {/* Header Ad - Full width banner */}
      <AdSlot page="home" zone="HEADER" className="container mx-auto px-4 mb-4" />
      
      <HeroSection />
      
      {/* Content Top Ad */}
      <AdSlot page="home" zone="CONTENT_TOP" className="container mx-auto px-4 my-4 md:my-6" />
      
      <LatestProjects />
      <FeaturesSection />
      
      {/* Content Middle Ad */}
      <AdSlot page="home" zone="CONTENT_MIDDLE" className="container mx-auto px-4 my-4 md:my-6" />
      
      <ServicesSection />
      <FeaturedProducts />
      
      {/* Content Bottom Ad */}
      <AdSlot page="home" zone="CONTENT_BOTTOM" className="container mx-auto px-4 my-4 md:my-6" />
      
      {/* Footer Ad */}
      <AdSlot page="home" zone="FOOTER" className="container mx-auto px-4 mt-6 mb-4" />
    </div>
    </Prefetched>
  );
}
