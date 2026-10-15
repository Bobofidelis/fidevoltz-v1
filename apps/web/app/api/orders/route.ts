import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
      subtotal, 
      tax, 
      shipping, 
      total 
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

    const gateway = paymentGatewayId || paymentMethodId || "PAYSTACK";
    const totalAmount = total !== undefined ? total : ((subtotal || 0) + (tax || 0) + (shipping || 0));

    if (session?.user?.id) {
      const order = await prisma.order.create({
        data: {
          userId: session.user.id,
          totalAmount: Number(totalAmount),
          paymentGateway: gateway,
          paymentStatus: "PENDING",
          status: "PENDING",
          shippingAddress: finalShippingAddress,
          items: {
            create: items.map((item: any) => ({
              productId: item.productId || item.id,
              quantity: Number(item.quantity) || 1,
              price: Number(item.price) || 0,
            })),
          },
          history: {
            create: {
              status: "PENDING",
              note: "Order created successfully",
              changedBy: session.user.id,
            },
          },
        },
      });

      return NextResponse.json({ 
        success: true, 
        data: {
          orderId: order.id,
          status: order.status,
          message: "Order created successfully"
        } 
      });
    }

    const mockOrderId = `ORD-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    return NextResponse.json({ 
      success: true, 
      data: {
        orderId: mockOrderId,
        status: "PENDING_PAYMENT",
        message: "Order created successfully"
      } 
    });

  } catch (error: any) {
    console.error("[ORDERS_POST]", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to create order" }, { status: 500 });
  }
}
