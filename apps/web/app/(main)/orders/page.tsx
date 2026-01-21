"use client";

import { useAuthStore } from "@/store/auth-store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Calendar, DollarSign, Eye } from "lucide-react";
import Link from "next/link";
import { formatNaira } from "@/lib/utils/currency";

export default function OrdersPage() {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return (
      <div className="container py-10 text-center">
        <h2 className="text-2xl font-bold">Please log in to view your orders</h2>
      </div>
    );
  }

  // Mock orders data - in production, fetch from API
  const orders = [
    {
      id: "1",
      date: "2024-12-01",
      total: 129.99,
      status: "delivered",
      items: 3,
    },
    {
      id: "2",
      date: "2024-11-28",
      total: 89.50,
      status: "shipped",
      items: 2,
    },
    {
      id: "3",
      date: "2024-11-20",
      total: 45.00,
      status: "processing",
      items: 1,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "shipped":
        return "bg-blue-100 text-blue-800";
      case "processing":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  return (
    <div className="container py-10 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8">My Orders</h1>
      
      {orders.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <Package className="h-12 w-12 mx-auto mb-4 text-slate-400" />
            <h3 className="text-lg font-medium mb-2">No orders yet</h3>
            <p className="text-slate-600 mb-4">Start shopping to see your orders here</p>
            <Link href="/store">
              <Button>Browse Store</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Order #{order.id}</CardTitle>
                    <CardDescription className="flex items-center gap-4 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(order.date).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Package className="h-3 w-3" />
                        {order.items} {order.items === 1 ? "item" : "items"}
                      </span>
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(order.status)}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-lg font-semibold">
                    <DollarSign className="h-5 w-5" />
                    {formatNaira(order.total)}
                  </div>
                  <Link href={`/orders/${order.id}`}>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
