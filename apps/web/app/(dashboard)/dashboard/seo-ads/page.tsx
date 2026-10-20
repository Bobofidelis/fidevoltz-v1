"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  TrendingUp,
  Eye,
  MousePointerClick,
  DollarSign,
  Plus,
  Activity,
  Target,
  ExternalLink,
  Search,
  Globe,
  RefreshCcw,
  Settings2,
  CheckCircle2,
  AlertCircle,
  Info,
  Tag,
  Link as LinkIcon,
  FileText,
  Layers,
  ShieldCheck,
  FileCode,
  Share2,
} from "lucide-react";
import { useAdAnalytics, useSEOMetrics } from "@/lib/hooks/use-ads";
import { BarChart } from "@/components/analytics/BarChart";

// ── Sub-components ─────────────────────────────────────────────────────────

interface KpiCardProps {
  title: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  gradient: string;
}

function KpiCard({ title, value, sub, icon: Icon, gradient }: KpiCardProps) {
  return (
    <Card className="relative overflow-hidden border-0 shadow-sm bg-white">
      <div className={`absolute inset-0 ${gradient} opacity-5`} />
      <CardContent className="p-5 relative">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {title}
            </p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
            {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
          </div>
          <div className={`p-2.5 rounded-xl ${gradient} bg-opacity-15 shadow-sm`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ScoreGauge({
  score,
  label,
  description,
}: {
  score: number;
  label: string;
  description: string;
}) {
  const pct = Math.min(100, Math.max(0, Math.round(score)));
  const color = pct >= 80 ? "#10b981" : pct >= 60 ? "#f59e0b" : "#ef4444";
  const bgColor =
    pct >= 80
      ? "bg-emerald-50 border-emerald-200"
      : pct >= 60
      ? "bg-amber-50 border-amber-200"
      : "bg-rose-50 border-rose-200";
  const textColor =
    pct >= 80
      ? "text-emerald-600"
      : pct >= 60
      ? "text-amber-600"
      : "text-rose-600";
  const rating = pct >= 80 ? "Good" : pct >= 60 ? "Fair" : "Needs Work";

  return (
    <div className={`flex items-center gap-4 p-4 rounded-xl border ${bgColor} transition-colors`}>
      <div className="relative h-16 w-16 shrink-0">
        <svg viewBox="0 0 36 36" className="h-16 w-16 -rotate-90">
          <path
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="3"
          />
          <path
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeDasharray={`${pct}, 100`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-sm font-bold ${textColor}`}>{pct}</span>
        </div>
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-slate-800">{label}</p>
        <p className="text-xs text-slate-500">{description}</p>
        <Badge
          variant="outline"
          className={`mt-1 text-xs ${textColor} border-current`}
        >
          {rating}
        </Badge>
      </div>
    </div>
  );
}

function ChecklistItem({
  done,
  text,
  hint,
}: {
  done?: boolean;
  text: string;
  hint?: string;
}) {
  return (
    <div className="flex items-start gap-3 py-2.5">
      <div
        className={`mt-0.5 h-5 w-5 rounded-full flex items-center justify-center shrink-0 ${
          done ? "bg-emerald-100" : "bg-slate-100"
        }`}
      >
        {done ? (
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
        ) : (
          <AlertCircle className="h-4 w-4 text-slate-400" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-medium ${
            done ? "text-slate-500 line-through" : "text-slate-800"
          }`}
        >
          {text}
        </p>
        {hint && <p className="text-xs text-slate-400 mt-0.5">{hint}</p>}
      </div>
    </div>
  );
}

// ── Main Page Content ──────────────────────────────────────────────────────

function SEOAdsHubContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Detect tab from URL parameter (?tab=seo or ?tab=ads)
  const tabParam = searchParams.get("tab");
  const initialTab = tabParam === "ads" ? "ads" : "seo";
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (tabParam === "ads" || tabParam === "seo") {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    router.replace(`/dashboard/seo-ads?tab=${value}`, { scroll: false });
  };

  const {
    data: analytics,
    isLoading: analyticsLoading,
    refetch: refetchAnalytics,
  } = useAdAnalytics() as any;

  const {
    data: seoData,
    isLoading: seoLoading,
    refetch: refetchSeo,
  } = useSEOMetrics() as any;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.allSettled([refetchAnalytics?.(), refetchSeo?.()]);
    } finally {
      setTimeout(() => setIsRefreshing(false), 400);
    }
  };

  const avgSeo = seoData?.stats?.avgSeoScore || 0;
  const avgMobile = seoData?.stats?.avgMobileScore || 0;
  const avgSpeed =
    seoData?.stats?.avgSpeedScore || seoData?.stats?.avgPageSpeed || 0;
  const totalPages = seoData?.stats?.totalPages || 0;
  const pagesList = seoData?.metrics || seoData?.pages || [];

  const adChartData = (analytics?.topAds || []).slice(0, 8).map((ad: any) => ({
    name: ad.name?.substring(0, 12) + (ad.name?.length > 12 ? "…" : ""),
    impressions: ad.impressions || 0,
    clicks: ad.clicks || 0,
  }));

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Hero header ── */}
      <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 px-6 pt-8 pb-16 shadow-inner">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur">
                  <Globe className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    SEO &amp; Advertising Hub
                  </h1>
                  <p className="text-blue-200 text-sm">
                    Monitor search engine health, optimize meta tags, and manage advertising campaigns
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                className="bg-white/10 border-white/30 text-white hover:bg-white/20 transition-all"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCcw
                  className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
              <Link href="/dashboard/seo-ads/ads">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white/10 border-white/30 text-white hover:bg-white/20 transition-all"
                >
                  <Settings2 className="h-4 w-4 mr-2" />
                  Manage Ads
                </Button>
              </Link>
              <Link href="/dashboard/seo-ads/ads/new">
                <Button
                  size="sm"
                  className="bg-white text-blue-700 hover:bg-blue-50 font-semibold shadow transition-all"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Ad
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Top KPI Strip overlapping hero banner ── */}
      <div className="max-w-6xl mx-auto px-6 -mt-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            title="Total Ads"
            value={analytics?.totalAds ?? "—"}
            sub={`${analytics?.activeAds ?? 0} active campaigns`}
            icon={Target}
            gradient="bg-blue-600"
          />
          <KpiCard
            title="Impressions"
            value={(analytics?.totalImpressions || 0).toLocaleString()}
            sub="Across all placements"
            icon={Eye}
            gradient="bg-emerald-600"
          />
          <KpiCard
            title="Clicks"
            value={(analytics?.totalClicks || 0).toLocaleString()}
            sub={`${analytics?.ctr || 0}% overall CTR`}
            icon={MousePointerClick}
            gradient="bg-purple-600"
          />
          <KpiCard
            title="Revenue"
            value={`₦${(analytics?.totalRevenue || 0).toLocaleString()}`}
            sub="Total ad earnings"
            icon={DollarSign}
            gradient="bg-amber-500"
          />
        </div>
      </div>

      {/* ── Tabs Container ── */}
      <div className="max-w-6xl mx-auto px-6 mt-6 pb-12">
        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="space-y-6"
        >
          <TabsList className="bg-white border border-slate-200 p-1 shadow-sm rounded-xl">
            <TabsTrigger
              value="seo"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow rounded-lg font-medium"
            >
              <Globe className="h-4 w-4 mr-2" />
              SEO Health &amp; Meta Tags
            </TabsTrigger>
            <TabsTrigger
              value="ads"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow rounded-lg font-medium"
            >
              <Target className="h-4 w-4 mr-2" />
              Advertisements &amp; Campaigns
            </TabsTrigger>
          </TabsList>

          {/* ════════════════════════════════════════════════════════════════════ */}
          {/* TAB 1: SEO METRICS, SETTINGS & META TAGS                           */}
          {/* ════════════════════════════════════════════════════════════════════ */}
          <TabsContent value="seo" className="space-y-6">
            {/* Score summary KPIs */}
            <div className="grid sm:grid-cols-3 gap-4">
              <KpiCard
                title="SEO Score"
                value={`${avgSeo}/100`}
                sub="Avg on-page score"
                icon={Search}
                gradient="bg-blue-600"
              />
              <KpiCard
                title="Mobile Score"
                value={`${avgMobile}/100`}
                sub="Mobile responsiveness"
                icon={TrendingUp}
                gradient="bg-emerald-600"
              />
              <KpiCard
                title="Pages Tracked"
                value={totalPages}
                sub="Total monitored pages"
                icon={Layers}
                gradient="bg-purple-600"
              />
            </div>

            {/* Health gauges */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-600" />
                  Site Health Overview
                </CardTitle>
                <CardDescription>
                  Aggregated performance metrics across indexed and crawled URLs
                </CardDescription>
              </CardHeader>
              <CardContent>
                {seoLoading ? (
                  <div className="grid sm:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-24 bg-slate-100 animate-pulse rounded-xl"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-3 gap-4">
                    <ScoreGauge
                      score={avgSeo}
                      label="SEO Score"
                      description="On-page optimization &amp; structure"
                    />
                    <ScoreGauge
                      score={avgMobile}
                      label="Mobile Score"
                      description="Mobile friendliness &amp; viewport"
                    />
                    <ScoreGauge
                      score={avgSpeed}
                      label="Page Speed"
                      description="Core Web Vitals &amp; performance"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Meta Tags & Core Settings */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                      <FileCode className="h-5 w-5 text-purple-600" />
                      Meta Tags &amp; Search Indexing Configuration
                    </CardTitle>
                    <CardDescription>
                      Default platform metadata, canonical domains, and crawler instructions
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href="/sitemap.xml"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="outline" size="sm" className="h-8 text-xs">
                        <ExternalLink className="h-3.5 w-3.5 mr-1" />
                        sitemap.xml
                      </Button>
                    </a>
                    <a
                      href="/robots.txt"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="outline" size="sm" className="h-8 text-xs">
                        <ExternalLink className="h-3.5 w-3.5 mr-1" />
                        robots.txt
                      </Button>
                    </a>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  {/* Title template */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Default Title Pattern
                      </span>
                      <Badge variant="outline" className="text-xs text-blue-600 border-blue-200 bg-blue-50">
                        56 chars · Optimal
                      </Badge>
                    </div>
                    <p className="text-sm font-medium text-slate-900 font-mono">
                      FideVoltz | Advanced Electronics &amp; Maker Community
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Recommended: 50–60 characters. Format: [Page Title] | FideVoltz
                    </p>
                  </div>

                  {/* Meta description */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Default Meta Description
                      </span>
                      <Badge variant="outline" className="text-xs text-emerald-600 border-emerald-200 bg-emerald-50">
                        128 chars · Optimal
                      </Badge>
                    </div>
                    <p className="text-sm font-medium text-slate-900 line-clamp-2">
                      Explore high-performance electronics components, IoT tutorials, and community DIY engineering projects on FideVoltz.
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Recommended: 150–160 characters. Succinct value proposition.
                    </p>
                  </div>

                  {/* Search Engine Directives */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Robots Directives
                      </span>
                      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 text-xs">
                        Indexable
                      </Badge>
                    </div>
                    <p className="text-sm font-medium text-slate-900 font-mono">
                      index, follow, max-image-preview:large
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Enables full crawling of public store, projects, and tutorial pages.
                    </p>
                  </div>

                  {/* Social & Open Graph */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Open Graph &amp; Social Cards
                      </span>
                      <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 text-xs">
                        Configured
                      </Badge>
                    </div>
                    <p className="text-sm font-medium text-slate-900">
                      og:title, og:description, og:image, twitter:card
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Dynamic Open Graph preview images generated for tutorials &amp; products.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Checklist & Tips in 2 columns */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* SEO Checklist */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    SEO Action Checklist
                  </CardTitle>
                  <CardDescription>
                    Essential optimization tasks to elevate search visibility
                  </CardDescription>
                </CardHeader>
                <CardContent className="divide-y divide-slate-100">
                  <ChecklistItem
                    text="Add meta title to all pages"
                    hint="Target 50–60 characters with primary keywords"
                  />
                  <ChecklistItem
                    text="Write meta descriptions"
                    hint="Target 150–160 characters describing content value"
                  />
                  <ChecklistItem
                    text="Set canonical URLs"
                    hint="Prevents duplicate content penalties across query params"
                  />
                  <ChecklistItem
                    text="Enable XML sitemap"
                    hint="Guides search engines to index new projects &amp; products"
                  />
                  <ChecklistItem
                    text="Add alt text to all images"
                    hint="Crucial for schematics, hardware diagrams, and image SEO"
                  />
                  <ChecklistItem
                    text="Fix broken internal links"
                    hint="Check store, category, and project references"
                  />
                  <ChecklistItem
                    text="Add structured data (JSON-LD)"
                    hint="Enables rich snippets in Google search results"
                  />
                  <ChecklistItem
                    done
                    text="Mobile-friendly design"
                    hint="Responsive layouts detected across device viewports"
                  />
                </CardContent>
              </Card>

              {/* Keyword & Content Tips */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Tag className="h-5 w-5 text-blue-500" />
                    Content &amp; Keyword Strategy
                  </CardTitle>
                  <CardDescription>
                    Best practices tailored for electronics, DIY, and maker tutorials
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      {
                        icon: Search,
                        tip: "Focus on long-tail maker queries",
                        desc: '"Arduino UV water purifier DIY" ranks significantly higher than generic "Arduino".',
                      },
                      {
                        icon: FileText,
                        tip: "Write detailed tutorial excerpts",
                        desc: "Use 150+ character excerpts to trigger Google rich answers and featured snippets.",
                      },
                      {
                        icon: Tag,
                        tip: "Tag products & components consistently",
                        desc: "Include microcontroller tags like 'ESP32', 'STM32', 'Raspberry Pi' for internal search and indexing.",
                      },
                      {
                        icon: LinkIcon,
                        tip: "Link tutorial guides directly to store components",
                        desc: "Internal linking boosts dwell time, domain authority, and conversion rates.",
                      },
                      {
                        icon: Globe,
                        tip: "Submit sitemaps via Google Search Console",
                        desc: "Ensures newly published projects and products are crawled within 24 hours.",
                      },
                    ].map(({ icon: Icon, tip, desc }, i) => (
                      <div
                        key={i}
                        className="flex gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100/70 transition-colors"
                      >
                        <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                          <Icon className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-800">
                            {tip}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Page Performance Table */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-semibold">
                      Crawled Page Performance
                    </CardTitle>
                    <CardDescription>
                      Page-level SEO audit scores and tracking status
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="text-xs text-slate-600">
                    {totalPages} tracked
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {seoLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-12 bg-slate-100 animate-pulse rounded-lg"
                      />
                    ))}
                  </div>
                ) : pagesList.length > 0 ? (
                  <div className="divide-y divide-slate-100">
                    {pagesList.slice(0, 10).map((page: any, i: number) => {
                      const score = page.seoScore || 0;
                      return (
                        <div key={i} className="py-3.5 first:pt-0 last:pb-0">
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="min-w-0 pr-4">
                              <p className="text-sm font-medium text-slate-900 truncate">
                                {page.title || page.path}
                              </p>
                              <p className="text-xs text-slate-400 font-mono truncate">
                                {page.path || page.page}
                              </p>
                            </div>
                            <Badge
                              className={
                                score >= 80
                                  ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                                  : score >= 60
                                  ? "bg-amber-100 text-amber-700 hover:bg-amber-100"
                                  : "bg-rose-100 text-rose-700 hover:bg-rose-100"
                              }
                            >
                              {score}/100
                            </Badge>
                          </div>
                          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                score >= 80
                                  ? "bg-emerald-500"
                                  : score >= 60
                                  ? "bg-amber-500"
                                  : "bg-rose-500"
                              }`}
                              style={{ width: `${score}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-14 text-center">
                    <Search className="h-10 w-10 mx-auto text-slate-300 mb-3" />
                    <p className="font-semibold text-slate-700">
                      No Crawled SEO Data Yet
                    </p>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                      Page audit records will appear here as search crawlers inspect your platform.
                    </p>
                    <div className="mt-4 p-4 bg-blue-50 rounded-xl text-left max-w-md mx-auto border border-blue-100">
                      <p className="text-xs font-semibold text-blue-900 flex items-center gap-1.5">
                        <Info className="h-4 w-4 text-blue-600" />
                        Next Steps for Search Indexing
                      </p>
                      <ol className="text-xs text-blue-700 mt-2 space-y-1.5 list-decimal list-inside">
                        <li>Submit your sitemap (`/sitemap.xml`) to Google Search Console</li>
                        <li>Request immediate URL inspection on high-priority products</li>
                        <li>Analytics data updates periodically upon crawler verification</li>
                      </ol>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ════════════════════════════════════════════════════════════════════ */}
          {/* TAB 2: ADVERTISEMENTS & CAMPAIGNS                                  */}
          {/* ════════════════════════════════════════════════════════════════════ */}
          <TabsContent value="ads" className="space-y-6">
            {/* Quick Actions & Management Hub Banner */}
            <div className="grid sm:grid-cols-3 gap-3">
              {[
                {
                  href: "/dashboard/seo-ads/ads",
                  icon: Target,
                  label: "Ad Manager",
                  desc: "Browse and configure all ad campaigns",
                  color: "hover:border-blue-400 hover:bg-blue-50/60",
                },
                {
                  href: "/dashboard/seo-ads/ads/new",
                  icon: Plus,
                  label: "Create New Ad",
                  desc: "Launch a new banner or promotion",
                  color: "hover:border-emerald-400 hover:bg-emerald-50/60",
                },
                {
                  href: "/dashboard/analytics",
                  icon: BarChart3,
                  label: "Platform Analytics",
                  desc: "Cross-system traffic and visitor metrics",
                  color: "hover:border-purple-400 hover:bg-purple-50/60",
                },
              ].map(({ href, icon: Icon, label, desc, color }) => (
                <Link key={href} href={href}>
                  <div
                    className={`flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-xl cursor-pointer transition-all shadow-sm ${color}`}
                  >
                    <div className="p-2.5 rounded-lg bg-slate-100 shrink-0">
                      <Icon className="h-5 w-5 text-slate-700" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {label}
                      </p>
                      <p className="text-xs text-slate-500">{desc}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Top performing ads list */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-semibold">
                      Top Performing Advertisements
                    </CardTitle>
                    <CardDescription>
                      Ranked by clicks and conversion performance
                    </CardDescription>
                  </div>
                  <Link href="/dashboard/seo-ads/ads">
                    <Button variant="outline" size="sm">
                      Open Ad Manager <ExternalLink className="h-3 w-3 ml-2" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {analyticsLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-16 bg-slate-100 animate-pulse rounded-xl"
                      />
                    ))}
                  </div>
                ) : analytics?.topAds?.length > 0 ? (
                  <div className="divide-y divide-slate-100">
                    {analytics.topAds.slice(0, 8).map((ad: any, i: number) => {
                      const ctr =
                        ad.impressions > 0
                          ? ((ad.clicks / ad.impressions) * 100).toFixed(1)
                          : "0.0";
                      return (
                        <div
                          key={ad.id}
                          className="flex items-center gap-4 py-3.5 first:pt-0 last:pb-0"
                        >
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center text-xs font-bold text-blue-700 shrink-0">
                            {i + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-slate-900 truncate">
                                {ad.name}
                              </p>
                              <Badge
                                variant={ad.active ? "default" : "secondary"}
                                className="text-xs shrink-0"
                              >
                                {ad.active ? "Active" : "Paused"}
                              </Badge>
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5">
                              {ad.impressions.toLocaleString()} impressions ·{" "}
                              {ad.clicks.toLocaleString()} clicks · {ctr}% CTR
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-sm font-bold text-emerald-600">
                              ₦{(ad.revenue || 0).toLocaleString()}
                            </p>
                            <Link href={`/dashboard/seo-ads/ads/${ad.id}`}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2.5 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 mt-1"
                              >
                                Edit Campaign
                              </Button>
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-14 text-center text-slate-400">
                    <Target className="h-12 w-12 mx-auto mb-3 opacity-30 text-slate-500" />
                    <p className="text-base font-semibold text-slate-700">
                      No Advertisements Created Yet
                    </p>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                      Promote projects, featured store components, or third-party sponsor campaigns.
                    </p>
                    <Link href="/dashboard/seo-ads/ads/new">
                      <Button className="mt-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Your First Ad
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Impressions vs Clicks Chart */}
            {adChartData.length > 0 && (
              <Card className="border-0 shadow-sm">
                <BarChart
                  title="Ad Impressions vs Clicks"
                  data={adChartData}
                  dataKeys={[
                    {
                      key: "impressions",
                      color: "#3b82f6",
                      name: "Impressions",
                    },
                    { key: "clicks", color: "#8b5cf6", name: "Clicks" },
                  ]}
                  xAxisKey="name"
                  height={280}
                />
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default function SEOAdsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
          <div className="text-center space-y-3">
            <RefreshCcw className="h-8 w-8 text-blue-600 animate-spin mx-auto" />
            <p className="text-sm font-medium text-slate-600">
              Loading SEO &amp; Advertising Hub...
            </p>
          </div>
        </div>
      }
    >
      <SEOAdsHubContent />
    </Suspense>
  );
}
