"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { ExamStatus, ExamAccessTier, SKBCategory, QuestionDifficulty } from "@prisma/client"
import { requireAdmin, requireTier, handleAuthError } from "@/lib/auth-guard"
import { cookies } from "next/headers"
import { verifySession } from "@/lib/session"

// ── Schema ─────────────────────────────────────────────────────────────────────

const SKBExamConfigSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(3, "Judul minimal 3 karakter"),
  bidang: z.string().min(1, "Bidang jabatan wajib diisi"),
  durationMinutes: z.number().min(10).max(300),
  status: z.nativeEnum(ExamStatus),
  accessTier: z.nativeEnum(ExamAccessTier),
})

const SKBSmartRandomizerSchema = z.object({
  examId: z.string(),
  countTeknis: z.number().min(0).max(100).default(20),
  countManajerial: z.number().min(0).max(100).default(15),
  countSosialKultural: z.number().min(0).max(100).default(15),
  difficultyTeknis: z.nativeEnum(QuestionDifficulty).optional(),
  difficultyManajerial: z.nativeEnum(QuestionDifficulty).optional(),
  difficultySosialKultural: z.nativeEnum(QuestionDifficulty).optional(),
  bidangFilter: z.string().optional(), // filter by bidang for TEKNIS questions
})

// ── Admin: Exam CRUD ───────────────────────────────────────────────────────────

export async function upsertSKBExam(payload: z.infer<typeof SKBExamConfigSchema>) {
  try {
    await requireAdmin()
    const data = SKBExamConfigSchema.parse(payload)

    if (data.id) {
      await prisma.sKBExam.update({
        where: { id: data.id },
        data: {
          title: data.title,
          bidang: data.bidang,
          durationMinutes: data.durationMinutes,
          status: data.status,
          accessTier: data.accessTier,
        },
      })
    } else {
      await prisma.sKBExam.create({
        data: {
          title: data.title,
          bidang: data.bidang,
          durationMinutes: data.durationMinutes,
          status: data.status,
          accessTier: data.accessTier,
        },
      })
    }

    revalidatePath("/admin/content/skb-exams")
    return { success: true }
  } catch (err) {
    if (err instanceof Error && (err.message === "UNAUTHENTICATED" || err.message === "FORBIDDEN")) {
      return handleAuthError(err)
    }
    console.error("[upsertSKBExam]", err)
    return { success: false, error: "Gagal menyimpan ujian SKB." }
  }
}

export async function deleteSKBExam(id: string) {
  try {
    await requireAdmin()
    await prisma.sKBExam.delete({ where: { id } })
    revalidatePath("/admin/content/skb-exams")
    return { success: true }
  } catch (err) {
    if (err instanceof Error && (err.message === "UNAUTHENTICATED" || err.message === "FORBIDDEN")) {
      return handleAuthError(err)
    }
    return { success: false, error: "Gagal menghapus ujian SKB." }
  }
}

// ── Admin: Question Assignment ─────────────────────────────────────────────────

export async function setSKBExamQuestions(examId: string, questionIds: string[]) {
  try {
    await requireAdmin()
    await prisma.sKBExamQuestion.deleteMany({ where: { examId } })

    if (questionIds.length > 0) {
      await prisma.sKBExamQuestion.createMany({
        data: questionIds.map((questionId, index) => ({
          examId,
          questionId,
          order: index + 1,
        })),
      })
    }

    revalidatePath(`/admin/content/skb-exams/${examId}`)
    revalidatePath("/admin/content/skb-exams")
    return { success: true, count: questionIds.length }
  } catch (err) {
    if (err instanceof Error && (err.message === "UNAUTHENTICATED" || err.message === "FORBIDDEN")) {
      return handleAuthError(err)
    }
    return { success: false, error: "Gagal menyimpan soal ujian SKB." }
  }
}

