"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: Array<"ADMIN" | "EDITOR" | "USER">;
  redirectTo?: string;
}

export function RoleGuard({ children, allowedRoles, redirectTo = "/dashboard/overview" }: RoleGuardProps) {
  const { data: session, status } = useSession();
  const user = session?.user;
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    }

    if (status === "authenticated" && user && !allowedRoles.includes(user.role)) {
      router.push(redirectTo);
    }
  }, [user, status, allowedRoles, redirectTo, router]);

  // Show loading state while checking auth
  if (status === "loading") {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}
