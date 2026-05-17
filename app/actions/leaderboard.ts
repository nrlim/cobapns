"use server"

import { prisma } from "@/lib/prisma"
import { requireTier } from "@/lib/auth-guard"
import { unstable_cache } from "next/cache"
import { z } from "zod"

// ── Types ──────────────────────────────────────────────────────────────────

export type PeriodFilter = "weekly" | "monthly" | "alltime"
export type LeaderboardType = "skd" | "skb"
export type ExamFilter   = string | "global" // exam id or "global"

const LeaderboardParamsSchema = z.object({
  userId: z.string().min(1),
  leaderboardType: z.enum(["skd", "skb"]).optional().default("skd"),
  examFilter: z.string().min(1),
  period: z.enum(["weekly", "monthly", "alltime"]),
  instansiFilter: z.string().nullable(),
  page: z.number().int().min(0),
  pageSize: z.number().int().min(5).max(50),
})

export interface LeaderboardEntry {
  rank:           number
  userId:         string
  maskedName:     string
  initials:       string
  targetInstansi: string | null
  totalScore:     number
  accuracy:       number
  rankChange:     number // positive = up, negative = down, 0 = same
  attemptCount:   number
}

export interface LeaderboardResult {
  entries:       LeaderboardEntry[]
  totalCount:    number
  currentUser: {
    rank:         number
    totalScore:   number
    maskedName:   string
    initials:     string
  } | null
  exams: { id: string; title: string }[]
  instansiList: string[]
}

// ── Display helpers ─────────────────────────────────────────────────────────

function maskName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "Pejuang CPNS"
  if (parts.length === 1) return parts[0]
  return `${parts[0]} ${parts.slice(1).map((part) => `${part[0]?.toUpperCase()}.`).join(" ")}`
}

function normalizeInstansi(value: string | null) {
  const cleaned = value?.trim().replace(/\s+/g, " ")
  if (!cleaned || cleaned === "-" || cleaned.toLowerCase() === "null" || cleaned.toLowerCase() === "undefined") return null
  return cleaned
}

function isSameInstansi(a: string | null, b: string | null) {
  const left = normalizeInstansi(a)
  const right = normalizeInstansi(b)
  if (!left || !right) return false
  return left.localeCompare(right, "id-ID", { sensitivity: "accent" }) === 0
}

function getUniqueInstansiList(values: Array<string | null>) {
  const labels = new Map<string, string>()
  for (const value of values) {
    const normalized = normalizeInstansi(value)
    if (!normalized) continue
    const key = normalized.toLocaleLowerCase("id-ID")
    if (!labels.has(key) || normalized.length < labels.get(key)!.length) {
      labels.set(key, normalized)
    }
  }
  return Array.from(labels.values()).sort((a, b) => a.localeCompare(b, "id-ID"))
}


function getInitials(name: string): string {
  return name
    .trim()
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("")
}

function getPeriodFilter(period: PeriodFilter): Date | null {
  const now = new Date()
  if (period === "weekly") {
    const d = new Date(now)
    d.setDate(d.getDate() - 7)
    return d
  }
  if (period === "monthly") {
    const d = new Date(now)
    d.setMonth(d.getMonth() - 1)
    return d
  }
  return null // all-time
}

// ── Core ranking query (cached 5 min) ─────────────────────────────────────

const getRankedEntries = unstable_cache(
  async (
    leaderboardType: LeaderboardType,
    examFilter: ExamFilter,
    period: PeriodFilter,
    instansiFilter: string | null,
    page: number,
    pageSize: number,
  ): Promise<{ rows: LeaderboardEntry[]; total: number }> => {
    const since = getPeriodFilter(period)

    const examWhere = examFilter !== "global" ? { examId: examFilter } : {}
    const dateWhere = since ? { submittedAt: { gte: since } } : {}

    // Group by userId → max(totalScore) per user within filters
    const grouped = leaderboardType === "skb"
      ? await prisma.sKBExamResult.groupBy({
          by: ["userId"],
          where: { ...examWhere, ...dateWhere },
          _max: { totalScore: true, submittedAt: true },
          _count: { id: true },
          orderBy: { _max: { totalScore: "desc" } },
        })
      : await prisma.examResult.groupBy({
          by: ["userId"],
          where: { ...examWhere, ...dateWhere },
          _max: { totalScore: true, submittedAt: true },
          _count: { id: true },
          orderBy: { _max: { totalScore: "desc" } },
        })

    // Fetch user details (no email / phone — privacy enforced). Instansi is filtered after
    // normalization so duplicated dropdown labels caused by casing/extra spaces still work.
    const userIds = grouped.map((g) => g.userId)
    const users = await prisma.user.findMany({
      where: { id: { in: userIds }, isActive: true },
      select: { id: true, name: true, targetInstansi: true },
    })

    const userMap = new Map(users.map((u) => [u.id, u]))

    // Filter grouped rows to only include active users and selected instansi (if any)
    const filteredGrouped = grouped.filter((g) => {
      const user = userMap.get(g.userId)
      if (!user) return false
      return instansiFilter ? isSameInstansi(user.targetInstansi, instansiFilter) : true
    })
    const total = filteredGrouped.length

    // SKD uses pass-rate as consistency; SKB uses best-score ratio against practical max 350.
    const pageGrouped = filteredGrouped.slice(page * pageSize, page * pageSize + pageSize)
    const metrics = await Promise.all(
      pageGrouped.map(async (g) => {
        if (leaderboardType === "skb") {
          return { userId: g.userId, accuracy: Math.min(100, Math.round(((g._max.totalScore ?? 0) / 350) * 100)) }
        }

        const where = { userId: g.userId, ...examWhere, ...dateWhere }
        const [total, passed] = await Promise.all([
          prisma.examResult.count({ where }),
          prisma.examResult.count({ where: { ...where, overallPass: true } }),
        ])
        return { userId: g.userId, accuracy: total > 0 ? Math.round((passed / total) * 100) : 0 }
      })
    )
    const accuracyMap = new Map(metrics.map((p) => [p.userId, p.accuracy]))

    const rows: LeaderboardEntry[] = filteredGrouped
      .slice(page * pageSize, (page + 1) * pageSize)
      .map((g, idx) => {
        const user = userMap.get(g.userId)!
        const globalRank = page * pageSize + idx + 1
        return {
          rank:           globalRank,
          userId:         g.userId,
          maskedName:     maskName(user.name),
          initials:       getInitials(user.name),
          targetInstansi: user.targetInstansi,
          totalScore:     g._max.totalScore ?? 0,
          accuracy:       accuracyMap.get(g.userId) ?? 0,
          rankChange:     0, // static placeholder (would need historical snapshot for real diff)
          attemptCount:   g._count.id,
        }
      })

    return { rows, total }
  },
  ["leaderboard"],
  { revalidate: 300, tags: ["leaderboard"] } // 5-minute cache
)

