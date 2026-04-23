"use client"

import { useState, useEffect, useTransition } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  X, Save, Loader2, BookOpen, CheckCircle2, AlertCircle,
  Video, FileText, AlignLeft, Eye, EyeOff,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { upsertMaterial } from "@/app/actions/materials"
import { type MaterialTypeValue, type MaterialTierValue, MATERIAL_TYPES, MATERIAL_TIERS } from "@/lib/material-constants"
import { QuestionCategory, QuestionDifficulty } from "@prisma/client"

// ─── Form Schema ──────────────────────────────────────────────────────────────

const schema = z.object({
  id:          z.string().optional(),
  title:       z.string().min(2, "Judul minimal 2 karakter"),
  slug:        z.string().min(2).regex(/^[a-z0-9-]+$/, "Hanya huruf kecil, angka, dan -"),
  category:    z.nativeEnum(QuestionCategory),
  subCategory: z.string().min(1, "Sub kategori wajib diisi"),
  type:        z.enum(MATERIAL_TYPES),
  accessTier:  z.enum(MATERIAL_TIERS),
  difficulty:  z.nativeEnum(QuestionDifficulty),
  content:     z.string().min(1, "Konten tidak boleh kosong"),
  videoUrl:    z.string().optional(),
  pdfUrl:      z.string().optional(),
  isPublished: z.boolean(),
  order:       z.number().int(),
})

type FormValues = z.infer<typeof schema>

// ─── Helpers ──────────────────────────────────────────────────────────────────

const labelCls = "block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5"
const fieldCls = "w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
}

// ─── Props ────────────────────────────────────────────────────────────────────

export interface MaterialEditorMaterial {
  id: string
  title: string
  slug: string
  category: QuestionCategory
  subCategory: string
  type: MaterialTypeValue
  accessTier: MaterialTierValue
  difficulty: QuestionDifficulty
  content: string
  videoUrl: string | null
  pdfUrl: string | null
  isPublished: boolean
  order: number
}

interface Props {
  initialData?: MaterialEditorMaterial | null
  isOpen: boolean
  onClose: () => void
}

const DEFAULTS: FormValues = {
  title: "",
  slug: "",
  category: "TWK",
  subCategory: "",
  type: "TEXT",
  accessTier: "FREE",
  difficulty: "SEDANG",
  content: "",
  videoUrl: "",
  pdfUrl: "",
  isPublished: false,
  order: 0,
}

// ─── Component ────────────────────────────────────────────────────────────────

