import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"
import { verifySession } from "@/lib/session"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import {
  CheckCircle2,
  XCircle,
  Trophy,
  TrendingUp,
  BookOpen,
  ArrowRight,
  BarChart2,
  RotateCcw,
  Target,
  Award
} from "lucide-react"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { ReviewExamModal } from "@/components/dashboard/review-modal"
import { ScoreShareModal } from "@/components/dashboard/score-share-modal"
import { ReportButton } from "@/components/shared/report-modal"
import { FeedbackModal } from "@/components/shared/FeedbackModal"
import { hasAccess, type UserTier } from "@/constants/permissions"

export async function generateMetadata({ params }: { params: Promise<{ id: string; resultId: string }> }) {
  return { title: "Hasil Ujian – COBA PNS" }
}

const MAX_SCORES = { TWK: 150, TIU: 175, TKP: 225 }

const LEARNING_LINKS: Record<string, { href: string; label: string }> = {
  TWK: { href: "/dashboard/learning?category=TWK", label: "Belajar Materi TWK — Wawasan Kebangsaan" },
  TIU: { href: "/dashboard/learning?category=TIU", label: "Belajar Materi TIU — Intelegensia Umum" },
  TKP: { href: "/dashboard/learning?category=TKP", label: "Belajar Materi TKP — Karakteristik Pribadi" },
}

