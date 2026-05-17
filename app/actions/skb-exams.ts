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

type SmartShuffleTierConfig = {
  freshRatio: number
  freshWindowMultiplier: number
  recencyPower: number
  reusePenalty: number
}

type RankedQuestion = {
  id: string
  rank: number
  usageCount: number
}

const SMART_SHUFFLE_TIER_CONFIG = {
  FREE: {
    freshRatio: 0.45,
    freshWindowMultiplier: 3,
    recencyPower: 1.25,
    reusePenalty: 1.2,
  },
  ELITE: {
    freshRatio: 0.6,
    freshWindowMultiplier: 2.4,
    recencyPower: 1.65,
    reusePenalty: 1.6,
  },
  MASTER: {
    freshRatio: 0.7,
    freshWindowMultiplier: 2,
    recencyPower: 2,
    reusePenalty: 2,
  },
} satisfies Record<ExamAccessTier, SmartShuffleTierConfig>

function pickWeightedSmart(
  pool: RankedQuestion[],
  count: number,
  totalPoolSize: number,
  config: SmartShuffleTierConfig
) {
  const available = [...pool]
  const picked: RankedQuestion[] = []

  while (picked.length < count && available.length > 0) {
    const weights = available.map((question) => {
      const recencyWeight = Math.pow((totalPoolSize - question.rank) / totalPoolSize, config.recencyPower)
      const noveltyWeight = 1 / Math.pow(1 + question.usageCount, config.reusePenalty)
      return recencyWeight * noveltyWeight
    })
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
  orderedQuestions: { id: string; usageCount: number }[],
  count: number,
  accessTier: ExamAccessTier
) {
  const config = SMART_SHUFFLE_TIER_CONFIG[accessTier]
  const rankedQuestions = orderedQuestions.map((question, rank) => ({
    id: question.id,
    rank,
    usageCount: question.usageCount,
  }))

  const freshTarget = Math.min(count, Math.floor(count * config.freshRatio))
  const freshWindowSize = Math.min(
    rankedQuestions.length,
    Math.max(freshTarget, Math.ceil(count * config.freshWindowMultiplier))
  )

  const freshPool = rankedQuestions.slice(0, freshWindowSize)
  const freshPicked = pickWeightedSmart(freshPool, freshTarget, rankedQuestions.length, config)

  const pickedIds = new Set(freshPicked.map((question) => question.id))
  const remainingPool = rankedQuestions.filter((question) => !pickedIds.has(question.id))
  const remainingPicked = pickWeightedSmart(
    remainingPool,
    count - freshPicked.length,
    rankedQuestions.length,
    config
  )

  return [...freshPicked, ...remainingPicked].map((question) => question.id)
}

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

export async function deleteSKBExams(ids: string[]) {
  try {
    await requireAdmin()
    const parsed = z.array(z.string().min(1)).min(1).max(100).safeParse(ids)
    if (!parsed.success) return { success: false, error: "Pilih minimal 1 ujian SKB untuk dihapus." }

    const result = await prisma.sKBExam.deleteMany({
      where: { id: { in: parsed.data } },
    })

    revalidatePath("/admin/content/skb-exams")
    return { success: true, count: result.count }
  } catch (err) {
    if (err instanceof Error && (err.message === "UNAUTHENTICATED" || err.message === "FORBIDDEN")) {
      return handleAuthError(err)
    }
    return { success: false, error: "Gagal menghapus ujian SKB terpilih." }
  }
}

export async function duplicateSKBExam(id: string) {
  try {
    await requireAdmin()
    const parsed = z.string().min(1).safeParse(id)
    if (!parsed.success) return { success: false, error: "ID ujian SKB tidak valid." }

    const source = await prisma.sKBExam.findUnique({
      where: { id: parsed.data },
      include: {
        questions: {
          orderBy: { order: "asc" },
          select: { questionId: true, order: true },
        },
      },
    })
    if (!source) return { success: false, error: "Ujian SKB tidak ditemukan." }

    const baseTitle = `${source.title} (Copy)`
    const existingCopies = await prisma.sKBExam.count({
      where: { title: { startsWith: baseTitle } },
    })
    const title = existingCopies === 0 ? baseTitle : `${baseTitle} ${existingCopies + 1}`

    const duplicated = await prisma.sKBExam.create({
      data: {
        title,
        bidang: source.bidang,
        durationMinutes: source.durationMinutes,
        status: "DRAFT",
        accessTier: source.accessTier,
        questions: {
          create: source.questions.map((question) => ({
            questionId: question.questionId,
            order: question.order,
          })),
        },
      },
      select: { id: true, title: true },
    })

    revalidatePath("/admin/content/skb-exams")
    return { success: true, examId: duplicated.id, title: duplicated.title }
  } catch (err) {
    if (err instanceof Error && (err.message === "UNAUTHENTICATED" || err.message === "FORBIDDEN")) {
      return handleAuthError(err)
    }
    return { success: false, error: "Gagal menduplikasi ujian SKB." }
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
        select: {
          id: true,
          exams: {
            where: { examId: { not: data.examId } },
            select: { examId: true },
          },
        },
      })

      if (pool.length < count) {
        const filterLabel = difficulty ? ` tingkat ${difficulty}` : ""
        return {
          success: false,
          error: `Bank soal SKB ${category}${filterLabel} hanya tersedia ${pool.length}/${count}. Auto-generate dibatalkan agar komposisi tetap balance.`,
        }
      }

      const rankedPool = pool.map((question) => ({
        id: question.id,
        usageCount: question.exams.length,
      }))
      selectedIds.push(...smartPickQuestionsForTier(rankedPool, count, exam.accessTier))
    }

    return { success: true, count: selectedIds.length, questionIds: selectedIds }
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
