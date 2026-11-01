"use client";

import {
  TableOfContents,
  LatestPostsWidget,
  FeaturedPostsWidget,
  RelatedPostsWidget,
  CategoriesWidget,
  LevelsWidget,
  CtaWidget,
  AdWidget,
} from "./sidebar-widgets";
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
  /** What is being read right now, so "Related Tutorials" knows which category to show */
  context?: { category?: string | null; excludeSlug?: string };
}

/**
 * Renders sidebar-specific blocks as compact widget cards.
 * Falls back to BlockRenderer for general content blocks (text, image, alert, etc.)
 */
export function PublicSidebarRenderer({ blocks, slug, context }: PublicSidebarRendererProps) {
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

          case "related_posts":
            return (
              <RelatedPostsWidget
                key={block.id}
                title={block.content?.title}
                count={block.content?.count ?? 4}
                category={context?.category}
                excludeSlug={context?.excludeSlug}
              />
            );

          case "categories":
            return <CategoriesWidget key={block.id} title={block.content?.title} />;

          case "levels":
            return <LevelsWidget key={block.id} title={block.content?.title} />;

          case "cta":
            return (
              <CtaWidget
                key={block.id}
                title={block.content?.title}
                text={block.content?.text}
                buttonText={block.content?.buttonText}
                href={block.content?.href}
              />
            );

          case "ad":
            return <AdWidget key={block.id} zone={block.content?.zone} slug={slug} />;

          default:
            // Text, image, alert, heading, markdown etc. render as a card at sidebar text size
            return (
              <div
                key={block.id}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm [&>div]:text-base [&>div]:space-y-4"
              >
                <BlockRenderer blocks={[block as any]} slug={slug} />
              </div>
            );
        }
      })}
    </div>
  );
}
