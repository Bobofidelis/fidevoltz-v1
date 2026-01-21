"use client";

import { use } from 'react';
import { useSession } from 'next-auth/react';
import { useOrder } from '@/lib/hooks/use-orders';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OrderStatusBadge } from '@/components/orders/order-status-badge';
import { OrderTimeline } from '@/components/orders/order-timeline';
import { OrderMessaging } from '@/components/orders/order-messaging';
import { OrderStatusUpdater } from '@/components/orders/order-status-updater';
import { formatCurrency, formatOrderNumber } from '@/lib/utils/order-helpers';
import { Loader2, Package, MapPin, CreditCard, Truck } from 'lucide-react';
import { format } from 'date-fns';
import Image from 'next/image';

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: session } = useSession();
  const { data: order, isLoading } = useOrder(id);

  const isAdmin = session?.user?.role === 'ADMIN';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Order not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{formatOrderNumber(order.id)}</h1>
          <p className="text-muted-foreground">
            Placed on {format(new Date(order.createdAt), 'MMMM d, yyyy')}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          {order.trackingNumber && <TabsTrigger value="tracking">Tracking</TabsTrigger>}
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Order Items */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Order Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items.map((item: any) => (
                    <div key={item.id} className="flex gap-4 pb-4 border-b last:border-0">
                      {item.product.image && (
                        <div className="relative h-20 w-20 rounded-lg overflow-hidden bg-slate-100">
                          <Image
                            src={item.product.image}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-medium">{item.product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Quantity: {item.quantity}
                        </p>
                      </div>
                      <p className="font-medium">{formatCurrency(item.price)}</p>
                    </div>
                  ))}
                  <div className="pt-4 space-y-2">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>{formatCurrency(order.totalAmount)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Details */}
            <div className="space-y-6">
              {/* Customer Info (Admin only) */}
              {isAdmin && order.user && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Customer
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Name</p>
                      <p className="font-medium">{order.user.name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{order.user.email}</p>
                    </div>
                    {order.user.phoneNumber && (
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p className="font-medium">{order.user.phoneNumber}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Shipping Address */}
              {order.shippingAddress && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Shipping Address
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-line">{order.shippingAddress}</p>
                  </CardContent>
                </Card>
              )}

              {/* Payment Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Gateway</p>
                    <p className="font-medium capitalize">{order.paymentGateway}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className="font-medium capitalize">{order.paymentStatus}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Admin Actions */}
              {isAdmin && <OrderStatusUpdater orderId={order.id} currentStatus={order.status} />}
            </div>
          </div>
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline">
          <OrderTimeline history={order.history || []} />
        </TabsContent>

        {/* Messages Tab */}
        <TabsContent value="messages">
          <OrderMessaging orderId={order.id} />
        </TabsContent>

        {/* Tracking Tab */}
        {order.trackingNumber && (
          <TabsContent value="tracking">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Tracking Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Tracking Number</p>
                  <p className="font-medium text-lg">{order.trackingNumber}</p>
                </div>
                {order.carrier && (
                  <div>
                    <p className="text-sm text-muted-foreground">Carrier</p>
                    <p className="font-medium">{order.carrier}</p>
                  </div>
                )}
                {order.estimatedDelivery && (
                  <div>
                    <p className="text-sm text-muted-foreground">Estimated Delivery</p>
                    <p className="font-medium">
                      {format(new Date(order.estimatedDelivery), 'MMMM d, yyyy')}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
