"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { ExamStatus, ExamAccessTier, QuestionCategory, QuestionDifficulty } from "@prisma/client"
import { requireAdmin, handleAuthError } from "@/lib/auth-guard"

// ── Validation Schemas ─────────────────────────────────────────────────────
const ExamConfigSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(3, "Judul minimal 3 karakter"),
  durationMinutes: z.number().min(1).max(300),
  passingGradeTWK: z.number().min(0).max(150),
  passingGradeTIU: z.number().min(0).max(175),
  passingGradeTKP: z.number().min(0).max(225),
  status: z.nativeEnum(ExamStatus),
  accessTier: z.nativeEnum(ExamAccessTier),
})

const SmartRandomizerSchema = z.object({
  examId: z.string(),
  difficultyTWK: z.nativeEnum(QuestionDifficulty).optional(),
  difficultyTIU: z.nativeEnum(QuestionDifficulty).optional(),
  difficultyTKP: z.nativeEnum(QuestionDifficulty).optional(),
})

type SmartShuffleTierConfig = {
  freshRatio: number
  freshWindowMultiplier: number
  recencyPower: number
}

type RankedQuestion = {
  id: string
  rank: number
}

const SMART_SHUFFLE_TIER_CONFIG = {
  FREE: {
    // Free tetap mendapat soal baru, tetapi porsi soal ter-update tidak sebesar tier berbayar.
    freshRatio: 0.55,
    freshWindowMultiplier: 2.5,
    recencyPower: 1.6,
  },
  ELITE: {
    freshRatio: 0.75,
    freshWindowMultiplier: 1.75,
    recencyPower: 2.4,
  },
  MASTER: {
    freshRatio: 0.9,
    freshWindowMultiplier: 1.35,
    recencyPower: 3.2,
  },
} satisfies Record<ExamAccessTier, SmartShuffleTierConfig>

function pickWeightedByRecency(
  pool: RankedQuestion[],
  count: number,
  totalPoolSize: number,
  recencyPower: number
) {
  const available = [...pool]
  const picked: RankedQuestion[] = []

  while (picked.length < count && available.length > 0) {
    const weights = available.map((question) =>
      Math.pow((totalPoolSize - question.rank) / totalPoolSize, recencyPower)
    )
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0)

    let random = Math.random() * totalWeight
    let pickedIndex = 0

    for (let i = 0; i < available.length; i++) {
      random -= weights[i]
      if (random <= 0) {
        pickedIndex = i
        break
      }
    }

    const [selected] = available.splice(pickedIndex, 1)
    picked.push(selected)
  }

  return picked
}

function smartPickQuestionsForTier(
  orderedQuestions: { id: string }[],
  count: number,
  accessTier: ExamAccessTier
) {
  const config = SMART_SHUFFLE_TIER_CONFIG[accessTier]
  const rankedQuestions = orderedQuestions.map((question, rank) => ({
    id: question.id,
    rank,
  }))

  const freshTarget = Math.min(count, Math.floor(count * config.freshRatio))
  const freshWindowSize = Math.min(
    rankedQuestions.length,
    Math.max(freshTarget, Math.ceil(count * config.freshWindowMultiplier))
  )

  const freshPool = rankedQuestions.slice(0, freshWindowSize)
  const freshPicked = pickWeightedByRecency(
    freshPool,
    freshTarget,
    rankedQuestions.length,
    config.recencyPower
  )

  const pickedIds = new Set(freshPicked.map((question) => question.id))
  const remainingPool = rankedQuestions.filter((question) => !pickedIds.has(question.id))
  const remainingPicked = pickWeightedByRecency(
    remainingPool,
    count - freshPicked.length,
    rankedQuestions.length,
    config.recencyPower
  )

  return [...freshPicked, ...remainingPicked].map((question) => question.id)
}

// ── Exam Config CRUD ───────────────────────────────────────────────────────

export async function upsertExam(payload: z.infer<typeof ExamConfigSchema>) {
  try {
    await requireAdmin()
    const data = ExamConfigSchema.parse(payload)

    if (data.id) {
      await prisma.exam.update({
        where: { id: data.id },
        data: {
          title: data.title,
          durationMinutes: data.durationMinutes,
          passingGradeTWK: data.passingGradeTWK,
          passingGradeTIU: data.passingGradeTIU,
          passingGradeTKP: data.passingGradeTKP,
          status: data.status,
          accessTier: data.accessTier,
        },
      })
    } else {
      await prisma.exam.create({
        data: {
          title: data.title,
          durationMinutes: data.durationMinutes,
          passingGradeTWK: data.passingGradeTWK,
          passingGradeTIU: data.passingGradeTIU,
          passingGradeTKP: data.passingGradeTKP,
          status: data.status,
          accessTier: data.accessTier,
        },
      })
    }

    revalidatePath("/admin/content/exams")
    return { success: true }
  } catch (err) {
    if (err instanceof Error && (err.message === "UNAUTHENTICATED" || err.message === "FORBIDDEN")) {
      return handleAuthError(err)
    }
    return { success: false, error: "Gagal menyimpan konfigurasi ujian." }
  }
}

