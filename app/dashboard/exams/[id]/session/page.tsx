import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"
import { verifySession } from "@/lib/session"
import { redirect, notFound } from "next/navigation"
import { CATSessionClient } from "@/components/exam/cat-session-client"

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const exam = await prisma.exam.findUnique({ where: { id }, select: { title: true } })
  return {
    title: `Ujian: ${exam?.title ?? "CAT"} – COBA PNS`,
    robots: "noindex", // hide exam from search engines
  }
}

export default async function ExamSessionPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const cookieStore = await cookies()
  const token = cookieStore.get("sipns-session")?.value
  const session = token ? await verifySession(token) : null
  if (!session) redirect("/login")

  // Check if already submitted
  const existingResult = await prisma.examResult.findFirst({
    where: { userId: session.userId, examId: id },
    select: { id: true },
  })
  if (existingResult) {
    redirect(`/dashboard/exams/${id}/result/${existingResult.id}`)
  }

  // ── FREE Tier Limit Check ───────────────────────────────────────────────
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { subscriptionTier: true, subscriptionEnds: true },
  })
  
  const effectiveTier =
    user?.subscriptionTier !== "FREE" &&
    user?.subscriptionEnds &&
    new Date(user.subscriptionEnds) < new Date()
      ? "FREE"
      : (user?.subscriptionTier ?? "FREE")

  if (session.role !== "ADMIN" && effectiveTier === "FREE") {
    const submittedCount = await prisma.examResult.count({
      where: { userId: session.userId },
    })
    if (submittedCount >= 3) {
      redirect("/dashboard/exams?error=limit_reached")
    }
  }
  // ──────────────────────────────────────────────────────────────────────

  const exam = await prisma.exam.findUnique({
    where: { id, status: "PUBLISHED" },
    include: {
      questions: {
        orderBy: { order: "asc" },
        include: {
          question: {
            include: { options: { orderBy: { id: "asc" } } },
          },
        },
      },
    },
  })
  if (!exam || exam.questions.length === 0) notFound()

  // ── Access Tier Check for Exam ──────────────────────────────────────────
  if (session.role !== "ADMIN" && exam.accessTier !== "FREE") {
    const TIER_WEIGHT = { FREE: 0, ELITE: 1, MASTER: 2 }
    const requiredWeight = TIER_WEIGHT[exam.accessTier]
    const userWeight = TIER_WEIGHT[effectiveTier as "FREE" | "ELITE" | "MASTER"]
    
    if (userWeight < requiredWeight) {
      redirect(`/dashboard/exams?error=tier_insufficient`)
    }
  }
  // ──────────────────────────────────────────────────────────────────────

  // Freeze the user's attempt at first open. If admin later smart-shuffles this exam,
  // this user keeps the original question set for session, scoring, and review.
  const existingSnapshot = await prisma.userAnswer.findMany({
    where: { userId: session.userId, examId: id },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    include: {
      question: {
        include: { options: { orderBy: { id: "asc" } } },
      },
    },
  })

  const snapshotAnswers = existingSnapshot.length > 0
    ? existingSnapshot
    : exam.questions.map((eq) => ({
        id: `snapshot-${eq.questionId}`,
        userId: session.userId,
        examId: id,
        questionId: eq.questionId,
        optionId: null,
        isRagu: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        question: eq.question,
      }))

  if (existingSnapshot.length === 0) {
    await prisma.userAnswer.createMany({
      data: exam.questions.map((eq) => ({
        userId: session.userId,
        examId: id,
        questionId: eq.questionId,
        optionId: null,
        isRagu: false,
      })),
      skipDuplicates: true,
    })
  }

  const savedAnswerMap: Record<string, { optionId: string | null; isRagu: boolean }> = {}
  for (const sa of snapshotAnswers) {
    savedAnswerMap[sa.questionId] = { optionId: sa.optionId, isRagu: sa.isRagu }
  }

  const questions = snapshotAnswers.map((answer) => ({
    id: answer.question.id,
    category: answer.question.category as "TWK" | "TIU" | "TKP",
    subCategory: answer.question.subCategory,
    content: answer.question.content,
    options: answer.question.options.map((o) => ({
      id: o.id,
      text: o.text,
      score: o.score,
    })),
  }))

  return (
    <CATSessionClient
      examId={exam.id}
      examTitle={exam.title}
      durationMinutes={exam.durationMinutes}
      questions={questions}
      savedAnswerMap={savedAnswerMap}
    />
  )
}
