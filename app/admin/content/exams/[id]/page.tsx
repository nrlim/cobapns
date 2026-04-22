import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { ExamQuestionBuilderClient } from "@/components/admin/exam-question-builder-client"

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const exam = await prisma.exam.findUnique({ where: { id }, select: { title: true } })
  return { title: `Kelola Soal: ${exam?.title ?? "Ujian"} – Admin` }
}

export default async function ExamQuestionsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [exam, allQuestions] = await Promise.all([
    prisma.exam.findUnique({
      where: { id },
      include: {
        questions: {
          orderBy: { order: "asc" },
          include: {
            question: { include: { options: true } },
          },
        },
      },
    }),
    prisma.question.findMany({
      orderBy: [{ category: "asc" }, { createdAt: "desc" }],
      include: { options: true },
      take: 500,
    }),
  ])

  if (!exam) notFound()

  const selectedIds = exam.questions.map((eq) => eq.questionId)

  return (
    <div className="p-4 md:p-8 lg:p-10 w-full flex-1">
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-widest text-teal-700 mb-1">Exam Builder</p>
        <h2 className="text-2xl font-black tracking-tight text-slate-900">Kelola Soal Ujian</h2>
        <p className="text-slate-500 font-medium text-sm mt-1 truncate">{exam.title}</p>
      </div>

      <ExamQuestionBuilderClient
        examId={exam.id}
        examStatus={exam.status}
        allQuestions={allQuestions}
        initialSelectedIds={selectedIds}
      />
    </div>
  )
}
