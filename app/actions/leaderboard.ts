"use server"

import { prisma } from "@/lib/prisma"
import { unstable_cache } from "next/cache"

// ── Types ──────────────────────────────────────────────────────────────────

export type PeriodFilter = "weekly" | "monthly" | "alltime"
export type ExamFilter   = string | "global" // exam id or "global"

export interface LeaderboardEntry {
  rank:           number
  userId:         string
  maskedName:     string
  initials:       string
  targetInstansi: string | null
  totalScore:     number
  accuracy:       number
  rankChange:     number // positive = up, negative = down, 0 = same
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
  return name
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
    examFilter: ExamFilter,
    period: PeriodFilter,
    instansiFilter: string | null,
    page: number,
    pageSize: number,
  ): Promise<{ rows: LeaderboardEntry[]; total: number }> => {
    const since = getPeriodFilter(period)

    const examWhere =
      examFilter !== "global" ? { examId: examFilter } : {}
    const dateWhere = since ? { submittedAt: { gte: since } } : {}

    // Group by userId → max(totalScore) per user within filters
    const grouped = await prisma.examResult.groupBy({
      by: ["userId"],
      where: { ...examWhere, ...dateWhere },
      _max: { totalScore: true, submittedAt: true },
      _count: { id: true },
      orderBy: { _max: { totalScore: "desc" } },
    })

    // Fetch user details (no email / phone — privacy enforced)
    const userIds = grouped.map((g) => g.userId)
    const users = await prisma.user.findMany({
      where: {
        id: { in: userIds },
        isActive: true,
        ...(instansiFilter ? { targetInstansi: instansiFilter } : {}),
      },
      select: {
        id: true,
        name: true,
        targetInstansi: true,
      },
    })

    const userMap = new Map(users.map((u) => [u.id, u]))

    // Filter grouped rows to only include users that passed the instansi filter
    const filteredGrouped = grouped.filter((g) => userMap.has(g.userId))
    const total = filteredGrouped.length

    // Calculate average accuracy for each user
    const accuracyData = await prisma.userAnswer.groupBy({
      by: ["userId"],
      where: { userId: { in: filteredGrouped.map((g) => g.userId) } },
      _count: { id: true },
    })
    // We'll compute accuracy as (correct answers / total answers) * 100
    // Since we don't have isCorrect stored directly, we approximate from totalScore / max possible
    // Use a simpler heuristic: passRate from overallPass
    const passRates = await Promise.all(
      filteredGrouped.slice(page * pageSize, page * pageSize + pageSize).map(async (g) => {
        const [total, passed] = await Promise.all([
          prisma.examResult.count({ where: { userId: g.userId } }),
          prisma.examResult.count({ where: { userId: g.userId, overallPass: true } }),
        ])
        return {
          userId: g.userId,
          accuracy: total > 0 ? Math.round((passed / total) * 100) : 0,
        }
      })
    )
    const accuracyMap = new Map(passRates.map((p) => [p.userId, p.accuracy]))

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
  examFilter:    ExamFilter
  period:        PeriodFilter
  instansiFilter: string | null
  page:          number
  pageSize:      number
}): Promise<LeaderboardResult> {
  const { userId, examFilter, period, instansiFilter, page, pageSize } = params

  const [{ rows, total }, exams, allInstansi] = await Promise.all([
    getRankedEntries(examFilter, period, instansiFilter, page, pageSize),

    // Published exams for filter dropdown
    prisma.exam.findMany({
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

  const allGrouped = await prisma.examResult.groupBy({
    by: ["userId"],
    where: { ...examWhere, ...dateWhere },
    _max: { totalScore: true },
    orderBy: { _max: { totalScore: "desc" } },
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
    instansiList: allInstansi
      .map((u) => u.targetInstansi!)
      .filter(Boolean)
      .sort(),
  }
}
