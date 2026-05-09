"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
  Plus, Search, Pencil, Trash2, Eye, EyeOff,
  Newspaper, Filter, Calendar, Tag, Globe, AlertCircle,
  BarChart3,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { deleteArticle, getArticleById } from "@/app/actions/articles"
import { ArticleEditor, type ArticleEditorData } from "@/components/admin/ArticleEditor"

interface ArticleRow {
  id:          string
  title:       string
  slug:        string
  category:    string | null
  status:      "DRAFT" | "PUBLISHED"
  publishedAt: Date | null
  createdAt:   Date
  tags:        string[]
}

interface Props {
  initialArticles: ArticleRow[]
}

export function ArticlesAdminClient({ initialArticles }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [editorOpen, setEditorOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<ArticleEditorData | null>(null)
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState<"ALL" | "PUBLISHED" | "DRAFT">("ALL")

  const filtered = initialArticles.filter((a) => {
    const matchStatus = filterStatus === "ALL" || a.status === filterStatus
    const q = search.toLowerCase()
    const matchSearch = !q ||
      a.title.toLowerCase().includes(q) ||
      a.slug.toLowerCase().includes(q) ||
      (a.category ?? "").toLowerCase().includes(q) ||
      a.tags.some((t) => t.toLowerCase().includes(q))
    return matchStatus && matchSearch
  })

  function openCreate() {
    setEditTarget(null)
    setEditorOpen(true)
  }

  async function openEdit(a: ArticleRow) {
    const fullArticle = await getArticleById(a.id)
    if (fullArticle) {
      setEditTarget(fullArticle as ArticleEditorData)
      setEditorOpen(true)
    } else {
      alert("Gagal memuat data artikel.")
    }
  }

  function handleDelete(id: string, title: string) {
    if (!confirm(`Hapus artikel "${title}"? Tindakan ini tidak bisa dibatalkan.`)) return
    startTransition(async () => {
      await deleteArticle(id)
      router.refresh()
    })
  }

  const formatDate = (d: Date | null) =>
    d ? new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "-"

  const total     = initialArticles.length
  const published = initialArticles.filter((a) => a.status === "PUBLISHED").length
  const drafts    = initialArticles.filter((a) => a.status === "DRAFT").length

  return (
    <>
      <div className="p-6 md:p-8 space-y-6">

        {/* ── Header ───────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-brand-blue-deep mb-1">
              <Newspaper className="inline w-3.5 h-3.5 mr-1 -mt-0.5" />
              Content Management
            </p>
            <h2 className="text-2xl font-black tracking-tight text-slate-900">Artikel / Blog</h2>
            <p className="text-sm text-slate-500 font-medium mt-0.5">
              Kelola konten blog dan pengaturan SEO untuk COBA PNS.
            </p>
          </div>
          <Button
            onClick={openCreate}
            className="bg-brand-blue-deep hover:bg-brand-blue-deep text-white font-bold flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            Tulis Artikel Baru
          </Button>
        </div>

        {/* ── Stats Row ──────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Artikel",  value: total,     icon: Newspaper,  color: "text-brand-blue bg-blue-50" },
            { label: "Published",      value: published,  icon: Eye,        color: "text-green-600 bg-green-50" },
            { label: "Draft",          value: drafts,     icon: EyeOff,     color: "text-slate-500 bg-slate-100" },
            { label: "Terindeks SEO",  value: published,  icon: BarChart3,  color: "text-purple-600 bg-purple-50" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900">{value}</div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Filter Bar ─────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-colors"
              placeholder="Cari judul, slug, kategori, atau tag..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 outline-none focus:border-blue-500 transition-colors"
            >
              <option value="ALL">Semua Status</option>
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft</option>
            </select>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            {filtered.length} hasil
          </div>
        </div>

        {/* ── Table ──────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-5 py-3 bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <span>Artikel</span>
            <span className="hidden md:block text-center">Kategori</span>
            <span className="text-center">Status</span>
            <span className="hidden lg:block text-center">Tanggal</span>
            <span className="text-right">Aksi</span>
          </div>

          {filtered.length === 0 ? (
            <div className="py-16 text-center">
              <Newspaper className="w-10 h-10 text-slate-200 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-400">
                {search || filterStatus !== "ALL" ? "Tidak ada hasil ditemukan." : "Belum ada artikel. Mulai tulis sekarang!"}
              </p>
              {!search && filterStatus === "ALL" && (
                <button onClick={openCreate} className="text-xs text-brand-blue font-bold hover:underline mt-1">
                  Tulis artikel pertama →
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {filtered.map((article) => (
                <div
                  key={article.id}
                  className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-5 py-4 items-center hover:bg-slate-50/60 transition-colors group"
                >
                  {/* Title + slug */}
                  <div>
                    <p className="text-sm font-bold text-slate-900 group-hover:text-brand-blue-deep transition-colors line-clamp-1">
                      {article.title}
                    </p>
                    <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                      <Globe className="w-2.5 h-2.5" />
                      /artikel/{article.slug}
                    </p>
                    {/* Tags (mobile-visible) */}
                    {article.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5 md:hidden">
                        {article.tags.slice(0, 2).map((tag) => (
                          <span key={tag} className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded-full">
                            <Tag className="w-2 h-2" />{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Category */}
                  <div className="hidden md:block text-center">
                    {article.category ? (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full border bg-blue-50 text-blue-700 border-blue-200">
                        {article.category}
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-300">—</span>
                    )}
                  </div>

                  {/* Status */}
                  <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    article.status === "PUBLISHED"
                      ? "bg-green-50 text-green-700"
                      : "bg-slate-100 text-slate-500"
                  }`}>
                    {article.status === "PUBLISHED"
                      ? <Eye className="w-3 h-3" />
                      : <EyeOff className="w-3 h-3" />}
                    {article.status === "PUBLISHED" ? "Live" : "Draft"}
                  </span>

                  {/* Date */}
                  <div className="hidden lg:flex items-center gap-1 text-[11px] text-slate-400 font-medium whitespace-nowrap">
                    <Calendar className="w-3 h-3" />
                    {article.status === "PUBLISHED"
                      ? formatDate(article.publishedAt)
                      : formatDate(article.createdAt)}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 justify-end">
                    {article.status === "PUBLISHED" && (
                      <a
                        href={`/artikel/${article.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 text-slate-400 hover:text-brand-blue hover:bg-blue-50 rounded-lg transition-colors"
                        title="Lihat publik"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <button
                      onClick={() => openEdit(article)}
                      className="p-2 text-slate-400 hover:text-brand-blue hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(article.id, article.title)}
                      disabled={isPending}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
                      title="Hapus"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SEO Tip */}
        <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-2xl p-4">
          <AlertCircle className="w-4 h-4 text-brand-blue mt-0.5 flex-shrink-0" />
          <p className="text-xs font-medium text-blue-700">
            <strong>Tips SEO:</strong> Isi <em>Meta Title</em> (maks. 60 karakter) dan <em>Meta Description</em> (maks. 160 karakter) agar artikel mudah ditemukan di Google.
          </p>
        </div>
      </div>

      {/* ── Editor Drawer ─────────────────────────────────────── */}
      <ArticleEditor
        initialData={editTarget}
        isOpen={editorOpen}
        onClose={() => setEditorOpen(false)}
      />
    </>
  )
}