// ── Public action ──────────────────────────────────────────────────────────

export async function getLeaderboard(params: {
  userId:        string
  leaderboardType?: LeaderboardType
  examFilter:    ExamFilter
  period:        PeriodFilter
  instansiFilter: string | null
  page:          number
  pageSize:      number
}): Promise<LeaderboardResult> {
  const session = await requireTier("ELITE")
  const parsed = LeaderboardParamsSchema.parse(params)
  const { examFilter, period, instansiFilter, page, pageSize, leaderboardType } = parsed
  const userId = session.userId
  const normalizedInstansiFilter = normalizeInstansi(instansiFilter)

  const [{ rows, total }, exams, allInstansi] = await Promise.all([
    getRankedEntries(leaderboardType, examFilter, period, normalizedInstansiFilter, page, pageSize),

    // Published exams for filter dropdown
    leaderboardType === "skb"
      ? prisma.sKBExam.findMany({
          where: { status: "PUBLISHED" },
          select: { id: true, title: true },
          orderBy: { createdAt: "desc" },
        })
      : prisma.exam.findMany({
          where: { status: "PUBLISHED" },
          select: { id: true, title: true },
          orderBy: { createdAt: "desc" },
        }),

    // Distinct instansi values for filter dropdown
    prisma.user.findMany({
      where: { targetInstansi: { not: null }, isActive: true },
      select: { targetInstansi: true },
      distinct: ["targetInstansi"],
    }),
  ])

  // Find current user's rank
  let currentUser: LeaderboardResult["currentUser"] = null

  const since = getPeriodFilter(period)
  const examWhere = examFilter !== "global" ? { examId: examFilter } : {}
  const dateWhere = since ? { submittedAt: { gte: since } } : {}

  const allGroupedRaw = leaderboardType === "skb"
    ? await prisma.sKBExamResult.groupBy({
        by: ["userId"],
        where: { ...examWhere, ...dateWhere },
        _max: { totalScore: true },
        orderBy: { _max: { totalScore: "desc" } },
      })
    : await prisma.examResult.groupBy({
        by: ["userId"],
        where: { ...examWhere, ...dateWhere },
        _max: { totalScore: true },
        orderBy: { _max: { totalScore: "desc" } },
      })

  const rankUsers = await prisma.user.findMany({
    where: { id: { in: allGroupedRaw.map((g) => g.userId) }, isActive: true },
    select: { id: true, targetInstansi: true },
  })
  const rankUserMap = new Map(rankUsers.map((user) => [user.id, user]))
  const allGrouped = allGroupedRaw.filter((g) => {
    const user = rankUserMap.get(g.userId)
    if (!user) return false
    return normalizedInstansiFilter ? isSameInstansi(user.targetInstansi, normalizedInstansiFilter) : true
  })

  const userRankIdx = allGrouped.findIndex((g) => g.userId === userId)

  if (userRankIdx !== -1) {
    const userInfo = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true },
    })
    currentUser = {
      rank:       userRankIdx + 1,
      totalScore: allGrouped[userRankIdx]._max.totalScore ?? 0,
      maskedName: userInfo ? maskName(userInfo.name) : "Anda",
      initials:   userInfo ? getInitials(userInfo.name) : "?",
    }
  }

  return {
    entries:     rows,
    totalCount:  total,
    currentUser,
    exams:       exams.map((e) => ({ id: e.id, title: e.title })),
    instansiList: getUniqueInstansiList(allInstansi.map((u) => u.targetInstansi)),
  }
}
