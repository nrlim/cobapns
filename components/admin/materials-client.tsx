"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
  Plus, BookOpen, Video, FileText, Trash2, Pencil,
  Eye, EyeOff, BarChart3, Filter, Search,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { MaterialEditor, type MaterialEditorMaterial } from "@/components/admin/material-editor"
import { deleteMaterial } from "@/app/actions/materials"
import { type MaterialTypeValue, type MaterialTierValue } from "@/lib/material-constants"
import { QuestionCategory } from "@prisma/client"

// ─── Types ────────────────────────────────────────────────────────────────────

interface MaterialRow {
  id: string
  title: string
  slug: string
  category: QuestionCategory
  subCategory: string
  type: MaterialTypeValue
  accessTier: MaterialTierValue
  isPublished: boolean
  order: number
  createdAt: Date
  _count: { progress: number }
}

interface Props {
  initialMaterials: MaterialRow[]
}

// ─── Badge Helpers ────────────────────────────────────────────────────────────

const TYPE_BADGE: Record<MaterialTypeValue, { label: string; icon: React.ElementType; cls: string }> = {
  TEXT:  { label: "Artikel", icon: BookOpen, cls: "bg-blue-50 text-blue-700 border-blue-200" },
  VIDEO: { label: "Video",   icon: Video,    cls: "bg-purple-50 text-purple-700 border-purple-200" },
  PDF:   { label: "PDF",     icon: FileText, cls: "bg-amber-50 text-amber-700 border-amber-200" },
}

const TIER_BADGE: Record<MaterialTierValue, string> = {
  FREE:   "bg-slate-100 text-slate-600",
  ELITE:  "bg-amber-100 text-amber-700",
  MASTER: "bg-violet-100 text-violet-700",
}

