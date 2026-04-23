"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Upload } from "lucide-react"
import { QuestionEditor } from "@/components/admin/question-editor"

export function QuestionCMSClient({ initialData }: { initialData: any[] }) {
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<any>(null)

  useEffect(() => {
    (window as any).triggerReopenBulkModal = () => {
      window.dispatchEvent(new Event("open-bulk-import"))
    }
    (window as any).triggerEditQuestion = (question: any) => {
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
          onClick={() => window.dispatchEvent(new Event("open-bulk-import"))}
          className="border-slate-200 bg-white font-bold flex-1 lg:flex-none rounded-xl text-slate-600 hover:text-slate-900 border-dashed"
        >
          <Upload className="w-4 h-4 mr-2" />
          Bulk Import
        </Button>
        <Button 
          onClick={openNew}
          className="flex-1 border-brand-blue-deep bg-brand-blue-deep hover:bg-brand-blue-deep text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all"
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
