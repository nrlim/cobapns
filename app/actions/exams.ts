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
    const data = SmartRandomizerSchema.parse(payload)

    const TARGETS = [
      { category: QuestionCategory.TWK, count: 30, difficulty: data.difficultyTWK },
      { category: QuestionCategory.TIU, count: 35, difficulty: data.difficultyTIU },
      { category: QuestionCategory.TKP, count: 45, difficulty: data.difficultyTKP },
    ]

    const selectedIds: string[] = []

    for (const { category, count, difficulty } of TARGETS) {
      const where: Record<string, unknown> = { category }
      if (difficulty) where.difficulty = difficulty

      // Get all eligible IDs then shuffle in JS (Postgres random() is fine too)
      const pool = await prisma.question.findMany({
        where,
        select: { id: true },
      })

      // Fisher-Yates shuffle
      for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[pool[i], pool[j]] = [pool[j], pool[i]]
      }

      const picked = pool.slice(0, count).map((q) => q.id)
      selectedIds.push(...picked)
    }

    // Replace existing questions
    await prisma.examQuestion.deleteMany({ where: { examId: data.examId } })
    await prisma.examQuestion.createMany({
      data: selectedIds.map((questionId, index) => ({
        examId: data.examId,
        questionId,
        order: index + 1,
      })),
    })

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