export async function smartRandomizeSKBQuestions(
  payload: z.infer<typeof SKBSmartRandomizerSchema>
) {
  try {
    await requireAdmin()
    const data = SKBSmartRandomizerSchema.parse(payload)

    const exam = await prisma.sKBExam.findUnique({
      where: { id: data.examId },
      select: { bidang: true, accessTier: true },
    })
    if (!exam) return { success: false, error: "Ujian tidak ditemukan." }

    const isPremium = exam.accessTier === "ELITE" || exam.accessTier === "MASTER"
    const takeMultiplier = isPremium ? 1.5 : 3

    const TARGETS = [
      {
        category: SKBCategory.TEKNIS,
        count: data.countTeknis,
        difficulty: data.difficultyTeknis,
        bidangFilter: data.bidangFilter || exam.bidang,
      },
      {
        category: SKBCategory.MANAJERIAL,
        count: data.countManajerial,
        difficulty: data.difficultyManajerial,
        bidangFilter: null, // Manajerial questions are bidang-agnostic
      },
      {
        category: SKBCategory.SOSIAL_KULTURAL,
        count: data.countSosialKultural,
        difficulty: data.difficultySosialKultural,
        bidangFilter: null,
      },
    ]

    const selectedIds: string[] = []

    for (const { category, count, difficulty, bidangFilter } of TARGETS) {
      if (count === 0) continue

      const where: Record<string, unknown> = { category }
      if (difficulty) where.difficulty = difficulty
      if (bidangFilter) where.bidang = bidangFilter

      const pool = await prisma.sKBQuestion.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: Math.max(count, Math.floor(count * takeMultiplier)),
        select: { id: true },
      })

      // Fisher-Yates shuffle
      for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[pool[i], pool[j]] = [pool[j], pool[i]]
      }

      selectedIds.push(...pool.slice(0, count).map((q) => q.id))
    }

    await prisma.sKBExamQuestion.deleteMany({ where: { examId: data.examId } })
    await prisma.sKBExamQuestion.createMany({
      data: selectedIds.map((questionId, index) => ({
        examId: data.examId,
        questionId,
        order: index + 1,
      })),
    })

    revalidatePath(`/admin/content/skb-exams/${data.examId}`)
    revalidatePath("/admin/content/skb-exams")
    return { success: true, count: selectedIds.length }
  } catch (err) {
    if (err instanceof Error && (err.message === "UNAUTHENTICATED" || err.message === "FORBIDDEN")) {
      return handleAuthError(err)
    }
    console.error("[smartRandomizeSKBQuestions]", err)
    return { success: false, error: "Auto-generate gagal. Pastikan bank soal SKB cukup." }
  }
}

// ── User: Save Answer (auto-save during session) ───────────────────────────────

export async function saveSKBUserAnswer(
  examId: string,
  questionId: string,
  optionId: string | null,
  isRagu: boolean = false
) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("sipns-session")?.value
    const session = token ? await verifySession(token) : null
    if (!session) return { success: false, error: "Unauthenticated" }

    await prisma.sKBUserAnswer.upsert({
      where: {
        userId_examId_questionId: {
          userId: session.userId,
          examId,
          questionId,
        },
      },
      update: { optionId, isRagu },
      create: {
        userId: session.userId,
        examId,
        questionId,
        optionId,
        isRagu,
      },
    })

    return { success: true }
  } catch {
    return { success: false, error: "Gagal menyimpan jawaban." }
  }
}

// ── User: Submit SKB Exam ──────────────────────────────────────────────────────

