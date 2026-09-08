"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3, TrendingUp, Eye, MousePointerClick, DollarSign,
  Plus, Activity, Target, ExternalLink, Search, Globe,
  RefreshCcw, Settings2, CheckCircle2, AlertCircle, Info,
  Zap, Tag, Link as LinkIcon, FileText, ArrowUpRight,
  LifeBuoy, Layers
} from "lucide-react";
import Link from "next/link";
import { useAdAnalytics, useSEOMetrics } from "@/lib/hooks/use-ads";
import { BarChart } from "@/components/analytics/BarChart";

// ── Sub-components ─────────────────────────────────────────────────────────

function KpiCard({ title, value, sub, icon: Icon, gradient }: any) {
  return (
    <Card className="relative overflow-hidden border-0 shadow-sm">
      <div className={`absolute inset-0 ${gradient} opacity-5`} />
      <CardContent className="p-5 relative">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
            {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
          </div>
          <div className={`p-2.5 rounded-xl ${gradient} bg-opacity-15`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ScoreGauge({ score, label, description }: { score: number; label: string; description: string }) {
  const pct = Math.min(100, Math.max(0, score));
  const color = pct >= 80 ? "#10b981" : pct >= 60 ? "#f59e0b" : "#ef4444";
  const bgColor = pct >= 80 ? "bg-emerald-50 border-emerald-200" : pct >= 60 ? "bg-amber-50 border-amber-200" : "bg-rose-50 border-rose-200";
  const textColor = pct >= 80 ? "text-emerald-600" : pct >= 60 ? "text-amber-600" : "text-rose-600";
  const rating = pct >= 80 ? "Good" : pct >= 60 ? "Fair" : "Needs Work";

  return (
    <div className={`flex items-center gap-4 p-4 rounded-xl border ${bgColor}`}>
      {/* Ring */}
      <div className="relative h-16 w-16 shrink-0">
        <svg viewBox="0 0 36 36" className="h-16 w-16 -rotate-90">
          <path
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none" stroke="#e5e7eb" strokeWidth="3"
          />
          <path
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none" stroke={color} strokeWidth="3"
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
        <Badge variant="outline" className={`mt-1 text-xs ${textColor} border-current`}>{rating}</Badge>
      </div>
    </div>
  );
}

function ChecklistItem({ done, text, hint }: { done?: boolean; text: string; hint?: string }) {
  return (
    <div className="flex items-start gap-3 py-2.5">
      <div className={`mt-0.5 h-5 w-5 rounded-full flex items-center justify-center shrink-0 ${done ? "bg-emerald-100" : "bg-slate-100"}`}>
        {done
          ? <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          : <AlertCircle className="h-4 w-4 text-slate-400" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${done ? "text-slate-500 line-through" : "text-slate-800"}`}>{text}</p>
        {hint && <p className="text-xs text-slate-400 mt-0.5">{hint}</p>}
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function SEOPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const { data: analytics, isLoading: analyticsLoading, mutate: refreshAnalytics } = useAdAnalytics() as any;
  const { data: seoData, isLoading: seoLoading } = useSEOMetrics() as any;

  const avgSeo = seoData?.stats?.avgSeoScore || 0;
  const avgMobile = seoData?.stats?.avgMobileScore || 0;
  const avgSpeed = seoData?.stats?.avgPageSpeed || 0;
  const totalPages = seoData?.stats?.totalPages || 0;

  const adChartData = (analytics?.topAds || []).slice(0, 8).map((ad: any) => ({
    name: ad.name?.substring(0, 12) + (ad.name?.length > 12 ? "…" : ""),
    impressions: ad.impressions || 0,
    clicks: ad.clicks || 0,
  }));

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Hero header ── */}
      <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 px-6 pt-8 pb-16">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur">
                  <Search className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">SEO & Advertising</h1>
                  <p className="text-blue-200 text-sm">Monitor, optimise, and grow your organic reach</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                onClick={() => refreshAnalytics?.()}
              >
                <RefreshCcw className="h-4 w-4 mr-2" />Refresh
              </Button>
              <Link href="/dashboard/seo-ads/ads">
                <Button variant="outline" size="sm" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
                  <Settings2 className="h-4 w-4 mr-2" />Manage Ads
                </Button>
              </Link>
              <Link href="/dashboard/seo-ads/ads/new">
                <Button size="sm" className="bg-white text-blue-700 hover:bg-blue-50 font-semibold shadow">
                  <Plus className="h-4 w-4 mr-2" />New Ad
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── KPI strip (overlapping the gradient) ── */}
      <div className="max-w-5xl mx-auto px-6 -mt-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard title="Total Ads" value={analytics?.totalAds ?? "—"} sub={`${analytics?.activeAds ?? 0} active`} icon={Target} gradient="bg-blue-600" />
          <KpiCard title="Impressions" value={(analytics?.totalImpressions || 0).toLocaleString()} sub="Total ad views" icon={Eye} gradient="bg-emerald-600" />
          <KpiCard title="Clicks" value={(analytics?.totalClicks || 0).toLocaleString()} sub={`${analytics?.ctr || 0}% CTR`} icon={MousePointerClick} gradient="bg-purple-600" />
          <KpiCard title="Revenue" value={`₦${(analytics?.totalRevenue || 0).toLocaleString()}`} sub="Total ad earnings" icon={DollarSign} gradient="bg-amber-500" />
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="max-w-5xl mx-auto px-6 mt-6 pb-12">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white border border-slate-200 p-1 shadow-sm rounded-xl">
            <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow rounded-lg">
              <BarChart3 className="h-4 w-4 mr-2" />Overview
            </TabsTrigger>
            <TabsTrigger value="seo" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow rounded-lg">
              <Globe className="h-4 w-4 mr-2" />SEO Health
            </TabsTrigger>
            <TabsTrigger value="ads" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow rounded-lg">
              <Target className="h-4 w-4 mr-2" />Advertisements
            </TabsTrigger>
          </TabsList>

          {/* ── OVERVIEW TAB ── */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-5 gap-6">
              {/* SEO score gauges */}
              <Card className="lg:col-span-2 border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold">Site Health Scores</CardTitle>
                  <CardDescription>Based on crawled pages</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {seoLoading ? (
                    <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 bg-slate-100 animate-pulse rounded-xl" />)}</div>
                  ) : (
                    <>
                      <ScoreGauge score={avgSeo} label="SEO Score" description="On-page optimisation" />
                      <ScoreGauge score={avgMobile} label="Mobile Score" description="Mobile friendliness" />
                      <ScoreGauge score={avgSpeed} label="Page Speed" description="Load performance" />
                      <div className="pt-2 border-t text-xs text-slate-400">{totalPages} page{totalPages !== 1 ? "s" : ""} tracked</div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Top ads */}
              <Card className="lg:col-span-3 border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base font-semibold">Top Performing Ads</CardTitle>
                      <CardDescription>Sorted by clicks</CardDescription>
                    </div>
                    <Link href="/dashboard/seo-ads/ads">
                      <Button variant="outline" size="sm">View All <ExternalLink className="h-3 w-3 ml-2" /></Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  {analyticsLoading ? (
                    <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-14 bg-slate-100 animate-pulse rounded-lg" />)}</div>
                  ) : analytics?.topAds?.length > 0 ? (
                    <div className="divide-y divide-slate-100">
                      {analytics.topAds.slice(0, 5).map((ad: any, i: number) => {
                        const ctr = ad.impressions > 0 ? ((ad.clicks / ad.impressions) * 100).toFixed(1) : "0.0";
                        return (
                          <div key={ad.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                            <div className="h-7 w-7 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center text-xs font-bold text-blue-700 shrink-0">{i+1}</div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-900 truncate">{ad.name}</p>
                              <p className="text-xs text-slate-400">{ad.impressions.toLocaleString()} impr · {ad.clicks.toLocaleString()} clicks · {ctr}% CTR</p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-sm font-bold text-emerald-600">₦{ad.revenue.toFixed(2)}</p>
                              <Link href={`/dashboard/seo-ads/ads/${ad.id}`}>
                                <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">Edit</Button>
                              </Link>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-10 text-slate-400">
                      <Target className="h-10 w-10 mx-auto mb-3 opacity-30" />
                      <p className="text-sm font-medium">No ads yet</p>
                      <Link href="/dashboard/seo-ads/ads/new">
                        <Button size="sm" className="mt-4">Create Your First Ad</Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Chart */}
            {adChartData.length > 0 && (
              <Card className="border-0 shadow-sm">
                <BarChart
                  title="Ad Impressions vs Clicks"
                  data={adChartData}
                  dataKeys={[
                    { key: "impressions", color: "#3b82f6", name: "Impressions" },
                    { key: "clicks", color: "#8b5cf6", name: "Clicks" },
                  ]}
                  xAxisKey="name"
                  height={260}
                />
              </Card>
            )}

            {/* Quick actions */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3"><CardTitle className="text-base">Quick Actions</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { href: "/dashboard/seo-ads/ads", icon: Target, label: "Manage Ads", desc: "View & edit campaigns", color: "hover:border-blue-400 hover:bg-blue-50" },
                    { href: "/dashboard/seo-ads/seo", icon: BarChart3, label: "SEO Report", desc: "Page-level analysis", color: "hover:border-purple-400 hover:bg-purple-50" },
                    { href: "/dashboard/seo-ads/ads/new", icon: Plus, label: "New Ad", desc: "Launch a campaign", color: "hover:border-emerald-400 hover:bg-emerald-50" },
                  ].map(({ href, icon: Icon, label, desc, color }) => (
                    <Link key={href} href={href}>
                      <div className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all ${color}`}>
                        <Icon className="h-5 w-5 text-slate-600" />
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{label}</p>
                          <p className="text-xs text-slate-500">{desc}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── SEO HEALTH TAB ── */}
          <TabsContent value="seo" className="space-y-6">
            {/* Score summary */}
            <div className="grid sm:grid-cols-3 gap-4">
              <KpiCard title="SEO Score" value={`${avgSeo}/100`} sub="Avg across all pages" icon={Search} gradient="bg-blue-600" />
              <KpiCard title="Mobile Score" value={`${avgMobile}/100`} sub="Mobile optimisation" icon={TrendingUp} gradient="bg-emerald-600" />
              <KpiCard title="Pages Tracked" value={totalPages} sub="Total monitored" icon={Layers} gradient="bg-purple-600" />
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* SEO Checklist */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    SEO Checklist
                  </CardTitle>
                  <CardDescription>Essential tasks to improve your ranking</CardDescription>
                </CardHeader>
                <CardContent className="divide-y divide-slate-100">
                  <ChecklistItem text="Add meta title to all pages" hint="Target 50–60 characters" />
                  <ChecklistItem text="Write meta descriptions" hint="Target 150–160 characters" />
                  <ChecklistItem text="Set canonical URLs" hint="Prevents duplicate content penalties" />
                  <ChecklistItem text="Enable XML sitemap" hint="Helps Google crawl your site" />
                  <ChecklistItem text="Add alt text to all images" hint="Improves accessibility & image SEO" />
                  <ChecklistItem text="Fix broken internal links" hint="Check store & project pages" />
                  <ChecklistItem text="Add structured data (JSON-LD)" hint="Enables rich search results" />
                  <ChecklistItem done text="Mobile-friendly design" hint="Responsive layout detected" />
                </CardContent>
              </Card>

              {/* Keyword tips */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Tag className="h-5 w-5 text-blue-500" />
                    Keyword & Content Tips
                  </CardTitle>
                  <CardDescription>Best practices for electronics/maker content</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { icon: Search, tip: "Use long-tail keywords", desc: "\"Arduino UV water purifier DIY\" ranks better than just \"Arduino\"" },
                      { icon: FileText, tip: "Write detailed tutorial excerpts", desc: "Aim for 150+ character excerpts to improve snippet visibility" },
                      { icon: Tag, tip: "Tag products consistently", desc: "Use tags like 'Arduino', 'ESP32', 'IoT' for better search matching" },
                      { icon: LinkIcon, tip: "Link tutorials to products", desc: "Internal links boost both pages' authority" },
                      { icon: Globe, tip: "Submit sitemap to Google Search Console", desc: "Accelerates indexing of new projects and products" },
                    ].map(({ icon: Icon, tip, desc }, i) => (
                      <div key={i} className="flex gap-3 p-3 bg-slate-50 rounded-lg">
                        <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                          <Icon className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-800">{tip}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Page performance table */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">Page Performance</CardTitle>
                    <CardDescription>SEO score per crawled page</CardDescription>
                  </div>
                  <Link href="/dashboard/seo-ads/seo">
                    <Button size="sm" variant="outline">Full Report <ExternalLink className="h-4 w-4 ml-2" /></Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {seoLoading ? (
                  <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-12 bg-slate-100 animate-pulse rounded-lg" />)}</div>
                ) : seoData?.pages?.length > 0 ? (
                  <div className="divide-y divide-slate-100">
                    {seoData.pages.slice(0, 8).map((page: any, i: number) => (
                      <div key={i} className="py-3 first:pt-0 last:pb-0">
                        <div className="flex items-center justify-between mb-1.5">
                          <div>
                            <p className="text-sm font-medium text-slate-900">{page.title || page.path}</p>
                            <p className="text-xs text-slate-400">{page.path}</p>
                          </div>
                          <Badge className={
                            page.seoScore >= 80
                              ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                              : page.seoScore >= 60
                              ? "bg-amber-100 text-amber-700 hover:bg-amber-100"
                              : "bg-rose-100 text-rose-700 hover:bg-rose-100"
                          }>
                            {page.seoScore}/100
                          </Badge>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${page.seoScore >= 80 ? "bg-emerald-500" : page.seoScore >= 60 ? "bg-amber-500" : "bg-rose-500"}`}
                            style={{ width: `${page.seoScore || 0}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-16 text-center">
                    <Search className="h-10 w-10 mx-auto text-slate-200 mb-4" />
                    <p className="font-medium text-slate-600">No SEO data yet</p>
                    <p className="text-sm text-slate-400 mt-1">Pages will appear here once they are crawled by search engines</p>
                    <div className="mt-4 p-4 bg-blue-50 rounded-xl text-left max-w-sm mx-auto">
                      <p className="text-sm font-semibold text-blue-800 flex items-center gap-2"><Info className="h-4 w-4" />How to get started</p>
                      <ol className="text-xs text-blue-700 mt-2 space-y-1 list-decimal list-inside">
                        <li>Submit your sitemap to Google Search Console</li>
                        <li>Request indexing of key pages</li>
                        <li>Data will appear within a few days</li>
                      </ol>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── ADS TAB ── */}
          <TabsContent value="ads" className="space-y-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>All Advertisements</CardTitle>
                    <CardDescription>Full ad management available on the dedicated manager page</CardDescription>
                  </div>
                  <Link href="/dashboard/seo-ads/ads">
                    <Button>Open Ad Manager <ExternalLink className="h-4 w-4 ml-2" /></Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {analyticsLoading ? (
                  <div className="space-y-3">{[1,2,3,4].map(i => <div key={i} className="h-16 bg-slate-100 animate-pulse rounded-xl" />)}</div>
                ) : analytics?.topAds?.length > 0 ? (
                  <div className="space-y-2">
                    {analytics.topAds.map((ad: any) => {
                      const ctr = ad.impressions > 0 ? ((ad.clicks / ad.impressions) * 100).toFixed(2) : "0.00";
                      return (
                        <div key={ad.id} className="flex items-center gap-4 p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-slate-900 truncate">{ad.name}</p>
                              <Badge variant={ad.active ? "default" : "secondary"} className="text-xs shrink-0">{ad.active ? "Active" : "Paused"}</Badge>
                            </div>
                            <div className="flex gap-4 mt-1 text-xs text-slate-500">
                              <span>{ad.impressions.toLocaleString()} impressions</span>
                              <span>{ad.clicks.toLocaleString()} clicks</span>
                              <span>{ctr}% CTR</span>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="font-bold text-emerald-600">₦{ad.revenue.toFixed(2)}</p>
                            <Link href={`/dashboard/seo-ads/ads/${ad.id}`}>
                              <Button variant="ghost" size="sm" className="h-7 mt-1 text-xs">Edit <ExternalLink className="h-3 w-3 ml-1" /></Button>
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-16 text-center text-slate-400">
                    <Target className="h-12 w-12 mx-auto mb-4 opacity-30" />
                    <p className="font-medium text-slate-600">No ads created yet</p>
                    <p className="text-sm text-slate-400 mt-1">Create your first ad to start reaching your audience</p>
                    <Link href="/dashboard/seo-ads/ads/new">
                      <Button className="mt-6 bg-gradient-to-r from-blue-600 to-purple-600">Create First Ad</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
