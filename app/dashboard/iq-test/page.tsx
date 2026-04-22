// app/dashboard/iq-test/page.tsx
import { cookies } from "next/headers"
import { verifySession } from "@/lib/session"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import IQTestClient from "@/components/dashboard/iq-test-client"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { LockedFeaturePage, type LockedFeatureConfig } from "@/components/shared/locked-feature-page"
import { Zap } from "lucide-react"
import { hasAccess, type UserTier } from "@/constants/permissions"

export const metadata = {
  title: "Tes IQ Multi-Dimensi – COBA PNS",
}

const IQ_LOCKED_CONFIG: LockedFeatureConfig = {
  pageKey: "iq-test",
  featureName: "Tes IQ Multi-Dimensi",
  featureDesc:
    "Ukur kemampuan kognitifmu dengan tes IQ 4 dimensi — Verbal, Numerik, Logika, dan Spasial — menggunakan standar psikometri internasional.",
  requiredTier: "MASTER",
  Icon: Zap,
  highlights: [
    "4 Sub-tes: Verbal, Numerik, Logika, Spasial (53 soal)",
    "Timer adaptif per sub-tes (±21 menit total)",
    "Skor IQ Terstandarisasi — Mean 100, SD 15",
    "Interpretasi hasil lengkap dengan kategori kemampuan",
    "Bandingkan IQ-mu dengan peserta CPNS lainnya",
  ],
}

export default async function IQTestPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get("sipns-session")?.value
  const session = token ? await verifySession(token) : null
  if (!session) redirect("/login")

  // Fetch live tier from DB
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

  // ── Tier gate: requires ELITE ───────────────────────────────────────────────
  if (!hasAccess(effectiveTier, "MASTER")) {
    return (
      <DashboardShell activeHref="/dashboard/psychology" user={{ name: session.name, role: session.role, tier: session.tier }}>
        <LockedFeaturePage
          config={IQ_LOCKED_CONFIG}
          userTier={effectiveTier}
          userName={session.name}
        />
      </DashboardShell>
    )
  }

  // ── Authorized: fetch IQ questions ─────────────────────────────────────────
  const [verbal, numeric, logic, spatial, configs] = await Promise.all([
    prisma.iQQuestion.findMany({
      where: { subTest: "VERBAL", isActive: true },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    }),
    prisma.iQQuestion.findMany({
      where: { subTest: "NUMERIC", isActive: true },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    }),
    prisma.iQQuestion.findMany({
      where: { subTest: "LOGIC", isActive: true },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    }),
    prisma.iQQuestion.findMany({
      where: { subTest: "SPATIAL", isActive: true },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    }),
    prisma.iQSubTestConfig.findMany(),
  ])

  const cfgMap: Record<string, number> = {
    VERBAL: 300, NUMERIC: 300, LOGIC: 360, SPATIAL: 300,
  }
  for (const c of configs) {
    cfgMap[c.subTest] = c.timeSeconds
  }

  const iqData = {
    verbal:  { questions: verbal,  timeSeconds: cfgMap.VERBAL },
    numeric: { questions: numeric, timeSeconds: cfgMap.NUMERIC },
    logic:   { questions: logic,   timeSeconds: cfgMap.LOGIC },
    spatial: { questions: spatial, timeSeconds: cfgMap.SPATIAL },
  }

  return <IQTestClient iqData={iqData as any} />
}
