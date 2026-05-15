import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { SKBQuestionBuilderClient } from "@/components/admin/skb-question-builder-client"

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const exam = await prisma.sKBExam.findUnique({ where: { id }, select: { title: true } })
  return {
    title: `Soal Ujian: ${exam?.title ?? "SKB"} – Admin`,
  }
}

export default async function SKBExamQuestionsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const exam = await prisma.sKBExam.findUnique({
    where: { id },
    include: {
      questions: {
        orderBy: { order: "asc" },
        include: { question: { include: { options: true } } },
      },
    },
  })
  if (!exam) notFound()

  // Full bank for picker
  const bank = await prisma.sKBQuestion.findMany({
    orderBy: [{ bidang: "asc" }, { category: "asc" }, { createdAt: "desc" }],
    include: { options: true },
  })

  // Count per category for Smart Randomizer hints
  const bankStats = await prisma.sKBQuestion.groupBy({
    by: ["category"],
    _count: { id: true },
  })
  const stats = {
    TEKNIS: bankStats.find((s) => s.category === "TEKNIS")?._count.id ?? 0,
    MANAJERIAL: bankStats.find((s) => s.category === "MANAJERIAL")?._count.id ?? 0,
    SOSIAL_KULTURAL: bankStats.find((s) => s.category === "SOSIAL_KULTURAL")?._count.id ?? 0,
  }

  return (
    <div className="p-4 md:p-8 lg:p-10 w-full space-y-6">
      <SKBQuestionBuilderClient
        exam={{
          id: exam.id,
          title: exam.title,
          bidang: exam.bidang,
          durationMinutes: exam.durationMinutes,
          status: exam.status,
          accessTier: exam.accessTier,
        }}
        assignedQuestions={exam.questions.map((eq) => ({
          id: eq.question.id,
          category: eq.question.category,
          bidang: eq.question.bidang,
          subCategory: eq.question.subCategory,
          content: eq.question.content,
          difficulty: eq.question.difficulty,
          options: eq.question.options,
        }))}
        bank={bank.map((q) => ({
          id: q.id,
          category: q.category,
          bidang: q.bidang,
          subCategory: q.subCategory,
          content: q.content,
          difficulty: q.difficulty,
          options: q.options,
        }))}
        bankStats={stats}
      />
    </div>
  )
}
