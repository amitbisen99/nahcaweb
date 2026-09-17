import { NextResponse } from "next/server";
import { auth } from "@/auth";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const role = req.auth?.user?.role;

  if (pathname.startsWith("/admin") && role !== "admin") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (pathname.startsWith("/portal")) {
    if (!req.auth) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    // A "general user" (free account, no Membership ever) has no reason to
    // be here — the portal is for members. Admin is exempt (role check, not
    // hasMembership) since admin accounts aren't expected to hold a
    // Membership of their own.
    if (role !== "admin" && !req.auth.user.hasMembership) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  // A general user's home base (Forum + Store orders) — login required,
  // same as /portal is for a member.
  if (pathname.startsWith("/dashboard") && !req.auth) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Forum browsing/reading (the index and a topic's own page) is public —
  // only posting a topic or replying needs an account, gated below. The
  // Store is public the same way (browsing/product pages need no account;
  // purchasing does, but that's a form submit on the same page rather than
  // a separate route, so there's nothing further to gate here).
  if ((pathname === "/forum/new" || pathname.startsWith("/forum/my-topics")) && !req.auth) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
});

export const config = {
  matcher: ["/portal/:path*", "/admin/:path*", "/dashboard/:path*", "/forum/new", "/forum/my-topics"],
};
