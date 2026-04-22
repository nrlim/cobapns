import React from "react"
import { prisma } from "@/lib/prisma"
import { ExamTableClient } from "./client"

export const metadata = {
  title: "Exam Builder – COBA PNS Admin",
  description: "Buat dan kelola Tryout / Ujian CAT untuk siswa COBA PNS.",
}

export default async function AdminExamsPage() {
  const [exams, questionCounts] = await Promise.all([
    prisma.exam.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { questions: true, results: true } },
      },
    }),
    prisma.question.groupBy({
      by: ["category"],
      _count: { id: true },
    }),
  ])

  const bankStats = {
    TWK: questionCounts.find((c) => c.category === "TWK")?._count.id ?? 0,
    TIU: questionCounts.find((c) => c.category === "TIU")?._count.id ?? 0,
    TKP: questionCounts.find((c) => c.category === "TKP")?._count.id ?? 0,
  }

  const examRows = exams.map((e) => ({
    id: e.id,
    title: e.title,
    durationMinutes: e.durationMinutes,
    passingGradeTWK: e.passingGradeTWK,
    passingGradeTIU: e.passingGradeTIU,
    passingGradeTKP: e.passingGradeTKP,
    status: e.status,
    accessTier: e.accessTier,
    questionCount: e._count.questions,
    resultCount: e._count.results,
    createdAt: e.createdAt,
  }))

  return (
    <div className="p-4 md:p-8 lg:p-10 w-full flex-1 space-y-8">
      {/* ExamTableClient owns the full page UI including the header CTA */}
      <ExamTableClient exams={examRows} bankStats={bankStats} />
    </div>
  )
}
