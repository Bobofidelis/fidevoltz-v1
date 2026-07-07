"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  FileText,
  MessageSquare,
  BarChart3,
  Settings,
  LogOut,
  Zap,
  Box,
  Plus,
  Bell,
  Headphones,
  Globe,
  Image,
  User,
  Mail,
  CreditCard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth-store";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { usePublicSettings } from "@/lib/hooks/use-public-settings";

const sidebarItems = [
// ... (rest of sidebarItems unchanged)
  // Common items for all roles
  { icon: LayoutDashboard, label: "Overview", href: "/dashboard/overview", roles: ["ADMIN", "EDITOR", "USER"] },
  { icon: User, label: "Profile", href: "/dashboard/profile", roles: ["ADMIN", "EDITOR", "USER"] },
  { icon: ShoppingCart, label: "Orders", href: "/dashboard/orders", roles: ["ADMIN", "EDITOR", "USER"] },
  { icon: Bell, label: "Notifications", href: "/dashboard/notifications", roles: ["ADMIN", "EDITOR", "USER"] },
  { icon: Mail, label: "Messages", href: "/dashboard/messages", roles: ["ADMIN", "EDITOR", "USER"] },
  { icon: MessageSquare, label: "My Reviews", href: "/dashboard/my-reviews", roles: ["USER"] },
  { icon: Headphones, label: "My Tickets", href: "/dashboard/my-tickets", roles: ["USER"] },
  
  // Admin & Editor - Management
  { icon: Package, label: "Products", href: "/dashboard/products", roles: ["ADMIN", "EDITOR"] },
  { icon: Plus, label: "Add Product", href: "/dashboard/products/add", roles: ["ADMIN", "EDITOR"] },
  { icon: Box, label: "Inventory", href: "/dashboard/inventory", roles: ["ADMIN", "EDITOR"] },
  { icon: Users, label: "Users", href: "/dashboard/users", roles: ["ADMIN"] },
  
  // Admin & Editor - Content
  { icon: FileText, label: "Pages", href: "/dashboard/pages", roles: ["ADMIN", "EDITOR"] },
  { icon: FileText, label: "Projects", href: "/dashboard/projects", roles: ["ADMIN", "EDITOR"] },
  { icon: Plus, label: "Add Project", href: "/dashboard/projects/add", roles: ["ADMIN", "EDITOR"] },
  { icon: MessageSquare, label: "Reviews", href: "/dashboard/reviews", roles: ["ADMIN", "EDITOR"] },
  
  // Admin only - Advanced
  { icon: Image, label: "Media", href: "/dashboard/media", roles: ["ADMIN", "EDITOR"] },
  { icon: Headphones, label: "Support", href: "/dashboard/support", roles: ["ADMIN", "EDITOR"] },
  { icon: MessageSquare, label: "Comments", href: "/dashboard/comments", roles: ["ADMIN", "EDITOR"] },
  { icon: Mail, label: "Contact Submissions", href: "/dashboard/contact-submissions", roles: ["ADMIN"] },
  { icon: Globe, label: "SEO & Ads", href: "/dashboard/seo", roles: ["ADMIN"] },
  { icon: BarChart3, label: "Analytics", href: "/dashboard/analytics", roles: ["ADMIN"] },
  { icon: CreditCard, label: "Payment Methods", href: "/dashboard/payments", roles: ["ADMIN"] },
  
  // Settings at the bottom for all roles
  { icon: Settings, label: "Settings", href: "/dashboard/settings", roles: ["ADMIN", "EDITOR", "USER"] },
];

interface DashboardSidebarProps {
  className?: string;
  onNavClick?: () => void;
}

export function DashboardSidebar({ className, onNavClick }: DashboardSidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user;
  const router = useRouter();

  const handleLogout = () => {
    signOut({ callbackUrl: "/" });
  };

  // Dynamic branding
  const { data: settingsData } = usePublicSettings("branding");
  const branding = settingsData?.grouped?.branding || {};
  const siteName = branding["branding.siteName"] || "FideVoltz";
  const logo = branding["branding.logo"];

  // Filter sidebar items based on user role
  const visibleItems = sidebarItems.filter(item => 
    user && item.roles.includes(user.role)
  );

  return (
    <aside className={cn("hidden w-64 flex-col border-r bg-slate-900 text-white md:flex", className)}>
      <div className="flex h-16 items-center px-6 border-b border-slate-800">
        <Link href="/" className="flex items-center gap-2" onClick={onNavClick}>
          {logo ? (
            <img src={logo} alt={siteName} className="h-8 w-auto rounded" />
          ) : (
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Zap className="h-5 w-5 text-white" />
            </div>
          )}
          <span className="text-xl font-bold">{siteName}</span>
        </Link>
      </div>
      
      <div className="flex-1 overflow-y-auto py-6 px-4">
        <nav className="space-y-1">
          {visibleItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavClick}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-white"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-800">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-slate-400 hover:bg-slate-800 hover:text-white"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
          Sign Out
        </Button>
      </div>
    </aside>
  );
}
