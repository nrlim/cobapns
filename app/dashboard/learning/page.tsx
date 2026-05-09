import { cookies } from "next/headers"
import { verifySession } from "@/lib/session"
import { redirect } from "next/navigation"
import { getMaterialsByCategory } from "@/app/actions/materials"
import { type MaterialTypeValue, type MaterialTierValue } from "@/lib/material-constants"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import Link from "next/link"
import {
  BookOpen, Video, FileText, ChevronRight, Lock,
  CheckCircle2, Circle, Star, Zap, GraduationCap,
} from "lucide-react"
import { QuestionCategory } from "@prisma/client"

export const metadata = {
  title: "Learning Hub – COBA PNS",
  description: "Belajar materi SKD PNS: TWK, TIU, TKP. Modul lengkap, video, dan e-book.",
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const TYPE_ICON: Record<MaterialTypeValue, React.ElementType> = {
  TEXT:  BookOpen,
  VIDEO: Video,
  PDF:   FileText,
}

const TYPE_LABEL: Record<MaterialTypeValue, string> = {
  TEXT:  "Artikel",
  VIDEO: "Video",
  PDF:   "PDF",
}

const TYPE_COLOR: Record<MaterialTypeValue, string> = {
  TEXT:  "text-blue-500 bg-blue-50",
  VIDEO: "text-purple-500 bg-purple-50",
  PDF:   "text-amber-500 bg-amber-50",
}

const TIER_LOCKED = (tier: MaterialTierValue, userTier: string): boolean => {
  if (tier === "FREE") return false
  if (tier === "ELITE") return userTier === "FREE"
  if (tier === "MASTER") return userTier !== "PREMIUM"
  return false
}

const CAT_META: Record<QuestionCategory, {
  title: string; desc: string; color: string; border: string; bg: string; icon: string
}> = {
  TWK: {
    title: "Tes Wawasan Kebangsaan",
    desc: "Pancasila, UUD 1945, NKRI, dan Bhinneka Tunggal Ika",
    color: "text-amber-700", border: "border-amber-200", bg: "from-amber-50 to-amber-100/50",
    icon: "🏛️",
  },
  TIU: {
    title: "Tes Intelegensia Umum",
    desc: "Verbal, numerik, figural, analogi, dan penalaran logis",
    color: "text-blue-700", border: "border-blue-200", bg: "from-blue-50 to-blue-100/50",
    icon: "🧠",
  },
  TKP: {
    title: "Tes Karakteristik Pribadi",
    desc: "Pelayanan publik, jejaring kerja, dan integritas diri",
    color: "text-purple-700", border: "border-purple-200", bg: "from-purple-50 to-purple-100/50",
    icon: "💡",
  },
}

// ─── Mastery Progress Ring ────────────────────────────────────────────────────

function ProgressRing({ pct, color }: { pct: number; color: string }) {
  const r = 28
  const circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ

  return (
    <svg width="72" height="72" viewBox="0 0 72 72" className="flex-shrink-0">
      <circle cx="36" cy="36" r={r} stroke="#e2e8f0" strokeWidth="5" fill="none" />
      <circle
        cx="36" cy="36" r={r}
        stroke={color}
        strokeWidth="5"
        fill="none"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 36 36)"
        style={{ transition: "stroke-dashoffset 1s ease" }}
      />
      <text x="36" y="40" textAnchor="middle" fontSize="13" fontWeight="800" fill="#0f172a">
        {pct}%
      </text>
    </svg>
  )
}

// ─── Material Card ────────────────────────────────────────────────────────────

interface MaterialCardProps {
  id: string
  title: string
  slug: string
  subCategory: string
  type: MaterialTypeValue
  accessTier: MaterialTierValue
  completed: boolean
  locked: boolean
}

