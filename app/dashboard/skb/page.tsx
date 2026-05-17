import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"
import { verifySession } from "@/lib/session"
import { redirect } from "next/navigation"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { SKBExamListClient } from "@/components/dashboard/skb-exam-list-client"
import { ExamFilterToolbar } from "@/components/dashboard/exam-filter-toolbar"
import { AlertCircle } from "lucide-react"
import { mapJabatanToBidang } from "@/lib/skb-bidang"
import { ExamAccessTier, Prisma } from "@prisma/client"

export const metadata = {
  title: "Try Out SKB – COBA PNS",
  description: "Latihan Try Out Seleksi Kompetensi Bidang (SKB) CPNS.",
}

const SUBSCRIPTION_RANK: Record<string, number> = { FREE: 0, ELITE: 1, MASTER: 2 }
const TIER_RANK: Record<string, number> = { FREE: 0, ELITE: 1, MASTER: 2 }
const PAGE_SIZE = 8

function normalizeParam(value: string | string[] | undefined, fallback = "") {
  return typeof value === "string" ? value : fallback
}

function getSKBExamOrderBy(sort: string): Prisma.SKBExamOrderByWithRelationInput[] {
  if (sort === "popular") return [{ results: { _count: "desc" } }, { createdAt: "desc" }]
  if (sort === "questions") return [{ questions: { _count: "desc" } }, { createdAt: "desc" }]
  if (sort === "duration") return [{ durationMinutes: "desc" }, { createdAt: "desc" }]
  if (sort === "title") return [{ title: "asc" }]
  return [{ createdAt: "desc" }]
}

export default async function SKBExamsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}) {
  const cookieStore = await cookies()
  const token = cookieStore.get("sipns-session")?.value
  const session = token ? await verifySession(token) : null
  if (!session) redirect("/login")

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { subscriptionTier: true, jabatan: true, targetInstansi: true },
  })

  const userRank = SUBSCRIPTION_RANK[user?.subscriptionTier ?? "FREE"]
  const params = await searchParams
  const q = normalizeParam(params?.q).trim()
  const tier = normalizeParam(params?.tier, "ALL")
  const state = normalizeParam(params?.state, "ALL")
  const sort = normalizeParam(params?.sort, "newest")
  const bidang = normalizeParam(params?.bidang, "ALL")
  const requestedPage = Number(normalizeParam(params?.page, "1"))
  const page = Number.isFinite(requestedPage) && requestedPage > 0 ? Math.floor(requestedPage) : 1

  const tierValues = ["FREE", "ELITE", "MASTER"] as const
  const accessibleTiers = tierValues.filter((value) => TIER_RANK[value] <= userRank)
  const lockedTiers = tierValues.filter((value) => TIER_RANK[value] > userRank)

  const where: Prisma.SKBExamWhereInput = {
    status: "PUBLISHED",
    ...(q ? { OR: [
      { title: { contains: q, mode: "insensitive" } },
      { bidang: { contains: q, mode: "insensitive" } },
    ] } : {}),
    ...(tier !== "ALL" ? { accessTier: tier as ExamAccessTier } : {}),
    ...(bidang !== "ALL" ? { bidang } : {}),
    ...(state === "DONE" ? { results: { some: { userId: session.userId } } } : {}),
    ...(state === "NOT_DONE" ? { results: { none: { userId: session.userId } } } : {}),
    ...(state === "AVAILABLE" ? { accessTier: { in: accessibleTiers } } : {}),
    ...(state === "LOCKED" ? { accessTier: { in: lockedTiers } } : {}),
  }

  const [exams, totalMatching, totalPublished, doneAll, allBidang] = await Promise.all([
    prisma.sKBExam.findMany({
      where,
      orderBy: getSKBExamOrderBy(sort),
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        _count: { select: { questions: true, results: true } },
        results: {
          where: { userId: session.userId },
          select: { id: true, totalScore: true, scoreTeknis: true, scoreManajerial: true, scoreSosialKultural: true },
        },
      },
    }),
    prisma.sKBExam.count({ where }),
    prisma.sKBExam.count({ where: { status: "PUBLISHED" } }),
    prisma.sKBExamResult.count({ where: { userId: session.userId } }),
    prisma.sKBExam.findMany({
      where: { status: "PUBLISHED" },
      select: { bidang: true },
      distinct: ["bidang"],
      orderBy: { bidang: "asc" },
    }),
  ])

  const totalPages = Math.max(1, Math.ceil(totalMatching / PAGE_SIZE))

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

  const total = totalPublished
  const done = doneAll
  const userBidang = mapJabatanToBidang(user?.jabatan)
  const bidangOptions = allBidang.map((item) => item.bidang)

  return (
    <DashboardShell activeHref="/dashboard/skb" user={{ name: session.name, role: session.role }}>
      <div className="p-4 md:p-8 lg:p-10 w-full space-y-8">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-brand-blue-deep mb-1">
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
              <div className="text-xl font-black text-brand-blue-deep">{done}</div>
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
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-black text-amber-900 text-sm mb-1.5">Tentang Ujian SKB</h3>
            <ul className="text-xs text-amber-800 grid sm:grid-cols-2 gap-1 font-medium">
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
            <h2 className="font-black text-slate-900 text-sm">Ada {totalMatching} Latihan SKB Sesuai Filter</h2>
          </div>
          <ExamFilterToolbar
            basePath="/dashboard/skb"
            q={q}
            tier={tier}
            state={state}
            sort={sort}
            bidang={bidang}
            bidangOptions={bidangOptions}
            page={Math.min(page, totalPages)}
            totalPages={totalPages}
            totalItems={totalMatching}
            pageSize={PAGE_SIZE}
            accent="orange"
          />
          <div className="mt-4">
            <SKBExamListClient exams={examCards} userBidang={userBidang} />
          </div>
        </div>

      </div>
    </DashboardShell>
  )
}
