"use client";

import Link from "next/link";
import { Bell, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { GlobalSearch } from "@/components/global-search";
import { useEffect, useState, useCallback } from "react";
import { usePathname } from "next/navigation";

export function DashboardHeader({ onMenuClick }: { onMenuClick: () => void }) {
  const { data: session } = useSession();
  const user = session?.user;
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = useCallback(async () => {
    if (!session?.user) return;
    try {
      const res = await fetch("/api/notifications?isRead=false&limit=1");
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(data?.data?.pagination?.total || 0);
      }
    } catch {
      // silently fail
    }
  }, [session?.user]);

  // Fetch on mount and whenever user navigates (catches return from /notifications)
  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount, pathname]);

  // Also poll every 60 seconds
  useEffect(() => {
    const interval = setInterval(fetchUnreadCount, 60_000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-800 bg-slate-900 px-4 md:px-6 text-white">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden text-slate-400 hover:text-white hover:bg-slate-800"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="hidden md:block">
          <GlobalSearch
            variant="outline"
            context="dashboard"
            triggerClassName="bg-slate-800 border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700 xl:w-[300px]"
          />
        </div>

        {/* Mobile Search Button */}
        <div className="md:hidden">
          <GlobalSearch
            variant="ghost"
            context="dashboard"
            triggerClassName="text-slate-400 hover:text-white hover:bg-slate-800 border-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Link href="/dashboard/notifications">
          <Button
            variant="ghost"
            size="icon"
            className="relative text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-slate-900" />
            )}
          </Button>
        </Link>
        <div className="flex items-center gap-3 border-l border-slate-800 pl-4">
          <div className="hidden text-right md:block">
            <p className="text-sm font-medium text-white">{user?.name || "Admin User"}</p>
            <p className="text-xs text-slate-400">{user?.email || "admin@example.com"}</p>
          </div>
          <Avatar className="border-2 border-slate-700">
            <AvatarImage
              src={
                user?.avatar
                  ? user.avatar.startsWith("http")
                    ? user.avatar
                    : `${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}${user.avatar}`
                  : `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`
              }
            />
            <AvatarFallback className="bg-slate-800 text-white">{user?.name?.[0] || "A"}</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
