"use client"

import React, { useState, useEffect, useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, Upload } from "lucide-react"
import { SKBQuestionEditor } from "@/components/admin/skb-question-editor"
import { DeleteListConfirmModal } from "@/components/admin/delete-list-confirm-modal"
import { deleteAllSKBQuestions } from "@/app/admin/content/skb-questions/actions"
import { QuestionDifficulty, SKBCategory } from "@prisma/client"

export function SKBQuestionCMSClient({
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
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [deleteSuccessCount, setDeleteSuccessCount] = useState<number | null>(null)

  useEffect(() => {
    ;(window as any).triggerReopenSKBBulkModal = () => {
      window.dispatchEvent(new Event("open-skb-bulk-import"))
    }
    ;(window as any).triggerEditSKBQuestion = (question: any) => {
      setEditingQuestion(question)
      setIsEditorOpen(true)
    }
  }, [])

  const openNew = () => {
    setEditingQuestion(null)
    setIsEditorOpen(true)
  }

  const getDeleteContext = () => {
    const rawCategory = searchParams.get("category")
    const rawBidang = searchParams.get("bidang")
    const rawDifficulty = searchParams.get("difficulty")
    const category = rawCategory && Object.values(SKBCategory).includes(rawCategory as SKBCategory)
      ? rawCategory as SKBCategory
      : undefined
    const difficulty = rawDifficulty && Object.values(QuestionDifficulty).includes(rawDifficulty as QuestionDifficulty)
      ? rawDifficulty as QuestionDifficulty
      : undefined
    const activeFilters = {
      category,
      bidang: rawBidang && rawBidang !== "All" ? rawBidang : undefined,
      difficulty,
      search: searchParams.get("search") || undefined,
    }
    const isFiltered = Boolean(activeFilters.category || activeFilters.bidang || activeFilters.difficulty || activeFilters.search)
    return {
      activeFilters,
      targetCount: isFiltered ? filteredTotal : totalAll,
      scopeLabel: isFiltered ? "hasil filter saat ini" : "SEMUA soal SKB",
    }
  }

  const openDeleteModal = () => {
    setDeleteError(null)
    setDeleteSuccessCount(null)
    setIsDeleteModalOpen(true)
  }

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false)
    setDeleteError(null)
    setDeleteSuccessCount(null)
    router.refresh()
  }

  const handleDeleteAll = () => {
    const { activeFilters } = getDeleteContext()
    setDeleteError(null)
    startTransition(async () => {
      const res = await deleteAllSKBQuestions({ confirmText: "HAPUS", ...activeFilters })
      if (!res.success) {
        setDeleteError(res.error ?? "Gagal menghapus daftar soal SKB")
        return
      }
      setDeleteSuccessCount(res.count ?? 0)
      router.refresh()
    })
  }

  const deleteContext = getDeleteContext()

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
        <Button
          variant="outline"
          onClick={openDeleteModal}
          disabled={isPending || totalAll <= 0}
          className="border-red-200 bg-white font-black rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-300 transition-all"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Hapus List
        </Button>
        <Button
          variant="outline"
          onClick={() => window.dispatchEvent(new Event("open-skb-bulk-import"))}
          className="border-slate-200 bg-white font-black rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-50 border-dashed transition-all"
        >
          <Upload className="w-4 h-4 mr-2" />
          Bulk Import
        </Button>
        <Button
          onClick={openNew}
          className="border-orange-600 bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-black rounded-xl shadow-md hover:shadow-lg transition-all"
        >
          <Plus className="w-4 h-4 mr-2" />
          Tambah Soal SKB
        </Button>
      </div>

      <SKBQuestionEditor
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        initialData={editingQuestion}
      />

      <DeleteListConfirmModal
        isOpen={isDeleteModalOpen}
        title="Hapus daftar soal SKB?"
        entityLabel="soal SKB"
        scopeLabel={deleteContext.scopeLabel}
        targetCount={deleteContext.targetCount}
        isPending={isPending}
        error={deleteError}
        successCount={deleteSuccessCount}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteAll}
      />
    </>
  )
}
