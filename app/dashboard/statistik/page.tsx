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
        } ${entry.isCurrentUser ? "ring-2 ring-teal-500 ring-offset-2" : ""}`}
    >
      {/* Rank badge */}
      <div className={`absolute -top-3 flex items-center justify-center w-7 h-7 rounded-full ${cfg.badge} text-white text-[10px] font-black shadow-md`}>
        #{entry.rank}
      </div>

      {/* Avatar */}
      <div className={`${avatarSize} rounded-full bg-gradient-to-br from-teal-400 to-teal-700 flex items-center justify-center text-white font-black shadow-md`}>
        {initials}
      </div>

      <IconComp className={`w-4 h-4 ${cfg.color}`} />

      <div className="text-center">
        <p className={`font-black text-slate-900 ${size === "large" ? "text-sm" : "text-xs"}`}>
          {entry.displayName}
        </p>
        <p className="text-[10px] text-slate-400 font-medium mt-0.5">{entry.institution}</p>
      </div>

      <div className={`font-black text-teal-700 ${size === "large" ? "text-xl" : "text-lg"}`}>
        {entry.highestScore}
      </div>
      <p className="text-[10px] text-slate-400 font-medium">{entry.totalExams} Try Out</p>

      {entry.isCurrentUser && (
        <span className="text-[9px] font-black uppercase tracking-widest text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full">
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

  const [statsData, rankData] = await Promise.all([
    getUserStatsTrend(),
    getGlobalRanking(),
  ])

  const { trend, metrics, examHistory }: { trend: ScoreTrendPoint[]; metrics: ActivityMetrics; examHistory: ExamHistoryRow[] } = statsData
  const { leaderboard, userRank }: { leaderboard: LeaderboardEntry[]; userRank: UserRankInfo | null } = rankData

  const top3 = leaderboard.slice(0, 3)
  const rest = leaderboard.slice(3)

  // Find user's position inside top 100 list to highlight
  const userInTop100 = leaderboard.find((e) => e.isCurrentUser)

  return (
    <DashboardShell activeHref="/dashboard/statistik" user={{ name: session.name, role: session.role, tier: session.tier }}>
      <div className="p-4 md:p-8 lg:p-10 w-full space-y-8">

        {/* ── Page Header ──────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-teal-700 mb-1">
              Statistik &amp; Peringkat
            </p>
            <h2 className="text-2xl lg:text-3xl font-black tracking-tight text-slate-900">
              Data &amp; Statistik
            </h2>
            <p className="text-slate-500 font-medium mt-1 text-sm">
              Pantau pertumbuhan skormu dan posisimu di antara peserta nasional.
            </p>
          </div>
          {userRank && (
            <div className="flex items-center gap-2 bg-teal-50 border border-teal-200 rounded-2xl px-4 py-3 flex-shrink-0">
              <Trophy className="w-4 h-4 text-teal-600" />
              <div>
                <p className="text-[10px] font-black text-teal-500 uppercase tracking-widest">Peringkatmu</p>
                <p className="text-lg font-black text-teal-800 leading-none">
                  #{userRank.rank}
                  <span className="text-xs font-medium text-teal-500 ml-1">dari {userRank.total}</span>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ── Bento Activity Metrics ───────────────────────────── */}
        <div>
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Ringkasan Aktivitas</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <BentoMetric
              icon={ClipboardCheck}
              label="Total Ujian"
              value={metrics.totalExams}
              sub="Try Out diselesaikan"
              accent="bg-teal-50 border border-teal-100 text-teal-600"
            />
            <BentoMetric
              icon={CheckCircle2}
              label="Jawaban Benar"
              value={metrics.correctAnswers}
              sub={`dari ${metrics.totalAnswers} soal`}
              accent="bg-green-50 border border-green-100 text-green-600"
            />
            <BentoMetric
              icon={XCircle}
              label="Jawaban Salah"
              value={metrics.incorrectAnswers}
              sub="perlu ditingkatkan"
              accent="bg-red-50 border border-red-100 text-red-500"
            />
            <BentoMetric
              icon={Flame}
              label="Study Streak"
              value={`${metrics.studyStreakDays}d`}
              sub="hari berturut-turut"
              accent="bg-amber-50 border border-amber-100 text-amber-600"
            />
            <BentoMetric
              icon={Target}
              label="Skor Tertinggi"
              value={metrics.bestScore}
              sub="poin terbaik"
              accent="bg-violet-50 border border-violet-100 text-violet-600"
            />
            <BentoMetric
              icon={BarChart2}
              label="Rata-rata Skor"
              value={metrics.avgScore}
              sub="per Try Out"
              accent="bg-blue-50 border border-blue-100 text-blue-600"
            />
          </div>
        </div>

        {/* ── Historical Growth Charts ──────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Line Chart – Score Progress */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-teal-600" />
              <h3 className="font-black text-slate-900 text-sm">Progress Skor</h3>
            </div>
            <p className="text-[11px] text-slate-400 font-medium mb-4">
              Perjalanan skor dari setiap Try Out — garis putus-putus = ambang batas lolos.
            </p>
            <ScoreProgressChart trend={trend} />
            <ChartLegend />
          </div>

          {/* Bar Chart – Time Analysis */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-blue-500" />
              <h3 className="font-black text-slate-900 text-sm">Durasi Ujian</h3>
            </div>
            <p className="text-[11px] text-slate-400 font-medium mb-4">
              Rata-rata waktu pengerjaan per Try Out (menit).
            </p>
            <TimeAnalysisChart trend={trend} />
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-teal-600 flex-shrink-0" />
                <span className="text-[10px] font-bold text-slate-500">Lulus</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-slate-400 flex-shrink-0" />
                <span className="text-[10px] font-bold text-slate-500">Tidak Lulus</span>
              </div>
            </div>
          </div>
        </div>



        {/* ── Exam History Table ────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
            <div>
              <h3 className="font-black text-slate-900 text-sm">Riwayat Try Out</h3>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                {examHistory.length} ujian diselesaikan
              </p>
            </div>
            <Link
              href="/dashboard/exams"
              className="text-[10px] font-black uppercase tracking-widest text-teal-700 hover:underline flex items-center gap-1"
            >
              Ujian Baru <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          {examHistory.length === 0 ? (
            <div className="p-12 text-center">
              <ClipboardCheck className="w-10 h-10 text-slate-200 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-400">Belum ada riwayat ujian.</p>
              <Link
                href="/dashboard/exams"
                className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-teal-600 hover:underline"
              >
                Mulai Try Out pertamamu →
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left text-[10px] font-black text-slate-400 uppercase tracking-widest px-6 py-3">Nama Try Out</th>
                    <th className="text-left text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 py-3 hidden sm:table-cell">Tanggal</th>
                    <th className="text-right text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 py-3">Total</th>
                    <th className="text-right text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 py-3 hidden md:table-cell">TWK / TIU / TKP</th>
                    <th className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 py-3">Status</th>
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
                              ? "bg-teal-50 text-teal-700 border-teal-200"
                              : "bg-red-50 text-red-600 border-red-200"
                            }`}
                        >
                          {row.overallPass ? (
                            <><CheckCircle2 className="w-2.5 h-2.5" /> LULUS</>
                          ) : (
                            <><XCircle className="w-2.5 h-2.5" /> GAGAL</>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/dashboard/exams/${row.examId}/result/${row.id}`}
                          className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-teal-600 transition-colors group-hover:text-teal-600 whitespace-nowrap"
                        >
                          Review <ChevronRight className="w-3 h-3" />
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
