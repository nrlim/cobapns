"use server"

import { prisma } from "@/lib/prisma"

// ─── Types ───────────────────────────────────────────────────────────────────

export interface CategoryStats {
  category: "TWK" | "TIU" | "TKP"
  average: number          // e.g. 72.5
  passRate: number         // 0-100 %
  totalQuestions: number
  correctAnswers: number
  masteryPct: number       // correct / total * 100
}

export interface SubCategoryMastery {
  subCategory: string
  category: "TWK" | "TIU" | "TKP"
  total: number
  correct: number
  masteryPct: number
}

export interface TrendPoint {
  examTitle: string
  date: string            // ISO date string
  scoreTWK: number
  scoreTIU: number
  scoreTKP: number
  totalScore: number
  overallPass: boolean
}

export interface PassingGrade {
  totalTaken: number
  passed: number
  failed: number
  passRate: number
  passTWK: number
  passTIU: number
  passTKP: number
}

export interface PerformanceAnalytics {
  avgTWK: number
  avgTIU: number
  avgTKP: number
  avgTotal: number
  passingGrade: PassingGrade
  trend: TrendPoint[]
  subCategoryMastery: SubCategoryMastery[]
  weakestSubCategory: SubCategoryMastery | null
  strongestSubCategory: SubCategoryMastery | null
  hasData: boolean
  rankInfo: { rank: number; total: number; percentile: number } | null
}

// ─── Main Action ─────────────────────────────────────────────────────────────

export async function getPerformanceAnalytics(
  userId: string
): Promise<PerformanceAnalytics> {
  // Run all expensive database operations in parallel
  const [results, answersWithOptions, allStudentAvgs] = await Promise.all([
    // 1. Load all exam results for this user
    prisma.examResult.findMany({
      where: { userId },
      orderBy: { submittedAt: "asc" },
      include: { exam: { select: { title: true, passingGradeTWK: true, passingGradeTIU: true, passingGradeTKP: true } } },
    }),
    
    // 2. Fetch UserAnswers to calculate Sub-Category mastery
    prisma.userAnswer.findMany({
      where: { userId, optionId: { not: null } },
      include: {
        question: {
          select: {
            category: true,
            subCategory: true,
            options: { select: { id: true, score: true } },
          },
        },
      },
    }),

    // 3. Get averages for Rank calculation
    prisma.examResult.groupBy({
      by: ["userId"],
      _avg: { totalScore: true },
    })
  ])

  const hasData = results.length > 0

  // 2. Aggregate averages and passing grade stats
  const avgTWK = hasData ? Math.round(results.reduce((s, r) => s + r.scoreTWK, 0) / results.length) : 0
  const avgTIU = hasData ? Math.round(results.reduce((s, r) => s + r.scoreTIU, 0) / results.length) : 0
  const avgTKP = hasData ? Math.round(results.reduce((s, r) => s + r.scoreTKP, 0) / results.length) : 0
  const avgTotal = hasData ? Math.round(results.reduce((s, r) => s + r.totalScore, 0) / results.length) : 0

  const passed = results.filter((r) => r.overallPass).length
  const passTWK = results.filter((r) => r.passTWK).length
  const passTIU = results.filter((r) => r.passTIU).length
  const passTKP = results.filter((r) => r.passTKP).length

  const passingGrade: PassingGrade = {
    totalTaken: results.length,
    passed,
    failed: results.length - passed,
    passRate: hasData ? Math.round((passed / results.length) * 100) : 0,
    passTWK,
    passTIU,
    passTKP,
  }

  // 3. Trend timeline
  const trend: TrendPoint[] = results.map((r) => ({
    examTitle: r.exam.title,
    date: r.submittedAt.toISOString(),
    scoreTWK: r.scoreTWK,
    scoreTIU: r.scoreTIU,
    scoreTKP: r.scoreTKP,
    totalScore: r.totalScore,
    overallPass: r.overallPass,
  }))

  // 4. Sub-category mastery from UserAnswers
  // An answer is "correct" if the selected option's score is the max among that question's options.

  // Build subcategory map: { "TWK|Nasionalisme": { total, correct } }
  const subMap = new Map<string, { category: "TWK" | "TIU" | "TKP"; subCategory: string; total: number; correct: number }>()

  for (const ans of answersWithOptions) {
    const { category, subCategory, options } = ans.question
    const key = `${category}|${subCategory}`

    if (!subMap.has(key)) {
      subMap.set(key, { category: category as "TWK" | "TIU" | "TKP", subCategory, total: 0, correct: 0 })
    }

    const entry = subMap.get(key)!
    entry.total++

    // Determine if selected option is the highest-score (correct) option
    const maxScore = Math.max(...options.map((o) => o.score))
    const selectedOption = options.find((o) => o.id === ans.optionId)
    if (selectedOption && selectedOption.score === maxScore && maxScore > 0) {
      entry.correct++
    }
  }

  const subCategoryMastery: SubCategoryMastery[] = Array.from(subMap.values())
    .map((e) => ({
      ...e,
      masteryPct: e.total > 0 ? Math.round((e.correct / e.total) * 100) : 0,
    }))
    .sort((a, b) => b.masteryPct - a.masteryPct)

  const weakestSubCategory =
    subCategoryMastery.length > 0
      ? subCategoryMastery.reduce((p, c) => (c.masteryPct < p.masteryPct ? c : p))
      : null

  const strongestSubCategory =
    subCategoryMastery.length > 0 ? subCategoryMastery[0] : null

  // 5. Rank / percentile — compare user's avgTotal against all students
  let rankInfo: PerformanceAnalytics["rankInfo"] = null
  if (hasData) {
    // We already fetched allStudentAvgs at the top in Promise.all

    const sorted = allStudentAvgs
      .map((row) => row._avg.totalScore ?? 0)
      .sort((a, b) => b - a)

    const userAvgRaw = results.reduce((s, r) => s + r.totalScore, 0) / results.length
    const rank = sorted.findIndex((avg) => userAvgRaw >= avg) + 1
    const total = sorted.length

    rankInfo = {
      rank: rank > 0 ? rank : total,
      total,
      percentile: total > 0 ? Math.round(((total - rank + 1) / total) * 100) : 0,
    }
  }

  return {
    avgTWK,
    avgTIU,
    avgTKP,
    avgTotal,
    passingGrade,
    trend,
    subCategoryMastery,
    weakestSubCategory,
    strongestSubCategory,
    hasData,
    rankInfo,
  }
}
