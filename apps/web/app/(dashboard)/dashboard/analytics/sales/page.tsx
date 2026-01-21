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
import { Badge } from "@/components/ui/badge";
import { DollarSign, ShoppingCart, TrendingUp, Users, ArrowLeft, Calendar } from "lucide-react";
import { MetricCard } from "@/components/analytics/MetricCard";
import { LineChart } from "@/components/analytics/LineChart";
import { BarChart } from "@/components/analytics/BarChart";
import { PieChart } from "@/components/analytics/PieChart";
import { useSalesAnalytics } from "@/lib/hooks/use-analytics";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

export default function SalesAnalyticsPage() {
  const [period, setPeriod] = useState(30);
  const { data, isLoading } = useSalesAnalytics(period);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      COMPLETED: 'bg-green-600',
      DELIVERED: 'bg-green-600',
      PENDING: 'bg-yellow-600',
      PROCESSING: 'bg-blue-600',
      CANCELLED: 'bg-red-600',
      REFUNDED: 'bg-gray-600',
    };
    return colors[status] || 'bg-gray-600';
  };

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
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Sales Analytics
            </h1>
            <p className="text-gray-500 mt-2">
              Detailed sales performance and revenue insights
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
          title="Total Revenue"
          value={data?.summary?.totalRevenue || 0}
          format="currency"
          icon={DollarSign}
          iconColor="text-green-600"
          iconBgColor="bg-green-100"
        />
        <MetricCard
          title="Total Orders"
          value={data?.summary?.totalOrders || 0}
          icon={ShoppingCart}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-100"
        />
        <MetricCard
          title="Avg Order Value"
          value={data?.summary?.avgOrderValue || 0}
          format="currency"
          icon={TrendingUp}
          iconColor="text-purple-600"
          iconBgColor="bg-purple-100"
        />
        <MetricCard
          title="Completed Orders"
          value={data?.summary?.completedOrders || 0}
          icon={ShoppingCart}
          iconColor="text-teal-600"
          iconBgColor="bg-teal-100"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LineChart
          title="Revenue Over Time"
          data={data?.charts?.revenueByDay || []}
          dataKeys={[
            { key: 'revenue', color: '#10b981', name: 'Revenue' },
            { key: 'orders', color: '#3b82f6', name: 'Orders' },
          ]}
          xAxisKey="date"
          height={350}
        />
        <PieChart
          title="Orders by Status"
          data={data?.charts?.ordersByStatus || []}
          dataKey="count"
          nameKey="status"
          height={350}
        />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <BarChart
          title="Revenue by Category"
          data={data?.charts?.revenueByCategory || []}
          dataKeys={[
            { key: 'revenue', color: '#8b5cf6', name: 'Revenue' },
          ]}
          xAxisKey="category"
          height={350}
        />
      </div>

      {/* Top Customers */}
      <Card>
        <CardHeader>
          <CardTitle>Top Customers</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead className="text-right">Total Revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.topCustomers?.map((customer: any) => (
                <TableRow key={customer.userId}>
                  <TableCell className="font-medium">{customer.name}</TableCell>
                  <TableCell>{customer.email}</TableCell>
                  <TableCell>{customer.orders}</TableCell>
                  <TableCell className="text-right font-bold text-green-600">
                    ${customer.revenue.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.recentOrders?.map((order: any) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.orderNumber}</TableCell>
                  <TableCell>{order.customer}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{format(new Date(order.createdAt), 'MMM dd, yyyy')}</TableCell>
                  <TableCell className="text-right font-bold">
                    ${order.total.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
