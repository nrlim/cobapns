import React from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, CheckCircle2 } from "lucide-react"
import { prisma } from "@/lib/prisma"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default async function QuestionDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  
  const question = await prisma.question.findUnique({
    where: { id: params.id },
    include: { options: true }
  })

  if (!question) {
    notFound()
  }

  // Sort options so highest score is first, or keep original order. Original order is usually better for A,B,C,D,E mapping, but here they are just items. 
  // We'll map them alphabetically.
  const alphabet = ["A", "B", "C", "D", "E"]

  return (
    <div className="space-y-8 p-4 md:p-8 lg:p-10 w-full flex-1 max-w-5xl mx-auto">
      
      {/* Back Button & Header */}
      <div className="space-y-4">
        <Button variant="ghost" asChild className="h-8 -ml-3 text-slate-500 hover:text-slate-800">
          <Link href="/admin/content/questions">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali ke Bank Soal
          </Link>
        </Button>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="font-mono text-[10px] text-slate-400 border-slate-200">
                ID: {question.id}
              </Badge>
              {question.category === "TWK" && <Badge className="bg-blue-50 text-blue-700 border-blue-200 uppercase">TWK</Badge>}
              {question.category === "TIU" && <Badge className="bg-amber-50 text-amber-700 border-amber-200 uppercase">TIU</Badge>}
              {question.category === "TKP" && <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 uppercase">TKP</Badge>}
            </div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900">Detail Soal</h2>
          </div>
          
          <Badge className={`px-3 py-1 font-bold tracking-widest uppercase
            ${question.difficulty === 'MUDAH' ? 'bg-green-100 text-green-700 border-green-200' : 
              question.difficulty === 'SEDANG' ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-red-100 text-red-700 border-red-200'}`}
          >
            Tingkat: {question.difficulty}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-100 rounded-[1.5rem] p-6 md:p-8 shadow-sm">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Pertanyaan</h3>
            <div className="prose prose-slate max-w-none">
              <p className="text-slate-800 font-medium leading-relaxed whitespace-pre-wrap text-lg">
                {question.content}
              </p>
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-[1.5rem] p-6 md:p-8 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Pilihan Jawaban</h3>
            <div className="space-y-3">
              {question.options.map((opt, index) => {
                const label = alphabet[index] || "-"
                const isBest = opt.score === 5 || (question.category !== 'TKP' && opt.score > 0)
                
                return (
                  <div key={opt.id} className={`flex items-start gap-4 p-4 rounded-xl border ${isBest ? 'bg-teal-50/50 border-teal-100' : 'bg-slate-50 border-slate-100'}`}>
                    <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center font-black ${isBest ? 'bg-teal-600 text-white shadow-md' : 'bg-white text-slate-500 shadow-sm border border-slate-200'}`}>
                      {label}
                    </div>
                    <div className="flex-1 pt-1">
                      <p className={`font-medium ${isBest ? 'text-teal-900' : 'text-slate-700'}`}>{opt.text}</p>
                    </div>
                    <div className="shrink-0 flex flex-col items-end justify-center gap-1">
                      <span className={`text-xs font-black px-2 py-1 rounded-md ${isBest ? 'bg-teal-100 text-teal-800' : 'bg-slate-200 text-slate-600'}`}>
                        Skor: {opt.score}
                      </span>
                      {isBest && <CheckCircle2 className="w-4 h-4 text-teal-500" />}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Sidebar Info Area */}
        <div className="space-y-6">
          <div className="bg-slate-50 border border-slate-100 rounded-[1.5rem] p-6 shadow-inner">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Pembahasan</h3>
            {question.explanation ? (
              <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">
                {question.explanation}
              </p>
            ) : (
              <p className="text-slate-400 text-sm italic">Belum ada pembahasan yang dimasukkan untuk soal ini.</p>
            )}
          </div>

          <div className="bg-white border border-slate-100 rounded-[1.5rem] p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Informasi Metadata</h3>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Materi / Topik</p>
                <p className="font-semibold text-slate-800">{question.subCategory}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Dibuat Pada</p>
                <p className="font-semibold text-slate-800">{new Date(question.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
