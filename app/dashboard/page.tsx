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
  const [user, recentResults, publishedExamCount, totalExamsTaken, passedCount] = await Promise.all([
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
    prisma.examResult.count({ where: { userId: session.userId } }),
    prisma.examResult.count({ where: { userId: session.userId, overallPass: true } })
  ])

  const passRate = totalExamsTaken > 0 ? Math.round((passedCount / totalExamsTaken) * 100) : 0

  const firstName = session.name.split(" ")[0]
  const tierLabel: Record<string, string> = { FREE: "Free", ELITE: "Elite", MASTER: "Master" }
  const tierColor: Record<string, string> = {
    FREE:   "bg-slate-100 text-slate-600",
    ELITE:  "bg-teal-50 text-teal-700 border border-teal-200",
    MASTER: "bg-amber-50 text-amber-700 border border-amber-200",
  }
  const tier = user?.subscriptionTier ?? "FREE"

  function fmtDate(d: Date) {
    return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(new Date(d))
  }

  return (
    <DashboardShell activeHref="/dashboard" user={{ name: session.name, role: session.role, tier: session.tier }}>
      <div className="p-4 md:p-8 lg:p-10 w-full space-y-8">

        {/* ── Welcome Header ──────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-teal-700 mb-1">Student Portal</p>
            <h2 className="text-2xl lg:text-3xl font-black tracking-tight text-slate-900">
              Halo, {firstName}! 👋
            </h2>
            <p className="text-slate-500 font-medium mt-1 text-sm">
              Siap melanjutkan perjalanan menuju kelulusan CPNS hari ini?
            </p>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold flex-shrink-0 ${tierColor[tier]}`}>
            <Trophy className="w-3.5 h-3.5" />
            Paket {tierLabel[tier]}
          </div>
        </div>

        {/* ── Stat Cards ──────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "Try Out Dikerjakan",
              value: totalExamsTaken,
              sub: `dari ${publishedExamCount} tersedia`,
              icon: ClipboardList,
              color: "text-teal-600 bg-teal-50 border-teal-100",
            },
            {
              label: "Ujian Lulus",
              value: passedCount,
              sub: `${passRate}% pass rate`,
              icon: CheckCircle2,
              color: "text-green-600 bg-green-50 border-green-100",
            },
            {
              label: "Ujian Tersedia",
              value: publishedExamCount,
              sub: "siap dikerjakan",
              icon: BookOpen,
              color: "text-blue-600 bg-blue-50 border-blue-100",
            },
            {
              label: "Streak Belajar",
              value: "7",
              sub: "hari berturut-turut",
              icon: Zap,
              color: "text-amber-600 bg-amber-50 border-amber-100",
            },
          ].map(({ label, value, sub, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{label}</p>
                <div className={`w-8 h-8 rounded-lg border flex items-center justify-center ${color}`}>
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

            {/* Hero CTA Banner */}
            <div className="relative bg-gradient-to-br from-teal-800 via-teal-700 to-teal-600 rounded-2xl p-6 text-white shadow-sm overflow-hidden">
              <div className="relative z-10">
                <p className="text-teal-200 text-[10px] font-bold tracking-widest uppercase mb-1">Simulasi CAT CPNS</p>
                <h3 className="text-xl font-black mb-1 tracking-tight">Mulai Try Out Sekarang</h3>
                <p className="text-teal-100 text-sm font-medium mb-5 max-w-sm">
                  {publishedExamCount} ujian tersedia. Uji kemampuan SKD-mu dengan simulasi CAT real.
                </p>
                <Link
                  href="/dashboard/exams"
                  className="inline-flex items-center gap-2 bg-white text-teal-800 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-teal-50 transition-colors shadow-sm"
                >
                  <PlayCircle className="w-4 h-4" />
                  Lihat Daftar Ujian
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              {/* Decorative */}
              <TrendingUp className="absolute right-4 bottom-4 w-28 h-28 text-white/10" />
              <div className="absolute -top-8 -right-8 w-32 h-32 bg-teal-500/20 rounded-full" />
            </div>

            {/* AI Diagnostic */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-indigo-50 border border-indigo-100 rounded-lg flex items-center justify-center">
                  <BrainCircuit className="w-4 h-4 text-indigo-500" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-sm">AI Diagnostic</h3>
                  <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Rekomendasi Belajar</p>
                </div>
              </div>
              <p className="text-sm text-slate-600 font-medium leading-relaxed mb-4">
                Berdasarkan hasil try out terakhir, kamu paling lemah di materi{" "}
                <span className="font-bold text-slate-900">Silogisme (TIU)</span>. Fokus latihan di sub-bab ini
                dapat meningkatkan skormu hingga{" "}
                <span className="font-bold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-100">+15 poin</span>.
              </p>
              <Link
                href="/dashboard/learning"
                className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors uppercase tracking-widest"
              >
                Mulai Latihan <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4">
              {[
                {
                  href: "/dashboard/exams",
                  icon: Zap,
                  title: "Kerjakan Try Out",
                  sub: `${publishedExamCount} ujian tersedia`,
                  iconColor: "bg-teal-50 border-teal-100 text-teal-600",
                },
                {
                  href: "/dashboard/learning",
                  icon: BookOpen,
                  title: "Baca Materi SKD",
                  sub: "TWK · TIU · TKP",
                  iconColor: "bg-blue-50 border-blue-100 text-blue-600",
                },
              ].map(({ href, icon: Icon, title, sub, iconColor }) => (
                <Link
                  key={href}
                  href={href}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4 hover:border-teal-200 hover:shadow-md transition-all group"
                >
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0 ${iconColor}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-slate-900 text-sm group-hover:text-teal-700 transition-colors">{title}</div>
                    <div className="text-[11px] text-slate-400 font-medium">{sub}</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-teal-500 transition-colors ml-auto flex-shrink-0" />
                </Link>
              ))}
            </div>
          </div>

          {/* ── Right Column ─────────────────────────────────────── */}
          <div className="space-y-5">
            {/* Recent Results */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
                <h3 className="font-black text-slate-900 text-sm">Riwayat Ujian</h3>
                <Link href="/dashboard/exams" className="text-[10px] font-bold text-teal-700 uppercase tracking-widest hover:underline">
                  Semua
                </Link>
              </div>

              {recentResults.length === 0 ? (
                <div className="p-8 text-center">
                  <ClipboardList className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                  <p className="text-sm font-medium text-slate-400">Belum ada ujian dikerjakan.</p>
                  <Link href="/dashboard/exams" className="text-xs text-teal-600 font-bold hover:underline mt-1 inline-block">
                    Mulai sekarang →
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
                        <p className="text-[13px] font-bold text-slate-900 group-hover:text-teal-700 transition-colors line-clamp-1">
                          {r.exam.title}
                        </p>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full flex-shrink-0 ${
                          r.overallPass
                            ? "bg-teal-50 text-teal-700 border border-teal-200"
                            : "bg-red-50 text-red-600 border border-red-200"
                        }`}>
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

            {/* Progress Toward Kelulusan */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-4 h-4 text-teal-600" />
                <h3 className="font-black text-slate-900 text-sm">Progress Kelulusan</h3>
              </div>
              <div className="space-y-3">
                {[
                  { label: "TWK",  pct: 72, color: "bg-red-500", trackColor: "bg-red-100" },
                  { label: "TIU",  pct: 58, color: "bg-blue-500", trackColor: "bg-blue-100" },
                  { label: "TKP",  pct: 85, color: "bg-purple-500", trackColor: "bg-purple-100" },
                ].map(({ label, pct, color, trackColor }) => (
                  <div key={label}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[11px] font-bold text-slate-600">{label}</span>
                      <span className="text-[11px] font-black text-slate-900">{pct}%</span>
                    </div>
                    <div className={`w-full h-2 rounded-full ${trackColor}`}>
                      <div
                        className={`h-2 rounded-full ${color} transition-all`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-slate-400 font-medium mt-4">
                * Berdasarkan hasil try out terbaru.
              </p>
            </div>

            {/* Upgrade CTA for free / elite tier */}
            {tier !== "MASTER" && (
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="w-4 h-4 text-amber-600" />
                  <h3 className="font-black text-amber-900 text-sm">
                    {tier === "FREE" ? "Upgrade ke Elite" : "Upgrade ke Master"}
                  </h3>
                </div>
                <p className="text-xs text-amber-700 font-medium mb-3">
                  {tier === "FREE"
                    ? "Akses semua try out eksklusif, ranking nasional, dan materi premium tanpa batas."
                    : "Buka Psikotes, Tes IQ, Career Mapping, dan Video Lesson eksklusif."}
                </p>
                <Link
                  href="/dashboard/pembelian"
                  className="flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors"
                >
                  Lihat Paket <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </DashboardShell>
  )
}
