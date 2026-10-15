import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const user = req.auth?.user as { role?: string } | undefined;
  const isAdmin = user?.role === "ADMIN";
  const isEditor = user?.role === "EDITOR";

  // Protect dashboard routes
  if (pathname.startsWith("/dashboard")) {
    if (!isLoggedIn) {
      const loginUrl = new URL("/auth/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Admin-only routes
    const adminOnlyRoutes = [
      "/dashboard/users",
      "/dashboard/payments",
      "/dashboard/settings",
    ];
    if (adminOnlyRoutes.some((route) => pathname.startsWith(route)) && !isAdmin) {
      return NextResponse.redirect(new URL("/dashboard/overview", req.url));
    }

    // Admin or Editor routes
    const editorRoutes = [
      "/dashboard/projects",
      "/dashboard/products",
      "/dashboard/pages",
      "/dashboard/categories",
      "/dashboard/comments",
      "/dashboard/reviews",
      "/dashboard/media",
      "/dashboard/seo",
      "/dashboard/seo-ads",
      "/dashboard/analytics",
    ];
    if (
      editorRoutes.some((route) => pathname.startsWith(route)) &&
      !isAdmin &&
      !isEditor
    ) {
      return NextResponse.redirect(new URL("/dashboard/overview", req.url));
    }
  }

  // Redirect logged-in users away from auth pages
  if (pathname.startsWith("/auth/") && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard/overview", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/auth/:path*",
  ],
};
