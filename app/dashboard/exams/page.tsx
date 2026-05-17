import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"
import { verifySession } from "@/lib/session"
import { redirect } from "next/navigation"
import { AlertCircle } from "lucide-react"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { ExamListClient, type ExamCardData } from "@/components/dashboard/exam-list-client"
import { ExamFilterToolbar } from "@/components/dashboard/exam-filter-toolbar"
import { ExamAccessTier, Prisma } from "@prisma/client"

export const metadata = {
  title: "Try Out CAT – COBA PNS",
  description: "Daftar ujian Try Out CAT PNS yang tersedia untukmu.",
}

const SUBSCRIPTION_RANK: Record<string, number> = { FREE: 0, ELITE: 1, MASTER: 2 }
const TIER_RANK: Record<string, number>          = { FREE: 0, ELITE: 1, MASTER: 2 }
const PAGE_SIZE = 8

function normalizeParam(value: string | string[] | undefined, fallback = "") {
  return typeof value === "string" ? value : fallback
}

function getExamOrderBy(sort: string): Prisma.ExamOrderByWithRelationInput[] {
  if (sort === "popular") return [{ results: { _count: "desc" } }, { createdAt: "desc" }]
  if (sort === "questions") return [{ questions: { _count: "desc" } }, { createdAt: "desc" }]
  if (sort === "duration") return [{ durationMinutes: "desc" }, { createdAt: "desc" }]
  if (sort === "title") return [{ title: "asc" }]
  return [{ createdAt: "desc" }]
}

export default async function StudentExamsPage({
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
    select: { subscriptionTier: true },
  })

  const userRank = SUBSCRIPTION_RANK[user?.subscriptionTier ?? "FREE"]
  const params = await searchParams
  const q = normalizeParam(params?.q).trim()
  const tier = normalizeParam(params?.tier, "ALL")
  const state = normalizeParam(params?.state, "ALL")
  const sort = normalizeParam(params?.sort, "newest")
  const requestedPage = Number(normalizeParam(params?.page, "1"))
  const page = Number.isFinite(requestedPage) && requestedPage > 0 ? Math.floor(requestedPage) : 1

  const tierValues = ["FREE", "ELITE", "MASTER"] as const
  const accessibleTiers = tierValues.filter((value) => TIER_RANK[value] <= userRank)
  const lockedTiers = tierValues.filter((value) => TIER_RANK[value] > userRank)

  const where: Prisma.ExamWhereInput = {
    status: "PUBLISHED",
    ...(q ? { title: { contains: q, mode: "insensitive" } } : {}),
    ...(tier !== "ALL" ? { accessTier: tier as ExamAccessTier } : {}),
    ...(state === "DONE" ? { results: { some: { userId: session.userId } } } : {}),
    ...(state === "NOT_DONE" ? { results: { none: { userId: session.userId } } } : {}),
    ...(state === "AVAILABLE" ? { accessTier: { in: accessibleTiers } } : {}),
    ...(state === "LOCKED" ? { accessTier: { in: lockedTiers } } : {}),
  }

  const [exams, totalMatching, totalPublished, doneAll, passedAll] = await Promise.all([
    prisma.exam.findMany({
      where,
      orderBy: getExamOrderBy(sort),
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        _count: { select: { questions: true, results: true } },
        results: {
          where: { userId: session.userId },
          select: { id: true, overallPass: true, totalScore: true },
        },
      },
    }),
    prisma.exam.count({ where }),
    prisma.exam.count({ where: { status: "PUBLISHED" } }),
    prisma.examResult.count({ where: { userId: session.userId } }),
    prisma.examResult.count({ where: { userId: session.userId, overallPass: true } }),
  ])

  const totalPages = Math.max(1, Math.ceil(totalMatching / PAGE_SIZE))

  // Serialize to plain objects for the client component
  const examCards: ExamCardData[] = exams.map((e) => ({
    id: e.id,
    title: e.title,
    durationMinutes: e.durationMinutes,
    passingGradeTWK: e.passingGradeTWK,
    passingGradeTIU: e.passingGradeTIU,
    passingGradeTKP: e.passingGradeTKP,
    accessTier: e.accessTier,
    questionCount: e._count.questions,
    resultCount: e._count.results,
    myResult: e.results[0]
      ? { id: e.results[0].id, overallPass: e.results[0].overallPass, totalScore: e.results[0].totalScore }
      : null,
    isLocked: TIER_RANK[e.accessTier] > userRank,
  }))

  const total = totalPublished
  const done = doneAll
  const passed = passedAll

  return (
    <DashboardShell activeHref="/dashboard/exams" user={{ name: session.name, role: session.role }}>
      <div className="p-4 md:p-8 lg:p-10 w-full space-y-8">

        {/* ── Page Header ────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-brand-blue-deep mb-1">Simulasi CAT PNS</p>
            <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-slate-900">Pilih Latihan Try Out</h1>
            <p className="text-slate-500 font-medium text-sm mt-1">
              Yuk, asah kemampuanmu dengan mengerjakan simulasi ujian CAT yang sesungguhnya.
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
              <div className="text-xl font-black text-green-600">{passed}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Berhasil</div>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div className="text-center">
              <div className="text-xl font-black text-slate-900">{total}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tersedia</div>
            </div>
          </div>
        </div>

        {/* ── Rules Banner ───────────────────────────────── */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-black text-amber-900 text-sm mb-1.5">Aturan Pengerjaan Ujian</h3>
            <ul className="text-xs text-amber-800 grid sm:grid-cols-2 gap-1 font-medium">
              <li>• Bisa dikerjakan lewat Laptop atau HP (Chrome).</li>
              <li>• Jawabanmu akan langsung tersimpan otomatis.</li>
              <li>• Waktu terus berjalan meski aplikasi ditutup.</li>
              <li>• TWK &amp; TIU: +5 benar, 0 salah. TKP: 1–5 poin.</li>
            </ul>
          </div>
        </div>

        {/* ── Exam List (client — owns the modal) ────────── */}
        <div>
          <div className="mb-4">
            <h2 className="font-black text-slate-900 text-sm">Ada {totalMatching} Latihan Sesuai Filter</h2>
          </div>
          <ExamFilterToolbar
            basePath="/dashboard/exams"
            q={q}
            tier={tier}
            state={state}
            sort={sort}
            page={Math.min(page, totalPages)}
            totalPages={totalPages}
            totalItems={totalMatching}
            pageSize={PAGE_SIZE}
          />
          <div className="mt-4">
            <ExamListClient exams={examCards} />
          </div>
        </div>

      </div>
    </DashboardShell>
  )
}
