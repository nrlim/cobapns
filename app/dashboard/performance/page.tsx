import { cookies } from "next/headers"
import { verifySession } from "@/lib/session"
import { redirect } from "next/navigation"
import { getPerformanceAnalytics } from "@/app/actions/performance"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { LockedFeaturePage, type LockedFeatureConfig } from "@/components/shared/locked-feature-page"
import { prisma } from "@/lib/prisma"
import { hasAccess, type UserTier } from "@/constants/permissions"
import {
  CategoryRadarChart,
  ScoreTrendChart,
  SubCategoryPanel,
} from "@/components/dashboard/performance-charts"
import {
  TrendingUp,
  Target,
  BrainCircuit,
  BookOpen,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  BarChart3,
  Zap,
  ArrowRight,
  Star,
  ChevronRight,
} from "lucide-react"
import Link from "next/link"

export const metadata = {
  title: "Analitik & Diagnostik – COBA PNS",
  description: "Pantau progress belajar CPNS kamu dengan analisa mendalam per kategori.",
}

const PERFORMANCE_LOCKED_CONFIG: LockedFeatureConfig = {
  pageKey: "performance",
  featureName: "Analitik & Diagnostik",
  featureDesc:
    "Akses data analitik mendalam dari setiap try out yang kamu kerjakan. Ketahui kekuatan, titik lemah, dan progress belajarmu secara real-time.",
  requiredTier: "ELITE",
  Icon: BarChart3,
  highlights: [
    "Radar chart kekuatan per kategori (TWK, TIU, TKP)",
    "Passing grade tracker & tren skor",
    "Analisis kelemahan level sub-materi",
    "AI Study Plan berdasarkan performa",
  ],
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function getMasteryLabel(pct: number) {
  if (pct >= 80) return { label: "Mahir", color: "text-teal-700 bg-teal-50 border-teal-200" }
  if (pct >= 60) return { label: "Cukup", color: "text-blue-700 bg-blue-50 border-blue-200" }
  if (pct >= 40) return { label: "Berkembang", color: "text-amber-700 bg-amber-50 border-amber-200" }
  return { label: "Lemah", color: "text-red-700 bg-red-50 border-red-200" }
}

function ScoreCard({
  label,
  score,
  passing,
  max,
  color,
}: {
  label: string
  score: number
  passing: number
  max: number
  color: string
}) {
  const pct = Math.min(Math.round((score / max) * 100), 100)
  const isPass = score >= passing
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="font-black text-slate-900 text-sm">{label}</span>
        <span
          className={`text-[9px] font-black px-2 py-0.5 rounded-full border uppercase tracking-widest ${
            isPass
              ? "bg-teal-50 text-teal-700 border-teal-200"
              : "bg-red-50 text-red-600 border-red-200"
          }`}
        >
          {isPass ? "✓ Aman" : "Kurang"}
        </span>
      </div>
      <div className="text-4xl font-black tracking-tight" style={{ color }}>
        {score}
      </div>
      <div className="text-[11px] text-slate-400 font-medium mb-3">
        Ambang Batas: {passing} · Max: {max}
      </div>
      <div className="w-full h-2 rounded-full bg-slate-100">
        <div
          className="h-2 rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default async function PerformancePage() {
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

  // ── Tier guard: ELITE required ─────────────────────────────────────────────
  if (!hasAccess(effectiveTier, "ELITE")) {
    return (
      <DashboardShell activeHref="/dashboard/performance" user={{ name: session.name, role: session.role, tier: session.tier }}>
        <LockedFeaturePage
          config={PERFORMANCE_LOCKED_CONFIG}
          userTier={effectiveTier}
          userName={session.name}
        />
      </DashboardShell>
    )
  }

  const analytics = await getPerformanceAnalytics(session.userId)

  const {
    avgTWK, avgTIU, avgTKP, avgTotal,
    passingGrade,
    trend,
    subCategoryMastery,
    weakestSubCategory,
    strongestSubCategory,
    hasData,
  } = analytics

  const twkMastery = getMasteryLabel(Math.round((avgTWK / 150) * 100))
  const tiuMastery = getMasteryLabel(Math.round((avgTIU / 175) * 100))
  const tkpMastery = getMasteryLabel(Math.round((avgTKP / 225) * 100))

  return (
    <DashboardShell activeHref="/dashboard/performance" user={{ name: session.name, role: session.role, tier: session.tier }}>
      <div className="p-4 md:p-8 lg:p-10 w-full space-y-8">

        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-teal-700 mb-1">
              <BarChart3 className="inline w-3.5 h-3.5 mr-1 -mt-0.5" />
              Analitik Performa
            </p>
            <h2 className="text-2xl lg:text-3xl font-black tracking-tight text-slate-900">
              Diagnostik &amp; Progress
            </h2>
            <p className="text-slate-500 font-medium mt-1 text-sm max-w-md">
              Lihat kekuatan &amp; kelemahan SKD-mu secara mendalam. Data diperbarui otomatis setiap kamu selesai try out.
            </p>
          </div>
        </div>

        {!hasData ? (
          /* ── Empty State ──────────────────────────────────────── */
          <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-16 text-center">
            <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-8 h-8 text-teal-400" />
            </div>
            <h3 className="text-lg font-black text-slate-900 mb-2">Belum Ada Data</h3>
            <p className="text-sm text-slate-400 font-medium mb-6 max-w-sm mx-auto">
              Kerjakan minimal 1 try out untuk melihat analitik performa dan diagnostik mendalam kamu.
            </p>
            <Link
              href="/dashboard/exams"
              className="inline-flex items-center gap-2 bg-teal-700 hover:bg-teal-800 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-colors"
            >
              Mulai Try Out <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <>
            {/* ── Section A: Average Score Cards ──────────────────── */}
            <section>
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">
                Rata-rata Skor
              </h3>

              {/* Top Stat Row */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                {/* Total Score */}
                <div className="col-span-2 lg:col-span-1 bg-gradient-to-br from-teal-800 via-teal-700 to-teal-600 rounded-2xl p-5 text-white flex flex-col justify-between shadow-sm">
                  <div>
                    <p className="text-teal-200 text-[10px] font-bold tracking-widest uppercase mb-1">Total SKD</p>
                    <div className="text-4xl font-black tracking-tight mb-1">{avgTotal}</div>
                    <p className="text-teal-200 text-xs font-medium">rata-rata dari {passingGrade.totalTaken} ujian</p>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${passingGrade.passRate >= 50 ? "bg-white/20 text-white" : "bg-red-500/30 text-red-100"}`}>
                      {passingGrade.passRate}% pass rate
                    </span>
                  </div>
                </div>

                {/* TWK */}
                <ScoreCard label="TWK" score={avgTWK} passing={65} max={150} color="#f59e0b" />
                {/* TIU */}
                <ScoreCard label="TIU" score={avgTIU} passing={80} max={175} color="#3b82f6" />
                {/* TKP */}
                <ScoreCard label="TKP" score={avgTKP} passing={166} max={225} color="#a855f7" />
              </div>

              {/* Mastery Labels */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "TWK", mastery: twkMastery },
                  { label: "TIU", mastery: tiuMastery },
                  { label: "TKP", mastery: tkpMastery },
                ].map(({ label, mastery }) => (
                  <div key={label} className={`flex items-center justify-between px-4 py-2.5 rounded-xl border text-sm font-bold ${mastery.color}`}>
                    <span>{label}</span>
                    <span className="font-black text-xs uppercase tracking-widest">{mastery.label}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* ── Section B: Radar + Passing Grade ────────────────── */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Radar Chart */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 bg-teal-50 border border-teal-100 rounded-lg flex items-center justify-center">
                    <BrainCircuit className="w-4 h-4 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-sm">Power Level</h3>
                    <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Radar Chart</p>
                  </div>
                </div>
                <p className="text-xs text-slate-500 font-medium mb-4">
                  Visualisasi kekuatan relatif di tiga pilar SKD (dinormalisasi ke 0-100%).
                </p>
                <CategoryRadarChart avgTWK={avgTWK} avgTIU={avgTIU} avgTKP={avgTKP} />
              </div>

              {/* Passing Grade Tracker */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-green-50 border border-green-100 rounded-lg flex items-center justify-center">
                    <Target className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-sm">Passing Grade Tracker</h3>
                    <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Ambang Batas</p>
                  </div>
                </div>

                {/* Overall Pass/Fail */}
                <div className="flex gap-4 mb-6">
                  <div className="flex-1 bg-teal-50 border border-teal-100 rounded-xl p-4 text-center">
                    <CheckCircle2 className="w-6 h-6 text-teal-600 mx-auto mb-1" />
                    <div className="text-3xl font-black text-teal-800">{passingGrade.passed}</div>
                    <div className="text-[10px] font-bold text-teal-600 uppercase tracking-widest">Lulus</div>
                  </div>
                  <div className="flex-1 bg-red-50 border border-red-100 rounded-xl p-4 text-center">
                    <XCircle className="w-6 h-6 text-red-500 mx-auto mb-1" />
                    <div className="text-3xl font-black text-red-700">{passingGrade.failed}</div>
                    <div className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Gagal</div>
                  </div>
                </div>

                {/* Per-Category Pass Count */}
                <div className="space-y-3">
                  {[
                    { label: "TWK", count: passingGrade.passTWK, color: "#f59e0b", bg: "#fef3c7" },
                    { label: "TIU", count: passingGrade.passTIU, color: "#3b82f6", bg: "#dbeafe" },
                    { label: "TKP", count: passingGrade.passTKP, color: "#a855f7", bg: "#f3e8ff" },
                  ].map(({ label, count, color, bg }) => {
                    const pct = passingGrade.totalTaken > 0
                      ? Math.round((count / passingGrade.totalTaken) * 100)
                      : 0
                    return (
                      <div key={label}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] font-bold text-slate-600">{label} Lolos Ambang</span>
                          <span className="text-[11px] font-black" style={{ color }}>
                            {count}/{passingGrade.totalTaken} ({pct}%)
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-100">
                          <div
                            className="h-2 rounded-full transition-all duration-700"
                            style={{ width: `${pct}%`, backgroundColor: color }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </section>

            {/* ── Section C: Score Trend ───────────────────────────── */}
            <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-sm">Tren Perkembangan Skor</h3>
                    <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Score Timeline</p>
                  </div>
                </div>
                <div className="flex gap-2 text-[10px] font-bold">
                  <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-500">
                    {passingGrade.totalTaken} Ujian
                  </span>
                </div>
              </div>
              {trend.length < 2 ? (
                <div className="py-6 text-center text-sm text-slate-400 font-medium">
                  Kerjakan minimal 2 try out untuk melihat grafik tren.
                </div>
              ) : (
                <ScoreTrendChart trend={trend} />
              )}
              <p className="text-[10px] text-slate-400 font-medium mt-3">
                * Titik merah = tidak lulus ambang batas, hijau = lulus. Garis putus-putus = total SKD.
              </p>
            </section>

            {/* ── Section D: Sub-Category Mastery ─────────────────── */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Sub-Category Bars */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-purple-50 border border-purple-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-sm">Penguasaan Sub-Materi</h3>
                    <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">
                      Mastery per Topik
                    </p>
                  </div>
                </div>
                {subCategoryMastery.length === 0 ? (
                  <div className="py-8 text-center text-sm text-slate-400 font-medium">
                    Data sub-kategori belum tersedia.
                  </div>
                ) : (
                  <SubCategoryPanel data={subCategoryMastery} />
                )}
              </div>

              {/* Smart Recommendations */}
              <div className="space-y-4">
                {/* Weakest */}
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 bg-amber-100 border border-amber-200 rounded-lg flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-amber-700 uppercase tracking-widest">Perlu Diperkuat</p>
                      <h4 className="font-black text-amber-900 text-sm">Titik Lemah</h4>
                    </div>
                  </div>
                  {weakestSubCategory ? (
                    <>
                      <p className="text-xs text-amber-800 font-bold mb-1 line-clamp-1">
                        {weakestSubCategory.category} — {weakestSubCategory.subCategory}
                      </p>
                      <p className="text-xs text-amber-700 mb-3">
                        Tingkat penguasaan:{" "}
                        <span className="font-black text-amber-900">
                          {weakestSubCategory.masteryPct}%
                        </span>{" "}
                        ({weakestSubCategory.correct}/{weakestSubCategory.total} benar)
                      </p>
                      <Link
                        href="/dashboard/learning"
                        className="flex items-center justify-between bg-amber-600 hover:bg-amber-700 text-white px-3 py-2 rounded-xl text-xs font-bold transition-colors"
                      >
                        <span className="flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5" />
                          Pelajari Sekarang
                        </span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </>
                  ) : (
                    <p className="text-xs text-amber-700">Belum cukup data.</p>
                  )}
                </div>

                {/* Strongest */}
                <div className="bg-teal-50 border border-teal-200 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 bg-teal-100 border border-teal-200 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Star className="w-3.5 h-3.5 text-teal-600" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-teal-700 uppercase tracking-widest">Keunggulan Kamu</p>
                      <h4 className="font-black text-teal-900 text-sm">Titik Kuat</h4>
                    </div>
                  </div>
                  {strongestSubCategory ? (
                    <>
                      <p className="text-xs text-teal-800 font-bold mb-1 line-clamp-1">
                        {strongestSubCategory.category} — {strongestSubCategory.subCategory}
                      </p>
                      <p className="text-xs text-teal-700">
                        Tingkat penguasaan:{" "}
                        <span className="font-black text-teal-900">
                          {strongestSubCategory.masteryPct}%
                        </span>
                      </p>
                    </>
                  ) : (
                    <p className="text-xs text-teal-700">Belum cukup data.</p>
                  )}
                </div>

                {/* AI Recomendation Banner */}
                <div className="bg-gradient-to-br from-indigo-900 to-indigo-700 rounded-2xl p-5 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-indigo-300" />
                    <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">AI Study Plan</p>
                  </div>
                  <h4 className="font-black text-white text-sm mb-2">Rekomendasi Belajar</h4>
                  <p className="text-xs text-indigo-200 font-medium leading-relaxed">
                    {weakestSubCategory
                      ? `Fokuskan 30 menit sehari untuk "${weakestSubCategory.subCategory}" (${weakestSubCategory.category}). Dengan latihan konsisten, penguasaan bisa naik +20% dalam 2 minggu.`
                      : "Kerjakan lebih banyak try out agar AI dapat merekomendasikan materi yang tepat buatmu."}
                  </p>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </DashboardShell>
  )
}
