import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret-at-least-32-chars-long"
);

export async function middleware(request: NextRequest) {
  const session = request.cookies.get("admin_session")?.value;
  const { pathname } = request.nextUrl;

  let isValid = false;
  if (session) {
    try {
      await jwtVerify(session, secret);
      isValid = true;
    } catch (error) {
      isValid = false;
    }
  }

  // Protect dashboard routes
  if (pathname === "/" || pathname.startsWith("/dashboard") || pathname.startsWith("/api/til")) {
    if (!isValid) {
      // If it's an API route, return 401
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      // If it's a page route, redirect to login
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Redirect from login if already logged in
  if (pathname === "/login") {
    if (isValid) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/dashboard/:path*", "/api/til", "/api/til/:path*", "/login"],
};
