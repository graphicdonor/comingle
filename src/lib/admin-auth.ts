import { createHash, timingSafeEqual } from "crypto";

const ADMIN_SALT = "admin-salt";

function safeEqual(a: string, b: string): boolean {
  // Hash both sides to fixed-length buffers first so timingSafeEqual doesn't
  // throw on mismatched lengths (which would itself leak length via a throw).
  const bufA = createHash("sha256").update(a).digest();
  const bufB = createHash("sha256").update(b).digest();
  return timingSafeEqual(bufA, bufB);
}

export function computeAdminToken(secret: string): string {
  return createHash("sha256").update(secret + ADMIN_SALT).digest("hex");
}

export function isAdminPasswordValid(password: string, secret: string): boolean {
  return safeEqual(password, secret);
}

export function isAdminTokenValid(token: string, secret: string): boolean {
  return safeEqual(token, computeAdminToken(secret));
}
