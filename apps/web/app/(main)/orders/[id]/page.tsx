import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Package, Truck, Clock, MapPin, ArrowLeft, ExternalLink } from "lucide-react";
import { formatNaira } from "@/lib/utils/currency";
import Link from "next/link";

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

async function getOrder(id: string) {
  const session = await auth();
  if (!session?.user?.id) return null;
  
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: { include: { product: true } },
    },
  });
  
  if (!order) return null;
  
  // Only allow the order owner or admin to view
  const isAdmin = session.user.role === 'ADMIN';
  if (order.userId !== session.user.id && !isAdmin) return null;
  
  return order;
}

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getOrder(id);

  if (!order) {
    notFound();
  }

  const orderDate = new Date(order.createdAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const isShipped = ["SHIPPED", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED", "COMPLETED"].includes(order.status);
  const isDelivered = ["DELIVERED", "COMPLETED"].includes(order.status);
  const isCancelled = ["CANCELLED", "REFUNDED"].includes(order.status);
  const statusColor = STATUS_COLORS[order.status] || "bg-slate-100 text-slate-700";

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <Link href="/orders">
            <Button variant="ghost" size="sm" className="gap-2 text-slate-600">
              <ArrowLeft className="h-4 w-4" />
              Back to My Orders
            </Button>
          </Link>
          <Link href={`/track-order?id=${order.id}`}>
            <Button variant="outline" size="sm" className="gap-2">
              <Truck className="h-4 w-4" />
              Track Order
            </Button>
          </Link>
        </div>

        <div className="text-center space-y-2">
          <CheckCircle2 className="h-16 w-16 text-primary mx-auto" />
          <h1 className="text-3xl font-bold">Order Details</h1>
          <p className="text-muted-foreground">Order ID: #{order.id}</p>
        </div>

        {/* Status Card */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Order Status</CardTitle>
              <Badge className={`text-sm px-3 py-1 font-medium ${statusColor}`}>
                {order.status}
              </Badge>
            </div>
            <CardDescription>Placed on {orderDate}</CardDescription>
          </CardHeader>
          <CardContent>
            {isCancelled ? (
              <div className="p-4 bg-red-50 text-red-800 rounded-lg text-sm">
                This order has been {order.status.toLowerCase()}.
                {order.cancellationReason && <p className="mt-1 font-medium">Reason: {order.cancellationReason}</p>}
              </div>
            ) : (
              <div className="relative py-8">
                <div className="absolute top-1/2 left-0 w-full h-1 bg-muted -translate-y-1/2" />
                <div className="relative flex justify-between">
                  <div className="flex flex-col items-center gap-2 bg-background px-2 z-10">
                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                      <Package className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium">Placed</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 bg-background px-2 z-10">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${isShipped ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                      <Truck className="h-4 w-4" />
                    </div>
                    <span className={`text-sm ${isShipped ? "font-medium" : "text-muted-foreground"}`}>Shipped</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 bg-background px-2 z-10">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${isDelivered ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <span className={`text-sm ${isDelivered ? "font-medium" : "text-muted-foreground"}`}>Delivered</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Shipping Information */}
        {order.shippingAddress && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-600" />
                Delivery Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-slate-700 whitespace-pre-line">{order.shippingAddress}</p>
              {order.carrier && (
                <div className="pt-2 text-xs text-slate-500 border-t flex flex-wrap gap-4">
                  <span><strong>Carrier:</strong> {order.carrier}</span>
                  {order.trackingNumber && <span><strong>Tracking #:</strong> {order.trackingNumber}</span>}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Items Card */}
        <Card>
          <CardHeader>
            <CardTitle>Items ({order.items.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {order.items.map((item) => {
              const productName = item.product?.name || "Product";
              const itemPrice = Number(item.price);
              const itemTotal = itemPrice * item.quantity;
              return (
                <div key={item.id} className="flex justify-between items-center py-2 border-b last:border-b-0">
                  <div className="flex items-center gap-3">
                    {item.product?.image && (
                      <img
                        src={item.product.image}
                        alt={productName}
                        className="w-12 h-12 object-cover rounded-md border border-slate-200"
                      />
                    )}
                    <div>
                      <p className="font-medium text-slate-900">{productName}</p>
                      <p className="text-sm text-muted-foreground">Qty: {item.quantity} × {formatNaira(itemPrice)}</p>
                    </div>
                  </div>
                  <p className="font-semibold text-slate-900">{formatNaira(itemTotal)}</p>
                </div>
              );
            })}
            <div className="border-t pt-4 flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>{formatNaira(Number(order.totalAmount))}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
