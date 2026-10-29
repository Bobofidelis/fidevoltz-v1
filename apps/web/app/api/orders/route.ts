import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TAX_RATE, FREE_SHIPPING_THRESHOLD, SHIPPING_COST } from "@/store/cart-store";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const isAdmin = session.user.role === 'ADMIN';
    const orders = await prisma.order.findMany({
      where: isAdmin ? {} : { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        items: { include: { product: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    });
    return NextResponse.json({ success: true, data: orders });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    const body = await request.json();
    const { 
      items, 
      shippingAddress, 
      shippingAddressId,
      paymentMethodId, 
      paymentGatewayId,
    } = body;

    if (!items || !items.length) {
      return NextResponse.json({ success: false, error: "Cart is empty" }, { status: 400 });
    }

    let finalShippingAddress = shippingAddress;
    const addressId = shippingAddressId || body.shippingAddressId;
    if (!finalShippingAddress && addressId) {
      const dbAddress = await prisma.userAddress.findUnique({
        where: { id: addressId },
      });
      if (dbAddress) {
        finalShippingAddress = `${dbAddress.name}, ${dbAddress.address}, ${dbAddress.city}, ${dbAddress.state}, ${dbAddress.phone}`;
      } else {
        finalShippingAddress = `Address ID: ${addressId}`;
      }
    }

    if (!finalShippingAddress) {
      return NextResponse.json({ success: false, error: "Shipping address is required" }, { status: 400 });
    }

    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Please sign in to place an order" }, { status: 401 });
    }

    const gateway = paymentGatewayId || paymentMethodId || "PAYSTACK";

    // Price everything from the database — never trust prices/totals sent by the browser
    const requested = new Map<string, number>();
    for (const item of items) {
      const productId = item.productId || item.id;
      const quantity = Math.max(1, Math.floor(Number(item.quantity) || 1));
      if (productId) requested.set(productId, (requested.get(productId) || 0) + quantity);
    }

    const products = await prisma.product.findMany({
      where: { id: { in: [...requested.keys()] } },
      select: { id: true, name: true, price: true, stock: true, status: true },
    });

    for (const [productId, quantity] of requested) {
      const product = products.find((p) => p.id === productId);
      if (!product || (product.status !== "ACTIVE" && product.status !== "OUT_OF_STOCK")) {
        return NextResponse.json({ success: false, error: "One or more items in your cart are no longer available" }, { status: 400 });
      }
      if (product.stock < quantity) {
        return NextResponse.json(
          { success: false, error: `Only ${product.stock} of "${product.name}" left in stock` },
          { status: 400 }
        );
      }
    }

    const lineItems = products.map((p) => ({ productId: p.id, quantity: requested.get(p.id)!, price: Number(p.price) }));
    const subtotalAmount = lineItems.reduce((acc, li) => acc + li.price * li.quantity, 0);
    const taxAmount = subtotalAmount * TAX_RATE;
    const shippingAmount = subtotalAmount >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
    const totalAmount = subtotalAmount + taxAmount + shippingAmount;

    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        totalAmount,
        paymentGateway: gateway,
        paymentStatus: "PENDING",
        status: "PENDING",
        shippingAddress: finalShippingAddress,
        items: { create: lineItems },
        history: {
          create: {
            status: "PENDING",
            note: "Order created successfully",
            changedBy: session.user.id,
          },
        },
      },
    });

    // Let admins know a new order came in (failure here must not fail the order)
    try {
      const admins = await prisma.user.findMany({ where: { role: "ADMIN" }, select: { id: true } });
      if (admins.length > 0) {
        await prisma.notification.createMany({
          data: admins.map((a) => ({
            type: "ORDER" as const,
            title: "New order received",
            message: `${session.user.name || session.user.email} placed an order of ${lineItems.length} item(s) totalling ₦${totalAmount.toLocaleString("en-NG")}`,
            userId: a.id,
            actionUrl: `/dashboard/orders/${order.id}`,
            actionLabel: "View order",
            priority: "high",
          })),
        });
      }
    } catch (notifyError) {
      console.error("[ORDERS_POST] notify admins failed", notifyError);
    }

    return NextResponse.json({
      success: true,
      data: {
        orderId: order.id,
        status: order.status,
        totalAmount,
        message: "Order created successfully"
      }
    });

  } catch (error: any) {
    console.error("[ORDERS_POST]", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to create order" }, { status: 500 });
  }
}
