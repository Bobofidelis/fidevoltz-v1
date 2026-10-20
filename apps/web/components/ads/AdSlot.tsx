"use client";

import { useState, useEffect, useRef } from "react";
import { usePageAds, trackAdClick, trackAdImpression } from "@/lib/hooks/use-ads";

interface AdSlotProps {
  page: string;
  zone: "HEADER" | "SIDEBAR_LEFT" | "SIDEBAR_RIGHT" | "CONTENT_TOP" | "CONTENT_MIDDLE" | "CONTENT_BOTTOM" | "FOOTER" | "POPUP";
  className?: string;
}

// Track impressions once per ad per page load
const trackedImpressions = new Set<string>();

export function AdSlot({ page, zone, className = "" }: AdSlotProps) {
  const { data: ads, isLoading } = usePageAds(page);
  const [adIndex, setAdIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter ads for this specific zone
  const zoneAds = ads?.filter((ad: any) =>
    ad.placements?.some((p: any) => p.zone === zone && p.isActive)
  ) || [];

  // Rotate ads every 30 seconds if there are multiple
  useEffect(() => {
    if (zoneAds.length <= 1) return;
    const interval = setInterval(() => {
      setAdIndex((prev) => (prev + 1) % zoneAds.length);
    }, 30000);
    return () => clearInterval(interval);
  }, [zoneAds.length]);

  const ad = zoneAds.length > 0 ? zoneAds[adIndex % zoneAds.length] : null;

  // Track impression when ad enters viewport (once per ad per page load)
  useEffect(() => {
    if (!ad?.id || trackedImpressions.has(ad.id)) return;

    const element = containerRef.current;
    if (!element) return;

    if (typeof IntersectionObserver === "undefined") {
      trackedImpressions.add(ad.id);
      trackAdImpression(ad.id);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry && entry.isIntersecting) {
          if (!trackedImpressions.has(ad.id)) {
            trackedImpressions.add(ad.id);
            trackAdImpression(ad.id);
          }
          observer.disconnect();
        }
      },
      {
        threshold: 0.2, // Fire when 20% visible
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [ad?.id]);

  // Don't render anything while loading or if no ads for this zone
  if (isLoading || !ad) return null;

  const handleClick = () => {
    trackAdClick(ad.id);
    if (ad.linkUrl) {
      window.open(ad.linkUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const adContainerId = `ad-${ad.id}`;
  const scopedCss = ad.customCss ? `#${adContainerId} { ${ad.customCss} }` : "";

  return (
    <div ref={containerRef} id={adContainerId} className={`promo-container promo-zone-${zone.toLowerCase()} relative ${className}`}>
      {ad.customHtml ? (
        // Custom HTML ad (e.g., Google AdSense code)
        <div dangerouslySetInnerHTML={{ __html: ad.customHtml }} />
      ) : (
        // Standard image + text ad
        <div
          className="promo-content max-w-2xl mx-auto cursor-pointer rounded-xl overflow-hidden border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all duration-200 bg-white"
          onClick={handleClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && handleClick()}
          aria-label={`Advertisement: ${ad.title || 'Click to learn more'}`}
        >
          {ad.imageUrl && (
            <img
              src={ad.imageUrl}
              alt={ad.title || "Advertisement"}
              className="w-full max-h-[300px] object-cover"
              loading="lazy"
            />
          )}
          {(ad.title || ad.description || ad.ctaText) && (
            <div className="p-4 space-y-2">
              {ad.title && (
                <h3 className="font-bold text-slate-900 text-lg leading-tight">{ad.title}</h3>
              )}
              {ad.description && (
                <p className="text-sm text-slate-600 leading-relaxed">{ad.description}</p>
              )}
              {ad.ctaText && (
                <button className="mt-2 px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors w-full">
                  {ad.ctaText}
                </button>
              )}
            </div>
          )}
          {/* Ad indicator */}
          <div className="absolute top-2 right-2 bg-black/40 text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-widest">
            Ad
          </div>
        </div>
      )}

      {/* Custom CSS injection */}
      {ad.customCss && (
        <style dangerouslySetInnerHTML={{ __html: scopedCss }} />
      )}
    </div>
  );
}

// Google Ads placeholder component
export function GoogleAdUnit({ adSlot, className = "" }: { adSlot: string; className?: string }) {
  return (
    <div className={`google-ad-unit ${className}`}>
      <div data-ad-slot={adSlot}>
        {/* Google Ad */}
      </div>
    </div>
  );
}
