"use client"

import { useState, useTransition, useCallback } from "react"
import {
  Trophy,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronLeft,
  ChevronRight,
  Filter,
  Star,
  Medal,
  Eye,
  Crown,
  Users,
  Calendar,
  Building2,
  LayoutList,
  Loader2,
  ClipboardList,
  BookOpenCheck,
} from "lucide-react"
import type { LeaderboardResult, PeriodFilter, ExamFilter, LeaderboardType } from "@/app/actions/leaderboard"
import { getLeaderboard } from "@/app/actions/leaderboard"

// ── Helpers ────────────────────────────────────────────────────────────────

const RANK_COLORS = {
  1: { bg: "from-amber-400 to-yellow-300",  ring: "ring-amber-400",  text: "text-amber-700",  icon: Crown,  badge: "bg-amber-400 text-white"  },
  2: { bg: "from-slate-400 to-slate-300",   ring: "ring-slate-400",  text: "text-slate-600",  icon: Medal,  badge: "bg-slate-400 text-white"  },
  3: { bg: "from-orange-500 to-amber-400",  ring: "ring-orange-400", text: "text-orange-700", icon: Medal,  badge: "bg-orange-500 text-white" },
}

const PERIOD_LABELS: { value: PeriodFilter; label: string }[] = [
  { value: "weekly",  label: "Mingguan" },
  { value: "monthly", label: "Bulanan" },
  { value: "alltime", label: "All-Time" },
]

const TYPE_LABELS: { value: LeaderboardType; label: string; Icon: typeof ClipboardList }[] = [
  { value: "skd", label: "SKD", Icon: ClipboardList },
  { value: "skb", label: "SKB", Icon: BookOpenCheck },
]

function RankBadge({ rank }: { rank: number }) {
  const color = RANK_COLORS[rank as keyof typeof RANK_COLORS]
  if (!color) {
    return (
      <span className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-black text-slate-600">
        {rank}
      </span>
    )
  }
  const Icon = color.icon
  return (
    <span
      className={`w-8 h-8 rounded-full bg-gradient-to-br ${color.bg} flex items-center justify-center shadow-md ring-2 ${color.ring}`}
    >
      <Icon className="w-4 h-4 text-white" strokeWidth={2.5} />
    </span>
  )
}

function RankChangeIcon({ change }: { change: number }) {
  if (change > 0) return <TrendingUp  className="w-3.5 h-3.5 text-emerald-500" />
  if (change < 0) return <TrendingDown className="w-3.5 h-3.5 text-red-400"   />
  return <Minus className="w-3.5 h-3.5 text-slate-300" />
}

function Avatar({ initials, rank }: { initials: string; rank?: number }) {
  const colors: Record<string, string> = {
    "1": "bg-gradient-to-br from-amber-400 to-yellow-300 text-white",
    "2": "bg-gradient-to-br from-slate-400 to-slate-300 text-white",
    "3": "bg-gradient-to-br from-orange-500 to-amber-400 text-white",
  }
  const fallback = "bg-blue-100 text-brand-blue-deep"
  return (
    <div
      className={`rounded-full flex items-center justify-center font-black text-xs select-none ${
        rank && rank <= 3 ? colors[String(rank)] : fallback
      }`}
    >
      {initials}
    </div>
  )
}

// ── Podium ──────────────────────────────────────────────────────────────────

function PodiumCard({
  entry,
  highlight,
}: {
  entry: LeaderboardResult["entries"][number]
  highlight?: boolean
}) {
  const rank  = entry.rank
  const color = RANK_COLORS[rank as keyof typeof RANK_COLORS]!
  const Icon  = color.icon

  return (
    <div
      className={`relative flex flex-col items-center gap-3 px-6 py-6 rounded-2xl border shadow-md transition-transform hover:-translate-y-0.5 ${
        rank === 1
          ? "bg-gradient-to-b from-amber-50 to-white border-amber-200 scale-105 shadow-amber-100"
          : "bg-white border-slate-100"
      }`}
    >
      {/* top performer badge */}
      <span
        className={`absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase tracking-widest px-3 py-0.5 rounded-full ${color.badge} shadow`}
      >
        {rank === 1 ? "Top Performer" : rank === 2 ? "Runner-Up" : "3rd Place"}
      </span>

      {/* Avatar */}
      <div
        className={`w-16 h-16 ring-4 ${color.ring} rounded-full bg-gradient-to-br ${color.bg} flex items-center justify-center text-white font-black text-xl shadow-lg`}
      >
        {entry.initials}
      </div>

      {/* Rank icon */}
      <div className="flex items-center gap-1">
        <Icon className={`w-4 h-4 ${color.text}`} strokeWidth={2.5} />
        <span className={`text-xs font-black ${color.text}`}>#{rank}</span>
      </div>

      {/* Name */}
      <p className="text-sm font-black text-slate-900 text-center leading-tight">{entry.maskedName}</p>

      {/* Instansi */}
      {entry.targetInstansi && (
        <span className="text-[10px] font-bold text-slate-400 text-center line-clamp-1 max-w-[120px]">
          🏛 {entry.targetInstansi}
        </span>
      )}

      {/* Score */}
      <div className="text-center">
        <p className="text-2xl font-black text-brand-blue-deep">{entry.totalScore}</p>
        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Total Skor</p>
      </div>

      {/* Accuracy */}
      <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
        <Star className="w-3 h-3 text-brand-blue-light" />
        Konsistensi {entry.accuracy}%
      </div>
    </div>
  )
}

