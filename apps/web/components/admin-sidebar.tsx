"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Package, ShoppingCart, FileText, Settings, Users } from "lucide-react";

const routes = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/admin/dashboard",
  },
  {
    label: "Products",
    icon: Package,
    href: "/admin/products",
  },
  {
    label: "Orders",
    icon: ShoppingCart,
    href: "/admin/orders",
  },
  {
    label: "Projects",
    icon: FileText,
    href: "/admin/projects",
  },
  {
    label: "Users",
    icon: Users,
    href: "/admin/users",
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/admin/settings",
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-secondary/30">
      <div className="px-3 py-2">
        <h2 className="mb-2 px-4 text-lg font-semibold">Admin Panel</h2>
        <div className="space-y-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:bg-primary/10 rounded-lg transition",
                pathname === route.href ? "bg-primary/10 text-primary" : "text-muted-foreground"
              )}
            >
              <div className="flex items-center flex-1">
                <route.icon className={cn("h-5 w-5 mr-3", pathname === route.href && "text-primary")} />
                {route.label}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
