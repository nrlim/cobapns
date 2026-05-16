"use client"

import React, { useState, useEffect } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import * as z from "zod"
import { X, Save, Plus, Trash2, Library } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { upsertSKBQuestion } from "@/app/admin/content/skb-questions/actions"
import { SKBCategory, QuestionDifficulty } from "@prisma/client"
import { SKB_BIDANG_PRESETS } from "@/lib/skb-bidang"

const optionSchema = z.object({
  id: z.string().optional(),
  text: z.string().min(1, "Opsi jawaban tidak boleh kosong"),
  score: z.number().min(0).max(5),
})

const schema = z.object({
  id: z.string().optional(),
  category: z.nativeEnum(SKBCategory),
  subCategory: z.string().min(1, "Sub Materi wajib diisi"),
  bidang: z.string().min(1, "Bidang wajib dipilih"),
  difficulty: z.nativeEnum(QuestionDifficulty),
  content: z.string().min(5, "Soal harus diisi"),
  explanation: z.string().min(5, "Pembahasan harus diisi"),
  options: z.array(optionSchema).min(2, "Minimal 2 opsi jawaban").max(5, "Maksimal 5 opsi"),
})

type SKBQuestionFormValues = z.infer<typeof schema>

interface SKBQuestionEditorProps {
  initialData?: SKBQuestionFormValues | null
  isOpen: boolean
  onClose: () => void
}

const CATEGORY_LABELS: Record<SKBCategory, string> = {
  TEKNIS: "Teknis (Bidang Formasi)",
  MANAJERIAL: "Manajerial",
  SOSIAL_KULTURAL: "Sosial Kultural",
}

const SUBCATEGORY_PRESETS: Record<SKBCategory, string[]> = {
  TEKNIS: [
    "Kompetensi Teknis Jabatan",
    "Pengetahuan Profesi",
    "Keterampilan Teknis",
    "Regulasi Terkait Jabatan",
  ],
  MANAJERIAL: [
    "Integritas",
    "Kerjasama",
    "Komunikasi",
    "Orientasi pada Hasil",
    "Pelayanan Publik",
    "Pengembangan Diri",
    "Mengelola Perubahan",
    "Pengambilan Keputusan",
  ],
  SOSIAL_KULTURAL: [
    "Peredam Konflik",
    "Empati",
    "Kepekaan Sosial",
    "Nasionalisme Multikultural",
    "Wawasan Kebhinekaan",
  ],
}