export default async function ExamResultPage({
  params,
}: {
  params: Promise<{ id: string; resultId: string }>
}) {
  const { id, resultId } = await params
  const cookieStore = await cookies()
  const token = cookieStore.get("sipns-session")?.value
  const session = token ? await verifySession(token) : null
  if (!session) redirect("/login")

  // Live tier check for PDF access gating
  const dbUser = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { subscriptionTier: true, subscriptionEnds: true, hasGivenFeedback: true },
  })
  const rawTier = dbUser?.subscriptionTier ?? "FREE"
  const effectiveTier: UserTier =
    rawTier !== "FREE" && dbUser?.subscriptionEnds && new Date(dbUser.subscriptionEnds) < new Date()
      ? "FREE" : (rawTier as UserTier)
  const canDownloadPDF = hasAccess(effectiveTier, "ELITE")

  const result = await prisma.examResult.findUnique({
    where: { id: resultId, userId: session.userId, examId: id },
    include: {
      exam: {
        select: {
          title: true,
          passingGradeTWK: true,
          passingGradeTIU: true,
          passingGradeTKP: true,
          durationMinutes: true,
        },
      },
    },
  })
  if (!result) notFound()

  const { exam } = result

  const deficits = {
    TWK: exam.passingGradeTWK - result.scoreTWK,
    TIU: exam.passingGradeTIU - result.scoreTIU,
    TKP: exam.passingGradeTKP - result.scoreTKP,
  }
  const weakest = (Object.entries(deficits) as [string, number][]).sort((a, b) => b[1] - a[1])[0][0]

  const categories = [
    {
      key: "TWK" as const,
      label: "Tes Wawasan Kebangsaan",
      score: result.scoreTWK,
      passing: exam.passingGradeTWK,
      max: MAX_SCORES.TWK,
      pass: result.passTWK,
      color: { bg: "bg-amber-500", light: "bg-amber-50", border: "border-amber-200", text: "text-amber-600" },
    },
    {
      key: "TIU" as const,
      label: "Tes Intelegensia Umum",
      score: result.scoreTIU,
      passing: exam.passingGradeTIU,
      max: MAX_SCORES.TIU,
      pass: result.passTIU,
      color: { bg: "bg-blue-500", light: "bg-blue-50", border: "border-blue-200", text: "text-blue-600" },
    },
    {
      key: "TKP" as const,
      label: "Tes Karakteristik Pribadi",
      score: result.scoreTKP,
      passing: exam.passingGradeTKP,
      max: MAX_SCORES.TKP,
      pass: result.passTKP,
      color: { bg: "bg-purple-500", light: "bg-purple-50", border: "border-purple-200", text: "text-purple-600" },
    },
  ]

  return (
    <DashboardShell activeHref="/dashboard/exams" user={{ name: session.name, role: session.role }}>
      <FeedbackModal 
        hasGivenFeedback={dbUser?.hasGivenFeedback || false} 
        isFreeTier={effectiveTier === "FREE"}
      />
      <div className="p-4 md:p-8 lg:p-10 w-full space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-2">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-brand-blue-deep mb-1">
              Hasil Latihan
            </p>
            <h2 className="text-2xl lg:text-3xl font-black tracking-tight text-slate-900">
              {exam.title}
            </h2>
            <p className="text-slate-500 font-medium mt-1 text-sm">
              Ringkasan nilai dan status kelulusan kamu di latihan ini.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Hero Card */}
          <div className="lg:col-span-2 space-y-6">
            <div
              className={`relative overflow-hidden rounded-3xl p-8 sm:p-10 text-white shadow-sm border ${
                result.overallPass
                  ? "bg-gradient-to-br from-brand-blue-deep via-brand-blue to-blue-500 border-brand-blue-deep"
                  : "bg-gradient-to-br from-slate-800 via-slate-700 to-slate-600 border-slate-900"
              }`}
            >
              {/* Decorative Background */}
              <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
              <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-black/10 rounded-full blur-2xl" />

              <div className="relative z-10 flex flex-col sm:flex-row items-center gap-8 sm:gap-12">
                <div className="flex-1 text-center sm:text-left">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5 shadow-inner ${result.overallPass ? "bg-brand-blue-deep/50" : "bg-slate-900/50"}`}>
                    {result.overallPass ? (
                      <Trophy className="w-8 h-8 text-amber-300" />
                    ) : (
                      <XCircle className="w-8 h-8 text-slate-300" />
                    )}
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-2">
                    {result.overallPass ? "Selamat, Kamu Lolos!" : "Belum Lolos"}
                  </h1>
                  <p className={`text-sm font-medium ${result.overallPass ? "text-blue-100" : "text-slate-300"}`}>
                    {result.overallPass 
                      ? "Skor kamu sudah di atas nilai minimal. Keren, pertahankan terus ya!" 
                      : "Nilai kamu masih di bawah batas minimal. Jangan menyerah, pelajari lagi materinya ya!"}
                  </p>
                </div>

                <div className="flex-shrink-0 text-center">
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl">
                    <div className="text-[10px] font-black text-white/70 uppercase tracking-widest mb-2">Skor Kamu</div>
                    <div className="text-6xl font-black tracking-tighter leading-none mb-1">{result.totalScore}</div>
                    <div className="text-xs text-white/50 font-bold mt-2 pt-2 border-t border-white/10">
                      dari {MAX_SCORES.TWK + MAX_SCORES.TIU + MAX_SCORES.TKP} poin
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sub-Category Breakdown (Bento Grid) */}
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Nilai per Bagian</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {categories.map(({ key, label, score, passing, max, pass, color }) => {
                  const pct = Math.round((score / max) * 100)
                  
                  return (
                    <div key={key} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${color.light} ${color.text}`}>
                            <span className="text-xs font-black">{key}</span>
                          </div>
                        </div>
                        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                          pass
                            ? "bg-blue-50 text-brand-blue-deep border-blue-200"
                            : "bg-red-50 text-red-600 border-red-200"
                        }`}>
                          {pass ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          {pass ? "Lolos" : "Belum Lolos"}
                        </div>
                      </div>

                      <div className="flex items-end gap-2 mb-4">
                        <span className="text-4xl font-black text-slate-900 tracking-tight leading-none">{score}</span>
                        <span className="text-xs font-bold text-slate-400 mb-1">/ {passing}</span>
                      </div>

                      <div className="mt-auto space-y-2">
                        <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                          <span>0</span>
                          <span>Maksimal {max}</span>
                        </div>
                        <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden relative">
                          <div 
                            className={`h-full rounded-full transition-all duration-1000 ${pass ? "bg-blue-500" : "bg-red-500"}`}
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          />
                          {/* Passing mark indicator */}
                          <div 
                            className="absolute top-0 bottom-0 w-1 bg-slate-800 z-10"
                            style={{ left: `${(passing / max) * 100}%` }}
                          />
                        </div>
                        {!pass && (
                          <p className="text-[10px] font-bold text-red-500 pt-1">
                            Butuh {passing - score} poin lagi
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Right Column - Actions & Recommendations */}
          <div className="space-y-6">
            
            {/* Actions Panel */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h3 className="font-black text-slate-900 text-sm mb-4">Apa yang harus dilakukan?</h3>
              <div className="space-y-3">
                <ReviewExamModal examId={result.examId} title={exam.title} />

                {/* Social Share */}
                <ScoreShareModal 
                  data={{
                    userName: session.name,
                    examTitle: exam.title,
                    totalScore: result.totalScore,
                    scoreTWK: result.scoreTWK,
                    scoreTIU: result.scoreTIU,
                    scoreTKP: result.scoreTKP,
                    overallPass: result.overallPass,
                  }} 
                />

                {/* Report Preview */}
                <div className="pt-1 pb-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Download Hasil</p>
                  <ReportButton
                    type="TRYOUT"
                    examResultId={resultId}
                    hasAccess={canDownloadPDF}
                    requiredTier="ELITE"
                    label="Lihat & Simpan Laporan"
                    variant="outline"
                    size="sm"
                  />
                </div>
                
                <Link
                  href={`/dashboard/exams/${result.examId}/lobby`}
                  className="w-full flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50 hover:text-brand-blue-deep text-slate-600 font-bold text-sm transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
                      <RotateCcw className="w-4 h-4" />
                    </div>
                    Coba Lagi
                  </div>
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>

                <Link
                  href="/dashboard/exams"
                  className="w-full flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-600 font-bold text-sm transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center transition-colors">
                      <BarChart2 className="w-4 h-4" />
                    </div>
                    Lihat Semua Latihan
                  </div>
                </Link>
              </div>
            </div>

            {/* AI Recommendation Panel */}
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl border border-indigo-100 shadow-sm p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Target className="w-24 h-24 text-indigo-900" />
              </div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <h3 className="font-black text-indigo-900 text-sm">Saran Belajar</h3>
                </div>
                
                <p className="text-sm font-medium text-indigo-800/80 leading-relaxed mb-5">
                  Berdasarkan hasil tes ini, kami sarankan kamu perdalam lagi materi <span className="font-black text-indigo-900 bg-indigo-200/50 px-1 py-0.5 rounded">{weakest}</span>.
                </p>

                <Link
                  href={LEARNING_LINKS[weakest].href}
                  className="inline-flex items-center justify-center gap-2 w-full py-3 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-white text-sm font-bold transition-colors shadow-sm shadow-indigo-600/20"
                >
                  <BookOpen className="w-4 h-4" />
                  Mulai Belajar {weakest}
                </Link>
              </div>
            </div>

          </div>
        </div>

      </div>
    </DashboardShell>
  )
}
