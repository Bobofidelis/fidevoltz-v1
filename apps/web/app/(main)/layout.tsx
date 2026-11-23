import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { prisma } from "@/lib/prisma";
import { MaintenanceGate } from "@/components/maintenance-gate";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check maintenance mode (part of the cached page; saving settings refreshes it).
  // The visitor's login is checked in the browser, so public pages stay cacheable.
  const maintenanceSetting = await prisma.siteSettings.findUnique({
    where: { key: "general.maintenanceMode" },
  });

  const isMaintenanceMode = maintenanceSetting?.value === true || maintenanceSetting?.value === "true";

  const site = (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow bg-background">{children}</main>
      <Footer />
    </div>
  );

  return isMaintenanceMode ? <MaintenanceGate>{site}</MaintenanceGate> : site;
}
