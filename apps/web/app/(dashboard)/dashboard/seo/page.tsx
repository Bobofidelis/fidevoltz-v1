"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3, TrendingUp, Eye, MousePointerClick, DollarSign,
  Plus, Activity, Target, ExternalLink, Search, Globe, ArrowUpRight, ArrowDownRight,
  RefreshCcw, Settings2
} from "lucide-react";
import Link from "next/link";
import { useAdAnalytics, useSEOMetrics } from "@/lib/hooks/use-ads";
import { BarChart } from "@/components/analytics/BarChart";

function SEOStatCard({ title, value, subtitle, icon: Icon, accentColor = "blue" }: any) {
  const colorMap: Record<string, any> = {
    blue: { border: "border-l-blue-500", bg: "bg-blue-50", icon: "text-blue-500" },
    green: { border: "border-l-emerald-500", bg: "bg-emerald-50", icon: "text-emerald-500" },
    purple: { border: "border-l-purple-500", bg: "bg-purple-50", icon: "text-purple-500" },
    amber: { border: "border-l-amber-500", bg: "bg-amber-50", icon: "text-amber-500" },
  };
  const c = colorMap[accentColor] || colorMap.blue;
  return (
    <Card className={`border-l-4 ${c.border} hover:shadow-md transition-shadow`}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
            {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
          </div>
          <div className={`p-2.5 rounded-xl ${c.bg}`}><Icon className={`h-5 w-5 ${c.icon}`} /></div>
        </div>
      </CardContent>
    </Card>
  );
}

function ScoreMeter({ score, label }: { score: number; label: string }) {
  const color = score >= 80 ? "bg-emerald-500" : score >= 60 ? "bg-amber-500" : "bg-rose-500";
  const textColor = score >= 80 ? "text-emerald-600" : score >= 60 ? "text-amber-600" : "text-rose-600";
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        <span className={`text-sm font-bold ${textColor}`}>{score}/100</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

export default function SEOPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const { data: analytics, isLoading: analyticsLoading, mutate: refreshAnalytics } = useAdAnalytics() as any;
  const { data: seoData, isLoading: seoLoading } = useSEOMetrics() as any;
  const isLoading = analyticsLoading || seoLoading;

  const adChartData = (analytics?.topAds || []).slice(0, 8).map((ad: any) => ({
    name: ad.name?.substring(0, 12) + (ad.name?.length > 12 ? "..." : ""),
    impressions: ad.impressions || 0,
    clicks: ad.clicks || 0,
  }));

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-8 w-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Search className="h-4 w-4 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">SEO &amp; Ads</h1>
          </div>
          <p className="text-slate-500 text-sm">Monitor organic search performance and manage advertisements</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refreshAnalytics && refreshAnalytics()}>
            <RefreshCcw className="h-4 w-4 mr-2" />Refresh
          </Button>
          <Link href="/dashboard/seo-ads/ads">
            <Button variant="outline" size="sm"><Settings2 className="h-4 w-4 mr-2" />Manage Ads</Button>
          </Link>
          <Link href="/dashboard/seo-ads/ads/new">
            <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Plus className="h-4 w-4 mr-2" />New Ad
            </Button>
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-28 bg-slate-100 animate-pulse rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <SEOStatCard title="Total Ads" value={analytics?.totalAds || 0} subtitle={`${analytics?.activeAds || 0} active`} icon={Target} accentColor="blue" />
          <SEOStatCard title="Impressions" value={(analytics?.totalImpressions || 0).toLocaleString()} subtitle="Total ad views" icon={Eye} accentColor="green" />
          <SEOStatCard title="Clicks" value={(analytics?.totalClicks || 0).toLocaleString()} subtitle={`${analytics?.ctr || 0}% CTR`} icon={MousePointerClick} accentColor="purple" />
          <SEOStatCard title="Ad Revenue" value={`$${(analytics?.totalRevenue || 0).toFixed(2)}`} subtitle="Total earnings" icon={DollarSign} accentColor="amber" />
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-slate-100 p-1">
          <TabsTrigger value="overview" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <BarChart3 className="h-4 w-4 mr-2" />Overview
          </TabsTrigger>
          <TabsTrigger value="ads" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Target className="h-4 w-4 mr-2" />Advertisements
          </TabsTrigger>
          <TabsTrigger value="seo" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Globe className="h-4 w-4 mr-2" />SEO Metrics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-base font-semibold">SEO Health</CardTitle>
                <CardDescription>Overall site optimization scores</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {seoLoading ? (
                  <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-8 bg-slate-100 animate-pulse rounded" />)}</div>
                ) : (
                  <>
                    <ScoreMeter score={seoData?.stats?.avgSeoScore || 0} label="SEO Score" />
                    <ScoreMeter score={seoData?.stats?.avgMobileScore || 0} label="Mobile Score" />
                    <ScoreMeter score={seoData?.stats?.avgPageSpeed || 75} label="Page Speed" />
                    <div className="pt-2 border-t mt-4">
                      <p className="text-xs text-slate-500">{seoData?.stats?.totalPages || 0} pages tracked</p>
                    </div>
                    <Link href="/dashboard/seo-ads/seo">
                      <Button variant="outline" size="sm" className="w-full mt-2">
                        <Activity className="h-4 w-4 mr-2" />View Full SEO Report
                      </Button>
                    </Link>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-semibold">Top Performing Ads</CardTitle>
                    <CardDescription>Sorted by clicks this period</CardDescription>
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
                        <div key={ad.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center text-xs font-bold text-blue-700">{i+1}</div>
                            <div>
                              <p className="text-sm font-medium text-slate-900">{ad.name}</p>
                              <p className="text-xs text-slate-500">{ad.impressions.toLocaleString()} impr · {ad.clicks.toLocaleString()} clicks · {ctr}% CTR</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-emerald-600">${ad.revenue.toFixed(2)}</p>
                            <Link href={`/dashboard/seo-ads/ads/${ad.id}`}>
                              <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">Details</Button>
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-400">
                    <Target className="h-10 w-10 mx-auto mb-3 opacity-40" />
                    <p className="text-sm">No ads created yet</p>
                    <Link href="/dashboard/seo-ads/ads/new">
                      <Button size="sm" className="mt-4">Create Your First Ad</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {adChartData.length > 0 && (
            <BarChart title="Ad Impressions vs Clicks" data={adChartData}
              dataKeys={[{ key: "impressions", color: "#3b82f6", name: "Impressions" }, { key: "clicks", color: "#8b5cf6", name: "Clicks" }]}
              xAxisKey="name" height={280} />
          )}

          <Card>
            <CardHeader><CardTitle className="text-base">Quick Actions</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { href: "/dashboard/seo-ads/ads", icon: Target, label: "Manage Ads", color: "hover:border-blue-400 hover:bg-blue-50" },
                  { href: "/dashboard/seo-ads/seo", icon: BarChart3, label: "SEO Dashboard", color: "hover:border-purple-400 hover:bg-purple-50" },
                  { href: "/dashboard/seo-ads/ads/new", icon: Plus, label: "Create New Ad", color: "hover:border-emerald-400 hover:bg-emerald-50" },
                ].map(({ href, icon: Icon, label, color }) => (
                  <Link key={href} href={href}>
                    <Button variant="outline" className={`w-full justify-start h-12 font-medium transition-all ${color}`}>
                      <Icon className="h-4 w-4 mr-2" />{label}
                    </Button>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ads" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>All Advertisements</CardTitle>
                  <CardDescription>Full ad management is available on the dedicated page</CardDescription>
                </div>
                <Link href="/dashboard/seo-ads/ads">
                  <Button>Open Ad Manager <ExternalLink className="h-4 w-4 ml-2" /></Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {analyticsLoading ? (
                <div className="space-y-3">{[1,2,3,4].map(i => <div key={i} className="h-16 bg-slate-100 animate-pulse rounded-lg" />)}</div>
              ) : analytics?.topAds?.length > 0 ? (
                <div className="space-y-2">
                  {analytics.topAds.map((ad: any) => {
                    const ctr = ad.impressions > 0 ? ((ad.clicks / ad.impressions) * 100).toFixed(2) : "0.00";
                    return (
                      <div key={ad.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-slate-900">{ad.name}</p>
                            <Badge variant={ad.active ? "default" : "secondary"} className="text-xs">{ad.active ? "Active" : "Paused"}</Badge>
                          </div>
                          <div className="flex gap-4 mt-1 text-xs text-slate-500">
                            <span>{ad.impressions.toLocaleString()} impressions</span>
                            <span>{ad.clicks.toLocaleString()} clicks</span>
                            <span>{ctr}% CTR</span>
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <p className="font-bold text-emerald-600">${ad.revenue.toFixed(2)}</p>
                          <Link href={`/dashboard/seo-ads/ads/${ad.id}`}>
                            <Button variant="ghost" size="sm" className="h-7 mt-1 text-xs">Edit <ExternalLink className="h-3 w-3 ml-1" /></Button>
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-16 text-slate-400">
                  <Target className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p className="font-medium">No ads created yet</p>
                  <Link href="/dashboard/seo-ads/ads/new"><Button className="mt-6">Create Ad</Button></Link>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seo" className="space-y-6">
          {seoLoading ? (
            <div className="grid md:grid-cols-3 gap-4">{[1,2,3].map(i => <div key={i} className="h-28 bg-slate-100 animate-pulse rounded-xl" />)}</div>
          ) : (
            <>
              <div className="grid md:grid-cols-3 gap-4">
                <SEOStatCard title="SEO Score" value={`${seoData?.stats?.avgSeoScore || 0}/100`} subtitle="Average across all pages" icon={BarChart3} accentColor="blue" />
                <SEOStatCard title="Mobile Score" value={`${seoData?.stats?.avgMobileScore || 0}/100`} subtitle="Mobile optimization" icon={TrendingUp} accentColor="green" />
                <SEOStatCard title="Pages Tracked" value={seoData?.stats?.totalPages || 0} subtitle="Total pages monitored" icon={Activity} accentColor="purple" />
              </div>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>SEO Performance Details</CardTitle>
                      <CardDescription>Full keyword tracking and on-page analysis</CardDescription>
                    </div>
                    <Link href="/dashboard/seo-ads/seo">
                      <Button>Full SEO Dashboard <ExternalLink className="h-4 w-4 ml-2" /></Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  {seoData?.pages?.length > 0 ? (
                    <div className="divide-y divide-slate-100">
                      {seoData.pages.slice(0, 6).map((page: any, i: number) => (
                        <div key={i} className="py-4 first:pt-0 last:pb-0">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <p className="text-sm font-medium text-slate-900">{page.title || page.path}</p>
                              <p className="text-xs text-slate-400">{page.path}</p>
                            </div>
                            <Badge className={page.seoScore >= 80 ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" : page.seoScore >= 60 ? "bg-amber-100 text-amber-700 hover:bg-amber-100" : "bg-rose-100 text-rose-700 hover:bg-rose-100"}>
                              {page.seoScore}/100
                            </Badge>
                          </div>
                          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${page.seoScore >= 80 ? "bg-emerald-500" : page.seoScore >= 60 ? "bg-amber-500" : "bg-rose-500"}`} style={{ width: `${page.seoScore || 0}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-slate-400">
                      <Search className="h-10 w-10 mx-auto mb-3 opacity-30" />
                      <p className="text-sm">No SEO data tracked yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
