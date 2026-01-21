import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { ApiResponse } from "@fidevoltz/types";

export async function GET() {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Only allow admin and editor to access dashboard stats
    if (session.user.role !== "ADMIN" && session.user.role !== "EDITOR") {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    // Get dashboard statistics
    const [totalUsers, totalProducts, totalOrders, recentOrders, lowStockProducts] = await Promise.all([
      prisma.user.count(),
      prisma.product.count(),
      prisma.order.count(),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.product.findMany({
        where: {
          stock: {
            lte: prisma.product.fields.minStock,
          },
        },
        take: 5,
        orderBy: { stock: "asc" },
      }),
    ]);

    // Calculate total revenue
    const orders = await prisma.order.findMany({
      where: {
        status: "DELIVERED",
      },
      select: {
        totalAmount: true,
      },
    });

    const totalRevenue = orders.reduce((sum, order) => {
      return sum + Number(order.totalAmount);
    }, 0);

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        totalRevenue,
        totalOrders,
        totalProducts,
        totalUsers,
        recentOrders: recentOrders as any,
        lowStockProducts: lowStockProducts as any,
      },
    });
  } catch (error: any) {
    console.error("Dashboard API error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: error.message || "Failed to load dashboard data" },
      { status: 500 }
    );
  }
}
