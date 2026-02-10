import type { Metadata } from "next";
// import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/components/providers";

// const inter = Inter({ subsets: ["latin"] });

import { prisma } from "@/lib/prisma";
import { hexToHsl } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const settings = await prisma.siteSettings.findMany({
      where: { category: 'branding' },
    });
    
    const branding = settings.reduce((acc: any, s) => {
      acc[s.key] = s.value;
      return acc;
    }, {});
    
    const siteName = branding['branding.siteName'] || "FideVoltz";
    const tagline = branding['branding.tagline'] || "Electronics Tutorials & Store";
    const favicon = branding['branding.favicon'] || "/favicon.ico";
    
    return {
      title: {
        default: `${siteName} - ${tagline}`,
        template: `%s | ${siteName}`,
      },
      description: tagline,
      icons: {
        icon: favicon,
      },
    };
  } catch (error) {
    return {
      title: "FideVoltz - Electronics Tutorials & Store",
      description: "Learn electronics and buy components.",
    };
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let branding: any = {};
  try {
    const settings = await prisma.siteSettings.findMany({
      where: { category: 'branding' },
    });
    branding = settings.reduce((acc: any, s) => {
      acc[s.key] = s.value;
      return acc;
    }, {});
  } catch (e) {}

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
        <Providers>
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
