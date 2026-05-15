import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"
import { verifySession } from "@/lib/session"
import { redirect, notFound } from "next/navigation"
import { SKBCATSessionClient } from "@/components/exam/skb-cat-session-client"

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const exam = await prisma.sKBExam.findUnique({ where: { id }, select: { title: true } })
  return {
    title: `SKB: ${exam?.title ?? "Try Out"} – COBA PNS`,
    robots: "noindex",
  }
}

export default async function SKBSessionPage({
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
  const existingResult = await prisma.sKBExamResult.findFirst({
    where: { userId: session.userId, examId: id },
    select: { id: true },
  })
  if (existingResult) {
    redirect(`/dashboard/skb/${id}/result/${existingResult.id}`)
  }

  // Tier check
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { subscriptionTier: true, subscriptionEnds: true },
  })

  const effectiveTier =
    user?.subscriptionTier !== "FREE" &&
    user?.subscriptionEnds &&
    new Date(user.subscriptionEnds) < new Date()
      ? "FREE"
      : user?.subscriptionTier ?? "FREE"

  const exam = await prisma.sKBExam.findUnique({
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

  // Access tier validation
  if (session.role !== "ADMIN" && exam.accessTier !== "FREE") {
    const TIER_WEIGHT: Record<string, number> = { FREE: 0, ELITE: 1, MASTER: 2 }
    if ((TIER_WEIGHT[effectiveTier] ?? 0) < (TIER_WEIGHT[exam.accessTier] ?? 0)) {
      redirect("/dashboard/skb?error=tier_insufficient")
    }
  }

  // Fetch saved answers for resume
  const savedAnswers = await prisma.sKBUserAnswer.findMany({
    where: { userId: session.userId, examId: id },
    select: { questionId: true, optionId: true, isRagu: true },
  })

  const savedAnswerMap: Record<string, { optionId: string | null; isRagu: boolean }> = {}
  for (const sa of savedAnswers) {
    savedAnswerMap[sa.questionId] = { optionId: sa.optionId, isRagu: sa.isRagu }
  }

  const questions = exam.questions.map((eq) => ({
    id: eq.question.id,
    category: eq.question.category as "TEKNIS" | "MANAJERIAL" | "SOSIAL_KULTURAL",
    bidang: eq.question.bidang,
    subCategory: eq.question.subCategory,
    content: eq.question.content,
    options: eq.question.options.map((o) => ({
      id: o.id,
      text: o.text,
      score: o.score,
    })),
  }))

  return (
    <SKBCATSessionClient
      examId={exam.id}
      examTitle={exam.title}
      examBidang={exam.bidang}
      durationMinutes={exam.durationMinutes}
      questions={questions}
      savedAnswerMap={savedAnswerMap}
    />
  )
}
