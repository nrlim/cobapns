"use client"

import React, { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { TableRow, TableCell } from "@/components/ui/table"
import { Edit2, ChevronDown, ChevronUp, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export function QuestionRowItem({ question }: { question: any }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const alphabet = ["A", "B", "C", "D", "E"]

  return (
    <>
      <TableRow 
        className={`hover:bg-slate-50/80 group transition-colors cursor-pointer ${isExpanded ? 'bg-slate-50/80 shadow-sm' : ''}`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <TableCell className="px-4 py-4 text-[11px] font-mono font-bold text-slate-400">
          {question.id.split("").slice(0, 8).join("")}
        </TableCell>
        <TableCell>
          <div className="flex flex-col gap-1 items-start">
            {question.category === "TWK" && <Badge className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 px-2.5 rounded-md font-black">TWK</Badge>}
            {question.category === "TIU" && <Badge className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 px-2.5 rounded-md font-black">TIU</Badge>}
            {question.category === "TKP" && <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 px-2.5 rounded-md font-black">TKP</Badge>}
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-0.5">{question.subCategory}</span>
          </div>
        </TableCell>
        <TableCell className="max-w-xs">
          <p className="text-sm font-semibold text-slate-700 truncate">{question.content}</p>
          <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5">Opsi: {question.options.length} item tersimpan.</p>
        </TableCell>
        <TableCell className="text-center">
          <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-widest
            ${question.difficulty === 'MUDAH' ? 'text-green-700 bg-green-50' : 
              question.difficulty === 'SEDANG' ? 'text-amber-700 bg-amber-50' : 'text-red-700 bg-red-50'}`}
          >
            {question.difficulty}
          </span>
        </TableCell>
        <TableCell className="text-right">
          <div className="flex justify-end items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={(e) => {
                e.stopPropagation()
                if ((window as any).triggerEditQuestion) {
                  (window as any).triggerEditQuestion(question)
                }
              }} 
              className="h-8 text-brand-blue bg-blue-50 hover:bg-blue-100 text-xs font-bold"
            >
              <Edit2 className="w-3 h-3 mr-1" /> Edit
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>
        </TableCell>
      </TableRow>

      {isExpanded && (
        <TableRow className="bg-slate-50/30 hover:bg-slate-50/30 border-b-2 border-slate-100">
          <TableCell colSpan={5} className="p-0">
            
            <div className="p-6 md:p-8 animate-in slide-in-from-top-2 fade-in duration-200">
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Areas */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Pertanyaan */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 border-l-2 border-blue-500 pl-2">Pertanyaan</h4>
                    <p className="text-slate-800 font-medium leading-relaxed whitespace-pre-wrap text-[15px]">
                      {question.content}
                    </p>
                  </div>

                  {/* Opsi */}
                  <div className="pt-2">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 border-l-2 border-slate-400 pl-2">Pilihan Jawaban</h4>
                    <div className="space-y-2.5">
                      {question.options.map((opt: any, index: number) => {
                        const label = alphabet[index] || "-"
                        const isBest = opt.score === 5 || (question.category !== 'TKP' && opt.score > 0)
                        
                        return (
                          <div key={opt.id} className={`flex items-start gap-4 p-3 rounded-xl border ${isBest ? 'bg-blue-50/80 border-blue-100' : 'bg-white border-slate-200'}`}>
                            <div className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center font-black ${isBest ? 'bg-brand-blue text-white shadow-sm' : 'bg-slate-100 text-slate-500'}`}>
                              {label}
                            </div>
                            <div className="flex-1 pt-0.5">
                              <p className={`font-medium text-[13px] ${isBest ? 'text-blue-900' : 'text-slate-700'}`}>{opt.text}</p>
                            </div>
                            <div className="shrink-0 flex flex-col items-end justify-center gap-1">
                              <span className={`text-[10px] font-black px-2 py-0.5 rounded ${isBest ? 'bg-blue-100 text-brand-blue-deep' : 'bg-slate-100 text-slate-600'}`}>
                                Skor: {opt.score}
                              </span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>

                {/* Sidebar Areas */}
                <div className="space-y-6">
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 border-l-2 border-amber-500 pl-2">Pembahasan</h4>
                    {question.explanation ? (
                      <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap pr-4 pb-4">
                        {question.explanation}
                      </p>
                    ) : (
                      <p className="text-slate-400 text-sm italic pr-4">Belum ada pembahasan yang dimasukkan.</p>
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
