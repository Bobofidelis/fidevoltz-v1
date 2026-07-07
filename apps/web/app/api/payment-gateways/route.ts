import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Public endpoint to get active payment gateways for checkout
export async function GET() {
  try {
    const gateways = await prisma.paymentGateway.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        type: true,
        description: true,
        isTestMode: true,
        // DONT send secretKey or webhookKey
        publicKey: true, 
      },
    });

    return NextResponse.json({ success: true, data: gateways });
  } catch (error: any) {
    console.error("[PAYMENT_GATEWAYS_GET]", error);
    return NextResponse.json({ success: false, error: "Failed to fetch payment methods" }, { status: 500 });
  }
}
