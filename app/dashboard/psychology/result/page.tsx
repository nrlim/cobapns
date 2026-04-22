// app/dashboard/psychology/result/page.tsx
import { cookies } from "next/headers"
import { verifySession } from "@/lib/session"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { PersonalityRadarChart, IQGauge } from "@/components/dashboard/psychology-charts"
import { ReportButton } from "@/components/shared/report-modal"
import Link from "next/link"
import {
  Brain,
  Zap,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Building2,
  Briefcase,
  ChevronRight,
  CheckCircle2,
  Clock,
} from "lucide-react"

export const metadata = { title: "Hasil Analisis Psikologi – COBA PNS" }

const PERSONALITY_INFO: Record<string, { tagline: string; traits: string[] }> = {
  Analyst:    { tagline: "Pemikir Logis & Terstruktur",   traits: ["Analitis", "Strategis", "Metodis", "Intelektual"] },
  Diplomat:   { tagline: "Kolaborator & Pemersatu",        traits: ["Empati Tinggi", "Persuasif", "Harmonis", "Idealis"] },
  Sentinel:   { tagline: "Pelaksana Andal & Disiplin",     traits: ["Dapat Diandalkan", "Terorganisir", "Loyal", "Teliti"] },
  Explorer:   { tagline: "Inovator & Pemikir Bebas",       traits: ["Kreatif", "Adaptif", "Fleksibel", "Penasaran"] },
  Generalist: { tagline: "Profil Multidimensi & Seimbang", traits: ["Serba Bisa", "Seimbang", "Adaptif"] },
}

const IQ_BANDS = [
  { min: 130, label: "Sangat Superior" },
  { min: 120, label: "Superior" },
  { min: 110, label: "Di Atas Rata-rata" },
  { min: 90,  label: "Rata-rata" },
  { min: 80,  label: "Di Bawah Rata-rata" },
  { min: 0,   label: "Extremely Low" },
]

