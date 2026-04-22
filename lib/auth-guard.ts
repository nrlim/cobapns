/**
 * Server-side auth guard helpers for "use server" actions.
 * Import these in server actions to enforce authentication + role + tier checks.
 */
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import { verifySession, type SessionPayload } from "@/lib/session"
import { hasAccess, type UserTier } from "@/constants/permissions"

/** Returns the current session or null. Use in student-facing actions. */
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get("sipns-session")?.value
  return token ? await verifySession(token) : null
}

/** Throws if not authenticated. Returns session. */
export async function requireAuth(): Promise<SessionPayload> {
  const session = await getSession()
  if (!session) throw new Error("UNAUTHENTICATED")
  return session
}

/** Throws if not authenticated as ADMIN. Returns session. */
export async function requireAdmin(): Promise<SessionPayload> {
  const session = await getSession()
  if (!session) throw new Error("UNAUTHENTICATED")
  if (session.role !== "ADMIN") throw new Error("FORBIDDEN")
  return session
}

/**
 * Requires the user to have a minimum subscription tier.
 *
 * Unlike middleware (which reads tier from JWT), this function performs a
 * LIVE database lookup to prevent JWT replay attacks after tier downgrade.
 *
 * @throws "UNAUTHENTICATED" | "TIER_INSUFFICIENT" | "SUBSCRIPTION_EXPIRED"
 */
export async function requireTier(minTier: UserTier): Promise<SessionPayload> {
  const session = await getSession()
  if (!session) throw new Error("UNAUTHENTICATED")

  // Skip tier check for admins — they have full access.
  if (session.role === "ADMIN") return session

  // Re-verify from DB (prevents stale JWT exploitation)
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { subscriptionTier: true, subscriptionEnds: true, isActive: true },
  })

  if (!user || !user.isActive) throw new Error("UNAUTHENTICATED")

  // Check expiry: if subscriptionEnds is in the past, treat as FREE
  const effectiveTier =
    user.subscriptionTier !== "FREE" &&
    user.subscriptionEnds &&
    new Date(user.subscriptionEnds) < new Date()
      ? "FREE"
      : (user.subscriptionTier as UserTier)

  if (effectiveTier !== user.subscriptionTier) {
    throw new Error("SUBSCRIPTION_EXPIRED")
  }

  if (!hasAccess(effectiveTier, minTier)) {
    throw new Error("TIER_INSUFFICIENT")
  }

  return session
}

/** Wraps auth/tier errors into a standard action result shape. */
export function handleAuthError(err: unknown): { success: false; error: string } {
  if (err instanceof Error) {
    if (err.message === "UNAUTHENTICATED")
      return { success: false, error: "Sesi tidak valid. Silakan login kembali." }
    if (err.message === "FORBIDDEN")
      return { success: false, error: "Akses ditolak. Hanya admin yang diizinkan." }
    if (err.message === "TIER_INSUFFICIENT")
      return { success: false, error: "Akses ditolak. Upgrade paket Anda untuk menggunakan fitur ini." }
    if (err.message === "SUBSCRIPTION_EXPIRED")
      return { success: false, error: "Langganan Anda telah berakhir. Perpanjang untuk melanjutkan." }
  }
  return { success: false, error: "Terjadi kesalahan server." }
}
