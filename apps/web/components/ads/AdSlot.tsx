"use client";

import { useEffect } from "react";
import { usePageAds, trackAdClick } from "@/lib/hooks/use-ads";

interface AdSlotProps {
  page: string;
  zone: "HEADER" | "SIDEBAR_LEFT" | "SIDEBAR_RIGHT" | "CONTENT_TOP" | "CONTENT_MIDDLE" | "CONTENT_BOTTOM" | "FOOTER" | "POPUP";
  className?: string;
}

export function AdSlot({ page, zone, className = "" }: AdSlotProps) {
  const { data: ads } = usePageAds(page);

  // Filter ads for this specific zone
  const zoneAds = ads?.filter((ad: any) =>
    ad.placements?.some((p: any) => p.zone === zone && p.isActive)
  ) || [];

  if (zoneAds.length === 0) return null;

  // Get the first ad for this zone (can be enhanced for rotation)
  const ad = zoneAds[0];

  const handleClick = () => {
    if (ad.linkUrl) {
      trackAdClick(ad.id);
      window.open(ad.linkUrl, '_blank');
    }
  };

  return (
    <div className={`ad-slot ad-zone-${zone.toLowerCase()} ${className}`}>
      {ad.customHtml ? (
        // Custom HTML ad
        <div
          dangerouslySetInnerHTML={{ __html: ad.customHtml }}
          onClick={handleClick}
        />
      ) : (
        // Standard ad
        <div
          className="ad-container cursor-pointer"
          onClick={handleClick}
        >
          {ad.imageUrl && (
            <img
              src={ad.imageUrl}
              alt={ad.title || "Advertisement"}
              className="w-full h-auto"
            />
          )}
          {ad.title && (
            <h3 className="font-bold mt-2">{ad.title}</h3>
          )}
          {ad.description && (
            <p className="text-sm text-gray-600 mt-1">{ad.description}</p>
          )}
          {ad.ctaText && (
            <button className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
              {ad.ctaText}
            </button>
          )}
        </div>
      )}

      {/* Custom CSS */}
      {ad.customCss && (
        <style dangerouslySetInnerHTML={{ __html: ad.customCss }} />
      )}
    </div>
  );
}

// Google Ads component (placeholder for future implementation)
export function GoogleAdUnit({ adSlot, className = "" }: { adSlot: string; className?: string }) {
  return (
    <div className={`google-ad-unit ${className}`}>
      {/* Google Ads script will be injected here */}
      <div data-ad-slot={adSlot}>
        {/* Google Ad */}
      </div>
    </div>
  );
}
