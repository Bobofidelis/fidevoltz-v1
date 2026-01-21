"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye, Users, Clock, TrendingDown, ArrowLeft, Calendar } from "lucide-react";
import { MetricCard } from "@/components/analytics/MetricCard";
import { LineChart } from "@/components/analytics/LineChart";
import { PieChart } from "@/components/analytics/PieChart";
import { useTrafficAnalytics } from "@/lib/hooks/use-analytics";
import { Loader2 } from "lucide-react";
import Link from "next/link";

export default function TrafficAnalyticsPage() {
  const [period, setPeriod] = useState(30);
  const { data, isLoading } = useTrafficAnalytics(period);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/overview">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Traffic Analytics
            </h1>
            <p className="text-gray-500 mt-2">
              Monitor visitor behavior and engagement metrics
            </p>
          </div>
        </div>
        
        <Select value={period.toString()} onValueChange={(v) => setPeriod(parseInt(v))}>
          <SelectTrigger className="w-[180px]">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="14">Last 14 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="60">Last 60 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Page Views"
          value={data?.summary?.totalPageViews || 0}
          icon={Eye}
          iconColor="text-purple-600"
          iconBgColor="bg-purple-100"
        />
        <MetricCard
          title="Unique Visitors"
          value={data?.summary?.uniqueVisitors || 0}
          icon={Users}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-100"
        />
        <MetricCard
          title="Bounce Rate"
          value={data?.summary?.bounceRate || 0}
          format="percentage"
          icon={TrendingDown}
          iconColor="text-red-600"
          iconBgColor="bg-red-100"
        />
        <MetricCard
          title="Avg Session Time"
          value={`${Math.floor((data?.summary?.avgSessionDuration || 0) / 60)}m ${(data?.summary?.avgSessionDuration || 0) % 60}s`}
          icon={Clock}
          iconColor="text-green-600"
          iconBgColor="bg-green-100"
        />
      </div>

      {/* Traffic Chart */}
      <LineChart
        title="Traffic Over Time"
        data={data?.charts?.traffic || []}
        dataKeys={[
          { key: 'views', color: '#8b5cf6', name: 'Page Views' },
          { key: 'visitors', color: '#3b82f6', name: 'Unique Visitors' },
        ]}
        xAxisKey="date"
        height={400}
      />

      {/* Device & Browser Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PieChart
          title="Traffic by Device"
          data={data?.charts?.devices || []}
          dataKey="count"
          nameKey="device"
          height={350}
        />
        <PieChart
          title="Traffic by Browser"
          data={data?.charts?.browsers || []}
          dataKey="count"
          nameKey="browser"
          height={350}
        />
      </div>

      {/* Top Pages */}
      <Card>
        <CardHeader>
          <CardTitle>Top Pages</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Page Path</TableHead>
                <TableHead className="text-right">Views</TableHead>
                <TableHead className="text-right">Unique Visitors</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.topPages?.map((page: any, index: number) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{page.path}</TableCell>
                  <TableCell className="text-right">{page.views.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{page.uniqueVisitors.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Top Traffic Sources */}
      <Card>
        <CardHeader>
          <CardTitle>Top Traffic Sources</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Source</TableHead>
                <TableHead className="text-right">Visits</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.topSources?.map((source: any, index: number) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{source.source}</TableCell>
                  <TableCell className="text-right">{source.count.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
