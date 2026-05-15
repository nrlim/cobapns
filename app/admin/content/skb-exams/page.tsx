import { prisma } from "@/lib/prisma"
import { SKBExamBuilderClient } from "./client"

export const metadata = {
  title: "SKB Exam Builder – COBA PNS Admin",
  description: "Buat dan kelola ujian Try Out Seleksi Kompetensi Bidang (SKB).",
}

export default async function SKBExamsAdminPage() {
  const [exams, bankStats, allBidang] = await Promise.all([
    prisma.sKBExam.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { questions: true, results: true } },
      },
    }),
    prisma.sKBQuestion.groupBy({
      by: ["category"],
      _count: { id: true },
    }),
    prisma.sKBQuestion.findMany({
      select: { bidang: true },
      distinct: ["bidang"],
      orderBy: { bidang: "asc" },
    }),
  ])

  const stats = {
    TEKNIS: bankStats.find((s) => s.category === "TEKNIS")?._count.id ?? 0,
    MANAJERIAL: bankStats.find((s) => s.category === "MANAJERIAL")?._count.id ?? 0,
    SOSIAL_KULTURAL: bankStats.find((s) => s.category === "SOSIAL_KULTURAL")?._count.id ?? 0,
  }

  const bidangList = allBidang.map((b) => b.bidang)

  const examRows = exams.map((e) => ({
    id: e.id,
    title: e.title,
    bidang: e.bidang,
    durationMinutes: e.durationMinutes,
    status: e.status,
    accessTier: e.accessTier,
    questionCount: e._count.questions,
    resultCount: e._count.results,
    createdAt: e.createdAt,
  }))

  return (
    <div className="p-4 md:p-8 lg:p-10 w-full space-y-8">
      <SKBExamBuilderClient exams={examRows} bankStats={stats} bidangList={bidangList} />
    </div>
  )
}
