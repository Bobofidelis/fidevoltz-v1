"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Calendar, DollarSign, Eye, Loader2, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { formatNaira } from "@/lib/utils/currency";

const STATUS_COLORS: Record<string, string> = {
  PENDING:    "bg-yellow-100 text-yellow-800",
  PROCESSING: "bg-blue-100 text-blue-800",
  SHIPPED:    "bg-indigo-100 text-indigo-800",
  DELIVERED:  "bg-green-100 text-green-800",
  CANCELLED:  "bg-red-100 text-red-800",
  REFUNDED:   "bg-slate-100 text-slate-600",
};

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/orders")
        .then((r) => r.json())
        .then((data) => {
          setOrders(data?.data || data?.orders || data || []);
        })
        .catch(() => setError("Failed to load orders"))
        .finally(() => setLoading(false));
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [status]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="container py-16 text-center max-w-md mx-auto">
        <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-slate-300" />
        <h2 className="text-2xl font-bold mb-2">Sign in to view orders</h2>
        <p className="text-slate-500 mb-6">You need to be logged in to see your order history.</p>
        <Link href="/auth/login?callbackUrl=/orders">
          <Button size="lg">Sign In</Button>
        </Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-16 text-center">
        <p className="text-red-500">{error}</p>
        <Button className="mt-4" onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="container py-10 max-w-4xl">
      <h1 className="text-3xl font-bold mb-2">My Orders</h1>
      <p className="text-slate-500 mb-8">Track and manage all your purchases</p>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Package className="h-14 w-14 mx-auto mb-4 text-slate-300" />
            <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
            <p className="text-slate-500 mb-6">Start shopping to see your orders here</p>
            <Link href="/store">
              <Button>Browse Store</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order: any) => {
            const statusKey = (order.status || "PENDING").toUpperCase();
            const color = STATUS_COLORS[statusKey] || "bg-slate-100 text-slate-600";
            const itemCount = order.items?.length || order.itemCount || 0;
            const total = order.total || order.totalAmount || 0;
            return (
              <Card key={order.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <CardTitle className="text-base">
                        Order #{order.orderNumber || order.id?.slice(0, 8).toUpperCase()}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-4 mt-1 text-xs">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(order.createdAt || order.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                        {itemCount > 0 && (
                          <span className="flex items-center gap-1">
                            <Package className="h-3 w-3" />
                            {itemCount} {itemCount === 1 ? "item" : "items"}
                          </span>
                        )}
                      </CardDescription>
                    </div>
                    <Badge className={color}>
                      {statusKey.charAt(0) + statusKey.slice(1).toLowerCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                      <DollarSign className="h-4 w-4 text-slate-400" />
                      {formatNaira(total)}
                    </div>
                    <Link href={`/orders/${order.id}`}>
                      <Button variant="outline" size="sm" className="gap-1.5">
                        <Eye className="h-3.5 w-3.5" />
                        View Details
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
