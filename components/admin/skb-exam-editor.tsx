"use client"

import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import * as z from "zod"
import { X, Save, BookMarked } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { upsertSKBExam } from "@/app/actions/skb-exams"
import { ExamStatus, ExamAccessTier } from "@prisma/client"
import { SKB_BIDANG_PRESETS } from "@/components/admin/skb-question-editor"

const schema = z.object({
  id: z.string().optional(),
  title: z.string().min(3, "Judul minimal 3 karakter"),
  bidang: z.string().min(1, "Bidang jabatan wajib dipilih"),
  durationMinutes: z.number().min(10, "Min 10 menit").max(300, "Max 300 menit"),
  status: z.nativeEnum(ExamStatus),
  accessTier: z.nativeEnum(ExamAccessTier),
})

type FormValues = z.infer<typeof schema>

interface SKBExamEditorProps {
  isOpen: boolean
  onClose: () => void
  initialData?: FormValues | null
  bidangList: string[]
}

export function SKBExamEditor({ isOpen, onClose, initialData, bidangList }: SKBExamEditorProps) {
  const isEditing = !!initialData?.id
  const router = useRouter()
  const [useCustomBidang, setUseCustomBidang] = React.useState(false)
  const [customBidang, setCustomBidang] = React.useState("")

  const defaultValues: FormValues = initialData || {
    title: "",
    bidang: "Umum",
    durationMinutes: 90,
    status: "DRAFT",
    accessTier: "FREE",
  }

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  })

  React.useEffect(() => {
    if (isOpen) {
      reset(initialData || defaultValues)
      setUseCustomBidang(false)
      setCustomBidang("")
    }
  }, [isOpen, initialData, reset])

  const onSubmit = async (data: FormValues) => {
    const payload = {
      ...data,
      bidang: useCustomBidang && customBidang.trim() ? customBidang.trim() : data.bidang,
    }
    const res = await upsertSKBExam(payload)
    if (res.success) {
      onClose()
      reset()
      router.refresh()
    } else {
      alert(res.error)
    }
  }

  // All available bidang options (preset + existing from DB)
  const allBidang = Array.from(new Set([...SKB_BIDANG_PRESETS, ...bidangList]))

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      <div
        className={`fixed inset-y-0 right-0 z-50 w-full md:w-[480px] bg-white shadow-2xl transition-transform duration-300 flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-orange-50 to-amber-50">
          <div>
            <h2 className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-2">
              <BookMarked className="w-5 h-5 text-orange-500" />
              {isEditing ? "Edit Ujian SKB" : "Buat Ujian SKB Baru"}
            </h2>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-0.5">
              Konfigurasi · SKB Exam Builder
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-orange-100">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* Title */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              Judul Ujian SKB
            </label>
            <Input
              {...register("title")}
              placeholder="cth: Try Out SKB Bidang Kesehatan - Sesi 1"
              className="bg-slate-50 border-slate-200"
            />
            {errors.title && (
              <p className="text-red-500 text-xs">{errors.title.message}</p>
            )}
          </div>

          {/* Bidang */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              Bidang Jabatan Target
            </label>
            {!useCustomBidang ? (
              <div className="flex gap-2">
                <select
                  {...register("bidang")}
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold outline-none focus:border-orange-400"
                >
                  {allBidang.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setUseCustomBidang(true)}
                  className="text-xs text-slate-500 border-dashed shrink-0"
                >
                  + Custom
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  value={customBidang}
                  onChange={(e) => setCustomBidang(e.target.value)}
                  placeholder="Masukkan bidang..."
                  className="bg-orange-50 border-orange-200"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setUseCustomBidang(false)}
                  className="shrink-0 text-xs"
                >
                  Preset
                </Button>
              </div>
            )}
            {errors.bidang && (
              <p className="text-red-500 text-xs">{errors.bidang.message}</p>
            )}
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              Durasi (menit)
            </label>
            <Input
              type="number"
              {...register("durationMinutes", { valueAsNumber: true })}
              placeholder="90"
              className="bg-slate-50 border-slate-200 font-mono"
            />
            {errors.durationMinutes && (
              <p className="text-red-500 text-xs">{errors.durationMinutes.message}</p>
            )}
            <p className="text-[11px] text-slate-400 font-medium">
              Standar SKB: 90 menit untuk tes Manajerial + Sosial Kultural, 120 menit dengan Teknis.
            </p>
          </div>

          {/* Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Status Publikasi
              </label>
              <select
                {...register("status")}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold outline-none focus:border-orange-400"
              >
                <option value="DRAFT">Draft</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="PUBLISHED">Published</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Level Akses
              </label>
              <select
                {...register("accessTier")}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold outline-none focus:border-orange-400"
              >
                <option value="FREE">Free</option>
                <option value="ELITE">Elite</option>
                <option value="MASTER">Master</option>
              </select>
            </div>
          </div>

          {/* Info box */}
          <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 text-xs text-orange-700 space-y-1.5">
            <p className="font-bold">Panduan Penyusunan Ujian SKB:</p>
            <ul className="space-y-1 font-medium">
              <li>• <strong>Teknis:</strong> 20–25 soal bidang spesifik jabatan</li>
              <li>• <strong>Manajerial:</strong> 25 soal kompetensi kepemimpinan</li>
              <li>• <strong>Sosial Kultural:</strong> 20 soal kepekaan sosial & keberagaman</li>
              <li>• Gunakan Smart Randomizer setelah ujian dibuat</li>
            </ul>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting} className="font-semibold">
            Batal
          </Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-8 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {isSubmitting ? "Menyimpan..." : "Simpan Ujian"}
          </Button>
        </div>
      </div>
    </>
  )
}
