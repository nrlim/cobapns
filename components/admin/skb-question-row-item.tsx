"use client"

import React, { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { TableRow, TableCell } from "@/components/ui/table"
import { Edit2, ChevronDown, ChevronUp, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { deleteSKBQuestion } from "@/app/admin/content/skb-questions/actions"
import { useRouter } from "next/navigation"

// ─── Category badge config ─────────────────────────────────────────────────────
const CATEGORY_BADGE: Record<string, { label: string; className: string }> = {
  TEKNIS: {
    label: "Teknis",
    className: "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100",
  },
  MANAJERIAL: {
    label: "Manajerial",
    className: "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100",
  },
  SOSIAL_KULTURAL: {
    label: "Sosial Kultural",
    className: "bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100",
  },
}

export function SKBQuestionRowItem({ question }: { question: any }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const alphabet = ["A", "B", "C", "D", "E"]
  const router = useRouter()

  const badge = CATEGORY_BADGE[question.category] || {
    label: question.category,
    className: "bg-slate-50 text-slate-700 border-slate-200",
  }

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm("Hapus soal SKB ini secara permanen?")) return
    setIsDeleting(true)
    const res = await deleteSKBQuestion(question.id)
    if (!res.success) {
      alert(res.error)
      setIsDeleting(false)
    } else {
      router.refresh()
    }
  }

  return (
    <>
      <TableRow
        className={`hover:bg-slate-50/80 group transition-colors cursor-pointer ${
          isExpanded ? "bg-slate-50/80 shadow-sm" : ""
        }`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* ID */}
        <TableCell className="px-4 py-4 text-[11px] font-mono font-bold text-slate-400">
          {question.id.slice(0, 8)}
        </TableCell>

        {/* Category + Bidang */}
        <TableCell>
          <div className="flex flex-col gap-1 items-start">
            <Badge className={`px-2.5 rounded-md font-black text-[10px] ${badge.className}`}>
              {badge.label}
            </Badge>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-0.5">
              {question.bidang}
            </span>
            <span className="text-[10px] font-semibold text-slate-300 pl-0.5">
              {question.subCategory}
            </span>
          </div>
        </TableCell>

        {/* Content snippet */}
        <TableCell className="max-w-xs">
          <p className="text-sm font-semibold text-slate-700 truncate">{question.content}</p>
          <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5">
            Opsi: {question.options.length} item tersimpan.
          </p>
        </TableCell>

        {/* Difficulty */}
        <TableCell className="text-center">
          <span
            className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-widest ${
              question.difficulty === "MUDAH"
                ? "text-green-700 bg-green-50"
                : question.difficulty === "SEDANG"
                ? "text-amber-700 bg-amber-50"
                : "text-red-700 bg-red-50"
            }`}
          >
            {question.difficulty}
          </span>
        </TableCell>

        {/* Actions */}
        <TableCell className="text-right">
          <div className="flex justify-end items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                if ((window as any).triggerEditSKBQuestion) {
                  ;(window as any).triggerEditSKBQuestion(question)
                }
              }}
              className="h-8 text-orange-600 bg-orange-50 hover:bg-orange-100 text-xs font-bold"
            >
              <Edit2 className="w-3 h-3 mr-1" /> Edit
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDelete}
              disabled={isDeleting}
              className="h-8 w-8 text-slate-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
          </div>
        </TableCell>
      </TableRow>

      {/* Expanded detail */}
      {isExpanded && (
        <TableRow className="bg-slate-50/30 hover:bg-slate-50/30 border-b-2 border-slate-100">
          <TableCell colSpan={5} className="p-0">
            <div className="p-6 md:p-8 animate-in slide-in-from-top-2 fade-in duration-200">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main area */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Pertanyaan */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 border-l-2 border-orange-400 pl-2">
                      Pertanyaan
                    </h4>
                    <p className="text-slate-800 font-medium leading-relaxed whitespace-pre-wrap text-[15px]">
                      {question.content}
                    </p>
                  </div>

                  {/* Opsi */}
                  <div className="pt-2">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 border-l-2 border-slate-400 pl-2">
                      Pilihan Jawaban
                    </h4>
                    <div className="space-y-2.5">
                      {question.options.map((opt: any, index: number) => {
                        const label = alphabet[index] || "-"
                        const isBest =
                          opt.score === 5 ||
                          (question.category === "TEKNIS" && opt.score > 0)
                        return (
                          <div
                            key={opt.id}
                            className={`flex items-start gap-4 p-3 rounded-xl border ${
                              isBest
                                ? "bg-orange-50/80 border-orange-100"
                                : "bg-white border-slate-200"
                            }`}
                          >
                            <div
                              className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center font-black text-sm ${
                                isBest
                                  ? "bg-orange-500 text-white shadow-sm"
                                  : "bg-slate-100 text-slate-500"
                              }`}
                            >
                              {label}
                            </div>
                            <div className="flex-1 pt-0.5">
                              <p
                                className={`font-medium text-[13px] ${
                                  isBest ? "text-orange-900" : "text-slate-700"
                                }`}
                              >
                                {opt.text}
                              </p>
                            </div>
                            <div className="shrink-0 flex items-center justify-center">
                              <span
                                className={`text-[10px] font-black px-2 py-0.5 rounded ${
                                  isBest
                                    ? "bg-orange-100 text-orange-700"
                                    : "bg-slate-100 text-slate-600"
                                }`}
                              >
                                Skor: {opt.score}
                              </span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Meta info */}
                  <div className="bg-white border border-slate-100 rounded-xl p-4 space-y-3">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-l-2 border-orange-400 pl-2">
                      Informasi Soal
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-slate-500">Kategori</span>
                        <span className="font-bold text-slate-700">
                          {CATEGORY_BADGE[question.category]?.label || question.category}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-slate-500">Bidang</span>
                        <span className="font-bold text-slate-700">{question.bidang}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-slate-500">Sub Materi</span>
                        <span className="font-bold text-slate-700 text-right max-w-[60%]">
                          {question.subCategory}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-slate-500">Kesulitan</span>
                        <span
                          className={`font-bold uppercase ${
                            question.difficulty === "MUDAH"
                              ? "text-green-600"
                              : question.difficulty === "SEDANG"
                              ? "text-amber-600"
                              : "text-red-600"
                          }`}
                        >
                          {question.difficulty}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Pembahasan */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 border-l-2 border-amber-500 pl-2">
                      Pembahasan
                    </h4>
                    {question.explanation ? (
                      <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap pr-4 pb-4">
                        {question.explanation}
                      </p>
                    ) : (
                      <p className="text-slate-400 text-sm italic pr-4">
                        Belum ada pembahasan.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  )
}
