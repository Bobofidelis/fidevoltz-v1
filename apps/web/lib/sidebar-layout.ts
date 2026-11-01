// Shared layout rules for every page that has a sidebar (tutorial articles, the tutorials list,
// CMS pages such as About). Widths scale with the screen so the content fills the page and the
// sidebar sits at the edge instead of leaving empty bands on both sides.

export type SidebarWidth = 'narrow' | 'normal' | 'wide';
export type SidebarSide = 'left' | 'right';
export type SidebarScroll = 'sticky' | 'scroll';

export const SIDEBAR_WIDTHS: Record<SidebarWidth, string> = {
  narrow: 'clamp(280px, 20vw, 340px)',
  normal: 'clamp(320px, 26vw, 440px)',
  wide: 'clamp(360px, 32vw, 520px)',
};

export interface SidebarLayout {
  side: SidebarSide;
  scrollMode: SidebarScroll;
  width: SidebarWidth;
  /** classes for the grid that holds the main column and the sidebar (literal strings for Tailwind) */
  gridClass: string;
  /** classes for the <aside> */
  asideClass: string;
  /** inline CSS variable carrying the sidebar width */
  style: React.CSSProperties;
}

/** Read the position/width/scroll options from a sidebar's "sidebar_settings" block */
export function getSidebarLayout(sidebarBlocks: { type: string; content?: any }[]): SidebarLayout {
  const settings = sidebarBlocks.find((b) => b.type === 'sidebar_settings')?.content;
  const side: SidebarSide = settings?.side === 'left' ? 'left' : 'right';
  const scrollMode: SidebarScroll = settings?.scrollMode === 'scroll' ? 'scroll' : 'sticky';
  const width: SidebarWidth = settings?.width === 'narrow' || settings?.width === 'wide' ? settings.width : 'normal';

  return {
    side,
    scrollMode,
    width,
    gridClass:
      side === 'left'
        ? 'grid grid-cols-1 gap-5 lg:gap-6 lg:grid-cols-[var(--sb)_minmax(0,1fr)] items-start'
        : 'grid grid-cols-1 gap-5 lg:gap-6 lg:grid-cols-[minmax(0,1fr)_var(--sb)] items-start',
    // On phones the article always comes first, then the sidebar
    asideClass:
      scrollMode === 'sticky'
        ? 'min-w-0 max-lg:order-last lg:sticky lg:top-20 lg:self-start'
        : 'min-w-0 max-lg:order-last',
    style: { ['--sb' as string]: SIDEBAR_WIDTHS[width] } as React.CSSProperties,
  };
}
