"use client"

import React from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import * as z from "zod"
import { X, Save, Plus, Trash2, Library, GraduationCap } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { upsertQuestion } from "@/app/admin/content/actions"
import { QuestionCategory, QuestionDifficulty } from "@prisma/client"

const optionSchema = z.object({
  id: z.string().optional(),
  text: z.string().min(1, "Opsi jawaban tidak boleh kosong"),
  score: z.number().min(0).max(5),
})

const schema = z.object({
  id: z.string().optional(),
  category: z.nativeEnum(QuestionCategory),
  subCategory: z.string().min(1, "Sub Materi wajib diisi"),
  difficulty: z.nativeEnum(QuestionDifficulty),
  content: z.string().min(5, "Soal harus diisi"),
  explanation: z.string().min(5, "Pembahasan harus diisi"),
  options: z.array(optionSchema).min(2, "Minimal 2 opsi jawaban").max(5, "Maksimal 5 opsi"),
})

type QuestionFormValues = z.infer<typeof schema>

interface QuestionEditorProps {
  initialData?: QuestionFormValues | null
  isOpen: boolean
  onClose: () => void
}

export function QuestionEditor({ initialData, isOpen, onClose }: QuestionEditorProps) {
  const isEditing = !!initialData?.id

  const defaultValues: QuestionFormValues = initialData || {
    category: "TWK",
    subCategory: "",
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
    formState: { errors, isSubmitting },
  } = useForm<QuestionFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  })

  // Watch category to change scoring instructions (TKP vs TIU/TWK)
  const category = watch("category")

  // Resets form when initialData changes
  React.useEffect(() => {
    if (isOpen) {
      reset(initialData || defaultValues)
    }
  }, [isOpen, initialData, reset])

  const { fields, append, remove } = useFieldArray({
    control,
    name: "options",
  })

  const router = useRouter()

  const onSubmit = async (data: QuestionFormValues) => {
    const res = await upsertQuestion(data)
    if (res.success) {
      onClose()
      reset(defaultValues)
      router.refresh()
    } else {
      alert(res.error)
    }
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
        className={`fixed inset-y-0 right-0 z-50 w-full md:w-[600px] lg:w-[800px] bg-white shadow-2xl transition-transform duration-300 transform flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-2">
              <Library className="w-5 h-5 text-brand-blue" />
              {isEditing ? "Edit Soal" : "Tambah Soal Baru"}
            </h2>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">COBA PNS Editor Console</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-slate-200">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Drawer Body - Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto px-6 py-6 space-y-8 flex flex-col">
          
          {/* Metadata Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50 p-5 rounded-2xl border border-slate-100">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Kategori Kategori</label>
              <select
                {...register("category")}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="TWK">Tes Wawasan Kebangsaan (TWK)</option>
                <option value="TIU">Tes Intelegensia Umum (TIU)</option>
                <option value="TKP">Tes Karakteristik Pribadi (TKP)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Tingkat Kesulitan</label>
              <select
                {...register("difficulty")}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="MUDAH">Mudah</option>
                <option value="SEDANG">Sedang</option>
                <option value="SULIT">Sulit</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Sub Materi</label>
              <Input
                {...register("subCategory")}
                placeholder="Cth: Deret Angka"
                className="bg-white border-slate-200"
              />
              {errors.subCategory && <p className="text-red-500 text-xs mt-1">{errors.subCategory.message}</p>}
            </div>
          </div>

          {/* Question Content */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-900 border-l-4 border-brand-blue pl-2">Isi Pertanyaan</label>
            <textarea
              {...register("content")}
              rows={5}
              placeholder="Ketik teks pertanyaan di sini..."
              className="w-full p-4 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm resize-y"
            />
            {errors.content && <p className="text-red-500 text-xs mt-1">{errors.content.message}</p>}
          </div>

          {/* Options Array */}
          <div className="space-y-4">
            <div className="flex justify-between items-center border-l-4 border-indigo-600 pl-2">
              <label className="text-sm font-bold text-slate-900">Pilihan Jawaban</label>
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                {category === "TKP" ? "Skor CPNS: 1 - 5 (TKP)" : "Skor CPNS: 5 (Benar) / 0 (Salah)"}
              </span>
            </div>
            
            <div className="space-y-3">
              {fields.map((field, index) => {
                const labelAlpha = String.fromCharCode(65 + index) // A, B, C...
                return (
                  <div key={field.id} className="flex gap-3 items-start p-3 bg-white border border-slate-200 rounded-xl shadow-sm group hover:border-slate-300 transition-colors">
                    <div className="flex-shrink-0 w-8 h-8 bg-slate-100 text-slate-700 font-black rounded flex items-center justify-center mt-1">
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
                          <p className="text-red-500 text-[10px] mt-1 font-medium">{errors.options[index]?.text?.message}</p>
                        )}
                      </div>
                      
                      <div className="w-24 flex-shrink-0">
                        <Input
                          type="number"
                          {...register(`options.${index}.score` as const, { valueAsNumber: true })}
                          placeholder="Nilai"
                          className={`font-mono text-center font-bold ${
                            category === "TKP" ? "border-indigo-200 focus:border-indigo-500 bg-indigo-50" : "border-blue-200 focus:border-blue-500 bg-blue-50"
                          }`}
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
            {errors.options && <p className="text-red-500 text-xs mt-1 font-medium">{errors.options.message}</p>}
          </div>

          {/* Explanation */}
          <div className="space-y-2 mt-4 pb-12">
            <label className="text-sm font-bold text-slate-900 border-l-4 border-amber-500 pl-2">Pembahasan Detail</label>
            <textarea
              {...register("explanation")}
              rows={4}
              placeholder="Jelaskan langkah-langkah penyelesaian atau landasan teori untuk soal ini..."
              className="w-full p-4 border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all text-sm resize-y"
            />
             {errors.explanation && <p className="text-red-500 text-xs mt-1">{errors.explanation.message}</p>}
          </div>

        </form>

        {/* Drawer Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3 rounded-b-2xl md:rounded-bl-none z-10 w-full mt-auto">
          <Button variant="outline" type="button" onClick={onClose} disabled={isSubmitting} className="font-semibold px-6">
            Batal
          </Button>
          <Button onClick={handleSubmit(onSubmit)} disabled={isSubmitting} className="bg-brand-blue-deep hover:bg-brand-blue-deep text-white font-bold px-8 flex items-center gap-2">
            <Save className="w-4 h-4" />
            {isSubmitting ? "Menyimpan..." : "Simpan Soal"}
          </Button>
        </div>

      </div>
    </>
  )
}
