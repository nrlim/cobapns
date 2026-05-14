import { SignJWT, jwtVerify } from "jose";
import type { UserTier } from "@/constants/permissions";

if (!process.env.AUTH_SECRET && process.env.NODE_ENV === "production") {
  throw new Error("FATAL: AUTH_SECRET environment variable is not set.")
}

const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET ?? "dev-only-fallback-not-for-production"
);

export type SessionPayload = {
  userId: string;
  email: string;
  role: "ADMIN" | "STUDENT";
  name: string;
  /** User's current subscription tier — embedded in JWT to avoid per-request DB lookups. */
  tier: UserTier;
};

export async function signSession(payload: SessionPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h") // Session expires in 1 hour
    .sign(secret);
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}
