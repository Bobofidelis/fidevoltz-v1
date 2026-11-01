"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SidebarEditor, type Block } from '@/components/dashboard/SidebarEditor';
import { useSiteSettings, useUpdateSiteSettings } from '@/lib/hooks/use-settings';
import { DEFAULT_LISTING_SIDEBAR, LISTING_SIDEBAR_KEY } from '@/lib/sidebar-defaults';
import { ExternalLink, Info, Loader2, PanelRight, RotateCcw } from 'lucide-react';

const WIDGET_LABELS: Record<string, string> = {
  featured_posts: 'Featured Posts',
  latest_posts: 'Latest Posts',
  related_posts: 'Related Posts',
  categories: 'Categories',
  levels: 'Browse by Level',
  cta: 'Call to Action',
  ad: 'Ad Slot',
  toc: 'Table of Contents',
  text: 'Rich Text',
  markdown: 'Markdown',
  heading: 'Heading',
  alert: 'Alert Box',
  code: 'Code Block',
  image: 'Image',
  sidebar_settings: 'Sidebar Settings (side, width, scrolling)',
};

export function ListingSidebarSettings() {
  const { data: siteSettings, isLoading } = useSiteSettings();
  const updateSiteSettings = useUpdateSiteSettings();
  const [blocks, setBlocks] = useState<Block[]>(DEFAULT_LISTING_SIDEBAR as Block[]);
  const [usingDefault, setUsingDefault] = useState(true);

  useEffect(() => {
    const saved = siteSettings?.grouped?.sidebar?.[LISTING_SIDEBAR_KEY];
    if (Array.isArray(saved)) {
      setBlocks(saved as Block[]);
      setUsingDefault(false);
    }
  }, [siteSettings]);

  const save = async (next: Block[]) => {
    await updateSiteSettings.mutateAsync([
      {
        key: LISTING_SIDEBAR_KEY,
        value: next,
        category: 'sidebar',
        description: 'Sidebar widgets on the Tutorials page',
      },
    ]);
    setBlocks(next);
    setUsingDefault(false);
  };

  const shown = blocks.filter((b) => b.type !== 'sidebar_settings');

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-blue-200 bg-blue-50/60">
        <CardContent className="pt-6 space-y-3 text-sm text-slate-800">
          <div className="flex items-center gap-2 font-semibold text-blue-900">
            <Info className="h-4 w-4" /> How the sidebars work
          </div>
          <ol className="list-decimal pl-5 space-y-1.5">
            <li>
              This tab controls the sidebar on the <strong>Tutorials page</strong> (the list of all tutorials).
              Click <strong>Edit sidebar</strong>, then <strong>Add Block</strong> to add a widget, click a widget to change its
              text, and use the arrows to reorder or the bin to remove it. Click <strong>Save</strong>.
            </li>
            <li>
              To change where the sidebar sits or how wide it is, add the <strong>Sidebar Settings</strong> block (left or right,
              narrow / normal / wide, sticky or scrolling).
            </li>
            <li>
              <strong>Each tutorial and each page (like About)</strong> has its own sidebar: open it in the dashboard and use
              the <strong>Edit Sidebar</strong> button. Those sidebars are separate from this one.
            </li>
            <li>
              <strong>Related Posts</strong> lists tutorials from the same category, so it only appears inside a tutorial&apos;s own
              sidebar (add it there, not here).
            </li>
            <li>
              <strong>Ads in a sidebar:</strong> add an <em>Ad Slot</em> widget here, then go to <strong>SEO &amp; Ads → Ads</strong>,
              open an ad and add a placement: page <em>All Project Pages</em> (or <em>All Pages</em> to cover every sidebar) with
              zone <em>Sidebar Right</em>. The widget shows nothing until an ad is placed, so an empty box never appears.
            </li>
          </ol>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PanelRight className="h-5 w-5" /> Tutorials page sidebar
          </CardTitle>
          <CardDescription>
            {usingDefault
              ? 'Showing the default sidebar. Edit and save it to make it your own.'
              : 'Your saved sidebar. It appears on the Tutorials page right after you save.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {shown.length === 0 ? (
            <p className="text-sm text-slate-600">No widgets, so the Tutorials page shows no sidebar and the list uses the full width.</p>
          ) : (
            <ol className="divide-y rounded-lg border">
              {shown.map((block, i) => (
                <li key={block.id} className="flex items-center gap-3 px-3 py-2 text-sm">
                  <span className="w-5 text-slate-500 tabular-nums">{i + 1}</span>
                  <span className="font-medium text-slate-900">{WIDGET_LABELS[block.type] || block.type}</span>
                  {typeof block.content?.title === 'string' && block.content.title && (
                    <span className="text-slate-600 truncate">&ldquo;{block.content.title}&rdquo;</span>
                  )}
                </li>
              ))}
            </ol>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <SidebarEditor blocks={blocks} onSave={save} triggerLabel="Edit sidebar" />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={updateSiteSettings.isPending}
              onClick={() => save(DEFAULT_LISTING_SIDEBAR as Block[])}
            >
              <RotateCcw className="h-4 w-4 mr-1.5" /> Reset to default
            </Button>
            <Button type="button" variant="outline" size="sm" asChild>
              <Link href="/projects" target="_blank">
                <ExternalLink className="h-4 w-4 mr-1.5" /> View Tutorials page
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
