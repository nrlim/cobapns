import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/session";
import { hasAccess, type UserTier } from "@/constants/permissions";

// ─── Route Config ──────────────────────────────────────────────────────────────

/** Routes that require any authenticated session */
const protectedRoutes = ["/dashboard", "/admin"];

/** Auth pages — redirect away if already logged in */
const authRoutes = ["/login", "/register"];

/**
 * Tier-gated routes: maps a path prefix → minimum required tier.
 *
 * IMPORTANT: Landing pages (psychology, iq-test, leaderboard) are intentionally
 * NOT listed here — they handle the locked state themselves via LockedFeaturePage,
 * which gives students rich context before upgrading.
 *
 * Only active test/session sub-routes are hard-redirected here to prevent
 * direct URL manipulation to the actual test forms.
 */
const TIER_GUARDS: Array<{ prefix: string; minTier: UserTier }> = [
  // MASTER only — block active test sessions, not the landing page
  { prefix: "/dashboard/psychology/test",   minTier: "MASTER" },
  { prefix: "/dashboard/psychology/result", minTier: "MASTER" },
  { prefix: "/dashboard/learning/videos",   minTier: "MASTER" },
  // ELITE and above — block full exam sessions
  { prefix: "/dashboard/exams/full",        minTier: "ELITE" },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

function pricingRedirect(request: NextRequest, blockedPath: string) {
  const url = new URL("/dashboard/pembelian", request.url);
  url.searchParams.set("upgrade", "1");
  url.searchParams.set("from", blockedPath);
  return NextResponse.redirect(url);
}

// ─── Middleware ────────────────────────────────────────────────────────────────

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const sessionToken = request.cookies.get("sipns-session")?.value;
  const session = sessionToken ? await verifySession(sessionToken) : null;

  // ── 1. Redirect authenticated users away from auth pages ──────────────────
  if (authRoutes.some((route) => pathname.startsWith(route))) {
    if (session) {
      const redirectTo = session.role === "ADMIN" ? "/admin" : "/dashboard";
      return NextResponse.redirect(new URL(redirectTo, request.url));
    }
    return NextResponse.next();
  }

  // ── 2. Guard /dashboard and /admin — require authentication ───────────────
  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));

  if (isProtected) {
    if (!session) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // STUDENT trying to access /admin → redirect to dashboard
    if (pathname.startsWith("/admin") && session.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // ── 3. Tier-based route guards (only for STUDENTs in /dashboard) ──────
    if (session.role === "STUDENT") {
      // Check expiry: tier in JWT may be stale — guard via subscriptionEnds cookie header
      // The JWT tier field is the source of truth set at login time.
      // For expiry, billing actions update the JWT on plan activation.
      const userTier = (session.tier ?? "FREE") as UserTier;

      for (const guard of TIER_GUARDS) {
        if (pathname.startsWith(guard.prefix)) {
          if (!hasAccess(userTier, guard.minTier)) {
            return pricingRedirect(request, pathname);
          }
          break; // first match wins
        }
      }
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)).*)",
  ],
};