export function SKBQuestionEditor({
  initialData,
  isOpen,
  onClose,
}: SKBQuestionEditorProps) {
  const isEditing = !!initialData?.id
  const [customBidang, setCustomBidang] = useState("")
  const [useCustomBidang, setUseCustomBidang] = useState(false)

  const defaultValues: SKBQuestionFormValues = initialData || {
    category: "TEKNIS",
    subCategory: "",
    bidang: "Umum",
    difficulty: "SEDANG",
    content: "",
    explanation: "",
    options: [
      { text: "", score: 0 },
      { text: "", score: 0 },
      { text: "", score: 0 },
      { text: "", score: 0 },
      { text: "", score: 0 },
    ],
  }

  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SKBQuestionFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  })

  const category = watch("category")
  const bidangValue = watch("bidang")

  React.useEffect(() => {
    if (isOpen) {
      reset(initialData || defaultValues)
      setUseCustomBidang(false)
      setCustomBidang("")
    }
  }, [isOpen, initialData, reset])

  const { fields, append, remove } = useFieldArray({
    control,
    name: "options",
  })

  const router = useRouter()

  const onSubmit = async (data: SKBQuestionFormValues) => {
    const payload = {
      ...data,
      bidang: useCustomBidang && customBidang.trim() ? customBidang.trim() : data.bidang,
    }
    const res = await upsertSKBQuestion(payload)
    if (res.success) {
      onClose()
      reset(defaultValues)
      router.refresh()
    } else {
      alert(res.error)
    }
  }

  const categoryColor: Record<SKBCategory, string> = {
    TEKNIS: "border-orange-500",
    MANAJERIAL: "border-purple-500",
    SOSIAL_KULTURAL: "border-teal-500",
  }

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Side Drawer */}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-full md:w-[600px] lg:w-[820px] bg-white shadow-2xl transition-transform duration-300 transform flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-orange-50 to-amber-50">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-2">
              <Library className="w-5 h-5 text-orange-500" />
              {isEditing ? "Edit Soal SKB" : "Tambah Soal SKB Baru"}
            </h2>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              SKB · Seleksi Kompetensi Bidang Editor
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full hover:bg-orange-100"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Form Body */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 overflow-y-auto px-6 py-6 space-y-8 flex flex-col"
        >
          {/* Metadata Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-5 rounded-2xl border border-slate-100">
            {/* Kategori */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Kategori Kompetensi
              </label>
              <select
                {...register("category")}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
              >
                {(Object.keys(CATEGORY_LABELS) as SKBCategory[]).map((cat) => (
                  <option key={cat} value={cat}>
                    {CATEGORY_LABELS[cat]}
                  </option>
                ))}
              </select>
            </div>

            {/* Tingkat Kesulitan */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Tingkat Kesulitan
              </label>
              <select
                {...register("difficulty")}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
              >
                <option value="MUDAH">Mudah</option>
                <option value="SEDANG">Sedang</option>
                <option value="SULIT">Sulit</option>
              </select>
            </div>

            {/* Bidang Jabatan */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Bidang / Rumpun Jabatan
              </label>
              {!useCustomBidang ? (
                <div className="flex gap-2">
                  <select
                    {...register("bidang")}
                    className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
                  >
                    {SKB_BIDANG_PRESETS.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
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
                    placeholder="Masukkan bidang/rumpun, bukan nama jabatan..."
                    className="bg-white border-orange-200 focus:border-orange-400"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setUseCustomBidang(false)}
                    className="text-xs text-slate-500 shrink-0"
                  >
                    Preset
                  </Button>
                </div>
              )}
              {errors.bidang && (
                <p className="text-red-500 text-xs mt-1">{errors.bidang.message}</p>
              )}
            </div>

            {/* Sub Materi */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Sub Materi / Topik
              </label>
              <div className="flex gap-2">
                <Input
                  {...register("subCategory")}
                  placeholder="Cth: Pelayanan Publik"
                  className="bg-white border-slate-200"
                  list="skb-subcategory-datalist"
                />
                <datalist id="skb-subcategory-datalist">
                  {SUBCATEGORY_PRESETS[category as SKBCategory]?.map((s) => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
              </div>
              {errors.subCategory && (
                <p className="text-red-500 text-xs mt-1">{errors.subCategory.message}</p>
              )}
            </div>
          </div>

          {/* Question Content */}
          <div className="space-y-2">
            <label
              className={`text-sm font-bold text-slate-900 border-l-4 pl-2 ${
                categoryColor[category as SKBCategory] || "border-orange-500"
              }`}
            >
              Isi Pertanyaan
            </label>
            <textarea
              {...register("content")}
              rows={5}
              placeholder="Ketik teks pertanyaan SKB di sini..."
              className="w-full p-4 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-orange-400/20 focus:border-orange-400 outline-none transition-all text-sm resize-y"
            />
            {errors.content && (
              <p className="text-red-500 text-xs mt-1">{errors.content.message}</p>
            )}
          </div>

          {/* Options */}
          <div className="space-y-4">
            <div className="flex justify-between items-center border-l-4 border-orange-400 pl-2">
              <label className="text-sm font-bold text-slate-900">Pilihan Jawaban</label>
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                {category === "TEKNIS"
                  ? "Skor: 5 (Benar) / 0 (Salah)"
                  : "Skor Likert: 1 – 5"}
              </span>
            </div>

            <div className="space-y-3">
              {fields.map((field, index) => {
                const labelAlpha = String.fromCharCode(65 + index)
                return (
                  <div
                    key={field.id}
                    className="flex gap-3 items-start p-3 bg-white border border-slate-200 rounded-xl shadow-sm group hover:border-slate-300 transition-colors"
                  >
                    <div className="flex-shrink-0 w-8 h-8 bg-orange-50 text-orange-700 font-black rounded flex items-center justify-center mt-1 text-sm">
                      {labelAlpha}
                    </div>

                    <div className="flex-1 flex flex-col sm:flex-row gap-3">
                      <div className="flex-1">
                        <Input
                          {...register(`options.${index}.text` as const)}
                          placeholder={`Teks untuk opsi ${labelAlpha}...`}
                          className="border-slate-200"
                        />
                        {errors?.options?.[index]?.text && (
                          <p className="text-red-500 text-[10px] mt-1 font-medium">
                            {errors.options[index]?.text?.message}
                          </p>
                        )}
                      </div>

                      <div className="w-24 flex-shrink-0">
                        <Input
                          type="number"
                          {...register(`options.${index}.score` as const, {
                            valueAsNumber: true,
                          })}
                          placeholder="Nilai"
                          className="font-mono text-center font-bold border-orange-200 focus:border-orange-400 bg-orange-50"
                        />
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(index)}
                      className="text-slate-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity mt-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )
              })}
            </div>

            {fields.length < 5 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ text: "", score: 0 })}
                className="w-full border-dashed border-2 border-slate-200 text-slate-500 hover:text-slate-800 hover:border-slate-400 mt-2 py-6 rounded-xl"
              >
                <Plus className="w-4 h-4 mr-2" />
                Tambah Opsi Jawaban
              </Button>
            )}
            {errors.options && (
              <p className="text-red-500 text-xs mt-1 font-medium">
                {errors.options.message}
              </p>
            )}
          </div>

          {/* Explanation */}
          <div className="space-y-2 mt-4 pb-12">
            <label className="text-sm font-bold text-slate-900 border-l-4 border-amber-500 pl-2">
              Pembahasan Detail
            </label>
            <textarea
              {...register("explanation")}
              rows={4}
              placeholder="Jelaskan mengapa jawaban tersebut benar dan konsep yang relevan..."
              className="w-full p-4 border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all text-sm resize-y"
            />
            {errors.explanation && (
              <p className="text-red-500 text-xs mt-1">{errors.explanation.message}</p>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3 z-10 w-full mt-auto">
          <Button
            variant="outline"
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="font-semibold px-6"
          >
            Batal
          </Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-8 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {isSubmitting ? "Menyimpan..." : "Simpan Soal SKB"}
          </Button>
        </div>
      </div>
    </>
  )
}