function DimBar({ label, value, pct }: { label: string; value: number; pct: number }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-[11px] font-bold text-slate-600">{label}</span>
        <span className="text-[11px] font-black text-slate-900">{value}%</span>
      </div>
      <div className="w-full h-2 rounded-full bg-slate-100">
        <div className="h-2 rounded-full bg-teal-500 transition-all duration-700" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export default async function PsychResultPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get("sipns-session")?.value
  const session = token ? await verifySession(token) : null
  if (!session) redirect("/login")

  const [psychResult, iqResult] = await Promise.all([
    prisma.psychometricResult.findUnique({ where: { userId: session.userId } }),
    prisma.iQResult.findUnique({ where: { userId: session.userId } }),
  ])

  if (!psychResult && !iqResult) redirect("/dashboard/psychology")

  const hasPsych = !!psychResult
  const hasIQ    = !!iqResult
  const pInfo    = psychResult?.personalityType ? (PERSONALITY_INFO[psychResult.personalityType] ?? PERSONALITY_INFO.Generalist) : null
  const careerRecs = psychResult?.careerRecs as { positions?: string[]; instansi?: string[] } | null
  const firstName = session.name.split(" ")[0]

  function fmtTime(secs: number) {
    return `${Math.floor(secs / 60)}m ${secs % 60}s`
  }

  return (
    <DashboardShell activeHref="/dashboard/psychology" user={{ name: session.name, role: session.role }}>
      <div className="p-4 md:p-8 lg:p-10 w-full space-y-8">

        {/* ── Page Header ─────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-teal-700 mb-1">Laporan Asesmen</p>
            <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-slate-900">
              Profil {firstName}
            </h1>
            <p className="text-slate-500 font-medium text-sm mt-1">
              Hasil analisis psikologi dan kecerdasan berdasarkan tesmu.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
            <Link
              href="/dashboard/psychology/test"
              className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 px-3 py-2 rounded-lg transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Ulangi Psikotes
            </Link>
            <Link
              href="/dashboard/iq-test"
              className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 px-3 py-2 rounded-lg transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Ulangi Tes IQ
            </Link>
            {/* Report Preview + Download / Print */}
            {hasIQ && (
              <ReportButton
                type="IQ"
                hasAccess={true}
                requiredTier="MASTER"
                label="Laporan IQ"
                variant="ghost"
                size="sm"
              />
            )}
            {hasPsych && (
              <ReportButton
                type="PSYCHOLOGY"
                hasAccess={true}
                requiredTier="MASTER"
                label="Laporan Psikometri"
                variant="primary"
                size="sm"
              />
            )}
          </div>
        </div>

        {/* ── Summary Stat Pills ─────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "Tipe Kepribadian",
              value: psychResult?.personalityType ?? "—",
              sub: pInfo?.tagline ?? "Belum ada data",
              icon: Brain,
              color: "text-teal-600 bg-teal-50 border-teal-100",
            },
            {
              label: "Skor IQ",
              value: iqResult ? String(iqResult.totalIQ) : "—",
              sub: iqResult?.interpretation ?? "Belum ada data",
              icon: Zap,
              color: "text-teal-600 bg-teal-50 border-teal-100",
            },
            {
              label: "Integritas",
              value: psychResult ? `${Math.round(psychResult.integrity)}%` : "—",
              sub: "Skor dimensi integritas",
              icon: CheckCircle2,
              color: "text-green-600 bg-green-50 border-green-100",
            },
            {
              label: "Ketahanan Stres",
              value: psychResult ? `${Math.round(psychResult.stressResilience)}%` : "—",
              sub: "Skor dimensi stres",
              icon: Sparkles,
              color: "text-amber-600 bg-amber-50 border-amber-100",
            },
          ].map(({ label, value, sub, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{label}</p>
                <div className={`w-8 h-8 rounded-lg border flex items-center justify-center ${color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl font-black text-slate-900 tracking-tight mb-1">{value}</div>
              <div className="text-[11px] text-slate-400 font-medium">{sub}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left/Main ───────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Personality Radar */}
            {hasPsych && psychResult && pInfo && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-teal-50 border border-teal-100 rounded-lg flex items-center justify-center">
                      <Brain className="w-4 h-4 text-teal-600" />
                    </div>
                    <div>
                      <p className="font-black text-slate-900 text-sm">Profil Kepribadian – {psychResult.personalityType}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{pInfo.tagline}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {pInfo.traits.slice(0, 3).map(t => (
                      <span key={t} className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 border border-teal-100">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="p-6">
                  <PersonalityRadarChart
                    openness={Math.round(psychResult.openness)}
                    conscientiousness={Math.round(psychResult.conscientiousness)}
                    extraversion={Math.round(psychResult.extraversion)}
                    agreeableness={Math.round(psychResult.agreeableness)}
                    neuroticism={Math.round(psychResult.neuroticism)}
                    integrity={Math.round(psychResult.integrity)}
                    stressResilience={Math.round(psychResult.stressResilience)}
                    teamwork={Math.round(psychResult.teamwork)}
                  />
                </div>
              </div>
            )}

            {!hasPsych && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center">
                <Brain className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                <p className="font-bold text-slate-500 text-sm mb-2">Psikotes belum dikerjakan</p>
                <Link href="/dashboard/psychology/test" className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 hover:underline">
                  Mulai psikotes <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            )}

            {/* IQ Score Card */}
            {hasIQ && iqResult && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-teal-50 border border-teal-100 rounded-lg flex items-center justify-center">
                      <Zap className="w-4 h-4 text-teal-600" />
                    </div>
                    <div>
                      <p className="font-black text-slate-900 text-sm">Hasil Tes IQ</p>
                      <p className="text-[10px] text-slate-400 font-medium">Skor terstandarisasi (Mean 100, SD 15)</p>
                    </div>
                  </div>
                  <span className="text-xs font-black text-teal-700 bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-full">
                    IQ {iqResult.totalIQ}
                  </span>
                </div>

                <div className="p-6">
                  {/* Gauge */}
                  <IQGauge iq={iqResult.totalIQ} />

                  {/* IQ Scale */}
                  <div className="mt-4 space-y-1.5">
                    {IQ_BANDS.map(band => (
                      <div
                        key={band.label}
                        className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                          band.label === iqResult.interpretation
                            ? "bg-teal-700 text-white"
                            : "bg-slate-50 text-slate-500"
                        }`}
                      >
                        <span>{band.label}</span>
                        <span className="font-black opacity-70">{band.min}+</span>
                        {band.label === iqResult.interpretation && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                    ))}
                  </div>

                  {/* Sub-score table */}
                  <div className="mt-5 pt-5 border-t border-slate-100">
                    <h3 className="font-black text-slate-900 text-xs uppercase tracking-widest mb-3">Skor Per Sub-Tes</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: "Verbal",  raw: iqResult.verbalRaw,  total: 15, time: iqResult.verbalTime  },
                        { label: "Numerik", raw: iqResult.numericRaw, total: 12, time: iqResult.numericTime },
                        { label: "Logika",  raw: iqResult.logicRaw,   total: 14, time: iqResult.logicTime   },
                        { label: "Spasial", raw: iqResult.spatialRaw, total: 12, time: iqResult.spatialTime },
                      ].map(({ label, raw, total, time }) => {
                        const pct = Math.round((raw / total) * 100)
                        return (
                          <div key={label} className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-[10px] font-black text-slate-700 uppercase">{label}</span>
                              <span className="flex items-center gap-0.5 text-[10px] text-slate-400 font-medium">
                                <Clock className="w-2.5 h-2.5" /> {fmtTime(time)}
                              </span>
                            </div>
                            <div className="text-lg font-black text-slate-900">{raw}<span className="text-xs text-slate-400 font-medium">/{total}</span></div>
                            <div className="w-full h-1.5 rounded-full bg-slate-200 mt-2">
                              <div className="h-1.5 rounded-full bg-teal-500" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!hasIQ && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center">
                <Zap className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                <p className="font-bold text-slate-500 text-sm mb-2">Tes IQ belum dikerjakan</p>
                <Link href="/dashboard/iq-test" className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 hover:underline">
                  Mulai tes IQ <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            )}
          </div>

          {/* ── Right Sidebar ────────────────────────────────── */}
          <div className="space-y-5">

            {/* Dimension Bars */}
            {hasPsych && psychResult && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/80">
                  <h3 className="font-black text-slate-900 text-sm">Skor per Dimensi</h3>
                </div>
                <div className="p-5 space-y-3">
                  <DimBar label="Keterbukaan"    value={Math.round(psychResult.openness)}          pct={Math.round(psychResult.openness)} />
                  <DimBar label="Kedisiplinan"   value={Math.round(psychResult.conscientiousness)} pct={Math.round(psychResult.conscientiousness)} />
                  <DimBar label="Ekstraversi"    value={Math.round(psychResult.extraversion)}      pct={Math.round(psychResult.extraversion)} />
                  <DimBar label="Keramahan"      value={Math.round(psychResult.agreeableness)}     pct={Math.round(psychResult.agreeableness)} />
                  <DimBar label="Stab. Emosi"    value={Math.round(100-psychResult.neuroticism)}   pct={Math.round(100-psychResult.neuroticism)} />
                  <DimBar label="Integritas"     value={Math.round(psychResult.integrity)}         pct={Math.round(psychResult.integrity)} />
                  <DimBar label="Ketah. Stres"   value={Math.round(psychResult.stressResilience)}  pct={Math.round(psychResult.stressResilience)} />
                  <DimBar label="Kerja Tim"      value={Math.round(psychResult.teamwork)}          pct={Math.round(psychResult.teamwork)} />
                </div>
              </div>
            )}

            {/* Career Recommendations */}
            {hasPsych && careerRecs && (
              <div className="relative bg-gradient-to-br from-teal-800 via-teal-700 to-teal-600 rounded-2xl p-5 text-white overflow-hidden">
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-teal-300" />
                    <h3 className="font-black text-sm">Rekomendasi Jabatan</h3>
                  </div>
                  <p className="text-teal-100 text-xs font-medium mb-4 leading-relaxed">
                    Berdasarkan profil <span className="font-black text-white">{psychResult?.personalityType}</span> kamu.
                  </p>

                  {careerRecs.positions && careerRecs.positions.length > 0 && (
                    <div className="mb-3">
                      <div className="flex items-center gap-1.5 mb-2">
                        <Briefcase className="w-3 h-3 text-teal-300" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-teal-200">Formasi Jabatan</span>
                      </div>
                      <div className="space-y-1.5">
                        {careerRecs.positions.map(p => (
                          <div key={p} className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2">
                            <ChevronRight className="w-3 h-3 text-teal-300 flex-shrink-0" />
                            <span className="text-xs font-bold">{p}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {careerRecs.instansi && careerRecs.instansi.length > 0 && (
                    <div>
                      <div className="flex items-center gap-1.5 mb-2">
                        <Building2 className="w-3 h-3 text-teal-300" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-teal-200">Instansi Ideal</span>
                      </div>
                      <div className="space-y-1.5">
                        {careerRecs.instansi.map(inst => (
                          <div key={inst} className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2">
                            <ChevronRight className="w-3 h-3 text-teal-300 flex-shrink-0" />
                            <span className="text-xs font-bold">{inst}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {(!careerRecs.positions?.length && !careerRecs.instansi?.length) && (
                    <p className="text-xs text-teal-200 font-medium">
                      Tambahkan data jabatan di Admin Panel untuk mengaktifkan rekomendasi.
                    </p>
                  )}
                </div>
                <Sparkles className="absolute right-3 bottom-3 w-16 h-16 text-white/10" />
              </div>
            )}

            {/* Disclaimer */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                * Rekomendasi jabatan bersifat indikatif. Hasil diperbarui setiap kali kamu mengerjakan ulang tes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}
