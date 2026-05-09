"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft, Save, Eye, EyeOff, ChevronDown, ChevronUp,
  Globe, Search, Tag, Image as ImageIcon, Link2, AlertCircle, Sparkles, X
} from "lucide-react"
import Link from "next/link"
import { upsertArticle, type ArticleFormValues } from "@/app/actions/articles"

interface ArticleData {
  id:              string
  title:           string
  slug:            string
  excerpt:         string | null
  content:         string
  coverImage:      string | null
  category:        string | null
  tags:            string[]
  status:          "DRAFT" | "PUBLISHED"
  metaTitle:       string | null
  metaDescription: string | null
  metaKeywords:    string | null
  ogImage:         string | null
  canonicalUrl:    string | null
}

interface Props {
  article: ArticleData | null
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 100)
}

const SUGGESTED_CATEGORIES = ["Tips CPNS", "Berita CPNS", "Materi SKD", "Panduan Pendaftaran", "Motivasi", "Lainnya"]

export function ArticleFormClient({ article }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [showSeo, setShowSeo] = useState(false)
  const [tagInput, setTagInput] = useState("")

  const [form, setForm] = useState<ArticleFormValues>({
    id:              article?.id,
    title:           article?.title ?? "",
    slug:            article?.slug ?? "",
    excerpt:         article?.excerpt ?? "",
    content:         article?.content ?? "",
    coverImage:      article?.coverImage ?? "",
    category:        article?.category ?? "",
    tags:            article?.tags ?? [],
    status:          article?.status ?? "DRAFT",
    metaTitle:       article?.metaTitle ?? "",
    metaDescription: article?.metaDescription ?? "",
    metaKeywords:    article?.metaKeywords ?? "",
    ogImage:         article?.ogImage ?? "",
    canonicalUrl:    article?.canonicalUrl ?? "",
  })

  function set<K extends keyof ArticleFormValues>(key: K, value: ArticleFormValues[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function handleTitleChange(val: string) {
    set("title", val)
    if (!article) {
      set("slug", generateSlug(val))
    }
  }

  function handleAutoSeoTitle() {
    set("metaTitle", form.title.slice(0, 60))
  }

  function handleAutoSeoDesc() {
    set("metaDescription", form.excerpt?.slice(0, 160) ?? "")
  }

  function addTag() {
    const t = tagInput.trim().toLowerCase()
    if (t && !form.tags.includes(t)) {
      set("tags", [...form.tags, t])
    }
    setTagInput("")
  }

  function removeTag(tag: string) {
    set("tags", form.tags.filter((t) => t !== tag))
  }

  function handleTagKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      addTag()
    }
  }

  function handleSubmit(status: "DRAFT" | "PUBLISHED") {
    setError(null)
    startTransition(async () => {
      const res = await upsertArticle({ ...form, status })
      if (res.success) {
        router.push("/admin/articles")
      } else {
        setError(res.error ?? "Terjadi kesalahan")
      }
    })
  }

  const metaTitleLen = form.metaTitle?.length ?? 0
  const metaDescLen  = form.metaDescription?.length ?? 0

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/articles"
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {article ? "Edit Artikel" : "Tulis Artikel Baru"}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {article ? `Mengedit: ${article.slug}` : "Buat konten baru untuk blog COBAPNS"}
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-5">
          {/* Title */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Konten Artikel</h2>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Judul Artikel <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Judul yang menarik dan mengandung kata kunci..."
                className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white text-slate-800 text-lg font-semibold placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Slug URL <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                <span className="text-slate-400 text-sm shrink-0">/artikel/</span>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => set("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                  placeholder="url-artikel-saya"
                  className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-800 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>
              <p className="text-xs text-slate-400 mt-1.5">
                Gunakan huruf kecil, angka, dan tanda -. Ini menjadi URL publik artikel.
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Ringkasan / Excerpt</label>
              <textarea
                value={form.excerpt ?? ""}
                onChange={(e) => set("excerpt", e.target.value)}
                rows={3}
                placeholder="Deskripsi singkat artikel (ditampilkan di halaman daftar artikel dan kartu preview)..."
                className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white text-slate-800 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Konten Artikel <span className="text-red-500">*</span>
              </label>
              <textarea
                value={form.content}
                onChange={(e) => set("content", e.target.value)}
                rows={18}
                placeholder="Tulis konten lengkap artikel di sini. Mendukung format Markdown..."
                className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white text-slate-800 text-sm font-mono resize-y focus:outline-none focus:ring-2 focus:ring-blue-500/30 leading-relaxed"
              />
              <p className="text-xs text-slate-400 mt-1.5">Mendukung Markdown: **bold**, *italic*, # Heading, dll.</p>
            </div>
          </div>

          {/* SEO Settings */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <button
              type="button"
              onClick={() => setShowSeo((v) => !v)}
              className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <Search className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-800">Pengaturan SEO</h2>
                  <p className="text-xs text-slate-500">Meta title, description, keywords, Open Graph</p>
                </div>
              </div>
              {showSeo ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
            </button>

            {showSeo && (
              <div className="border-t border-slate-100 p-5 space-y-5">
                {/* Meta Title */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-sm font-semibold text-slate-700">Meta Title</label>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-mono ${metaTitleLen > 60 ? "text-red-500" : "text-slate-400"}`}>
                        {metaTitleLen}/60
                      </span>
                      <button
                        type="button"
                        onClick={handleAutoSeoTitle}
                        className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
                      >
                        <Sparkles className="w-3 h-3" />
                        Auto dari judul
                      </button>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={form.metaTitle ?? ""}
                    onChange={(e) => set("metaTitle", e.target.value)}
                    placeholder="Judul halaman untuk mesin pencari (maks. 60 karakter)"
                    maxLength={70}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                  <p className="text-xs text-slate-400 mt-1">Tampil di tab browser dan hasil pencarian Google.</p>
                </div>

                {/* Meta Description */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-sm font-semibold text-slate-700">Meta Description</label>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-mono ${metaDescLen > 160 ? "text-red-500" : "text-slate-400"}`}>
                        {metaDescLen}/160
                      </span>
                      <button
                        type="button"
                        onClick={handleAutoSeoDesc}
                        className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
                      >
                        <Sparkles className="w-3 h-3" />
                        Auto dari excerpt
                      </button>
                    </div>
                  </div>
                  <textarea
                    value={form.metaDescription ?? ""}
                    onChange={(e) => set("metaDescription", e.target.value)}
                    rows={3}
                    placeholder="Deskripsi singkat untuk mesin pencari (maks. 160 karakter)"
                    maxLength={180}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-800 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>

                {/* Meta Keywords */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Meta Keywords</label>
                  <input
                    type="text"
                    value={form.metaKeywords ?? ""}
                    onChange={(e) => set("metaKeywords", e.target.value)}
                    placeholder="kata kunci 1, kata kunci 2, cpns 2025..."
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                  <p className="text-xs text-slate-400 mt-1">Pisahkan dengan koma. Pengaruhnya ke Google kecil, tapi tetap berguna.</p>
                </div>

                {/* OG Image */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    <span className="inline-flex items-center gap-1.5"><ImageIcon className="w-3.5 h-3.5" /> Open Graph Image URL</span>
                  </label>
                  <input
                    type="url"
                    value={form.ogImage ?? ""}
                    onChange={(e) => set("ogImage", e.target.value)}
                    placeholder="https://cobapns.com/images/artikel/og-image.jpg"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                  <p className="text-xs text-slate-400 mt-1">Gambar yang muncul saat artikel dibagikan di WhatsApp/Twitter/Facebook.</p>
                </div>

                {/* Canonical URL */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    <span className="inline-flex items-center gap-1.5"><Link2 className="w-3.5 h-3.5" /> Canonical URL</span>
                  </label>
                  <input
                    type="url"
                    value={form.canonicalUrl ?? ""}
                    onChange={(e) => set("canonicalUrl", e.target.value)}
                    placeholder="https://cobapns.com/artikel/slug-artikel (kosongkan jika sama)"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                  <p className="text-xs text-slate-400 mt-1">Isi jika artikel ini adalah salinan dari URL lain (mencegah duplicate content).</p>
                </div>

                {/* SERP Preview */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Preview Google SERP</p>
                  <div className="space-y-0.5">
                    <div className="text-[#1a0dab] text-base font-medium leading-snug hover:underline cursor-pointer truncate">
                      {form.metaTitle || form.title || "Judul Artikel"}
                    </div>
                    <div className="text-[#006621] text-xs">
                      cobapns.com/artikel/{form.slug || "slug-artikel"}
                    </div>
                    <div className="text-[#545454] text-sm leading-normal line-clamp-2">
                      {form.metaDescription || form.excerpt || "Deskripsi artikel akan muncul di sini..."}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Publish */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Publikasi</h2>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => handleSubmit("PUBLISHED")}
                disabled={isPending}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-green-500 text-white px-4 py-3 rounded-xl font-bold text-sm shadow-sm hover:shadow-md hover:from-green-700 hover:to-green-600 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Eye className="w-4 h-4" />
                {isPending ? "Menyimpan..." : "Publish Sekarang"}
              </button>
              <button
                type="button"
                onClick={() => handleSubmit("DRAFT")}
                disabled={isPending}
                className="w-full flex items-center justify-center gap-2 bg-slate-100 text-slate-700 px-4 py-3 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                {isPending ? "Menyimpan..." : "Simpan sebagai Draft"}
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400 border-t border-slate-100 pt-3">
              {form.status === "PUBLISHED"
                ? <><Eye className="w-3.5 h-3.5 text-green-500" /> Artikel ini sedang dipublikasikan</>
                : <><EyeOff className="w-3.5 h-3.5" /> Artikel ini masih draft</>
              }
            </div>
          </div>

          {/* Cover Image */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Cover Image</h2>
            <div>
              <input
                type="url"
                value={form.coverImage ?? ""}
                onChange={(e) => set("coverImage", e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>
            {form.coverImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={form.coverImage}
                alt="Cover preview"
                className="w-full h-36 object-cover rounded-xl border border-slate-100"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
              />
            )}
          </div>

          {/* Category */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Kategori</h2>
            <input
              type="text"
              value={form.category ?? ""}
              onChange={(e) => set("category", e.target.value)}
              placeholder="Contoh: Tips CPNS"
              list="category-suggestions"
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
            <datalist id="category-suggestions">
              {SUGGESTED_CATEGORIES.map((c) => <option key={c} value={c} />)}
            </datalist>
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTED_CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => set("category", c)}
                  className={`px-2.5 py-1 text-xs rounded-full border transition-all ${
                    form.category === c
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-slate-600 border-slate-200 hover:border-blue-400"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <Tag className="w-4 h-4" /> Tags
            </h2>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder="Ketik lalu Enter..."
                className="flex-1 px-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-3 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors"
              >
                +
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {form.tags.map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 text-xs rounded-full font-medium border border-blue-200">
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-600 transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {form.tags.length === 0 && (
                <p className="text-xs text-slate-400">Belum ada tag. Tambahkan untuk meningkatkan SEO.</p>
              )}
            </div>
          </div>

          {/* SEO Quick Check */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <Globe className="w-4 h-4 text-green-600" /> SEO Checklist
            </h2>
            <div className="space-y-2">
              {[
                { label: "Judul artikel", ok: form.title.length >= 3 },
                { label: "Slug URL", ok: form.slug.length >= 2 },
                { label: "Excerpt / ringkasan", ok: (form.excerpt?.length ?? 0) >= 10 },
                { label: "Meta title (≤60 char)", ok: metaTitleLen > 0 && metaTitleLen <= 60 },
                { label: "Meta description (≤160)", ok: metaDescLen > 0 && metaDescLen <= 160 },
                { label: "Cover image", ok: !!form.coverImage },
                { label: "Kategori", ok: !!form.category },
                { label: "Tags (minimal 1)", ok: form.tags.length >= 1 },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2 text-xs">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                    item.ok ? "bg-green-100 text-green-600" : "bg-slate-100 text-slate-400"
                  }`}>
                    {item.ok ? "✓" : "○"}
                  </div>
                  <span className={item.ok ? "text-slate-700" : "text-slate-400"}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