// ── Filter Bar ──────────────────────────────────────────────────────────────

interface FilterBarProps {
  leaderboardType: LeaderboardType
  period:        PeriodFilter
  examFilter:    ExamFilter
  instansiFilter: string | null
  exams:         { id: string; title: string }[]
  instansiList:  string[]
  onChange:      (f: { leaderboardType?: LeaderboardType; period?: PeriodFilter; examFilter?: ExamFilter; instansiFilter?: string | null }) => void
  loading:       boolean
}

function FilterBar({ leaderboardType, period, examFilter, instansiFilter, exams, instansiList, onChange, loading }: FilterBarProps) {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex flex-wrap gap-3 items-center">
      <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest shrink-0">
        <Filter className="w-3.5 h-3.5" />
        Filter
      </div>

      {/* Type */}
      <div className="flex rounded-xl overflow-hidden border border-slate-200 shrink-0">
        {TYPE_LABELS.map(({ value, label, Icon }) => (
          <button
            key={value}
            onClick={() => onChange({ leaderboardType: value, examFilter: "global" })}
            className={`px-3 py-1.5 text-xs font-bold transition-all flex items-center gap-1 ${
              leaderboardType === value
                ? "bg-brand-blue text-white"
                : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            <Icon className="w-3.5 h-3.5" /> {label}
          </button>
        ))}
      </div>

      {/* Period */}
      <div className="flex rounded-xl overflow-hidden border border-slate-200 shrink-0">
        {PERIOD_LABELS.map((p) => (
          <button
            key={p.value}
            onClick={() => onChange({ period: p.value })}
            className={`px-3 py-1.5 text-xs font-bold transition-all flex items-center gap-1 ${
              period === p.value
                ? "bg-brand-blue text-white"
                : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Exam / Global */}
      <div className="flex items-center gap-2 shrink-0">
        <LayoutList className="w-3.5 h-3.5 text-slate-400" />
        <select
          value={examFilter}
          onChange={(e) => onChange({ examFilter: e.target.value as ExamFilter })}
          className="text-xs font-bold text-slate-700 bg-slate-100 border-none rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
        >
          <option value="global">Semua Try Out {leaderboardType.toUpperCase()}</option>
          {exams.map((e) => (
            <option key={e.id} value={e.id}>{e.title}</option>
          ))}
        </select>
      </div>

      {/* Instansi */}
      <div className="flex items-center gap-2 shrink-0">
        <Building2 className="w-3.5 h-3.5 text-slate-400" />
        <select
          value={instansiFilter ?? ""}
          onChange={(e) => onChange({ instansiFilter: e.target.value || null })}
          className="text-xs font-bold text-slate-700 bg-slate-100 border-none rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer max-w-[220px]"
          aria-label="Filter instansi target"
        >
          <option value="">Semua Instansi</option>
          {instansiList.map((inst) => (
            <option key={inst.toLocaleLowerCase("id-ID")} value={inst}>{inst}</option>
          ))}
        </select>
      </div>

      {loading && <Loader2 className="w-4 h-4 text-blue-500 animate-spin ml-auto" />}
    </div>
  )
}

// ── Ranking Table ───────────────────────────────────────────────────────────

function RankingTable({
  entries,
  currentUserId,
  leaderboardType,
}: {
  entries: LeaderboardResult["entries"]
  currentUserId: string
  leaderboardType: LeaderboardType
}) {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-[44px_1fr_auto_auto_auto_auto] gap-2 px-5 py-3 bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
        <span className="text-center">#</span>
        <span>Peserta</span>
        <span className="hidden md:block">Instansi</span>
        <span className="text-right">Skor</span>
        <span className="hidden sm:block text-right">{leaderboardType === "skb" ? "Indeks" : "Lulus"}</span>
        <span className="hidden sm:block text-center">Aksi</span>
      </div>

      {/* Rows */}
      <div className="divide-y divide-slate-50">
        {entries.map((entry) => {
          const isSelf = entry.userId === currentUserId
          return (
            <div
              key={entry.userId}
              className={`grid grid-cols-[44px_1fr_auto_auto_auto_auto] gap-2 px-5 py-3.5 items-center transition-colors ${
                isSelf
                  ? "bg-blue-50/50 border-l-2 border-blue-500"
                  : "hover:bg-slate-50/70"
              }`}
            >
              {/* Rank */}
              <div className="flex flex-col items-center gap-0.5">
                <RankBadge rank={entry.rank} />
                <RankChangeIcon change={entry.rankChange} />
              </div>

              {/* Student */}
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-9 h-9 flex-shrink-0 rounded-full ring-2 flex items-center justify-center font-black text-xs ${
                    entry.rank <= 3
                      ? `ring-${["amber", "slate", "orange"][entry.rank - 1]}-400 bg-gradient-to-br ${RANK_COLORS[entry.rank as 1|2|3].bg} text-white`
                      : "ring-slate-100 bg-blue-100 text-brand-blue-deep"
                  }`}
                >
                  {entry.initials}
                </div>
                <div className="min-w-0">
                  <p className={`text-sm font-bold truncate ${isSelf ? "text-brand-blue-deep" : "text-slate-800"}`}>
                    {entry.maskedName}
                    {isSelf && <span className="ml-2 text-[10px] font-black text-blue-500 uppercase tracking-widest">Anda</span>}
                  </p>
                  <p className="text-[10px] font-bold text-slate-400">
                    {entry.attemptCount} percobaan {leaderboardType.toUpperCase()}
                  </p>
                </div>
              </div>

              {/* Instansi */}
              <div className="hidden md:block max-w-[160px]">
                {entry.targetInstansi ? (
                  <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full line-clamp-1">
                    {entry.targetInstansi}
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-300 italic">—</span>
                )}
              </div>

              {/* Score */}
              <div className="text-right">
                <p className="text-base font-black text-slate-900">{entry.totalScore}</p>
                <p className="text-[10px] text-slate-400 font-medium">poin</p>
              </div>

              {/* Accuracy */}
              <div className="hidden sm:block text-right">
                <p className="text-sm font-black text-slate-700">{entry.accuracy}%</p>
                <p className="text-[10px] text-slate-400 font-medium">{leaderboardType === "skb" ? "performa" : "lulus"}</p>
              </div>

              {/* Action */}
              <div className="hidden sm:flex justify-center">
                <button
                  disabled
                  title="Profil publik (segera hadir)"
                  className="flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-lg transition-colors cursor-not-allowed"
                >
                  <Eye className="w-3 h-3" />
                  Profil
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {entries.length === 0 && (
        <div className="py-16 text-center">
          <Trophy className="w-10 h-10 text-slate-200 mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-400">Belum ada data peringkat untuk filter ini.</p>
          <p className="text-xs text-slate-300 mt-1">Coba ubah filter periode atau kategori ujian.</p>
        </div>
      )}
    </div>
  )
}

// ── Sticky Personal Rank Bar ────────────────────────────────────────────────

function PersonalRankBar({
  rank,
  total,
  score,
  name,
}: {
  rank: number
  total: number
  score: number
  name: string
}) {
  if (rank <= 10) return null // Only show if not already visible at top
  return (
    <div className="fixed bottom-20 md:bottom-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none w-full max-w-2xl px-4">
      <div className="bg-blue-900/95 backdrop-blur-md text-white rounded-2xl px-5 py-3 flex items-center gap-4 shadow-2xl border border-brand-blue-deep/50 pointer-events-auto">
        <div className="w-9 h-9 rounded-full bg-brand-blue-deep flex items-center justify-center text-sm font-black flex-shrink-0">
          {name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-black text-blue-300 uppercase tracking-widest">Posisi Anda Saat Ini</p>
          <p className="text-sm font-bold text-white">
            Peringkat <span className="text-amber-400">#{rank}</span> dari{" "}
            <span className="text-blue-200">{total.toLocaleString("id-ID")}</span> peserta
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-lg font-black text-blue-300">{score}</p>
          <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">poin</p>
        </div>
      </div>
    </div>
  )
}

// ── Main Client ─────────────────────────────────────────────────────────────

export interface LeaderboardClientProps {
  initial:       LeaderboardResult
  currentUserId: string
  pageSize?:     number
}

export function LeaderboardClient({
  initial,
  currentUserId,
  pageSize = 20,
}: LeaderboardClientProps) {
  const [data,           setData]           = useState<LeaderboardResult>(initial)
  const [leaderboardType, setLeaderboardType] = useState<LeaderboardType>("skd")
  const [period,         setPeriod]         = useState<PeriodFilter>("alltime")
  const [examFilter,     setExamFilter]     = useState<ExamFilter>("global")
  const [instansiFilter, setInstansiFilter] = useState<string | null>(null)
  const [page,           setPage]           = useState(0)
  const [isPending,      startTransition]   = useTransition()

  const totalPages = Math.ceil(data.totalCount / pageSize)

  const reload = useCallback(
    (opts: {
      leaderboardType?: LeaderboardType
      period?: PeriodFilter
      examFilter?: ExamFilter
      instansiFilter?: string | null
      page?: number
    }) => {
      const nextType           = opts.leaderboardType ?? leaderboardType
      const isTypeSwitch       = opts.leaderboardType !== undefined && opts.leaderboardType !== leaderboardType
      const nextPeriod         = opts.period         ?? period
      const nextExam           = isTypeSwitch ? "global" : (opts.examFilter ?? examFilter)
      const nextInstansi       = opts.instansiFilter !== undefined ? opts.instansiFilter : instansiFilter
      const nextPage           = opts.page           ?? 0

      setLeaderboardType(nextType)
      setPeriod(nextPeriod)
      setExamFilter(nextExam)
      setInstansiFilter(nextInstansi)
      setPage(nextPage)

      startTransition(async () => {
        const result = await getLeaderboard({
          userId:          currentUserId,
          leaderboardType: nextType,
          examFilter:      nextExam,
          period:          nextPeriod,
          instansiFilter:  nextInstansi,
          page:            nextPage,
          pageSize,
        })
        setData(result)
      })
    },
    [leaderboardType, period, examFilter, instansiFilter, currentUserId, pageSize]
  )

  const podiumEntries = data.entries.filter((e) => e.rank <= 3)
  // Re-order podium: 2nd, 1st, 3rd (visual podium order)
  const podiumOrder = [
    podiumEntries.find((e) => e.rank === 2),
    podiumEntries.find((e) => e.rank === 1),
    podiumEntries.find((e) => e.rank === 3),
  ].filter(Boolean) as LeaderboardResult["entries"]

  return (
    <div className="space-y-6 relative">
      {/* ── Filter Bar ── */}
      <FilterBar
        leaderboardType={leaderboardType}
        period={period}
        examFilter={examFilter}
        instansiFilter={instansiFilter}
        exams={data.exams}
        instansiList={data.instansiList}
        onChange={(f) => reload({ ...f })}
        loading={isPending}
      />

      {/* ── Stats Summary ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { icon: Users,    label: "Total Peserta",   value: data.totalCount.toLocaleString("id-ID") },
          { icon: Trophy,   label: leaderboardType === "skb" ? "Skor SKB Tertinggi" : "Skor SKD Tertinggi",  value: data.entries[0]?.totalScore ?? "—" },
          { icon: Calendar, label: "Periode",          value: PERIOD_LABELS.find((p) => p.value === period)!.label },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
              <Icon className="w-4 h-4 text-brand-blue" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
              <p className="text-base font-black text-slate-900">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Podium ── */}
      {podiumOrder.length > 0 && page === 0 && (
        <div>
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            Top 3 Peringkat
          </h3>
          <div
            className={`grid gap-4 ${
              podiumOrder.length === 3 ? "grid-cols-3" : `grid-cols-${podiumOrder.length}`
            }`}
          >
            {podiumOrder.map((entry) => (
              <PodiumCard key={entry.userId} entry={entry} />
            ))}
          </div>
        </div>
      )}

      {/* ── Table ── */}
      <div>
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
          <LayoutList className="w-3.5 h-3.5 text-brand-blue-light" />
          Peringkat Lengkap
          {instansiFilter && (
            <span className="ml-1 text-[10px] font-bold text-brand-blue bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
              {instansiFilter}
            </span>
          )}
        </h3>
        <div className={`transition-opacity duration-200 ${isPending ? "opacity-50 pointer-events-none" : "opacity-100"}`}>
          <RankingTable entries={data.entries} currentUserId={currentUserId} leaderboardType={leaderboardType} />
        </div>
      </div>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs font-bold text-slate-400">
            Halaman {page + 1} dari {totalPages} ({data.totalCount.toLocaleString("id-ID")} peserta)
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => reload({ page: page - 1 })}
              disabled={page === 0 || isPending}
              className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => reload({ page: page + 1 })}
              disabled={page >= totalPages - 1 || isPending}
              className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── Sticky Personal Rank Bar ── */}
      {data.currentUser && data.currentUser.rank > 10 && (
        <PersonalRankBar
          rank={data.currentUser.rank}
          total={data.totalCount}
          score={data.currentUser.totalScore}
          name={data.currentUser.maskedName}
        />
      )}
    </div>
  )
}
