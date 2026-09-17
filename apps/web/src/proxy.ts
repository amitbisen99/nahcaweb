import { NextResponse } from "next/server";
import { auth } from "@/auth";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const role = req.auth?.user?.role;

  if (pathname.startsWith("/admin") && role !== "admin") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (pathname.startsWith("/portal") && !req.auth) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // The forum has no anonymous view at all — even reading requires an
  // account (a free "general user" one is enough, see /signup).
  if (pathname.startsWith("/forum") && !req.auth) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
});

export const config = {
  matcher: ["/portal/:path*", "/admin/:path*", "/forum/:path*"],
};
