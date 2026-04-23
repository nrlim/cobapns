import { cookies } from "next/headers"
import { verifySession } from "@/lib/session"
import { redirect, notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { CompletionButton } from "@/components/dashboard/completion-button"
import Link from "next/link"
import {
  ChevronLeft, ChevronRight, BookOpen, Video, FileText,
  Lock, ExternalLink, CheckCircle2, Circle,
} from "lucide-react"
import { type MaterialTypeValue } from "@/lib/material-constants"
import { QuestionCategory } from "@prisma/client"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const mat = await prisma.material.findUnique({ where: { slug, isPublished: true }, select: { title: true } })
  return { title: mat ? `${mat.title} – COBA PNS` : "Materi" }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const CAT_COLOR: Record<QuestionCategory, string> = {
  TWK: "text-amber-700 bg-amber-50 border-amber-200",
  TIU: "text-blue-700 bg-blue-50 border-blue-200",
  TKP: "text-purple-700 bg-purple-50 border-purple-200",
}

const TYPE_ICON: Record<MaterialTypeValue, React.ElementType> = {
  TEXT: BookOpen, VIDEO: Video, PDF: FileText,
}

function renderMarkdown(md: string): string {
  // Basic Markdown → HTML
  return md
    .replace(/^### (.+)$/gm, "<h3 class=\"text-base font-black text-slate-900 mt-6 mb-2\">$1</h3>")
    .replace(/^## (.+)$/gm, "<h2 class=\"text-lg font-black text-slate-900 mt-8 mb-3 border-l-4 border-blue-500 pl-3\">$1</h2>")
    .replace(/^# (.+)$/gm, "<h1 class=\"text-2xl font-black text-slate-900 mb-4\">$1</h1>")
    .replace(/\*\*(.+?)\*\*/g, "<strong class=\"font-black text-slate-900\">$1</strong>")
    .replace(/\*(.+?)\*/g, "<em class=\"italic text-slate-700\">$1</em>")
    .replace(/`(.+?)`/g, "<code class=\"bg-slate-100 text-brand-blue-deep px-1.5 py-0.5 rounded font-mono text-xs\">$1</code>")
    .replace(/^> (.+)$/gm, "<blockquote class=\"border-l-4 border-blue-300 pl-4 text-slate-600 italic my-3 bg-blue-50 py-2 pr-4 rounded-r-lg\">$1</blockquote>")
    .replace(/^- (.+)$/gm, "<li class=\"ml-4 list-disc text-slate-700\">$1</li>")
    .replace(/\n\n/g, "</p><p class=\"text-slate-700 leading-relaxed\">")
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function MaterialReadingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const cookieStore = await cookies()
  const token = cookieStore.get("sipns-session")?.value
  const session = token ? await verifySession(token) : null
  if (!session) redirect("/login")

  // Fetch the material
  const material = await prisma.material.findUnique({
    where: { slug, isPublished: true },
  })
  if (!material) notFound()

  // Check tier access
  const userTier = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { subscriptionTier: true },
  })
  const tier = userTier?.subscriptionTier ?? "FREE"
  const locked =
    (material.accessTier === "ELITE" && tier === "FREE") ||
    (material.accessTier === "MASTER" && tier !== "MASTER")

  // Completion status
  const progress = await prisma.userMaterialProgress.findUnique({
    where: { userId_materialId: { userId: session.userId, materialId: material.id } },
  })
  const completed = progress?.completed ?? false

  // Sidebar: all materials in same category for navigation
  const siblings = await prisma.material.findMany({
    where: { category: material.category, isPublished: true },
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    select: { id: true, title: true, slug: true, type: true },
  })

  // All user progress for sidebar
  const allProgress = await prisma.userMaterialProgress.findMany({
    where: { userId: session.userId },
    select: { materialId: true, completed: true },
  })
  const completedSet = new Set(allProgress.filter((p) => p.completed).map((p) => p.materialId))

  const currentIdx = siblings.findIndex((s) => s.slug === slug)
  const prevMat = currentIdx > 0 ? siblings[currentIdx - 1] : null
  const nextMat = currentIdx < siblings.length - 1 ? siblings[currentIdx + 1] : null

  const TypeIcon = TYPE_ICON[material.type]

  return (
    <DashboardShell activeHref="/dashboard/learning" user={{ name: session.name, role: session.role }}>
      <div className="flex h-full min-h-screen">

        {/* ── Left Sidebar Navigation ───────────────────────── */}
        <aside className="hidden lg:flex flex-col w-64 xl:w-72 flex-shrink-0 border-r border-slate-200 bg-slate-50 h-screen sticky top-0 overflow-y-auto">
          {/* Back to library */}
          <div className="px-4 pt-5 pb-3 border-b border-slate-200">
            <Link
              href="/dashboard/learning"
              className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-brand-blue-deep transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Kembali ke Library
            </Link>
            <div className="mt-3">
              <span className={`text-[10px] font-black px-2 py-0.5 rounded border ${CAT_COLOR[material.category]}`}>
                {material.category}
              </span>
              <p className="text-[11px] font-bold text-slate-500 mt-2 uppercase tracking-widest">Sub-bab</p>
            </div>
          </div>

          {/* Module tree */}
          <nav className="flex-1 px-3 py-4 space-y-1">
            {siblings.map((s) => {
              const SIcon = TYPE_ICON[s.type]
              const isActive = s.slug === slug
              const isDone = completedSet.has(s.id)
              return (
                <Link
                  key={s.id}
                  href={`/dashboard/learning/${s.slug}`}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-bold transition-all ${
                    isActive
                      ? "bg-blue-50 text-brand-blue-deep border border-blue-200 shadow-sm"
                      : "text-slate-600 hover:bg-slate-200/50 hover:text-slate-900"
                  }`}
                >
                  {isDone
                    ? <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                    : <SIcon className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? "text-blue-500" : "text-slate-400"}`} />
                  }
                  <span className="line-clamp-2 leading-tight">{s.title}</span>
                </Link>
              )
            })}
          </nav>
        </aside>

        {/* ── Main Reading Area ─────────────────────────────── */}
        <main className="flex-1 min-w-0 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-4 sm:px-8 py-8 lg:py-10">

            {/* Mobile Back */}
            <div className="lg:hidden mb-4">
              <Link href="/dashboard/learning" className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-brand-blue-deep transition-colors">
                <ChevronLeft className="w-3.5 h-3.5" /> Library
              </Link>
            </div>

            {/* Article Header */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className={`text-[10px] font-black px-2 py-0.5 rounded border ${CAT_COLOR[material.category]}`}>
                  {material.category}
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {material.subCategory}
                </span>
                <span className="flex items-center gap-1 text-[10px] text-slate-400 font-bold">
                  <TypeIcon className="w-3 h-3" />
                  {material.type === "VIDEO" ? "Video Lesson" : material.type === "PDF" ? "E-Book" : "Artikel"}
                </span>
              </div>

              <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight leading-tight mb-3">
                {material.title}
              </h1>

              {completed && (
                <div className="flex flex-wrap items-center gap-4 mt-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-xs font-bold text-brand-blue-deep border border-blue-100 animate-in fade-in slide-in-from-left-4 duration-500">
                    <CheckCircle2 className="w-4 h-4 text-blue-500" />
                    Progress tersimpan
                  </span>
                </div>
              )}
            </div>

            {/* Locked State */}
            {locked ? (
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-2xl p-12 text-center">
                <div className="w-16 h-16 bg-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-slate-400" />
                </div>
                <h2 className="text-lg font-black text-slate-900 mb-2">Konten Terkunci</h2>
                <p className="text-sm text-slate-500 font-medium mb-6">
                  Materi ini hanya tersedia untuk paket{" "}
                  <strong className="text-slate-700">{material.accessTier}</strong>.
                  Upgrade sekarang untuk membuka akses ke semua modul premium.
                </p>
                <Link
                  href="/dashboard/pembelian"
                  className="inline-flex items-center gap-2 bg-brand-blue-deep hover:bg-brand-blue-deep text-white px-6 py-3 rounded-xl font-bold text-sm transition-colors"
                >
                  Upgrade Paket
                </Link>
              </div>
            ) : (
              <>
                {/* Video Embed */}
                {material.videoUrl && (
                  <div className="mb-8 rounded-2xl overflow-hidden bg-slate-900 aspect-video shadow-md">
                    <iframe
                      src={material.videoUrl.replace("watch?v=", "embed/")}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title={material.title}
                    />
                  </div>
                )}

                {/* PDF Link */}
                {material.pdfUrl && (
                  <div className="mb-6 flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-5 py-4">
                    <FileText className="w-5 h-5 text-amber-600 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-amber-900">E-Book / PDF tersedia</p>
                      <p className="text-xs text-amber-700">Unduh atau baca langsung di browser</p>
                    </div>
                    <a
                      href={material.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-shrink-0 flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors"
                    >
                      Buka <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}

                {/* Markdown Content */}
                {material.content && (
                  <article
                    className="prose-content font-[system-ui] text-[15px] leading-[1.8] text-slate-700"
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(material.content) }}
                  />
                )}

                {/* Bottom Sticky Action Bar */}
                <div className="sticky bottom-6 z-20 mt-16 bg-white/80 backdrop-blur-xl border border-slate-200 shadow-2xl shadow-slate-200/50 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 transition-all duration-500">
                  <div className="flex items-center gap-3.5 w-full sm:w-auto text-center sm:text-left">
                    <div className={`hidden sm:flex w-12 h-12 rounded-full items-center justify-center transition-colors duration-500 ${completed ? 'bg-emerald-100' : 'bg-blue-50'}`}>
                      {completed ? <CheckCircle2 className="w-6 h-6 text-emerald-600" /> : <BookOpen className="w-6 h-6 text-blue-500" />}
                    </div>
                    <div>
                      <p className="text-[15px] font-black text-slate-900 leading-tight">
                        {completed ? 'Luar Biasa!' : 'Sudah Paham?'}
                      </p>
                      <p className="text-xs font-semibold text-slate-500 mt-0.5">
                        {completed 
                          ? 'Kamu telah menyelesaikan materi ini.' 
                          : 'Tandai selesai untuk menyimpan progress.'}
                      </p>
                    </div>
                  </div>
                  <div className="w-full sm:w-auto flex justify-center sm:justify-end">
                    <CompletionButton
                      materialId={material.id}
                      initialCompleted={completed}
                    />
                  </div>
                </div>

                {/* Prev / Next Navigation */}
                <div className="mt-6 grid grid-cols-2 gap-4">
                  {prevMat ? (
                    <Link
                      href={`/dashboard/learning/${prevMat.slug}`}
                      className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-sm transition-all group text-left"
                    >
                      <ChevronLeft className="w-5 h-5 text-slate-400 group-hover:text-brand-blue flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sebelumnya</p>
                        <p className="text-xs font-bold text-slate-700 group-hover:text-brand-blue-deep line-clamp-1 transition-colors">
                          {prevMat.title}
                        </p>
                      </div>
                    </Link>
                  ) : <div />}

                  {nextMat ? (
                    <Link
                      href={`/dashboard/learning/${nextMat.slug}`}
                      className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-sm transition-all group text-right justify-end ml-auto w-full"
                    >
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Berikutnya</p>
                        <p className="text-xs font-bold text-slate-700 group-hover:text-brand-blue-deep line-clamp-1 transition-colors">
                          {nextMat.title}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-brand-blue flex-shrink-0" />
                    </Link>
                  ) : <div />}
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </DashboardShell>
  )
}
