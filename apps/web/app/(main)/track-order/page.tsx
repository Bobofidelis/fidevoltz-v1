"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Package, Truck, CheckCircle2, Clock, AlertCircle, Loader2, ArrowRight } from "lucide-react";
import { formatNaira } from "@/lib/utils/currency";
import Link from "next/link";

interface TrackingStep {
  status: string;
  description: string;
  date?: string;
  completed: boolean;
  current: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  PROCESSING: "bg-blue-100 text-blue-800",
  SHIPPED: "bg-indigo-100 text-indigo-800",
  IN_TRANSIT: "bg-indigo-100 text-indigo-800",
  OUT_FOR_DELIVERY: "bg-purple-100 text-purple-800",
  DELIVERED: "bg-green-100 text-green-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
  REFUNDED: "bg-slate-100 text-slate-600",
};

function generateTrackingSteps(order: any): TrackingStep[] {
  const status = (order.status || "PENDING").toUpperCase();
  const history = order.history || [];

  const formatDate = (dateStr?: string | Date) => {
    if (!dateStr) return undefined;
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getHistoryDate = (stepStatus: string) => {
    const entry = history.find((h: any) => h.status === stepStatus);
    return entry ? formatDate(entry.createdAt) : undefined;
  };

  if (status === "CANCELLED" || status === "REFUNDED") {
    return [
      {
        status: "Order Placed",
        description: "We received your order request.",
        date: formatDate(order.createdAt),
        completed: true,
        current: false,
      },
      {
        status: status === "REFUNDED" ? "Order Refunded" : "Order Cancelled",
        description: order.cancellationReason || `Your order was ${status.toLowerCase()}.`,
        date: formatDate(order.cancelledAt || order.updatedAt),
        completed: true,
        current: true,
      },
    ];
  }

  const standardStages = [
    { key: "PENDING", label: "Order Placed", desc: "Order confirmed and awaiting fulfillment." },
    { key: "PROCESSING", label: "Processing", desc: "Your items are being prepared and packed." },
    { key: "SHIPPED", label: "Shipped", desc: order.carrier ? `Dispatched with ${order.carrier}.` : "Package has left the facility." },
    { key: "OUT_FOR_DELIVERY", label: "Out for Delivery", desc: "Courier is on the way to your address." },
    { key: "DELIVERED", label: "Delivered", desc: "Package delivered to recipient." },
  ];

  const statusProgress: Record<string, number> = {
    PENDING: 0,
    PROCESSING: 1,
    SHIPPED: 2,
    IN_TRANSIT: 2,
    OUT_FOR_DELIVERY: 3,
    DELIVERED: 4,
    COMPLETED: 4,
  };

  const currentLevel = statusProgress[status] ?? 0;

  return standardStages.map((stage, idx) => {
    const completed = idx <= currentLevel;
    const current = idx === currentLevel;
    let stepDate: string | undefined = undefined;

    if (stage.key === "PENDING") {
      stepDate = formatDate(order.createdAt);
    } else {
      stepDate = getHistoryDate(stage.key);
      if (!stepDate && completed) {
        stepDate = formatDate(order.updatedAt);
      }
    }

    return {
      status: stage.label,
      description: stage.desc,
      date: stepDate,
      completed,
      current,
    };
  });
}

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState("");
  const [trackingResult, setTrackingResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const executeTrack = async (targetId: string) => {
    const cleanId = targetId.trim();
    if (!cleanId) return;
    setLoading(true);
    setError("");
    setTrackingResult(null);

    try {
      const res = await fetch(`/api/orders/${cleanId}`);
      if (res.status === 404) {
        setError("Order not found. Please verify the order ID and try again.");
        return;
      }
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData?.error || "Failed to fetch order");
      }
      const data = await res.json();
      const order = data?.data || data;

      if (!order || !order.id) {
        setError("Order not found. Please verify the order ID and try again.");
        return;
      }

      const steps = generateTrackingSteps(order);
      setTrackingResult({
        ...order,
        steps,
        formattedDate: new Date(order.createdAt).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
      });
    } catch (err: any) {
      setError(err?.message || "Unable to fetch tracking information. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const queryId = params.get("id");
      if (queryId) {
        setOrderId(queryId);
        executeTrack(queryId);
      }
    }
  }, []);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    executeTrack(orderId);
  };

  return (
    <div className="container max-w-3xl py-16 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Track Your Order</h1>
        <p className="text-lg text-muted-foreground">
          Enter your order ID to see real-time updates and delivery progress.
        </p>
      </div>

      <Card className="mb-12 shadow-sm border-slate-200">
        <CardContent className="pt-6">
          <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
              <Input 
                placeholder="Enter Order ID (e.g. 9b1deb4d-... or ORD-XXXX)" 
                className="pl-10 h-12 text-base"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                required
              />
            </div>
            <Button type="submit" size="lg" className="h-12 px-8" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Tracking...
                </>
              ) : (
                "Track"
              )}
            </Button>
          </form>
          {error && (
            <div className="mt-4 flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-100 rounded-lg px-4 py-3">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {trackingResult && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="border-b border-slate-100 pb-5">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <CardTitle className="text-xl">
                    Order #{trackingResult.id.slice(0, 8).toUpperCase()}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Placed on {trackingResult.formattedDate}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={`text-sm px-3 py-1 font-medium ${STATUS_COLORS[trackingResult.status] || "bg-slate-100 text-slate-700"}`}>
                    {trackingResult.status}
                  </Badge>
                  <Link href={`/orders/${trackingResult.id}`}>
                    <Button variant="outline" size="sm" className="gap-1.5">
                      View Details
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>

              {(trackingResult.carrier || trackingResult.trackingNumber || trackingResult.estimatedDelivery) && (
                <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-slate-600">
                  {trackingResult.carrier && (
                    <div>
                      <span className="text-xs text-slate-400 block font-medium">Carrier</span>
                      <span className="font-semibold text-slate-900">{trackingResult.carrier}</span>
                    </div>
                  )}
                  {trackingResult.trackingNumber && (
                    <div>
                      <span className="text-xs text-slate-400 block font-medium">Tracking Number</span>
                      <span className="font-mono font-semibold text-slate-900">{trackingResult.trackingNumber}</span>
                    </div>
                  )}
                  {trackingResult.estimatedDelivery && (
                    <div>
                      <span className="text-xs text-slate-400 block font-medium">Estimated Delivery</span>
                      <span className="font-semibold text-slate-900">
                        {new Date(trackingResult.estimatedDelivery).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </CardHeader>

            <CardContent className="pt-8">
              <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-blue-500 before:via-slate-200 before:to-transparent">
                {trackingResult.steps.map((step: TrackingStep, index: number) => (
                  <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-full border-2 border-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 transition-colors ${
                        step.completed
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {step.completed ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <Clock className="w-5 h-5" />
                      )}
                    </div>
                    <div
                      className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-lg border shadow-sm transition-all ${
                        step.current
                          ? "border-blue-300 bg-blue-50/50"
                          : "border-slate-200 bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between space-x-2 mb-1">
                        <div className={`font-semibold text-sm ${step.completed ? "text-slate-900" : "text-slate-500"}`}>
                          {step.status}
                        </div>
                        {step.date && (
                          <time className="text-xs text-slate-500 font-medium">{step.date}</time>
                        )}
                      </div>
                      <div className="text-slate-600 text-xs">
                        {step.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Items in order */}
              {trackingResult.items && trackingResult.items.length > 0 && (
                <div className="mt-10 pt-6 border-t border-slate-200">
                  <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <Package className="h-4 w-4 text-blue-600" />
                    Items in this Order ({trackingResult.items.length})
                  </h3>
                  <div className="space-y-3">
                    {trackingResult.items.map((item: any) => (
                      <div key={item.id} className="flex justify-between items-center text-sm py-1.5 border-b border-slate-100 last:border-b-0">
                        <span className="text-slate-800">
                          {item.product?.name || "Product"} <span className="text-slate-400">× {item.quantity}</span>
                        </span>
                        <span className="font-medium text-slate-900">
                          {formatNaira(Number(item.price) * item.quantity)}
                        </span>
                      </div>
                    ))}
                    {trackingResult.totalAmount && (
                      <div className="flex justify-between items-center pt-2 font-bold text-sm text-slate-900">
                        <span>Total</span>
                        <span>{formatNaira(Number(trackingResult.totalAmount))}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
