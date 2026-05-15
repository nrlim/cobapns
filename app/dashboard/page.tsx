import { cookies } from "next/headers"
import { verifySession } from "@/lib/session"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import {
  ClipboardList,
  TrendingUp,
  Target,
  Zap,
  BookOpen,
  ChevronRight,
  BrainCircuit,
  Trophy,
  ArrowRight,
  PlayCircle,
  Clock,
  CheckCircle2,
} from "lucide-react"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"

export const metadata = {
  title: "Dashboard – COBA PNS Student",
}

export default async function StudentDashboardPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get("sipns-session")?.value
  const session = token ? await verifySession(token) : null
  if (!session) redirect("/login")

  // Fetch data in parallel to avoid waterfall requests and optimize TTFB
  const [user, recentResults, publishedExamCount, publishedSkbCount, totalExamsTaken, passedCount, recentActivityCount] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.userId },
      select: { subscriptionTier: true, createdAt: true },
    }),
    prisma.examResult.findMany({
      where: { userId: session.userId },
      orderBy: { submittedAt: "desc" },
      take: 3,
      include: {
        exam: { select: { title: true, id: true } },
      },
    }),
    prisma.exam.count({ where: { status: "PUBLISHED" } }),
    prisma.sKBExam.count({ where: { status: "PUBLISHED" } }),
    prisma.examResult.count({ where: { userId: session.userId } }),
    prisma.examResult.count({ where: { userId: session.userId, overallPass: true } }),
    prisma.examResult.count({
      where: {
        userId: session.userId,
        submittedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      }
    })
  ])

  const totalPublishedExams = publishedExamCount + publishedSkbCount;

  const passRate = totalExamsTaken > 0 ? Math.round((passedCount / totalExamsTaken) * 100) : 0

  const firstName = session.name.split(" ")[0]
  const tierLabel: Record<string, string> = { FREE: "Free", ELITE: "Elite", MASTER: "Master" }
  const tierColor: Record<string, string> = {
    FREE:   "bg-slate-100 text-slate-600",
    ELITE:  "text-white border border-white/20",
    MASTER: "bg-amber-50 text-amber-700 border border-amber-200",
  }
  const tier = user?.subscriptionTier ?? "FREE"

  let twkPct = 0;
  let tiuPct = 0;
  let tkpPct = 0;
  let weakestSubText = "Semua Materi";
  let pointPotential = 15;

  if (recentResults.length > 0) {
    const r = recentResults[0];
    twkPct = Math.round((r.scoreTWK / 150) * 100);
    tiuPct = Math.round((r.scoreTIU / 175) * 100);
    tkpPct = Math.round((r.scoreTKP / 225) * 100);
    const minPct = Math.min(twkPct, tiuPct, tkpPct);
    
    if (minPct === twkPct) {
      weakestSubText = "Tes Wawasan Kebangsaan (TWK)";
      pointPotential = Math.min(20, Math.max(5, 150 - r.scoreTWK));
    } else if (minPct === tiuPct) {
      weakestSubText = "Tes Intelegensia Umum (TIU)";
      pointPotential = Math.min(20, Math.max(5, 175 - r.scoreTIU));
    } else {
      weakestSubText = "Tes Karakteristik Pribadi (TKP)";
      pointPotential = Math.min(20, Math.max(5, 225 - r.scoreTKP));
    }
  }

  function fmtDate(d: Date) {
    return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(new Date(d))
  }

  return (
    <DashboardShell activeHref="/dashboard" user={{ name: session.name, role: session.role, tier: session.tier }}>
      <div className="p-4 md:p-8 lg:p-10 w-full space-y-8">

        {/* ── Welcome Header ──────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p
              className="text-xs font-bold uppercase tracking-widest mb-1"
              style={{ color: "#1E73BE" }}
            >
              Student Portal
            </p>
            <h2 className="text-2xl lg:text-3xl font-black tracking-tight text-slate-900">
              Halo, {firstName}! 👋
            </h2>
            <p className="text-slate-500 font-medium mt-1 text-sm">
              Semangat belajarnya! Siap selangkah lebih dekat jadi ASN hari ini?
            </p>
          </div>
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold flex-shrink-0 ${
              tier === "ELITE" ? "" : tierColor[tier]
            }`}
            style={
              tier === "ELITE"
                ? { background: "linear-gradient(135deg, #1E73BE, #2DBE60)", color: "#fff" }
                : {}
            }
          >
            <Trophy className="w-3.5 h-3.5" />
            Paket {tierLabel[tier]}
          </div>
        </div>

        {/* ── Stat Cards ──────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "Latihan Selesai",
              value: totalExamsTaken,
              sub: `dari total ${totalPublishedExams}`,
              icon: ClipboardList,
              iconBg: "#EFF6FF",
              iconColor: "#1E73BE",
              borderColor: "#BFDBFE",
            },
            {
              label: "Berhasil Lulus",
              value: passedCount,
              sub: `${passRate}% pass rate`,
              icon: CheckCircle2,
              iconBg: "#F0FDF4",
              iconColor: "#2DBE60",
              borderColor: "#BBF7D0",
            },
            {
              label: "Siap Dikerjakan",
              value: totalPublishedExams,
              sub: "siap latih kemampuanmu",
              icon: BookOpen,
              iconBg: "#F0F9FF",
              iconColor: "#2A8BD6",
              borderColor: "#BAE6FD",
            },
            {
              label: "Keaktifan Belajar",
              value: recentActivityCount,
              sub: "latihan dlm 7 hari",
              icon: Zap,
              iconBg: "#FFFBEB",
              iconColor: "#D97706",
              borderColor: "#FDE68A",
            },
          ].map(({ label, value, sub, icon: Icon, iconBg, iconColor, borderColor }) => (
            <div key={label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{label}</p>
                <div
                  className="w-8 h-8 rounded-lg border flex items-center justify-center"
                  style={{ background: iconBg, borderColor, color: iconColor }}
                >
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-black text-slate-900 tracking-tight">{value}</div>
              <div className="text-xs text-slate-400 font-medium mt-1">{sub}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left Column ─────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Hero CTA Banner — Signature Blue→Green Gradient */}
            <div
              className="relative rounded-2xl p-6 text-white shadow-sm overflow-hidden"
              style={{ background: "linear-gradient(135deg, #0F4FA8 0%, #1E73BE 50%, #2DBE60 100%)" }}
            >
              <div className="relative z-10">
                <p className="text-[10px] font-bold tracking-widest uppercase mb-1 text-white/70">
                  Simulasi CAT PNS
                </p>
                <h3 className="text-xl font-black mb-1 tracking-tight">Ayo Mulai Latihan!</h3>
                <p className="text-white/80 text-sm font-medium mb-5 max-w-sm">
                  Ada ${totalPublishedExams} latihan yang bisa kamu coba. Yuk, asah kemampuanmu sekarang!
                </p>
                <Link
                  href="/dashboard/exams"
                  className="inline-flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors shadow-sm"
                  style={{ color: "#1E73BE" }}
                >
                  <PlayCircle className="w-4 h-4" />
                  Pilih Latihan
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              {/* Decorative */}
              <TrendingUp className="absolute right-4 bottom-4 w-28 h-28 text-white/10" />
              <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10" />
            </div>

            {/* AI Diagnostic */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: "#EFF6FF", border: "1px solid #BFDBFE" }}
                >
                  <BrainCircuit className="w-4 h-4" style={{ color: "#1E73BE" }} />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-sm">AI Diagnostic</h3>
                  <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Tips Belajar Untukmu</p>
                </div>
              </div>
              {recentResults.length > 0 ? (
                <p className="text-sm text-slate-600 font-medium leading-relaxed mb-4">
                  Berdasarkan hasil latihan terakhir, kamu perlu memperkuat materi{" "}
                  <span className="font-bold text-slate-900">{weakestSubText}</span>. Kalau kamu pelajari bab ini, skor kamu bisa naik sampai{" "}
                  <span
                    className="font-bold px-1.5 py-0.5 rounded border text-sm inline-block"
                    style={{ color: "#1FA84E", background: "#F0FDF4", borderColor: "#BBF7D0" }}
                  >
                    +{pointPotential} poin
                  </span>.
                </p>
              ) : (
                <p className="text-sm text-slate-600 font-medium leading-relaxed mb-4">
                  Selesaikan setidaknya satu simulasi Try Out agar AI kami bisa memberikan rekomendasi materi spesifik yang perlu kamu tingkatkan.
                </p>
              )}
              <Link
                href="/dashboard/learning"
                className="inline-flex items-center gap-1 text-[11px] font-bold px-3 py-1.5 rounded-lg transition-colors uppercase tracking-widest"
                style={{ color: "#1E73BE", background: "#EFF6FF" }}
              >
                Pelajari Sekarang <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4">
              {[
                {
                  href: "/dashboard/exams",
                  icon: Zap,
                  title: "Mulai Try Out",
                  sub: `${totalPublishedExams} latihan tersedia`,
                  iconBg: "#EFF6FF",
                  iconBorder: "#BFDBFE",
                  iconColor: "#1E73BE",
                },
                {
                  href: "/dashboard/learning",
                  icon: BookOpen,
                  title: "Pelajari Materi",
                  sub: "Konsep Dasar SKD",
                  iconBg: "#F0F9FF",
                  iconBorder: "#BAE6FD",
                  iconColor: "#2A8BD6",
                },
              ].map(({ href, icon: Icon, title, sub, iconBg, iconBorder, iconColor }) => (
                <Link
                  key={href}
                  href={href}
                  className="bg-white rounded-2xl border border-transparent shadow-sm p-5 flex items-center gap-4 hover:shadow-md hover:border-blue-200 transition-all group"
                >
                  <div
                    className="w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0"
                    style={{ background: iconBg, borderColor: iconBorder, color: iconColor }}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-slate-900 text-sm group-hover:transition-colors" style={{ color: "inherit" }}>{title}</div>
                    <div className="text-[11px] text-slate-400 font-medium">{sub}</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 ml-auto flex-shrink-0" />
                </Link>
              ))}
            </div>
          </div>

          {/* ── Right Column ─────────────────────────────────────── */}
          <div className="space-y-5">
            {/* Recent Results */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
                <h3 className="font-black text-slate-900 text-sm">Hasil Terakhir</h3>
                <Link
                  href="/dashboard/exams"
                  className="text-[10px] font-bold uppercase tracking-widest hover:underline"
                  style={{ color: "#1E73BE" }}
                >
                  Semua
                </Link>
              </div>

              {recentResults.length === 0 ? (
                <div className="p-8 text-center">
                  <ClipboardList className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                  <p className="text-sm font-medium text-slate-400">Belum ada latihan yang selesai. Yuk, mulai satu sekarang!</p>
                  <Link
                    href="/dashboard/exams"
                    className="text-xs font-bold hover:underline mt-1 inline-block"
                    style={{ color: "#2DBE60" }}
                  >
                    Ayo Mulai! →
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {recentResults.map((r) => (
                    <Link
                      key={r.id}
                      href={`/dashboard/exams/${r.examId}/result/${r.id}`}
                      className="block px-5 py-4 hover:bg-slate-50/80 transition-colors group"
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p
                          className="text-[13px] font-bold text-slate-900 line-clamp-1 group-hover:transition-colors"
                          style={{ color: "inherit" }}
                        >
                          {r.exam.title}
                        </p>
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded-full flex-shrink-0 ${
                            r.overallPass ? "badge-lolos" : "badge-gagal"
                          }`}
                        >
                          {r.overallPass ? "LULUS" : "GAGAL"}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium">
                        <span className="font-bold text-slate-600">Skor: {r.totalScore}</span>
                        <span>{fmtDate(r.submittedAt)}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Progress Toward Kelulusan — Brand Gradient Bars */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-4 h-4" style={{ color: "#1E73BE" }} />
                <h3 className="font-black text-slate-900 text-sm">Peluang Kelulusan</h3>
              </div>
              <div className="space-y-3">
                {[
                  { label: "TWK", pct: twkPct },
                  { label: "TIU", pct: tiuPct },
                  { label: "TKP", pct: tkpPct },
                ].map(({ label, pct }) => (
                  <div key={label}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[11px] font-bold text-slate-600">{label}</span>
                      <span className="text-[11px] font-black text-slate-900">{pct}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{
                          width: `${pct}%`,
                          background: "linear-gradient(135deg, #1E73BE, #2DBE60)",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-slate-400 font-medium mt-4">
                * Hasil ini diambil dari latihan terakhirmu.
              </p>
            </div>

            {/* Upgrade CTA for free / elite tier */}
            {tier !== "MASTER" && (
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="w-4 h-4 text-amber-600" />
                  <h3 className="font-black text-amber-900 text-sm">
                    {tier === "FREE" ? "Ambil Paket Elite" : "Ambil Paket Master"}
                  </h3>
                </div>
                <p className="text-xs text-amber-700 font-medium mb-3">
                  {tier === "FREE"
                    ? "Akses semua try out eksklusif, ranking nasional, dan materi premium tanpa batas."
                    : "Buka Psikotes, Tes IQ, Career Mapping, dan Video Lesson eksklusif."}
                </p>
                <Link
                  href="/dashboard/pembelian"
                  className="flex items-center justify-center gap-2 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors"
                  style={{ background: "linear-gradient(135deg, #1E73BE, #2DBE60)" }}
                >
                  Cek Pilihan Paket <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </DashboardShell>
  )
}
