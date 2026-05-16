"use server"

import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"
import { verifySession } from "@/lib/session"
import { handleAuthError } from "@/lib/auth-guard"
import { revalidatePath } from "next/cache"
import { markAIFeedbackStale } from "@/app/actions/ai-feedback"

// ── Scoring Constants ──────────────────────────────────────────────────────
const TWK_CORRECT_SCORE = 5
const TIU_CORRECT_SCORE = 5
// TKP: score is stored per-option (1-5). No fixed point per question.

function isPrismaErrorCode(err: unknown, code: string) {
  return typeof err === "object" && err !== null && "code" in err && err.code === code
}

async function isValidActiveUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, isActive: true },
  })

  return Boolean(user?.isActive)
}

// ── Save Answer (auto-persisted during exam) ───────────────────────────────
export async function saveUserAnswer(
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

    const hasValidUser = await isValidActiveUser(session.userId)
    if (!hasValidUser) return { success: false, error: "Sesi tidak valid. Silakan login kembali." }

    await prisma.userAnswer.upsert({
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
  } catch (err) {
    if (isPrismaErrorCode(err, "P2003")) return { success: false, error: "Sesi tidak valid. Silakan login kembali." }
    return { success: false, error: "Gagal menyimpan jawaban." }
  }
}

// ── Submit Exam & Calculate Score ─────────────────────────────────────────
/**
 * TWK:  +5 correct, 0 wrong
 * TIU:  +5 correct, 0 wrong
 * TKP:  weighted score (1-5) per option, stored in Option.score field
 */
export async function submitExam(examId: string) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("sipns-session")?.value
    const session = token ? await verifySession(token) : null
    if (!session) return { success: false, error: "Unauthenticated" }

    const userId = session.userId

    const hasValidUser = await isValidActiveUser(userId)
    if (!hasValidUser) return { success: false, error: "Sesi tidak valid. Silakan login kembali." }

    // Check if already submitted to prevent duplicates
    const existing = await prisma.examResult.findFirst({
      where: { userId, examId },
    })
    if (existing) {
      return { success: true, resultId: existing.id, alreadySubmitted: true }
    }

    // Fetch exam config (passing grades)
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      select: {
        accessTier: true,
        passingGradeTWK: true,
        passingGradeTIU: true,
        passingGradeTKP: true,
      },
    })
    if (!exam) return { success: false, error: "Ujian tidak ditemukan." }


    // Fetch all questions in this exam with category + their options
    const examQuestions = await prisma.examQuestion.findMany({
      where: { examId },
      include: {
        question: {
          include: { options: true },
        },
      },
    })

    // Fetch all student answers for this exam session
    const answers = await prisma.userAnswer.findMany({
      where: { userId, examId },
    })
    const answerMap = new Map(answers.map((a) => [a.questionId, a]))

    let scoreTWK = 0
    let scoreTIU = 0
    let scoreTKP = 0

    for (const eq of examQuestions) {
      const q = eq.question
      const answer = answerMap.get(q.id)
      const chosenOptionId = answer?.optionId ?? null

      if (!chosenOptionId) continue // unanswered = 0 points

      const chosenOption = q.options.find((o) => o.id === chosenOptionId)
      if (!chosenOption) continue

      if (q.category === "TWK") {
        // For TWK: option.score > 0 means correct
        if (chosenOption.score > 0) scoreTWK += TWK_CORRECT_SCORE
      } else if (q.category === "TIU") {
        if (chosenOption.score > 0) scoreTIU += TIU_CORRECT_SCORE
      } else if (q.category === "TKP") {
        // TKP: weighted score (1-5) directly from option
        scoreTKP += chosenOption.score
      }
    }

    const totalScore = scoreTWK + scoreTIU + scoreTKP
    const passTWK = scoreTWK >= exam.passingGradeTWK
    const passTIU = scoreTIU >= exam.passingGradeTIU
    const passTKP = scoreTKP >= exam.passingGradeTKP
    const overallPass = passTWK && passTIU && passTKP

    const result = await prisma.examResult.create({
      data: {
        userId,
        examId,
        scoreTWK,
        scoreTIU,
        scoreTKP,
        totalScore,
        passTWK,
        passTIU,
        passTKP,
        overallPass,
      },
    })

    // Mark AI feedback as stale (lazy invalidation — don't re-generate here)
    await markAIFeedbackStale(userId)

    revalidatePath(`/dashboard/exams/${examId}/result`)
    revalidatePath(`/dashboard/exams/${examId}/session`)
    return { success: true, resultId: result.id }
  } catch (err) {
    // Surface auth/tier errors properly (e.g. if requireTier throws without being caught above)
    if (err instanceof Error) {
      const knownAuthErrors = ["UNAUTHENTICATED", "FORBIDDEN", "TIER_INSUFFICIENT", "SUBSCRIPTION_EXPIRED"]
      if (knownAuthErrors.includes(err.message)) {
        return handleAuthError(err)
      }
    }
    if (isPrismaErrorCode(err, "P2003")) {
      return { success: false, error: "Sesi tidak valid. Silakan login kembali." }
    }

    console.error("[submitExam] unexpected error:", err)
    return { success: false, error: "Gagal submit ujian. Silakan coba lagi." }
  }
}

