import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createHash } from "crypto";

const SECRET = process.env.AUTH_SECRET || "sa-activations-2026-key";

function verifyToken(token: string): boolean {
  const [value, hash] = token.split(".");
  if (!value || !hash) return false;
  const expected = createHash("sha256").update(value + SECRET).digest("hex").slice(0, 16);
  return hash === expected && value === "authenticated";
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /internal routes
  if (pathname.startsWith("/internal")) {
    const token = request.cookies.get("sa-auth")?.value;
    if (!token || !verifyToken(token)) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Protect /api/interest GET (submissions viewer)
  if (pathname === "/api/interest" && request.method === "GET") {
    const token = request.cookies.get("sa-auth")?.value;
    if (!token || !verifyToken(token)) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/internal/:path*", "/api/interest"],
};
