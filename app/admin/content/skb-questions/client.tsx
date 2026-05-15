"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Upload } from "lucide-react"
import { SKBQuestionEditor } from "@/components/admin/skb-question-editor"

export function SKBQuestionCMSClient({ initialData }: { initialData: any[] }) {
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<any>(null)

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

  return (
    <>
      <div className="flex gap-3 w-full lg:w-auto">
        <Button
          variant="outline"
          onClick={() => window.dispatchEvent(new Event("open-skb-bulk-import"))}
          className="border-slate-200 bg-white font-bold flex-1 lg:flex-none rounded-xl text-slate-600 hover:text-slate-900 border-dashed"
        >
          <Upload className="w-4 h-4 mr-2" />
          Bulk Import
        </Button>
        <Button
          onClick={openNew}
          className="flex-1 border-orange-600 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all"
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
    </>
  )
}
