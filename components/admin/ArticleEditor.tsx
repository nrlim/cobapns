"use client"

import { useState, useEffect, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
  X, Save, Loader2, Newspaper, CheckCircle2, AlertCircle,
  Eye, EyeOff, ChevronDown, ChevronUp, Search as SearchIcon,
  Tag, Image as ImageIcon, Link2, Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { upsertArticle } from "@/app/actions/articles"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ArticleEditorData {
  id:              string
  title:           string
  slug:            string
  excerpt:         string | null
  content:         string
  coverImage:      string | null
  category:        string | null
  status:          "DRAFT" | "PUBLISHED"
  publishedAt:     Date | null
  createdAt:       Date
  tags:            string[]
  metaTitle:       string | null
  metaDescription: string | null
  metaKeywords:    string | null
  ogImage:         string | null
  canonicalUrl:    string | null
}

interface Props {
  initialData?: ArticleEditorData | null
  isOpen:       boolean
  onClose:      () => void
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const labelCls = "block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5"
const fieldCls = "w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-colors"

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 120)
}

const CATEGORIES = ["Tips CPNS", "Berita CPNS", "Materi SKD", "Panduan Pendaftaran", "Motivasi", "Lainnya"]

// ─── Form State ───────────────────────────────────────────────────────────────

interface FormState {
  id?:             string
  title:           string
  slug:            string
  excerpt:         string
  content:         string
  coverImage:      string
  category:        string
  tags:            string[]
  status:          "DRAFT" | "PUBLISHED"
  metaTitle:       string
  metaDescription: string
  metaKeywords:    string
  ogImage:         string
  canonicalUrl:    string
}

