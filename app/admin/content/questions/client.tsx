"use client"

import React, { useState, useEffect, useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, Upload } from "lucide-react"
import { QuestionCategory, QuestionDifficulty } from "@prisma/client"
import { QuestionEditor } from "@/components/admin/question-editor"
import { deleteAllQuestions } from "@/app/admin/content/actions"

export function QuestionCMSClient({
  initialData,
  totalAll,
  filteredTotal,
}: {
  initialData: any[]
  totalAll: number
  filteredTotal: number
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<any>(null)

  useEffect(() => {
    ;(window as any).triggerReopenBulkModal = () => {
      window.dispatchEvent(new Event("open-bulk-import"))
    }
    ;(window as any).triggerEditQuestion = (question: any) => {
      setEditingQuestion(question)
      setIsEditorOpen(true)
    }
  }, [])

  const openNew = () => {
    setEditingQuestion(null)
    setIsEditorOpen(true)
  }

  const handleDeleteAll = () => {
    const rawCategory = searchParams.get("category")
    const rawDifficulty = searchParams.get("difficulty")
    const category = rawCategory && Object.values(QuestionCategory).includes(rawCategory as QuestionCategory)
      ? rawCategory as QuestionCategory
      : undefined
    const difficulty = rawDifficulty && Object.values(QuestionDifficulty).includes(rawDifficulty as QuestionDifficulty)
      ? rawDifficulty as QuestionDifficulty
      : undefined
    const activeFilters = {
      category,
      difficulty,
      search: searchParams.get("search") || undefined,
    }
    const isFiltered = Boolean(activeFilters.category || activeFilters.difficulty || activeFilters.search)
    const targetCount = isFiltered ? filteredTotal : totalAll
    const scopeLabel = isFiltered ? "hasil filter saat ini" : "SEMUA soal SKD"

    if (targetCount <= 0) {
      alert("Tidak ada soal SKD untuk dihapus.")
      return
    }

    const confirmText = window.prompt(
      `Anda akan menghapus ${targetCount} ${scopeLabel}. Tindakan ini permanen. Ketik HAPUS untuk melanjutkan.`
    )
    if (confirmText !== "HAPUS") return

    startTransition(async () => {
      const res = await deleteAllQuestions({ confirmText, ...activeFilters })
      if (!res.success) {
        alert(res.error)
        return
      }
      alert(`Berhasil menghapus ${res.count} soal SKD.`)
      router.refresh()
    })
  }
  
  return (
    <>
      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
        <Button
          variant="outline"
          onClick={handleDeleteAll}
          disabled={isPending || totalAll <= 0}
          className="border-red-200 bg-white font-black rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-300 transition-all"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Hapus List
        </Button>
        <Button
          variant="outline"
          onClick={() => window.dispatchEvent(new Event("open-bulk-import"))}
          className="border-slate-200 bg-white font-black rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-50 border-dashed transition-all"
        >
          <Upload className="w-4 h-4 mr-2" />
          Bulk Import
        </Button>
        <Button
          onClick={openNew}
          className="border-brand-blue-deep bg-gradient-to-br from-brand-blue to-brand-blue-deep hover:from-brand-blue-deep hover:to-brand-blue-deep text-white font-black rounded-xl shadow-md hover:shadow-lg transition-all"
        >
          <Plus className="w-4 h-4 mr-2" />
          Tambah Soal
        </Button>
      </div>

      <QuestionEditor 
        isOpen={isEditorOpen} 
        onClose={() => setIsEditorOpen(false)} 
        initialData={editingQuestion}
      />
    </>
  )
}
