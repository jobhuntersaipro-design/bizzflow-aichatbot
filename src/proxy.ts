import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import authConfig from "./auth.config";

const { auth } = NextAuth(authConfig);

// Webhooks, cron and auth stay outside the matcher. Every page needs a signed-in agent.
export const proxy = auth((req) => {
  const { pathname } = req.nextUrl;
  const signedIn = !!req.auth;
  if (pathname === "/login") {
    return signedIn ? NextResponse.redirect(new URL("/inbox", req.nextUrl)) : NextResponse.next();
  }
  if (!signedIn) return NextResponse.redirect(new URL("/login", req.nextUrl));
  if (pathname === "/") return NextResponse.redirect(new URL("/inbox", req.nextUrl));
  return NextResponse.next();
});

export const config = {
  matcher: ["/", "/login", "/inbox/:path*", "/agents/:path*"],
};
