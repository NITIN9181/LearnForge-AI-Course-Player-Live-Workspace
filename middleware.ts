import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  const isRoot = pathname === "/";
  const isAdminRoute = pathname.startsWith("/admin");
  const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/register");
  const isApiAuthRoute = pathname.startsWith("/api/auth");

  if (isApiAuthRoute) return NextResponse.next();

  if (!session && !isAuthRoute) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (session && (isAuthRoute || isRoot)) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (isAdminRoute && session?.user?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/auth).*)"],
};
