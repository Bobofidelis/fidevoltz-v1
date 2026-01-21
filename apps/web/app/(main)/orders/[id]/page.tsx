import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Package, Truck } from "lucide-react";
import { formatNaira } from "@/lib/utils/currency";

// Mock data fetcher
async function getOrder(id: string) {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return {
    id,
    status: "Processing",
    total: 125.50,
    date: "2024-01-15", // Static date to avoid hydration mismatch
    items: [
      { name: "Arduino Uno R3", quantity: 1, price: 25.00 },
      { name: "ESP32 DevKit V1", quantity: 2, price: 12.50 },
    ],
  };
}

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getOrder(id);

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <CheckCircle2 className="h-16 w-16 text-primary mx-auto" />
          <h1 className="text-3xl font-bold">Order Confirmed!</h1>
          <p className="text-muted-foreground">Thank you for your purchase. Your order ID is #{order.id}</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Order Status</CardTitle>
              <Badge variant="secondary" className="text-lg px-4 py-1">
                {order.status}
              </Badge>
            </div>
            <CardDescription>Placed on {order.date}</CardDescription>
          </CardHeader>
          <CardContent>
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
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                    <Truck className="h-4 w-4" />
                  </div>
                  <span className="text-sm text-muted-foreground">Shipped</span>
                </div>
                <div className="flex flex-col items-center gap-2 bg-background px-2 z-10">
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <span className="text-sm text-muted-foreground">Delivered</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {order.items.map((item, index) => (
              <div key={index} className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                </div>
                <p>{formatNaira(item.price * item.quantity)}</p>
              </div>
            ))}
            <div className="border-t pt-4 flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>{formatNaira(order.total)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
