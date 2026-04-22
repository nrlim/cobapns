import { cookies } from "next/headers"
import { verifySession } from "@/lib/session"
import { redirect } from "next/navigation"
import { Trophy } from "lucide-react"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { LeaderboardClient } from "@/components/dashboard/leaderboard-client"
import { LockedFeaturePage, type LockedFeatureConfig } from "@/components/shared/locked-feature-page"
import { getLeaderboard } from "@/app/actions/leaderboard"
import { prisma } from "@/lib/prisma"
import { hasAccess, type UserTier } from "@/constants/permissions"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Leaderboard – COBA PNS",
  description: "Lihat peringkat global peserta COBA PNS. Bandingkan skor SKD-mu dengan ribuan calon peserta CPNS lainnya.",
}

const LEADERBOARD_LOCKED_CONFIG: LockedFeatureConfig = {
  pageKey: "leaderboard",
  featureName: "Ranking Nasional",
  featureDesc:
    "Lihat posisimu di antara ribuan peserta CPNS se-Indonesia secara real-time. Ketahui seberapa kompetitif skormu dan siapa yang harus kamu kejar.",
  requiredTier: "ELITE",
  Icon: Trophy,
  highlights: [
    "Peringkat nasional real-time di antara peserta aktif",
    "Filter berdasarkan instansi target & periode waktu",
    "Bandingkan skor SKD-mu (TWK, TIU, TKP) per kategori",
    "Lihat distribusi skor dan posisi persentilmu",
    "Rivalitas sehat untuk mendorong peningkatan skor",
  ],
}

const PAGE_SIZE = 20

export default async function LeaderboardPage() {
  // ── Auth ────────────────────────────────────────────────────────────────
  const cookieStore = await cookies()
  const token = cookieStore.get("sipns-session")?.value
  const session = token ? await verifySession(token) : null
  if (!session) redirect("/login")

  // ── Tier check ──────────────────────────────────────────────────────────
  const dbUser = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { subscriptionTier: true, subscriptionEnds: true },
  })

  const rawTier = dbUser?.subscriptionTier ?? "FREE"
  const effectiveTier: UserTier =
    rawTier !== "FREE" &&
    dbUser?.subscriptionEnds &&
    new Date(dbUser.subscriptionEnds) < new Date()
      ? "FREE"
      : (rawTier as UserTier)

  if (!hasAccess(effectiveTier, "ELITE")) {
    return (
      <DashboardShell activeHref="/dashboard/leaderboard" user={{ name: session.name, role: session.role, tier: session.tier }}>
        <LockedFeaturePage
          config={LEADERBOARD_LOCKED_CONFIG}
          userTier={effectiveTier}
          userName={session.name}
        />
      </DashboardShell>
    )
  }

  // ── Authorized: fetch leaderboard data ─────────────────────────────────
  const initial = await getLeaderboard({
    userId: session.userId,
    examFilter: "global",
    period: "alltime",
    instansiFilter: null,
    page: 0,
    pageSize: PAGE_SIZE,
  })

  return (
    <DashboardShell
      activeHref="/dashboard/leaderboard"
      user={{ name: session.name, role: session.role, tier: session.tier }}
    >
      <div className="p-4 md:p-8 lg:p-10 w-full space-y-8 pb-32">

        {/* ── Page Header ─────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-teal-700 mb-1 flex items-center gap-2">
              <Trophy className="w-3.5 h-3.5" />
              Kompetisi Global
            </p>
            <h2 className="text-2xl lg:text-3xl font-black tracking-tight text-slate-900">
              Leaderboard
            </h2>
            <p className="text-slate-500 font-medium mt-1 text-sm">
              Lihat posisimu di antara{" "}
              <span className="font-bold text-slate-700">
                {initial.totalCount.toLocaleString("id-ID")} peserta
              </span>{" "}
              COBA PNS aktif.
            </p>
          </div>

          {/* personal rank pill */}
          {initial.currentUser && (
            <div className="flex items-center gap-2.5 bg-teal-50 border border-teal-200 rounded-2xl px-4 py-2.5 shrink-0 shadow-sm">
              <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white text-xs font-black">
                {initial.currentUser.initials}
              </div>
              <div>
                <p className="text-[10px] font-black text-teal-500 uppercase tracking-widest">Peringkat Anda</p>
                <p className="text-sm font-black text-teal-800">
                  #{initial.currentUser.rank}{" "}
                  <span className="text-teal-500 font-medium text-xs">
                    dari {initial.totalCount.toLocaleString("id-ID")}
                  </span>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ── Leaderboard Client ──────────────────────────────── */}
        <LeaderboardClient
          initial={initial}
          currentUserId={session.userId}
          pageSize={PAGE_SIZE}
        />
      </div>
    </DashboardShell>
  )
}
