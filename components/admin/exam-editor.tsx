"use client"

import { useState, useEffect, useTransition } from "react"
import { useRouter } from "next/navigation"
import { ExamStatus, ExamAccessTier } from "@prisma/client"
import { upsertExam } from "@/app/actions/exams"
import { X, Save, Loader2, ClipboardList, CheckCircle2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

interface ExamData {
  id?: string
  title: string
  durationMinutes: number
  passingGradeTWK: number
  passingGradeTIU: number
  passingGradeTKP: number
  status: ExamStatus
  accessTier: ExamAccessTier
}

interface ExamEditorProps {
  initialData?: ExamData | null
  isOpen: boolean
  onClose: () => void
}

const DEFAULTS: ExamData = {
  title: "",
  durationMinutes: 100,
  passingGradeTWK: 65,
  passingGradeTIU: 80,
  passingGradeTKP: 166,
  status: "DRAFT",
  accessTier: "FREE",
}

const labelCls = "block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5"
const fieldCls = "w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors"

export function ExamEditor({ initialData, isOpen, onClose }: ExamEditorProps) {
  const isEditing = !!initialData?.id
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState<ExamData>(initialData ?? DEFAULTS)

  useEffect(() => {
    if (isOpen) {
      setForm(initialData ?? DEFAULTS)
      setError(null)
      setSuccess(false)
    }
  }, [isOpen, initialData])

  function set<K extends keyof ExamData>(key: K, value: ExamData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const res = await upsertExam({ ...form, id: initialData?.id })
      if (res.success) {
        setSuccess(true)
        router.refresh()
        setTimeout(() => { onClose(); setSuccess(false) }, 800)
      } else {
        setError(res.error ?? "Terjadi kesalahan.")
      }
    })
  }

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-full md:w-[520px] bg-white shadow-2xl transition-transform duration-300 flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* ── Header ────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-teal-600" />
              {isEditing ? "Edit Ujian" : "Buat Ujian Baru"}
            </h2>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              COBA PNS — Exam Builder
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            type="button"
            onClick={onClose}
            className="rounded-full hover:bg-slate-200"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* ── Body ──────────────────────────────────────────────── */}
        <form
          id="exam-editor-form"
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-6 py-6 space-y-6"
        >

          {/* Judul */}
          <div className="space-y-1.5">
            <label className={labelCls}>Judul Ujian *</label>
            <Input
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Contoh: Try Out CAT SKD #12 — Sesi April 2026"
              required
              className="bg-white border-slate-200 font-medium"
            />
          </div>

          {/* Durasi */}
          <div className="space-y-1.5">
            <label className={labelCls}>Durasi Ujian *</label>
            <div className="flex items-center gap-3">
              <Input
                type="number"
                value={form.durationMinutes}
                onChange={(e) => set("durationMinutes", Number(e.target.value))}
                min={1}
                max={300}
                required
                className="bg-white border-slate-200 font-mono font-bold"
              />
              <span className="text-sm font-bold text-slate-400 flex-shrink-0 w-12">menit</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap pt-1">
              {[60, 90, 100, 120].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => set("durationMinutes", m)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg font-bold border transition-colors ${
                    form.durationMinutes === m
                      ? "bg-teal-600 text-white border-teal-600"
                      : "bg-slate-50 text-slate-500 border-slate-200 hover:border-teal-400 hover:text-teal-600"
                  }`}
                >
                  {m} mnt
                </button>
              ))}
              <span className="text-[11px] text-slate-400 font-medium">Standar SKD: 100 mnt / 110 soal</span>
            </div>
          </div>

          {/* Divider */}
          <hr className="border-slate-100" />

          {/* Passing Grade — 3 cols */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center border-l-4 border-amber-500 pl-2">
              <label className="text-sm font-bold text-slate-900">Ambang Batas Nilai</label>
              <Badge variant="outline" className="text-[10px] font-bold text-slate-500">
                Passing Grade
              </Badge>
            </div>
            <p className="text-[11px] text-slate-400 font-medium pl-3">
              Standar SKD 2024: TWK 65 · TIU 80 · TKP 166
            </p>

            <div className="grid grid-cols-3 gap-3 pt-1">
              {[
                { key: "passingGradeTWK" as const, label: "TWK", max: 150, sub: "30 soal", cls: "focus:border-red-400 focus:ring-red-400" },
                { key: "passingGradeTIU" as const, label: "TIU", max: 175, sub: "35 soal", cls: "focus:border-blue-400 focus:ring-blue-400" },
                { key: "passingGradeTKP" as const, label: "TKP", max: 225, sub: "45 soal", cls: "focus:border-purple-400 focus:ring-purple-400" },
              ].map(({ key, label, max, sub, cls }) => (
                <div key={key} className="space-y-1">
                  <label className={`block text-[10px] font-black uppercase tracking-widest mb-1 ${
                    label === "TWK" ? "text-red-600" : label === "TIU" ? "text-blue-600" : "text-purple-600"
                  }`}>
                    {label}
                  </label>
                  <input
                    type="number"
                    className={`${fieldCls} text-center text-lg font-black ${cls}`}
                    value={form[key] as number}
                    onChange={(e) => set(key, Number(e.target.value))}
                    min={0}
                    max={max}
                    required
                  />
                  <p className="text-[10px] text-slate-400 font-medium text-center">
                    {sub} · maks {max}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Divider */}
          <hr className="border-slate-100" />

          {/* Status + Access Tier — 2 cols */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className={labelCls}>Status Publikasi</label>
              <select
                value={form.status}
                onChange={(e) => set("status", e.target.value as ExamStatus)}
                className={fieldCls}
              >
                <option value="DRAFT">Draft — Hanya admin</option>
                <option value="SCHEDULED">Scheduled — Dijadwalkan</option>
                <option value="PUBLISHED">Published — Aktif</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className={labelCls}>Akses Paket</label>
              <select
                value={form.accessTier}
                onChange={(e) => set("accessTier", e.target.value as ExamAccessTier)}
                className={fieldCls}
              >
                <option value="FREE">Free — Semua siswa</option>
                <option value="ELITE">Elite — Paket Elite+</option>
                <option value="MASTER">Master — Paket Master</option>
              </select>
            </div>
          </div>

          {/* Feedback */}
          {error && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}
          {success && (
            <div className="flex items-center gap-3 bg-teal-50 border border-teal-200 text-teal-700 rounded-xl px-4 py-3">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm font-bold">Tersimpan! Menutup drawer...</span>
            </div>
          )}

          {/* Bottom spacer */}
          <div className="h-2" />
        </form>

        {/* ── Footer ────────────────────────────────────────────── */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
          <Button
            variant="outline"
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="font-semibold px-6"
          >
            Batal
          </Button>
          <Button
            type="submit"
            form="exam-editor-form"
            disabled={isPending || success}
            className="bg-teal-700 hover:bg-teal-800 text-white font-bold px-8 flex items-center gap-2 disabled:opacity-60"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : success ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isEditing ? "Simpan Perubahan" : "Simpan Ujian"}
          </Button>
        </div>
      </div>
    </>
  )
}
