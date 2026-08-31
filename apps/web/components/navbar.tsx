"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart, Menu, Zap, User, LogOut, LayoutDashboard, Settings, Package, ShoppingBag, Bell } from "lucide-react";
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

export function Navbar() {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);
  const items = useCartStore((state) => state.items);
  const { data: session } = useSession();
  const user = session?.user;
  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);

  // Dynamic branding
  const { data: settingsData } = usePublicSettings("branding");
  const branding = settingsData?.grouped?.branding || {};
  const siteName = branding["branding.siteName"] || "FideVoltz";
  const logo = branding["branding.logo"];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          {logo ? (
            <img src={logo} alt={siteName} className="h-8 w-auto" />
          ) : (
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Zap className="h-5 w-5 text-white" />
            </div>
          )}
          <span className="text-xl font-bold text-slate-900">{siteName}</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link href="/projects" className="text-base font-medium text-slate-700 hover:text-slate-900 transition-colors">
            Tutorials
          </Link>
          <Link href="/store" className="text-base font-medium text-slate-700 hover:text-slate-900 transition-colors">
            Store
          </Link>
          <Link href="/about" className="text-base font-medium text-slate-700 hover:text-slate-900 transition-colors">
            About
          </Link>
          <Link href="/contact" className="text-base font-medium text-slate-700 hover:text-slate-900 transition-colors">
            Contact
          </Link>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <GlobalSearch />
          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative hover:bg-slate-100">
              <ShoppingCart className="h-5 w-5 text-slate-700" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Button>
          </Link>
          <Link href="/dashboard/notifications">
            <Button variant="ghost" size="icon" className="relative hover:bg-slate-100">
              <Bell className="h-5 w-5 text-slate-700" />
            </Button>
          </Link>
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage 
                      src={
                        user?.avatar 
                          ? user.avatar.startsWith('http') 
                            ? user.avatar 
                            : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${user.avatar}`
                          : `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`
                      } 
                      alt={user?.name || "User"} 
                    />
                    <AvatarFallback>{user?.name?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {/* Common links for all roles */}
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
                
                {/* Orders link for ADMIN, EDITOR, and USER */}
                {(user.role === 'ADMIN' || user.role === 'EDITOR' || user.role === 'USER') && (
                  <Link href="/dashboard/orders">
                    <DropdownMenuItem>
                      <ShoppingBag className="mr-2 h-4 w-4" />
                      <span>{user.role === 'USER' ? 'My Orders' : 'Orders'}</span>
                    </DropdownMenuItem>
                  </Link>
                )}
                
                {/* Settings and Notifications for all users */}
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
                
                {/* Admin-only links */}
                {user.role === 'ADMIN' && (
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
                <DropdownMenuItem onClick={() => {
                  signOut({ callbackUrl: '/' });
                }}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href={`/auth/login?returnUrl=${encodeURIComponent(pathname)}`} className="hidden md:block">
              <Button variant="outline" className="border-slate-300 hover:bg-slate-50">
                Sign In
              </Button>
            </Link>
          )}
          {mounted ? (
            <Sheet>
              <SheetTrigger asChild>
                <Button size="icon" variant="ghost" className="md:hidden hover:bg-slate-100">
                  <Menu className="h-5 w-5 text-slate-700" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <SheetHeader>
                  <SheetTitle className="text-left flex items-center gap-2">
                    {logo ? (
                      <img src={logo} alt={siteName} className="h-8 w-auto" />
                    ) : (
                      <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                        <Zap className="h-5 w-5 text-white" />
                      </div>
                    )}
                    {siteName}
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-6 mt-8">
                  <Link href="/projects" className="text-lg font-medium text-slate-700 hover:text-slate-900 transition-colors">
                    Tutorials
                  </Link>
                  <Link href="/store" className="text-lg font-medium text-slate-700 hover:text-slate-900 transition-colors">
                    Store
                  </Link>
                  <Link href="/about" className="text-lg font-medium text-slate-700 hover:text-slate-900 transition-colors">
                    About
                  </Link>
                  <Link href="/contact" className="text-lg font-medium text-slate-700 hover:text-slate-900 transition-colors">
                    Contact
                  </Link>
                  <hr className="border-slate-200" />
                  {!user && (
                     <Link href={`/auth/login?returnUrl=${encodeURIComponent(pathname)}`}>
                      <Button className="w-full">Sign In</Button>
                    </Link>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          ) : (
            <Button size="icon" variant="ghost" className="md:hidden hover:bg-slate-100">
              <Menu className="h-5 w-5 text-slate-700" />
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
