import { cookies } from "next/headers"
import { verifySession } from "@/lib/session"
import { redirect } from "next/navigation"
import Link from "next/link"
import {
  TrendingUp,
  BarChart2,
  Trophy,
  Flame,
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight,
  Medal,
  Star,
  Crown,
  Users,
  Target,
} from "lucide-react"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { ScoreProgressChart, TimeAnalysisChart, ChartLegend } from "@/components/dashboard/statistics-charts"
import { getUserStatsTrend, getGlobalRanking } from "@/app/actions/statistics"
import type { LeaderboardEntry, UserRankInfo, ExamHistoryRow, ScoreTrendPoint, ActivityMetrics } from "@/app/actions/statistics"
import { prisma } from "@/lib/prisma"
import { FeedbackModal } from "@/components/shared/FeedbackModal"
import { MessageSquareHeart, Lock } from "lucide-react"

export const metadata = {
  title: "Statistik & Leaderboard – COBA PNS",
  description: "Pantau progres belajarmu dan bandingkan dengan peserta lain secara nasional.",
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(iso: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso))
}

function fmtDateShort(iso: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
  }).format(new Date(iso))
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function BentoMetric({
  icon: Icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ElementType
  label: string
  value: string | number
  sub: string
  accent: string
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${accent}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="text-3xl font-black text-slate-900 tracking-tight leading-none">{value}</div>
      <div className="text-[11px] text-slate-400 font-medium">{sub}</div>
    </div>
  )
}

