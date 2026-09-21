"use client";

import { AdSlot } from "@/components/ads/AdSlot";
import { TableOfContents, LatestPostsWidget, FeaturedPostsWidget, CategoriesWidget, AdWidget } from "./sidebar-widgets";
import { BlockRenderer } from "./block-renderer";

interface SidebarBlock {
  id: string;
  type: string;
  content: any;
}

interface PublicSidebarRendererProps {
  /** Array of blocks from the sidebar JSON field */
  blocks: SidebarBlock[];
  /** Current page/project slug for ad targeting */
  slug?: string;
}

/**
 * Renders sidebar-specific blocks as compact widget cards.
 * Falls back to BlockRenderer for general content blocks (text, image, alert, etc.)
 */
export function PublicSidebarRenderer({ blocks, slug }: PublicSidebarRendererProps) {
  if (!blocks || blocks.length === 0) return null;

  // Filter out sidebar_settings — it's a config block, not rendered content
  const renderableBlocks = blocks.filter(b => b.type !== "sidebar_settings");

  return (
    <div className="space-y-4">
      {renderableBlocks.map((block) => {
        switch (block.type) {
          case "toc":
            return <TableOfContents key={block.id} title={block.content?.title} />;

          case "latest_posts":
            return (
              <LatestPostsWidget
                key={block.id}
                title={block.content?.title}
                count={block.content?.count ?? 4}
              />
            );

          case "featured_posts":
            return (
              <FeaturedPostsWidget
                key={block.id}
                title={block.content?.title}
                slugs={block.content?.slugs}
              />
            );

          case "categories":
            return <CategoriesWidget key={block.id} title={block.content?.title} />;

          case "ad":
            return <AdWidget key={block.id} zone={block.content?.zone} slug={slug} />;

          default:
            // For text, image, alert, heading, markdown etc — render inline using BlockRenderer
            return (
              <BlockRenderer key={block.id} blocks={[block as any]} slug={slug} />
            );
        }
      })}
    </div>
  );
}
