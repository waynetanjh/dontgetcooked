import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  // Public routes
  const isPublicRoute = 
    pathname === "/" || 
    pathname === "/register" || 
    pathname.startsWith("/api/auth");

  // If trying to access protected route without auth, redirect to login
  if (!isPublicRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // If logged in and trying to access login/register, redirect to dashboard
  if (isLoggedIn && (pathname === "/" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
