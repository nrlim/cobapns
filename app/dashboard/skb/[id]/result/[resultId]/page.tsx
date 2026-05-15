import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"
import { verifySession } from "@/lib/session"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import {
  Trophy,
  TrendingUp,
  BookOpen,
  ArrowRight,
  BarChart2,
  RotateCcw,
  Target,
} from "lucide-react"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"

export async function generateMetadata() {
  return { title: "Hasil Ujian SKB – COBA PNS" }
}

// SKB tidak punya passing grade fixed — tampilkan skor absolut dan persentase
const MAX_SCORES = {
  TEKNIS: 125,        // 25 soal × 5 poin
  MANAJERIAL: 125,    // 25 soal × 5 poin
  SOSIAL_KULTURAL: 100, // 20 soal × 5 poin
}

export default async function SKBResultPage({
  params,
}: {
  params: Promise<{ id: string; resultId: string }>
}) {
  const { id, resultId } = await params
  const cookieStore = await cookies()
  const token = cookieStore.get("sipns-session")?.value
  const session = token ? await verifySession(token) : null
  if (!session) redirect("/login")

  const result = await prisma.sKBExamResult.findUnique({
    where: { id: resultId, userId: session.userId, examId: id },
    include: {
      exam: {
        select: { title: true, bidang: true, durationMinutes: true },
      },
    },
  })
  if (!result) notFound()

  const { exam } = result
  const maxTotal = MAX_SCORES.TEKNIS + MAX_SCORES.MANAJERIAL + MAX_SCORES.SOSIAL_KULTURAL

  const categories = [
    {
      key: "TEKNIS",
      label: "Kompetensi Teknis",
      score: result.scoreTeknis,
      max: MAX_SCORES.TEKNIS,
      color: { bg: "bg-orange-500", light: "bg-orange-50", border: "border-orange-200", text: "text-orange-600" },
    },
    {
      key: "MANAJERIAL",
      label: "Kompetensi Manajerial",
      score: result.scoreManajerial,
      max: MAX_SCORES.MANAJERIAL,
      color: { bg: "bg-purple-500", light: "bg-purple-50", border: "border-purple-200", text: "text-purple-600" },
    },
    {
      key: "SOSIAL_KULTURAL",
      label: "Sosial Kultural",
      score: result.scoreSosialKultural,
      max: MAX_SCORES.SOSIAL_KULTURAL,
      color: { bg: "bg-teal-500", light: "bg-teal-50", border: "border-teal-200", text: "text-teal-600" },
    },
  ]

  // Find weakest category
  const weakest = categories.sort((a, b) => (a.score / a.max) - (b.score / b.max))[0]
  // Restore original order
  categories.sort((a, b) => ["TEKNIS", "MANAJERIAL", "SOSIAL_KULTURAL"].indexOf(a.key) - ["TEKNIS", "MANAJERIAL", "SOSIAL_KULTURAL"].indexOf(b.key))

  const overallPct = Math.round((result.totalScore / maxTotal) * 100)

  return (
    <DashboardShell activeHref="/dashboard/skb" user={{ name: session.name, role: session.role }}>
      <div className="p-4 md:p-8 lg:p-10 w-full space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-2">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-brand-blue-deep mb-1">
              Hasil Ujian · SKB
            </p>
            <h2 className="text-2xl lg:text-3xl font-black tracking-tight text-slate-900">
              {exam.title}
            </h2>
            <p className="text-slate-500 font-medium mt-1 text-sm">
              Bidang: <span className="font-bold text-slate-700">{exam.bidang}</span> ·
              Ringkasan nilai Seleksi Kompetensi Bidang kamu.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">

            {/* Hero Score Card */}
            <div className="relative overflow-hidden rounded-3xl p-8 sm:p-10 text-white shadow-sm border bg-gradient-to-br from-orange-600 via-orange-500 to-amber-500 border-orange-700">
              <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
              <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-black/10 rounded-full blur-2xl" />

              <div className="relative z-10 flex flex-col sm:flex-row items-center gap-8 sm:gap-12">
                <div className="flex-1 text-center sm:text-left">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5 bg-orange-700/50 shadow-inner">
                    <Trophy className="w-8 h-8 text-amber-200" />
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-2">
                    {overallPct >= 70
                      ? "Performa Baik!"
                      : overallPct >= 50
                      ? "Terus Berlatih!"
                      : "Perlu Peningkatan"}
                  </h1>
                  <p className="text-sm font-medium text-orange-100">
                    {overallPct >= 70
                      ? "Skormu sudah di atas 70%. Pertahankan dan tingkatkan terus!"
                      : "SKB tidak memiliki passing grade nasional — nilai ini menjadi bahan perbandingan antar peserta per instansi."}
                  </p>
                </div>

                <div className="flex-shrink-0 text-center">
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl">
                    <div className="text-[10px] font-black text-white/70 uppercase tracking-widest mb-2">Total Skor</div>
                    <div className="text-6xl font-black tracking-tighter leading-none mb-1">
                      {result.totalScore}
                    </div>
                    <div className="text-xs text-white/50 font-bold mt-2 pt-2 border-t border-white/10">
                      dari {maxTotal} · {overallPct}%
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Category Breakdown */}
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Nilai per Kompetensi</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {categories.map(({ key, label, score, max, color }) => {
                  const pct = Math.round((score / max) * 100)
                  return (
                    <div key={key} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`text-xs font-black px-2 py-0.5 rounded-lg ${color.light} ${color.text} border ${color.border}`}>
                          {key === "SOSIAL_KULTURAL" ? "Sosial" : key}
                        </div>
                        <span className="text-xs font-bold text-slate-400">{pct}%</span>
                      </div>

                      <div className="flex items-end gap-2 mb-4">
                        <span className="text-4xl font-black text-slate-900 tracking-tight leading-none">{score}</span>
                        <span className="text-xs font-bold text-slate-400 mb-1">/ {max}</span>
                      </div>

                      <p className="text-[11px] font-semibold text-slate-500 mb-3">{label}</p>

                      <div className="mt-auto space-y-1.5">
                        <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-1000 ${color.bg}`}
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          />
                        </div>
                        <div className="text-[10px] font-bold text-slate-400">
                          {pct >= 70 ? "✓ Baik" : pct >= 50 ? "Cukup" : "Perlu ditingkatkan"}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* SKB Scoring Note */}
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-xs text-amber-700 font-medium space-y-1">
              <p className="font-bold text-amber-800">📌 Tentang Penilaian SKB</p>
              <p>• <strong>Teknis:</strong> +5 setiap jawaban benar, 0 jika salah.</p>
              <p>• <strong>Manajerial & Sosial Kultural:</strong> Skor 1–5 per jawaban (Likert).</p>
              <p>• SKB tidak memiliki nilai ambang batas nasional — kelulusan ditentukan oleh perbandingan nilai peserta per formasi instansi.</p>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Actions Panel */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h3 className="font-black text-slate-900 text-sm mb-4">Langkah Selanjutnya</h3>
              <div className="space-y-3">
                <Link
                  href="/dashboard/skb"
                  className="w-full flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-200 hover:border-brand-blue hover:bg-blue-50 hover:text-brand-blue-deep text-slate-600 font-bold text-sm transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
                      <RotateCcw className="w-4 h-4" />
                    </div>
                    Coba Ujian SKB Lain
                  </div>
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>

                <Link
                  href="/dashboard/exams"
                  className="w-full flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-600 font-bold text-sm transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                      <BarChart2 className="w-4 h-4" />
                    </div>
                    Try Out SKD
                  </div>
                </Link>

                <Link
                  href="/dashboard/learning"
                  className="w-full flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-600 font-bold text-sm transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    Belajar Materi
                  </div>
                </Link>
              </div>
            </div>

            {/* Weak Area Panel */}
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl border border-orange-100 shadow-sm p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Target className="w-24 h-24 text-orange-900" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <h3 className="font-black text-orange-900 text-sm">Fokus Peningkatan</h3>
                </div>
                <p className="text-sm font-medium text-orange-800/80 leading-relaxed">
                  Berdasarkan hasil ini, tingkatkan kompetensi{" "}
                  <span className="font-black text-orange-900 bg-orange-200/50 px-1 py-0.5 rounded">
                    {weakest.label}
                  </span>{" "}
                  — persentase kamu di kompetensi ini paling rendah.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}