const CAT_COLOR: Record<QuestionCategory, string> = {
  TWK: "bg-yellow-50 text-yellow-700 border-yellow-200",
  TIU: "bg-blue-50 text-blue-700 border-blue-200",
  TKP: "bg-purple-50 text-purple-700 border-purple-200",
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function MaterialsClient({ initialMaterials }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [editorOpen, setEditorOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<MaterialEditorMaterial | null>(null)
  const [search, setSearch] = useState("")
  const [filterCat, setFilterCat] = useState<QuestionCategory | "ALL">("ALL")
  const [filterType, setFilterType] = useState<MaterialTypeValue | "ALL">("ALL")

  const filtered = initialMaterials.filter((m) => {
    const matchSearch = m.title.toLowerCase().includes(search.toLowerCase()) ||
                        m.subCategory.toLowerCase().includes(search.toLowerCase())
    const matchCat  = filterCat  === "ALL" || m.category === filterCat
    const matchType = filterType === "ALL" || m.type     === filterType
    return matchSearch && matchCat && matchType
  })

  function openCreate() {
    setEditTarget(null)
    setEditorOpen(true)
  }

  function openEdit(m: MaterialRow) {
    // We need the full material object for the editor — since we only have admin list fields
    // we'll fetch from initialMaterials (if it has content) or just use partial
    setEditTarget({
      id: m.id,
      title: m.title,
      slug: m.slug,
      category: m.category,
      subCategory: m.subCategory,
      type: m.type,
      accessTier: m.accessTier,
      difficulty: "SEDANG",
      content: "",        // Will be re-loaded when editing; user can re-enter
      videoUrl: null,
      pdfUrl: null,
      isPublished: m.isPublished,
      order: m.order,
    })
    setEditorOpen(true)
  }

  function handleDelete(id: string, title: string) {
    if (!confirm(`Hapus materi "${title}"? Semua progress siswa akan ikut terhapus.`)) return
    startTransition(async () => {
      await deleteMaterial(id)
      router.refresh()
    })
  }

  const totalPublished = initialMaterials.filter((m) => m.isPublished).length

  return (
    <>
      {/* ── Header ───────────────────────────────────────────────── */}
      <div className="p-6 md:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-brand-blue-deep mb-1">
              <BookOpen className="inline w-3.5 h-3.5 mr-1 -mt-0.5" />
              Content Management
            </p>
            <h2 className="text-2xl font-black tracking-tight text-slate-900">Material CMS</h2>
            <p className="text-sm text-slate-500 font-medium mt-0.5">
              Kelola modul belajar SKD untuk siswa COBA PNS.
            </p>
          </div>
          <Button
            onClick={openCreate}
            className="bg-brand-blue-deep hover:bg-brand-blue-deep text-white font-bold flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            Tambah Materi
          </Button>
        </div>

        {/* ── Stats Row ──────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Materi",   value: initialMaterials.length,                                           icon: BookOpen,  color: "text-brand-blue bg-blue-50" },
            { label: "Published",      value: totalPublished,                                                    icon: Eye,       color: "text-green-600 bg-green-50" },
            { label: "Draft",          value: initialMaterials.length - totalPublished,                          icon: EyeOff,    color: "text-slate-500 bg-slate-100" },
            { label: "Siswa Belajar",  value: initialMaterials.reduce((s, m) => s + m._count.progress, 0),       icon: BarChart3, color: "text-blue-600 bg-blue-50" },
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
              placeholder="Cari judul atau sub kategori..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterCat}
              onChange={(e) => setFilterCat(e.target.value as QuestionCategory | "ALL")}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 outline-none focus:border-blue-500 transition-colors"
            >
              <option value="ALL">Semua Kategori</option>
              <option value="TWK">TWK</option>
              <option value="TIU">TIU</option>
              <option value="TKP">TKP</option>
            </select>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as MaterialTypeValue | "ALL")}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 outline-none focus:border-blue-500 transition-colors"
            >
              <option value="ALL">Semua Tipe</option>
              <option value="TEXT">📄 Artikel</option>
              <option value="VIDEO">🎥 Video</option>
              <option value="PDF">📎 PDF</option>
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
          <div className="grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-4 px-5 py-3 bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <span>Materi</span>
            <span className="text-center">Kategori</span>
            <span className="text-center">Tipe</span>
            <span className="text-center">Tier</span>
            <span className="text-center">Status</span>
            <span className="text-right">Aksi</span>
          </div>

          {filtered.length === 0 ? (
            <div className="py-16 text-center">
              <BookOpen className="w-10 h-10 text-slate-200 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-400">Belum ada materi ditemukan.</p>
              <button onClick={openCreate} className="text-xs text-brand-blue font-bold hover:underline mt-1">
                Tambah materi pertama →
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {filtered.map((m) => {
                const typeInfo = TYPE_BADGE[m.type]
                const TypeIcon = typeInfo.icon
                return (
                  <div
                    key={m.id}
                    className="grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-4 px-5 py-4 items-center hover:bg-slate-50/60 transition-colors group"
                  >
                    {/* Title + sub */}
                    <div>
                      <p className="text-sm font-bold text-slate-900 group-hover:text-brand-blue-deep transition-colors line-clamp-1">
                        {m.title}
                      </p>
                      <p className="text-[11px] text-slate-400 font-medium">{m.subCategory}</p>
                    </div>

                    {/* Category */}
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${CAT_COLOR[m.category]}`}>
                      {m.category}
                    </span>

                    {/* Type */}
                    <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${typeInfo.cls}`}>
                      <TypeIcon className="w-3 h-3" />
                      {typeInfo.label}
                    </span>

                    {/* Tier */}
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${TIER_BADGE[m.accessTier]}`}>
                      {m.accessTier}
                    </span>

                    {/* Published */}
                    <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      m.isPublished ? "bg-blue-50 text-brand-blue-deep" : "bg-slate-100 text-slate-500"
                    }`}>
                      {m.isPublished ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      {m.isPublished ? "Live" : "Draft"}
                    </span>

                    {/* Actions */}
                    <div className="flex items-center gap-1 justify-end">
                      <button
                        onClick={() => openEdit(m)}
                        className="p-2 text-slate-400 hover:text-brand-blue hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(m.id, m.title)}
                        disabled={isPending}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
                        title="Hapus"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Editor Drawer ─────────────────────────────────────── */}
      <MaterialEditor
        initialData={editTarget}
        isOpen={editorOpen}
        onClose={() => setEditorOpen(false)}
      />
    </>
  )
}