export function MaterialEditor({ initialData, isOpen, onClose }: Props) {
  const isEditing = !!initialData?.id
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: initialData
      ? { ...initialData, videoUrl: initialData.videoUrl ?? "", pdfUrl: initialData.pdfUrl ?? "" }
      : DEFAULTS,
  })

  useEffect(() => {
    if (isOpen) {
      reset(initialData
        ? { ...initialData, videoUrl: initialData.videoUrl ?? "", pdfUrl: initialData.pdfUrl ?? "" }
        : DEFAULTS
      )
      setError(null)
      setSuccess(false)
      setPreviewMode(false)
    }
  }, [isOpen, initialData, reset])

  const title    = watch("title")
  const type     = watch("type")
  const content  = watch("content")
  const isPublished = watch("isPublished")

  // Auto-generate slug from title when creating new
  useEffect(() => {
    if (!isEditing && title) {
      setValue("slug", slugify(title))
    }
  }, [title, isEditing, setValue])

  const onSubmit = (data: FormValues) => {
    setError(null)
    startTransition(async () => {
      const res = await upsertMaterial({ ...data, id: initialData?.id })
      if (res.success) {
        setSuccess(true)
        router.refresh()
        setTimeout(() => { onClose(); setSuccess(false) }, 800)
      } else {
        setError(res.error ?? "Terjadi kesalahan")
      }
    })
  }

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      )}

      {/* Side Drawer */}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-full md:w-[660px] lg:w-[760px] bg-white shadow-2xl transition-transform duration-300 flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60">
          <div>
            <h2 className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-brand-blue" />
              {isEditing ? "Edit Materi" : "Tambah Materi Baru"}
            </h2>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-0.5">
              COBA PNS — Learning CMS Editor
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPreviewMode((v) => !v)}
              className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
            >
              {previewMode ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              {previewMode ? "Edit" : "Preview"}
            </button>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-slate-200">
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* ── Body ───────────────────────────────────────────────────── */}
        {previewMode ? (
          /* ── Preview Mode ──────────────────────────────────────────── */
          <div className="flex-1 overflow-y-auto px-8 py-8">
            <div className="max-w-2xl mx-auto">
              <p className="text-[10px] font-bold text-brand-blue uppercase tracking-widest mb-2">{watch("category")} · {watch("subCategory")}</p>
              <h1 className="text-2xl font-black text-slate-900 mb-4">{title || "Judul Materi"}</h1>
              {watch("videoUrl") && (
                <div className="aspect-video w-full rounded-xl overflow-hidden bg-slate-900 mb-6">
                  <iframe
                    src={watch("videoUrl")?.replace("watch?v=", "embed/")}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}
              <div className="prose prose-slate prose-sm max-w-none font-medium text-slate-700 leading-relaxed whitespace-pre-wrap">
                {content || <span className="text-slate-400 italic">Konten materi akan tampil di sini...</span>}
              </div>
            </div>
          </div>
        ) : (
          /* ── Edit Form ─────────────────────────────────────────────── */
          <form onSubmit={handleSubmit(onSubmit)} id="material-form" className="flex-1 overflow-y-auto px-6 py-6 space-y-6">

            {/* Metadata Grid */}
            <div className="bg-slate-50 rounded-2xl border border-slate-100 p-5 space-y-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Metadata</p>

              {/* Title */}
              <div>
                <label className={labelCls}>Judul Materi *</label>
                <Input {...register("title")} placeholder="Contoh: Pancasila & UUD 1945 — Modul Komprehensif" className="bg-white border-slate-200" />
                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
              </div>

              {/* Slug */}
              <div>
                <label className={labelCls}>Slug URL *</label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-mono flex-shrink-0">/learning/</span>
                  <Input {...register("slug")} placeholder="pancasila-uud-1945" className="bg-white border-slate-200 font-mono" />
                </div>
                {errors.slug && <p className="text-red-500 text-xs mt-1">{errors.slug.message}</p>}
              </div>

              {/* Category + SubCategory + Difficulty */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className={labelCls}>Kategori *</label>
                  <select {...register("category")} className={fieldCls}>
                    <option value="TWK">TWK</option>
                    <option value="TIU">TIU</option>
                    <option value="TKP">TKP</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Sub Kategori *</label>
                  <Input {...register("subCategory")} placeholder="Cth: Nasionalisme" className="bg-white border-slate-200" />
                  {errors.subCategory && <p className="text-red-500 text-xs mt-1">{errors.subCategory.message}</p>}
                </div>
                <div>
                  <label className={labelCls}>Kesulitan</label>
                  <select {...register("difficulty")} className={fieldCls}>
                    <option value="MUDAH">Mudah</option>
                    <option value="SEDANG">Sedang</option>
                    <option value="SULIT">Sulit</option>
                  </select>
                </div>
              </div>

              {/* Type + Access Tier + Order */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className={labelCls}>Jenis Konten</label>
                  <select {...register("type")} className={fieldCls}>
                    <option value="TEXT">📄 Artikel/Modul</option>
                    <option value="VIDEO">🎥 Video Lesson</option>
                    <option value="PDF">📎 E-Book/PDF</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Akses Tier</label>
                  <select {...register("accessTier")} className={fieldCls}>
                    <option value="FREE">Free — Semua</option>
                    <option value="ELITE">Elite — Berbayar</option>
                    <option value="MASTER">Master — Premium</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Urutan</label>
                  <input type="number" {...register("order", { valueAsNumber: true })} className={fieldCls} min={0} />
                </div>
              </div>

              {/* Published toggle */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setValue("isPublished", !isPublished)}
                  className={`relative w-10 h-5 rounded-full transition-colors ${isPublished ? "bg-brand-blue" : "bg-slate-200"}`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${isPublished ? "translate-x-5" : "translate-x-0.5"}`} />
                </button>
                <span className="text-sm font-bold text-slate-700">
                  {isPublished ? "📢 Published — Terlihat siswa" : "🔒 Draft — Tersembunyi"}
                </span>
              </div>
            </div>

            {/* Media URLs */}
            {(type === "VIDEO" || type === "TEXT") && (
              <div className="space-y-3">
                <div>
                  <label className={labelCls}>
                    <Video className="inline w-3.5 h-3.5 mr-1 -mt-0.5" />
                    URL Video (YouTube/Vimeo)
                  </label>
                  <Input
                    {...register("videoUrl")}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="bg-white border-slate-200 font-mono text-xs"
                  />
                  {errors.videoUrl && <p className="text-red-500 text-xs mt-1">{errors.videoUrl.message}</p>}
                </div>
              </div>
            )}

            {(type === "PDF" || type === "TEXT") && (
              <div>
                <label className={labelCls}>
                  <FileText className="inline w-3.5 h-3.5 mr-1 -mt-0.5" />
                  URL PDF / E-Book
                </label>
                <Input
                  {...register("pdfUrl")}
                  placeholder="https://docs.google.com/... atau link PDF"
                  className="bg-white border-slate-200 font-mono text-xs"
                />
                {errors.pdfUrl && <p className="text-red-500 text-xs mt-1">{errors.pdfUrl.message}</p>}
              </div>
            )}

            {/* Content Editor */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-slate-900 border-l-4 border-brand-blue pl-2 flex items-center gap-1.5">
                  <AlignLeft className="w-3.5 h-3.5" />
                  Konten Materi (Markdown) *
                </label>
                <span className="text-[10px] font-mono text-slate-400">{content.length} chars</span>
              </div>
              <textarea
                {...register("content")}
                rows={14}
                placeholder={`# Judul Bab\n\nTulis penjelasan materi di sini menggunakan Markdown...\n\n## Sub Bab 1\n\nIsi penjelasan...\n\n**Poin penting:** Lorem ipsum\n\n> Kutipan atau catatan penting`}
                className="w-full p-4 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-mono resize-y leading-relaxed"
              />
              {errors.content && <p className="text-red-500 text-xs mt-1">{errors.content.message}</p>}
              <p className="text-[10px] text-slate-400 font-medium">
                Mendukung Markdown: **bold**, *italic*, # heading, - list, {"`code`"}
              </p>
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
            <div className="h-4" />
          </form>
        )}

        {/* ── Footer ─────────────────────────────────────────────────── */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
          <Button variant="outline" type="button" onClick={onClose} disabled={isPending} className="font-semibold px-6">
            Batal
          </Button>
          <Button
            type="submit"
            form="material-form"
            disabled={isPending || success || previewMode}
            className="bg-brand-blue-deep hover:bg-brand-blue-deep text-white font-bold px-8 flex items-center gap-2 disabled:opacity-60"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : success ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {isEditing ? "Simpan Perubahan" : "Simpan Materi"}
          </Button>
        </div>
      </div>
    </>
  )
}
