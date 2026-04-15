import { cookies } from "next/headers";
import { createHash } from "crypto";

const PASSCODE = "transistor";
const SECRET = process.env.AUTH_SECRET || "sa-activations-2026-key";

function sign(value: string): string {
  const hash = createHash("sha256").update(value + SECRET).digest("hex").slice(0, 16);
  return `${value}.${hash}`;
}

export function verifyToken(token: string): boolean {
  const [value, hash] = token.split(".");
  if (!value || !hash) return false;
  const expected = createHash("sha256").update(value + SECRET).digest("hex").slice(0, 16);
  return hash === expected && value === "authenticated";
}

export async function POST(request: Request) {
  const body = await request.json();
  const { passcode } = body;

  if (passcode?.toLowerCase().trim() !== PASSCODE) {
    return Response.json({ error: "Invalid passcode" }, { status: 401 });
  }

  const token = sign("authenticated");
  const cookieStore = await cookies();
  cookieStore.set("sa-auth", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return Response.json({ ok: true });
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete("sa-auth");
  return Response.json({ ok: true });
}
