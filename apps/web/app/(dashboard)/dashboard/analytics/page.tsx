"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  DollarSign, TrendingUp, Users, ShoppingCart, 
  BarChart3, Download, Loader2, Package 
} from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { 
  useAnalyticsOverview, useProfitAnalytics, useActivityLogs,
  useSalesAnalytics, useUserAnalytics 
} from "@/lib/hooks/use-overview";
import { LineChart } from "@/components/analytics/LineChart";
import { AreaChart } from "@/components/analytics/AreaChart";
import { BarChart } from "@/components/analytics/BarChart";
import { PieChart } from "@/components/analytics/PieChart";
import { StatCardSkeleton, ChartSkeleton, TableSkeleton } from "@/components/dashboard/SkeletonLoader";
import { format } from "date-fns";

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState("all");
  
  // Calculate dates based on range
  const getDateRange = () => {
    if (dateRange === "all") {
      return { start: undefined, end: undefined };
    }
    
    const end = new Date();
    const start = new Date();
    switch (dateRange) {
      case "7d":
        start.setDate(start.getDate() - 7);
        break;
      case "30d":
        start.setDate(start.getDate() - 30);
        break;
      case "90d":
        start.setDate(start.getDate() - 90);
        break;
      case "1y":
        start.setFullYear(start.getFullYear() - 1);
        break;
    }
    return { start, end };
  };

  const { start, end } = getDateRange();
  const { data: analytics, isLoading: analyticsLoading, error: analyticsError } = useAnalyticsOverview(start, end);
  const { data: profitData, isLoading: profitLoading } = useProfitAnalytics(start, end);
  const { data: salesData, isLoading: salesLoading } = useSalesAnalytics(start, end);
  const { data: userData, isLoading: userLoading } = useUserAnalytics(start, end);
  const { data: activityLogs } = useActivityLogs(1, 50);

  // Show error state
  if (analyticsError) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-red-600 text-lg font-semibold">Failed to load analytics</p>
          <p className="text-muted-foreground mt-2">
            {analyticsError.message === 'Unauthorized' 
              ? 'Please log in as an admin to view analytics' 
              : 'Please try refreshing the page'}
          </p>
        </div>
      </div>
    );
  }

  // Use fallback data if loading or no data
  const safeAnalytics = analytics || {
    overview: {
      totalRevenue: 0,
      totalOrders: 0,
      uniqueVisitors: 0,
      totalPageViews: 0,
      newUsers: 0,
      uniqueUsers: 0,
      avgOrderValue: 0,
      conversionRate: 0,
    },
    charts: {
      revenue: [],
      visitors: [],
    },
    topProducts: [],
    recentActivities: [],
  };

  const safeProfitData = profitData || {
    summary: {
      totalRevenue: 0,
      totalCost: 0,
      totalProfit: 0,
      profitMargin: 0,
    },
    topProfitableProducts: [],
    profitTrend: [],
  };

  const safeSalesData = salesData || {
    summary: {
      totalRevenue: 0,
      totalOrders: 0,
      avgOrderValue: 0,
    },
    salesByCategory: [],
    salesByDay: [],
    topCustomers: [],
    recentOrders: [],
  };

  const safeUserData = userData || {
    summary: {
      totalUsers: 0,
      newUsers: 0,
      activeUsers: 0,
      retentionRate: 0,
    },
    usersByRole: [],
    userGrowth: [],
    topActiveUsers: [],
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
          <p className="text-muted-foreground">
            Detailed insights into your platform's performance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 3 months</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sales">Sales & Revenue</TabsTrigger>
          <TabsTrigger value="profit">Profit Analysis</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="activity">Activity Log</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Revenue"
              value={`₦${safeAnalytics?.overview?.totalRevenue?.toLocaleString() || 0}`}
              icon={DollarSign}
              description={`${safeAnalytics?.overview?.totalOrders || 0} orders`}
            />
            <StatCard
              title="Unique Visitors"
              value={safeAnalytics?.overview?.uniqueVisitors || 0}
              icon={Users}
              description={`${safeAnalytics?.overview?.totalPageViews || 0} page views`}
            />
            <StatCard
              title="Conversion Rate"
              value={`${safeAnalytics?.overview?.conversionRate || 0}%`}
              icon={TrendingUp}
              description="Visitor to customer"
            />
            <StatCard
              title="Avg Order Value"
              value={`₦${safeAnalytics?.overview?.avgOrderValue?.toLocaleString() || 0}`}
              icon={ShoppingCart}
              description="Per order"
            />
          </div>

          {/* Charts */}
          <div className="grid gap-4 md:grid-cols-2">
            {analyticsLoading ? (
              <Card className="flex items-center justify-center h-[350px]">
                <Loader2 className="h-8 w-8 animate-spin" />
              </Card>
            ) : (
              <LineChart
                title="Revenue Trend"
                data={safeAnalytics?.charts?.revenue || []}
                dataKeys={[{ key: 'revenue', color: '#3b82f6', name: 'Revenue' }]}
                xAxisKey="date"
                height={350}
              />
            )}
            {analyticsLoading ? (
              <Card className="flex items-center justify-center h-[350px]">
                <Loader2 className="h-8 w-8 animate-spin" />
              </Card>
            ) : (
              <AreaChart
                title="Visitor Trend"
                data={safeAnalytics?.charts?.visitors || []}
                dataKey="visitors"
                xAxisKey="date"
                color="#8b5cf6"
                height={350}
              />
            )}
          </div>

          {/* Top Products */}
          <Card>
            <CardHeader>
              <CardTitle>Top Products</CardTitle>
              <CardDescription>Best performing products by revenue</CardDescription>
            </CardHeader>
            <CardContent>
              {analyticsLoading ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : safeAnalytics?.topProducts?.length > 0 ? (
                <div className="space-y-4">
                  {safeAnalytics.topProducts.map((product: any, index: number) => (
                    <div key={product.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-muted-foreground">{product.quantity} sold</p>
                        </div>
                      </div>
                      <p className="font-bold text-green-600">₦{product.revenue.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">No product data available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Profit Tab */}
        <TabsContent value="profit" className="space-y-6">
          {profitLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-4">
                <StatCard
                  title="Total Revenue"
                  value={`₦${safeProfitData?.summary?.totalRevenue?.toLocaleString() || 0}`}
                  icon={DollarSign}
                />
                <StatCard
                  title="Total Cost"
                  value={`₦${safeProfitData?.summary?.totalCost?.toLocaleString() || 0}`}
                  icon={TrendingUp}
                />
                <StatCard
                  title="Total Profit"
                  value={`₦${safeProfitData?.summary?.totalProfit?.toLocaleString() || 0}`}
                  icon={BarChart3}
                />
                <StatCard
                  title="Profit Margin"
                  value={`${safeProfitData?.summary?.profitMargin || 0}%`}
                  icon={TrendingUp}
                />
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Top Profitable Products</CardTitle>
                </CardHeader>
                <CardContent>
                  {safeProfitData?.topProfitableProducts?.length > 0 ? (
                    <div className="space-y-3">
                      {safeProfitData.topProfitableProducts.map((product: any, index: number) => (
                        <div key={product.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div className="flex items-center gap-3">
                            <span className="font-bold">{index + 1}.</span>
                            <div>
                              <p className="font-medium">{product.name}</p>
                              <p className="text-sm text-muted-foreground">{product.quantity} sold</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-green-600">₦{product.profit.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">Revenue: ₦{product.revenue.toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-8">No profit data available</p>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Activity Log Tab */}
        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Activity Log</CardTitle>
              <CardDescription>Complete audit trail of platform actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {activityLogs?.logs?.map((log: any) => (
                  <div key={log.id} className="flex items-center justify-between p-3 bg-muted rounded-lg text-sm">
                    <div className="flex items-center gap-3">
                      <span className="font-medium">{log.user?.name || "System"}</span>
                      <span className="text-muted-foreground">{log.action}</span>
                      <span className="font-medium">{log.resource}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(log.createdAt), "MMM dd, HH:mm")}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sales Tab - Comprehensive */}
        <TabsContent value="sales" className="space-y-6">
          {salesLoading ? (
            <>
              <div className="grid gap-4 md:grid-cols-3">
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
              </div>
              <ChartSkeleton />
            </>
          ) : (
            <>
              {/* Sales Summary */}
              <div className="grid gap-4 md:grid-cols-3">
                <StatCard
                  title="Total Revenue"
                  value={`₦${safeSalesData?.summary?.totalRevenue?.toLocaleString() || 0}`}
                  icon={DollarSign}
                  description="Total sales revenue"
                />
                <StatCard
                  title="Total Orders"
                  value={safeSalesData?.summary?.totalOrders || 0}
                  icon={ShoppingCart}
                  description="Completed orders"
                />
                <StatCard
                  title="Avg Order Value"
                  value={`₦${safeSalesData?.summary?.avgOrderValue?.toLocaleString() || 0}`}
                  icon={TrendingUp}
                  description="Per order"
                />
              </div>

              {/* Sales Charts */}
              <div className="grid gap-4 md:grid-cols-2">
                <LineChart
                  title="Sales Trend"
                  data={safeSalesData?.salesByDay || []}
                  dataKeys={[
                    { key: 'revenue', color: '#10b981', name: 'Revenue' },
                    { key: 'orders', color: '#3b82f6', name: 'Orders' }
                  ]}
                  xAxisKey="date"
                  height={350}
                />
                <PieChart
                  title="Sales by Category"
                  data={safeSalesData?.salesByCategory?.map((cat: any) => ({
                    name: cat.category || 'Uncategorized',
                    value: cat.revenue || 0,
                  })) || []}
                  dataKey="value"
                  nameKey="name"
                  height={350}
                />
              </div>

              {/* Top Customers */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Customers</CardTitle>
                  <CardDescription>Highest spending customers</CardDescription>
                </CardHeader>
                <CardContent>
                  {safeSalesData?.topCustomers?.length > 0 ? (
                    <div className="space-y-3">
                      {safeSalesData.topCustomers.map((customer: any, index: number) => (
                        <div key={customer.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-medium">{customer.name || 'Unknown'}</p>
                              <p className="text-sm text-muted-foreground">{customer.order_count} orders</p>
                            </div>
                          </div>
                          <p className="font-bold text-green-600">₦{Number(customer.total_spent).toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-8">No customer data available</p>
                  )}
                </CardContent>
              </Card>

              {/* Recent Orders */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Orders</CardTitle>
                  <CardDescription>Latest orders in selected period</CardDescription>
                </CardHeader>
                <CardContent>
                  {safeSalesData?.recentOrders?.length > 0 ? (
                    <div className="space-y-3">
                      {safeSalesData.recentOrders.map((order: any) => (
                        <div key={order.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div>
                            <p className="font-medium">{order.user?.name || 'Guest'}</p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(order.createdAt), "MMM dd, yyyy HH:mm")}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">₦{Number(order.total).toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">{order.status}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-8">No recent orders</p>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Users Tab - Comprehensive */}
        <TabsContent value="users" className="space-y-6">
          {userLoading ? (
            <>
              <div className="grid gap-4 md:grid-cols-4">
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
              </div>
              <ChartSkeleton />
            </>
          ) : (
            <>
              {/* User Summary */}
              <div className="grid gap-4 md:grid-cols-4">
                <StatCard
                  title="Total Users"
                  value={safeUserData?.summary?.totalUsers || 0}
                  icon={Users}
                  description="All registered users"
                />
                <StatCard
                  title="New Users"
                  value={safeUserData?.summary?.newUsers || 0}
                  icon={TrendingUp}
                  description="In selected period"
                />
                <StatCard
                  title="Active Users"
                  value={safeUserData?.summary?.activeUsers || 0}
                  icon={Users}
                  description="Active in last 7 days"
                />
                <StatCard
                  title="Retention Rate"
                  value={`${safeUserData?.summary?.retentionRate || 0}%`}
                  icon={TrendingUp}
                  description="Repeat customers"
                />
              </div>

              {/* User Charts */}
              <div className="grid gap-4 md:grid-cols-2">
                <LineChart
                  title="User Growth"
                  data={safeUserData?.userGrowth || []}
                  dataKeys={[{ key: 'new_users', color: '#8b5cf6', name: 'New Users' }]}
                  xAxisKey="date"
                  height={350}
                />
                <PieChart
                  title="Users by Role"
                  data={safeUserData?.usersByRole?.map((role: any) => ({
                    name: role.role,
                    value: role._count || 0,
                  })) || []}
                  dataKey="value"
                  nameKey="name"
                  height={350}
                />
              </div>

              {/* Top Active Users */}
              <Card>
                <CardHeader>
                  <CardTitle>Most Active Users</CardTitle>
                  <CardDescription>Users with most orders</CardDescription>
                </CardHeader>
                <CardContent>
                  {safeUserData?.topActiveUsers?.length > 0 ? (
                    <div className="space-y-3">
                      {safeUserData.topActiveUsers.map((user: any, index: number) => (
                        <div key={user.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-medium">{user.name || 'Unknown'}</p>
                              <p className="text-sm text-muted-foreground">
                                Joined {format(new Date(user.createdAt), "MMM dd, yyyy")}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">{user.order_count} orders</p>
                            {user.lastLoginAt && (
                              <p className="text-xs text-muted-foreground">
                                Last login: {format(new Date(user.lastLoginAt), "MMM dd")}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-8">No user data available</p>
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
