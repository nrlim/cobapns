import React from "react"
import { prisma } from "@/lib/prisma"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { QuestionCMSClient } from "./client"
import { QuestionFilters, QuestionPagination } from "@/components/admin/question-filters"
import { QuestionRowItem } from "@/components/admin/question-row-item"

export const metadata = {
  title: "Question Bank CMS - COBA PNS Admin",
  description: "Advanced Question Bank Management for PNS materials.",
}

export default async function QuestionsCMSPage(props: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const searchParams = await props.searchParams

  const page = Number(searchParams?.page) || 1
  const limit = 20
  const search = typeof searchParams?.search === 'string' ? searchParams.search : undefined
  const category = typeof searchParams?.category === 'string' ? searchParams.category : undefined

  // Build the dynamic Prisma query
  const where: any = {}
  if (search) {
    where.content = { contains: search }
  }
  if (category && category !== 'All') {
    where.category = category
  }

  const [questions, total] = await Promise.all([
    prisma.question.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        options: true,
      },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.question.count({ where })
  ])

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="space-y-8 p-4 md:p-8 lg:p-10 w-full flex-1">
      
      {/* Page Hero / Introduction */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-brand-blue-deep mb-1 lg:mb-2 text-opacity-80">Content Engine</p>
          <h2 className="text-2xl lg:text-3xl font-black tracking-tight text-slate-900">Question Bank Manager</h2>
          <p className="text-slate-500 font-medium mt-1 text-sm">Kelola pustaka soal, perbarui materi, dan atur tingkat kesulitan.</p>
        </div>
      </div>

      {/* Smart Filters & Actions Toolbar */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-2 pr-4 pl-2 rounded-2xl shadow-sm border border-slate-100/60">
        <QuestionFilters />

        <div className="flex items-center gap-3 w-full lg:w-auto mt-2 lg:mt-0 px-2 lg:px-0 pb-2 lg:pb-0">
          <QuestionCMSClient initialData={questions} />
        </div>
      </div>

      {/* Advanced Question Table */}
      <div className="bg-white rounded-[1.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/80 border-b border-slate-100">
              <TableRow>
                <TableHead className="w-[120px] font-black text-slate-500 uppercase tracking-wider text-[11px] py-4">ID Soal</TableHead>
                <TableHead className="font-black text-slate-500 uppercase tracking-wider text-[11px] py-4">Kategori & Materi</TableHead>
                <TableHead className="w-[45%] font-black text-slate-500 uppercase tracking-wider text-[11px] py-4">Snippet Konten</TableHead>
                <TableHead className="font-black text-slate-500 uppercase tracking-wider text-[11px] py-4 text-center">Tingkat</TableHead>
                <TableHead className="font-black text-slate-500 uppercase tracking-wider text-[11px] py-4 text-right">Opsi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {questions.length > 0 ? (
                questions.map((q) => (
                  <QuestionRowItem key={q.id} question={q} />
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-40 text-center text-sm font-medium text-slate-500">
                    Belum ada soal terdaftar.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* Pagination Controls */}
        <QuestionPagination totalPages={totalPages} currentPage={page} />
      </div>
      
    </div>
  )
}
