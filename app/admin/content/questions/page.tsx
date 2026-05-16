import React from "react"
import { Prisma, QuestionCategory, QuestionDifficulty } from "@prisma/client"
import { prisma } from "@/lib/prisma"
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
  const search = typeof searchParams?.search === "string" ? searchParams.search.trim() : undefined
  const category = typeof searchParams?.category === "string" ? searchParams.category : undefined
  const difficulty = typeof searchParams?.difficulty === "string" ? searchParams.difficulty : undefined
  const sort = typeof searchParams?.sort === "string" ? searchParams.sort : "newest"

  const where: Prisma.QuestionWhereInput = {}
  if (search) {
    where.OR = [
      { content: { contains: search, mode: "insensitive" } },
      { explanation: { contains: search, mode: "insensitive" } },
      { subCategory: { contains: search, mode: "insensitive" } },
    ]
  }
  if (category && category !== "All" && Object.values(QuestionCategory).includes(category as QuestionCategory)) {
    where.category = category as QuestionCategory
  }
  if (difficulty && difficulty !== "All" && Object.values(QuestionDifficulty).includes(difficulty as QuestionDifficulty)) {
    where.difficulty = difficulty as QuestionDifficulty
  }

  const orderBy: Prisma.QuestionOrderByWithRelationInput[] =
    sort === "oldest"
      ? [{ createdAt: "asc" }]
      : sort === "category"
        ? [{ category: "asc" }, { createdAt: "desc" }]
        : sort === "difficulty"
          ? [{ difficulty: "asc" }, { createdAt: "desc" }]
          : sort === "subCategory"
            ? [{ subCategory: "asc" }, { createdAt: "desc" }]
            : [{ createdAt: "desc" }]

  const [questions, total, totalAll, categoryStats] = await Promise.all([
    prisma.question.findMany({
      where,
      orderBy,
      include: {
        options: { orderBy: { createdAt: "asc" } },
      },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.question.count({ where }),
    prisma.question.count(),
    prisma.question.groupBy({
      by: ["category"],
      _count: { id: true },
    }),
  ])

  const totalPages = Math.ceil(total / limit)
  const categoryCount = (cat: QuestionCategory) => categoryStats.find((s) => s.category === cat)?._count.id ?? 0

  return (
    <div className="p-4 md:p-8 space-y-8 w-full flex-1">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-brand-blue-deep mb-1">Content Engine · SKD</p>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Question Bank Manager</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Kelola bank soal SKD/TKD — TWK, TIU, dan TKP dengan filter, sorting, dan bulk tools.
          </p>
        </div>
        <QuestionCMSClient initialData={questions} totalAll={totalAll} filteredTotal={total} />
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-white border border-slate-200 rounded-2xl px-5 py-4 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Bank</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{totalAll}</p>
        </div>
        <div className="bg-blue-50 border border-blue-100 rounded-2xl px-5 py-4 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-blue-500">Hasil Filter</p>
          <p className="text-2xl font-black text-blue-700 mt-1">{total}</p>
        </div>
        <div className="bg-red-50 border border-red-100 rounded-2xl px-5 py-4 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-red-500">TWK</p>
          <p className="text-2xl font-black text-red-700 mt-1">{categoryCount("TWK")}</p>
        </div>
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl px-5 py-4 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500">TIU</p>
          <p className="text-2xl font-black text-indigo-700 mt-1">{categoryCount("TIU")}</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl px-5 py-4 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500">TKP</p>
          <p className="text-2xl font-black text-emerald-700 mt-1">{categoryCount("TKP")}</p>
        </div>
      </div>

      {/* Advanced Question Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-100 bg-white">
          <QuestionFilters total={total} />
        </div>
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
