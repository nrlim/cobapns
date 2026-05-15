import React from "react"
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
  const search = typeof searchParams?.search === "string" ? searchParams.search : undefined
  const category = typeof searchParams?.category === "string" ? searchParams.category : undefined
  const bidang = typeof searchParams?.bidang === "string" ? searchParams.bidang : undefined

  const where: any = {}
  if (search) {
    where.content = { contains: search, mode: "insensitive" }
  }
  if (category && category !== "All") {
    where.category = category
  }
  if (bidang && bidang !== "All") {
    where.bidang = bidang
  }

  const [questions, total, allBidang] = await Promise.all([
    prisma.sKBQuestion.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { options: true },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.sKBQuestion.count({ where }),
    prisma.sKBQuestion.findMany({
      select: { bidang: true },
      distinct: ["bidang"],
      orderBy: { bidang: "asc" },
    }),
  ])

  const totalPages = Math.ceil(total / limit)
  const bidangList = allBidang.map((b) => b.bidang)

  return (
    <div className="space-y-8 p-4 md:p-8 lg:p-10 w-full flex-1">

      {/* Page Hero */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-orange-500 mb-1 lg:mb-2">
            Content Engine · SKB
          </p>
          <h2 className="text-2xl lg:text-3xl font-black tracking-tight text-slate-900">
            SKB Question Bank
          </h2>
          <p className="text-slate-500 font-medium mt-1 text-sm">
            Kelola bank soal Seleksi Kompetensi Bidang — Teknis, Manajerial, dan Sosial Kultural.
          </p>
        </div>

        {/* Stats Summary */}
        <div className="flex gap-3">
          <div className="bg-orange-50 border border-orange-100 rounded-2xl px-5 py-3 text-center">
            <p className="text-2xl font-black text-orange-600">{total}</p>
            <p className="text-[10px] font-bold text-orange-400 uppercase tracking-widest mt-0.5">Total Soal</p>
          </div>
          <div className="bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 text-center">
            <p className="text-2xl font-black text-slate-700">{bidangList.length}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Bidang</p>
          </div>
        </div>
      </div>

      {/* Filters & Action Toolbar */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-2 pr-4 pl-2 rounded-2xl shadow-sm border border-slate-100/60">
        <SKBQuestionFilters bidangList={bidangList} />
        <div className="flex items-center gap-3 w-full lg:w-auto mt-2 lg:mt-0 px-2 lg:px-0 pb-2 lg:pb-0">
          <SKBQuestionCMSClient initialData={questions} />
        </div>
      </div>

      {/* Question Table */}
      <div className="bg-white rounded-[1.5rem] shadow-sm border border-slate-100 overflow-hidden">
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
