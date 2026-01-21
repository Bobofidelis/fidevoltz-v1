"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSEOMetrics } from "@/lib/hooks/use-ads";
import { Loader2, TrendingUp, TrendingDown, Minus } from "lucide-react";

export default function SEODashboardPage() {
  const { data, isLoading } = useSEOMetrics();

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return <Badge className="bg-green-600">Good</Badge>;
    if (score >= 60) return <Badge className="bg-yellow-600">Fair</Badge>;
    return <Badge className="bg-red-600">Poor</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">SEO Dashboard</h1>
        <p className="text-gray-500 mt-1">Monitor and optimize your site's SEO performance</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : (
        <>
          {/* Overall Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Average SEO Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${getScoreColor(data?.stats?.avgSeoScore || 0)}`}>
                  {data?.stats?.avgSeoScore || 0}/100
                </div>
                {getScoreBadge(data?.stats?.avgSeoScore || 0)}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Mobile Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${getScoreColor(data?.stats?.avgMobileScore || 0)}`}>
                  {data?.stats?.avgMobileScore || 0}/100
                </div>
                {getScoreBadge(data?.stats?.avgMobileScore || 0)}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Speed Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${getScoreColor(data?.stats?.avgSpeedScore || 0)}`}>
                  {data?.stats?.avgSpeedScore || 0}/100
                </div>
                {getScoreBadge(data?.stats?.avgSpeedScore || 0)}
              </CardContent>
            </Card>
          </div>

          {/* Pages Table */}
          <Card>
            <CardHeader>
              <CardTitle>Page Performance</CardTitle>
            </CardHeader>
            <CardContent>
              {data?.metrics && data.metrics.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3">Page</th>
                        <th className="text-center p-3">SEO Score</th>
                        <th className="text-center p-3">Mobile</th>
                        <th className="text-center p-3">Speed</th>
                        <th className="text-center p-3">Page Views</th>
                        <th className="text-center p-3">Bounce Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.metrics.map((metric: any) => (
                        <tr key={metric.id} className="border-b hover:bg-gray-50">
                          <td className="p-3 font-medium">{metric.page}</td>
                          <td className="text-center p-3">
                            <span className={getScoreColor(metric.seoScore)}>
                              {metric.seoScore}
                            </span>
                          </td>
                          <td className="text-center p-3">
                            <span className={getScoreColor(metric.mobileScore)}>
                              {metric.mobileScore}
                            </span>
                          </td>
                          <td className="text-center p-3">
                            <span className={getScoreColor(metric.speedScore)}>
                              {metric.speedScore}
                            </span>
                          </td>
                          <td className="text-center p-3">{metric.pageViews.toLocaleString()}</td>
                          <td className="text-center p-3">{metric.bounceRate.toFixed(1)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <p>No SEO data available yet</p>
                  <p className="text-sm mt-2">SEO metrics will appear here once pages are crawled</p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
