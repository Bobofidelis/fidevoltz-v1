"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import {
  BarChart3,
  TrendingUp,
  Eye,
  MousePointerClick,
  DollarSign,
  Plus,
  Activity,
  Target,
  Settings,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { useAdAnalytics, useSEOMetrics } from "@/lib/hooks/use-ads";
import { Loader2 } from "lucide-react";

export default function SEOPage() {
  const { data: analytics, isLoading: analyticsLoading } = useAdAnalytics();
  const { data: seoData, isLoading: seoLoading } = useSEOMetrics();

  const isLoading = analyticsLoading || seoLoading;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: "SEO & Ads", href: "/dashboard/seo" },
          { label: "Overview" },
        ]}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            SEO & Ads Management
          </h1>
          <p className="text-gray-500 mt-1">
            Manage advertisements and monitor SEO performance
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/seo-ads/seo">
            <Button variant="outline" className="group">
              <Activity className="h-4 w-4 mr-2 group-hover:text-blue-600 transition-colors" />
              SEO Dashboard
            </Button>
          </Link>
          <Link href="/dashboard/seo-ads/ads/new">
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Plus className="h-4 w-4 mr-2" />
              Create Ad
            </Button>
          </Link>
        </div>
      </div>

      {/* Tabs for better organization */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="ads">Advertisements</TabsTrigger>
          <TabsTrigger value="seo">SEO Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Ad Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-blue-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Ads</CardTitle>
                <Target className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.totalAds || 0}</div>
                <p className="text-xs text-gray-500 mt-1">
                  {analytics?.activeAds || 0} active
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-green-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Impressions</CardTitle>
                <Eye className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics?.totalImpressions?.toLocaleString() || 0}
                </div>
                <p className="text-xs text-gray-500 mt-1">Total views</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-purple-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Clicks</CardTitle>
                <MousePointerClick className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics?.totalClicks?.toLocaleString() || 0}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {analytics?.ctr || 0}% CTR
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-yellow-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${analytics?.totalRevenue?.toFixed(2) || '0.00'}
                </div>
                <p className="text-xs text-gray-500 mt-1">Total earnings</p>
              </CardContent>
            </Card>
          </div>

          {/* SEO Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">SEO Score</CardTitle>
                <BarChart3 className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {seoData?.stats?.avgSeoScore || 0}/100
                </div>
                <p className="text-xs text-gray-500 mt-1">Average across all pages</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Mobile Score</CardTitle>
                <TrendingUp className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {seoData?.stats?.avgMobileScore || 0}/100
                </div>
                <p className="text-xs text-gray-500 mt-1">Mobile optimization</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pages Tracked</CardTitle>
                <Activity className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {seoData?.stats?.totalPages || 0}
                </div>
                <p className="text-xs text-gray-500 mt-1">Total pages monitored</p>
              </CardContent>
            </Card>
          </div>

          {/* Top Performing Ads */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Top Performing Ads</CardTitle>
                <Link href="/dashboard/seo-ads/ads">
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {analytics?.topAds && analytics.topAds.length > 0 ? (
                <div className="space-y-4">
                  {analytics.topAds.slice(0, 5).map((ad: any) => (
                    <div
                      key={ad.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium">{ad.name}</h4>
                        <div className="flex gap-4 mt-2 text-sm text-gray-500">
                          <span>{ad.impressions.toLocaleString()} impressions</span>
                          <span>{ad.clicks.toLocaleString()} clicks</span>
                          <span>
                            {ad.impressions > 0
                              ? ((ad.clicks / ad.impressions) * 100).toFixed(2)
                              : 0}
                            % CTR
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">
                          ${ad.revenue.toFixed(2)}
                        </div>
                        <Link href={`/dashboard/seo-ads/ads/${ad.id}`}>
                          <Button variant="ghost" size="sm" className="mt-1">
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No ads created yet</p>
                  <Link href="/dashboard/seo-ads/ads/new">
                    <Button className="mt-4">Create Your First Ad</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link href="/dashboard/seo-ads/ads">
                  <Button variant="outline" className="w-full justify-start">
                    <Target className="h-4 w-4 mr-2" />
                    Manage Ads
                  </Button>
                </Link>
                <Link href="/dashboard/seo-ads/seo">
                  <Button variant="outline" className="w-full justify-start">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    SEO Dashboard
                  </Button>
                </Link>
                <Link href="/dashboard/seo-ads/ads/new">
                  <Button variant="outline" className="w-full justify-start hover:bg-blue-50 transition-colors">
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Ad
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Ads Tab */}
        <TabsContent value="ads" className="space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>All Advertisements</CardTitle>
                  <Link href="/dashboard/seo-ads/ads">
                    <Button>
                      View All Ads
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">
                  Manage all your advertisements from the{" "}
                  <Link href="/dashboard/seo-ads/ads" className="text-blue-600 hover:underline">
                    Ads Management
                  </Link>{" "}
                  page.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* SEO Tab */}
        <TabsContent value="seo" className="space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>SEO Performance</CardTitle>
                  <Link href="/dashboard/seo-ads/seo">
                    <Button>
                      View SEO Dashboard
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">
                  Monitor your site's SEO performance from the{" "}
                  <Link href="/dashboard/seo-ads/seo" className="text-blue-600 hover:underline">
                    SEO Dashboard
                  </Link>{" "}
                  page.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
