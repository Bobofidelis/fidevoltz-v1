export interface Order {
  id: string;
  userId: string;
  user?: {
    id: string;
    name: string | null;
    email: string;
    phoneNumber: string | null;
  };
  totalAmount: number;
  paymentGateway: string;
  paymentStatus: string;
  status: string;
  trackingNumber: string | null;
  shippingAddress: string | null;
  carrier: string | null;
  estimatedDelivery: Date | null;
  cancelledAt: Date | null;
  cancellationReason: string | null;
  items: OrderItem[];
  notes?: OrderNote[];
  history?: OrderHistory[];
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  product: {
    name: string;
    image: string | null;
    description?: string;
  };
  quantity: number;
  price: number;
}

export interface OrderNote {
  id: string;
  orderId: string;
  userId: string;
  user: {
    name: string | null;
    role?: string;
  };
  note: string;
  isInternal: boolean;
  createdAt: Date;
}

export interface OrderHistory {
  id: string;
  orderId: string;
  status: string;
  changedBy: string | null;
  user?: {
    name: string | null;
  };
  note: string | null;
  createdAt: Date;
}

export interface CreateOrderDto {
  items: {
    productId: string;
    quantity: number;
    price: number;
  }[];
  totalAmount: number;
  paymentGateway: string;
  shippingAddress?: string;
}

export interface UpdateOrderStatusDto {
  status: string;
  note?: string;
}

export interface UpdateShippingDto {
  trackingNumber?: string;
  shippingAddress?: string;
  carrier?: string;
  estimatedDelivery?: string;
}

export interface CancelOrderDto {
  reason: string;
  refundAmount?: number;
}

export interface AddOrderNoteDto {
  note: string;
  isInternal?: boolean;
}

export interface OrderFilters {
  status?: string;
  paymentStatus?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface OrderStats {
  totalOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  pendingPayments: number;
}
