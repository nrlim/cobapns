import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"
import { verifySession } from "@/lib/session"
import { redirect } from "next/navigation"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { SKBExamListClient } from "@/components/dashboard/skb-exam-list-client"
import { AlertCircle } from "lucide-react"

export const metadata = {
  title: "Try Out SKB – COBA PNS",
  description: "Latihan Try Out Seleksi Kompetensi Bidang (SKB) CPNS.",
}

const SUBSCRIPTION_RANK: Record<string, number> = { FREE: 0, ELITE: 1, MASTER: 2 }
const TIER_RANK: Record<string, number> = { FREE: 0, ELITE: 1, MASTER: 2 }

export default async function SKBExamsPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get("sipns-session")?.value
  const session = token ? await verifySession(token) : null
  if (!session) redirect("/login")

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { subscriptionTier: true, jabatan: true, targetInstansi: true },
  })

  const userRank = SUBSCRIPTION_RANK[user?.subscriptionTier ?? "FREE"]

  const exams = await prisma.sKBExam.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { questions: true, results: true } },
      results: {
        where: { userId: session.userId },
        select: { id: true, totalScore: true, scoreTeknis: true, scoreManajerial: true, scoreSosialKultural: true },
      },
    },
  })

  const examCards = exams.map((e) => ({
    id: e.id,
    title: e.title,
    bidang: e.bidang,
    durationMinutes: e.durationMinutes,
    accessTier: e.accessTier,
    questionCount: e._count.questions,
    resultCount: e._count.results,
    myResult: e.results[0]
      ? {
          id: e.results[0].id,
          totalScore: e.results[0].totalScore,
          scoreTeknis: e.results[0].scoreTeknis,
          scoreManajerial: e.results[0].scoreManajerial,
          scoreSosialKultural: e.results[0].scoreSosialKultural,
        }
      : null,
    isLocked: TIER_RANK[e.accessTier] > userRank,
  }))

  // Sort: unlocked first
  examCards.sort((a, b) => {
    if (a.isLocked === b.isLocked) return 0
    return a.isLocked ? 1 : -1
  })

  const total = examCards.length
  const done = examCards.filter((e) => e.myResult).length

  return (
    <DashboardShell activeHref="/dashboard/skb" user={{ name: session.name, role: session.role }}>
      <div className="p-4 md:p-8 lg:p-10 w-full space-y-8">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-orange-500 mb-1">
              Simulasi CAT · Seleksi Kompetensi Bidang
            </p>
            <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-slate-900">
              Try Out SKB
            </h1>
            <p className="text-slate-500 font-medium text-sm mt-1">
              Latihan soal SKB — Teknis, Manajerial, dan Sosial Kultural.
            </p>
          </div>

          {/* Summary pills */}
          <div className="flex items-center gap-4 flex-shrink-0 bg-white border border-slate-100 rounded-2xl px-5 py-3 shadow-sm">
            <div className="text-center">
              <div className="text-xl font-black text-orange-600">{done}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Selesai</div>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div className="text-center">
              <div className="text-xl font-black text-slate-900">{total}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tersedia</div>
            </div>
          </div>
        </div>

        {/* Rules Banner */}
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-black text-orange-900 text-sm mb-1.5">Tentang Ujian SKB</h3>
            <ul className="text-xs text-orange-800 grid sm:grid-cols-2 gap-1 font-medium">
              <li>• <strong>Teknis:</strong> +5 benar, 0 salah (pengetahuan bidang jabatan).</li>
              <li>• <strong>Manajerial &amp; Sosial:</strong> Skor 1–5 per jawaban (Likert).</li>
              <li>• Jawabanmu tersimpan otomatis saat mengerjakan.</li>
              <li>• Waktu terus berjalan meski halaman ditutup.</li>
            </ul>
          </div>
        </div>

        {/* Exam List */}
        <div>
          <div className="mb-4">
            <h2 className="font-black text-slate-900 text-sm">Ada {total} Latihan SKB Untukmu</h2>
          </div>
          <SKBExamListClient exams={examCards} userBidang={user?.jabatan ?? undefined} />
        </div>

      </div>
    </DashboardShell>
  )
}
