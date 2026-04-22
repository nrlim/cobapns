"use server"

import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth-guard"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ScoreTrendPoint {
  examTitle: string
  shortLabel: string    // "TO-1", "TO-2"…
  date: string          // ISO string
  totalScore: number
  scoreTWK: number
  scoreTIU: number
  scoreTKP: number
  overallPass: boolean
  timeTakenMinutes: number | null
}

export interface ActivityMetrics {
  totalExams: number
  totalAnswers: number
  correctAnswers: number
  incorrectAnswers: number
  studyStreakDays: number
  bestScore: number
  avgScore: number
}

export interface LeaderboardEntry {
  rank: number
  displayName: string   // masked, e.g. "A*** S***"
  institution: string   // anonymized tier
  highestScore: number
  totalExams: number
  isCurrentUser: boolean
}

export interface UserRankInfo {
  rank: number
  total: number
  percentile: number
  highestScore: number
}

export interface ExamHistoryRow {
  id: string
  examId: string
  examTitle: string
  submittedAt: string
  totalScore: number
  scoreTWK: number
  scoreTIU: number
  scoreTKP: number
  overallPass: boolean
  passTWK: boolean
  passTIU: boolean
  passTKP: boolean
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function maskName(name: string): string {
  return name
    .split(" ")
    .map((word) => (word.length <= 1 ? word : word[0] + "*".repeat(word.length - 1)))
    .join(" ")
}

function calcStreakDays(dates: Date[]): number {
  if (dates.length === 0) return 0
  const unique = Array.from(
    new Set(dates.map((d) => new Date(d).toDateString()))
  )
    .map((s) => new Date(s))
    .sort((a, b) => b.getTime() - a.getTime())

  let streak = 1
  const today = new Date().toDateString()
  const latest = unique[0].toDateString()
  // If student hasn't studied today or yesterday, streak is 0
  const yesterday = new Date(Date.now() - 86_400_000).toDateString()
  if (latest !== today && latest !== yesterday) return 0

  for (let i = 1; i < unique.length; i++) {
    const prev = unique[i - 1]
    const curr = unique[i]
    const diffDays = Math.round((prev.getTime() - curr.getTime()) / 86_400_000)
    if (diffDays === 1) streak++
    else break
  }
  return streak
}

// ─── getUserStatsTrend ────────────────────────────────────────────────────────
/**
 * Returns the authenticated user's score history + activity metrics.
 */
export async function getUserStatsTrend(): Promise<{
  trend: ScoreTrendPoint[]
  metrics: ActivityMetrics
  examHistory: ExamHistoryRow[]
}> {
  const session = await requireAuth()
  const userId = session.userId

  const [results, answers] = await Promise.all([
    prisma.examResult.findMany({
      where: { userId },
      orderBy: { submittedAt: "asc" },
      include: {
        exam: {
          select: { title: true, durationMinutes: true },
        },
      },
    }),
    prisma.userAnswer.findMany({
      where: { userId, optionId: { not: null } },
      include: {
        question: {
          select: {
            options: { select: { id: true, score: true } },
          },
        },
      },
    }),
  ])

  // Build trend
  const trend: ScoreTrendPoint[] = results.map((r, i) => ({
    examTitle: r.exam.title,
    shortLabel: `TO-${i + 1}`,
    date: r.submittedAt.toISOString(),
    totalScore: r.totalScore,
    scoreTWK: r.scoreTWK,
    scoreTIU: r.scoreTIU,
    scoreTKP: r.scoreTKP,
    overallPass: r.overallPass,
    timeTakenMinutes: r.exam.durationMinutes ?? null,
  }))

  // Correct answer count
  let correct = 0
  for (const ans of answers) {
    const maxScore = Math.max(...ans.question.options.map((o) => o.score))
    const selected = ans.question.options.find((o) => o.id === ans.optionId)
    if (selected && selected.score === maxScore && maxScore > 0) correct++
  }

  const metrics: ActivityMetrics = {
    totalExams: results.length,
    totalAnswers: answers.length,
    correctAnswers: correct,
    incorrectAnswers: answers.length - correct,
    studyStreakDays: calcStreakDays(results.map((r) => r.submittedAt)),
    bestScore: results.length > 0 ? Math.max(...results.map((r) => r.totalScore)) : 0,
    avgScore:
      results.length > 0
        ? Math.round(results.reduce((s, r) => s + r.totalScore, 0) / results.length)
        : 0,
  }

  const examHistory: ExamHistoryRow[] = [...results]
    .reverse()
    .map((r) => ({
      id: r.id,
      examId: r.examId,
      examTitle: r.exam.title,
      submittedAt: r.submittedAt.toISOString(),
      totalScore: r.totalScore,
      scoreTWK: r.scoreTWK,
      scoreTIU: r.scoreTIU,
      scoreTKP: r.scoreTKP,
      overallPass: r.overallPass,
      passTWK: r.passTWK,
      passTIU: r.passTIU,
      passTKP: r.passTKP,
    }))

  return { trend, metrics, examHistory }
}

// ─── getGlobalRanking ─────────────────────────────────────────────────────────
/**
 * Returns top-100 leaderboard by highest score per user,
 * plus the current user's rank info.
 */
export async function getGlobalRanking(): Promise<{
  leaderboard: LeaderboardEntry[]
  userRank: UserRankInfo | null
}> {
  const session = await requireAuth()
  const userId = session.userId

  // Group exam results by user, pick their highest totalScore
  const grouped = await prisma.examResult.groupBy({
    by: ["userId"],
    _max: { totalScore: true },
    _count: { id: true },
    orderBy: { _max: { totalScore: "desc" } },
    take: 100,
  })

  // Fetch display names for those users
  const userIds = grouped.map((g) => g.userId)
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true, subscriptionTier: true },
  })
  const userMap = new Map(users.map((u) => [u.id, u]))

  const instLabel: Record<string, string> = {
    FREE: "Pendaftar Umum",
    PRO: "Formasi Elite",
    PREMIUM: "Formasi Master",
  }

  const leaderboard: LeaderboardEntry[] = grouped.map((g, i) => {
    const u = userMap.get(g.userId)
    return {
      rank: i + 1,
      displayName: u ? maskName(u.name) : "Peserta ***",
      institution: u ? instLabel[u.subscriptionTier] ?? "Peserta Umum" : "Peserta Umum",
      highestScore: g._max.totalScore ?? 0,
      totalExams: g._count.id,
      isCurrentUser: g.userId === userId,
    }
  })

  // Current user rank (even if outside top-100)
  const allGrouped = await prisma.examResult.groupBy({
    by: ["userId"],
    _max: { totalScore: true },
    orderBy: { _max: { totalScore: "desc" } },
  })

  const userIdx = allGrouped.findIndex((g) => g.userId === userId)
  let userRank: UserRankInfo | null = null
  if (userIdx !== -1) {
    userRank = {
      rank: userIdx + 1,
      total: allGrouped.length,
      percentile: Math.round(((allGrouped.length - userIdx) / allGrouped.length) * 100),
      highestScore: allGrouped[userIdx]._max.totalScore ?? 0,
    }
  }

  return { leaderboard, userRank }
}
