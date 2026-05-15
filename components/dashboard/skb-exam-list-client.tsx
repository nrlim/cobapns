"use client"

import Link from "next/link"
import {
  BookOpen,
  Clock,
  Users,
  CheckCircle2,
  Lock,
  ChevronRight,
  RotateCcw,
  Shield,
  Star,
  Crown,
} from "lucide-react"

const TIER_COLOR: Record<string, string> = {
  FREE: "bg-slate-100 text-slate-600 border-slate-200",
  ELITE: "bg-amber-50 text-amber-700 border-amber-200",
  MASTER: "bg-violet-50 text-violet-700 border-violet-200",
}

const TIER_ICON: Record<string, React.ReactNode> = {
  FREE: <Shield className="w-3 h-3" />,
  ELITE: <Star className="w-3 h-3" />,
  MASTER: <Crown className="w-3 h-3" />,
}

export interface SKBExamCardData {
  id: string
  title: string
  bidang: string
  durationMinutes: number
  accessTier: string
  questionCount: number
  resultCount: number
  myResult: {
    id: string
    totalScore: number
    scoreTeknis: number
    scoreManajerial: number
    scoreSosialKultural: number
  } | null
  isLocked: boolean
}

interface SKBExamListClientProps {
  exams: SKBExamCardData[]
  userBidang?: string
}

export function SKBExamListClient({ exams, userBidang }: SKBExamListClientProps) {
  if (exams.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-16 text-center">
        <BookOpen className="w-10 h-10 text-slate-200 mx-auto mb-3" />
        <p className="font-bold text-slate-500 text-sm">Belum ada ujian SKB dipublikasikan.</p>
        <p className="text-slate-400 text-xs mt-1">Cek kembali nanti atau hubungi admin.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4">
      {exams.map((exam) => {
        const attempted = !!exam.myResult
        const isRecommended = userBidang && exam.bidang.toLowerCase() === userBidang.toLowerCase()

        return (
          <div
            key={exam.id}
            className={`bg-white border rounded-2xl shadow-sm overflow-hidden transition-all ${
              exam.isLocked
                ? "border-slate-200 opacity-70"
                : attempted
                ? "border-slate-200 hover:border-slate-300 hover:shadow-md"
                : "border-slate-100 hover:border-orange-200 hover:shadow-md"
            }`}
          >
            {/* Top accent */}
            {!exam.isLocked && !attempted && (
              <div className="h-1 bg-gradient-to-r from-orange-500 to-amber-400" />
            )}
            {!exam.isLocked && attempted && (
              <div className="h-1 bg-gradient-to-r from-green-500 to-green-400" />
            )}

            <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-5">

              {/* Icon */}
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  exam.isLocked
                    ? "bg-slate-100"
                    : attempted
                    ? "bg-brand-blue-deep/5 border border-brand-blue-deep/10"
                    : "bg-brand-blue-deep shadow-lg shadow-brand-blue-deep/20"
                }`}
              >
                {exam.isLocked ? (
                  <Lock className="w-5 h-5 text-slate-400" />
                ) : (
                  <BookOpen
                    className={`w-5 h-5 ${attempted ? "text-brand-blue-deep" : "text-white"}`}
                  />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span
                    className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${TIER_COLOR[exam.accessTier]}`}
                  >
                    {TIER_ICON[exam.accessTier]}
                    {exam.accessTier}
                  </span>
                  <span className="text-[10px] font-bold text-orange-600 bg-orange-50 border border-orange-100 px-2 py-0.5 rounded-full">
                    {exam.bidang}
                  </span>
                  {isRecommended && (
                    <span className="text-[10px] font-black text-green-700 bg-green-50 border border-green-200 px-2.5 py-0.5 rounded-full">
                      ✓ Sesuai Formasimu
                    </span>
                  )}
                  {attempted && (
                    <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full border bg-green-50 text-green-700 border-green-200">
                      ✓ Sudah Dikerjakan
                    </span>
                  )}
                </div>

                <h3 className="font-black text-slate-900 text-base leading-snug mb-2">
                  {exam.title}
                </h3>

                <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 font-medium">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {exam.durationMinutes} menit
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3 h-3" /> {exam.questionCount} soal
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" /> {exam.resultCount} peserta
                  </span>
                  {attempted && exam.myResult && (
                    <span className="flex items-center gap-1 text-brand-blue-deep font-bold">
                      <CheckCircle2 className="w-3 h-3" />
                      Skormu: {exam.myResult.totalScore}
                    </span>
                  )}
                </div>

                {/* Score breakdown if attempted */}
                {attempted && exam.myResult && (
                  <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                    <span className="text-[10px] font-bold bg-orange-50 border border-orange-100 px-2 py-0.5 rounded-md text-orange-600">
                      Teknis: {exam.myResult.scoreTeknis}
                    </span>
                    <span className="text-[10px] font-bold bg-purple-50 border border-purple-100 px-2 py-0.5 rounded-md text-purple-600">
                      Manajerial: {exam.myResult.scoreManajerial}
                    </span>
                    <span className="text-[10px] font-bold bg-teal-50 border border-teal-100 px-2 py-0.5 rounded-md text-teal-600">
                      Sosial: {exam.myResult.scoreSosialKultural}
                    </span>
                  </div>
                )}
              </div>

              {/* CTA */}
              <div className="flex flex-col items-stretch sm:items-end gap-2 flex-shrink-0">
                {exam.isLocked ? (
                  <Link
                    href="/dashboard/pembelian"
                    className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-xl text-xs font-bold transition-colors"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    Upgrade untuk Akses
                  </Link>
                ) : attempted ? (
                  <div className="flex flex-col gap-2">
                    <Link
                      href={`/dashboard/skb/${exam.id}/result/${exam.myResult!.id}`}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Lihat Hasil
                    </Link>
                    <Link
                      href={`/dashboard/skb/${exam.id}/session`}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-blue-deep/5 hover:bg-brand-blue-deep/10 text-brand-blue-deep border border-brand-blue-deep/10 rounded-xl text-xs font-bold transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Ulangi Ujian
                    </Link>
                  </div>
                ) : (
                  <Link
                    href={`/dashboard/skb/${exam.id}/session`}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-brand-blue-deep hover:bg-brand-blue-deep/90 text-white rounded-xl text-sm font-black transition-all shadow-md shadow-brand-blue-deep/20 active:scale-95"
                  >
                    Mulai Ujian SKB
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
