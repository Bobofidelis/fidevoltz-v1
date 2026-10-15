import { cache } from "react";
import type { Metadata } from "next";
// import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { TopLoader } from "@/components/ui/top-loader";
import { AnalyticsTracker } from "@/components/analytics-tracker";
import { Providers } from "@/components/providers";

// const inter = Inter({ subsets: ["latin"] });

import { prisma } from "@/lib/prisma";
import { hexToHsl } from "@/lib/utils";

const getBrandingSettings = cache(async () => {
  try {
    const settings = await prisma.siteSettings.findMany({ where: { category: 'branding' } });
    return settings.reduce((acc: any, s) => ({ ...acc, [s.key]: s.value }), {});
  } catch {
    return {};
  }
});

export async function generateMetadata(): Promise<Metadata> {
  const branding = await getBrandingSettings();
  
  const siteName = branding['branding.siteName'] || "FideVoltz";
  const tagline = branding['branding.tagline'] || "Electronics Tutorials & Store";
  const favicon = branding['branding.favicon'] || "/favicon.ico";
  
  return {
    metadataBase: new URL('https://fidevoltz.vercel.app'),
    title: {
      default: `${siteName} - ${tagline}`,
      template: `%s | ${siteName}`,
    },
    description: tagline,
    icons: {
      icon: favicon,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const branding = await getBrandingSettings();

  const primaryColor = branding['branding.primaryColor'] || "#3B82F6";
  const primaryHsl = hexToHsl(primaryColor);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <style dangerouslySetInnerHTML={{ __html: `
          :root {
            --primary: ${primaryHsl};
          }
        `}} />
      </head>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <TopLoader />
        <Providers>
          <AnalyticsTracker />
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster richColors position="top-right" />
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
