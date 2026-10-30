import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "katex/dist/katex.min.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { TopLoader } from "@/components/ui/top-loader";
import { AnalyticsTracker } from "@/components/analytics-tracker";
import { Providers } from "@/components/providers";

// Self-hosted at build time by next/font; exposed as a CSS variable for Tailwind's font-sans
const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" });

import { prisma } from "@/lib/prisma";
import { getSiteIdentity, organizationJsonLd } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";
import { JsonLd } from "@/components/seo/json-ld";
import { hexToHsl } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const identity = await getSiteIdentity();

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      // Google shows about 60 characters, so a long tagline is left out of the title
      default: identity.tagline.length <= 45 ? `${identity.name} - ${identity.tagline}` : identity.name,
      template: `%s | ${identity.name}`,
    },
    description: identity.tagline,
    applicationName: identity.name,
    icons: { icon: identity.favicon },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
    },
    ...(identity.googleVerification ? { verification: { google: identity.googleVerification } } : {}),
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [identity, brandingRows] = await Promise.all([
    getSiteIdentity(),
    prisma.siteSettings.findMany({ where: { key: 'branding.primaryColor' } }).catch(() => []),
  ]);
  const branding: Record<string, any> = Object.fromEntries(brandingRows.map((s) => [s.key, s.value]));

  const primaryColor = branding['branding.primaryColor'] || "#3B82F6";
  const primaryHsl = hexToHsl(primaryColor);

  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <style dangerouslySetInnerHTML={{ __html: `
          :root {
            --primary: ${primaryHsl};
          }
        `}} />
      </head>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <JsonLd data={organizationJsonLd(identity)} />
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
