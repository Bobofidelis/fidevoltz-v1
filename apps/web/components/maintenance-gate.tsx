"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

// Only rendered while maintenance mode is on: admins keep using the site, everyone else is sent
// to the maintenance page. Checking here (not on the server) keeps public pages cacheable.
export function MaintenanceGate({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const isAdmin = session?.user?.role === "ADMIN";

  useEffect(() => {
    if (status !== "loading" && !isAdmin) router.replace("/maintenance");
  }, [status, isAdmin, router]);

  if (!isAdmin) return null;
  return <>{children}</>;
}