export async function deleteExam(id: string) {
  try {
    await requireAdmin()
    await prisma.exam.delete({ where: { id } })
    revalidatePath("/admin/content/exams")
    return { success: true }
  } catch (err) {
    if (err instanceof Error && (err.message === "UNAUTHENTICATED" || err.message === "FORBIDDEN")) {
      return handleAuthError(err)
    }
    return { success: false, error: "Gagal menghapus ujian." }
  }
}

// ── Question Selection ─────────────────────────────────────────────────────

/**
 * Manually assign specific questions to an exam (replaces existing set).
 */
export async function setExamQuestions(examId: string, questionIds: string[]) {
  try {
    await requireAdmin()
    // Delete all existing and re-create with new order
    await prisma.examQuestion.deleteMany({ where: { examId } })

    if (questionIds.length > 0) {
      await prisma.examQuestion.createMany({
        data: questionIds.map((questionId, index) => ({
          examId,
          questionId,
          order: index + 1,
        })),
      })
    }

    revalidatePath(`/admin/content/exams/${examId}`)
    revalidatePath("/admin/content/exams")
    return { success: true, count: questionIds.length }
  } catch (err) {
    if (err instanceof Error && (err.message === "UNAUTHENTICATED" || err.message === "FORBIDDEN")) {
      return handleAuthError(err)
    }
    return { success: false, error: "Gagal menyimpan pertanyaan ujian." }
  }
}

/**
 * Smart Randomizer: auto-picks 30 TWK + 35 TIU + 45 TKP questions.
 * Uses optional difficulty filters per category.
 */
export async function smartRandomizeQuestions(
  payload: z.infer<typeof SmartRandomizerSchema>
) {
  try {
    await requireAdmin()
    const data = SmartRandomizerSchema.parse(payload)

    const TARGETS = [
      { category: QuestionCategory.TWK, count: 30, difficulty: data.difficultyTWK },
      { category: QuestionCategory.TIU, count: 35, difficulty: data.difficultyTIU },
      { category: QuestionCategory.TKP, count: 45, difficulty: data.difficultyTKP },
    ]

    const exam = await prisma.exam.findUnique({
      where: { id: data.examId },
      select: { accessTier: true },
    })

    if (!exam) return { success: false, error: "Ujian tidak ditemukan." }

    const selectedIds: string[] = []

    for (const { category, count, difficulty } of TARGETS) {
      const where = { category, ...(difficulty ? { difficulty } : {}) }

      // Ambil seluruh pool sesuai filter, urut terbaru. Tier menentukan bobot/freshness,
      // bukan membatasi pool total, agar soal lama tetap punya peluang terpilih.
      const pool = await prisma.question.findMany({
        where,
        orderBy: { createdAt: "desc" },
        select: { id: true },
      })

      if (pool.length < count) {
        const filterLabel = difficulty ? ` tingkat ${difficulty}` : ""
        return {
          success: false,
          error: `Bank soal ${category}${filterLabel} hanya tersedia ${pool.length}/${count}. Auto-generate dibatalkan agar komposisi tetap balance.`,
        }
      }

      const picked = smartPickQuestionsForTier(pool, count, exam.accessTier)
      selectedIds.push(...picked)
    }

    // Replace existing questions only after every category satisfies its target.
    await prisma.$transaction([
      prisma.examQuestion.deleteMany({ where: { examId: data.examId } }),
      prisma.examQuestion.createMany({
        data: selectedIds.map((questionId, index) => ({
          examId: data.examId,
          questionId,
          order: index + 1,
        })),
      }),
    ])

    revalidatePath(`/admin/content/exams/${data.examId}`)
    revalidatePath("/admin/content/exams")
    return { success: true, count: selectedIds.length }
  } catch (err) {
    if (err instanceof Error && (err.message === "UNAUTHENTICATED" || err.message === "FORBIDDEN")) {
      return handleAuthError(err)
    }
    return { success: false, error: "Auto-generate gagal. Pastikan bank soal cukup." }
  }
}