// ── Get Exam Session State (for resuming) ─────────────────────────────────
export async function getExamSession(examId: string) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("sipns-session")?.value
    const session = token ? await verifySession(token) : null
    if (!session) return null

    const answers = await prisma.userAnswer.findMany({
      where: { userId: session.userId, examId },
      select: { questionId: true, optionId: true, isRagu: true },
    })

    return answers
  } catch {
    return null
  }
}

// ── Retake Exam (Reset previous result and answers) ───────────────────────
export async function retakeExam(examId: string) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("sipns-session")?.value
    const session = token ? await verifySession(token) : null
    if (!session) return { success: false, error: "Unauthenticated" }

    const userId = session.userId

    const hasValidUser = await isValidActiveUser(userId)
    if (!hasValidUser) return { success: false, error: "Sesi tidak valid. Silakan login kembali." }

    // Delete existing results and user answers for this exam
    await prisma.$transaction([
      prisma.userAnswer.deleteMany({
        where: { userId, examId },
      }),
      prisma.examResult.deleteMany({
        where: { userId, examId },
      }),
    ])

    revalidatePath(`/dashboard/exams/${examId}/session`)
    revalidatePath(`/dashboard/exams/${examId}/result`)
    return { success: true }
  } catch {
    return { success: false, error: "Gagal mengulang ujian." }
  }
}

// ── Get Exam Review Data ───────────────────────────────────────────────────
export async function getExamReviewData(examId: string) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("sipns-session")?.value
    const session = token ? await verifySession(token) : null
    if (!session) return { success: false, error: "Unauthenticated" }

    const examQuestions = await prisma.examQuestion.findMany({
      where: { examId },
      orderBy: { order: "asc" },
      include: {
        question: {
          include: {
            options: { orderBy: { id: "asc" } },
          },
        },
      },
    })

    const answers = await prisma.userAnswer.findMany({
      where: { userId: session.userId, examId },
    })
    const answerMap = new Map(answers.map((a) => [a.questionId, a.optionId]))

    const reviewData = examQuestions.map((eq) => {
      const q = eq.question
      const selectedOptionId = answerMap.get(q.id) || null
      return {
        id: q.id,
        category: q.category,
        content: q.content,
        explanation: q.explanation,
        options: q.options.map(o => ({
          id: o.id,
          text: o.text,
          score: o.score
        })),
        selectedOptionId,
      }
    })

    return { success: true, data: reviewData }
  } catch (err) {
    return { success: false, error: "Gagal mengambil data review." }
  }
}
