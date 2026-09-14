"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShoppingCart, Menu, Zap, User, LogOut,
  LayoutDashboard, Settings, Package, ShoppingBag, Bell
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart-store";
import { useSession, signOut } from "next-auth/react";
import { usePublicSettings } from "@/lib/hooks/use-public-settings";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { GlobalSearch } from "@/components/global-search";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/projects", label: "Tutorials" },
  { href: "/store", label: "Store" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const items = useCartStore((state) => state.items);
  const { data: session } = useSession();
  const user = session?.user;
  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const { data: settingsData } = usePublicSettings("branding");
  const branding = settingsData?.grouped?.branding || {};
  const siteName = branding["branding.siteName"] || "FideVoltz";
  const logo = branding["branding.logo"];

  return (
    <nav
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-200",
        scrolled
          ? "bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm"
          : "bg-white/80 backdrop-blur-md border-b border-slate-100"
      )}
    >
      {/* Gradient accent line */}
      <div className="h-[2px] w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

      <div className="container flex h-15 items-center justify-between px-4 md:px-6 py-2.5">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          {logo ? (
            <img src={logo} alt={siteName} className="h-8 w-auto" />
          ) : (
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <Zap className="h-4 w-4 text-white" />
            </div>
          )}
          <span className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            {siteName}
          </span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ href, label }) => {
            const isActive = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "relative px-4 py-2 rounded-lg text-sm font-medium transition-all",
                  isActive
                    ? "text-blue-600 bg-blue-50"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                )}
              >
                {label}
                {isActive && (
                  <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Right side icons */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Search */}
          <GlobalSearch />

          {/* Divider */}
          <div className="hidden md:block h-6 w-px bg-slate-200" />

          {/* Cart */}
          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative h-10 w-10 hover:bg-slate-100 rounded-xl">
              <ShoppingCart className="h-5 w-5 text-slate-600" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-5 w-5 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </Button>
          </Link>

          {/* Notifications */}
          <Link href="/dashboard/notifications">
            <Button variant="ghost" size="icon" className="relative h-10 w-10 hover:bg-slate-100 rounded-xl">
              <Bell className="h-5 w-5 text-slate-600" />
            </Button>
          </Link>

          {/* Divider */}
          <div className="hidden md:block h-6 w-px bg-slate-200" />

          {/* User menu */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0 ml-1">
                  <Avatar className="h-8 w-8 ring-2 ring-slate-200 hover:ring-blue-400 transition-all">
                    <AvatarImage
                      src={
                        user?.avatar
                          ? user.avatar.startsWith("http")
                            ? user.avatar
                            : `${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}${user.avatar}`
                          : `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`
                      }
                      alt={user?.name || "User"}
                    />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold text-sm">
                      {user?.name?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-semibold leading-none">{user?.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link href="/dashboard/overview">
                  <DropdownMenuItem>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </DropdownMenuItem>
                </Link>
                <Link href="/dashboard/profile">
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                </Link>
                {(user.role === "ADMIN" || user.role === "EDITOR" || user.role === "USER") && (
                  <Link href="/dashboard/orders">
                    <DropdownMenuItem>
                      <ShoppingBag className="mr-2 h-4 w-4" />
                      <span>{user.role === "USER" ? "My Orders" : "Orders"}</span>
                    </DropdownMenuItem>
                  </Link>
                )}
                <Link href="/dashboard/settings">
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                </Link>
                <Link href="/dashboard/notifications">
                  <DropdownMenuItem>
                    <Bell className="mr-2 h-4 w-4" />
                    <span>Notifications</span>
                  </DropdownMenuItem>
                </Link>
                {user.role === "ADMIN" && (
                  <>
                    <DropdownMenuSeparator />
                    <Link href="/dashboard/products">
                      <DropdownMenuItem>
                        <Package className="mr-2 h-4 w-4" />
                        <span>Products</span>
                      </DropdownMenuItem>
                    </Link>
                    <Link href="/dashboard/users">
                      <DropdownMenuItem>
                        <User className="mr-2 h-4 w-4" />
                        <span>Users</span>
                      </DropdownMenuItem>
                    </Link>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href={`/auth/login?returnUrl=${encodeURIComponent(pathname)}`} className="hidden md:block ml-1">
              <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-sm">
                Sign In
              </Button>
            </Link>
          )}

          {/* Mobile menu */}
          {mounted ? (
            <Sheet>
              <SheetTrigger asChild>
                <Button size="icon" variant="ghost" className="md:hidden h-9 w-9 hover:bg-slate-100 rounded-lg">
                  <Menu className="h-5 w-5 text-slate-600" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72">
                <SheetHeader>
                  <SheetTitle className="text-left flex items-center gap-2.5">
                    {logo ? (
                      <img src={logo} alt={siteName} className="h-8 w-auto" />
                    ) : (
                      <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                        <Zap className="h-4 w-4 text-white" />
                      </div>
                    )}
                    <span className="font-bold text-slate-900">{siteName}</span>
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-1 mt-8">
                  {NAV_LINKS.map(({ href, label }) => {
                    const isActive = pathname === href || pathname.startsWith(href + "/");
                    return (
                      <Link
                        key={href}
                        href={href}
                        className={cn(
                          "flex items-center px-3 py-2.5 rounded-lg text-base font-medium transition-colors",
                          isActive
                            ? "text-blue-600 bg-blue-50"
                            : "text-slate-700 hover:text-slate-900 hover:bg-slate-50"
                        )}
                      >
                        {label}
                      </Link>
                    );
                  })}
                  <hr className="border-slate-200 my-3" />
                  {!user && (
                    <Link href={`/auth/login?returnUrl=${encodeURIComponent(pathname)}`}>
                      <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600">Sign In</Button>
                    </Link>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          ) : (
            <Button size="icon" variant="ghost" className="md:hidden h-9 w-9">
              <Menu className="h-5 w-5 text-slate-600" />
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
