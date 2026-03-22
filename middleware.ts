import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_ONLY = [
  "/dashboard",
  "/dashboard/invoices",
  "/dashboard/pro-features",
  "/dashboard/billing",
  "/dashboard/profile"
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!AUTH_ONLY.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  const session = req.cookies.get("__session")?.value;

  if (session) {
    return NextResponse.next();
  }

  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("next", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/dashboard/:path*"]
};
