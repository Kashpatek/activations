import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SECRET = process.env.AUTH_SECRET || "sa-activations-2026-key";

async function verifyToken(token: string): Promise<boolean> {
  const [value, hash] = token.split(".");
  if (!value || !hash) return false;
  const data = new TextEncoder().encode(value + SECRET);
  const digest = await crypto.subtle.digest("SHA-256", data);
  const expected = Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 16);
  return hash === expected && value === "authenticated";
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /internal routes
  if (pathname.startsWith("/internal")) {
    const token = request.cookies.get("sa-auth")?.value;
    if (!token || !(await verifyToken(token))) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Protect /api/interest GET (submissions viewer)
  if (pathname === "/api/interest" && request.method === "GET") {
    const token = request.cookies.get("sa-auth")?.value;
    if (!token || !(await verifyToken(token))) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  // Protect /api/track GET (analytics viewer)
  if (pathname === "/api/track" && request.method === "GET") {
    const token = request.cookies.get("sa-auth")?.value;
    if (!token || !(await verifyToken(token))) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  // Protect /api/pipeline entirely — internal-only
  if (pathname === "/api/pipeline") {
    const token = request.cookies.get("sa-auth")?.value;
    if (!token || !(await verifyToken(token))) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  // Protect /api/event-sponsors entirely — internal-only
  if (pathname === "/api/event-sponsors") {
    const token = request.cookies.get("sa-auth")?.value;
    if (!token || !(await verifyToken(token))) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  // Protect /api/interest DELETE and PATCH (only POST is public)
  if (pathname === "/api/interest" && (request.method === "DELETE" || request.method === "PATCH")) {
    const token = request.cookies.get("sa-auth")?.value;
    if (!token || !(await verifyToken(token))) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/internal/:path*", "/api/interest", "/api/track", "/api/pipeline", "/api/event-sponsors"],
};