function MaterialCard({ title, slug, subCategory, type, completed, locked }: MaterialCardProps) {
  const Icon = TYPE_ICON[type]
  const typeColor = TYPE_COLOR[type]

  if (locked) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-xl border border-dashed border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed">
        <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <Lock className="w-4 h-4 text-slate-400" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold text-slate-500 line-clamp-1">{title}</p>
          <p className="text-[10px] text-slate-400">Buka dengan Upgrade Paket</p>
        </div>
      </div>
    )
  }

  return (
    <Link
      href={`/dashboard/learning/${slug}`}
      className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-white hover:border-blue-200 hover:shadow-sm transition-all group"
    >
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${typeColor}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold text-slate-800 group-hover:text-brand-blue-deep transition-colors line-clamp-1">{title}</p>
        <p className="text-[10px] text-slate-400 font-medium">{subCategory} · {TYPE_LABEL[type]}</p>
      </div>
      {completed
        ? <CheckCircle2 className="w-4 h-4 text-blue-500 flex-shrink-0" />
        : <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-brand-blue-light flex-shrink-0 transition-colors" />
      }
    </Link>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function LearningHubPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get("sipns-session")?.value
  const session = token ? await verifySession(token) : null
  if (!session) redirect("/login")

  const { grouped, masteryTWK, masteryTIU, masteryTKP, totalCompleted, total } =
    await getMaterialsByCategory(session.userId)

  const masteryMap: Record<QuestionCategory, number> = {
    TWK: masteryTWK,
    TIU: masteryTIU,
    TKP: masteryTKP,
  }

  const masteryColorMap: Record<QuestionCategory, string> = {
    TWK: "#f59e0b",
    TIU: "#3b82f6",
    TKP: "#a855f7",
  }

  const categories: QuestionCategory[] = ["TWK", "TIU", "TKP"]

  return (
    <DashboardShell activeHref="/dashboard/learning" user={{ name: session.name, role: session.role }}>
      <div className="p-4 md:p-8 lg:p-10 w-full space-y-8">

        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-brand-blue-deep mb-1">
              <GraduationCap className="inline w-3.5 h-3.5 mr-1 -mt-0.5" />
              Learning Hub
            </p>
            <h2 className="text-2xl lg:text-3xl font-black tracking-tight text-slate-900">
              Ruang Belajar Mandiri
            </h2>
            <p className="text-slate-500 font-medium mt-1 text-sm">
              Pelajari materi pilihan untuk tingkatkan skor TWK, TIU, dan TKP kamu.
            </p>
          </div>
          {total > 0 && (
            <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 px-4 py-3 rounded-2xl flex-shrink-0">
              <CheckCircle2 className="w-5 h-5 text-brand-blue" />
              <div>
                <div className="text-lg font-black text-brand-blue-deep">{totalCompleted}<span className="text-sm font-semibold text-brand-blue">/{total}</span></div>
                <div className="text-[10px] text-brand-blue font-bold uppercase tracking-widest">Materi Dipelajari</div>
              </div>
            </div>
          )}
        </div>

        {/* ── Quick Filter Row ───────────────────────────────────── */}
        <div className="flex gap-3 overflow-x-auto pb-1">
          {[
            { label: "Semua", icon: BookOpen, href: "/dashboard/learning" },
            { label: "Video Belajar", icon: Video, href: "/dashboard/learning?type=VIDEO" },
            { label: "E-Book & PDF", icon: FileText, href: "/dashboard/learning?type=PDF" },
            { label: "Ringkasan Materi",  icon: Zap,      href: "/dashboard/learning?type=TEXT" },
          ].map(({ label, icon: Icon, href }) => (
            <Link
              key={label}
              href={href}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-full text-xs font-bold text-slate-600 hover:border-blue-500 hover:text-brand-blue-deep transition-colors whitespace-nowrap flex-shrink-0"
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </Link>
          ))}
        </div>

        {total === 0 ? (
          /* ── Empty State ────────────────────────────────────────── */
          <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-16 text-center">
            <GraduationCap className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <h3 className="font-black text-slate-900 mb-2">Materi Belum Tersedia</h3>
            <p className="text-sm text-slate-400 font-medium">
              Sabar ya, tim kami sedang menyiapkan modul belajar terbaik untukmu. Cek lagi nanti!
            </p>
          </div>
        ) : (
          /* ── Category Cards Grid ─────────────────────────────────── */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {categories.map((cat) => {
              const meta    = CAT_META[cat]
              const items   = grouped[cat]
              const mastery = masteryMap[cat]
              const color   = masteryColorMap[cat]

              return (
                <div
                  key={cat}
                  className={`bg-gradient-to-br ${meta.bg} rounded-2xl border ${meta.border} overflow-hidden flex flex-col`}
                >
                  {/* Card Header */}
                  <div className="px-5 pt-5 pb-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-2xl mb-1">{meta.icon}</div>
                        <h3 className={`font-black text-sm ${meta.color}`}>{cat}</h3>
                        <p className="text-[11px] font-bold text-slate-500">{meta.title}</p>
                        <p className="text-[10px] text-slate-400 font-medium mt-0.5 line-clamp-2">{meta.desc}</p>
                      </div>
                      <ProgressRing pct={mastery} color={color} />
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-3">
                      <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1">
                        <span>{items.filter((i) => i.completed).length} dari {items.length} materi</span>
                        <span>Sudah Paham {mastery}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-white/60">
                        <div
                          className="h-1.5 rounded-full transition-all duration-700"
                          style={{ width: `${mastery}%`, backgroundColor: color }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className={`border-t ${meta.border} opacity-50`} />

                  {/* Material List */}
                  <div className="px-4 py-4 flex-1 space-y-2 overflow-y-auto max-h-80">
                    {items.length === 0 ? (
                      <div className="text-center py-6">
                        <Circle className="w-6 h-6 text-slate-300 mx-auto mb-2" />
                        <p className="text-xs text-slate-400 font-medium">Materi segera hadir</p>
                      </div>
                    ) : (
                      items.map((m) => (
                        <MaterialCard
                          key={m.id}
                          id={m.id}
                          title={m.title}
                          slug={m.slug}
                          subCategory={m.subCategory}
                          type={m.type}
                          accessTier={m.accessTier}
                          completed={m.completed}
                          locked={TIER_LOCKED(m.accessTier, session.role)}
                        />
                      ))
                    )}
                  </div>

                  {/* Card Footer */}
                  {items.length > 0 && (
                    <div className={`px-4 py-3 border-t ${meta.border} bg-white/30`}>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                        <Star className="w-3 h-3" />
                        {items.filter((m) => m.type === "VIDEO").length} video ·{" "}
                        {items.filter((m) => m.type === "PDF").length} PDF ·{" "}
                        {items.filter((m) => m.type === "TEXT").length} artikel
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </DashboardShell>
  )
}
