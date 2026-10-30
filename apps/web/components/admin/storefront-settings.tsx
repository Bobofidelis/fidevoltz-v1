"use client";

import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSiteSettings, useUpdateSiteSettings } from '@/lib/hooks/use-settings';
import {
  DEFAULT_STOREFRONT,
  STOREFRONT_KEYS,
  STOREFRONT_TOKENS,
  resolveTokens,
  type StorefrontCounts,
  type StorefrontStat,
} from '@/lib/storefront';
import { BarChart3, Info, Loader2, Plus, RotateCcw, Save, Trash2 } from 'lucide-react';

const MAX_STATS = 4;

export function StorefrontSettings() {
  const queryClient = useQueryClient();
  const { data: siteSettings, isLoading } = useSiteSettings();
  const updateSiteSettings = useUpdateSiteSettings();

  // Live numbers, used for the preview and the token reference table
  const { data: live } = useQuery({
    queryKey: ['storefront'],
    queryFn: async () => {
      const res = await fetch('/api/storefront');
      const json = await res.json();
      return json.data as { counts: StorefrontCounts };
    },
  });
  const counts = live?.counts;

  const [stats, setStats] = useState<StorefrontStat[]>(DEFAULT_STOREFRONT.storeStats);
  const [heroBadge, setHeroBadge] = useState(DEFAULT_STOREFRONT.heroBadge);
  const [googleVerification, setGoogleVerification] = useState('');

  useEffect(() => {
    const seoCode = siteSettings?.grouped?.seo?.['seo.googleVerification'];
    if (typeof seoCode === 'string') setGoogleVerification(seoCode);
    const grouped = siteSettings?.grouped?.storefront;
    if (!grouped) return;
    if (Array.isArray(grouped[STOREFRONT_KEYS.storeStats])) setStats(grouped[STOREFRONT_KEYS.storeStats]);
    if (typeof grouped[STOREFRONT_KEYS.heroBadge] === 'string') setHeroBadge(grouped[STOREFRONT_KEYS.heroBadge]);
  }, [siteSettings]);

  const updateStat = (index: number, field: keyof StorefrontStat, value: string) =>
    setStats((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)));

  const handleSave = async () => {
    await updateSiteSettings.mutateAsync([
      {
        key: STOREFRONT_KEYS.storeStats,
        value: stats.filter((s) => s.value.trim()),
        category: 'storefront',
        description: 'Store hero stats (supports {tokens})',
      },
      {
        key: STOREFRONT_KEYS.heroBadge,
        value: heroBadge,
        category: 'storefront',
        description: 'Homepage hero badge text (supports {tokens})',
      },
      {
        key: 'seo.googleVerification',
        // People often paste the whole meta tag; keep only the code
        value: (googleVerification.match(/content=["']([^"']+)["']/)?.[1] || googleVerification).trim(),
        category: 'seo',
        description: 'Google Search Console HTML tag verification code',
      },
    ]);
    queryClient.invalidateQueries({ queryKey: ['storefront'] });
  };

  const preview = (text: string) => (counts ? resolveTokens(text, counts) : text);

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
      {/* How-to */}
      <Card className="border-blue-200 bg-blue-50/60">
        <CardContent className="pt-6 space-y-3 text-sm text-slate-800">
          <div className="flex items-center gap-2 font-semibold text-blue-900">
            <Info className="h-4 w-4" /> How this works
          </div>
          <ol className="list-decimal pl-5 space-y-1.5">
            <li>
              Each stat has a <strong>Value</strong> (the big number) and a <strong>Label</strong> (the small text under it).
            </li>
            <li>
              Type plain text like <code className="bg-white px-1 rounded">Same-Day</code> for a fixed value, or a{' '}
              <strong>token</strong> like <code className="bg-white px-1 rounded">{'{productsInStock}'}</code> to show a live
              number that updates by itself as you add products, reviews, projects or users.
            </li>
            <li>
              You can mix both, e.g. <code className="bg-white px-1 rounded">{'{avgRating}'}★</code> or{' '}
              <code className="bg-white px-1 rounded">{'{reviews} happy customers'}</code>.
            </li>
            <li>
              A stat whose live number is <strong>0</strong> is hidden automatically, so visitors never see
              &ldquo;0 reviews&rdquo;. It appears on its own once the number goes up.
            </li>
            <li>
              The numbers come from your data: add products in <strong>Products</strong>, approve reviews in{' '}
              <strong>Reviews</strong>, publish tutorials in <strong>Projects</strong>. The store refreshes them every minute.
            </li>
          </ol>
        </CardContent>
      </Card>

      {/* Store hero stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" /> Store hero stats
          </CardTitle>
          <CardDescription>The row of numbers under the search bar on the /store page (up to {MAX_STATS}).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {stats.map((stat, i) => {
            const v = preview(stat.value);
            const l = preview(stat.label);
            const hidden = v === null || l === null;
            return (
              <div key={i} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_180px_auto] gap-3 items-end p-3 rounded-lg border bg-slate-50/60">
                <div className="space-y-1.5">
                  <Label>Value</Label>
                  <Input value={stat.value} placeholder="{productsInStock}" onChange={(e) => updateStat(i, 'value', e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Label</Label>
                  <Input value={stat.label} placeholder="Products in stock" onChange={(e) => updateStat(i, 'label', e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-600">Preview</Label>
                  <div className="h-10 px-3 rounded-md bg-slate-900 text-white flex flex-col justify-center leading-tight">
                    {hidden ? (
                      <span className="text-xs text-amber-300">Hidden (live value is 0)</span>
                    ) : (
                      <>
                        <span className="text-sm font-bold truncate">{v}</span>
                        <span className="text-xs text-slate-300 truncate">{l}</span>
                      </>
                    )}
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-red-500"
                  title="Remove stat"
                  onClick={() => setStats((prev) => prev.filter((_, idx) => idx !== i))}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            );
          })}
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={stats.length >= MAX_STATS}
              onClick={() => setStats((prev) => [...prev, { value: '', label: '' }])}
            >
              <Plus className="h-4 w-4 mr-1" /> Add stat
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setStats(DEFAULT_STOREFRONT.storeStats)}>
              <RotateCcw className="h-4 w-4 mr-1" /> Reset to defaults
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Homepage badge */}
      <Card>
        <CardHeader>
          <CardTitle>Homepage hero badge</CardTitle>
          <CardDescription>The small pill above the main homepage headline. Leave empty to hide it.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input value={heroBadge} placeholder="Join {users}+ makers building the future" onChange={(e) => setHeroBadge(e.target.value)} />
          <p className="text-sm text-slate-600">
            Preview:{' '}
            <span className="font-medium text-slate-900">
              {heroBadge.trim() ? preview(heroBadge) ?? 'Hidden (live value is 0)' : 'Hidden'}
            </span>
          </p>
        </CardContent>
      </Card>

      {/* Search engines */}
      <Card>
        <CardHeader>
          <CardTitle>Google Search Console</CardTitle>
          <CardDescription>Tell Google your site exists so your tutorials and products get indexed faster.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <ol className="list-decimal pl-5 space-y-1.5 text-sm text-slate-800">
            <li>
              Open{' '}
              <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer" className="text-blue-700 underline">
                Google Search Console
              </a>{' '}
              and add your site as a <strong>URL prefix</strong> property.
            </li>
            <li>Choose the <strong>HTML tag</strong> verification method and copy the tag Google shows you.</li>
            <li>Paste it below, click <strong>Save storefront settings</strong>, then click <strong>Verify</strong> in Google.</li>
            <li>
              In Search Console open <strong>Sitemaps</strong> and submit <code className="bg-slate-100 px-1 rounded">sitemap.xml</code>.
              It updates by itself as you publish tutorials, products and pages.
            </li>
          </ol>
          <div className="space-y-1.5">
            <Label htmlFor="google-verification">Verification tag or code</Label>
            <Input
              id="google-verification"
              value={googleVerification}
              placeholder='<meta name="google-site-verification" content="..." />'
              onChange={(e) => setGoogleVerification(e.target.value)}
            />
          </div>
          <p className="text-sm text-slate-600">
            Search text for each page is managed where you edit it: <strong>Projects → Campaign tab</strong> (title, description, tags),{' '}
            <strong>Pages</strong> (SEO title and description), and <strong>Products</strong> (name and description).
          </p>
        </CardContent>
      </Card>

      {/* Token reference */}
      <Card>
        <CardHeader>
          <CardTitle>Available tokens</CardTitle>
          <CardDescription>Copy any of these into a value or label. Current live value shown on the right.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="divide-y rounded-lg border">
            {(Object.keys(STOREFRONT_TOKENS) as (keyof typeof STOREFRONT_TOKENS)[]).map((token) => (
              <div key={token} className="flex items-center gap-3 px-3 py-2 text-sm">
                <code className="font-mono text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded shrink-0">{`{${token}}`}</code>
                <span className="flex-1 text-slate-700">{STOREFRONT_TOKENS[token]}</span>
                <span className="font-semibold text-slate-900 tabular-nums">
                  {counts ? (token === 'avgRating' ? counts[token].toFixed(1) : counts[token].toLocaleString('en-NG')) : '…'}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={updateSiteSettings.isPending}>
          {updateSiteSettings.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          Save storefront settings
        </Button>
      </div>
    </div>
  );
}
