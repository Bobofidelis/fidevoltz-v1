import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const addresses = await prisma.userAddress.findMany({
      where: { userId: session.user.id },
      orderBy: { isDefault: 'desc' },
    });

    return NextResponse.json({ success: true, data: addresses });
  } catch (error: any) {
    console.error("[ADDRESS_GET]", error);
    return NextResponse.json({ success: false, error: "Failed to fetch addresses" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, address, city, state, phone, isDefault } = body;

    // Validation
    if (!name || !address || !city || !state || !phone) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    // If making default, unset other defaults
    if (isDefault) {
      await prisma.userAddress.updateMany({
        where: { userId: session.user.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    // Check if it's the first address, make it default automatically
    const count = await prisma.userAddress.count({ where: { userId: session.user.id } });
    const shouldBeDefault = isDefault || count === 0;

    const newAddress = await prisma.userAddress.create({
      data: {
        userId: session.user.id,
        name,
        address,
        city,
        state,
        phone,
        isDefault: shouldBeDefault,
      },
    });

    return NextResponse.json({ success: true, data: newAddress });
  } catch (error: any) {
    console.error("[ADDRESS_POST]", error);
    return NextResponse.json({ success: false, error: "Failed to save address" }, { status: 500 });
  }
}
