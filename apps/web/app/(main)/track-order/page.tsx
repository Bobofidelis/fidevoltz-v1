"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Search, Package, Truck, CheckCircle, Clock } from "lucide-react";

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState("");
  const [trackingResult, setTrackingResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setTrackingResult({
        id: orderId,
        status: "Shipped",
        date: "2023-11-28",
        steps: [
          { status: "Order Placed", date: "Nov 28, 10:30 AM", completed: true },
          { status: "Processing", date: "Nov 28, 2:00 PM", completed: true },
          { status: "Shipped", date: "Nov 29, 9:00 AM", completed: true },
          { status: "Delivered", date: "Estimated Nov 30", completed: false },
        ]
      });
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="container max-w-3xl py-16 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Track Your Order</h1>
        <p className="text-lg text-muted-foreground">
          Enter your order ID to see the current status of your shipment.
        </p>
      </div>

      <Card className="mb-12">
        <CardContent className="pt-6">
          <form onSubmit={handleTrack} className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input 
                placeholder="Order ID (e.g. ORD-7829)" 
                className="pl-10 h-12 text-lg"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                required
              />
            </div>
            <Button type="submit" size="lg" className="h-12 px-8" disabled={loading}>
              {loading ? "Tracking..." : "Track"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {trackingResult && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Order {trackingResult.id}</CardTitle>
                  <CardDescription>Placed on {trackingResult.date}</CardDescription>
                </div>
                <div className="px-4 py-1.5 bg-blue-100 text-blue-800 rounded-full font-medium text-sm">
                  {trackingResult.status}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                {trackingResult.steps.map((step: any, index: number) => (
                  <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border border-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 ${step.completed ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                      {step.completed ? <CheckCircle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded border border-slate-200 shadow-sm bg-white">
                      <div className="flex items-center justify-between space-x-2 mb-1">
                        <div className="font-bold text-slate-900">{step.status}</div>
                        <time className="font-caveat font-medium text-indigo-500">{step.date}</time>
                      </div>
                      <div className="text-slate-500 text-sm">
                        {step.completed ? "Completed successfully" : "Pending..."}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