export async function submitSKBExam(examId: string) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("sipns-session")?.value
    const session = token ? await verifySession(token) : null
    if (!session) return { success: false, error: "Unauthenticated" }

    const userId = session.userId

    // Prevent duplicates
    const existing = await prisma.sKBExamResult.findFirst({
      where: { userId, examId },
    })
    if (existing) {
      return { success: true, resultId: existing.id, alreadySubmitted: true }
    }

    // Check access tier
    const exam = await prisma.sKBExam.findUnique({
      where: { id: examId },
      select: { accessTier: true },
    })
    if (!exam) return { success: false, error: "Ujian tidak ditemukan." }


    // Fetch all exam questions with options
    const examQuestions = await prisma.sKBExamQuestion.findMany({
      where: { examId },
      include: {
        question: { include: { options: true } },
      },
    })

    // Fetch user answers
    const answers = await prisma.sKBUserAnswer.findMany({
      where: { userId, examId },
    })
    const answerMap = new Map(answers.map((a) => [a.questionId, a]))

    let scoreTeknis = 0
    let scoreManajerial = 0
    let scoreSosialKultural = 0

    for (const eq of examQuestions) {
      const q = eq.question
      const answer = answerMap.get(q.id)
      const chosenOptionId = answer?.optionId ?? null
      if (!chosenOptionId) continue

      const chosenOption = q.options.find((o) => o.id === chosenOptionId)
      if (!chosenOption) continue

      // TEKNIS: +5 if correct (score > 0), 0 if wrong
      // MANAJERIAL & SOSIAL_KULTURAL: weighted Likert 1-5
      if (q.category === "TEKNIS") {
        if (chosenOption.score > 0) scoreTeknis += 5
      } else if (q.category === "MANAJERIAL") {
        scoreManajerial += chosenOption.score
      } else if (q.category === "SOSIAL_KULTURAL") {
        scoreSosialKultural += chosenOption.score
      }
    }

    const totalScore = scoreTeknis + scoreManajerial + scoreSosialKultural

    const result = await prisma.sKBExamResult.create({
      data: {
        userId,
        examId,
        scoreTeknis,
        scoreManajerial,
        scoreSosialKultural,
        totalScore,
      },
    })

    revalidatePath(`/dashboard/skb/${examId}/result`)
    revalidatePath(`/dashboard/skb/${examId}/session`)
    revalidatePath("/dashboard/skb")
    return { success: true, resultId: result.id }
  } catch (err) {
    if (err instanceof Error) {
      const knownAuthErrors = ["UNAUTHENTICATED", "FORBIDDEN", "TIER_INSUFFICIENT", "SUBSCRIPTION_EXPIRED"]
      if (knownAuthErrors.includes(err.message)) return handleAuthError(err)
    }
    console.error("[submitSKBExam]", err)
    return { success: false, error: "Gagal submit ujian SKB. Silakan coba lagi." }
  }
}

// ── User: Retake SKB Exam ──────────────────────────────────────────────────────

export async function retakeSKBExam(examId: string) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("sipns-session")?.value
    const session = token ? await verifySession(token) : null
    if (!session) return { success: false, error: "Unauthenticated" }

    const userId = session.userId
    await prisma.$transaction([
      prisma.sKBUserAnswer.deleteMany({ where: { userId, examId } }),
      prisma.sKBExamResult.deleteMany({ where: { userId, examId } }),
    ])

    revalidatePath(`/dashboard/skb/${examId}/session`)
    revalidatePath(`/dashboard/skb/${examId}/result`)
    return { success: true }
  } catch {
    return { success: false, error: "Gagal mengulang ujian SKB." }
  }
}

// ── User: Review SKB Answers ───────────────────────────────────────────────────

export async function getSKBReviewData(examId: string) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("sipns-session")?.value
    const session = token ? await verifySession(token) : null
    if (!session) return { success: false, error: "Unauthenticated" }

    const examQuestions = await prisma.sKBExamQuestion.findMany({
      where: { examId },
      orderBy: { order: "asc" },
      include: {
        question: {
          include: { options: { orderBy: { id: "asc" } } },
        },
      },
    })

    const answers = await prisma.sKBUserAnswer.findMany({
      where: { userId: session.userId, examId },
    })
    const answerMap = new Map(answers.map((a) => [a.questionId, a.optionId]))

    const reviewData = examQuestions.map((eq) => {
      const q = eq.question
      const selectedOptionId = answerMap.get(q.id) || null
      return {
        id: q.id,
        category: q.category,
        bidang: q.bidang,
        content: q.content,
        explanation: q.explanation,
        options: q.options.map((o) => ({ id: o.id, text: o.text, score: o.score })),
        selectedOptionId,
      }
    })

    return { success: true, data: reviewData }
  } catch {
    return { success: false, error: "Gagal mengambil data review SKB." }
  }
}