const DEFAULTS: FormState = {
  title: "", slug: "", excerpt: "", content: "",
  coverImage: "", category: "", tags: [], status: "DRAFT",
  metaTitle: "", metaDescription: "", metaKeywords: "",
  ogImage: "", canonicalUrl: "",
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ArticleEditor({ initialData, isOpen, onClose }: Props) {
  const isEditing = !!initialData?.id
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [showSeo, setShowSeo] = useState(false)
  const [tagInput, setTagInput] = useState("")
  const [form, setForm] = useState<FormState>(DEFAULTS)

  // Reset form when drawer opens
  useEffect(() => {
    if (isOpen) {
      setForm(
        initialData
          ? {
              id:              initialData.id,
              title:           initialData.title,
              slug:            initialData.slug,
              excerpt:         initialData.excerpt ?? "",
              content:         initialData.content ?? "",
              coverImage:      initialData.coverImage ?? "",
              category:        initialData.category ?? "",
              tags:            initialData.tags,
              status:          initialData.status,
              metaTitle:       initialData.metaTitle ?? "",
              metaDescription: initialData.metaDescription ?? "",
              metaKeywords:    initialData.metaKeywords ?? "",
              ogImage:         initialData.ogImage ?? "",
              canonicalUrl:    initialData.canonicalUrl ?? "",
            }
          : DEFAULTS
      )
      setError(null)
      setSuccess(false)
      setShowSeo(false)
      setTagInput("")
    }
  }, [isOpen, initialData])

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function handleTitleChange(val: string) {
    set("title", val)
    if (!isEditing) set("slug", slugify(val))
  }

  function addTag() {
    const t = tagInput.trim().toLowerCase()
    if (t && !form.tags.includes(t)) set("tags", [...form.tags, t])
    setTagInput("")
  }

  function removeTag(tag: string) {
    set("tags", form.tags.filter((t) => t !== tag))
  }

  function handleSave(status: "DRAFT" | "PUBLISHED") {
    if (!form.title.trim()) { setError("Judul artikel wajib diisi"); return }
    if (!form.slug.trim())  { setError("Slug URL wajib diisi"); return }
    if (!form.content.trim()) { setError("Konten artikel tidak boleh kosong"); return }
    setError(null)
    startTransition(async () => {
      const res = await upsertArticle({
        id:              form.id,
        title:           form.title,
        slug:            form.slug,
        excerpt:         form.excerpt || undefined,
        content:         form.content,
        coverImage:      form.coverImage || undefined,
        category:        form.category || undefined,
        tags:            form.tags,
        status,
        metaTitle:       form.metaTitle || undefined,
        metaDescription: form.metaDescription || undefined,
        metaKeywords:    form.metaKeywords || undefined,
        ogImage:         form.ogImage || undefined,
        canonicalUrl:    form.canonicalUrl || undefined,
      })
      if (res.success) {
        setSuccess(true)
        router.refresh()
        setTimeout(() => { onClose(); setSuccess(false) }, 800)
      } else {
        setError(res.error ?? "Terjadi kesalahan")
      }
    })
  }

  const metaTitleLen = form.metaTitle.length
  const metaDescLen  = form.metaDescription.length

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      )}

      {/* Side Drawer */}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-full md:w-[700px] lg:w-[800px] bg-white shadow-2xl transition-transform duration-300 flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60 flex-shrink-0">
          <div>
            <h2 className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-2">
              <Newspaper className="w-5 h-5 text-brand-blue" />
              {isEditing ? "Edit Artikel" : "Tulis Artikel Baru"}
            </h2>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-0.5">
              COBA PNS — Blog & SEO Editor
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-slate-200">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* ── Body ───────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">

          {/* ── Content Block ── */}
          <div className="bg-slate-50 rounded-2xl border border-slate-100 p-5 space-y-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Konten Artikel</p>

            {/* Title */}
            <div>
              <label className={labelCls}>Judul Artikel *</label>
              <Input
                value={form.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Judul yang menarik dan mengandung kata kunci..."
                className="bg-white border-slate-200 text-base font-semibold"
              />
            </div>

            {/* Slug */}
            <div>
              <label className={labelCls}>Slug URL *</label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-mono flex-shrink-0">/artikel/</span>
                <Input
                  value={form.slug}
                  onChange={(e) => set("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                  placeholder="url-artikel-saya"
                  className="bg-white border-slate-200 font-mono"
                />
              </div>
            </div>

            {/* Category + Status */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Kategori</label>
                <select
                  value={form.category}
                  onChange={(e) => set("category", e.target.value)}
                  className={fieldCls}
                >
                  <option value="">— Pilih Kategori —</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Cover Image URL</label>
                <Input
                  value={form.coverImage}
                  onChange={(e) => set("coverImage", e.target.value)}
                  placeholder="https://..."
                  className="bg-white border-slate-200 font-mono text-xs"
                />
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className={labelCls}>
                <Tag className="inline w-3 h-3 mr-1" />Tags
              </label>
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag() } }}
                  placeholder="Ketik lalu Enter..."
                  className="bg-white border-slate-200"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                >+</button>
              </div>
              {form.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {form.tags.map((tag) => (
                    <span key={tag} className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-brand-blue-deep border border-blue-200 rounded-full">
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500 transition-colors ml-0.5">×</button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Excerpt */}
            <div>
              <label className={labelCls}>Ringkasan / Excerpt</label>
              <textarea
                value={form.excerpt}
                onChange={(e) => set("excerpt", e.target.value)}
                rows={2}
                placeholder="Deskripsi singkat artikel (ditampilkan di halaman daftar)..."
                className={`${fieldCls} resize-none`}
              />
            </div>
          </div>

          {/* ── Main Content ── */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-900 border-l-4 border-brand-blue pl-2">
                Konten Artikel (Markdown) *
              </label>
              <span className="text-[10px] font-mono text-slate-400">{form.content.length} chars</span>
            </div>
            <textarea
              value={form.content}
              onChange={(e) => set("content", e.target.value)}
              rows={14}
              placeholder={`# Judul\n\nTulis konten artikel di sini...\n\n## Sub Judul\n\n**Bold**, *italic*, - list\n\n> Kutipan penting`}
              className="w-full p-4 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-mono resize-y leading-relaxed"
            />
            <p className="text-[10px] text-slate-400 font-medium">
              Mendukung Markdown: **bold**, *italic*, # Heading, - list, `code`
            </p>
          </div>

          {/* ── SEO Settings (collapsible) ── */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <button
              type="button"
              onClick={() => setShowSeo((v) => !v)}
              className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                  <SearchIcon className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">Pengaturan SEO</p>
                  <p className="text-[11px] text-slate-500">Meta title, description, keywords, Open Graph</p>
                </div>
              </div>
              {showSeo ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>

            {showSeo && (
              <div className="border-t border-slate-100 px-5 py-5 space-y-4">
                {/* Meta Title */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className={labelCls}>Meta Title</label>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-mono ${metaTitleLen > 60 ? "text-red-500" : "text-slate-400"}`}>
                        {metaTitleLen}/60
                      </span>
                      <button
                        type="button"
                        onClick={() => set("metaTitle", form.title.slice(0, 60))}
                        className="flex items-center gap-1 text-[10px] text-brand-blue font-bold hover:underline"
                      >
                        <Sparkles className="w-3 h-3" /> Auto
                      </button>
                    </div>
                  </div>
                  <Input
                    value={form.metaTitle}
                    onChange={(e) => set("metaTitle", e.target.value)}
                    placeholder="Judul untuk mesin pencari (maks. 60 karakter)"
                    maxLength={70}
                    className="bg-white border-slate-200"
                  />
                </div>

                {/* Meta Description */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className={labelCls}>Meta Description</label>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-mono ${metaDescLen > 160 ? "text-red-500" : "text-slate-400"}`}>
                        {metaDescLen}/160
                      </span>
                      <button
                        type="button"
                        onClick={() => set("metaDescription", form.excerpt.slice(0, 160))}
                        className="flex items-center gap-1 text-[10px] text-brand-blue font-bold hover:underline"
                      >
                        <Sparkles className="w-3 h-3" /> Auto
                      </button>
                    </div>
                  </div>
                  <textarea
                    value={form.metaDescription}
                    onChange={(e) => set("metaDescription", e.target.value)}
                    rows={2}
                    placeholder="Deskripsi untuk mesin pencari (maks. 160 karakter)"
                    maxLength={180}
                    className={`${fieldCls} resize-none`}
                  />
                </div>

                {/* Keywords + OG Image */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Meta Keywords</label>
                    <Input
                      value={form.metaKeywords}
                      onChange={(e) => set("metaKeywords", e.target.value)}
                      placeholder="cpns 2025, tips skd..."
                      className="bg-white border-slate-200"
                    />
                  </div>
                  <div>
                    <label className={labelCls}>
                      <ImageIcon className="inline w-3 h-3 mr-1" /> OG Image URL
                    </label>
                    <Input
                      value={form.ogImage}
                      onChange={(e) => set("ogImage", e.target.value)}
                      placeholder="https://..."
                      className="bg-white border-slate-200 font-mono text-xs"
                    />
                  </div>
                </div>

                {/* Canonical */}
                <div>
                  <label className={labelCls}>
                    <Link2 className="inline w-3 h-3 mr-1" />Canonical URL
                  </label>
                  <Input
                    value={form.canonicalUrl}
                    onChange={(e) => set("canonicalUrl", e.target.value)}
                    placeholder="https://cobapns.com/artikel/slug (kosongkan jika sama)"
                    className="bg-white border-slate-200 font-mono text-xs"
                  />
                </div>

                {/* SERP Preview */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Google SERP Preview</p>
                  <div className="space-y-0.5">
                    <div className="text-[#1a0dab] text-[15px] font-medium leading-snug truncate">
                      {form.metaTitle || form.title || "Judul Artikel"}
                    </div>
                    <div className="text-[#006621] text-xs">
                      cobapns.com › artikel › {form.slug || "slug-artikel"}
                    </div>
                    <div className="text-[#545454] text-sm leading-normal line-clamp-2">
                      {form.metaDescription || form.excerpt || "Deskripsi akan tampil di sini..."}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Feedback */}
          {error && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}
          {success && (
            <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 text-brand-blue-deep rounded-xl px-4 py-3">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm font-bold">Tersimpan! Menutup editor...</span>
            </div>
          )}
          <div className="h-2" />
        </div>

        {/* ── Footer ─────────────────────────────────────────────────── */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3 flex-shrink-0">
          {/* Status indicator */}
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
            {form.status === "PUBLISHED"
              ? <><Eye className="w-3.5 h-3.5 text-green-500" /><span className="text-green-600">Dipublikasikan</span></>
              : <><EyeOff className="w-3.5 h-3.5" /> Draft</>}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="font-semibold px-5"
            >
              Batal
            </Button>
            <Button
              type="button"
              onClick={() => handleSave("DRAFT")}
              disabled={isPending || success}
              variant="outline"
              className="font-bold px-5 border-slate-300"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Simpan Draft
            </Button>
            <Button
              type="button"
              onClick={() => handleSave("PUBLISHED")}
              disabled={isPending || success}
              className="bg-brand-blue-deep hover:bg-brand-blue-deep text-white font-bold px-6 flex items-center gap-2 disabled:opacity-60"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : success ? <CheckCircle2 className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {isEditing ? "Simpan & Publish" : "Publish Sekarang"}
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
