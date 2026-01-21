"use client";

import { useState } from "react";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/header";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Desktop Sidebar */}
      <DashboardSidebar />

      {/* Mobile Sidebar */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="p-0 w-64 bg-slate-900 border-r-slate-800">
          <SheetTitle className="sr-only">Mobile Navigation Menu</SheetTitle>
          <DashboardSidebar className="flex h-full w-full" onNavClick={() => setIsMobileMenuOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex flex-1 flex-col">
        <DashboardHeader onMenuClick={() => setIsMobileMenuOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
