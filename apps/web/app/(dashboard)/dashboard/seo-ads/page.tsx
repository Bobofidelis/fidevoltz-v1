"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  TrendingUp,
  Eye,
  MousePointerClick,
  DollarSign,
  Plus,
  Activity,
  Target,
} from "lucide-react";
import Link from "next/link";
import { useAdAnalytics, useSEOMetrics } from "@/lib/hooks/use-ads";
import { Loader2 } from "lucide-react";

export default function SEOAdsPage() {
  const { data: analytics, isLoading: analyticsLoading } = useAdAnalytics();
  const { data: seoData, isLoading: seoLoading } = useSEOMetrics();

  const isLoading = analyticsLoading || seoLoading;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">SEO & Ads Management</h1>
          <p className="text-gray-500 mt-1">
            Manage advertisements and monitor SEO performance
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/seo-ads/seo">
            <Button variant="outline">
              <Activity className="h-4 w-4 mr-2" />
              SEO Dashboard
            </Button>
          </Link>
          <Link href="/dashboard/seo-ads/ads/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Ad
            </Button>
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : (
        <>
          {/* Ad Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Ads</CardTitle>
                <Target className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.totalAds || 0}</div>
                <p className="text-xs text-gray-500 mt-1">
                  {analytics?.activeAds || 0} active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Impressions</CardTitle>
                <Eye className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics?.totalImpressions?.toLocaleString() || 0}
                </div>
                <p className="text-xs text-gray-500 mt-1">Total views</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Clicks</CardTitle>
                <MousePointerClick className="h-4 w-4 text-gray-500" />
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

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-gray-500" />
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
                  <Button variant="outline" className="w-full justify-start">
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Ad
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
