import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import DashboardClientLayout from "./dashboard-client-layout";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN";

  // Check maintenance mode
  const maintenanceSetting = await prisma.siteSettings.findUnique({
    where: { key: "general.maintenanceMode" },
  });

  const isMaintenanceMode = maintenanceSetting?.value === true || maintenanceSetting?.value === "true";

  // If maintenance mode is on and user is NOT an admin, redirect to maintenance page
  // We allow Admins to access the dashboard even during maintenance
  if (isMaintenanceMode && !isAdmin) {
    redirect("/maintenance");
  }

  return <DashboardClientLayout>{children}</DashboardClientLayout>;
}
