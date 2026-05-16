import React from "react"
import { Prisma, QuestionDifficulty, SKBCategory } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { SKBQuestionCMSClient } from "./client"
import { SKBQuestionFilters, SKBQuestionPagination } from "@/components/admin/skb-question-filters"
import { SKBQuestionRowItem } from "@/components/admin/skb-question-row-item"
import { SKBBulkImportModal } from "@/components/admin/skb-bulk-import-modal"

export const metadata = {
  title: "SKB Question Bank CMS - COBA PNS Admin",
  description: "Kelola bank soal Seleksi Kompetensi Bidang (SKB) untuk persiapan ujian CPNS.",
}

export default async function SKBQuestionsCMSPage(props: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const searchParams = await props.searchParams

  const page = Number(searchParams?.page) || 1
  const limit = 20
  const search = typeof searchParams?.search === "string" ? searchParams.search.trim() : undefined
  const category = typeof searchParams?.category === "string" ? searchParams.category : undefined
  const bidang = typeof searchParams?.bidang === "string" ? searchParams.bidang : undefined
  const difficulty = typeof searchParams?.difficulty === "string" ? searchParams.difficulty : undefined
  const sort = typeof searchParams?.sort === "string" ? searchParams.sort : "newest"

  const where: Prisma.SKBQuestionWhereInput = {}
  if (search) {
    where.OR = [
      { content: { contains: search, mode: "insensitive" } },
      { explanation: { contains: search, mode: "insensitive" } },
      { subCategory: { contains: search, mode: "insensitive" } },
      { bidang: { contains: search, mode: "insensitive" } },
    ]
  }
  if (category && category !== "All" && Object.values(SKBCategory).includes(category as SKBCategory)) {
    where.category = category as SKBCategory
  }
  if (bidang && bidang !== "All") {
    where.bidang = bidang
  }
  if (difficulty && difficulty !== "All" && Object.values(QuestionDifficulty).includes(difficulty as QuestionDifficulty)) {
    where.difficulty = difficulty as QuestionDifficulty
  }

  const orderBy: Prisma.SKBQuestionOrderByWithRelationInput[] =
    sort === "oldest"
      ? [{ createdAt: "asc" }]
      : sort === "bidang"
        ? [{ bidang: "asc" }, { createdAt: "desc" }]
        : sort === "category"
          ? [{ category: "asc" }, { createdAt: "desc" }]
          : sort === "difficulty"
            ? [{ difficulty: "asc" }, { createdAt: "desc" }]
            : [{ createdAt: "desc" }]

  const [questions, total, totalAll, allBidang, categoryStats] = await Promise.all([
    prisma.sKBQuestion.findMany({
      where,
      orderBy,
      include: { options: { orderBy: { createdAt: "asc" } } },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.sKBQuestion.count({ where }),
    prisma.sKBQuestion.count(),
    prisma.sKBQuestion.findMany({
      select: { bidang: true },
      distinct: ["bidang"],
      orderBy: { bidang: "asc" },
    }),
    prisma.sKBQuestion.groupBy({
      by: ["category"],
      _count: { id: true },
    }),
  ])

  const totalPages = Math.ceil(total / limit)
  const bidangList = allBidang.map((b) => b.bidang)
  const categoryCount = (cat: SKBCategory) => categoryStats.find((s) => s.category === cat)?._count.id ?? 0

  return (
    <div className="p-4 md:p-8 space-y-8 w-full flex-1">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-orange-500 mb-1">
            Content Engine · SKB
          </p>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">SKB Question Bank</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Kelola soal Teknis, Manajerial, dan Sosial Kultural dengan filter, sorting, dan bulk tools.
          </p>
        </div>
        <SKBQuestionCMSClient
          initialData={questions}
          totalAll={totalAll}
          filteredTotal={total}
        />
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-white border border-slate-200 rounded-2xl px-5 py-4 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Bank</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{totalAll}</p>
        </div>
        <div className="bg-orange-50 border border-orange-100 rounded-2xl px-5 py-4 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-orange-500">Hasil Filter</p>
          <p className="text-2xl font-black text-orange-700 mt-1">{total}</p>
        </div>
        <div className="bg-blue-50 border border-blue-100 rounded-2xl px-5 py-4 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-blue-500">Teknis</p>
          <p className="text-2xl font-black text-blue-700 mt-1">{categoryCount("TEKNIS")}</p>
        </div>
        <div className="bg-purple-50 border border-purple-100 rounded-2xl px-5 py-4 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-purple-500">Manajerial</p>
          <p className="text-2xl font-black text-purple-700 mt-1">{categoryCount("MANAJERIAL")}</p>
        </div>
        <div className="bg-teal-50 border border-teal-100 rounded-2xl px-5 py-4 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-teal-500">Bidang</p>
          <p className="text-2xl font-black text-teal-700 mt-1">{bidangList.length}</p>
        </div>
      </div>

      {/* Question Table Card */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-100 bg-white">
          <SKBQuestionFilters bidangList={bidangList} total={total} />
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/80 border-b border-slate-100">
              <TableRow>
                <TableHead className="w-[120px] font-black text-slate-500 uppercase tracking-wider text-[11px] py-4">
                  ID Soal
                </TableHead>
                <TableHead className="font-black text-slate-500 uppercase tracking-wider text-[11px] py-4">
                  Kategori &amp; Bidang
                </TableHead>
                <TableHead className="w-[42%] font-black text-slate-500 uppercase tracking-wider text-[11px] py-4">
                  Snippet Konten
                </TableHead>
                <TableHead className="font-black text-slate-500 uppercase tracking-wider text-[11px] py-4 text-center">
                  Tingkat
                </TableHead>
                <TableHead className="font-black text-slate-500 uppercase tracking-wider text-[11px] py-4 text-right">
                  Opsi
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {questions.length > 0 ? (
                questions.map((q) => <SKBQuestionRowItem key={q.id} question={q} />)
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-40 text-center text-sm font-medium text-slate-500">
                    Belum ada soal SKB terdaftar. Gunakan tombol &quot;Tambah Soal SKB&quot; atau &quot;Bulk Import&quot;.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <SKBQuestionPagination totalPages={totalPages} currentPage={page} />
      </div>

      {/* Bulk Import Modal (rendered globally in layout, but also here for convenience) */}
      <SKBBulkImportModal />
    </div>
  )
}