function PodiumCard({
  entry,
  size,
}: {
  entry: LeaderboardEntry
  size: "large" | "medium" | "small"
}) {
  const rankConfig = {
    1: { icon: Crown, color: "text-amber-500", bg: "bg-amber-50 border-amber-200", badge: "bg-amber-500" },
    2: { icon: Medal, color: "text-slate-400", bg: "bg-slate-50 border-slate-200", badge: "bg-slate-400" },
    3: { icon: Star, color: "text-orange-400", bg: "bg-orange-50 border-orange-200", badge: "bg-orange-400" },
  }
  const cfg = rankConfig[entry.rank as 1 | 2 | 3]
  const IconComp = cfg.icon
  const avatarSize = size === "large" ? "w-14 h-14 text-xl" : size === "medium" ? "w-12 h-12 text-lg" : "w-10 h-10 text-base"
  const initials = entry.displayName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()

  return (
    <div
      className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl border ${cfg.bg} ${size === "large" ? "pb-6 pt-5" : "pb-4"
        } ${entry.isCurrentUser ? "ring-2 ring-blue-500 ring-offset-2" : ""}`}
    >
      {/* Rank badge */}
      <div className={`absolute -top-3 flex items-center justify-center w-7 h-7 rounded-full ${cfg.badge} text-white text-[10px] font-black shadow-md`}>
        #{entry.rank}
      </div>

      {/* Avatar */}
      <div className={`${avatarSize} rounded-full bg-gradient-to-br from-brand-blue-light to-brand-blue-deep flex items-center justify-center text-white font-black shadow-md`}>
        {initials}
      </div>

      <IconComp className={`w-4 h-4 ${cfg.color}`} />

      <div className="text-center">
        <p className={`font-black text-slate-900 ${size === "large" ? "text-sm" : "text-xs"}`}>
          {entry.displayName}
        </p>
        <p className="text-[10px] text-slate-400 font-medium mt-0.5">{entry.institution}</p>
      </div>

      <div className={`font-black text-brand-blue-deep ${size === "large" ? "text-xl" : "text-lg"}`}>
        {entry.highestScore}
      </div>
      <p className="text-[10px] text-slate-400 font-medium">{entry.totalExams} Latihan</p>

      {entry.isCurrentUser && (
        <span className="text-[9px] font-black uppercase tracking-widest text-brand-blue-deep bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
          Kamu
        </span>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function StatistikPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get("sipns-session")?.value
  const session = token ? await verifySession(token) : null
  if (!session) redirect("/login")

  const dbUser = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { subscriptionTier: true, subscriptionEnds: true, hasGivenFeedback: true },
  })

  // Calculate effective tier (consistent with other pages)
  const rawTier = dbUser?.subscriptionTier ?? "FREE"
  const effectiveTier = rawTier !== "FREE" && dbUser?.subscriptionEnds && new Date(dbUser.subscriptionEnds) < new Date()
    ? "FREE" 
    : rawTier

  const isFreeTier = effectiveTier === "FREE"
  const [statsData, rankData] = await Promise.all([
    getUserStatsTrend(),
    getGlobalRanking(),
  ])

  const { trend, metrics, examHistory }: { trend: ScoreTrendPoint[]; metrics: ActivityMetrics; examHistory: ExamHistoryRow[] } = statsData
  const { leaderboard, userRank }: { leaderboard: LeaderboardEntry[]; userRank: UserRankInfo | null } = rankData

  const needsFeedback = isFreeTier && !dbUser?.hasGivenFeedback && examHistory.length > 0

  const top3 = leaderboard.slice(0, 3)
  const rest = leaderboard.slice(3)

  // Find user's position inside top 100 list to highlight
  const userInTop100 = leaderboard.find((e) => e.isCurrentUser)

  if (needsFeedback) {
    return (
      <DashboardShell activeHref="/dashboard/statistik" user={{ name: session.name, role: session.role, tier: session.tier }}>
        <FeedbackModal hasGivenFeedback={false} isFreeTier={true} />
        <div className="min-h-[calc(100vh-56px)] md:min-h-[calc(100vh-72px)] w-full flex flex-col p-3 sm:p-4 md:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 flex flex-col xl:flex-row w-full flex-1 overflow-hidden">
            
            {/* ═══ LEFT — Hero gradient panel ═══════════════════════ */}
            <div className={`relative bg-gradient-to-br from-[#0F4FA8] via-[#1E73BE] to-[#1560a8] flex flex-col xl:flex-[1.2] overflow-hidden`}>
              {/* Ambient blobs */}
              <div className={`pointer-events-none absolute -top-24 -right-16 w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-blue-400/20 blur-3xl`} />
              <div className={`pointer-events-none absolute -bottom-24 -left-16 w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-cyan-400/10 blur-3xl`} />

              {/* Content */}
              <div className="relative z-10 p-6 sm:p-8 xl:p-12 flex flex-col h-full justify-center">
                <div className="flex items-start gap-3 sm:gap-4 mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center flex-shrink-0 border border-white/20 mt-0.5">
                    <MessageSquareHeart className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <p className={`text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-1 text-blue-200`}>
                      Akses Terkunci
                    </p>
                    <h1 className="text-xl sm:text-2xl md:text-3xl xl:text-4xl font-black tracking-tight text-white leading-tight">
                      Statistik & Leaderboard
                    </h1>
                  </div>
                </div>

                <p className="text-white/75 text-sm sm:text-base font-medium leading-relaxed mb-6 max-w-lg">
                  Buka fitur ini dan pantau terus perkembangan nilaimu serta bandingkan dengan ribuan pejuang PNS lainnya di seluruh Indonesia.
                </p>

                <div className="flex flex-wrap gap-2 mb-8">
                  {[
                    "Analisis Nilai Detail",
                    "Grafik Perkembangan",
                    "Ranking Nasional Real-time",
                    "Riwayat Try Out",
                  ].map((h) => (
                    <div key={h} className="flex items-center gap-1.5 rounded-full px-3 py-1.5 border backdrop-blur-md bg-white/8 border-white/10">
                      <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 text-blue-200" />
                      <span className="text-[11px] sm:text-xs text-white/90 font-semibold">{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ═══ RIGHT — Details panel ════════════════════════════ */}
            <div className="bg-slate-50/80 p-6 sm:p-8 xl:p-12 flex flex-col justify-center xl:flex-[1] xl:overflow-y-auto border-t xl:border-t-0 xl:border-l border-slate-100">
              <div className="flex items-start gap-3 mb-6">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-blue-100">
                  <Star className="w-4 h-4 sm:w-5 sm:h-5 text-[#1E73BE]" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black tracking-tight text-slate-900">
                    Eits, Sebentar! ✋
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5 leading-relaxed">
                    Khusus pengguna <strong className="text-slate-800">Free Tier</strong>, silakan berikan testimoni atau feedback kamu terlebih dahulu untuk membuka fitur ini.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-left mb-8">
                <Lock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs font-bold text-amber-900 leading-relaxed">
                  Popup testimoni akan muncul secara otomatis. Jika tidak muncul, silakan segarkan (refresh) halaman ini.
                </p>
              </div>

              <div className="space-y-3">
                <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                  Kenapa harus kasih testimoni?
                </p>
                <p className="text-xs text-slate-500 font-medium italic border-l-2 border-slate-200 pl-3">
                  "Feedback kamu sangat berarti dan membantu kami untuk terus menyediakan akses belajar gratis bagi pejuang PNS lainnya di seluruh Indonesia."
                </p>
              </div>
            </div>
            
          </div>
        </div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell activeHref="/dashboard/statistik" user={{ name: session.name, role: session.role, tier: session.tier }}>
      <div className="p-4 md:p-8 lg:p-10 w-full space-y-8">

        {/* ── Page Header ──────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-brand-blue-deep mb-1">
              Data &amp; Peringkat
            </p>
            <h2 className="text-2xl lg:text-3xl font-black tracking-tight text-slate-900">
              Statistik Belajar
            </h2>
            <p className="text-slate-500 font-medium mt-1 text-sm">
              Pantau kenaikan nilaimu dan lihat posisimu di antara seluruh pejuang PNS.
            </p>
          </div>
          {userRank && (
            <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-2xl px-4 py-3 flex-shrink-0">
              <Trophy className="w-4 h-4 text-brand-blue" />
              <div>
                <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Posisi Kamu</p>
                <p className="text-lg font-black text-brand-blue-deep leading-none">
                  #{userRank.rank}
                  <span className="text-xs font-medium text-blue-500 ml-1">dari {userRank.total} pejuang</span>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ── Bento Activity Metrics ───────────────────────────── */}
        <div>
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Ringkasan Latihan</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <BentoMetric
              icon={ClipboardCheck}
              label="Total Latihan"
              value={metrics.totalExams}
              sub="Latihan yang selesai"
              accent="bg-blue-50 border border-blue-100 text-brand-blue"
            />
            <BentoMetric
              icon={CheckCircle2}
              label="Total Benar"
              value={metrics.correctAnswers}
              sub={`dari ${metrics.totalAnswers} soal`}
              accent="bg-green-50 border border-green-100 text-green-600"
            />
            <BentoMetric
              icon={XCircle}
              label="Total Salah"
              value={metrics.incorrectAnswers}
              sub="ayo perbaiki!"
              accent="bg-red-50 border border-red-100 text-red-500"
            />
            <BentoMetric
              icon={Flame}
              label="Keaktifan"
              value={`${metrics.studyStreakDays}d`}
              sub="hari berturut-turut"
              accent="bg-amber-50 border border-amber-100 text-amber-600"
            />
            <BentoMetric
              icon={Target}
              label="Nilai Terbaik"
              value={metrics.bestScore}
              sub="poin tertinggi"
              accent="bg-violet-50 border border-violet-100 text-violet-600"
            />
            <BentoMetric
              icon={BarChart2}
              label="Nilai Rata-rata"
              value={metrics.avgScore}
              sub="per latihan"
              accent="bg-blue-50 border border-blue-100 text-blue-600"
            />
          </div>
        </div>

        {/* ── Historical Growth Charts ──────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Line Chart – Score Progress */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-brand-blue" />
              <h3 className="font-black text-slate-900 text-sm">Grafik Nilai</h3>
            </div>
            <p className="text-[11px] text-slate-400 font-medium mb-4">
              Perkembangan nilaimu setiap kali latihan. Garis putus-putus adalah batas minimal lulus.
            </p>
            <ScoreProgressChart trend={trend} />
            <ChartLegend />
          </div>

          {/* Bar Chart – Time Analysis */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-blue-500" />
              <h3 className="font-black text-slate-900 text-sm">Kecepatan Mengerjakan</h3>
            </div>
            <p className="text-[11px] text-slate-400 font-medium mb-4">
              Rata-rata waktu yang kamu habiskan di setiap latihan (menit).
            </p>
            <TimeAnalysisChart trend={trend} />
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-brand-blue flex-shrink-0" />
                <span className="text-[10px] font-bold text-slate-500">Lolos</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-slate-400 flex-shrink-0" />
                <span className="text-[10px] font-bold text-slate-500">Belum Lolos</span>
              </div>
            </div>
          </div>
        </div>



        {/* ── Exam History Table ────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
            <div>
              <h3 className="font-black text-slate-900 text-sm">Hasil Latihan</h3>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                {examHistory.length} latihan selesai
              </p>
            </div>
            <Link
              href="/dashboard/exams"
              className="text-[10px] font-black uppercase tracking-widest text-brand-blue-deep hover:underline flex items-center gap-1"
            >
              Cari Latihan <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          {examHistory.length === 0 ? (
            <div className="p-12 text-center">
              <ClipboardCheck className="w-10 h-10 text-slate-200 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-400">Kamu belum pernah latihan. Ayo mulai sekarang!</p>
              <Link
                href="/dashboard/exams"
                className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-brand-blue hover:underline"
              >
                Mulai Latihan Pertama →
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left text-[10px] font-black text-slate-400 uppercase tracking-widest px-6 py-3">Nama Latihan</th>
                    <th className="text-left text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 py-3 hidden sm:table-cell">Tanggal</th>
                    <th className="text-right text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 py-3">Skor</th>
                    <th className="text-right text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 py-3 hidden md:table-cell">TWK / TIU / TKP</th>
                    <th className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 py-3">Hasil</th>
                    <th className="px-6 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {examHistory.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/60 transition-colors group">
                      <td className="px-6 py-4">
                        <p className="text-[13px] font-bold text-slate-900 line-clamp-1">{row.examTitle}</p>
                        <p className="text-[10px] text-slate-400 font-medium sm:hidden mt-0.5">{fmtDateShort(row.submittedAt)}</p>
                      </td>
                      <td className="px-4 py-4 hidden sm:table-cell">
                        <span className="text-[12px] text-slate-500 font-medium">{fmtDate(row.submittedAt)}</span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span className="text-sm font-black text-slate-900">{row.totalScore}</span>
                      </td>
                      <td className="px-4 py-4 text-right hidden md:table-cell">
                        <span className="text-[11px] text-slate-500 font-medium font-mono tracking-tight">
                          <span className={row.passTWK ? "text-green-600" : "text-red-500"}>{row.scoreTWK}</span>
                          {" / "}
                          <span className={row.passTIU ? "text-green-600" : "text-red-500"}>{row.scoreTIU}</span>
                          {" / "}
                          <span className={row.passTKP ? "text-green-600" : "text-red-500"}>{row.scoreTKP}</span>
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-full border ${row.overallPass
                              ? "bg-blue-50 text-brand-blue-deep border-blue-200"
                              : "bg-red-50 text-red-600 border-red-200"
                            }`}
                        >
                          {row.overallPass ? (
                            <><CheckCircle2 className="w-2.5 h-2.5" /> LOLOS</>
                          ) : (
                            <><XCircle className="w-2.5 h-2.5" /> BELUM LOLOS</>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/dashboard/exams/${row.examId}/result/${row.id}`}
                          className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-brand-blue transition-colors group-hover:text-brand-blue whitespace-nowrap"
                        >
                          Lihat Detail <ChevronRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </DashboardShell>
  )
}
