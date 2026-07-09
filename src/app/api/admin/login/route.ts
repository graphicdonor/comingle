import { NextRequest, NextResponse } from "next/server";
import { computeAdminToken, isAdminPasswordValid } from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  let password: unknown;
  try {
    ({ password } = await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const secret = process.env.ADMIN_SECRET;
  if (!secret || typeof password !== "string" || !isAdminPasswordValid(password, secret)) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const token = computeAdminToken(secret);
  const res = NextResponse.json({ ok: true });
  res.cookies.set("admin-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 8, // 8 hours
    path: "/admin",
  });
  return res;
}
